"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db/prisma";
import { auth } from "@/auth";
import { getLimitsForPlan } from "@/lib/plan-limits";

export async function getProjects() {
  return prisma.project.findMany({
    orderBy: { title: "asc" },
    select: { id: true, title: true },
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
    const plan = session?.user?.subscriptionPlan ?? "FREE";
    const limits = getLimitsForPlan(plan);
    if (limits.projects !== -1) {
      const count = await prisma.project.count();
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
