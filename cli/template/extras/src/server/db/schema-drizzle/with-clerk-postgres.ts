import { index, pgTableCreator } from "drizzle-orm/pg-core";

/**
 * This is an example of how to use the multi-project schema feature of Drizzle ORM. Use the same
 * database instance for multiple projects.
 *
 * @see https://orm.drizzle.team/docs/goodies#multi-project-schema
 */
export const createTable = pgTableCreator((name) => `project1_${name}`);

/**
 * Agent runs executed through the Trelent orchestrator. Each row belongs to a
 * Clerk user (`userId`); a forked run points at its parent via `parentId`, so
 * a run's ancestry chain forms the conversation thread.
 */
export const runs = createTable(
  "run",
  (d) => ({
    id: d
      .varchar({ length: 36 })
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    userId: d.varchar({ length: 191 }).notNull(),
    parentId: d.varchar({ length: 36 }),
    trelentRunId: d.varchar({ length: 191 }),
    sandbox: d.varchar({ length: 191 }).notNull(),
    harness: d.varchar({ length: 32 }).notNull(),
    model: d.varchar({ length: 64 }),
    prompt: d.text().notNull(),
    response: d.text(),
    status: d.varchar({ length: 32 }).default("pending").notNull(),
    error: d.text(),
    createdAt: d
      .timestamp({ withTimezone: true })
      .$defaultFn(() => new Date())
      .notNull(),
    completedAt: d.timestamp({ withTimezone: true }),
  }),
  (t) => [
    index("run_user_idx").on(t.userId),
    index("run_parent_idx").on(t.parentId),
  ]
);
