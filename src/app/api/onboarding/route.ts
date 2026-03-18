import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { decode } from "next-auth/jwt";

export async function POST(request: NextRequest) {
  try {
    // NextAuth v5 stores session as an encrypted JWT cookie
    // The user ID is stored in the standard JWT `sub` (subject) field
    const sessionCookieName = request.cookies.has("__Secure-authjs.session-token")
      ? "__Secure-authjs.session-token"
      : "authjs.session-token";

    const token = await decode({
      token: request.cookies.get(sessionCookieName)?.value,
      secret: process.env.AUTH_SECRET!,
      salt: sessionCookieName,
    });

    const userId = token?.sub;
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { role, primaryGoal, teamSize } = await request.json();

    await prisma.user.update({
      where: { id: userId },
      data: {
        role: role || null,
        primaryGoal: primaryGoal || null,
        teamSize: teamSize || null,
        onboardingCompleted: true,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Onboarding error:", error);
    return NextResponse.json(
      { error: "Failed to save preferences" },
      { status: 500 }
    );
  }
}
