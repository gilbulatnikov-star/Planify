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
import { createInvoice, updateInvoice } from "@/lib/actions/financial-actions";

interface InvoiceDialogProps {
  invoice?: {
    id: string;
    invoiceNumber: string;
    clientId: string;
    projectId: string | null;
    status: string;
    subtotal: number;
    total: number;
    dueDate: Date | null;
    externalLink: string | null;
    notes: string | null;
  } | null;
  clients: { id: string; name: string }[];
  projects: { id: string; title: string }[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const invoiceStatuses = [
  { value: "draft", label: "טיוטה" },
  { value: "sent", label: "נשלחה" },
  { value: "paid", label: "שולמה" },
  { value: "overdue", label: "באיחור" },
] as const;

function formatDateForInput(date: Date): string {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function InvoiceDialog({
  invoice,
  clients,
  projects,
  open,
  onOpenChange,
}: InvoiceDialogProps) {
  const [isPending, startTransition] = useTransition();
  const isEditing = !!invoice;

  const [clientId, setClientId] = useState(invoice?.clientId ?? "");
  const [projectId, setProjectId] = useState(invoice?.projectId ?? "");
  const [status, setStatus] = useState(invoice?.status ?? "draft");

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    formData.set("clientId", clientId);
    formData.set("projectId", projectId);
    formData.set("status", status);

    startTransition(async () => {
      const result = isEditing
        ? await updateInvoice(invoice.id, formData)
        : await createInvoice(formData);

      if (result.success) {
        onOpenChange(false);
      }
    });
  }

  // Reset state when dialog opens with different invoice
  function handleOpenChange(open: boolean) {
    if (open) {
      setClientId(invoice?.clientId ?? "");
      setProjectId(invoice?.projectId ?? "");
      setStatus(invoice?.status ?? "draft");
    }
    onOpenChange(open);
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "עריכת חשבונית" : "חשבונית חדשה"}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? "ערוך את פרטי החשבונית"
              : "הוסף חשבונית/הכנסה חדשה למערכת"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-2 gap-4 py-4">
            {/* לקוח */}
            <div className="space-y-2">
              <Label htmlFor="clientId">לקוח</Label>
              <Select value={clientId} onValueChange={(v) => v && setClientId(v)}>
                <SelectTrigger id="clientId" className="w-full">
                  <SelectValue placeholder="בחר לקוח" />
                </SelectTrigger>
                <SelectContent>
                  {clients.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* פרויקט */}
            <div className="space-y-2">
              <Label htmlFor="projectId">פרויקט</Label>
              <Select value={projectId} onValueChange={(v) => v && setProjectId(v)}>
                <SelectTrigger id="projectId" className="w-full">
                  <SelectValue placeholder="בחר פרויקט (אופציונלי)" />
                </SelectTrigger>
                <SelectContent>
                  {projects.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* סכום */}
            <div className="space-y-2">
              <Label htmlFor="amount">סכום לפני מע&quot;מ (₪)</Label>
              <Input
                id="amount"
                name="amount"
                type="number"
                step="0.01"
                min="0"
                required
                defaultValue={invoice?.subtotal ?? ""}
              />
            </div>

            {/* סטטוס */}
            <div className="space-y-2">
              <Label htmlFor="status">סטטוס</Label>
              <Select value={status} onValueChange={(v) => v && setStatus(v)}>
                <SelectTrigger id="status" className="w-full">
                  <SelectValue placeholder="בחר סטטוס" />
                </SelectTrigger>
                <SelectContent>
                  {invoiceStatuses.map((s) => (
                    <SelectItem key={s.value} value={s.value}>
                      {s.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* תאריך יעד */}
            <div className="space-y-2">
              <Label htmlFor="date">תאריך יעד</Label>
              <Input
                id="date"
                name="date"
                type="date"
                defaultValue={
                  invoice?.dueDate
                    ? formatDateForInput(invoice.dueDate)
                    : ""
                }
              />
            </div>

            {/* קישור חיצוני */}
            <div className="space-y-2">
              <Label htmlFor="externalLink">קישור לחשבונית חיצונית</Label>
              <Input
                id="externalLink"
                name="externalLink"
                type="url"
                placeholder="https://..."
                defaultValue={invoice?.externalLink ?? ""}
              />
            </div>

            {/* הערות */}
            <div className="col-span-2 space-y-2">
              <Label htmlFor="notes">הערות</Label>
              <Textarea
                id="notes"
                name="notes"
                defaultValue={invoice?.notes ?? ""}
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
                  ? "עדכון חשבונית"
                  : "הוספת חשבונית"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
