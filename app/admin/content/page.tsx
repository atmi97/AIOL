import Link from "next/link";
import { prisma } from "@/lib/prisma";

export default async function AdminContentList() {
  const tiers = await prisma.tier.findMany({
    include: { modules: { orderBy: { order: "asc" } } },
    orderBy: { order: "asc" },
  });

  return (
    <>
      <h1 className="text-2xl font-bold text-brand-800">Content</h1>
      <p className="text-slate-600 text-sm mt-1">
        Edit module metadata and MDX body. Changes are versioned and logged in ContentEdit.
      </p>

      {tiers.map((t) => (
        <section key={t.id} className="mt-8">
          <h2 className="text-xl font-semibold text-brand-700">{t.title}</h2>
          <ul className="mt-3 space-y-2">
            {t.modules.map((m) => (
              <li
                key={m.id}
                className="bg-white border rounded p-4 flex items-center justify-between"
              >
                <div>
                  <div className="font-medium">
                    Module {m.moduleNumber} — {m.title}
                  </div>
                  <div className="text-xs text-slate-500 mt-0.5">
                    {m.estMinutes} min · v{m.version} · updated{" "}
                    {new Date(m.updatedAt).toLocaleString("en-CA")}
                  </div>
                </div>
                <Link
                  href={`/admin/content/${encodeURIComponent(m.id)}`}
                  className="text-sm px-3 py-1.5 rounded border border-brand-600 text-brand-700 hover:bg-brand-50"
                >
                  Edit
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </>
  );
}
