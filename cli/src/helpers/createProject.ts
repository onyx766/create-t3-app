import fs from "fs";
import path from "path";

import { PKG_ROOT } from "~/consts.js";
import { installPackages } from "~/helpers/installPackages.js";
import { scaffoldProject } from "~/helpers/scaffoldProject.js";
import {
  selectAppFile,
  selectIndexFile,
  selectLayoutFile,
  selectPageFile,
} from "~/helpers/selectBoilerplate.js";
import {
  type DatabaseProvider,
  type PkgInstallerMap,
} from "~/installers/index.js";
import { getUserPkgManager } from "~/utils/getUserPkgManager.js";

interface CreateProjectOptions {
  projectName: string;
  packages: PkgInstallerMap;
  scopedAppName: string;
  noInstall: boolean;
  importAlias: string;
  appRouter: boolean;
  databaseProvider: DatabaseProvider;
  sandboxName: string;
}

export const createProject = async ({
  projectName,
  scopedAppName,
  packages,
  noInstall,
  appRouter,
  databaseProvider,
  sandboxName,
}: CreateProjectOptions) => {
  const pkgManager = getUserPkgManager();
  const projectDir = path.resolve(process.cwd(), projectName);
  // The Next.js app lives in <project>/web; sandboxes/ sits next to it
  const webDir = path.join(projectDir, "web");

  // Bootstraps the base Next.js application
  await scaffoldProject({
    projectName,
    projectDir,
    pkgManager,
    scopedAppName,
    noInstall,
    appRouter,
    databaseProvider,
  });

  // Install the selected packages
  installPackages({
    projectName,
    scopedAppName,
    projectDir: webDir,
    pkgManager,
    packages,
    noInstall,
    appRouter,
    databaseProvider,
    sandboxName,
  });

  // Select necessary _app,index / layout,page files
  if (appRouter) {
    // Replace next.config
    fs.copyFileSync(
      path.join(PKG_ROOT, "template/extras/config/next-config-appdir.js"),
      path.join(webDir, "next.config.js")
    );

    selectLayoutFile({ projectDir: webDir, packages });
    selectPageFile({ projectDir: webDir, packages });
  } else {
    selectAppFile({ projectDir: webDir, packages });
    selectIndexFile({ projectDir: webDir, packages });
  }

  // If no tailwind, select use css modules
  if (!packages.tailwind.inUse) {
    const indexModuleCss = path.join(
      PKG_ROOT,
      "template/extras/src/index.module.css"
    );
    const indexModuleCssDest = path.join(
      webDir,
      "src",
      appRouter ? "app" : "pages",
      "index.module.css"
    );
    fs.copyFileSync(indexModuleCss, indexModuleCssDest);
  }

  return projectDir;
};
