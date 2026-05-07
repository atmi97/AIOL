# AIOL Preview — Visual & Interaction Design Spec

> Hand-off document for any agent or designer continuing the visual redesign of the AI Operator Licence (AIOL) Tier 1 platform. Reflects everything implemented under `app/preview/**` on branch `feat/visual-redesign`.
>
> Goal of this doc: a designer/agent should be able to design Tier 2 modules (or redesign Tier 1 again) without reading the code, and a developer should be able to build new pages from this spec and arrive at the same look-and-feel.

---

## 1. Context & Constraints

### What this is
An interactive stakeholder preview of Tier 1 (5 modules) in 3sHealth's AI Operator Licence training platform. Routes live under `/preview/*`, isolated from the production routes at `/tier/[tier]` and `/module/[slug]`.

### Hard constraints
- **LMS portability** — content will eventually migrate to Oracle LMS. Every interactive component must have a plain HTML/text fallback shape so `exportTierToRepo()` can produce clean MDX/JSON for export.
- **Tech** — Next.js 15 App Router, React 19, Tailwind CSS only. No new runtime dependencies. All Tailwind classes must use the existing `tailwind.config.ts` token set (no inline arbitrary colors except where noted).
- **Brand palette** — restricted to the `brand-*` teal scale plus tonal accents (slate, amber, rose, emerald). No invented colors.
- **Accessibility floor** — body text ≥ 14px; tap targets ≥ 32px; color is never the sole signal (always paired with icon/label). Cards behaving as buttons must be `<button>` elements.
- **No auth required** for `/preview/*` routes — they're for stakeholder demo. Real `/module/[slug]` route remains unchanged.

### Out of scope (for now)
- Animations beyond simple transitions and the 3D card flip
- Video/audio embeds
- Drag-and-drop interactions
- Internationalization

---

## 2. Design Tokens

### Color palette
Defined in [`tailwind.config.ts`](../tailwind.config.ts):

```
brand (teal — primary)
  50:  #effafa     50  — surface tints, hover backgrounds
  100: #d5f1f1     100 — pill backgrounds, light borders
  200: #ace4e4     200 — muted borders, highlight underlines
  300: #75cece     300 — hover borders, light accents
  400: #40b0b0     400 — gradients midpoint
  500: #218e8e     500 — gradients midpoint, list bullets
  600: #0b6e6e     600 — primary text emphasis, primary button bg start
  700: #0a5757     700 — primary button bg end, hover state
  800: #0a4646     800 — heading-on-tint
  900: #0a3a3a     900 — reserved (rare)

accent
  gold:  #c08a1b  — reserved for cert/award states (not used yet)
  green: #2f6b3a  — reserved (we use Tailwind emerald-* in practice)

Tailwind base scales used:
  slate-50/100/200/300/400/500/600/700/800/900 — neutrals
  amber-50/100/200/600/800/900 — caution / warning callouts
  rose-50/100/200/300/600/800/900 — error / prohibited / wrong-answer
  emerald-50/200/300/700/800/900 — correct / success / approved
```

### Typography
- Font family: `ui-sans-serif, system-ui, "Segoe UI", Helvetica, Arial, sans-serif` (Tailwind default sans, no custom load)
- Scale used in the preview:
  - **Page H1:** `text-4xl font-bold tracking-tight text-slate-900`
  - **Section H2:** `text-2xl font-bold text-slate-900 tracking-tight` (paired with section number `text-sm font-semibold text-brand-600 tabular-nums`)
  - **Card title:** `font-semibold text-slate-900` (size depends on container)
  - **Eyebrow / label:** `text-[11px] font-semibold uppercase tracking-wider`
  - **Body:** `text-slate-700 leading-relaxed`
  - **Helper / meta:** `text-xs text-slate-500` or `text-[11px] text-slate-400/500`
- Use `tabular-nums` whenever showing numbers in a fixed-width context (section refs, stats, scores).

### Spacing & shape
- Section vertical rhythm: `mt-14` between major sections, `mt-5`–`mt-6` between section sub-blocks.
- Standard interior padding: `p-4` (compact), `p-5` (default), `p-6` (hero-feel).
- Border radius: `rounded-lg` (small chips/buttons), `rounded-xl` (cards, callouts, panels), `rounded-2xl` (hero card / signature surfaces), `rounded-full` (pills, chips, badges).
- Shadows: avoid by default. Reserve `shadow-md` for hover-elevation on interactive cards. Use `shadow-lg shadow-brand-600/25` only on the primary CTA.
- Borders: `border border-slate-200` is the default surface border. Active/branded surfaces use `border-brand-200` to `border-brand-400`.

### Backgrounds
- Page background: `bg-gradient-to-b from-slate-50 to-white`
- Card surface: `bg-white` plus `border border-slate-200`
- Branded surface: `bg-gradient-to-br from-brand-50 to-white border-brand-200`
- Inverse surface (flip card back): `bg-slate-900 text-slate-100 border-slate-900`
- Cautionary surface: `bg-gradient-to-br from-amber-50 to-amber-100/50 border-amber-200`
- Error surface: `bg-gradient-to-br from-rose-50 to-rose-100/50 border-rose-200`

---

## 3. Layout System

### Module shell (`ModuleShell`)
Every module page wraps its content in a single `<ModuleShell>`. The shell renders:

1. **Top progress rail** — fixed-position 1px gradient bar (`from-brand-400 to-brand-700`) tracking page scroll percentage. Fills smoothly via `transition-[width] duration-150`.

2. **Header band** — max-width 6xl, centered:
   - Breadcrumb: `Preview Gallery / Tier 1 · AI Foundations / Module X.Y` in `text-xs uppercase tracking-wider`. Brand teal links, slate separators.
   - Page title: H1 (see typography).
   - Meta row: small inline icons + text — `~N min read · N sections · N interactive`.
   - Status pills (right-aligned): brand-tinted "Tier 1" pill + amber "Required" pill.

3. **Two-column body grid** — `lg:grid-cols-[220px_1fr] gap-10`:
   - **Left: sticky sidebar** (hidden on mobile) — two stacked cards:
     - "Objectives" card: `text-[11px] uppercase` heading, list of objectives with brand teal `◆` bullets.
     - "On this page" navigation: anchor links to each section. Active link: `bg-brand-50 text-brand-800 font-semibold`. Auto-highlights based on scroll position (`<140px from top` triggers active).
   - **Right: article column** — `min-w-0` so it shrinks correctly.

4. **Footer band** — `mt-16 pt-8 border-t border-slate-200`:
   - Left: "← Previous module" (text link)
   - Right: primary CTA "Next module →" — gradient pill button (`bg-gradient-to-br from-brand-500 to-brand-700`), white text, soft brand-tinted shadow.

### Section component (`Section`)
Inside the article column, every content block is a `<Section>`. Renders:
- Numbered eyebrow + bold H2 in a `flex items-baseline gap-3` row.
- Body container with `space-y-5 text-slate-700 leading-relaxed`.
- `scroll-mt-24` on the section so anchored navigation lands below the fixed header.

### Gallery index (`/preview`)
Stakeholder landing page. Layout:
- Hero: eyebrow + 5xl title + supporting paragraph + secondary "Text-only version" link.
- Stats strip: 4 stat cards (modules, total minutes, interactive count, sections).
- Module cards: 5 stacked cards, each a `<Link>` covering the whole row. Three-column inner grid `grid-cols-[80px_1fr_auto]`:
  - Left: 64×64 gradient teal tile with module number, scales `hover:scale-105`.
  - Middle: title (turns brand teal on hover), meta row, blurb, **interactive feature pills** (one per major component used).
  - Right: "Open →" affordance that translates `group-hover:translate-x-1`.
- Footer note for stakeholders explaining that this is a visual pilot.

---

## 4. Reusable Components (in `app/preview/_shared.tsx`)

All components below are exported from `_shared.tsx` and used across all five module pages. Names in code are bold.

### **`Highlight`** — inline emphasis with subtle underline
- Bottom 2px-tall brand-200/60 stripe behind the text.
- Use for the single most important phrase in a paragraph (max 1 per paragraph, ideally 1 per page).

### **`KeyMessage`** — gradient callout box
- Three tones: `brand` (default, info), `amber` (caution), `rose` (warning).
- Anatomy: gradient tint background, matching border, leading icon (◆ / ⚠ / ⨯) at top-left, optional bold title, body text in `text-sm leading-relaxed`.
- `pl-8` on body to clear the icon.
- Use 1-2 per module max. They're load-bearing — overuse dilutes them.

### **`Tag`** — pill-shaped inline label
- Tones: `brand` (default), `amber`, `rose`, `emerald`.
- `inline-flex px-3 py-1.5 rounded-full text-xs font-medium border`.
- Use for short attributions, status labels, or "key takeaway" lines under a tabbed body.

### **`Tabs`** — tabbed content panel
- Top row of tab buttons (`grid-cols-N`); active tab gets `bg-gradient-to-b from-brand-50 to-white` + a 2px brand-600 underline.
- Each tab has `label`, optional `subtitle`, and a `body` (any React node).
- Body container: `p-6 space-y-3 text-sm leading-relaxed`.
- Best for 3-4 mutually-exclusive concepts (the canonical pattern: "Three types of AI", "Platform trajectories", "Four privacy laws").

### **`Accordion`** — vertical reveal list
- `divide-y divide-slate-200` rows; clicking the header toggles. Header shows title + optional subtitle + a `+` symbol that rotates 45° when open.
- Optional `defaultOpen` prop (index or null).
- Best for long enumerations (platforms, bias areas, hallucination examples). One open at a time.

### **`FlipCards`** — 3D rotating cards
- Grid: `grid-cols-1 sm:grid-cols-2 gap-3`. Container has `perspective: 1200px`.
- Each card: 700ms `cubic-bezier(0.4, 0.0, 0.2, 1)` Y-axis rotation. Front and back use `backfaceVisibility: hidden`; back is pre-rotated 180°.
- Front: white card, brand-600 eyebrow, slate-700 body, "tap to flip →" hint at bottom-left.
- Back: slate-900 card, slate-100 body, brand-300 eyebrow, "← tap to flip back" hint.
- Use for **definition + nuance** pairs ("Not sentient" → "Why this matters") or **error type + how to spot it**. Never put critical information only on the back — assume some learners won't flip.

### **`SummaryCards`** — numbered card grid
- `md:grid-cols-2 lg:grid-cols-3 gap-3`. Each card: brand-600 number eyebrow (e.g., "01"), slate-900 bold title, slate-600 description.
- Hover: `border-brand-300 hover:shadow-md`.
- Standard module summary at the end of every module.

### **`TwoColCompare`** — side-by-side compare
- Two `ComparePane` cards, equal width.
- Each pane: tone-coded eyebrow (brand for the "good" or focus side, slate for the neutral side), bold one-liner lead, bullet list of 3-4 points.
- Tones: `slate` / `brand` / `rose` / `emerald`.
- Canonical use: "Traditional software vs AI", "Approved vs unapproved tools".

### **`Chips`** — chip cloud
- `flex flex-wrap gap-2`. Each chip: `bg-slate-100 text-slate-700 text-xs font-medium border border-slate-200 rounded-full px-3 py-1.5`.
- Use sparingly — for enumerations where the items are illustrative, not learnable (e.g., "AI you already use").

### **`ClassifyQuiz`** — interactive multi-choice quiz
- **Header:** brand gradient bar with "Progress: X of N answered" + a thin progress bar + "X/N correct" tally.
- **Items:** numbered (`w-7 h-7 rounded-full bg-slate-100`) cards. Each card has the question, then a row of choice buttons. After clicking:
  - Picked + correct → emerald background, emerald border
  - Picked + wrong → rose background, rose border
  - Unpicked correct answer → faint emerald background (so user sees what was right)
  - Other unpicked choices → muted slate
  - Once chosen, all buttons disabled. Below appears a colored explanation box (emerald/rose) with `<b>Correct.</b>` or `<b>Not quite.</b>` and the `why`.
- Choices and items both passed as data — choices are reusable across items.

---

## 5. Module-Specific Interactives

These are bespoke components in each module's page file. If they prove valuable across the course, candidates for promotion to `_shared.tsx` are marked with **★**.

### Module 1.1 — *What Is AI?*
Standard primitives only. The 1.1.6 quiz uses `ClassifyQuiz` with 10 items.

### Module 1.2 — *AI at AMS*
- **`TierCards`** ★ — 4-up tier selector, click to expand. Active tier shows full audience/unlocks/renewal in a 3-column inner grid below the strip.
- **`LicenceMetaphor`** ★ — 4 emoji-led cards (🚗 🎫 🚫 🔁) explaining the licence metaphor. 2-up grid, hover lifts.
- **`GovernanceDiagram`** — vertical 3-tier org diagram (AIGC → Steering Committee → AUP) connected by 6px brand-300 vertical lines. Top two tiers are brand-emphasized; the bottom (AUP, "where you operate") is slate.
- **`ResponsibilityChecklist`** — branded surface with 5 numbered (`w-5 h-5 rounded-full bg-brand-600 text-white`) bullets.
- **`FootprintActivity`** ★ — 3 input rows. Each row: free-text input + 4 type-buttons (rule-based / ML / generative / not sure). State held locally only — no submission. Footer note clarifies it's a self-reflection exercise.

### Module 1.3 — *AI Risks and Limitations*
- Hallucination examples: `Accordion` with each AMS-context example as its own row (financial, vendor, ServiceNow, procurement, payroll, Fusion narrative).
- Bias areas: `Accordion` with one row per area (recruitment, performance reviews, pay equity, procurement, service desk routing, documentation tone).
- "Five ordinary failure modes": `FlipCards` (calculation / formatting / staleness / context window / prompt sensitivity).
- **`SpotTheError`** ★ — scenario card showing an AI-generated draft. Suspicious text spans are wrapped in clickable elements; clicking flags them. Above the scenario: "Errors found: X / N expected" tally. After all flagged, reveals a per-error explanation.
- "The confidence problem" — hero `KeyMessage` with the verification habit framing.

### Module 1.4 — *Privacy, Data, and Your Obligations*
- 4 privacy laws: `Tabs` (FOIP / LA FOIP / HIPA / PIPEDA). Each tab body has a 2-column "What it protects / Applies to" mini-table plus a key takeaway tag.
- **`ClassificationExplorer`** ★ — 4-segment vertical color-coded surface (Public → Internal → Confidential/PHI/PII → Restricted). Each segment expands on click to reveal definition, examples, AI rules.
- "Approved vs unapproved" — `TwoColCompare` with brand vs rose tones.
- "Tenant boundary vs data residency" — `TwoColCompare` with two slate tones (parallel concepts, no good/bad split).
- Prohibited data: chip grid with rose-tinted chips (PHI, PII, credentials, legal records, sensitive financial, source code).
- 1.4.8 activity: `ClassifyQuiz` with 5 scenarios and 3 choices (Permitted / Permitted with caution / Prohibited).

### Module 1.5 — *Reporting and Accountability*
- **`HumanBookendFlow`** ★ — horizontal 3-step diagram: `[👤 Human starts]` → `[🤖 AI executes]` → `[👤 Human verifies]`. Connecting lines, each step in a card with sub-text. Critical visual — appears at the top of section 1.5.1.
- Incident categories: `Accordion` (output error / data concern / bias / Shadow AI / tool misbehaviour / near-miss). One row each, with concrete examples.
- "What to include / what not to do": parallel `KeyMessage` blocks (brand for "include", rose for "do not").
- **`EscalationFlow`** ★ — 3-step horizontal timeline: You → Manager → IT Security/ESS → AIGC. Each step is a card with role + when-to-escalate. Connecting arrows with brand-300 strokes.
- Resource list: card grid (AMS AI FAQ, AI Champion, Manager, Privacy Officer, ServiceNow) — each with an icon and one-line description.
- **`ScenarioWalkthrough`** ★ — the Q2 financial-summary scenario. Single scenario card at top, then three reveal panels: "Next 15 minutes / Next two hours / By tomorrow morning". Each panel collapsed initially, click to reveal the action list.

---

## 6. Interaction & Motion Patterns

### Animation timing
- Hover transitions: `transition` (default 150ms) for color/shadow; `transition-transform` for scale/translate.
- Tab body changes: instant (no fade — the tabs already convey the change).
- Accordion expand: instant (no max-height animation — keeps it crisp; revisit if a designer specifies otherwise).
- FlipCards: 700ms cubic-bezier (defined above). This is the most cinematic motion in the system; nothing else should be slower.
- Progress bar (top rail and quiz progress): `transition-[width] duration-150`.
- CTA hover: `hover:scale-105` only on the gallery's module-number tile and `group-hover:translate-x-1` on right-arrow affordances.

### Click feedback
- Buttons darken or border-shift on hover. They never *move* on hover (avoid `hover:translate-y-*`) — exception: the right-arrow on gallery cards which is purely visual.
- Disabled quiz buttons keep their final color but lose hover affordances. Cursor remains default (browsers handle this).

### Loading & empty states
- Currently none — preview pages are static. When backed by data later, use a slate-100 skeleton block that matches the target component's outer dimensions.

### Keyboard
- All interactive components are real `<button>` elements — natural keyboard support.
- Sidebar nav uses `<a href="#…">` anchors — naturally focusable and routable.
- Quiz items don't trap focus; tab order is sequential.

---

## 7. Voice & Content Patterns

These are content rules the visual system reinforces:

- **One headline message per section.** If a `KeyMessage` block contains the takeaway, the surrounding paragraphs should not repeat it verbatim.
- **Short bold leads.** Every card lead is a 4-8 word imperative or assertion; supporting points are sentence fragments.
- **Concrete > abstract.** Always pair a concept with an AMS-grounded example (the Oracle Fusion narrative, the ServiceNow virtual agent answer, the Q2 financial summary).
- **No emoji in body copy.** Emojis are reserved for decorative card icons in `LicenceMetaphor` and the `HumanBookendFlow`. Inline body copy stays text-only — keeps the tone enterprise-appropriate.
- **Title case for tab labels and section H2s.** Sentence case for everything else.

---

## 8. File Structure

```
app/preview/
├── page.tsx                       # Gallery index
├── _shared.tsx                    # All reusable components, types, and chrome
├── module-1-1/page.tsx            # Module 1.1 — uses standard primitives only
├── module-1-2/page.tsx            # Module 1.2 — adds TierCards, LicenceMetaphor, GovernanceDiagram, FootprintActivity
├── module-1-3/page.tsx            # Module 1.3 — adds SpotTheError
├── module-1-4/page.tsx            # Module 1.4 — adds ClassificationExplorer
└── module-1-5/page.tsx            # Module 1.5 — adds HumanBookendFlow, EscalationFlow, ScenarioWalkthrough
```

The leading underscore on `_shared.tsx` makes it a private module — Next.js does not treat it as a route.

---

## 9. Component API Reference

For each shared component, the props an integrator needs:

```ts
ModuleShell({
  moduleNumber: string,           // e.g. "1.1"
  title: string,
  minutes: number,
  sectionsCount: number,
  interactiveCount: number,
  objectives: string[],
  sections: { id, n, label }[],   // for sidebar nav
  prev?:  { href, label },
  next?:  { href, label },
  children: ReactNode,
})

Section({ id, n, title, children })
Highlight({ children })
KeyMessage({ children, tone?: "brand"|"amber"|"rose", title? })
Tag({ children, tone?: "brand"|"amber"|"rose"|"emerald" })

Tabs({ items: { key, label, subtitle?, body: ReactNode }[] })
Accordion({ items: { title, subtitle?, body: ReactNode }[], defaultOpen?: number|null })
FlipCards({ items: { title, front: ReactNode, back: ReactNode }[] })
SummaryCards({ items: { n, t, d }[] })
TwoColCompare({ left: ComparePane, right: ComparePane })
  ComparePane = { title, lead, points: string[], tone: "slate"|"brand"|"rose"|"emerald" }
Chips({ items: string[] })

ClassifyQuiz({
  items: { q, a, why }[],         // a = correct choice key
  choices: { k, label }[],
})
```

---

## 10. Promotion Plan (toward production)

When this preview is approved by stakeholders, the path to applying it to the live `/module/[slug]` route:

1. Promote `_shared.tsx` components into a stable `components/mdx/` library — same names, same APIs, but registered with `MDXRemote`'s components map so MDX files can use them like `<Tabs>...</Tabs>`.
2. Each component gets a `toPortable()` exporter — produces clean HTML/text fallback for `exportTierToRepo()`. Required to preserve LMS migration.
3. The bespoke per-module components marked **★** above are evaluated:
   - If used in 3+ modules across Tier 1–4, promote.
   - Otherwise, leave them as page-local.
4. MDX content files are migrated section-by-section to use the new components. The text inside the components stays identical; only the wrapping changes.
5. Gallery (`/preview`) becomes either the new `/tier/tier1` overview or is retired.

---

## 11. Known Limitations & Notes for the Next Designer

- **Mobile sidebar is hidden.** The `lg:block` breakpoint hides the objectives/anchors panel below 1024px. A designer should propose either a collapsible drawer or a top-of-page accordion equivalent for mobile.
- **No dark mode.** Page is light-only. If dark mode is desired, the slate-900 flip-card back is the only existing inverse surface — a full pass would be needed.
- **No print styles.** Modules are read-on-screen.
- **Quiz state is ephemeral.** Refresh resets progress. xAPI emission for these previews is not wired.
- **The `SpotTheError`, `HumanBookendFlow`, `EscalationFlow`, `ClassificationExplorer`, `ScenarioWalkthrough` components** are described above by intent; their concrete implementations are inline in each module's page file. A designer iterating on these should treat the current implementations as v1 and feel free to redesign visually so long as the interaction contract (click to reveal, with progress tally where applicable) is preserved.
- **No empty/skeleton/error states.** Add them when these components become data-backed.

---

## 12. Where to Look in the Code

| Need to see… | File |
|---|---|
| The full design system + every shared component | [`app/preview/_shared.tsx`](../app/preview/_shared.tsx) |
| Gallery card pattern, hero | [`app/preview/page.tsx`](../app/preview/page.tsx) |
| Standard module (no bespoke widgets) | [`app/preview/module-1-1/page.tsx`](../app/preview/module-1-1/page.tsx) |
| Tier selector, governance diagram, input activity | [`app/preview/module-1-2/page.tsx`](../app/preview/module-1-2/page.tsx) |
| Spot-the-error scenario | [`app/preview/module-1-3/page.tsx`](../app/preview/module-1-3/page.tsx) |
| Classification explorer, three-way classify quiz | [`app/preview/module-1-4/page.tsx`](../app/preview/module-1-4/page.tsx) |
| Human-bookend flow, escalation timeline, scenario walkthrough | [`app/preview/module-1-5/page.tsx`](../app/preview/module-1-5/page.tsx) |
| Brand colors | [`tailwind.config.ts`](../tailwind.config.ts) |

---

*Generated for the AIOL Tier 1 visual redesign, branch `feat/visual-redesign`. Source content remains unchanged from `content/tier1/**/index.mdx`.*
