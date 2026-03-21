"use server";

import { prisma } from "@/lib/db/prisma";
import { auth } from "@/auth";

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
  return prisma.feedback.findMany({
    orderBy: { createdAt: "desc" },
    take: 200,
  });
}

export async function deleteFeedback(id: string) {
  await prisma.feedback.delete({ where: { id } });
  return { success: true };
}
