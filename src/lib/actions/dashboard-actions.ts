"use server";

import { prisma } from "@/lib/db/prisma";
import { auth } from "@/auth";

export type SmartDashboardData = {
  kpis: {
    activeClients: number;
    activeProjects: number;
    todayTasks: string;
    monthRevenue: number;
    openInvoices: number;
    openQuotes: number;
  };
  urgent: {
    approachingDeadlines: { id: string; title: string; deadline: Date | null }[];
    overdueInvoices: {
      id: string;
      invoiceNumber: string;
      total: number;
      dueDate: Date | null;
    }[];
  };
  todayContent: {
    id: string;
    title: string;
    status: string;
    color: string;
  }[];
  thisWeek: {
    deadlines: { id: string; title: string; deadline: Date }[];
    tasks: { id: string; title: string; completed: boolean; projectTitle: string | null }[];
  };
  recentProjects: {
    id: string;
    title: string;
    phase: string;
    clientName: string | null;
    updatedAt: Date;
  }[];
};

export async function getSmartDashboard(): Promise<SmartDashboardData | null> {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return null;

  try {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const tomorrow = new Date(today.getTime() + 86400000);

  const weekEnd = new Date(today.getTime() + 7 * 86400000);

  const [
    activeClients,
    activeProjects,
    completedTasks,
    totalTasks,
    monthRevenue,
    openInvoices,
    openQuotes,
    approachingDeadlines,
    overdueInvoices,
    todayContent,
    weekDeadlines,
    weekTasks,
    recentProjects,
  ] = await Promise.all([
    prisma.client.count({ where: { userId, isActive: true } }),
    prisma.project.count({ where: { userId, phase: { notIn: ["done", "delivered", "gallery_delivery", "published", "active"] } } }),
    prisma.task.count({ where: { project: { userId }, completed: true } }),
    prisma.task.count({ where: { project: { userId } } }),
    prisma.invoice.aggregate({
      where: { userId, status: "paid", paidAt: { gte: new Date(now.getFullYear(), now.getMonth(), 1) } },
      _sum: { total: true },
    }),
    prisma.invoice.count({ where: { userId, status: { in: ["sent", "overdue"] } } }),
    prisma.quote.count({ where: { userId, status: { in: ["draft", "sent"] } } }),
    // Approaching deadlines (next 48h)
    prisma.project.findMany({
      where: { userId, deadline: { gte: today, lte: new Date(now.getTime() + 48 * 3600000) }, phase: { notIn: ["done", "delivered"] } },
      select: { id: true, title: true, deadline: true },
      take: 5,
    }),
    // Overdue invoices
    prisma.invoice.findMany({
      where: { userId, status: "overdue" },
      select: { id: true, invoiceNumber: true, total: true, dueDate: true },
      take: 5,
    }),
    // Today's content
    prisma.scheduledContent.findMany({
      where: { userId, date: { gte: today, lt: tomorrow } },
      select: { id: true, title: true, status: true, color: true },
    }),
    // This week's deadlines
    prisma.project.findMany({
      where: { userId, deadline: { gte: today, lt: weekEnd }, phase: { notIn: ["done", "delivered"] } },
      select: { id: true, title: true, deadline: true },
      orderBy: { deadline: "asc" },
      take: 8,
    }),
    // This week's incomplete tasks
    prisma.task.findMany({
      where: { project: { userId }, completed: false },
      select: { id: true, title: true, completed: true, project: { select: { title: true } } },
      orderBy: { createdAt: "asc" },
      take: 8,
    }),
    // Recent projects
    prisma.project.findMany({
      where: { userId },
      select: { id: true, title: true, phase: true, client: { select: { name: true } }, updatedAt: true },
      orderBy: { updatedAt: "desc" },
      take: 5,
    }),
  ]);

  return {
    kpis: {
      activeClients,
      activeProjects,
      todayTasks: totalTasks > 0 ? `${completedTasks}/${totalTasks}` : "0",
      monthRevenue: monthRevenue._sum.total ?? 0,
      openInvoices,
      openQuotes,
    },
    urgent: { approachingDeadlines, overdueInvoices },
    todayContent,
    thisWeek: {
      deadlines: weekDeadlines.filter(p => p.deadline !== null) as { id: string; title: string; deadline: Date }[],
      tasks: weekTasks.map(t => ({ id: t.id, title: t.title, completed: t.completed, projectTitle: t.project.title })),
    },
    recentProjects: recentProjects.map(p => ({
      id: p.id, title: p.title, phase: p.phase, clientName: p.client?.name ?? null, updatedAt: p.updatedAt,
    })),
  };
  } catch (error) {
    console.error("Dashboard query failed:", error);
    return {
      kpis: { activeClients: 0, activeProjects: 0, todayTasks: "0", monthRevenue: 0, openInvoices: 0, openQuotes: 0 },
      urgent: { approachingDeadlines: [], overdueInvoices: [] },
      todayContent: [],
      thisWeek: { deadlines: [], tasks: [] },
      recentProjects: [],
    };
  }
}
