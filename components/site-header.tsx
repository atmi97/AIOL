import Link from "next/link";

export function SiteHeader() {
  return (
    <header className="border-b border-slate-200 bg-white/80 backdrop-blur sticky top-0 z-40">
      <div className="max-w-6xl mx-auto px-6 py-3 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-brand-500 to-brand-700 text-white flex items-center justify-center font-bold shadow-sm">
            AI
          </div>
          <div>
            <div className="font-semibold leading-tight text-slate-900">AI Operator Licence</div>
            <div className="text-xs text-slate-500 leading-tight">3sHealth — AMS</div>
          </div>
        </Link>
        <nav className="flex items-center gap-5 text-sm">
          <Link href="/tier/tier1" className="text-slate-700 hover:text-brand-700 transition">
            Tier 1
          </Link>
          <Link href="/me" className="text-slate-700 hover:text-brand-700 transition">
            My progress
          </Link>
          <Link href="/admin" className="text-slate-700 hover:text-brand-700 transition">
            Admin
          </Link>
        </nav>
      </div>
    </header>
  );
}
