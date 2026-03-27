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
  charts: {
    timeline: { week: string; count: number }[];
    bySource: { source: string; count: number }[];
  };
};

export async function getSmartDashboard(): Promise<SmartDashboardData | null> {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return null;

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const tomorrow = new Date(today.getTime() + 86400000);

  const [
    activeClients,
    activeProjects,
    completedTasks,
    totalTasks,
    monthRevenue,
    openInvoices,
    openQuotes,
    urgentItems,
    todayContent,
    recentLeadTimeline,
  ] = await Promise.all([
    // Active clients
    prisma.client.count({
      where: { userId, isActive: true },
    }),
    // Active projects
    prisma.project.count({
      where: { userId, phase: { notIn: ["done", "delivered"] } },
    }),
    // Completed tasks
    prisma.task.count({
      where: { project: { userId }, completed: true },
    }),
    // Total tasks
    prisma.task.count({
      where: { project: { userId } },
    }),
    // This month's revenue (paid invoices)
    prisma.invoice.aggregate({
      where: {
        userId,
        status: "paid",
        paidAt: {
          gte: new Date(now.getFullYear(), now.getMonth(), 1),
        },
      },
      _sum: { total: true },
    }),
    // Open invoices count
    prisma.invoice.count({
      where: { userId, status: { in: ["sent", "overdue"] } },
    }),
    // Open quotes
    prisma.quote.count({
      where: { userId, status: { in: ["draft", "sent"] } },
    }),
    // Urgent items
    Promise.all([
      // (placeholder for index alignment)
      Promise.resolve([]),
      // Projects with deadline in next 48 hours
      prisma.project.findMany({
        where: {
          userId,
          deadline: {
            gte: today,
            lte: new Date(now.getTime() + 48 * 3600000),
          },
          phase: { notIn: ["done", "delivered"] },
        },
        select: { id: true, title: true, deadline: true },
        take: 5,
      }),
      // Overdue invoices
      prisma.invoice.findMany({
        where: { userId, status: "overdue" },
        select: { id: true, invoiceNumber: true, total: true, dueDate: true },
        take: 5,
      }),
    ]),
    // Today's scheduled content
    prisma.scheduledContent.findMany({
      where: { userId, date: { gte: today, lt: tomorrow } },
      select: { id: true, title: true, status: true, color: true },
    }),
    // Project timeline (last 12 weeks for chart)
    prisma.project.findMany({
      where: {
        userId,
        createdAt: {
          gte: new Date(now.getTime() - 12 * 7 * 86400000),
        },
      },
      select: { createdAt: true, projectType: true },
    }),
  ]);

  // Build weekly project timeline
  const timeline: { week: string; count: number }[] = [];
  for (let i = 11; i >= 0; i--) {
    const weekStart = new Date(now.getTime() - (i + 1) * 7 * 86400000);
    const weekEnd = new Date(now.getTime() - i * 7 * 86400000);
    const count = recentLeadTimeline.filter((p) => {
      const d = new Date(p.createdAt);
      return d >= weekStart && d < weekEnd;
    }).length;
    timeline.push({
      week: `${weekStart.getDate()}/${weekStart.getMonth() + 1}`,
      count,
    });
  }

  // Project type distribution
  const sourceMap: Record<string, number> = {};
  recentLeadTimeline.forEach((p) => {
    const src = p.projectType || "other";
    sourceMap[src] = (sourceMap[src] || 0) + 1;
  });
  const bySource = Object.entries(sourceMap).map(([source, count]) => ({
    source,
    count,
  }));

  return {
    kpis: {
      activeClients,
      activeProjects,
      todayTasks: totalTasks > 0 ? `${completedTasks}/${totalTasks}` : "0",
      monthRevenue: monthRevenue._sum.total ?? 0,
      openInvoices,
      openQuotes,
    },
    urgent: {
      approachingDeadlines: urgentItems[1],
      overdueInvoices: urgentItems[2],
    },
    todayContent,
    charts: { timeline, bySource },
  };
}
