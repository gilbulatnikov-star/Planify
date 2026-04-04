"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db/prisma";
import { auth } from "@/auth";

export async function createAsset(formData: FormData) {
  try {
    const name = formData.get("name") as string;
    if (!name) {
      return { success: false, error: "Name is required" };
    }

    const type = formData.get("type") as string;
    if (!type) {
      return { success: false, error: "Type is required" };
    }

    const session = await auth();
    const userId = session?.user?.id;
    if (!userId) return { success: false, error: "Unauthorized" };

    await prisma.asset.create({
      data: {
        name,
        type,
        source: (formData.get("source") as string) || null,
        originalUrl: (formData.get("originalUrl") as string) || null,
        notes: (formData.get("notes") as string) || null,
        userId: userId ?? undefined,
      },
    });

    revalidatePath("/assets");
    revalidatePath("/");
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create asset",
    };
  }
}

export async function updateAsset(id: string, formData: FormData) {
  try {
    const session = await auth();
    const userId = session?.user?.id;
    if (!userId) return { success: false, error: "Not authenticated" };

    const name = formData.get("name") as string;
    if (!name) {
      return { success: false, error: "Name is required" };
    }

    const type = formData.get("type") as string;
    if (!type) {
      return { success: false, error: "Type is required" };
    }

    const existing = await prisma.asset.findFirst({ where: { id, userId } });
    if (!existing) return { success: false, error: "Not found" };

    await prisma.asset.update({
      where: { id },
      data: {
        name,
        type,
        source: (formData.get("source") as string) || null,
        originalUrl: (formData.get("originalUrl") as string) || null,
        notes: (formData.get("notes") as string) || null,
      },
    });

    revalidatePath("/assets");
    revalidatePath("/");
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update asset",
    };
  }
}

export async function deleteAsset(id: string) {
  try {
    const session = await auth();
    const userId = session?.user?.id;
    if (!userId) return { success: false, error: "Not authenticated" };

    const existing = await prisma.asset.findFirst({ where: { id, userId } });
    if (!existing) return { success: false, error: "Not found" };

    await prisma.asset.delete({
      where: { id },
    });

    revalidatePath("/assets");
    revalidatePath("/");
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to delete asset",
    };
  }
}
