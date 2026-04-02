"use server";

import { prisma } from "@/lib/db/prisma";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";

export async function updateName(name: string) {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return { success: false };
  const trimmed = name.trim();
  if (!trimmed || trimmed.length > 80) return { success: false, error: "שם לא תקין" };
  await prisma.user.update({ where: { id: userId }, data: { name: trimmed } });
  revalidatePath("/", "layout");
  return { success: true };
}

export async function updateLocale(locale: "he" | "en") {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return { success: false };
  await prisma.user.update({ where: { id: userId }, data: { locale } });
  revalidatePath("/", "layout");
  return { success: true };
}

export async function updateAvatar(dataUrl: string) {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return { success: false, error: "לא מחובר" };
  // Basic validation — must be a data URL (JPEG/PNG/WEBP) or empty string (remove)
  if (dataUrl && !dataUrl.startsWith("data:image/")) {
    return { success: false, error: "פורמט לא תקין" };
  }
  // Limit to ~400 KB (base64 ~540 KB raw)
  if (dataUrl.length > 600_000) {
    return { success: false, error: "התמונה גדולה מדי" };
  }
  await prisma.user.update({ where: { id: userId }, data: { image: dataUrl || null } });
  revalidatePath("/", "layout");
  return { success: true };
}
