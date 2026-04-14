import path from "path";
import fs from "fs-extra";

import { PKG_ROOT } from "~/consts.js";
import { type Installer } from "~/installers/index.js";
import { addPackageDependency } from "~/utils/addPackageDependency.js";
import { addPackageScript } from "~/utils/addPackageScript.js";

export const biomeInstaller: Installer = ({ projectDir, packages }) => {
  const usingUltracite = !!packages?.ultracite?.inUse;

  addPackageDependency({
    projectDir,
    dependencies: usingUltracite
      ? ["ultracite", "@biomejs/biome"]
      : ["@biomejs/biome"],
    devMode: true,
  });

  const extrasDir = path.join(PKG_ROOT, "template/extras");
  const biomeConfigSrc = path.join(
    extrasDir,
    usingUltracite ? "config/_ultracite.biome.jsonc" : "config/biome.jsonc"
  );
  const biomeConfigDest = path.join(projectDir, "biome.jsonc");

  fs.copySync(biomeConfigSrc, biomeConfigDest);

  addPackageScript({
    projectDir,
    scripts: {
      "check:unsafe": "biome check --write --unsafe .",
      "check:write": "biome check --write .",
      check: "biome check .",
    },
  });
};
