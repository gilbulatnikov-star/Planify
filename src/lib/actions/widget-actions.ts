"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db/prisma";

// ==========================================
// QUICK NOTES
// ==========================================

export async function getOrCreateQuickNote() {
  try {
    let note = await prisma.quickNote.findFirst();
    if (!note) {
      note = await prisma.quickNote.create({
        data: { content: "" },
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
    const note = await prisma.quickNote.findFirst();
    if (!note) {
      await prisma.quickNote.create({ data: { content } });
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
    const todos = await prisma.todo.findMany({
      orderBy: { createdAt: "desc" },
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
    await prisma.todo.create({
      data: { text: text.trim() },
    });
    revalidatePath("/");
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create todo",
    };
  }
}

export async function toggleTodo(id: string) {
  try {
    const todo = await prisma.todo.findUnique({ where: { id } });
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
    await prisma.todo.delete({ where: { id } });
    revalidatePath("/");
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
    const links = await prisma.quickLink.findMany({
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

    const maxOrder = await prisma.quickLink.aggregate({
      _max: { sortOrder: true },
    });

    await prisma.quickLink.create({
      data: {
        name,
        url,
        icon,
        sortOrder: (maxOrder._max.sortOrder ?? 0) + 1,
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
    let statuses = await prisma.gearStatus.findMany();

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
        })),
      });

      statuses = await prisma.gearStatus.findMany();
    }

    return statuses;
  } catch (error) {
    console.error("Failed to get gear statuses:", error);
    return [];
  }
}

export async function toggleGearStatus(id: string) {
  try {
    const status = await prisma.gearStatus.findUnique({ where: { id } });
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
