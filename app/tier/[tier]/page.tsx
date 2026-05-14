import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { seedIfEmpty } from "@/lib/content-sync";
import { attemptsRemaining, bestScore } from "@/lib/quiz";
import { SiteHeader } from "@/components/site-header";
import { MODULE_REGISTRY } from "@/components/mdx/modules";

export default async function TierPage({ params }: { params: Promise<{ tier: string }> }) {
  await seedIfEmpty();
  const { tier: tierId } = await params;
  const session = await auth();
  const userId = session.user.id;

  const tier = await prisma.tier.findUnique({
    where: { id: tierId },
    include: { modules: { orderBy: { order: "asc" } }, quizzes: true },
  });
  if (!tier) {
    return (
      <>
        <SiteHeader />
        <div className="max-w-4xl mx-auto px-6 py-20 text-center text-slate-500">Tier not found.</div>
      </>
    );
  }

  const progress = await prisma.moduleProgress.findMany({ where: { userId, module: { tierId } } });
  const completedIds = new Set(progress.filter((p) => p.completedAt).map((p) => p.moduleId));
  const viewedIds = new Set(progress.map((p) => p.moduleId));

  const completedCount = completedIds.size;
  const total = tier.modules.length;
  const pct = total === 0 ? 0 : Math.round((completedCount / total) * 100);

  const quiz = tier.quizzes[0];
  const remaining = quiz ? await attemptsRemaining(userId, quiz.id) : 0;
  const best = quiz ? await bestScore(userId, quiz.id) : null;
  const quizUnlocked = completedCount === total && total > 0;

  const totalMinutes = tier.modules.reduce((n, m) => n + (m.estMinutes ?? 0), 0);
  const totalInteractive = tier.modules.reduce(
    (n, m) => n + (MODULE_REGISTRY[m.id]?.meta.interactiveCount ?? 0),
    0,
  );

  return (
    <>
      <SiteHeader />
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white text-slate-800">
        <div className="max-w-6xl mx-auto px-6 py-12">
          <div className="flex items-start justify-between flex-wrap gap-6">
            <div>
              <div className="text-xs font-semibold uppercase tracking-wider text-brand-700">
                {tier.audience}
              </div>
              <h1 className="mt-3 text-5xl font-bold tracking-tight text-slate-900">
                {tier.title}
              </h1>
              {tier.tagline && (
                <p className="mt-3 text-lg text-slate-600 max-w-2xl">{tier.tagline}</p>
              )}
            </div>
            <div className="text-right">
              <div className="text-[11px] uppercase tracking-wider text-slate-500 font-semibold">
                Your progress
              </div>
              <div className="mt-1 text-4xl font-bold text-brand-700 tabular-nums">{pct}%</div>
              <div className="text-xs text-slate-500">
                {completedCount} of {total} modules
              </div>
            </div>
          </div>

          <div className="mt-6 h-2 rounded-full bg-slate-200 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-brand-500 to-brand-700 transition-all"
              style={{ width: `${pct}%` }}
            />
          </div>

          <div className="mt-10 grid grid-cols-2 md:grid-cols-4 gap-3">
            <Stat n={`${total}`} label="Modules" />
            <Stat n={`${totalMinutes} min`} label="Total read time" />
            <Stat n={`${totalInteractive}`} label="Interactive pieces" />
            <Stat
              n={quiz ? `${remaining}/${quiz.maxAttempts}` : "—"}
              label="Attempts remaining"
            />
          </div>

          <div className="mt-12 space-y-4">
            {tier.modules.map((m, idx) => {
              const isComplete = completedIds.has(m.id);
              const isViewed = viewedIds.has(m.id);
              const prevRequired = idx > 0 ? tier.modules[idx - 1].id : null;
              const prevComplete = prevRequired ? completedIds.has(prevRequired) : true;
              const unlocked = idx === 0 || prevComplete;
              const objectives = JSON.parse(m.objectivesJson) as string[];
              const entry = MODULE_REGISTRY[m.id];

              const CardWrap = ({ children }: { children: React.ReactNode }) =>
                unlocked ? (
                  <Link
                    href={`/module/${m.id}`}
                    className="group block rounded-2xl border border-slate-200 bg-white p-6 hover:border-brand-400 hover:shadow-xl hover:shadow-brand-600/5 transition"
                  >
                    {children}
                  </Link>
                ) : (
                  <div className="block rounded-2xl border border-slate-200 bg-white/50 p-6 opacity-60">
                    {children}
                  </div>
                );

              return (
                <CardWrap key={m.id}>
                  <div className="grid grid-cols-1 md:grid-cols-[80px_1fr_auto] gap-6 items-start">
                    <div>
                      <div
                        className={`w-16 h-16 rounded-xl font-bold text-2xl flex items-center justify-center shadow-lg ${
                          isComplete
                            ? "bg-gradient-to-br from-emerald-500 to-emerald-700 text-white shadow-emerald-600/25"
                            : "bg-gradient-to-br from-brand-500 to-brand-700 text-white shadow-brand-600/20"
                        } ${unlocked ? "group-hover:scale-105 transition" : ""}`}
                      >
                        {isComplete ? "✓" : m.moduleNumber}
                      </div>
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-baseline gap-3 flex-wrap">
                        <h2
                          className={`text-xl font-bold ${
                            unlocked ? "text-slate-900 group-hover:text-brand-700" : "text-slate-700"
                          } transition`}
                        >
                          {m.title}
                        </h2>
                        <div className="flex items-center gap-2 text-xs text-slate-500">
                          <span>~{m.estMinutes} min</span>
                          {entry && (
                            <>
                              <span>·</span>
                              <span>{entry.meta.sectionsCount} sections</span>
                              <span>·</span>
                              <span className="text-brand-700 font-medium">
                                {entry.meta.interactiveCount} interactive
                              </span>
                            </>
                          )}
                        </div>
                        {isComplete ? (
                          <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[11px] font-semibold border border-emerald-100">
                            Complete
                          </span>
                        ) : isViewed ? (
                          <span className="px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 text-[11px] font-semibold border border-amber-100">
                            In progress
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full bg-slate-50 text-slate-600 text-[11px] font-medium border border-slate-100">
                            Not started
                          </span>
                        )}
                      </div>
                      <ul className="mt-2 text-sm text-slate-600 space-y-0.5 list-disc pl-5">
                        {objectives.slice(0, 2).map((o) => (
                          <li key={o}>{o}</li>
                        ))}
                        {objectives.length > 2 && (
                          <li className="text-slate-400">+ {objectives.length - 2} more</li>
                        )}
                      </ul>
                    </div>
                    <div className="flex items-center text-brand-600">
                      {unlocked ? (
                        <span className="inline-flex items-center text-sm font-medium group-hover:translate-x-1 transition-transform">
                          {isComplete ? "Review" : isViewed ? "Resume" : "Start"}
                          <span className="ml-1">→</span>
                        </span>
                      ) : (
                        <span className="text-xs text-slate-500">
                          Complete previous module first
                        </span>
                      )}
                    </div>
                  </div>
                </CardWrap>
              );
            })}
          </div>

          {quiz && (
            <div className="mt-12">
              <div className="text-[11px] font-semibold tracking-wider text-slate-500 uppercase mb-3">
                Final assessment
              </div>
              {quizUnlocked && remaining > 0 ? (
                <Link
                  href={`/quiz/${quiz.id}`}
                  className="group block rounded-2xl border border-slate-200 bg-gradient-to-br from-brand-600 to-brand-800 p-6 hover:shadow-xl hover:shadow-brand-600/20 transition text-white"
                >
                  <div className="grid grid-cols-1 md:grid-cols-[80px_1fr_auto] gap-6 items-start">
                    <div>
                      <div className="w-16 h-16 rounded-xl bg-white/15 backdrop-blur text-white font-bold text-2xl flex items-center justify-center group-hover:scale-105 transition">
                        ✓
                      </div>
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-baseline gap-3 flex-wrap">
                        <h2 className="text-xl font-bold">{quiz.title}</h2>
                        <div className="flex items-center gap-2 text-xs text-brand-100">
                          <span>{quiz.questionsPerAttempt} questions</span>
                          <span>·</span>
                          <span>{Math.round(quiz.passThreshold * 100)}% pass</span>
                          <span>·</span>
                          <span>{quiz.timeLimitMinutes} min</span>
                        </div>
                      </div>
                      <p className="mt-2 text-sm text-brand-50/90">
                        Attempts remaining: <b>{remaining}</b> of {quiz.maxAttempts}
                        {best !== null && (
                          <>
                            {" · "}Best score: <b>{Math.round(best * 100)}%</b>
                          </>
                        )}
                      </p>
                    </div>
                    <div className="flex items-center text-white group-hover:translate-x-1 transition-transform">
                      <span className="text-sm font-medium">
                        {best === null ? "Start" : "Retake"}
                      </span>
                      <span className="ml-1">→</span>
                    </div>
                  </div>
                </Link>
              ) : (
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6 text-center">
                  <div className="text-sm text-slate-600">
                    {!quizUnlocked
                      ? "Complete all modules to unlock the final assessment."
                      : "No attempts remaining. Contact your manager or the AI help desk."}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </>
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
