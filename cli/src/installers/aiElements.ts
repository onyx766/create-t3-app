import path from "path";
import fs from "fs-extra";

import { PKG_ROOT } from "~/consts.js";
import { type Installer } from "~/installers/index.js";
import { addPackageDependency } from "~/utils/addPackageDependency.js";

/**
 * Vendors AI Elements (https://elements.ai-sdk.dev) chat components -
 * conversation, message, prompt-input, and loader - the same files
 * `npx ai-elements add <component>` would install. They build on the
 * shadcn/ui components, so this installer requires the shadcn package.
 */
export const aiElementsInstaller: Installer = ({ projectDir }) => {
  addPackageDependency({
    projectDir,
    dependencies: ["ai", "streamdown", "use-stick-to-bottom", "nanoid"],
    devMode: false,
  });

  const extrasDir = path.join(PKG_ROOT, "template/extras");

  fs.copySync(
    path.join(extrasDir, "src/components/ai-elements"),
    path.join(projectDir, "src/components/ai-elements")
  );
};
