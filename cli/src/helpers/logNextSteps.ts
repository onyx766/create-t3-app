import { DEFAULT_APP_NAME } from "~/consts.js";
import { type InstallerOptions } from "~/installers/index.js";
import { getUserPkgManager } from "~/utils/getUserPkgManager.js";
import { logger } from "~/utils/logger.js";
import { isInsideGitRepo, isRootGitRepo } from "./git.js";

// This logs the next steps that the user should take in order to advance the project
export const logNextSteps = async ({
  projectName = DEFAULT_APP_NAME,
  packages,
  noInstall,
  projectDir,
  databaseProvider,
  sandboxName,
}: Pick<
  InstallerOptions,
  | "projectName"
  | "packages"
  | "noInstall"
  | "projectDir"
  | "appRouter"
  | "databaseProvider"
  | "sandboxName"
>) => {
  const pkgManager = getUserPkgManager();

  logger.info("Next steps:");
  logger.info(`  cd ${projectName === "." ? "web" : `${projectName}/web`}`);
  if (noInstall) {
    // To reflect yarn's default behavior of installing packages when no additional args provided
    if (pkgManager === "yarn") {
      logger.info(`  ${pkgManager}`);
    } else {
      logger.info(`  ${pkgManager} install`);
    }
  }

  if (["postgres", "mysql"].includes(databaseProvider)) {
    logger.info("  Start up a database, if needed using './start-database.sh'");
  }

  if (packages?.prisma.inUse || packages?.drizzle.inUse) {
    if (["npm", "bun"].includes(pkgManager)) {
      logger.info(`  ${pkgManager} run db:push`);
    } else {
      logger.info(`  ${pkgManager} db:push`);
    }
  }

  if (packages?.nextAuth.inUse) {
    logger.info(
      `  Fill in your .env with necessary values. See https://create.t3.gg/en/usage/first-steps for more info.`
    );
  }

  if (packages?.trelent.inUse) {
    const sandbox = sandboxName ?? "my-sandbox";
    logger.info(
      `  Build your sandbox image: docker build -t ${sandbox}:latest ../sandboxes/${sandbox}`
    );
    logger.info(
      "  Point TRELENT_API_URL (and client credentials, if any) at your orchestrator in .env"
    );
  }

  if (["npm", "bun"].includes(pkgManager)) {
    logger.info(`  ${pkgManager} run dev`);
  } else {
    logger.info(`  ${pkgManager} dev`);
  }

  if (packages?.clerk.inUse) {
    logger.info(
      "  Clerk starts in keyless mode - claim the generated keys from the link printed by `dev`"
    );
  }

  if (!(await isInsideGitRepo(projectDir)) && !isRootGitRepo(projectDir)) {
    logger.info(`  git init`);
  }
  logger.info(`  git commit -m "initial commit"`);
};
