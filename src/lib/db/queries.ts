import { prisma } from "./prisma";
import { auth } from "@/auth";

export async function getDashboardStats() {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    return {
      activeProjects: 0,
      upcomingShoots: [],
      pendingDeadlines: [],
      monthlyRevenue: 0,
      outstandingAmount: 0,
      conversionRate: 0,
    };
  }

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
      where: { phase: { not: "delivered" }, userId },
    }),
    prisma.project.findMany({
      where: {
        shootDate: { gte: now },
        phase: { in: ["pre_production", "production"] },
        userId,
      },
      include: { client: true },
      orderBy: { shootDate: "asc" },
      take: 5,
    }),
    prisma.project.findMany({
      where: {
        deadline: { gte: now, lte: new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000) },
        phase: { not: "delivered" },
        userId,
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
        userId,
      },
    }),
    prisma.invoice.aggregate({
      _sum: { total: true },
      where: { status: { in: ["sent", "overdue"] }, userId },
    }),
    prisma.client.count({ where: { type: "client", userId } }),
    prisma.client.count({ where: { type: "lead", userId } }),
    prisma.client.count({ where: { type: "lead", leadStatus: "won", userId } }),
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
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return [];
  return prisma.project.findMany({
    where: { userId },
    include: { client: true },
    orderBy: { updatedAt: "desc" },
    take: 5,
  });
}

export async function getUpcomingContent() {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return [];
  const now = new Date();
  const weekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

  return prisma.scheduledContent.findMany({
    where: {
      date: { gte: now, lte: weekFromNow },
      userId,
    },
    include: {
      client: { select: { name: true } },
      project: { select: { title: true } },
    },
    orderBy: { date: "asc" },
    take: 8,
  });
}
