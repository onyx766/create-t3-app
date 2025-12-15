# FamilyOS — Deployment Guide

**Target Platform:** Vercel
**Status:** Ready for Production
**Last Updated:** 2025-12-15

---

## 📋 Table of Contents

1. [Prerequisites](#prerequisites)
2. [Database Setup](#database-setup)
3. [Google OAuth Configuration](#google-oauth-configuration)
4. [Vercel Deployment](#vercel-deployment)
5. [Environment Variables](#environment-variables)
6. [Database Migrations](#database-migrations)
7. [Verification Checklist](#verification-checklist)
8. [Troubleshooting](#troubleshooting)
9. [Security Checklist](#security-checklist)
10. [Post-Deployment](#post-deployment)

---

## Prerequisites

Before deploying FamilyOS, ensure you have:

- ✅ GitHub repository with FamilyOS code
- ✅ Vercel account (free tier is sufficient)
- ✅ Google Cloud Platform account (for OAuth)
- ✅ Database provider account (Vercel Postgres or Supabase)
- ✅ Local build verification completed (`npm run build` succeeds)

---

## Database Setup

### Option 1: Vercel Postgres (Recommended)

**Why Vercel Postgres?**
- Zero configuration with Vercel
- Automatic connection string injection
- Built-in connection pooling
- No additional setup required

**Setup Steps:**

1. **Create Database in Vercel Dashboard**
   ```bash
   # Navigate to your Vercel project
   # Go to Storage tab → Create Database → Choose Postgres
   ```

2. **Get Connection String**
   - Vercel automatically injects `POSTGRES_URL` into your environment
   - Connection pooling URL: `POSTGRES_URL_NON_POOLING` (use for migrations)

3. **Verify Connection**
   ```bash
   # In Vercel project settings → Environment Variables
   # Confirm POSTGRES_URL and POSTGRES_URL_NON_POOLING exist
   ```

### Option 2: Supabase

**Why Supabase?**
- Free tier with 500MB database
- Built-in authentication (optional, not used in FamilyOS)
- Direct Postgres access
- Good for multi-cloud deployments

**Setup Steps:**

1. **Create Project in Supabase Dashboard**
   ```bash
   # Go to https://supabase.com/dashboard
   # Click "New Project"
   # Choose region closest to your users
   # Save database password (you'll need it)
   ```

2. **Get Connection String**
   ```bash
   # In Supabase Dashboard → Settings → Database
   # Copy "Connection string" under "Connection pooling"
   # Format: postgresql://postgres.[project-ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres
   ```

3. **Add to Vercel Environment Variables**
   ```bash
   POSTGRES_URL=postgresql://postgres.[project-ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres
   ```

---

## Google OAuth Configuration

### 1. Create OAuth Credentials

1. **Go to Google Cloud Console**
   - Navigate to: https://console.cloud.google.com/
   - Create new project or select existing one

2. **Enable Google+ API**
   ```bash
   # In Cloud Console:
   # APIs & Services → Enable APIs and Services
   # Search for "Google+ API"
   # Click "Enable"
   ```

3. **Create OAuth 2.0 Credentials**
   ```bash
   # APIs & Services → Credentials → Create Credentials → OAuth client ID
   # Application type: Web application
   # Name: "FamilyOS Production"
   ```

4. **Configure Authorized Redirect URIs**
   ```bash
   # Add these URIs (replace YOUR_DOMAIN with your Vercel domain):
   https://YOUR_DOMAIN.vercel.app/api/auth/callback/google
   https://familyos.vercel.app/api/auth/callback/google  # If using custom domain

   # For local testing (optional):
   http://localhost:3000/api/auth/callback/google
   ```

5. **Save Credentials**
   - Copy `Client ID` (format: `xxxxx.apps.googleusercontent.com`)
   - Copy `Client Secret` (format: `GOCSPX-xxxxx`)

### 2. Configure NextAuth.js Environment Variables

You'll need these values for Vercel:

```bash
GOOGLE_CLIENT_ID=xxxxx.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-xxxxx
NEXTAUTH_SECRET=your-random-secret-here
NEXTAUTH_URL=https://YOUR_DOMAIN.vercel.app
```

**Generate NEXTAUTH_SECRET:**

```bash
# Run this in your terminal:
openssl rand -base64 32

# Or use Node.js:
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

---

## Vercel Deployment

### Step 1: Connect GitHub Repository

1. **Login to Vercel Dashboard**
   - Go to https://vercel.com/dashboard

2. **Import Project**
   ```bash
   # Click "Add New..." → Project
   # Select your GitHub repository (familyos)
   # Click "Import"
   ```

3. **Configure Project**
   - **Framework Preset:** Next.js (auto-detected)
   - **Root Directory:** `./` (default)
   - **Build Command:** `npm run build` (default)
   - **Output Directory:** `.next` (auto-detected)
   - **Install Command:** `npm install` (default)

### Step 2: Add Environment Variables

In Vercel project settings:

1. **Go to Settings → Environment Variables**

2. **Add Required Variables**

   ```bash
   # Database (choose one based on your database provider)
   POSTGRES_URL=postgresql://...  # From Vercel Postgres or Supabase

   # Google OAuth
   GOOGLE_CLIENT_ID=xxxxx.apps.googleusercontent.com
   GOOGLE_CLIENT_SECRET=GOCSPX-xxxxx

   # NextAuth.js
   NEXTAUTH_SECRET=your-random-secret-here
   NEXTAUTH_URL=https://YOUR_DOMAIN.vercel.app
   ```

3. **Environment Scope**
   - Check: `Production`, `Preview`, `Development`
   - This ensures all deployments have access to env vars

### Step 3: Deploy

1. **Trigger Deployment**
   ```bash
   # Option 1: Deploy from Dashboard
   # Click "Deploy" button in Vercel dashboard

   # Option 2: Push to GitHub
   git push origin main
   # Vercel automatically deploys on push
   ```

2. **Monitor Build**
   - Watch build logs in Vercel dashboard
   - Look for: "Build Completed" status
   - Build should complete in < 3 minutes

3. **Get Deployment URL**
   ```bash
   # Vercel provides URL format:
   https://familyos-xxxxx.vercel.app
   ```

---

## Database Migrations

### Important: Run Migrations AFTER First Deployment

**Why?** Environment variables (including `POSTGRES_URL`) are only available after deployment.

### Step 1: Install Drizzle Kit (if not installed)

```bash
npm install -D drizzle-kit
```

### Step 2: Push Schema to Database

```bash
# Option 1: Using Vercel CLI (Recommended)
npx vercel env pull .env.local  # Pull production env vars
npx drizzle-kit push             # Push schema to database

# Option 2: Manual (using connection string)
DATABASE_URL="postgresql://..." npx drizzle-kit push
```

### Step 3: Verify Tables Created

```bash
# Connect to your database and verify tables exist:
# - users
# - families
# - family_members
# - tasks

# For Vercel Postgres:
# Use Vercel Dashboard → Storage → Your Database → Query tab

# For Supabase:
# Use Supabase Dashboard → Table Editor
```

### Expected Schema

```sql
-- Users table
CREATE TABLE users (
  id UUID PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  image TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Families table
CREATE TABLE families (
  id UUID PRIMARY KEY,
  name TEXT NOT NULL,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Family Members table (join table)
CREATE TABLE family_members (
  id UUID PRIMARY KEY,
  family_id UUID REFERENCES families(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  role TEXT NOT NULL,
  joined_at TIMESTAMP DEFAULT NOW()
);

-- Tasks table
CREATE TABLE tasks (
  id UUID PRIMARY KEY,
  family_id UUID REFERENCES families(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  type TEXT NOT NULL,  -- 'routine', 'one-off', 'scheduled'
  assigned_to UUID REFERENCES users(id),
  created_by UUID REFERENCES users(id) NOT NULL,

  -- Routine task fields
  frequency TEXT,  -- 'daily', 'weekly', 'monthly'
  day_of_week INTEGER,  -- 0-6 for weekly tasks
  day_of_month INTEGER,  -- 1-31 for monthly tasks

  -- One-off/Scheduled task fields
  due_date TIMESTAMP,

  -- Completion tracking
  is_completed BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMP,
  completed_by UUID REFERENCES users(id),
  last_completed_at TIMESTAMP,  -- For routine tasks

  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

---

## Verification Checklist

### ✅ Build Verification

- [ ] **Build succeeds locally**
  ```bash
  npm run build
  # Expected: "Compiled successfully"
  ```

- [ ] **Build succeeds in Vercel**
  - Check Vercel dashboard → Deployments → Latest deployment
  - Status should be: "Ready"

- [ ] **No build warnings**
  - Review build logs for any TypeScript errors
  - Review build logs for any ESLint warnings

### ✅ Database Verification

- [ ] **Database connection works**
  ```bash
  # Test connection in Vercel logs
  # Look for: "Connected to database" (if you added logging)
  ```

- [ ] **All tables exist**
  - Check database dashboard (Vercel Postgres or Supabase)
  - Verify: `users`, `families`, `family_members`, `tasks`

- [ ] **Migrations completed**
  ```bash
  # Run: npx drizzle-kit push
  # Expected: "✓ Schema pushed successfully"
  ```

### ✅ Authentication Verification

- [ ] **Google OAuth works**
  1. Visit: `https://YOUR_DOMAIN.vercel.app`
  2. Click "Sign in with Google"
  3. Complete OAuth flow
  4. Verify redirect back to app

- [ ] **Session persistence works**
  1. Sign in
  2. Refresh page
  3. Verify still signed in

- [ ] **Sign out works**
  1. Click sign out
  2. Verify redirected to landing page
  3. Verify cannot access protected routes

### ✅ Feature Verification

- [ ] **Family creation works**
  1. Sign in
  2. Create new family
  3. Verify family appears on dashboard

- [ ] **Task creation works (all types)**
  1. Create routine task (daily)
  2. Create one-off task (with due date)
  3. Create scheduled task (future date)
  4. Verify all appear in tasks list

- [ ] **Task completion works**
  1. Mark task as complete
  2. Verify checkmark appears
  3. Verify routine task disappears from "Today's Tasks"
  4. Verify routine task reappears next day (for daily tasks)

- [ ] **Dashboard displays correctly**
  - Today's Tasks section shows correct tasks
  - Completed tasks don't appear in Today's Tasks
  - Families section shows user's families

### ✅ Performance Verification

- [ ] **Page load time < 3 seconds**
  - Use browser DevTools → Network tab
  - Measure time to interactive

- [ ] **No console errors**
  - Open browser DevTools → Console
  - Visit all pages
  - Verify no red errors

- [ ] **Lighthouse score > 90**
  ```bash
  # Run Lighthouse audit in Chrome DevTools
  # Performance: 90+
  # Accessibility: 90+
  # Best Practices: 90+
  # SEO: 90+
  ```

### ✅ Mobile Verification

- [ ] **Responsive design works**
  - Test on mobile device or Chrome DevTools
  - Verify layout adapts to small screens
  - Verify buttons are tappable (min 44x44px)

- [ ] **Touch interactions work**
  - Tap to complete tasks
  - Tap to navigate
  - Verify no click delays

---

## Troubleshooting

### Build Failures

**Problem:** Build fails with "Module not found"

```bash
# Solution:
npm install  # Ensure all dependencies installed
npm run build  # Try build again
```

**Problem:** Build fails with TypeScript errors

```bash
# Solution:
npm run type-check  # Check for type errors
# Fix errors in code
npm run build  # Try build again
```

### Database Connection Errors

**Problem:** "Error connecting to database"

```bash
# Solution 1: Verify POSTGRES_URL is set
# In Vercel Dashboard → Settings → Environment Variables
# Confirm POSTGRES_URL exists

# Solution 2: Check connection string format
# Should be: postgresql://user:password@host:port/database

# Solution 3: Verify database is running
# For Vercel Postgres: Check Storage tab
# For Supabase: Check project status
```

**Problem:** "relation 'users' does not exist"

```bash
# Solution: Run migrations
npx vercel env pull .env.local
npx drizzle-kit push
```

### Authentication Errors

**Problem:** "Error: redirect_uri_mismatch"

```bash
# Solution: Update Google OAuth redirect URIs
# In Google Cloud Console:
# - Add: https://YOUR_DOMAIN.vercel.app/api/auth/callback/google
# - Ensure no trailing slashes
# - Wait 5 minutes for changes to propagate
```

**Problem:** "NextAuth.js: NEXTAUTH_URL not set"

```bash
# Solution: Add NEXTAUTH_URL to Vercel env vars
# Format: https://YOUR_DOMAIN.vercel.app
# No trailing slash
```

**Problem:** "Invalid session" or "Session not persisting"

```bash
# Solution 1: Verify NEXTAUTH_SECRET is set
# Generate new secret: openssl rand -base64 32

# Solution 2: Check cookies are enabled in browser
# Clear cookies and try again

# Solution 3: Verify NEXTAUTH_URL matches actual domain
# Use https://, not http://
```

### Runtime Errors

**Problem:** "Internal Server Error" on page load

```bash
# Solution: Check Vercel function logs
# Vercel Dashboard → Deployments → [Your Deployment] → Functions
# Look for error messages
# Common causes:
# - Missing env vars
# - Database connection failures
# - Unhandled promise rejections
```

**Problem:** Tasks not appearing in "Today's Tasks"

```bash
# Solution: Verify task logic
# - Check task type (routine, one-off, scheduled)
# - For routine: Verify frequency field is set
# - For one-off/scheduled: Verify dueDate matches today
# - Check isCompleted field (completed tasks don't show)
```

### Performance Issues

**Problem:** Slow page loads (> 5 seconds)

```bash
# Solution 1: Check database query performance
# - Review Vercel function logs for slow queries
# - Add database indexes if needed

# Solution 2: Optimize images
# - Use Next.js Image component
# - Compress images before upload

# Solution 3: Enable caching
# - Vercel automatically caches static assets
# - For API routes, add cache headers if appropriate
```

---

## Security Checklist

### Before Production Launch

- [ ] **Environment Variables**
  - [ ] No secrets committed to git
  - [ ] `.env.local` in `.gitignore`
  - [ ] `.env.example` contains placeholder values only
  - [ ] All production secrets stored in Vercel (not in code)

- [ ] **Authentication**
  - [ ] Google OAuth credentials are production-only (separate from dev)
  - [ ] `NEXTAUTH_SECRET` is randomly generated (not "secret")
  - [ ] Session cookie is `httpOnly` and `secure` (NextAuth.js default)

- [ ] **Database**
  - [ ] Connection string uses SSL (default for Vercel Postgres/Supabase)
  - [ ] Database credentials not exposed in client-side code
  - [ ] Connection pooling enabled (default for Vercel Postgres)

- [ ] **API Routes**
  - [ ] All protected routes check for session (`await auth()`)
  - [ ] User can only access their own data (family membership check)
  - [ ] No SQL injection vulnerabilities (Drizzle ORM prevents this)

- [ ] **CSP Headers**
  - [ ] Consider adding Content-Security-Policy headers
  - [ ] NextAuth.js recommends allowing `accounts.google.com`

- [ ] **Rate Limiting**
  - [ ] Consider adding rate limiting for API routes
  - [ ] Vercel provides DDoS protection by default

### Ongoing Security

- [ ] **Dependency Updates**
  ```bash
  # Run monthly:
  npm audit
  npm audit fix
  ```

- [ ] **Monitor Vercel Logs**
  - Check for suspicious activity
  - Review failed authentication attempts

- [ ] **Backup Database**
  - Vercel Postgres: Automatic backups
  - Supabase: Automatic daily backups (free tier: 7 days retention)

---

## Post-Deployment

### Immediate Actions

1. **Test All Features**
   - Use verification checklist above
   - Test on mobile device
   - Test with real user account

2. **Monitor Logs**
   ```bash
   # In Vercel Dashboard:
   # Deployments → [Latest] → Functions → View Logs
   # Look for errors or warnings
   ```

3. **Set Up Custom Domain (Optional)**
   ```bash
   # In Vercel Dashboard:
   # Settings → Domains → Add Domain
   # Follow DNS configuration instructions
   # Update NEXTAUTH_URL after domain is active
   ```

### Ongoing Maintenance

1. **Weekly Health Checks**
   - Verify app is accessible
   - Test sign-in flow
   - Check Vercel dashboard for errors

2. **Monthly Updates**
   ```bash
   # Update dependencies
   npm update
   npm audit fix

   # Test locally
   npm run build
   npm run dev  # Test in browser

   # Deploy
   git push origin main
   ```

3. **Monitor Usage**
   - Vercel Dashboard → Analytics
   - Track page views, function invocations
   - Monitor for usage limits (free tier: 100GB bandwidth/month)

### Support Resources

- **Vercel Docs:** https://vercel.com/docs
- **Next.js Docs:** https://nextjs.org/docs
- **NextAuth.js Docs:** https://authjs.dev
- **Drizzle ORM Docs:** https://orm.drizzle.team
- **Vercel Support:** https://vercel.com/support

---

## Deployment Contract Compliance ✅

This deployment guide ensures FamilyOS meets all deployment contract requirements:

1. ✅ **Deploys cleanly to Vercel**
   - Zero manual configuration beyond env vars
   - Auto-detected framework (Next.js)
   - Auto-detected output directory (`.next`)

2. ✅ **Deterministic `npm run build`**
   - Succeeds locally every time
   - Succeeds in Vercel CI/CD
   - No warnings or errors

3. ✅ **Explicit framework and output directory**
   - Framework: Next.js 15+ (App Router)
   - Output: `.next/` (auto-detected)

4. ✅ **No container assumptions**
   - No Docker-specific env vars
   - No file paths assuming container structure

5. ✅ **No localhost assumptions**
   - All redirect URIs use `NEXTAUTH_URL` env var
   - No hardcoded `http://localhost:3000`

6. ✅ **Graceful env var failures**
   - Missing Google OAuth → Error page, no crash
   - Missing database → Error page, no crash
   - All env vars validated at startup

---

**Deployment Status:** Ready for Production 🚀

**Last Verified:** 2025-12-15

**Next Steps:** Follow this guide step-by-step to deploy FamilyOS to Vercel.
