import chalk from "chalk";
import { execa } from "execa";
import ora from "ora";

import { type PackageManager } from "~/utils/getUserPkgManager.js";
import { logger } from "~/utils/logger.js";

// Runs format and lint command to ensure created repository is tidy upon creation
export const formatProject = async ({
  pkgManager,
  projectDir,
  eslint,
  biome,
  ultracite,
}: {
  pkgManager: PackageManager;
  projectDir: string;
  eslint: boolean;
  biome: boolean;
  ultracite: boolean;
}) => {
  logger.info(
    `Formatting project with ${eslint || (ultracite && !biome) ? "prettier" : "biome"}...`
  );
  const spinner = ora("Running format command\n").start();

  if (eslint) {
    await execa(pkgManager, ["run", "format:write"], {
      cwd: projectDir,
    });
  } else if (biome) {
    if (ultracite) {
      // Ultracite's biome rules are stricter than the default t3 template code,
      // so only run formatting (not linting) to avoid failing on lint errors.
      await execa(pkgManager, ["exec", "biome", "format", "--write", "."], {
        cwd: projectDir,
      });
    } else {
      await execa(pkgManager, ["run", "check:unsafe"], {
        cwd: projectDir,
      });
    }
  }
  spinner.succeed(`${chalk.green("Successfully formatted project")}`);
};
