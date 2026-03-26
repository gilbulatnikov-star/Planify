"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import {
  Users,
  Clock,
  FolderKanban,
  CheckSquare,
  DollarSign,
  FileText,
  AlertTriangle,
  CalendarDays,
  Plus,
  ClipboardList,
  FileSpreadsheet,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { useState } from "react";
import { useT, useLocale } from "@/lib/i18n";
import { formatCurrency } from "@/lib/utils/format";
import type { SmartDashboardData } from "@/lib/actions/dashboard-actions";

const PIE_COLORS = [
  "#38b6ff",
  "#6366f1",
  "#f59e0b",
  "#10b981",
  "#ef4444",
  "#8b5cf6",
  "#ec4899",
  "#14b8a6",
];

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06 } },
};
const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35 } },
};

interface SmartDashboardProps {
  data: SmartDashboardData;
}

export function SmartDashboard({ data }: SmartDashboardProps) {
  const he = useT();
  const locale = useLocale();
  const [urgentOpen, setUrgentOpen] = useState(true);

  const { kpis, urgent, todayContent, charts } = data;

  const hasUrgent =
    urgent.staleLeads.length > 0 ||
    urgent.approachingDeadlines.length > 0 ||
    urgent.overdueInvoices.length > 0;

  const urgentCount =
    urgent.staleLeads.length +
    urgent.approachingDeadlines.length +
    urgent.overdueInvoices.length;

  const kpiCards = [
    {
      label: he.dashboard.newLeads,
      value: kpis.newLeads,
      icon: Users,
      color: "text-blue-500",
      bg: "bg-blue-500/10",
    },
    {
      label: he.dashboard.pendingResponse,
      value: kpis.pendingLeads,
      icon: Clock,
      color: "text-yellow-500",
      bg: "bg-yellow-500/10",
    },
    {
      label: he.dashboard.activeProjects,
      value: kpis.activeProjects,
      icon: FolderKanban,
      color: "text-green-500",
      bg: "bg-green-500/10",
    },
    {
      label: he.dashboard.tasks,
      value: kpis.todayTasks,
      icon: CheckSquare,
      color: "text-emerald-500",
      bg: "bg-emerald-500/10",
    },
    {
      label: he.dashboard.monthlyRevenue,
      value: formatCurrency(kpis.monthRevenue, locale),
      icon: DollarSign,
      color: "text-amber-500",
      bg: "bg-amber-500/10",
    },
    {
      label: he.dashboard.openInvoices,
      value: kpis.openInvoices,
      icon: FileText,
      color: "text-orange-500",
      bg: "bg-orange-500/10",
    },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-foreground">
        {he.dashboard.title}
      </h1>

      {/* Row 1: KPI Cards */}
      <motion.div
        className="grid gap-4 grid-cols-2 lg:grid-cols-3 xl:grid-cols-6"
        variants={stagger}
        initial="hidden"
        animate="show"
      >
        {kpiCards.map((kpi) => (
          <motion.div key={kpi.label} variants={fadeUp}>
            <Card className="glass-card group transition-all duration-300 hover:scale-[1.02] cursor-default">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className={`rounded-lg ${kpi.bg} p-2`}>
                    <kpi.icon className={`h-4 w-4 ${kpi.color}`} />
                  </div>
                </div>
                <div className="text-2xl font-bold tracking-tight">
                  {kpi.value}
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {kpi.label}
                </p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      {/* Row 2: Urgent / Needs Attention */}
      {hasUrgent && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="border-red-500/30 bg-red-500/5 dark:bg-red-500/10">
            <CardHeader className="pb-2">
              <button
                onClick={() => setUrgentOpen((o) => !o)}
                className="flex items-center justify-between w-full"
              >
                <CardTitle className="text-lg flex items-center gap-2 text-red-600 dark:text-red-400">
                  <AlertTriangle className="h-5 w-5" />
                  {he.dashboard.needsAttention}
                  <Badge
                    variant="destructive"
                    className="ms-2 text-xs"
                  >
                    {urgentCount}
                  </Badge>
                </CardTitle>
                {urgentOpen ? (
                  <ChevronUp className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                )}
              </button>
            </CardHeader>
            {urgentOpen && (
              <CardContent className="space-y-2 pt-0">
                {urgent.staleLeads.map((lead) => (
                  <Link
                    key={lead.id}
                    href="/leads"
                    className="flex items-center justify-between rounded-lg border border-red-500/20 bg-background/60 p-3 transition-colors hover:bg-muted/50"
                  >
                    <span className="text-sm font-medium">{lead.name}</span>
                    <span className="text-xs text-muted-foreground">
                      {he.dashboard.staleLeadMsg} {lead.daysSince}{" "}
                      {he.dashboard.days}
                    </span>
                  </Link>
                ))}
                {urgent.approachingDeadlines.map((p) => (
                  <Link
                    key={p.id}
                    href={`/projects/${p.id}`}
                    className="flex items-center justify-between rounded-lg border border-amber-500/20 bg-background/60 p-3 transition-colors hover:bg-muted/50"
                  >
                    <span className="text-sm font-medium">{p.title}</span>
                    <Badge variant="secondary" className="text-xs">
                      {he.dashboard.deadlineTomorrow}
                    </Badge>
                  </Link>
                ))}
                {urgent.overdueInvoices.map((inv) => (
                  <Link
                    key={inv.id}
                    href="/financials"
                    className="flex items-center justify-between rounded-lg border border-red-500/20 bg-background/60 p-3 transition-colors hover:bg-muted/50"
                  >
                    <span className="text-sm font-medium">
                      #{inv.invoiceNumber}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {formatCurrency(inv.total, locale)} &mdash;{" "}
                      {he.dashboard.overdueInvoice}
                    </span>
                  </Link>
                ))}
              </CardContent>
            )}
          </Card>
        </motion.div>
      )}

      {/* Row 3: Charts */}
      <motion.div
        className="grid gap-6 lg:grid-cols-2"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        {/* Line chart: Leads over time */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="text-lg">{he.dashboard.leadsOverTime}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[250px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={charts.timeline}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    className="stroke-border"
                  />
                  <XAxis
                    dataKey="week"
                    tick={{ fontSize: 11 }}
                    className="text-muted-foreground"
                  />
                  <YAxis
                    allowDecimals={false}
                    tick={{ fontSize: 11 }}
                    className="text-muted-foreground"
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      borderColor: "hsl(var(--border))",
                      borderRadius: "8px",
                      color: "hsl(var(--foreground))",
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="count"
                    stroke="#38b6ff"
                    strokeWidth={2}
                    dot={{ fill: "#38b6ff", r: 3 }}
                    activeDot={{ r: 5 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Donut chart: Lead sources */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="text-lg">{he.dashboard.leadSources}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[250px] w-full">
              {charts.bySource.length === 0 ? (
                <div className="flex items-center justify-center h-full text-sm text-muted-foreground">
                  {he.dashboard.noProjects}
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={charts.bySource}
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={90}
                      paddingAngle={3}
                      dataKey="count"
                      nameKey="source"
                    >
                      {charts.bySource.map((_, idx) => (
                        <Cell
                          key={idx}
                          fill={PIE_COLORS[idx % PIE_COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        borderColor: "hsl(var(--border))",
                        borderRadius: "8px",
                        color: "hsl(var(--foreground))",
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
            {/* Legend */}
            {charts.bySource.length > 0 && (
              <div className="flex flex-wrap gap-3 mt-2 justify-center">
                {charts.bySource.map((s, idx) => (
                  <div key={s.source} className="flex items-center gap-1.5 text-xs">
                    <span
                      className="w-2.5 h-2.5 rounded-full inline-block"
                      style={{
                        backgroundColor:
                          PIE_COLORS[idx % PIE_COLORS.length],
                      }}
                    />
                    <span className="text-muted-foreground">
                      {s.source} ({s.count})
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Row 4: Today's Content */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <div className="rounded-lg bg-[#38b6ff]/10 p-1.5">
                <CalendarDays className="h-4 w-4 text-[#38b6ff]" />
              </div>
              {he.dashboard.todaySchedule}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {todayContent.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                {he.dashboard.noContentToday}
              </p>
            ) : (
              <div className="space-y-2">
                {todayContent.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between rounded-lg border border-border bg-muted/30 p-3 transition-all duration-200 hover:bg-muted/50"
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                        style={{ backgroundColor: item.color || "#9ca3af" }}
                      />
                      <span className="text-sm font-medium">{item.title}</span>
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      {item.status}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
            <Link
              href="/calendar"
              className="inline-block mt-3 text-sm text-[#38b6ff] hover:underline"
            >
              {he.calendar.upcomingContent} &rarr;
            </Link>
          </CardContent>
        </Card>
      </motion.div>

      {/* Row 5: Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="text-lg">
              {he.dashboard.quickActions}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/leads"
                className={buttonVariants({ variant: "outline", size: "sm" })}
              >
                <Plus className="h-4 w-4 me-1.5" />
                {he.dashboard.addLead}
              </Link>
              <Link
                href="/projects"
                className={buttonVariants({ variant: "outline", size: "sm" })}
              >
                <ClipboardList className="h-4 w-4 me-1.5" />
                {he.dashboard.createProject}
              </Link>
              <Link
                href="/projects"
                className={buttonVariants({ variant: "outline", size: "sm" })}
              >
                <CheckSquare className="h-4 w-4 me-1.5" />
                {he.dashboard.addTask}
              </Link>
              <Link
                href="/financials"
                className={buttonVariants({ variant: "outline", size: "sm" })}
              >
                <FileSpreadsheet className="h-4 w-4 me-1.5" />
                {he.dashboard.createQuote}
              </Link>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
