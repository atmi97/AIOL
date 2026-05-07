"""Build docs/demo_script.docx — stakeholder demo script for AIOL Tier 1 preview."""

from docx import Document
from docx.shared import Pt, RGBColor, Inches
from docx.enum.text import WD_ALIGN_PARAGRAPH

BRAND = RGBColor(0x0B, 0x6E, 0x6E)
SLATE_900 = RGBColor(0x0F, 0x17, 0x2A)
SLATE_600 = RGBColor(0x47, 0x55, 0x69)
SLATE_500 = RGBColor(0x64, 0x74, 0x8B)
AMBER = RGBColor(0xC0, 0x8A, 0x1B)
EMERALD = RGBColor(0x2F, 0x6B, 0x3A)
ROSE = RGBColor(0xB9, 0x1C, 0x1C)


def set_run(run, *, bold=False, italic=False, size=11, color=None, font="Calibri"):
    run.bold = bold
    run.italic = italic
    run.font.name = font
    run.font.size = Pt(size)
    if color is not None:
        run.font.color.rgb = color
    return run


def add_heading(doc, text, level=1):
    p = doc.add_paragraph()
    p.paragraph_format.space_before = Pt(18 if level == 1 else 12)
    p.paragraph_format.space_after = Pt(6)
    r = p.add_run(text)
    sizes = {0: 24, 1: 18, 2: 14, 3: 12}
    set_run(r, bold=True, size=sizes.get(level, 12), color=BRAND if level <= 1 else SLATE_900)


def add_body(doc, text, *, size=11, color=SLATE_600, italic=False):
    p = doc.add_paragraph()
    p.paragraph_format.space_after = Pt(6)
    r = p.add_run(text)
    set_run(r, size=size, color=color, italic=italic)
    return p


def add_bullet(doc, text, *, color=SLATE_600, indent=0):
    p = doc.add_paragraph(style="List Bullet")
    p.paragraph_format.left_indent = Inches(0.25 + indent * 0.25)
    p.paragraph_format.space_after = Pt(2)
    r = p.add_run(text)
    set_run(r, size=11, color=color)


def add_numbered(doc, text, *, color=SLATE_600):
    p = doc.add_paragraph(style="List Number")
    p.paragraph_format.space_after = Pt(2)
    r = p.add_run(text)
    set_run(r, size=11, color=color)


def add_callout(doc, label, body, *, label_color=BRAND):
    """Light callout — eyebrow label + body."""
    p = doc.add_paragraph()
    p.paragraph_format.space_before = Pt(8)
    p.paragraph_format.space_after = Pt(2)
    r = p.add_run(label.upper())
    set_run(r, bold=True, size=9, color=label_color)
    p2 = doc.add_paragraph()
    p2.paragraph_format.space_after = Pt(8)
    r2 = p2.add_run(body)
    set_run(r2, size=11, color=SLATE_900)


def add_say(doc, text):
    """Spoken line, italic, slate-900."""
    p = doc.add_paragraph()
    p.paragraph_format.left_indent = Inches(0.25)
    p.paragraph_format.space_after = Pt(4)
    label = p.add_run("Say  ")
    set_run(label, bold=True, size=9, color=BRAND)
    body = p.add_run(text)
    set_run(body, size=11, color=SLATE_900, italic=True)


def add_do(doc, text):
    p = doc.add_paragraph()
    p.paragraph_format.left_indent = Inches(0.25)
    p.paragraph_format.space_after = Pt(4)
    label = p.add_run("Do   ")
    set_run(label, bold=True, size=9, color=AMBER)
    body = p.add_run(text)
    set_run(body, size=11, color=SLATE_900)


def add_show(doc, text):
    p = doc.add_paragraph()
    p.paragraph_format.left_indent = Inches(0.25)
    p.paragraph_format.space_after = Pt(4)
    label = p.add_run("Show ")
    set_run(label, bold=True, size=9, color=EMERALD)
    body = p.add_run(text)
    set_run(body, size=11, color=SLATE_900)


def add_hr(doc):
    p = doc.add_paragraph()
    p.paragraph_format.space_before = Pt(8)
    p.paragraph_format.space_after = Pt(8)
    r = p.add_run("─" * 60)
    set_run(r, size=9, color=SLATE_500)


# ────────────────────────────── build ───────────────────────────────

doc = Document()

# Page margins
for section in doc.sections:
    section.left_margin = Inches(0.9)
    section.right_margin = Inches(0.9)
    section.top_margin = Inches(0.8)
    section.bottom_margin = Inches(0.8)

# Title
title = doc.add_paragraph()
r = title.add_run("AIOL Tier 1 — Stakeholder Demo")
set_run(r, bold=True, size=26, color=BRAND)

subtitle = doc.add_paragraph()
subtitle.paragraph_format.space_after = Pt(4)
r = subtitle.add_run("AI Operator Licence · interactive preview · ~7 min run-time")
set_run(r, size=11, color=SLATE_500, italic=True)

add_hr(doc)

# How to use this script
add_heading(doc, "How to use this script", level=2)
add_body(doc, "Three colour-coded cues guide what to do at each beat:")
add_bullet(doc, "Say  — what to say out loud (italic, suggested wording — paraphrase freely).")
add_bullet(doc, "Do   — a click, scroll, or interaction.")
add_bullet(doc, "Show — what stakeholders should be looking at.")

add_body(doc, "Total spoken time: 6–8 minutes at a steady pace. Can stretch to 10 with questions, or compress to 5 by skipping Module 1.5 (Beat 4).")

add_callout(
    doc,
    "Before you start",
    "Open two browser tabs in advance: (1) http://localhost:3000/preview  (2) http://localhost:3000/preview/quiz. "
    "If demoing the timer drama, edit app/preview/quiz/page.tsx line 27 to set timeMinutes: 1 before opening the page. "
    "Make sure dev login is signed in at http://localhost:3000/signin in case you want to show the original text-only version mid-demo.",
)

add_hr(doc)

# ───────────────────────── BEAT 1 — Open ─────────────────────────
add_heading(doc, "Beat 1 · Open & set context  (30 sec)", level=2)
add_show(doc, "http://localhost:3000/preview — the gallery landing page.")
add_say(doc, "What you're looking at is the AI Operator Licence Tier 1 platform — the awareness training that every AMS staff member will complete before they touch any approved AI tool.")
add_say(doc, "We've built the full content — five modules, sixty-question assessment bank — and today I'm walking you through how learners actually experience it. Same content as the policy documents you've already approved; what changes is how it's delivered.")
add_do(doc, "Wait one beat so the page renders fully — the gradient header and module cards should all be visible.")

add_hr(doc)

# ─────────────────── BEAT 2 — Gallery overview ────────────────────
add_heading(doc, "Beat 2 · Gallery overview  (45 sec)", level=2)
add_show(doc, "Stats strip across the top: 5 modules · 120 min total · 18 interactive pieces · 38 sections.")
add_say(doc, "Tier 1 is two hours of self-paced training across five modules. Each module is between fifteen and thirty minutes — designed to be done in a single sitting or split across a couple of coffee breaks.")
add_do(doc, "Hover over the first module card so the brand teal hover state and 'Open →' affordance show.")
add_say(doc, "Each card previews what's inside — number, title, reading time, and the kinds of interactive components in that module. We'll open one in a moment.")
add_show(doc, "The teal 'Final assessment' card at the bottom, separated from the module list.")
add_say(doc, "And at the end, the final assessment — twenty randomized questions, eighty percent to pass, three attempts. We'll come back to that.")

add_hr(doc)

# ─────────────────── BEAT 3 — Module 1.1 deep ─────────────────────
add_heading(doc, "Beat 3 · Module 1.1 — anatomy of a module  (1 min 30 sec)", level=2)
add_do(doc, "Click into Module 1.1 — 'What Is AI?'.")
add_show(doc, "Top progress bar (1px gradient, fills as you scroll), header with reading-time meta, sticky left sidebar with objectives + section anchors.")
add_say(doc, "The shell of every module is the same — sticky sidebar with the learning objectives, an auto-highlighted table of contents, and a progress bar at the top. Standard learning UX, nothing fancy — but it makes a thirty-minute module feel navigable.")

add_callout(doc, "Component to highlight 1", "Section 1.1.1 — the side-by-side compare cards (Traditional software vs AI).")
add_do(doc, "Scroll down to section 1.1.1.")
add_say(doc, "Where the original document had two paragraphs of prose, we use a side-by-side compare. Same content, but now the contrast is the design.")

add_callout(doc, "Component to highlight 2", "Section 1.1.2 — the tabs ('Three types of AI').")
add_do(doc, "Scroll to 1.1.2 and click between Rule-based, Machine learning, and Generative AI.")
add_say(doc, "Tabs for the three categories. Each tab has its own example, its own takeaway tag at the bottom — and the active tab gets a teal underline so people don't get lost.")

add_callout(doc, "Component to highlight 3", "Section 1.1.4 — the accordion (AMS-managed systems).")
add_do(doc, "Scroll to 1.1.4 and click 'Microsoft 365' to expand it. Then click Oracle Fusion.")
add_say(doc, "For the AMS platform list — the original was a flat table — we use an accordion. Learners explore on their own pace; it doesn't dump everything at once.")

add_callout(doc, "Component to highlight 4 — biggest visual moment", "Section 1.1.5 — the 3D flip cards ('What AI is not').")
add_do(doc, "Scroll to 1.1.5 and click 'Not sentient' — the card does a real 3D rotation. Click again to flip back. Flip a second one for emphasis.")
add_say(doc, "These are the things AI is not. The front is the headline; the back is the deeper why-it-matters. We're using the click to make the learner pause — rather than skim a bullet list, they're choosing what to dig into.")

add_callout(doc, "Component to highlight 5 — the most useful one for assessment authors", "Section 1.1.6 — the inline classify quiz.")
add_do(doc, "Scroll to 1.1.6. Click an answer you know is right (try 'Rule-based' on Q1 about ServiceNow keyword routing). Then deliberately get one wrong on Q2 (pick 'Rule-based' instead of 'Generative AI').")
add_show(doc, "Right answer turns emerald with a green explanation box. Wrong answer turns rose; the correct option lights up in faint emerald so the learner sees what they should have picked. Progress bar at the top updates in real time.")
add_say(doc, "These inline knowledge checks live throughout the modules — not the formal exam, just self-assessment. Immediate feedback, with the rationale right there. People retain it better than reading the answer key at the end.")

add_hr(doc)

# ──────────────────── BEAT 4 — Module 1.5 ─────────────────────────
add_heading(doc, "Beat 4 · Module 1.5 — module-specific interactives  (1 min 30 sec)", level=2)
add_say(doc, "I want to show you one more module quickly — to show that we don't just repeat the same components everywhere. Each module gets bespoke pieces where the content calls for them.")
add_do(doc, "Use the breadcrumb 'Preview Gallery' to go back, then click into Module 1.5 — 'Reporting and Accountability'.")

add_callout(doc, "Show 1", "Section 1.5.1 — the Human-bookend flow diagram.")
add_do(doc, "Scroll to the very top of section 1.5.1.")
add_say(doc, "Three steps — human starts, AI executes, human verifies. This is the single most important framing in the entire program, so it gets a visual instead of a paragraph. It anchors everything that comes after.")

add_callout(doc, "Show 2", "Section 1.5.4 — the escalation timeline.")
add_do(doc, "Scroll to 1.5.4.")
add_say(doc, "Escalation path — you, your manager, IT Security, AIGC. A timeline because that's how people actually need to remember it: who do I tell first, who do they tell, and where does it land.")

add_callout(doc, "Show 3", "Section 1.5.7 — the scenario walkthrough with reveals.")
add_do(doc, "Scroll to 1.5.7. Click each panel: 'Next 15 minutes', 'Next two hours', 'By tomorrow morning' — they expand on click.")
add_say(doc, "And the closing scenario — a Q2 financial summary with a four-percent fabricated figure caught pre-send. The walkthrough is broken into three time horizons so the learner thinks through each one before seeing the answer.")

add_hr(doc)

# ──────────────────── BEAT 5 — The quiz ─────────────────────────
add_heading(doc, "Beat 5 · The final assessment engine  (2 min)", level=2)
add_do(doc, "Use the breadcrumb back to the gallery, then click the teal 'Final Assessment — Demo' card at the bottom.")
add_show(doc, "Intro screen: title, three stat cards (10 questions / 80% pass / 5-min limit), amber 'Before you begin' callout, and a five-up grid showing module coverage.")
add_say(doc, "This is the assessment engine. The real exam is twenty questions in thirty minutes; this demo is ten in five so we can run through it. Eighty percent passes — eight out of ten here, sixteen out of twenty in production. Three attempts allowed.")
add_say(doc, "Questions are pulled live from a sixty-question bank, randomized per attempt, and the answer order is shuffled too. Two learners taking it at the same time will see the same ten questions in different orders with the options scrambled — discourages over-the-shoulder copying.")

add_do(doc, "Click 'Start attempt →'.")
add_show(doc, "Sticky timer at the top — brand teal. Sticky submit bar at the bottom. Question 1 of 10.")
add_say(doc, "The timer is sticky and live — five minutes counting down. Under five minutes it goes amber; under one minute it pulses red. If it hits zero, the form auto-submits whatever you've answered. No way to game it.")
add_do(doc, "Answer the first three questions. On Question 1, pick option B (the correct one). On Question 2, pick whatever. On Question 3, pick the obviously-wrong option deliberately.")
add_show(doc, "Bottom bar updates the 'unanswered' count as you go.")
add_do(doc, "Click 'Submit attempt' even though there are unanswered questions.")

add_show(doc, "Result screen — large pass/fail banner, 4 stat cards (threshold, required correct, time taken, unanswered count).")
add_say(doc, "Result screen. Score in big numerals, pass-or-fail badge, and the four pieces of context anyone reviewing this attempt would want — what the threshold was, how many they needed, time taken, how many they skipped.")

add_do(doc, "Scroll down to the 'Question review' section. Click any question header to expand it.")
add_show(doc, "Each question shows: tick or cross next to the prompt; expandable to show learner's answer, the correct answer (if different), and the rationale.")
add_say(doc, "And then per-question review — click any question, see your answer, see the right answer if you missed it, and the rationale. Same rationale that's stored with the question in the bank, so the learner gets the same explanation an admin or content reviewer would.")
add_say(doc, "If they fail, they hit Retake. Three attempts total in production; here it's unlimited so you can demo it as many times as you like.")

add_hr(doc)

# ───────────────────── BEAT 6 — Wrap ─────────────────────────
add_heading(doc, "Beat 6 · Wrap-up  (30 sec)", level=2)
add_do(doc, "Stay on the result screen, or use the breadcrumb back to the gallery for a strong final visual.")
add_say(doc, "That's the Tier 1 experience end to end. A few things worth noting before questions:")
add_bullet(doc, "All five modules and the assessment use the same component vocabulary — tabs, accordions, flip cards, callouts, classify quizzes — so once a learner does Module 1.1, every other module is immediately familiar.", color=SLATE_900)
add_bullet(doc, "The content lives in plain MDX and JSON files — version-controlled, reviewable, exportable. When we move to the Oracle LMS later this year, every component falls back to clean HTML. No content gets stranded.", color=SLATE_900)
add_bullet(doc, "Audit trail and admin editing are wired up — outside the scope of this demo but available if you want to see them. Same for the progress dashboard and CSV export.", color=SLATE_900)
add_say(doc, "Open to questions — and happy to run through any module or component again in more detail.")

add_hr(doc)

# ──────────────── COVERED / NOT COVERED summary ────────────────
add_heading(doc, "What this demo covers", level=2)
add_bullet(doc, "Visual design system — typography, palette, page chrome, sticky sidebar.", color=SLATE_900)
add_bullet(doc, "Reusable interactive components — Tabs, Accordion, FlipCards (3D rotate), Compare cards, Chips, KeyMessage callouts, ClassifyQuiz with progress + rationale.", color=SLATE_900)
add_bullet(doc, "Module-specific bespoke components — Human-Bookend flow (1.5), Escalation timeline (1.5), Scenario Walkthrough reveal (1.5).", color=SLATE_900)
add_bullet(doc, "The assessment engine — intro stats, randomized questions + options, live countdown timer with state changes, sticky submit, auto-submit on expiry, result screen with per-question review.", color=SLATE_900)
add_bullet(doc, "Real content end-to-end — every word of prose and every quiz question in this demo is from the production content bank.", color=SLATE_900)

add_heading(doc, "What this demo does NOT cover (mention only if asked)", level=2)
add_bullet(doc, "Authentication / Microsoft Entra SSO (works — would log out of the dev login if you want to demonstrate).", color=SLATE_600)
add_bullet(doc, "Admin content editing UI at /admin/content (works — full CRUD, with audit trail).", color=SLATE_600)
add_bullet(doc, "Progress dashboard + CSV export at /admin (works — for tracking ~50 staff completion).", color=SLATE_600)
add_bullet(doc, "xAPI emission to a future LRS (instrumented, not visualized).", color=SLATE_600)
add_bullet(doc, "Modules 1.2, 1.3, 1.4 — not skipped because they're worse, but to keep to time. All built to the same standard. Open them if a stakeholder asks.", color=SLATE_600)
add_bullet(doc, "Mobile / tablet layout — sidebar collapses on small screens but the demo machine should be a laptop or larger.", color=SLATE_600)

add_heading(doc, "If a stakeholder asks…", level=2)
add_callout(doc, "How long did this take to build?", "About a week of focused work, building on the original Tier 1 scaffold. Adding new modules to the same pattern is hours, not days, once the components are in place.")
add_callout(doc, "Will it work on the work network?", "Yes. The Codespaces-hosted version runs entirely in the browser — no Node.js, no install, no admin rights needed. Just a GitHub login.")
add_callout(doc, "What about the Oracle LMS migration later?", "Every component has a plain-HTML fallback shape. The content files are MDX and JSON — fully portable. We're not building anything that gets stranded when we move.")
add_callout(doc, "Can the content team edit this without a developer?", "Yes — there's an admin editing UI for module content and quiz settings, with an audit trail of every change. Outside today's demo but I can show it after.")
add_callout(doc, "What's the failure mode if learners hit a bug during the assessment?", "Three attempts allowed. Failed attempts are logged. We can extend or grant additional attempts manually as admins. The countdown timer state is server-validated on submission, so a learner can't cheat by stopping the clock.")
add_callout(doc, "When does Tier 2 land?", "Tier 1 is the prerequisite for everything else. Once Tier 1 is approved and rolled out to the ~50 AMS staff, Tier 2 (practitioner — role-specific tracks) follows the same pattern.")

doc.save("docs/demo_script.docx")
print("Wrote docs/demo_script.docx")
