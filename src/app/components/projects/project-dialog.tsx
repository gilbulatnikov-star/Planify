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
  SelectSeparator,
  SelectTrigger,
} from "@/components/ui/select";
// Note: Select is still used for client and phase dropdowns
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { createProject, updateProject } from "@/lib/actions/project-actions";
import { createClientQuick } from "@/lib/actions/client-actions";
import { Plus, X } from "lucide-react";
import {
  getPhasesForType,
  getTypeKeyByLabel,
  PROJECT_TYPE_CONFIG,
} from "@/lib/project-config";

const CUSTOM_TYPES_KEY = "gp_custom_project_types";

// All known labels for datalist
const ALL_TYPE_LABELS = Object.values(PROJECT_TYPE_CONFIG).map(cfg => cfg.label);

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

export function ProjectDialog({
  project,
  clients,
  open,
  onOpenChange,
  onQuotaExceeded,
}: ProjectDialogProps) {
  const isEditing = !!project;
  const [isPending, startTransition] = useTransition();

  const [phase, setPhase] = useState(project?.phase ?? "pre_production");
  const [clientId, setClientId] = useState(project?.clientId ?? "");
  const [newClientMode, setNewClientMode] = useState(false);
  const [newClientName, setNewClientName] = useState("");
  const [localClients, setLocalClients] = useState(clients);

  const [customTypes, setCustomTypes] = useState<{ value: string; label: string }[]>(loadCustomTypes);
  const [projectType, setProjectType] = useState(() => project?.projectType ?? "");
  // typeInputValue is the displayed label in the text input
  const [typeInputValue, setTypeInputValue] = useState(() => {
    const val = project?.projectType ?? "";
    return PROJECT_TYPE_CONFIG[val]?.label ?? val;
  });

  // Derive available phases from selected type
  const availablePhases = getPhasesForType(projectType);

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
      const pt = project?.projectType ?? "";
      setProjectType(pt);
      setTypeInputValue(PROJECT_TYPE_CONFIG[pt]?.label ?? pt);
    }
  }, [open, project, clients]);

  function handleTypeInputChange(inputLabel: string) {
    setTypeInputValue(inputLabel);
    // Try to match a known type by label
    const knownKey = getTypeKeyByLabel(inputLabel);
    if (knownKey) {
      setProjectType(knownKey);
      if (!isEditing) {
        const phases = getPhasesForType(knownKey);
        setPhase(phases[0]?.value ?? "pre_production");
      }
    } else {
      // Check custom types
      const custom = customTypes.find(t => t.label.toLowerCase() === inputLabel.trim().toLowerCase());
      if (custom) {
        setProjectType(custom.value);
      } else {
        // Free-form — store the label as the type key temporarily
        setProjectType(inputLabel.trim());
      }
    }
  }

  function handleTypeBlur() {
    const label = typeInputValue.trim();
    if (!label) return;
    const knownKey = getTypeKeyByLabel(label);
    if (knownKey || customTypes.find(t => t.label.toLowerCase() === label.toLowerCase())) return;
    // Save as custom type if not already saved
    if (!customTypes.find(t => t.value === projectType)) {
      const value = `custom_${label.toLowerCase().replace(/\s+/g, "_")}_${Date.now()}`;
      const updated = [...customTypes, { value, label }];
      setCustomTypes(updated);
      localStorage.setItem(CUSTOM_TYPES_KEY, JSON.stringify(updated));
      setProjectType(value);
    }
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

      formData.set("phase", phase);
      formData.set("status", phase);
      formData.set("clientId", resolvedClientId);
      formData.set("projectType", projectType);

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


  // Current phase label for the trigger display
  const phaseLabel =
    availablePhases.find((p) => p.value === phase)?.label ?? phase;

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
                    className="flex h-9 w-9 items-center justify-center rounded-md border border-border text-muted-foreground hover:text-red-500 transition-colors"
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
                    <SelectSeparator />
                    <button
                      type="button"
                      onClick={() => { setNewClientMode(true); setClientId(""); }}
                      className="flex w-full items-center gap-2 px-2 py-1.5 text-sm text-[#38b6ff] hover:bg-[#38b6ff]/10 rounded transition-colors"
                    >
                      <Plus className="h-3.5 w-3.5" />הוסף לקוח חדש
                    </button>
                  </SelectContent>
                </Select>
              )}
            </div>

            {/* Project Type — simple combobox */}
            <div className="space-y-2">
              <Label htmlFor="projectTypeInput">סוג פרויקט</Label>
              <datalist id="projectTypeList">
                {ALL_TYPE_LABELS.map((label) => (
                  <option key={label} value={label} />
                ))}
                {customTypes.map((t) => (
                  <option key={t.value} value={t.label} />
                ))}
              </datalist>
              <Input
                id="projectTypeInput"
                list="projectTypeList"
                value={typeInputValue}
                onChange={(e) => handleTypeInputChange(e.target.value)}
                onBlur={handleTypeBlur}
                placeholder="לדוגמה: חתונה, ריל, עריכת וידאו..."
                autoComplete="off"
              />
            </div>

            {/* Phase — dynamic based on selected type */}
            <div className="space-y-2">
              <Label>סטטוס</Label>
              <Select value={phase} onValueChange={(v) => v != null && setPhase(v)}>
                <SelectTrigger className="w-full">
                  <span className="flex flex-1">{phaseLabel}</span>
                </SelectTrigger>
                <SelectContent>
                  {availablePhases.map((p) => (
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

            {/* Date (generic — shoot date, recording date, event date, etc.) */}
            <div className="space-y-2">
              <Label htmlFor="shootDate">תאריך</Label>
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
