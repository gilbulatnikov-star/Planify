"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import {
  Users, FolderKanban, CheckSquare, DollarSign, FileText,
  AlertTriangle, CalendarDays, Plus, Clock, ChevronLeft,
  ArrowUpRight, Sparkles, TrendingUp,
} from "lucide-react";
import { useT, useLocale } from "@/lib/i18n";
import { formatCurrency, formatDate } from "@/lib/utils/format";
import { getPhaseLabel } from "@/lib/project-config";
import type { SmartDashboardData } from "@/lib/actions/dashboard-actions";

const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.06 } } };
const fade = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0, transition: { duration: 0.5 } } };

function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 6) return "לילה טוב";
  if (h < 12) return "בוקר טוב";
  if (h < 17) return "צהריים טובים";
  if (h < 21) return "ערב טוב";
  return "לילה טוב";
}

/* ── Premium KPI Card ── */
function KpiCard({ label, value, icon: Icon, href, gradient }: {
  label: string; value: string | number; icon: React.ElementType; href: string; gradient: string;
}) {
  return (
    <Link href={href} className="group relative overflow-hidden rounded-[14px] border border-border/40 bg-card shadow-[0_1px_2px_rgba(0,0,0,0.04),0_2px_6px_-1px_rgba(0,0,0,0.04),inset_0_1px_0_rgba(255,255,255,0.75)] hover:border-border/70 hover:shadow-[0_6px_20px_-4px_rgba(0,0,0,0.1),0_2px_4px_rgba(0,0,0,0.03),inset_0_1px_0_rgba(255,255,255,0.85)] hover:-translate-y-[1px] transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]">
      {/* Gradient accent line */}
      <div className={`absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r ${gradient} opacity-40 group-hover:opacity-100 transition-opacity duration-400`} />
      <div className="relative px-5 pt-[18px] pb-[18px] sm:px-[22px]">
        <div className="flex items-center justify-between mb-4">
          <div className={`flex h-[34px] w-[34px] items-center justify-center rounded-[9px] bg-gradient-to-br ${gradient} text-white shadow-[0_2px_4px_rgba(0,0,0,0.12)]`}>
            <Icon className="h-[15px] w-[15px]" strokeWidth={2.2} />
          </div>
          <ArrowUpRight className="h-3.5 w-3.5 text-muted-foreground/0 group-hover:text-foreground/30 transition-all duration-300 translate-y-0.5 group-hover:translate-y-0 group-hover:translate-x-[-1px]" />
        </div>
        <div className="text-[24px] sm:text-[28px] font-extrabold tracking-[-0.035em] leading-none text-foreground tabular-nums">{value}</div>
        <p className="text-[10.5px] text-muted-foreground/65 mt-2 font-bold tracking-[0.07em] uppercase leading-none">{label}</p>
      </div>
    </Link>
  );
}

/* ── Section Container ── */
function Section({ title, icon: Icon, action, children, className }: {
  title: string; icon: React.ElementType; action?: { label: string; href: string }; children: React.ReactNode; className?: string;
}) {
  return (
    <div className={`rounded-[14px] border border-border/40 overflow-hidden bg-card shadow-[0_1px_2px_rgba(0,0,0,0.04),0_2px_6px_-1px_rgba(0,0,0,0.04),inset_0_1px_0_rgba(255,255,255,0.75)] dark:shadow-[0_1px_3px_rgba(0,0,0,0.3)] ${className ?? ""}`}>
      <div className="flex items-center justify-between px-5 py-3 border-b border-border/30 bg-muted/[0.12]">
        <h2 className="text-[10.5px] font-bold tracking-[0.1em] uppercase text-foreground/50 flex items-center gap-2">
          <Icon className="h-3.5 w-3.5 text-foreground/30" strokeWidth={2} />
          {title}
        </h2>
        {action && (
          <Link href={action.href} className="text-[10.5px] text-muted-foreground/60 hover:text-foreground/80 transition-colors duration-200 flex items-center gap-0.5 font-semibold">
            {action.label} <ChevronLeft className="h-2.5 w-2.5" />
          </Link>
        )}
      </div>
      {children}
    </div>
  );
}

export function SmartDashboard({ data, userName }: { data: SmartDashboardData; userName?: string | null }) {
  const he = useT();
  const locale = useLocale();

  const { kpis, todayContent } = data;
  const urgent = data.urgent ?? { approachingDeadlines: [], overdueInvoices: [] };
  const thisWeek = data.thisWeek ?? { deadlines: [], tasks: [] };
  const recentProjects = data.recentProjects ?? [];

  const urgentItems = [
    ...(urgent.approachingDeadlines ?? []).map(p => ({ id: p.id, type: "deadline" as const, label: p.title, sub: "דדליין קרוב", href: `/projects/${p.id}` })),
    ...(urgent.overdueInvoices ?? []).map(inv => ({ id: inv.id, type: "invoice" as const, label: `חשבונית #${inv.invoiceNumber}`, sub: `${formatCurrency(inv.total, locale)} — באיחור`, href: "/financials" })),
  ];

  const hasThisWeek = thisWeek.deadlines.length > 0 || thisWeek.tasks.length > 0;
  const firstName = userName?.split(" ")[0] ?? "";

  const kpiData = [
    { label: he.dashboard.activeProjects, value: kpis.activeProjects, icon: FolderKanban, href: "/projects", gradient: "from-blue-500 to-blue-600" },
    { label: he.dashboard.tasks, value: kpis.todayTasks, icon: CheckSquare, href: "/tasks", gradient: "from-emerald-500 to-emerald-600" },
    { label: he.dashboard.openInvoices, value: kpis.openInvoices, icon: FileText, href: "/financials", gradient: "from-amber-500 to-orange-500" },
    { label: he.dashboard.monthlyRevenue, value: formatCurrency(kpis.monthRevenue, locale), icon: DollarSign, href: "/financials", gradient: "from-violet-500 to-purple-600" },
    { label: he.dashboard.activeClients, value: kpis.activeClients, icon: Users, href: "/clients", gradient: "from-rose-500 to-pink-600" },
  ];

  const quickActions = [
    { label: "פרויקט חדש", href: "/projects", icon: FolderKanban },
    { label: "לקוח חדש", href: "/clients", icon: Users },
    { label: "משימה חדשה", href: "/tasks", icon: CheckSquare },
    { label: "חשבונית חדשה", href: "/financials", icon: FileText },
  ];

  return (
    <motion.div className="space-y-6 max-w-[1100px]" variants={stagger} initial="hidden" animate="show">

      {/* ══════════════════════════════════════════════════════
         HERO GREETING — editorial, confident
         ══════════════════════════════════════════════════════ */}
      <motion.div variants={fade} className="pt-0.5">
        <h1 className="text-[25px] sm:text-[32px] font-extrabold tracking-[-0.04em] leading-[1.08]">
          {getGreeting()}{firstName ? `, ${firstName}` : ""}
        </h1>
        <p className="text-[12.5px] text-muted-foreground/55 mt-1.5 tracking-[-0.005em] font-medium">הנה סיכום יום העבודה שלך</p>
      </motion.div>

      {/* ══════════════════════════════════════════════════════
         KPI MODULES — premium stat cards with gradient tops
         ══════════════════════════════════════════════════════ */}
      <motion.div variants={fade} className="grid gap-3 grid-cols-2 lg:grid-cols-5">
        {kpiData.map((kpi) => (
          <KpiCard key={kpi.label} {...kpi} />
        ))}
      </motion.div>

      {/* ══════════════════════════════════════════════════════
         URGENT — red accent band
         ══════════════════════════════════════════════════════ */}
      {urgentItems.length > 0 && (
        <motion.div variants={fade}>
          <div className="relative rounded-[14px] border border-red-200/50 dark:border-red-500/10 overflow-hidden shadow-[0_1px_2px_rgba(0,0,0,0.03)]">
            <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-red-500 to-orange-500 opacity-70" />
            <div className="flex items-center gap-2 px-5 py-2.5 bg-red-50/40 dark:bg-red-500/5 border-b border-red-200/30 dark:border-red-500/8">
              <AlertTriangle className="h-3 w-3 text-red-500/80" strokeWidth={2.2} />
              <span className="text-[10px] font-bold text-red-700/70 dark:text-red-400 tracking-[0.08em] uppercase">דורש טיפול</span>
              <span className="text-[8.5px] font-bold bg-red-500/90 text-white rounded-[4px] px-1.5 py-[1px] leading-none tabular-nums">{urgentItems.length}</span>
            </div>
            <div className="bg-card divide-y divide-red-100/40 dark:divide-red-500/6">
              {urgentItems.map(item => (
                <Link key={item.id} href={item.href} className="flex items-center justify-between px-5 py-2.5 hover:bg-red-50/25 dark:hover:bg-red-500/4 transition-colors duration-200">
                  <span className="text-[12.5px] font-semibold text-foreground/85">{item.label}</span>
                  <span className={`text-[10.5px] flex items-center gap-1 font-semibold ${item.type === "deadline" ? "text-amber-600/70 dark:text-amber-400" : "text-red-500/70"}`}>
                    <Clock className="h-2.5 w-2.5" /> {item.sub}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </motion.div>
      )}

      {/* ══════════════════════════════════════════════════════
         MAIN GRID — asymmetric 3:2 layout
         ══════════════════════════════════════════════════════ */}
      <div className="grid gap-4 lg:grid-cols-5">

        {/* ── This Week (wider) ── */}
        <motion.div variants={fade} className="lg:col-span-3 flex flex-col">
          <Section title="מה יש השבוע" icon={CalendarDays} className="flex-1">
            {!hasThisWeek ? (
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <div className="flex h-10 w-10 items-center justify-center rounded-[10px] bg-muted/30 mb-3 ring-1 ring-border/20">
                  <Sparkles className="h-4 w-4 text-muted-foreground/20" strokeWidth={1.8} />
                </div>
                <p className="text-[12.5px] font-semibold text-foreground/40">אין אירועים השבוע</p>
                <p className="text-[10.5px] text-muted-foreground/40 mt-0.5">הזמן ליצור פרויקט חדש</p>
                <Link href="/projects" className="mt-3 inline-flex items-center gap-1 text-[10.5px] font-bold text-accent/80 hover:text-accent transition-colors duration-200">
                  <Plus className="h-3 w-3" /> פרויקט חדש
                </Link>
              </div>
            ) : (
              <div className="divide-y divide-border/30">
                {thisWeek.deadlines.map(d => (
                  <Link key={d.id} href={`/projects/${d.id}`} className="flex items-center justify-between px-5 py-2.5 hover:bg-foreground/[0.02] transition-colors duration-200 group">
                    <div className="flex items-center gap-2.5">
                      <div className="h-[6px] w-[6px] rounded-full bg-blue-500 shrink-0 ring-[1.5px] ring-blue-500/15" />
                      <span className="text-[12.5px] font-semibold text-foreground/85 group-hover:text-foreground transition-colors">{d.title}</span>
                    </div>
                    <span className="text-[10.5px] text-foreground/35 font-medium tabular-nums">{formatDate(d.deadline, locale)}</span>
                  </Link>
                ))}
                {thisWeek.tasks.map(t => (
                  <div key={t.id} className="flex items-center gap-2.5 px-5 py-2.5">
                    <div className="h-[6px] w-[6px] rounded-full bg-emerald-500 shrink-0 ring-[1.5px] ring-emerald-500/15" />
                    <span className="text-[12.5px] font-medium text-foreground/80 flex-1">{t.title}</span>
                    {t.projectTitle && <span className="text-[9.5px] text-foreground/35 bg-foreground/[0.04] rounded-[5px] px-1.5 py-[2px] font-bold">{t.projectTitle}</span>}
                  </div>
                ))}
              </div>
            )}
          </Section>
        </motion.div>

        {/* ── Right column ── */}
        <motion.div variants={fade} className="lg:col-span-2 space-y-4">

          {/* Today */}
          <Section title={he.dashboard.todaySchedule} icon={CalendarDays} action={{ label: "הכל", href: "/calendar" }}>
            {todayContent.length === 0 ? (
              <div className="py-8 text-center">
                <p className="text-[11.5px] text-foreground/30 font-medium">{he.dashboard.noContentToday}</p>
              </div>
            ) : (
              <div className="divide-y divide-border/30">
                {todayContent.map(item => (
                  <div key={item.id} className="flex items-center justify-between px-5 py-2.5">
                    <div className="flex items-center gap-2.5">
                      <span className="w-[6px] h-[6px] rounded-full shrink-0" style={{ backgroundColor: item.color || "#9ca3af", boxShadow: `0 0 0 2px ${item.color || "#9ca3af"}15` }} />
                      <span className="text-[12.5px] font-semibold text-foreground/85">{item.title}</span>
                    </div>
                    <span className="text-[9.5px] text-foreground/35 bg-foreground/[0.04] rounded-[5px] px-1.5 py-[2px] font-bold tracking-wide">
                      {he.calendar.statuses[item.status as keyof typeof he.calendar.statuses] ?? item.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </Section>

          {/* Quick Actions */}
          <div className="grid grid-cols-2 gap-2">
            {quickActions.map(a => (
              <Link key={a.label} href={a.href} className="group flex items-center justify-center gap-2.5 rounded-[12px] border border-border/50 bg-card px-4 py-3.5 shadow-[0_1px_3px_rgba(0,0,0,0.06),inset_0_1px_0_rgba(255,255,255,0.7)] hover:border-accent/30 hover:shadow-[0_4px_12px_-3px_rgba(0,0,0,0.1)] hover:-translate-y-[1px] active:translate-y-0 transition-all duration-200 cursor-pointer">
                <div className="flex h-8 w-8 items-center justify-center rounded-[9px] bg-accent/8 group-hover:bg-accent/15 transition-colors duration-200">
                  <a.icon className="h-4 w-4 text-accent/60 group-hover:text-accent transition-colors duration-200" strokeWidth={2} />
                </div>
                <span className="text-[12.5px] font-bold text-foreground/60 group-hover:text-foreground/90 transition-colors duration-200">{a.label}</span>
              </Link>
            ))}
          </div>
        </motion.div>
      </div>

      {/* ══════════════════════════════════════════════════════
         RECENT PROJECTS — refined list
         ══════════════════════════════════════════════════════ */}
      {recentProjects.length > 0 && (
        <motion.div variants={fade}>
          <Section title="פרויקטים אחרונים" icon={FolderKanban} action={{ label: "הכל", href: "/projects" }}>
            <div className="divide-y divide-border/30">
              {recentProjects.map(p => (
                <Link key={p.id} href={`/projects/${p.id}`} className="flex items-center justify-between px-5 py-3 hover:bg-foreground/[0.02] transition-colors duration-200 group">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="flex h-7 w-7 items-center justify-center rounded-[8px] bg-foreground/[0.04] shrink-0 group-hover:bg-accent/10 transition-colors duration-200">
                      <FolderKanban className="h-3 w-3 text-foreground/30 group-hover:text-accent/80 transition-colors duration-200" />
                    </div>
                    <div className="min-w-0">
                      <span className="text-[12.5px] font-semibold block truncate text-foreground/85">{p.title}</span>
                      {p.clientName && <span className="text-[10.5px] text-foreground/35">{p.clientName}</span>}
                    </div>
                  </div>
                  <span className="text-[9.5px] text-foreground/35 bg-foreground/[0.04] rounded-[5px] px-1.5 py-[2px] font-bold shrink-0">{getPhaseLabel(p.phase)}</span>
                </Link>
              ))}
            </div>
          </Section>
        </motion.div>
      )}
    </motion.div>
  );
}
