"use server";

import { prisma } from "@/lib/db/prisma";
import { auth } from "@/auth";

export type SmartDashboardData = {
  kpis: {
    newLeads: number;
    pendingLeads: number;
    activeProjects: number;
    todayTasks: string;
    monthRevenue: number;
    openInvoices: number;
    openQuotes: number;
  };
  urgent: {
    staleLeads: { id: string; name: string; daysSince: number }[];
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
    newLeads,
    pendingLeads,
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
    // New leads (last 7 days)
    prisma.client.count({
      where: {
        userId,
        type: "lead",
        leadStatus: "new",
        createdAt: { gte: new Date(now.getTime() - 7 * 86400000) },
      },
    }),
    // Leads waiting for response (status = new or contacted)
    prisma.client.count({
      where: {
        userId,
        type: "lead",
        leadStatus: { in: ["new", "contacted"] },
      },
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
      // Leads with no interaction in 3+ days
      prisma.client
        .findMany({
          where: {
            userId,
            type: "lead",
            leadStatus: { in: ["new", "contacted", "qualified"] },
          },
          include: { interactions: { orderBy: { date: "desc" }, take: 1 } },
          take: 10,
        })
        .then((leads) =>
          leads
            .filter((l) => {
              const lastDate = l.interactions[0]?.date ?? l.createdAt;
              return (
                now.getTime() - new Date(lastDate).getTime() >
                3 * 86400000
              );
            })
            .slice(0, 5)
        ),
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
    // Lead timeline (last 12 weeks for chart)
    prisma.client.findMany({
      where: {
        userId,
        type: "lead",
        createdAt: {
          gte: new Date(now.getTime() - 12 * 7 * 86400000),
        },
      },
      select: { createdAt: true, leadStatus: true, leadSource: true },
    }),
  ]);

  // Build weekly timeline
  const timeline: { week: string; count: number }[] = [];
  for (let i = 11; i >= 0; i--) {
    const weekStart = new Date(now.getTime() - (i + 1) * 7 * 86400000);
    const weekEnd = new Date(now.getTime() - i * 7 * 86400000);
    const count = recentLeadTimeline.filter((l) => {
      const d = new Date(l.createdAt);
      return d >= weekStart && d < weekEnd;
    }).length;
    timeline.push({
      week: `${weekStart.getDate()}/${weekStart.getMonth() + 1}`,
      count,
    });
  }

  // Source distribution
  const sourceMap: Record<string, number> = {};
  recentLeadTimeline.forEach((l) => {
    const src = l.leadSource || "other";
    sourceMap[src] = (sourceMap[src] || 0) + 1;
  });
  const bySource = Object.entries(sourceMap).map(([source, count]) => ({
    source,
    count,
  }));

  return {
    kpis: {
      newLeads,
      pendingLeads,
      activeProjects,
      todayTasks: totalTasks > 0 ? `${completedTasks}/${totalTasks}` : "0",
      monthRevenue: monthRevenue._sum.total ?? 0,
      openInvoices,
      openQuotes,
    },
    urgent: {
      staleLeads: urgentItems[0].map((l) => ({
        id: l.id,
        name: l.name,
        daysSince: Math.floor(
          (now.getTime() -
            new Date(l.interactions[0]?.date ?? l.createdAt).getTime()) /
            86400000
        ),
      })),
      approachingDeadlines: urgentItems[1],
      overdueInvoices: urgentItems[2],
    },
    todayContent,
    charts: { timeline, bySource },
  };
}
