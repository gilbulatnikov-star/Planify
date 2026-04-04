"use server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db/prisma";
import { auth } from "@/auth";
import { getLimitsForPlan } from "@/lib/plan-limits";

export async function getScripts() {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return [];
  return prisma.script.findMany({
    where: { userId },
    orderBy: { updatedAt: "desc" },
    select: {
      id: true, title: true, platform: true, content: true, updatedAt: true,
      clientId: true, projectId: true,
      project: { select: { id: true, title: true } },
      client: { select: { id: true, name: true } },
    },
  });
}

export async function getScript(id: string) {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return null;
  return prisma.script.findFirst({
    where: { id, userId },
    include: {
      project: { select: { id: true, title: true } },
      client: { select: { id: true, name: true } },
    },
  });
}

export async function createScript(data: {
  title?: string;
  platform?: string;
  projectId?: string;
  clientId?: string;
  content?: string;
}) {
  // ── Quota check ──────────────────────────────────────────────────────────────
  const session = await auth();
  const userId = session?.user?.id;
  const plan = session?.user?.subscriptionPlan ?? "FREE";
  const limits = getLimitsForPlan(plan);
  if (!userId) return { success: false as const, error: "לא מחובר" };
  if (limits.scripts !== -1) {
    const count = await prisma.script.count({ where: { userId } });
    if (count >= limits.scripts) {
      return { quotaExceeded: true as const };
    }
  }

  const script = await prisma.script.create({
    data: {
      title: data.title || "תסריט ללא כותרת",
      platform: data.platform || "youtube",
      projectId: data.projectId || null,
      clientId: data.clientId || null,
      content: data.content || undefined,
      userId: userId ?? undefined,
    },
  });
  revalidatePath("/scripts");
  return script;
}

export async function updateScript(
  id: string,
  data: {
    title?: string;
    content?: string;
    platform?: string;
    duration?: string;
    notes?: string;
    shotListData?: string;
    projectId?: string;
    clientId?: string;
  }
) {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return { success: false, error: "Not authenticated" };

  const existing = await prisma.script.findFirst({ where: { id, userId } });
  if (!existing) return { success: false, error: "Not found" };

  const script = await prisma.script.update({ where: { id }, data });
  revalidatePath("/scripts");
  revalidatePath(`/scripts/${id}`);
  return script;
}

export async function deleteScript(id: string) {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return { success: false, error: "Not authenticated" };

  const existing = await prisma.script.findFirst({ where: { id, userId } });
  if (!existing) return { success: false, error: "Not found" };

  await prisma.script.delete({ where: { id } });
  revalidatePath("/scripts");
}
