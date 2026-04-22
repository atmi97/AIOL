import Link from "next/link";
import { prisma } from "@/lib/prisma";

export default async function AdminQuizList() {
  const quizzes = await prisma.quiz.findMany({
    include: { questions: true, tier: true },
    orderBy: { tierId: "asc" },
  });

  return (
    <>
      <h1 className="text-2xl font-bold text-brand-800">Quizzes</h1>

      <ul className="mt-6 space-y-3">
        {quizzes.map((q) => (
          <li key={q.id} className="bg-white border rounded p-5">
            <div className="flex justify-between flex-wrap gap-3 items-start">
              <div>
                <div className="font-semibold text-brand-800">
                  {q.tier.title} — {q.title}
                </div>
                <div className="text-xs text-slate-500 mt-1">
                  {q.questions.length} questions · {q.questionsPerAttempt} per attempt · pass{" "}
                  {Math.round(q.passThreshold * 100)}% · {q.maxAttempts} attempts allowed · {q.timeLimitMinutes} min
                </div>
              </div>
              <Link
                href={`/admin/quizzes/${encodeURIComponent(q.id)}`}
                className="text-sm px-3 py-1.5 rounded border border-brand-600 text-brand-700 hover:bg-brand-50"
              >
                Edit quiz settings + questions
              </Link>
            </div>
          </li>
        ))}
      </ul>
    </>
  );
}
