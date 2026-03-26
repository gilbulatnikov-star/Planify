"use server";
import { prisma } from "@/lib/db/prisma";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";

export async function getNotifications() {
  try {
    const session = await auth();
    const userId = session?.user?.id;
    if (!userId) return [];
    return await prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 20,
    });
  } catch {
    return [];
  }
}

export async function getUnreadCount() {
  try {
    const session = await auth();
    const userId = session?.user?.id;
    if (!userId) return 0;
    return await prisma.notification.count({ where: { userId, read: false } });
  } catch {
    return 0;
  }
}

export async function markAsRead(id: string) {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return;
  await prisma.notification.updateMany({ where: { id, userId }, data: { read: true } });
  revalidatePath("/");
}

export async function markAllAsRead() {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return;
  await prisma.notification.updateMany({ where: { userId, read: false }, data: { read: true } });
  revalidatePath("/");
}

export async function deleteNotification(id: string) {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return;
  await prisma.notification.deleteMany({ where: { id, userId } });
  revalidatePath("/");
}
