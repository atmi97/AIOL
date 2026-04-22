import Link from "next/link";
import { auth, signOut } from "@/lib/auth";

export async function SiteHeader() {
  const session = await auth();
  const user = session?.user as { name?: string | null; email?: string | null; role?: string } | undefined;
  return (
    <header className="border-b bg-white">
      <div className="max-w-6xl mx-auto px-6 py-3 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3">
          <div className="w-8 h-8 rounded bg-brand-600 text-white flex items-center justify-center font-bold">
            AI
          </div>
          <div>
            <div className="font-semibold leading-tight text-brand-800">AI Operator Licence</div>
            <div className="text-xs text-slate-500 leading-tight">3sHealth — AMS</div>
          </div>
        </Link>
        <nav className="flex items-center gap-4 text-sm">
          {user ? (
            <>
              <Link href="/tier/tier1" className="text-slate-700 hover:text-brand-700">
                Tier 1
              </Link>
              <Link href="/me" className="text-slate-700 hover:text-brand-700">
                My progress
              </Link>
              {user.role === "ADMIN" && (
                <Link href="/admin" className="text-slate-700 hover:text-brand-700">
                  Admin
                </Link>
              )}
              <span className="hidden sm:inline text-xs text-slate-500">
                {user.name ?? user.email} {user.role === "ADMIN" && <span className="ml-1 text-accent-gold font-semibold">ADMIN</span>}
              </span>
              <form
                action={async () => {
                  "use server";
                  await signOut({ redirectTo: "/" });
                }}
              >
                <button type="submit" className="text-slate-600 hover:text-brand-700">
                  Sign out
                </button>
              </form>
            </>
          ) : (
            <Link
              href="/signin"
              className="px-3 py-1.5 rounded bg-brand-600 text-white hover:bg-brand-700"
            >
              Sign in
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
