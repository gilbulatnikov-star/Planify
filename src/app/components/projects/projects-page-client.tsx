"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus, Pencil, Trash2, CalendarPlus, Search,
  CheckCircle2, RotateCcw, ChevronDown, History,
} from "lucide-react";
import { UpgradeDialog } from "@/app/components/shared/upgrade-dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ProjectDialog } from "./project-dialog";
import { DeleteProjectDialog } from "./delete-project-dialog";
import { useT, useLocale } from "@/lib/i18n";
import { formatCurrency, formatDate, daysUntil } from "@/lib/utils/format";
import { getPhaseLabel, toUniversalColumn } from "@/lib/project-config";
import { completeProject, restoreProject } from "@/lib/actions/project-actions";

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

const fadeUp = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: "easeOut" as const } },
};

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
  const [isPending, startTransition] = useTransition();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<ProjectData | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; title: string } | null>(null);
  const [upgradeOpen, setUpgradeOpen] = useState(false);
  const [filterClientId, setFilterClientId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [historyOpen, setHistoryOpen] = useState(false);

  const activeProjects = projects.filter((p) => p.phase !== "delivered");
  const historyProjects = projects.filter((p) => p.phase === "delivered");

  const filteredActive = activeProjects.filter((p) => {
    if (filterClientId && p.clientId !== filterClientId) return false;
    if (search) {
      const q = search.toLowerCase();
      if (!p.title.toLowerCase().includes(q) && !p.client?.name.toLowerCase().includes(q)) return false;
    }
    return true;
  });

  const filteredHistory = historyProjects.filter((p) => {
    if (search) {
      const q = search.toLowerCase();
      if (!p.title.toLowerCase().includes(q) && !p.client?.name.toLowerCase().includes(q)) return false;
    }
    return true;
  });

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

  return (
    <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-6">

      {/* Header */}
      <motion.div variants={fadeUp} className="flex items-center justify-between">
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

      {/* Search bar */}
      <motion.div variants={fadeUp}>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-foreground/30" />
          <input
            placeholder="חיפוש פרויקטים..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full max-w-xs rounded-[10px] border border-border/40 bg-card pr-4 pl-10 py-2.5 text-[13px] text-foreground placeholder:text-foreground/30 outline-none focus:border-accent/40 focus:ring-1 focus:ring-accent/20 transition-all duration-200"
          />
        </div>
      </motion.div>

      {/* Client filter */}
      {clients.length > 0 && (
        <motion.div variants={fadeUp} className="flex flex-wrap gap-2">
          <button
            onClick={() => setFilterClientId(null)}
            className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${!filterClientId ? "bg-foreground text-background" : "bg-muted text-muted-foreground hover:text-foreground"}`}
          >
            {he.common.all} ({activeProjects.length})
          </button>
          {clients.filter((c) => activeProjects.some((p) => p.clientId === c.id)).map((c) => {
            const count = activeProjects.filter((p) => p.clientId === c.id).length;
            return (
              <button
                key={c.id}
                onClick={() => setFilterClientId(filterClientId === c.id ? null : c.id)}
                className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${filterClientId === c.id ? "bg-foreground text-background" : "bg-muted text-muted-foreground hover:text-foreground"}`}
              >
                {c.name} ({count})
              </button>
            );
          })}
        </motion.div>
      )}

      {/* Active project cards */}
      {filteredActive.length > 0 ? (
        <motion.div variants={fadeUp} className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredActive.map((project) => {
            const completedTasks = project.tasks.filter((t) => t.completed).length;
            const totalTasks = project.tasks.length;
            const currentPhaseLabel = getPhaseLabel(project.phase, he);

            return (
              <Link key={project.id} href={`/projects/${project.id}`} className="block">
                <Card className="glass-card group border-border/40 transition-all duration-300 hover:border-border/60 hover:shadow-[0_4px_16px_-4px_rgba(0,0,0,0.08)] cursor-pointer">
                  <CardContent className="p-4 space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium leading-tight">{project.title}</p>
                        <p className="text-xs text-muted-foreground mt-1">{project.client?.name ?? "—"}</p>
                      </div>
                      <div
                        className="flex items-center gap-0.5 shrink-0 opacity-100 sm:opacity-0 sm:pointer-events-none sm:group-hover:opacity-100 sm:group-hover:pointer-events-auto transition-opacity duration-200"
                        onClick={(e) => e.preventDefault()}
                      >
                        {project.shootDate && (
                          <Button
                            variant="ghost"
                            size="icon"
                            title={he.projectsPage.addToGCal}
                            className="h-6 w-6 hover:bg-blue-50 hover:text-blue-700"
                            onClick={() => {
                              const d = new Date(project.shootDate!);
                              const fmt = (dt: Date) => dt.toISOString().replace(/[-:]/g, "").split(".")[0];
                              const start = fmt(d);
                              const end = fmt(new Date(d.getTime() + 8 * 3600000));
                              const url = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(project.title)}&dates=${start}/${end}&details=${encodeURIComponent(`פרויקט: ${project.title}${project.client?.name ? ` | לקוח: ${project.client.name}` : ""}`)}&sf=true&output=xml`;
                              window.open(url, "_blank", "noopener");
                            }}
                          >
                            <CalendarPlus className="h-3 w-3" />
                          </Button>
                        )}
                        {/* Mark as complete */}
                        <Button
                          variant="ghost"
                          size="icon"
                          title="סמן כהושלם"
                          className="h-6 w-6 hover:bg-emerald-50 hover:text-emerald-600 text-muted-foreground"
                          disabled={isPending}
                          onClick={() => handleComplete(project.id)}
                        >
                          <CheckCircle2 className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 hover:bg-muted hover:text-foreground"
                          onClick={() => handleEdit(project)}
                        >
                          <Pencil className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 hover:bg-red-50 text-destructive"
                          onClick={() => setDeleteTarget({ id: project.id, title: project.title })}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>

                    <Badge className="text-xs bg-muted border-0 text-muted-foreground gap-1.5">
                      <span className={`h-2 w-2 rounded-full ${STATUS_COLORS[toUniversalColumn(project.phase)] ?? "bg-gray-400"}`} />
                      {currentPhaseLabel}
                    </Badge>

                    {(project.budget || project.deadline || project.shootDate) && (
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        {project.budget != null && (
                          <span className="font-semibold text-foreground">{formatCurrency(project.budget, locale)}</span>
                        )}
                        {(() => {
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

                    {totalTasks > 0 && (
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
            );
          })}
        </motion.div>
      ) : (
        <motion.div variants={fadeUp} className="rounded-[14px] border border-dashed border-border/40 p-10 text-center">
          <p className="text-[12.5px] font-semibold text-foreground/40">{he.common.noProjectsYet}</p>
          <p className="text-[11px] text-foreground/30 mt-1">{he.common.clickNewProject}</p>
        </motion.div>
      )}

      {/* ── History section ── */}
      {historyProjects.length > 0 && (
        <motion.div variants={fadeUp}>
          <button
            onClick={() => setHistoryOpen((v) => !v)}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-3 group"
          >
            <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-muted group-hover:bg-muted/80 transition-colors">
              <History className="h-3.5 w-3.5" />
            </div>
            <span className="font-medium">היסטוריה</span>
            <span className="text-xs opacity-50">({filteredHistory.length})</span>
            <ChevronDown
              className={`h-3.5 w-3.5 opacity-40 transition-transform duration-200 ${historyOpen ? "rotate-180" : ""}`}
            />
          </button>

          <AnimatePresence initial={false}>
            {historyOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.25, ease: "easeInOut" }}
                className="overflow-hidden"
              >
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {filteredHistory.map((project) => (
                    <Link key={project.id} href={`/projects/${project.id}`} className="block">
                      <Card className="border-border/30 bg-muted/30 group transition-all duration-200 hover:bg-muted/50 cursor-pointer">
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                                <p className="text-sm font-medium text-muted-foreground leading-tight line-through decoration-muted-foreground/40">
                                  {project.title}
                                </p>
                              </div>
                              {project.client?.name && (
                                <p className="text-xs text-muted-foreground/60 mt-1 mr-5">{project.client.name}</p>
                              )}
                            </div>
                            <div
                              className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                              onClick={(e) => e.preventDefault()}
                            >
                              <Button
                                variant="ghost"
                                size="icon"
                                title="החזר לפעיל"
                                className="h-6 w-6 hover:bg-muted text-muted-foreground hover:text-foreground"
                                disabled={isPending}
                                onClick={() => handleRestore(project.id)}
                              >
                                <RotateCcw className="h-3 w-3" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6 hover:bg-red-50 text-destructive/60 hover:text-destructive"
                                onClick={() => setDeleteTarget({ id: project.id, title: project.title })}
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                          {project.budget != null && (
                            <p className="text-xs text-muted-foreground/60 mt-2 mr-5">{formatCurrency(project.budget, locale)}</p>
                          )}
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}

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
      />
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
