import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
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
  providers: [
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
          createdAt: user.createdAt.toISOString(),
        };
      },
    }),
  ],
  callbacks: {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    jwt({ token, user, trigger, session }: { token: any; user?: any; trigger?: string; session?: any }) {
      if (user) {
        token.onboardingCompleted = user.onboardingCompleted ?? false;
        token.subscriptionPlan   = user.subscriptionPlan ?? "FREE";
        token.createdAt          = user.createdAt ?? new Date().toISOString();
      }
      if (trigger === "update") {
        if (session?.onboardingCompleted !== undefined) token.onboardingCompleted = session.onboardingCompleted;
        if (session?.subscriptionPlan    !== undefined) token.subscriptionPlan    = session.subscriptionPlan;
      }
      return token;
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    session({ session, token }: { session: any; token: any }) {
      if (token.sub) session.user.id = token.sub;
      session.user.onboardingCompleted = token.onboardingCompleted ?? false;
      session.user.subscriptionPlan    = token.subscriptionPlan    ?? "FREE";
      session.user.createdAt           = token.createdAt           ?? "";
      return session;
    },
  },
});
