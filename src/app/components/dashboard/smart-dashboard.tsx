"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import {
  Users, FolderKanban, CheckSquare, DollarSign, FileText,
  AlertTriangle, CalendarDays, Plus, ChevronDown, ChevronUp,
  Clock, ArrowLeft,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import { useT, useLocale } from "@/lib/i18n";
import { formatCurrency, formatDate } from "@/lib/utils/format";
import { getPhaseLabel } from "@/lib/project-config";
import type { SmartDashboardData } from "@/lib/actions/dashboard-actions";

const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.06 } } };
const fadeUp = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition: { duration: 0.35 } } };

export function SmartDashboard({ data }: { data: SmartDashboardData }) {
  const he = useT();
  const locale = useLocale();
  const [urgentOpen, setUrgentOpen] = useState(true);

  const { kpis, urgent, todayContent } = data;
  const thisWeek = data.thisWeek ?? { deadlines: [], tasks: [] };
  const recentProjects = data.recentProjects ?? [];

  const hasUrgent = (urgent?.approachingDeadlines?.length ?? 0) > 0 || (urgent?.overdueInvoices?.length ?? 0) > 0;
  const urgentCount = (urgent?.approachingDeadlines?.length ?? 0) + (urgent?.overdueInvoices?.length ?? 0);
  const hasThisWeek = thisWeek.deadlines.length > 0 || thisWeek.tasks.length > 0;

  const kpiCards = [
    { label: he.dashboard.activeProjects, value: kpis.activeProjects, icon: FolderKanban, color: "text-blue-500", bg: "bg-blue-500/10", href: "/projects" },
    { label: he.dashboard.tasks, value: kpis.todayTasks, icon: CheckSquare, color: "text-emerald-500", bg: "bg-emerald-500/10", href: "/tasks" },
    { label: he.dashboard.openInvoices, value: kpis.openInvoices, icon: FileText, color: "text-orange-500", bg: "bg-orange-500/10", href: "/financials" },
    { label: he.dashboard.monthlyRevenue, value: formatCurrency(kpis.monthRevenue, locale), icon: DollarSign, color: "text-amber-500", bg: "bg-amber-500/10", href: "/financials" },
    { label: he.dashboard.activeClients, value: kpis.activeClients, icon: Users, color: "text-violet-500", bg: "bg-violet-500/10", href: "/clients" },
  ];

  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-bold text-foreground">{he.dashboard.title}</h1>

      {/* ── KPI Cards ── */}
      <motion.div className="grid gap-3 grid-cols-2 sm:grid-cols-3 lg:grid-cols-5" variants={stagger} initial="hidden" animate="show">
        {kpiCards.map((kpi) => (
          <motion.div key={kpi.label} variants={fadeUp}>
            <Link href={kpi.href}>
              <Card className="group transition-all duration-200 hover:shadow-md hover:scale-[1.02] cursor-pointer border-border">
                <CardContent className="p-4">
                  <div className={`rounded-lg ${kpi.bg} p-2 w-fit mb-2`}>
                    <kpi.icon className={`h-4 w-4 ${kpi.color}`} />
                  </div>
                  <div className="text-2xl font-bold tracking-tight">{kpi.value}</div>
                  <p className="text-xs text-muted-foreground mt-0.5">{kpi.label}</p>
                </CardContent>
              </Card>
            </Link>
          </motion.div>
        ))}
      </motion.div>

      {/* ── Urgent / Needs Attention ── */}
      {hasUrgent && (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
          <Card className="border-red-500/20 bg-red-50/50 dark:bg-red-500/5">
            <button onClick={() => setUrgentOpen(o => !o)} className="flex items-center justify-between w-full px-5 py-3.5">
              <span className="text-sm font-semibold flex items-center gap-2 text-red-600 dark:text-red-400">
                <AlertTriangle className="h-4 w-4" />
                דורש טיפול עכשיו
                <Badge variant="destructive" className="text-[10px] px-1.5">{urgentCount}</Badge>
              </span>
              {urgentOpen ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
            </button>
            {urgentOpen && (
              <div className="px-5 pb-4 space-y-2">
                {(urgent?.approachingDeadlines ?? []).map(p => (
                  <Link key={p.id} href={`/projects/${p.id}`} className="flex items-center justify-between rounded-lg border border-amber-200 dark:border-amber-500/20 bg-background/80 px-3 py-2.5 hover:bg-muted/50 transition-colors">
                    <span className="text-sm">{p.title}</span>
                    <span className="text-xs text-amber-600 dark:text-amber-400 flex items-center gap-1"><Clock className="h-3 w-3" /> דדליין קרוב</span>
                  </Link>
                ))}
                {(urgent?.overdueInvoices ?? []).map(inv => (
                  <Link key={inv.id} href="/financials" className="flex items-center justify-between rounded-lg border border-red-200 dark:border-red-500/20 bg-background/80 px-3 py-2.5 hover:bg-muted/50 transition-colors">
                    <span className="text-sm">חשבונית #{inv.invoiceNumber}</span>
                    <span className="text-xs text-red-500">{formatCurrency(inv.total, locale)} — באיחור</span>
                  </Link>
                ))}
              </div>
            )}
          </Card>
        </motion.div>
      )}

      {/* ── Two-column layout: This Week + Today ── */}
      <motion.div className="grid gap-5 lg:grid-cols-2" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>

        {/* This Week */}
        <Card className="border-border">
          <div className="px-5 py-3.5 border-b border-border">
            <h2 className="text-sm font-semibold flex items-center gap-2">
              <CalendarDays className="h-4 w-4 text-blue-500" />
              מה יש השבוע
            </h2>
          </div>
          <CardContent className="p-4 space-y-1.5">
            {!hasThisWeek ? (
              <p className="text-sm text-muted-foreground text-center py-4">אין אירועים השבוע</p>
            ) : (
              <>
                {thisWeek.deadlines.map(d => (
                  <Link key={d.id} href={`/projects/${d.id}`} className="flex items-center justify-between rounded-lg px-3 py-2 hover:bg-muted/50 transition-colors">
                    <span className="text-sm">{d.title}</span>
                    <span className="text-xs text-muted-foreground">{formatDate(d.deadline, locale)}</span>
                  </Link>
                ))}
                {thisWeek.tasks.map(t => (
                  <div key={t.id} className="flex items-center gap-2.5 rounded-lg px-3 py-2">
                    <div className="h-2 w-2 rounded-full bg-emerald-400 shrink-0" />
                    <span className="text-sm flex-1">{t.title}</span>
                    {t.projectTitle && <span className="text-[10px] text-muted-foreground bg-muted rounded px-1.5 py-0.5">{t.projectTitle}</span>}
                  </div>
                ))}
              </>
            )}
          </CardContent>
        </Card>

        {/* Today's Content */}
        <Card className="border-border">
          <div className="px-5 py-3.5 border-b border-border flex items-center justify-between">
            <h2 className="text-sm font-semibold flex items-center gap-2">
              <CalendarDays className="h-4 w-4 text-[#38b6ff]" />
              {he.dashboard.todaySchedule}
            </h2>
            <Link href="/calendar" className="text-xs text-[#38b6ff] hover:underline">הכל &larr;</Link>
          </div>
          <CardContent className="p-4">
            {todayContent.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">{he.dashboard.noContentToday}</p>
            ) : (
              <div className="space-y-1.5">
                {todayContent.map(item => (
                  <div key={item.id} className="flex items-center justify-between rounded-lg px-3 py-2 hover:bg-muted/50 transition-colors">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: item.color || "#9ca3af" }} />
                      <span className="text-sm">{item.title}</span>
                    </div>
                    <Badge variant="secondary" className="text-[10px]">
                      {he.calendar.statuses[item.status as keyof typeof he.calendar.statuses] ?? item.status}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* ── Recent Projects ── */}
      {recentProjects.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}>
          <Card className="border-border">
            <div className="px-5 py-3.5 border-b border-border flex items-center justify-between">
              <h2 className="text-sm font-semibold flex items-center gap-2">
                <FolderKanban className="h-4 w-4 text-blue-500" />
                פרויקטים אחרונים
              </h2>
              <Link href="/projects" className="text-xs text-[#38b6ff] hover:underline">הכל &larr;</Link>
            </div>
            <CardContent className="p-4 space-y-1">
              {recentProjects.map(p => (
                <Link key={p.id} href={`/projects/${p.id}`} className="flex items-center justify-between rounded-lg px-3 py-2.5 hover:bg-muted/50 transition-colors">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="text-sm font-medium truncate">{p.title}</span>
                    {p.clientName && <span className="text-xs text-muted-foreground hidden sm:inline">{p.clientName}</span>}
                  </div>
                  <Badge variant="secondary" className="text-[10px] shrink-0">{getPhaseLabel(p.phase)}</Badge>
                </Link>
              ))}
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* ── Quick Actions ── */}
      <motion.div className="flex flex-wrap gap-2" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
        {[
          { label: "פרויקט חדש", href: "/projects", icon: FolderKanban },
          { label: "לקוח חדש", href: "/clients", icon: Users },
          { label: "חשבונית חדשה", href: "/financials", icon: FileText },
        ].map(a => (
          <Link key={a.label} href={a.href} className="flex items-center gap-1.5 rounded-full border border-border bg-card px-3.5 py-2 text-xs font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">
            <Plus className="h-3 w-3" />
            {a.label}
          </Link>
        ))}
      </motion.div>
    </div>
  );
}
