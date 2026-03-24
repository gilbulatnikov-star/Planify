"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db/prisma";
import { auth } from "@/auth";
import { getLimitsForPlan } from "@/lib/plan-limits";

export async function createContact(formData: FormData) {
  try {
    const name = formData.get("name") as string;
    if (!name) {
      return { success: false, error: "Name is required" };
    }

    const category = formData.get("category") as string;
    if (!category) {
      return { success: false, error: "Category is required" };
    }

    // ── Quota check ────────────────────────────────────────────────────────────
    const session = await auth();
    const userId = session?.user?.id;
    const plan = session?.user?.subscriptionPlan ?? "FREE";
    const limits = getLimitsForPlan(plan);
    if (!userId) return { success: false as const, error: "לא מחובר" };
    if (limits.contacts !== -1) {
      const count = await prisma.contact.count({ where: { userId } });
      if (count >= limits.contacts) {
        return { success: false as const, quotaExceeded: true as const };
      }
    }

    const dailyRateStr = formData.get("dailyRate") as string;
    const dailyRate = dailyRateStr ? parseFloat(dailyRateStr) : null;

    const projectId = (formData.get("projectId") as string) || null;

    await prisma.contact.create({
      data: {
        name,
        category,
        phone: (formData.get("phone") as string) || null,
        email: (formData.get("email") as string) || null,
        dailyRate: dailyRate !== null && !isNaN(dailyRate) ? dailyRate : null,
        notes: (formData.get("notes") as string) || null,
        projectId,
        userId: userId ?? undefined,
      },
    });

    revalidatePath("/contacts");
    revalidatePath("/");
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create contact",
    };
  }
}

export async function updateContact(id: string, formData: FormData) {
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

    const dailyRateStr = formData.get("dailyRate") as string;
    const dailyRate = dailyRateStr ? parseFloat(dailyRateStr) : null;

    const projectId = (formData.get("projectId") as string) || null;

    const existing = await prisma.contact.findFirst({ where: { id, userId } });
    if (!existing) return { success: false, error: "Not found" };

    await prisma.contact.update({
      where: { id },
      data: {
        name,
        category,
        phone: (formData.get("phone") as string) || null,
        email: (formData.get("email") as string) || null,
        dailyRate: dailyRate !== null && !isNaN(dailyRate) ? dailyRate : null,
        notes: (formData.get("notes") as string) || null,
        projectId,
      },
    });

    revalidatePath("/contacts");
    revalidatePath("/");
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update contact",
    };
  }
}

export async function deleteContact(id: string) {
  try {
    const session = await auth();
    const userId = session?.user?.id;
    if (!userId) return { success: false, error: "Not authenticated" };

    const existing = await prisma.contact.findFirst({ where: { id, userId } });
    if (!existing) return { success: false, error: "Not found" };

    await prisma.contact.delete({
      where: { id },
    });

    revalidatePath("/contacts");
    revalidatePath("/");
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to delete contact",
    };
  }
}
