"use server";

import { prisma } from "@/lib/db/prisma";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";

function isAdmin(email: string) {
  const admins = (process.env.ADMIN_EMAIL ?? "").split(",").map(e => e.trim().toLowerCase());
  return admins.includes(email.toLowerCase());
}

export async function submitFeedback(message: string, rating?: number) {
  const session = await auth();

  await prisma.feedback.create({
    data: {
      message: message.trim(),
      rating: rating ?? null,
      userId: session?.user?.id ?? null,
      userEmail: session?.user?.email ?? null,
      userName: session?.user?.name ?? null,
    },
  });

  return { success: true };
}

export async function getAdminFeedbacks() {
  const session = await auth();
  if (!session?.user?.email || !isAdmin(session.user.email)) {
    throw new Error("Unauthorized");
  }
  return prisma.feedback.findMany({
    orderBy: { createdAt: "desc" },
    take: 200,
  });
}

export async function deleteFeedback(id: string) {
  const session = await auth();
  if (!session?.user?.email || !isAdmin(session.user.email)) {
    throw new Error("Unauthorized");
  }
  await prisma.feedback.delete({ where: { id } });
  revalidatePath("/admin");
  return { success: true };
}
