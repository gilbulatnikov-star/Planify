"use client";

import { useTransition, useState, useEffect } from "react";
import { Plus, X, Globe, Instagram, Youtube, Linkedin } from "lucide-react";
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
import { Textarea } from "@/components/ui/textarea";
import { createClient, updateClient } from "@/lib/actions/client-actions";
import { useT } from "@/lib/i18n";

const SOCIAL_KEYS = ["website", "instagram", "youtube", "linkedin", "tiktok", "facebook"] as const;
type SocialKey = typeof SOCIAL_KEYS[number];

const SOCIAL_META: Record<SocialKey, { label: string; placeholder: string; icon?: React.ReactNode }> = {
  website:   { label: "אתר", placeholder: "https://...", icon: <Globe className="h-3.5 w-3.5" /> },
  instagram: { label: "Instagram", placeholder: "@username", icon: <Instagram className="h-3.5 w-3.5" /> },
  youtube:   { label: "YouTube", placeholder: "YouTube", icon: <Youtube className="h-3.5 w-3.5" /> },
  linkedin:  { label: "LinkedIn", placeholder: "LinkedIn", icon: <Linkedin className="h-3.5 w-3.5" /> },
  tiktok:    { label: "TikTok", placeholder: "@username" },
  facebook:  { label: "Facebook", placeholder: "Facebook" },
};

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
    isActive: boolean;
    isRetainer: boolean;
  } | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onQuotaExceeded?: () => void;
}

export function ClientDialog({ client, open, onOpenChange, onQuotaExceeded }: ClientDialogProps) {
  const he = useT();
  const [isPending, startTransition] = useTransition();
  const isEditing = !!client;
  const [isActive, setIsActive] = useState(client?.isActive ?? true);
  const [visibleSocials, setVisibleSocials] = useState<SocialKey[]>([]);
  const [pickerOpen, setPickerOpen] = useState(false);

  useEffect(() => {
    if (open) {
      setIsActive(client?.isActive ?? true);
      const existing = SOCIAL_KEYS.filter((key) => (client as Record<string, unknown>)?.[key]);
      setVisibleSocials(existing);
      setPickerOpen(false);
    }
  }, [open, client]);

  const availableSocials = SOCIAL_KEYS.filter((k) => !visibleSocials.includes(k));

  function addSocial(key: SocialKey) {
    setVisibleSocials((prev) => [...prev, key]);
    setPickerOpen(false);
  }

  function removeSocial(key: SocialKey) {
    setVisibleSocials((prev) => prev.filter((k) => k !== key));
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    formData.set("isActive", String(isActive));
    formData.set("type", "client");
    for (const key of SOCIAL_KEYS) {
      if (!visibleSocials.includes(key)) formData.set(key, "");
    }

    startTransition(async () => {
      const result = isEditing
        ? await updateClient(client.id, formData)
        : await createClient(formData);

      if ("quotaExceeded" in result && result.quotaExceeded) {
        onOpenChange(false);
        onQuotaExceeded?.();
        return;
      }
      if (result.success) onOpenChange(false);
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md max-h-[92dvh] overflow-y-auto">
        <DialogHeader className="pb-1">
          <DialogTitle className="text-[16px] font-bold">
            {isEditing ? he.common.editClient : he.common.newClientTitle}
          </DialogTitle>
          <DialogDescription className="sr-only">
            {isEditing ? he.common.editClientForm : he.common.newClientForm}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5">

          {/* ── Section: Basic info ── */}
          <div className="space-y-3">
            <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">פרטים בסיסיים</p>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="space-y-1.5 sm:col-span-2">
                <Label htmlFor="name" className="text-[13px]">{he.common.name} *</Label>
                <Input
                  id="name"
                  name="name"
                  required
                  defaultValue={client?.name ?? ""}
                  className="h-9 text-[13px]"
                  placeholder="שם מלא..."
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="company" className="text-[13px]">{he.common.company}</Label>
                <Input
                  id="company"
                  name="company"
                  defaultValue={client?.company ?? ""}
                  className="h-9 text-[13px]"
                  placeholder="שם החברה..."
                />
              </div>

              {/* Active toggle inline */}
              <div className="flex items-end pb-1">
                <label className="flex items-center gap-2.5 cursor-pointer select-none">
                  <button
                    type="button"
                    dir="ltr"
                    role="switch"
                    aria-checked={isActive}
                    onClick={() => setIsActive(!isActive)}
                    className={`relative inline-flex h-5 w-9 shrink-0 rounded-full border-2 border-transparent transition-colors ${
                      isActive ? "bg-emerald-500" : "bg-muted-foreground/30"
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-4 w-4 rounded-full bg-white shadow-sm ring-0 transition-transform ${
                        isActive ? "translate-x-4" : "translate-x-0"
                      }`}
                    />
                  </button>
                  <span className="text-[13px] font-medium text-foreground">{he.common.activeClient}</span>
                </label>
              </div>
            </div>
          </div>

          {/* ── Divider ── */}
          <div className="h-px bg-border/50" />

          {/* ── Section: Contact ── */}
          <div className="space-y-3">
            <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">פרטי קשר</p>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-[13px]">{he.common.email}</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  defaultValue={client?.email ?? ""}
                  className="h-9 text-[13px]"
                  placeholder="email@example.com"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="phone" className="text-[13px]">{he.common.phone}</Label>
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  defaultValue={client?.phone ?? ""}
                  className="h-9 text-[13px]"
                  placeholder="050-0000000"
                />
              </div>
            </div>
          </div>

          {/* ── Section: Socials (shown only if any visible or add button) ── */}
          {(visibleSocials.length > 0 || availableSocials.length > 0) && (
            <>
              <div className="h-px bg-border/50" />
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">רשתות חברתיות</p>
                  {availableSocials.length > 0 && (
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() => setPickerOpen(!pickerOpen)}
                        className="flex items-center gap-1 text-[11px] text-muted-foreground hover:text-foreground transition-colors"
                      >
                        <Plus className="h-3 w-3" />
                        הוסף
                      </button>
                      {pickerOpen && (
                        <>
                          <div className="fixed inset-0 z-40" onClick={() => setPickerOpen(false)} />
                          <div className="absolute top-full mt-1 left-0 z-50 rounded-xl border border-border bg-popover shadow-lg p-1 min-w-[140px]">
                            {availableSocials.map((key) => (
                              <button
                                key={key}
                                type="button"
                                onClick={() => addSocial(key)}
                                className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-[12px] text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                              >
                                {SOCIAL_META[key].icon}
                                {SOCIAL_META[key].label}
                              </button>
                            ))}
                          </div>
                        </>
                      )}
                    </div>
                  )}
                </div>

                {visibleSocials.length > 0 && (
                  <div className="space-y-2">
                    {visibleSocials.map((key) => {
                      const meta = SOCIAL_META[key];
                      return (
                        <div key={key} className="flex items-center gap-2">
                          <div className="flex items-center gap-1.5 w-24 shrink-0 text-[11.5px] text-muted-foreground">
                            {meta.icon}
                            {meta.label}
                          </div>
                          <Input
                            name={key}
                            placeholder={meta.placeholder}
                            defaultValue={(client as Record<string, unknown>)?.[key] as string ?? ""}
                            className="flex-1 h-8 text-[12px]"
                          />
                          <button
                            type="button"
                            onClick={() => removeSocial(key)}
                            className="p-1 rounded-md text-muted-foreground hover:text-red-500 hover:bg-red-50 transition-colors"
                          >
                            <X className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </>
          )}

          {/* ── Section: Notes ── */}
          <div className="h-px bg-border/50" />
          <div className="space-y-1.5">
            <Label htmlFor="notes" className="text-[13px]">{he.common.notes}</Label>
            <Textarea
              id="notes"
              name="notes"
              defaultValue={client?.notes ?? ""}
              className="text-[13px] resize-none min-h-[72px]"
              placeholder="הערות, מידע נוסף..."
            />
          </div>

          {/* ── Footer ── */}
          <DialogFooter className="gap-2 pt-1">
            <Button type="button" variant="outline" size="sm" onClick={() => onOpenChange(false)} className="h-9">
              {he.common.cancel}
            </Button>
            <Button type="submit" size="sm" disabled={isPending} className="h-9 px-5">
              {isPending ? he.common.saving : isEditing ? he.common.save : "הוסף לקוח"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
