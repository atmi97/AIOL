"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

/* ───────── page shell ───────── */

export type SectionEntry = { id: string; n: string; label: string };
export type ShellProps = {
  moduleNumber: string;
  title: string;
  minutes: number;
  sectionsCount: number;
  interactiveCount: number;
  objectives: string[];
  sections: SectionEntry[];
  prev?: { href: string; label: string };
  next?: { href: string; label: string };
  completionSlot?: React.ReactNode;
  children: React.ReactNode;
};

export function ModuleShell({
  moduleNumber,
  title,
  minutes,
  sectionsCount,
  interactiveCount,
  objectives = [],
  sections = [],
  prev,
  next,
  completionSlot,
  children,
}: ShellProps) {
  const [scroll, setScroll] = useState(0);
  const [active, setActive] = useState(sections[0]?.id);

  useEffect(() => {
    const onScroll = () => {
      const h = document.documentElement;
      const pct = (h.scrollTop / (h.scrollHeight - h.clientHeight)) * 100;
      setScroll(pct);
      for (const s of [...sections].reverse()) {
        const el = document.getElementById(s.id);
        if (el && el.getBoundingClientRect().top < 140) {
          setActive(s.id);
          break;
        }
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [sections]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white text-slate-800">
      <div className="fixed top-0 left-0 right-0 h-1 bg-slate-100 z-50">
        <div
          className="h-full bg-gradient-to-r from-brand-400 to-brand-700 transition-[width] duration-150"
          style={{ width: `${scroll}%` }}
        />
      </div>

      <header className="max-w-6xl mx-auto px-6 pt-10 pb-8">
        <div className="flex items-center gap-3 text-xs font-medium text-brand-700 uppercase tracking-wider">
          <Link href="/tier/tier1" className="hover:underline">
            Tier 1 · AI Foundations
          </Link>
          <span className="text-slate-300">/</span>
          <span className="text-slate-500">Module {moduleNumber}</span>
        </div>
        <div className="mt-4 flex items-start justify-between flex-wrap gap-6">
          <div>
            <h1 className="text-4xl font-bold tracking-tight text-slate-900">{title}</h1>
            <p className="mt-2 text-slate-500 flex items-center gap-4 text-sm">
              <span className="inline-flex items-center gap-1.5">
                <Clock /> ~{minutes} min read
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Book /> {sectionsCount} sections
              </span>
              {interactiveCount > 0 && (
                <span className="inline-flex items-center gap-1.5">
                  <Sparkle /> {interactiveCount} interactive
                </span>
              )}
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs font-medium">
            <span className="px-2.5 py-1 rounded-full bg-brand-50 text-brand-700 border border-brand-100">
              Tier 1
            </span>
            <span className="px-2.5 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-100">
              Required
            </span>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-6 pb-24 grid grid-cols-1 lg:grid-cols-[220px_1fr] gap-10">
        <aside className="hidden lg:block">
          <div className="sticky top-8 space-y-6">
            <div className="rounded-xl border border-slate-200 bg-white p-4">
              <div className="text-[11px] font-semibold tracking-wider text-slate-500 uppercase">
                Objectives
              </div>
              <ul className="mt-3 space-y-2">
                {objectives.map((o) => (
                  <li key={o} className="flex gap-2 text-xs text-slate-700">
                    <span className="mt-0.5 text-brand-600">◆</span>
                    <span>{o}</span>
                  </li>
                ))}
              </ul>
            </div>
            <nav className="rounded-xl border border-slate-200 bg-white p-4">
              <div className="text-[11px] font-semibold tracking-wider text-slate-500 uppercase">
                On this page
              </div>
              <ul className="mt-3 space-y-1">
                {sections.map((s) => (
                  <li key={s.id}>
                    <a
                      href={`#${s.id}`}
                      className={`flex gap-2 text-xs px-2 py-1.5 rounded-md transition ${
                        active === s.id
                          ? "bg-brand-50 text-brand-800 font-semibold"
                          : "text-slate-600 hover:bg-slate-50"
                      }`}
                    >
                      <span className="tabular-nums text-slate-400">{s.n}</span>
                      <span>{s.label}</span>
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          </div>
        </aside>

        <article className="min-w-0">
          {children}
          {completionSlot && (
            <div className="mt-16 pt-8 border-t border-slate-200">{completionSlot}</div>
          )}
          <div className={`${completionSlot ? "mt-8" : "mt-16 pt-8 border-t border-slate-200"} flex items-center justify-between flex-wrap gap-4`}>
            {prev ? (
              <Link
                href={prev.href}
                className="text-sm text-slate-500 hover:text-brand-700"
              >
                ← {prev.label}
              </Link>
            ) : (
              <Link href="/tier/tier1" className="text-sm text-slate-500 hover:text-brand-700">
                ← Back to Tier 1
              </Link>
            )}
            {next ? (
              <Link
                href={next.href}
                className="px-6 py-3 rounded-lg bg-gradient-to-br from-brand-500 to-brand-700 text-white font-semibold shadow-lg shadow-brand-600/25 hover:shadow-xl hover:shadow-brand-600/30 transition"
              >
                {next.label} →
              </Link>
            ) : (
              <Link
                href="/tier/tier1"
                className="px-6 py-3 rounded-lg bg-gradient-to-br from-brand-500 to-brand-700 text-white font-semibold shadow-lg shadow-brand-600/25 hover:shadow-xl hover:shadow-brand-600/30 transition"
              >
                Back to Tier 1 →
              </Link>
            )}
          </div>
        </article>
      </div>
    </div>
  );
}

/* ───────── primitives ───────── */

export function Section({
  id,
  n,
  title,
  children,
}: {
  id: string;
  n: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-24 mt-14 first:mt-0">
      <div className="flex items-baseline gap-3">
        <span className="text-sm font-semibold text-brand-600 tabular-nums">{n}</span>
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">{title}</h2>
      </div>
      <div className="mt-5 space-y-5 text-slate-700 leading-relaxed">{children}</div>
    </section>
  );
}

export function Highlight({ children }: { children: React.ReactNode }) {
  return (
    <span className="relative inline-block">
      <span className="absolute inset-x-0 bottom-0 h-2 bg-brand-200/60 -z-10" />
      <span className="relative font-medium text-slate-900">{children}</span>
    </span>
  );
}

export function KeyMessage({
  children,
  tone = "brand",
  title,
}: {
  children: React.ReactNode;
  tone?: "brand" | "amber" | "rose";
  title?: string;
}) {
  const styles =
    tone === "amber"
      ? "from-amber-50 to-amber-100/50 border-amber-200 text-amber-900"
      : tone === "rose"
      ? "from-rose-50 to-rose-100/50 border-rose-200 text-rose-900"
      : "from-brand-50 to-brand-100/40 border-brand-200 text-brand-900";
  const icon = tone === "amber" ? "⚠" : tone === "rose" ? "⨯" : "◆";
  return (
    <div className={`relative mt-4 rounded-xl bg-gradient-to-br border p-5 ${styles}`}>
      <div className="absolute top-4 left-4 text-lg opacity-60">{icon}</div>
      <div className="pl-8 text-sm leading-relaxed">
        {title && <div className="font-semibold mb-1">{title}</div>}
        {children}
      </div>
    </div>
  );
}

export function Tag({
  children,
  tone = "brand",
}: {
  children: React.ReactNode;
  tone?: "brand" | "amber" | "rose" | "emerald";
}) {
  const map: Record<string, string> = {
    brand: "bg-brand-50 text-brand-800 border-brand-200",
    amber: "bg-amber-50 text-amber-800 border-amber-200",
    rose: "bg-rose-50 text-rose-800 border-rose-200",
    emerald: "bg-emerald-50 text-emerald-800 border-emerald-200",
  };
  return (
    <span className={`inline-flex px-3 py-1.5 rounded-full text-xs font-medium border ${map[tone]}`}>
      {children}
    </span>
  );
}

/* ───────── generic tabs ───────── */

export type TabItem = { key: string; label: string; subtitle?: string; body: React.ReactNode };

export function Tabs({ items }: { items: TabItem[] }) {
  const [active, setActive] = useState(items[0].key);
  const current = items.find((t) => t.key === active)!;
  const cols = items.length === 3 ? "grid-cols-3" : items.length === 4 ? "grid-cols-2 sm:grid-cols-4" : "grid-cols-2";
  return (
    <div className="mt-6 rounded-xl border border-slate-200 bg-white overflow-hidden">
      <div className={`grid ${cols} border-b border-slate-200`}>
        {items.map((t) => (
          <button
            key={t.key}
            onClick={() => setActive(t.key)}
            className={`px-4 py-3.5 text-left transition relative ${
              active === t.key ? "bg-gradient-to-b from-brand-50 to-white" : "hover:bg-slate-50"
            }`}
          >
            <div className={`text-sm font-semibold ${active === t.key ? "text-brand-800" : "text-slate-700"}`}>
              {t.label}
            </div>
            {t.subtitle && <div className="text-[11px] text-slate-500 mt-0.5">{t.subtitle}</div>}
            {active === t.key && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-600" />}
          </button>
        ))}
      </div>
      <div className="p-6 space-y-3 text-slate-700 leading-relaxed text-sm">{current.body}</div>
    </div>
  );
}

/* ───────── generic accordion ───────── */

export type AccordionItem = { title: string; subtitle?: string; body: React.ReactNode };

export function Accordion({ items, defaultOpen = 0 }: { items: AccordionItem[]; defaultOpen?: number | null }) {
  const [open, setOpen] = useState<number | null>(defaultOpen);
  return (
    <div className="mt-5 rounded-xl border border-slate-200 bg-white overflow-hidden divide-y divide-slate-200">
      {items.map((p, i) => {
        const isOpen = open === i;
        return (
          <div key={i}>
            <button
              onClick={() => setOpen(isOpen ? null : i)}
              className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-slate-50 transition"
            >
              <div>
                <div className="font-semibold text-slate-900">{p.title}</div>
                {p.subtitle && <div className="text-xs text-slate-500 mt-0.5">{p.subtitle}</div>}
              </div>
              <span className={`text-brand-600 transition-transform ${isOpen ? "rotate-45" : ""}`}>+</span>
            </button>
            {isOpen && (
              <div className="px-5 pb-5 text-sm text-slate-700 leading-relaxed space-y-3">{p.body}</div>
            )}
          </div>
        );
      })}
    </div>
  );
}

/* ───────── flip cards (3D rotate) ───────── */

export type FlipItem = { title: string; front: React.ReactNode; back: React.ReactNode };

export function FlipCards({ items }: { items: FlipItem[] }) {
  const [flipped, setFlipped] = useState<Record<number, boolean>>({});
  return (
    <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-3" style={{ perspective: "1200px" }}>
      {items.map((it, i) => {
        const f = !!flipped[i];
        return (
          <button
            key={i}
            onClick={() => setFlipped((s) => ({ ...s, [i]: !s[i] }))}
            className="relative text-left min-h-[160px] group"
            style={{ perspective: "1200px" }}
          >
            <div
              className="relative w-full h-full min-h-[160px] transition-transform duration-700 ease-[cubic-bezier(0.4,0.0,0.2,1)]"
              style={{
                transformStyle: "preserve-3d",
                transform: f ? "rotateY(180deg)" : "rotateY(0deg)",
              }}
            >
              <div
                className="absolute inset-0 rounded-xl border border-slate-200 bg-white p-5 shadow-sm group-hover:border-brand-300 group-hover:shadow-md transition-shadow"
                style={{ backfaceVisibility: "hidden", WebkitBackfaceVisibility: "hidden" }}
              >
                <div className="text-[11px] font-semibold uppercase tracking-wider text-brand-600">
                  {it.title}
                </div>
                <div className="mt-2 text-sm leading-relaxed text-slate-700">{it.front}</div>
                <div className="absolute bottom-4 left-5 text-[11px] text-slate-400">
                  tap to flip →
                </div>
              </div>
              <div
                className="absolute inset-0 rounded-xl border border-slate-900 bg-slate-900 text-slate-100 p-5 shadow-lg"
                style={{
                  backfaceVisibility: "hidden",
                  WebkitBackfaceVisibility: "hidden",
                  transform: "rotateY(180deg)",
                }}
              >
                <div className="text-[11px] font-semibold uppercase tracking-wider text-brand-300">
                  {it.title}
                </div>
                <div className="mt-2 text-sm leading-relaxed">{it.back}</div>
                <div className="absolute bottom-4 left-5 text-[11px] text-slate-400">
                  ← tap to flip back
                </div>
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}

/* ───────── summary cards ───────── */

export function SummaryCards({ items }: { items: { n: string; t: string; d: string }[] }) {
  return (
    <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
      {items.map((s) => (
        <div
          key={s.n}
          className="rounded-xl border border-slate-200 bg-white p-5 hover:border-brand-300 hover:shadow-md transition"
        >
          <div className="text-xs font-semibold text-brand-600 tracking-wider">{s.n}</div>
          <div className="mt-1 font-semibold text-slate-900">{s.t}</div>
          <div className="mt-1.5 text-xs text-slate-600 leading-relaxed">{s.d}</div>
        </div>
      ))}
    </div>
  );
}

/* ───────── compare (two columns) ───────── */

export type ComparePane = {
  title: string;
  lead: string;
  points: string[];
  tone: "slate" | "brand" | "rose" | "emerald";
};

export function TwoColCompare({ left, right }: { left: ComparePane; right: ComparePane }) {
  return (
    <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
      <ComparePaneCard {...left} />
      <ComparePaneCard {...right} />
    </div>
  );
}

function ComparePaneCard({ title, lead, points, tone }: ComparePane) {
  const map: Record<string, string> = {
    slate: "border-slate-200 bg-white",
    brand: "border-brand-200 bg-gradient-to-br from-brand-50 to-white",
    rose: "border-rose-200 bg-gradient-to-br from-rose-50 to-white",
    emerald: "border-emerald-200 bg-gradient-to-br from-emerald-50 to-white",
  };
  const labelColor: Record<string, string> = {
    slate: "text-slate-500",
    brand: "text-brand-600",
    rose: "text-rose-600",
    emerald: "text-emerald-600",
  };
  const dot: Record<string, string> = {
    slate: "text-slate-400",
    brand: "text-brand-500",
    rose: "text-rose-500",
    emerald: "text-emerald-500",
  };
  return (
    <div className={`rounded-xl border p-5 ${map[tone]}`}>
      <div className={`text-[11px] font-semibold uppercase tracking-wider ${labelColor[tone]}`}>
        {title}
      </div>
      <div className="mt-1.5 font-semibold text-slate-900">{lead}</div>
      <ul className="mt-3 space-y-1.5 text-sm text-slate-600">
        {points.map((p) => (
          <li key={p} className="flex gap-2">
            <span className={dot[tone]}>•</span>
            <span>{p}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/* ───────── chip cloud ───────── */

export function Chips({ items }: { items: string[] }) {
  return (
    <div className="mt-4 flex flex-wrap gap-2">
      {items.map((c) => (
        <span
          key={c}
          className="px-3 py-1.5 rounded-full bg-slate-100 text-slate-700 text-xs font-medium border border-slate-200"
        >
          {c}
        </span>
      ))}
    </div>
  );
}

/* ───────── classify quiz (choose-one w/ feedback) ───────── */

export type QuizChoice = { k: string; label: string };
export type QuizItem = { q: string; a: string; why: string };

export function ClassifyQuiz({
  items,
  choices,
}: {
  items: QuizItem[];
  choices: QuizChoice[];
}) {
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const score = items.reduce((n, q, i) => n + (answers[i] === q.a ? 1 : 0), 0);
  const answered = Object.keys(answers).length;
  return (
    <div className="mt-5">
      <div className="rounded-xl bg-gradient-to-br from-brand-600 to-brand-800 text-white px-5 py-4 flex items-center justify-between flex-wrap gap-3">
        <div className="text-sm">
          <span className="font-semibold">Progress:</span> {answered} of {items.length} answered
        </div>
        <div className="flex items-center gap-3">
          <div className="h-2 w-40 rounded-full bg-white/20 overflow-hidden">
            <div
              className="h-full bg-white transition-all"
              style={{ width: `${(answered / items.length) * 100}%` }}
            />
          </div>
          <div className="text-sm font-semibold tabular-nums">
            {score}/{items.length} correct
          </div>
        </div>
      </div>
      <ol className="mt-4 space-y-3">
        {items.map((q, i) => {
          const chosen = answers[i];
          const right = chosen === q.a;
          return (
            <li key={i} className="rounded-xl border border-slate-200 bg-white p-4">
              <div className="flex gap-3">
                <span className="shrink-0 w-7 h-7 rounded-full bg-slate-100 text-slate-600 text-sm font-semibold flex items-center justify-center">
                  {i + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="text-sm text-slate-800">{q.q}</div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {choices.map((c) => {
                      const picked = chosen === c.k;
                      const isCorrectAnswer = c.k === q.a;
                      let cls = "px-3 py-1.5 rounded-lg text-xs font-medium border transition";
                      if (!chosen) {
                        cls += " bg-white border-slate-200 text-slate-700 hover:border-brand-400 hover:bg-brand-50";
                      } else if (picked && right) {
                        cls += " bg-emerald-50 border-emerald-300 text-emerald-800";
                      } else if (picked && !right) {
                        cls += " bg-rose-50 border-rose-300 text-rose-800";
                      } else if (isCorrectAnswer) {
                        cls += " bg-emerald-50/50 border-emerald-200 text-emerald-700";
                      } else {
                        cls += " bg-white border-slate-200 text-slate-400";
                      }
                      return (
                        <button
                          key={c.k}
                          disabled={!!chosen}
                          onClick={() => setAnswers((s) => ({ ...s, [i]: c.k }))}
                          className={cls}
                        >
                          {c.label}
                        </button>
                      );
                    })}
                  </div>
                  {chosen && (
                    <div
                      className={`mt-3 text-xs rounded-lg px-3 py-2 ${
                        right
                          ? "bg-emerald-50 text-emerald-900 border border-emerald-200"
                          : "bg-rose-50 text-rose-900 border border-rose-200"
                      }`}
                    >
                      <b>{right ? "Correct." : "Not quite. "}</b> {q.why}
                    </div>
                  )}
                </div>
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

/* ───────── icons ───────── */

export function Clock() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10" />
      <path d="M12 6v6l4 2" />
    </svg>
  );
}
export function Book() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M4 4h12a4 4 0 0 1 4 4v12a2 2 0 0 0-2-2H4z" />
      <path d="M4 4v16" />
    </svg>
  );
}
export function Sparkle() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5 18 18M6 18l2.5-2.5M15.5 8.5 18 6" />
    </svg>
  );
}
