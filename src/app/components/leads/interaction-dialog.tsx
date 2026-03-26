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
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { createInteraction } from "@/lib/actions/interaction-actions";
import { useT } from "@/lib/i18n";

const INTERACTION_TYPES = ["call", "email", "meeting", "note"] as const;

interface InteractionDialogProps {
  clientId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function InteractionDialog({
  clientId,
  open,
  onOpenChange,
}: InteractionDialogProps) {
  const t = useT();
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      const result = await createInteraction(clientId, formData);
      if (result?.success) {
        onOpenChange(false);
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t.leads.addInteraction}</DialogTitle>
          <DialogDescription className="sr-only">
            {t.leads.addInteraction}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="grid gap-4">
          {/* Interaction Type */}
          <div className="grid gap-2">
            <Label htmlFor="interaction-type">{t.common.type ?? "סוג"}</Label>
            <select
              id="interaction-type"
              name="type"
              defaultValue="note"
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            >
              {INTERACTION_TYPES.map((key) => (
                <option key={key} value={key}>
                  {t.leads.interactionTypes[key]}
                </option>
              ))}
            </select>
          </div>

          {/* Summary */}
          <div className="grid gap-2">
            <Label htmlFor="interaction-summary">
              {t.leads.interactionSummary} *
            </Label>
            <Textarea
              id="interaction-summary"
              name="summary"
              required
              rows={3}
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
