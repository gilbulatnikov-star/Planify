"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  ArrowRight, Pencil, FileText, LayoutTemplate, Contact,
  CalendarDays, ListTodo, Phone, Mail, Plus, Link2,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ProjectDialog } from "./project-dialog";
import { getPhaseLabel, CATEGORY_LABELS, PROJECT_TYPE_CONFIG } from "@/lib/project-config";
import type { ProjectCategory } from "@/lib/project-config";
import { formatCurrency, formatDate } from "@/lib/utils/format";
import { he } from "@/lib/he";
import { toggleProjectTask, linkScriptToProject, linkMoodboardToProject, linkContactToProject } from "@/lib/actions/project-actions";

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
};

function LinkItemDropdown({ items, label, onSelect }: { items: { id: string; title?: string; name?: string }[]; label: string; onSelect: (id: string) => void }) {
  const [open, setOpen] = useState(false);
  if (items.length === 0) return null;
  return (
    <div className="relative inline-block">
      <button onClick={() => setOpen(!open)} className="flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-1.5 text-xs text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">
        <Plus className="h-3 w-3" /> {label}
      </button>
      {open && (
        <div className="absolute top-full mt-1 right-0 z-50 rounded-xl border border-border bg-card shadow-lg p-1.5 min-w-[180px] max-h-48 overflow-y-auto">
          {items.map(item => (
            <button key={item.id} onClick={() => { onSelect(item.id); setOpen(false); }} className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-xs text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">
              <Link2 className="h-3 w-3 opacity-40" /> {item.title ?? item.name}
            </button>
          ))}
        </div>
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
  const router = useRouter();
  const [editOpen, setEditOpen] = useState(false);
  const [, startTransition] = useTransition();

  function handleLinkScript(scriptId: string) {
    startTransition(async () => { await linkScriptToProject(scriptId, project.id); router.refresh(); });
  }
  function handleLinkMoodboard(moodboardId: string) {
    startTransition(async () => { await linkMoodboardToProject(moodboardId, project.id); router.refresh(); });
  }
  function handleLinkContact(contactId: string) {
    startTransition(async () => { await linkContactToProject(contactId, project.id); router.refresh(); });
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
    { key: "tasks", label: "משימות", icon: ListTodo, count: project.tasks.length },
    { key: "scripts", label: "תסריטים", icon: FileText, count: project.scripts.length },
    { key: "moodboards", label: "Moodboards", icon: LayoutTemplate, count: project.moodboards.length },
    { key: "contacts", label: "אנשי קשר", icon: Contact, count: project.contacts.length },
    { key: "calendar", label: "לוח תוכן", icon: CalendarDays, count: project.scheduledContent.length },
  ];

  return (
    <motion.div initial="hidden" animate="show" variants={{ show: { transition: { staggerChildren: 0.06 } } }} className="space-y-6 max-w-4xl mx-auto">

      {/* Header */}
      <motion.div variants={fadeUp} className="space-y-3">
        <button onClick={() => router.push("/projects")} className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <ArrowRight className="h-4 w-4" />
          חזרה לפרויקטים
        </button>
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">{project.title}</h1>
            {project.client && <p className="text-sm text-muted-foreground mt-1">{project.client.name}</p>}
          </div>
          <Button size="sm" variant="outline" onClick={() => setEditOpen(true)} className="shrink-0">
            <Pencil className="h-3.5 w-3.5 me-1.5" />
            עריכה
          </Button>
        </div>
        <div className="flex flex-wrap gap-2">
          {typeLabel && <Badge variant="outline" className="text-xs border-border text-muted-foreground">{typeLabel}</Badge>}
          <Badge className="text-xs bg-muted border-0 text-muted-foreground">{phaseLabel}</Badge>
        </div>
      </motion.div>

      {/* Info bar */}
      {(project.budget || project.shootDate || project.deadline || project.description) && (
        <motion.div variants={fadeUp} className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {project.budget != null && (
            <div className="rounded-xl border border-border bg-card p-3">
              <p className="text-xs text-muted-foreground">תקציב</p>
              <p className="text-sm font-semibold">{formatCurrency(project.budget)}</p>
            </div>
          )}
          {project.shootDate && (
            <div className="rounded-xl border border-border bg-card p-3">
              <p className="text-xs text-muted-foreground">תאריך</p>
              <p className="text-sm font-semibold">{formatDate(project.shootDate)}</p>
            </div>
          )}
          {project.deadline && (
            <div className="rounded-xl border border-border bg-card p-3">
              <p className="text-xs text-muted-foreground">דדליין</p>
              <p className="text-sm font-semibold">{formatDate(project.deadline)}</p>
            </div>
          )}
          {project.description && (
            <div className="rounded-xl border border-border bg-card p-3 col-span-2 sm:col-span-4">
              <p className="text-xs text-muted-foreground mb-1">תיאור</p>
              <p className="text-sm whitespace-pre-line">{project.description}</p>
            </div>
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
          <ListTodo className="h-4 w-4" /> משימות
          {totalTasks > 0 && <span className="text-xs opacity-60">({completedTasks}/{totalTasks})</span>}
        </h2>
        {project.tasks.length > 0 ? (
          <div className="space-y-1.5">
            {project.tasks.map(task => (
              <div key={task.id} className="flex items-center gap-3 rounded-lg border border-border bg-card px-3 py-2">
                <input
                  type="checkbox"
                  checked={task.completed}
                  onChange={() => { toggleProjectTask(task.id, !task.completed); router.refresh(); }}
                  className="h-4 w-4 rounded accent-foreground"
                />
                <span className={`text-sm flex-1 ${task.completed ? "line-through text-muted-foreground" : "text-foreground"}`}>{task.title}</span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-muted-foreground bg-muted/30 rounded-lg px-4 py-3 text-center">אין משימות</p>
        )}
      </motion.div>

      {/* ── Scripts ── */}
      <motion.div variants={fadeUp} id="scripts" className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
            <FileText className="h-4 w-4" /> תסריטים
          </h2>
          {<LinkItemDropdown items={unlinked.scripts} label="הוסף תסריט" onSelect={handleLinkScript} />}
        </div>
        {project.scripts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {project.scripts.map(s => (
              <Link key={s.id} href={`/scripts/${s.id}`}>
                <Card className="glass-card hover:scale-[1.02] transition-all duration-200 cursor-pointer">
                  <CardContent className="p-4">
                    <p className="text-sm font-medium">{s.title}</p>
                    <div className="flex items-center gap-2 mt-1.5">
                      <Badge className="text-[10px] bg-muted border-0 text-muted-foreground">{s.platform}</Badge>
                      <span className="text-[10px] text-muted-foreground">{formatDate(s.updatedAt)}</span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        ) : (
          <div className="flex items-center justify-center gap-3 bg-muted/30 rounded-lg px-4 py-3">
            <p className="text-xs text-muted-foreground">אין תסריטים</p>
            <LinkItemDropdown items={unlinked.scripts} label="הוסף תסריט" onSelect={handleLinkScript} />
          </div>
        )}
      </motion.div>

      {/* ── Moodboards ── */}
      <motion.div variants={fadeUp} id="moodboards" className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
            <LayoutTemplate className="h-4 w-4" /> Moodboards
          </h2>
          {<LinkItemDropdown items={unlinked.moodboards} label="הוסף Moodboard" onSelect={handleLinkMoodboard} />}
        </div>
        {project.moodboards.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {project.moodboards.map(m => (
              <Link key={m.id} href={`/moodboard/${m.id}`}>
                <Card className="glass-card hover:scale-[1.02] transition-all duration-200 cursor-pointer">
                  <CardContent className="p-4">
                    <p className="text-sm font-medium">{m.title}</p>
                    <span className="text-[10px] text-muted-foreground mt-1">{formatDate(m.updatedAt)}</span>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        ) : (
          <div className="flex items-center justify-center gap-3 bg-muted/30 rounded-lg px-4 py-3">
            <p className="text-xs text-muted-foreground">אין Moodboards</p>
            <LinkItemDropdown items={unlinked.moodboards} label="הוסף Moodboard" onSelect={handleLinkMoodboard} />
          </div>
        )}
      </motion.div>

      {/* ── Contacts ── */}
      <motion.div variants={fadeUp} id="contacts" className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
            <Contact className="h-4 w-4" /> אנשי קשר
          </h2>
          {<LinkItemDropdown items={unlinked.contacts.map(c => ({ id: c.id, title: c.name }))} label="הוסף איש קשר" onSelect={handleLinkContact} />}
        </div>
        {project.contacts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {project.contacts.map(c => (
              <Card key={c.id} className="glass-card">
                <CardContent className="p-4">
                  <p className="text-sm font-medium">{c.name}</p>
                  <Badge className="text-[10px] bg-muted border-0 text-muted-foreground mt-1">
                    {he.contacts.categories[c.category as keyof typeof he.contacts.categories] ?? c.category}
                  </Badge>
                  <div className="flex flex-wrap gap-3 mt-2 text-xs text-muted-foreground">
                    {c.phone && <span className="flex items-center gap-1"><Phone className="h-3 w-3" /><span dir="ltr">{c.phone}</span></span>}
                    {c.email && <span className="flex items-center gap-1"><Mail className="h-3 w-3" />{c.email}</span>}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="flex items-center justify-center gap-3 bg-muted/30 rounded-lg px-4 py-3">
            <p className="text-xs text-muted-foreground">אין אנשי קשר</p>
            <LinkItemDropdown items={unlinked.contacts.map(c => ({ id: c.id, title: c.name }))} label="הוסף איש קשר" onSelect={handleLinkContact} />
          </div>
        )}
      </motion.div>

      {/* ── Calendar ── */}
      <motion.div variants={fadeUp} id="calendar" className="space-y-3">
        <h2 className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
          <CalendarDays className="h-4 w-4" /> לוח תוכן
        </h2>
        {project.scheduledContent.length > 0 ? (
          <div className="space-y-2">
            {project.scheduledContent.map(sc => (
              <div key={sc.id} className="flex items-center gap-3 rounded-lg border border-border bg-card px-4 py-2.5">
                <div className={`h-2.5 w-2.5 rounded-full bg-${sc.color ?? "gray"}-400 shrink-0`} />
                <span className="text-sm flex-1">{sc.title}</span>
                <Badge className={`text-[10px] border-0 ${statusColors[sc.status] ?? "bg-muted text-muted-foreground"}`}>{sc.status}</Badge>
                <span className="text-xs text-muted-foreground">{formatDate(sc.date)}</span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-muted-foreground bg-muted/30 rounded-lg px-4 py-3 text-center">אין תוכן מתוכנן</p>
        )}
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
