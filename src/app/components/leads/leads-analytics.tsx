"use client";

import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { useT } from "@/lib/i18n";
import type { LeadAnalyticsData } from "@/lib/actions/lead-analytics";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

// ─── Colors ──────────────────────────────────────────────────────────────────

const STAGE_CHART_COLORS: Record<string, string> = {
  new: "#60a5fa",
  contacted: "#22d3ee",
  qualified: "#a78bfa",
  proposal_sent: "#fbbf24",
  won: "#34d399",
  lost: "#f87171",
};

const SOURCE_COLORS: Record<string, string> = {
  instagram: "#E1306C",
  tiktok: "#000000",
  facebook: "#1877F2",
  referral: "#10B981",
  website: "#6366F1",
  linkedin: "#0A66C2",
  organic: "#F59E0B",
  other: "#9CA3AF",
};

// ─── Component ───────────────────────────────────────────────────────────────

interface LeadsAnalyticsProps {
  data: LeadAnalyticsData;
}

export function LeadsAnalytics({ data }: LeadsAnalyticsProps) {
  const t = useT();
  const { kpis, byStage, bySource, wonBySource, timeline, funnel } = data;

  const stageData = byStage.map((d) => ({
    ...d,
    label: t.leads.stages[d.stage as keyof typeof t.leads.stages] ?? d.stage,
  }));

  const sourceData = bySource.map((d) => ({
    ...d,
    label: t.leads.sources[d.source as keyof typeof t.leads.sources] ?? d.source,
  }));

  const wonSourceData = wonBySource.map((d) => ({
    ...d,
    label: t.leads.sources[d.source as keyof typeof t.leads.sources] ?? d.source,
  }));

  const funnelData = funnel.map((d) => ({
    ...d,
    label: t.leads.stages[d.stage as keyof typeof t.leads.stages] ?? d.stage,
  }));

  const maxFunnel = funnelData.length > 0 ? funnelData[0].count : 1;

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col gap-4"
    >
      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <KpiCard
          label={t.leads.analytics.totalLeads}
          value={kpis.total}
          trend={kpis.trendPercent}
          trendLabel={t.leads.analytics.trend}
        />
        <KpiCard label={t.leads.analytics.newLeads} value={kpis.newLeads} />
        <KpiCard label={t.leads.analytics.closedWon} value={kpis.won} accent="emerald" />
        <KpiCard label={t.leads.analytics.lostLeads} value={kpis.lost} accent="red" />
        <KpiCard
          label={t.leads.analytics.conversionRate}
          value={`${kpis.conversionRate}%`}
          accent="violet"
        />
        <KpiCard label={t.leads.analytics.pending} value={kpis.pending} accent="amber" />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Line chart: leads over time */}
        <ChartCard title={t.leads.analytics.leadsOverTime}>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={timeline}>
              <CartesianGrid strokeDasharray="3 3" stroke="currentColor" opacity={0.1} />
              <XAxis
                dataKey="week"
                tick={{ fontSize: 11, fill: "currentColor" }}
                stroke="currentColor"
                opacity={0.3}
              />
              <YAxis
                tick={{ fontSize: 11, fill: "currentColor" }}
                stroke="currentColor"
                opacity={0.3}
                allowDecimals={false}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                  fontSize: "12px",
                  color: "hsl(var(--foreground))",
                }}
              />
              <Line
                type="monotone"
                dataKey="count"
                stroke="#60a5fa"
                strokeWidth={2}
                dot={{ r: 3, fill: "#60a5fa" }}
                activeDot={{ r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Bar chart: by stage */}
        <ChartCard title={t.leads.analytics.byStage}>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={stageData}>
              <CartesianGrid strokeDasharray="3 3" stroke="currentColor" opacity={0.1} />
              <XAxis
                dataKey="label"
                tick={{ fontSize: 10, fill: "currentColor" }}
                stroke="currentColor"
                opacity={0.3}
              />
              <YAxis
                tick={{ fontSize: 11, fill: "currentColor" }}
                stroke="currentColor"
                opacity={0.3}
                allowDecimals={false}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                  fontSize: "12px",
                  color: "hsl(var(--foreground))",
                }}
              />
              <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                {stageData.map((entry) => (
                  <Cell
                    key={entry.stage}
                    fill={STAGE_CHART_COLORS[entry.stage] || "#60a5fa"}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Donut chart: by source */}
        <ChartCard title={t.leads.analytics.bySource}>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={sourceData}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={80}
                paddingAngle={2}
                dataKey="count"
                nameKey="label"
              >
                {sourceData.map((entry) => (
                  <Cell
                    key={entry.source}
                    fill={SOURCE_COLORS[entry.source] || "#9CA3AF"}
                  />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                  fontSize: "12px",
                  color: "hsl(var(--foreground))",
                }}
              />
              <Legend
                wrapperStyle={{ fontSize: "11px" }}
                formatter={(value: string) => (
                  <span style={{ color: "hsl(var(--foreground))" }}>{value}</span>
                )}
              />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Bar chart: closings by source */}
        <ChartCard title={t.leads.analytics.closingsBySource}>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={wonSourceData}>
              <CartesianGrid strokeDasharray="3 3" stroke="currentColor" opacity={0.1} />
              <XAxis
                dataKey="label"
                tick={{ fontSize: 10, fill: "currentColor" }}
                stroke="currentColor"
                opacity={0.3}
              />
              <YAxis
                tick={{ fontSize: 11, fill: "currentColor" }}
                stroke="currentColor"
                opacity={0.3}
                allowDecimals={false}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                  fontSize: "12px",
                  color: "hsl(var(--foreground))",
                }}
              />
              <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                {wonSourceData.map((entry) => (
                  <Cell
                    key={entry.source}
                    fill={SOURCE_COLORS[entry.source] || "#9CA3AF"}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Funnel */}
        <ChartCard title={t.leads.analytics.funnel} className="md:col-span-2">
          <div className="flex flex-col gap-2 py-2">
            {funnelData.map((entry) => {
              const widthPct =
                maxFunnel > 0 ? Math.max((entry.count / maxFunnel) * 100, 8) : 8;
              return (
                <div key={entry.stage} className="flex items-center gap-3">
                  <span className="text-xs text-muted-foreground w-24 text-end shrink-0 truncate">
                    {entry.label}
                  </span>
                  <div className="flex-1 h-7 bg-muted rounded-md overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${widthPct}%` }}
                      transition={{ duration: 0.6, ease: "easeOut" }}
                      className="h-full rounded-md flex items-center justify-end pe-2"
                      style={{
                        backgroundColor:
                          STAGE_CHART_COLORS[entry.stage] || "#60a5fa",
                      }}
                    >
                      <span className="text-xs font-semibold text-white drop-shadow-sm">
                        {entry.count}
                      </span>
                    </motion.div>
                  </div>
                </div>
              );
            })}
          </div>
        </ChartCard>
      </div>
    </motion.div>
  );
}

// ─── Sub-components ──────────────────────────────────────────────────────────

function KpiCard({
  label,
  value,
  trend,
  trendLabel,
  accent,
}: {
  label: string;
  value: number | string;
  trend?: number;
  trendLabel?: string;
  accent?: "emerald" | "red" | "violet" | "amber";
}) {
  const accentMap: Record<string, string> = {
    emerald: "text-emerald-500",
    red: "text-red-500",
    violet: "text-violet-500",
    amber: "text-amber-500",
  };
  const accentColor = (accent && accentMap[accent]) || "text-foreground";

  return (
    <div className="rounded-2xl border border-border bg-card shadow-sm p-4 flex flex-col gap-1">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className={`text-2xl font-bold tabular-nums ${accentColor}`}>
        {value}
      </span>
      {trend !== undefined && (
        <div className="flex items-center gap-1 mt-0.5">
          {trend > 0 ? (
            <TrendingUp className="h-3 w-3 text-emerald-500" />
          ) : trend < 0 ? (
            <TrendingDown className="h-3 w-3 text-red-500" />
          ) : (
            <Minus className="h-3 w-3 text-muted-foreground" />
          )}
          <span
            className={`text-[11px] ${
              trend > 0
                ? "text-emerald-500"
                : trend < 0
                  ? "text-red-500"
                  : "text-muted-foreground"
            }`}
          >
            {trend > 0 ? "+" : ""}
            {trend}%
          </span>
          {trendLabel && (
            <span className="text-[11px] text-muted-foreground">{trendLabel}</span>
          )}
        </div>
      )}
    </div>
  );
}

function ChartCard({
  title,
  children,
  className = "",
}: {
  title: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-2xl border border-border bg-card shadow-sm p-4 ${className}`}
    >
      <h3 className="text-sm font-semibold text-foreground mb-3">{title}</h3>
      {children}
    </div>
  );
}
