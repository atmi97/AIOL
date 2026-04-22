import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { submitAttempt } from "@/lib/quiz";
import { SiteHeader } from "@/components/site-header";
import { AttemptForm } from "@/components/attempt-form";

async function submitAction(attemptId: string, formData: FormData) {
  "use server";
  const session = await auth();
  if (!session?.user) throw new Error("Not authenticated");
  const userId = (session.user as any).id as string;

  const answers: Record<string, string[]> = {};
  for (const [key, value] of formData.entries()) {
    if (!key.startsWith("q:")) continue;
    const qId = key.slice(2);
    if (!answers[qId]) answers[qId] = [];
    answers[qId].push(String(value));
  }

  const attempt = await prisma.quizAttempt.findUnique({ where: { id: attemptId } });
  if (!attempt) throw new Error("Attempt not found");
  await submitAttempt({ userId, attemptId, answers });
  redirect(`/quiz/${attempt.quizId}/attempt/${attemptId}/result`);
}

export default async function AttemptPage({
  params,
}: {
  params: Promise<{ slug: string; attemptId: string }>;
}) {
  const { slug, attemptId } = await params;
  const session = await auth();
  if (!session?.user) redirect(`/signin?callbackUrl=/quiz/${slug}/attempt/${attemptId}`);
  const userId = (session.user as any).id as string;

  const attempt = await prisma.quizAttempt.findUnique({
    where: { id: attemptId },
    include: { quiz: { include: { questions: true } } },
  });
  if (!attempt || attempt.userId !== userId) return <div className="p-10">Attempt not found.</div>;

  if (attempt.completedAt) redirect(`/quiz/${slug}/attempt/${attemptId}/result`);

  // Enforce time limit on server.
  if (new Date() > attempt.expiresAt) {
    await submitAttempt({ userId, attemptId, answers: {} });
    redirect(`/quiz/${slug}/attempt/${attemptId}/result`);
  }

  const questionIds = JSON.parse(attempt.questionIds) as string[];
  const questionsRaw = attempt.quiz.questions.filter((q) => questionIds.includes(q.id));
  const ordered = questionIds
    .map((id) => questionsRaw.find((q) => q.id === id))
    .filter(Boolean) as typeof questionsRaw;

  // Prepare client-safe question objects (strip correct answers + rationale).
  const questionsForClient = ordered.map((q) => {
    const opts = JSON.parse(q.optionsJson) as { id: string; text: string }[];
    const displayOptions = attempt.quiz.shuffleOptions ? opts : opts;
    return {
      id: q.id,
      moduleRef: q.moduleRef,
      type: q.type,
      prompt: q.prompt,
      options: displayOptions,
    };
  });

  return (
    <>
      <SiteHeader />
      <main className="max-w-3xl mx-auto px-6 py-8">
        <h1 className="text-2xl font-bold text-brand-800">{attempt.quiz.title}</h1>
        <p className="text-sm text-slate-500 mt-1">
          {questionsForClient.length} questions · Time limit{" "}
          {attempt.quiz.timeLimitMinutes} minutes
        </p>

        <AttemptForm
          attemptId={attempt.id}
          expiresAtIso={attempt.expiresAt.toISOString()}
          questions={questionsForClient}
          action={submitAction.bind(null, attempt.id)}
        />
      </main>
    </>
  );
}
