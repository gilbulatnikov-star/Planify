"use server";
import { prisma } from "@/lib/db/prisma";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";
import { AUTOMATION_TEMPLATES } from "@/lib/automation-templates";

export async function getAutomationRules() {
  try {
    const session = await auth();
    const userId = session?.user?.id;
    if (!userId) return [];
    return await prisma.automationRule.findMany({ where: { userId }, orderBy: { createdAt: "asc" } });
  } catch {
    return [];
  }
}

export async function initializeAutomations() {
  try {
    const session = await auth();
    const userId = session?.user?.id;
    if (!userId) return;

    const existing = await prisma.automationRule.count({ where: { userId } });
    if (existing > 0) return;

    await prisma.automationRule.createMany({
      data: AUTOMATION_TEMPLATES.map((t) => ({
        userId,
        templateId: t.id,
        enabled: true,
        config: JSON.parse(JSON.stringify({ delayHours: t.delayHours, delayDays: t.delayDays })),
      })),
    });
    revalidatePath("/automations");
  } catch { /* ignore if table doesn't exist yet */ }
}

export async function toggleAutomation(id: string, enabled: boolean) {
  try {
    const session = await auth();
    const userId = session?.user?.id;
    if (!userId) return { success: false };
    await prisma.automationRule.updateMany({ where: { id, userId }, data: { enabled } });
    revalidatePath("/automations");
    return { success: true };
  } catch {
    return { success: false };
  }
}
