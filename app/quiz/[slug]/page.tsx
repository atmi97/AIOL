import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { attemptsRemaining, bestScore, startAttempt } from "@/lib/quiz";
import { SiteHeader } from "@/components/site-header";

async function startAttemptAction(quizId: string) {
  "use server";
  const session = await auth();
  if (!session?.user) throw new Error("Not authenticated");
  const userId = (session.user as any).id as string;
  const { attempt } = await startAttempt(userId, quizId);
  redirect(`/quiz/${quizId}/attempt/${attempt.id}`);
}

export default async function QuizIntro({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const session = await auth();
  if (!session?.user) redirect(`/signin?callbackUrl=/quiz/${slug}`);
  const userId = (session.user as any).id as string;

  const quiz = await prisma.quiz.findUnique({ where: { id: slug }, include: { tier: true } });
  if (!quiz) return <div className="p-10">Quiz not found.</div>;

  const remaining = await attemptsRemaining(userId, quiz.id);
  const best = await bestScore(userId, quiz.id);
  const past = await prisma.quizAttempt.findMany({
    where: { userId, quizId: quiz.id },
    orderBy: { startedAt: "desc" },
  });

  return (
    <>
      <SiteHeader />
      <main className="max-w-3xl mx-auto px-6 py-10">
        <div className="text-sm text-slate-500 mb-2">
          <Link href={`/tier/${quiz.tierId}`} className="hover:underline">
            {quiz.tier.title}
          </Link>{" "}
          / Final assessment
        </div>
        <h1 className="text-3xl font-bold text-brand-800">{quiz.title}</h1>
        <p className="mt-2 text-slate-600">{quiz.description}</p>

        <section className="mt-8 grid sm:grid-cols-3 gap-3">
          <div className="bg-white rounded border p-4">
            <div className="text-xs text-slate-500">Questions</div>
            <div className="text-2xl font-bold text-brand-700">{quiz.questionsPerAttempt}</div>
          </div>
          <div className="bg-white rounded border p-4">
            <div className="text-xs text-slate-500">Pass threshold</div>
            <div className="text-2xl font-bold text-brand-700">
              {Math.round(quiz.passThreshold * 100)}%
            </div>
          </div>
          <div className="bg-white rounded border p-4">
            <div className="text-xs text-slate-500">Time limit</div>
            <div className="text-2xl font-bold text-brand-700">{quiz.timeLimitMinutes} min</div>
          </div>
        </section>

        <section className="mt-6 bg-amber-50 border border-amber-200 rounded p-4 text-sm text-amber-900">
          <strong>Before you begin.</strong> Questions are randomized from a 60-question bank.
          Attempts are limited to {quiz.maxAttempts}. Once you start, the timer runs continuously —
          finish in one sitting.
        </section>

        {past.length > 0 && (
          <section className="mt-8">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
              Your attempts
            </h2>
            <ul className="mt-2 space-y-2">
              {past.map((a, i) => (
                <li
                  key={a.id}
                  className="bg-white border rounded p-3 flex items-center justify-between text-sm"
                >
                  <span>
                    Attempt {past.length - i} — {new Date(a.startedAt).toLocaleString("en-CA")}
                  </span>
                  {a.completedAt ? (
                    <span
                      className={`font-semibold ${a.passed ? "text-accent-green" : "text-red-700"}`}
                    >
                      {Math.round((a.score ?? 0) * 100)}% {a.passed ? "(Passed)" : "(Did not pass)"}
                    </span>
                  ) : (
                    <span className="text-amber-700">In progress</span>
                  )}
                </li>
              ))}
            </ul>
            {best !== null && (
              <p className="mt-3 text-sm text-slate-600">
                Best score: <strong>{Math.round(best * 100)}%</strong>
              </p>
            )}
          </section>
        )}

        <div className="mt-10">
          {remaining > 0 ? (
            <form
              action={async () => {
                "use server";
                await startAttemptAction(quiz.id);
              }}
            >
              <button
                type="submit"
                className="px-6 py-3 bg-accent-gold text-white rounded font-semibold hover:opacity-90"
              >
                Start attempt ({remaining} of {quiz.maxAttempts} remaining)
              </button>
            </form>
          ) : (
            <p className="text-red-700 font-semibold">
              No attempts remaining. Contact your manager or the AI help desk.
            </p>
          )}
        </div>
      </main>
    </>
  );
}
