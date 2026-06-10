import path from "path";
import fs from "fs-extra";

import { PKG_ROOT } from "~/consts.js";
import { type Installer } from "~/installers/index.js";
import { addPackageDependency } from "~/utils/addPackageDependency.js";

/**
 * Sets up shadcn/ui non-interactively: instead of shelling out to
 * `npx shadcn init` (which prompts), we ship the equivalent output as
 * templates - components.json, the cn() helper, the CSS variable theme, and a
 * vendored set of ui components. `npx shadcn add <component>` works as usual
 * afterwards.
 */
export const shadcnInstaller: Installer = ({ projectDir }) => {
  addPackageDependency({
    projectDir,
    dependencies: [
      "radix-ui",
      "class-variance-authority",
      "clsx",
      "tailwind-merge",
      "lucide-react",
      "cmdk",
    ],
    devMode: false,
  });
  addPackageDependency({
    projectDir,
    dependencies: ["tw-animate-css"],
    devMode: true,
  });

  const extrasDir = path.join(PKG_ROOT, "template/extras");

  fs.copySync(
    path.join(extrasDir, "config/components.json"),
    path.join(projectDir, "components.json")
  );
  fs.copySync(
    path.join(extrasDir, "src/lib/utils.ts"),
    path.join(projectDir, "src/lib/utils.ts")
  );
  fs.copySync(
    path.join(extrasDir, "src/components/ui"),
    path.join(projectDir, "src/components/ui")
  );
  // Replace the plain Tailwind globals with the shadcn theme
  fs.copySync(
    path.join(extrasDir, "src/styles/globals-shadcn.css"),
    path.join(projectDir, "src/styles/globals.css")
  );
};
