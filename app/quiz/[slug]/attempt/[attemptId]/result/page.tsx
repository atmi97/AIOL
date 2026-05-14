import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { SiteHeader } from "@/components/site-header";

export default async function ResultPage({
  params,
}: {
  params: Promise<{ slug: string; attemptId: string }>;
}) {
  const { attemptId } = await params;
  const session = await auth();
  const userId = session.user.id;

  const attempt = await prisma.quizAttempt.findUnique({
    where: { id: attemptId },
    include: { quiz: { include: { questions: true, tier: true } } },
  });
  if (!attempt || attempt.userId !== userId) {
    return (
      <>
        <SiteHeader />
        <div className="max-w-4xl mx-auto px-6 py-20 text-center text-slate-500">Attempt not found.</div>
      </>
    );
  }

  const responses = JSON.parse(attempt.responsesJson) as {
    questionId: string;
    answer: string[];
    correct: boolean;
  }[];
  const byId = new Map(attempt.quiz.questions.map((q) => [q.id, q]));
  const correctCount = responses.filter((r) => r.correct).length;
  const total = responses.length;
  const score = attempt.score ?? 0;
  const pct = Math.round(score * 100);
  const elapsedSec = attempt.completedAt
    ? Math.round((attempt.completedAt.getTime() - attempt.startedAt.getTime()) / 1000)
    : 0;
  const elapsedMm = Math.floor(elapsedSec / 60);
  const elapsedSs = String(elapsedSec % 60).padStart(2, "0");
  const unanswered = responses.filter((r) => r.answer.length === 0).length;

  return (
    <>
      <SiteHeader />
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white text-slate-800">
        <div className="max-w-4xl mx-auto px-6 py-10">
          <div className="flex items-center gap-3 text-xs font-medium text-brand-700 uppercase tracking-wider">
            <Link href={`/tier/${attempt.quiz.tierId}`} className="hover:underline">
              {attempt.quiz.tier.title}
            </Link>
            <span className="text-slate-300">/</span>
            <span className="text-slate-500">Attempt result</span>
          </div>

          <div
            className={`mt-4 rounded-2xl border p-6 ${
              attempt.passed
                ? "bg-gradient-to-br from-emerald-50 to-emerald-100/40 border-emerald-200"
                : "bg-gradient-to-br from-rose-50 to-rose-100/40 border-rose-200"
            }`}
          >
            <div
              className={`text-[11px] font-semibold uppercase tracking-wider ${
                attempt.passed ? "text-emerald-700" : "text-rose-700"
              }`}
            >
              Attempt complete
            </div>
            <div className="mt-2 flex items-end gap-4 flex-wrap">
              <div>
                <div
                  className={`text-5xl font-bold tabular-nums ${
                    attempt.passed ? "text-emerald-800" : "text-rose-800"
                  }`}
                >
                  {pct}%
                </div>
                <div className="text-sm text-slate-600 mt-1">
                  {correctCount} of {total} correct
                </div>
              </div>
              <div
                className={`px-4 py-2 rounded-full text-sm font-semibold ${
                  attempt.passed ? "bg-emerald-600 text-white" : "bg-rose-600 text-white"
                }`}
              >
                {attempt.passed ? "Passed" : "Did not pass"}
              </div>
            </div>
            <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
              <ResultStat
                label="Pass threshold"
                value={`${Math.round(attempt.quiz.passThreshold * 100)}%`}
              />
              <ResultStat
                label="Required correct"
                value={`${Math.ceil(total * attempt.quiz.passThreshold)}`}
              />
              <ResultStat label="Time taken" value={`${elapsedMm}:${elapsedSs}`} />
              <ResultStat label="Unanswered" value={`${unanswered}`} />
            </div>
          </div>

          <div className="mt-8">
            <h2 className="text-lg font-bold text-slate-900">Question review</h2>
            <p className="mt-1 text-sm text-slate-600">
              Click any question to expand the rationale.
            </p>
            <div className="mt-4 space-y-3">
              {responses.map((r, i) => {
                const q = byId.get(r.questionId);
                if (!q) return null;
                const options = JSON.parse(q.optionsJson) as { id: string; text: string }[];
                const correct = JSON.parse(q.correctJson) as string[];
                const chosenOpt = options.find((o) => r.answer.includes(o.id));
                const correctOpt = options.find((o) => correct.includes(o.id));
                const skipped = r.answer.length === 0;
                return (
                  <details
                    key={r.questionId}
                    className="group rounded-xl border border-slate-200 bg-white overflow-hidden"
                  >
                    <summary className="px-5 py-4 cursor-pointer list-none flex items-start gap-3 hover:bg-slate-50 transition">
                      <span
                        className={`shrink-0 w-7 h-7 rounded-full text-xs font-semibold flex items-center justify-center ${
                          skipped
                            ? "bg-slate-100 text-slate-500"
                            : r.correct
                            ? "bg-emerald-100 text-emerald-800"
                            : "bg-rose-100 text-rose-800"
                        }`}
                      >
                        {skipped ? "—" : r.correct ? "✓" : "✗"}
                      </span>
                      <div className="flex-1 min-w-0">
                        <div className="text-[11px] font-semibold text-brand-600 uppercase tracking-wider">
                          Question {i + 1}
                          {q.moduleRef && (
                            <span className="ml-2 text-slate-500 font-normal">· {q.moduleRef}</span>
                          )}
                        </div>
                        <div className="mt-0.5 text-sm text-slate-800">{q.prompt}</div>
                      </div>
                      <span className="text-brand-600 group-open:rotate-45 transition-transform">+</span>
                    </summary>
                    <div className="px-5 pb-5 pt-0 space-y-3 text-sm">
                      {chosenOpt && (
                        <div
                          className={`rounded-lg p-3 border ${
                            r.correct
                              ? "bg-emerald-50 border-emerald-200 text-emerald-900"
                              : "bg-rose-50 border-rose-200 text-rose-900"
                          }`}
                        >
                          <div className="text-[11px] font-semibold uppercase tracking-wider mb-1">
                            Your answer
                          </div>
                          {chosenOpt.text}
                        </div>
                      )}
                      {skipped && (
                        <div className="rounded-lg p-3 border bg-slate-50 border-slate-200 text-slate-700">
                          <div className="text-[11px] font-semibold uppercase tracking-wider mb-1">
                            You did not answer this question
                          </div>
                        </div>
                      )}
                      {!r.correct && correctOpt && (
                        <div className="rounded-lg p-3 border bg-emerald-50 border-emerald-200 text-emerald-900">
                          <div className="text-[11px] font-semibold uppercase tracking-wider mb-1">
                            Correct answer
                          </div>
                          {correctOpt.text}
                        </div>
                      )}
                      {q.rationale && (
                        <div className="rounded-lg p-3 bg-slate-50 border border-slate-200 text-slate-700">
                          <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 mb-1">
                            Rationale
                          </div>
                          {q.rationale}
                        </div>
                      )}
                    </div>
                  </details>
                );
              })}
            </div>
          </div>

          <div className="mt-10 pt-6 border-t border-slate-200 flex items-center justify-between flex-wrap gap-3">
            <Link
              href={`/tier/${attempt.quiz.tierId}`}
              className="text-sm text-slate-500 hover:text-brand-700"
            >
              ← Back to Tier overview
            </Link>
            {!attempt.passed && (
              <Link
                href={`/quiz/${attempt.quizId}`}
                className="px-6 py-2.5 rounded-lg bg-gradient-to-br from-brand-500 to-brand-700 text-white font-semibold shadow-md hover:shadow-lg transition"
              >
                Try again →
              </Link>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

function ResultStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-white/60 border border-white px-3 py-2">
      <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
        {label}
      </div>
      <div className="text-base font-bold text-slate-900 tabular-nums">{value}</div>
    </div>
  );
}
