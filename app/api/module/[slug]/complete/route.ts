import { NextRequest } from "next/server";
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

  const mod = await prisma.module.findUnique({ where: { id: slug } });
  if (!mod) {
    return new Response(null, { status: 303, headers: { Location: "/tier/tier1" } });
  }

  await prisma.moduleProgress.upsert({
    where: { userId_moduleId: { userId, moduleId: slug } },
    create: { userId, moduleId: slug, completedAt: new Date() },
    update: { completedAt: new Date() },
  });
  await recordModuleCompletion(userId, slug);

  // Look up the next module in tier order; if last, send back to the tier overview.
  const siblings = await prisma.module.findMany({
    where: { tierId: mod.tierId },
    orderBy: { order: "asc" },
    select: { id: true },
  });
  const idx = siblings.findIndex((m) => m.id === slug);
  const nextMod = idx >= 0 && idx < siblings.length - 1 ? siblings[idx + 1] : null;
  const destination = nextMod ? `/module/${nextMod.id}` : `/tier/${mod.tierId}`;

  return new Response(null, {
    status: 303,
    headers: { Location: destination },
  });
}
