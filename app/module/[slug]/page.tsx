import Link from "next/link";
import { redirect } from "next/navigation";
import { MDXRemote } from "next-mdx-remote/rsc";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { recordModuleCompletion, recordModuleView } from "@/lib/xapi";
import { SiteHeader } from "@/components/site-header";

async function markComplete(moduleId: string) {
  "use server";
  const session = await auth();
  if (!session?.user) throw new Error("Not authenticated");
  const userId = (session.user as any).id as string;
  await prisma.moduleProgress.upsert({
    where: { userId_moduleId: { userId, moduleId } },
    create: { userId, moduleId, completedAt: new Date() },
    update: { completedAt: new Date() },
  });
  await recordModuleCompletion(userId, moduleId);
}

export default async function ModulePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const session = await auth();
  if (!session?.user) redirect(`/signin?callbackUrl=/module/${slug}`);
  const userId = (session.user as any).id as string;

  const mod = await prisma.module.findUnique({
    where: { id: slug },
    include: { tier: true },
  });
  if (!mod) return <div className="p-10">Module not found.</div>;

  // Record view
  await prisma.moduleProgress.upsert({
    where: { userId_moduleId: { userId, moduleId: mod.id } },
    create: { userId, moduleId: mod.id },
    update: { lastViewed: new Date() },
  });
  await recordModuleView(userId, mod.id);

  const progress = await prisma.moduleProgress.findUnique({
    where: { userId_moduleId: { userId, moduleId: mod.id } },
  });

  const allModules = await prisma.module.findMany({
    where: { tierId: mod.tierId },
    orderBy: { order: "asc" },
  });
  const idx = allModules.findIndex((m) => m.id === mod.id);
  const prev = idx > 0 ? allModules[idx - 1] : null;
  const next = idx < allModules.length - 1 ? allModules[idx + 1] : null;

  const objectives = JSON.parse(mod.objectivesJson) as string[];

  return (
    <>
      <SiteHeader />
      <main className="max-w-4xl mx-auto px-6 py-10">
        <div className="text-sm text-slate-500 mb-4">
          <Link href={`/tier/${mod.tierId}`} className="hover:underline">
            {mod.tier.title}
          </Link>{" "}
          / Module {mod.moduleNumber}
        </div>
        <h1 className="text-3xl font-bold text-brand-800">{mod.title}</h1>
        <p className="text-slate-500 text-sm mt-1">~{mod.estMinutes} minutes</p>

        <section className="mt-6 bg-brand-50 border border-brand-100 rounded p-5">
          <h2 className="text-sm font-semibold text-brand-700 uppercase tracking-wide">
            Learning objectives
          </h2>
          <ul className="mt-2 list-disc pl-5 text-slate-800 text-sm space-y-1">
            {objectives.map((o) => (
              <li key={o}>{o}</li>
            ))}
          </ul>
        </section>

        <article className="prose-aiol mt-10">
          <MDXRemote source={mod.bodyMdx} />
        </article>

        <div className="mt-12 pt-6 border-t flex items-center justify-between flex-wrap gap-4">
          {prev ? (
            <Link
              href={`/module/${prev.id}`}
              className="text-brand-700 hover:underline text-sm"
            >
              ← {prev.title}
            </Link>
          ) : (
            <span />
          )}

          <form
            action={async () => {
              "use server";
              await markComplete(mod.id);
            }}
          >
            <button
              type="submit"
              className={`px-5 py-2.5 rounded font-semibold ${
                progress?.completedAt
                  ? "bg-accent-green text-white"
                  : "bg-brand-600 text-white hover:bg-brand-700"
              }`}
            >
              {progress?.completedAt ? "Completed ✓" : "Mark complete"}
            </button>
          </form>

          {next ? (
            <Link
              href={`/module/${next.id}`}
              className="text-brand-700 hover:underline text-sm"
            >
              {next.title} →
            </Link>
          ) : (
            <Link href={`/tier/${mod.tierId}`} className="text-brand-700 hover:underline text-sm">
              Back to Tier overview →
            </Link>
          )}
        </div>
      </main>
    </>
  );
}
