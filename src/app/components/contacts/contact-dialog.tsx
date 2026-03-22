"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
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
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { createContact, updateContact } from "@/lib/actions/contact-actions";
import { he } from "@/lib/he";
import { Plus, X } from "lucide-react";

interface ContactDialogProps {
  contact?: {
    id: string;
    name: string;
    category: string;
    phone: string | null;
    email: string | null;
    dailyRate: number | null;
    notes: string | null;
    projectId: string | null;
  } | null;
  projects?: { id: string; title: string }[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Extra custom categories found in the contacts list */
  extraCategories?: string[];
  onQuotaExceeded?: () => void;
}

const PRESET_CATEGORIES = [
  { value: "editor",               label: he.contacts.categories.editor },
  { value: "stills_photographer",  label: he.contacts.categories.stills_photographer },
  { value: "video_photographer",   label: he.contacts.categories.video_photographer },
  { value: "lighting",             label: he.contacts.categories.lighting },
  { value: "director",             label: he.contacts.categories.director },
  { value: "art",                  label: he.contacts.categories.art },
  { value: "production_assistant", label: he.contacts.categories.production_assistant },
  { value: "producer",             label: he.contacts.categories.producer },
  { value: "three_d",              label: he.contacts.categories.three_d },
  { value: "sound_designer",       label: he.contacts.categories.sound_designer },
  { value: "makeup",               label: he.contacts.categories.makeup },
  { value: "actor",                label: he.contacts.categories.actor },
  { value: "rental_house",         label: he.contacts.categories.rental_house },
  { value: "studio",               label: he.contacts.categories.studio },
  { value: "social_manager",       label: he.contacts.categories.social_manager },
];

const PRESET_VALUES = new Set(PRESET_CATEGORIES.map(c => c.value));

function getCategoryLabel(value: string): string {
  return PRESET_CATEGORIES.find(c => c.value === value)?.label ?? value;
}

export function ContactDialog({ contact, open, onOpenChange, extraCategories = [], onQuotaExceeded, projects = [] }: ContactDialogProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const isEditing = !!contact;

  const [category, setCategory]         = useState(contact?.category ?? "editor");
  const [projectId, setProjectId]       = useState(contact?.projectId ?? "");
  const [customMode, setCustomMode]     = useState(false);
  const [customValue, setCustomValue]   = useState("");
  const [customList, setCustomList]     = useState<string[]>(extraCategories);

  function handleOpenChange(open: boolean) {
    if (open) {
      setCategory(contact?.category ?? "editor");
      setProjectId(contact?.projectId ?? "");
      setCustomMode(false);
      setCustomValue("");
    }
    onOpenChange(open);
  }

  function confirmCustom() {
    const v = customValue.trim();
    if (!v) return;
    if (!customList.includes(v) && !PRESET_VALUES.has(v)) setCustomList(prev => [...prev, v]);
    setCategory(v);
    setCustomMode(false);
    setCustomValue("");
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    formData.set("category", category);
    formData.set("projectId", projectId);

    startTransition(async () => {
      const result = isEditing
        ? await updateContact(contact.id, formData)
        : await createContact(formData);

      if ("quotaExceeded" in result && result.quotaExceeded) {
        onOpenChange(false);
        onQuotaExceeded?.();
        return;
      }

      if (result.success) {
        onOpenChange(false);
        router.refresh();
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "עריכת איש קשר" : he.contacts.newContact}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? "ערוך את פרטי איש הקשר"
              : "הוסף איש קשר חדש לרשת"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-2 gap-4 py-4">
            {/* Name */}
            <div className="col-span-2 space-y-2">
              <Label htmlFor="name">שם *</Label>
              <Input
                id="name"
                name="name"
                required
                defaultValue={contact?.name ?? ""}
              />
            </div>

            {/* Category */}
            <div className="space-y-2">
              <Label>קטגוריה *</Label>
              {customMode ? (
                <div className="flex gap-1.5">
                  <Input
                    autoFocus
                    value={customValue}
                    onChange={e => setCustomValue(e.target.value)}
                    onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); confirmCustom(); } if (e.key === "Escape") { setCustomMode(false); setCustomValue(""); } }}
                    placeholder="שם קטגוריה חדשה..."
                    className="flex-1 h-9 text-sm"
                  />
                  <Button type="button" size="sm" onClick={confirmCustom} disabled={!customValue.trim()}>אישור</Button>
                  <button type="button" onClick={() => { setCustomMode(false); setCustomValue(""); }}
                    className="flex h-9 w-9 items-center justify-center rounded-md border border-border text-muted-foreground hover:text-red-500 transition-colors">
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <Select value={category} onValueChange={(v) => v && setCategory(v)}>
                  <SelectTrigger className="w-full">
                    <span className="flex flex-1">{getCategoryLabel(category)}</span>
                  </SelectTrigger>
                  <SelectContent>
                    {PRESET_CATEGORIES.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                    {customList.map(v => (
                      <SelectItem key={v} value={v}>{v}</SelectItem>
                    ))}
                    <div className="mx-1 my-1 border-t border-border" />
                    <button type="button" onClick={() => setCustomMode(true)}
                      className="flex w-full items-center gap-2 px-2 py-1.5 text-sm text-blue-600 hover:bg-blue-50 rounded transition-colors">
                      <Plus className="h-3.5 w-3.5" />הוסף קטגוריה חדשה
                    </button>
                  </SelectContent>
                </Select>
              )}
            </div>

            {/* Phone */}
            <div className="space-y-2">
              <Label htmlFor="phone">טלפון</Label>
              <Input
                id="phone"
                name="phone"
                type="tel"
                defaultValue={contact?.phone ?? ""}
              />
            </div>

            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email">אימייל</Label>
              <Input
                id="email"
                name="email"
                type="email"
                defaultValue={contact?.email ?? ""}
              />
            </div>

            {/* Daily Rate */}
            <div className="space-y-2">
              <Label htmlFor="dailyRate">תעריף יומי (₪)</Label>
              <Input
                id="dailyRate"
                name="dailyRate"
                type="number"
                step="0.01"
                defaultValue={contact?.dailyRate ?? ""}
              />
            </div>

            {/* Project link */}
            {projects.length > 0 && (
              <div className="col-span-2 space-y-2">
                <Label>שיוך לפרויקט</Label>
                <Select value={projectId} onValueChange={(v) => setProjectId(v === "__none__" ? "" : (v ?? ""))}>
                  <SelectTrigger className="w-full">
                    <span className="flex flex-1">
                      {projectId ? (projects.find(p => p.id === projectId)?.title ?? projectId) : "ללא פרויקט"}
                    </span>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__none__">ללא פרויקט</SelectItem>
                    {projects.map(p => (
                      <SelectItem key={p.id} value={p.id}>{p.title}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Notes */}
            <div className="col-span-2 space-y-2">
              <Label htmlFor="notes">הערות</Label>
              <Textarea
                id="notes"
                name="notes"
                defaultValue={contact?.notes ?? ""}
              />
            </div>
          </div>

          <DialogFooter>
            <DialogClose render={<Button variant="outline" />}>
              {he.common.cancel}
            </DialogClose>
            <Button type="submit" disabled={isPending}>
              {isPending ? "שומר..." : he.common.save}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
