# create-t3-app — Codebase Guide

## What this repo is

This is the source for **create-t3-app** (v7.40.0), an interactive CLI that scaffolds full-stack, typesafe Next.js apps using the T3 Stack. It is **not** a framework — once you scaffold an app it's yours to own.

**T3 Stack technologies:**
- [Next.js](https://nextjs.org) — React framework
- [tRPC](https://trpc.io) — end-to-end typesafe APIs
- [Tailwind CSS](https://tailwindcss.com) — utility-first CSS
- [TypeScript](https://typescriptlang.org) — typesafety
- [Prisma](https://prisma.io) — ORM (PostgreSQL/MySQL/SQLite)
- [Drizzle](https://orm.drizzle.team) — lightweight ORM alternative
- [NextAuth.js](https://next-auth.js.org) — authentication

## Monorepo structure

```
/
├── cli/          # The create-t3-app CLI (published to npm as create-t3-app)
│   ├── src/      # CLI source (TypeScript, built with tsup)
│   └── template/ # Scaffold templates copied into new projects
└── www/          # Documentation website (Astro)
    └── src/pages/ # Docs in .md/.mdx, one folder per language
```

Package manager: **pnpm** (workspace). Build orchestration: **Turborepo**.

## T3 Axioms

1. **Solve Problems** — only add things that solve a specific problem. No state libs (zustand/redux), yes to NextAuth + Prisma/tRPC integration.
2. **Bleed Responsibly** — use bleeding-edge tech only in low-risk parts. Stable DB (SQL), risky-but-cheap bets like tRPC.
3. **Typesafety Isn't Optional** — typesafety is a first-class citizen. `.js` config files are typechecked via `checkJs` in tsconfig.

## Common commands

```bash
# CLI
cd cli
pnpm build        # compile with tsup → dist/
pnpm dev          # watch mode
pnpm typecheck    # tsc
pnpm lint         # eslint
pnpm format       # prettier

# www (docs site)
cd www
pnpm dev          # Astro dev server
pnpm build        # production build
```

Node requirement: **>=18.17.0**

---

## T3 FAQ (from www/src/pages/en/faq.mdx)

### What's next? How do I make an app with this?

Keep the project as simple as possible — start with the scaffolding and add things as they become necessary. Refer to the individual technology docs or join the [Discord](https://t3.gg/discord) for help.

Relevant docs: Next.js, NextAuth.js, Prisma, Tailwind CSS, tRPC, Drizzle.

### How do I keep my app up to date?

create-t3-app is a scaffolding tool, not a framework. Once you initialize an app it's yours — there is no postinstall updater. To track improvements, enable GitHub release notifications on the repo. Implementing every template change in your own app is not required.

### What learning resources are currently available?

The community recommends just diving in and learning while building. If you need structured resources:

**Articles** (may be outdated):
- [A first look at Create T3 App](https://dev.to/ajcwebdev/a-first-look-at-create-t3-app-1i8f)
- [Migrating your T3 App into a Turborepo](https://www.jumr.dev/blog/t3-turbo)
- [Integrating Stripe into your T3 App](https://blog.nickramkissoon.com/posts/integrate-stripe-t3)

**Videos:**
- [From 0 to Production - The Modern React Tutorial (RSCs, Next.js, Shadui, Drizzle, TS and more)](https://www.youtube.com/watch?v=d5x0JCZbAJs) *(recommended, updated 2024)*
- [Jack Herrington - Build a Note Taking app with the T3 Stack](https://www.youtube.com/watch?v=J1gzN1SAhyM)
- [Build a Twitter Clone with the T3 Stack](https://www.youtube.com/watch?v=nzJsYJPCc80)
- [Build a Blog With the T3 Stack](https://www.youtube.com/watch?v=syEWlxVFUrY)
- [Build a Live Chat Application with the T3 Stack](https://www.youtube.com/watch?v=dXRRY37MPuk)
- [The T3 Stack - How We Built It](https://www.youtube.com/watch?v=H-FXwnEjSsI)
- [An overview of the Create T3 App](https://www.youtube.com/watch?v=VJH8dsPtbeU)

### Why are there `.js` files in the project?

Per T3 Axiom #3, typesafety is mandatory. However, some frameworks/plugins don't support TypeScript, so certain config files must be `.js`. Each is explicitly typed as `cjs` or `mjs` based on what the consuming library supports. All `.js` files are still typechecked via `checkJs` in tsconfig.

### I'm struggling to add i18n to my app. Is there any reference I can use?

i18n is not included by default because it is opinionated and has many implementation approaches. A [reference repo](https://github.com/juliusmarminge/t3-i18n) exists showing how to add i18n using [next-i18next](https://github.com/i18next/next-i18next).

### Should I use `/app` from Next.js 13 or the more mature `/pages` paradigm?

Both are available when scaffolding. The `/app` directory is considered mature enough for production by the T3 community. If you prefer `/pages`, it remains supported — porting an existing router is a large effort so don't feel pressure to migrate unnecessarily.
