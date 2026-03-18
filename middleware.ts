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
  // Internal API calls must return JSON errors, not HTML redirects
  const isInternalApi = pathname.startsWith("/api/") && !isPublicApi;

  // Not logged in — API returns 401, pages redirect to sign-in
  if (!isLoggedIn && !isAuthPage && !isPublicApi) {
    if (isInternalApi) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.redirect(new URL("/sign-in", req.nextUrl));
  }

  // Already logged in — redirect away from sign-in/sign-up
  if (isLoggedIn && isAuthPage) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const onboardingCompleted = (session?.user as any)?.onboardingCompleted;
    return NextResponse.redirect(new URL(onboardingCompleted ? "/" : "/onboarding", req.nextUrl));
  }

  // Logged in but onboarding not done — API returns 403, pages redirect
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const onboardingCompleted = (session?.user as any)?.onboardingCompleted;
  if (isLoggedIn && !onboardingCompleted && !isOnboarding && !isPublicApi) {
    if (isInternalApi) {
      return NextResponse.json({ error: "Onboarding required" }, { status: 403 });
    }
    return NextResponse.redirect(new URL("/onboarding", req.nextUrl));
  }

  // Onboarding done — redirect away from /onboarding
  if (isLoggedIn && onboardingCompleted && isOnboarding) {
    return NextResponse.redirect(new URL("/", req.nextUrl));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|uploads).*)"],
};
