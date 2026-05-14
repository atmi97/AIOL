import Link from "next/link";
import { SiteHeader } from "@/components/site-header";

const TIERS = [
  {
    n: "1",
    name: "Awareness",
    who: "All AMS staff",
    duration: "~2 hours (self-paced)",
    renewal: "Annual",
    prerequisite: "None",
    assessment: "20 MCQ · 80% pass",
    access: "None — awareness only",
    tone: "brand",
    description:
      "Foundational understanding of AI, its risks, and AMS-specific privacy and accountability rules. The mandatory starting point for everyone.",
  },
  {
    n: "2",
    name: "Practitioner",
    who: "Daily AI users — analysts, service desk, dev teams",
    duration: "8 hours (2 × 4-hour blended)",
    renewal: "Annual",
    prerequisite: "Tier 1",
    assessment: "Practical + written · 70%",
    access: "Role-specific approved tools",
    tone: "brand",
    description:
      "Hands-on training on the specific AI tools used in your role. Adds depth on data classification, FACTS verification, and tool-specific workflows.",
  },
  {
    n: "3",
    name: "Champion",
    who: "AMS team leads & managers",
    duration: "16 hours (4 × 4-hour instructor-led)",
    renewal: "Biannual",
    prerequisite: "Tier 2 + nomination",
    assessment: "Capstone + presentation",
    access: "All approved tools + admin surfaces",
    tone: "slate",
    description:
      "Train-the-trainer plus admin responsibilities. Champions support their teams, monitor adoption, and feed back into the program.",
  },
  {
    n: "4",
    name: "Governance",
    who: "AMS leadership, Steering Committee reps",
    duration: "24 hours (6 × 4-hour intensive)",
    renewal: "Biannual",
    prerequisite: "Tier 3 (or exemption)",
    assessment: "Policy deliverable + simulation",
    access: "Full + governance & configuration",
    tone: "slate",
    description:
      "Strategic and policy view. Tier 4 holders evaluate new tools, set retention rules, and decide what reaches the approved register.",
  },
];

const PRINCIPLES = [
  { t: "Know what AI is", d: "Plain-language definitions, types, what AI is not.", tier: "Tier 1 · M1.1, M1.3" },
  { t: "Use AI lawfully and responsibly", d: "FOIP, HIPA, LA FOIP, PIPEDA — applied to AI inputs and outputs.", tier: "Tier 1 · M1.4 · Tier 2 · M2.5" },
  { t: "Use AI securely", d: "Data classification, tenant boundaries, the approved tool register.", tier: "Tier 1 · M1.4 · Tier 2 · M2.4" },
  { t: "Maintain meaningful human control", d: "The human-bookend model — human start, AI middle, human end.", tier: "All tiers · core" },
  { t: "Understand the AI lifecycle", d: "Tool evaluation, governance, decommissioning.", tier: "Tier 3 · M3.2 · Tier 4 · Session 2" },
  { t: "Use the right AI tool for the task", d: "Risk classification, tool approval matrix.", tier: "Tier 2 · M2.3 · Tier 3 · M3.2" },
  { t: "Use AI openly and transparently", d: "Disclosure requirements, AI-assisted documentation conventions.", tier: "Tier 2 · M2.5" },
  { t: "Ensure required skills", d: "Certification-before-access — the AUP enforcement model.", tier: "Entire program" },
];

const DATA_RULES = [
  { tone: "emerald", name: "Public", rule: "Permitted in any approved AI tool." },
  { tone: "brand", name: "Internal", rule: "Only organization-approved AI tools. External / public-cloud AI tools prohibited." },
  { tone: "amber", name: "Confidential · PHI · PII", rule: "Must not be processed in external AI tools. PHI requires de-identification unless explicit, documented consent." },
  { tone: "rose", name: "Restricted", rule: "Must not be processed in any AI tool. Under active review by the AI Steering Committee." },
];

const FAQS = [
  {
    q: "Why a 'licence' for AI?",
    a: "You don't need to be a mechanic to drive a car, but you do need a licence — because driving is useful, common, and consequential when done badly. The same is true of AI at work.",
  },
  {
    q: "What if I already have an external AI certification?",
    a: "Google AI Essentials, Microsoft AI Fundamentals, and similar may qualify you for Tier 2 equivalency. Tier 1 is still required because it covers 3sHealth-specific content — the AUP, Saskatchewan privacy law, AMS platform examples, and incident reporting.",
  },
  {
    q: "What happens if my certification expires?",
    a: "Expired certification results in access revocation within 24 hours, integrated with Active Directory. Renewal is annual for Tiers 1 & 2, biannual for Tiers 3 & 4.",
  },
  {
    q: "Who governs the program?",
    a: "The AUP is a child policy under the AIGC AI Policy — the overarching governance for AI across Saskatchewan's health system. The AI Steering Committee maintains the approved tool register and evaluates new tools.",
  },
  {
    q: "What is the pilot scope?",
    a: "The AMS Application Services Management team is the first cohort, managing Oracle Fusion, ServiceNow, and M365. Target: first certified users within 90 days.",
  },
];

export default function ProgramPage() {
  return (
    <>
      <SiteHeader />
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white text-slate-800">
        <div className="max-w-6xl mx-auto px-6 py-16">
          {/* Hero */}
          <div className="text-xs font-semibold uppercase tracking-wider text-brand-700">
            3sHealth · AMS · v2.1
          </div>
          <h1 className="mt-3 text-5xl md:text-6xl font-bold tracking-tight text-slate-900 leading-tight">
            AI Operator Licence Program
          </h1>
          <p className="mt-4 text-lg text-slate-600 max-w-3xl leading-relaxed">
            A mandatory certification program ensuring every AMS team member who uses AI tools
            understands what AI can and cannot do, protects 3sHealth data, identifies errors and
            bias, and stays accountable for AI-assisted work.
          </p>

          <blockquote className="mt-6 border-l-4 border-brand-500 bg-brand-50 px-5 py-4 rounded-r">
            <div className="text-[11px] font-semibold uppercase tracking-wider text-brand-700 mb-1">
              Mission
            </div>
            <div className="italic text-brand-900 text-lg">
              Ensure every AMS team member who uses AI tools is trained, certified, and accountable
              — enabling innovation while protecting data, operations, and stakeholder trust.
            </div>
          </blockquote>

          <div className="mt-8 flex gap-3 flex-wrap">
            <Link
              href="/tier/tier1"
              className="px-6 py-3 rounded-lg bg-gradient-to-br from-brand-500 to-brand-700 text-white font-semibold shadow-lg shadow-brand-600/25 hover:shadow-xl hover:shadow-brand-600/30 transition"
            >
              Start Tier 1 →
            </Link>
            <Link
              href="/"
              className="px-6 py-3 rounded-lg border border-slate-300 bg-white text-slate-700 font-medium hover:border-brand-300 transition"
            >
              Back to home
            </Link>
          </div>

          {/* The problem */}
          <section className="mt-16">
            <div className="text-[11px] font-semibold tracking-wider text-slate-500 uppercase">
              The opportunity
            </div>
            <h2 className="mt-2 text-2xl font-bold text-slate-900">Why this program exists</h2>
            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="rounded-xl border border-slate-200 bg-white p-5">
                <div className="text-sm font-semibold text-slate-900 mb-1">AI is on every platform AMS supports</div>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Oracle Fusion 26A/26B ships with AI agents for finance, procurement, and HCM. Microsoft 365 Copilot is rolling out across the organization. ServiceNow is adding AI-powered ticket routing, Now Assist, and Virtual Agent.
                </p>
              </div>
              <div className="rounded-xl border border-rose-200 bg-gradient-to-br from-rose-50 to-white p-5">
                <div className="text-sm font-semibold text-rose-900 mb-1">The real risk isn't AI adoption — it's outpacing training</div>
                <p className="text-sm text-slate-700 leading-relaxed">
                  Governance structures exist around AI but have not yet been formalized into a structured training and certification framework. Without that, AI use outpaces accountability — leading to data exposure, compliance gaps, and loss of stakeholder trust.
                </p>
              </div>
            </div>
          </section>

          {/* Tiers */}
          <section className="mt-16">
            <div className="text-[11px] font-semibold tracking-wider text-slate-500 uppercase">
              Certification framework
            </div>
            <h2 className="mt-2 text-2xl font-bold text-slate-900">Four tiers · one path</h2>
            <p className="mt-2 text-sm text-slate-600 max-w-3xl">
              Every AMS team member starts at Tier 1. Subsequent tiers unlock role-specific tools
              and responsibilities.
            </p>
            <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-4">
              {TIERS.map((t) => (
                <div
                  key={t.n}
                  className={`rounded-2xl border p-6 ${
                    t.tone === "brand"
                      ? "border-brand-200 bg-gradient-to-br from-brand-50/60 to-white"
                      : "border-slate-200 bg-white"
                  }`}
                >
                  <div className="flex items-baseline gap-3">
                    <div
                      className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-xl shadow-md ${
                        t.tone === "brand"
                          ? "bg-gradient-to-br from-brand-500 to-brand-700 text-white shadow-brand-600/25"
                          : "bg-slate-700 text-white"
                      }`}
                    >
                      {t.n}
                    </div>
                    <div>
                      <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                        Tier {t.n}
                      </div>
                      <div className="text-xl font-bold text-slate-900">{t.name}</div>
                    </div>
                  </div>
                  <p className="mt-3 text-sm text-slate-700 leading-relaxed">{t.description}</p>
                  <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2 text-xs">
                    <Field label="Audience" value={t.who} />
                    <Field label="Duration" value={t.duration} />
                    <Field label="Renewal" value={t.renewal} />
                    <Field label="Prerequisite" value={t.prerequisite} />
                    <Field label="Assessment" value={t.assessment} />
                    <Field label="Tool access" value={t.access} />
                  </dl>
                </div>
              ))}
            </div>
          </section>

          {/* AUP principles */}
          <section className="mt-16">
            <div className="text-[11px] font-semibold tracking-wider text-slate-500 uppercase">
              Curriculum mapping
            </div>
            <h2 className="mt-2 text-2xl font-bold text-slate-900">
              Eight AUP principles · taught across the tiers
            </h2>
            <p className="mt-2 text-sm text-slate-600 max-w-3xl">
              The program is the training and enforcement mechanism for the 3sHealth AI Acceptable
              Use Policy. Every AUP principle maps to specific curriculum content.
            </p>
            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-3">
              {PRINCIPLES.map((p, i) => (
                <div
                  key={p.t}
                  className="rounded-xl border border-slate-200 bg-white p-4 hover:border-brand-300 hover:shadow-md transition"
                >
                  <div className="flex items-baseline gap-2">
                    <span className="text-xs font-semibold text-brand-600 tabular-nums">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <div className="font-semibold text-slate-900 text-sm">{p.t}</div>
                  </div>
                  <p className="mt-1.5 text-xs text-slate-600 leading-relaxed">{p.d}</p>
                  <div className="mt-2 inline-block px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[10px] font-medium border border-slate-200">
                    {p.tier}
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Data rules */}
          <section className="mt-16">
            <div className="text-[11px] font-semibold tracking-wider text-slate-500 uppercase">
              The AUP data classification
            </div>
            <h2 className="mt-2 text-2xl font-bold text-slate-900">
              Four classes · four different rules
            </h2>
            <div className="mt-6 space-y-2">
              {DATA_RULES.map((d) => {
                const map: Record<string, string> = {
                  emerald: "border-emerald-200 bg-gradient-to-br from-emerald-50 to-white",
                  brand: "border-brand-200 bg-gradient-to-br from-brand-50 to-white",
                  amber: "border-amber-200 bg-gradient-to-br from-amber-50 to-white",
                  rose: "border-rose-200 bg-gradient-to-br from-rose-50 to-white",
                };
                const dotMap: Record<string, string> = {
                  emerald: "bg-emerald-500",
                  brand: "bg-brand-500",
                  amber: "bg-amber-500",
                  rose: "bg-rose-500",
                };
                return (
                  <div
                    key={d.name}
                    className={`rounded-xl border p-4 flex items-start gap-4 ${map[d.tone]}`}
                  >
                    <div className="flex items-center gap-2 shrink-0 w-56">
                      <span className={`w-2 h-2 rounded-full ${dotMap[d.tone]}`} />
                      <div className="font-semibold text-slate-900 text-sm">{d.name}</div>
                    </div>
                    <div className="text-sm text-slate-700 leading-relaxed">{d.rule}</div>
                  </div>
                );
              })}
            </div>
            <p className="mt-4 text-xs text-slate-500">
              Taught in Tier 1 Module 1.4 · drilled hands-on in Tier 2 Module 2.4.
            </p>
          </section>

          {/* FAQ */}
          <section className="mt-16">
            <div className="text-[11px] font-semibold tracking-wider text-slate-500 uppercase">
              Questions
            </div>
            <h2 className="mt-2 text-2xl font-bold text-slate-900">Frequently asked</h2>
            <div className="mt-6 space-y-2">
              {FAQS.map((f) => (
                <details
                  key={f.q}
                  className="group rounded-xl border border-slate-200 bg-white overflow-hidden"
                >
                  <summary className="px-5 py-4 cursor-pointer list-none flex items-start justify-between gap-3 hover:bg-slate-50 transition">
                    <div className="text-sm font-semibold text-slate-900">{f.q}</div>
                    <span className="text-brand-600 group-open:rotate-45 transition-transform">
                      +
                    </span>
                  </summary>
                  <div className="px-5 pb-5 pt-0 text-sm text-slate-700 leading-relaxed">{f.a}</div>
                </details>
              ))}
            </div>
          </section>

          {/* Footer CTA */}
          <section className="mt-16 rounded-2xl border border-brand-200 bg-gradient-to-br from-brand-50 to-white p-8 text-center">
            <div className="text-[11px] font-semibold tracking-wider text-brand-700 uppercase">
              Ready to start?
            </div>
            <h2 className="mt-2 text-2xl font-bold text-slate-900">
              Tier 1 is the prerequisite for everything else
            </h2>
            <p className="mt-2 text-sm text-slate-600 max-w-2xl mx-auto">
              ~2 hours of self-paced learning. Five modules. One 20-question assessment. 80% to
              pass. Three attempts.
            </p>
            <div className="mt-6">
              <Link
                href="/tier/tier1"
                className="inline-block px-7 py-3.5 rounded-lg bg-gradient-to-br from-brand-500 to-brand-700 text-white font-semibold shadow-lg shadow-brand-600/25 hover:shadow-xl hover:shadow-brand-600/30 transition"
              >
                Open Tier 1 →
              </Link>
            </div>
          </section>
        </div>
        <footer className="border-t border-slate-200 py-6 text-center text-xs text-slate-500">
          3sHealth — Health Shared Services Saskatchewan · AI Operator Licence Program · Internal · Draft
        </footer>
      </div>
    </>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">{label}</dt>
      <dd className="mt-0.5 text-slate-800">{value}</dd>
    </div>
  );
}
