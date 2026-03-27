"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db/prisma";
import { auth } from "@/auth";
import { hash, compare } from "bcryptjs";

// ── Types ────────────────────────────────────────────────────────────────────

interface CreateShareLinkOptions {
  allowDownload?: boolean;
  expiresAt?: string | null;
  note?: string | null;
  password?: string | null;
  showDescription?: boolean;
  showStatus?: boolean;
  showDeadline?: boolean;
  showTasks?: boolean;
  showFiles?: boolean;
  showClientName?: boolean;
}

interface UpdateShareLinkOptions {
  allowDownload?: boolean;
  expiresAt?: string | null;
  note?: string | null;
  password?: string | null;
  showDescription?: boolean;
  showStatus?: boolean;
  showDeadline?: boolean;
  showTasks?: boolean;
  showFiles?: boolean;
  showClientName?: boolean;
  active?: boolean;
}

interface AddProjectFileData {
  name: string;
  url: string;
  type: string; // image, video, document, link, deliverable
  mimeType?: string | null;
  size?: number | null;
  isShared?: boolean;
}

// ── Create a tokenized share link ────────────────────────────────────────────

export async function createShareLink(
  projectId: string,
  options: CreateShareLinkOptions = {},
) {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) throw new Error("Unauthorized");

  const project = await prisma.project.findFirst({
    where: { id: projectId, userId },
    select: { id: true },
  });
  if (!project) throw new Error("Project not found");

  let passwordHash: string | null = null;
  if (options.password) {
    passwordHash = await hash(options.password, 12);
  }

  const link = await prisma.shareLink.create({
    data: {
      projectId,
      userId,
      allowDownload: options.allowDownload ?? false,
      expiresAt: options.expiresAt ? new Date(options.expiresAt) : null,
      note: options.note ?? null,
      passwordHash,
      showDescription: options.showDescription ?? true,
      showStatus: options.showStatus ?? true,
      showDeadline: options.showDeadline ?? true,
      showTasks: options.showTasks ?? true,
      showFiles: options.showFiles ?? true,
      showClientName: options.showClientName ?? false,
    },
  });

  revalidatePath(`/projects/${projectId}`);
  return link;
}

// ── Update an existing share link ────────────────────────────────────────────

export async function updateShareLink(
  id: string,
  options: UpdateShareLinkOptions,
) {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) throw new Error("Unauthorized");

  const link = await prisma.shareLink.findFirst({
    where: { id, userId },
  });
  if (!link) throw new Error("Share link not found");

  // Build update data, only including fields that were provided
  const data: Record<string, unknown> = {};

  if (options.allowDownload !== undefined) data.allowDownload = options.allowDownload;
  if (options.expiresAt !== undefined) {
    data.expiresAt = options.expiresAt ? new Date(options.expiresAt) : null;
  }
  if (options.note !== undefined) data.note = options.note;
  if (options.showDescription !== undefined) data.showDescription = options.showDescription;
  if (options.showStatus !== undefined) data.showStatus = options.showStatus;
  if (options.showDeadline !== undefined) data.showDeadline = options.showDeadline;
  if (options.showTasks !== undefined) data.showTasks = options.showTasks;
  if (options.showFiles !== undefined) data.showFiles = options.showFiles;
  if (options.showClientName !== undefined) data.showClientName = options.showClientName;
  if (options.active !== undefined) data.active = options.active;

  // Handle password: null removes it, string sets it
  if (options.password !== undefined) {
    data.passwordHash = options.password ? await hash(options.password, 12) : null;
  }

  const updated = await prisma.shareLink.update({
    where: { id },
    data,
  });

  revalidatePath(`/projects/${link.projectId}`);
  return updated;
}

// ── Public: get share link data (no auth) ────────────────────────────────────

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
          files: {
            where: { isShared: true },
            orderBy: { createdAt: "desc" },
            select: {
              id: true,
              name: true,
              url: true,
              type: true,
              mimeType: true,
              size: true,
              createdAt: true,
            },
          },
        },
      },
      user: { select: { name: true } },
    },
  });

  if (!link || !link.active) return null;

  // Check expiry
  if (link.expiresAt && new Date() > link.expiresAt) return null;

  // If password-protected, return a flag so the client can prompt
  const isPasswordProtected = !!link.passwordHash;

  // Build safe payload, respecting show* visibility flags
  const payload: Record<string, unknown> = {
    projectTitle: link.project.title,
    note: link.note,
    sharedByName: link.user.name,
    allowDownload: link.allowDownload,
    createdAt: link.createdAt,
    isPasswordProtected,
  };

  if (link.showDescription) {
    payload.projectDescription = link.project.description;
  }

  if (link.showStatus) {
    payload.projectPhase = link.project.phase;
  }

  if (link.showDeadline) {
    payload.projectDeadline = link.project.deadline;
  }

  if (link.showClientName) {
    payload.clientName = link.project.client?.name ?? null;
  }

  if (link.showTasks) {
    payload.tasks = link.project.tasks;
  }

  if (link.showFiles) {
    // Group files by type
    const filesByType: Record<string, typeof link.project.files> = {};
    for (const file of link.project.files) {
      if (!filesByType[file.type]) {
        filesByType[file.type] = [];
      }
      filesByType[file.type].push(file);
    }
    payload.files = filesByType;
  }

  return payload;
}

// ── Public: validate share password (no auth) ────────────────────────────────

export async function validateSharePassword(token: string, password: string) {
  const link = await prisma.shareLink.findUnique({
    where: { token },
    select: { passwordHash: true, active: true, expiresAt: true },
  });

  if (!link || !link.active) return false;
  if (link.expiresAt && new Date() > link.expiresAt) return false;
  if (!link.passwordHash) return true;

  return compare(password, link.passwordHash);
}

// ── List user's share links for a project ────────────────────────────────────

export async function getUserShareLinks(projectId: string) {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return [];

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

// ── Regenerate share token ───────────────────────────────────────────────────

export async function regenerateShareToken(id: string) {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) throw new Error("Unauthorized");

  const link = await prisma.shareLink.findFirst({
    where: { id, userId },
  });
  if (!link) throw new Error("Share link not found");

  const updated = await prisma.shareLink.update({
    where: { id },
    data: {
      token: crypto.randomUUID(),
      regeneratedAt: new Date(),
    },
  });

  revalidatePath(`/projects/${link.projectId}`);
  return updated;
}

// ── Deactivate a share link (soft disable) ───────────────────────────────────

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

// ── Delete a share link (hard delete) ────────────────────────────────────────

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

// ── Add a file to a project ──────────────────────────────────────────────────

export async function addProjectFile(
  projectId: string,
  data: AddProjectFileData,
) {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) throw new Error("Unauthorized");

  const project = await prisma.project.findFirst({
    where: { id: projectId, userId },
    select: { id: true },
  });
  if (!project) throw new Error("Project not found");

  const file = await prisma.projectFile.create({
    data: {
      projectId,
      userId,
      name: data.name,
      url: data.url,
      type: data.type,
      mimeType: data.mimeType ?? null,
      size: data.size ?? null,
      isShared: data.isShared ?? false,
    },
  });

  revalidatePath(`/projects/${projectId}`);
  return file;
}

// ── Delete a file ────────────────────────────────────────────────────────────

export async function deleteProjectFile(fileId: string) {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) throw new Error("Unauthorized");

  const file = await prisma.projectFile.findFirst({
    where: { id: fileId, userId },
  });
  if (!file) throw new Error("File not found");

  await prisma.projectFile.delete({ where: { id: fileId } });

  revalidatePath(`/projects/${file.projectId}`);
}

// ── Toggle file sharing ──────────────────────────────────────────────────────

export async function toggleFileSharing(fileId: string) {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) throw new Error("Unauthorized");

  const file = await prisma.projectFile.findFirst({
    where: { id: fileId, userId },
  });
  if (!file) throw new Error("File not found");

  const updated = await prisma.projectFile.update({
    where: { id: fileId },
    data: { isShared: !file.isShared },
  });

  revalidatePath(`/projects/${file.projectId}`);
  return updated;
}

// ── Get all files for a project (auth required) ──────────────────────────────

export async function getProjectFiles(projectId: string) {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) throw new Error("Unauthorized");

  const project = await prisma.project.findFirst({
    where: { id: projectId, userId },
    select: { id: true },
  });
  if (!project) throw new Error("Project not found");

  return prisma.projectFile.findMany({
    where: { projectId },
    orderBy: { createdAt: "desc" },
  });
}
