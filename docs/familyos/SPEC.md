# Technical Specification (SPEC)
## FamilyOS — System Architecture & Implementation Details

**Version:** 1.0
**Status:** Draft — Awaiting Approval
**Last Updated:** 2025-12-14

---

## 🏗️ System Architecture

### Tech Stack (Recommended)

**Framework:** Next.js 15+ (App Router)
- **Why:** Vercel-native, zero-config deployment, mature ecosystem
- **Output:** `.next/` directory, serverless functions
- **Build:** `next build` (deterministic, production-ready)

**Language:** TypeScript 5+
- **Why:** Type safety, better DX, fewer runtime bugs

**Database:** Vercel Postgres (via @vercel/postgres)
- **Why:** Native Vercel integration, serverless-compatible, SQL-based
- **Alternative:** Supabase (more generous free tier, includes auth)

**ORM:** Drizzle ORM
- **Why:** Lightweight, type-safe SQL, better than Prisma for serverless
- **Alternative:** Prisma (heavier, but more mature)

**Auth:** NextAuth.js v5 (Auth.js)
- **Why:** Next.js native, Google provider built-in, Vercel-compatible
- **Config:** Google OAuth 2.0 client ID/secret via env vars

**Styling:** Tailwind CSS 4+ + shadcn/ui (optional)
- **Why:** Utility-first, minimal bundle size, Apple Health aesthetic achievable
- **Components:** Radix UI primitives (headless, accessible)

**Deployment:** Vercel
- **Build Command:** `npm run build`
- **Output Directory:** `.next` (auto-detected)
- **Serverless Functions:** Auto-generated from API routes

---

## 🗄️ Data Model

### Entities

#### 1. **User**
```typescript
{
  id: string (UUID)
  email: string (unique, from Google)
  name: string (from Google profile)
  image?: string (Google avatar URL)
  createdAt: DateTime
  updatedAt: DateTime
}
```

#### 2. **Family**
```typescript
{
  id: string (UUID)
  name: string (e.g., "Smith Family")
  createdBy: string (User.id, FK)
  createdAt: DateTime
  updatedAt: DateTime
}
```

#### 3. **FamilyMember** (Join table)
```typescript
{
  id: string (UUID)
  familyId: string (Family.id, FK)
  userId: string (User.id, FK)
  role: "admin" | "member"
  joinedAt: DateTime
}
```

#### 4. **Task**
```typescript
{
  id: string (UUID)
  familyId: string (Family.id, FK)
  title: string (e.g., "Take out trash")
  description?: string
  type: "routine" | "one-off" | "scheduled"
  assignedTo?: string (User.id, FK, nullable)
  createdBy: string (User.id, FK)

  // For routine tasks
  frequency?: "daily" | "weekly" | "monthly"
  dayOfWeek?: number (0-6, for weekly)
  dayOfMonth?: number (1-31, for monthly)

  // For one-off and scheduled tasks
  dueDate?: DateTime

  isCompleted: boolean (default: false)
  completedAt?: DateTime
  completedBy?: string (User.id, FK)

  createdAt: DateTime
  updatedAt: DateTime
}
```

### Relationships

- **User** `1:N` **Family** (via createdBy)
- **User** `N:N` **Family** (via FamilyMember)
- **Family** `1:N` **Task**
- **User** `1:N` **Task** (assignedTo, createdBy, completedBy)

### Indexes

- `User.email` (unique)
- `FamilyMember.familyId + userId` (composite unique)
- `Task.familyId + dueDate` (for queries)
- `Task.assignedTo` (for user task lists)

---

## 🛤️ Routes & Pages

### Public Routes (Unauthenticated)

| Route | Page | Purpose |
|-------|------|---------|
| `/` | Landing page | Marketing, "Sign in with Google" CTA |
| `/auth/signin` | Sign-in page | Google OAuth trigger (NextAuth) |
| `/auth/error` | Auth error page | Display auth errors gracefully |

### Protected Routes (Authenticated)

| Route | Page | Purpose |
|-------|------|---------|
| `/dashboard` | Dashboard | View today's tasks, family summary |
| `/family/new` | Create family | Onboarding: create first family |
| `/family/[id]` | Family detail | View family members, settings |
| `/family/[id]/invite` | Invite members | Send email invites (future) |
| `/tasks` | All tasks | List all tasks (filters: type, assigned) |
| `/tasks/new` | Create task | Form: routine, one-off, or scheduled |
| `/tasks/[id]` | Task detail | View/edit task, mark complete |
| `/settings` | User settings | Profile, sign out |

### API Routes

| Route | Method | Purpose |
|-------|--------|---------|
| `/api/auth/[...nextauth]` | ALL | NextAuth.js handler |
| `/api/families` | GET, POST | List families, create family |
| `/api/families/[id]` | GET, PATCH, DELETE | Family CRUD |
| `/api/families/[id]/members` | GET, POST, DELETE | Manage members |
| `/api/tasks` | GET, POST | List tasks, create task |
| `/api/tasks/[id]` | GET, PATCH, DELETE | Task CRUD |
| `/api/tasks/[id]/complete` | POST | Mark task complete |

---

## 🎨 Component Structure

### Layout Components

- `RootLayout` (app/layout.tsx) — Global wrapper, font, metadata
- `DashboardLayout` (app/(protected)/layout.tsx) — Nav, sidebar, auth check

### Page Components

- `LandingPage` (/) — Hero, features, CTA
- `DashboardPage` (/dashboard) — Today's tasks, quick stats
- `FamilyPage` (/family/[id]) — Family members, tasks summary
- `TaskListPage` (/tasks) — Filterable task list
- `TaskDetailPage` (/tasks/[id]) — Task detail, edit form

### UI Components (shadcn/ui or custom)

- `Button` — Primary, secondary, ghost variants
- `Card` — Apple Health-style cards (rounded, shadowed)
- `Checkbox` — Task completion toggle
- `Input` — Text input for forms
- `Select` — Dropdown for frequency, assigned member
- `DatePicker` — Due date selection
- `Badge` — Task type indicators (routine, one-off, scheduled)
- `Avatar` — User profile images
- `EmptyState` — "No tasks yet" placeholders

### Auth Components

- `SignInButton` — Triggers NextAuth Google sign-in
- `UserMenu` — Dropdown: profile, settings, sign out
- `ProtectedRoute` — Wrapper for authenticated pages

---

## 🔒 Authentication Flow

### NextAuth.js Configuration

**File:** `app/api/auth/[...nextauth]/route.ts`

```typescript
import NextAuth from "next-auth"
import GoogleProvider from "next-auth/providers/google"

export const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async session({ session, token }) {
      // Add user ID to session
      if (session.user) {
        session.user.id = token.sub
      }
      return session
    },
  },
  pages: {
    signIn: "/auth/signin",
    error: "/auth/error",
  },
}

const handler = NextAuth(authOptions)
export { handler as GET, handler as POST }
```

### Environment Variables

```bash
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-secret
NEXTAUTH_URL=https://familyos.vercel.app (or localhost in dev)
NEXTAUTH_SECRET=random-32-char-string
POSTGRES_URL=postgres://...
```

**Graceful Failure:** If `GOOGLE_CLIENT_ID` is missing, show error page:
```
"Authentication is unavailable. Please contact support."
```

---

## 🔄 Business Logic

### Routine Task Scheduling

**Problem:** How to show "today's tasks" when tasks are recurring?

**Solution:** Generate task instances on-demand (virtual tasks) or use a cron job.

**Approach 1: Virtual Tasks (Recommended for MVP)**
- Store only the routine definition in DB
- When user loads `/dashboard`, calculate which routines are due today
- Example: "Daily trash" → show if today's date matches frequency
- Pros: Simple, no cron, no extra DB rows
- Cons: Can't mark "this week's trash" vs "next week's trash" as separate

**Approach 2: Generated Instances (Future v2)**
- Use Vercel Cron to generate task instances nightly
- Example: Every midnight, create tomorrow's routine tasks as real Task rows
- Pros: Can track completion history per instance
- Cons: Requires Vercel Cron (added complexity)

**MVP Decision:** Use virtual tasks (Approach 1) for simplicity.

### Task Completion Logic

**For One-Off/Scheduled Tasks:**
1. User clicks "Mark Complete"
2. Update `Task.isCompleted = true`, `Task.completedAt = now`, `Task.completedBy = userId`
3. Move to "Completed" section in UI

**For Routine Tasks:**
1. User clicks "Mark Complete"
2. Create a new `TaskCompletion` record (future table) OR
3. Use virtual tasks: just track "last completed" in `Task.lastCompletedAt`
4. Next instance appears tomorrow/next week

**MVP Decision:** Track `lastCompletedAt` in Task table (simpler than separate table).

---

## 🎨 UI/UX Design Tokens

### Colors (Tailwind Config)

```javascript
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0f9ff',  // Light blue (Apple Health-style)
          500: '#3b82f6', // Blue accent
          600: '#2563eb',
        },
        success: {
          50: '#f0fdf4',  // Soft green
          500: '#10b981',
        },
        neutral: {
          50: '#fafafa',  // Background
          100: '#f5f5f5', // Cards
          900: '#171717', // Text
        },
      },
    },
  },
}
```

### Typography

- **Font:** System font stack (`-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, ...`)
- **Sizes:**
  - Headings: `text-2xl` (24px), `text-xl` (20px)
  - Body: `text-base` (16px)
  - Small: `text-sm` (14px)
- **Weight:** Regular (400), Medium (500), Semibold (600) — no bold

### Spacing

- **Cards:** `p-6` (24px padding), `rounded-2xl` (16px border radius)
- **Gaps:** `gap-4` (16px) for lists, `gap-6` (24px) for sections
- **Margins:** `mb-6` (24px) between major sections

### Icons

- **Library:** Lucide Icons (minimal, consistent with Apple aesthetic)
- **Size:** `w-5 h-5` (20px) for inline icons, `w-6 h-6` (24px) for buttons

---

## 🚀 Build & Deployment

### Local Development

```bash
npm install
npm run dev  # Starts Next.js dev server on http://localhost:3000
```

### Production Build

```bash
npm run build  # Must succeed with zero errors
npm run start  # Serves production build locally
```

**Expected Output:**
- `.next/` directory with static assets and server functions
- No warnings or errors in console
- Build time < 60 seconds

### Vercel Deployment

**Configuration:**
- **Framework Preset:** Next.js (auto-detected)
- **Build Command:** `npm run build` (default)
- **Output Directory:** `.next` (auto-detected)
- **Install Command:** `npm install`

**Environment Variables (Vercel Dashboard):**
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `NEXTAUTH_URL` (production URL)
- `NEXTAUTH_SECRET`
- `POSTGRES_URL`

**Deploy Trigger:** Push to `main` branch (auto-deploy)

---

## ✅ Definition of Done (Per Feature)

1. **Code written** and passes TypeScript type check (`npm run typecheck`)
2. **Build succeeds** locally (`npm run build` with zero errors)
3. **Manually tested** in browser (Chrome, Safari)
4. **No console errors** in production mode
5. **Env vars documented** in `.env.example`
6. **Committed to branch** with clear commit message
7. **Pushed to GitHub** (branch: `claude/feature-name-{sessionId}`)
8. **Deployed to Vercel preview** (verify preview link works)

---

## 📋 Open Questions (Require Decisions)

1. **Database Choice:** Vercel Postgres or Supabase?
   - Recommendation: Vercel Postgres (simpler integration)

2. **ORM Choice:** Drizzle or Prisma?
   - Recommendation: Drizzle (lighter, better for serverless)

3. **UI Component Library:** shadcn/ui or build from scratch?
   - Recommendation: shadcn/ui (Radix + Tailwind, copy-paste components)

4. **Routine Task Approach:** Virtual tasks or generated instances?
   - Recommendation: Virtual tasks (MVP), instances in v2

---

**Approval Required:** Please review and approve this SPEC before proceeding to implementation.
