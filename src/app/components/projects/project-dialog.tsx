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
import { Plus, X } from "lucide-react";

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
}

const PROJECT_TYPES = [
  { value: "youtube", label: "YouTube" },
  { value: "music_video", label: "קליפ" },
  { value: "commercial", label: "פרסומת" },
  { value: "corporate", label: "תדמית" },
  { value: "social", label: "סושיאל" },
] as const;

const PHASES = [
  { value: "pre_production", label: "לפני הצילומים" },
  { value: "production",     label: "ימי צילום" },
  { value: "post_production", label: "עריכה" },
  { value: "delivered",      label: "הושלם" },
] as const;

const STATUS_OPTIONS: Record<string, { value: string; label: string }[]> = {
  pre_production: [
    { value: "pitching",          label: "בגיבוש" },
    { value: "scripting",         label: "כתיבת תסריט" },
    { value: "moodboards",        label: "בניית תדמית" },
    { value: "location_scouting", label: "חיפוש לוקיישן" },
  ],
  production: [
    { value: "scheduled", label: "מתוכנן" },
    { value: "shooting",  label: "בצילומים" },
    { value: "wrapping",  label: "סיום צילומים" },
  ],
  post_production: [
    { value: "ingest_sync",    label: "העברת חומרים" },
    { value: "rough_cut",      label: "גרסה ראשונה" },
    { value: "revisions_v1",   label: "תיקון ראשון" },
    { value: "revisions_v2",   label: "תיקון שני" },
    { value: "color_sound",    label: "גימור" },
    { value: "final_delivery", label: "מסירה ללקוח" },
  ],
  delivered: [
    { value: "delivered", label: "נמסר" },
    { value: "archived", label: "בארכיון" },
  ],
};

function formatDateForInput(date: Date | null | undefined): string {
  if (!date) return "";
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function ProjectDialog({
  project,
  clients,
  open,
  onOpenChange,
}: ProjectDialogProps) {
  const isEditing = !!project;
  const [isPending, startTransition] = useTransition();

  const [phase, setPhase] = useState(project?.phase ?? "pre_production");
  const [status, setStatus] = useState(project?.status ?? "pitching");
  const [clientId, setClientId] = useState(project?.clientId ?? "");
  const [projectType, setProjectType] = useState(project?.projectType ?? "");
  const [newClientMode, setNewClientMode] = useState(false);
  const [newClientName, setNewClientName] = useState("");
  const [localClients, setLocalClients] = useState(clients);

  useEffect(() => {
    if (open) {
      setPhase(project?.phase ?? "pre_production");
      setStatus(project?.status ?? "pitching");
      setClientId(project?.clientId ?? "");
      setProjectType(project?.projectType ?? "");
      setNewClientMode(false);
      setNewClientName("");
      setLocalClients(clients);
    }
  }, [open, project, clients]);

  useEffect(() => {
    const options = STATUS_OPTIONS[phase];
    if (options && !options.some((opt) => opt.value === status)) {
      setStatus(options[0].value);
    }
  }, [phase, status]);

  const statusOptions = STATUS_OPTIONS[phase] ?? [];

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      let resolvedClientId = clientId;

      // Create new client inline if needed
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
      formData.set("status", status);
      formData.set("clientId", resolvedClientId);
      formData.set("projectType", projectType);

      const result = isEditing
        ? await updateProject(project!.id, formData)
        : await createProject(formData);

      if (result.success) {
        onOpenChange(false);
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "עריכת פרויקט" : "פרויקט חדש"}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? "ערוך את פרטי הפרויקט"
              : "הזן את פרטי הפרויקט החדש"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="title">שם פרויקט</Label>
              <Input
                id="title"
                name="title"
                required
                defaultValue={project?.title ?? ""}
              />
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
                  <button type="button" onClick={() => { setNewClientMode(false); setNewClientName(""); }}
                    className="flex h-9 w-9 items-center justify-center rounded-md border border-gray-200 text-gray-400 hover:text-red-500 transition-colors">
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <Select value={clientId} onValueChange={(v) => setClientId(v ?? "")}>
                  <SelectTrigger className="w-full">
                    <span className="flex flex-1">{clientId ? (localClients.find(c => c.id === clientId)?.name ?? clientId) : "בחר לקוח"}</span>
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
              <Select
                value={projectType}
                onValueChange={(v) => setProjectType(v ?? "")}
              >
                <SelectTrigger className="w-full">
                  <span className="flex flex-1">{projectType ? (PROJECT_TYPES.find(t => t.value === projectType)?.label ?? projectType) : "בחר סוג"}</span>
                </SelectTrigger>
                <SelectContent>
                  {PROJECT_TYPES.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Phase */}
            <div className="space-y-2">
              <Label>שלב</Label>
              <Select
                value={phase}
                onValueChange={(value) => value != null && setPhase(value)}
              >
                <SelectTrigger className="w-full">
                  <span className="flex flex-1">{PHASES.find(p => p.value === phase)?.label ?? phase}</span>
                </SelectTrigger>
                <SelectContent>
                  {PHASES.map((p) => (
                    <SelectItem key={p.value} value={p.value}>
                      {p.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Status */}
            <div className="space-y-2">
              <Label>סטטוס</Label>
              <Select
                value={status}
                onValueChange={(value) => value != null && setStatus(value)}
              >
                <SelectTrigger className="w-full">
                  <span className="flex flex-1">{statusOptions.find(s => s.value === status)?.label ?? status}</span>
                </SelectTrigger>
                <SelectContent>
                  {statusOptions.map((s) => (
                    <SelectItem key={s.value} value={s.value}>
                      {s.label}
                    </SelectItem>
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

            {/* Description — full width */}
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
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
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
