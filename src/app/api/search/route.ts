import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/db/prisma";

const LIMIT = 5;

export async function GET(req: NextRequest) {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const q = req.nextUrl.searchParams.get("q")?.trim();
  if (!q || q.length < 1) {
    return NextResponse.json({ results: [] });
  }

  const [projects, clients, contacts, scripts, tasks] = await Promise.all([
    prisma.project.findMany({
      where: { userId, title: { contains: q, mode: "insensitive" } },
      select: { id: true, title: true },
      take: LIMIT,
      orderBy: { updatedAt: "desc" },
    }),
    prisma.client.findMany({
      where: { userId, name: { contains: q, mode: "insensitive" } },
      select: { id: true, name: true },
      take: LIMIT,
      orderBy: { updatedAt: "desc" },
    }),
    prisma.contact.findMany({
      where: { userId, name: { contains: q, mode: "insensitive" } },
      select: { id: true, name: true },
      take: LIMIT,
      orderBy: { updatedAt: "desc" },
    }),
    prisma.script.findMany({
      where: { userId, title: { contains: q, mode: "insensitive" } },
      select: { id: true, title: true },
      take: LIMIT,
      orderBy: { updatedAt: "desc" },
    }),
    prisma.task.findMany({
      where: {
        project: { userId },
        title: { contains: q, mode: "insensitive" },
      },
      select: { id: true, title: true, projectId: true },
      take: LIMIT,
      orderBy: { createdAt: "desc" },
    }),
  ]);

  type SearchResult = { label: string; href: string; type: string };
  const results: Record<string, SearchResult[]> = {};

  if (projects.length) {
    results["projects"] = projects.map((p) => ({
      label: p.title,
      href: `/projects/${p.id}`,
      type: "projects",
    }));
  }
  if (clients.length) {
    results["clients"] = clients.map((c) => ({
      label: c.name,
      href: `/clients/${c.id}`,
      type: "clients",
    }));
  }
  if (contacts.length) {
    results["contacts"] = contacts.map((c) => ({
      label: c.name,
      href: `/contacts/${c.id}`,
      type: "contacts",
    }));
  }
  if (scripts.length) {
    results["scripts"] = scripts.map((s) => ({
      label: s.title,
      href: `/scripts/${s.id}`,
      type: "scripts",
    }));
  }
  if (tasks.length) {
    results["tasks"] = tasks.map((t) => ({
      label: t.title,
      href: `/projects/${t.projectId}`,
      type: "tasks",
    }));
  }

  return NextResponse.json({ results });
}
