import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { submitAttempt } from "@/lib/quiz";
import { SiteHeader } from "@/components/site-header";
import { AttemptForm } from "@/components/attempt-form";

export default async function AttemptPage({
  params,
}: {
  params: Promise<{ slug: string; attemptId: string }>;
}) {
  const { slug, attemptId } = await params;
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

  if (attempt.completedAt) redirect(`/quiz/${slug}/attempt/${attemptId}/result`);

  if (new Date() > attempt.expiresAt) {
    await submitAttempt({ userId, attemptId, answers: {} });
    redirect(`/quiz/${slug}/attempt/${attemptId}/result`);
  }

  const questionIds = JSON.parse(attempt.questionIds) as string[];
  const questionsRaw = attempt.quiz.questions.filter((q) => questionIds.includes(q.id));
  const ordered = questionIds
    .map((id) => questionsRaw.find((q) => q.id === id))
    .filter(Boolean) as typeof questionsRaw;

  const questionsForClient = ordered.map((q) => {
    const opts = JSON.parse(q.optionsJson) as { id: string; text: string }[];
    return { id: q.id, moduleRef: q.moduleRef, type: q.type, prompt: q.prompt, options: opts };
  });

  return (
    <>
      <SiteHeader />
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white text-slate-800">
        <div className="max-w-3xl mx-auto px-6 py-10">
          <div className="flex items-center gap-3 text-xs font-medium text-brand-700 uppercase tracking-wider">
            <Link href={`/tier/${attempt.quiz.tierId}`} className="hover:underline">
              {attempt.quiz.tier.title}
            </Link>
            <span className="text-slate-300">/</span>
            <span className="text-slate-500">Attempt in progress</span>
          </div>
          <h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-900">
            {attempt.quiz.title}
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            {questionsForClient.length} questions · {attempt.quiz.timeLimitMinutes} minute time limit
          </p>

          <AttemptForm
            attemptId={attempt.id}
            submitUrl={`/api/quiz/${slug}/attempt/${attempt.id}/submit`}
            expiresAtIso={attempt.expiresAt.toISOString()}
            questions={questionsForClient}
          />
        </div>
      </div>
    </>
  );
}
