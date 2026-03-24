"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  ArrowRight, Pencil, FileText, LayoutTemplate, Contact,
  CalendarDays, ListTodo, Phone, Mail, Plus, Link2, X, Users,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ProjectDialog } from "./project-dialog";
import { getPhaseLabel, CATEGORY_LABELS, PROJECT_TYPE_CONFIG } from "@/lib/project-config";
import type { ProjectCategory } from "@/lib/project-config";
import { formatCurrency, formatDate } from "@/lib/utils/format";
import { useT, useLocale } from "@/lib/i18n";
import { toggleProjectTask, addProjectTask, deleteProjectTask, linkItemToProject, updateProjectClient } from "@/lib/actions/project-actions";
import { Input } from "@/components/ui/input";

type ProjectDetail = {
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
  tasks: { id: string; title: string; completed: boolean; createdAt: Date }[];
  scripts: { id: string; title: string; platform: string; updatedAt: Date }[];
  moodboards: { id: string; title: string; updatedAt: Date }[];
  contacts: { id: string; name: string; category: string; phone: string | null; email: string | null }[];
  scheduledContent: { id: string; title: string; date: Date; status: string; color: string | null }[];
};

const fadeUp = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.3 } },
};

const statusColors: Record<string, string> = {
  planned: "bg-violet-100 text-violet-700",
  editing: "bg-amber-100 text-amber-700",
  ready: "bg-blue-100 text-blue-700",
  published: "bg-emerald-100 text-emerald-700",
};

type UnlinkedItems = {
  scripts: { id: string; title: string }[];
  moodboards: { id: string; title: string }[];
  contacts: { id: string; name: string }[];
  content: { id: string; title: string }[];
};

function LinkItemDropdown({ items, onSelect }: { items: { id: string; title?: string; name?: string }[]; onSelect: (id: string) => void }) {
  const he = useT();
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      <button onClick={() => setOpen(!open)} className="flex items-center justify-center w-full min-h-[72px] rounded-xl border border-dashed border-border text-muted-foreground hover:bg-muted/50 hover:text-foreground hover:border-muted-foreground/30 transition-colors">
        <Plus className="h-5 w-5" />
      </button>
      {open && (
        <div className="absolute top-full mt-1 right-0 z-50 rounded-xl border border-border bg-card shadow-lg p-1.5 min-w-[180px] max-h-48 overflow-y-auto">
          {items.length === 0 ? (
            <p className="text-xs text-muted-foreground px-2.5 py-2 text-center">{he.common.allLinked}</p>
          ) : (
            items.map(item => (
              <button key={item.id} onClick={() => { onSelect(item.id); setOpen(false); }} className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-xs text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">
                <Link2 className="h-3 w-3 opacity-40" /> {item.title ?? item.name}
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}

function ClientPicker({
  clients,
  currentClientId,
  currentClientName,
  onSelect,
}: {
  clients: { id: string; name: string }[];
  currentClientId: string | null;
  currentClientName: string | null;
  onSelect: (clientId: string | null) => void;
}) {
  const he = useT();
  const [open, setOpen] = useState(false);

  return (
    <div className="relative mt-1.5">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 rounded-full border border-border bg-muted/50 px-3 py-1.5 text-xs font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
      >
        <Users className="h-3.5 w-3.5" />
        {currentClientName ?? (he.calendar?.noClient ?? "ללא לקוח")}
        <svg className="h-3 w-3 opacity-50" viewBox="0 0 12 12" fill="none"><path d="M3 5l3 3 3-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute top-full mt-1 right-0 z-50 rounded-xl border border-border bg-card shadow-lg p-1.5 min-w-[200px] max-h-56 overflow-y-auto">
            <button
              onClick={() => { onSelect(null); setOpen(false); }}
              className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs transition-colors ${!currentClientId ? "bg-muted text-foreground font-medium" : "text-muted-foreground hover:bg-muted hover:text-foreground"}`}
            >
              {he.calendar?.noClient ?? "ללא לקוח"}
            </button>
            {clients.map(c => (
              <button
                key={c.id}
                onClick={() => { onSelect(c.id); setOpen(false); }}
                className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs transition-colors ${currentClientId === c.id ? "bg-muted text-foreground font-medium" : "text-muted-foreground hover:bg-muted hover:text-foreground"}`}
              >
                {c.name}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export function ProjectDetailClient({
  project,
  clients,
  unlinked,
}: {
  project: ProjectDetail;
  clients: { id: string; name: string }[];
  unlinked: UnlinkedItems;
}) {
  const he = useT();
  const locale = useLocale();
  const router = useRouter();
  const [editOpen, setEditOpen] = useState(false);
  const [, startTransition] = useTransition();

  function handleLink(type: "script" | "moodboard" | "contact" | "content", itemId: string) {
    startTransition(async () => { await linkItemToProject(type, itemId, project.id); router.refresh(); });
  }
  function handleUnlink(type: "script" | "moodboard" | "contact" | "content", itemId: string) {
    startTransition(async () => { await linkItemToProject(type, itemId, null); router.refresh(); });
  }

  const typeLabel = project.projectType
    ? (CATEGORY_LABELS[project.projectType as ProjectCategory]
      ?? PROJECT_TYPE_CONFIG[project.projectType]?.label
      ?? project.projectType)
    : null;
  const phaseLabel = getPhaseLabel(project.phase);

  const completedTasks = project.tasks.filter(t => t.completed).length;
  const totalTasks = project.tasks.length;

  const sections = [
    { key: "tasks", label: he.common.tasks, icon: ListTodo, count: project.tasks.length },
    { key: "scripts", label: he.nav.scripts, icon: FileText, count: project.scripts.length },
    { key: "moodboards", label: he.nav.moodboard, icon: LayoutTemplate, count: project.moodboards.length },
    { key: "contacts", label: he.contacts.title, icon: Contact, count: project.contacts.length },
    { key: "calendar", label: he.nav.calendar, icon: CalendarDays, count: project.scheduledContent.length },
  ];

  return (
    <motion.div initial="hidden" animate="show" variants={{ show: { transition: { staggerChildren: 0.06 } } }} className="space-y-6 max-w-4xl mx-auto">

      {/* Header */}
      <motion.div variants={fadeUp} className="space-y-3">
        <button onClick={() => router.push("/projects")} className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <ArrowRight className="h-4 w-4" />
          {he.common.backToProjects}
        </button>
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">{project.title}</h1>
            <ClientPicker
              clients={clients}
              currentClientId={project.clientId}
              currentClientName={project.client?.name ?? null}
              onSelect={(clientId) => { startTransition(async () => { await updateProjectClient(project.id, clientId); router.refresh(); }); }}
            />
          </div>
          <Button size="sm" variant="outline" onClick={() => setEditOpen(true)} className="shrink-0">
            <Pencil className="h-3.5 w-3.5 me-1.5" />
            {he.common.edit}
          </Button>
        </div>
        <div className="flex flex-wrap gap-2">
          {typeLabel && <Badge variant="outline" className="text-xs border-border text-muted-foreground">{typeLabel}</Badge>}
          <Badge className="text-xs bg-muted border-0 text-muted-foreground">{phaseLabel}</Badge>
        </div>
      </motion.div>

      {/* Info bar */}
      {(project.budget || project.shootDate || project.deadline || project.description) && (
        <motion.div variants={fadeUp} className="space-y-1.5">
          <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
            {project.shootDate && <span>📅 {formatDate(project.shootDate)}</span>}
            {project.deadline && <span>⏰ דדליין: {formatDate(project.deadline)}</span>}
            {project.budget != null && <span>💰 {formatCurrency(project.budget)}</span>}
          </div>
          {project.description && (
            <p className="text-sm text-muted-foreground whitespace-pre-line">{project.description}</p>
          )}
        </motion.div>
      )}

      {/* Section overview pills */}
      <motion.div variants={fadeUp} className="flex flex-wrap gap-2">
        {sections.map(s => (
          <a key={s.key} href={`#${s.key}`} className="flex items-center gap-1.5 rounded-full bg-muted px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors">
            <s.icon className="h-3.5 w-3.5" />
            {s.label}
            <span className="text-[10px] opacity-60">({s.count})</span>
          </a>
        ))}
      </motion.div>

      {/* ── Tasks ── */}
      <motion.div variants={fadeUp} id="tasks" className="space-y-3">
        <h2 className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
          <ListTodo className="h-4 w-4" /> {he.common.tasks}
          {totalTasks > 0 && <span className="text-xs opacity-60">({completedTasks}/{totalTasks})</span>}
        </h2>
        {project.tasks.length > 0 && (
          <div className="space-y-1.5">
            {project.tasks.map(task => (
              <div key={task.id} className="flex items-center gap-3 rounded-lg border border-border bg-card px-3 py-2 group/task">
                <input
                  type="checkbox"
                  checked={task.completed}
                  onChange={() => { startTransition(async () => { await toggleProjectTask(task.id, !task.completed); router.refresh(); }); }}
                  className="h-4 w-4 rounded accent-foreground"
                />
                <span className={`text-sm flex-1 ${task.completed ? "line-through text-muted-foreground" : "text-foreground"}`}>{task.title}</span>
                <button
                  onClick={() => { startTransition(async () => { await deleteProjectTask(task.id); router.refresh(); }); }}
                  className="opacity-0 group-hover/task:opacity-100 p-1 rounded text-muted-foreground hover:text-red-500 transition-all"
                  title={he.common.deleteTask}
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}
        {/* Add task inline */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const input = e.currentTarget.elements.namedItem("newTask") as HTMLInputElement;
            const title = input.value.trim();
            if (!title) return;
            input.value = "";
            startTransition(async () => { await addProjectTask(project.id, title); router.refresh(); });
          }}
          className="flex gap-2"
        >
          <Input name="newTask" placeholder={he.common.addTask} className="flex-1 h-9 text-sm" />
          <Button type="submit" size="sm" variant="outline" className="h-9 px-3">
            <Plus className="h-3.5 w-3.5" />
          </Button>
        </form>
      </motion.div>

      {/* ── Scripts ── */}
      <motion.div variants={fadeUp} id="scripts" className="space-y-3">
        <h2 className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
          <FileText className="h-4 w-4" /> {he.nav.scripts}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {project.scripts.map(s => (
            <Card key={s.id} className="glass-card hover:scale-[1.02] transition-all duration-200 group/item">
              <CardContent className="p-4 flex items-start justify-between">
                <Link href={`/scripts/${s.id}`} className="flex-1 min-w-0">
                  <p className="text-sm font-medium">{s.title}</p>
                  <span className="text-[10px] text-muted-foreground">{formatDate(s.updatedAt)}</span>
                </Link>
                <button onClick={() => handleUnlink("script", s.id)} title={he.common.removeFromProject} className="opacity-0 group-hover/item:opacity-100 p-1 rounded text-muted-foreground hover:text-red-500 transition-all">
                  <X className="h-3.5 w-3.5" />
                </button>
              </CardContent>
            </Card>
          ))}
          <LinkItemDropdown items={unlinked.scripts} onSelect={(id) => handleLink("script", id)} />
        </div>
      </motion.div>

      {/* ── Moodboards ── */}
      <motion.div variants={fadeUp} id="moodboards" className="space-y-3">
        <h2 className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
          <LayoutTemplate className="h-4 w-4" /> Moodboards
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {project.moodboards.map(m => (
            <Card key={m.id} className="glass-card hover:scale-[1.02] transition-all duration-200 group/item">
              <CardContent className="p-4 flex items-start justify-between">
                <Link href={`/moodboard/${m.id}`} className="flex-1 min-w-0">
                  <p className="text-sm font-medium">{m.title}</p>
                  <span className="text-[10px] text-muted-foreground mt-1">{formatDate(m.updatedAt)}</span>
                </Link>
                <button onClick={() => handleUnlink("moodboard", m.id)} title={he.common.removeFromProject} className="opacity-0 group-hover/item:opacity-100 p-1 rounded text-muted-foreground hover:text-red-500 transition-all">
                  <X className="h-3.5 w-3.5" />
                </button>
              </CardContent>
            </Card>
          ))}
          <LinkItemDropdown items={unlinked.moodboards} onSelect={(id) => handleLink("moodboard", id)} />
        </div>
      </motion.div>

      {/* ── Contacts ── */}
      <motion.div variants={fadeUp} id="contacts" className="space-y-3">
        <h2 className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
          <Contact className="h-4 w-4" /> {he.contacts.title}
        </h2>
        <div className="space-y-1.5">
          {project.contacts.map(c => (
            <div key={c.id} className="flex items-center gap-3 rounded-lg border border-border bg-card px-3 py-2 group/item">
              <div className="flex-1 min-w-0 flex items-center gap-2 flex-wrap">
                <span className="text-sm font-medium">{c.name}</span>
                <Badge className="text-[10px] bg-muted border-0 text-muted-foreground">
                  {he.contacts.categories[c.category as keyof typeof he.contacts.categories] ?? c.category}
                </Badge>
                {c.phone && <span className="flex items-center gap-1 text-xs text-muted-foreground"><Phone className="h-3 w-3" /><span dir="ltr">{c.phone}</span></span>}
              </div>
              <button onClick={() => handleUnlink("contact", c.id)} title={he.common.removeFromProject} className="opacity-0 group-hover/item:opacity-100 p-1 rounded text-muted-foreground hover:text-red-500 transition-all">
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
          <LinkItemDropdown items={unlinked.contacts.map(c => ({ id: c.id, title: c.name }))} onSelect={(id) => handleLink("contact", id)} />
        </div>
      </motion.div>

      {/* ── Calendar ── */}
      <motion.div variants={fadeUp} id="calendar" className="space-y-3">
        <h2 className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
          <CalendarDays className="h-4 w-4" /> {he.nav.calendar}
        </h2>
        <div className="space-y-2">
          {project.scheduledContent.map(sc => (
            <div key={sc.id} className="flex items-center gap-3 rounded-lg border border-border bg-card px-4 py-2.5 group/item">
              <div className={`h-2.5 w-2.5 rounded-full bg-${sc.color ?? "gray"}-400 shrink-0`} />
              <span className="text-sm flex-1">{sc.title}</span>
              <Badge className={`text-[10px] border-0 ${statusColors[sc.status] ?? "bg-muted text-muted-foreground"}`}>{he.calendar.statuses[sc.status as keyof typeof he.calendar.statuses] ?? sc.status}</Badge>
              <span className="text-xs text-muted-foreground">{formatDate(sc.date)}</span>
              <button onClick={() => handleUnlink("content", sc.id)} title={he.common.removeFromProject} className="opacity-0 group-hover/item:opacity-100 p-1 rounded text-muted-foreground hover:text-red-500 transition-all">
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
          <LinkItemDropdown items={unlinked.content} onSelect={(id) => handleLink("content", id)} />
        </div>
      </motion.div>

      {/* Edit dialog */}
      <ProjectDialog
        project={project}
        clients={clients}
        open={editOpen}
        onOpenChange={(open) => { setEditOpen(open); if (!open) router.refresh(); }}
      />
    </motion.div>
  );
}
