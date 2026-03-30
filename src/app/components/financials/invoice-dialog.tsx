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
import { DatePicker } from "@/components/ui/date-picker";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { SearchableSelect } from "@/components/ui/searchable-select";
import { Textarea } from "@/components/ui/textarea";
import { createInvoice, updateInvoice } from "@/lib/actions/financial-actions";
import { createClientQuick } from "@/lib/actions/client-actions";
import { useT } from "@/lib/i18n";
import { UserPlus } from "lucide-react";

interface InvoiceDialogProps {
  invoice?: {
    id: string;
    invoiceNumber: string;
    clientId: string | null;
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

// Invoice statuses are resolved dynamically via useT()

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
  const he = useT();
  const isEditing = !!invoice;

  const invoiceStatuses = [
    { value: "draft", label: he.financial.invoiceStatuses.draft },
    { value: "sent", label: he.financial.invoiceStatuses.sent },
    { value: "paid", label: he.financial.invoiceStatuses.paid },
    { value: "overdue", label: he.financial.invoiceStatuses.overdue },
  ];

  const [clientId, setClientId] = useState(invoice?.clientId ?? "");
  const [projectId, setProjectId] = useState(invoice?.projectId ?? "");
  const [status, setStatus] = useState(invoice?.status ?? "draft");
  const [dateValue, setDateValue] = useState(
    invoice?.dueDate ? formatDateForInput(invoice.dueDate) : ""
  );
  const [localClients, setLocalClients] = useState(clients);
  const [showNewClient, setShowNewClient] = useState(false);
  const [newClientName, setNewClientName] = useState("");
  const [creatingClient, setCreatingClient] = useState(false);

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

  async function handleAddClient() {
    if (!newClientName.trim()) return;
    setCreatingClient(true);
    const result = await createClientQuick(newClientName.trim());
    if (result.success && result.client) {
      setLocalClients((prev) => [...prev, { id: result.client!.id, name: result.client!.name }]);
      setClientId(result.client!.id);
      setNewClientName("");
      setShowNewClient(false);
    }
    setCreatingClient(false);
  }

  // Reset state when dialog opens with different invoice
  function handleOpenChange(open: boolean) {
    if (open) {
      setClientId(invoice?.clientId ?? "");
      setProjectId(invoice?.projectId ?? "");
      setStatus(invoice?.status ?? "draft");
      setDateValue(invoice?.dueDate ? formatDateForInput(invoice.dueDate) : "");
      setLocalClients(clients);
      setShowNewClient(false);
      setNewClientName("");
    }
    onOpenChange(open);
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? he.financialExtra.editInvoice : he.financialExtra.newInvoice}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? he.financialExtra.editInvoiceDetails
              : he.financialExtra.newInvoiceDetails}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-2 gap-4 py-4">
            {/* לקוח */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="clientId">{he.common.client}</Label>
                <button
                  type="button"
                  onClick={() => setShowNewClient(!showNewClient)}
                  className="flex items-center gap-1 text-[11px] text-accent hover:text-accent/80 transition-colors"
                >
                  <UserPlus className="h-3.5 w-3.5" />
                  הוסף לקוח
                </button>
              </div>
              {showNewClient ? (
                <div className="flex gap-2">
                  <Input
                    value={newClientName}
                    onChange={(e) => setNewClientName(e.target.value)}
                    placeholder="שם הלקוח..."
                    className="flex-1"
                    onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleAddClient())}
                    autoFocus
                  />
                  <Button type="button" size="sm" onClick={handleAddClient} disabled={creatingClient || !newClientName.trim()}>
                    {creatingClient ? "..." : "הוסף"}
                  </Button>
                </div>
              ) : (
                <SearchableSelect
                  options={localClients.map((c) => ({ value: c.id, label: c.name }))}
                  value={clientId}
                  onChange={(v) => setClientId(v)}
                  placeholder={he.financialExtra.selectClient}
                  searchPlaceholder={he.common.searchPlaceholder}
                  triggerClassName="w-full"
                />
              )}
            </div>

            {/* פרויקט */}
            <div className="space-y-2">
              <Label htmlFor="projectId">{he.common.project}</Label>
              <SearchableSelect
                options={projects.map((p) => ({ value: p.id, label: p.title }))}
                value={projectId}
                onChange={(v) => setProjectId(v)}
                placeholder={he.financialExtra.selectProjectOptional}
                searchPlaceholder={he.common.searchPlaceholder}
                triggerClassName="w-full"
              />
            </div>

            {/* סכום */}
            <div className="space-y-2">
              <Label htmlFor="amount">{he.financialExtra.amountBeforeVat}</Label>
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
              <Label htmlFor="status">{he.common.status}</Label>
              <Select value={status} onValueChange={(v) => v && setStatus(v)}>
                <SelectTrigger id="status" className="w-full">
                  <span className="flex flex-1">{invoiceStatuses.find(s => s.value === status)?.label ?? status}</span>
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
              <Label htmlFor="date">{he.financialExtra.dueDate}</Label>
              <DatePicker value={dateValue} onChange={setDateValue} name="date" />
            </div>

            {/* קישור חיצוני */}
            <div className="space-y-2">
              <Label htmlFor="externalLink">{he.financialExtra.externalInvoiceLink}</Label>
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
              <Label htmlFor="notes">{he.common.notes}</Label>
              <Textarea
                id="notes"
                name="notes"
                defaultValue={invoice?.notes ?? ""}
              />
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
                  ? he.financialExtra.updateInvoice
                  : he.financialExtra.addInvoice}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
