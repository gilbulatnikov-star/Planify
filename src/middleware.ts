import NextAuth from "next-auth";
import { authConfig } from "@/auth.config";
import { NextResponse } from "next/server";

// Use the lightweight, Edge-compatible auth config — no Prisma imported here
const { auth } = NextAuth(authConfig);

export default auth((req) => {
  const session = req.auth;
  const isLoggedIn = !!session?.user;
  const { pathname } = req.nextUrl;

  const isAuthPage = pathname === "/sign-in" || pathname === "/sign-up";
  const isOnboarding = pathname.startsWith("/onboarding");
  const isApiAuth = pathname.startsWith("/api/auth");
  const isApiOnboarding = pathname.startsWith("/api/onboarding");
  const isPublicApi = isApiAuth || isApiOnboarding;
  // Detect internal API calls (non-auth, non-onboarding) — must return JSON, not redirects
  const isInternalApi = pathname.startsWith("/api/") && !isPublicApi;

  // Trial/billing pages + related APIs — always accessible to logged-in users
  const isBillingPage =
    pathname.startsWith("/billing") ||
    pathname.startsWith("/settings/billing") ||
    pathname.startsWith("/api/checkout") ||
    pathname.startsWith("/api/user/me");

  // Not logged in — API routes return 401 JSON, pages redirect to sign-in
  if (!isLoggedIn && !isAuthPage && !isPublicApi) {
    if (isInternalApi) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.redirect(new URL("/sign-in", req.nextUrl));
  }

  // Already logged in — redirect away from sign-in/sign-up
  if (isLoggedIn && isAuthPage) {
    return NextResponse.redirect(new URL("/", req.nextUrl));
  }

  // Redirect away from /onboarding (no longer needed)
  if (isLoggedIn && isOnboarding) {
    return NextResponse.redirect(new URL("/", req.nextUrl));
  }

  // ── Trial expiry check ──────────────────────────────────────────────────────
  // FREE plan accounts are locked after 3 days from creation.
  // Billing pages stay accessible so the user can upgrade.
  if (isLoggedIn && !isBillingPage && !isPublicApi) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const subscriptionPlan = (session?.user as any)?.subscriptionPlan ?? "FREE";
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const createdAt = (session?.user as any)?.createdAt as string | undefined;

    const TRIAL_MS = 3 * 24 * 60 * 60 * 1000; // 3 days
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
  // ───────────────────────────────────────────────────────────────────────────

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|uploads).*)"],
};
