import { execSync } from "child_process";
import path from "path";
import * as p from "@clack/prompts";
import chalk from "chalk";
import { execa } from "execa";
import fs from "fs-extra";
import ora from "ora";

import { logger } from "~/utils/logger.js";

const isGitInstalled = (dir: string): boolean => {
  try {
    execSync("git --version", { cwd: dir });
    return true;
  } catch {
    return false;
  }
};

/** @returns Whether or not the provided directory has a `.git` subdirectory in it. */
export const isRootGitRepo = (dir: string): boolean => {
  return fs.existsSync(path.join(dir, ".git"));
};

/** @returns Whether or not this directory or a parent directory has a `.git` directory. */
export const isInsideGitRepo = async (dir: string): Promise<boolean> => {
  try {
    // If this command succeeds, we're inside a git repo
    await execa("git", ["rev-parse", "--is-inside-work-tree"], {
      cwd: dir,
      stdout: "ignore",
    });
    return true;
  } catch (error) {
    // Check for dubious ownership error and warn the user
    const errorMessage = error instanceof Error ? error.message : String(error);
    if (errorMessage.includes("dubious ownership")) {
      logger.warn(
        `Git detected dubious ownership in repository at '${dir}'.\n` +
        `This occurs on file systems that don't record ownership (FAT32, exFAT, network drives).\n` +
        `Common on external drives, USB drives, and Windows network shares.\n\n` +
        `To fix this, run: ${chalk.cyan(`git config --global --add safe.directory "${dir}"`)}\n`
      );
    }
    // Else, it will throw a git-error and we return false
    return false;
  }
};

const getGitVersion = () => {
  const stdout = execSync("git --version").toString().trim();
  const gitVersionTag = stdout.split(" ")[2];
  const major = gitVersionTag?.split(".")[0];
  const minor = gitVersionTag?.split(".")[1];
  return { major: Number(major), minor: Number(minor) };
};

/** @returns The git config value of "init.defaultBranch". If it is not set, returns "main". */
const getDefaultBranch = () => {
  const stdout = execSync("git config --global init.defaultBranch || echo main")
    .toString()
    .trim();

  return stdout;
};

// This initializes the Git-repository for the project
export const initializeGit = async (projectDir: string) => {
  logger.info("Initializing Git...");

  if (!isGitInstalled(projectDir)) {
    logger.warn("Git is not installed. Skipping Git initialization.");
    return;
  }

  const spinner = ora("Creating a new git repo...\n").start();

  const isRoot = isRootGitRepo(projectDir);
  const isInside = await isInsideGitRepo(projectDir);
  const dirName = path.parse(projectDir).name; // skip full path for logging

  if (isInside && isRoot) {
    // Dir is a root git repo
    spinner.stop();
    const overwriteGit = await p.confirm({
      message: `${chalk.redBright.bold(
        "Warning:"
      )} Git is already initialized in "${dirName}". Initializing a new git repository would delete the previous history. Would you like to continue anyways?`,
      initialValue: false,
    });

    if (!overwriteGit) {
      spinner.info("Skipping Git initialization.");
      return;
    }
    // Deleting the .git folder
    fs.removeSync(path.join(projectDir, ".git"));
  } else if (isInside && !isRoot) {
    // Dir is inside a git worktree
    spinner.stop();
    const initializeChildGitRepo = await p.confirm({
      message: `${chalk.redBright.bold(
        "Warning:"
      )} "${dirName}" is already in a git worktree. Would you still like to initialize a new git repository in this directory?`,
      initialValue: false,
    });
    if (!initializeChildGitRepo) {
      spinner.info("Skipping Git initialization.");
      return;
    }
  }

  // We're good to go, initializing the git repo
  try {
    const branchName = getDefaultBranch();

    // --initial-branch flag was added in git v2.28.0
    const { major, minor } = getGitVersion();
    if (major < 2 || (major == 2 && minor < 28)) {
      await execa("git", ["init"], { cwd: projectDir });
      // symbolic-ref is used here due to refs/heads/master not existing
      // It is only created after the first commit
      // https://superuser.com/a/1419674
      await execa("git", ["symbolic-ref", "HEAD", `refs/heads/${branchName}`], {
        cwd: projectDir,
      });
    } else {
      await execa("git", ["init", `--initial-branch=${branchName}`], {
        cwd: projectDir,
      });
    }
    await execa("git", ["add", "."], { cwd: projectDir });
    spinner.succeed(
      `${chalk.green("Successfully initialized and staged")} ${chalk.green.bold(
        "git"
      )}\n`
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    
    // Check for dubious ownership error and provide helpful guidance
    if (errorMessage.includes("dubious ownership")) {
      spinner.fail(
        `${chalk.bold.red("Failed:")} Git detected dubious ownership in repository.\n\n` +
        `${chalk.yellow("Cause:")} The file system doesn't record ownership (FAT32, exFAT, network drive).\n` +
        `${chalk.dim("This is common on external drives, USB drives, and Windows network shares.")}\n\n` +
        `${chalk.bold("To fix this, run:")}\n` +
        `  ${chalk.cyan(`git config --global --add safe.directory "${projectDir}"`)}\n\n` +
        `${chalk.dim("Or to trust all repositories:")}\n` +
        `  ${chalk.cyan("git config --global --add safe.directory '*'")}\n`
      );
    } else {
      // Show the actual error message instead of generic text
      spinner.fail(
        `${chalk.bold.red("Failed:")} could not initialize git.\n` +
        `${chalk.yellow("Error:")} ${errorMessage}\n` +
        `${chalk.dim("Make sure git is updated to the latest version.")}\n`
      );
    }
  }
};
