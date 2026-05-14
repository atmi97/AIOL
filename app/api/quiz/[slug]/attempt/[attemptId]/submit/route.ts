import { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { submitAttempt } from "@/lib/quiz";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string; attemptId: string }> },
) {
  const { slug, attemptId } = await params;
  const session = await auth();
  const userId = session.user.id;

  const formData = await req.formData();
  const answers: Record<string, string[]> = {};
  for (const [key, value] of formData.entries()) {
    if (!key.startsWith("q:")) continue;
    const qId = key.slice(2);
    if (!answers[qId]) answers[qId] = [];
    answers[qId].push(String(value));
  }

  await submitAttempt({ userId, attemptId, answers });

  return new Response(null, {
    status: 303,
    headers: { Location: `/quiz/${slug}/attempt/${attemptId}/result` },
  });
}
