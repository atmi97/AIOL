import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { exportTierToRepo, importTierFromRepo } from "@/lib/content-sync";
import { prisma } from "@/lib/prisma";

async function importAction(tierId: string) {
  "use server";
  await requireAdmin();
  await importTierFromRepo(tierId);
  redirect(`/admin/sync?msg=Imported+${encodeURIComponent(tierId)}`);
}

async function exportAction(tierId: string) {
  "use server";
  await requireAdmin();
  const files = await exportTierToRepo(tierId);
  redirect(`/admin/sync?msg=${encodeURIComponent(`Wrote ${files.length} files to /content/${tierId}`)}`);
}

export default async function SyncPage({
  searchParams,
}: {
  searchParams: Promise<{ msg?: string }>;
}) {
  const sp = await searchParams;
  const tiers = await prisma.tier.findMany({ orderBy: { order: "asc" } });
  const editsCount = await prisma.contentEdit.count();

  return (
    <>
      <h1 className="text-2xl font-bold text-brand-800">Sync</h1>
      <p className="text-slate-600 mt-2 max-w-2xl text-sm">
        The repo (<code>/content/**</code>) is your portable backup of the content. Import to pull
        repo → DB; export to write DB → files for a reviewable git commit. Import is idempotent
        (upsert); Export overwrites files. {editsCount} admin edits logged so far.
      </p>

      {sp.msg && (
        <p className="mt-4 bg-accent-green/10 border border-accent-green/30 text-accent-green px-3 py-2 rounded text-sm">
          {sp.msg}
        </p>
      )}

      <div className="mt-8 space-y-4">
        {tiers.map((t) => (
          <div key={t.id} className="bg-white border rounded p-5 flex items-center justify-between">
            <div>
              <div className="font-semibold text-brand-800">{t.title}</div>
              <div className="text-xs text-slate-500 mt-1">
                <code>/content/{t.id}/</code>
              </div>
            </div>
            <div className="flex gap-3">
              <form
                action={async () => {
                  "use server";
                  await importAction(t.id);
                }}
              >
                <button
                  type="submit"
                  className="px-4 py-2 border border-brand-600 text-brand-700 rounded text-sm hover:bg-brand-50"
                >
                  Import from repo
                </button>
              </form>
              <form
                action={async () => {
                  "use server";
                  await exportAction(t.id);
                }}
              >
                <button
                  type="submit"
                  className="px-4 py-2 bg-brand-600 text-white rounded text-sm hover:bg-brand-700"
                >
                  Export to repo
                </button>
              </form>
            </div>
          </div>
        ))}
      </div>

      <section className="mt-10 bg-amber-50 border border-amber-200 rounded p-4 text-sm text-amber-900">
        <strong>Tip.</strong> For a reviewable git commit after clicking <em>Export to repo</em>,
        run <code>git add content/ &amp;&amp; git commit -m "content: admin edits"</code> in the
        deployment environment (or use a CI pipeline that opens a PR).
      </section>
    </>
  );
}
