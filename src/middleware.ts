import NextAuth from "next-auth";
import { NextResponse } from "next/server";

// Inline the Edge-compatible auth config to avoid any module resolution
// issues with Vercel's Edge bundler (it cannot resolve external file imports
// from within next-auth's wrapper, regardless of path alias or relative path).
const { auth } = NextAuth({
  pages: { signIn: "/sign-in" },
  session: { strategy: "jwt" as const },
  trustHost: true,
  providers: [],
  callbacks: {
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

export default auth((req) => {
  const session = req.auth;
  const isLoggedIn = !!session?.user;
  const { pathname } = req.nextUrl;

  const isAuthPage = pathname === "/sign-in" || pathname === "/sign-up";
  const isMarketingPage = pathname === "/landing" || pathname === "/demo" || pathname === "/terms" || pathname === "/privacy" || pathname === "/contact";
  const isOnboarding = pathname.startsWith("/onboarding");
  const isApiAuth = pathname.startsWith("/api/auth");
  const isApiOnboarding = pathname.startsWith("/api/onboarding");
  const isPublicApi = isApiAuth || isApiOnboarding;
  const isInternalApi = pathname.startsWith("/api/") && !isPublicApi;

  const isBillingPage =
    pathname.startsWith("/billing") ||
    pathname.startsWith("/settings/billing") ||
    pathname.startsWith("/api/checkout") ||
    pathname.startsWith("/api/user/me");

  // Marketing page is always public
  if (isMarketingPage) {
    return NextResponse.next();
  }

  if (!isLoggedIn && !isAuthPage && !isPublicApi) {
    if (isInternalApi) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    // Redirect unauthenticated users from root to landing page
    if (pathname === "/") {
      return NextResponse.redirect(new URL("/landing", req.nextUrl));
    }
    return NextResponse.redirect(new URL("/sign-in", req.nextUrl));
  }

  if (isLoggedIn && isAuthPage) {
    return NextResponse.redirect(new URL("/", req.nextUrl));
  }

  if (isLoggedIn && isOnboarding) {
    return NextResponse.redirect(new URL("/", req.nextUrl));
  }

  if (isLoggedIn && !isBillingPage && !isPublicApi) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const subscriptionPlan = (session?.user as any)?.subscriptionPlan ?? "FREE";
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const createdAt = (session?.user as any)?.createdAt as string | undefined;

    const TRIAL_MS = 3 * 24 * 60 * 60 * 1000;
    const trialExpired =
      subscriptionPlan === "FREE" &&
      !!createdAt &&
      Date.now() > new Date(createdAt).getTime() + TRIAL_MS;

    if (trialExpired) {
      if (isInternalApi) {
        return NextResponse.json({ error: "Trial expired. Upgrade to continue." }, { status: 402 });
      }
      return NextResponse.redirect(new URL("/billing?trial_expired=true", req.nextUrl));
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|uploads).*)"],
};
