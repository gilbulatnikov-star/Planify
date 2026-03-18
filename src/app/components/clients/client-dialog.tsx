"use client";

import { useTransition, useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { createClient, updateClient } from "@/lib/actions/client-actions";

interface ClientDialogProps {
  client?: {
    id: string;
    name: string;
    email: string | null;
    phone: string | null;
    company: string | null;
    website: string | null;
    instagram: string | null;
    youtube: string | null;
    linkedin: string | null;
    tiktok: string | null;
    notes: string | null;
    type: string;
    leadSource: string | null;
    leadStatus: string;
  } | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const typeOptions = [
  { value: "lead", label: "ליד" },
  { value: "client", label: "לקוח" },
] as const;

const leadSourceOptions = [
  { value: "linkedin", label: "LinkedIn" },
  { value: "organic", label: "אורגני" },
  { value: "referral", label: "הפניה" },
  { value: "website", label: "אתר" },
  { value: "social", label: "רשתות חברתיות" },
  { value: "other", label: "אחר" },
] as const;

const leadStatusOptions = [
  { value: "new", label: "חדש" },
  { value: "contacted", label: "נוצר קשר" },
  { value: "qualified", label: "מתאים" },
  { value: "proposal_sent", label: "הצעה נשלחה" },
  { value: "won", label: "נסגר" },
  { value: "lost", label: "אבוד" },
] as const;

export function ClientDialog({ client, open, onOpenChange }: ClientDialogProps) {
  const [isPending, startTransition] = useTransition();
  const isEditing = !!client;

  const knownSources = leadSourceOptions.map((o) => o.value) as string[];

  // If the stored value isn't a known option, treat it as a custom "other" value
  const toLeadSourceState = (v: string | null) =>
    !v ? "" : knownSources.includes(v) ? v : "other";
  const toCustomState = (v: string | null) =>
    !v || knownSources.includes(v) ? "" : v;

  const [type, setType] = useState(client?.type ?? "lead");
  const [leadSource, setLeadSource] = useState(() => toLeadSourceState(client?.leadSource ?? null));
  const [customLeadSource, setCustomLeadSource] = useState(() => toCustomState(client?.leadSource ?? null));
  const [leadStatus, setLeadStatus] = useState(client?.leadStatus ?? "new");

  useEffect(() => {
    if (open) {
      setType(client?.type ?? "lead");
      setLeadSource(toLeadSourceState(client?.leadSource ?? null));
      setCustomLeadSource(toCustomState(client?.leadSource ?? null));
      setLeadStatus(client?.leadStatus ?? "new");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, client]);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);

    const finalLeadSource =
      leadSource === "other" ? customLeadSource.trim() : leadSource;

    formData.set("type", type);
    formData.set("leadSource", finalLeadSource);
    formData.set("leadStatus", leadStatus);

    startTransition(async () => {
      const result = isEditing
        ? await updateClient(client.id, formData)
        : await createClient(formData);

      if (result.success) {
        onOpenChange(false);
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={(value) => onOpenChange(value)}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{isEditing ? "עריכת לקוח" : "לקוח חדש"}</DialogTitle>
          <DialogDescription className="sr-only">
            {isEditing ? "טופס עריכת לקוח" : "טופס יצירת לקוח חדש"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="grid gap-4">
          {/* Basic info */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="name">שם *</Label>
              <Input
                id="name"
                name="name"
                required
                defaultValue={client?.name ?? ""}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="email">אימייל</Label>
              <Input
                id="email"
                name="email"
                type="email"
                defaultValue={client?.email ?? ""}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="phone">טלפון</Label>
              <Input
                id="phone"
                name="phone"
                type="tel"
                defaultValue={client?.phone ?? ""}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="company">חברה</Label>
              <Input
                id="company"
                name="company"
                defaultValue={client?.company ?? ""}
              />
            </div>
          </div>

          {/* Type and lead info */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label>סוג</Label>
              <Select value={type} onValueChange={(v) => setType(v ?? "lead")}>
                <SelectTrigger className="w-full">
                  <span className="flex flex-1">{typeOptions.find(o => o.value === type)?.label ?? type}</span>
                </SelectTrigger>
                <SelectContent>
                  {typeOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label>מקור ליד</Label>
              <Select value={leadSource} onValueChange={(v) => { setLeadSource(v ?? ""); setCustomLeadSource(""); }}>
                <SelectTrigger className="w-full">
                  <span className="flex flex-1">
                    {leadSource === "other" && customLeadSource
                      ? customLeadSource
                      : leadSource
                        ? (leadSourceOptions.find(o => o.value === leadSource)?.label ?? leadSource)
                        : "בחר מקור"}
                  </span>
                </SelectTrigger>
                <SelectContent>
                  {leadSourceOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {leadSource === "other" && (
                <Input
                  placeholder="ציין מקור ידנית..."
                  value={customLeadSource}
                  onChange={(e) => setCustomLeadSource(e.target.value)}
                  autoFocus
                  dir="rtl"
                />
              )}
            </div>

            <div className="grid gap-2 sm:col-span-2">
              <Label>סטטוס ליד</Label>
              <Select value={leadStatus} onValueChange={(v) => setLeadStatus(v ?? "new")}>
                <SelectTrigger className="w-full">
                  <span className="flex flex-1">{leadStatusOptions.find(o => o.value === leadStatus)?.label ?? leadStatus}</span>
                </SelectTrigger>
                <SelectContent>
                  {leadStatusOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Social and web links */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="website">אתר</Label>
              <Input
                id="website"
                name="website"
                type="url"
                defaultValue={client?.website ?? ""}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="instagram">Instagram</Label>
              <Input
                id="instagram"
                name="instagram"
                defaultValue={client?.instagram ?? ""}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="youtube">YouTube</Label>
              <Input
                id="youtube"
                name="youtube"
                defaultValue={client?.youtube ?? ""}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="linkedin">LinkedIn</Label>
              <Input
                id="linkedin"
                name="linkedin"
                defaultValue={client?.linkedin ?? ""}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="tiktok">TikTok</Label>
              <Input
                id="tiktok"
                name="tiktok"
                defaultValue={client?.tiktok ?? ""}
              />
            </div>
          </div>

          {/* Notes */}
          <div className="grid gap-2">
            <Label htmlFor="notes">הערות</Label>
            <Textarea
              id="notes"
              name="notes"
              defaultValue={client?.notes ?? ""}
            />
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
              {isPending ? "שומר..." : "שמור"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
