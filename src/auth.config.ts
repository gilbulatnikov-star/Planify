import type { NextAuthConfig } from "next-auth";

// Edge-compatible auth config — no Prisma/bcrypt, safe for middleware
export const authConfig = {
  pages: { signIn: "/sign-in" },
  session: { strategy: "jwt" as const },
  trustHost: true,
  providers: [],
  callbacks: {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    session({ session, token }: { session: any; token: any }) {
      if (token.sub) session.user.id = token.sub;
      // Fields stored in JWT by the full auth.ts jwt callback
      session.user.onboardingCompleted = token.onboardingCompleted ?? false;
      session.user.subscriptionPlan    = token.subscriptionPlan    ?? "FREE";
      session.user.createdAt           = token.createdAt           ?? "";
      return session;
    },
  },
} satisfies NextAuthConfig;
