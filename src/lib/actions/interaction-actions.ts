"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db/prisma";
import { auth } from "@/auth";

export async function createInteraction(clientId: string, formData: FormData) {
  try {
    const session = await auth();
    const userId = session?.user?.id;
    if (!userId) return { success: false, error: "Not authenticated" };

    // Verify user owns the client
    const client = await prisma.client.findFirst({ where: { id: clientId, userId } });
    if (!client) return { success: false, error: "Client not found" };

    const type = (formData.get("type") as string) || "note";
    const summary = formData.get("summary") as string;
    if (!summary?.trim()) return { success: false, error: "Summary required" };

    await prisma.interaction.create({
      data: { clientId, type, summary: summary.trim(), date: new Date() },
    });

    revalidatePath("/leads");
    return { success: true };
  } catch {
    return { success: false, error: "Failed to create interaction" };
  }
}

export async function getInteractions(clientId: string) {
  try {
    const session = await auth();
    const userId = session?.user?.id;
    if (!userId) return [];

    const client = await prisma.client.findFirst({ where: { id: clientId, userId } });
    if (!client) return [];

    return prisma.interaction.findMany({
      where: { clientId },
      orderBy: { date: "desc" },
    });
  } catch {
    return [];
  }
}
