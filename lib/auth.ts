/**
 * Auth bypassed for v1.2 — Azure SSO will replace this in a future iteration.
 *
 * All routes are publicly accessible; every request resolves to a single demo
 * user with ADMIN role so existing server actions, audit trail, progress
 * tracking, and quiz attempts keep working without sign-in.
 */

import { prisma } from "./prisma";

const DEMO_EMAIL = "demo@aiol.local";
const DEMO_NAME = "Demo User";

type DemoUser = { id: string; email: string; name: string; role: "ADMIN" | "LEARNER" };

let cached: DemoUser | null = null;

async function getDemoUser(): Promise<DemoUser> {
  if (cached) return cached;
  const user = await prisma.user.upsert({
    where: { email: DEMO_EMAIL },
    update: { role: "ADMIN" },
    create: {
      email: DEMO_EMAIL,
      name: DEMO_NAME,
      role: "ADMIN",
      emailVerified: new Date(),
    },
  });
  cached = {
    id: user.id,
    email: user.email!,
    name: user.name ?? DEMO_NAME,
    role: "ADMIN",
  };
  return cached;
}

/**
 * Always returns a session with the demo user. Never null.
 * Mirrors the NextAuth `auth()` return shape so existing call sites keep working.
 */
export async function auth() {
  const user = await getDemoUser();
  return {
    user: { id: user.id, email: user.email, name: user.name, role: user.role },
    expires: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
  };
}

export async function requireUser() {
  const user = await getDemoUser();
  return { id: user.id, email: user.email, name: user.name, role: user.role };
}

export async function requireAdmin() {
  return await requireUser();
}

export function enabledAuthMethods() {
  return { entra: false, email: false, devLogin: false };
}

/**
 * Stub NextAuth handlers — the /api/auth/[...nextauth] route still imports
 * these. Returning a JSON 404 on any auth route is harmless; nothing calls
 * them now that the UI has no sign-in button.
 */
async function notFound() {
  return new Response(JSON.stringify({ error: "auth disabled" }), {
    status: 404,
    headers: { "content-type": "application/json" },
  });
}

export const handlers = { GET: notFound, POST: notFound };
export const signIn = async () => null;
export const signOut = async () => null;
