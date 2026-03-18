"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db/prisma";

// ─── Inspiration CRUD ───

export async function createInspiration(formData: FormData) {
  try {
    const title = formData.get("title") as string;
    if (!title) {
      return { success: false, error: "Title is required" };
    }

    const categoryId = formData.get("categoryId") as string;
    if (!categoryId) {
      return { success: false, error: "Category is required" };
    }

    const cat = await prisma.inspirationCategory.findUnique({ where: { id: categoryId } });
    if (!cat) {
      return { success: false, error: "Category not found" };
    }

    await prisma.inspiration.create({
      data: {
        title,
        category: cat.name,
        categoryId: cat.id,
        url: (formData.get("url") as string) || null,
        notes: (formData.get("notes") as string) || null,
      },
    });

    revalidatePath("/inspiration");
    revalidatePath("/");
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create inspiration",
    };
  }
}

export async function updateInspiration(id: string, formData: FormData) {
  try {
    const title = formData.get("title") as string;
    if (!title) {
      return { success: false, error: "Title is required" };
    }

    const categoryId = formData.get("categoryId") as string;
    if (!categoryId) {
      return { success: false, error: "Category is required" };
    }

    const cat = await prisma.inspirationCategory.findUnique({ where: { id: categoryId } });
    if (!cat) {
      return { success: false, error: "Category not found" };
    }

    await prisma.inspiration.update({
      where: { id },
      data: {
        title,
        category: cat.name,
        categoryId: cat.id,
        url: (formData.get("url") as string) || null,
        notes: (formData.get("notes") as string) || null,
      },
    });

    revalidatePath("/inspiration");
    revalidatePath("/");
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update inspiration",
    };
  }
}

export async function deleteInspiration(id: string) {
  try {
    await prisma.inspiration.delete({
      where: { id },
    });

    revalidatePath("/inspiration");
    revalidatePath("/");
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to delete inspiration",
    };
  }
}

// ─── Category CRUD ───

export async function createInspirationCategory(formData: FormData) {
  try {
    const label = (formData.get("label") as string)?.trim();
    if (!label) {
      return { success: false, error: "Label is required" };
    }

    const color = (formData.get("color") as string) || "cyan";

    // Generate a slug-like name from the label
    const name = label
      .toLowerCase()
      .replace(/[^a-zA-Z0-9\u0590-\u05FF]/g, "_")
      .replace(/_+/g, "_")
      .replace(/^_|_$/g, "");

    // Get max sortOrder
    const maxSort = await prisma.inspirationCategory.aggregate({ _max: { sortOrder: true } });
    const sortOrder = (maxSort._max.sortOrder ?? -1) + 1;

    await prisma.inspirationCategory.create({
      data: { name: name || `cat_${Date.now()}`, label, color, sortOrder },
    });

    revalidatePath("/inspiration");
    return { success: true };
  } catch (error) {
    if (error instanceof Error && error.message.includes("Unique constraint")) {
      return { success: false, error: "קטגוריה עם שם זה כבר קיימת" };
    }
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create category",
    };
  }
}

export async function updateInspirationCategory(id: string, formData: FormData) {
  try {
    const label = (formData.get("label") as string)?.trim();
    if (!label) {
      return { success: false, error: "Label is required" };
    }

    const color = (formData.get("color") as string) || "cyan";

    await prisma.inspirationCategory.update({
      where: { id },
      data: { label, color },
    });

    revalidatePath("/inspiration");
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update category",
    };
  }
}

export async function deleteInspirationCategory(id: string) {
  try {
    // Check if there are inspirations using this category
    const count = await prisma.inspiration.count({ where: { categoryId: id } });
    if (count > 0) {
      return { success: false, error: `לא ניתן למחוק קטגוריה עם ${count} פריטי השראה. העבר אותם קודם לקטגוריה אחרת.` };
    }

    await prisma.inspirationCategory.delete({ where: { id } });

    revalidatePath("/inspiration");
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to delete category",
    };
  }
}
