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
  ArrowRight,
  CheckSquare,
  DollarSign,
  PlayCircle,
} from "lucide-react";
import Link from "next/link";
import type { ReportsData } from "@/lib/actions/reports-actions";

// ─── Chart colors ─────────────────────────────────────────────────────────────
const BLUE = "#3b82f6";
const EMERALD = "#10b981";
const RED = "#ef4444";
const VIOLET = "#8b5cf6";
const AMBER = "#f59e0b";

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

// ─── Monthly Summary Bar ─────────────────────────────────────────────────────
function SummaryBar({ label, current, previous, icon: Icon, gradient, formatValue }: {
  label: string; current: number; previous: number; icon: React.ElementType; gradient: string; formatValue?: (n: number) => string;
}) {
  const max = Math.max(current, previous, 1);
  const currentPct = Math.round((current / max) * 100);
  const previousPct = Math.round((previous / max) * 100);
  const display = formatValue ? formatValue(current) : String(current);
  const prevDisplay = formatValue ? formatValue(previous) : String(previous);
  const diff = previous > 0 ? Math.round(((current - previous) / previous) * 100) : current > 0 ? 100 : 0;

  return (
    <div className="px-5 py-3.5">
      <div className="flex items-center justify-between mb-2.5">
        <div className="flex items-center gap-2">
          <div className={`flex h-[26px] w-[26px] items-center justify-center rounded-[7px] bg-gradient-to-br ${gradient} text-white shadow-[0_1px_3px_rgba(0,0,0,0.1)]`}>
            <Icon className="h-[12px] w-[12px]" strokeWidth={2.2} />
          </div>
          <span className="text-[12px] font-semibold text-foreground/70">{label}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[16px] font-extrabold tracking-[-0.02em] text-foreground tabular-nums">{display}</span>
          {diff !== 0 && (
            <span className={`text-[10px] font-bold px-1.5 py-[1px] rounded-[4px] tabular-nums ${diff > 0 ? "text-emerald-700 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-500/10" : "text-red-600 bg-red-50 dark:text-red-400 dark:bg-red-500/10"}`}>
              {diff > 0 ? "+" : ""}{diff}%
            </span>
          )}
        </div>
      </div>
      <div className="space-y-1.5">
        <div className="flex items-center gap-2">
          <span className="text-[9.5px] text-foreground/35 font-bold w-[52px] shrink-0">החודש</span>
          <div className="flex-1 h-[6px] rounded-full bg-foreground/[0.04] overflow-hidden">
            <div className={`h-full rounded-full bg-gradient-to-r ${gradient} transition-all duration-700 ease-out`} style={{ width: `${currentPct}%` }} />
          </div>
          <span className="text-[9.5px] text-foreground/40 font-bold tabular-nums w-[36px] text-left">{display}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[9.5px] text-foreground/35 font-bold w-[52px] shrink-0">חודש קודם</span>
          <div className="flex-1 h-[6px] rounded-full bg-foreground/[0.04] overflow-hidden">
            <div className="h-full rounded-full bg-foreground/[0.08] transition-all duration-700 ease-out" style={{ width: `${previousPct}%` }} />
          </div>
          <span className="text-[9.5px] text-foreground/40 font-bold tabular-nums w-[36px] text-left">{prevDisplay}</span>
        </div>
      </div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
export function ReportsPageClient({ data }: { data: ReportsData }) {
  const { months, totals } = data;

  // Derive current vs previous month for summary bars
  const currentMonth = months.length > 0 ? months[months.length - 1] : null;
  const previousMonth = months.length > 1 ? months[months.length - 2] : null;

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

      {/* Monthly comparison bars */}
      {currentMonth && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.03 }}
          className="grid gap-3 md:grid-cols-2"
        >
          <div className="rounded-[14px] border border-border/40 bg-card overflow-hidden shadow-[0_1px_2px_rgba(0,0,0,0.04),0_2px_6px_-1px_rgba(0,0,0,0.04),inset_0_1px_0_rgba(255,255,255,0.75)] dark:shadow-[0_1px_3px_rgba(0,0,0,0.3)]">
            <SummaryBar
              label="פרויקטים שנוצרו"
              current={currentMonth.projectsOpened}
              previous={previousMonth?.projectsOpened ?? 0}
              icon={FolderKanban}
              gradient="from-blue-500 to-blue-600"
            />
          </div>
          <div className="rounded-[14px] border border-border/40 bg-card overflow-hidden shadow-[0_1px_2px_rgba(0,0,0,0.04),0_2px_6px_-1px_rgba(0,0,0,0.04),inset_0_1px_0_rgba(255,255,255,0.75)] dark:shadow-[0_1px_3px_rgba(0,0,0,0.3)]">
            <SummaryBar
              label="משימות שהושלמו"
              current={currentMonth.tasksCompleted}
              previous={previousMonth?.tasksCompleted ?? 0}
              icon={CheckSquare}
              gradient="from-emerald-500 to-emerald-600"
            />
          </div>
          <div className="rounded-[14px] border border-border/40 bg-card overflow-hidden shadow-[0_1px_2px_rgba(0,0,0,0.04),0_2px_6px_-1px_rgba(0,0,0,0.04),inset_0_1px_0_rgba(255,255,255,0.75)] dark:shadow-[0_1px_3px_rgba(0,0,0,0.3)]">
            <SummaryBar
              label="הכנסות"
              current={currentMonth.revenue}
              previous={previousMonth?.revenue ?? 0}
              icon={DollarSign}
              gradient="from-violet-500 to-purple-600"
              formatValue={(n) => `₪${n.toLocaleString("he-IL")}`}
            />
          </div>
          <div className="rounded-[14px] border border-border/40 bg-card overflow-hidden shadow-[0_1px_2px_rgba(0,0,0,0.04),0_2px_6px_-1px_rgba(0,0,0,0.04),inset_0_1px_0_rgba(255,255,255,0.75)] dark:shadow-[0_1px_3px_rgba(0,0,0,0.3)]">
            <SummaryBar
              label="תוכן שפורסם"
              current={currentMonth.contentPublished}
              previous={previousMonth?.contentPublished ?? 0}
              icon={PlayCircle}
              gradient="from-rose-500 to-pink-600"
            />
          </div>
        </motion.div>
      )}

      {/* Summary KPIs */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="grid grid-cols-2 md:grid-cols-4 gap-3"
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
          label="ממוצע חודשי"
          value={`₪${months.length > 0 ? Math.round(totals.totalRevenue / months.length).toLocaleString("he-IL") : 0}`}
          icon={TrendingUp}
          color={VIOLET}
        />
        <StatCard
          label="לקוחות חדשים"
          value={totals.totalNewClients}
          icon={Users}
          color={AMBER}
        />
{/* Content published KPI removed per user request */}
      </motion.div>

      {/* Charts grid */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid md:grid-cols-2 gap-4"
      >
        {/* Revenue & Expenses chart */}
        <ChartCard title="הכנסות והוצאות חודשיות">
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
              <Bar dataKey="revenue" name="הכנסות" fill={EMERALD} radius={[6, 6, 0, 0]} maxBarSize={24} />
              <Bar dataKey="expenses" name="הוצאות" fill={RED} radius={[6, 6, 0, 0]} maxBarSize={24} />
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

{/* Content published chart removed */}
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
