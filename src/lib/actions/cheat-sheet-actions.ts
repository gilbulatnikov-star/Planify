"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db/prisma";
import { auth } from "@/auth";

export async function createCheatSheet(formData: FormData) {
  try {
    const title = formData.get("title") as string;
    if (!title) {
      return { success: false, error: "Title is required" };
    }

    const category = formData.get("category") as string;
    if (!category) {
      return { success: false, error: "Category is required" };
    }

    const session = await auth();
    const userId = session?.user?.id;
    if (!userId) return { success: false, error: "לא מחובר" };

    // Get the max sortOrder for this category and add 1
    const maxSort = await prisma.cheatSheet.findFirst({
      where: { category, userId },
      orderBy: { sortOrder: "desc" },
      select: { sortOrder: true },
    });

    await prisma.cheatSheet.create({
      data: {
        title,
        category,
        content: (formData.get("content") as string) || "",
        sortOrder: (maxSort?.sortOrder ?? -1) + 1,
        userId,
      },
    });

    revalidatePath("/cheat-sheets");
    revalidatePath("/");
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create cheat sheet",
    };
  }
}

export async function updateCheatSheet(id: string, formData: FormData) {
  try {
    const session = await auth();
    const userId = session?.user?.id;
    if (!userId) return { success: false, error: "Not authenticated" };

    const title = formData.get("title") as string;
    if (!title) {
      return { success: false, error: "Title is required" };
    }

    const category = formData.get("category") as string;
    if (!category) {
      return { success: false, error: "Category is required" };
    }

    const existing = await prisma.cheatSheet.findFirst({ where: { id, userId } });
    if (!existing) return { success: false, error: "Not found" };

    await prisma.cheatSheet.update({
      where: { id },
      data: {
        title,
        category,
        content: (formData.get("content") as string) || "",
      },
    });

    revalidatePath("/cheat-sheets");
    revalidatePath("/");
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update cheat sheet",
    };
  }
}

export async function deleteCheatSheet(id: string) {
  try {
    const session = await auth();
    const userId = session?.user?.id;
    if (!userId) return { success: false, error: "Not authenticated" };

    const existing = await prisma.cheatSheet.findFirst({ where: { id, userId } });
    if (!existing) return { success: false, error: "Not found" };

    await prisma.cheatSheet.delete({
      where: { id },
    });

    revalidatePath("/cheat-sheets");
    revalidatePath("/");
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to delete cheat sheet",
    };
  }
}
