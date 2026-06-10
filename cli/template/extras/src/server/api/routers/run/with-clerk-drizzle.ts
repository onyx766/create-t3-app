import { type HarnessSpec } from "@trelent/agents";
import { TRPCError } from "@trpc/server";
import { desc, eq } from "drizzle-orm";
import { z } from "zod";

import { env } from "~/env";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { type db } from "~/server/db";
import { runs } from "~/server/db/schema";
import { trelent } from "~/server/trelent";

type DbClient = typeof db;
type RunRow = typeof runs.$inferSelect;

const TERMINAL_STATUSES = new Set([
  "completed",
  "failed",
  "timeout",
  "cancelled",
]);

const getRunOrThrow = async (dbClient: DbClient, id: string, userId: string) => {
  const run = await dbClient.query.runs.findFirst({ where: eq(runs.id, id) });
  if (run?.userId !== userId) {
    throw new TRPCError({ code: "NOT_FOUND", message: "Run not found" });
  }
  return run;
};

/** Pull the latest status/output from the orchestrator while a run is in flight. */
const syncRun = async (dbClient: DbClient, run: RunRow): Promise<RunRow> => {
  if (!run.trelentRunId || TERMINAL_STATUSES.has(run.status)) return run;
  try {
    const remote = await trelent.runs.get(run.trelentRunId);
    const update = {
      status: remote.status,
      response: remote.result?.output ?? run.response,
      error: remote.error ?? run.error,
      completedAt: remote.completed_at ? new Date(remote.completed_at) : null,
    };
    await dbClient.update(runs).set(update).where(eq(runs.id, run.id));
    return { ...run, ...update };
  } catch {
    // Orchestrator unreachable - serve the cached row.
    return run;
  }
};

const markFailed = async (dbClient: DbClient, id: string, error: unknown) => {
  await dbClient
    .update(runs)
    .set({
      status: "failed",
      error:
        error instanceof Error
          ? error.message
          : "Failed to reach the Trelent orchestrator",
      completedAt: new Date(),
    })
    .where(eq(runs.id, id));
};

export const runRouter = createTRPCRouter({
  create: protectedProcedure
    .input(
      z.object({
        prompt: z.string().min(1),
        harness: z.enum(["claude_code", "codex"]).default("claude_code"),
        model: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const id = crypto.randomUUID();
      await ctx.db.insert(runs).values({
        id,
        userId: ctx.userId,
        sandbox: env.TRELENT_SANDBOX,
        harness: input.harness,
        model: input.model,
        prompt: input.prompt,
        status: "pending",
      });

      try {
        const remote = await trelent.runs.create({
          sandbox: env.TRELENT_SANDBOX,
          prompt: input.prompt,
          harness: {
            kind: input.harness,
            ...(input.model ? { model: input.model } : {}),
          } as HarnessSpec,
        });
        await ctx.db
          .update(runs)
          .set({ trelentRunId: remote.id, status: remote.status })
          .where(eq(runs.id, id));
      } catch (error) {
        await markFailed(ctx.db, id, error);
      }

      return getRunOrThrow(ctx.db, id, ctx.userId);
    }),

  /**
   * Reply to a run: forks it on the orchestrator (resuming from the parent's
   * checkpoint) and records the new run with `parentId` set to the original.
   */
  fork: protectedProcedure
    .input(z.object({ runId: z.string(), prompt: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      const parent = await getRunOrThrow(ctx.db, input.runId, ctx.userId);

      const id = crypto.randomUUID();
      await ctx.db.insert(runs).values({
        id,
        userId: ctx.userId,
        parentId: parent.id,
        sandbox: parent.sandbox,
        harness: parent.harness,
        model: parent.model,
        prompt: input.prompt,
        status: "pending",
      });

      try {
        if (!parent.trelentRunId) {
          throw new Error(
            "The parent run never started on the orchestrator, so it cannot be forked."
          );
        }
        const parentRemote = await trelent.runs.get(parent.trelentRunId);
        const remote = await parentRemote.fork(input.prompt);
        await ctx.db
          .update(runs)
          .set({ trelentRunId: remote.id, status: remote.status })
          .where(eq(runs.id, id));
      } catch (error) {
        await markFailed(ctx.db, id, error);
      }

      return getRunOrThrow(ctx.db, id, ctx.userId);
    }),

  /**
   * Fetch a run plus its fork ancestry (oldest first) so the UI can render the
   * whole conversation thread.
   */
  get: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const run = await syncRun(
        ctx.db,
        await getRunOrThrow(ctx.db, input.id, ctx.userId)
      );

      const thread: RunRow[] = [run];
      let cursor: RunRow = run;
      while (cursor.parentId && thread.length < 50) {
        const parent = await ctx.db.query.runs.findFirst({
          where: eq(runs.id, cursor.parentId),
        });
        if (parent?.userId !== ctx.userId) break;
        cursor = await syncRun(ctx.db, parent);
        thread.unshift(cursor);
      }

      return { run, thread };
    }),

  list: protectedProcedure.query(({ ctx }) =>
    ctx.db.query.runs.findMany({
      where: eq(runs.userId, ctx.userId),
      orderBy: [desc(runs.createdAt)],
      limit: 50,
    })
  ),
});
