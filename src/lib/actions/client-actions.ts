"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db/prisma";
import { auth } from "@/auth";
import { getLimitsForPlan } from "@/lib/plan-limits";

const VALID_CLIENT_TYPES   = ["lead", "client"] as const;
const VALID_LEAD_STATUSES  = ["new", "contacted", "qualified", "proposal", "negotiation", "won", "lost"] as const;

export async function getClients() {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return [];
  return prisma.client.findMany({
    where: { userId },
    orderBy: { name: "asc" },
    select: { id: true, name: true },
  });
}

export async function createClientQuick(name: string) {
  try {
    if (!name.trim()) return { success: false as const, error: "שם נדרש" };
    const session = await auth();
    const userId = session?.user?.id;
    const plan = session?.user?.subscriptionPlan ?? "FREE";
    const limits = getLimitsForPlan(plan);
    if (!userId) return { success: false as const, error: "לא מחובר" };
    if (limits.clients !== -1) {
      const count = await prisma.client.count({ where: { userId } });
      if (count >= limits.clients) return { success: false as const, quotaExceeded: true as const, error: "הגעת למגבלת הלקוחות" };
    }
    const client = await prisma.client.create({
      data: { name: name.trim(), type: "client", leadStatus: "new", userId: userId ?? undefined },
      select: { id: true, name: true },
    });
    revalidatePath("/clients");
    revalidatePath("/projects");
    revalidatePath("/");
    return { success: true as const, client };
  } catch (error) {
    return { success: false as const, error: error instanceof Error ? error.message : "שגיאה" };
  }
}

export async function createClient(formData: FormData) {
  try {
    const name = formData.get("name") as string;
    if (!name) {
      return { success: false, error: "Name is required" };
    }
    const session = await auth();
    const userId = session?.user?.id;
    const plan = session?.user?.subscriptionPlan ?? "FREE";
    const limits = getLimitsForPlan(plan);
    if (!userId) return { success: false, error: "לא מחובר" };
    if (limits.clients !== -1) {
      const count = await prisma.client.count({ where: { userId } });
      if (count >= limits.clients) return { success: false, quotaExceeded: true };
    }

    const tagsRaw = (formData.get("tags") as string) || "";
    const tags = tagsRaw.split(",").map((t) => t.trim().slice(0, 50)).filter(Boolean).slice(0, 20);

    const rawType = (formData.get("type") as string) || "lead";
    const type = VALID_CLIENT_TYPES.includes(rawType as typeof VALID_CLIENT_TYPES[number]) ? rawType : "lead";

    const rawLeadStatus = (formData.get("leadStatus") as string) || "new";
    const leadStatus = VALID_LEAD_STATUSES.includes(rawLeadStatus as typeof VALID_LEAD_STATUSES[number]) ? rawLeadStatus : "new";

    await prisma.client.create({
      data: {
        name: name.trim().slice(0, 200),
        email: ((formData.get("email") as string) || null)?.slice(0, 254) ?? null,
        phone: ((formData.get("phone") as string) || null)?.slice(0, 30) ?? null,
        company: ((formData.get("company") as string) || null)?.slice(0, 200) ?? null,
        website: ((formData.get("website") as string) || null)?.slice(0, 500) ?? null,
        instagram: ((formData.get("instagram") as string) || null)?.slice(0, 200) ?? null,
        youtube: ((formData.get("youtube") as string) || null)?.slice(0, 200) ?? null,
        linkedin: ((formData.get("linkedin") as string) || null)?.slice(0, 200) ?? null,
        tiktok: ((formData.get("tiktok") as string) || null)?.slice(0, 200) ?? null,
        facebook: ((formData.get("facebook") as string) || null)?.slice(0, 200) ?? null,
        notes: ((formData.get("notes") as string) || null)?.slice(0, 5000) ?? null,
        type,
        leadSource: ((formData.get("leadSource") as string) || null)?.slice(0, 100) ?? null,
        leadStatus,
        isActive: formData.get("isActive") !== "false",
        isRetainer: formData.get("isRetainer") === "true",
        tags,
        userId: userId ?? undefined,
      },
    });

    revalidatePath("/clients");
    revalidatePath("/");
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create client",
    };
  }
}

export async function updateClient(id: string, formData: FormData) {
  try {
    const session = await auth();
    const userId = session?.user?.id;
    if (!userId) return { success: false, error: "Not authenticated" };

    const name = formData.get("name") as string;
    if (!name) {
      return { success: false, error: "Name is required" };
    }

    const tagsRaw = (formData.get("tags") as string) || "";
    const tags = tagsRaw.split(",").map((t) => t.trim().slice(0, 50)).filter(Boolean).slice(0, 20);

    const rawType = (formData.get("type") as string) || "lead";
    const type = VALID_CLIENT_TYPES.includes(rawType as typeof VALID_CLIENT_TYPES[number]) ? rawType : "lead";

    const rawLeadStatus = (formData.get("leadStatus") as string) || "new";
    const leadStatus = VALID_LEAD_STATUSES.includes(rawLeadStatus as typeof VALID_LEAD_STATUSES[number]) ? rawLeadStatus : "new";

    const existing = await prisma.client.findFirst({ where: { id, userId } });
    if (!existing) return { success: false, error: "Not found" };

    await prisma.client.update({
      where: { id },
      data: {
        name: name.trim().slice(0, 200),
        email: ((formData.get("email") as string) || null)?.slice(0, 254) ?? null,
        phone: ((formData.get("phone") as string) || null)?.slice(0, 30) ?? null,
        company: ((formData.get("company") as string) || null)?.slice(0, 200) ?? null,
        website: ((formData.get("website") as string) || null)?.slice(0, 500) ?? null,
        instagram: ((formData.get("instagram") as string) || null)?.slice(0, 200) ?? null,
        youtube: ((formData.get("youtube") as string) || null)?.slice(0, 200) ?? null,
        linkedin: ((formData.get("linkedin") as string) || null)?.slice(0, 200) ?? null,
        tiktok: ((formData.get("tiktok") as string) || null)?.slice(0, 200) ?? null,
        facebook: ((formData.get("facebook") as string) || null)?.slice(0, 200) ?? null,
        notes: ((formData.get("notes") as string) || null)?.slice(0, 5000) ?? null,
        type,
        leadSource: ((formData.get("leadSource") as string) || null)?.slice(0, 100) ?? null,
        leadStatus,
        isActive: formData.get("isActive") !== "false",
        isRetainer: formData.get("isRetainer") === "true",
        tags,
      },
    });

    revalidatePath("/clients");
    revalidatePath("/");
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update client",
    };
  }
}

export async function getLeads() {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return [];
  return prisma.client.findMany({
    where: { userId, type: "lead" },
    include: {
      interactions: { orderBy: { date: "desc" }, take: 1 },
      _count: { select: { interactions: true } },
    },
    orderBy: { updatedAt: "desc" },
  });
}

export async function updateLeadStatus(id: string, leadStatus: string) {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return { success: false, error: "Not authenticated" };

  if (!VALID_LEAD_STATUSES.includes(leadStatus as typeof VALID_LEAD_STATUSES[number])) {
    return { success: false, error: "Invalid status" };
  }

  const existing = await prisma.client.findFirst({ where: { id, userId } });
  if (!existing) return { success: false, error: "Not found" };

  await prisma.client.update({ where: { id }, data: { leadStatus } });
  revalidatePath("/leads");
  return { success: true };
}

export async function convertLeadToClient(id: string) {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return { success: false, error: "Not authenticated" };

  const existing = await prisma.client.findFirst({ where: { id, userId, type: "lead" } });
  if (!existing) return { success: false, error: "Not found" };

  await prisma.client.update({
    where: { id },
    data: { type: "client", isActive: true, leadStatus: "won" },
  });
  revalidatePath("/leads");
  revalidatePath("/clients");
  return { success: true };
}

export async function deleteClient(id: string) {
  try {
    const session = await auth();
    const userId = session?.user?.id;
    if (!userId) return { success: false, error: "Not authenticated" };

    const existing = await prisma.client.findFirst({ where: { id, userId } });
    if (!existing) return { success: false, error: "Not found" };

    await prisma.client.delete({
      where: { id },
    });

    revalidatePath("/clients");
    revalidatePath("/");
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to delete client",
    };
  }
}
