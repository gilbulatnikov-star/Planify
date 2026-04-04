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
    locale?: string;
    createdAt?: string;
    image?: string | null;
  }
  interface Session {
    user: {
      id: string;
      onboardingCompleted: boolean;
      subscriptionPlan: string;
      locale: string;
      createdAt: string;
      image?: string | null;
      hasAvatar?: boolean;
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
          image: user.image ?? null,
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
        // Store image URL only if it's a real URL (not base64) to keep JWT small
        const googleImg = dbUser.image ?? user.image ?? null;
        const googleIsUrl = googleImg && !googleImg.startsWith("data:");
        token.picture    = googleIsUrl ? googleImg : null;
        token.hasAvatar  = !!googleImg; // true if any image exists in DB (URL or base64)
      } else if (user) {
        // Credentials sign-in — never store base64 in JWT
        token.onboardingCompleted = user.onboardingCompleted ?? false;
        token.subscriptionPlan   = user.subscriptionPlan ?? "FREE";
        token.locale             = user.locale ?? "he";
        token.createdAt          = user.createdAt ?? new Date().toISOString();
        const img = user.image ?? null;
        const isUrl = img && !img.startsWith("data:");
        token.picture   = isUrl ? img : null;
        token.hasAvatar = !!img;
      } else if (token.sub) {
        // Refresh plan from DB at most once every 5 minutes to avoid DB hit on every request
        const now = Date.now();
        const lastFetch = token.planFetchedAt as number | undefined;
        if (!lastFetch || now - lastFetch > 5 * 60 * 1000) {
          const fresh = await prisma.user.findUnique({
            where: { id: token.sub },
            select: { subscriptionPlan: true, onboardingCompleted: true, locale: true, image: true },
          });
          if (fresh) {
            token.subscriptionPlan    = fresh.subscriptionPlan;
            token.onboardingCompleted = fresh.onboardingCompleted;
            token.locale              = fresh.locale;
            // Don't store base64 in JWT — it bloats the session cookie
            const freshImg = fresh.image ?? null;
            const freshIsUrl = freshImg && !freshImg.startsWith("data:");
            token.picture    = freshIsUrl ? freshImg : null;
            token.hasAvatar  = !!freshImg;
            token.planFetchedAt = now;
          }
        }
      }
      if (trigger === "update") {
        if (session?.onboardingCompleted !== undefined) token.onboardingCompleted = session.onboardingCompleted;
        if (session?.subscriptionPlan    !== undefined) token.subscriptionPlan    = session.subscriptionPlan;
        if (session?.locale              !== undefined) token.locale              = session.locale;
        if (session?.image               !== undefined) {
          // Only update JWT picture if it's not base64
          const img = session.image;
          const isUrl = img && !img.startsWith("data:");
          token.picture   = isUrl ? img : token.picture;
          token.hasAvatar = !!img; // update hasAvatar when image changes
        }
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
      session.user.image               = token.picture             ?? null;
      session.user.hasAvatar           = token.hasAvatar           ?? false;
      return session;
    },
  },
});
