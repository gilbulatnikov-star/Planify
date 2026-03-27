"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import {
  Users, FolderKanban, CheckSquare, DollarSign, FileText,
  AlertTriangle, CalendarDays, Plus, Clock, ChevronRight,
} from "lucide-react";
import { useState } from "react";
import { useT, useLocale } from "@/lib/i18n";
import { formatCurrency, formatDate } from "@/lib/utils/format";
import { getPhaseLabel } from "@/lib/project-config";
import type { SmartDashboardData } from "@/lib/actions/dashboard-actions";

const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.05 } } };
const fade = { hidden: { opacity: 0, y: 6 }, show: { opacity: 1, y: 0, transition: { duration: 0.3 } } };

export function SmartDashboard({ data }: { data: SmartDashboardData }) {
  const he = useT();
  const locale = useLocale();

  const { kpis, todayContent } = data;
  const urgent = data.urgent ?? { approachingDeadlines: [], overdueInvoices: [] };
  const thisWeek = data.thisWeek ?? { deadlines: [], tasks: [] };
  const recentProjects = data.recentProjects ?? [];

  const hasUrgent = (urgent.approachingDeadlines?.length ?? 0) > 0 || (urgent.overdueInvoices?.length ?? 0) > 0;
  const urgentCount = (urgent.approachingDeadlines?.length ?? 0) + (urgent.overdueInvoices?.length ?? 0);
  const hasThisWeek = thisWeek.deadlines.length > 0 || thisWeek.tasks.length > 0;

  const kpiCards = [
    { label: he.dashboard.activeProjects, value: kpis.activeProjects, icon: FolderKanban, href: "/projects" },
    { label: he.dashboard.tasks, value: kpis.todayTasks, icon: CheckSquare, href: "/tasks" },
    { label: he.dashboard.openInvoices, value: kpis.openInvoices, icon: FileText, href: "/financials" },
    { label: he.dashboard.monthlyRevenue, value: formatCurrency(kpis.monthRevenue, locale), icon: DollarSign, href: "/financials" },
    { label: he.dashboard.activeClients, value: kpis.activeClients, icon: Users, href: "/clients" },
  ];

  return (
    <div className="space-y-8 max-w-5xl">
      {/* Title */}
      <motion.h1
        className="text-3xl font-bold tracking-tight text-foreground"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4 }}
      >
        {he.dashboard.title}
      </motion.h1>

      {/* ── KPI Strip ── */}
      <motion.div className="grid gap-px grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 rounded-xl border border-border bg-border overflow-hidden" variants={stagger} initial="hidden" animate="show">
        {kpiCards.map((kpi) => (
          <motion.div key={kpi.label} variants={fade}>
            <Link href={kpi.href} className="flex flex-col justify-between bg-card p-5 hover:bg-muted/40 transition-colors duration-150 h-full group">
              <div className="flex items-center justify-between mb-3">
                <kpi.icon className="h-4 w-4 text-muted-foreground" />
                <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/0 group-hover:text-muted-foreground/60 transition-all duration-150 -translate-x-1 group-hover:translate-x-0 rtl:rotate-180 rtl:translate-x-1 rtl:group-hover:translate-x-0" />
              </div>
              <div className="text-2xl font-bold tracking-tight leading-none">{kpi.value}</div>
              <p className="text-[11px] text-muted-foreground mt-1.5 leading-tight">{kpi.label}</p>
            </Link>
          </motion.div>
        ))}
      </motion.div>

      {/* ── Urgent ── */}
      {hasUrgent && (
        <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15, duration: 0.3 }}>
          <div className="rounded-xl border border-red-200 dark:border-red-500/15 bg-red-50/60 dark:bg-red-500/5 overflow-hidden">
            <div className="flex items-center gap-2 px-5 py-3 border-b border-red-200/60 dark:border-red-500/10">
              <AlertTriangle className="h-4 w-4 text-red-500" />
              <span className="text-sm font-semibold text-red-700 dark:text-red-400">דורש טיפול</span>
              <span className="text-[10px] font-medium bg-red-500 text-white rounded px-1.5 py-0.5">{urgentCount}</span>
            </div>
            <div className="divide-y divide-red-100 dark:divide-red-500/10">
              {(urgent.approachingDeadlines ?? []).map(p => (
                <Link key={p.id} href={`/projects/${p.id}`} className="flex items-center justify-between px-5 py-3 hover:bg-red-50 dark:hover:bg-red-500/5 transition-colors">
                  <span className="text-sm">{p.title}</span>
                  <span className="text-xs text-amber-600 dark:text-amber-400 flex items-center gap-1"><Clock className="h-3 w-3" /> דדליין קרוב</span>
                </Link>
              ))}
              {(urgent.overdueInvoices ?? []).map(inv => (
                <Link key={inv.id} href="/financials" className="flex items-center justify-between px-5 py-3 hover:bg-red-50 dark:hover:bg-red-500/5 transition-colors">
                  <span className="text-sm">חשבונית #{inv.invoiceNumber}</span>
                  <span className="text-xs text-red-500">{formatCurrency(inv.total, locale)} — באיחור</span>
                </Link>
              ))}
            </div>
          </div>
        </motion.div>
      )}

      {/* ── Two columns: This Week + Today ── */}
      <motion.div className="grid gap-5 lg:grid-cols-2" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        {/* This Week */}
        <div className="rounded-xl border border-border overflow-hidden">
          <div className="flex items-center justify-between px-5 py-3.5 bg-muted/30 border-b border-border">
            <h2 className="text-sm font-semibold flex items-center gap-2">
              <CalendarDays className="h-4 w-4 text-muted-foreground" />
              מה יש השבוע
            </h2>
          </div>
          <div className="bg-card">
            {!hasThisWeek ? (
              <p className="text-sm text-muted-foreground text-center py-8">אין אירועים השבוע</p>
            ) : (
              <div className="divide-y divide-border">
                {thisWeek.deadlines.map(d => (
                  <Link key={d.id} href={`/projects/${d.id}`} className="flex items-center justify-between px-5 py-3 hover:bg-muted/30 transition-colors">
                    <span className="text-sm">{d.title}</span>
                    <span className="text-xs text-muted-foreground">{formatDate(d.deadline, locale)}</span>
                  </Link>
                ))}
                {thisWeek.tasks.map(t => (
                  <div key={t.id} className="flex items-center gap-3 px-5 py-3">
                    <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 shrink-0" />
                    <span className="text-sm flex-1">{t.title}</span>
                    {t.projectTitle && <span className="text-[10px] text-muted-foreground">{t.projectTitle}</span>}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Today */}
        <div className="rounded-xl border border-border overflow-hidden">
          <div className="flex items-center justify-between px-5 py-3.5 bg-muted/30 border-b border-border">
            <h2 className="text-sm font-semibold flex items-center gap-2">
              <CalendarDays className="h-4 w-4 text-muted-foreground" />
              {he.dashboard.todaySchedule}
            </h2>
            <Link href="/calendar" className="text-xs text-muted-foreground hover:text-foreground transition-colors">הכל &larr;</Link>
          </div>
          <div className="bg-card">
            {todayContent.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">{he.dashboard.noContentToday}</p>
            ) : (
              <div className="divide-y divide-border">
                {todayContent.map(item => (
                  <div key={item.id} className="flex items-center justify-between px-5 py-3">
                    <div className="flex items-center gap-2.5">
                      <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: item.color || "#9ca3af" }} />
                      <span className="text-sm">{item.title}</span>
                    </div>
                    <span className="text-[10px] text-muted-foreground bg-muted rounded px-2 py-0.5">
                      {he.calendar.statuses[item.status as keyof typeof he.calendar.statuses] ?? item.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </motion.div>

      {/* ── Recent Projects ── */}
      {recentProjects.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <div className="rounded-xl border border-border overflow-hidden">
            <div className="flex items-center justify-between px-5 py-3.5 bg-muted/30 border-b border-border">
              <h2 className="text-sm font-semibold">פרויקטים אחרונים</h2>
              <Link href="/projects" className="text-xs text-muted-foreground hover:text-foreground transition-colors">הכל &larr;</Link>
            </div>
            <div className="bg-card divide-y divide-border">
              {recentProjects.map(p => (
                <Link key={p.id} href={`/projects/${p.id}`} className="flex items-center justify-between px-5 py-3.5 hover:bg-muted/30 transition-colors group">
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="text-sm font-medium">{p.title}</span>
                    {p.clientName && <span className="text-xs text-muted-foreground hidden sm:inline">{p.clientName}</span>}
                  </div>
                  <span className="text-[10px] text-muted-foreground bg-muted rounded px-2 py-0.5 shrink-0">{getPhaseLabel(p.phase)}</span>
                </Link>
              ))}
            </div>
          </div>
        </motion.div>
      )}

      {/* ── Quick Actions ── */}
      <motion.div className="flex flex-wrap gap-2" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.35 }}>
        {[
          { label: "פרויקט חדש", href: "/projects" },
          { label: "לקוח חדש", href: "/clients" },
          { label: "חשבונית חדשה", href: "/financials" },
        ].map(a => (
          <Link key={a.label} href={a.href} className="flex items-center gap-1.5 rounded-md border border-border bg-card px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground hover:border-foreground/20 transition-all duration-150">
            <Plus className="h-3 w-3" />
            {a.label}
          </Link>
        ))}
      </motion.div>
    </div>
  );
}
