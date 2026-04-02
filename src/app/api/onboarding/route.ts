import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { decode } from "next-auth/jwt";

const VALID_ROLES        = ["freelancer", "agency", "studio", "creator", "other"] as const;
const VALID_GOALS        = ["projects", "clients", "content", "invoicing", "all"] as const;
const VALID_TEAM_SIZES   = ["solo", "2-5", "6-15", "16+"] as const;

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

    const body = await request.json();
    const { role, primaryGoal, teamSize } = body;

    // Validate enums — accept only known values, reject arbitrary strings
    const safeRole        = VALID_ROLES.includes(role as typeof VALID_ROLES[number]) ? role : null;
    const safePrimaryGoal = VALID_GOALS.includes(primaryGoal as typeof VALID_GOALS[number]) ? primaryGoal : null;
    const safeTeamSize    = VALID_TEAM_SIZES.includes(teamSize as typeof VALID_TEAM_SIZES[number]) ? teamSize : null;

    await prisma.user.update({
      where: { id: userId },
      data: {
        role: safeRole,
        primaryGoal: safePrimaryGoal,
        teamSize: safeTeamSize,
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
