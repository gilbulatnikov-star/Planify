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
import { createInspiration, updateInspiration } from "@/lib/actions/inspiration-actions";
import { he } from "@/lib/he";
import type { CategoryData } from "./inspiration-page-client";

interface InspirationDialogProps {
  inspiration?: {
    id: string;
    title: string;
    url: string | null;
    category: string;
    categoryId: string | null;
    notes: string | null;
  } | null;
  categories: CategoryData[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function InspirationDialog({ inspiration, categories, open, onOpenChange }: InspirationDialogProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [saveError, setSaveError] = useState<string | null>(null);
  const isEditing = !!inspiration;

  const defaultCategoryId = inspiration?.categoryId ?? categories[0]?.id ?? "";
  const [categoryId, setCategoryId] = useState(defaultCategoryId);

  function handleOpenChange(open: boolean) {
    if (open) {
      setCategoryId(inspiration?.categoryId ?? categories[0]?.id ?? "");
      setSaveError(null);
    }
    onOpenChange(open);
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaveError(null);

    if (!categoryId) {
      setSaveError("יש ליצור קטגוריה לפחות אחת לפני שמירה");
      return;
    }

    const formData = new FormData(e.currentTarget);
    formData.set("categoryId", categoryId);

    startTransition(async () => {
      const result = isEditing
        ? await updateInspiration(inspiration.id, formData)
        : await createInspiration(formData);

      if (result.success) {
        onOpenChange(false);
        router.refresh();
      } else {
        setSaveError(result.error ?? "שגיאה בשמירה");
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "עריכת השראה" : he.inspiration.newItem}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? "ערוך את פרטי ההשראה"
              : "הוסף השראה חדשה ללוח"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-2 gap-4 py-4">
            {/* Title */}
            <div className="col-span-2 space-y-2">
              <Label htmlFor="title">כותרת *</Label>
              <Input
                id="title"
                name="title"
                required
                defaultValue={inspiration?.title ?? ""}
              />
            </div>

            {/* URL */}
            <div className="col-span-2 space-y-2">
              <Label htmlFor="url">קישור</Label>
              <Input
                id="url"
                name="url"
                type="url"
                defaultValue={inspiration?.url ?? ""}
              />
            </div>

            {/* Category */}
            <div className="col-span-2 space-y-2">
              <Label>קטגוריה *</Label>
              {categories.length === 0 ? (
                <p className="text-sm text-amber-600 bg-amber-50 dark:bg-amber-950/30 dark:text-amber-400 rounded-lg px-3 py-2">
                  אין קטגוריות עדיין — סגור ולחץ על &quot;קטגוריות&quot; כדי ליצור אחת
                </p>
              ) : (
                <Select value={categoryId} onValueChange={(v) => v && setCategoryId(v)}>
                  <SelectTrigger className="w-full">
                    <span className="flex flex-1">{categoryId ? (categories.find(cat => cat.id === categoryId)?.label ?? categoryId) : "בחר קטגוריה"}</span>
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>
                        {cat.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>

            {/* Notes */}
            <div className="col-span-2 space-y-2">
              <Label htmlFor="notes">הערות</Label>
              <Textarea
                id="notes"
                name="notes"
                defaultValue={inspiration?.notes ?? ""}
              />
            </div>
          </div>

          {saveError && (
            <p className="text-sm text-red-500 px-1 -mt-2">{saveError}</p>
          )}
          <DialogFooter>
            <DialogClose render={<Button variant="outline" />}>
              {he.common.cancel}
            </DialogClose>
            <Button type="submit" disabled={isPending || categories.length === 0}>
              {isPending ? "שומר..." : he.common.save}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
