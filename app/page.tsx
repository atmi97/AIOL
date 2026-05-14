import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
import { seedIfEmpty } from "@/lib/content-sync";

export default async function Home() {
  await seedIfEmpty();

  return (
    <>
      <SiteHeader />
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white text-slate-800">
        <main className="max-w-6xl mx-auto px-6 py-16">
          <section className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <p className="text-brand-600 text-xs font-semibold uppercase tracking-wider">
                3sHealth · AMS
              </p>
              <h1 className="text-5xl md:text-6xl font-bold mt-3 text-slate-900 tracking-tight leading-tight">
                AI Operator Licence
              </h1>
              <p className="mt-5 text-lg text-slate-600 leading-relaxed">
                A mandatory certification ensuring every AMS team member using AI understands what
                AI can and cannot do, protects 3sHealth data, identifies errors and bias, and stays
                accountable for AI-assisted work.
              </p>
              <blockquote className="mt-6 border-l-4 border-brand-500 bg-brand-50 px-5 py-3 text-brand-900 italic rounded-r">
                Human verify. Human decide. Human accountable.
              </blockquote>
              <div className="mt-8 flex gap-3 flex-wrap">
                <Link
                  href="/tier/tier1"
                  className="px-6 py-3 rounded-lg bg-gradient-to-br from-brand-500 to-brand-700 text-white font-semibold shadow-lg shadow-brand-600/25 hover:shadow-xl hover:shadow-brand-600/30 transition"
                >
                  Open Tier 1 →
                </Link>
                <Link
                  href="/program"
                  className="px-6 py-3 rounded-lg border border-slate-300 bg-white text-slate-700 font-medium hover:border-brand-300 transition"
                >
                  Program overview
                </Link>
              </div>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="text-[11px] font-semibold tracking-wider text-slate-500 uppercase">
                What you'll learn in Tier 1
              </div>
              <ul className="mt-4 space-y-3 text-slate-700 text-sm">
                {[
                  ["1.1", "What Is AI?", "Plain-language definitions, types, limits."],
                  ["1.2", "AI at AMS", "Approved tools, tiers, governance, your role."],
                  ["1.3", "AI Risks & Limitations", "Hallucinations, bias, errors."],
                  ["1.4", "Privacy, Data & Obligations", "FOIP/HIPA, AUP data rules, Shadow AI."],
                  ["1.5", "Reporting & Accountability", "Human-bookend model, incident flow."],
                ].map(([n, t, d]) => (
                  <li key={n} className="flex gap-3">
                    <span className="mt-0.5 w-7 h-7 rounded-lg bg-gradient-to-br from-brand-500 to-brand-700 text-white flex items-center justify-center text-xs font-bold shrink-0">
                      {n}
                    </span>
                    <div>
                      <span className="font-semibold text-slate-900">{t}</span> —{" "}
                      <span className="text-slate-600">{d}</span>
                    </div>
                  </li>
                ))}
              </ul>
              <p className="mt-6 text-xs text-slate-500 leading-relaxed">
                ~2 hours self-paced · 20-question assessment · 80% pass · 3 attempts · 30-minute
                time limit · annual renewal
              </p>
            </div>
          </section>
        </main>
        <footer className="mt-12 border-t border-slate-200 py-6 text-center text-xs text-slate-500">
          3sHealth — Health Shared Services Saskatchewan · AI Operator Licence Program · Internal · Draft
        </footer>
      </div>
    </>
  );
}
