# FamilyOS — Planning Documentation

**Status:** Planning Complete ✅
**Next Phase:** Setup & Implementation
**Created:** 2025-12-14

---

## 📚 Documentation Index

This directory contains all planning and handoff documentation for FamilyOS, a calm, Apple Health-style family task management application.

### 📖 Read in This Order

1. **[PRD.md](./PRD.md)** — Product Requirements Document
   - Product vision and goals
   - Core features (MVP scope)
   - Non-goals (deferred to v2)
   - Success metrics
   - User flows

2. **[SPEC.md](./SPEC.md)** — Technical Specification
   - System architecture
   - Data model (tables, relationships)
   - Routes and pages
   - Component structure
   - Business logic (routine task scheduling)
   - UI/UX design tokens

3. **[TOOLING_PLAN.md](./TOOLING_PLAN.md)** — Claude Code Configuration
   - Memory payload (pinned context)
   - Hooks checklist (pre-coding, pre-commit)
   - Skills list (reusable playbooks)
   - Documentation plan
   - MCP connector plan
   - Deployment contract (formalized)

4. **[TOKEN_ECONOMICS.md](./TOKEN_ECONOMICS.md)** — Context Management
   - Token budget philosophy
   - Token cost estimates (high/medium/low)
   - Token-saving strategies
   - Checkpoint monitoring
   - Warning signs (context exhaustion)
   - Expected token breakdown per phase

5. **[SETUP_PACK.md](./SETUP_PACK.md)** — Development Setup
   - Prerequisites (Node, npm, Google OAuth, database)
   - Step-by-step scaffolding instructions
   - Dependency installation
   - Environment variable configuration
   - Build verification checklist
   - Common setup issues

6. **[HANDOFF_PROMPT.md](./HANDOFF_PROMPT.md)** — Implementation Guide ⭐
   - **START HERE for implementation**
   - Rules & guardrails (deployment contract, code quality, scope control)
   - Step-by-step build order (9 phases, 30+ tickets)
   - Explicit stop points
   - Definition of Done per phase
   - Success criteria (final verification)

---

## 🚀 Quick Start

### For Planning Review:
1. Read **PRD.md** to understand product goals
2. Read **SPEC.md** to understand technical approach
3. Approve or request changes

### For Implementation:
1. Read all 6 documents above (in order)
2. Follow **HANDOFF_PROMPT.md** step-by-step
3. Do NOT skip tickets or stop points

---

## 🎯 Project Context

### What is FamilyOS?
A calm, Apple Health-style family task management app with:
- Google Auth (no passwords)
- Family profiles (shared task lists)
- Routine tasks (daily, weekly, monthly)
- One-off tasks (with due dates)
- Scheduled items (calendar events)

### Why This Matters
This project has previously suffered from:
- Container vs browser preview confusion
- Unreliable Vercel deployments
- Missing deployment contracts
- Tooling assumptions
- Scope creep before fundamentals were agreed

**This documentation ensures those failures don't happen again.**

---

## 🛡️ Deployment Contract (Summary)

The final app MUST:
1. ✅ Deploy cleanly to Vercel (no Docker, no containers)
2. ✅ Have deterministic `npm run build` (succeeds every time)
3. ✅ Have explicit framework (Next.js App Router) and output directory (`.next`)
4. ✅ Not rely on container-only assumptions
5. ✅ Not rely on localhost behavior
6. ✅ Fail gracefully if env vars are missing

**See TOOLING_PLAN.md for full contract details.**

---

## 📊 Project Status

### ✅ Completed Phases
- [x] Planning (PRD, SPEC, TOOLING_PLAN)
- [x] Setup instructions (SETUP_PACK)
- [x] Implementation guide (HANDOFF_PROMPT)
- [x] Token budget strategy (TOKEN_ECONOMICS)

### ⏳ Pending Phases
- [ ] Setup & Scaffolding (Phase 1)
- [ ] Database Schema (Phase 2)
- [ ] Authentication (Phase 3)
- [ ] UI Foundation (Phase 4)
- [ ] Dashboard & Families (Phase 5)
- [ ] Task Management (Phase 6)
- [ ] Routine Scheduling (Phase 7)
- [ ] Deployment (Phase 8)
- [ ] Final Verification (Phase 9)

---

## 🔗 Tech Stack (Approved)

- **Framework:** Next.js 15+ (App Router)
- **Language:** TypeScript 5+
- **Database:** Vercel Postgres (or Supabase)
- **ORM:** Drizzle ORM
- **Auth:** NextAuth.js v5 (Google provider)
- **Styling:** Tailwind CSS 4+ + shadcn/ui
- **Hosting:** Vercel

---

## 📋 Key Decisions Made

1. **Framework:** Next.js (over Astro) — better auth ecosystem, Vercel-native
2. **Database:** Vercel Postgres (over Supabase) — simpler integration
3. **ORM:** Drizzle (over Prisma) — lighter, better for serverless
4. **UI:** shadcn/ui (over custom) — Radix + Tailwind, copy-paste components
5. **Routine Tasks:** Virtual tasks (over generated instances) — simpler for MVP

**See SPEC.md for full justifications.**

---

## 🚨 DO NOT DO (Guardrails)

1. ❌ Write code before reading all planning docs
2. ❌ Skip tickets or stop points in HANDOFF_PROMPT.md
3. ❌ Add features not in PRD.md (no scope creep)
4. ❌ Use Docker or containers for production
5. ❌ Assume localhost behavior
6. ❌ Commit secrets or `.env.local` to git
7. ❌ Deploy without verifying `npm run build` succeeds
8. ❌ Read large generated files (lock files, build outputs)
9. ❌ Over-engineer solutions (keep it simple)
10. ❌ Proceed past stop points without verification

---

## 📞 Support

If you have questions about this documentation:
1. Check the relevant doc file (use index above)
2. Search for keywords in HANDOFF_PROMPT.md
3. Review SPEC.md for technical details
4. Review PRD.md for product context

---

## 📝 Document Versions

| Document | Version | Last Updated |
|----------|---------|--------------|
| PRD.md | 1.0 | 2025-12-14 |
| SPEC.md | 1.0 | 2025-12-14 |
| TOOLING_PLAN.md | 1.0 | 2025-12-14 |
| TOKEN_ECONOMICS.md | 1.0 | 2025-12-14 |
| SETUP_PACK.md | 1.0 | 2025-12-14 |
| HANDOFF_PROMPT.md | 1.0 | 2025-12-14 |

---

**Ready to start?** Read **HANDOFF_PROMPT.md** and follow the build order step-by-step. 🚀
