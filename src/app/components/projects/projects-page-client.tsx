"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Plus, Pencil, Trash2, CalendarPlus, Search } from "lucide-react";
import { UpgradeDialog } from "@/app/components/shared/upgrade-dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ProjectDialog } from "./project-dialog";
import { DeleteProjectDialog } from "./delete-project-dialog";
import { useT, useLocale } from "@/lib/i18n";
import { formatCurrency, formatDate, daysUntil } from "@/lib/utils/format";
import { getPhaseLabel, toUniversalColumn } from "@/lib/project-config";

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
}: {
  projects: ProjectData[];
  clients: ClientOption[];
  planLimit: number;
}) {
  const he = useT();
  const locale = useLocale();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<ProjectData | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; title: string } | null>(null);
  const [upgradeOpen, setUpgradeOpen] = useState(false);
  const [filterClientId, setFilterClientId] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const filteredProjects = projects.filter(p => {
    if (filterClientId && p.clientId !== filterClientId) return false;
    if (search) {
      const q = search.toLowerCase();
      const matchTitle = p.title.toLowerCase().includes(q);
      const matchClient = p.client?.name.toLowerCase().includes(q);
      if (!matchTitle && !matchClient) return false;
    }
    return true;
  });

  function handleCreate() {
    if (planLimit !== -1 && projects.length >= planLimit) {
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

  return (
    <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-6">

      {/* Header */}
      <motion.div variants={fadeUp} className="flex items-center justify-between">
        <h1 className="text-[22px] font-extrabold tracking-[-0.03em] text-foreground">{he.project.title}</h1>
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
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-foreground/30" />
          <input
            placeholder="חיפוש פרויקטים..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-[10px] border border-border/40 bg-card px-4 py-2.5 pe-10 text-[13px] text-foreground placeholder:text-foreground/30 outline-none focus:border-accent/40 focus:ring-1 focus:ring-accent/20 transition-all duration-200"
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
            {he.common.all} ({projects.length})
          </button>
          {clients.filter(c => projects.some(p => p.clientId === c.id)).map(c => {
            const count = projects.filter(p => p.clientId === c.id).length;
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

      {/* Project cards grid */}
      {filteredProjects.length > 0 ? (
        <motion.div variants={fadeUp} className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredProjects.map((project) => {
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
                    <div className="flex items-center gap-0.5 shrink-0 opacity-100 sm:opacity-0 sm:pointer-events-none sm:group-hover:opacity-100 sm:group-hover:pointer-events-auto transition-opacity duration-200" onClick={(e) => e.preventDefault()}>
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

                  {/* Status badge */}
                  <Badge className="text-xs bg-muted border-0 text-muted-foreground gap-1.5">
                    <span className={`h-2 w-2 rounded-full ${STATUS_COLORS[toUniversalColumn(project.phase)] ?? "bg-gray-400"}`} />
                    {currentPhaseLabel}
                  </Badge>

                  {/* Budget + deadline row */}
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
                            {days < 0 ? `לפני ${Math.abs(days)} ${he.common.days}` : `${(he.common as Record<string, string>).inDays ?? "בעוד"} ${days} ${he.common.days}`}
                          </span>
                        );
                      })()}
                    </div>
                  )}

                  {/* Task progress bar */}
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
