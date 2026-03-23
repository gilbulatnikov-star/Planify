import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db/prisma";
import { authConfig } from "./auth.config";

declare module "next-auth" {
  interface User {
    onboardingCompleted: boolean;
    subscriptionPlan?: string;
    createdAt?: string;
  }
  interface Session {
    user: {
      id: string;
      onboardingCompleted: boolean;
      subscriptionPlan: string;
      createdAt: string;
    } & import("next-auth").DefaultSession["user"];
  }
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  trustHost: true,
  providers: [
    ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET ? [
      Google({
        clientId: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        authorization: { params: { prompt: "consent", access_type: "offline", response_type: "code" } },
      }),
    ] : []),
    Credentials({
      credentials: { email: {}, password: {} },
      authorize: async (credentials) => {
        if (!credentials?.email || !credentials?.password) return null;
        const user = await prisma.user.findUnique({
          where: { email: credentials.email as string },
        });
        if (!user) return null;
        const isValid = await bcrypt.compare(credentials.password as string, user.password);
        if (!isValid) return null;
        return {
          id: user.id,
          email: user.email,
          name: user.name,
          onboardingCompleted: user.onboardingCompleted,
          subscriptionPlan: user.subscriptionPlan,
          locale: user.locale,
          createdAt: user.createdAt.toISOString(),
        };
      },
    }),
  ],
  callbacks: {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async jwt({ token, user, account, trigger, session }: { token: any; user?: any; account?: any; trigger?: string; session?: any }) {
      // Google sign-in: find or create user in Prisma
      if (user && account?.provider === "google") {
        let dbUser = await prisma.user.findUnique({ where: { email: user.email! } });
        if (!dbUser) {
          dbUser = await prisma.user.create({
            data: {
              email: user.email!,
              name: user.name ?? null,
              password: "",
            },
          });
        }
        token.sub                = dbUser.id;
        token.onboardingCompleted = dbUser.onboardingCompleted;
        token.subscriptionPlan   = dbUser.subscriptionPlan;
        token.locale             = dbUser.locale;
        token.createdAt          = dbUser.createdAt.toISOString();
      } else if (user) {
        // Credentials sign-in
        token.onboardingCompleted = user.onboardingCompleted ?? false;
        token.subscriptionPlan   = user.subscriptionPlan ?? "FREE";
        token.locale             = user.locale ?? "he";
        token.createdAt          = user.createdAt ?? new Date().toISOString();
      } else if (token.sub) {
        // Subsequent requests — refresh plan from DB so plan upgrades take effect immediately
        const fresh = await prisma.user.findUnique({
          where: { id: token.sub },
          select: { subscriptionPlan: true, onboardingCompleted: true, locale: true },
        });
        if (fresh) {
          token.subscriptionPlan   = fresh.subscriptionPlan;
          token.onboardingCompleted = fresh.onboardingCompleted;
          token.locale             = fresh.locale;
        }
      }
      if (trigger === "update") {
        if (session?.onboardingCompleted !== undefined) token.onboardingCompleted = session.onboardingCompleted;
        if (session?.subscriptionPlan    !== undefined) token.subscriptionPlan    = session.subscriptionPlan;
        if (session?.locale              !== undefined) token.locale              = session.locale;
      }
      return token;
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    session({ session, token }: { session: any; token: any }) {
      if (token.sub) session.user.id = token.sub;
      session.user.onboardingCompleted = token.onboardingCompleted ?? false;
      session.user.subscriptionPlan    = token.subscriptionPlan    ?? "FREE";
      session.user.locale              = token.locale              ?? "he";
      session.user.createdAt           = token.createdAt           ?? "";
      return session;
    },
  },
});
