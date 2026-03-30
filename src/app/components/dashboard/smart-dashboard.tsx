"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import {
  Users, FolderKanban, CheckSquare, DollarSign, FileText,
  AlertTriangle, CalendarDays, Plus, Clock, ChevronLeft,
  ArrowUpRight, Sparkles, UserPlus, Scan, Receipt,
  Contact, BarChart3, FileBarChart2, LayoutTemplate, Zap,
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

/* ── Primary Action Card — 2×2 banking grid ── */
function PrimaryAction({ label, href, icon: Icon }: {
  label: string; href: string; icon: React.ElementType;
}) {
  return (
    <Link
      href={href}
      className="group flex flex-col items-center justify-center gap-3 bg-card px-4 py-6 hover:bg-[#2563eb]/[0.025] dark:hover:bg-[#2563eb]/[0.06] transition-colors"
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-[14px] bg-[#2563eb]/[0.07] dark:bg-[#2563eb]/[0.12] group-hover:bg-[#2563eb]/[0.13] dark:group-hover:bg-[#2563eb]/[0.20] transition-colors">
        <Icon className="h-[22px] w-[22px] text-[#2563eb]/75 dark:text-blue-400/80 group-hover:text-[#2563eb] dark:group-hover:text-blue-400 transition-colors" strokeWidth={1.7} />
      </div>
      <span className="text-[13px] font-semibold text-foreground/60 group-hover:text-foreground/85 transition-colors text-center leading-tight">
        {label}
      </span>
    </Link>
  );
}

/* ── All Actions Row ── */
function ActionRow({ label, href, icon: Icon, sub }: {
  label: string; href: string; icon: React.ElementType; sub?: string;
}) {
  return (
    <Link
      href={href}
      className="group flex items-center gap-4 px-5 py-3.5 hover:bg-foreground/[0.025] transition-colors"
    >
      <div className="flex h-9 w-9 items-center justify-center rounded-[10px] bg-foreground/[0.04] group-hover:bg-[#2563eb]/[0.07] transition-colors shrink-0">
        <Icon className="h-[18px] w-[18px] text-foreground/35 group-hover:text-[#2563eb]/80 transition-colors" strokeWidth={1.8} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[13.5px] font-semibold text-foreground/75 group-hover:text-foreground/90 transition-colors">{label}</p>
        {sub && <p className="text-[11px] text-foreground/30 mt-px leading-tight">{sub}</p>}
      </div>
      <ChevronLeft className="h-4 w-4 text-foreground/20 group-hover:text-[#2563eb]/50 transition-colors shrink-0" />
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
         2. PRIMARY ACTIONS — 2×2 banking-app grid
         ══════════════════════════════════════════════════════ */}
      <motion.div variants={fade}>
        <div className="rounded-2xl border border-border/40 overflow-hidden bg-card shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
          {/* Section header */}
          <div className="flex items-center gap-2 px-5 py-3 border-b border-border/30">
            <Zap className="h-3.5 w-3.5 text-foreground/20" strokeWidth={2} />
            <h2 className="text-[10.5px] font-bold tracking-[0.1em] uppercase text-foreground/40">פעולות מהירות</h2>
          </div>
          {/* 2×2 grid with separator lines */}
          <div className="grid grid-cols-2 divide-x divide-y divide-border/30 rtl:divide-x-reverse">
            <PrimaryAction label="פרויקט חדש" href="/projects" icon={FolderKanban} />
            <PrimaryAction label="חשבונית חדשה" href="/financials" icon={Receipt} />
            <PrimaryAction label="לקוח חדש" href="/clients" icon={UserPlus} />
            <PrimaryAction label="סריקת מסמך" href="/financials" icon={Scan} />
          </div>
        </div>
      </motion.div>

      {/* ══════════════════════════════════════════════════════
         3. ALL ACTIONS — structured navigation list
         ══════════════════════════════════════════════════════ */}
      <motion.div variants={fade}>
        <div className="rounded-2xl border border-border/40 overflow-hidden bg-card shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
          <div className="flex items-center gap-2 px-5 py-3 border-b border-border/30">
            <Plus className="h-3.5 w-3.5 text-foreground/20" strokeWidth={2} />
            <h2 className="text-[10.5px] font-bold tracking-[0.1em] uppercase text-foreground/40">כל הפעולות</h2>
          </div>
          <div className="divide-y divide-border/25">
            <ActionRow label="פרויקטים" href="/projects" icon={FolderKanban} sub="ניהול פרויקטים ולוחות זמנים" />
            <ActionRow label="לקוחות" href="/clients" icon={Users} sub="ספר לקוחות ואנשי קשר" />
            <ActionRow label="ניהול פיננסי" href="/financials" icon={FileBarChart2} sub="חשבוניות, הצעות מחיר ותשלומים" />
            <ActionRow label="לוח שנה" href="/calendar" icon={CalendarDays} sub="תכנון תוכן ולוח זמנים" />
            <ActionRow label="משימות" href="/tasks" icon={CheckSquare} sub="מעקב משימות ותזכורות" />
            <ActionRow label="תסריטים" href="/scripts" icon={FileText} sub="כתיבה ועריכת תסריטים" />
            <ActionRow label="דוחות" href="/reports" icon={BarChart3} sub="נתונים עסקיים וסיכומים חודשיים" />
          </div>
        </div>
      </motion.div>

      {/* ══════════════════════════════════════════════════════
         4. KPI SUMMARY — uniform cards, financial-first order
         ══════════════════════════════════════════════════════ */}
      <motion.div variants={fade} className="grid gap-2.5 grid-cols-2 lg:grid-cols-5">
        {kpiData.map((kpi) => (
          <KpiCard key={kpi.label} {...kpi} />
        ))}
      </motion.div>

      {/* ══════════════════════════════════════════════════════
         5. ALERTS — urgent items (if any)
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
         6. MAIN CONTENT — two-column layout
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
         7. RECENT PROJECTS
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
