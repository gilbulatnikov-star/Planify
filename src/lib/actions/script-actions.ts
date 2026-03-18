"use server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db/prisma";

export async function getScripts() {
  return prisma.script.findMany({
    orderBy: { updatedAt: "desc" },
    include: {
      project: { select: { id: true, title: true } },
      client: { select: { id: true, name: true } },
    },
  });
}

export async function getScript(id: string) {
  return prisma.script.findUnique({
    where: { id },
    include: {
      project: { select: { id: true, title: true } },
      client: { select: { id: true, name: true } },
    },
  });
}

export async function createScript(data: {
  title?: string;
  platform?: string;
  projectId?: string;
  clientId?: string;
}) {
  const script = await prisma.script.create({
    data: {
      title: data.title || "תסריט ללא כותרת",
      platform: data.platform || "youtube",
      projectId: data.projectId || null,
      clientId: data.clientId || null,
    },
  });
  revalidatePath("/scripts");
  return script;
}

export async function updateScript(
  id: string,
  data: {
    title?: string;
    content?: string;
    platform?: string;
    duration?: string;
    notes?: string;
    shotListData?: string;
    projectId?: string;
    clientId?: string;
  }
) {
  const script = await prisma.script.update({ where: { id }, data });
  revalidatePath("/scripts");
  revalidatePath(`/scripts/${id}`);
  return script;
}

export async function deleteScript(id: string) {
  await prisma.script.delete({ where: { id } });
  revalidatePath("/scripts");
}
