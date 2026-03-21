"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db/prisma";
import { auth } from "@/auth";
import { getLimitsForPlan } from "@/lib/plan-limits";

export async function getProjects() {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return [];
  return prisma.project.findMany({
    where: { userId },
    orderBy: { title: "asc" },
    select: { id: true, title: true },
  });
}

export async function getProjectDetail(id: string) {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return null;
  return prisma.project.findFirst({
    where: { id, userId },
    include: {
      client: { select: { id: true, name: true } },
      tasks: { orderBy: { createdAt: "asc" } },
      scripts: { select: { id: true, title: true, platform: true, updatedAt: true } },
      moodboards: { select: { id: true, title: true, updatedAt: true } },
      contacts: { select: { id: true, name: true, category: true, phone: true, email: true } },
      scheduledContent: { select: { id: true, title: true, date: true, status: true, color: true } },
    },
  });
}

export async function createProject(formData: FormData) {
  try {
    const title = formData.get("title") as string;
    if (!title) {
      return { success: false, error: "Title is required" };
    }

    // ── Quota check ────────────────────────────────────────────────────────────
    const session = await auth();
    const userId = session?.user?.id;
    const plan = session?.user?.subscriptionPlan ?? "FREE";
    const limits = getLimitsForPlan(plan);
    if (!userId) return { success: false as const, error: "לא מחובר" };
    if (limits.projects !== -1) {
      const count = await prisma.project.count({ where: { userId } });
      if (count >= limits.projects) {
        return { success: false as const, quotaExceeded: true as const };
      }
    }

    const budgetStr = formData.get("budget") as string;
    const budget = budgetStr ? parseFloat(budgetStr) : null;

    const shootDateStr = formData.get("shootDate") as string;
    const deadlineStr = formData.get("deadline") as string;

    await prisma.project.create({
      data: {
        title,
        description: (formData.get("description") as string) || null,
        clientId: (formData.get("clientId") as string) || null,
        phase: (formData.get("phase") as string) || "pre_production",
        status: (formData.get("status") as string) || "pitching",
        projectType: (formData.get("projectType") as string) || null,
        budget: budget !== null && !isNaN(budget) ? budget : null,
        shootDate: shootDateStr ? new Date(shootDateStr) : null,
        deadline: deadlineStr ? new Date(deadlineStr) : null,
        userId: userId ?? undefined,
      },
    });

    revalidatePath("/projects");
    revalidatePath("/");
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create project",
    };
  }
}

export async function updateProject(id: string, formData: FormData) {
  try {
    const title = formData.get("title") as string;
    if (!title) {
      return { success: false, error: "Title is required" };
    }

    const budgetStr = formData.get("budget") as string;
    const budget = budgetStr ? parseFloat(budgetStr) : null;

    const shootDateStr = formData.get("shootDate") as string;
    const deadlineStr = formData.get("deadline") as string;

    await prisma.project.update({
      where: { id },
      data: {
        title,
        description: (formData.get("description") as string) || null,
        clientId: (formData.get("clientId") as string) || null,
        phase: (formData.get("phase") as string) || "pre_production",
        status: (formData.get("status") as string) || "pitching",
        projectType: (formData.get("projectType") as string) || null,
        budget: budget !== null && !isNaN(budget) ? budget : null,
        shootDate: shootDateStr ? new Date(shootDateStr) : null,
        deadline: deadlineStr ? new Date(deadlineStr) : null,
      },
    });

    revalidatePath("/projects");
    revalidatePath("/");
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update project",
    };
  }
}

export async function toggleProjectTask(taskId: string, completed: boolean) {
  await prisma.task.update({
    where: { id: taskId },
    data: { completed },
  });
  revalidatePath("/projects");
  return { success: true };
}

export async function deleteProject(id: string) {
  try {
    await prisma.project.delete({
      where: { id },
    });

    revalidatePath("/projects");
    revalidatePath("/");
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to delete project",
    };
  }
}
