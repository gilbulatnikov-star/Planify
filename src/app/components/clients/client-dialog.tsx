"use client";

import { useTransition, useState, useEffect } from "react";
import { Plus, X } from "lucide-react";
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
  const SOCIAL_OPTIONS = [
    { key: "website" as const, label: he.common.website, placeholder: "https://..." },
    { key: "instagram" as const, label: "Instagram", placeholder: "@username" },
    { key: "youtube" as const, label: "YouTube", placeholder: "YouTube" },
    { key: "linkedin" as const, label: "LinkedIn", placeholder: "LinkedIn" },
    { key: "tiktok" as const, label: "TikTok", placeholder: "@username" },
    { key: "facebook" as const, label: "Facebook", placeholder: "Facebook" },
  ];
  const [isPending, startTransition] = useTransition();
  const isEditing = !!client;
  const [isActive, setIsActive] = useState(client?.isActive ?? true);
  const [visibleSocials, setVisibleSocials] = useState<SocialKey[]>([]);
  const [pickerOpen, setPickerOpen] = useState(false);

  useEffect(() => {
    if (open) {
      setIsActive(client?.isActive ?? true);
      // Show socials that already have values
      const existing = SOCIAL_KEYS
        .filter(key => (client as Record<string, unknown>)?.[key]);
      setVisibleSocials(existing);
      setPickerOpen(false);
    }
  }, [open, client]);

  const availableSocials = SOCIAL_OPTIONS.filter(s => !visibleSocials.includes(s.key));

  function addSocial(key: SocialKey) {
    setVisibleSocials(prev => [...prev, key]);
    setPickerOpen(false);
  }

  function removeSocial(key: SocialKey) {
    setVisibleSocials(prev => prev.filter(k => k !== key));
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);
    formData.set("isActive", String(isActive));
    formData.set("type", "client");

    // Clear hidden social fields
    for (const key of SOCIAL_KEYS) {
      if (!visibleSocials.includes(key)) {
        formData.set(key, "");
      }
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
      if (result.success) {
        onOpenChange(false);
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={(value) => onOpenChange(value)}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEditing ? he.common.editClient : he.common.newClientTitle}</DialogTitle>
          <DialogDescription className="sr-only">
            {isEditing ? he.common.editClientForm : he.common.newClientForm}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="grid gap-4">
          {/* Basic info */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="name">{he.common.name} *</Label>
              <Input id="name" name="name" required defaultValue={client?.name ?? ""} />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="email">{he.common.email}</Label>
              <Input id="email" name="email" type="email" defaultValue={client?.email ?? ""} />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="phone">{he.common.phone}</Label>
              <Input id="phone" name="phone" type="tel" defaultValue={client?.phone ?? ""} />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="company">{he.common.company}</Label>
              <Input id="company" name="company" defaultValue={client?.company ?? ""} />
            </div>
          </div>

          {/* Active toggle */}
          <label className="flex items-center gap-3 cursor-pointer select-none">
            <button
              type="button"
              dir="ltr"
              role="switch"
              aria-checked={isActive}
              onClick={() => setIsActive(!isActive)}
              className={`relative inline-flex h-5 w-9 shrink-0 rounded-full border-2 border-transparent transition-colors ${
                isActive ? "bg-[#38b6ff]" : "bg-muted-foreground/30"
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-4 w-4 rounded-full bg-card shadow-sm ring-0 transition-transform ${
                  isActive ? "translate-x-4" : "translate-x-0"
                }`}
              />
            </button>
            <span className="text-sm font-medium text-foreground">{he.common.activeClient}</span>
          </label>

          {/* Dynamic social links */}
          {visibleSocials.length > 0 && (
            <div className="space-y-2">
              {visibleSocials.map(key => {
                const opt = SOCIAL_OPTIONS.find(s => s.key === key)!;
                return (
                  <div key={key} className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground w-20 shrink-0 text-left">{opt.label}</span>
                    <Input name={key} placeholder={opt.placeholder} defaultValue={(client as Record<string, unknown>)?.[key] as string ?? ""} className="flex-1 h-8 text-sm" />
                    <button type="button" onClick={() => removeSocial(key)} className="p-1 rounded text-muted-foreground hover:text-red-500 transition-colors">
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                );
              })}
            </div>
          )}

          {/* Add social button */}
          {availableSocials.length > 0 && (
            <div className="relative">
              <button
                type="button"
                onClick={() => setPickerOpen(!pickerOpen)}
                className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                <Plus className="h-3.5 w-3.5" />
                {he.common.addSocialNetwork}
              </button>
              {pickerOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setPickerOpen(false)} />
                  <div className="absolute top-full mt-1 right-0 z-50 rounded-xl border border-border bg-card shadow-lg p-1 min-w-[160px]">
                    {availableSocials.map(s => (
                      <button
                        key={s.key}
                        type="button"
                        onClick={() => addSocial(s.key)}
                        className="flex w-full items-center rounded-lg px-3 py-2 text-xs text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                      >
                        {s.label}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}

          {/* Notes */}
          <div className="grid gap-2">
            <Label htmlFor="notes">{he.common.notes}</Label>
            <Textarea id="notes" name="notes" defaultValue={client?.notes ?? ""} />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              {he.common.cancel}
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? he.common.saving : he.common.save}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
