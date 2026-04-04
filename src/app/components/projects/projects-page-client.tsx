"use client";

import { useState, useTransition, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, useReducedMotion } from "framer-motion";
import {
  Plus, Pencil, Trash2, CalendarPlus, Search,
  CheckCircle2, RotateCcw, MoreHorizontal, X,
} from "lucide-react";
import { UpgradeDialog } from "@/app/components/shared/upgrade-dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { SearchableSelect } from "@/components/ui/searchable-select";
import { ProjectDialog, QuickAddDialog } from "./project-dialog";
import { DeleteProjectDialog } from "./delete-project-dialog";
import { useT, useLocale } from "@/lib/i18n";
import { formatCurrency, daysUntil } from "@/lib/utils/format";
import { getPhaseLabel, toUniversalColumn } from "@/lib/project-config";
import { completeProject, restoreProject, bulkDeleteProjects, bulkCompleteProjects } from "@/lib/actions/project-actions";

const STATUS_COLORS: Record<string, string> = {
  planning:    "bg-violet-500",
  in_progress: "bg-amber-500",
  review:      "bg-blue-500",
  done:        "bg-emerald-500",
};

type ProjectData = {
  id: string;
  title: string;
  description: string | null;
  clientId: string | null;
  phase: string;
  status: string;
  projectType: string | null;
  budget: number | null;
  shootDate: Date | null;
  deadline: Date | null;
  client: { id: string; name: string } | null;
  tasks: { id: string; completed: boolean }[];
};

type ClientOption = { id: string; name: string };

const stagger = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06, delayChildren: 0.02 } },
};
const staggerReduced = { hidden: {}, show: {} };
const fadeUp = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: "easeOut" as const } },
};
const fadeReduced = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { duration: 0.12 } } };

type ViewTab = "active" | "history";

export function ProjectsPageClient({
  projects,
  clients,
  planLimit,
  activeProjectCount,
}: {
  projects: ProjectData[];
  clients: ClientOption[];
  planLimit: number;
  activeProjectCount: number;
}) {
  const he = useT();
  const locale = useLocale();
  const router = useRouter();
  const prefersReduced = useReducedMotion();
  const sv = prefersReduced ? staggerReduced : stagger;
  const fv = prefersReduced ? fadeReduced : fadeUp;
  const [isPending, startTransition] = useTransition();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<ProjectData | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; title: string } | null>(null);
  const [upgradeOpen, setUpgradeOpen] = useState(false);
  const [quickAdd, setQuickAdd] = useState<{ id: string; title: string; clientId: string } | null>(null);
  const [filterClientId, setFilterClientId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [view, setView] = useState<ViewTab>("active");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);

  const activeProjects  = useMemo(() => projects.filter((p) => p.phase !== "delivered"), [projects]);
  const historyProjects = useMemo(() => projects.filter((p) => p.phase === "delivered"), [projects]);

  const displayProjects = useMemo(() => {
    const base = view === "active" ? activeProjects : historyProjects;
    const q = search.toLowerCase();
    return base.filter((p) => {
      if (filterClientId && p.clientId !== filterClientId) return false;
      if (q && !p.title.toLowerCase().includes(q) && !p.client?.name.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [view, activeProjects, historyProjects, filterClientId, search]);

  function handleCreate() {
    if (planLimit !== -1 && activeProjectCount >= planLimit) {
      setUpgradeOpen(true);
      return;
    }
    setEditingProject(null);
    setDialogOpen(true);
  }

  function handleEdit(project: ProjectData) {
    setEditingProject(project);
    setDialogOpen(true);
  }

  function handleComplete(id: string) {
    startTransition(async () => { await completeProject(id); });
  }

  function handleRestore(id: string) {
    startTransition(async () => { await restoreProject(id); });
  }

  function toggleSelect(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }

  function toggleSelectAll() {
    if (selectedIds.size === displayProjects.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(displayProjects.map((p) => p.id)));
    }
  }

  function handleBulkComplete() {
    const ids = Array.from(selectedIds);
    startTransition(async () => {
      await bulkCompleteProjects(ids);
      setSelectedIds(new Set());
    });
  }

  function handleBulkDelete() {
    const ids = Array.from(selectedIds);
    startTransition(async () => {
      await bulkDeleteProjects(ids);
      setSelectedIds(new Set());
      setBulkDeleteOpen(false);
    });
  }

  // Client options for SearchableSelect
  const clientOptions = useMemo(() => {
    const base = view === "active" ? activeProjects : historyProjects;
    return clients
      .filter((c) => base.some((p) => p.clientId === c.id))
      .map((c) => ({ value: c.id, label: c.name }));
  }, [clients, view, activeProjects, historyProjects]);

  return (
    <motion.div variants={sv} initial="hidden" animate="show" className="space-y-5">

      {/* ── Header ── */}
      <motion.div variants={fv} className="flex items-center justify-between">
        <div>
          <h1 className="text-[22px] font-extrabold tracking-[-0.03em] text-foreground">{he.project.title}</h1>
          {historyProjects.length > 0 && (
            <p className="text-[11.5px] text-foreground/40 mt-0.5">
              {activeProjects.length} פעילים · {historyProjects.length} הושלמו
            </p>
          )}
        </div>
        <Button
          size="sm"
          onClick={handleCreate}
          className="bg-foreground text-background hover:bg-foreground/90 shadow-sm transition-all duration-200 border-0"
        >
          <Plus className="h-4 w-4 me-2" />
          {he.project.newProject}
        </Button>
      </motion.div>

      {/* ── Search + Client filter + View toggle ── */}
      <motion.div variants={fv} className="flex items-center gap-2 flex-wrap" dir="rtl">
        <div className="relative flex-1 min-w-[160px] max-w-xs">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-foreground/30" />
          <input
            placeholder="חיפוש פרויקטים..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-border/60 bg-background pr-9 pl-4 py-2 text-[13px] text-foreground placeholder:text-foreground/30 outline-none focus:border-accent/40 focus:ring-1 focus:ring-accent/20 transition-all duration-200"
          />
        </div>

        {/* Client filter dropdown */}
        {clientOptions.length > 0 && (
          <div className="flex items-center gap-1.5">
            <SearchableSelect
              options={clientOptions}
              value={filterClientId ?? ""}
              onChange={(v) => { setFilterClientId(v || null); setSelectedIds(new Set()); }}
              placeholder="בחר לקוח"
              searchPlaceholder="חיפוש לקוח..."
              emptyMessage="לא נמצאו לקוחות"
              triggerClassName="min-w-[140px] text-[13px]"
            />
            {filterClientId && (
              <button
                onClick={() => { setFilterClientId(null); setSelectedIds(new Set()); }}
                className="flex items-center gap-1 rounded-lg bg-foreground/10 px-2 py-1 text-[11px] font-medium text-foreground/70 hover:bg-foreground/20 transition-colors"
              >
                <X className="h-3 w-3" />
                נקה
              </button>
            )}
          </div>
        )}

        {/* Active / History toggle */}
        <div className="flex items-center gap-0.5 bg-muted/70 rounded-xl p-1 border border-border/30">
          <button
            onClick={() => { setView("active"); setSelectedIds(new Set()); }}
            className={`flex items-center gap-1.5 h-7 px-3 rounded-lg text-[12px] font-medium transition-all duration-150 ${
              view === "active" ? "bg-foreground text-background shadow-sm" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            פעילים
            <span className={`text-[10px] tabular-nums ${view === "active" ? "opacity-60" : "opacity-40"}`}>
              {activeProjects.length}
            </span>
          </button>
          <button
            onClick={() => { setView("history"); setSelectedIds(new Set()); }}
            className={`flex items-center gap-1.5 h-7 px-3 rounded-lg text-[12px] font-medium transition-all duration-150 ${
              view === "history" ? "bg-foreground text-background shadow-sm" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            הושלמו
            <span className={`text-[10px] tabular-nums ${view === "history" ? "opacity-60" : "opacity-40"}`}>
              {historyProjects.length}
            </span>
          </button>
        </div>
      </motion.div>

      {/* ── Select all + bulk actions bar ── */}
      {displayProjects.length > 0 && (
        <motion.div variants={fv} className={`flex items-center gap-3 flex-wrap rounded-xl px-4 py-2.5 transition-all duration-200 ${selectedIds.size > 0 ? "bg-foreground/[0.04] border border-border/50" : ""}`} dir="rtl">
          <label className="flex items-center gap-2 cursor-pointer select-none text-[12.5px] text-muted-foreground hover:text-foreground transition-colors">
            <input
              type="checkbox"
              checked={selectedIds.size === displayProjects.length && displayProjects.length > 0}
              onChange={toggleSelectAll}
              className="h-3.5 w-3.5 rounded accent-foreground cursor-pointer"
            />
            {selectedIds.size > 0 ? `${selectedIds.size} נבחרו` : "בחר הכל"}
          </label>

          {selectedIds.size > 0 && (
            <>
              <div className="h-4 w-px bg-border/60" />
              {view === "active" && (
                <button
                  onClick={handleBulkComplete}
                  disabled={isPending}
                  className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[12.5px] font-medium text-emerald-600 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/30 dark:hover:bg-emerald-950/50 transition-colors disabled:opacity-50"
                >
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  סמן כהושלם
                </button>
              )}
              <button
                onClick={() => setBulkDeleteOpen(true)}
                disabled={isPending}
                className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[12.5px] font-medium text-red-600 bg-red-50 hover:bg-red-100 dark:bg-red-950/30 dark:hover:bg-red-950/50 transition-colors disabled:opacity-50"
              >
                <Trash2 className="h-3.5 w-3.5" />
                מחיקה
              </button>
              <button
                onClick={() => setSelectedIds(new Set())}
                className="flex items-center gap-1 rounded-md px-2 py-1 text-[11px] text-muted-foreground hover:text-foreground hover:bg-muted transition-colors mr-auto"
              >
                <X className="h-3 w-3" />
                ביטול
              </button>
            </>
          )}
        </motion.div>
      )}

      {/* ── Project grid ── */}
      {displayProjects.length > 0 ? (
        <motion.div variants={fv} className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {displayProjects.map((project) => {
            const completedTasks = project.tasks.filter((t) => t.completed).length;
            const totalTasks = project.tasks.length;
            const currentPhaseLabel = getPhaseLabel(project.phase, he);
            const isHistory = project.phase === "delivered";
            const isSelected = selectedIds.has(project.id);

            return (
              <div key={project.id} className="relative">
                {/* Selection checkbox */}
                <div
                  className="absolute top-3 right-3 z-10"
                  onClick={(e) => e.stopPropagation()}
                >
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => toggleSelect(project.id)}
                    className="h-4 w-4 rounded accent-foreground cursor-pointer"
                  />
                </div>

                <Link href={`/projects/${project.id}`} className="block">
                  <Card className={`group border-border/40 transition-all duration-300 hover:border-border/60 hover:shadow-[0_4px_16px_-4px_rgba(0,0,0,0.08)] cursor-pointer ${isHistory ? "bg-muted/30 opacity-80" : "glass-card"} ${isSelected ? "ring-2 ring-foreground/20 border-foreground/20" : ""}`}>
                    <CardContent className="p-4 pr-10 space-y-3">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5">
                            {isHistory && <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />}
                            <p className={`text-sm font-medium leading-tight ${isHistory ? "line-through decoration-muted-foreground/40 text-muted-foreground" : ""}`}>
                              {project.title}
                            </p>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">{project.client?.name ?? "—"}</p>
                        </div>

                        {/* Action menu */}
                        <div onClick={(e) => e.preventDefault()}>
                          <DropdownMenu>
                            <DropdownMenuTrigger className="flex h-7 w-7 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors outline-none opacity-100 sm:opacity-0 sm:group-hover:opacity-100 focus:opacity-100">
                              <MoreHorizontal className="h-4 w-4" />
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" sideOffset={4} dir="rtl">
                              {!isHistory ? (
                                <>
                                  <DropdownMenuItem
                                    onClick={() => handleComplete(project.id)}
                                    disabled={isPending}
                                    className="text-emerald-600 focus:text-emerald-600"
                                  >
                                    <CheckCircle2 className="h-4 w-4" />
                                    <span>סמן כהושלם</span>
                                  </DropdownMenuItem>
                                  {project.shootDate && (
                                    <DropdownMenuItem
                                      onClick={() => {
                                        const d = new Date(project.shootDate!);
                                        const fmt = (dt: Date) => dt.toISOString().replace(/[-:]/g, "").split(".")[0];
                                        const url = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(project.title)}&dates=${fmt(d)}/${fmt(new Date(d.getTime() + 8 * 3600000))}&sf=true&output=xml`;
                                        window.open(url, "_blank", "noopener");
                                      }}
                                    >
                                      <CalendarPlus className="h-4 w-4" />
                                      <span>{he.projectsPage.addToGCal}</span>
                                    </DropdownMenuItem>
                                  )}
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem onClick={() => handleEdit(project)}>
                                    <Pencil className="h-4 w-4" />
                                    <span>עריכה</span>
                                  </DropdownMenuItem>
                                </>
                              ) : (
                                <DropdownMenuItem
                                  onClick={() => handleRestore(project.id)}
                                  disabled={isPending}
                                >
                                  <RotateCcw className="h-4 w-4" />
                                  <span>החזר לפעיל</span>
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                variant="destructive"
                                onClick={() => setDeleteTarget({ id: project.id, title: project.title })}
                              >
                                <Trash2 className="h-4 w-4" />
                                <span>מחיקה</span>
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>

                      {!isHistory && (
                        <Badge className="text-xs bg-muted border-0 text-muted-foreground gap-1.5">
                          <span className={`h-2 w-2 rounded-full ${STATUS_COLORS[toUniversalColumn(project.phase)] ?? "bg-gray-400"}`} />
                          {currentPhaseLabel}
                        </Badge>
                      )}

                      {(project.budget || project.deadline || project.shootDate) && (
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          {project.budget != null && (
                            <span className={`font-semibold ${isHistory ? "text-muted-foreground" : "text-foreground"}`}>
                              {formatCurrency(project.budget, locale)}
                            </span>
                          )}
                          {!isHistory && (() => {
                            const targetDate = project.deadline ?? project.shootDate;
                            if (!targetDate) return null;
                            const days = daysUntil(targetDate);
                            if (days === null) return null;
                            return (
                              <span className={days < 0 ? "text-red-500" : ""}>
                                {days < 0
                                  ? `לפני ${Math.abs(days)} ${he.common.days}`
                                  : `${(he.common as Record<string, string>).inDays ?? "בעוד"} ${days} ${he.common.days}`}
                              </span>
                            );
                          })()}
                        </div>
                      )}

                      {!isHistory && totalTasks > 0 && (
                        <div className="space-y-1.5">
                          <div className="h-[3px] rounded-full bg-foreground/[0.06]">
                            <div
                              className="h-full rounded-full bg-accent/70 transition-all duration-500"
                              style={{ width: `${(completedTasks / totalTasks) * 100}%` }}
                            />
                          </div>
                          <p className="text-[10px] text-foreground/35 font-medium text-end tabular-nums">
                            {completedTasks}/{totalTasks} {(he.common as Record<string, string>).tasksCompleted ?? "משימות הושלמו"}
                          </p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </Link>
              </div>
            );
          })}
        </motion.div>
      ) : (
        <motion.div variants={fv} className="rounded-[14px] border border-dashed border-border/40 p-10 text-center">
          <p className="text-[12.5px] font-semibold text-foreground/40">
            {view === "history" ? "אין פרויקטים שהושלמו" : he.common.noProjectsYet}
          </p>
          {view === "active" && (
            <p className="text-[11px] text-foreground/30 mt-1">{he.common.clickNewProject}</p>
          )}
        </motion.div>
      )}

      {/* ── Bulk delete confirmation ── */}
      <AlertDialog open={bulkDeleteOpen} onOpenChange={setBulkDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>מחיקת {selectedIds.size} פרויקטים</AlertDialogTitle>
            <AlertDialogDescription>
              האם אתה בטוח שברצונך למחוק {selectedIds.size} פרויקטים? פעולה זו לא ניתנת לביטול.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{he.common.cancel}</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={handleBulkDelete}
              disabled={isPending}
            >
              {isPending ? he.common.deleting : `מחק ${selectedIds.size} פרויקטים`}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <UpgradeDialog
        open={upgradeOpen}
        onClose={() => setUpgradeOpen(false)}
        feature={he.project.title}
        limit={planLimit}
      />
      <ProjectDialog
        project={editingProject}
        clients={clients}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onQuotaExceeded={() => { setDialogOpen(false); setUpgradeOpen(true); }}
        defaultClientId={!editingProject && filterClientId ? filterClientId : undefined}
        onCreated={(projectId, title, clientId) => setQuickAdd({ id: projectId, title, clientId })}
      />
      {quickAdd && (
        <QuickAddDialog
          open={!!quickAdd}
          onOpenChange={(v) => { if (!v) setQuickAdd(null); }}
          projectId={quickAdd.id}
          projectTitle={quickAdd.title}
          clientId={quickAdd.clientId}
          onGoToProject={() => {
            const id = quickAdd.id;
            setQuickAdd(null);
            router.push(`/projects/${id}`);
          }}
        />
      )}
      {deleteTarget && (
        <DeleteProjectDialog
          projectId={deleteTarget.id}
          projectTitle={deleteTarget.title}
          open={!!deleteTarget}
          onOpenChange={(open) => { if (!open) setDeleteTarget(null); }}
        />
      )}
    </motion.div>
  );
}
