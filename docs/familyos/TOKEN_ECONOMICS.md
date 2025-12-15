# Token Economics
## FamilyOS — Managing Claude Code Context & Costs

**Version:** 1.0
**Status:** Active Guidelines
**Last Updated:** 2025-12-14

---

## 🎯 Token Budget Philosophy

Claude Code operates with a **200,000 token budget** per session. Once exhausted, the conversation summarizes and continues with a fresh context window.

**Goals:**
1. Complete FamilyOS MVP within a single session (or minimize context resets)
2. Prioritize reading only files that are actively being edited
3. Use Task agents for exploration to offload context usage
4. Avoid reading large generated files (lock files, build outputs)

**Failure Mode:** Reading unnecessary files, outputting large tool results, or exploring without purpose wastes tokens and risks mid-task context loss.

---

## 📊 Token Cost Estimates

### High-Cost Operations (Avoid Unless Necessary)

| Operation | Estimated Tokens | When Justified |
|-----------|------------------|----------------|
| Read `package-lock.json` or `pnpm-lock.yaml` | 20,000+ | Only for debugging dependency conflicts |
| Read `.next/` build output | 10,000+ | Never — build outputs are generated |
| Grep entire codebase with no filters | 5,000+ | Only if Task agent is unavailable |
| Output full file contents >500 lines | 2,000+ | Only if explicitly requested by user |
| Read all components before editing one | 3,000+ | Only read the file you're editing |

### Medium-Cost Operations (Use Sparingly)

| Operation | Estimated Tokens | Best Practice |
|-----------|------------------|---------------|
| Read a 300-line component file | 1,500 | Read only when editing or debugging |
| Grep with broad pattern (e.g., "function") | 1,000 | Add filters: `--glob '*.ts'` or `-i` |
| Read multiple API routes | 2,000 | Use Task agent to summarize first |
| Output README or docs >200 lines | 800 | Summarize before full read |

### Low-Cost Operations (Preferred)

| Operation | Estimated Tokens | Guidance |
|-----------|------------------|----------|
| Use Task agent for exploration | 500-1,000 | Offloads context to subprocess |
| Glob for specific files | 100 | Fast, minimal output |
| Grep with specific pattern + filters | 300 | Targeted search |
| Read <100 line files | 400 | Safe for most edits |
| Write/Edit operations | 200-500 | Only costs the delta |

---

## 🛠️ Token-Saving Strategies

### 1. Use Task Agents for Exploration

**Instead of:**
```
Read all files in src/components/
Grep for "export" across entire codebase
Read package.json, tsconfig.json, tailwind.config.js
```

**Do this:**
```
Task agent (Explore): "Find all components that use useState"
Task agent (Explore): "Summarize the project structure"
```

**Savings:** 3,000-5,000 tokens per exploration task

---

### 2. Read Only Files You're Editing

**Instead of:**
```
Read TaskCard.tsx
Read TaskList.tsx
Read TaskDetail.tsx
... then edit only TaskCard.tsx
```

**Do this:**
```
Read TaskCard.tsx
Edit TaskCard.tsx
```

**Savings:** 2,000+ tokens per avoided read

---

### 3. Avoid Reading Generated Files

**Never read (unless debugging):**
- `package-lock.json`, `pnpm-lock.yaml`, `yarn.lock`
- `.next/`, `dist/`, `build/`
- `node_modules/` (obviously)
- Generated types from Drizzle or Prisma

**Exception:** If a build fails due to a dependency conflict, THEN read lock file.

**Savings:** 10,000-30,000 tokens per session

---

### 4. Use Grep Filters

**Instead of:**
```
Grep "function" across entire repo
```

**Do this:**
```
Grep "function" --glob "src/**/*.tsx" --output_mode "files_with_matches"
```

**Savings:** 2,000-4,000 tokens per search

---

### 5. Summarize Before Reading Long Files

**Instead of:**
```
Read SPEC.md (1,000 lines)
```

**Do this:**
```
Task agent: "Summarize SPEC.md — what are the key routes and data models?"
... then read only if you need to edit it
```

**Savings:** 1,500+ tokens per long file

---

### 6. Output Control

**Avoid:**
- Outputting full file contents in responses to user
- Copying code blocks >50 lines in chat
- Explaining every line of a file

**Do instead:**
- Reference files by path: `src/components/TaskCard.tsx:42`
- Say "I've updated TaskCard.tsx" instead of showing the full file
- Link to files instead of quoting them

**Savings:** 1,000-2,000 tokens per response

---

## 📋 Token Checkpoints (Monitor Usage)

### Checkpoint 1: After Scaffolding (Target: <10,000 tokens)
- Created repo structure
- Installed dependencies
- Read package.json, tsconfig.json (necessary)
- Token budget remaining: ~190,000

### Checkpoint 2: After Auth Implementation (Target: <30,000 tokens)
- Read NextAuth.js docs (via WebFetch)
- Read/wrote auth route
- Read/wrote sign-in page
- Token budget remaining: ~170,000

### Checkpoint 3: After Data Model (Target: <50,000 tokens)
- Read Drizzle docs (via WebFetch)
- Wrote schema files
- Ran migrations
- Token budget remaining: ~150,000

### Checkpoint 4: After UI Components (Target: <80,000 tokens)
- Read/wrote 5-10 component files
- Read shadcn/ui docs (via WebFetch)
- Wrote Tailwind config
- Token budget remaining: ~120,000

### Checkpoint 5: After Task Logic (Target: <110,000 tokens)
- Read/wrote API routes
- Read/wrote task pages
- Tested locally
- Token budget remaining: ~90,000

### Checkpoint 6: After Deployment (Target: <140,000 tokens)
- Read Vercel docs (via WebFetch)
- Fixed build errors
- Deployed to Vercel
- Token budget remaining: ~60,000

**Buffer:** 60,000 tokens reserved for debugging, user requests, and iteration.

---

## 🚨 Warning Signs (Context Exhaustion)

If you observe these, STOP and summarize:

1. **Token usage >180,000** — only 20,000 left (risky)
2. **Reading files you've already read** — inefficient
3. **User asks "can you read X again?"** — context was lost
4. **Slow responses** — model is processing large context
5. **Repeated questions about same code** — context degradation

**Action:** Use `Task agent` to offload remaining work, or ask user to continue in a new session with a handoff prompt.

---

## 🎓 Best Practices Summary

1. ✅ **Use Task agents** for exploration, not direct reads
2. ✅ **Read only files you're editing**
3. ✅ **Avoid generated files** (lock files, build outputs)
4. ✅ **Use Grep filters** (glob, type, output_mode)
5. ✅ **Summarize long files** before reading
6. ✅ **Output references, not full code** in responses
7. ✅ **Monitor token usage** at checkpoints
8. ✅ **Stop and handoff** if nearing 180,000 tokens

---

## 📈 Expected Token Breakdown (FamilyOS MVP)

| Phase | Estimated Tokens | Cumulative |
|-------|------------------|------------|
| Planning & Setup | 5,000 | 5,000 |
| Scaffolding & Dependencies | 5,000 | 10,000 |
| Auth Implementation | 15,000 | 25,000 |
| Data Model & ORM | 20,000 | 45,000 |
| UI Components (10 files) | 25,000 | 70,000 |
| API Routes (8 routes) | 20,000 | 90,000 |
| Pages (6 pages) | 20,000 | 110,000 |
| Testing & Debugging | 15,000 | 125,000 |
| Deployment & Fixes | 15,000 | 140,000 |
| **Buffer** | 60,000 | 200,000 |

**Target:** Complete MVP with 60,000 token buffer for iteration and user changes.

---

## 🔄 Context Reset Strategy (If Needed)

If token budget is exhausted mid-project:

1. **Generate handoff prompt** with:
   - Current status (what's done, what's pending)
   - File structure summary
   - Remaining tasks (from TodoWrite)
   - Key decisions made

2. **User starts new session** with handoff prompt

3. **New session continues** from checkpoint

**Goal:** Avoid context resets by following token economics above.

---

**Status:** Active — monitor token usage throughout FamilyOS development.
