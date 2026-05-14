import { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { startAttempt } from "@/lib/quiz";

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const session = await auth();
  const userId = session.user.id;
  const { attempt } = await startAttempt(userId, slug);
  return new Response(null, {
    status: 303,
    headers: { Location: `/quiz/${slug}/attempt/${attempt.id}` },
  });
}
