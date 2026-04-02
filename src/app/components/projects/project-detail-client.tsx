"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  ArrowRight, Pencil, FileText, LayoutTemplate, Contact,
  CalendarDays, ListTodo, Phone, Mail, Plus, Link2, X, Users, Share2,
  Paperclip, Upload, Image, Video, FileIcon, Trash2, ExternalLink, Loader2,
  Calendar,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ProjectDialog } from "./project-dialog";
import { ShareDialog } from "./share-dialog";
import { getPhaseLabel, CATEGORY_LABELS, PROJECT_TYPE_CONFIG } from "@/lib/project-config";
import type { ProjectCategory } from "@/lib/project-config";
import { formatCurrency, formatDate } from "@/lib/utils/format";
import { useT, useLocale } from "@/lib/i18n";
import { toggleProjectTask, addProjectTask, deleteProjectTask, linkItemToProject, updateProjectClient } from "@/lib/actions/project-actions";
import { addProjectFile, deleteProjectFile, getProjectFiles } from "@/lib/actions/share-actions";
import { createScript, updateScript } from "@/lib/actions/script-actions";
import { createScheduledContent } from "@/lib/actions/calendar-actions";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectTrigger, SelectContent, SelectItem } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { DatePicker } from "@/components/ui/date-picker";

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
      <button onClick={() => setOpen(!open)} className="flex items-center justify-center w-full min-h-[72px] rounded-[14px] border border-dashed border-border/40 text-foreground/25 hover:bg-foreground/[0.02] hover:text-foreground/40 hover:border-border/60 transition-colors duration-200">
        <Plus className="h-5 w-5" />
      </button>
      {open && (
        <div className="absolute top-full mt-1 right-0 z-50 rounded-[12px] border border-border/40 bg-card shadow-[0_4px_20px_-4px_rgba(0,0,0,0.1)] p-1.5 min-w-[180px] max-h-48 overflow-y-auto">
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

const PLATFORMS = [
  { value: "youtube",   label: "YouTube"   },
  { value: "instagram", label: "Instagram" },
  { value: "tiktok",    label: "TikTok"    },
  { value: "facebook",  label: "Facebook"  },
  { value: "linkedin",  label: "LinkedIn"  },
  { value: "podcast",   label: "Podcast"   },
  { value: "other",     label: "אחר"       },
];

function NewScriptDialog({
  open,
  onOpenChange,
  projectId,
  clientId,
  isPending,
  startTransition,
  onDone,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  projectId: string;
  clientId: string | null;
  isPending: boolean;
  startTransition: React.TransitionStartFunction;
  onDone: () => void;
}) {
  const [title, setTitle] = useState("");
  const [platform, setPlatform] = useState("youtube");
  const [content, setContent] = useState("");
  const [addToCalendar, setAddToCalendar] = useState(false);
  const [calDate, setCalDate] = useState("");
  const [calStatus, setCalStatus] = useState("planned");
  const [error, setError] = useState<string | null>(null);

  function reset() {
    setTitle(""); setPlatform("youtube"); setContent("");
    setAddToCalendar(false); setCalDate(""); setCalStatus("planned");
    setError(null);
  }

  function handleOpenChange(v: boolean) {
    if (!v) reset();
    onOpenChange(v);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) { setError("יש להזין כותרת"); return; }
    if (addToCalendar && !calDate) { setError("יש לבחור תאריך ללוח תוכן"); return; }
    setError(null);

    startTransition(async () => {
      // 1. Create the script
      const result = await createScript({ title: title.trim(), platform, projectId, clientId: clientId ?? undefined });
      if (!result || !("id" in result)) {
        setError(result && "quotaExceeded" in result ? "הגעת למגבלת התסריטים בחשבונך" : "שגיאה ביצירת התסריט");
        return;
      }

      // 2. Save content if provided
      if (content.trim()) {
        await updateScript(result.id, { content: content.trim() });
      }

      // 3. Optionally add to content calendar
      if (addToCalendar && calDate) {
        const fd = new FormData();
        fd.set("title", title.trim());
        fd.set("date", calDate);
        fd.set("status", calStatus);
        fd.set("projectId", projectId);
        if (clientId) fd.set("clientId", clientId);
        fd.set("color", "blue");
        await createScheduledContent(fd);
      }

      reset();
      onOpenChange(false);
      onDone();
    });
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>תסריט חדש לפרויקט</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          {/* Title */}
          <div className="space-y-1.5">
            <Label htmlFor="ns-title">כותרת</Label>
            <Input
              id="ns-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="שם התסריט..."
              required
            />
          </div>

          {/* Platform */}
          <div className="space-y-1.5">
            <Label>פלטפורמה</Label>
            <Select value={platform} onValueChange={(v) => { if (v) setPlatform(v); }}>
              <SelectTrigger className="w-full">
                <span className="flex flex-1">{PLATFORMS.find(p => p.value === platform)?.label}</span>
              </SelectTrigger>
              <SelectContent>
                {PLATFORMS.map(p => (
                  <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Content */}
          <div className="space-y-1.5">
            <Label htmlFor="ns-content">תוכן התסריט (אופציונלי)</Label>
            <Textarea
              id="ns-content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="כתוב את התסריט כאן..."
              className="min-h-[140px] resize-y text-sm"
            />
          </div>

          {/* Add to calendar toggle */}
          <div className="rounded-xl border border-border/50 bg-muted/30 p-3 space-y-3">
            <button
              type="button"
              onClick={() => setAddToCalendar(v => !v)}
              className="flex items-center gap-2 text-sm font-medium text-foreground/80 hover:text-foreground transition-colors w-full"
            >
              <Calendar className="h-4 w-4 text-muted-foreground" />
              הוסף ללוח תוכן
              <div className={`mr-auto h-5 w-9 rounded-full transition-colors ${addToCalendar ? "bg-blue-600" : "bg-muted-foreground/30"} relative`}>
                <div className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform ${addToCalendar ? "-translate-x-0.5 right-0.5" : "right-4"}`} />
              </div>
            </button>

            {addToCalendar && (
              <div className="space-y-3 pt-1 border-t border-border/40">
                <div className="space-y-1.5">
                  <Label>תאריך פרסום</Label>
                  <DatePicker value={calDate} onChange={setCalDate} placeholder="בחר תאריך" />
                </div>
                <div className="space-y-1.5">
                  <Label>סטטוס</Label>
                  <Select value={calStatus} onValueChange={(v) => { if (v) setCalStatus(v); }}>
                    <SelectTrigger className="w-full">
                      <span className="flex flex-1">
                        {{ planned: "מתוכנן", editing: "בעריכה", ready: "מוכן", published: "פורסם" }[calStatus] ?? "מתוכנן"}
                      </span>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="planned">מתוכנן</SelectItem>
                      <SelectItem value="editing">בעריכה</SelectItem>
                      <SelectItem value="ready">מוכן</SelectItem>
                      <SelectItem value="published">פורסם</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}
          </div>

          {error && <p className="text-sm text-red-500 bg-red-50 dark:bg-red-950/30 rounded-lg px-3 py-2">{error}</p>}

          <DialogFooter className="gap-2">
            <DialogClose render={<Button type="button" variant="outline" />}>ביטול</DialogClose>
            <Button type="submit" disabled={isPending}>
              {isPending ? "שומר..." : "צור תסריט"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
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
  const [shareOpen, setShareOpen] = useState(false);
  const [newScriptOpen, setNewScriptOpen] = useState(false);
  const [newScriptPending, startNewScript] = useTransition();
  const [, startTransition] = useTransition();
  const [quickTool, setQuickTool] = useState<"script" | "event" | "task" | null>(null);
  // Quick-add form state
  const [qaScriptTitle, setQaScriptTitle] = useState("");
  const [qaScriptPlatform, setQaScriptPlatform] = useState("youtube");
  const [qaScriptContent, setQaScriptContent] = useState("");
  const [qaScriptAddCal, setQaScriptAddCal] = useState(false);
  const [qaScriptDate, setQaScriptDate] = useState("");
  const [qaScriptStatus, setQaScriptStatus] = useState("planned");
  const [qaEventTitle, setQaEventTitle] = useState("");
  const [qaEventDate, setQaEventDate] = useState("");
  const [qaEventStatus, setQaEventStatus] = useState("planned");
  const [qaTaskTitle, setQaTaskTitle] = useState("");
  const [qaError, setQaError] = useState<string | null>(null);
  const [qaSubmitting, startQa] = useTransition();

  function resetQuickAdd() {
    setQaScriptTitle(""); setQaScriptPlatform("youtube"); setQaScriptContent("");
    setQaScriptAddCal(false); setQaScriptDate(""); setQaScriptStatus("planned");
    setQaEventTitle(""); setQaEventDate(""); setQaEventStatus("planned");
    setQaTaskTitle(""); setQaError(null);
  }

  function toggleQuickTool(tool: "script" | "event" | "task") {
    if (quickTool === tool) { setQuickTool(null); resetQuickAdd(); }
    else { setQuickTool(tool); resetQuickAdd(); }
  }

  function handleQaScript(e: React.FormEvent) {
    e.preventDefault();
    if (!qaScriptTitle.trim()) { setQaError("יש להזין כותרת"); return; }
    if (qaScriptAddCal && !qaScriptDate) { setQaError("יש לבחור תאריך"); return; }
    setQaError(null);
    startQa(async () => {
      const result = await createScript({ title: qaScriptTitle.trim(), platform: qaScriptPlatform, projectId: project.id, clientId: project.clientId ?? undefined });
      if (!result || !("id" in result)) { setQaError("שגיאה ביצירת התסריט"); return; }
      if (qaScriptContent.trim()) await updateScript(result.id, { content: qaScriptContent.trim() });
      if (qaScriptAddCal && qaScriptDate) {
        const fd = new FormData();
        fd.set("title", qaScriptTitle.trim()); fd.set("date", qaScriptDate);
        fd.set("status", qaScriptStatus); fd.set("projectId", project.id);
        if (project.clientId) fd.set("clientId", project.clientId);
        fd.set("color", "blue");
        await createScheduledContent(fd);
      }
      resetQuickAdd(); setQuickTool(null); router.refresh();
    });
  }

  function handleQaEvent(e: React.FormEvent) {
    e.preventDefault();
    if (!qaEventTitle.trim()) { setQaError("יש להזין כותרת"); return; }
    if (!qaEventDate) { setQaError("יש לבחור תאריך"); return; }
    setQaError(null);
    startQa(async () => {
      const fd = new FormData();
      fd.set("title", qaEventTitle.trim()); fd.set("date", qaEventDate);
      fd.set("status", qaEventStatus); fd.set("projectId", project.id);
      if (project.clientId) fd.set("clientId", project.clientId);
      fd.set("color", "gray");
      const res = await createScheduledContent(fd);
      if (!res.success) { setQaError("שגיאה ביצירת האירוע"); return; }
      resetQuickAdd(); setQuickTool(null); router.refresh();
    });
  }

  function handleQaTask(e: React.FormEvent) {
    e.preventDefault();
    if (!qaTaskTitle.trim()) { setQaError("יש להזין משימה"); return; }
    setQaError(null);
    startQa(async () => {
      await addProjectTask(project.id, qaTaskTitle.trim());
      resetQuickAdd(); setQuickTool(null); router.refresh();
    });
  }

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

  // Files state
  const [files, setFiles] = useState<{ id: string; name: string; url: string; type: string; mimeType: string | null; size: number | null; isShared: boolean }[]>([]);
  const [filesLoaded, setFilesLoaded] = useState(false);
  const [uploading, setUploading] = useState(false);

  // Load files on mount
  useState(() => {
    getProjectFiles(project.id).then((f) => { setFiles(f); setFilesLoaded(true); });
  });

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const fileList = e.target.files;
    if (!fileList || fileList.length === 0) return;
    setUploading(true);
    try {
      for (const file of Array.from(fileList)) {
        const formData = new FormData();
        formData.append("file", file);
        const res = await fetch("/api/upload-file", { method: "POST", body: formData });
        if (!res.ok) continue;
        const { url } = await res.json();
        const fileType = file.type.startsWith("image/") ? "image" : file.type.startsWith("video/") ? "video" : "document";
        await addProjectFile(project.id, { name: file.name, url, type: fileType, mimeType: file.type, size: file.size });
      }
      const updated = await getProjectFiles(project.id);
      setFiles(updated);
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  }

  async function handleDeleteFile(fileId: string) {
    await deleteProjectFile(fileId);
    setFiles(prev => prev.filter(f => f.id !== fileId));
  }

  function formatFileSize(bytes: number | null) {
    if (!bytes) return "";
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }

  const fileTypeIcon = (type: string) => {
    switch (type) {
      case "image": return Image;
      case "video": return Video;
      case "link": return Link2;
      case "deliverable": return Paperclip;
      default: return FileIcon;
    }
  };

  const sections = [
    { key: "tasks", label: he.common.tasks, icon: ListTodo, count: project.tasks.length },
    { key: "scripts", label: he.nav.scripts, icon: FileText, count: project.scripts.length },
    { key: "moodboards", label: he.nav.moodboard, icon: LayoutTemplate, count: project.moodboards.length },
    { key: "contacts", label: he.contacts.title, icon: Contact, count: project.contacts.length },
    { key: "calendar", label: he.nav.calendar, icon: CalendarDays, count: project.scheduledContent.length },
    { key: "files", label: he.share?.files ?? "קבצים", icon: Paperclip, count: files.length },
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
            <h1 className="text-[22px] font-extrabold tracking-[-0.03em] text-foreground">{project.title}</h1>
            <ClientPicker
              clients={clients}
              currentClientId={project.clientId}
              currentClientName={project.client?.name ?? null}
              onSelect={(clientId) => { startTransition(async () => { await updateProjectClient(project.id, clientId); router.refresh(); }); }}
            />
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Button size="sm" variant="outline" onClick={() => setShareOpen(true)}>
              <Share2 className="h-3.5 w-3.5 me-1.5" />
              {he.share?.title ?? "שתף"}
            </Button>
            <Button size="sm" variant="outline" onClick={() => setEditOpen(true)}>
              <Pencil className="h-3.5 w-3.5 me-1.5" />
              {he.common.edit}
            </Button>
          </div>
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
            <span className="text-xs opacity-60">({s.count})</span>
          </a>
        ))}
      </motion.div>

      {/* ── Quick Add ── */}
      <motion.div variants={fadeUp} className="space-y-3">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => toggleQuickTool("script")}
            className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${quickTool === "script" ? "bg-foreground text-background" : "bg-muted text-muted-foreground hover:text-foreground"}`}
          >
            <FileText className="h-3.5 w-3.5" />
            תסריט
          </button>
          <button
            type="button"
            onClick={() => toggleQuickTool("event")}
            className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${quickTool === "event" ? "bg-foreground text-background" : "bg-muted text-muted-foreground hover:text-foreground"}`}
          >
            <CalendarDays className="h-3.5 w-3.5" />
            אירוע בלוח
          </button>
          <button
            type="button"
            onClick={() => toggleQuickTool("task")}
            className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${quickTool === "task" ? "bg-foreground text-background" : "bg-muted text-muted-foreground hover:text-foreground"}`}
          >
            <ListTodo className="h-3.5 w-3.5" />
            משימה
          </button>
        </div>

        {quickTool && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="rounded-xl border border-dashed border-border/60 bg-muted/20 p-4 space-y-3"
          >
            {/* Script form */}
            {quickTool === "script" && (
              <form onSubmit={handleQaScript} className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs">כותרת</Label>
                    <Input value={qaScriptTitle} onChange={e => setQaScriptTitle(e.target.value)} placeholder="שם התסריט..." className="h-8 text-sm" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">פלטפורמה</Label>
                    <Select value={qaScriptPlatform} onValueChange={v => { if (v) setQaScriptPlatform(v); }}>
                      <SelectTrigger className="w-full h-8 text-sm">
                        <span className="flex flex-1 text-sm">{PLATFORMS.find(p => p.value === qaScriptPlatform)?.label}</span>
                      </SelectTrigger>
                      <SelectContent>
                        {PLATFORMS.map(p => <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">תוכן (אופציונלי)</Label>
                  <Textarea value={qaScriptContent} onChange={e => setQaScriptContent(e.target.value)} placeholder="כתוב את התסריט כאן..." className="min-h-[80px] resize-y text-sm" />
                </div>
                <div className="rounded-xl border border-border/50 bg-muted/30 p-3 space-y-3">
                  <button type="button" onClick={() => setQaScriptAddCal(v => !v)} className="flex items-center gap-2 text-sm font-medium text-foreground/80 hover:text-foreground transition-colors w-full">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    הוסף ללוח תוכן
                    <div className={`mr-auto h-5 w-9 rounded-full transition-colors ${qaScriptAddCal ? "bg-blue-600" : "bg-muted-foreground/30"} relative`}>
                      <div className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform ${qaScriptAddCal ? "-translate-x-0.5 right-0.5" : "right-4"}`} />
                    </div>
                  </button>
                  {qaScriptAddCal && (
                    <div className="space-y-3 pt-1 border-t border-border/40">
                      <div className="space-y-1.5">
                        <Label className="text-xs">תאריך פרסום</Label>
                        <DatePicker value={qaScriptDate} onChange={setQaScriptDate} placeholder="בחר תאריך" />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs">סטטוס</Label>
                        <Select value={qaScriptStatus} onValueChange={v => { if (v) setQaScriptStatus(v); }}>
                          <SelectTrigger className="w-full">
                            <span className="flex flex-1">{{ planned: "מתוכנן", editing: "בעריכה", ready: "מוכן", published: "פורסם" }[qaScriptStatus] ?? "מתוכנן"}</span>
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="planned">מתוכנן</SelectItem>
                            <SelectItem value="editing">בעריכה</SelectItem>
                            <SelectItem value="ready">מוכן</SelectItem>
                            <SelectItem value="published">פורסם</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  )}
                </div>
                {qaError && <p className="text-xs text-red-500">{qaError}</p>}
                <div className="flex justify-end">
                  <Button type="submit" size="sm" disabled={qaSubmitting}>{qaSubmitting ? "יוצר..." : "צור תסריט"}</Button>
                </div>
              </form>
            )}

            {/* Calendar event form */}
            {quickTool === "event" && (
              <form onSubmit={handleQaEvent} className="space-y-3">
                <div className="space-y-1.5">
                  <Label className="text-xs">כותרת</Label>
                  <Input value={qaEventTitle} onChange={e => setQaEventTitle(e.target.value)} placeholder="שם האירוע..." className="h-8 text-sm" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs">תאריך</Label>
                    <DatePicker value={qaEventDate} onChange={setQaEventDate} placeholder="בחר תאריך" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">סטטוס</Label>
                    <Select value={qaEventStatus} onValueChange={v => { if (v) setQaEventStatus(v); }}>
                      <SelectTrigger className="w-full h-8 text-sm">
                        <span className="flex flex-1 text-sm">{{ planned: "מתוכנן", editing: "בעריכה", ready: "מוכן", published: "פורסם" }[qaEventStatus] ?? "מתוכנן"}</span>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="planned">מתוכנן</SelectItem>
                        <SelectItem value="editing">בעריכה</SelectItem>
                        <SelectItem value="ready">מוכן</SelectItem>
                        <SelectItem value="published">פורסם</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                {qaError && <p className="text-xs text-red-500">{qaError}</p>}
                <div className="flex justify-end">
                  <Button type="submit" size="sm" disabled={qaSubmitting}>{qaSubmitting ? "יוצר..." : "הוסף ללוח"}</Button>
                </div>
              </form>
            )}

            {/* Task form */}
            {quickTool === "task" && (
              <form onSubmit={handleQaTask} className="space-y-3">
                <div className="space-y-1.5">
                  <Label className="text-xs">משימה</Label>
                  <Input value={qaTaskTitle} onChange={e => setQaTaskTitle(e.target.value)} placeholder="תאר את המשימה..." className="h-8 text-sm" />
                </div>
                {qaError && <p className="text-xs text-red-500">{qaError}</p>}
                <div className="flex justify-end">
                  <Button type="submit" size="sm" disabled={qaSubmitting}>{qaSubmitting ? "מוסיף..." : "הוסף משימה"}</Button>
                </div>
              </form>
            )}
          </motion.div>
        )}
      </motion.div>

      {/* ── Tasks ── */}
      <motion.div variants={fadeUp} id="tasks" className="space-y-3">
        <h2 className="text-[10.5px] font-bold tracking-[0.1em] uppercase text-foreground/50 flex items-center gap-2">
          <ListTodo className="h-3.5 w-3.5 text-foreground/30" strokeWidth={2} /> {he.common.tasks}
          {totalTasks > 0 && <span className="text-[9.5px] font-bold text-foreground/30 tabular-nums">({completedTasks}/{totalTasks})</span>}
        </h2>
        {project.tasks.length > 0 && (
          <div className="space-y-1.5">
            {project.tasks.map(task => (
              <div key={task.id} className="flex items-center gap-3 rounded-[10px] border border-border/40 bg-card px-3.5 py-2.5 group/task hover:bg-foreground/[0.02] transition-colors duration-200">
                <input
                  type="checkbox"
                  checked={task.completed}
                  onChange={() => { startTransition(async () => { await toggleProjectTask(task.id, !task.completed); router.refresh(); }); }}
                  className="h-4 w-4 rounded accent-accent"
                />
                <span className={`text-[13px] flex-1 ${task.completed ? "line-through text-foreground/35" : "text-foreground/85 font-medium"}`}>{task.title}</span>
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
        <h2 className="text-[10.5px] font-bold tracking-[0.1em] uppercase text-foreground/50 flex items-center gap-2">
          <FileText className="h-3.5 w-3.5 text-foreground/30" strokeWidth={2} /> {he.nav.scripts}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {project.scripts.map(s => (
            <Card key={s.id} className="glass-card hover:border-border/60 hover:shadow-[0_4px_16px_-4px_rgba(0,0,0,0.08)] transition-all duration-300 group/item">
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

      {/* ── New Script Dialog ── */}
      <NewScriptDialog
        open={newScriptOpen}
        onOpenChange={setNewScriptOpen}
        projectId={project.id}
        clientId={project.clientId}
        isPending={newScriptPending}
        startTransition={startNewScript}
        onDone={() => router.refresh()}
      />

      {/* ── Moodboards ── */}
      <motion.div variants={fadeUp} id="moodboards" className="space-y-3">
        <h2 className="text-[10.5px] font-bold tracking-[0.1em] uppercase text-foreground/50 flex items-center gap-2">
          <LayoutTemplate className="h-3.5 w-3.5 text-foreground/30" strokeWidth={2} /> Moodboards
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {project.moodboards.map(m => (
            <Card key={m.id} className="glass-card hover:border-border/60 hover:shadow-[0_4px_16px_-4px_rgba(0,0,0,0.08)] transition-all duration-300 group/item">
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
        <h2 className="text-[10.5px] font-bold tracking-[0.1em] uppercase text-foreground/50 flex items-center gap-2">
          <Contact className="h-3.5 w-3.5 text-foreground/30" strokeWidth={2} /> {he.contacts.title}
        </h2>
        <div className="space-y-1.5">
          {project.contacts.map(c => (
            <div key={c.id} className="flex items-center gap-3 rounded-[10px] border border-border/40 bg-card px-3.5 py-2.5 group/item hover:bg-foreground/[0.02] transition-colors duration-200">
              <div className="flex-1 min-w-0 flex items-center gap-2 flex-wrap">
                <span className="text-sm font-medium">{c.name}</span>
                <Badge className="text-xs bg-muted border-0 text-muted-foreground">
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
        <h2 className="text-[10.5px] font-bold tracking-[0.1em] uppercase text-foreground/50 flex items-center gap-2">
          <CalendarDays className="h-3.5 w-3.5 text-foreground/30" strokeWidth={2} /> {he.nav.calendar}
        </h2>
        <div className="space-y-2">
          {project.scheduledContent.map(sc => (
            <div key={sc.id} className="flex items-center gap-3 rounded-[10px] border border-border/40 bg-card px-3.5 py-2.5 group/item hover:bg-foreground/[0.02] transition-colors duration-200">
              <div className={`h-2.5 w-2.5 rounded-full bg-${sc.color ?? "gray"}-400 shrink-0`} />
              <span className="text-sm flex-1">{sc.title}</span>
              <Badge className={`text-xs border-0 ${statusColors[sc.status] ?? "bg-muted text-muted-foreground"}`}>{he.calendar.statuses[sc.status as keyof typeof he.calendar.statuses] ?? sc.status}</Badge>
              <span className="text-xs text-muted-foreground">{formatDate(sc.date)}</span>
              <button onClick={() => handleUnlink("content", sc.id)} title={he.common.removeFromProject} className="opacity-0 group-hover/item:opacity-100 p-1 rounded text-muted-foreground hover:text-red-500 transition-all">
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
          <LinkItemDropdown items={unlinked.content} onSelect={(id) => handleLink("content", id)} />
        </div>
      </motion.div>

      {/* ── Files ── */}
      <motion.div variants={fadeUp} id="files" className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-[10.5px] font-bold tracking-[0.1em] uppercase text-foreground/50 flex items-center gap-2">
            <Paperclip className="h-3.5 w-3.5 text-foreground/30" strokeWidth={2} /> {he.share?.files ?? "קבצים"}
          </h2>
          <label className="cursor-pointer">
            <input type="file" multiple className="hidden" onChange={handleFileUpload} disabled={uploading} />
            <span className="flex items-center gap-1.5 rounded-full bg-muted px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-colors">
              {uploading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Upload className="h-3.5 w-3.5" />}
              {he.share?.uploadFile ?? "העלה קובץ"}
            </span>
          </label>
        </div>
        {files.length > 0 ? (
          <div className="space-y-1.5">
            {files.map(file => {
              const Icon = fileTypeIcon(file.type);
              return (
                <div key={file.id} className="flex items-center gap-3 rounded-[10px] border border-border/40 bg-card px-3.5 py-2.5 group/item hover:bg-foreground/[0.02] transition-colors duration-200">
                  <Icon className="h-4 w-4 text-muted-foreground shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{file.name}</p>
                    <p className="text-[10px] text-muted-foreground">{formatFileSize(file.size)}</p>
                  </div>
                  {file.isShared && (
                    <Badge className="text-[9px] bg-emerald-100 text-emerald-700 border-0 dark:bg-emerald-950 dark:text-emerald-300">
                      {he.share?.fileShared ?? "משותף"}
                    </Badge>
                  )}
                  <a href={file.url} target="_blank" rel="noopener noreferrer" className="p-1 rounded text-muted-foreground hover:text-foreground transition-colors">
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                  <button
                    onClick={() => handleDeleteFile(file.id)}
                    className="opacity-0 group-hover/item:opacity-100 p-1 rounded text-muted-foreground hover:text-red-500 transition-all"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              );
            })}
          </div>
        ) : filesLoaded ? (
          <div className="flex flex-col items-center justify-center py-8 rounded-[14px] border border-dashed border-border/40 text-center">
            <Paperclip className="h-6 w-6 text-foreground/20 mb-2" />
            <p className="text-[12px] text-foreground/40">{he.share?.noFiles ?? "אין קבצים"}</p>
          </div>
        ) : null}
      </motion.div>

      {/* Edit dialog */}
      <ProjectDialog
        project={project}
        clients={clients}
        open={editOpen}
        onOpenChange={(open) => { setEditOpen(open); if (!open) router.refresh(); }}
      />

      {/* Share dialog */}
      <ShareDialog
        projectId={project.id}
        open={shareOpen}
        onOpenChange={setShareOpen}
      />
    </motion.div>
  );
}
