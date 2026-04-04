"use server";

import { prisma } from "@/lib/db/prisma";
import { auth } from "@/auth";

export type LeadAnalyticsData = {
  kpis: {
    total: number;
    newLeads: number;
    won: number;
    lost: number;
    pending: number;
    conversionRate: number;
    trendPercent: number;
  };
  byStage: { stage: string; count: number }[];
  bySource: { source: string; count: number }[];
  wonBySource: { source: string; count: number }[];
  timeline: { week: string; count: number }[];
  funnel: { stage: string; count: number }[];
};

export async function getLeadAnalytics(): Promise<LeadAnalyticsData | null> {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return null;

  const leads = await prisma.client.findMany({
    where: { userId, type: "lead" },
    select: {
      id: true,
      leadStatus: true,
      leadSource: true,
      tags: true,
      createdAt: true,
    },
  });

  // Also get converted clients (were leads, now type="client" with leadStatus="won")
  const converted = await prisma.client.count({
    where: { userId, type: "client", leadStatus: "won" },
  });

  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 86400000);
  const sixtyDaysAgo = new Date(now.getTime() - 60 * 86400000);

  // Current period leads (last 30 days)
  const currentPeriod = leads.filter(
    (l) => new Date(l.createdAt) >= thirtyDaysAgo
  );
  const previousPeriod = leads.filter((l) => {
    const d = new Date(l.createdAt);
    return d >= sixtyDaysAgo && d < thirtyDaysAgo;
  });

  // KPIs
  const total = leads.length;
  const newLeads = leads.filter((l) => l.leadStatus === "new").length;
  const won = leads.filter((l) => l.leadStatus === "won").length + converted;
  const lost = leads.filter((l) => l.leadStatus === "lost").length;
  const pending = leads.filter(
    (l) => !["won", "lost"].includes(l.leadStatus)
  ).length;
  const conversionRate =
    total > 0 ? Math.round((won / (total + converted)) * 100) : 0;

  // Trend: change vs previous period
  const currentCount = currentPeriod.length;
  const previousCount = previousPeriod.length;
  const trendPercent =
    previousCount > 0
      ? Math.round(((currentCount - previousCount) / previousCount) * 100)
      : currentCount > 0
        ? 100
        : 0;

  // By stage (for bar chart)
  const stages = ["new", "contacted", "qualified", "proposal_sent", "won", "lost"];
  const byStage = stages.map((s) => ({
    stage: s,
    count:
      leads.filter((l) => l.leadStatus === s).length +
      (s === "won" ? converted : 0),
  }));

  // By source (for donut chart)
  const sourceMap: Record<string, number> = {};
  leads.forEach((l) => {
    const src = l.leadSource || "other";
    sourceMap[src] = (sourceMap[src] || 0) + 1;
  });
  const bySource = Object.entries(sourceMap).map(([source, count]) => ({
    source,
    count,
  }));

  // Won by source (for bar chart)
  const wonBySourceMap: Record<string, number> = {};
  leads
    .filter((l) => l.leadStatus === "won")
    .forEach((l) => {
      const src = l.leadSource || "other";
      wonBySourceMap[src] = (wonBySourceMap[src] || 0) + 1;
    });
  const wonBySource = Object.entries(wonBySourceMap).map(([source, count]) => ({
    source,
    count,
  }));

  // Timeline (last 12 weeks, grouped by week)
  const timeline: { week: string; count: number }[] = [];
  for (let i = 11; i >= 0; i--) {
    const weekStart = new Date(now.getTime() - (i + 1) * 7 * 86400000);
    const weekEnd = new Date(now.getTime() - i * 7 * 86400000);
    const count = leads.filter((l) => {
      const d = new Date(l.createdAt);
      return d >= weekStart && d < weekEnd;
    }).length;
    const label = `${weekStart.getDate()}/${weekStart.getMonth() + 1}`;
    timeline.push({ week: label, count });
  }

  // Funnel
  const funnel = stages
    .filter((s) => s !== "lost")
    .map((s) => ({
      stage: s,
      count:
        leads.filter((l) => {
          const idx = stages.indexOf(l.leadStatus);
          const sIdx = stages.indexOf(s);
          return idx >= sIdx;
        }).length + (s === "won" ? converted : 0),
    }));

  return {
    kpis: {
      total: total + converted,
      newLeads,
      won,
      lost,
      pending,
      conversionRate,
      trendPercent,
    },
    byStage,
    bySource,
    wonBySource,
    timeline,
    funnel,
  };
}
