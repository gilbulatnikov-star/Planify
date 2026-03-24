"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db/prisma";
import { auth } from "@/auth";

export async function createEquipment(formData: FormData) {
  try {
    const name = formData.get("name") as string;
    if (!name) {
      return { success: false, error: "Name is required" };
    }

    const category = formData.get("category") as string;
    if (!category) {
      return { success: false, error: "Category is required" };
    }

    const purchasePriceStr = formData.get("purchasePrice") as string;
    const purchasePrice = purchasePriceStr ? parseFloat(purchasePriceStr) : null;

    const session = await auth();
    const userId = session?.user?.id;

    await prisma.equipment.create({
      data: {
        name,
        category,
        brand: (formData.get("brand") as string) || null,
        model: (formData.get("model") as string) || null,
        serialNumber: (formData.get("serialNumber") as string) || null,
        purchasePrice: purchasePrice !== null && !isNaN(purchasePrice) ? purchasePrice : null,
        status: (formData.get("status") as string) || "available",
        notes: (formData.get("notes") as string) || null,
        userId: userId ?? undefined,
      },
    });

    revalidatePath("/equipment");
    revalidatePath("/");
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create equipment",
    };
  }
}

export async function updateEquipment(id: string, formData: FormData) {
  try {
    const session = await auth();
    const userId = session?.user?.id;
    if (!userId) return { success: false, error: "Not authenticated" };

    const name = formData.get("name") as string;
    if (!name) {
      return { success: false, error: "Name is required" };
    }

    const category = formData.get("category") as string;
    if (!category) {
      return { success: false, error: "Category is required" };
    }

    const purchasePriceStr = formData.get("purchasePrice") as string;
    const purchasePrice = purchasePriceStr ? parseFloat(purchasePriceStr) : null;

    const existing = await prisma.equipment.findFirst({ where: { id, userId } });
    if (!existing) return { success: false, error: "Not found" };

    await prisma.equipment.update({
      where: { id },
      data: {
        name,
        category,
        brand: (formData.get("brand") as string) || null,
        model: (formData.get("model") as string) || null,
        serialNumber: (formData.get("serialNumber") as string) || null,
        purchasePrice: purchasePrice !== null && !isNaN(purchasePrice) ? purchasePrice : null,
        status: (formData.get("status") as string) || "available",
        notes: (formData.get("notes") as string) || null,
      },
    });

    revalidatePath("/equipment");
    revalidatePath("/");
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update equipment",
    };
  }
}

export async function deleteEquipment(id: string) {
  try {
    const session = await auth();
    const userId = session?.user?.id;
    if (!userId) return { success: false, error: "Not authenticated" };

    const existing = await prisma.equipment.findFirst({ where: { id, userId } });
    if (!existing) return { success: false, error: "Not found" };

    await prisma.equipment.delete({
      where: { id },
    });

    revalidatePath("/equipment");
    revalidatePath("/");
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to delete equipment",
    };
  }
}
