import path from "path";
import fs from "fs-extra";

import { PKG_ROOT } from "~/consts.js";
import { type Installer } from "~/installers/index.js";
import { addPackageDependency } from "~/utils/addPackageDependency.js";

const TRELENT_ENV_SERVER_VARS = (sandboxTag: string) => `    TRELENT_API_URL: z.string().url().default("http://localhost:8000"),
    TRELENT_CLIENT_ID: z.string().optional(),
    TRELENT_CLIENT_SECRET: z.string().optional(),
    TRELENT_SANDBOX: z.string().default("${sandboxTag}"),`;

const TRELENT_ENV_RUNTIME_VARS = `    TRELENT_API_URL: process.env.TRELENT_API_URL,
    TRELENT_CLIENT_ID: process.env.TRELENT_CLIENT_ID,
    TRELENT_CLIENT_SECRET: process.env.TRELENT_CLIENT_SECRET,
    TRELENT_SANDBOX: process.env.TRELENT_SANDBOX,`;

const TRELENT_DOTENV = (sandboxTag: string) => `
# Trelent Agent Orchestrator
# https://www.npmjs.com/package/@trelent/agents
TRELENT_API_URL="http://localhost:8000"
TRELENT_CLIENT_ID=""
TRELENT_CLIENT_SECRET=""
TRELENT_SANDBOX="${sandboxTag}"
`;

export const trelentInstaller: Installer = ({ projectDir, sandboxName }) => {
  const name = sandboxName ?? "my-sandbox";
  const sandboxTag = `${name}:latest`;

  addPackageDependency({
    projectDir,
    dependencies: ["@trelent/agents"],
    devMode: false,
  });

  const extrasDir = path.join(PKG_ROOT, "template/extras");

  // The sandbox definition lives at the project root, next to web/
  const rootDir = path.dirname(projectDir);
  const sandboxDest = path.join(rootDir, "sandboxes", name);
  fs.copySync(path.join(extrasDir, "sandboxes/default"), sandboxDest);
  for (const file of ["Dockerfile", "README.md"]) {
    const filePath = path.join(sandboxDest, file);
    fs.writeFileSync(
      filePath,
      fs.readFileSync(filePath, "utf-8").replaceAll("my-sandbox", name)
    );
  }

  // Server-side singleton client for the orchestrator
  fs.copySync(
    path.join(extrasDir, "src/server/trelent.ts"),
    path.join(projectDir, "src/server/trelent.ts")
  );

  // Add the TRELENT_* vars to the env schema. This runs after the
  // envVariables installer, so src/env.js and the .env files exist.
  const envSchemaPath = path.join(projectDir, "src/env.js");
  let envSchema = fs.readFileSync(envSchemaPath, "utf-8");
  envSchema = envSchema.replace(
    "  server: {",
    `  server: {\n${TRELENT_ENV_SERVER_VARS(sandboxTag)}`
  );
  envSchema = envSchema.replace(
    "  runtimeEnv: {",
    `  runtimeEnv: {\n${TRELENT_ENV_RUNTIME_VARS}`
  );
  fs.writeFileSync(envSchemaPath, envSchema);

  for (const file of [".env", ".env.example"]) {
    const filePath = path.join(projectDir, file);
    if (fs.existsSync(filePath)) {
      fs.appendFileSync(filePath, TRELENT_DOTENV(sandboxTag));
    }
  }
};
