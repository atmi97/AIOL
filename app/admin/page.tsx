import { prisma } from "@/lib/prisma";

export default async function AdminLearners() {
  const [users, tiers] = await Promise.all([
    prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        progress: { where: { completedAt: { not: null } } },
        attempts: { where: { completedAt: { not: null } } },
      },
    }),
    prisma.tier.findMany({ include: { modules: true, quizzes: true } }),
  ]);

  const primaryTier = tiers[0];
  const totalModules = primaryTier?.modules.length ?? 0;
  const quizId = primaryTier?.quizzes[0]?.id;

  return (
    <>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-brand-800">Learners</h1>
        <a
          href="/api/admin/export?format=csv"
          className="px-3 py-1.5 border border-brand-600 text-brand-700 rounded text-sm hover:bg-brand-50"
        >
          Export CSV
        </a>
      </div>

      <table className="mt-6 w-full bg-white border rounded text-sm">
        <thead className="bg-brand-50 text-brand-800">
          <tr>
            <th className="text-left px-4 py-2">Name / email</th>
            <th className="text-left px-4 py-2">Role</th>
            <th className="text-left px-4 py-2">Modules complete</th>
            <th className="text-left px-4 py-2">Best quiz</th>
            <th className="text-left px-4 py-2">Certified</th>
            <th className="text-left px-4 py-2">Joined</th>
          </tr>
        </thead>
        <tbody>
          {users.map((u) => {
            const completed = primaryTier
              ? u.progress.filter((p) =>
                  primaryTier.modules.some((m) => m.id === p.moduleId),
                ).length
              : 0;
            const quizAttempts = quizId
              ? u.attempts.filter((a) => a.quizId === quizId)
              : [];
            const best = quizAttempts.reduce((acc, a) => Math.max(acc, a.score ?? 0), 0);
            const passed = quizAttempts.some((a) => a.passed);
            return (
              <tr key={u.id} className="border-t">
                <td className="px-4 py-2">
                  <div className="font-medium">{u.name ?? "—"}</div>
                  <div className="text-xs text-slate-500">{u.email}</div>
                </td>
                <td className="px-4 py-2">
                  <span
                    className={`text-xs px-2 py-0.5 rounded font-semibold ${
                      u.role === "ADMIN"
                        ? "bg-accent-gold/20 text-accent-gold"
                        : "bg-slate-100 text-slate-700"
                    }`}
                  >
                    {u.role}
                  </span>
                </td>
                <td className="px-4 py-2">
                  {completed} / {totalModules}
                </td>
                <td className="px-4 py-2">
                  {quizAttempts.length === 0 ? "—" : `${Math.round(best * 100)}%`}
                </td>
                <td className="px-4 py-2">
                  {passed ? (
                    <span className="text-accent-green font-semibold">Yes</span>
                  ) : (
                    <span className="text-slate-500">No</span>
                  )}
                </td>
                <td className="px-4 py-2 text-xs text-slate-500">
                  {new Date(u.createdAt).toLocaleDateString("en-CA")}
                </td>
              </tr>
            );
          })}
          {users.length === 0 && (
            <tr>
              <td colSpan={6} className="px-4 py-8 text-center text-slate-500">
                No learners yet. Invite your pilot users to sign in.
              </td>
            </tr>
          )}
        </tbody>
      </table>

      <p className="mt-6 text-xs text-slate-500">
        Promote a learner to admin by updating <code>role=ADMIN</code> in the DB, or set{" "}
        <code>INITIAL_ADMIN_EMAIL</code> in env to auto-promote on sign-in.
      </p>
    </>
  );
}
