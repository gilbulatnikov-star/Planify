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
    if (!("automationRule" in prisma)) return [];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return await (prisma as any).automationRule.findMany({ where: { userId }, orderBy: { createdAt: "asc" } });
  } catch {
    return [];
  }
}

export async function initializeAutomations() {
  try {
    const session = await auth();
    const userId = session?.user?.id;
    if (!userId) return;
    if (!("automationRule" in prisma)) return;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const existing = await (prisma as any).automationRule.count({ where: { userId } });
    if (existing > 0) return;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (prisma as any).automationRule.createMany({
      data: AUTOMATION_TEMPLATES.map((t) => ({
        userId,
        templateId: t.id,
        enabled: true,
        config: JSON.parse(
          JSON.stringify({
            delayHours: t.delayHours,
            delayDays: t.delayDays,
          })
        ),
      })),
    });
    revalidatePath("/automations");
  } catch { /* ignore if table doesn't exist yet */ }
}

export async function toggleAutomation(id: string, enabled: boolean) {
  try {
    const session = await auth();
    const userId = session?.user?.id;
    if (!userId) return;
    await prisma.automationRule.updateMany({ where: { id, userId }, data: { enabled } });
    revalidatePath("/automations");
  } catch { /* ignore */ }
}
