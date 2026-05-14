# AI Operator Licence (AIOL) Platform

Interactive training platform for **3sHealth AMS AI Operator Licence** — the mandatory certification that every AMS team member must complete before using AI tools on internal data. Tier 1 (Awareness) is fully built out: 5 modules, 60-question assessment bank, progress tracking, and an admin layer. Two more tiers (Practitioner, Champion) and a fourth (Governance) are planned but out of scope for v1.2.

The whole platform is designed around three constraints:

- **Stand it up now, migrate later.** Content lives as MDX + JSON in `/content/**`, so it can be exported to Oracle LMS or any SCORM/xAPI host without rewriting.
- **Same content, two views.** A stakeholder preview at `/preview/*` and the real learner experience at `/tier/tier1` both render from a shared component library — single source of truth.
- **Trust the learner, audit the admin.** No quiz cheating (server-validated timer, randomized banks), no silent content edits (every admin save is a `ContentEdit` row with before/after diff).

---

## What's in v1.2

### Learner experience
- **Home** (`/`) — program hero with direct CTA into Tier 1
- **Tier overview** (`/tier/tier1`) — gallery-style card list with sequential module unlock, progress bar, real-time stats (5 modules · 120 min · 18 interactive · attempts remaining)
- **Module reader** (`/module/[slug]`) — sticky-sidebar shell with objectives, auto-highlighting section anchors, top scroll-progress rail. Each module is hand-built with the full interactive component library:
  - 1.1 *What Is AI?* — compare cards, tabs, accordion, 3D flip cards, classify quiz
  - 1.2 *AI at AMS* — platform tabs, tier-selector cards, governance diagram, footprint input
  - 1.3 *AI Risks* — hallucination examples accordion, bias accordion, error flip cards, spot-the-error scenario
  - 1.4 *Privacy & Data* — privacy-law tabs, classification explorer, prohibited-data grid, can-you-enter-this quiz
  - 1.5 *Reporting* — human-bookend flow, escalation timeline, scenario walkthrough with step reveal
- **Mark complete** — in-place update, no navigation, no scroll jump. Next module unlocks immediately.
- **Final assessment** (`/quiz/t1-final`) — live countdown timer with color shifts (teal → amber → pulsing rose), sticky timer + submit bars, server-validated time limit, randomized question + option order, server-side scoring, per-question rationale review on the result screen.

### Stakeholder preview (separate route tree)
- **Gallery** (`/preview`) — landing page for demos: stats strip, all 5 modules + the assessment, "interactive feature" tag pills on each card
- **Module previews** (`/preview/module-1-1` … `/preview/module-1-5`) — identical content to the production modules but no auth, no DB writes
- **Quiz demo** (`/preview/quiz`) — 10-question self-contained demo with a 5-minute timer, same engine as production

### Admin layer (`/admin`)
- Learner progress dashboard with CSV export
- Module content editor (edit MDX, metadata; every save bumps `version` + logs to `ContentEdit`)
- Quiz settings + question editor (pass threshold, attempts, time limit)
- Sync — Import from repo / Export to repo, idempotent

### Content & data
- **5 modules** in `content/tier1/module-1.{1..5}/index.mdx`
- **60-question quiz bank** in `content/tier1/quiz-bank.json` — covers all 5 modules with a per-module distribution (4/3/5/5/3) summing to 20 questions per attempt
- **Module visual definitions** in `components/mdx/modules/module-1-{1..5}.tsx` (hand-built React content) plus shared metadata in `components/mdx/modules/meta.ts`
- **Shared component library** at `components/mdx/index.tsx` — `ModuleShell`, `Section`, `Highlight`, `KeyMessage`, `Tag`, `Tabs`, `Accordion`, `FlipCards`, `SummaryCards`, `TwoColCompare`, `Chips`, `ClassifyQuiz`

### Auth (currently disabled)
v1.2 ships with authentication bypassed. Every request resolves to a single demo user (`demo@aiol.local`, auto-seeded, ADMIN role) so all functionality — progress tracking, quiz attempts, admin actions, audit trail — works end-to-end without sign-in.

This is intentional. The platform will move to **Azure Entra SSO** in a future iteration; until that integration is in place, the dev-login / magic-link / Entra plumbing has been replaced with a stub in `lib/auth.ts`. To re-enable: see `docs/future-visual-integration.md` for the auth re-enablement path.

---

## Run it locally

### Prerequisites
- Node.js 20+
- Git
- Windows: PowerShell or Git Bash. macOS/Linux: any shell.

### Setup

```bash
# 1. clone (HTTPS or SSH)
git clone https://github.com/atmi97/AIOL.git
cd AIOL

# 2. checkout the latest branch
git checkout AIOL_version_1.2

# 3. set up env (Prisma reads .env; Next.js reads .env.local)
cp .env.example .env
cp .env.example .env.local

# 4. install + initialize the SQLite DB
npm install
npx prisma db push
npm run seed

# 5. start the dev server
npm run dev
```

Open http://localhost:3000.

**Note for Windows PowerShell users:** `&&` doesn't work as a command separator in PS 5.1. Use `;` or run each command on its own line.

### What you get

| URL | What |
|---|---|
| `/` | Home / landing |
| `/program` | Full program overview (visual redesign — tiers, principles, FAQ) |
| `/tier/tier1` | Tier 1 gallery — pick a module |
| `/module/module-1.1` … `1.5` | Interactive learner modules |
| `/quiz/t1-final` | Final assessment (intro → attempt → result) |
| `/preview` | Stakeholder preview gallery (no auth, no DB writes) |
| `/preview/quiz` | 10-question demo quiz |
| `/admin` | Admin dashboard |
| `/admin/content` | Module content editor |
| `/admin/quizzes` | Quiz + question editor |
| `/admin/sync` | Repo ↔ DB sync UI |
| `/me` | Personal progress page |
| `/api/health` | Health endpoint (Docker HEALTHCHECK) |

---

## Run it on GitHub Codespaces

The repo includes a devcontainer that auto-installs deps, pushes the Prisma schema, seeds the DB, and starts the dev server on container creation.

1. Go to https://github.com/atmi97/AIOL/tree/AIOL_version_1.2
2. Green **Code** button → **Codespaces** tab → **Create codespace on AIOL_version_1.2**
3. Wait ~2 minutes for the post-create script to finish
4. A popup appears: **"Your application running on port 3000…"** → click **Open in Browser**
5. Append `/preview` or `/tier/tier1` to the URL

To share the running app for a demo, in the Codespace VS Code:
- Bottom panel → **Ports** tab → right-click port 3000 → **Port Visibility** → **Public**
- Copy the URL — anyone with it can use the app (no auth required)

⚠️ Public ports have no authentication. Fine for stakeholder demos; don't put real data behind a public port.

When done, stop the codespace at https://github.com/codespaces (⋯ → Stop) to save your monthly hours.

---

## Everyday commands

```bash
npm run dev                   # start Next.js dev server
npm run build                 # production build (~25 routes, all compile)
npm run typecheck             # tsc --noEmit
npm run lint                  # next lint

npm run seed                  # import /content/** into the DB
npm run validate-content      # Zod + cross-ref validation (use in CI)
npm run ingest                # re-ingest source-docs/ → content/tier1/**

npx prisma studio             # inspect DB in a browser
npx prisma db push            # apply schema to DB (dev)
npx prisma migrate dev        # create + apply a migration (prod-ready)
```

---

## Project structure

```
app/                                Next.js App Router (UI + API)
  page.tsx                          Home
  program/                          Program overview (hand-built)
  tier/[tier]/                      Tier gallery
  module/[slug]/                    Production module reader
  quiz/[slug]/                      Quiz intro → attempt → result
  me/                               Learner progress
  admin/                            Admin dashboard, content, quizzes, sync
  preview/                          Stakeholder preview tree (parallel to production)
    page.tsx                        Gallery
    module-1-1/ … module-1-5/       Per-module preview wrappers
    quiz/                           10-question self-contained demo
  api/                              Plain HTTP route handlers
    health/                         Health check
    module/[slug]/complete/         POST → record completion
    quiz/[slug]/start/              POST → create attempt
    quiz/[slug]/attempt/[id]/submit POST → score + finalize
    auth/[...nextauth]/             Stub (auth disabled in v1.2)
    admin/export/                   CSV export

components/
  mdx/
    index.tsx                       Shared component library (ModuleShell + primitives)
    modules/
      meta.ts                       Plain-TS module metadata (objectives, sections, etc.)
      module-1-{1..5}.tsx           Per-module React content with bespoke interactives
      index.ts                      Registry: MODULE_REGISTRY[id] → { meta, Content }
  attempt-form.tsx                  Quiz attempt UI (live timer, sticky bars)
  mark-complete-button.tsx          Client component: fetch + router.refresh()
  site-header.tsx                   Top nav

content/
  program.mdx                       (Legacy raw content — not currently rendered)
  tier1/
    meta.json                       Tier + module index
    module-1.{1..5}/index.mdx       Module content (source of truth for learner text)
    quiz-bank.json                  60-question bank

lib/
  auth.ts                           Auth stub (bypassed in v1.2)
  prisma.ts                         Prisma client singleton
  content.ts                        Reads + Zod-validates /content
  content-sync.ts                   /content ↔ DB import/export
  quiz.ts                           Attempt creation, scoring, attempt limits
  schemas.ts                        Zod schemas (shared by runtime + validator CLI)
  xapi.ts                           xAPI statement emitter (for future LMS export)

prisma/
  schema.prisma                     Data model (Tier, Module, ModuleProgress, Quiz, Question, QuizAttempt, ContentEdit, XApiStatement, User)
  migrations/                       Migration history

scripts/
  ingest-content.py                 One-shot: source-docs → /content/tier1/**
  seed.ts                           Wraps importTierFromRepo for every tier
  validate-content.ts               CI-ready content linter (Zod + cross-refs)
  build-demo-script.py              Generates docs/demo_script.docx

source-docs/                        Original .docx/.xlsx source material

docs/
  preview-design-spec.md            Visual & interaction design spec — hand-off to designers
  future-visual-integration.md      Integration plan (now mostly implemented in v1.2)
  demo_script.docx                  ~7-minute stakeholder demo walkthrough
  build-demo-script.py source       (under scripts/)

.devcontainer/                      Codespaces config — auto-installs + auto-starts
Dockerfile + docker/                Multi-stage build for Azure Container Apps
deploy/azure-deploy.sh              One-shot Azure deploy script
```

---

## How content editing works

Two editing paths. Either is fine; they stay in sync via explicit Import/Export.

**Path A — edit files in the repo** (developers, bulk changes)
1. Edit MDX files under `content/tier1/**` in a branch
2. Open a PR
3. On deploy, `seedIfEmpty()` seeds a fresh DB; for existing DBs, use **Admin → Sync → Import from repo** (idempotent upsert)

**Path B — edit in the admin UI** (program team)
1. Go to `/admin/content` or `/admin/quizzes`
2. Save changes — DB is updated, `version` bumps, edit is logged in `ContentEdit` with before/after diff
3. When you want the edits in git, click **Admin → Sync → Export to repo**. This writes the DB back out to `content/tier1/**`.

**Audit trail**: every admin edit is a row in `ContentEdit` (who, when, before/after JSON). Survives content rewrites.

### About module visuals

The MDX prose in `content/tier1/module-1.{1..5}/index.mdx` is the **canonical source of the words**. The interactive React content in `components/mdx/modules/module-1-{1..5}.tsx` is the **canonical source of the visual rendering**. These are currently maintained in parallel — the admin content editor edits MDX (for portability), but the production learner experience renders from the React components.

When migrating to Oracle LMS, the MDX export from `/admin/sync` is the artifact you ship — the React components are not needed in the destination LMS.

---

## How the quiz engine works

- **Bank**: 60 questions in `content/tier1/quiz-bank.json` with per-question `correct` answers and `rationale`
- **Distribution**: each attempt randomly samples N questions per module to a configured distribution (`{ "1.1": 4, "1.2": 3, "1.3": 5, "1.4": 5, "1.5": 3 }` = 20 total)
- **Per-attempt randomization**: question order shuffled, option order shuffled
- **Timer**: created server-side as `expiresAt`. The countdown shown in the browser is for UX only — the server re-checks `expiresAt` on submit and rejects late submissions
- **Scoring**: server-side in `lib/quiz.ts`. Pass threshold is configurable per quiz (default 80%)
- **Attempt limits**: enforced server-side. Default 3 attempts per quiz per user
- **xAPI**: every `started`, `passed`, `failed` action emits a row in `XApiStatement` for future LRS export
- **Result review**: per-question expandable cards showing the learner's answer, the correct answer (if different), and the rationale

The result screen is fully restored from the persisted attempt — refresh-safe, shareable URL, no client-side state required.

---

## Deploying to Azure (future)

The app is built to run on **Azure Container Apps** in Canada Central. The provided `deploy/azure-deploy.sh` does the whole thing: resource group → container registry → env → container app.

Auth is currently bypassed in code. To deploy a production version with real auth, restore the original `lib/auth.ts` from the commit history (pre-v1.2 had a full Entra + magic-link + dev-login setup) and follow the deployment steps from before:

### Prerequisites
- `az` CLI logged in to the 3sHealth tenant
- An **Entra app registration** with redirect URI `https://<your-app-fqdn>/api/auth/callback/microsoft-entra-id`
- Env vars exported before running the script:

| Variable | What |
|---|---|
| `NEXTAUTH_SECRET` | `openssl rand -base64 32` |
| `AUTH_MICROSOFT_ENTRA_ID_ID` | Entra app (client) ID |
| `AUTH_MICROSOFT_ENTRA_ID_SECRET` | Entra app client secret |
| `AUTH_MICROSOFT_ENTRA_ID_ISSUER` | `https://login.microsoftonline.com/<tenant-id>/v2.0` |
| `INITIAL_ADMIN_EMAIL` | First user with this email becomes admin |

### Deploy

```bash
./deploy/azure-deploy.sh
```

The script prints the public FQDN. Add it to the Entra app's redirect URIs (one-time).

### SQLite vs Postgres

The MVP ships with **SQLite**. For pilot, either:
- Mount an Azure Files share on `/app/data` so the DB survives revision restarts, **or**
- Switch to **Azure Postgres Flexible Server** (Canada Central): change `provider` in `prisma/schema.prisma` from `sqlite` to `postgresql` and set `DATABASE_URL` to the Postgres URL. Every array field is already stored as a JSON string, so nothing else in the app needs to change.

---

## Environment variables

| Variable | When | Notes |
|---|---|---|
| `DATABASE_URL` | always | `file:./prisma/dev.db` locally; Postgres URL in prod |
| `AUTH_SECRET` | always | `openssl rand -base64 32`. Required even with auth bypassed. |
| `AUTH_URL` | always | `http://localhost:3000` locally; public URL in prod |
| `INITIAL_ADMIN_EMAIL` | optional | Currently bypassed (demo user is always admin) |
| `AUTH_MICROSOFT_ENTRA_ID_ID` | prod (when auth re-enabled) | Entra app client ID |
| `AUTH_MICROSOFT_ENTRA_ID_SECRET` | prod | Entra app client secret |
| `AUTH_MICROSOFT_ENTRA_ID_ISSUER` | prod | `https://login.microsoftonline.com/<tenant>/v2.0` |
| `EMAIL_SERVER_*` / `EMAIL_FROM` | optional | Magic-link fallback for when auth is re-enabled |
| `ENABLE_DEV_LOGIN` | dev | Currently inert (auth bypassed) |

See `.env.example` for the full template. **Both `.env` and `.env.local` must exist locally** — Prisma reads `.env`, Next.js reads `.env.local`.

---

## Tech stack

| Layer | Choice |
|---|---|
| Framework | Next.js 15 (App Router) + React 19 + TypeScript |
| Auth | Auth.js v5 (currently stubbed; Entra integration planned) |
| DB | Prisma 6 — SQLite (MVP/dev) or Postgres (prod), same schema |
| Content | MDX (modules) + JSON (quiz bank) + React (visual rendering), all Zod-validated |
| Hosting | Local dev / GitHub Codespaces / Azure Container Apps (planned) |
| Styling | Tailwind CSS with custom 3sHealth brand palette (teal-based) |
| Code quality | TypeScript strict mode, ESLint, prettier-compatible formatting |

---

## Architecture decisions worth knowing

**No server actions for mutations.** Every state change goes through a plain HTTP route handler under `app/api/`. This is because Next.js 15 Server Actions are unreliable in Codespaces dev mode (action IDs invalidate across HMR rebuilds, producing `Invalid Server Actions request` errors). Plain `POST /api/...` works everywhere.

**Two parallel rendering paths for the same content.** `/preview/*` (stakeholder demo, hardcoded prev/next) and `/module/[slug]` (production, DB-driven prev/next) both render `<ModuleShell>` with `<ContentXX />` from `components/mdx/modules/`. Same words, same components, different prev/next + an inserted `Mark Complete` button.

**Module metadata in a plain TS file.** `components/mdx/modules/meta.ts` has no `"use client"` directive and is the canonical source for module objectives, section anchors, and reading times. The per-module `.tsx` files re-export META for backward compat. This avoids a Next.js RSC quirk where data exports from `"use client"` files sometimes arrive `undefined` on the server.

**Server-validated timer.** The quiz countdown in the browser is decorative; the server checks `expiresAt` on submit and silently records an auto-submit if the request arrives after expiry. Cheating by stopping the clock client-side accomplishes nothing.

---

## Known limitations (v1.2)

- **Auth is disabled.** Single demo user backs all requests. Restore Entra integration before any production deployment.
- **Mobile sidebar collapses.** The sticky objectives / table-of-contents sidebar on module pages hides below 1024px. A mobile-friendly accordion equivalent is the next visual to-do.
- **MDX is no longer the rendered source for production modules.** `/module/[slug]` renders from the React content in `components/mdx/modules/*.tsx`, not from `content/tier1/**/index.mdx`. The MDX is still the canonical text source (and what gets exported to LMS later), but visual edits require changes to both. Future work: make the MDX the single source and generate React content from it.
- **No certificate PDF generation.** Pass → green banner, no downloadable cert yet.
- **No notifications.** Module unlock, completion, expiry — all silent.
- **Single tier only.** Tiers 2/3/4 in `prisma/schema.prisma` but no content or UI yet.

---

## Roadmap

Near-term (sequence not prescriptive):

1. Restore Entra SSO via Azure AD integration
2. Add Tier 2 (Practitioner) content tracks
3. Certificate PDF generation on quiz pass
4. Mobile sidebar redesign
5. SCORM/xAPI package builder (the xAPI emission is already wired; we just need a package wrapper)

Longer-term:
- Migration to Oracle LMS as the host (this platform becomes a content authoring sandbox, with `Admin → Sync → Export` producing the LMS package)
- Cross-tenant version for partner organizations (SHA, ministry)

---

## Where to look first

- **For a stakeholder demo:** `docs/demo_script.docx` (7-minute spoken walkthrough with `Say` / `Do` / `Show` cues)
- **For the design language:** `docs/preview-design-spec.md` (full visual + interaction spec, hand-offable to designers)
- **For the integration history:** `docs/future-visual-integration.md` (how `/preview/*` was promoted into the production app)
- **For content:** `content/tier1/**` — the canonical text and quiz bank
- **For components:** `components/mdx/index.tsx` — the shared library; everything else is built on top

---

## Help

- Issues with running locally → check `.env` exists (Prisma needs it) and `.env.local` exists (Next.js needs it). Both should have `DATABASE_URL` and `AUTH_SECRET` at minimum.
- Issues in Codespace → `rm -rf .next && npm run dev` clears the build cache. Hard-refresh the browser tab afterward.
- Quiz state seems wrong → `npx prisma studio` opens a DB browser. Inspect `QuizAttempt`, `ModuleProgress`, `XApiStatement`.
- Content not showing the latest edits → `npm run seed` re-imports from `/content/**`.

---

*3sHealth — Health Shared Services Saskatchewan · AI Operator Licence Program · Internal · v1.2 · Auth bypassed pending Azure SSO*
