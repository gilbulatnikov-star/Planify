"use client";

import { motion } from "framer-motion";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  BarChart3,
  TrendingUp,
  FolderKanban,
  Users,
  FileText,
  CheckCircle2,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";
import type { ReportsData } from "@/lib/actions/reports-actions";

// ─── Chart colors ─────────────────────────────────────────────────────────────
const BLUE = "#3b82f6";
const EMERALD = "#10b981";
const VIOLET = "#8b5cf6";
const AMBER = "#f59e0b";
const SLATE = "#64748b";

// ─── Custom tooltip ───────────────────────────────────────────────────────────
function ChartTooltip({ active, payload, label, suffix = "" }: {
  active?: boolean;
  payload?: Array<{ value: number; name: string; color: string }>;
  label?: string;
  suffix?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-[10px] border border-border/40 bg-card px-3 py-2 shadow-lg text-[12px]">
      <p className="font-semibold text-foreground mb-1">{label}</p>
      {payload.map((p, i) => (
        <p key={i} className="text-foreground/70">
          <span className="inline-block w-2 h-2 rounded-full mr-1.5" style={{ backgroundColor: p.color }} />
          {p.value.toLocaleString("he-IL")}{suffix}
        </p>
      ))}
    </div>
  );
}

// ─── Stat card ────────────────────────────────────────────────────────────────
function StatCard({ label, value, icon: Icon, color }: {
  label: string;
  value: string | number;
  icon: typeof TrendingUp;
  color: string;
}) {
  return (
    <div className="rounded-[14px] border border-border/40 bg-card p-5 shadow-[0_1px_3px_-1px_rgba(0,0,0,0.04)]">
      <div className="flex items-center justify-between mb-3">
        <span className="text-[11px] font-semibold text-foreground/50 uppercase tracking-[0.06em]">{label}</span>
        <div className="h-8 w-8 rounded-[8px] flex items-center justify-center" style={{ backgroundColor: `${color}15` }}>
          <Icon className="h-4 w-4" style={{ color }} />
        </div>
      </div>
      <p className="text-[26px] font-extrabold tracking-[-0.03em] text-foreground">{value}</p>
    </div>
  );
}

// ─── Chart card wrapper ───────────────────────────────────────────────────────
function ChartCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-[14px] border border-border/40 bg-card p-5 shadow-[0_1px_3px_-1px_rgba(0,0,0,0.04)]">
      <h3 className="text-[13px] font-bold text-foreground/70 mb-4">{title}</h3>
      <div className="h-[220px]">
        {children}
      </div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
export function ReportsPageClient({ data }: { data: ReportsData }) {
  const { months, totals } = data;

  return (
    <div className="space-y-6 max-w-[1100px]">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-[10px] bg-accent/10">
            <BarChart3 className="h-[18px] w-[18px] text-accent" />
          </div>
          <div>
            <h1 className="text-[22px] font-extrabold tracking-[-0.03em] text-foreground">
              סיכום חודשי
            </h1>
            <p className="text-[12px] text-foreground/40 mt-0.5">6 חודשים אחרונים</p>
          </div>
        </div>
        <Link
          href="/"
          className="flex items-center gap-1.5 text-[12px] font-medium text-foreground/50 hover:text-foreground/70 transition-colors"
        >
          חזרה ללוח בקרה
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </motion.div>

      {/* Summary KPIs */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3"
      >
        <StatCard
          label="סה״כ הכנסות"
          value={`₪${totals.totalRevenue.toLocaleString("he-IL")}`}
          icon={TrendingUp}
          color={EMERALD}
        />
        <StatCard
          label="פרויקטים חדשים"
          value={totals.totalProjects}
          icon={FolderKanban}
          color={BLUE}
        />
        <StatCard
          label="הושלמו"
          value={totals.totalCompleted}
          icon={CheckCircle2}
          color={VIOLET}
        />
        <StatCard
          label="לקוחות חדשים"
          value={totals.totalNewClients}
          icon={Users}
          color={AMBER}
        />
        <StatCard
          label="תוכן שפורסם"
          value={totals.totalContent}
          icon={FileText}
          color={SLATE}
        />
      </motion.div>

      {/* Charts grid */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid md:grid-cols-2 gap-4"
      >
        {/* Revenue chart */}
        <ChartCard title="הכנסות חודשיות">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={months} margin={{ top: 5, right: 5, left: -15, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.3} />
              <XAxis
                dataKey="label"
                tick={{ fontSize: 11, fill: "var(--foreground)", opacity: 0.4 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 10, fill: "var(--foreground)", opacity: 0.3 }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v: number) => `₪${(v / 1000).toFixed(0)}k`}
              />
              <Tooltip content={<ChartTooltip suffix=" ₪" />} />
              <Bar dataKey="revenue" fill={EMERALD} radius={[6, 6, 0, 0]} maxBarSize={32} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Projects chart */}
        <ChartCard title="פרויקטים — נפתחו מול הושלמו">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={months} margin={{ top: 5, right: 5, left: -15, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.3} />
              <XAxis
                dataKey="label"
                tick={{ fontSize: 11, fill: "var(--foreground)", opacity: 0.4 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 10, fill: "var(--foreground)", opacity: 0.3 }}
                axisLine={false}
                tickLine={false}
                allowDecimals={false}
              />
              <Tooltip content={<ChartTooltip />} />
              <Bar dataKey="projectsOpened" name="נפתחו" fill={BLUE} radius={[6, 6, 0, 0]} maxBarSize={24} />
              <Bar dataKey="projectsCompleted" name="הושלמו" fill={VIOLET} radius={[6, 6, 0, 0]} maxBarSize={24} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* New clients chart */}
        <ChartCard title="לקוחות חדשים">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={months} margin={{ top: 5, right: 5, left: -15, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.3} />
              <XAxis
                dataKey="label"
                tick={{ fontSize: 11, fill: "var(--foreground)", opacity: 0.4 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 10, fill: "var(--foreground)", opacity: 0.3 }}
                axisLine={false}
                tickLine={false}
                allowDecimals={false}
              />
              <Tooltip content={<ChartTooltip />} />
              <Line
                type="monotone"
                dataKey="newClients"
                name="לקוחות חדשים"
                stroke={AMBER}
                strokeWidth={2.5}
                dot={{ r: 4, fill: AMBER, strokeWidth: 0 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Content published chart */}
        <ChartCard title="תוכן שפורסם">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={months} margin={{ top: 5, right: 5, left: -15, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.3} />
              <XAxis
                dataKey="label"
                tick={{ fontSize: 11, fill: "var(--foreground)", opacity: 0.4 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 10, fill: "var(--foreground)", opacity: 0.3 }}
                axisLine={false}
                tickLine={false}
                allowDecimals={false}
              />
              <Tooltip content={<ChartTooltip />} />
              <Bar dataKey="contentPublished" name="פורסם" fill={SLATE} radius={[6, 6, 0, 0]} maxBarSize={32} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </motion.div>

      {/* Tasks completion chart — full width */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
      >
        <ChartCard title="משימות — הושלמו מתוך סה״כ">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={months} margin={{ top: 5, right: 5, left: -15, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.3} />
              <XAxis
                dataKey="label"
                tick={{ fontSize: 11, fill: "var(--foreground)", opacity: 0.4 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 10, fill: "var(--foreground)", opacity: 0.3 }}
                axisLine={false}
                tickLine={false}
                allowDecimals={false}
              />
              <Tooltip content={<ChartTooltip />} />
              <Bar dataKey="totalTasks" name="סה״כ" fill="#e2e8f0" radius={[6, 6, 0, 0]} maxBarSize={28} />
              <Bar dataKey="tasksCompleted" name="הושלמו" fill={EMERALD} radius={[6, 6, 0, 0]} maxBarSize={28} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </motion.div>
    </div>
  );
}
