import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { SiteHeader } from "@/components/site-header";

export default async function MePage() {
  const session = await auth();
  if (!session?.user) redirect("/signin?callbackUrl=/me");
  const userId = (session.user as any).id as string;

  const user = await prisma.user.findUnique({ where: { id: userId } });
  const tiers = await prisma.tier.findMany({
    include: { modules: true, quizzes: true },
    orderBy: { order: "asc" },
  });
  const progress = await prisma.moduleProgress.findMany({ where: { userId } });
  const attempts = await prisma.quizAttempt.findMany({
    where: { userId, completedAt: { not: null } },
    orderBy: { startedAt: "desc" },
  });

  return (
    <>
      <SiteHeader />
      <main className="max-w-4xl mx-auto px-6 py-10">
        <h1 className="text-3xl font-bold text-brand-800">My progress</h1>
        <p className="text-slate-600 text-sm mt-1">
          Signed in as {user?.name ?? user?.email}
        </p>

        {tiers.map((t) => {
          const completed = progress.filter(
            (p) => p.completedAt && t.modules.some((m) => m.id === p.moduleId),
          ).length;
          const pct = t.modules.length === 0 ? 0 : Math.round((completed / t.modules.length) * 100);
          const quiz = t.quizzes[0];
          const tierAttempts = attempts.filter((a) => a.quizId === quiz?.id);
          const best = tierAttempts.reduce((acc, a) => Math.max(acc, a.score ?? 0), 0);
          const passed = tierAttempts.some((a) => a.passed);
          return (
            <section key={t.id} className="mt-8 bg-white border rounded-lg p-5">
              <div className="flex items-baseline justify-between flex-wrap gap-3">
                <h2 className="text-xl font-semibold text-brand-800">{t.title}</h2>
                <Link
                  href={`/tier/${t.id}`}
                  className="text-sm text-brand-700 hover:underline"
                >
                  Open tier →
                </Link>
              </div>
              <div className="mt-3 w-full bg-slate-200 rounded-full h-2">
                <div className="bg-brand-600 h-2 rounded-full" style={{ width: `${pct}%` }} />
              </div>
              <div className="mt-3 text-sm text-slate-700">
                {completed} of {t.modules.length} modules complete ({pct}%)
              </div>
              {quiz && tierAttempts.length > 0 && (
                <div className="mt-3 text-sm">
                  Best assessment score:{" "}
                  <strong>{Math.round(best * 100)}%</strong>{" "}
                  {passed ? (
                    <span className="ml-2 text-accent-green font-semibold">Certified</span>
                  ) : (
                    <span className="ml-2 text-red-700">Not yet passed</span>
                  )}
                </div>
              )}
            </section>
          );
        })}

        {attempts.length > 0 && (
          <section className="mt-10">
            <h2 className="text-xl font-semibold text-brand-800">Quiz attempt history</h2>
            <ul className="mt-3 space-y-2">
              {attempts.map((a) => (
                <li
                  key={a.id}
                  className="bg-white border rounded p-3 text-sm flex items-center justify-between"
                >
                  <span>
                    {a.quizId} —{" "}
                    {new Date(a.startedAt).toLocaleString("en-CA", {
                      dateStyle: "medium",
                      timeStyle: "short",
                    })}
                  </span>
                  <span
                    className={`font-semibold ${
                      a.passed ? "text-accent-green" : "text-red-700"
                    }`}
                  >
                    {Math.round((a.score ?? 0) * 100)}% {a.passed ? "· Pass" : "· Fail"}
                  </span>
                </li>
              ))}
            </ul>
          </section>
        )}
      </main>
    </>
  );
}
