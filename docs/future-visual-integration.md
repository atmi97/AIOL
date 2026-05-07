# Future Visual Integration

> Plan for promoting the `/preview/*` visual redesign into the production app at `/tier/[tier]`, `/module/[slug]`, and `/quiz/[slug]` — once stakeholders approve the visual direction.

---

## Why two parallel route trees exist today

Right now the repo has two complete renderings of the Tier 1 content:

| Route | What it does | Source of content | Auth | DB |
|---|---|---|---|---|
| `/tier/tier1` | Original learner experience — module list | DB (real `Tier` + `Module` records) | Required | Reads + writes |
| `/module/module-1.1` | Original module page — MDX rendered as plain prose | DB (`Module.bodyMdx` field) | Required | Reads + writes (records views, completions) |
| `/quiz/t1-final` | Original assessment — real attempts, real timer, real auth | DB (`Quiz` + `Question` + `QuizAttempt`) | Required | Reads + writes |
| **`/preview`** | Stakeholder demo — gallery of the visual redesign | Hand-written React, content inlined | None | None |
| **`/preview/module-1-1` … `1-5`** | Visual pilot of each module | Hand-written React | None | None |
| **`/preview/quiz`** | Visual pilot of the assessment engine | Hand-written, in-memory state | None | None |

This separation was deliberate: the preview lets us iterate on visual design without risking the working app. It also means the demo can be shown to stakeholders against a known-stable backdrop — no auth headaches, no half-broken interactions, no chance of corrupting real progress data.

The cost of that separation is that the visual work isn't yet integrated. This document is the path to closing that gap.

---

## Integration goals

1. **Production users see the new visuals** — `/tier/tier1` and `/module/[slug]` get the same chrome, components, and interactivity as `/preview/*`.
2. **Content stays portable** — the existing MDX files in `content/tier1/**/index.mdx` continue to be the source of truth. Migrating to Oracle LMS later this year must remain a clean export.
3. **The quiz engine is preserved** — the server-side scoring, timer validation, attempt limits, and audit data already work correctly. We change the styling, not the logic.
4. **One-way migration, not parallel maintenance** — once a module is integrated, the `/preview/*` version of it can either stay as a reference or be deleted. We don't keep two copies of the same content alive long-term.

---

## Three-step integration plan

### Step 1 — Extract shared components into a stable library

**What changes**

Promote the contents of `app/preview/_shared.tsx` into `components/mdx/`. Each shared component (`Tabs`, `Accordion`, `FlipCards`, `KeyMessage`, `Tag`, `Highlight`, `TwoColCompare`, `Chips`, `SummaryCards`, `ClassifyQuiz`, plus chrome like `Section` and `ModuleShell`) gets its own file with the same public API.

**What's added**

Each component gets a `toPortable()` method that returns a plain-HTML representation. This is what `exportTierToRepo()` in `lib/content-sync.ts` uses when serializing a module back to MDX for repo storage or LMS export. Examples:

- `<Tabs>` exports as `<section><h3>Tab Label 1</h3>{body1}<h3>Tab Label 2</h3>{body2}</section>`
- `<Accordion>` exports as `<dl><dt>Title</dt><dd>{body}</dd>...</dl>`
- `<FlipCards>` exports as `<div class="flip-cards"><div><strong>Title</strong><p>{front}</p><p>{back}</p></div>...</div>`
- `<ClassifyQuiz>` exports as a numbered list with answers in a separate `answer-key` section

**Effort:** half a day. Mechanical extraction, no logic changes.

**Risk:** low. The preview keeps working off the same components — refactor doesn't touch the live app.

---

### Step 2 — Wire the components into MDXRemote

**What changes**

The current `app/module/[slug]/page.tsx` does:

```tsx
<MDXRemote source={mod.bodyMdx} />
```

That's pure prose rendering. Change it to:

```tsx
import * as mdxComponents from "@/components/mdx";

<MDXRemote source={mod.bodyMdx} components={mdxComponents} />
```

Now MDX files can use any component as a tag — `<Tabs>`, `<KeyMessage>`, `<FlipCards>` — and `MDXRemote` renders them.

**Module page chrome upgrade**

While we're in `app/module/[slug]/page.tsx`, replace the existing layout (which is fine but plain) with the `ModuleShell` from the preview. Pass `objectives`, `sections`, prev/next links, etc. — the same props the preview uses, sourced from the DB instead of hardcoded.

**Effort:** ~30 minutes for the wiring + 2-3 hours to adapt `ModuleShell` to read from real DB data instead of hardcoded prop arrays.

**Risk:** low to medium. `MDXRemote` is forgiving — if a tag isn't recognized, it falls back to rendering as plain HTML. Existing MDX files keep rendering exactly as they do today until they're rewritten in Step 3.

---

### Step 3 — Rewrite MDX content to use the new components

**What changes**

Each module's `content/tier1/module-X.X/index.mdx` gets rewritten so the prose is wrapped in the new components. Text inside stays identical — only the wrappers change.

Example diff for module 1.1, section 1.1.5 ("What AI is not"):

**Before:**
```mdx
### 1.1.5 What AI is not

#### AI is not sentient or conscious
It has no experience, no beliefs, no intent. When an AI assistant says "I think"...

#### AI is not infallible
It is wrong, sometimes subtly and confidently wrong, more often than most people expect...
```

**After:**
```mdx
### 1.1.5 What AI is not

<FlipCards items={[
  {
    title: "Not sentient",
    front: "AI has no experience, beliefs, or intent.",
    back: "When an AI assistant says 'I think' — that is fluent generation, not an inner view..."
  },
  {
    title: "Not infallible",
    front: "It's wrong more often than most people expect.",
    back: "Confidently and subtly wrong. Every AI output requires human verification..."
  }
]} />
```

The text content is preserved verbatim (or lightly tightened for the card format). The visual transformation happens at render time.

**Convert order**

Recommended sequence — easiest content first, most-used components first, so the team builds confidence with a low-risk module before tackling the rest:

1. **Module 1.1** (`What Is AI?`) — 4 components, all from the shared library. Use as the validation module: convert it, verify it renders identically to `/preview/module-1-1`, then proceed.
2. **Module 1.2** (`AI at AMS`) — needs the bespoke `TierCards`, `LicenceMetaphor`, `GovernanceDiagram`, `FootprintActivity`. Promote these to `components/mdx/` first if they'll be used in Tier 2/3/4; otherwise leave them as page-local components imported by this MDX file.
3. **Module 1.3** (`AI Risks`) — accordions and flip cards (already in the shared library), plus the bespoke `SpotTheError` scenario component.
4. **Module 1.4** (`Privacy & Data`) — tabs and the bespoke `ClassificationExplorer`.
5. **Module 1.5** (`Reporting & Accountability`) — `HumanBookendFlow`, `EscalationFlow`, `ScenarioWalkthrough`. The most bespoke module — leave for last.

**Effort:** roughly half a day per module (~3 days for all five). Can be parallelized across multiple sessions or contributors.

**Risk:** low *per module*, because each conversion is reviewable against the preview. Higher cumulative risk if all five are converted in one go without intermediate review — recommend a review checkpoint after Module 1.1.

**Reseed required after each conversion**

```powershell
npm run validate-content
npm run seed
```

`seed` re-imports the changed MDX into the DB. The audit trail (`ContentEdit` records) captures the change.

---

## Quiz integration (separate workstream)

The assessment engine at `/quiz/[slug]` and `/quiz/[slug]/attempt/[attemptId]` already works end-to-end:

- Server-side scoring in `lib/quiz.ts`
- Server-validated timer (the client-side countdown is for UX; the server enforces expiry on submission)
- Real attempt persistence in the `QuizAttempt` table
- xAPI emission on attempt, pass, fail
- Pass-threshold and max-attempts enforcement

**What changes:** styling only. The visual design from `/preview/quiz` (gradient hero stat cards, color-shifting timer, sticky bars, expandable per-question review on the result screen) gets ported into:

- `app/quiz/[slug]/page.tsx` (intro screen)
- `components/attempt-form.tsx` (attempt screen)
- `app/quiz/[slug]/attempt/[attemptId]/result/page.tsx` (result screen)

The component logic stays the same. The result screen gains the per-question review breakdown (currently it just shows the final score).

**Effort:** half a day.

**Risk:** medium. Even though changes are styling, this is the highest-stakes route — broken quiz styling that hides the submit button or makes the timer unreadable is a real problem. Test the full attempt flow (intro → attempt → submit → result → retake) with at least two different users before rolling out.

---

## Total effort estimate

| Step | Effort | Cumulative |
|---|---|---|
| 1. Extract shared components into `components/mdx/` + add `toPortable()` | 0.5 day | 0.5 day |
| 2. Wire `MDXRemote` provider + upgrade `ModuleShell` for DB data | 0.5 day | 1.0 day |
| 3. Rewrite MDX for 5 modules (one per ½ day) | 2.5 days | 3.5 days |
| Quiz styling port | 0.5 day | 4.0 days |
| Smoke testing + bug fixes | 0.5 day | 4.5 days |

**Working estimate: 4–5 working days.** Can stretch over a calendar week or two if reviewed module-by-module.

---

## Rollout sequencing

The integration doesn't have to land all at once. A phased rollout limits blast radius:

### Phase A — Components ready, MDX untouched
After Step 1 and Step 2, every existing module continues to render exactly as it does today (because the MDX hasn't been rewritten yet). The new components are available but unused. No user-visible change. **Safe to deploy at this point.**

### Phase B — Module 1.1 converted, rest untouched
After Module 1.1's MDX is rewritten, only Module 1.1 looks different. Modules 1.2–1.5 still render as plain prose. Stakeholders can compare the two side-by-side in production. **Best moment for a final go/no-go decision.**

### Phase C — All modules converted, quiz untouched
Modules 1.1–1.5 all use the new components. The assessment still uses the original styling — that's fine, learners reach it after all five modules and the contrast is acceptable.

### Phase D — Quiz styling ported
Full integration. `/preview/*` routes can be deleted (or left as a known-good fallback for one cycle).

Each phase can be released independently.

---

## What happens to `/preview/*` after integration

Two options:

### Option 1 — Keep it as a permanent stakeholder gallery
The `/preview` routes stay live indefinitely as a reference. Useful if new stakeholders join and need to see what the redesign looks like in isolation.

### Option 2 — Retire after a stabilization window
Delete `app/preview/` once Phase D ships and has 30 days of clean operation. The git history preserves it.

**Recommendation:** Option 2. Two implementations of the same content drift over time. If the preview becomes stale, it's misleading.

---

## Risks and mitigations

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| Component extracted from preview behaves differently in MDX context | Low | Medium | Visual regression testing — open `/module/module-1.1` and `/preview/module-1-1` side-by-side after Step 3 conversion of 1.1 |
| `toPortable()` output drifts from rendered output, breaking LMS export | Medium | High | Snapshot test: render component + run `toPortable()` + diff text content. Add to validation script. |
| Quiz timer styling change accidentally hides the submit button | Low | High | Manual end-to-end test on at least desktop + mobile-narrow before Phase D ship |
| MDX rewrite changes content semantics by accident | Medium | Medium | Diff the rendered text content (strip markup) before/after each module conversion; should be character-identical |
| Integration takes longer than estimate, blocks Tier 2 development | Medium | Medium | Can ship Phase A and Phase B independently; Tier 2 work can begin against the converted Module 1.1 as a reference |

---

## Pre-integration checklist

Before kicking off Step 1:

- [ ] Stakeholders have approved the visual direction (sign-off after the demo)
- [ ] No active content edits in `content/tier1/**` (avoid merge conflicts during MDX rewrites)
- [ ] Database backup taken (in case `seed` operations need to be re-run from scratch)
- [ ] Decision made on whether to promote per-module bespoke components (`TierCards`, `SpotTheError`, etc.) into the shared library or leave them page-local — depends on whether they'll be reused in Tier 2/3/4

---

## Post-integration checklist

After Phase D ships:

- [ ] Run `npm run validate-content` against all five modules — passes
- [ ] Hit `/module/module-1.1` through `/module/module-1.5` as a learner — every interactive component works
- [ ] Hit `/quiz/t1-final` — full attempt flow works, including auto-submit on timer expiry
- [ ] `exportTierToRepo()` round-trip — export Tier 1 to repo, re-seed, re-export, diff should be empty
- [ ] xAPI events still emit on completion, attempt, pass, fail
- [ ] Audit trail records edits made through `/admin/content`
- [ ] Decision made on `/preview/*` retention — kept as gallery or deleted
- [ ] Tag the release: `git tag v1.0-integrated` so there's a known-good restore point

---

## Hand-off note

This integration is a self-contained piece of work. Whoever picks it up should be able to read this document, the [preview design spec](preview-design-spec.md), and the existing `app/preview/_shared.tsx` source, and proceed without further context. The git tag `v0.1-pre-redesign` preserves the state before any of this work began, so anything can be reverted cleanly.

If the preview spec needs updates (new components added, components renamed, APIs changed), update [`docs/preview-design-spec.md`](preview-design-spec.md) at the same time. The two documents are designed to stay in sync.
