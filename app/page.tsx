import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
import { auth } from "@/lib/auth";
import { seedIfEmpty } from "@/lib/content-sync";

export default async function Home() {
  // Boot-time: seed DB from /content/** on first run.
  await seedIfEmpty();
  const session = await auth();

  return (
    <>
      <SiteHeader />
      <main className="max-w-6xl mx-auto px-6 py-12">
        <section className="grid md:grid-cols-2 gap-10 items-center">
          <div>
            <p className="text-brand-600 text-sm font-semibold uppercase tracking-wide">
              3sHealth · AMS
            </p>
            <h1 className="text-4xl md:text-5xl font-bold mt-2 text-brand-800 leading-tight">
              AI Operator Licence Program
            </h1>
            <p className="mt-4 text-lg text-slate-700 leading-relaxed">
              A mandatory certification ensuring every AMS team member using AI understands what AI
              can and cannot do, protects 3sHealth data, identifies errors and bias, and stays
              accountable for AI-assisted work.
            </p>
            <blockquote className="mt-6 border-l-4 border-brand-500 bg-brand-50 px-4 py-3 text-brand-900 italic">
              Human verify, Human decide, Human accountable.
            </blockquote>
            <div className="mt-8 flex gap-4">
              <Link
                href={session ? "/tier/tier1" : "/signin"}
                className="px-5 py-2.5 bg-brand-600 text-white rounded hover:bg-brand-700 font-medium"
              >
                {session ? "Continue Tier 1" : "Sign in to start"}
              </Link>
              <Link
                href="/program"
                className="px-5 py-2.5 border border-brand-600 text-brand-700 rounded hover:bg-brand-50 font-medium"
              >
                Program overview
              </Link>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-xl font-semibold text-brand-800">What you'll learn in Tier 1</h2>
            <ul className="mt-4 space-y-3 text-slate-700 text-sm">
              <li className="flex gap-3">
                <span className="mt-0.5 w-6 h-6 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center text-xs font-bold">
                  1.1
                </span>
                <span><strong>What Is AI?</strong> — Plain-language definitions, types, limits.</span>
              </li>
              <li className="flex gap-3">
                <span className="mt-0.5 w-6 h-6 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center text-xs font-bold">
                  1.2
                </span>
                <span><strong>AI at AMS</strong> — Approved tools, tiers, governance, your role.</span>
              </li>
              <li className="flex gap-3">
                <span className="mt-0.5 w-6 h-6 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center text-xs font-bold">
                  1.3
                </span>
                <span><strong>AI Risks &amp; Limitations</strong> — Hallucinations, bias, errors.</span>
              </li>
              <li className="flex gap-3">
                <span className="mt-0.5 w-6 h-6 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center text-xs font-bold">
                  1.4
                </span>
                <span><strong>Privacy, Data &amp; Your Obligations</strong> — FOIP/HIPA, AUP data rules, Shadow AI.</span>
              </li>
              <li className="flex gap-3">
                <span className="mt-0.5 w-6 h-6 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center text-xs font-bold">
                  1.5
                </span>
                <span><strong>Reporting &amp; Accountability</strong> — Human-bookend model, incident flow.</span>
              </li>
            </ul>
            <p className="mt-6 text-xs text-slate-500">
              ~2 hours self-paced · 20-question assessment · 80% pass · 3 attempts · 30-minute time
              limit · annual renewal
            </p>
          </div>
        </section>
      </main>
      <footer className="mt-12 border-t py-6 text-center text-xs text-slate-500">
        3sHealth — Health Shared Services Saskatchewan · AI Operator Licence Program · Internal ·
        Draft
      </footer>
    </>
  );
}
