import path from "path";
import fs from "fs-extra";

import { PKG_ROOT } from "~/consts.js";
import { type InstallerOptions } from "~/installers/index.js";

type SelectBoilerplateProps = Required<
  Pick<InstallerOptions, "packages" | "projectDir">
>;
// This generates the _app.tsx file that is used to render the app
export const selectAppFile = ({
  projectDir,
  packages,
}: SelectBoilerplateProps) => {
  const appFileDir = path.join(PKG_ROOT, "template/extras/src/pages/_app");

  const usingTw = packages.tailwind.inUse;
  const usingTRPC = packages.trpc.inUse;
  const usingAuth = packages?.nextAuth.inUse ?? packages?.betterAuth.inUse;
  const usingBetterAuth = packages?.betterAuth.inUse;

  let appFile = "base.tsx";
  if (usingTRPC && usingTw && usingBetterAuth) {
    appFile = "with-better-auth-trpc-tw.tsx";
  } else if (usingTRPC && !usingTw && usingBetterAuth) {
    appFile = "with-better-auth-trpc.tsx";
  } else if (usingTRPC && usingTw && usingAuth) {
    appFile = "with-auth-trpc-tw.tsx";
  } else if (usingTRPC && !usingTw && usingAuth) {
    appFile = "with-auth-trpc.tsx";
  } else if (usingTRPC && usingTw) {
    appFile = "with-trpc-tw.tsx";
  } else if (usingTRPC && !usingTw) {
    appFile = "with-trpc.tsx";
  } else if (!usingTRPC && usingTw) {
    appFile = "with-tw.tsx";
  } else if (usingAuth && usingTw) {
    appFile = "with-auth-tw.tsx";
  } else if (usingAuth && !usingTw) {
    appFile = "with-auth.tsx";
  }

  const appSrc = path.join(appFileDir, appFile);
  const appDest = path.join(projectDir, "src/pages/_app.tsx");
  fs.copySync(appSrc, appDest);
};

// Similar to _app, but for app router
export const selectLayoutFile = ({
  projectDir,
  packages,
}: SelectBoilerplateProps) => {
  const layoutFileDir = path.join(PKG_ROOT, "template/extras/src/app/layout");

  const usingTw = packages.tailwind.inUse;
  const usingTRPC = packages.trpc.inUse;
  const usingClerk = packages.clerk.inUse;
  let layoutFile = "base.tsx";
  if (usingClerk && usingTRPC) {
    layoutFile = "with-clerk-trpc.tsx";
  } else if (usingClerk) {
    layoutFile = "with-clerk.tsx";
  } else if (usingTRPC && usingTw) {
    layoutFile = "with-trpc-tw.tsx";
  } else if (usingTRPC && !usingTw) {
    layoutFile = "with-trpc.tsx";
  } else if (!usingTRPC && usingTw) {
    layoutFile = "with-tw.tsx";
  }

  const appSrc = path.join(layoutFileDir, layoutFile);
  const appDest = path.join(projectDir, "src/app/layout.tsx");
  fs.copySync(appSrc, appDest);
};

// This selects the proper index.tsx to be used that showcases the chosen tech
export const selectIndexFile = ({
  projectDir,
  packages,
}: SelectBoilerplateProps) => {
  const indexFileDir = path.join(PKG_ROOT, "template/extras/src/pages/index");

  const usingTRPC = packages.trpc.inUse;
  const usingTw = packages.tailwind.inUse;
  const usingBetterAuth = packages?.betterAuth.inUse;
  const usingNextAuth = packages?.nextAuth.inUse;
  const usingAuth = usingNextAuth || usingBetterAuth;

  let indexFile = "base.tsx";
  if (usingTRPC && usingTw && usingBetterAuth) {
    indexFile = "with-better-auth-trpc-tw.tsx";
  } else if (usingTRPC && !usingTw && usingBetterAuth) {
    indexFile = "with-better-auth-trpc.tsx";
  } else if (!usingTRPC && usingTw && usingBetterAuth) {
    indexFile = "with-better-auth-tw.tsx";
  } else if (!usingTRPC && !usingTw && usingBetterAuth) {
    indexFile = "with-better-auth.tsx";
  } else if (usingTRPC && usingTw && usingAuth) {
    indexFile = "with-auth-trpc-tw.tsx";
  } else if (usingTRPC && !usingTw && usingAuth) {
    indexFile = "with-auth-trpc.tsx";
  } else if (usingTRPC && usingTw) {
    indexFile = "with-trpc-tw.tsx";
  } else if (usingTRPC && !usingTw) {
    indexFile = "with-trpc.tsx";
  } else if (!usingTRPC && usingTw) {
    indexFile = "with-tw.tsx";
  }

  const indexSrc = path.join(indexFileDir, indexFile);
  const indexDest = path.join(projectDir, "src/pages/index.tsx");
  fs.copySync(indexSrc, indexDest);
};

// Similar to index, but for app router
export const selectPageFile = ({
  projectDir,
  packages,
}: SelectBoilerplateProps) => {
  const indexFileDir = path.join(PKG_ROOT, "template/extras/src/app/page");
  const extrasDir = path.join(PKG_ROOT, "template/extras");

  const usingTRPC = packages.trpc.inUse;
  const usingTw = packages.tailwind.inUse;
  const usingAuth = packages?.nextAuth.inUse;
  const usingBetterAuth = packages?.betterAuth.inUse;
  const usingClerk = packages?.clerk.inUse;
  const usingDb = packages.prisma.inUse || packages.drizzle.inUse;
  const usingRuns =
    usingClerk &&
    usingTRPC &&
    usingDb &&
    packages.trelent.inUse &&
    packages.shadcn.inUse &&
    packages.aiElements.inUse;

  if (usingRuns) {
    // The full agent-runs experience: home page to start runs, a chat-style
    // run page at /runs/[id], and the components both are built from.
    fs.copySync(
      path.join(extrasDir, "src/app/page/with-runs.tsx"),
      path.join(projectDir, "src/app/page.tsx")
    );
    fs.copySync(
      path.join(extrasDir, "src/app/runs"),
      path.join(projectDir, "src/app/runs")
    );
    for (const component of [
      "create-run.tsx",
      "run-list.tsx",
      "run-status-badge.tsx",
      "run-thread.tsx",
    ]) {
      fs.copySync(
        path.join(extrasDir, "src/app/_components", component),
        path.join(projectDir, "src/app/_components", component)
      );
    }
    fs.copySync(
      path.join(extrasDir, "src/lib/models.ts"),
      path.join(projectDir, "src/lib/models.ts")
    );
    return;
  }

  let indexFile = "base.tsx";
  if (usingClerk) {
    indexFile = "with-clerk.tsx";
  } else if (usingTRPC && usingTw && usingBetterAuth) {
    indexFile = "with-better-auth-trpc-tw.tsx";
  } else if (usingTRPC && !usingTw && usingBetterAuth) {
    indexFile = "with-better-auth-trpc.tsx";
  } else if (!usingTRPC && usingTw && usingBetterAuth) {
    indexFile = "with-better-auth-tw.tsx";
  } else if (!usingTRPC && !usingTw && usingBetterAuth) {
    indexFile = "with-better-auth.tsx";
  } else if (usingTRPC && usingTw && usingAuth) {
    indexFile = "with-auth-trpc-tw.tsx";
  } else if (usingTRPC && !usingTw && usingAuth) {
    indexFile = "with-auth-trpc.tsx";
  } else if (usingTRPC && usingTw) {
    indexFile = "with-trpc-tw.tsx";
  } else if (usingTRPC && !usingTw) {
    indexFile = "with-trpc.tsx";
  } else if (!usingTRPC && usingTw) {
    indexFile = "with-tw.tsx";
  }

  const indexSrc = path.join(indexFileDir, indexFile);
  const indexDest = path.join(projectDir, "src/app/page.tsx");
  fs.copySync(indexSrc, indexDest);
};
