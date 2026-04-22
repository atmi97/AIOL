import { redirect } from "next/navigation";
import { auth, signIn, enabledAuthMethods } from "@/lib/auth";
import { SiteHeader } from "@/components/site-header";

export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string; error?: string }>;
}) {
  const session = await auth();
  const sp = await searchParams;
  if (session?.user) redirect(sp.callbackUrl ?? "/tier/tier1");
  const methods = enabledAuthMethods();

  return (
    <>
      <SiteHeader />
      <main className="max-w-md mx-auto px-6 py-16">
        <h1 className="text-3xl font-bold text-brand-800">Sign in</h1>
        <p className="text-slate-600 mt-2 text-sm">
          Use your 3sHealth work account. Email sign-in is available as a fallback.
        </p>
        {sp.error && (
          <p className="mt-4 text-sm text-red-700 bg-red-50 border border-red-200 rounded px-3 py-2">
            Sign-in failed: {sp.error}. Try another method or contact IT.
          </p>
        )}

        <div className="mt-8 space-y-3">
          {methods.entra && (
            <form
              action={async () => {
                "use server";
                await signIn("microsoft-entra-id", { redirectTo: sp.callbackUrl ?? "/tier/tier1" });
              }}
            >
              <button
                type="submit"
                className="w-full py-2.5 px-4 bg-brand-600 text-white rounded hover:bg-brand-700 font-medium"
              >
                Continue with Microsoft (3sHealth SSO)
              </button>
            </form>
          )}

          {methods.email && (
            <form
              action={async (formData: FormData) => {
                "use server";
                const email = String(formData.get("email") ?? "");
                await signIn("nodemailer", { email, redirectTo: sp.callbackUrl ?? "/tier/tier1" });
              }}
              className="border rounded p-4 bg-white"
            >
              <label className="block text-sm font-medium text-slate-700">
                Email sign-in (magic link)
              </label>
              <input
                type="email"
                name="email"
                required
                placeholder="you@3shealth.ca"
                className="mt-1 w-full border rounded px-3 py-2 text-sm"
              />
              <button
                type="submit"
                className="mt-3 w-full py-2 px-4 border border-brand-600 text-brand-700 rounded hover:bg-brand-50"
              >
                Email me a sign-in link
              </button>
            </form>
          )}

          {methods.devLogin && (
            <form
              action={async (formData: FormData) => {
                "use server";
                const email = String(formData.get("email") ?? "");
                const name = String(formData.get("name") ?? "");
                await signIn("dev-login", {
                  email,
                  name,
                  redirectTo: sp.callbackUrl ?? "/tier/tier1",
                });
              }}
              className="border border-amber-300 rounded p-4 bg-amber-50"
            >
              <p className="text-xs font-semibold text-amber-900 uppercase tracking-wide">
                Development sign-in
              </p>
              <p className="text-xs text-amber-800 mt-1">
                Only available when ENABLE_DEV_LOGIN=true. Never enable in production.
              </p>
              <div className="mt-3 space-y-2">
                <input
                  type="email"
                  name="email"
                  required
                  placeholder="you@example.com"
                  className="w-full border rounded px-3 py-2 text-sm"
                />
                <input
                  type="text"
                  name="name"
                  placeholder="Full name (optional)"
                  className="w-full border rounded px-3 py-2 text-sm"
                />
                <button
                  type="submit"
                  className="w-full py-2 px-4 bg-amber-600 text-white rounded hover:bg-amber-700"
                >
                  Dev sign in
                </button>
              </div>
            </form>
          )}

          {!methods.entra && !methods.email && !methods.devLogin && (
            <div className="border border-red-300 rounded p-4 bg-red-50 text-sm text-red-800">
              No sign-in methods configured. Set <code>AUTH_MICROSOFT_ENTRA_ID_ID</code>,{" "}
              <code>EMAIL_SERVER_HOST</code>, or <code>ENABLE_DEV_LOGIN=true</code> in your env.
            </div>
          )}
        </div>
      </main>
    </>
  );
}
