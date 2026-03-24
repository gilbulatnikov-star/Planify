"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addDays,
  addMonths,
  subMonths,
  isSameMonth,
  isSameDay,
  isToday,
} from "date-fns";

import { he as heLocale } from "date-fns/locale";
import {
  ChevronRight,
  ChevronLeft,
  Plus,
  Trash2,
  Globe,
  User,
  Download,
  CalendarPlus,
  ChevronDown,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ContentDialog } from "./content-dialog";
import { DeleteContentDialog } from "./delete-content-dialog";
import { CalendarExportStudio } from "./calendar-export-studio";
import { useT } from "@/lib/i18n";

// ─── Types ─────────────────────────────────────────────────────────────────────

type ContentItem = {
  id: string;
  title: string;
  date: Date;
  contentType: string;
  status: string;
  clientId: string | null;
  projectId: string | null;
  notes: string | null;
  color?: string | null;
  client: { id: string; name: string } | null;
  project: { id: string; title: string } | null;
};

// ─── Color map ─────────────────────────────────────────────────────────────────

const COLOR_MAP: Record<string, { bg: string; text: string; dot: string; border: string }> = {
  gray:   { bg: "bg-muted",    text: "text-foreground",    dot: "bg-muted0",    border: "border-border"   },
  blue:   { bg: "bg-blue-100",    text: "text-blue-800",    dot: "bg-blue-500",    border: "border-blue-300"   },
  violet: { bg: "bg-violet-100",  text: "text-violet-800",  dot: "bg-violet-500",  border: "border-violet-300" },
  green:  { bg: "bg-emerald-100", text: "text-emerald-800", dot: "bg-emerald-500", border: "border-emerald-300"},
  red:    { bg: "bg-red-100",     text: "text-red-800",     dot: "bg-red-500",     border: "border-red-300"    },
  orange: { bg: "bg-orange-100",  text: "text-orange-800",  dot: "bg-orange-500",  border: "border-orange-300" },
  yellow: { bg: "bg-yellow-100",  text: "text-yellow-800",  dot: "bg-yellow-500",  border: "border-yellow-300" },
  pink:   { bg: "bg-pink-100",    text: "text-pink-800",    dot: "bg-pink-500",    border: "border-pink-300"   },
};

function getColor(color?: string | null) {
  return COLOR_MAP[color ?? "gray"] ?? COLOR_MAP.gray;
}

/* dayNames is built from i18n inside the component */

const stagger = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.03, delayChildren: 0.02 } },
};
const fadeUp = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: "easeOut" as const } },
};

// ─── Component ─────────────────────────────────────────────────────────────────

export function CalendarPageClient({
  content,
  clients,
  projects,
  initialMonth,
  activeClientId,
  boardId,
  boardTitle,
}: {
  content: ContentItem[];
  clients: { id: string; name: string }[];
  projects: { id: string; title: string }[];
  initialMonth: string;
  activeClientId: string | null;
  activeClientName: string | null;
  boardId?: string;
  boardTitle?: string;
}) {
  const he = useT();
  const dayNames = he.calendar.dayNames as unknown as string[];
  const router = useRouter();
  const [currentMonth, setCurrentMonth] = useState(new Date(initialMonth));
  const [selectedClientId, setSelectedClientId] = useState<string | null>(activeClientId);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingContent, setEditingContent] = useState<ContentItem | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [exportStudioOpen, setExportStudioOpen] = useState(false);
  const [calendarPopoverOpen, setCalendarPopoverOpen] = useState(false);
  const [clientMenuOpen, setClientMenuOpen] = useState(false);

  const isIsolated = !!selectedClientId;
  const selectedClientName = selectedClientId
    ? clients.find((c) => c.id === selectedClientId)?.name ?? null
    : null;

  const basePath = boardId ? `/calendar/${boardId}` : "/calendar";

  function buildUrl(overrides: { month?: string; clientId?: string | null }) {
    const monthStr = overrides.month ?? format(currentMonth, "yyyy-MM");
    const clientStr = overrides.clientId !== undefined ? overrides.clientId : selectedClientId;
    const params = new URLSearchParams();
    params.set("month", monthStr);
    if (clientStr) params.set("clientId", clientStr);
    return `${basePath}?${params.toString()}`;
  }

  function navigateMonth(direction: "prev" | "next") {
    const newMonth = direction === "prev" ? subMonths(currentMonth, 1) : addMonths(currentMonth, 1);
    setCurrentMonth(newMonth);
    router.push(buildUrl({ month: format(newMonth, "yyyy-MM") }));
    router.refresh();
  }

  function handleClientSwitch(clientId: string | null) {
    setSelectedClientId(clientId);
    router.replace(buildUrl({ clientId }));
  }

  function handleDayClick(day: Date) {
    setEditingContent(null);
    setSelectedDate(format(day, "yyyy-MM-dd"));
    setDialogOpen(true);
  }

  function handleEditContent(item: ContentItem) {
    setEditingContent(item);
    setSelectedDate("");
    setDialogOpen(true);
  }

  function handleCreateNew() {
    setEditingContent(null);
    setSelectedDate(format(new Date(), "yyyy-MM-dd"));
    setDialogOpen(true);
  }

  function buildGCalUrl(item: ContentItem) {
    const fmt = (dt: Date) => dt.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
    const d = new Date(item.date);
    d.setHours(12, 0, 0, 0);
    const end = new Date(d.getTime() + 3600000);
    const details = [item.client?.name ? `${he.calendarPage.clientPrefix}: ${item.client.name}` : "", item.contentType, item.notes ?? ""]
      .filter(Boolean).join(" | ");
    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(item.title)}&dates=${fmt(d)}/${fmt(end)}&details=${encodeURIComponent(details)}&sf=true&output=xml`;
  }

  const visibleItems = content.filter((item) => !selectedClientId || item.clientId === selectedClientId);

  // Calendar grid
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const calStart = startOfWeek(monthStart);
  const calEnd = endOfWeek(monthEnd);
  const weeks: Date[][] = [];
  let day = calStart;
  while (day <= calEnd) {
    const week: Date[] = [];
    for (let i = 0; i < 7; i++) { week.push(day); day = addDays(day, 1); }
    weeks.push(week);
  }

  function getContentForDay(day: Date) {
    return content.filter((item) => {
      if (!isSameDay(new Date(item.date), day)) return false;
      if (selectedClientId && item.clientId !== selectedClientId) return false;
      return true;
    });
  }

  // Events for current month (for mobile list)
  const monthEvents = visibleItems
    .filter((item) => isSameMonth(new Date(item.date), currentMonth))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  return (
    <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-5">

      {/* ── Header ── */}
      {boardId && (
        <motion.div variants={fadeUp}>
          <button onClick={() => router.push("/calendar")} className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
            <ChevronRight className="h-4 w-4" />
            {he.common.backToBoards ?? "חזרה ללוחות"}
          </button>
        </motion.div>
      )}
      <motion.div variants={fadeUp} className="flex flex-wrap items-center gap-2 justify-between">
        <h1 className="text-2xl font-bold text-foreground">{boardTitle ?? he.calendar.title}</h1>

        <div className="flex flex-wrap items-center gap-2">
          {/* Client selector */}
          <div className="relative">
            {clientMenuOpen && <div className="fixed inset-0 z-40" onClick={() => setClientMenuOpen(false)} />}
            <button
              onClick={() => setClientMenuOpen((v) => !v)}
              className="flex items-center gap-1.5 rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground hover:bg-muted transition-colors shadow-sm"
            >
              {isIsolated
                ? <><User className="h-3.5 w-3.5 text-muted-foreground" /><span className="hidden sm:inline">{selectedClientName}</span></>
                : <><Globe className="h-3.5 w-3.5 text-muted-foreground" /><span className="hidden sm:inline">{he.calendarPage.selectClient}</span></>
              }
              <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
            </button>
            {clientMenuOpen && (
              <div className="absolute left-0 top-full z-50 mt-1 min-w-[180px] rounded-xl border border-border bg-popover py-1.5 shadow-xl">
                <button
                  onClick={() => { handleClientSwitch(null); setClientMenuOpen(false); }}
                  className={`flex w-full items-center gap-2 px-3 py-2 text-sm hover:bg-muted ${!isIsolated ? "font-semibold text-foreground" : "text-muted-foreground"}`}
                >
                  <Globe className="h-3.5 w-3.5 text-muted-foreground" />{he.common.allClients}
                </button>
                {clients.length > 0 && <div className="mx-3 my-1 border-t border-border" />}
                {clients.map((client) => (
                  <button
                    key={client.id}
                    onClick={() => { handleClientSwitch(client.id); setClientMenuOpen(false); }}
                    className={`flex w-full items-center gap-2 px-3 py-2 text-sm hover:bg-muted ${selectedClientId === client.id ? "font-semibold text-foreground" : "text-muted-foreground"}`}
                  >
                    <User className="h-3.5 w-3.5 text-muted-foreground" />{client.name}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Google Calendar popover */}
          <div className="relative">
            <button
              onClick={() => setCalendarPopoverOpen((v) => !v)}
              className="flex items-center gap-1.5 rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground hover:bg-muted transition-colors shadow-sm"
            >
              <CalendarPlus className="h-4 w-4 text-blue-500" />
              <span className="hidden sm:inline">{he.calendarPage.addToGCal}</span>
              <ChevronDown className="h-3 w-3 text-muted-foreground" />
            </button>
            {calendarPopoverOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setCalendarPopoverOpen(false)} />
                <div className="absolute left-0 top-full z-50 mt-1 w-72 rounded-xl border border-border bg-popover shadow-lg overflow-hidden">
                  <div className="px-3 py-2 border-b border-border">
                    <p className="text-xs font-semibold text-muted-foreground">{he.calendarPage.selectEventForGCal}</p>
                  </div>
                  {visibleItems.length === 0 ? (
                    <p className="px-3 py-3 text-xs text-muted-foreground">{he.calendarPage.noEventsInView}</p>
                  ) : (
                    <div className="max-h-64 overflow-y-auto py-1">
                      {visibleItems.map((item) => (
                        <a
                          key={item.id}
                          href={buildGCalUrl(item)}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={() => setCalendarPopoverOpen(false)}
                          className="flex items-center gap-2 px-3 py-2 text-sm text-foreground hover:bg-muted transition-colors"
                        >
                          <CalendarPlus className="h-3.5 w-3.5 text-blue-400 shrink-0" />
                          <span className="flex-1 truncate">{item.title}</span>
                          <span className="text-xs text-muted-foreground shrink-0">{format(new Date(item.date), "d/M")}</span>
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}
          </div>

          {/* Export */}
          <button
            onClick={() => setExportStudioOpen(true)}
            className="flex items-center gap-1.5 rounded-lg bg-foreground text-background px-3 py-2 text-sm font-medium hover:bg-foreground/90 transition-colors shadow-sm"
          >
            <Download className="h-4 w-4" />
            <span className="hidden sm:inline">{he.calendarPage.exportLabel}</span>
          </button>

          <Button
            size="sm"
            onClick={handleCreateNew}
            className="bg-foreground text-background hover:bg-foreground/90 shadow-sm transition-all duration-200 border-0"
          >
            <Plus className="h-4 w-4 me-1 sm:me-2" />
            <span className="hidden sm:inline">{he.calendar.newContent}</span>
            <span className="sm:hidden">{he.calendarPage.newShort}</span>
          </Button>
        </div>
      </motion.div>

      {/* ── Month navigation ── */}
      <motion.div variants={fadeUp} className="flex items-center justify-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigateMonth("next")} className="hover:bg-muted h-8 w-8">
          <ChevronRight className="h-4 w-4" />
        </Button>
        <h2 className="text-lg font-semibold min-w-[160px] text-center">
          {format(currentMonth, "MMMM yyyy", { locale: heLocale })}
        </h2>
        <Button variant="ghost" size="icon" onClick={() => navigateMonth("prev")} className="hover:bg-muted h-8 w-8">
          <ChevronLeft className="h-4 w-4" />
        </Button>
      </motion.div>

      {/* ── Calendar grid — horizontal scroll on mobile ── */}
      <motion.div variants={fadeUp}>
        <Card className="glass-card overflow-hidden">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <div className="min-w-[700px]">
                {/* Day headers */}
                <div className="grid grid-cols-7 border-b border-border">
                  {dayNames.map((name) => (
                    <div key={name} className="py-2.5 text-center text-xs font-semibold text-muted-foreground">
                      {name}
                    </div>
                  ))}
                </div>

                {/* Weeks */}
                {weeks.map((week, wi) => (
                  <div key={wi} className="grid grid-cols-7 border-b border-border last:border-0">
                    {week.map((day, di) => {
                      const dayContent = getContentForDay(day);
                      const inMonth = isSameMonth(day, currentMonth);
                      const today = isToday(day);

                      return (
                        <div
                          key={di}
                          onClick={() => handleDayClick(day)}
                          className={`min-h-[90px] p-1.5 border-l border-border first:border-l-0 cursor-pointer transition-all duration-200 hover:bg-muted/50 ${!inMonth ? "opacity-30" : ""}`}
                        >
                          {/* Day number */}
                          <div className="flex items-center justify-between mb-1">
                            <span className={`text-xs font-medium w-5 h-5 sm:w-6 sm:h-6 flex items-center justify-center rounded-full ${today ? "bg-foreground text-background" : "text-muted-foreground"}`}>
                              {format(day, "d")}
                            </span>
                          </div>

                          {/* Events — colored chips with title */}
                          <div className="flex flex-col gap-0.5 mt-1 w-full">
                            {dayContent.slice(0, 3).map((item) => {
                              const c = getColor(item.color);
                              return (
                                <div
                                  key={item.id}
                                  onClick={(e) => { e.stopPropagation(); handleEditContent(item); }}
                                  title={item.title}
                                  className={`flex items-start gap-1 rounded px-1 py-0.5 cursor-pointer hover:brightness-95 transition-all ${c.bg}`}
                                >
                                  <span className={`w-1.5 h-1.5 rounded-full shrink-0 mt-[3px] ${c.dot}`} />
                                  <span className={`text-[10px] font-medium leading-tight break-words min-w-0 line-clamp-2 ${c.text}`}>{item.title}</span>
                                </div>
                              );
                            })}
                            {dayContent.length > 3 && (
                              <span className="text-[9px] text-muted-foreground leading-none px-1">+{dayContent.length - 3}</span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* ── Events list (all screens) ── */}
      {monthEvents.length > 0 && (
        <motion.div variants={fadeUp} className="">
          <h3 className="text-sm font-semibold text-foreground mb-3">
            {he.common.events} — {format(currentMonth, "MMMM yyyy", { locale: heLocale })}
          </h3>
          <div className="flex flex-col gap-2">
            {monthEvents.map((item) => {
              const c = getColor(item.color);
              return (
                <div
                  key={item.id}
                  onClick={() => handleEditContent(item)}
                  className={`flex items-start gap-3 rounded-xl border ${c.border} ${c.bg} px-4 py-3 cursor-pointer hover:brightness-95 transition-all`}
                >
                  <span className={`mt-1 h-2.5 w-2.5 rounded-full ${c.dot} shrink-0`} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className={`font-semibold text-sm ${c.text}`}>{item.title}</p>
                      <span className="text-[10px] rounded-full bg-muted px-2 py-0.5 text-muted-foreground">
                        {he.calendar.statuses[item.status as keyof typeof he.calendar.statuses] ?? item.status}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {format(new Date(item.date), "EEEE, d MMMM", { locale: heLocale })}
                      {item.client && ` · ${item.client.name}`}
                    </p>
                    {item.notes && <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{item.notes}</p>}
                  </div>
                  <button
                    onClick={(e) => { e.stopPropagation(); setDeleteTarget(item.id); }}
                    className="shrink-0 mt-0.5"
                  >
                    <Trash2 className="h-3.5 w-3.5 text-red-400" />
                  </button>
                </div>
              );
            })}
          </div>
        </motion.div>
      )}

      {/* ── Dialogs ── */}
      <ContentDialog
        content={editingContent}
        defaultDate={selectedDate}
        defaultClientId={selectedClientId}
        clients={clients}
        projects={projects}
        boardId={boardId}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onRequestDelete={(id) => { setDeleteTarget(id); }}
      />

      <CalendarExportStudio
        open={exportStudioOpen}
        onClose={() => setExportStudioOpen(false)}
        content={content.filter((item) => !selectedClientId || item.clientId === selectedClientId)}
        currentMonth={currentMonth}
        clientName={selectedClientName ?? ""}
      />

      {deleteTarget && (
        <DeleteContentDialog
          contentId={deleteTarget}
          open={!!deleteTarget}
          onOpenChange={(open) => { if (!open) setDeleteTarget(null); }}
        />
      )}
    </motion.div>
  );
}
