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
import { ChevronRight, ChevronLeft, Plus, Pencil, Trash2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ContentDialog } from "./content-dialog";
import { DeleteContentDialog } from "./delete-content-dialog";
import { he } from "@/lib/he";

type ContentItem = {
  id: string;
  title: string;
  date: Date;
  contentType: string;
  status: string;
  clientId: string | null;
  projectId: string | null;
  notes: string | null;
  client: { id: string; name: string } | null;
  project: { id: string; title: string } | null;
};

const contentTypeColors: Record<string, { bg: string; text: string; dot: string }> = {
  client_shoot: { bg: "bg-blue-500/15", text: "text-blue-300", dot: "bg-blue-400" },
  youtube_long: { bg: "bg-red-500/15", text: "text-red-300", dot: "bg-red-400" },
  short_form: { bg: "bg-purple-500/15", text: "text-purple-300", dot: "bg-purple-400" },
};

const statusStyles: Record<string, string> = {
  planned: "bg-white/[0.06] text-muted-foreground border-0",
  editing: "bg-amber-500/15 text-amber-300 border-0",
  ready: "bg-cyan-500/15 text-cyan-300 border-0",
  published: "bg-emerald-500/15 text-emerald-300 border-0",
};

const stagger = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.03, delayChildren: 0.02 },
  },
};

const fadeUp = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: "easeOut" as const } },
};

const dayNames = ["ראשון", "שני", "שלישי", "רביעי", "חמישי", "שישי", "שבת"];

export function CalendarPageClient({
  content,
  clients,
  projects,
  initialMonth,
}: {
  content: ContentItem[];
  clients: { id: string; name: string }[];
  projects: { id: string; title: string }[];
  initialMonth: string;
}) {
  const router = useRouter();
  const [currentMonth, setCurrentMonth] = useState(new Date(initialMonth));

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingContent, setEditingContent] = useState<ContentItem | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  function navigateMonth(direction: "prev" | "next") {
    const newMonth = direction === "prev" ? subMonths(currentMonth, 1) : addMonths(currentMonth, 1);
    setCurrentMonth(newMonth);
    router.push(`/calendar?month=${format(newMonth, "yyyy-MM")}`);
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

  // Build calendar grid
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const calStart = startOfWeek(monthStart); // Sunday start
  const calEnd = endOfWeek(monthEnd);

  const weeks: Date[][] = [];
  let day = calStart;
  while (day <= calEnd) {
    const week: Date[] = [];
    for (let i = 0; i < 7; i++) {
      week.push(day);
      day = addDays(day, 1);
    }
    weeks.push(week);
  }

  function getContentForDay(day: Date) {
    return content.filter((item) => isSameDay(new Date(item.date), day));
  }

  return (
    <motion.div
      variants={stagger}
      initial="hidden"
      animate="show"
      className="space-y-6"
    >
      {/* Header */}
      <motion.div variants={fadeUp} className="flex items-center justify-between">
        <h1 className="text-2xl font-bold bg-gradient-to-l from-cyan-300 via-white to-white bg-clip-text text-transparent">
          {he.calendar.title}
        </h1>
        <Button
          size="sm"
          onClick={handleCreateNew}
          className="bg-gradient-to-r from-cyan-500 to-teal-500 text-white hover:from-cyan-400 hover:to-teal-400 shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/40 transition-all duration-300 border-0"
        >
          <Plus className="h-4 w-4 me-2" />
          {he.calendar.newContent}
        </Button>
      </motion.div>

      {/* Month navigation */}
      <motion.div variants={fadeUp} className="flex items-center justify-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigateMonth("next")}
          className="hover:bg-white/[0.06] h-8 w-8"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
        <h2 className="text-lg font-semibold min-w-[180px] text-center">
          {format(currentMonth, "MMMM yyyy", { locale: heLocale })}
        </h2>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigateMonth("prev")}
          className="hover:bg-white/[0.06] h-8 w-8"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
      </motion.div>

      {/* Calendar grid */}
      <motion.div variants={fadeUp}>
        <Card className="glass-card overflow-hidden">
          <CardContent className="p-0">
            {/* Day headers */}
            <div className="grid grid-cols-7 border-b border-white/[0.06]">
              {dayNames.map((name) => (
                <div
                  key={name}
                  className="py-2 text-center text-xs font-medium text-muted-foreground"
                >
                  {name}
                </div>
              ))}
            </div>

            {/* Weeks */}
            {weeks.map((week, wi) => (
              <div key={wi} className="grid grid-cols-7 border-b border-white/[0.04] last:border-0">
                {week.map((day, di) => {
                  const dayContent = getContentForDay(day);
                  const inMonth = isSameMonth(day, currentMonth);
                  const today = isToday(day);

                  return (
                    <div
                      key={di}
                      onClick={() => handleDayClick(day)}
                      className={`min-h-[100px] p-1.5 border-l border-white/[0.04] first:border-l-0 cursor-pointer transition-all duration-200 hover:bg-cyan-500/[0.03] ${
                        !inMonth ? "opacity-30" : ""
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span
                          className={`text-xs font-medium w-6 h-6 flex items-center justify-center rounded-full ${
                            today
                              ? "bg-cyan-500 text-white"
                              : "text-muted-foreground"
                          }`}
                        >
                          {format(day, "d")}
                        </span>
                      </div>
                      <div className="space-y-0.5">
                        {dayContent.map((item) => {
                          const colors = contentTypeColors[item.contentType] ?? contentTypeColors.client_shoot;
                          return (
                            <div
                              key={item.id}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEditContent(item);
                              }}
                              className={`${colors.bg} ${colors.text} text-[10px] leading-tight px-1.5 py-0.5 rounded truncate cursor-pointer hover:brightness-125 transition-all duration-150 group/item relative`}
                            >
                              <span className="flex items-center gap-1">
                                <span className={`w-1.5 h-1.5 rounded-full ${colors.dot} flex-shrink-0`} />
                                <span className="truncate">{item.title}</span>
                              </span>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setDeleteTarget(item.id);
                                }}
                                className="absolute left-0.5 top-0.5 opacity-0 group-hover/item:opacity-100 transition-opacity"
                              >
                                <Trash2 className="h-2.5 w-2.5 text-red-400" />
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            ))}
          </CardContent>
        </Card>
      </motion.div>

      {/* Content type legend */}
      <motion.div variants={fadeUp} className="flex items-center justify-center gap-6 text-xs text-muted-foreground">
        {Object.entries(contentTypeColors).map(([type, colors]) => (
          <div key={type} className="flex items-center gap-1.5">
            <span className={`w-2.5 h-2.5 rounded-full ${colors.dot}`} />
            <span>
              {he.calendar.contentTypes[type as keyof typeof he.calendar.contentTypes] ?? type}
            </span>
          </div>
        ))}
      </motion.div>

      {/* Dialogs */}
      <ContentDialog
        content={editingContent}
        defaultDate={selectedDate}
        clients={clients}
        projects={projects}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
      />

      {deleteTarget && (
        <DeleteContentDialog
          contentId={deleteTarget}
          open={!!deleteTarget}
          onOpenChange={(open) => {
            if (!open) setDeleteTarget(null);
          }}
        />
      )}
    </motion.div>
  );
}
