"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import {
  Users, FolderKanban, CheckSquare, DollarSign, FileText,
  AlertTriangle, CalendarDays, Plus, Clock, ChevronLeft,
  ArrowUpRight, Sparkles, UserPlus, Scan, Receipt,
} from "lucide-react";
import { useT, useLocale } from "@/lib/i18n";
import { formatCurrency, formatDate } from "@/lib/utils/format";
import { getPhaseLabel } from "@/lib/project-config";
import type { SmartDashboardData } from "@/lib/actions/dashboard-actions";

const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.05 } } };
const fade = { hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0, transition: { duration: 0.4 } } };

function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 6) return "לילה טוב";
  if (h < 12) return "בוקר טוב";
  if (h < 17) return "צהריים טובים";
  if (h < 21) return "ערב טוב";
  return "לילה טוב";
}

/* ── KPI Card — compact, uniform ── */
function KpiCard({ label, value, icon: Icon, href, gradient }: {
  label: string; value: string | number; icon: React.ElementType; href: string; gradient: string;
}) {
  return (
    <Link href={href} className="group relative overflow-hidden rounded-2xl border border-border/40 bg-card shadow-[0_1px_3px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_16px_-4px_rgba(0,0,0,0.1)] hover:-translate-y-px transition-all duration-300">
      <div className={`absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r ${gradient} opacity-30 group-hover:opacity-100 transition-opacity`} />
      <div className="px-4 py-4 sm:px-5">
        <div className="flex items-center justify-between mb-3">
          <div className={`flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br ${gradient} text-white shadow-sm`}>
            <Icon className="h-3.5 w-3.5" strokeWidth={2.2} />
          </div>
          <ArrowUpRight className="h-3 w-3 text-transparent group-hover:text-foreground/25 transition-colors" />
        </div>
        <div className="text-2xl font-extrabold tracking-tight leading-none text-foreground tabular-nums">{value}</div>
        <p className="text-[10px] text-muted-foreground/60 mt-1.5 font-bold tracking-[0.08em] uppercase">{label}</p>
      </div>
    </Link>
  );
}

/* ── Section Container ── */
function Section({ title, icon: Icon, action, children, className }: {
  title: string; icon: React.ElementType; action?: { label: string; href: string }; children: React.ReactNode; className?: string;
}) {
  return (
    <div className={`rounded-2xl border border-border/40 overflow-hidden bg-card shadow-[0_1px_3px_rgba(0,0,0,0.04)] ${className ?? ""}`}>
      <div className="flex items-center justify-between px-5 py-3 border-b border-border/30">
        <h2 className="text-[10.5px] font-bold tracking-[0.1em] uppercase text-foreground/45 flex items-center gap-2">
          <Icon className="h-3.5 w-3.5 text-foreground/25" strokeWidth={2} />
          {title}
        </h2>
        {action && (
          <Link href={action.href} className="text-[10.5px] text-muted-foreground/50 hover:text-foreground/70 transition-colors flex items-center gap-0.5 font-semibold">
            {action.label} <ChevronLeft className="h-2.5 w-2.5" />
          </Link>
        )}
      </div>
      {children}
    </div>
  );
}

/* ── Quick Action Button — banking-app style ── */
function QuickAction({ label, href, icon: Icon, primary }: {
  label: string; href: string; icon: React.ElementType; primary?: boolean;
}) {
  return (
    <Link
      href={href}
      className={`group flex flex-col items-center gap-2.5 rounded-2xl p-4 min-w-[72px] shrink-0 sm:min-w-0 sm:shrink transition-all duration-200 cursor-pointer ${
        primary
          ? "bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-md shadow-blue-500/20 hover:shadow-lg hover:shadow-blue-500/30 hover:-translate-y-0.5 active:translate-y-0"
          : "bg-card border border-border/40 hover:border-border/60 hover:shadow-[0_4px_12px_-4px_rgba(0,0,0,0.08)] hover:-translate-y-0.5 active:translate-y-0"
      }`}
    >
      <div className={`flex h-11 w-11 items-center justify-center rounded-xl transition-colors ${
        primary
          ? "bg-white/20"
          : "bg-foreground/[0.04] group-hover:bg-accent/10"
      }`}>
        <Icon className={`h-5 w-5 ${primary ? "text-white" : "text-foreground/50 group-hover:text-accent"} transition-colors`} strokeWidth={1.8} />
      </div>
      <span className={`text-[11.5px] font-semibold text-center leading-tight ${
        primary ? "text-white/90" : "text-foreground/55 group-hover:text-foreground/80"
      } transition-colors`}>
        {label}
      </span>
    </Link>
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
    { label: he.dashboard.monthlyRevenue, value: formatCurrency(kpis.monthRevenue, locale), icon: DollarSign, href: "/financials", gradient: "from-emerald-500 to-emerald-600" },
    { label: he.dashboard.activeProjects, value: kpis.activeProjects, icon: FolderKanban, href: "/projects", gradient: "from-blue-500 to-blue-600" },
    { label: he.dashboard.activeClients, value: kpis.activeClients, icon: Users, href: "/clients", gradient: "from-violet-500 to-purple-600" },
    { label: he.dashboard.tasks, value: kpis.todayTasks, icon: CheckSquare, href: "/tasks", gradient: "from-amber-500 to-orange-500" },
    { label: he.dashboard.openInvoices, value: kpis.openInvoices, icon: FileText, href: "/financials", gradient: "from-rose-500 to-pink-600" },
  ];

  return (
    <motion.div className="space-y-5 max-w-[1100px]" variants={stagger} initial="hidden" animate="show">

      {/* ══════════════════════════════════════════════════════
         1. HERO — Greeting + summary line
         ══════════════════════════════════════════════════════ */}
      <motion.div variants={fade} className="pt-0.5">
        <h1 className="text-[24px] sm:text-[30px] font-extrabold tracking-[-0.04em] leading-[1.1]">
          {getGreeting()}{firstName ? `, ${firstName}` : ""}
        </h1>
        <p className="text-[12px] text-muted-foreground/50 mt-1 tracking-[-0.005em] font-medium">הנה סיכום יום העבודה שלך</p>
      </motion.div>

      {/* ══════════════════════════════════════════════════════
         2. QUICK ACTIONS — banking-app style, priority-ordered
         ══════════════════════════════════════════════════════ */}
      <motion.div variants={fade}>
        <div className="flex gap-2.5 overflow-x-auto pb-1 scrollbar-none sm:grid sm:grid-cols-5 sm:overflow-visible sm:pb-0">
          <QuickAction label="פרויקט חדש" href="/projects" icon={Plus} primary />
          <QuickAction label="לקוח חדש" href="/clients" icon={UserPlus} />
          <QuickAction label="משימה חדשה" href="/tasks" icon={CheckSquare} />
          <QuickAction label="חשבונית" href="/financials" icon={Receipt} />
          <QuickAction label="סריקת מסמך" href="/financials" icon={Scan} />
        </div>
      </motion.div>

      {/* ══════════════════════════════════════════════════════
         3. KPI SUMMARY — uniform cards, financial-first order
         ══════════════════════════════════════════════════════ */}
      <motion.div variants={fade} className="grid gap-2.5 grid-cols-2 lg:grid-cols-5">
        {kpiData.map((kpi) => (
          <KpiCard key={kpi.label} {...kpi} />
        ))}
      </motion.div>

      {/* ══════════════════════════════════════════════════════
         4. ALERTS — urgent items (if any)
         ══════════════════════════════════════════════════════ */}
      {urgentItems.length > 0 && (
        <motion.div variants={fade}>
          <div className="relative rounded-2xl border border-red-200/40 dark:border-red-500/10 overflow-hidden">
            <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-red-500 to-orange-500 opacity-60" />
            <div className="flex items-center gap-2 px-5 py-2.5 bg-red-50/30 dark:bg-red-500/5 border-b border-red-200/20 dark:border-red-500/8">
              <AlertTriangle className="h-3 w-3 text-red-500/70" strokeWidth={2.2} />
              <span className="text-[10px] font-bold text-red-700/60 dark:text-red-400 tracking-[0.08em] uppercase">דורש טיפול</span>
              <span className="text-[8px] font-bold bg-red-500/80 text-white rounded px-1.5 py-px leading-none tabular-nums">{urgentItems.length}</span>
            </div>
            <div className="bg-card divide-y divide-red-100/30 dark:divide-red-500/6">
              {urgentItems.map(item => (
                <Link key={item.id} href={item.href} className="flex items-center justify-between px-5 py-2.5 hover:bg-red-50/20 dark:hover:bg-red-500/4 transition-colors">
                  <span className="text-[12.5px] font-semibold text-foreground/80">{item.label}</span>
                  <span className={`text-[10.5px] flex items-center gap-1 font-semibold ${item.type === "deadline" ? "text-amber-600/60" : "text-red-500/60"}`}>
                    <Clock className="h-2.5 w-2.5" /> {item.sub}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </motion.div>
      )}

      {/* ══════════════════════════════════════════════════════
         5. MAIN CONTENT — two-column layout
         ══════════════════════════════════════════════════════ */}
      <div className="grid gap-4 lg:grid-cols-5">

        {/* ── This Week (wider) ── */}
        <motion.div variants={fade} className="lg:col-span-3 flex flex-col">
          <Section title="מה יש השבוע" icon={CalendarDays} className="flex-1">
            {!hasThisWeek ? (
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-muted/20 mb-3">
                  <Sparkles className="h-4 w-4 text-muted-foreground/20" strokeWidth={1.8} />
                </div>
                <p className="text-[12.5px] font-semibold text-foreground/35">אין אירועים השבוע</p>
                <p className="text-[10.5px] text-muted-foreground/35 mt-0.5">הזמן ליצור פרויקט חדש</p>
              </div>
            ) : (
              <div className="divide-y divide-border/30">
                {thisWeek.deadlines.map(d => (
                  <Link key={d.id} href={`/projects/${d.id}`} className="flex items-center justify-between px-5 py-2.5 hover:bg-foreground/[0.02] transition-colors group">
                    <div className="flex items-center gap-2.5">
                      <div className="h-1.5 w-1.5 rounded-full bg-blue-500 shrink-0" />
                      <span className="text-[12.5px] font-semibold text-foreground/80 group-hover:text-foreground transition-colors">{d.title}</span>
                    </div>
                    <span className="text-[10.5px] text-foreground/30 font-medium tabular-nums">{formatDate(d.deadline, locale)}</span>
                  </Link>
                ))}
                {thisWeek.tasks.map(t => (
                  <div key={t.id} className="flex items-center gap-2.5 px-5 py-2.5">
                    <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 shrink-0" />
                    <span className="text-[12.5px] font-medium text-foreground/75 flex-1">{t.title}</span>
                    {t.projectTitle && <span className="text-[9.5px] text-foreground/30 bg-foreground/[0.04] rounded-md px-1.5 py-[2px] font-bold">{t.projectTitle}</span>}
                  </div>
                ))}
              </div>
            )}
          </Section>
        </motion.div>

        {/* ── Right: Today Schedule ── */}
        <motion.div variants={fade} className="lg:col-span-2 flex flex-col">
          <Section title={he.dashboard.todaySchedule} icon={CalendarDays} action={{ label: "הכל", href: "/calendar" }} className="flex-1">
            {todayContent.length === 0 ? (
              <div className="py-10 text-center">
                <p className="text-[11.5px] text-foreground/25 font-medium">{he.dashboard.noContentToday}</p>
              </div>
            ) : (
              <div className="divide-y divide-border/30">
                {todayContent.map(item => (
                  <div key={item.id} className="flex items-center justify-between px-5 py-2.5">
                    <div className="flex items-center gap-2.5">
                      <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: item.color || "#9ca3af" }} />
                      <span className="text-[12.5px] font-semibold text-foreground/80">{item.title}</span>
                    </div>
                    <span className="text-[9.5px] text-foreground/30 bg-foreground/[0.04] rounded-md px-1.5 py-[2px] font-bold tracking-wide">
                      {he.calendar.statuses[item.status as keyof typeof he.calendar.statuses] ?? item.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </Section>
        </motion.div>
      </div>

      {/* ══════════════════════════════════════════════════════
         6. RECENT PROJECTS
         ══════════════════════════════════════════════════════ */}
      {recentProjects.length > 0 && (
        <motion.div variants={fade}>
          <Section title="פרויקטים אחרונים" icon={FolderKanban} action={{ label: "הכל", href: "/projects" }}>
            <div className="divide-y divide-border/30">
              {recentProjects.map(p => (
                <Link key={p.id} href={`/projects/${p.id}`} className="flex items-center justify-between px-5 py-3 hover:bg-foreground/[0.02] transition-colors group">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-foreground/[0.04] shrink-0 group-hover:bg-accent/10 transition-colors">
                      <FolderKanban className="h-3 w-3 text-foreground/25 group-hover:text-accent/70 transition-colors" />
                    </div>
                    <div className="min-w-0">
                      <span className="text-[12.5px] font-semibold block truncate text-foreground/80">{p.title}</span>
                      {p.clientName && <span className="text-[10.5px] text-foreground/30">{p.clientName}</span>}
                    </div>
                  </div>
                  <span className="text-[9.5px] text-foreground/30 bg-foreground/[0.04] rounded-md px-1.5 py-[2px] font-bold shrink-0">{getPhaseLabel(p.phase)}</span>
                </Link>
              ))}
            </div>
          </Section>
        </motion.div>
      )}
    </motion.div>
  );
}
