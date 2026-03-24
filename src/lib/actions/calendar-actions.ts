"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db/prisma";
import { auth } from "@/auth";

export async function createScheduledContent(formData: FormData) {
  try {
    const title = formData.get("title") as string;
    if (!title) return { success: false, error: "Title is required" };

    const dateStr = formData.get("date") as string;
    if (!dateStr) return { success: false, error: "Date is required" };

    const contentType = (formData.get("contentType") as string) || "general";
    const status = (formData.get("status") as string) || "planned";
    const clientId = (formData.get("clientId") as string) || null;
    const projectId = (formData.get("projectId") as string) || null;
    const boardId = (formData.get("boardId") as string) || null;
    const notes = (formData.get("notes") as string) || null;
    const color = (formData.get("color") as string) || "gray";
    const isEvent = status === "event";

    const session = await auth();
    const userId = session?.user?.id;

    await prisma.scheduledContent.create({
      data: {
        title,
        date: new Date(dateStr),
        contentType,
        status,
        isEvent,
        clientId: clientId || undefined,
        projectId: projectId || undefined,
        boardId: boardId || undefined,
        notes,
        color,
        userId: userId ?? undefined,
      },
    });

    revalidatePath("/calendar");
    revalidatePath("/");
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create content",
    };
  }
}

export async function updateScheduledContent(id: string, formData: FormData) {
  try {
    const title = formData.get("title") as string;
    if (!title) return { success: false, error: "Title is required" };

    const dateStr = formData.get("date") as string;
    if (!dateStr) return { success: false, error: "Date is required" };

    const contentType = (formData.get("contentType") as string) || "general";
    const status = "planned";
    const clientId = (formData.get("clientId") as string) || null;
    const projectId = (formData.get("projectId") as string) || null;
    const notes = (formData.get("notes") as string) || null;
    const color = (formData.get("color") as string) || "gray";

    await prisma.scheduledContent.update({
      where: { id },
      data: {
        title,
        date: new Date(dateStr),
        contentType,
        status,
        clientId: clientId || null,
        projectId: projectId || null,
        notes,
        color,
      },
    });

    revalidatePath("/calendar");
    revalidatePath("/");
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update content",
    };
  }
}

export async function deleteScheduledContent(id: string) {
  try {
    await prisma.scheduledContent.delete({ where: { id } });

    revalidatePath("/calendar");
    revalidatePath("/");
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to delete content",
    };
  }
}
