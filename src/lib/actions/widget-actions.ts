"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db/prisma";
import { auth } from "@/auth";
import { getLimitsForPlan } from "@/lib/plan-limits";

// ==========================================
// QUICK NOTES
// ==========================================

export async function getOrCreateQuickNote() {
  try {
    const session = await auth();
    const userId = session?.user?.id;
    if (!userId) return null;
    let note = await prisma.quickNote.findFirst({ where: { userId } });
    if (!note) {
      note = await prisma.quickNote.create({
        data: { content: "", userId },
      });
    }
    return note;
  } catch (error) {
    console.error("Failed to get/create quick note:", error);
    return null;
  }
}

export async function updateQuickNote(content: string) {
  try {
    const session = await auth();
    const userId = session?.user?.id;
    if (!userId) return { success: false, error: "לא מחובר" };
    const note = await prisma.quickNote.findFirst({ where: { userId } });
    if (!note) {
      await prisma.quickNote.create({ data: { content, userId } });
    } else {
      await prisma.quickNote.update({
        where: { id: note.id },
        data: { content },
      });
    }
    revalidatePath("/");
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update note",
    };
  }
}

// ==========================================
// TODOS
// ==========================================

export async function getTodos() {
  try {
    const session = await auth();
    const userId = session?.user?.id;
    if (!userId) return [];
    const todos = await prisma.todo.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      include: { project: { select: { id: true, title: true } } },
    });
    return todos;
  } catch (error) {
    console.error("Failed to get todos:", error);
    return [];
  }
}

export async function createTodo(text: string) {
  try {
    if (!text.trim()) {
      return { success: false, error: "Text is required" };
    }
    const session = await auth();
    const userId = session?.user?.id;
    if (!userId) return { success: false, error: "לא מחובר" };

    const plan = session?.user?.subscriptionPlan ?? "FREE";
    const limits = getLimitsForPlan(plan);
    if (limits.todos !== -1) {
      const count = await prisma.todo.count({ where: { userId } });
      if (count >= limits.todos) {
        return { success: false, quotaExceeded: true as const };
      }
    }

    await prisma.todo.create({
      data: { text: text.trim(), userId },
    });
    revalidatePath("/");
    revalidatePath("/tasks");
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create todo",
    };
  }
}

export async function updateTodoProject(id: string, projectId: string | null) {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return { success: false, error: "Not authenticated" };
  const existingTodo = await prisma.todo.findFirst({ where: { id, userId } });
  if (!existingTodo) return { success: false, error: "Not found" };

  await prisma.todo.update({ where: { id }, data: { projectId } });
  revalidatePath("/tasks");
  revalidatePath("/projects");
  return { success: true };
}

export async function updateTodoText(id: string, text: string) {
  try {
    if (!text.trim()) return { success: false, error: "Text is required" };
    const session = await auth();
    const userId = session?.user?.id;
    if (!userId) return { success: false, error: "לא מחובר" };
    const existing = await prisma.todo.findFirst({ where: { id, userId } });
    if (!existing) return { success: false, error: "Not found" };
    await prisma.todo.update({ where: { id }, data: { text: text.trim() } });
    revalidatePath("/");
    revalidatePath("/tasks");
    return { success: true };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Failed to update todo" };
  }
}

export async function toggleTodo(id: string) {
  try {
    const session = await auth();
    const userId = session?.user?.id;
    if (!userId) return { success: false, error: "לא מחובר" };
    const todo = await prisma.todo.findFirst({ where: { id, userId } });
    if (!todo) {
      return { success: false, error: "Todo not found" };
    }
    const newCompleted = !todo.completed;
    await prisma.todo.update({
      where: { id },
      data: {
        completed: newCompleted,
        completedAt: newCompleted ? new Date() : null,
      },
    });
    revalidatePath("/");
    revalidatePath("/tasks");
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to toggle todo",
    };
  }
}

export async function deleteTodo(id: string) {
  try {
    const session = await auth();
    const userId = session?.user?.id;
    if (!userId) return { success: false, error: "לא מחובר" };
    const existing = await prisma.todo.findFirst({ where: { id, userId } });
    if (!existing) return { success: false, error: "Not found" };

    await prisma.todo.delete({ where: { id } });
    revalidatePath("/");
    revalidatePath("/tasks");
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to delete todo",
    };
  }
}

// ==========================================
// QUICK LINKS
// ==========================================

export async function getQuickLinks() {
  try {
    const session = await auth();
    const userId = session?.user?.id;
    if (!userId) return [];
    const links = await prisma.quickLink.findMany({
      where: { userId },
      orderBy: { sortOrder: "asc" },
    });
    return links;
  } catch (error) {
    console.error("Failed to get quick links:", error);
    return [];
  }
}

export async function createQuickLink(formData: FormData) {
  try {
    const name = formData.get("name") as string;
    const url = formData.get("url") as string;
    const icon = (formData.get("icon") as string) || "link";

    if (!name || !url) {
      return { success: false, error: "Name and URL are required" };
    }

    const session = await auth();
    const userId = session?.user?.id;

    const maxOrder = await prisma.quickLink.aggregate({
      where: { userId },
      _max: { sortOrder: true },
    });

    await prisma.quickLink.create({
      data: {
        name,
        url,
        icon,
        sortOrder: (maxOrder._max.sortOrder ?? 0) + 1,
        userId: userId ?? undefined,
      },
    });

    revalidatePath("/");
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to create quick link",
    };
  }
}

export async function deleteQuickLink(id: string) {
  try {
    const session = await auth();
    const userId = session?.user?.id;
    if (!userId) return { success: false, error: "לא מחובר" };
    const existing = await prisma.quickLink.findFirst({ where: { id, userId } });
    if (!existing) return { success: false, error: "Not found" };

    await prisma.quickLink.delete({ where: { id } });
    revalidatePath("/");
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to delete quick link",
    };
  }
}

// ==========================================
// GEAR STATUS
// ==========================================

export async function getGearStatuses() {
  try {
    const session = await auth();
    const userId = session?.user?.id;
    if (!userId) return [];

    let statuses = await prisma.gearStatus.findMany({ where: { userId } });

    if (statuses.length === 0) {
      const defaults = [
        { key: "sd_cards", label: "כרטיסי SD" },
        { key: "footage", label: "גיבוי חומרים" },
        { key: "batteries", label: "סוללות" },
      ];

      await prisma.gearStatus.createMany({
        data: defaults.map((d) => ({
          key: d.key,
          label: d.label,
          isReady: false,
          userId,
        })),
      });

      statuses = await prisma.gearStatus.findMany({ where: { userId } });
    }

    return statuses;
  } catch (error) {
    console.error("Failed to get gear statuses:", error);
    return [];
  }
}

export async function toggleGearStatus(id: string) {
  try {
    const session = await auth();
    const userId = session?.user?.id;
    if (!userId) return { success: false, error: "לא מחובר" };

    const status = await prisma.gearStatus.findFirst({ where: { id, userId } });
    if (!status) {
      return { success: false, error: "Gear status not found" };
    }

    await prisma.gearStatus.update({
      where: { id },
      data: { isReady: !status.isReady },
    });

    revalidatePath("/");
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to toggle gear status",
    };
  }
}
