"use client";

import { useState, useTransition, useRef } from "react";
import { Paperclip, X, Loader2 } from "lucide-react";
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
import { DatePicker } from "@/components/ui/date-picker";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { createExpense, updateExpense } from "@/lib/actions/financial-actions";
import { useT } from "@/lib/i18n";

interface ExpenseDialogProps {
  expense?: {
    id: string;
    description: string;
    category: string;
    amount: number;
    date: Date;
    vendor: string | null;
    notes: string | null;
    receiptUrl?: string | null;
  } | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// Expense categories are resolved dynamically via useT()

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
  const he = useT();
  const isEditing = !!expense;

  const expenseCategories = [
    { value: "overhead", label: he.financial.expenseCategories.overhead },
    { value: "project", label: he.financial.expenseCategories.project },
    { value: "gear_purchase", label: he.financial.expenseCategories.gear_purchase },
    { value: "vehicle_travel", label: he.financial.expenseCategories.vehicle_travel },
    { value: "other", label: he.financial.expenseCategories.other },
  ];
  const [category, setCategory] = useState(expense?.category ?? "other");
  const [dateValue, setDateValue] = useState(
    expense?.date ? formatDateForInput(expense.date) : ""
  );
  const [receiptUrl, setReceiptUrl] = useState(expense?.receiptUrl ?? "");
  const [receiptName, setReceiptName] = useState("");
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/upload-file", { method: "POST", body: fd });
      const data = await res.json();
      if (data.fileUrl) {
        setReceiptUrl(data.fileUrl);
        setReceiptName(data.fileName ?? file.name);
      }
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    formData.set("category", category);
    if (receiptUrl) formData.set("receiptUrl", receiptUrl);

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
      setDateValue(expense?.date ? formatDateForInput(expense.date) : "");
      setReceiptUrl(expense?.receiptUrl ?? "");
      setReceiptName("");
    }
    onOpenChange(open);
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? he.financialExtra.editExpense : he.financialExtra.newExpense}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? he.financialExtra.editExpenseDetails
              : he.financialExtra.newExpenseDetails}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-2 gap-4 py-4">
            {/* תיאור */}
            <div className="space-y-2">
              <Label htmlFor="description">{he.common.description}</Label>
              <Input
                id="description"
                name="description"
                required
                defaultValue={expense?.description ?? ""}
              />
            </div>

            {/* קטגוריה */}
            <div className="space-y-2">
              <Label htmlFor="category">{he.common.category}</Label>
              <Select value={category} onValueChange={(v) => v && setCategory(v)}>
                <SelectTrigger id="category" className="w-full">
                  <span className="flex flex-1">{expenseCategories.find(cat => cat.value === category)?.label ?? category}</span>
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
              <Label htmlFor="amount">{he.financialExtra.amount}</Label>
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
              <Label htmlFor="date">{he.common.date}</Label>
              <DatePicker value={dateValue} onChange={setDateValue} name="date" />
            </div>

            {/* ספק */}
            <div className="space-y-2">
              <Label htmlFor="vendor">{he.financialExtra.vendor}</Label>
              <Input
                id="vendor"
                name="vendor"
                defaultValue={expense?.vendor ?? ""}
              />
            </div>

            {/* הערות */}
            <div className="col-span-2 space-y-2">
              <Label htmlFor="notes">{he.common.notes}</Label>
              <Textarea
                id="notes"
                name="notes"
                defaultValue={expense?.notes ?? ""}
              />
            </div>

            {/* צרף קבלה */}
            <div className="col-span-2 space-y-2">
              <Label>{he.financialExtra.attachReceipt}</Label>
              {receiptUrl ? (
                <div className="flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm">
                  <Paperclip className="h-4 w-4 text-emerald-600 shrink-0" />
                  <a href={receiptUrl} target="_blank" rel="noopener noreferrer"
                    className="flex-1 truncate text-emerald-700 hover:underline">
                    {receiptName || receiptUrl.split("/").pop()}
                  </a>
                  <button type="button" onClick={() => { setReceiptUrl(""); setReceiptName(""); }}
                    className="text-muted-foreground hover:text-red-500 transition-colors">
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              ) : (
                <label className={`flex cursor-pointer items-center gap-2 rounded-lg border border-dashed px-3 py-2 text-sm transition-colors ${uploading ? "border-border text-muted-foreground" : "border-border text-muted-foreground hover:border-gray-400 hover:bg-muted"}`}>
                  {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Paperclip className="h-4 w-4" />}
                  {uploading ? he.moodboard.uploading : he.financialExtra.clickToAttach}
                  <input ref={fileInputRef} type="file" accept=".pdf,.jpg,.jpeg,.png"
                    className="hidden" onChange={handleFileSelect} disabled={uploading} />
                </label>
              )}
            </div>
          </div>

          <DialogFooter>
            <DialogClose render={<Button variant="outline" />}>
              {he.common.cancel}
            </DialogClose>
            <Button type="submit" disabled={isPending}>
              {isPending
                ? he.common.saving
                : isEditing
                  ? he.financialExtra.updateExpense
                  : he.financialExtra.addExpense}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
