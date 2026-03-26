"use server";
import { prisma } from "@/lib/db/prisma";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";

export async function getNotifications() {
  try {
    const session = await auth();
    const userId = session?.user?.id;
    if (!userId) return [];
    // Check if notification model exists on prisma client
    if (!("notification" in prisma)) return [];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return await (prisma as any).notification.findMany({
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
    if (!("notification" in prisma)) return 0;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return await (prisma as any).notification.count({ where: { userId, read: false } });
  } catch {
    return 0;
  }
}

export async function markAsRead(id: string) {
  try {
    const session = await auth();
    const userId = session?.user?.id;
    if (!userId) return;
    await prisma.notification.updateMany({ where: { id, userId }, data: { read: true } });
    revalidatePath("/");
  } catch { /* ignore */ }
}

export async function markAllAsRead() {
  try {
    const session = await auth();
    const userId = session?.user?.id;
    if (!userId) return;
    await prisma.notification.updateMany({ where: { userId, read: false }, data: { read: true } });
    revalidatePath("/");
  } catch { /* ignore */ }
}

export async function deleteNotification(id: string) {
  try {
    const session = await auth();
    const userId = session?.user?.id;
    if (!userId) return;
    await prisma.notification.deleteMany({ where: { id, userId } });
    revalidatePath("/");
  } catch { /* ignore */ }
}
