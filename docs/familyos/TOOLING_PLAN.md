# Tooling Plan
## FamilyOS — Claude Code Configuration & Automation

**Version:** 1.0
**Status:** Approved (Checkpoint 6)
**Last Updated:** 2025-12-14

---

## 📋 Memory Payload (Pin to Project)

This is the concise context that should be referenced throughout development:

### Product Goals
- Build FamilyOS: calm, Apple Health–style family task management app
- Primary user is non-technical — clarity and safety over cleverness
- Core features: Google Auth, family profiles, routine tasks, one-off tasks, scheduled items
- Visual language: minimal, health-app aesthetic, low cognitive load

### Hard Constraints
- Must deploy cleanly to Vercel with zero container assumptions
- Must have deterministic `npm run build` that succeeds in CI/CD
- Must fail gracefully if environment variables are missing (no crashes)
- No localhost-only behavior — all features must work in production URLs
- No tooling choices that risk Vercel compatibility without explicit trade-off documentation

### Deployment Target
- Vercel (production)
- Framework must explicitly define output directory and build command
- No Docker, no dev containers for production assumptions

### Framework Choice (Approved)
- **Next.js 15+ (App Router)** — Vercel-native, well-documented, zero-config deployment
- **Output Directory:** `.next/` (auto-detected by Vercel)
- **Build Command:** `npm run build` (must succeed with zero errors)

### Hosting & Auth
- **Hosting:** Vercel
- **Auth:** NextAuth.js v5 (Google provider)
- **Database:** Vercel Postgres (recommended) or Supabase

### Naming Conventions
- Project name: `familyos` (repo), `FamilyOS` (user-facing)
- Branch naming: `claude/feature-name-{sessionId}`
- Env vars: `NEXT_PUBLIC_*` for client, standard naming for server

### Token Budget Strategy
- Use Task agents for codebase exploration to reduce main context usage
- Avoid reading large generated files (lock files, build outputs)
- Read docs on-demand, not upfront
- Summarize long files before full reads

### Explicit "DO NOT DO" List
1. ❌ **DO NOT** write application code before PRD and SPEC are approved
2. ❌ **DO NOT** scaffold the repo or run `npm create` before tooling plan approval
3. ❌ **DO NOT** install any dependencies before justifying bundle/deploy impact
4. ❌ **DO NOT** assume localhost or container previews exist
5. ❌ **DO NOT** add features beyond the agreed PRD (no scope creep)
6. ❌ **DO NOT** use Docker or container-specific tooling for production assumptions
7. ❌ **DO NOT** proceed past Checkpoint 6 without explicit approval
8. ❌ **DO NOT** output large files (node_modules, lock files) without request
9. ❌ **DO NOT** commit secrets or env files to git
10. ❌ **DO NOT** deploy without verifying `npm run build` succeeds locally first

---

## 🪝 Hooks Checklist

### Before Coding (Pre-Implementation)

- ✅ Confirm `PRD.md` exists and is approved
- ✅ Confirm `DEPLOYMENT_CONTRACT.md` exists
- ✅ Confirm framework choice is documented and Vercel-safe
- ✅ Confirm `SPEC.md` defines routes, data model, and component structure

### Before Adding Any Dependency

- ✅ Require written justification: "Why is this needed?"
- ✅ State bundle impact: "How much does this add to bundle size?"
- ✅ State deploy impact: "Is this Vercel-compatible? Does it require serverless functions?"
- ✅ Prefer zero-dependency solutions if possible
- ✅ Document the decision in `DEPENDENCIES.md` (or inline comment)

### Before Merging/Committing

- ✅ Ensure `npm run build` succeeds locally
- ✅ Ensure tests pass (or document why tests are deferred)
- ✅ Ensure no secrets are in code
- ✅ Ensure env vars are documented in `.env.example`
- ✅ Verify branch name matches `claude/feature-name-{sessionId}` pattern

### Output Control

- ✅ Prevent large file outputs (>500 lines) unless explicitly requested
- ✅ Do not read or output `node_modules`, `package-lock.json`, `.next`, `dist` unless debugging
- ✅ Summarize long files (>300 lines) before proposing edits

---

## 🎓 Skills List (Reusable Playbooks)

### Skill: "Vercel-Safe Scaffolding"
**Purpose:** Initialize a Next.js project with Vercel deployment guarantees

**Steps:**
1. Run `npx create-next-app@latest` with TypeScript, Tailwind, App Router
2. Verify `next.config.mjs` has no Docker-specific settings
3. Test `npm run build` locally
4. Document output directory (`.next/`)
5. Verify no container-only dependencies

**Constraints:**
- No Docker, no custom build scripts that break Vercel's zero-config
- No `node-pty`, `puppeteer`, or non-serverless libraries without justification

### Skill: "Routine Scheduling Logic"
**Purpose:** Define how tasks repeat (daily, weekly, custom schedules)

**Steps:**
1. Choose virtual task approach (MVP) or generated instances (v2)
2. Define data model for recurrence (`frequency`, `dayOfWeek`, `dayOfMonth`)
3. Implement "today's tasks" query (filter routines by current date)
4. Ensure serverless-compatible (no background workers without Vercel Cron)

**Constraints:**
- No cron jobs or background workers unless using Vercel Cron (requires config)
- No third-party scheduling libraries unless bundle size < 10KB

### Skill: "Firebase Auth Minimal Setup"
**Purpose:** Add Google Auth with NextAuth.js in Vercel environment

**Steps:**
1. Install `next-auth@beta` (v5)
2. Create `app/api/auth/[...nextauth]/route.ts`
3. Configure Google provider with env vars
4. Add sign-in page (`/auth/signin`)
5. Test in production (verify redirect URIs work)

**Constraints:**
- Must work without localhost redirects (use env var for `NEXTAUTH_URL`)
- Must fail gracefully if Firebase config is missing (show error page, not crash)

### Skill: "Apple Health–Style UI Discipline"
**Purpose:** Enforce visual consistency: san-serif fonts, pastel accents, generous whitespace

**Steps:**
1. Define Tailwind config with pastel colors (`primary`, `success`, `neutral`)
2. Use system fonts (`-apple-system, BlinkMacSystemFont, "Segoe UI"`)
3. Create component library (shadcn/ui or custom)
4. Enforce design tokens: `rounded-2xl`, `p-6`, `gap-6`, `text-base`
5. Use Lucide Icons (minimal, 20px-24px size)

**Constraints:**
- No heavy UI libraries (no Material UI, Ant Design) unless justified
- Prefer Tailwind + Radix UI or Headless UI
- No bold fonts, no harsh reds, no gradients (unless subtle)

### Skill: "Deployment Verification Checklist"
**Purpose:** Ensure every deploy meets the contract before pushing

**Steps:**
1. Run `npm run build` locally
2. Check for errors in console
3. Test env var fallbacks (remove `.env.local`, see graceful error)
4. Verify routes work (`npm run start`, test in browser)
5. Check console for warnings (fix before deploy)
6. Push to branch
7. Verify Vercel preview build succeeds

**Constraints:**
- Must pass locally before git push
- Must pass in Vercel preview before merging to main

---

## 📚 Documentation Plan (Context7)

### What Docs to Pull (On-Demand)

#### 1. Next.js App Router Docs
- **When:** Before scaffolding, before implementing routes
- **Why:** Understand output directory, build config, Vercel deployment defaults
- **URL:** https://nextjs.org/docs/app

#### 2. Vercel Deployment Docs
- **When:** Before first deploy, when debugging build failures
- **Why:** Understand build settings, environment variables, function limits
- **URL:** https://vercel.com/docs/deployments

#### 3. NextAuth.js v5 Docs
- **When:** Before implementing auth
- **Why:** Understand Google provider setup, session handling, redirect URIs
- **URL:** https://authjs.dev/getting-started/installation

#### 4. Drizzle ORM Docs
- **When:** Before creating schema, before migrations
- **Why:** Understand schema syntax, query API, serverless best practices
- **URL:** https://orm.drizzle.team/docs/overview

#### 5. Vercel Cron Docs (Optional)
- **When:** Only if implementing auto-generated routine tasks (v2 feature)
- **Why:** Understand serverless cron limitations, syntax, testing
- **URL:** https://vercel.com/docs/cron-jobs

### What NOT to Pull

- ❌ General TypeScript docs (assumed knowledge)
- ❌ Tailwind CSS docs (only pull if custom plugin needed)
- ❌ React docs (assumed knowledge)
- ❌ Git/GitHub docs (assumed knowledge)

### How to Pull Docs

Use **WebFetch** tool with specific prompts:

```
WebFetch(
  url: "https://nextjs.org/docs/app/building-your-application/deploying",
  prompt: "What are the Vercel deployment requirements for Next.js App Router?"
)
```

**Token Budget:** Max 2,000 tokens per doc pull. Prefer targeted questions over "summarize entire page."

---

## 🔌 MCP (Multi-Connector Plan)

### GitHub
- **Status:** ✅ Required
- **Purpose:** Store code, track changes, create PRs
- **Branch:** `claude/deployment-contracts-tooling-PsVHX` (current), future: `claude/feature-name-{sessionId}`
- **Usage:** All code changes, commits, and PRs go here

### Teams
- **Status:** ❌ Not Used
- **Purpose:** Notify stakeholders on build success/failure
- **Recommendation:** NO — unless stakeholder explicitly requests notifications
- **Justification:** Adds complexity; not needed for initial build phase

### SharePoint
- **Status:** ❌ Not Used
- **Purpose:** Read/write project files (e.g., design docs, user research)
- **Recommendation:** NO — unless files exist there and need to be synced
- **Justification:** Not needed for code-only work; git is sufficient

### Planner
- **Status:** ❌ Not Used
- **Purpose:** Task tracking beyond git issues
- **Recommendation:** NO — use GitHub issues or TodoWrite tool
- **Justification:** Adds overhead; not needed unless stakeholder uses Planner actively

**Summary:** Only GitHub is active. Other connectors are disabled unless explicitly requested.

---

## 🛡️ Deployment Contract (Formalized)

### Requirements

The final FamilyOS app **MUST**:

1. ✅ Deploy cleanly to Vercel
   - Zero manual configuration beyond env vars
   - Auto-detected framework (Next.js)
   - Auto-detected output directory (`.next`)

2. ✅ Have a deterministic `npm run build`
   - Succeeds locally every time
   - Succeeds in CI/CD (Vercel build)
   - No warnings or errors in console

3. ✅ Have an explicit framework and output directory
   - Framework: Next.js 15+ (App Router)
   - Output: `.next/` (auto-detected)

4. ✅ Not rely on container-only assumptions
   - No Docker-specific env vars (e.g., `DOCKER_HOST`)
   - No file paths that assume `/app/` or container structure

5. ✅ Not rely on localhost behavior
   - All redirect URIs configurable via env vars
   - No hardcoded `http://localhost:3000`

6. ✅ Not break if environment variables are missing
   - Graceful error messages: "Google Auth unavailable"
   - No crashes, no unhandled promise rejections
   - All env vars validated at startup (or lazy-loaded with fallbacks)

### If a Design Risks Vercel Compatibility

1. **Call it out** in comments or docs
2. **Choose the safer option** (e.g., virtual tasks over cron jobs)
3. **Document the trade-off** in `SPEC.md` or inline comments

---

## 🚦 Checkpoint Process

### Checkpoint 1: Planning (✅ Complete)
- ✅ PRD.md created and approved
- ✅ SPEC.md created and approved
- ✅ TOOLING_PLAN.md created and approved

### Checkpoint 2: Setup
- ⏸️ Scaffold Next.js app
- ⏸️ Install dependencies
- ⏸️ Configure env vars
- ⏸️ Verify `npm run build` succeeds

### Checkpoint 3: Auth
- ⏸️ Implement NextAuth.js
- ⏸️ Create sign-in page
- ⏸️ Test Google OAuth flow

### Checkpoint 4: Data Model
- ⏸️ Create Drizzle schema
- ⏸️ Run migrations
- ⏸️ Test database connection

### Checkpoint 5: UI Components
- ⏸️ Create layout components
- ⏸️ Create task components
- ⏸️ Apply Apple Health styling

### Checkpoint 6: API Routes
- ⏸️ Implement family routes
- ⏸️ Implement task routes
- ⏸️ Test CRUD operations

### Checkpoint 7: Pages
- ⏸️ Build dashboard
- ⏸️ Build family pages
- ⏸️ Build task pages

### Checkpoint 8: Deployment
- ⏸️ Deploy to Vercel
- ⏸️ Verify preview build
- ⏸️ Test production URLs
- ⏸️ Merge to main

**Status:** Currently at Checkpoint 1. Awaiting approval to proceed to Checkpoint 2 (Setup).

---

## 📊 Success Metrics (Tooling)

### Technical Metrics

- ✅ `npm run build` succeeds with 0 errors
- ✅ `npm run build` completes in < 60 seconds
- ✅ Bundle size < 200KB (initial load)
- ✅ Lighthouse score: 90+ (Performance, Accessibility, Best Practices)

### Developer Experience Metrics

- ✅ `npm run dev` starts in < 5 seconds
- ✅ Hot reload works for all file changes
- ✅ TypeScript errors caught before runtime
- ✅ ESLint errors caught before commit

### Deployment Metrics

- ✅ Vercel build succeeds on first try
- ✅ Deployment completes in < 3 minutes
- ✅ Zero configuration required beyond env vars
- ✅ Preview URLs work immediately after deploy

---

**Status:** Tooling Plan approved at Checkpoint 6. Ready to proceed to HANDOFF_PROMPT.md (build tickets and step-by-step execution plan).
