"use server";

import { prisma } from "@/lib/db/prisma";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";

export async function updateLocale(locale: "he" | "en") {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return { success: false };
  await prisma.user.update({ where: { id: userId }, data: { locale } });
  revalidatePath("/", "layout");
  return { success: true };
}
