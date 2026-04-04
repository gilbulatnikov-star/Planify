"use server";

import { prisma } from "@/lib/db/prisma";
import { revalidatePath } from "next/cache";
import { createToken } from "@/lib/impersonation-tokens";
import { requireAdmin } from "@/lib/admin";

// ── Impersonation ─────────────────────────────────────────────────────────────
export async function createImpersonationToken(targetUserId: string): Promise<string> {
  await requireAdmin();
  return createToken(targetUserId);
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
  return prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      email: true,
      subscriptionPlan: true,
      subscriptionStatus: true,
      subscriptionEndsAt: true,
      onboardingCompleted: true,
      createdAt: true,
    },
    take: 200,
  });
}

export async function updateUserPlan(userId: string, plan: string) {
  try {
    await requireAdmin();
    await prisma.user.update({
      where: { id: userId },
      data: {
        subscriptionPlan: plan,
        subscriptionStatus: plan === "FREE" ? null : "ACTIVE",
      },
    });
    revalidatePath("/admin");
  } catch {
    return { success: false, error: "Failed to update user plan" };
  }
}

export async function deleteUser(userId: string) {
  try {
    await requireAdmin();
    await prisma.user.delete({ where: { id: userId } });
    revalidatePath("/admin");
  } catch {
    return { success: false, error: "Failed to delete user" };
  }
}

export async function resetUserPassword(userId: string, newPassword: string) {
  try {
    await requireAdmin();
    const bcrypt = await import("bcryptjs");
    const hashed = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({ where: { id: userId }, data: { password: hashed } });
  } catch {
    return { success: false, error: "Failed to reset password" };
  }
}

export async function updateUserSubscriptionExpiry(userId: string, endsAt: Date | null) {
  try {
    await requireAdmin();
    await prisma.user.update({ where: { id: userId }, data: { subscriptionEndsAt: endsAt } });
    revalidatePath("/admin");
  } catch {
    return { success: false, error: "Failed to update subscription expiry" };
  }
}
