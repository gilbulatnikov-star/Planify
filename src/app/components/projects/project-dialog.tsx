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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { createProject, updateProject } from "@/lib/actions/project-actions";
import { createClientQuick } from "@/lib/actions/client-actions";
import { Plus, X } from "lucide-react";
import { useT } from "@/lib/i18n";

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
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export function ProjectDialog({
  project,
  clients,
  open,
  onOpenChange,
  onQuotaExceeded,
}: ProjectDialogProps) {
  const he = useT();
  const STATUS_OPTIONS = [
    { value: "planning",    label: he.common.statusPlanning,    color: "bg-violet-500" },
    { value: "in_progress", label: he.common.statusInProgress,  color: "bg-amber-500" },
    { value: "review",      label: he.common.statusReview,      color: "bg-blue-500" },
    { value: "done",        label: he.common.statusDone,        color: "bg-emerald-500" },
  ];
  const isEditing = !!project;
  const [isPending, startTransition] = useTransition();

  const [phase, setPhase] = useState(project?.phase ?? "pre_production");
  const [clientId, setClientId] = useState(project?.clientId ?? "");
  const [newClientMode, setNewClientMode] = useState(false);
  const [newClientName, setNewClientName] = useState("");
  const [localClients, setLocalClients] = useState(clients);

  // Reset on open
  useEffect(() => {
    if (open) {
      setPhase(project?.phase ?? "planning");
      setClientId(project?.clientId ?? "");
      setNewClientMode(false);
      setNewClientName("");
      setLocalClients(clients);
    }
  }, [open, project, clients]);

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

      if (result.success) onOpenChange(false);
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

            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="title">{he.common.projectName}</Label>
              <Input id="title" name="title" required defaultValue={project?.title ?? ""} />
            </div>

            {/* Client */}
            <div className="space-y-2">
              <Label>{he.common.client}</Label>
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
                <Select value={clientId} onValueChange={(v) => setClientId(v ?? "")}>
                  <SelectTrigger className="w-full">
                    <span className="flex flex-1">
                      {clientId ? (localClients.find((c) => c.id === clientId)?.name ?? clientId) : he.common.selectClient}
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
                      <Plus className="h-3.5 w-3.5" />{he.common.addNewClient}
                    </button>
                  </SelectContent>
                </Select>
              )}
            </div>

            {/* Status */}
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

            {/* Budget */}
            <div className="space-y-2">
              <Label htmlFor="budget">{`${he.common.budget} (${he.common.currency})`}</Label>
              <Input
                id="budget"
                name="budget"
                type="number"
                min={0}
                step="0.01"
                defaultValue={project?.budget ?? ""}
              />
            </div>

            {/* Date */}
            <div className="space-y-2">
              <Label htmlFor="shootDate">{he.common.date}</Label>
              <Input
                id="shootDate"
                name="shootDate"
                type="date"
                defaultValue={formatDateForInput(project?.shootDate)}
              />
            </div>

            {/* Deadline */}
            <div className="space-y-2">
              <Label htmlFor="deadline">{he.common.deadline}</Label>
              <Input
                id="deadline"
                name="deadline"
                type="date"
                defaultValue={formatDateForInput(project?.deadline)}
              />
            </div>

            {/* Description */}
            <div className="col-span-2 space-y-2">
              <Label htmlFor="description">{he.common.description}</Label>
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
