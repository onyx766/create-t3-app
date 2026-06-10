import { type HarnessSpec } from "@trelent/agents";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { env } from "~/env";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { type db } from "~/server/db";
import { trelent } from "~/server/trelent";
import { type Run } from "../../../../generated/prisma";

type DbClient = typeof db;

const TERMINAL_STATUSES = new Set([
  "completed",
  "failed",
  "timeout",
  "cancelled",
]);

const getRunOrThrow = async (dbClient: DbClient, id: string, userId: string) => {
  const run = await dbClient.run.findUnique({ where: { id } });
  if (run?.userId !== userId) {
    throw new TRPCError({ code: "NOT_FOUND", message: "Run not found" });
  }
  return run;
};

/** Pull the latest status/output from the orchestrator while a run is in flight. */
const syncRun = async (dbClient: DbClient, run: Run): Promise<Run> => {
  if (!run.trelentRunId || TERMINAL_STATUSES.has(run.status)) return run;
  try {
    const remote = await trelent.runs.get(run.trelentRunId);
    return await dbClient.run.update({
      where: { id: run.id },
      data: {
        status: remote.status,
        response: remote.result?.output ?? run.response,
        error: remote.error ?? run.error,
        completedAt: remote.completed_at ? new Date(remote.completed_at) : null,
      },
    });
  } catch {
    // Orchestrator unreachable - serve the cached row.
    return run;
  }
};

const markFailed = (dbClient: DbClient, id: string, error: unknown) =>
  dbClient.run.update({
    where: { id },
    data: {
      status: "failed",
      error:
        error instanceof Error
          ? error.message
          : "Failed to reach the Trelent orchestrator",
      completedAt: new Date(),
    },
  });

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
      const created = await ctx.db.run.create({
        data: {
          userId: ctx.userId,
          sandbox: env.TRELENT_SANDBOX,
          harness: input.harness,
          model: input.model,
          prompt: input.prompt,
          status: "pending",
        },
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
        await ctx.db.run.update({
          where: { id: created.id },
          data: { trelentRunId: remote.id, status: remote.status },
        });
      } catch (error) {
        await markFailed(ctx.db, created.id, error);
      }

      return getRunOrThrow(ctx.db, created.id, ctx.userId);
    }),

  /**
   * Reply to a run: forks it on the orchestrator (resuming from the parent's
   * checkpoint) and records the new run with `parentId` set to the original.
   */
  fork: protectedProcedure
    .input(z.object({ runId: z.string(), prompt: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      const parent = await getRunOrThrow(ctx.db, input.runId, ctx.userId);

      const created = await ctx.db.run.create({
        data: {
          userId: ctx.userId,
          parentId: parent.id,
          sandbox: parent.sandbox,
          harness: parent.harness,
          model: parent.model,
          prompt: input.prompt,
          status: "pending",
        },
      });

      try {
        if (!parent.trelentRunId) {
          throw new Error(
            "The parent run never started on the orchestrator, so it cannot be forked."
          );
        }
        const parentRemote = await trelent.runs.get(parent.trelentRunId);
        const remote = await parentRemote.fork(input.prompt);
        await ctx.db.run.update({
          where: { id: created.id },
          data: { trelentRunId: remote.id, status: remote.status },
        });
      } catch (error) {
        await markFailed(ctx.db, created.id, error);
      }

      return getRunOrThrow(ctx.db, created.id, ctx.userId);
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

      const thread: Run[] = [run];
      let cursor: Run = run;
      while (cursor.parentId && thread.length < 50) {
        const parent = await ctx.db.run.findUnique({
          where: { id: cursor.parentId },
        });
        if (parent?.userId !== ctx.userId) break;
        cursor = await syncRun(ctx.db, parent);
        thread.unshift(cursor);
      }

      return { run, thread };
    }),

  list: protectedProcedure.query(({ ctx }) =>
    ctx.db.run.findMany({
      where: { userId: ctx.userId },
      orderBy: { createdAt: "desc" },
      take: 50,
    })
  ),
});
