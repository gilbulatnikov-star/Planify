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
import { createExpense, updateExpense } from "@/lib/actions/financial-actions";

interface ExpenseDialogProps {
  expense?: {
    id: string;
    description: string;
    category: string;
    amount: number;
    date: Date;
    vendor: string | null;
    notes: string | null;
  } | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const expenseCategories = [
  { value: "overhead", label: "הוצאה חודשית קבועה" },
  { value: "project", label: "הוצאה לפרויקט" },
  { value: "gear_purchase", label: "רכישת ציוד" },
  { value: "vehicle_travel", label: "רכב/נסיעות" },
  { value: "other", label: "אחר" },
] as const;

function formatDateForInput(date: Date): string {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function ExpenseDialog({
  expense,
  open,
  onOpenChange,
}: ExpenseDialogProps) {
  const [isPending, startTransition] = useTransition();
  const isEditing = !!expense;
  const [category, setCategory] = useState(expense?.category ?? "other");

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    formData.set("category", category);

    startTransition(async () => {
      const result = isEditing
        ? await updateExpense(expense.id, formData)
        : await createExpense(formData);

      if (result.success) {
        onOpenChange(false);
      }
    });
  }

  function handleOpenChange(open: boolean) {
    if (open) {
      setCategory(expense?.category ?? "other");
    }
    onOpenChange(open);
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "עריכת הוצאה" : "הוצאה חדשה"}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? "ערוך את פרטי ההוצאה"
              : "הוסף הוצאה חדשה למערכת"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-2 gap-4 py-4">
            {/* תיאור */}
            <div className="space-y-2">
              <Label htmlFor="description">תיאור</Label>
              <Input
                id="description"
                name="description"
                required
                defaultValue={expense?.description ?? ""}
              />
            </div>

            {/* קטגוריה */}
            <div className="space-y-2">
              <Label htmlFor="category">קטגוריה</Label>
              <Select value={category} onValueChange={(v) => v && setCategory(v)}>
                <SelectTrigger id="category" className="w-full">
                  <SelectValue placeholder="בחר קטגוריה" />
                </SelectTrigger>
                <SelectContent>
                  {expenseCategories.map((cat) => (
                    <SelectItem key={cat.value} value={cat.value}>
                      {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* סכום */}
            <div className="space-y-2">
              <Label htmlFor="amount">סכום (₪)</Label>
              <Input
                id="amount"
                name="amount"
                type="number"
                step="0.01"
                min="0"
                required
                defaultValue={expense?.amount ?? ""}
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
                  expense?.date
                    ? formatDateForInput(expense.date)
                    : ""
                }
              />
            </div>

            {/* ספק */}
            <div className="space-y-2">
              <Label htmlFor="vendor">ספק</Label>
              <Input
                id="vendor"
                name="vendor"
                defaultValue={expense?.vendor ?? ""}
              />
            </div>

            {/* הערות */}
            <div className="col-span-2 space-y-2">
              <Label htmlFor="notes">הערות</Label>
              <Textarea
                id="notes"
                name="notes"
                defaultValue={expense?.notes ?? ""}
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
                  ? "עדכון הוצאה"
                  : "הוספת הוצאה"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
