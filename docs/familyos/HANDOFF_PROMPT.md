# Handoff Prompt
## FamilyOS — Step-by-Step Build Plan & Implementation Guide

**Version:** 1.0
**Status:** Ready for Execution
**Last Updated:** 2025-12-14

---

## 🎯 Context (Read This First)

You are building **FamilyOS**, a calm, Apple Health-style family task management app. This project has previously suffered from:

- Container vs browser preview confusion
- Unreliable Vercel deployments
- Missing deployment contracts
- Tooling assumptions
- Scope creep before fundamentals were agreed

**Your job:** Follow this build plan exactly. Do not skip steps. Do not add features. Do not assume anything works until verified.

---

## 📚 Required Reading (Before Starting)

Before writing any code, read these documents in this order:

1. **`PRD.md`** — Understand product goals, features, constraints
2. **`SPEC.md`** — Understand architecture, data model, routes
3. **`TOOLING_PLAN.md`** — Understand framework choice, deployment contract
4. **`SETUP_PACK.md`** — Follow setup instructions exactly
5. **`TOKEN_ECONOMICS.md`** — Understand how to manage context budget

**Do NOT proceed until you've read all five documents.**

---

## 🛡️ Rules & Guardrails (Non-Negotiable)

### Deployment Contract

Every feature you build MUST:

1. ✅ Deploy cleanly to Vercel (no Docker, no containers)
2. ✅ Work with `npm run build` (deterministic, no errors)
3. ✅ Fail gracefully if env vars are missing (no crashes)
4. ✅ Work on production URLs (no localhost assumptions)
5. ✅ Be Vercel-serverless compatible (no long-running processes)

### Code Quality

1. ✅ **TypeScript only** — no `any` types, strict mode enabled
2. ✅ **ESLint clean** — `npm run lint` must pass
3. ✅ **Build clean** — `npm run build` must succeed with 0 errors
4. ✅ **No console errors** — test in browser, check DevTools console
5. ✅ **Env vars documented** — update `.env.example` for every new var

### Scope Control

1. ❌ **No scope creep** — only build features in PRD.md
2. ❌ **No clever abstractions** — simple, explicit code
3. ❌ **No premature optimization** — working code first, fast code later
4. ❌ **No over-engineering** — minimal dependencies, minimal indirection
5. ❌ **No dark mode, notifications, or file uploads** — deferred to v2 (see PRD)

### Token Budget

1. ✅ **Use Task agents** for exploration (don't read 10 files manually)
2. ✅ **Read only files you're editing** (not entire directories)
3. ✅ **Avoid reading lock files** (unless debugging dependencies)
4. ✅ **Summarize before reading >300 line files**
5. ✅ **Monitor token usage** — stay under 140,000 for MVP (see TOKEN_ECONOMICS.md)

---

## 🗺️ Build Order (Follow Exactly)

### Phase 0: Verify Prerequisites ✅ (Already Complete)

- ✅ PRD.md, SPEC.md, TOOLING_PLAN.md, SETUP_PACK.md created
- ✅ Deployment contract defined
- ✅ Framework chosen (Next.js App Router)
- ✅ Database chosen (Vercel Postgres or Supabase)
- ✅ Auth chosen (NextAuth.js v5)

**Next:** Proceed to Phase 1 (Setup).

---

### Phase 1: Setup & Scaffolding

**Goal:** Create Next.js app, install dependencies, verify build.

#### Ticket 1.1: Scaffold Next.js App

**Steps:**
1. Create new Next.js project: `npx create-next-app@latest familyos`
2. Configuration: TypeScript ✅, ESLint ✅, Tailwind ✅, App Router ✅, `src/` ❌
3. Verify `npm run dev` starts
4. Verify `npm run build` succeeds

**Definition of Done:**
- ✅ `familyos/` directory created
- ✅ `npm run dev` starts on `http://localhost:3000`
- ✅ `npm run build` succeeds with 0 errors
- ✅ Default Next.js page loads in browser

**Stop Point:** Do not proceed until build succeeds.

---

#### Ticket 1.2: Install Core Dependencies

**Steps:**
1. Install NextAuth: `npm install next-auth@beta`
2. Install Drizzle: `npm install drizzle-orm @vercel/postgres`
3. Install Drizzle Kit: `npm install -D drizzle-kit`
4. Verify `npm run build` still succeeds

**Justifications:**
- `next-auth@beta` (v5): Google OAuth, Vercel-compatible (~50KB gzipped)
- `drizzle-orm`: Type-safe ORM, serverless-friendly (~15KB gzipped)
- `@vercel/postgres`: Vercel Postgres client (~5KB gzipped)

**Definition of Done:**
- ✅ Dependencies installed
- ✅ `npm run build` succeeds with 0 errors
- ✅ No TypeScript errors

**Stop Point:** Do not proceed until build succeeds.

---

#### Ticket 1.3: Install UI Components (Optional: shadcn/ui)

**Steps:**
1. Initialize shadcn: `npx shadcn@latest init`
2. Configuration: Default style, Slate color, CSS variables ✅
3. Install components: `npx shadcn@latest add button card checkbox input select badge avatar`
4. Verify `npm run build` still succeeds

**Definition of Done:**
- ✅ shadcn/ui configured
- ✅ Components added to `components/ui/`
- ✅ `npm run build` succeeds with 0 errors

**Stop Point:** Do not proceed until build succeeds.

---

#### Ticket 1.4: Configure Environment Variables

**Steps:**
1. Create `.env.local` with:
   ```bash
   GOOGLE_CLIENT_ID=placeholder
   GOOGLE_CLIENT_SECRET=placeholder
   NEXTAUTH_URL=http://localhost:3000
   NEXTAUTH_SECRET=placeholder
   POSTGRES_URL=placeholder
   ```
2. Create `.env.example` (same keys, no values)
3. Add `.env*.local` to `.gitignore`
4. Commit `.env.example` to git

**Definition of Done:**
- ✅ `.env.local` created (gitignored)
- ✅ `.env.example` created (committed)
- ✅ No secrets in git history

**Stop Point:** Do not proceed until `.env.example` is committed.

---

#### Ticket 1.5: Create Database (Vercel Postgres or Supabase)

**Option A: Vercel Postgres**
1. Go to Vercel dashboard → Storage → Create Database → Postgres
2. Copy `POSTGRES_URL` from dashboard
3. Add to `.env.local`

**Option B: Supabase**
1. Create project at supabase.com
2. Settings → Database → Connection string (Nodejs)
3. Add to `.env.local`

**Definition of Done:**
- ✅ Database created
- ✅ `POSTGRES_URL` added to `.env.local`
- ✅ Connection string is valid (no test yet, just verify format)

**Stop Point:** Do not proceed until database is created.

---

#### Ticket 1.6: Configure Google OAuth

**Steps:**
1. Go to Google Cloud Console → APIs & Services → Credentials
2. Create OAuth client ID (Web application)
3. Authorized redirect URI: `http://localhost:3000/api/auth/callback/google`
4. Copy Client ID and Secret
5. Add to `.env.local`
6. Configure OAuth consent screen (External, app name: FamilyOS)

**Definition of Done:**
- ✅ OAuth client created
- ✅ `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` in `.env.local`
- ✅ Redirect URI configured correctly

**Stop Point:** Do not proceed until OAuth is configured.

---

### Phase 2: Database Schema & Migrations

**Goal:** Define data model, create tables, verify database connection.

#### Ticket 2.1: Create Drizzle Config

**Steps:**
1. Create `drizzle.config.ts`:
   ```typescript
   import type { Config } from "drizzle-kit"

   export default {
     schema: "./lib/db/schema.ts",
     out: "./drizzle",
     dialect: "postgresql",
     dbCredentials: {
       url: process.env.POSTGRES_URL!,
     },
   } satisfies Config
   ```
2. Create `lib/db/schema.ts` (empty for now)
3. Verify TypeScript compiles

**Definition of Done:**
- ✅ `drizzle.config.ts` created
- ✅ `lib/db/schema.ts` created
- ✅ No TypeScript errors

---

#### Ticket 2.2: Define Database Schema

**Steps:**
1. Write schema in `lib/db/schema.ts` (see SPEC.md for entities: User, Family, FamilyMember, Task)
2. Use Drizzle syntax:
   ```typescript
   import { pgTable, uuid, text, timestamp, boolean, integer } from "drizzle-orm/pg-core"

   export const users = pgTable("users", {
     id: uuid("id").primaryKey().defaultRandom(),
     email: text("email").notNull().unique(),
     name: text("name").notNull(),
     image: text("image"),
     createdAt: timestamp("created_at").defaultNow(),
     updatedAt: timestamp("updated_at").defaultNow(),
   })

   // ... (families, familyMembers, tasks)
   ```
3. Verify TypeScript compiles

**Definition of Done:**
- ✅ All tables defined (users, families, familyMembers, tasks)
- ✅ Relationships defined (foreign keys)
- ✅ Indexes defined (see SPEC.md)
- ✅ No TypeScript errors

**Stop Point:** Do not proceed until schema is complete.

---

#### Ticket 2.3: Generate & Run Migrations

**Steps:**
1. Generate migration: `npx drizzle-kit generate`
2. Verify migration SQL in `drizzle/` directory
3. Run migration: `npx drizzle-kit push` (or `migrate` depending on Drizzle version)
4. Verify tables created in database (use Vercel dashboard or Supabase UI)

**Definition of Done:**
- ✅ Migration files generated in `drizzle/`
- ✅ Migration applied to database
- ✅ Tables visible in database UI

**Stop Point:** Do not proceed until tables are created.

---

#### Ticket 2.4: Create Database Client

**Steps:**
1. Create `lib/db/client.ts`:
   ```typescript
   import { drizzle } from "drizzle-orm/vercel-postgres"
   import { sql } from "@vercel/postgres"
   import * as schema from "./schema"

   export const db = drizzle(sql, { schema })
   ```
2. Test connection (optional: create a simple script to query DB)
3. Verify TypeScript compiles

**Definition of Done:**
- ✅ `lib/db/client.ts` created
- ✅ Database client exported
- ✅ No TypeScript errors

---

### Phase 3: Authentication (NextAuth.js)

**Goal:** Implement Google Auth, sign-in page, session handling.

#### Ticket 3.1: Configure NextAuth.js

**Steps:**
1. Create `lib/auth.ts`:
   ```typescript
   import NextAuth from "next-auth"
   import GoogleProvider from "next-auth/providers/google"

   export const { handlers, auth, signIn, signOut } = NextAuth({
     providers: [
       GoogleProvider({
         clientId: process.env.GOOGLE_CLIENT_ID!,
         clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
       }),
     ],
     pages: {
       signIn: "/auth/signin",
       error: "/auth/error",
     },
   })
   ```
2. Create `app/api/auth/[...nextauth]/route.ts`:
   ```typescript
   import { handlers } from "@/lib/auth"
   export const { GET, POST } = handlers
   ```
3. Verify TypeScript compiles

**Definition of Done:**
- ✅ `lib/auth.ts` created
- ✅ `app/api/auth/[...nextauth]/route.ts` created
- ✅ No TypeScript errors

---

#### Ticket 3.2: Create Sign-In Page

**Steps:**
1. Create `app/auth/signin/page.tsx`
2. Use `signIn("google")` from NextAuth
3. Style with Tailwind (Apple Health aesthetic)
4. Test sign-in flow:
   - Visit `http://localhost:3000/auth/signin`
   - Click "Sign in with Google"
   - Verify redirect to Google
   - Verify redirect back to app

**Definition of Done:**
- ✅ Sign-in page created
- ✅ Google OAuth flow works
- ✅ User can sign in and see session

**Stop Point:** Do not proceed until sign-in works.

---

#### Ticket 3.3: Create Auth Error Page

**Steps:**
1. Create `app/auth/error/page.tsx`
2. Display error message from query params
3. Provide "Try Again" button

**Definition of Done:**
- ✅ Error page created
- ✅ Error message displayed
- ✅ No crashes on auth errors

---

#### Ticket 3.4: Create Protected Route Layout

**Steps:**
1. Create `app/(protected)/layout.tsx`
2. Check session: `const session = await auth()`
3. If no session, redirect to `/auth/signin`
4. If session, render children

**Definition of Done:**
- ✅ Protected layout created
- ✅ Unauthenticated users redirected to sign-in
- ✅ Authenticated users see protected pages

**Stop Point:** Do not proceed until auth gating works.

---

### Phase 4: Landing Page & UI Foundation

**Goal:** Build landing page, layout, navigation, Apple Health styling.

#### Ticket 4.1: Update Landing Page

**Steps:**
1. Edit `app/page.tsx`
2. Create hero section: "FamilyOS — Calm Family Task Management"
3. Add "Sign in with Google" button
4. Style with Tailwind (pastel blues, generous whitespace)

**Definition of Done:**
- ✅ Landing page styled
- ✅ Sign-in button works
- ✅ Apple Health aesthetic applied

---

#### Ticket 4.2: Create Root Layout

**Steps:**
1. Edit `app/layout.tsx`
2. Set font: system font stack
3. Set metadata: title, description
4. Import `globals.css`

**Definition of Done:**
- ✅ Root layout configured
- ✅ Font is san-serif, readable
- ✅ Metadata set

---

#### Ticket 4.3: Create UI Components

**Steps:**
1. Create `components/auth/SignInButton.tsx` (triggers `signIn("google")`)
2. Create `components/auth/UserMenu.tsx` (dropdown: profile, settings, sign out)
3. Style with shadcn/ui or Tailwind

**Definition of Done:**
- ✅ SignInButton component created
- ✅ UserMenu component created
- ✅ Components styled consistently

---

#### Ticket 4.4: Apply Tailwind Config (Apple Health Colors)

**Steps:**
1. Edit `tailwind.config.ts`
2. Add custom colors:
   ```typescript
   colors: {
     primary: { 50: '#f0f9ff', 500: '#3b82f6', 600: '#2563eb' },
     success: { 50: '#f0fdf4', 500: '#10b981' },
     neutral: { 50: '#fafafa', 100: '#f5f5f5', 900: '#171717' },
   }
   ```
3. Test colors on landing page

**Definition of Done:**
- ✅ Custom colors defined
- ✅ Colors applied to components
- ✅ Visual consistency achieved

---

### Phase 5: Dashboard & Family Management

**Goal:** Build dashboard, family creation, member management.

#### Ticket 5.1: Create Dashboard Page

**Steps:**
1. Create `app/(protected)/dashboard/page.tsx`
2. Fetch user's families (if none, redirect to `/family/new`)
3. Display today's tasks (placeholder for now)
4. Display family summary

**Definition of Done:**
- ✅ Dashboard page created
- ✅ User sees their families
- ✅ Redirect to family creation if none

---

#### Ticket 5.2: Create Family Creation Page

**Steps:**
1. Create `app/(protected)/family/new/page.tsx`
2. Form: family name input
3. On submit: Create family in database (via API route)
4. Redirect to dashboard

**Definition of Done:**
- ✅ Family creation form created
- ✅ Family saved to database
- ✅ User redirected to dashboard

---

#### Ticket 5.3: Create API Route for Families

**Steps:**
1. Create `app/api/families/route.ts`
2. GET: List families for current user
3. POST: Create new family
4. Validate session (require auth)

**Definition of Done:**
- ✅ API route created
- ✅ GET returns user's families
- ✅ POST creates family
- ✅ Auth required

**Stop Point:** Do not proceed until API works.

---

#### Ticket 5.4: Create Family Detail Page

**Steps:**
1. Create `app/(protected)/family/[id]/page.tsx`
2. Fetch family by ID
3. Display family name, members, tasks
4. Add "Invite Member" button (placeholder for v2)

**Definition of Done:**
- ✅ Family detail page created
- ✅ Family data displayed
- ✅ No errors if family has no members/tasks

---

### Phase 6: Task Management (Core Feature)

**Goal:** Build task creation, task list, task completion.

#### Ticket 6.1: Create Task Creation Page

**Steps:**
1. Create `app/(protected)/tasks/new/page.tsx`
2. Form:
   - Task title (text input)
   - Task type (select: routine, one-off, scheduled)
   - Frequency (if routine: daily, weekly, monthly)
   - Due date (if one-off or scheduled: date picker)
   - Assigned to (select: family member dropdown)
3. On submit: Create task in database (via API route)
4. Redirect to `/tasks`

**Definition of Done:**
- ✅ Task creation form created
- ✅ Task saved to database
- ✅ User redirected to task list

---

#### Ticket 6.2: Create API Route for Tasks

**Steps:**
1. Create `app/api/tasks/route.ts`
2. GET: List tasks for current user's family
3. POST: Create new task
4. Validate session (require auth)

**Definition of Done:**
- ✅ API route created
- ✅ GET returns user's tasks
- ✅ POST creates task
- ✅ Auth required

**Stop Point:** Do not proceed until API works.

---

#### Ticket 6.3: Create Task List Page

**Steps:**
1. Create `app/(protected)/tasks/page.tsx`
2. Fetch tasks for user's family
3. Display tasks in cards (TaskCard component)
4. Filter by type (routine, one-off, scheduled)
5. Sort by due date

**Definition of Done:**
- ✅ Task list page created
- ✅ Tasks displayed in cards
- ✅ Filters work
- ✅ Empty state shown if no tasks

---

#### Ticket 6.4: Create Task Card Component

**Steps:**
1. Create `components/tasks/TaskCard.tsx`
2. Display: task title, type badge, due date, assigned member
3. Add checkbox for completion
4. Style with Apple Health aesthetic (rounded card, pastel accent)

**Definition of Done:**
- ✅ TaskCard component created
- ✅ Task data displayed
- ✅ Styled consistently

---

#### Ticket 6.5: Implement Task Completion Logic

**Steps:**
1. Create `app/api/tasks/[id]/complete/route.ts`
2. POST: Mark task as complete
   - Update `isCompleted = true`
   - Set `completedAt = now`
   - Set `completedBy = userId`
3. For routine tasks: track `lastCompletedAt` (virtual tasks approach)
4. Return updated task

**Definition of Done:**
- ✅ API route created
- ✅ Task completion works
- ✅ Routine tasks track last completed

**Stop Point:** Do not proceed until completion works.

---

#### Ticket 6.6: Create Task Detail Page

**Steps:**
1. Create `app/(protected)/tasks/[id]/page.tsx`
2. Fetch task by ID
3. Display full task details
4. Add "Edit" button (placeholder for v2)
5. Add "Delete" button (via DELETE API route)

**Definition of Done:**
- ✅ Task detail page created
- ✅ Task data displayed
- ✅ Delete button works

---

### Phase 7: Routine Task Scheduling (MVP)

**Goal:** Implement "today's tasks" logic for routine tasks (virtual tasks).

#### Ticket 7.1: Implement "Today's Tasks" Query

**Steps:**
1. Edit `app/(protected)/dashboard/page.tsx`
2. Fetch routine tasks from database
3. Filter by current date:
   - Daily: always show
   - Weekly: show if `dayOfWeek === today.getDay()`
   - Monthly: show if `dayOfMonth === today.getDate()`
4. Display in dashboard

**Definition of Done:**
- ✅ Today's tasks displayed
- ✅ Routine tasks filtered correctly
- ✅ No duplicate tasks shown

**Stop Point:** Do not proceed until routine logic works.

---

#### Ticket 7.2: Test Routine Task Scheduling

**Steps:**
1. Create a daily task (e.g., "Water plants")
2. Verify it appears in dashboard every day
3. Create a weekly task (e.g., "Take out trash" on Tuesdays)
4. Verify it appears only on Tuesdays
5. Mark task complete
6. Verify `lastCompletedAt` is set

**Definition of Done:**
- ✅ Daily tasks appear every day
- ✅ Weekly tasks appear on correct day
- ✅ Completion tracking works

**Stop Point:** Do not proceed until scheduling is verified.

---

### Phase 8: Deployment to Vercel

**Goal:** Deploy to Vercel, verify production build, test in production.

#### Ticket 8.1: Local Build Verification

**Steps:**
1. Run `npm run build`
2. Verify 0 errors
3. Run `npm run start`
4. Test in browser: sign in, create family, create task, mark complete
5. Check console for errors

**Definition of Done:**
- ✅ Build succeeds locally
- ✅ All features work in production mode
- ✅ No console errors

**Stop Point:** Do not proceed until local build is clean.

---

#### Ticket 8.2: Create Vercel Project

**Steps:**
1. Go to Vercel dashboard
2. Import GitHub repo (familyos)
3. Configure:
   - Framework Preset: Next.js (auto-detected)
   - Build Command: `npm run build` (default)
   - Output Directory: `.next` (auto-detected)
4. Add environment variables:
   - `GOOGLE_CLIENT_ID`
   - `GOOGLE_CLIENT_SECRET`
   - `NEXTAUTH_URL` (production URL)
   - `NEXTAUTH_SECRET`
   - `POSTGRES_URL`
5. Deploy

**Definition of Done:**
- ✅ Vercel project created
- ✅ Env vars configured
- ✅ First deployment succeeds

**Stop Point:** Do not proceed until deployment succeeds.

---

#### Ticket 8.3: Update Google OAuth Redirect URI

**Steps:**
1. Go to Google Cloud Console
2. Edit OAuth client
3. Add production redirect URI: `https://familyos.vercel.app/api/auth/callback/google`
4. Save

**Definition of Done:**
- ✅ Production redirect URI added
- ✅ OAuth works in production

**Stop Point:** Do not proceed until production auth works.

---

#### Ticket 8.4: Test Production Deployment

**Steps:**
1. Visit production URL: `https://familyos.vercel.app`
2. Test full user flow:
   - Sign in with Google
   - Create family
   - Create routine task
   - Create one-off task
   - Mark task complete
   - View dashboard
   - Sign out
3. Check browser console for errors
4. Check Vercel logs for server errors

**Definition of Done:**
- ✅ All features work in production
- ✅ No console errors
- ✅ No server errors in logs

**Stop Point:** Do not proceed until production is verified.

---

### Phase 9: Final Verification & Handoff

**Goal:** Verify deployment contract, update docs, prepare for handoff.

#### Ticket 9.1: Deployment Contract Verification

**Checklist:**
- ✅ Deploys cleanly to Vercel (no manual config beyond env vars)
- ✅ `npm run build` is deterministic (succeeds every time)
- ✅ Explicit framework (Next.js) and output directory (`.next`)
- ✅ No container-only assumptions (works in Vercel serverless)
- ✅ No localhost assumptions (production URLs work)
- ✅ Graceful failure if env vars missing (tested by removing `.env.local`)

**Definition of Done:**
- ✅ All checklist items verified

---

#### Ticket 9.2: Update Documentation

**Steps:**
1. Update `README.md` with:
   - Project description
   - Setup instructions
   - Deployment instructions
   - Env var requirements
2. Update `.env.example` with all required vars
3. Commit to git

**Definition of Done:**
- ✅ README.md updated
- ✅ .env.example complete
- ✅ Docs committed

---

#### Ticket 9.3: Create Final Commit & Push

**Steps:**
1. Review all changes
2. Run `npm run build` one last time
3. Commit with message: "feat: FamilyOS MVP complete — deployment verified"
4. Push to branch: `claude/familyos-mvp-{sessionId}`
5. Verify Vercel preview build succeeds

**Definition of Done:**
- ✅ All changes committed
- ✅ Pushed to GitHub
- ✅ Vercel preview build succeeds

---

#### Ticket 9.4: Create Pull Request (Optional)

**Steps:**
1. Create PR from feature branch to `main`
2. Title: "FamilyOS MVP: Family task management app"
3. Description: Link to PRD.md, list completed features
4. Request review (if applicable)

**Definition of Done:**
- ✅ PR created
- ✅ Description is clear
- ✅ Ready for review

---

## ✅ Definition of Done (Per Phase)

### Phase 1: Setup
- ✅ `npm run build` succeeds
- ✅ All dependencies installed
- ✅ Env vars configured
- ✅ Database created
- ✅ Google OAuth configured

### Phase 2: Database
- ✅ Schema defined
- ✅ Migrations run
- ✅ Tables created in database
- ✅ Database client working

### Phase 3: Auth
- ✅ NextAuth.js configured
- ✅ Sign-in page works
- ✅ Google OAuth flow works
- ✅ Protected routes gated

### Phase 4: UI Foundation
- ✅ Landing page styled
- ✅ Apple Health aesthetic applied
- ✅ UI components created

### Phase 5: Dashboard & Families
- ✅ Dashboard page works
- ✅ Family creation works
- ✅ Family detail page works
- ✅ API routes work

### Phase 6: Task Management
- ✅ Task creation works
- ✅ Task list displays
- ✅ Task completion works
- ✅ Task detail page works

### Phase 7: Routine Scheduling
- ✅ Today's tasks logic works
- ✅ Routine tasks appear correctly
- ✅ Completion tracking works

### Phase 8: Deployment
- ✅ Local build succeeds
- ✅ Vercel deployment succeeds
- ✅ Production auth works
- ✅ All features work in production

### Phase 9: Final Verification
- ✅ Deployment contract verified
- ✅ Docs updated
- ✅ Code committed and pushed

---

## 🚨 Stop Points (Do Not Proceed Until Complete)

1. **After Ticket 1.1:** Verify `npm run build` succeeds
2. **After Ticket 1.2:** Verify `npm run build` succeeds (with dependencies)
3. **After Ticket 2.3:** Verify tables created in database
4. **After Ticket 3.2:** Verify sign-in flow works
5. **After Ticket 3.4:** Verify protected routes work
6. **After Ticket 5.3:** Verify family API works
7. **After Ticket 6.2:** Verify task API works
8. **After Ticket 6.5:** Verify task completion works
9. **After Ticket 7.2:** Verify routine scheduling works
10. **After Ticket 8.1:** Verify local production build works
11. **After Ticket 8.4:** Verify production deployment works

**If any stop point fails, STOP and debug before proceeding.**

---

## 🎓 Best Practices Reminders

1. **Before editing a file:** Read it first (with Read tool)
2. **After editing a file:** Run `npm run build` to verify
3. **Before committing:** Run `npm run lint` and `npm run typecheck`
4. **Before pushing:** Test locally in browser
5. **After deploying:** Test in production URL

---

## 📊 Expected Timeline (Token Budget)

| Phase | Estimated Tokens | Cumulative |
|-------|------------------|------------|
| Phase 1: Setup | 10,000 | 10,000 |
| Phase 2: Database | 20,000 | 30,000 |
| Phase 3: Auth | 20,000 | 50,000 |
| Phase 4: UI Foundation | 20,000 | 70,000 |
| Phase 5: Dashboard & Families | 20,000 | 90,000 |
| Phase 6: Task Management | 30,000 | 120,000 |
| Phase 7: Routine Scheduling | 10,000 | 130,000 |
| Phase 8: Deployment | 10,000 | 140,000 |
| **Buffer** | 60,000 | 200,000 |

**Goal:** Complete MVP with 60,000 token buffer for debugging and user requests.

---

## 🏁 Success Criteria (Final Verification)

The FamilyOS MVP is **COMPLETE** when:

1. ✅ User can sign in with Google
2. ✅ User can create a family
3. ✅ User can add family members (data model supports it, UI shows list)
4. ✅ User can create routine tasks (daily, weekly, monthly)
5. ✅ User can create one-off tasks (with due date)
6. ✅ User can mark tasks complete
7. ✅ Dashboard shows "today's tasks" (routine tasks filtered correctly)
8. ✅ App deploys cleanly to Vercel
9. ✅ `npm run build` succeeds with 0 errors
10. ✅ Production URL works without errors
11. ✅ Deployment contract verified (see Ticket 9.1)

---

**Status:** Ready for implementation. Follow this plan step-by-step. Do not skip tickets. Do not add features. Report completion after each phase.

**Good luck!** 🚀
