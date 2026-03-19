"use client";

import { useState } from "react";
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

const phases = [
  { key: "pre_production",  label: he.project.phases.pre_production,  color: "from-violet-500 to-purple-600" },
  { key: "production",      label: he.project.phases.production,      color: "from-gray-800 to-gray-900" },
  { key: "post_production", label: he.project.phases.post_production, color: "from-amber-500 to-orange-500" },
  { key: "revisions",       label: "תיקונים",                         color: "from-blue-500 to-cyan-500" },
  { key: "delivered",       label: he.project.phases.delivered,       color: "from-emerald-500 to-green-500" },
];

const stagger = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.06, delayChildren: 0.02 },
  },
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
  const [deleteTarget, setDeleteTarget] = useState<{
    id: string;
    title: string;
  } | null>(null);
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

  const projectsByPhase = phases.map((phase) => ({
    ...phase,
    projects: projects.filter((p) => p.phase === phase.key),
  }));

  return (
    <motion.div
      variants={stagger}
      initial="hidden"
      animate="show"
      className="space-y-6"
    >
      <motion.div variants={fadeUp} className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">
          {he.project.title}
        </h1>
        <Button
          size="sm"
          onClick={handleCreate}
          className="bg-gray-900 text-white hover:bg-gray-800 shadow-sm transition-all duration-200 border-0"
        >
          <Plus className="h-4 w-4 me-2" />
          {he.project.newProject}
        </Button>
      </motion.div>

      <motion.div variants={fadeUp} className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        {projectsByPhase.map((phase) => (
          <div key={phase.key} className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className={`h-2 w-2 rounded-full bg-gradient-to-r ${phase.color}`} />
                <h2 className="text-sm font-semibold text-muted-foreground">
                  {phase.label}
                </h2>
              </div>
              <Badge variant="secondary" className="text-xs bg-gray-100 border-0">
                {phase.projects.length}
              </Badge>
            </div>
            <div className="space-y-3">
              {phase.projects.map((project) => {
                const completedTasks = project.tasks.filter(
                  (t) => t.completed
                ).length;
                const totalTasks = project.tasks.length;
                return (
                  <Card
                    key={project.id}
                    className="glass-card group transition-all duration-300 hover:scale-[1.02]"
                  >
                    <CardContent className="p-4 space-y-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="text-sm font-medium leading-tight">
                            {project.title}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {project.client?.name ?? "—"}
                          </p>
                        </div>
                        <div className="flex items-center gap-0.5 shrink-0 opacity-100 sm:opacity-0 sm:pointer-events-none sm:group-hover:opacity-100 sm:group-hover:pointer-events-auto transition-opacity duration-200">
                          {project.shootDate && (
                            <Button
                              variant="ghost"
                              size="icon"
                              title="הוסף ל-Google Calendar"
                              className="h-6 w-6 hover:bg-blue-50 hover:text-blue-700"
                              onClick={() => {
                                const d = new Date(project.shootDate!);
                                const fmt = (dt: Date) =>
                                  dt.toISOString().replace(/[-:]/g, "").split(".")[0];
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
                              else if (data.setupRequired) alert("חיבור Google Drive דורש הגדרה. ראה /api/google/drive/route.ts להוראות.");
                              else alert(data.error ?? "שגיאה ביצירת תיקייה");
                            }}
                          >
                            <FolderPlus className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 hover:bg-gray-100 hover:text-gray-900"
                            onClick={() => handleEdit(project)}
                          >
                            <Pencil className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 hover:bg-red-50 text-destructive"
                            onClick={() =>
                              setDeleteTarget({
                                id: project.id,
                                title: project.title,
                              })
                            }
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>

                      {project.projectType && (
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge variant="outline" className="text-xs border-gray-200 text-muted-foreground">
                            {he.project.types[
                              project.projectType as keyof typeof he.project.types
                            ] ?? project.projectType}
                          </Badge>
                        </div>
                      )}

                      {project.budget && (
                        <p className="text-xs text-muted-foreground">
                          {he.project.budget}: {formatCurrency(project.budget)}
                        </p>
                      )}

                      {project.shootDate && (
                        <p className="text-xs text-muted-foreground">
                          {he.project.shootDate}:{" "}
                          {formatDate(project.shootDate)}
                        </p>
                      )}

                      {totalTasks > 0 && (
                        <div className="space-y-1">
                          <div className="flex justify-between text-xs text-muted-foreground">
                            <span>משימות</span>
                            <span>
                              {completedTasks}/{totalTasks}
                            </span>
                          </div>
                          <div className="h-1.5 rounded-full bg-gray-100">
                            <div
                              className="h-full rounded-full bg-gradient-to-r from-gray-700 to-gray-800 transition-all duration-500"
                              style={{
                                width: `${(completedTasks / totalTasks) * 100}%`,
                              }}
                            />
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
              {phase.projects.length === 0 && (
                <div className="rounded-xl border border-dashed border-gray-200 p-6 text-center bg-gray-50/30">
                  <p className="text-xs text-muted-foreground">אין פרויקטים</p>
                </div>
              )}
            </div>
          </div>
        ))}
      </motion.div>

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
          onOpenChange={(open) => {
            if (!open) setDeleteTarget(null);
          }}
        />
      )}
    </motion.div>
  );
}
