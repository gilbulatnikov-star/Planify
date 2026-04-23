"use client";

import { useEffect, useState, useRef, useTransition } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import { SearchableSelect } from "@/components/ui/searchable-select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { DatePicker } from "@/components/ui/date-picker";
import { Button } from "@/components/ui/button";
import { createProject, updateProject, addProjectTask } from "@/lib/actions/project-actions";
import { createClientQuick } from "@/lib/actions/client-actions";
import { createScript } from "@/lib/actions/script-actions";
import { createScheduledContent } from "@/lib/actions/calendar-actions";
import { Plus, X, FileText, CalendarDays, ListTodo, CheckCircle2, ArrowLeft, Loader2, ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useT } from "@/lib/i18n";

/* ─────────────────────────────────────────────────────────────
   Types
───────────────────────────────────────────────────────────── */
interface ProjectDialogProps {
  project?: {
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
  } | null;
  clients: { id: string; name: string }[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onQuotaExceeded?: () => void;
  defaultClientId?: string;
  /** Called after successful creation — projectId, title, clientId */
  onCreated?: (projectId: string, title: string, clientId: string) => void;
}

interface QuickAddDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId: string;
  projectTitle: string;
  clientId: string;
  onGoToProject: () => void;
}

/* ─────────────────────────────────────────────────────────────
   Helpers
───────────────────────────────────────────────────────────── */
function formatDateForInput(date: Date | null | undefined): string {
  if (!date) return "";
  const d = new Date(date);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
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

type QuickTool = "script" | "event" | "task" | null;

/* ─────────────────────────────────────────────────────────────
   QuickAddDialog — separate dialog, shown AFTER project is created
   Unaffected by revalidatePath re-renders in the parent page
───────────────────────────────────────────────────────────── */
export function QuickAddDialog({
  open,
  onOpenChange,
  projectId,
  projectTitle,
  clientId,
  onGoToProject,
}: QuickAddDialogProps) {
  const [activeTool, setActiveTool] = useState<QuickTool>(null);
  // Use plain useState (NOT useTransition) — useTransition can be interrupted by
  // the router refresh triggered by revalidatePath, causing post-await setState calls to be lost
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const doneRef = useRef<Set<string>>(new Set());
  const [doneVersion, setDoneVersion] = useState(0); // increment to force re-render

  function markDone(tool: string) {
    doneRef.current.add(tool);
    setDoneVersion((v) => v + 1);
  }

  // Script fields
  const [scriptTitle, setScriptTitle]       = useState("");
  const [scriptPlatform, setScriptPlatform] = useState("youtube");
  const [scriptContent, setScriptContent]   = useState("");

  // Event fields
  const [eventTitle, setEventTitle]   = useState("");
  const [eventDate, setEventDate]     = useState("");
  const [eventStatus, setEventStatus] = useState("planned");

  // Task fields
  const [taskTitle, setTaskTitle] = useState("");

  function resetTool(tool: QuickTool) {
    setError(null);
    setScriptTitle(""); setScriptPlatform("youtube"); setScriptContent("");
    setEventTitle(""); setEventDate(""); setEventStatus("planned");
    setTaskTitle("");
    setActiveTool(activeTool === tool ? null : tool);
  }

  async function handleScript(e: React.FormEvent) {
    e.preventDefault();
    if (!scriptTitle.trim()) { setError("יש להזין כותרת"); return; }
    setError(null);
    setIsPending(true);
    try {
      const r = await createScript({
        title: scriptTitle.trim(),
        platform: scriptPlatform,
        content: scriptContent.trim() || undefined,
        projectId,
        clientId: clientId || undefined,
      });
      if (!r || !("id" in r)) { setError("שגיאה ביצירת התסריט"); return; }
      markDone("script");
      setActiveTool(null);
      setScriptTitle(""); setScriptPlatform("youtube"); setScriptContent("");
    } catch {
      setError("שגיאה ביצירת התסריט");
    } finally {
      setIsPending(false);
    }
  }

  async function handleEvent(e: React.FormEvent) {
    e.preventDefault();
    if (!eventTitle.trim()) { setError("יש להזין כותרת"); return; }
    if (!eventDate) { setError("יש לבחור תאריך"); return; }
    setError(null);
    setIsPending(true);
    try {
      const fd = new FormData();
      fd.set("title", eventTitle.trim()); fd.set("date", eventDate);
      fd.set("status", eventStatus); fd.set("projectId", projectId);
      if (clientId) fd.set("clientId", clientId);
      fd.set("color", "blue");
      const r = await createScheduledContent(fd);
      if (!r.success) { setError("שגיאה ביצירת האירוע"); return; }
      markDone("event");
      setActiveTool(null);
      setEventTitle(""); setEventDate("");
    } catch {
      setError("שגיאה ביצירת האירוע");
    } finally {
      setIsPending(false);
    }
  }

  async function handleTask(e: React.FormEvent) {
    e.preventDefault();
    if (!taskTitle.trim()) { setError("יש להזין משימה"); return; }
    setError(null);
    setIsPending(true);
    try {
      const result = await addProjectTask(projectId, taskTitle.trim());
      if (!result.success) { setError("שגיאה ביצירת המשימה"); return; }
      markDone("task");
      setActiveTool(null);
      setTaskTitle("");
    } catch {
      setError("שגיאה ביצירת המשימה");
    } finally {
      setIsPending(false);
    }
  }

  const tools = [
    { id: "script" as const, icon: FileText,     label: "תסריט",     color: "text-blue-500",    bg: "bg-blue-50 dark:bg-blue-950/30",     border: "border-blue-200 dark:border-blue-800/40"    },
    { id: "event"  as const, icon: CalendarDays,  label: "לוח תוכן",  color: "text-violet-500",  bg: "bg-violet-50 dark:bg-violet-950/30",  border: "border-violet-200 dark:border-violet-800/40"  },
    { id: "task"   as const, icon: ListTodo,      label: "משימה",     color: "text-emerald-500", bg: "bg-emerald-50 dark:bg-emerald-950/30",border: "border-emerald-200 dark:border-emerald-800/40" },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md" dir="rtl">
        <DialogHeader>
          <DialogTitle>הוסף לפרויקט</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 pb-2">
          {/* Success banner */}
          <div className="flex items-center gap-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/40 px-4 py-3">
            <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0" />
            <div>
              <p className="text-sm font-semibold text-foreground">הפרויקט נוצר בהצלחה!</p>
              <p className="text-xs text-muted-foreground mt-0.5">"{projectTitle}" — רוצה להוסיף משהו עכשיו?</p>
            </div>
          </div>

          {/* Tool buttons */}
          <div className="grid grid-cols-3 gap-2">
            {tools.map((t) => {
              const isActive = activeTool === t.id;
              const isDone   = doneRef.current.has(t.id);
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => resetTool(t.id)}
                  className={`flex flex-col items-center gap-1.5 rounded-xl border p-3 transition-all duration-150 ${
                    isActive
                      ? `${t.bg} ${t.border} shadow-sm`
                      : "border-border/40 hover:border-border hover:bg-muted/40"
                  }`}
                >
                  <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${isActive ? t.bg : "bg-muted/50"}`}>
                    <t.icon className={`h-4 w-4 ${isActive ? t.color : "text-muted-foreground"}`} />
                  </div>
                  <span className={`text-xs font-semibold leading-tight ${isActive ? "text-foreground" : "text-muted-foreground"}`}>
                    {t.label}
                  </span>
                  {isDone && (
                    <span className="text-[9px] font-semibold text-emerald-600 bg-emerald-100 dark:bg-emerald-900/40 rounded px-1.5 py-0.5">✓ נוסף</span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Script mini-form */}
          {activeTool === "script" && (
            <form onSubmit={handleScript} className="space-y-3 rounded-xl border border-border/50 bg-muted/20 p-3.5">
              <p className="text-[11px] font-bold text-foreground/50 uppercase tracking-wider">פרטי התסריט</p>
              <div className="space-y-1.5">
                <Label className="text-xs">כותרת</Label>
                <Input value={scriptTitle} onChange={(e) => setScriptTitle(e.target.value)} placeholder="שם התסריט..." className="h-9 text-sm" autoFocus />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">פלטפורמה</Label>
                <Select value={scriptPlatform} onValueChange={(v) => { if (v) setScriptPlatform(v); }}>
                  <SelectTrigger className="h-9 text-sm w-full">
                    <span className="flex flex-1">{PLATFORMS.find(p => p.value === scriptPlatform)?.label}</span>
                  </SelectTrigger>
                  <SelectContent>{PLATFORMS.map(p => <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">תוכן <span className="text-muted-foreground/50 font-normal">(אופציונלי)</span></Label>
                <Textarea value={scriptContent} onChange={(e) => setScriptContent(e.target.value)} placeholder="כתוב את התסריט כאן..." className="min-h-[80px] text-sm resize-y" />
              </div>
              {error && <p className="text-xs text-red-500">{error}</p>}
              <Button type="submit" size="sm" disabled={isPending} className="w-full h-8">
                {isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : "הוסף תסריט"}
              </Button>
            </form>
          )}

          {/* Event mini-form */}
          {activeTool === "event" && (
            <form onSubmit={handleEvent} className="space-y-3 rounded-xl border border-border/50 bg-muted/20 p-3.5">
              <p className="text-[11px] font-bold text-foreground/50 uppercase tracking-wider">פרטי האירוע</p>
              <div className="space-y-1.5">
                <Label className="text-xs">כותרת</Label>
                <Input value={eventTitle} onChange={(e) => setEventTitle(e.target.value)} placeholder="שם האירוע..." className="h-9 text-sm" autoFocus />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1.5">
                  <Label className="text-xs">תאריך</Label>
                  <DatePicker value={eventDate} onChange={setEventDate} placeholder="בחר תאריך" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">סטטוס</Label>
                  <Select value={eventStatus} onValueChange={(v) => { if (v) setEventStatus(v); }}>
                    <SelectTrigger className="h-9 text-sm w-full">
                      <span className="flex flex-1">{{ planned: "מתוכנן", editing: "בעריכה", ready: "מוכן", published: "פורסם" }[eventStatus] ?? "מתוכנן"}</span>
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
              {error && <p className="text-xs text-red-500">{error}</p>}
              <Button type="submit" size="sm" disabled={isPending} className="w-full h-8">
                {isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : "הוסף לוח תוכן"}
              </Button>
            </form>
          )}

          {/* Task mini-form */}
          {activeTool === "task" && (
            <form onSubmit={handleTask} className="space-y-3 rounded-xl border border-border/50 bg-muted/20 p-3.5">
              <p className="text-[11px] font-bold text-foreground/50 uppercase tracking-wider">משימה חדשה</p>
              <div className="space-y-1.5">
                <Label className="text-xs">תיאור המשימה</Label>
                <Input value={taskTitle} onChange={(e) => setTaskTitle(e.target.value)} placeholder="לדוגמה: שלח חוזה ללקוח..." className="h-9 text-sm" autoFocus />
              </div>
              {error && <p className="text-xs text-red-500">{error}</p>}
              <Button type="submit" size="sm" disabled={isPending} className="w-full h-8">
                {isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : "הוסף משימה"}
              </Button>
            </form>
          )}

          {/* Footer */}
          <div className="flex items-center justify-between pt-1 border-t border-border/30">
            <button type="button" onClick={() => onOpenChange(false)} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              סיום
            </button>
            <button type="button" onClick={onGoToProject} className="flex items-center gap-1.5 text-sm font-semibold text-foreground hover:text-foreground/70 transition-colors">
              עבור לפרויקט
              <ArrowLeft className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

/* ─────────────────────────────────────────────────────────────
   ProjectDialog — step 1 only (create/edit)
───────────────────────────────────────────────────────────── */
export function ProjectDialog({
  project,
  clients,
  open,
  onOpenChange,
  onQuotaExceeded,
  defaultClientId,
  onCreated,
}: ProjectDialogProps) {
  const he = useT();
  const STATUS_OPTIONS = [
    { value: "planning",    label: he.common.statusPlanning,    color: "bg-violet-500" },
    { value: "in_progress", label: he.common.statusInProgress,  color: "bg-amber-500" },
    { value: "review",      label: he.common.statusReview,      color: "bg-blue-500" },
    { value: "done",        label: he.common.statusDone,        color: "bg-emerald-500" },
  ];
  const isEditing = !!project;
  const pathname = usePathname();
  const returnToParam = pathname ? `?returnTo=${encodeURIComponent(pathname)}` : "";
  const [isPending, startTransition] = useTransition();

  const [phase, setPhase] = useState(project?.phase ?? "planning");
  const [clientId, setClientId] = useState(project?.clientId ?? "");
  const [newClientMode, setNewClientMode] = useState(false);
  const [newClientName, setNewClientName] = useState("");
  const [localClients, setLocalClients] = useState(clients);
  const [shootDate, setShootDate] = useState(formatDateForInput(project?.shootDate) ?? "");
  const [deadline, setDeadline] = useState(formatDateForInput(project?.deadline) ?? "");

  useEffect(() => {
    if (open) {
      setPhase(project?.phase ?? "planning");
      setClientId(project?.clientId ?? defaultClientId ?? "");
      setNewClientMode(false);
      setNewClientName("");
      setLocalClients(clients);
      setShootDate(formatDateForInput(project?.shootDate) ?? "");
      setDeadline(formatDateForInput(project?.deadline) ?? "");
    }
  }, [open, project, clients, defaultClientId]);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      let resolvedClientId = clientId;

      if (newClientMode && newClientName.trim()) {
        const res = await createClientQuick(newClientName.trim());
        if (!res.success) return;
        resolvedClientId = res.client.id;
        setLocalClients((prev) => [...prev, res.client]);
        setClientId(res.client.id);
        setNewClientMode(false);
        setNewClientName("");
      }

      formData.set("phase", phase);
      formData.set("status", phase);
      formData.set("clientId", resolvedClientId);

      const result = isEditing
        ? await updateProject(project!.id, formData)
        : await createProject(formData);

      if ("quotaExceeded" in result && result.quotaExceeded) {
        onOpenChange(false);
        onQuotaExceeded?.();
        return;
      }

      if (result.success) {
        onOpenChange(false);
        if (!isEditing && "projectId" in result && typeof result.projectId === "string") {
          const title = (formData.get("title") as string) ?? "";
          onCreated?.(result.projectId, title, resolvedClientId);
        }
      }
    });
  }

  const currentStatus = STATUS_OPTIONS.find((p) => p.value === phase);
  const phaseLabel = currentStatus?.label ?? phase;
  const phaseColor = currentStatus?.color ?? "bg-gray-400";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEditing ? he.common.editProject : he.common.newProjectTitle}</DialogTitle>
          <DialogDescription>
            {isEditing ? he.common.editProjectDetails : he.common.enterProjectDetails}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">

            <div className="space-y-2">
              <Label htmlFor="title">{he.common.projectName}</Label>
              <Input id="title" name="title" required defaultValue={project?.title ?? ""} />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>{he.common.client}</Label>
                {clientId && !newClientMode && (
                  <Link
                    href={`/clients${returnToParam}`}
                    onClick={() => onOpenChange(false)}
                    className="flex items-center gap-1.5 rounded-full bg-blue-50 dark:bg-blue-950/40 px-2.5 py-1 text-[11px] font-semibold text-blue-700 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-950/60 transition-colors"
                  >
                    <ArrowUpRight className="h-3 w-3" />
                    {he.common.openClient ?? "פתח לקוח"}
                  </Link>
                )}
              </div>
              {newClientMode ? (
                <div className="flex gap-1.5">
                  <Input
                    autoFocus
                    value={newClientName}
                    onChange={(e) => setNewClientName(e.target.value)}
                    placeholder={he.common.newClientName}
                    className="flex-1 h-9 text-sm"
                  />
                  <button type="button" onClick={() => { setNewClientMode(false); setNewClientName(""); }}
                    className="flex h-9 w-9 items-center justify-center rounded-md border border-border text-muted-foreground hover:text-red-500 transition-colors">
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <SearchableSelect
                  options={localClients.map((c) => ({ value: c.id, label: c.name }))}
                  value={clientId}
                  onChange={(v) => setClientId(v)}
                  placeholder={he.common.selectClient}
                  searchPlaceholder={he.common.searchPlaceholder}
                  triggerClassName="w-full"
                  createAction={
                    <button type="button" onClick={() => { setNewClientMode(true); setClientId(""); }}
                      className="flex w-full items-center gap-2 px-2 py-1.5 text-sm text-[#2563eb] hover:bg-[#2563eb]/10 rounded transition-colors">
                      <Plus className="h-3.5 w-3.5" />{he.common.addNewClient}
                    </button>
                  }
                />
              )}
            </div>

            <div className="space-y-2">
              <Label>{he.common.status}</Label>
              <Select value={phase} onValueChange={(v) => v != null && setPhase(v)}>
                <SelectTrigger className="w-full">
                  <span className="flex flex-1 items-center gap-2">
                    <span className={`h-2 w-2 rounded-full ${phaseColor}`} />
                    {phaseLabel}
                  </span>
                </SelectTrigger>
                <SelectContent>
                  {STATUS_OPTIONS.map((p) => (
                    <SelectItem key={p.value} value={p.value}>
                      <span className="flex items-center gap-2">
                        <span className={`h-2 w-2 rounded-full ${p.color}`} />
                        {p.label}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="budget">{`${he.common.budget} (${he.common.currency})`}</Label>
              <Input id="budget" name="budget" type="number" min={0} step="0.01" defaultValue={project?.budget ?? ""} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="shootDate">{he.common.date}</Label>
              <DatePicker value={shootDate} onChange={setShootDate} name="shootDate" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="deadline">{he.common.deadline}</Label>
              <DatePicker value={deadline} onChange={setDeadline} name="deadline" />
            </div>

            <div className="col-span-2 space-y-2">
              <Label htmlFor="description">{he.common.description}</Label>
              <Textarea id="description" name="description" defaultValue={project?.description ?? ""} rows={3} />
            </div>

          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              {he.common.cancel}
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? he.common.saving : isEditing ? he.common.update : he.common.createProject}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
