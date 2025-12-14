# Product Requirements Document (PRD)
## FamilyOS — Family Task Management App

**Version:** 1.0
**Status:** Draft — Awaiting Approval
**Last Updated:** 2025-12-14

---

## 📋 Product Vision

FamilyOS is a calm, Apple Health-style family task management application that helps families coordinate routine tasks, one-off chores, and scheduled activities without overwhelm. The UI prioritizes clarity, safety, and simplicity over cleverness.

**Primary User:** Non-technical family coordinators (parents, caregivers) who need a low-friction way to manage household responsibilities.

**Design Philosophy:** Calm technology. Minimal cognitive load. Health-app aesthetic.

---

## 🎯 Core Goals

1. **Family Coordination:** Allow multiple family members to view and manage shared tasks
2. **Routine Management:** Support recurring tasks (daily, weekly, custom schedules)
3. **Simple Auth:** Google-based authentication — no password management
4. **Production-Ready:** Deploy cleanly to Vercel without container or localhost assumptions
5. **Graceful Degradation:** Fail gracefully if env vars are missing or services are down

---

## ✅ Core Features (MVP)

### 1. Authentication
- Google Auth via Firebase Auth or NextAuth.js
- Family profile creation (one account can create/manage a family)
- No username/password — Google SSO only

### 2. Family Profiles
- Create a family
- Invite family members via email (future: invite links)
- View family member list
- Assign tasks to specific members

### 3. Task Management
- **Routine Tasks:** Recurring tasks (e.g., "Take out trash every Tuesday")
- **One-Off Tasks:** Single tasks with optional due dates
- **Scheduled Items:** Calendar-style events (e.g., "Doctor appointment on Jan 15")
- Mark tasks as complete
- View completed history (past 30 days)

### 4. UI/UX
- **Apple Health-style design:**
  - Sans-serif fonts (system fonts preferred)
  - Pastel accents (soft blues, greens, no harsh reds)
  - Generous whitespace
  - Card-based layouts
  - Minimal icons
- Mobile-first responsive design
- Light mode (dark mode deferred to v2)

### 5. Deployment
- Must deploy to Vercel
- `npm run build` must succeed locally and in CI/CD
- No Docker or container dependencies
- Graceful fallback if Firebase or DB is unavailable (show error message, not crash)

---

## 🚫 Non-Goals (Out of Scope for MVP)

- **No notifications/reminders** (push, email, SMS) — deferred to v2
- **No gamification** (points, streaks, badges) — not aligned with "calm" philosophy
- **No file uploads** (task attachments) — deferred to v2
- **No calendar sync** (Google Calendar, Outlook) — deferred to v2
- **No dark mode** — deferred to v2
- **No real-time collaboration** (live updates) — polling or refresh is acceptable
- **No custom recurrence rules** beyond basic daily/weekly/monthly — keep it simple
- **No analytics/tracking** — privacy-first approach

---

## 📊 Success Metrics

**Technical:**
- `npm run build` succeeds with zero errors
- Vercel deployment succeeds without manual intervention
- Page load time < 2 seconds (95th percentile)
- Zero console errors in production

**User:**
- User can create a family and add 2+ members in < 5 minutes
- User can create a routine task in < 1 minute
- User can mark a task complete in < 10 seconds
- 90% of users complete onboarding without help docs

---

## 🛡️ Constraints & Guardrails

1. **Vercel Deployment Contract:**
   - Must use Vercel-compatible framework (Next.js App Router or Astro SSR)
   - Must have explicit build output directory
   - No serverless function time limits exceeded (10s max)
   - No Docker or custom build scripts that break Vercel zero-config

2. **No Localhost Assumptions:**
   - All features must work on production URLs (https://familyos.vercel.app)
   - No hardcoded localhost or 127.0.0.1 references
   - Redirect URIs must be configurable via env vars

3. **Graceful Failure:**
   - If Firebase config is missing, show "Authentication unavailable" — don't crash
   - If database is down, show error page with retry button — don't hang
   - All env vars must have fallback or validation

4. **No Scope Creep:**
   - Stick to MVP features listed above
   - Defer all "nice to have" features to backlog
   - Require written justification for any new dependency

5. **Token Budget:**
   - Use Task agents for codebase exploration
   - Avoid reading large generated files (lock files, build outputs)
   - Summarize before reading files >300 lines

---

## 🗺️ User Flows

### Flow 1: New User Onboarding
1. User visits `/` (landing page)
2. Clicks "Sign in with Google"
3. Redirected to Google OAuth consent
4. Returns to app, creates family profile
5. Adds family members (email addresses)
6. Creates first routine task
7. Sees dashboard with task list

### Flow 2: Daily Task Completion
1. User signs in
2. Sees today's tasks (routines + one-offs due today)
3. Clicks checkbox to mark task complete
4. Task moves to "Completed" section
5. If routine, next occurrence is scheduled

### Flow 3: Adding a Routine Task
1. User clicks "Add Routine"
2. Fills form:
   - Task name (e.g., "Water plants")
   - Assigned to (family member dropdown)
   - Frequency (daily, weekly, custom)
   - Start date
3. Saves task
4. Task appears in dashboard on scheduled days

---

## 🚀 Next Steps (After PRD Approval)

1. **Review & Approve PRD** ← You are here
2. Generate SPEC.md (routes, data model, components)
3. Generate TOOLING_PLAN.md (framework choice, dependencies)
4. Generate HANDOFF_PROMPT.md (build tickets, stop points)
5. Scaffold repo with approved tooling
6. Implement features per build order
7. Deploy to Vercel
8. User acceptance testing

---

## ❓ Open Questions

- **Q:** Which framework — Next.js App Router or Astro SSR?
  - **A:** Recommend Next.js (more mature auth ecosystem, better Vercel integration)

- **Q:** Which database — Vercel Postgres, Supabase, or Firebase?
  - **A:** Recommend Vercel Postgres (native integration) or Supabase (generous free tier)

- **Q:** Which auth — Firebase Auth or NextAuth.js?
  - **A:** Recommend NextAuth.js (Next.js native, simpler config)

---

**Approval Required:** Please review and approve this PRD before proceeding to SPEC.md.
