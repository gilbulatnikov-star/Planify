"use client";

import { useEffect, useState, useTransition } from "react";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { createProject, updateProject } from "@/lib/actions/project-actions";
import { createClientQuick } from "@/lib/actions/client-actions";
import { Plus, X, Check } from "lucide-react";

const CUSTOM_TYPES_KEY = "gp_custom_project_types";

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
}

// ─── Project type options ─────────────────────────────────────────────────────

const BASE_PROJECT_TYPES = [
  { value: "youtube",     label: "YouTube" },
  { value: "music_video", label: "קליפ" },
  { value: "commercial",  label: "פרסומת" },
  { value: "corporate",   label: "תדמית" },
  { value: "social",      label: "סושיאל" },
];

// ─── Status (formerly "Phase") options ───────────────────────────────────────

const STATUS_OPTIONS = [
  { value: "pre_production",  label: "לפני הצילומים" },
  { value: "post_production", label: "עריכה" },
  { value: "revisions",       label: "תיקונים" },
  { value: "delivered",       label: "הושלם" },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDateForInput(date: Date | null | undefined): string {
  if (!date) return "";
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function loadCustomTypes(): { value: string; label: string }[] {
  if (typeof window === "undefined") return [];
  try { return JSON.parse(localStorage.getItem(CUSTOM_TYPES_KEY) ?? "[]"); } catch { return []; }
}

// ─── Component ────────────────────────────────────────────────────────────────

export function ProjectDialog({
  project,
  clients,
  open,
  onOpenChange,
  onQuotaExceeded,
}: ProjectDialogProps) {
  const isEditing = !!project;
  const [isPending, startTransition] = useTransition();

  // Phase / status (single dropdown, renamed to "סטטוס")
  const [phase, setPhase] = useState(project?.phase ?? "pre_production");

  // Client
  const [clientId, setClientId] = useState(project?.clientId ?? "");
  const [newClientMode, setNewClientMode] = useState(false);
  const [newClientName, setNewClientName] = useState("");
  const [localClients, setLocalClients] = useState(clients);

  // Project type with custom categories
  const [customTypes, setCustomTypes] = useState<{ value: string; label: string }[]>(loadCustomTypes);
  const allProjectTypes = [...BASE_PROJECT_TYPES, ...customTypes];

  const [projectType, setProjectType] = useState(() => {
    const val = project?.projectType ?? null;
    return val && allProjectTypes.some((t) => t.value === val) ? val : "";
  });
  const [addingNewType, setAddingNewType] = useState(false);
  const [newTypeName, setNewTypeName] = useState("");

  // Reset on open
  useEffect(() => {
    if (open) {
      setPhase(project?.phase ?? "pre_production");
      setClientId(project?.clientId ?? "");
      setNewClientMode(false);
      setNewClientName("");
      setLocalClients(clients);

      const fresh = loadCustomTypes();
      setCustomTypes(fresh);
      const all = [...BASE_PROJECT_TYPES, ...fresh];
      const pt = project?.projectType ?? "";
      setProjectType(!pt || all.some((t) => t.value === pt) ? pt : "");
      setAddingNewType(false);
      setNewTypeName("");
    }
  }, [open, project, clients]);

  // Add a new custom type to localStorage + local state
  function handleAddCustomType() {
    const label = newTypeName.trim();
    if (!label) return;
    const value = `custom_${label.toLowerCase().replace(/\s+/g, "_")}_${Date.now()}`;
    const updated = [...customTypes, { value, label }];
    setCustomTypes(updated);
    localStorage.setItem(CUSTOM_TYPES_KEY, JSON.stringify(updated));
    setProjectType(value);
    setCustomProjectType("");
    setAddingNewType(false);
    setNewTypeName("");
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

      const finalType = projectType;

      formData.set("phase", phase);
      formData.set("status", phase); // keep status in sync with phase
      formData.set("clientId", resolvedClientId);
      formData.set("projectType", finalType);

      const result = isEditing
        ? await updateProject(project!.id, formData)
        : await createProject(formData);

      if ("quotaExceeded" in result && result.quotaExceeded) {
        onOpenChange(false);
        onQuotaExceeded?.();
        return;
      }

      if (result.success) onOpenChange(false);
    });
  }

  const typeLabel = allProjectTypes.find((t) => t.value === projectType)?.label ?? "";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEditing ? "עריכת פרויקט" : "פרויקט חדש"}</DialogTitle>
          <DialogDescription>
            {isEditing ? "ערוך את פרטי הפרויקט" : "הזן את פרטי הפרויקט החדש"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">

            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="title">שם פרויקט</Label>
              <Input id="title" name="title" required defaultValue={project?.title ?? ""} />
            </div>

            {/* Client */}
            <div className="space-y-2">
              <Label>לקוח</Label>
              {newClientMode ? (
                <div className="flex gap-1.5">
                  <Input
                    autoFocus
                    value={newClientName}
                    onChange={(e) => setNewClientName(e.target.value)}
                    placeholder="שם הלקוח החדש..."
                    className="flex-1 h-9 text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => { setNewClientMode(false); setNewClientName(""); }}
                    className="flex h-9 w-9 items-center justify-center rounded-md border border-gray-200 text-gray-400 hover:text-red-500 transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <Select value={clientId} onValueChange={(v) => setClientId(v ?? "")}>
                  <SelectTrigger className="w-full">
                    <span className="flex flex-1">
                      {clientId ? (localClients.find((c) => c.id === clientId)?.name ?? clientId) : "בחר לקוח"}
                    </span>
                  </SelectTrigger>
                  <SelectContent>
                    {localClients.map((client) => (
                      <SelectItem key={client.id} value={client.id}>{client.name}</SelectItem>
                    ))}
                    <div className="mx-1 my-1 border-t border-gray-100" />
                    <button
                      type="button"
                      onClick={() => { setNewClientMode(true); setClientId(""); }}
                      className="flex w-full items-center gap-2 px-2 py-1.5 text-sm text-blue-600 hover:bg-blue-50 rounded transition-colors"
                    >
                      <Plus className="h-3.5 w-3.5" />הוסף לקוח חדש
                    </button>
                  </SelectContent>
                </Select>
              )}
            </div>

            {/* Project Type */}
            <div className="space-y-2">
              <Label>סוג פרויקט</Label>
              <Select value={projectType} onValueChange={(v) => setProjectType(v ?? "")}>
                <SelectTrigger className="w-full">
                  <span className="flex flex-1">{typeLabel || "בחר סוג"}</span>
                </SelectTrigger>
                <SelectContent>
                  {allProjectTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                  ))}
                  <div className="mx-1 my-1 border-t border-border" />
                  {addingNewType ? (
                    <div
                      className="flex gap-1.5 px-1 py-1"
                      onPointerDown={(e) => e.stopPropagation()}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Input
                        autoFocus
                        value={newTypeName}
                        onChange={(e) => setNewTypeName(e.target.value)}
                        placeholder="שם הקטגוריה..."
                        className="flex-1 h-7 text-xs"
                        onPointerDown={(e) => e.stopPropagation()}
                        onClick={(e) => e.stopPropagation()}
                        onKeyDown={(e) => {
                          e.stopPropagation();
                          if (e.key === "Enter") { e.preventDefault(); handleAddCustomType(); }
                          if (e.key === "Escape") setAddingNewType(false);
                        }}
                      />
                      <button
                        type="button"
                        onPointerDown={(e) => e.stopPropagation()}
                        onClick={(e) => { e.stopPropagation(); handleAddCustomType(); }}
                        className="flex h-7 w-7 items-center justify-center rounded bg-foreground text-background hover:bg-foreground/80 transition-colors shrink-0"
                      >
                        <Check className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        onPointerDown={(e) => e.stopPropagation()}
                        onClick={(e) => { e.stopPropagation(); setAddingNewType(false); }}
                        className="flex h-7 w-7 items-center justify-center rounded border border-border text-muted-foreground hover:text-red-500 transition-colors shrink-0"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onPointerDown={(e) => e.stopPropagation()}
                      onClick={(e) => { e.stopPropagation(); setAddingNewType(true); }}
                      className="flex w-full items-center gap-2 px-2 py-1.5 text-sm text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950 rounded transition-colors"
                    >
                      <Plus className="h-3.5 w-3.5" />הוסף קטגוריה
                    </button>
                  )}
                </SelectContent>
              </Select>
            </div>

            {/* Status (was Phase) */}
            <div className="space-y-2">
              <Label>סטטוס</Label>
              <Select value={phase} onValueChange={(v) => v != null && setPhase(v)}>
                <SelectTrigger className="w-full">
                  <span className="flex flex-1">
                    {STATUS_OPTIONS.find((p) => p.value === phase)?.label ?? phase}
                  </span>
                </SelectTrigger>
                <SelectContent>
                  {STATUS_OPTIONS.map((p) => (
                    <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Budget */}
            <div className="space-y-2">
              <Label htmlFor="budget">{"תקציב (₪)"}</Label>
              <Input
                id="budget"
                name="budget"
                type="number"
                min={0}
                step="0.01"
                defaultValue={project?.budget ?? ""}
              />
            </div>

            {/* Shoot Date */}
            <div className="space-y-2">
              <Label htmlFor="shootDate">תאריך צילום</Label>
              <Input
                id="shootDate"
                name="shootDate"
                type="date"
                defaultValue={formatDateForInput(project?.shootDate)}
              />
            </div>

            {/* Deadline */}
            <div className="space-y-2">
              <Label htmlFor="deadline">דדליין</Label>
              <Input
                id="deadline"
                name="deadline"
                type="date"
                defaultValue={formatDateForInput(project?.deadline)}
              />
            </div>

            {/* Description */}
            <div className="col-span-2 space-y-2">
              <Label htmlFor="description">תיאור</Label>
              <Textarea
                id="description"
                name="description"
                defaultValue={project?.description ?? ""}
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              ביטול
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? "שומר..." : isEditing ? "עדכן" : "צור פרויקט"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
