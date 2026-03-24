"use server";

import { prisma } from "@/lib/db/prisma";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";

export async function getMoodboards() {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return [];
  return prisma.moodboard.findMany({
    where: { userId },
    orderBy: { updatedAt: "desc" },
    include: { project: { select: { id: true, title: true } } },
  });
}

export async function getMoodboard(id: string) {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return null;
  return prisma.moodboard.findFirst({
    where: { id, userId },
    include: { project: { select: { id: true, title: true } } },
  });
}

export async function createMoodboard(title?: string) {
  const session = await auth();
  const userId = session?.user?.id;
  const board = await prisma.moodboard.create({
    data: { title: title ?? "Moodboard חדש", userId: userId ?? undefined },
  });
  revalidatePath("/moodboard");
  return board;
}

export async function updateMoodboard(
  id: string,
  data: { title?: string; nodesData?: string; edgesData?: string; projectId?: string | null }
) {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return { success: false, error: "Not authenticated" };

  const existing = await prisma.moodboard.findFirst({ where: { id, userId } });
  if (!existing) return { success: false, error: "Not found" };

  await prisma.moodboard.update({ where: { id }, data });
  revalidatePath("/moodboard");
  revalidatePath(`/moodboard/${id}`);
  revalidatePath("/projects");
}

export async function deleteMoodboard(id: string) {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return { success: false, error: "Not authenticated" };

  const existing = await prisma.moodboard.findFirst({ where: { id, userId } });
  if (!existing) return { success: false, error: "Not found" };

  await prisma.moodboard.delete({ where: { id } });
  revalidatePath("/moodboard");
}
