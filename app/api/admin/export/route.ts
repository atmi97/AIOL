import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  await requireAdmin();

  const users = await prisma.user.findMany({
    include: {
      progress: { where: { completedAt: { not: null } } },
      attempts: { where: { completedAt: { not: null } }, orderBy: { score: "desc" } },
    },
  });

  const header = [
    "user_id",
    "email",
    "name",
    "role",
    "modules_completed",
    "quiz_best_score_pct",
    "quiz_passed",
    "quiz_attempts_used",
    "last_attempt_at",
    "created_at",
  ];

  const rows = users.map((u) => {
    const best = u.attempts.reduce((acc, a) => Math.max(acc, a.score ?? 0), 0);
    const passed = u.attempts.some((a) => a.passed);
    const last = u.attempts[0]?.startedAt;
    return [
      u.id,
      u.email,
      u.name ?? "",
      u.role,
      u.progress.length,
      u.attempts.length === 0 ? "" : Math.round(best * 100),
      passed ? "yes" : "no",
      u.attempts.length,
      last ? new Date(last).toISOString() : "",
      new Date(u.createdAt).toISOString(),
    ];
  });

  const csv = [header, ...rows]
    .map((r) => r.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","))
    .join("\n");

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": `attachment; filename="aiol-learners-${new Date()
        .toISOString()
        .slice(0, 10)}.csv"`,
    },
  });
}
