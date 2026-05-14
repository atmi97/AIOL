import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { attemptsRemaining, bestScore } from "@/lib/quiz";
import { SiteHeader } from "@/components/site-header";

export default async function QuizIntro({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const session = await auth();
  const userId = session.user.id;

  const quiz = await prisma.quiz.findUnique({ where: { id: slug }, include: { tier: true } });
  if (!quiz) {
    return (
      <>
        <SiteHeader />
        <div className="max-w-4xl mx-auto px-6 py-20 text-center text-slate-500">Quiz not found.</div>
      </>
    );
  }

  const remaining = await attemptsRemaining(userId, quiz.id);
  const best = await bestScore(userId, quiz.id);
  const past = await prisma.quizAttempt.findMany({
    where: { userId, quizId: quiz.id },
    orderBy: { startedAt: "desc" },
  });

  const requiredCorrect = Math.ceil(quiz.questionsPerAttempt * quiz.passThreshold);

  return (
    <>
      <SiteHeader />
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white text-slate-800">
        <div className="max-w-4xl mx-auto px-6 py-12">
          <div className="flex items-center gap-3 text-xs font-medium text-brand-700 uppercase tracking-wider">
            <Link href={`/tier/${quiz.tierId}`} className="hover:underline">
              {quiz.tier.title}
            </Link>
            <span className="text-slate-300">/</span>
            <span className="text-slate-500">Final Assessment</span>
          </div>

          <h1 className="mt-4 text-4xl font-bold tracking-tight text-slate-900">{quiz.title}</h1>
          <p className="mt-3 text-slate-600 max-w-2xl">{quiz.description}</p>

          <section className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Stat label="Questions" value={`${quiz.questionsPerAttempt}`} sub="randomized per attempt" />
            <Stat
              label="Pass threshold"
              value={`${Math.round(quiz.passThreshold * 100)}%`}
              sub={`${requiredCorrect} of ${quiz.questionsPerAttempt}`}
            />
            <Stat
              label="Time limit"
              value={`${quiz.timeLimitMinutes} min`}
              sub="auto-submit on expiry"
            />
          </section>

          <section className="mt-6 rounded-xl bg-gradient-to-br from-amber-50 to-amber-100/50 border border-amber-200 p-5 text-sm text-amber-900 leading-relaxed">
            <div className="flex items-start gap-3">
              <div className="text-lg opacity-60">⚠</div>
              <div>
                <div className="font-semibold mb-1">Before you begin</div>
                Questions are randomized from a 60-question bank; options shuffled per attempt. The
                timer runs continuously once you start — finish in one sitting. The form
                auto-submits when the timer hits zero. <b>{quiz.maxAttempts} attempts</b> allowed in
                total.
              </div>
            </div>
          </section>

          {past.length > 0 && (
            <section className="mt-8">
              <div className="text-[11px] font-semibold tracking-wider text-slate-500 uppercase">
                Your attempts
              </div>
              <ul className="mt-3 space-y-2">
                {past.map((a, i) => (
                  <li
                    key={a.id}
                    className="rounded-xl border border-slate-200 bg-white p-3 flex items-center justify-between text-sm"
                  >
                    <span className="text-slate-700">
                      Attempt {past.length - i} —{" "}
                      <span className="text-slate-500">
                        {new Date(a.startedAt).toLocaleString("en-CA")}
                      </span>
                    </span>
                    {a.completedAt ? (
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                          a.passed
                            ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                            : "bg-rose-100 text-rose-800 border border-rose-200"
                        }`}
                      >
                        {Math.round((a.score ?? 0) * 100)}% · {a.passed ? "Passed" : "Did not pass"}
                      </span>
                    ) : (
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-200">
                        In progress
                      </span>
                    )}
                  </li>
                ))}
              </ul>
              {best !== null && (
                <div className="mt-3 text-sm text-slate-600">
                  Best score so far: <b className="text-brand-700">{Math.round(best * 100)}%</b>
                </div>
              )}
            </section>
          )}

          <div className="mt-10">
            {remaining > 0 ? (
              <form action={`/api/quiz/${quiz.id}/start`} method="POST">
                <button
                  type="submit"
                  className="px-7 py-3.5 rounded-lg bg-gradient-to-br from-brand-500 to-brand-700 text-white font-semibold shadow-lg shadow-brand-600/25 hover:shadow-xl hover:shadow-brand-600/30 transition"
                >
                  Start attempt → ({remaining} of {quiz.maxAttempts} remaining)
                </button>
              </form>
            ) : (
              <div className="rounded-xl border border-rose-200 bg-rose-50 p-5 text-sm text-rose-900">
                <b>No attempts remaining.</b> Contact your manager or the AI help desk to request
                additional attempts.
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

function Stat({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5">
      <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
        {label}
      </div>
      <div className="mt-2 text-3xl font-bold text-brand-700 tabular-nums">{value}</div>
      {sub && <div className="text-xs text-slate-500 mt-1">{sub}</div>}
    </div>
  );
}
