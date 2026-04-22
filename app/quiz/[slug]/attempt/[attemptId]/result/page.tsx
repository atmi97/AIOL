import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { SiteHeader } from "@/components/site-header";

export default async function ResultPage({
  params,
}: {
  params: Promise<{ slug: string; attemptId: string }>;
}) {
  const { slug, attemptId } = await params;
  const session = await auth();
  if (!session?.user) redirect(`/signin?callbackUrl=/quiz/${slug}`);
  const userId = (session.user as any).id as string;

  const attempt = await prisma.quizAttempt.findUnique({
    where: { id: attemptId },
    include: { quiz: { include: { questions: true } } },
  });
  if (!attempt || attempt.userId !== userId) return <div className="p-10">Attempt not found.</div>;

  const responses = JSON.parse(attempt.responsesJson) as {
    questionId: string;
    answer: string[];
    correct: boolean;
  }[];
  const byId = new Map(attempt.quiz.questions.map((q) => [q.id, q]));
  const correctCount = responses.filter((r) => r.correct).length;
  const total = responses.length;
  const pct = total === 0 ? 0 : Math.round((attempt.score ?? 0) * 100);

  return (
    <>
      <SiteHeader />
      <main className="max-w-3xl mx-auto px-6 py-10">
        <div className="text-sm text-slate-500 mb-2">
          <Link href={`/tier/${attempt.quiz.tierId}`} className="hover:underline">
            Tier overview
          </Link>{" "}
          / Result
        </div>
        <h1 className="text-3xl font-bold text-brand-800">{attempt.quiz.title} — Result</h1>
        <div
          className={`mt-6 rounded-lg p-6 ${
            attempt.passed
              ? "bg-accent-green/10 border border-accent-green/30"
              : "bg-red-50 border border-red-200"
          }`}
        >
          <div className="text-5xl font-bold">
            {pct}%
            <span className="text-base font-normal text-slate-600 ml-3">
              ({correctCount} of {total} correct)
            </span>
          </div>
          <p
            className={`mt-2 text-lg font-semibold ${
              attempt.passed ? "text-accent-green" : "text-red-700"
            }`}
          >
            {attempt.passed
              ? "Passed — congratulations!"
              : `Did not pass. ${Math.round(attempt.quiz.passThreshold * 100)}% required.`}
          </p>
        </div>

        <section className="mt-10">
          <h2 className="text-xl font-semibold text-brand-800 mb-3">Per-question feedback</h2>
          <ol className="space-y-3">
            {responses.map((r, i) => {
              const q = byId.get(r.questionId);
              if (!q) return null;
              const options = JSON.parse(q.optionsJson) as { id: string; text: string }[];
              const correct = JSON.parse(q.correctJson) as string[];
              return (
                <li
                  key={r.questionId}
                  className={`bg-white rounded border p-4 ${
                    r.correct ? "border-accent-green/30" : "border-red-200"
                  }`}
                >
                  <div className="flex items-start gap-2">
                    <span
                      className={`text-xs font-bold px-2 py-0.5 rounded ${
                        r.correct ? "bg-accent-green/10 text-accent-green" : "bg-red-100 text-red-700"
                      }`}
                    >
                      {r.correct ? "Correct" : "Incorrect"}
                    </span>
                    <div className="flex-grow">
                      <p className="text-sm font-medium text-slate-900">
                        {i + 1}. {q.prompt}
                      </p>
                      <ul className="mt-2 text-sm space-y-1">
                        {options.map((o) => {
                          const isCorrect = correct.includes(o.id);
                          const isChosen = r.answer.includes(o.id);
                          return (
                            <li
                              key={o.id}
                              className={`px-2 py-1 rounded ${
                                isCorrect
                                  ? "bg-accent-green/10 text-accent-green"
                                  : isChosen
                                    ? "bg-red-50 text-red-800"
                                    : "text-slate-700"
                              }`}
                            >
                              {isCorrect ? "✓ " : isChosen ? "✗ " : "  "}
                              {o.text}
                            </li>
                          );
                        })}
                      </ul>
                      {q.rationale && (
                        <p className="mt-2 text-xs text-slate-600 italic">
                          <strong>Why:</strong> {q.rationale}
                        </p>
                      )}
                    </div>
                  </div>
                </li>
              );
            })}
          </ol>
        </section>

        <div className="mt-10 flex gap-3">
          <Link
            href={`/tier/${attempt.quiz.tierId}`}
            className="px-5 py-2.5 rounded border border-brand-600 text-brand-700 hover:bg-brand-50"
          >
            Back to Tier overview
          </Link>
          {!attempt.passed && (
            <Link
              href={`/quiz/${attempt.quizId}`}
              className="px-5 py-2.5 rounded bg-brand-600 text-white hover:bg-brand-700"
            >
              Try again
            </Link>
          )}
        </div>
      </main>
    </>
  );
}
