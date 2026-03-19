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
  const [totalUsers, freeUsers, monthlyUsers, annualUsers, totalProjects, totalScripts] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { subscriptionPlan: "FREE" } }),
    prisma.user.count({ where: { subscriptionPlan: "MONTHLY" } }),
    prisma.user.count({ where: { subscriptionPlan: "ANNUAL" } }),
    prisma.project.count(),
    prisma.script.count(),
  ]);
  return { totalUsers, freeUsers, monthlyUsers, annualUsers, totalProjects, totalScripts };
}

export async function getAdminUsers() {
  await requireAdmin();
  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
  });

  // Get per-user counts
  const userIds = users.map(u => u.id);
  const [projectCounts, scriptCounts, contactCounts] = await Promise.all([
    prisma.project.groupBy({ by: ["id"], where: { id: { in: userIds } }, _count: true }).then(() =>
      // projects don't have userId — for now count all
      Promise.resolve({} as Record<string, number>)
    ),
    prisma.script.groupBy({ by: ["id"], where: { id: { in: userIds } }, _count: true }).then(() =>
      Promise.resolve({} as Record<string, number>)
    ),
    Promise.resolve({} as Record<string, number>),
  ]);

  return users.map(u => ({
    id: u.id,
    name: u.name,
    email: u.email,
    role: u.role,
    subscriptionPlan: u.subscriptionPlan,
    subscriptionStatus: u.subscriptionStatus,
    onboardingCompleted: u.onboardingCompleted,
    createdAt: u.createdAt,
    updatedAt: u.updatedAt,
    projectCount: projectCounts[u.id] ?? 0,
    scriptCount: scriptCounts[u.id] ?? 0,
    contactCount: contactCounts[u.id] ?? 0,
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
