"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db/prisma";
import { auth } from "@/auth";

export async function getContentBoards() {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return [];
  return prisma.contentBoard.findMany({
    where: { userId },
    include: {
      client: { select: { id: true, name: true } },
      project: { select: { id: true, title: true } },
      _count: { select: { items: true } },
    },
    orderBy: { updatedAt: "desc" },
  });
}

export async function createContentBoard(formData: FormData) {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return { success: false, error: "Not authenticated" };

  const title = formData.get("title") as string;
  if (!title) return { success: false, error: "Title required" };

  const board = await prisma.contentBoard.create({
    data: {
      title,
      userId,
      clientId: (formData.get("clientId") as string) || null,
      projectId: (formData.get("projectId") as string) || null,
    },
  });

  revalidatePath("/calendar");
  return { success: true, id: board.id };
}

export async function updateContentBoard(id: string, formData: FormData) {
  const title = formData.get("title") as string;
  if (!title) return { success: false, error: "Title required" };

  await prisma.contentBoard.update({
    where: { id },
    data: {
      title,
      clientId: (formData.get("clientId") as string) || null,
      projectId: (formData.get("projectId") as string) || null,
    },
  });

  revalidatePath("/calendar");
  return { success: true };
}

export async function deleteContentBoard(id: string) {
  // Unlink items first (don't delete them)
  await prisma.scheduledContent.updateMany({
    where: { boardId: id },
    data: { boardId: null },
  });
  await prisma.contentBoard.delete({ where: { id } });
  revalidatePath("/calendar");
  return { success: true };
}

export async function getBoardContent(boardId: string, month: number, year: number) {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return [];

  const start = new Date(year, month, 1);
  const end = new Date(year, month + 1, 0, 23, 59, 59);

  return prisma.scheduledContent.findMany({
    where: {
      boardId,
      userId,
      date: { gte: start, lte: end },
    },
    include: {
      client: { select: { id: true, name: true } },
    },
    orderBy: { date: "asc" },
  });
}
