"use client";

import { useState, useTransition } from "react";
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
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  createScheduledContent,
  updateScheduledContent,
} from "@/lib/actions/calendar-actions";

interface ContentDialogProps {
  content?: {
    id: string;
    title: string;
    date: Date;
    contentType: string;
    status: string;
    clientId: string | null;
    projectId: string | null;
    notes: string | null;
  } | null;
  defaultDate?: string;
  clients: { id: string; name: string }[];
  projects: { id: string; title: string }[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const contentTypes = [
  { value: "client_shoot", label: "צילום ללקוח" },
  { value: "youtube_long", label: "YouTube / ארוך" },
  { value: "short_form", label: "תוכן קצר / Reels" },
] as const;

const contentStatuses = [
  { value: "planned", label: "מתוכנן" },
  { value: "editing", label: "בעריכה" },
  { value: "ready", label: "מוכן לפרסום" },
  { value: "published", label: "פורסם" },
] as const;

function formatDateForInput(date: Date): string {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function ContentDialog({
  content,
  defaultDate,
  clients,
  projects,
  open,
  onOpenChange,
}: ContentDialogProps) {
  const [isPending, startTransition] = useTransition();
  const isEditing = !!content;

  const [contentType, setContentType] = useState(content?.contentType ?? "client_shoot");
  const [status, setStatus] = useState(content?.status ?? "planned");
  const [clientId, setClientId] = useState(content?.clientId ?? "");
  const [projectId, setProjectId] = useState(content?.projectId ?? "");

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    formData.set("contentType", contentType);
    formData.set("status", status);
    formData.set("clientId", clientId);
    formData.set("projectId", projectId);

    startTransition(async () => {
      const result = isEditing
        ? await updateScheduledContent(content.id, formData)
        : await createScheduledContent(formData);

      if (result.success) {
        onOpenChange(false);
      }
    });
  }

  function handleOpenChange(open: boolean) {
    if (open) {
      setContentType(content?.contentType ?? "client_shoot");
      setStatus(content?.status ?? "planned");
      setClientId(content?.clientId ?? "");
      setProjectId(content?.projectId ?? "");
    }
    onOpenChange(open);
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "עריכת תוכן" : "תוכן חדש"}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? "ערוך את פרטי התוכן"
              : "הוסף תוכן חדש ללוח"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-2 gap-4 py-4">
            {/* כותרת */}
            <div className="col-span-2 space-y-2">
              <Label htmlFor="title">כותרת</Label>
              <Input
                id="title"
                name="title"
                required
                defaultValue={content?.title ?? ""}
              />
            </div>

            {/* תאריך */}
            <div className="space-y-2">
              <Label htmlFor="date">תאריך</Label>
              <Input
                id="date"
                name="date"
                type="date"
                required
                defaultValue={
                  content?.date
                    ? formatDateForInput(content.date)
                    : defaultDate ?? ""
                }
              />
            </div>

            {/* סוג תוכן */}
            <div className="space-y-2">
              <Label htmlFor="contentType">סוג תוכן</Label>
              <Select value={contentType} onValueChange={(v) => v && setContentType(v)}>
                <SelectTrigger id="contentType" className="w-full">
                  <SelectValue placeholder="בחר סוג" />
                </SelectTrigger>
                <SelectContent>
                  {contentTypes.map((t) => (
                    <SelectItem key={t.value} value={t.value}>
                      {t.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* סטטוס */}
            <div className="space-y-2">
              <Label htmlFor="status">סטטוס</Label>
              <Select value={status} onValueChange={(v) => v && setStatus(v)}>
                <SelectTrigger id="status" className="w-full">
                  <SelectValue placeholder="בחר סטטוס" />
                </SelectTrigger>
                <SelectContent>
                  {contentStatuses.map((s) => (
                    <SelectItem key={s.value} value={s.value}>
                      {s.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* לקוח */}
            <div className="space-y-2">
              <Label htmlFor="clientId">לקוח (אופציונלי)</Label>
              <Select value={clientId} onValueChange={(v) => v && setClientId(v)}>
                <SelectTrigger id="clientId" className="w-full">
                  <SelectValue placeholder="בחר לקוח" />
                </SelectTrigger>
                <SelectContent>
                  {clients.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* פרויקט */}
            <div className="space-y-2">
              <Label htmlFor="projectId">פרויקט (אופציונלי)</Label>
              <Select value={projectId} onValueChange={(v) => v && setProjectId(v)}>
                <SelectTrigger id="projectId" className="w-full">
                  <SelectValue placeholder="בחר פרויקט" />
                </SelectTrigger>
                <SelectContent>
                  {projects.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* הערות */}
            <div className="col-span-2 space-y-2">
              <Label htmlFor="notes">הערות</Label>
              <Textarea
                id="notes"
                name="notes"
                defaultValue={content?.notes ?? ""}
              />
            </div>
          </div>

          <DialogFooter>
            <DialogClose render={<Button variant="outline" />}>
              ביטול
            </DialogClose>
            <Button type="submit" disabled={isPending}>
              {isPending
                ? "שומר..."
                : isEditing
                  ? "עדכון תוכן"
                  : "הוספת תוכן"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
