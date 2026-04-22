import { redirect } from "next/navigation";
import { MDXRemote } from "next-mdx-remote/rsc";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

async function saveModule(moduleId: string, formData: FormData) {
  "use server";
  const admin = await requireAdmin();
  const title = String(formData.get("title") ?? "").trim();
  const estMinutes = Number(formData.get("estMinutes") ?? 0);
  const objectivesRaw = String(formData.get("objectives") ?? "").trim();
  const bodyMdx = String(formData.get("bodyMdx") ?? "");

  const objectives = objectivesRaw
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean);

  const before = await prisma.module.findUnique({ where: { id: moduleId } });
  if (!before) throw new Error("Module not found");

  const updated = await prisma.module.update({
    where: { id: moduleId },
    data: {
      title,
      estMinutes,
      objectivesJson: JSON.stringify(objectives),
      bodyMdx,
      version: { increment: 1 },
      updatedById: admin.id,
    },
  });

  await prisma.contentEdit.create({
    data: {
      entityType: "module",
      entityId: moduleId,
      editedById: admin.id,
      diffJson: JSON.stringify({
        before: {
          title: before.title,
          estMinutes: before.estMinutes,
          objectives: JSON.parse(before.objectivesJson),
          bodyLength: before.bodyMdx.length,
        },
        after: {
          title: updated.title,
          estMinutes: updated.estMinutes,
          objectives,
          bodyLength: bodyMdx.length,
        },
      }),
    },
  });
  redirect(`/admin/content/${encodeURIComponent(moduleId)}?saved=1`);
}

export default async function EditModulePage({
  params,
  searchParams,
}: {
  params: Promise<{ moduleId: string }>;
  searchParams: Promise<{ saved?: string; preview?: string }>;
}) {
  const { moduleId } = await params;
  const sp = await searchParams;
  const mod = await prisma.module.findUnique({ where: { id: moduleId } });
  if (!mod) return <div>Module not found.</div>;

  const objectives = JSON.parse(mod.objectivesJson) as string[];
  const showPreview = sp.preview === "1";

  return (
    <>
      <h1 className="text-2xl font-bold text-brand-800">
        Edit Module {mod.moduleNumber} — {mod.title}
      </h1>
      <p className="text-sm text-slate-500 mt-1">
        v{mod.version} · Updated {new Date(mod.updatedAt).toLocaleString("en-CA")}
      </p>
      {sp.saved && (
        <p className="mt-3 bg-accent-green/10 border border-accent-green/30 text-accent-green px-3 py-2 rounded text-sm">
          Saved. Version bumped.
        </p>
      )}

      <div className="mt-6 grid lg:grid-cols-2 gap-6">
        <form
          action={async (fd: FormData) => {
            "use server";
            await saveModule(moduleId, fd);
          }}
          className="space-y-4"
        >
          <div>
            <label className="block text-sm font-medium text-slate-700">Title</label>
            <input
              name="title"
              defaultValue={mod.title}
              required
              className="mt-1 w-full border rounded px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">
              Estimated minutes
            </label>
            <input
              name="estMinutes"
              type="number"
              min={0}
              defaultValue={mod.estMinutes}
              className="mt-1 w-full border rounded px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">
              Objectives (one per line)
            </label>
            <textarea
              name="objectives"
              rows={5}
              defaultValue={objectives.join("\n")}
              className="mt-1 w-full border rounded px-3 py-2 text-sm font-mono"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">MDX body</label>
            <textarea
              name="bodyMdx"
              rows={24}
              defaultValue={mod.bodyMdx}
              className="mt-1 w-full border rounded px-3 py-2 text-sm font-mono"
            />
          </div>
          <div className="flex gap-3">
            <button
              type="submit"
              className="px-5 py-2 bg-brand-600 text-white rounded hover:bg-brand-700"
            >
              Save changes
            </button>
            <a
              href={`/admin/content/${encodeURIComponent(mod.id)}?preview=${showPreview ? "" : "1"}`}
              className="px-5 py-2 border border-brand-600 text-brand-700 rounded hover:bg-brand-50"
            >
              {showPreview ? "Hide preview" : "Show preview"}
            </a>
            <a
              href={`/module/${mod.id}`}
              className="px-5 py-2 text-slate-700 hover:underline"
              target="_blank"
              rel="noreferrer"
            >
              Open learner view ↗
            </a>
          </div>
        </form>

        {showPreview && (
          <div className="bg-white border rounded p-5">
            <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wide">
              Preview (saved version)
            </h3>
            <article className="prose-aiol mt-3">
              <MDXRemote source={mod.bodyMdx} />
            </article>
          </div>
        )}
      </div>
    </>
  );
}
