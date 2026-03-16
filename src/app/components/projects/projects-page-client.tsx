"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Plus, Pencil, Trash2 } from "lucide-react";
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
  { key: "pre_production", label: he.project.phases.pre_production, color: "from-violet-500 to-purple-600" },
  { key: "production", label: he.project.phases.production, color: "from-cyan-500 to-teal-500" },
  { key: "post_production", label: he.project.phases.post_production, color: "from-amber-500 to-orange-500" },
  { key: "delivered", label: he.project.phases.delivered, color: "from-emerald-500 to-green-500" },
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
}: {
  projects: ProjectData[];
  clients: ClientOption[];
}) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<ProjectData | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<{
    id: string;
    title: string;
  } | null>(null);

  function handleCreate() {
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
        <h1 className="text-2xl font-bold bg-gradient-to-l from-cyan-300 via-white to-white bg-clip-text text-transparent">
          {he.project.title}
        </h1>
        <Button
          size="sm"
          onClick={handleCreate}
          className="bg-gradient-to-r from-cyan-500 to-teal-500 text-white hover:from-cyan-400 hover:to-teal-400 shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/40 transition-all duration-300 border-0"
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
              <Badge variant="secondary" className="text-xs bg-white/[0.06] border-0">
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
                        <div className="flex items-center gap-0.5 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 hover:bg-cyan-500/10 hover:text-cyan-400"
                            onClick={() => handleEdit(project)}
                          >
                            <Pencil className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 hover:bg-red-500/10 text-destructive"
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

                      <div className="flex items-center gap-2 flex-wrap">
                        {project.projectType && (
                          <Badge variant="outline" className="text-xs border-white/10 text-muted-foreground">
                            {he.project.types[
                              project.projectType as keyof typeof he.project.types
                            ] ?? project.projectType}
                          </Badge>
                        )}
                        <Badge className="text-xs bg-cyan-500/15 text-cyan-300 hover:bg-cyan-500/25 border-0">
                          {he.project.statuses[
                            project.status as keyof typeof he.project.statuses
                          ] ?? project.status}
                        </Badge>
                      </div>

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
                          <div className="h-1.5 rounded-full bg-white/[0.06]">
                            <div
                              className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-teal-400 transition-all duration-500"
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
                <div className="rounded-xl border border-dashed border-white/[0.08] p-6 text-center bg-white/[0.01]">
                  <p className="text-xs text-muted-foreground">אין פרויקטים</p>
                </div>
              )}
            </div>
          </div>
        ))}
      </motion.div>

      <ProjectDialog
        project={editingProject}
        clients={clients}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
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
