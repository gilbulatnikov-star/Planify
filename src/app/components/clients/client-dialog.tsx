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
  const [isPending, startTransition] = useTransition();
  const isEditing = !!client;

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);

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
              <Input id="name" name="name" required defaultValue={client?.name ?? ""} />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="email">אימייל</Label>
              <Input id="email" name="email" type="email" defaultValue={client?.email ?? ""} />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="phone">טלפון</Label>
              <Input id="phone" name="phone" type="tel" defaultValue={client?.phone ?? ""} />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="company">חברה</Label>
              <Input id="company" name="company" defaultValue={client?.company ?? ""} />
            </div>
          </div>

          {/* Social and web links */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="website">אתר</Label>
              <Input id="website" name="website" type="url" defaultValue={client?.website ?? ""} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="instagram">Instagram</Label>
              <Input id="instagram" name="instagram" defaultValue={client?.instagram ?? ""} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="youtube">YouTube</Label>
              <Input id="youtube" name="youtube" defaultValue={client?.youtube ?? ""} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="linkedin">LinkedIn</Label>
              <Input id="linkedin" name="linkedin" defaultValue={client?.linkedin ?? ""} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="tiktok">TikTok</Label>
              <Input id="tiktok" name="tiktok" defaultValue={client?.tiktok ?? ""} />
            </div>
          </div>

          {/* Notes */}
          <div className="grid gap-2">
            <Label htmlFor="notes">הערות</Label>
            <Textarea id="notes" name="notes" defaultValue={client?.notes ?? ""} />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
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
