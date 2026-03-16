import { prisma } from "./prisma";

export async function getDashboardStats() {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

  const [
    activeProjects,
    upcomingShoots,
    pendingDeadlines,
    monthlyPaidInvoices,
    outstandingInvoices,
    totalClients,
    totalLeads,
    wonLeads,
  ] = await Promise.all([
    prisma.project.count({
      where: { phase: { not: "delivered" } },
    }),
    prisma.project.findMany({
      where: {
        shootDate: { gte: now },
        phase: { in: ["pre_production", "production"] },
      },
      include: { client: true },
      orderBy: { shootDate: "asc" },
      take: 5,
    }),
    prisma.project.findMany({
      where: {
        deadline: { gte: now, lte: new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000) },
        phase: { not: "delivered" },
      },
      include: { client: true },
      orderBy: { deadline: "asc" },
      take: 5,
    }),
    prisma.invoice.aggregate({
      _sum: { total: true },
      where: {
        status: "paid",
        paidAt: { gte: startOfMonth, lte: endOfMonth },
      },
    }),
    prisma.invoice.aggregate({
      _sum: { total: true },
      where: { status: { in: ["sent", "overdue"] } },
    }),
    prisma.client.count({ where: { type: "client" } }),
    prisma.client.count({ where: { type: "lead" } }),
    prisma.client.count({ where: { type: "lead", leadStatus: "won" } }),
  ]);

  const allLeadsEver = totalLeads + wonLeads;
  const conversionRate = allLeadsEver > 0 ? Math.round((wonLeads / allLeadsEver) * 100) : 0;

  return {
    activeProjects,
    upcomingShoots,
    pendingDeadlines,
    monthlyRevenue: monthlyPaidInvoices._sum.total ?? 0,
    outstandingAmount: outstandingInvoices._sum.total ?? 0,
    conversionRate,
  };
}

export async function getRecentProjects() {
  return prisma.project.findMany({
    include: { client: true },
    orderBy: { updatedAt: "desc" },
    take: 5,
  });
}

export async function getUpcomingContent() {
  const now = new Date();
  const weekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

  return prisma.scheduledContent.findMany({
    where: {
      date: { gte: now, lte: weekFromNow },
    },
    include: {
      client: { select: { name: true } },
      project: { select: { title: true } },
    },
    orderBy: { date: "asc" },
    take: 8,
  });
}
