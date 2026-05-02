"use client";

import { useState, useTransition, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { DatePicker } from "@/components/ui/date-picker";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { SearchableSelect } from "@/components/ui/searchable-select";
import { Textarea } from "@/components/ui/textarea";
import {
  createScheduledContent,
  updateScheduledContent,
} from "@/lib/actions/calendar-actions";
import { createClientQuick } from "@/lib/actions/client-actions";
import { Plus, X, Check, Trash2, ArrowUpRight } from "lucide-react";
import { useT } from "@/lib/i18n";

// ─── Color options ────────────────────────────────────────────────────────────

export const EVENT_COLORS = [
  { key: "gray",   bg: "bg-gray-400"    },
  { key: "blue",   bg: "bg-blue-500"    },
  { key: "violet", bg: "bg-violet-500"  },
  { key: "green",  bg: "bg-emerald-500" },
  { key: "red",    bg: "bg-red-500"     },
  { key: "orange", bg: "bg-orange-400"  },
  { key: "yellow", bg: "bg-yellow-400"  },
  { key: "pink",   bg: "bg-pink-500"    },
];

// ─── Types ────────────────────────────────────────────────────────────────────

interface ContentDialogProps {
  content?: {
    id: string;
    title: string;
    date: Date;
    contentType: string;
    status: string;
    clientId: string | null;
    projectId: string | null;
    scriptId: string | null;
    notes: string | null;
    color?: string | null;
  } | null;
  defaultDate?: string;
  defaultClientId?: string | null;
  defaultProjectId?: string | null;
  clients: { id: string; name: string }[];
  projects: { id: string; title: string; clientId?: string | null }[];
  scripts: { id: string; title: string; projectId?: string | null; clientId?: string | null }[];
  boardId?: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onRequestDelete?: (id: string) => void;
}

function formatDateForInput(date: Date): string {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

// ─── Dialog ───────────────────────────────────────────────────────────────────

export function ContentDialog({
  content,
  defaultDate,
  defaultClientId,
  defaultProjectId,
  clients,
  projects,
  scripts,
  boardId,
  open,
  onOpenChange,
  onRequestDelete,
}: ContentDialogProps) {
  const he = useT();

  const STATUS_OPTIONS = [
    { key: "planned", label: he.calendar.statuses.planned },
    { key: "editing", label: he.calendar.statuses.editing },
    { key: "ready", label: he.calendar.statuses.ready },
    { key: "published", label: he.calendar.statuses.published },
    { key: "event", label: he.calendar.statuses.event ?? "אירוע" },
  ];

  const router = useRouter();
  const pathname = usePathname();
  const returnToParam = pathname ? `?returnTo=${encodeURIComponent(pathname)}` : "";
  const [isPending, startTransition] = useTransition();
  const isEditing = !!content;

  const [titleValue, setTitleValue]       = useState(content?.title ?? "");
  const [clientId, setClientId]           = useState(content?.clientId ?? defaultClientId ?? "");
  const [projectId, setProjectId]         = useState(content?.projectId ?? defaultProjectId ?? "");
  const [scriptId, setScriptId]           = useState(content?.scriptId ?? "");
  const [selectedColor, setSelectedColor] = useState(content?.color ?? "gray");
  const [statusValue, setStatusValue]     = useState(content?.status ?? "planned");
  const [newClientMode, setNewClientMode] = useState(false);
  const [newClientName, setNewClientName] = useState("");
  const [error, setError]                 = useState<string | null>(null);
  const [localClients, setLocalClients]   = useState(clients);
  const [dateValue, setDateValue]         = useState(
    content?.date ? formatDateForInput(content.date) : defaultDate ?? ""
  );

  // Sync all state when dialog opens or the target content changes
  // Note: defaultDate is intentionally NOT in deps — it is always batched with `open`
  // changes (same event handler), so its value is captured correctly by the closure.
  // Including it caused the date to reset when editing after a day-click.
  useEffect(() => {
    if (!open) return;
    setTitleValue(content?.title ?? "");
    setClientId(content?.clientId ?? defaultClientId ?? "");
    setProjectId(content?.projectId ?? defaultProjectId ?? "");
    setScriptId(content?.scriptId ?? "");
    setSelectedColor(content?.color ?? "gray");
    setStatusValue(content?.status ?? "planned");
    setError(null);
    setNewClientMode(false);
    setNewClientName("");
    setLocalClients(clients);
    setDateValue(content?.date ? formatDateForInput(content.date) : defaultDate ?? "");
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, content]);

  // Projects filtered by the currently selected client
  const filteredProjects = clientId
    ? projects.filter((p) => !p.clientId || p.clientId === clientId)
    : projects;

  // Scripts filtered by client first, then by project. Scripts already linked to
  // a different client are hidden — when no client is selected, hide scripts that
  // belong to a specific client (only show unassigned ones).
  const filteredScripts = scripts.filter((s) => {
    if (clientId) {
      // Show scripts for the chosen client OR scripts with no client at all
      if (s.clientId && s.clientId !== clientId) return false;
    } else {
      // No client selected → hide scripts that are tied to some other client
      if (s.clientId) return false;
    }
    if (projectId && s.projectId && s.projectId !== projectId) return false;
    return true;
  });

  function handleClientChange(newClientId: string) {
    setClientId(newClientId);
    // Clear project if it doesn't belong to the new client
    if (projectId) {
      const cur = projects.find((p) => p.id === projectId);
      if (cur?.clientId && cur.clientId !== newClientId) {
        setProjectId("");
      }
    }
    // Clear script if it doesn't belong to the new client
    if (scriptId) {
      const cur = scripts.find((s) => s.id === scriptId);
      if (cur?.clientId && cur.clientId !== newClientId) {
        setScriptId("");
      }
    }
  }

  function handleProjectChange(newProjectId: string) {
    setProjectId(newProjectId);
    // Auto-fill title with project name if title is still empty
    if (newProjectId && !titleValue.trim()) {
      const proj = projects.find((p) => p.id === newProjectId);
      if (proj) setTitleValue(proj.title);
    }
  }

  function handleOpenChange(open: boolean) {
    onOpenChange(open);
  }

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

      formData.set("clientId",  resolvedClientId);
      formData.set("projectId", projectId);
      formData.set("scriptId",  scriptId);
      formData.set("color",     selectedColor);
      formData.set("status",    statusValue);
      if (boardId) formData.set("boardId", boardId);

      const result = isEditing
        ? await updateScheduledContent(content.id, formData)
        : await createScheduledContent(formData);

      if (result.success) {
        setError(null);
        onOpenChange(false);
        router.refresh();
      } else {
        setError(result.error ?? "שגיאה בשמירה");
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEditing ? he.common.editContent : he.common.newContentTitle}</DialogTitle>
          <DialogDescription>
            {isEditing ? he.common.editContentDetails : he.common.enterContentDetails}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-2 gap-4 py-4">

            {/* כותרת */}
            <div className="col-span-2 space-y-2">
              <Label htmlFor="title">{he.common.title}</Label>
              <Input
                id="title"
                name="title"
                required
                value={titleValue}
                onChange={(e) => setTitleValue(e.target.value)}
              />
            </div>

            {/* תאריך */}
            <div className="col-span-2 space-y-2">
              <Label htmlFor="date">{he.common.date}</Label>
              <DatePicker value={dateValue} onChange={setDateValue} name="date" />
            </div>

            {/* צבע */}
            <div className="col-span-2 space-y-2">
              <Label>{he.common.color}</Label>
              <div className="flex flex-wrap gap-2">
                {EVENT_COLORS.map((c) => (
                  <button
                    key={c.key}
                    type="button"
                    title={c.key}
                    onClick={() => setSelectedColor(c.key)}
                    className={`relative h-7 w-7 rounded-full transition-transform hover:scale-110 ${c.bg} ${
                      selectedColor === c.key ? "ring-2 ring-offset-2 ring-gray-700 scale-110" : ""
                    }`}
                  >
                    {selectedColor === c.key && (
                      <Check className="h-3.5 w-3.5 text-white absolute inset-0 m-auto" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* סטטוס */}
            <div className="col-span-2 space-y-2">
              <Label>{he.common.status}</Label>
              <Select value={statusValue} onValueChange={(v) => { if (v) setStatusValue(v); }}>
                <SelectTrigger className="w-full">
                  <span className="flex flex-1">
                    {STATUS_OPTIONS.find(s => s.key === statusValue)?.label ?? he.calendar.statuses.planned}
                  </span>
                </SelectTrigger>
                <SelectContent>
                  {STATUS_OPTIONS.map(s => (
                    <SelectItem key={s.key} value={s.key}>{s.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* לקוח */}
            <div className="col-span-2 space-y-2">
              <div className="flex items-center justify-between">
                <Label>{`${he.common.client} (${he.common.optional})`}</Label>
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
                  <button
                    type="button"
                    onClick={() => { setNewClientMode(false); setNewClientName(""); }}
                    className="flex h-9 w-9 items-center justify-center rounded-md border border-border text-muted-foreground hover:text-red-500 transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <SearchableSelect
                  options={[
                    { value: "", label: he.common.noClient },
                    ...localClients.map((c) => ({ value: c.id, label: c.name })),
                  ]}
                  value={clientId}
                  onChange={(v) => handleClientChange(v)}
                  placeholder={he.common.selectClient}
                  searchPlaceholder={he.common.searchPlaceholder}
                  triggerClassName="w-full"
                  createAction={
                    <button
                      type="button"
                      onClick={() => { setNewClientMode(true); setClientId(""); }}
                      className="flex w-full items-center gap-2 px-2 py-1.5 text-sm text-blue-600 hover:bg-blue-50 rounded transition-colors"
                    >
                      <Plus className="h-3.5 w-3.5" />{he.common.addNewClient}
                    </button>
                  }
                />
              )}
            </div>

            {/* פרויקט */}
            <div className="col-span-2 space-y-2">
              <div className="flex items-center justify-between">
                <Label>{`${he.common.project} (${he.common.optional})`}</Label>
                {projectId && (
                  <Link
                    href={`/projects/${projectId}${returnToParam}`}
                    onClick={() => onOpenChange(false)}
                    className="flex items-center gap-1.5 rounded-full bg-violet-50 dark:bg-violet-950/40 px-2.5 py-1 text-[11px] font-semibold text-violet-700 dark:text-violet-400 hover:bg-violet-100 dark:hover:bg-violet-950/60 transition-colors"
                  >
                    <ArrowUpRight className="h-3 w-3" />
                    {he.common.openProject ?? "פתח פרויקט"}
                  </Link>
                )}
              </div>
              <SearchableSelect
                options={[
                  { value: "", label: he.common.noProject },
                  ...filteredProjects.map((p) => ({ value: p.id, label: p.title })),
                ]}
                value={projectId}
                onChange={(v) => handleProjectChange(v)}
                placeholder={he.common.selectProject}
                searchPlaceholder={he.common.searchPlaceholder}
                triggerClassName="w-full"
              />
            </div>

            {/* תסריט */}
            {scripts.length > 0 && (
              <div className="col-span-2 space-y-2">
                <div className="flex items-center justify-between">
                  <Label>{`${he.common.script} (${he.common.optional})`}</Label>
                  {scriptId && (
                    <Link
                      href={`/scripts/${scriptId}${returnToParam}`}
                      onClick={() => onOpenChange(false)}
                      className="flex items-center gap-1.5 rounded-full bg-orange-50 dark:bg-orange-950/40 px-2.5 py-1 text-[11px] font-semibold text-orange-700 dark:text-orange-400 hover:bg-orange-100 dark:hover:bg-orange-950/60 transition-colors"
                    >
                      <ArrowUpRight className="h-3 w-3" />
                      {he.common.openScript ?? "פתח תסריט"}
                    </Link>
                  )}
                </div>
                <SearchableSelect
                  options={[
                    { value: "", label: he.common.noScript },
                    ...filteredScripts.map((s) => ({ value: s.id, label: s.title })),
                  ]}
                  value={scriptId}
                  onChange={(v) => setScriptId(v)}
                  placeholder={he.common.selectScript}
                  searchPlaceholder={he.common.searchPlaceholder}
                  triggerClassName="w-full"
                />
              </div>
            )}

            {/* הערות */}
            <div className="col-span-2 space-y-2">
              <Label htmlFor="notes">{he.common.notes}</Label>
              <Textarea
                id="notes"
                name="notes"
                defaultValue={content?.notes ?? ""}
              />
            </div>
          </div>

          {error && <p className="text-sm text-red-500 bg-red-50 dark:bg-red-950/30 rounded-lg px-3 py-2">{error}</p>}
          <DialogFooter className="flex-row-reverse sm:flex-row gap-2">
            {isEditing && onRequestDelete && (
              <Button
                type="button"
                variant="outline"
                className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 me-auto"
                onClick={() => { onOpenChange(false); onRequestDelete(content!.id); }}
              >
                <Trash2 className="h-4 w-4 me-1.5" />
                {he.common.deleteContent}
              </Button>
            )}
            <DialogClose render={<Button variant="outline" />}>
              {he.common.cancel}
            </DialogClose>
            <Button type="submit" disabled={isPending}>
              {isPending ? he.common.saving : isEditing ? he.common.updateContent : he.common.addContent}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
