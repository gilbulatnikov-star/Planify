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
      todos: { orderBy: { createdAt: "desc" }, select: { id: true, text: true, completed: true } },
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

    // Verify client ownership
    const clientId = (formData.get("clientId") as string) || null;
    if (clientId) {
      const client = await prisma.client.findFirst({ where: { id: clientId, userId } });
      if (!client) return { success: false, error: "Invalid client" };
    }

    await prisma.project.create({
      data: {
        title,
        description: (formData.get("description") as string) || null,
        clientId,
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
    const session = await auth();
    const userId = session?.user?.id;
    if (!userId) return { success: false, error: "Not authenticated" };

    const title = formData.get("title") as string;
    if (!title) {
      return { success: false, error: "Title is required" };
    }

    const budgetStr = formData.get("budget") as string;
    const budget = budgetStr ? parseFloat(budgetStr) : null;

    const shootDateStr = formData.get("shootDate") as string;
    const deadlineStr = formData.get("deadline") as string;

    // Verify client ownership
    const clientId = (formData.get("clientId") as string) || null;
    if (clientId) {
      const client = await prisma.client.findFirst({ where: { id: clientId, userId } });
      if (!client) return { success: false, error: "Invalid client" };
    }

    const existing = await prisma.project.findFirst({ where: { id, userId } });
    if (!existing) return { success: false, error: "Not found" };

    await prisma.project.update({
      where: { id },
      data: {
        title,
        description: (formData.get("description") as string) || null,
        clientId,
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

export async function linkItemToProject(type: "script" | "moodboard" | "contact" | "content", itemId: string, projectId: string | null) {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return { success: false, error: "Not authenticated" };

  // Verify user owns the target project (if linking, not unlinking)
  if (projectId) {
    const project = await prisma.project.findFirst({ where: { id: projectId, userId } });
    if (!project) return { success: false, error: "Project not found" };
  }

  const model = { script: prisma.script, moodboard: prisma.moodboard, contact: prisma.contact, content: prisma.scheduledContent }[type];
  // Verify user owns the item first
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const existingItem = await (model as any).findFirst({ where: { id: itemId, userId } });
  if (!existingItem) return { success: false, error: "Item not found" };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await (model as any).update({ where: { id: itemId }, data: { projectId } });
  revalidatePath("/projects");
  if (projectId) revalidatePath(`/projects/${projectId}`);
  revalidatePath("/calendar");
  return { success: true };
}

export async function getUnlinkedItems() {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return { scripts: [], moodboards: [], contacts: [], content: [] };
  const [scripts, moodboards, contacts, content] = await Promise.all([
    prisma.script.findMany({ where: { userId, projectId: null }, select: { id: true, title: true }, orderBy: { updatedAt: "desc" } }),
    prisma.moodboard.findMany({ where: { userId, projectId: null }, select: { id: true, title: true }, orderBy: { updatedAt: "desc" } }),
    prisma.contact.findMany({ where: { userId, projectId: null }, select: { id: true, name: true }, orderBy: { name: "asc" } }),
    prisma.scheduledContent.findMany({ where: { userId, projectId: null }, select: { id: true, title: true }, orderBy: { date: "desc" } }),
  ]);
  return { scripts, moodboards, contacts, content };
}

export async function addProjectTask(projectId: string, title: string) {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return { success: false, error: "Not authenticated" };

  // Verify user owns the project
  const project = await prisma.project.findFirst({ where: { id: projectId, userId } });
  if (!project) return { success: false, error: "Project not found" };

  if (!title.trim()) return { success: false };
  await prisma.task.create({ data: { projectId, title: title.trim() } });
  revalidatePath("/projects");
  revalidatePath(`/projects/${projectId}`);
  return { success: true };
}

export async function deleteProjectTask(taskId: string) {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return { success: false, error: "Not authenticated" };

  // Verify user owns the parent project
  const task = await prisma.task.findUnique({ where: { id: taskId }, include: { project: { select: { userId: true } } } });
  if (!task || task.project.userId !== userId) return { success: false, error: "Task not found" };

  await prisma.task.delete({ where: { id: taskId } });
  if (task?.projectId) {
    revalidatePath(`/projects/${task.projectId}`);
  }
  revalidatePath("/projects");
  return { success: true };
}

export async function toggleProjectTask(taskId: string, completed: boolean) {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return { success: false, error: "Not authenticated" };

  // Verify user owns the parent project
  const task = await prisma.task.findUnique({ where: { id: taskId }, include: { project: { select: { userId: true } } } });
  if (!task || task.project.userId !== userId) return { success: false, error: "Task not found" };

  await prisma.task.update({
    where: { id: taskId },
    data: { completed },
  });
  revalidatePath("/projects");
  return { success: true };
}

export async function deleteProject(id: string) {
  try {
    const session = await auth();
    const userId = session?.user?.id;
    if (!userId) return { success: false, error: "Not authenticated" };

    const existing = await prisma.project.findFirst({ where: { id, userId } });
    if (!existing) return { success: false, error: "Not found" };

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
