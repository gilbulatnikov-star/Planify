"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Toaster, toast } from "sonner";
import {
  LayoutDashboard,
  UserPlus,
  FolderKanban,
  CalendarDays,
  TrendingUp,
  Receipt,
  Target,
  Camera,
  Clock,
  AlertTriangle,
  Plus,
  Pencil,
  Trash2,
  Phone,
  ChevronLeft,
  ChevronRight,
  Users,
  Settings,
  FileText,
  Search,
  CheckSquare,
  Mail,
  CircleDollarSign,
  ListTodo,
} from "lucide-react";
import {
  DEMO_STATS,
  DEMO_LEADS,
  DEMO_PROJECTS,
  DEMO_CALENDAR,
  DEMO_CLIENTS,
  DEMO_SCRIPTS,
  DEMO_TASKS,
  DEMO_FINANCIALS,
  DEMO_SMART_STATS,
  DEMO_URGENT,
} from "@/lib/demo-data";

// ─── Constants ────────────────────────────────────────────────────────

type Tab = "dashboard" | "leads" | "projects" | "calendar" | "clients" | "scripts" | "financials" | "tasks";

const TABS: { id: Tab; label: string; icon: typeof LayoutDashboard }[] = [
  { id: "dashboard", label: "דשבורד", icon: LayoutDashboard },
  { id: "leads", label: "לידים", icon: UserPlus },
  { id: "projects", label: "פרויקטים", icon: FolderKanban },
  { id: "calendar", label: "לוח תוכן", icon: CalendarDays },
  { id: "clients", label: "לקוחות", icon: Users },
  { id: "scripts", label: "תסריטים", icon: FileText },
  { id: "financials", label: "כספים", icon: Receipt },
  { id: "tasks", label: "משימות", icon: CheckSquare },
];

const LEAD_STAGES: { key: string; label: string; color: string }[] = [
  { key: "new", label: "חדש", color: "bg-blue-500" },
  { key: "contacted", label: "נוצר קשר", color: "bg-yellow-500" },
  { key: "qualified", label: "מתאים", color: "bg-purple-500" },
  { key: "proposal_sent", label: "הצעת מחיר", color: "bg-orange-500" },
  { key: "won", label: "נסגר", color: "bg-green-500" },
  { key: "lost", label: "אבוד", color: "bg-red-500" },
];

const PHASE_CONFIG: Record<string, { label: string; color: string }> = {
  planning: { label: "תכנון", color: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300" },
  in_progress: { label: "בביצוע", color: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300" },
  review: { label: "בבדיקה", color: "bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300" },
  done: { label: "הושלם", color: "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300" },
};

const CALENDAR_COLORS: Record<string, string> = {
  blue: "bg-blue-500/20 text-blue-700 border-blue-500/30 dark:text-blue-300",
  green: "bg-green-500/20 text-green-700 border-green-500/30 dark:text-green-300",
  amber: "bg-amber-500/20 text-amber-700 border-amber-500/30 dark:text-amber-300",
  violet: "bg-violet-500/20 text-violet-700 border-violet-500/30 dark:text-violet-300",
};

const SIDEBAR_ITEMS: { icon: typeof LayoutDashboard; label: string; tab: Tab }[] = [
  { icon: LayoutDashboard, label: "דשבורד", tab: "dashboard" },
  { icon: FolderKanban, label: "פרויקטים", tab: "projects" },
  { icon: Users, label: "לקוחות", tab: "clients" },
  { icon: UserPlus, label: "לידים", tab: "leads" },
  { icon: Receipt, label: "כספים", tab: "financials" },
  { icon: CalendarDays, label: "לוח תוכן", tab: "calendar" },
  { icon: FileText, label: "תסריטים", tab: "scripts" },
  { icon: CheckSquare, label: "משימות", tab: "tasks" },
];

const INVOICE_STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  paid: { label: "שולם", color: "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300" },
  sent: { label: "נשלח", color: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300" },
  overdue: { label: "באיחור", color: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300" },
};

const PLATFORM_CONFIG: Record<string, { color: string }> = {
  Instagram: { color: "bg-pink-100 text-pink-700 dark:bg-pink-900/40 dark:text-pink-300" },
  YouTube: { color: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300" },
  TikTok: { color: "bg-cyan-100 text-cyan-700 dark:bg-cyan-900/40 dark:text-cyan-300" },
};

// ─── Helpers ──────────────────────────────────────────────────────────

function showSignupToast() {
  toast("הירשם כדי להשתמש בפיצ'ר הזה", {
    action: {
      label: "הרשמה",
      onClick: () => {
        window.location.href = "/sign-up";
      },
    },
  });
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("he-IL", {
    style: "currency",
    currency: "ILS",
    maximumFractionDigits: 0,
  }).format(amount);
}

function formatShortDate(date: Date) {
  return new Intl.DateTimeFormat("he-IL", {
    day: "numeric",
    month: "short",
  }).format(date);
}

function daysFromNow(date: Date) {
  const diff = Math.ceil(
    (date.getTime() - Date.now()) / 86400000
  );
  if (diff === 0) return "היום";
  if (diff === 1) return "מחר";
  if (diff < 0) return `לפני ${Math.abs(diff)} ימים`;
  return `בעוד ${diff} ימים`;
}

// ─── Sub-components ───────────────────────────────────────────────────

function DemoBanner() {
  return (
    <div className="sticky top-0 z-50 bg-gradient-to-r from-[#38b6ff] to-[#0077cc] text-white shadow-lg">
      <div className="mx-auto flex items-center justify-between px-4 py-2.5 max-w-screen-2xl">
        <div className="flex items-center gap-2 text-sm font-medium">
          <Search className="h-4 w-4" />
          <span>מצב הדגמה — הנתונים שמוצגים הם לדוגמה בלבד</span>
        </div>
        <Link
          href="/sign-up"
          className="rounded-full bg-white/20 px-4 py-1.5 text-sm font-semibold backdrop-blur-sm transition-colors hover:bg-white/30"
        >
          הירשם בחינם &larr;
        </Link>
      </div>
    </div>
  );
}

function DemoSidebar({
  activeTab,
  onTabChange,
}: {
  activeTab: Tab;
  onTabChange: (t: Tab) => void;
}) {
  return (
    <aside className="hidden md:flex w-56 shrink-0 flex-col border-l border-border bg-background/50">
      <div className="p-4 border-b border-border">
        <span className="text-xl font-bold bg-gradient-to-l from-[#38b6ff] to-[#0077cc] bg-clip-text text-transparent">
          Planify
        </span>
      </div>
      <nav className="flex-1 p-2 space-y-1">
        {SIDEBAR_ITEMS.map((item) => {
          const isActive = item.tab === activeTab;
          return (
            <button
              key={item.label}
              onClick={() => onTabChange(item.tab)}
              className={`w-full flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all duration-200 text-right ${
                isActive
                  ? "bg-foreground text-background font-medium shadow-sm"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              <item.icon className="h-4 w-4 shrink-0" />
              {item.label}
            </button>
          );
        })}
      </nav>
    </aside>
  );
}

function KpiCard({
  title,
  value,
  icon: Icon,
  onClick,
}: {
  title: string;
  value: string | number;
  icon: typeof TrendingUp;
  onClick?: () => void;
}) {
  return (
    <div
      onClick={onClick}
      className="glass-card group transition-all duration-300 hover:scale-[1.02] cursor-pointer border-r-2 border-r-[#38b6ff] rounded-xl p-4"
    >
      <div className="flex items-center justify-between pb-2">
        <span className="text-sm font-medium text-muted-foreground">
          {title}
        </span>
        <div className="rounded-lg bg-[#38b6ff]/10 p-2 transition-colors duration-300 group-hover:bg-[#38b6ff]/20">
          <Icon className="h-4 w-4 text-[#38b6ff]" />
        </div>
      </div>
      <div className="text-2xl font-bold tracking-tight">{value}</div>
    </div>
  );
}

function DashboardTab({ onTabChange }: { onTabChange: (t: Tab) => void }) {
  const urgentBg: Record<string, string> = {
    lead: "bg-blue-50 dark:bg-blue-900/20",
    deadline: "bg-red-50 dark:bg-red-900/20",
    invoice: "bg-amber-50 dark:bg-amber-900/20",
  };

  const urgentAction: Record<string, { label: string; tab: Tab }> = {
    lead: { label: "צור קשר", tab: "leads" },
    deadline: { label: "צפה בפרויקט", tab: "projects" },
    invoice: { label: "טפל עכשיו", tab: "financials" },
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-foreground">דשבורד</h2>

      {/* KPI Grid */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        <KpiCard
          title="לידים חדשים"
          value={DEMO_SMART_STATS.newLeads}
          icon={UserPlus}
          onClick={() => onTabChange("leads")}
        />
        <KpiCard
          title="ממתינים לטיפול"
          value={DEMO_SMART_STATS.pendingLeads}
          icon={Clock}
          onClick={() => onTabChange("leads")}
        />
        <KpiCard
          title="פרויקטים פעילים"
          value={DEMO_SMART_STATS.activeProjects}
          icon={FolderKanban}
          onClick={() => onTabChange("projects")}
        />
        <KpiCard
          title="משימות היום"
          value={DEMO_SMART_STATS.todayTasks}
          icon={ListTodo}
          onClick={() => onTabChange("tasks")}
        />
        <KpiCard
          title="הכנסות החודש"
          value={formatCurrency(DEMO_SMART_STATS.monthRevenue)}
          icon={TrendingUp}
          onClick={() => onTabChange("financials")}
        />
        <KpiCard
          title="חשבוניות פתוחות"
          value={DEMO_SMART_STATS.openInvoices}
          icon={Receipt}
          onClick={() => onTabChange("financials")}
        />
      </div>

      {/* Requires Attention */}
      <div className="glass-card rounded-xl p-5">
        <h3 className="text-base font-semibold mb-3 flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 text-amber-500" />
          דורש טיפול
        </h3>
        <div className="space-y-3">
          {DEMO_URGENT.map((item, i) => (
            <div
              key={i}
              className={`flex items-center justify-between rounded-lg px-4 py-3 ${urgentBg[item.type] ?? "bg-muted/30"}`}
            >
              <div>
                <p className="text-sm font-medium">{item.name}</p>
                <p className="text-xs text-muted-foreground">{item.detail}</p>
              </div>
              <button
                onClick={() => onTabChange(urgentAction[item.type]?.tab ?? "dashboard")}
                className="text-xs text-[#38b6ff] hover:underline whitespace-nowrap"
              >
                {urgentAction[item.type]?.label ?? "טפל עכשיו"}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function LeadsTab() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-foreground">לידים</h2>
        <button
          onClick={showSignupToast}
          className="flex items-center gap-1.5 rounded-lg bg-[#38b6ff] px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-[#0077cc]"
        >
          <Plus className="h-4 w-4" />
          ליד חדש
        </button>
      </div>

      {/* Kanban */}
      <div className="flex gap-4 overflow-x-auto pb-4">
        {LEAD_STAGES.map((stage) => {
          const leads = DEMO_LEADS.filter((l) => l.leadStatus === stage.key);
          return (
            <div
              key={stage.key}
              className="min-w-[220px] flex-1 rounded-xl bg-muted/40 dark:bg-muted/20 p-3"
            >
              <div className="flex items-center gap-2 mb-3">
                <div className={`h-2.5 w-2.5 rounded-full ${stage.color}`} />
                <span className="text-sm font-semibold">{stage.label}</span>
                <span className="mr-auto rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                  {leads.length}
                </span>
              </div>
              <div className="space-y-2">
                {leads.map((lead) => (
                  <div
                    key={lead.id}
                    onClick={showSignupToast}
                    className="glass-card rounded-lg p-3 cursor-pointer transition-all hover:scale-[1.02]"
                  >
                    <p className="text-sm font-medium">{lead.name}</p>
                    <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                      <Phone className="h-3 w-3" />
                      {lead.phone}
                    </p>
                    <div className="flex items-center gap-1 mt-2 flex-wrap">
                      {lead.tags.map((tag) => (
                        <span
                          key={tag}
                          className="rounded-full bg-[#38b6ff]/10 px-2 py-0.5 text-[10px] text-[#38b6ff] font-medium"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                    {lead.interactions.length > 0 && (
                      <p className="text-[10px] text-muted-foreground mt-2 truncate">
                        {lead.interactions[0].summary}
                      </p>
                    )}
                  </div>
                ))}
                {leads.length === 0 && (
                  <p className="text-xs text-muted-foreground text-center py-4">
                    אין לידים
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function ProjectsTab() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-foreground">פרויקטים</h2>
        <button
          onClick={showSignupToast}
          className="flex items-center gap-1.5 rounded-lg bg-[#38b6ff] px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-[#0077cc]"
        >
          <Plus className="h-4 w-4" />
          פרויקט חדש
        </button>
      </div>

      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
        {DEMO_PROJECTS.map((project) => {
          const phase = PHASE_CONFIG[project.phase] ?? {
            label: project.phase,
            color: "bg-gray-100 text-gray-700",
          };
          const progress =
            project.tasks.total > 0
              ? Math.round(
                  (project.tasks.completed / project.tasks.total) * 100
                )
              : 0;

          return (
            <div
              key={project.id}
              onClick={showSignupToast}
              className="glass-card rounded-xl p-5 cursor-pointer transition-all hover:scale-[1.02]"
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="text-sm font-semibold">{project.title}</h3>
                  <p className="text-xs text-muted-foreground">
                    {project.client}
                  </p>
                </div>
                <span
                  className={`rounded-full px-2.5 py-0.5 text-[10px] font-medium ${phase.color}`}
                >
                  {phase.label}
                </span>
              </div>

              <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
                <span>{formatCurrency(project.budget)}</span>
                {project.shootDate && (
                  <span>{daysFromNow(project.shootDate)}</span>
                )}
              </div>

              {/* Progress bar */}
              <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full rounded-full bg-[#38b6ff] transition-all"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="text-[10px] text-muted-foreground mt-1.5">
                {project.tasks.completed}/{project.tasks.total} משימות הושלמו
              </p>

              {/* Action buttons */}
              <div className="flex gap-2 mt-3 pt-3 border-t border-border">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    showSignupToast();
                  }}
                  className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
                >
                  <Pencil className="h-3 w-3" /> ערוך
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    showSignupToast();
                  }}
                  className="flex items-center gap-1 text-xs text-muted-foreground hover:text-destructive transition-colors"
                >
                  <Trash2 className="h-3 w-3" /> מחק
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function CalendarTab() {
  const [monthOffset, setMonthOffset] = useState(0);

  const { year, month, weeks, monthName } = useMemo(() => {
    const now = new Date();
    const d = new Date(now.getFullYear(), now.getMonth() + monthOffset, 1);
    const y = d.getFullYear();
    const m = d.getMonth();

    const name = new Intl.DateTimeFormat("he-IL", {
      month: "long",
      year: "numeric",
    }).format(d);

    // Build weeks grid (Sun=0 for standard calendar)
    const firstDay = new Date(y, m, 1).getDay();
    const daysInMonth = new Date(y, m + 1, 0).getDate();

    const grid: (number | null)[][] = [];
    let week: (number | null)[] = [];
    for (let i = 0; i < firstDay; i++) week.push(null);
    for (let day = 1; day <= daysInMonth; day++) {
      week.push(day);
      if (week.length === 7) {
        grid.push(week);
        week = [];
      }
    }
    if (week.length > 0) {
      while (week.length < 7) week.push(null);
      grid.push(week);
    }

    return { year: y, month: m, weeks: grid, monthName: name };
  }, [monthOffset]);

  const eventsForDay = (day: number) => {
    return DEMO_CALENDAR.filter((ev) => {
      const evDate = new Date(ev.date);
      return (
        evDate.getFullYear() === year &&
        evDate.getMonth() === month &&
        evDate.getDate() === day
      );
    });
  };

  const today = new Date();
  const isToday = (day: number) =>
    today.getFullYear() === year &&
    today.getMonth() === month &&
    today.getDate() === day;

  const DAY_NAMES = ["א׳", "ב׳", "ג׳", "ד׳", "ה׳", "ו׳", "ש׳"];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-foreground">לוח תוכן</h2>
        <button
          onClick={showSignupToast}
          className="flex items-center gap-1.5 rounded-lg bg-[#38b6ff] px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-[#0077cc]"
        >
          <Plus className="h-4 w-4" />
          אירוע חדש
        </button>
      </div>

      {/* Month navigation */}
      <div className="flex items-center justify-between glass-card rounded-xl p-3">
        <button
          onClick={() => setMonthOffset((o) => o + 1)}
          className="rounded-lg p-1.5 hover:bg-muted transition-colors"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
        <span className="text-sm font-semibold">{monthName}</span>
        <button
          onClick={() => setMonthOffset((o) => o - 1)}
          className="rounded-lg p-1.5 hover:bg-muted transition-colors"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
      </div>

      {/* Calendar grid */}
      <div className="glass-card rounded-xl overflow-hidden">
        {/* Day headers */}
        <div className="grid grid-cols-7 border-b border-border">
          {DAY_NAMES.map((d) => (
            <div
              key={d}
              className="py-2 text-center text-xs font-medium text-muted-foreground"
            >
              {d}
            </div>
          ))}
        </div>

        {/* Weeks */}
        {weeks.map((week, wi) => (
          <div key={wi} className="grid grid-cols-7 border-b border-border last:border-b-0">
            {week.map((day, di) => (
              <div
                key={di}
                className={`min-h-[80px] p-1.5 border-l border-border last:border-l-0 ${
                  day === null ? "bg-muted/20" : ""
                }`}
              >
                {day !== null && (
                  <>
                    <span
                      className={`inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-medium ${
                        isToday(day)
                          ? "bg-[#38b6ff] text-white"
                          : "text-foreground"
                      }`}
                    >
                      {day}
                    </span>
                    <div className="space-y-0.5 mt-1">
                      {eventsForDay(day).map((ev) => (
                        <button
                          key={ev.id}
                          onClick={showSignupToast}
                          className={`w-full truncate rounded px-1 py-0.5 text-[10px] font-medium border text-right ${
                            CALENDAR_COLORS[ev.color] ?? CALENDAR_COLORS.blue
                          }`}
                        >
                          {ev.title}
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        ))}
      </div>

      {/* Upcoming events list */}
      <div className="glass-card rounded-xl p-5">
        <h3 className="text-base font-semibold mb-3">אירועים קרובים</h3>
        <div className="space-y-2">
          {DEMO_CALENDAR.map((ev) => (
            <div
              key={ev.id}
              onClick={showSignupToast}
              className="flex items-center justify-between rounded-lg bg-muted/30 px-4 py-3 cursor-pointer hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div
                  className={`h-3 w-3 rounded-full ${
                    ev.color === "blue"
                      ? "bg-blue-500"
                      : ev.color === "green"
                      ? "bg-green-500"
                      : ev.color === "amber"
                      ? "bg-amber-500"
                      : "bg-violet-500"
                  }`}
                />
                <span className="text-sm font-medium">{ev.title}</span>
              </div>
              <span className="text-xs text-muted-foreground">
                {formatShortDate(ev.date)} &middot; {daysFromNow(ev.date)}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ClientsTab() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-foreground">לקוחות</h2>
        <button
          onClick={showSignupToast}
          className="flex items-center gap-1.5 rounded-lg bg-[#38b6ff] px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-[#0077cc]"
        >
          <Plus className="h-4 w-4" />
          לקוח חדש
        </button>
      </div>

      <div className="glass-card rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="text-right px-4 py-3 font-medium text-muted-foreground">שם</th>
                <th className="text-right px-4 py-3 font-medium text-muted-foreground">אימייל</th>
                <th className="text-right px-4 py-3 font-medium text-muted-foreground">טלפון</th>
                <th className="text-right px-4 py-3 font-medium text-muted-foreground">סטטוס</th>
                <th className="text-right px-4 py-3 font-medium text-muted-foreground">פעולות</th>
              </tr>
            </thead>
            <tbody>
              {DEMO_CLIENTS.map((client) => (
                <tr
                  key={client.id}
                  className="border-b border-border last:border-b-0 hover:bg-muted/20 transition-colors"
                >
                  <td className="px-4 py-3 font-medium">{client.name}</td>
                  <td className="px-4 py-3 text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Mail className="h-3 w-3" />
                      {client.email}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Phone className="h-3 w-3" />
                      {client.phone}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-[10px] font-medium ${
                        client.isActive
                          ? "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300"
                          : "bg-gray-100 text-gray-600 dark:bg-gray-800/40 dark:text-gray-400"
                      }`}
                    >
                      {client.isActive ? "פעיל" : "לא פעיל"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button
                        onClick={showSignupToast}
                        className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
                      >
                        <Pencil className="h-3 w-3" /> ערוך
                      </button>
                      <button
                        onClick={showSignupToast}
                        className="flex items-center gap-1 text-xs text-muted-foreground hover:text-destructive transition-colors"
                      >
                        <Trash2 className="h-3 w-3" /> מחק
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function ScriptsTab() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-foreground">תסריטים</h2>
        <button
          onClick={showSignupToast}
          className="flex items-center gap-1.5 rounded-lg bg-[#38b6ff] px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-[#0077cc]"
        >
          <Plus className="h-4 w-4" />
          תסריט חדש
        </button>
      </div>

      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        {DEMO_SCRIPTS.map((script) => {
          const platform = PLATFORM_CONFIG[script.platform] ?? {
            color: "bg-gray-100 text-gray-700 dark:bg-gray-800/40 dark:text-gray-300",
          };
          return (
            <div
              key={script.id}
              onClick={showSignupToast}
              className="glass-card rounded-xl p-5 cursor-pointer transition-all hover:scale-[1.02]"
            >
              <div className="flex items-start justify-between mb-3">
                <h3 className="text-sm font-semibold">{script.title}</h3>
                <span
                  className={`rounded-full px-2.5 py-0.5 text-[10px] font-medium ${platform.color}`}
                >
                  {script.platform}
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                עודכן {formatShortDate(script.updatedAt)}
              </p>
              <div className="flex gap-2 mt-3 pt-3 border-t border-border">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    showSignupToast();
                  }}
                  className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
                >
                  <Pencil className="h-3 w-3" /> ערוך
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    showSignupToast();
                  }}
                  className="flex items-center gap-1 text-xs text-muted-foreground hover:text-destructive transition-colors"
                >
                  <Trash2 className="h-3 w-3" /> מחק
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function FinancialsTab() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-foreground">כספים</h2>
        <button
          onClick={showSignupToast}
          className="flex items-center gap-1.5 rounded-lg bg-[#38b6ff] px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-[#0077cc]"
        >
          <Plus className="h-4 w-4" />
          חשבונית חדשה
        </button>
      </div>

      {/* Financial stat cards */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-3">
        <div className="glass-card rounded-xl p-4 border-r-2 border-r-green-500">
          <div className="flex items-center justify-between pb-2">
            <span className="text-sm font-medium text-muted-foreground">הכנסות החודש</span>
            <div className="rounded-lg bg-green-500/10 p-2">
              <TrendingUp className="h-4 w-4 text-green-500" />
            </div>
          </div>
          <div className="text-2xl font-bold tracking-tight">{formatCurrency(DEMO_FINANCIALS.monthlyRevenue)}</div>
        </div>
        <div className="glass-card rounded-xl p-4 border-r-2 border-r-amber-500">
          <div className="flex items-center justify-between pb-2">
            <span className="text-sm font-medium text-muted-foreground">חשבוניות ממתינות</span>
            <div className="rounded-lg bg-amber-500/10 p-2">
              <Receipt className="h-4 w-4 text-amber-500" />
            </div>
          </div>
          <div className="text-2xl font-bold tracking-tight">{DEMO_FINANCIALS.pendingInvoices}</div>
        </div>
        <div className="glass-card rounded-xl p-4 border-r-2 border-r-red-500">
          <div className="flex items-center justify-between pb-2">
            <span className="text-sm font-medium text-muted-foreground">הוצאות</span>
            <div className="rounded-lg bg-red-500/10 p-2">
              <CircleDollarSign className="h-4 w-4 text-red-500" />
            </div>
          </div>
          <div className="text-2xl font-bold tracking-tight">{formatCurrency(DEMO_FINANCIALS.totalExpenses)}</div>
        </div>
      </div>

      {/* Invoice table */}
      <div className="glass-card rounded-xl overflow-hidden">
        <div className="px-5 py-3 border-b border-border">
          <h3 className="text-base font-semibold">חשבוניות</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="text-right px-4 py-3 font-medium text-muted-foreground">מספר</th>
                <th className="text-right px-4 py-3 font-medium text-muted-foreground">לקוח</th>
                <th className="text-right px-4 py-3 font-medium text-muted-foreground">סכום</th>
                <th className="text-right px-4 py-3 font-medium text-muted-foreground">סטטוס</th>
                <th className="text-right px-4 py-3 font-medium text-muted-foreground">פעולות</th>
              </tr>
            </thead>
            <tbody>
              {DEMO_FINANCIALS.invoices.map((inv) => {
                const statusCfg = INVOICE_STATUS_CONFIG[inv.status] ?? {
                  label: inv.status,
                  color: "bg-gray-100 text-gray-700",
                };
                return (
                  <tr
                    key={inv.id}
                    className="border-b border-border last:border-b-0 hover:bg-muted/20 transition-colors"
                  >
                    <td className="px-4 py-3 font-medium">{inv.number}</td>
                    <td className="px-4 py-3 text-muted-foreground">{inv.client}</td>
                    <td className="px-4 py-3 font-medium">{formatCurrency(inv.total)}</td>
                    <td className="px-4 py-3">
                      <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-medium ${statusCfg.color}`}>
                        {statusCfg.label}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={showSignupToast}
                        className="flex items-center gap-1 text-xs text-[#38b6ff] hover:underline"
                      >
                        צפה
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function TasksTab() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-foreground">משימות</h2>
        <button
          onClick={showSignupToast}
          className="flex items-center gap-1.5 rounded-lg bg-[#38b6ff] px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-[#0077cc]"
        >
          <Plus className="h-4 w-4" />
          משימה חדשה
        </button>
      </div>

      <div className="glass-card rounded-xl p-5">
        <div className="space-y-2">
          {DEMO_TASKS.map((task) => (
            <div
              key={task.id}
              className="flex items-center gap-3 rounded-lg px-4 py-3 hover:bg-muted/30 transition-colors"
            >
              <button
                onClick={showSignupToast}
                className={`flex h-5 w-5 shrink-0 items-center justify-center rounded border-2 transition-colors ${
                  task.completed
                    ? "border-green-500 bg-green-500 text-white"
                    : "border-muted-foreground/30 hover:border-[#38b6ff]"
                }`}
              >
                {task.completed && (
                  <svg
                    className="h-3 w-3"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={3}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </button>
              <span
                className={`text-sm ${
                  task.completed
                    ? "line-through text-muted-foreground"
                    : "text-foreground"
                }`}
              >
                {task.text}
              </span>
              <button
                onClick={showSignupToast}
                className="mr-auto flex items-center gap-1 text-xs text-muted-foreground hover:text-destructive transition-colors"
              >
                <Trash2 className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Main Demo Page ───────────────────────────────────────────────────

export default function DemoPage() {
  const [activeTab, setActiveTab] = useState<Tab>("dashboard");

  return (
    <div dir="rtl" className="min-h-screen bg-background text-foreground">
      <Toaster position="top-center" richColors dir="rtl" />
      <DemoBanner />

      <div className="flex min-h-[calc(100vh-44px)]">
        {/* Sidebar (desktop) */}
        <DemoSidebar activeTab={activeTab} onTabChange={setActiveTab} />

        {/* Main content area */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Mobile tab bar */}
          <div className="md:hidden flex border-b border-border bg-background/80 backdrop-blur-sm sticky top-[44px] z-40 overflow-x-auto">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 px-4 py-3 text-sm font-medium whitespace-nowrap transition-colors border-b-2 ${
                  activeTab === tab.id
                    ? "border-[#38b6ff] text-[#38b6ff]"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                <tab.icon className="h-4 w-4" />
                {tab.label}
              </button>
            ))}
          </div>

          {/* Page content */}
          <main className="flex-1 p-4 md:p-8 max-w-screen-xl">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.2 }}
              >
                {activeTab === "dashboard" && <DashboardTab onTabChange={setActiveTab} />}
                {activeTab === "leads" && <LeadsTab />}
                {activeTab === "projects" && <ProjectsTab />}
                {activeTab === "calendar" && <CalendarTab />}
                {activeTab === "clients" && <ClientsTab />}
                {activeTab === "scripts" && <ScriptsTab />}
                {activeTab === "financials" && <FinancialsTab />}
                {activeTab === "tasks" && <TasksTab />}
              </motion.div>
            </AnimatePresence>
          </main>

          {/* Bottom CTA (mobile) */}
          <div className="md:hidden sticky bottom-0 z-40 border-t border-border bg-background/80 backdrop-blur-sm p-3">
            <Link
              href="/sign-up"
              className="block w-full rounded-xl bg-gradient-to-r from-[#38b6ff] to-[#0077cc] py-3 text-center text-sm font-semibold text-white transition-opacity hover:opacity-90"
            >
              הירשם בחינם ונסה את Planify
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
