import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { seedIfEmpty } from "@/lib/content-sync";
import { attemptsRemaining, bestScore } from "@/lib/quiz";
import { SiteHeader } from "@/components/site-header";

export default async function TierPage({ params }: { params: Promise<{ tier: string }> }) {
  await seedIfEmpty();
  const { tier: tierId } = await params;
  const session = await auth();
  if (!session?.user) redirect(`/signin?callbackUrl=/tier/${tierId}`);
  const userId = (session.user as any).id as string;

  const tier = await prisma.tier.findUnique({
    where: { id: tierId },
    include: {
      modules: { orderBy: { order: "asc" } },
      quizzes: true,
    },
  });
  if (!tier) return <div className="p-10">Tier not found.</div>;

  const progress = await prisma.moduleProgress.findMany({
    where: { userId, module: { tierId } },
  });
  const completedIds = new Set(progress.filter((p) => p.completedAt).map((p) => p.moduleId));
  const viewedIds = new Set(progress.map((p) => p.moduleId));

  const completedCount = completedIds.size;
  const total = tier.modules.length;
  const pct = total === 0 ? 0 : Math.round((completedCount / total) * 100);

  const quiz = tier.quizzes[0];
  const remaining = quiz ? await attemptsRemaining(userId, quiz.id) : 0;
  const best = quiz ? await bestScore(userId, quiz.id) : null;
  const quizUnlocked = completedCount === total && total > 0;

  return (
    <>
      <SiteHeader />
      <main className="max-w-5xl mx-auto px-6 py-10">
        <div className="flex items-baseline justify-between flex-wrap gap-4">
          <div>
            <p className="text-xs uppercase tracking-wide text-brand-600 font-semibold">
              {tier.audience}
            </p>
            <h1 className="text-3xl font-bold text-brand-800">{tier.title}</h1>
            {tier.tagline && <p className="text-slate-600 mt-1">{tier.tagline}</p>}
          </div>
          <div className="text-right">
            <div className="text-sm text-slate-500">Overall progress</div>
            <div className="text-3xl font-bold text-brand-700">{pct}%</div>
            <div className="text-xs text-slate-500">
              {completedCount} of {total} modules complete
            </div>
          </div>
        </div>

        <div className="mt-3 w-full bg-slate-200 rounded-full h-2">
          <div className="bg-brand-600 h-2 rounded-full transition-all" style={{ width: `${pct}%` }} />
        </div>

        <section className="mt-10 space-y-3">
          {tier.modules.map((m, idx) => {
            const isComplete = completedIds.has(m.id);
            const isViewed = viewedIds.has(m.id);
            const prevRequired = idx > 0 ? tier.modules[idx - 1].id : null;
            const prevComplete = prevRequired ? completedIds.has(prevRequired) : true;
            const unlocked = idx === 0 || prevComplete;
            const objectives = JSON.parse(m.objectivesJson) as string[];
            return (
              <div
                key={m.id}
                className={`rounded-lg border bg-white p-5 flex items-start gap-4 ${
                  unlocked ? "" : "opacity-60"
                }`}
              >
                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-brand-50 text-brand-700 flex items-center justify-center font-bold">
                  {m.moduleNumber}
                </div>
                <div className="flex-grow">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 className="text-lg font-semibold text-brand-800">{m.title}</h2>
                    <span className="text-xs text-slate-500">· {m.estMinutes} min</span>
                    {isComplete ? (
                      <span className="text-xs bg-accent-green/10 text-accent-green px-2 py-0.5 rounded-full font-semibold">
                        Complete
                      </span>
                    ) : isViewed ? (
                      <span className="text-xs bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full font-semibold">
                        In progress
                      </span>
                    ) : (
                      <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">
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
                <div className="flex-shrink-0">
                  {unlocked ? (
                    <Link
                      href={`/module/${m.id}`}
                      className="px-4 py-2 rounded bg-brand-600 text-white text-sm font-medium hover:bg-brand-700"
                    >
                      {isComplete ? "Review" : isViewed ? "Resume" : "Start"}
                    </Link>
                  ) : (
                    <span className="text-xs text-slate-500">Complete previous module first</span>
                  )}
                </div>
              </div>
            );
          })}
        </section>

        {quiz && (
          <section className="mt-10 border-t pt-8">
            <h2 className="text-2xl font-bold text-brand-800">Final assessment</h2>
            <p className="text-slate-600 mt-1">{quiz.title}</p>
            <div className="mt-4 bg-white rounded-lg border p-5 flex items-center justify-between flex-wrap gap-4">
              <div>
                <div className="text-sm text-slate-700">
                  {quiz.questionsPerAttempt} questions · {Math.round(quiz.passThreshold * 100)}% to
                  pass · {quiz.timeLimitMinutes} minute time limit
                </div>
                <div className="text-sm text-slate-500 mt-1">
                  Attempts remaining: <strong>{remaining}</strong> of {quiz.maxAttempts}
                  {best !== null && (
                    <> · Best score: <strong>{Math.round(best * 100)}%</strong></>
                  )}
                </div>
              </div>
              {quizUnlocked && remaining > 0 ? (
                <Link
                  href={`/quiz/${quiz.id}`}
                  className="px-5 py-2.5 rounded bg-accent-gold text-white font-semibold hover:opacity-90"
                >
                  {best === null ? "Start assessment" : "Retake assessment"}
                </Link>
              ) : (
                <span className="text-sm text-slate-500">
                  {!quizUnlocked
                    ? "Complete all modules to unlock"
                    : remaining === 0
                      ? "No attempts remaining"
                      : ""}
                </span>
              )}
            </div>
          </section>
        )}
      </main>
    </>
  );
}
