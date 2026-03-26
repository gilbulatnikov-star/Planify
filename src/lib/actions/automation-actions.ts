"use server";
import { prisma } from "@/lib/db/prisma";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";

export const AUTOMATION_TEMPLATES = [
  { id: "stale_lead_24h", trigger: "lead_no_response", delayHours: 24, action: "notify", message: "\u05DC\u05D9\u05D3 {name} \u05DE\u05DE\u05EA\u05D9\u05DF \u05DC\u05DE\u05E2\u05E0\u05D4 \u05DB\u05D1\u05E8 24 \u05E9\u05E2\u05D5\u05EA" },
  { id: "stale_lead_72h", trigger: "lead_no_response", delayHours: 72, action: "notify", message: "\u05DC\u05D9\u05D3 {name} \u05DE\u05DE\u05EA\u05D9\u05DF \u05DC\u05DE\u05E2\u05E0\u05D4 \u05DB\u05D1\u05E8 3 \u05D9\u05DE\u05D9\u05DD \u2014 \u05E1\u05DE\u05DF \u05DB\u05E7\u05E8?" },
  { id: "proposal_followup_3d", trigger: "proposal_no_response", delayDays: 3, action: "notify", message: "\u05D4\u05E6\u05E2\u05EA \u05DE\u05D7\u05D9\u05E8 \u05DC-{name} \u05E0\u05E9\u05DC\u05D7\u05D4 \u05DC\u05E4\u05E0\u05D9 3 \u05D9\u05DE\u05D9\u05DD \u05DC\u05DC\u05D0 \u05EA\u05D2\u05D5\u05D1\u05D4" },
  { id: "proposal_followup_7d", trigger: "proposal_no_response", delayDays: 7, action: "notify", message: "\u05D4\u05E6\u05E2\u05EA \u05DE\u05D7\u05D9\u05E8 \u05DC-{name} \u05E4\u05EA\u05D5\u05D7\u05D4 \u05DB\u05D1\u05E8 \u05E9\u05D1\u05D5\u05E2 \u2014 follow up?" },
  { id: "deadline_24h", trigger: "project_deadline", delayHours: 24, action: "notify", message: "\u05DC\u05E4\u05E8\u05D5\u05D9\u05E7\u05D8 {title} \u05E0\u05E9\u05D0\u05E8 \u05E4\u05D7\u05D5\u05EA \u05DE-24 \u05E9\u05E2\u05D5\u05EA \u05DC\u05D3\u05D3\u05DC\u05D9\u05D9\u05DF" },
  { id: "overdue_invoice", trigger: "invoice_overdue", delayDays: 1, action: "notify", message: "\u05D7\u05E9\u05D1\u05D5\u05E0\u05D9\u05EA #{number} \u2014 \u20AA{amount} \u05D1\u05D0\u05D9\u05D7\u05D5\u05E8 \u05EA\u05E9\u05DC\u05D5\u05DD" },
  { id: "task_reminder", trigger: "daily_tasks", delayHours: 0, action: "notify", message: "\u05D9\u05E9 \u05DC\u05DA {count} \u05DE\u05E9\u05D9\u05DE\u05D5\u05EA \u05DC\u05D4\u05D9\u05D5\u05DD" },
];

export async function getAutomationRules() {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return [];
  return prisma.automationRule.findMany({ where: { userId }, orderBy: { createdAt: "asc" } });
}

export async function initializeAutomations() {
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
      config: JSON.parse(
        JSON.stringify({
          delayHours: t.delayHours,
          delayDays: (t as Record<string, unknown>).delayDays,
        })
      ),
    })),
  });
  revalidatePath("/automations");
}

export async function toggleAutomation(id: string, enabled: boolean) {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return;
  await prisma.automationRule.updateMany({ where: { id, userId }, data: { enabled } });
  revalidatePath("/automations");
}
