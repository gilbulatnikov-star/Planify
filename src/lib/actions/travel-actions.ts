"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db/prisma";
import { auth } from "@/auth";

export async function createTravelEntry(formData: FormData) {
  try {
    const dateStr = formData.get("date") as string;
    if (!dateStr) {
      return { success: false, error: "Date is required" };
    }

    const origin = formData.get("origin") as string;
    if (!origin) {
      return { success: false, error: "Origin is required" };
    }

    const destination = formData.get("destination") as string;
    if (!destination) {
      return { success: false, error: "Destination is required" };
    }

    const kilometersStr = formData.get("kilometers") as string;
    const kilometers = kilometersStr ? parseFloat(kilometersStr) : 0;
    if (isNaN(kilometers) || kilometers <= 0) {
      return { success: false, error: "Valid kilometers value is required" };
    }

    const purpose = (formData.get("purpose") as string) || null;
    const clientId = (formData.get("clientId") as string) || null;
    const projectId = (formData.get("projectId") as string) || null;

    const session = await auth();
    const userId = session?.user?.id;

    await prisma.travelLog.create({
      data: {
        date: new Date(dateStr),
        origin,
        destination,
        kilometers,
        purpose,
        clientId: clientId || null,
        projectId: projectId || null,
        userId: userId ?? undefined,
      },
    });

    revalidatePath("/travel-log");
    revalidatePath("/");
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to create travel entry",
    };
  }
}

export async function updateTravelEntry(id: string, formData: FormData) {
  try {
    const session = await auth();
    const userId = session?.user?.id;
    if (!userId) return { success: false, error: "Not authenticated" };

    const dateStr = formData.get("date") as string;
    if (!dateStr) {
      return { success: false, error: "Date is required" };
    }

    const origin = formData.get("origin") as string;
    if (!origin) {
      return { success: false, error: "Origin is required" };
    }

    const destination = formData.get("destination") as string;
    if (!destination) {
      return { success: false, error: "Destination is required" };
    }

    const kilometersStr = formData.get("kilometers") as string;
    const kilometers = kilometersStr ? parseFloat(kilometersStr) : 0;
    if (isNaN(kilometers) || kilometers <= 0) {
      return { success: false, error: "Valid kilometers value is required" };
    }

    const purpose = (formData.get("purpose") as string) || null;
    const clientId = (formData.get("clientId") as string) || null;
    const projectId = (formData.get("projectId") as string) || null;

    await prisma.travelLog.update({
      where: { id, userId },
      data: {
        date: new Date(dateStr),
        origin,
        destination,
        kilometers,
        purpose,
        clientId: clientId || null,
        projectId: projectId || null,
      },
    });

    revalidatePath("/travel-log");
    revalidatePath("/");
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to update travel entry",
    };
  }
}

export async function deleteTravelEntry(id: string) {
  try {
    const session = await auth();
    const userId = session?.user?.id;
    if (!userId) return { success: false, error: "Not authenticated" };

    await prisma.travelLog.delete({
      where: { id, userId },
    });

    revalidatePath("/travel-log");
    revalidatePath("/");
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to delete travel entry",
    };
  }
}
