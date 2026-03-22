"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Plus, Pencil, Trash2, CalendarPlus, FolderPlus } from "lucide-react";
import { UpgradeDialog } from "@/app/components/shared/upgrade-dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ProjectDialog } from "./project-dialog";
import { DeleteProjectDialog } from "./delete-project-dialog";
import { he } from "@/lib/he";
import { formatCurrency, formatDate } from "@/lib/utils/format";
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
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<ProjectData | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; title: string } | null>(null);
  const [upgradeOpen, setUpgradeOpen] = useState(false);

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
        <h1 className="text-2xl font-bold text-foreground">{he.project.title}</h1>
        <Button
          size="sm"
          onClick={handleCreate}
          className="bg-foreground text-background hover:bg-foreground/90 shadow-sm transition-all duration-200 border-0"
        >
          <Plus className="h-4 w-4 me-2" />
          {he.project.newProject}
        </Button>
      </motion.div>

      {/* Project cards grid */}
      {projects.length > 0 ? (
        <motion.div variants={fadeUp} className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => {
            const completedTasks = project.tasks.filter((t) => t.completed).length;
            const totalTasks = project.tasks.length;
            const currentPhaseLabel = getPhaseLabel(project.phase);

            return (
              <Link key={project.id} href={`/projects/${project.id}`} className="block">
              <Card className="glass-card group transition-all duration-300 hover:scale-[1.02] cursor-pointer">
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
                          title="הוסף ל-Google Calendar"
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
                        title="צור תיקיית Drive"
                        className="h-6 w-6 hover:bg-green-50 hover:text-green-700"
                        onClick={async () => {
                          const folderName = `${project.shootDate ? new Date(project.shootDate).getFullYear() + " - " : ""}${project.client?.name ?? "ללא לקוח"} - ${project.title}`;
                          const res = await fetch("/api/google/drive", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ action: "create_folder", folderName }),
                          });
                          const data = await res.json();
                          if (data.folderUrl) window.open(data.folderUrl, "_blank", "noopener");
                          else if (data.setupRequired) alert("חיבור Google Drive דורש הגדרה.");
                          else alert(data.error ?? "שגיאה ביצירת תיקייה");
                        }}
                      >
                        <FolderPlus className="h-3 w-3" />
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

                  {/* Status badge */}
                  <Badge className="text-xs bg-muted border-0 text-muted-foreground gap-1.5">
                    <span className={`h-2 w-2 rounded-full ${STATUS_COLORS[toUniversalColumn(project.phase)] ?? "bg-gray-400"}`} />
                    {currentPhaseLabel}
                  </Badge>

                  {project.budget && (
                    <p className="text-xs text-muted-foreground">
                      {he.project.budget}: {formatCurrency(project.budget)}
                    </p>
                  )}

                  {project.shootDate && (
                    <p className="text-xs text-muted-foreground">
                      {he.project.shootDate}: {formatDate(project.shootDate)}
                    </p>
                  )}

                  {totalTasks > 0 && (
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>משימות</span>
                        <span>{completedTasks}/{totalTasks}</span>
                      </div>
                      <div className="h-1.5 rounded-full bg-muted">
                        <div
                          className="h-full rounded-full bg-foreground transition-all duration-500"
                          style={{ width: `${(completedTasks / totalTasks) * 100}%` }}
                        />
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
              </Link>
            );
          })}
        </motion.div>
      ) : (
        <motion.div variants={fadeUp} className="rounded-xl border border-dashed border-border p-12 text-center">
          <p className="text-sm text-muted-foreground">אין פרויקטים עדיין</p>
          <p className="text-xs text-muted-foreground mt-1">לחץ על &quot;פרויקט חדש&quot; כדי להתחיל</p>
        </motion.div>
      )}

      <UpgradeDialog
        open={upgradeOpen}
        onClose={() => setUpgradeOpen(false)}
        feature="פרויקטים"
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
