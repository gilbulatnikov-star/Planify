"use server";

import { prisma } from "@/lib/db/prisma";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";

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
  const [totalUsers, freeUsers, monthlyUsers, annualUsers] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { subscriptionPlan: "FREE" } }),
    prisma.user.count({ where: { subscriptionPlan: "MONTHLY" } }),
    prisma.user.count({ where: { subscriptionPlan: "ANNUAL" } }),
  ]);
  return { totalUsers, freeUsers, monthlyUsers, annualUsers };
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
    data: { subscriptionPlan: plan },
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
