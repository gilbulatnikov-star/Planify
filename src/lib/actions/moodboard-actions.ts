"use server";

import { prisma } from "@/lib/db/prisma";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";

export async function getMoodboards() {
  const session = await auth();
  const userId = session?.user?.id;
  return prisma.moodboard.findMany({
    where: { userId: userId ?? undefined },
    orderBy: { updatedAt: "desc" },
    include: { project: { select: { id: true, title: true } } },
  });
}

export async function getMoodboard(id: string) {
  return prisma.moodboard.findUnique({
    where: { id },
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
  data: { title?: string; nodesData?: string; edgesData?: string }
) {
  await prisma.moodboard.update({ where: { id }, data });
  revalidatePath("/moodboard");
  revalidatePath(`/moodboard/${id}`);
}

export async function deleteMoodboard(id: string) {
  await prisma.moodboard.delete({ where: { id } });
  revalidatePath("/moodboard");
}
