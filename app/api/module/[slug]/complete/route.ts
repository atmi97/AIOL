import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { recordModuleCompletion } from "@/lib/xapi";

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const session = await auth();
  const userId = session.user.id;

  await prisma.moduleProgress.upsert({
    where: { userId_moduleId: { userId, moduleId: slug } },
    create: { userId, moduleId: slug, completedAt: new Date() },
    update: { completedAt: new Date() },
  });
  await recordModuleCompletion(userId, slug);

  return NextResponse.redirect(new URL(`/module/${slug}`, _req.url), { status: 303 });
}
