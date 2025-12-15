# Setup Pack
## FamilyOS — Development Environment & Initial Scaffolding

**Version:** 1.0
**Status:** Ready for Execution
**Last Updated:** 2025-12-14

---

## 🎯 Prerequisites

Before starting, ensure these are available:

### Local Environment
- **Node.js:** v20+ (required by Next.js 15)
- **Package Manager:** npm, pnpm, or yarn (recommend pnpm for monorepos)
- **Git:** For version control
- **Code Editor:** VS Code (recommended) with extensions:
  - ESLint
  - Prettier
  - Tailwind CSS IntelliSense
  - TypeScript and JavaScript

### External Services
- **Google Cloud Console:** For OAuth client ID/secret
  - Project created
  - OAuth consent screen configured
  - Redirect URIs: `http://localhost:3000/api/auth/callback/google` (dev), `https://familyos.vercel.app/api/auth/callback/google` (prod)

- **Vercel Account:** For deployment
  - Team or personal account
  - GitHub integration enabled

- **Database:** Vercel Postgres OR Supabase
  - **Option A (Vercel Postgres):** Created via Vercel dashboard
  - **Option B (Supabase):** Free project created at supabase.com

---

## 📦 Step 1: Scaffold Next.js Project

### Create New Next.js App

Run this command in your desired parent directory (NOT inside ValentineOS repo):

```bash
npx create-next-app@latest familyos
```

**Configuration prompts:**
```
✔ Would you like to use TypeScript? … Yes
✔ Would you like to use ESLint? … Yes
✔ Would you like to use Tailwind CSS? … Yes
✔ Would you like to use `src/` directory? … No
✔ Would you like to use App Router? … Yes
✔ Would you like to customize the default import alias? … No
```

**Result:** New directory `familyos/` with Next.js 15 App Router structure.

---

## 📂 Step 2: Project Structure

After scaffolding, the structure should look like:

```
familyos/
├── app/
│   ├── layout.tsx          # Root layout
│   ├── page.tsx            # Landing page
│   ├── globals.css         # Tailwind imports
│   ├── (auth)/             # Auth routes group
│   │   ├── signin/
│   │   │   └── page.tsx
│   │   └── error/
│   │       └── page.tsx
│   ├── (protected)/        # Protected routes group
│   │   ├── layout.tsx      # Auth check wrapper
│   │   ├── dashboard/
│   │   │   └── page.tsx
│   │   ├── family/
│   │   │   ├── new/
│   │   │   │   └── page.tsx
│   │   │   └── [id]/
│   │   │       └── page.tsx
│   │   ├── tasks/
│   │   │   ├── page.tsx
│   │   │   ├── new/
│   │   │   │   └── page.tsx
│   │   │   └── [id]/
│   │   │       └── page.tsx
│   │   └── settings/
│   │       └── page.tsx
│   └── api/
│       ├── auth/
│       │   └── [...nextauth]/
│       │       └── route.ts
│       ├── families/
│       │   ├── route.ts
│       │   └── [id]/
│       │       ├── route.ts
│       │       └── members/
│       │           └── route.ts
│       └── tasks/
│           ├── route.ts
│           └── [id]/
│               ├── route.ts
│               └── complete/
│                   └── route.ts
├── components/
│   ├── ui/                 # shadcn/ui components
│   ├── auth/
│   │   ├── SignInButton.tsx
│   │   └── UserMenu.tsx
│   ├── tasks/
│   │   ├── TaskCard.tsx
│   │   ├── TaskList.tsx
│   │   └── TaskForm.tsx
│   └── families/
│       └── FamilyMemberList.tsx
├── lib/
│   ├── db/
│   │   ├── schema.ts       # Drizzle schema
│   │   └── client.ts       # DB client
│   ├── auth.ts             # NextAuth config
│   └── utils.ts            # Utility functions
├── public/
│   └── images/             # Static assets
├── .env.local              # Local env vars (gitignored)
├── .env.example            # Env var template
├── drizzle.config.ts       # Drizzle ORM config
├── next.config.mjs         # Next.js config
├── tailwind.config.ts      # Tailwind config
├── tsconfig.json           # TypeScript config
├── package.json
└── README.md
```

---

## 🛠️ Step 3: Install Dependencies

Navigate to the project:

```bash
cd familyos
```

### Core Dependencies

```bash
npm install next-auth@beta drizzle-orm @vercel/postgres
npm install -D drizzle-kit
```

**Justifications:**
- `next-auth@beta` (v5): Google OAuth, Vercel-compatible
- `drizzle-orm`: Type-safe ORM, serverless-friendly
- `@vercel/postgres`: Vercel Postgres client (if using Vercel DB)
- `drizzle-kit`: CLI for migrations

**Bundle Impact:**
- `next-auth`: ~50KB gzipped
- `drizzle-orm`: ~15KB gzipped
- Total added: ~65KB (acceptable)

### Optional: UI Components (shadcn/ui)

```bash
npx shadcn@latest init
```

**Configuration prompts:**
```
✔ Which style would you like to use? › Default
✔ Which color would you like to use as base color? › Slate
✔ Would you like to use CSS variables for colors? › Yes
```

**Install specific components:**
```bash
npx shadcn@latest add button card checkbox input select badge avatar
```

**Bundle Impact:** ~30KB gzipped (only components you use are bundled)

---

## 🔐 Step 4: Environment Variables

Create `.env.local`:

```bash
# Google OAuth (from Google Cloud Console)
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-secret-here

# NextAuth (generate with: openssl rand -base64 32)
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-random-32-char-secret

# Database (Vercel Postgres or Supabase)
POSTGRES_URL=postgres://user:password@host:port/database
```

Create `.env.example` (committed to git):

```bash
# Google OAuth
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=

# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=

# Database
POSTGRES_URL=
```

**Add to `.gitignore`:**
```
.env*.local
```

---

## 🗄️ Step 5: Database Setup

### Option A: Vercel Postgres

1. **Create database in Vercel dashboard:**
   - Go to Vercel project → Storage → Create Database → Postgres
   - Copy connection string

2. **Add to `.env.local`:**
   ```bash
   POSTGRES_URL=postgres://...
   ```

### Option B: Supabase

1. **Create project at supabase.com**
2. **Get connection string:**
   - Settings → Database → Connection string → Nodejs
3. **Add to `.env.local`:**
   ```bash
   POSTGRES_URL=postgresql://postgres:[password]@db.[project].supabase.co:5432/postgres
   ```

### Configure Drizzle

Create `drizzle.config.ts`:

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

---

## 🏗️ Step 6: Verify Build

Before writing any application code, verify the setup:

```bash
npm run build
```

**Expected output:**
```
✓ Compiled successfully
✓ Linting and checking validity of types
✓ Collecting page data
✓ Generating static pages (5/5)
✓ Finalizing page optimization

Route (app)                              Size     First Load JS
┌ ○ /                                    1.2 kB         85 kB
└ ○ /_not-found                          871 B          82 kB
```

**If build fails:**
- Check TypeScript errors: `npm run typecheck`
- Check ESLint errors: `npm run lint`
- Check env vars are set (use fallbacks in code)

---

## 🚀 Step 7: Local Development

Start dev server:

```bash
npm run dev
```

**Expected output:**
```
▲ Next.js 15.x.x
- Local:        http://localhost:3000
- Environments: .env.local

✓ Ready in 2.5s
```

**Visit:** http://localhost:3000

**Expected:** Default Next.js landing page (will be replaced)

---

## 🔒 Step 8: Configure Google OAuth

### Create OAuth Client

1. **Go to Google Cloud Console:** console.cloud.google.com
2. **APIs & Services → Credentials → Create Credentials → OAuth client ID**
3. **Application type:** Web application
4. **Name:** FamilyOS (Local Dev)
5. **Authorized redirect URIs:**
   ```
   http://localhost:3000/api/auth/callback/google
   ```
6. **Create** → Copy Client ID and Secret
7. **Add to `.env.local`**

### Configure OAuth Consent Screen

1. **OAuth consent screen → External** (for testing)
2. **App name:** FamilyOS
3. **User support email:** your-email@gmail.com
4. **Scopes:** `email`, `profile` (default)
5. **Test users:** Add your email for testing
6. **Save**

**Note:** For production, create a separate OAuth client with production redirect URI.

---

## 📋 Step 9: Verification Checklist

Before proceeding to implementation, verify:

- ✅ `npm run dev` starts without errors
- ✅ `npm run build` succeeds with zero errors
- ✅ `http://localhost:3000` loads (default Next.js page)
- ✅ `.env.local` has all required vars
- ✅ `.env.example` is committed to git
- ✅ `.env.local` is gitignored
- ✅ Google OAuth client created and credentials added
- ✅ Database created (Vercel Postgres or Supabase)
- ✅ `POSTGRES_URL` is valid (test connection if possible)
- ✅ TypeScript, ESLint, Tailwind all configured

---

## 🛑 STOP — Ready for Implementation

**Do NOT proceed to writing application code until:**

1. ✅ This setup is complete
2. ✅ Build verification passes
3. ✅ User approves proceeding to implementation

**Next Steps (After Approval):**
1. Implement NextAuth.js configuration
2. Create database schema (Drizzle)
3. Run migrations
4. Build landing page
5. Build auth flow
6. ... (see HANDOFF_PROMPT.md for full build order)

---

## 🚨 Common Setup Issues

### Issue: `npm run build` fails with "Module not found"

**Solution:**
```bash
rm -rf node_modules package-lock.json
npm install
npm run build
```

### Issue: Database connection fails

**Solution:**
- Verify `POSTGRES_URL` is correct
- Check database is running (Vercel dashboard or Supabase)
- Test connection: `psql $POSTGRES_URL` (if psql installed)

### Issue: Google OAuth redirect fails

**Solution:**
- Verify redirect URI in Google Console matches exactly:
  - Dev: `http://localhost:3000/api/auth/callback/google`
  - Prod: `https://familyos.vercel.app/api/auth/callback/google`
- Check `NEXTAUTH_URL` in `.env.local` matches current environment

### Issue: TypeScript errors in node_modules

**Solution:**
```bash
npm install -D @types/node@latest
```

---

**Status:** Setup complete — ready for handoff to implementation phase.
