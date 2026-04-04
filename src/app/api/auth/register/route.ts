import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db/prisma";

// ── Simple in-process rate limiter: max 5 registrations per IP per 10 minutes ──
// Note: on Vercel serverless this only prevents abuse within a single instance.
// For multi-instance rate limiting, use Upstash Redis or similar.
const ipRegistry = new Map<string, { count: number; resetAt: number }>();
const RATE_WINDOW_MS  = 10 * 60 * 1000; // 10 min
const RATE_MAX        = 5;

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = ipRegistry.get(ip);
  if (!entry || now > entry.resetAt) {
    ipRegistry.set(ip, { count: 1, resetAt: now + RATE_WINDOW_MS });
    return false;
  }
  if (entry.count >= RATE_MAX) return true;
  entry.count++;
  return false;
}

async function verifyTurnstile(token: string, ip: string): Promise<boolean> {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) return true; // skip if not configured (dev)
  const res = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ secret, response: token, remoteip: ip }),
  });
  const data = await res.json();
  return data.success === true;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: NextRequest) {
  try {
    // ── Rate limit by IP ──────────────────────────────────────────────────────
    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0].trim() ??
      request.headers.get("x-real-ip") ??
      "unknown";

    if (isRateLimited(ip)) {
      return NextResponse.json(
        { error: "יותר מדי בקשות. נסה שוב בעוד מספר דקות." },
        { status: 429 }
      );
    }

    const { name, email, password, turnstileToken } = await request.json();

    // ── Turnstile server-side verification ────────────────────────────────────
    if (!turnstileToken || typeof turnstileToken !== "string") {
      return NextResponse.json({ error: "אימות אבטחה נכשל" }, { status: 400 });
    }
    const turnstileOk = await verifyTurnstile(turnstileToken, ip);
    if (!turnstileOk) {
      return NextResponse.json({ error: "אימות אבטחה נכשל. נסה שוב." }, { status: 400 });
    }

    // ── Input validation ──────────────────────────────────────────────────────
    if (!email || typeof email !== "string" || !password || typeof password !== "string") {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    const trimmedEmail = email.toLowerCase().trim();
    if (!EMAIL_RE.test(trimmedEmail) || trimmedEmail.length > 254) {
      return NextResponse.json(
        { error: "Invalid email address" },
        { status: 400 }
      );
    }

    if (password.length < 6 || password.length > 128) {
      return NextResponse.json(
        { error: "Password must be between 6 and 128 characters" },
        { status: 400 }
      );
    }

    if (!/[A-Z]/.test(password) || !/[a-z]/.test(password) || !/[0-9]/.test(password)) {
      return NextResponse.json(
        { error: "הסיסמה חייבת להכיל אות גדולה, אות קטנה ומספר" },
        { status: 400 }
      );
    }

    const trimmedName = typeof name === "string" ? name.trim().slice(0, 100) : null;

    const existing = await prisma.user.findUnique({ where: { email: trimmedEmail } });
    if (existing) {
      return NextResponse.json(
        { error: "An account with this email already exists" },
        { status: 409 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    await prisma.user.create({
      data: {
        name: trimmedName || null,
        email: trimmedEmail,
        password: hashedPassword,
        onboardingCompleted: false,
      },
    });

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
