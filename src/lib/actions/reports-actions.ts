"use server";

import { prisma } from "@/lib/db/prisma";
import { auth } from "@/auth";
import { DONE_PHASES } from "@/lib/project-config";

export type MonthlyDataPoint = {
  month: string; // "2026-03"
  label: string; // "מרץ"
  revenue: number;
  expenses: number;
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

  // Compute the full date range once
  const rangeStart = new Date(now.getFullYear(), now.getMonth() - (monthsBack - 1), 1);
  const rangeEnd = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  const donePhases = DONE_PHASES;

  // 8 queries total instead of 8 × monthsBack (was 48 for 6 months)
  const [
    paidInvoices,
    expenses,
    openedProjects,
    completedProjects,
    completedTasks,
    allTasks,
    newClients,
    publishedContent,
  ] = await Promise.all([
    prisma.invoice.findMany({
      where: { userId, status: "paid", paidAt: { gte: rangeStart, lt: rangeEnd } },
      select: { total: true, paidAt: true },
    }),
    prisma.expense.findMany({
      where: { userId, date: { gte: rangeStart, lt: rangeEnd } },
      select: { amount: true, date: true },
    }),
    prisma.project.findMany({
      where: { userId, createdAt: { gte: rangeStart, lt: rangeEnd } },
      select: { createdAt: true },
    }),
    prisma.project.findMany({
      where: { userId, phase: { in: donePhases }, updatedAt: { gte: rangeStart, lt: rangeEnd } },
      select: { updatedAt: true },
    }),
    prisma.task.findMany({
      where: { project: { userId }, completed: true, createdAt: { gte: rangeStart, lt: rangeEnd } },
      select: { createdAt: true },
    }),
    prisma.task.findMany({
      where: { project: { userId }, createdAt: { gte: rangeStart, lt: rangeEnd } },
      select: { createdAt: true },
    }),
    prisma.client.findMany({
      where: { userId, createdAt: { gte: rangeStart, lt: rangeEnd } },
      select: { createdAt: true },
    }),
    prisma.scheduledContent.findMany({
      where: { userId, status: "published", date: { gte: rangeStart, lt: rangeEnd } },
      select: { date: true },
    }),
  ]);

  // Helper to bucket items by month key
  const bucket = (date: Date | null) => {
    if (!date) return null;
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
  };

  // Build month data points by bucketing fetched rows
  const months: MonthlyDataPoint[] = [];
  for (let i = monthsBack - 1; i >= 0; i--) {
    const start = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const monthKey = `${start.getFullYear()}-${String(start.getMonth() + 1).padStart(2, "0")}`;
    const label = HEBREW_MONTHS[start.getMonth()];

    const revenue = paidInvoices.filter(r => bucket(r.paidAt) === monthKey).reduce((s, r) => s + (r.total ?? 0), 0);
    const expenseTotal = expenses.filter(r => bucket(r.date) === monthKey).reduce((s, r) => s + (r.amount ?? 0), 0);

    months.push({
      month: monthKey,
      label,
      revenue,
      expenses: expenseTotal,
      projectsOpened: openedProjects.filter(r => bucket(r.createdAt) === monthKey).length,
      projectsCompleted: completedProjects.filter(r => bucket(r.updatedAt) === monthKey).length,
      tasksCompleted: completedTasks.filter(r => bucket(r.createdAt) === monthKey).length,
      totalTasks: allTasks.filter(r => bucket(r.createdAt) === monthKey).length,
      newClients: newClients.filter(r => bucket(r.createdAt) === monthKey).length,
      contentPublished: publishedContent.filter(r => bucket(r.date) === monthKey).length,
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
