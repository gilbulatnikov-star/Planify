"use client";

import { useTransition } from "react";
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

const STAGE_KEYS = ["new", "contacted", "qualified", "proposal_sent", "won", "lost"] as const;

const SOURCE_KEYS = [
  "instagram",
  "tiktok",
  "facebook",
  "referral",
  "website",
  "linkedin",
  "organic",
  "other",
] as const;

interface LeadDialogProps {
  lead?: {
    id: string;
    name: string;
    email: string | null;
    phone: string | null;
    notes: string | null;
    leadSource: string | null;
    leadStatus: string;
    tags: string[];
  } | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onQuotaExceeded?: () => void;
}

export function LeadDialog({ lead, open, onOpenChange, onQuotaExceeded }: LeadDialogProps) {
  const t = useT();
  const [isPending, startTransition] = useTransition();
  const isEditing = !!lead;

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    formData.set("type", "lead");
    if (!isEditing) {
      formData.set("leadStatus", "new");
    }
    // Store service type in tags
    const serviceType = formData.get("serviceType") as string;
    if (serviceType?.trim()) {
      formData.set("tags", serviceType.trim());
    }
    // Remove serviceType from FormData (not a client field)
    formData.delete("serviceType");

    startTransition(async () => {
      const result = isEditing
        ? await updateClient(lead.id, formData)
        : await createClient(formData);

      if (result && "quotaExceeded" in result && result.quotaExceeded) {
        onOpenChange(false);
        onQuotaExceeded?.();
        return;
      }
      if (result?.success) {
        onOpenChange(false);
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? t.leads.editLead : t.leads.newLead}
          </DialogTitle>
          <DialogDescription className="sr-only">
            {isEditing ? t.leads.editLead : t.leads.newLead}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="grid gap-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {/* Name */}
            <div className="grid gap-2">
              <Label htmlFor="lead-name">{t.common.name} *</Label>
              <Input
                id="lead-name"
                name="name"
                required
                defaultValue={lead?.name ?? ""}
              />
            </div>

            {/* Phone */}
            <div className="grid gap-2">
              <Label htmlFor="lead-phone">{t.common.phone}</Label>
              <Input
                id="lead-phone"
                name="phone"
                type="tel"
                defaultValue={lead?.phone ?? ""}
              />
            </div>

            {/* Email */}
            <div className="grid gap-2">
              <Label htmlFor="lead-email">{t.common.email}</Label>
              <Input
                id="lead-email"
                name="email"
                type="email"
                defaultValue={lead?.email ?? ""}
              />
            </div>

            {/* Source */}
            <div className="grid gap-2">
              <Label htmlFor="lead-source">{t.leads.source}</Label>
              <select
                id="lead-source"
                name="leadSource"
                defaultValue={lead?.leadSource ?? ""}
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              >
                <option value="">{t.leads.allSources}</option>
                {SOURCE_KEYS.map((key) => (
                  <option key={key} value={key}>
                    {t.leads.sources[key]}
                  </option>
                ))}
              </select>
            </div>

            {/* Status (only when editing) */}
            {isEditing && (
              <div className="grid gap-2">
                <Label htmlFor="lead-status">{t.common.status}</Label>
                <select
                  id="lead-status"
                  name="leadStatus"
                  defaultValue={lead?.leadStatus ?? "new"}
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                >
                  {STAGE_KEYS.map((key) => (
                    <option key={key} value={key}>
                      {t.leads.stages[key]}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Service Type */}
          <div className="grid gap-2">
            <Label htmlFor="lead-service">{t.leads.serviceType}</Label>
            <Input
              id="lead-service"
              name="serviceType"
              placeholder={t.leads.serviceTypePlaceholder}
              defaultValue={lead?.tags?.[0] ?? ""}
            />
          </div>

          {/* Notes */}
          <div className="grid gap-2">
            <Label htmlFor="lead-notes">{t.common.notes}</Label>
            <Textarea
              id="lead-notes"
              name="notes"
              defaultValue={lead?.notes ?? ""}
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              {t.common.cancel}
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? t.common.saving : t.common.save}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
