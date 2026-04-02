import { NextRequest, NextResponse } from "next/server";
import { encode } from "next-auth/jwt";
import { prisma } from "@/lib/db/prisma";
import { consumeToken } from "@/lib/impersonation-tokens";
import { auth } from "@/auth";

const ADMIN_EMAILS = (process.env.ADMIN_EMAIL ?? "").split(",").map(e => e.trim().toLowerCase());

export async function GET(req: NextRequest) {
  // 1. Verify caller is still admin
  const session = await auth();
  if (!session?.user?.email || !ADMIN_EMAILS.includes(session.user.email.toLowerCase())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // 2. Validate one-time token
  const token = req.nextUrl.searchParams.get("token");
  if (!token) return NextResponse.json({ error: "Missing token" }, { status: 400 });

  const userId = await consumeToken(token);
  if (!userId) return NextResponse.json({ error: "Invalid or expired token" }, { status: 400 });

  // 3. Load target user
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, email: true, name: true, image: true, onboardingCompleted: true, subscriptionPlan: true, locale: true, createdAt: true },
  });
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  // 4. Mint a NextAuth JWT session for that user
  const secret = process.env.AUTH_SECRET!;
  const nowSeconds = Math.floor(Date.now() / 1000);
  const jwt = await encode({
    token: {
      sub: user.id,
      email: user.email,
      name: user.name ?? undefined,
      picture: user.image ?? null,
      onboardingCompleted: user.onboardingCompleted,
      subscriptionPlan: user.subscriptionPlan,
      locale: user.locale,
      createdAt: user.createdAt.toISOString(),
      iat: nowSeconds,
      exp: nowSeconds + 60 * 60 * 8, // 8 hours
    },
    secret,
    // NextAuth v5 beta uses salt derived from cookie name
    salt: process.env.NODE_ENV === "production"
      ? "__Secure-authjs.session-token"
      : "authjs.session-token",
  });

  // 5. Set the session cookie and redirect to dashboard
  const cookieName = process.env.NODE_ENV === "production"
    ? "__Secure-authjs.session-token"
    : "authjs.session-token";

  const response = NextResponse.redirect(new URL("/dashboard", req.url));
  response.cookies.set(cookieName, jwt, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 8,
  });

  return response;
}
