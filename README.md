# AI Operator Licence (AIOL) Platform

Interim home for the **3sHealth AMS AI Operator Licence** training program while
we wait on an LMS license (Oracle or otherwise). Built so the program team can
develop content, run quizzes, and track learner progress today, with a clean
exit ramp to a real LMS later.

- **Scope**: Tier 1 only for MVP (~50 internal 3sHealth/AMS staff)
- **Design goal**: prove the content → quiz → progress loop before committing
  to an LMS; keep content portable so it can be packaged as SCORM/xAPI later
- **Data residency**: Canada Central (Azure)

---

## What's in the box

- **5 modules** (Tier 1: What Is AI?, AI at AMS, Risks & Limitations, Responsible
  Use, Day-to-Day Skills) + a **60-question quiz bank**, already ingested from
  the three source docs under `source-docs/`
- **Learner experience**: tier dashboard with sequential unlock → MDX module
  viewer with "Mark complete" → quiz runner with countdown timer → result page
  → `/me` history
- **Admin UI** (`/admin`, for users with `role=ADMIN`):
  - **Learners** — progress table + CSV export
  - **Content** — edit module title, metadata, and MDX body; every save bumps
    version and writes an audit row
  - **Quizzes** — edit settings (pass threshold, attempts, time limit) and
    individual questions
  - **Sync** — Import from repo ↔ Export to repo so admins can edit in-app and
    still produce a reviewable git commit
- **Auth**: Microsoft Entra SSO (primary), email magic link (fallback),
  dev-login toggle for local development
- **Portability**: everything is stored as plain MDX + JSON in `/content/**` so
  it can be packaged for an LMS later; xAPI statements are emitted on every
  completion/attempt

---

## Quick start (local)

```bash
# 1. Copy env template
cp .env.example .env.local

# 2. Install deps + generate Prisma client
npm install

# 3. Create the SQLite DB and push the schema
npx prisma db push

# 4. Import tier1 content from /content into the DB
npm run seed

# 5. Run it
npm run dev
```

Open http://localhost:3000.

### Logging in locally

`.env.example` ships with `ENABLE_DEV_LOGIN="true"`, which puts a **Dev login**
button on the `/signin` page. Enter any email — no SMTP or Entra needed.

To get admin access, set `INITIAL_ADMIN_EMAIL` in `.env.local` to the email you
signed in with, then restart the dev server. The next time that email signs in,
it's auto-promoted to `ADMIN`.

---

## Where everything lives

```
app/                          Next.js App Router (UI + server actions)
  tier/[tier]                 Learner tier dashboard
  module/[slug]               MDX module viewer
  quiz/[slug]                 Quiz runner
  me                          Learner progress page
  admin/                      Admin UI (Learners, Content, Quizzes, Sync)
  api/health                  Health endpoint used by Docker HEALTHCHECK
content/
  program.mdx                 Program overview (landing page copy)
  tier1/
    meta.json                 Tier + module index
    module-1.1/index.mdx      Module content (MDX + frontmatter)
    quiz-bank.json            60-question quiz bank
lib/
  auth.ts                     Auth.js config (Entra + magic link + dev-login)
  content.ts                  Reads + Zod-validates /content
  content-sync.ts             /content ↔ DB import/export
  quiz.ts                     Attempt creation, scoring, attempt limits
  schemas.ts                  Zod schemas (shared by runtime + validator CLI)
  xapi.ts                     xAPI statement emitter (for future LMS export)
prisma/schema.prisma          Data model
scripts/
  ingest-content.py           One-shot: source docs → /content/tier1/**
  seed.ts                     Wraps importTierFromRepo for every tier
  validate-content.ts         CI-ready content linter (Zod + cross-refs)
source-docs/                  Original .docx/.xlsx source material
Dockerfile + docker/          Multi-stage build for Azure Container Apps
deploy/azure-deploy.sh        One-shot deploy script
```

---

## Everyday commands

```bash
npm run dev                   # start Next.js dev server
npm run build                 # production build
npm run typecheck             # tsc --noEmit

npm run seed                  # import /content/** into the DB
npm run validate-content      # Zod + cross-ref validation (use in CI)
npm run ingest                # re-ingest source-docs/ → content/tier1/**

npx prisma studio             # inspect DB in a browser
npx prisma db push            # apply schema to DB (dev)
npx prisma migrate dev        # create + apply a migration (prod-ready)
```

---

## How content editing works

There are two editing paths. Either is fine; they stay in sync via explicit
Import/Export.

**Path A — edit files in the repo** (developers / bulk changes)
1. Edit files under `content/tier1/**` in a branch
2. Open a PR
3. On deploy, `seedIfEmpty()` seeds a fresh DB from the files; existing DBs
   can be updated via **Admin → Sync → Import from repo** (idempotent upsert)

**Path B — edit in the admin UI** (program team)
1. Sign in as an admin, go to `/admin/content` or `/admin/quizzes`
2. Save changes — the DB is updated, `version` is bumped, and every edit is
   logged in `ContentEdit` with before/after diff
3. When you want the edits in git, click **Admin → Sync → Export to repo**.
   This writes the DB back out to `content/tier1/**`. Commit the diff in the
   deployment environment (or via a CI pipeline that opens a PR).

**Audit trail**: every admin edit is a row in `ContentEdit` (who, when,
before/after JSON).

---

## Deploying to Azure

The app is built to run on **Azure Container Apps** in Canada Central. The
provided `deploy/azure-deploy.sh` does the whole thing: resource group →
container registry → env → container app.

### Prerequisites

- `az` CLI logged in to the 3sHealth tenant
- An **Entra app registration** with:
  - Redirect URI: `https://<your-app-fqdn>/api/auth/callback/microsoft-entra-id`
  - API permissions: `openid`, `profile`, `email`, `User.Read`
- The following env vars exported in your shell before running the script:

  | Variable | What |
  |---|---|
  | `NEXTAUTH_SECRET` | `openssl rand -base64 32` |
  | `AUTH_MICROSOFT_ENTRA_ID_ID` | Entra app (client) ID |
  | `AUTH_MICROSOFT_ENTRA_ID_SECRET` | Entra app client secret |
  | `AUTH_MICROSOFT_ENTRA_ID_ISSUER` | `https://login.microsoftonline.com/<tenant-id>/v2.0` |
  | `INITIAL_ADMIN_EMAIL` | First user to sign in with this email becomes admin |

### Deploy

```bash
./deploy/azure-deploy.sh
```

The script prints the public FQDN at the end. Add it to the Entra app's
redirect URIs (one-time setup).

### SQLite vs Postgres

The MVP ships with **SQLite** (single file on a volume). For the pilot, either:

- Mount an Azure Files share on `/app/data` so the DB survives revision
  restarts (commented snippet is in `deploy/azure-deploy.sh`), **or**
- Switch to **Azure Postgres Flexible Server** (Canada Central): change the
  `provider` in `prisma/schema.prisma` from `sqlite` to `postgresql` and set
  `DATABASE_URL` to the Postgres URL. Every array field is already stored as a
  JSON string, so nothing else in the app needs to change.

---

## Environment variables

| Variable | Required? | Notes |
|---|---|---|
| `DATABASE_URL` | ✅ | `file:./prisma/dev.db` locally; Postgres URL in prod |
| `NEXTAUTH_SECRET` | ✅ | `openssl rand -base64 32` |
| `NEXTAUTH_URL` | prod only | Public URL of the app |
| `AUTH_MICROSOFT_ENTRA_ID_ID` | prod | Entra app client ID |
| `AUTH_MICROSOFT_ENTRA_ID_SECRET` | prod | Entra app client secret |
| `AUTH_MICROSOFT_ENTRA_ID_ISSUER` | prod | `https://login.microsoftonline.com/<tenant>/v2.0` |
| `EMAIL_SERVER_HOST` / `_PORT` / `_USER` / `_PASSWORD` / `EMAIL_FROM` | optional | Magic-link fallback; leave blank to disable |
| `ENABLE_DEV_LOGIN` | dev only | `"true"` shows the dev-login button. **Never** enable in prod |
| `INITIAL_ADMIN_EMAIL` | recommended | Auto-promotes this email to ADMIN on sign-in |

See `.env.example` for the full template.

---

## Re-ingesting source docs

If the source `.docx` / `.xlsx` files change:

```bash
pip3 install python-docx openpyxl
npm run ingest            # rewrites content/tier1/** from source-docs/
npm run validate-content  # confirm it's still valid
npm run seed              # push the updated content into the DB
```

---

## Out of scope for the MVP

Deliberately deferred — all flagged in the plan, none of them block the pilot:

- Certificates / PDF generation
- Discussion threads / comments
- Notifications (email or in-app)
- Multi-tier navigation (only Tier 1 exists today)
- SCORM package export (xAPI statements are emitted; a package builder comes
  when we're sure the shape is stable)
- WYSIWYG editor (textarea + MDX preview is enough for now)
- Media upload UI (link to externally hosted images/video)

---

## Tech stack

| Layer | Choice |
|---|---|
| Framework | Next.js 15 (App Router) + React 19 + TypeScript |
| Auth | Auth.js v5 — Microsoft Entra + Nodemailer magic link + dev-login |
| DB | Prisma 6 — SQLite (MVP) or Postgres (prod), same schema |
| Content | MDX (modules) + JSON (quiz bank), validated by Zod |
| Hosting | Azure Container Apps (Canada Central) |
| Styling | Tailwind CSS with a custom 3sHealth brand palette |
