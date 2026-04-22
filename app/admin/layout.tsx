import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { SiteHeader } from "@/components/site-header";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  const user = session?.user as { role?: string } | undefined;
  if (!session?.user) redirect("/signin?callbackUrl=/admin");
  if (user?.role !== "ADMIN") {
    return (
      <>
        <SiteHeader />
        <main className="max-w-2xl mx-auto p-10">
          <h1 className="text-2xl font-bold text-brand-800">Admin only</h1>
          <p className="text-slate-600 mt-2">
            Your account ({(session.user as any).email}) is not an admin. Ask an existing admin to
            promote you, or set <code>INITIAL_ADMIN_EMAIL</code> in server env and sign in again.
          </p>
        </main>
      </>
    );
  }
  return (
    <>
      <SiteHeader />
      <div className="border-b bg-white">
        <nav className="max-w-6xl mx-auto px-6 flex gap-4 text-sm">
          {[
            ["Learners", "/admin"],
            ["Content", "/admin/content"],
            ["Quizzes", "/admin/quizzes"],
            ["Sync", "/admin/sync"],
          ].map(([label, href]) => (
            <Link
              key={href}
              href={href}
              className="py-3 px-2 border-b-2 border-transparent hover:border-brand-600 text-slate-700"
            >
              {label}
            </Link>
          ))}
        </nav>
      </div>
      <main className="max-w-6xl mx-auto px-6 py-10">{children}</main>
    </>
  );
}
