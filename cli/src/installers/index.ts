import { envVariablesInstaller } from "~/installers/envVars.js";
import { nextAuthInstaller } from "~/installers/nextAuth.js";
import { prismaInstaller } from "~/installers/prisma.js";
import { tailwindInstaller } from "~/installers/tailwind.js";
import { trpcInstaller } from "~/installers/trpc.js";
import { type PackageManager } from "~/utils/getUserPkgManager.js";
import { aiElementsInstaller } from "./aiElements.js";
import { betterAuthInstaller } from "./betterAuth.js";
import { biomeInstaller } from "./biome.js";
import { clerkInstaller } from "./clerk.js";
import { dbContainerInstaller } from "./dbContainer.js";
import { drizzleInstaller } from "./drizzle.js";
import { dynamicEslintInstaller } from "./eslint.js";
import { shadcnInstaller } from "./shadcn.js";
import { trelentInstaller } from "./trelent.js";

// Turning this into a const allows the list to be iterated over for programmatically creating prompt options
// Should increase extensibility in the future
export const availablePackages = [
  "nextAuth",
  "betterAuth",
  "clerk",
  "prisma",
  "drizzle",
  "tailwind",
  "shadcn",
  "aiElements",
  "trpc",
  "trelent",
  "envVariables",
  "eslint",
  "biome",
  "dbContainer",
] as const;
export type AvailablePackages = (typeof availablePackages)[number];

export const databaseProviders = [
  "mysql",
  "postgres",
  "sqlite",
  "planetscale",
] as const;
export type DatabaseProvider = (typeof databaseProviders)[number];

export interface InstallerOptions {
  projectDir: string;
  pkgManager: PackageManager;
  noInstall: boolean;
  packages?: PkgInstallerMap;
  appRouter?: boolean;
  projectName: string;
  scopedAppName: string;
  databaseProvider: DatabaseProvider;
  sandboxName?: string;
}

export type Installer = (opts: InstallerOptions) => void;

export type PkgInstallerMap = Record<
  AvailablePackages,
  {
    inUse: boolean;
    installer: Installer;
  }
>;

export const buildPkgInstallerMap = (
  packages: AvailablePackages[],
  databaseProvider: DatabaseProvider
): PkgInstallerMap => ({
  nextAuth: {
    inUse: packages.includes("nextAuth"),
    installer: nextAuthInstaller,
  },
  betterAuth: {
    inUse: packages.includes("betterAuth"),
    installer: betterAuthInstaller,
  },
  clerk: {
    inUse: packages.includes("clerk"),
    installer: clerkInstaller,
  },
  prisma: {
    inUse: packages.includes("prisma"),
    installer: prismaInstaller,
  },
  drizzle: {
    inUse: packages.includes("drizzle"),
    installer: drizzleInstaller,
  },
  tailwind: {
    inUse: packages.includes("tailwind"),
    installer: tailwindInstaller,
  },
  shadcn: {
    inUse: packages.includes("shadcn"),
    installer: shadcnInstaller,
  },
  aiElements: {
    inUse: packages.includes("aiElements"),
    installer: aiElementsInstaller,
  },
  trpc: {
    inUse: packages.includes("trpc"),
    installer: trpcInstaller,
  },
  dbContainer: {
    inUse: ["mysql", "postgres"].includes(databaseProvider),
    installer: dbContainerInstaller,
  },
  envVariables: {
    inUse: true,
    installer: envVariablesInstaller,
  },
  // Must run after envVariables: it appends the TRELENT_* vars to the
  // generated src/env.js and .env files.
  trelent: {
    inUse: packages.includes("trelent"),
    installer: trelentInstaller,
  },
  eslint: {
    inUse: packages.includes("eslint"),
    installer: dynamicEslintInstaller,
  },
  biome: {
    inUse: packages.includes("biome"),
    installer: biomeInstaller,
  },
});
