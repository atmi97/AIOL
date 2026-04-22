# AIOL Platform — Agent Reference Book

This document is the single source of truth for any AI agent (or human) working
on this codebase. Read it before touching anything.

---

## 1. Why this exists

3sHealth's AMS division is launching an **AI Operator Licence (AIOL)** internal
training program. The target is ~50 staff across 3sHealth and AMS. The
long-term home is Oracle LMS, but no LMS licence exists yet.

This platform is the **interim home** that lets the program team:
- Publish and iterate on training content
- Run graded quizzes with attempt limits and time limits
- Track per-learner progress

When the LMS is ready, content exports to SCORM/xAPI. Nothing is locked in.

### Guiding principles
1. **MVP-first** — Tier 1 only. Prove the loop before scaling.
2. **Fewer services** — Single Next.js app, single SQLite/Postgres DB, one
   deploy. No separate CMS, no separate API.
3. **Two editing paths** — developers edit content files in git; the program
   team edits via the admin UI. Both paths update the same DB; neither silently
   overwrites the other.
4. **Canadian data residency** — Azure Container Apps + Postgres in Canada
   Central. Auth via Microsoft Entra (same tenant as 3sHealth/AMS).
5. **Portable content** — modules are plain MDX, quiz bank is JSON. A third
   party can read them without this app. xAPI statements are emitted on every
   event for future LRS ingest.

---

## 2. Tech stack

| Layer | Choice | Why |
|---|---|---|
| Framework | Next.js 15 (App Router) + React 19 + TypeScript | Single codebase for UI + API + auth; server components simplify data fetching |
| Auth | Auth.js v5 (`next-auth@beta`) + `@auth/prisma-adapter` | Handles Entra, magic-link, and session management without custom code |
| DB ORM | Prisma 6 | Schema-as-code, migrations, type-safe queries |
| DB (MVP) | SQLite (single file, zero ops) | No external service for the pilot |
| DB (prod) | Azure Postgres Flexible Server, Canada Central | Change one line in `prisma/schema.prisma` |
| Content format | MDX (modules) + JSON (quiz bank) | Human-readable, git-diffable, convertible to SCORM |
| Validation | Zod schemas in `lib/schemas.ts` | Shared between runtime content loading and the `validate-content` CLI |
| Styling | Tailwind CSS 3 | Utility-first; custom brand palette defined in `tailwind.config.ts` |
| Hosting | Azure Container Apps (Canada Central) | Same Azure tenant as Entra; `az containerapp up`-style deploy |

---

## 3. Repository layout

```
/
├── app/                          Next.js App Router
│   ├── page.tsx                  Landing page (calls seedIfEmpty on load)
│   ├── layout.tsx                Root layout (fonts, SiteHeader)
│   ├── globals.css               Tailwind base + prose-aiol typography
│   ├── signin/                   Sign-in page (Entra + magic link + dev-login)
│   ├── program/                  Program overview page (renders program.mdx)
│   ├── tier/[tier]/              Learner tier dashboard
│   ├── module/[slug]/            MDX module viewer + "Mark complete"
│   ├── quiz/[slug]/              Quiz start page (checks attempt eligibility)
│   ├── quiz/[slug]/attempt/[id]/ Quiz runner (countdown timer, one screen)
│   ├── quiz/[slug]/attempt/[id]/result/  Score + pass/fail result
│   ├── me/                       Learner progress dashboard
│   ├── admin/                    Admin shell (layout with tab nav)
│   │   ├── page.tsx              Learners table + CSV export
│   │   ├── content/              Module list
│   │   ├── content/[moduleId]/   Module editor (metadata + MDX + preview)
│   │   ├── quizzes/              Quiz list
│   │   ├── quizzes/[quizId]/     Quiz settings + per-question editor
│   │   └── sync/                 Import from repo / Export to repo
│   └── api/
│       ├── auth/[...nextauth]/   Auth.js route handler
│       ├── admin/export/         CSV export endpoint
│       └── health/               Health check (used by Docker HEALTHCHECK)
│
├── components/
│   ├── attempt-form.tsx          Client component: countdown timer + quiz form
│   └── site-header.tsx           Top nav (tier links, sign out)
│
├── lib/
│   ├── auth.ts                   Auth.js config (providers, callbacks, helpers)
│   ├── auth-handlers.ts          Exported { handlers, auth, signIn, signOut }
│   ├── content.ts                Reads + Zod-validates /content/** at runtime
│   ├── content-sync.ts           importTierFromRepo / exportTierToRepo / seedIfEmpty
│   ├── prisma.ts                 Singleton PrismaClient (prevents hot-reload duplication)
│   ├── quiz.ts                   selectQuestionsForAttempt / startAttempt / submitAttempt
│   ├── schemas.ts                Zod schemas (ModuleFrontmatter, TierMeta, Quiz, Question…)
│   └── xapi.ts                   emitXApi() — writes XApiStatement rows
│
├── content/
│   ├── program.mdx               Program overview copy (landing page)
│   └── tier1/
│       ├── meta.json             Tier metadata + module index
│       ├── module-1.1/index.mdx  Module 1.1 content (frontmatter + MDX body)
│       ├── module-1.2/index.mdx
│       ├── module-1.3/index.mdx
│       ├── module-1.4/index.mdx
│       ├── module-1.5/index.mdx
│       └── quiz-bank.json        60-question quiz bank
│
├── prisma/
│   └── schema.prisma             Data model (see section 5)
│
├── scripts/
│   ├── ingest-content.py         Python: source-docs/ → content/tier1/**
│   ├── seed.ts                   tsx: importTierFromRepo for every tier in /content
│   └── validate-content.ts       tsx: Zod + cross-ref validation (use in CI)
│
├── source-docs/                  Original 3sHealth source files (read-only)
│   ├── 3sHealth-AIOL-Program-Plan-v2.1.docx
│   ├── AIOL-Tier1-Content-Package-v1.docx
│   └── AIOL-Tier1-Quiz-Bank-v1.xlsx
│
├── docker/
│   └── entrypoint.sh             Runs `prisma db push` then starts the app
│
├── deploy/
│   └── azure-deploy.sh           One-shot Azure Container Apps deploy script
│
├── Dockerfile                    Multi-stage build (deps → builder → runner)
├── .env.example                  All env var documentation
├── next.config.ts                output: "standalone" for Docker
├── tailwind.config.ts            Brand palette + prose-aiol plugin
└── tsconfig.json
```

---

## 4. Feature map

### 4.1 Authentication (`lib/auth.ts`)

Three providers, all conditional on env vars:

| Provider | Env trigger | Use case |
|---|---|---|
| `MicrosoftEntraID` | `AUTH_MICROSOFT_ENTRA_ID_ID` set | Production — Entra SSO |
| `Nodemailer` (magic link) | `EMAIL_SERVER_HOST` set | Fallback if Entra fails |
| `Credentials` (dev-login) | `ENABLE_DEV_LOGIN=true` | Local dev — no email/Entra needed |

**Admin promotion**: when a user signs in, if their email matches
`INITIAL_ADMIN_EMAIL`, their `role` is set to `"ADMIN"` automatically. This is
the recommended way to bootstrap the first admin.

Helper functions exported from `lib/auth.ts`:
- `requireUser()` — throws redirect to `/signin` if not logged in
- `requireAdmin()` — throws redirect if not `ADMIN`
- `enabledAuthMethods()` — returns which providers are active (used on the
  sign-in page to show/hide buttons)

### 4.2 Content loading (`lib/content.ts`)

Reads files from `/content/**` at request time (no build-time cache):
- `readTierMeta(tierId)` — parses and Zod-validates `meta.json`
- `readTierModules(tierId)` — parses all `module-*/index.mdx` files (gray-matter
  for frontmatter, Zod for validation)
- `readQuizBank(tierId)` — parses and validates `quiz-bank.json`
- `readProgramOverview()` — reads `program.mdx` for the landing page

These functions are used by `content-sync.ts` for seeding/importing. The app
itself reads from the **DB at runtime** (not from files directly), so the DB is
always the authoritative source.

### 4.3 DB ↔ repo sync (`lib/content-sync.ts`)

Three exported functions:

**`seedIfEmpty()`**
Called from `app/page.tsx` on every load. Checks `prisma.tier.count()`; if
zero, runs `importTierFromRepo("tier1")`. This means a fresh deploy
automatically populates the DB from `/content/**` without any manual step.

**`importTierFromRepo(tierId)`**
Reads `/content/tierId/**`, validates with Zod, then upserts every Tier,
Module, Quiz, and Question row. Idempotent — safe to run repeatedly. Used by
`seedIfEmpty()`, `scripts/seed.ts`, and the admin Sync page.

**`exportTierToRepo(tierId)`**
Reads the DB for a given tier and writes it back out to `/content/tierId/**`
(meta.json, module MDX files, quiz-bank.json). Returns the list of files
written. Used by the admin Sync page so an admin can produce a reviewable git
diff after editing via the UI.

### 4.4 Learner flow

```
/ (landing)
  └─ /tier/tier1 (tier dashboard)
       ├─ /module/module-1.1 (MDX viewer → Mark complete → ModuleProgress row)
       ├─ /module/module-1.2  (unlocks after 1.1 is complete)
       ├─ /module/module-1.3
       ├─ /module/module-1.4
       ├─ /module/module-1.5
       └─ /quiz/t1-final (unlocks when all 5 modules complete)
            └─ /quiz/t1-final/attempt/[attemptId] (quiz runner)
                 └─ /quiz/t1-final/attempt/[attemptId]/result
```

**Sequential unlock**: `app/tier/[tier]/page.tsx` checks that module `i` is
complete before unlocking module `i+1`. The quiz only unlocks after all modules
are complete.

**Mark complete**: server action in `app/module/[slug]/page.tsx` upserts a
`ModuleProgress` row with `completedAt = now()` and emits an xAPI "completed"
statement.

**Quiz runner** (`components/attempt-form.tsx`):
- Client component with a countdown timer (`setInterval`, 1s tick)
- When time expires, auto-submits via `formRef.requestSubmit()`
- Timer bar turns amber at <5 min, red at <1 min

### 4.5 Quiz logic (`lib/quiz.ts`)

**`selectQuestionsForAttempt(quiz, allQuestions)`**
Uses `quiz.moduleDistribution` (a JSON object like `{"1.1":4,"1.2":3,...}`) to
pick exactly N questions per module, then shuffles. For Tier 1: 4+3+5+5+3 = 20
questions from modules 1.1–1.5. Falls back to a flat random selection if no
distribution is set.

**`startAttempt(userId, quizId)`**
1. Checks attempt count against `quiz.maxAttempts` — throws if exhausted
2. Checks for an unexpired in-progress attempt — returns it if found
3. Selects questions, creates a `QuizAttempt` row with `expiresAt =
   now + timeLimitMinutes`

**`submitAttempt(attemptId, responses)`**
1. Validates the attempt exists, belongs to the user, and isn't expired
2. Scores each response with `isCorrect(question, answer)`
3. Calculates `score = correctCount / totalCount`
4. Sets `passed = score >= quiz.passThreshold`
5. Updates the `QuizAttempt` row
6. Emits an xAPI "passed" or "failed" statement

**`isCorrect(question, answer)`**
- `single`: answer array must equal correct array (single element)
- `multi`: answer set must exactly equal correct set
- `trueFalse`: same as single

### 4.6 Admin area (`app/admin/`)

All admin routes are protected by `requireAdmin()` in the layout.

| Route | What it does |
|---|---|
| `/admin` | Table of all users with module completion %, best quiz score, and pass status. CSV export via `/api/admin/export?format=csv` |
| `/admin/content` | List of all modules grouped by tier |
| `/admin/content/[moduleId]` | Edit title, estMinutes, objectives (one per line), and MDX body. Save bumps `version`, writes `ContentEdit` audit row |
| `/admin/quizzes` | List of all quizzes |
| `/admin/quizzes/[quizId]` | Edit quiz settings (passThreshold, maxAttempts, timeLimitMinutes, questionsPerAttempt, shuffle, moduleDistribution JSON). Per-question editor: prompt, type, options (`a) text` format), correct letters, rationale |
| `/admin/sync` | Import from repo (runs `importTierFromRepo`) or Export to repo (runs `exportTierToRepo`) per tier |

**Audit log**: every save in the content or quiz editors writes a `ContentEdit`
row with `entityType`, `entityId`, `editedById`, `editedAt`, and a `diffJson`
containing `{before, after}`.

### 4.7 xAPI statements (`lib/xapi.ts`)

Every meaningful learner event emits a row in `XApiStatement`:

| Verb | Trigger |
|---|---|
| `completed` | Module marked complete |
| `attempted` | Quiz attempt started |
| `passed` | Quiz attempt submitted with score ≥ passThreshold |
| `failed` | Quiz attempt submitted with score < passThreshold |

The rows are stored locally for now. They follow the xAPI statement shape
(actor/verb/object/result) and can be bulk-exported to an LRS (Learning Record
Store) when 3sHealth adopts Oracle LMS.

---

## 5. Data model

All models live in `prisma/schema.prisma`. Key design note: **all arrays are
stored as JSON strings** (e.g. `objectivesJson`, `correctJson`, `optionsJson`)
so the schema is portable to Postgres by changing only the datasource provider.

### Core content hierarchy

```
Tier (tier1)
  └── Module (module-1.1 … module-1.5)
       └── ModuleProgress (one per user per module)
  └── Quiz (t1-final)
       └── Question (q-1 … q-60)
       └── QuizAttempt (one per attempt per user)
```

### Model quick reference

| Model | Key fields | Notes |
|---|---|---|
| `User` | id, email, entraOid, role (LEARNER\|ADMIN) | `entraOid` links to Entra; role is a plain string, not an enum, for SQLite portability |
| `Tier` | id, title, passThreshold, order | `id` is a slug e.g. `"tier1"` |
| `Module` | id, moduleNumber, tierId, order, bodyMdx, objectivesJson, version | `id` = `"module-1.1"`, `moduleNumber` = `"1.1"` |
| `Quiz` | id, tierId, passThreshold, maxAttempts, timeLimitMinutes, questionsPerAttempt, moduleDistribution | `moduleDistribution` is a JSON string `{"1.1":4,...}` |
| `Question` | id, quizId, moduleRef, type, optionsJson, correctJson, order | `type` = single\|multi\|trueFalse |
| `ModuleProgress` | (userId, moduleId) composite PK, completedAt | `completedAt=null` means in-progress |
| `QuizAttempt` | id, userId, quizId, expiresAt, score, passed, questionIds, responsesJson | `questionIds` = JSON array; `responsesJson` = [{questionId, answer, correct}] |
| `ContentEdit` | id, entityType, entityId, diffJson, editedById | Audit log for all admin edits |
| `XApiStatement` | id, userId, verb, objectType, objectId, resultJson | xAPI-shaped for future LRS export |
| `Account`, `Session`, `VerificationToken` | (Auth.js internals) | Managed entirely by Auth.js / Prisma adapter |

---

## 6. Content format

### Module MDX (`content/tier1/module-X.Y/index.mdx`)

```markdown
---
id: module-1.1
moduleNumber: "1.1"
title: "What Is AI?"
tierId: tier1
order: 1
estMinutes: 30
objectives:
  - "Define artificial intelligence in plain language"
  - "..."
requires: []
---

Full MDX body here. Supports headings, callouts, tables, and images.
Images should be externally hosted (no upload UI in MVP).
```

Zod schema: `ModuleFrontmatter` in `lib/schemas.ts`.

### Tier meta (`content/tier1/meta.json`)

```json
{
  "id": "tier1",
  "title": "Tier 1 — AI Awareness",
  "tagline": "...",
  "audience": "All AMS staff",
  "estMinutes": 120,
  "passThreshold": 0.8,
  "renewal": "Annual",
  "philosophy": "Human verify, Human decide, Human accountable.",
  "modules": [
    { "id": "1.1", "slug": "module-1.1", "title": "What Is AI?", "estMinutes": 30, "order": 1 }
  ],
  "appendix": ""
}
```

The `slug` field in `meta.modules[]` must match the MDX frontmatter `id`.

### Quiz bank (`content/tier1/quiz-bank.json`)

```json
{
  "quizzes": [{
    "id": "t1-final",
    "tierId": "tier1",
    "title": "Tier 1 Final Assessment",
    "passThreshold": 0.8,
    "maxAttempts": 3,
    "timeLimitMinutes": 30,
    "questionsPerAttempt": 20,
    "shuffle": true,
    "shuffleOptions": true,
    "moduleDistribution": { "1.1": 4, "1.2": 3, "1.3": 5, "1.4": 5, "1.5": 3 },
    "questions": [{
      "id": "q-101",
      "module": "1.1",
      "moduleRef": "module-1.1",
      "type": "single",
      "prompt": "Which best describes AI?",
      "options": [{"id":"a","text":"..."},{"id":"b","text":"..."}],
      "correct": ["b"],
      "rationale": "Because...",
      "difficulty": "Easy",
      "tags": ["awareness"]
    }]
  }]
}
```

Zod schema: `QuizBank` → `Quiz` → `Question` in `lib/schemas.ts`.

**Tier 1 quiz spec**: 60 questions total in the bank. Each attempt draws 20
questions: 4 from module 1.1, 3 from 1.2, 5 from 1.3, 5 from 1.4, 3 from 1.5.
80% pass threshold. 3 attempts max. 30-minute time limit per attempt.

---

## 7. Env variables

| Variable | Required | Default | Notes |
|---|---|---|---|
| `DATABASE_URL` | ✅ | — | `file:./prisma/dev.db` locally; Postgres URL in prod |
| `NEXTAUTH_SECRET` | ✅ | — | `openssl rand -base64 32` |
| `NEXTAUTH_URL` / `AUTH_URL` | prod | — | Public URL of the app |
| `AUTH_MICROSOFT_ENTRA_ID_ID` | prod | — | Entra app (client) ID |
| `AUTH_MICROSOFT_ENTRA_ID_SECRET` | prod | — | Entra client secret |
| `AUTH_MICROSOFT_ENTRA_ID_ISSUER` | prod | — | `https://login.microsoftonline.com/<tenant>/v2.0` |
| `EMAIL_SERVER_HOST` | optional | — | Leave blank to disable magic-link |
| `EMAIL_SERVER_PORT` | optional | 587 | |
| `EMAIL_SERVER_USER` | optional | — | |
| `EMAIL_SERVER_PASSWORD` | optional | — | |
| `EMAIL_FROM` | optional | — | e.g. `noreply@3shealth.ca` |
| `ENABLE_DEV_LOGIN` | dev only | false | `"true"` = show dev-login button. **Never in prod** |
| `INITIAL_ADMIN_EMAIL` | recommended | — | First sign-in with this email → role=ADMIN |

---

## 8. Key scripts

```bash
npm run dev                    # Next.js dev server (http://localhost:3000)
npm run build                  # Production build (runs prisma generate first)
npm run typecheck              # tsc --noEmit (no output = all clear)

npx prisma db push             # Apply schema to DB (dev, no migration file)
npx prisma migrate dev         # Create + apply migration (prod-ready workflow)
npx prisma studio              # Browser-based DB inspector

npm run seed                   # Import all tiers from /content into the DB
npm run validate-content       # Zod + cross-ref linter (exits 1 on any issue)
npm run ingest                 # Python: re-parse source-docs/ → content/tier1/**
```

---

## 9. Adding a new tier (future)

When Tier 2 content is ready:

1. Create `content/tier2/meta.json`, `content/tier2/module-*/index.mdx`, and
   `content/tier2/quiz-bank.json` following the same format as Tier 1.
2. Run `npm run validate-content` — it checks all `tier*` directories.
3. Run `npm run seed` — it auto-detects every `tier*` directory and imports each.
4. The tier dashboard at `/tier/tier2` will work immediately (the route is
   dynamic `[tier]`). Add a nav link in `components/site-header.tsx`.
5. No schema changes needed.

---

## 10. Future / post-MVP plans

| Feature | Notes |
|---|---|
| **Multiple tiers** | The data model and routes are already tier-agnostic. Just add content. |
| **Certificates / PDF** | Emit a certificate on `passed=true`. Libraries: `@react-pdf/renderer` or a server-side Puppeteer render. |
| **SCORM package export** | Zip `/content/tierX/**` + an imsmanifest.xml. The content format is already designed for this. |
| **Full xAPI LRS export** | `XApiStatement` rows are already xAPI-shaped. Add a bulk export endpoint and point it at an LRS (e.g. SCORM Cloud, or Oracle LMS's built-in LRS). |
| **Postgres migration** | Change `provider = "sqlite"` → `"postgresql"` in `prisma/schema.prisma`, set `DATABASE_URL` to Postgres connection string, run `prisma migrate deploy`. No app code changes needed. |
| **WYSIWYG editor** | Replace the MDX textarea in `/admin/content/[moduleId]` with a rich-text editor (e.g. TipTap with a Markdown serialiser). |
| **Media upload** | Add Azure Blob Storage or similar. Currently images must be externally hosted. |
| **Cohorts / due dates** | Add a `Cohort` model linking users to tiers with a `dueDate`. Minimal schema addition. |
| **Notifications** | Email on quiz pass/fail, reminder before due date. Wire into the existing Nodemailer config. |
| **Analytics** | Completion rates by module, average score per quiz, drop-off points. Can be derived from existing `ModuleProgress`, `QuizAttempt`, and `XApiStatement` rows. |

---

## 11. Deployment

See `README.md` → "Deploying to Azure" for the step-by-step.

Key points for agents:
- `deploy/azure-deploy.sh` is idempotent — safe to run again to update.
- The Docker entrypoint (`docker/entrypoint.sh`) runs `prisma db push` before
  starting the app, so schema changes apply automatically on each deploy.
- The health endpoint is `GET /api/health` — returns `{"status":"ok"}` when
  the DB is reachable.
- For SQLite in production, mount an Azure Files share at `/app/data` so the
  DB survives container restarts (see commented block in `azure-deploy.sh`).

---

## 12. Conventions for agents modifying this codebase

- **All DB mutations use server actions** (`"use server"` functions colocated
  in page files or imported from `lib/`). No REST mutation endpoints.
- **Always call `requireAdmin()` or `requireUser()`** at the top of every
  server action. These throw redirects on auth failure.
- **Content schema changes** must be reflected in both `prisma/schema.prisma`
  AND the Zod schemas in `lib/schemas.ts`, AND the import/export logic in
  `lib/content-sync.ts`.
- **Array fields** are stored as JSON strings (e.g. `objectivesJson`). Always
  `JSON.parse()` on read and `JSON.stringify()` on write. Do not switch to
  Postgres arrays — keep the pattern consistent until we formally migrate.
- **Version bumping**: every admin edit to a `Module` or `Quiz` must increment
  the `version` field and write a `ContentEdit` row.
- **xAPI**: emit a statement via `lib/xapi.ts` for any new learner event (new
  verb/object combinations). Keep the shape consistent with the existing rows.
- **Tailwind brand classes**: use `brand-600/700/800` for primary actions,
  `accent-green` for success, `accent-gold` for warnings/badges. Defined in
  `tailwind.config.ts`.
