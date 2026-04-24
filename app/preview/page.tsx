import Link from "next/link";

const MODULES = [
  {
    n: "1.1",
    slug: "module-1-1",
    title: "What Is AI?",
    minutes: 30,
    sections: 7,
    interactive: 4,
    blurb: "Define AI, ML, and generative AI. Distinguish AI from traditional software.",
    interactives: ["Tabs — 3 types", "Accordion — AMS platforms", "Flip cards — what AI is not", "Quiz — Is this AI?"],
  },
  {
    n: "1.2",
    slug: "module-1-2",
    title: "AI at AMS",
    minutes: 20,
    sections: 8,
    interactive: 4,
    blurb: "The Operator Licence model, four tiers, AIGC governance, and your role.",
    interactives: ["Tabs — platform trajectories", "Tier selector", "Governance diagram", "Footprint activity"],
  },
  {
    n: "1.3",
    slug: "module-1-3",
    title: "AI Risks and Limitations",
    minutes: 25,
    sections: 6,
    interactive: 3,
    blurb: "Hallucinations, bias, confidence — and the single verification habit.",
    interactives: ["Accordions — examples & bias areas", "Flip cards — 5 error types", "Spot-the-error scenario"],
  },
  {
    n: "1.4",
    slug: "module-1-4",
    title: "Privacy, Data & Obligations",
    minutes: 25,
    sections: 9,
    interactive: 4,
    blurb: "Saskatchewan privacy law, the AUP classifications, Shadow AI, tenant & residency.",
    interactives: ["Tabs — HIPA/LA FOIP/FOIP/PIPEDA", "Classification explorer", "Compare — approved vs unapproved", "Quiz — Can you enter this?"],
  },
  {
    n: "1.5",
    slug: "module-1-5",
    title: "Reporting & Accountability",
    minutes: 20,
    sections: 8,
    interactive: 3,
    blurb: "Human-bookend model, ServiceNow AI Incident Category, escalation to AIGC.",
    interactives: ["Bookend flow", "Accordion — incident types", "Scenario walkthrough"],
  },
];

export default function PreviewIndex() {
  const totalMinutes = MODULES.reduce((n, m) => n + m.minutes, 0);
  const totalInteractive = MODULES.reduce((n, m) => n + m.interactive, 0);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white text-slate-800">
      <div className="max-w-6xl mx-auto px-6 py-16">
        <div className="flex items-start justify-between flex-wrap gap-6">
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-brand-700">
              Stakeholder Preview · Tier 1
            </div>
            <h1 className="mt-3 text-5xl font-bold tracking-tight text-slate-900">
              AI Operator Licence
            </h1>
            <p className="mt-3 text-lg text-slate-600 max-w-2xl">
              An interactive preview of the five Tier 1 modules. Same content as the
              current text-only build — restructured into tabs, accordions, flip cards,
              interactive scenarios, and quizzes.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/tier/tier1"
              className="px-4 py-2 rounded-lg border border-slate-300 bg-white text-sm font-medium text-slate-700 hover:border-brand-300 transition"
            >
              Text-only version
            </Link>
          </div>
        </div>

        <div className="mt-10 grid grid-cols-2 md:grid-cols-4 gap-3">
          <Stat n="5" label="Modules" />
          <Stat n={`${totalMinutes} min`} label="Total read time" />
          <Stat n={`${totalInteractive}`} label="Interactive pieces" />
          <Stat n="38" label="Sections" />
        </div>

        <div className="mt-12 space-y-4">
          {MODULES.map((m, i) => (
            <Link
              key={m.slug}
              href={`/preview/${m.slug}`}
              className="group block rounded-2xl border border-slate-200 bg-white p-6 hover:border-brand-400 hover:shadow-xl hover:shadow-brand-600/5 transition"
            >
              <div className="grid grid-cols-1 md:grid-cols-[80px_1fr_auto] gap-6 items-start">
                <div>
                  <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 text-white font-bold text-2xl flex items-center justify-center shadow-lg shadow-brand-600/20 group-hover:scale-105 transition">
                    {m.n}
                  </div>
                </div>

                <div className="min-w-0">
                  <div className="flex items-baseline gap-3 flex-wrap">
                    <h2 className="text-xl font-bold text-slate-900 group-hover:text-brand-700 transition">
                      {m.title}
                    </h2>
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <span>~{m.minutes} min</span>
                      <span>·</span>
                      <span>{m.sections} sections</span>
                      <span>·</span>
                      <span className="text-brand-700 font-medium">{m.interactive} interactive</span>
                    </div>
                  </div>
                  <p className="mt-2 text-sm text-slate-600">{m.blurb}</p>
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {m.interactives.map((it) => (
                      <span
                        key={it}
                        className="px-2.5 py-1 rounded-full bg-brand-50 text-brand-800 text-[11px] font-medium border border-brand-100"
                      >
                        {it}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex items-center text-brand-600 group-hover:translate-x-1 transition-transform">
                  <span className="text-sm font-medium">Open</span>
                  <span className="ml-1">→</span>
                </div>
              </div>
            </Link>
          ))}
        </div>

        <div className="mt-12 rounded-2xl border border-slate-200 bg-gradient-to-br from-slate-50 to-white p-6">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
            For stakeholders
          </div>
          <div className="mt-2 text-sm text-slate-700 leading-relaxed max-w-3xl">
            This is a visual pilot — isolated from the production platform at <code className="text-xs px-1.5 py-0.5 rounded bg-slate-100 border border-slate-200">/tier/tier1</code>.
            Content is identical to the live build; only the rendering changes. If approved, the patterns here (tabs, accordions, flip cards, quizzes, scenario walkthroughs) will be extracted into a reusable MDX component library and applied to the real modules — preserving portability for the future Oracle LMS migration.
          </div>
        </div>
      </div>
    </div>
  );
}

function Stat({ n, label }: { n: string; label: string }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <div className="text-2xl font-bold text-slate-900 tabular-nums">{n}</div>
      <div className="text-xs text-slate-500 mt-0.5">{label}</div>
    </div>
  );
}
