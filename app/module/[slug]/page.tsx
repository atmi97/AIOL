import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { recordModuleCompletion, recordModuleView } from "@/lib/xapi";
import { SiteHeader } from "@/components/site-header";
import { ModuleShell } from "@/components/mdx";
import { MODULE_REGISTRY } from "@/components/mdx/modules";

async function markComplete(moduleId: string) {
  "use server";
  const session = await auth();
  const userId = session.user.id;
  await prisma.moduleProgress.upsert({
    where: { userId_moduleId: { userId, moduleId } },
    create: { userId, moduleId, completedAt: new Date() },
    update: { completedAt: new Date() },
  });
  await recordModuleCompletion(userId, moduleId);
  redirect(`/module/${moduleId}`);
}

export default async function ModulePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const session = await auth();
  const userId = session.user.id;

  const mod = await prisma.module.findUnique({ where: { id: slug }, include: { tier: true } });
  if (!mod) {
    return (
      <>
        <SiteHeader />
        <div className="max-w-4xl mx-auto px-6 py-20 text-center text-slate-500">Module not found.</div>
      </>
    );
  }

  const entry = MODULE_REGISTRY[mod.id];
  if (!entry) {
    return (
      <>
        <SiteHeader />
        <div className="max-w-4xl mx-auto px-6 py-20 text-center text-slate-500">
          No interactive version available for this module yet.
        </div>
      </>
    );
  }

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

  const { meta, Content } = entry;

  return (
    <>
      <SiteHeader />
      <ModuleShell
        moduleNumber={meta.moduleNumber}
        title={meta.title}
        minutes={meta.minutes}
        sectionsCount={meta.sectionsCount}
        interactiveCount={meta.interactiveCount}
        objectives={meta.objectives}
        sections={meta.sections}
        prev={prev ? { href: `/module/${prev.id}`, label: `Module ${prev.moduleNumber} · ${prev.title}` } : undefined}
        next={next ? { href: `/module/${next.id}`, label: `Module ${next.moduleNumber} · ${next.title}` } : undefined}
        completionSlot={
          <form
            action={async () => {
              "use server";
              await markComplete(mod.id);
            }}
            className="flex items-center justify-between gap-4 flex-wrap"
          >
            <div className="text-sm text-slate-600">
              {progress?.completedAt ? (
                <span className="inline-flex items-center gap-2 text-emerald-700 font-semibold">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" /> Completed
                </span>
              ) : (
                "Finished this module? Mark it complete to unlock the next one."
              )}
            </div>
            <button
              type="submit"
              className={`px-5 py-2.5 rounded-lg font-semibold transition ${
                progress?.completedAt
                  ? "bg-emerald-600 text-white hover:bg-emerald-700"
                  : "bg-gradient-to-br from-brand-500 to-brand-700 text-white shadow-md hover:shadow-lg"
              }`}
            >
              {progress?.completedAt ? "Re-mark complete" : "Mark complete ✓"}
            </button>
          </form>
        }
      >
        <Content />
      </ModuleShell>
    </>
  );
}
