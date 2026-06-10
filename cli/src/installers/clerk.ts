import path from "path";
import fs from "fs-extra";

import { PKG_ROOT } from "~/consts.js";
import { type Installer } from "~/installers/index.js";
import { addPackageDependency } from "~/utils/addPackageDependency.js";

export const clerkInstaller: Installer = ({ projectDir }) => {
  addPackageDependency({
    projectDir,
    dependencies: ["@clerk/nextjs"],
    devMode: false,
  });

  const extrasDir = path.join(PKG_ROOT, "template/extras");

  // clerkMiddleware is required for auth() to work in RSCs and route handlers
  fs.copySync(
    path.join(extrasDir, "src/middleware/with-clerk.ts"),
    path.join(projectDir, "src/middleware.ts")
  );
};
