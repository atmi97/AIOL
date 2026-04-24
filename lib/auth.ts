import NextAuth, { type NextAuthConfig } from "next-auth";
import MicrosoftEntraID from "next-auth/providers/microsoft-entra-id";
import Nodemailer from "next-auth/providers/nodemailer";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "./prisma";

const INITIAL_ADMIN = (process.env.INITIAL_ADMIN_EMAIL ?? "").toLowerCase().trim();
const DEV_LOGIN_ENABLED =
  process.env.ENABLE_DEV_LOGIN === "true" && process.env.NODE_ENV !== "production";

const providers: NextAuthConfig["providers"] = [];

if (process.env.AUTH_MICROSOFT_ENTRA_ID_ID && process.env.AUTH_MICROSOFT_ENTRA_ID_SECRET) {
  providers.push(
    MicrosoftEntraID({
      clientId: process.env.AUTH_MICROSOFT_ENTRA_ID_ID,
      clientSecret: process.env.AUTH_MICROSOFT_ENTRA_ID_SECRET,
      issuer: process.env.AUTH_MICROSOFT_ENTRA_ID_ISSUER,
    }),
  );
}

if (process.env.EMAIL_SERVER_HOST && process.env.EMAIL_FROM) {
  providers.push(
    Nodemailer({
      server: {
        host: process.env.EMAIL_SERVER_HOST,
        port: Number(process.env.EMAIL_SERVER_PORT ?? 587),
        auth: process.env.EMAIL_SERVER_USER
          ? {
              user: process.env.EMAIL_SERVER_USER,
              pass: process.env.EMAIL_SERVER_PASSWORD,
            }
          : undefined,
      },
      from: process.env.EMAIL_FROM,
    }),
  );
}

if (DEV_LOGIN_ENABLED) {
  providers.push(
    Credentials({
      id: "dev-login",
      name: "Dev Login",
      credentials: {
        email: { label: "Email", type: "email" },
        name: { label: "Name", type: "text" },
      },
      async authorize(raw) {
        const email = String(raw?.email ?? "")
          .trim()
          .toLowerCase();
        if (!email) return null;
        const name = String(raw?.name ?? "").trim() || email.split("@")[0];
        const isInitialAdmin = INITIAL_ADMIN && email === INITIAL_ADMIN;
        const user = await prisma.user.upsert({
          where: { email },
          update: { name: name || undefined },
          create: {
            email,
            name,
            role: isInitialAdmin ? "ADMIN" : "LEARNER",
            emailVerified: new Date(),
          },
        });
        return { id: user.id, email: user.email, name: user.name, role: user.role } as any;
      },
    }),
  );
}

export const authConfig: NextAuthConfig = {
  adapter: PrismaAdapter(prisma),
  providers,
  session: { strategy: "jwt" },
  pages: { signIn: "/signin" },
  callbacks: {
    async signIn({ user, account }) {
      if (!user.email) return false;
      const email = user.email.toLowerCase();
      const existing = await prisma.user.findUnique({ where: { email } });
      if (account?.provider === "microsoft-entra-id") {
        const oid = (account.providerAccountId as string | undefined) ?? undefined;
        if (oid && existing && !existing.entraOid) {
          await prisma.user.update({ where: { id: existing.id }, data: { entraOid: oid } });
        }
      }
      return true;
    },
    async jwt({ token, user }) {
      // On initial sign-in `user` is populated; resolve id + role from DB and stash on token.
      const email = (user?.email ?? token.email ?? "").toLowerCase();
      if (!email) return token;
      const dbUser = await prisma.user.findUnique({ where: { email } });
      if (dbUser) {
        if (
          INITIAL_ADMIN &&
          dbUser.email?.toLowerCase() === INITIAL_ADMIN &&
          dbUser.role !== "ADMIN"
        ) {
          const promoted = await prisma.user.update({
            where: { id: dbUser.id },
            data: { role: "ADMIN" },
          });
          (token as any).uid = promoted.id;
          (token as any).role = promoted.role;
        } else {
          (token as any).uid = dbUser.id;
          (token as any).role = dbUser.role;
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = (token as any).uid;
        (session.user as any).role = (token as any).role;
      }
      return session;
    },
  },
};

export const { handlers, auth, signIn, signOut } = NextAuth(authConfig);

export async function requireUser() {
  const session = await auth();
  if (!session?.user) throw new Error("Not authenticated");
  return session.user as { id: string; email: string; name?: string | null; role: string };
}

export async function requireAdmin() {
  const user = await requireUser();
  if (user.role !== "ADMIN") throw new Error("Admin required");
  return user;
}

export function enabledAuthMethods() {
  return {
    entra: Boolean(process.env.AUTH_MICROSOFT_ENTRA_ID_ID && process.env.AUTH_MICROSOFT_ENTRA_ID_SECRET),
    email: Boolean(process.env.EMAIL_SERVER_HOST && process.env.EMAIL_FROM),
    devLogin: DEV_LOGIN_ENABLED,
  };
}
