"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db/prisma";
import { auth } from "@/auth";

// ── Create a tokenized share link ──────────────────────────────────────────
export async function createShareLink(
  projectId: string,
  options: {
    allowDownload?: boolean;
    expiresAt?: string | null;
    note?: string | null;
  } = {},
) {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) throw new Error("Unauthorized");

  // Verify ownership
  const project = await prisma.project.findFirst({
    where: { id: projectId, userId },
    select: { id: true },
  });
  if (!project) throw new Error("Project not found");

  const link = await prisma.shareLink.create({
    data: {
      projectId,
      userId,
      allowDownload: options.allowDownload ?? false,
      expiresAt: options.expiresAt ? new Date(options.expiresAt) : null,
      note: options.note ?? null,
    },
  });

  revalidatePath(`/projects/${projectId}`);
  return link;
}

// ── Public: get share link data (no auth) ──────────────────────────────────
export async function getShareLink(token: string) {
  const link = await prisma.shareLink.findUnique({
    where: { token },
    include: {
      project: {
        include: {
          client: { select: { name: true } },
          tasks: {
            orderBy: { createdAt: "asc" },
            select: { id: true, title: true, completed: true },
          },
        },
      },
      user: { select: { name: true } },
    },
  });

  if (!link || !link.active) return null;

  // Check expiry
  if (link.expiresAt && new Date() > link.expiresAt) return null;

  // Return only safe, non-sensitive data
  return {
    projectTitle: link.project.title,
    projectDescription: link.project.description,
    projectPhase: link.project.phase,
    projectDeadline: link.project.deadline,
    clientName: link.project.client?.name ?? null,
    tasks: link.project.tasks,
    note: link.note,
    sharedByName: link.user.name,
    allowDownload: link.allowDownload,
    createdAt: link.createdAt,
  };
}

// ── List user's share links for a project ──────────────────────────────────
export async function getUserShareLinks(projectId: string) {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return [];

  // Verify ownership
  const project = await prisma.project.findFirst({
    where: { id: projectId, userId },
    select: { id: true },
  });
  if (!project) return [];

  return prisma.shareLink.findMany({
    where: { projectId, userId },
    orderBy: { createdAt: "desc" },
  });
}

// ── Deactivate a share link ────────────────────────────────────────────────
export async function deactivateShareLink(id: string) {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) throw new Error("Unauthorized");

  const link = await prisma.shareLink.findFirst({
    where: { id, userId },
  });
  if (!link) throw new Error("Share link not found");

  await prisma.shareLink.update({
    where: { id },
    data: { active: false },
  });

  revalidatePath(`/projects/${link.projectId}`);
}

// ── Delete a share link ────────────────────────────────────────────────────
export async function deleteShareLink(id: string) {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) throw new Error("Unauthorized");

  const link = await prisma.shareLink.findFirst({
    where: { id, userId },
  });
  if (!link) throw new Error("Share link not found");

  await prisma.shareLink.delete({ where: { id } });

  revalidatePath(`/projects/${link.projectId}`);
}
