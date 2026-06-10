import { Client } from "@trelent/agents";

import { env } from "~/env";

/**
 * Singleton client for the Trelent Agent Orchestration API.
 *
 * When `TRELENT_CLIENT_ID` / `TRELENT_CLIENT_SECRET` are set, the SDK
 * exchanges them for a JWT automatically. Without credentials it talks to an
 * unauthenticated orchestrator (e.g. a local deployment).
 *
 * @see https://www.npmjs.com/package/@trelent/agents
 */
const createTrelentClient = () =>
  new Client(
    env.TRELENT_API_URL,
    env.TRELENT_CLIENT_ID && env.TRELENT_CLIENT_SECRET
      ? {
          clientId: env.TRELENT_CLIENT_ID,
          clientSecret: env.TRELENT_CLIENT_SECRET,
        }
      : undefined
  );

const globalForTrelent = globalThis as unknown as {
  trelent: ReturnType<typeof createTrelentClient> | undefined;
};

export const trelent = globalForTrelent.trelent ?? createTrelentClient();

if (env.NODE_ENV !== "production") globalForTrelent.trelent = trelent;
