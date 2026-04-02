"use server";

import { prisma } from "@/lib/db/prisma";
import { Prisma } from "@prisma/client";
import { auth } from "@/auth";
import { DONE_PHASES } from "@/lib/project-config";
import { resolveLayout, DEFAULT_LAYOUT, type WidgetConfig } from "@/lib/dashboard-config";

// ── Dashboard Layout ──────────────────────────────────────────────────────────

export async function getDashboardLayout(): Promise<WidgetConfig[]> {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return [...DEFAULT_LAYOUT];

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { dashboardLayout: true },
  });

  return resolveLayout(user?.dashboardLayout);
}

export async function saveDashboardLayout(layout: WidgetConfig[]): Promise<{ ok: boolean }> {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return { ok: false };

  // Validate: must be an array of WidgetConfig
  if (!Array.isArray(layout) || layout.length === 0) return { ok: false };

  await prisma.user.update({
    where: { id: userId },
    data: { dashboardLayout: layout as object[] },
  });

  return { ok: true };
}

export async function resetDashboardLayout(): Promise<{ ok: boolean }> {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return { ok: false };

  await prisma.user.update({
    where: { id: userId },
    data: { dashboardLayout: Prisma.DbNull },
  });

  return { ok: true };
}

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
  monthlySummary: {
    projectsThisMonth: number;
    projectsLastMonth: number;
    tasksCompletedThisMonth: number;
    tasksCompletedLastMonth: number;
    revenueThisMonth: number;
    revenueLastMonth: number;
    contentPublishedThisMonth: number;
    contentPublishedLastMonth: number;
  };
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

  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const lastMonthEnd = monthStart;

  // Batch 1a: KPI counts (5 queries)
  const [
    activeClients,
    activeProjects,
    completedTasks,
    totalTasks,
    monthRevenue,
  ] = await Promise.all([
    prisma.client.count({ where: { userId, isActive: true } }),
    prisma.project.count({ where: { userId, phase: { notIn: DONE_PHASES } } }),
    prisma.task.count({ where: { project: { userId }, completed: true } }),
    prisma.task.count({ where: { project: { userId } } }),
    prisma.invoice.aggregate({
      where: { userId, status: "paid", paidAt: { gte: new Date(now.getFullYear(), now.getMonth(), 1) } },
      _sum: { total: true },
    }),
  ]);

  // Batch 1b: Urgent + today (5 queries)
  const [
    openInvoices,
    openQuotes,
    approachingDeadlines,
    overdueInvoices,
    todayContent,
  ] = await Promise.all([
    prisma.invoice.count({ where: { userId, status: { in: ["sent", "overdue"] } } }),
    prisma.quote.count({ where: { userId, status: { in: ["draft", "sent"] } } }),
    prisma.project.findMany({
      where: { userId, deadline: { gte: today, lte: new Date(now.getTime() + 48 * 3600000) }, phase: { notIn: DONE_PHASES } },
      select: { id: true, title: true, deadline: true },
      take: 5,
    }),
    prisma.invoice.findMany({
      where: { userId, status: "overdue" },
      select: { id: true, invoiceNumber: true, total: true, dueDate: true },
      take: 5,
    }),
    prisma.scheduledContent.findMany({
      where: { userId, date: { gte: today, lt: tomorrow } },
      select: { id: true, title: true, status: true, color: true },
    }),
  ]);

  // Batch 2a: Week + recent projects (3 queries)
  const [
    weekDeadlines,
    weekTasks,
    recentProjects,
  ] = await Promise.all([
    prisma.project.findMany({
      where: { userId, deadline: { gte: today, lt: weekEnd }, phase: { notIn: DONE_PHASES } },
      select: { id: true, title: true, deadline: true },
      orderBy: { deadline: "asc" },
      take: 8,
    }),
    prisma.task.findMany({
      where: { project: { userId }, completed: false },
      select: { id: true, title: true, completed: true, project: { select: { title: true } } },
      orderBy: { createdAt: "asc" },
      take: 8,
    }),
    prisma.project.findMany({
      where: { userId },
      select: { id: true, title: true, phase: true, client: { select: { name: true } }, updatedAt: true },
      orderBy: { updatedAt: "desc" },
      take: 5,
    }),
  ]);

  // Batch 2b: Monthly summary (7 queries)
  const [
    projectsThisMonth,
    projectsLastMonth,
    tasksCompletedThisMonth,
    tasksCompletedLastMonth,
    revenueLastMonth,
    contentPublishedThisMonth,
    contentPublishedLastMonth,
  ] = await Promise.all([
    prisma.project.count({ where: { userId, createdAt: { gte: monthStart } } }),
    prisma.project.count({ where: { userId, createdAt: { gte: lastMonthStart, lt: lastMonthEnd } } }),
    prisma.task.count({ where: { project: { userId }, completed: true, createdAt: { gte: monthStart } } }),
    prisma.task.count({ where: { project: { userId }, completed: true, createdAt: { gte: lastMonthStart, lt: lastMonthEnd } } }),
    prisma.invoice.aggregate({
      where: { userId, status: "paid", paidAt: { gte: lastMonthStart, lt: lastMonthEnd } },
      _sum: { total: true },
    }),
    prisma.scheduledContent.count({ where: { userId, status: "published", date: { gte: monthStart } } }),
    prisma.scheduledContent.count({ where: { userId, status: "published", date: { gte: lastMonthStart, lt: lastMonthEnd } } }),
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
    monthlySummary: {
      projectsThisMonth,
      projectsLastMonth,
      tasksCompletedThisMonth,
      tasksCompletedLastMonth,
      revenueThisMonth: monthRevenue._sum.total ?? 0,
      revenueLastMonth: revenueLastMonth._sum.total ?? 0,
      contentPublishedThisMonth,
      contentPublishedLastMonth,
    },
  };
  } catch (error) {
    console.error("Dashboard query failed:", error);
    return {
      kpis: { activeClients: 0, activeProjects: 0, todayTasks: "0", monthRevenue: 0, openInvoices: 0, openQuotes: 0 },
      urgent: { approachingDeadlines: [], overdueInvoices: [] },
      todayContent: [],
      thisWeek: { deadlines: [], tasks: [] },
      recentProjects: [],
      monthlySummary: {
        projectsThisMonth: 0, projectsLastMonth: 0,
        tasksCompletedThisMonth: 0, tasksCompletedLastMonth: 0,
        revenueThisMonth: 0, revenueLastMonth: 0,
        contentPublishedThisMonth: 0, contentPublishedLastMonth: 0,
      },
    };
  }
}
