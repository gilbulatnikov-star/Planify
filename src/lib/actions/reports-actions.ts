"use server";

import { prisma } from "@/lib/db/prisma";
import { auth } from "@/auth";

export type MonthlyDataPoint = {
  month: string; // "2026-03"
  label: string; // "מרץ"
  revenue: number;
  projectsOpened: number;
  projectsCompleted: number;
  tasksCompleted: number;
  totalTasks: number;
  newClients: number;
  contentPublished: number;
};

export type ReportsData = {
  months: MonthlyDataPoint[];
  totals: {
    totalRevenue: number;
    totalProjects: number;
    totalCompleted: number;
    totalNewClients: number;
    totalContent: number;
    totalTasksCompleted: number;
  };
};

const HEBREW_MONTHS = [
  "ינואר", "פברואר", "מרץ", "אפריל", "מאי", "יוני",
  "יולי", "אוגוסט", "ספטמבר", "אוקטובר", "נובמבר", "דצמבר",
];

export async function getReportsData(monthsBack = 6): Promise<ReportsData> {
  const session = await auth();
  if (!session?.user?.id) {
    return { months: [], totals: { totalRevenue: 0, totalProjects: 0, totalCompleted: 0, totalNewClients: 0, totalContent: 0, totalTasksCompleted: 0 } };
  }

  const userId = session.user.id;
  const now = new Date();
  const months: MonthlyDataPoint[] = [];

  const donePhases = ["done", "delivered", "gallery_delivery", "published", "active"];

  for (let i = monthsBack - 1; i >= 0; i--) {
    const start = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const end = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);
    const monthKey = `${start.getFullYear()}-${String(start.getMonth() + 1).padStart(2, "0")}`;
    const label = HEBREW_MONTHS[start.getMonth()];

    const [
      revenueAgg,
      projectsOpened,
      projectsCompleted,
      tasksCompleted,
      totalTasks,
      newClients,
      contentPublished,
    ] = await Promise.all([
      // Revenue: paid invoices in this month
      prisma.invoice.aggregate({
        where: { userId, status: "paid", paidAt: { gte: start, lt: end } },
        _sum: { total: true },
      }),
      // Projects opened this month
      prisma.project.count({
        where: { userId, createdAt: { gte: start, lt: end } },
      }),
      // Projects completed this month (delivered/done)
      prisma.project.count({
        where: { userId, phase: { in: donePhases }, updatedAt: { gte: start, lt: end } },
      }),
      // Tasks completed this month
      prisma.task.count({
        where: { project: { userId }, completed: true, createdAt: { gte: start, lt: end } },
      }),
      // Total tasks created this month
      prisma.task.count({
        where: { project: { userId }, createdAt: { gte: start, lt: end } },
      }),
      // New clients this month
      prisma.client.count({
        where: { userId, createdAt: { gte: start, lt: end } },
      }),
      // Content published this month
      prisma.scheduledContent.count({
        where: { userId, status: "published", date: { gte: start, lt: end } },
      }),
    ]);

    months.push({
      month: monthKey,
      label,
      revenue: revenueAgg._sum.total ?? 0,
      projectsOpened,
      projectsCompleted,
      tasksCompleted,
      totalTasks,
      newClients,
      contentPublished,
    });
  }

  const totals = {
    totalRevenue: months.reduce((s, m) => s + m.revenue, 0),
    totalProjects: months.reduce((s, m) => s + m.projectsOpened, 0),
    totalCompleted: months.reduce((s, m) => s + m.projectsCompleted, 0),
    totalNewClients: months.reduce((s, m) => s + m.newClients, 0),
    totalContent: months.reduce((s, m) => s + m.contentPublished, 0),
    totalTasksCompleted: months.reduce((s, m) => s + m.tasksCompleted, 0),
  };

  return { months, totals };
}
