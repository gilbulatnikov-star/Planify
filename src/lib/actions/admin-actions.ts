"use server";

import { prisma } from "@/lib/db/prisma";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";
import crypto from "crypto";

// ── Impersonation tokens (in-process, TTL 60s) ────────────────────────────────
const impersonationTokens = new Map<string, { userId: string; expiresAt: number }>();

export async function createImpersonationToken(targetUserId: string): Promise<string> {
  const session = await auth();
  if (!session?.user?.email || !isAdmin(session.user.email)) {
    throw new Error("Unauthorized");
  }
  // Clean expired tokens
  const now = Date.now();
  for (const [t, v] of impersonationTokens) {
    if (v.expiresAt < now) impersonationTokens.delete(t);
  }
  const token = crypto.randomBytes(32).toString("hex");
  impersonationTokens.set(token, { userId: targetUserId, expiresAt: now + 60_000 });
  return token;
}

export function consumeImpersonationToken(token: string): string | null {
  const entry = impersonationTokens.get(token);
  if (!entry) return null;
  if (entry.expiresAt < Date.now()) {
    impersonationTokens.delete(token);
    return null;
  }
  impersonationTokens.delete(token);
  return entry.userId;
}

function isAdmin(email: string) {
  const admins = (process.env.ADMIN_EMAIL ?? "").split(",").map(e => e.trim().toLowerCase());
  return admins.includes(email.toLowerCase());
}

async function requireAdmin() {
  const session = await auth();
  if (!session?.user?.email || !isAdmin(session.user.email)) {
    throw new Error("Unauthorized");
  }
}

export async function getAdminStats() {
  await requireAdmin();

  const now = new Date();
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  const [
    totalUsers, freeUsers, monthlyUsers, annualUsers,
    newThisWeek, newThisMonth, incompleteOnboarding,
    totalProjects, totalScripts, totalContacts,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { subscriptionPlan: "FREE" } }),
    prisma.user.count({ where: { subscriptionPlan: "MONTHLY" } }),
    prisma.user.count({ where: { subscriptionPlan: "ANNUAL" } }),
    prisma.user.count({ where: { createdAt: { gte: sevenDaysAgo } } }),
    prisma.user.count({ where: { createdAt: { gte: thirtyDaysAgo } } }),
    prisma.user.count({ where: { onboardingCompleted: false } }),
    prisma.project.count(),
    prisma.script.count(),
    prisma.contact.count(),
  ]);

  // MRR estimate (customize prices as needed)
  const MONTHLY_PRICE = 39;
  const ANNUAL_MONTHLY = 29;
  const mrr = monthlyUsers * MONTHLY_PRICE + annualUsers * ANNUAL_MONTHLY;

  return {
    totalUsers, freeUsers, monthlyUsers, annualUsers,
    newThisWeek, newThisMonth, incompleteOnboarding,
    totalProjects, totalScripts, totalContacts, mrr,
  };
}

export async function getAdminUsers() {
  await requireAdmin();
  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
  });

  return users.map(u => ({
    id: u.id,
    name: u.name,
    email: u.email,
    subscriptionPlan: u.subscriptionPlan,
    subscriptionStatus: u.subscriptionStatus,
    subscriptionEndsAt: u.subscriptionEndsAt,
    onboardingCompleted: u.onboardingCompleted,
    createdAt: u.createdAt,
  }));
}

export async function updateUserPlan(userId: string, plan: string) {
  await requireAdmin();
  await prisma.user.update({
    where: { id: userId },
    data: {
      subscriptionPlan: plan,
      subscriptionStatus: plan === "FREE" ? null : "ACTIVE",
    },
  });
  revalidatePath("/admin");
}

export async function deleteUser(userId: string) {
  await requireAdmin();
  await prisma.user.delete({ where: { id: userId } });
  revalidatePath("/admin");
}

export async function resetUserPassword(userId: string, newPassword: string) {
  await requireAdmin();
  const bcrypt = await import("bcryptjs");
  const hashed = await bcrypt.hash(newPassword, 10);
  await prisma.user.update({ where: { id: userId }, data: { password: hashed } });
}

export async function updateUserSubscriptionExpiry(userId: string, endsAt: Date | null) {
  await requireAdmin();
  await prisma.user.update({ where: { id: userId }, data: { subscriptionEndsAt: endsAt } });
  revalidatePath("/admin");
}
