"use client";

import { useTransition } from "react";
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
import { Textarea } from "@/components/ui/textarea";
import { createCheatSheet, updateCheatSheet } from "@/lib/actions/cheat-sheet-actions";
import { useT } from "@/lib/i18n";

interface CheatSheetDialogProps {
  cheatSheet?: {
    id: string;
    title: string;
    category: string;
    content: string;
  } | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CheatSheetDialog({ cheatSheet, open, onOpenChange }: CheatSheetDialogProps) {
  const he = useT();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const isEditing = !!cheatSheet;

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      const result = isEditing
        ? await updateCheatSheet(cheatSheet.id, formData)
        : await createCheatSheet(formData);

      if (result.success) {
        onOpenChange(false);
        router.refresh();
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "עריכת מדריך" : he.cheatSheets.newSheet}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? "ערוך את תוכן המדריך"
              : "צור מדריך או נוהל חדש"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="title">כותרת *</Label>
              <Input
                id="title"
                name="title"
                required
                defaultValue={cheatSheet?.title ?? ""}
              />
            </div>

            {/* Category */}
            <div className="space-y-2">
              <Label htmlFor="category">קטגוריה *</Label>
              <Input
                id="category"
                name="category"
                required
                placeholder="למשל: צילום, עריכה, אודיו..."
                defaultValue={cheatSheet?.category ?? ""}
              />
            </div>

            {/* Content */}
            <div className="space-y-2">
              <Label htmlFor="content">תוכן</Label>
              <Textarea
                id="content"
                name="content"
                rows={14}
                className="font-mono text-sm"
                defaultValue={cheatSheet?.content ?? ""}
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
