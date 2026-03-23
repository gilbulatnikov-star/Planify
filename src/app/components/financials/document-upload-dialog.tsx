"use client";

import { useState, useRef, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Upload, FileText, Loader2, CheckCircle2, AlertCircle,
  Scan, Sparkles, AlertTriangle,
} from "lucide-react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { DatePicker } from "@/components/ui/date-picker";
import { Select, SelectTrigger, SelectContent, SelectItem } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { createExpense, createInvoice } from "@/lib/actions/financial-actions";
import { useT } from "@/lib/i18n";

interface DocumentUploadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  clients?: { id: string; name: string }[];
}

/* expenseCategories are built inside the component to access i18n */

type UploadState = "idle" | "scanning" | "scanned" | "saving" | "error" | "invalid_doc";

interface ScanResult {
  fileUrl: string;
  fileName: string;
  type: "expense" | "invoice";
  vendorName: string;
  date: string;
  totalAmount: number | null;
  description: string;
}

export function DocumentUploadDialog({ open, onOpenChange, clients = [] }: DocumentUploadDialogProps) {
  const he = useT();
  const router = useRouter();

  const expenseCategories = [
    { value: "overhead",       label: he.financial.expenseCategories.overhead },
    { value: "project",        label: he.financial.expenseCategories.project },
    { value: "gear_purchase",  label: he.financial.expenseCategories.gear_purchase },
    { value: "vehicle_travel", label: he.financial.expenseCategories.vehicle_travel },
    { value: "other",          label: he.financial.expenseCategories.other },
  ];
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isPending, startTransition] = useTransition();

  const [uploadState, setUploadState] = useState<UploadState>("idle");
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);

  // Editable form fields (auto-populated from AI scan)
  const [docType, setDocType] = useState<"expense" | "invoice">("expense");
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [vendor, setVendor] = useState("");
  const [date, setDate] = useState("");
  const [category, setCategory] = useState("other");
  const [notes, setNotes] = useState("");
  const [clientId, setClientId] = useState("");

  function resetState() {
    setUploadState("idle");
    setScanResult(null);
    setError(null);
    setDragOver(false);
    setDocType("expense");
    setDescription(""); setAmount(""); setVendor(""); setDate("");
    setCategory("other"); setNotes(""); setClientId("");
  }

  function handleOpenChange(open: boolean) {
    if (!open) resetState();
    onOpenChange(open);
  }

  async function processFile(file: File) {
    // Frontend validation: only .pdf, .jpg, .jpeg, .png
    const ext = file.name.split(".").pop()?.toLowerCase() ?? "";
    if (!["pdf", "jpg", "jpeg", "png"].includes(ext)) {
      setError(he.docUpload.fileOnlyError);
      setUploadState("error");
      return;
    }

    setUploadState("scanning");
    setError(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/upload-document", { method: "POST", body: formData });
      const data = await res.json();

      // Invalid document (not a financial document)
      if (data.isInvalidDocument) {
        setUploadState("invalid_doc");
        return;
      }

      if (!res.ok) {
        throw new Error(data.error || he.docUpload.parseError);
      }

      // Success — auto-fill form
      const result: ScanResult = {
        fileUrl: data.fileUrl,
        fileName: data.fileName,
        type: data.type,
        vendorName: data.vendorName ?? "",
        date: data.date ?? "",
        totalAmount: data.totalAmount ?? null,
        description: data.description ?? "",
      };

      setScanResult(result);
      setUploadState("scanned");

      // Auto-populate form fields
      setDocType(result.type);
      if (result.totalAmount) setAmount(String(result.totalAmount));
      if (result.description) setDescription(result.description);
      if (result.vendorName) setVendor(result.vendorName);
      if (result.date) setDate(result.date);

    } catch (err) {
      setError(err instanceof Error ? err.message : he.docUpload.scanError);
      setUploadState("error");
    }

    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processFile(file);
  }

  function handleSave() {
    if (!amount || !description) return;

    startTransition(async () => {
      setUploadState("saving");

      if (docType === "expense") {
        const formData = new FormData();
        formData.set("description", description);
        formData.set("category", category);
        formData.set("amount", amount);
        formData.set("date", date || new Date().toISOString().split("T")[0]);
        formData.set("vendor", vendor);
        formData.set("notes", notes);
        if (scanResult?.fileUrl) formData.set("receiptUrl", scanResult.fileUrl);

        const result = await createExpense(formData);
        if (result.success) {
          handleOpenChange(false);
          router.refresh();
        } else {
          setError(result.error ?? he.docUpload.saveError);
          setUploadState("scanned");
        }
      } else {
        const formData = new FormData();
        formData.set("amount", amount);
        formData.set("status", "paid");
        formData.set("date", date || new Date().toISOString().split("T")[0]);
        formData.set("notes", notes);
        if (clientId) formData.set("clientId", clientId);
        if (scanResult?.fileUrl) formData.set("externalLink", scanResult.fileUrl);

        const result = await createInvoice(formData);
        if (result.success) {
          handleOpenChange(false);
          router.refresh();
        } else {
          setError(result.error ?? he.docUpload.saveError);
          setUploadState("scanned");
        }
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Scan className="h-5 w-5 text-foreground" />
            {he.docUpload.scanTitle}
          </DialogTitle>
          <DialogDescription>
            {he.docUpload.scanDesc}
          </DialogDescription>
        </DialogHeader>

        {/* ── IDLE: Drop zone ── */}
        {uploadState === "idle" && (
          <label
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            className={`flex flex-col items-center gap-4 p-8 border-2 border-dashed rounded-xl cursor-pointer transition-all duration-200 ${
              dragOver ? "border-gray-900 bg-muted" : "border-border hover:border-border hover:bg-muted"
            }`}
          >
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-muted">
              <Upload className="h-7 w-7 text-muted-foreground" />
            </div>
            <div className="text-center">
              <p className="text-sm font-semibold text-foreground">{he.docUpload.dragOrClick}</p>
              <p className="text-xs text-muted-foreground mt-1.5">{he.docUpload.allowedFormats}</p>
              <div className="mt-3 flex items-center justify-center gap-1.5 text-xs text-indigo-600">
                <Sparkles className="h-3.5 w-3.5" />
                <span>{he.docUpload.aiVisionLabel}</span>
              </div>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.jpg,.jpeg,.png"
              className="hidden"
              onChange={handleFileSelect}
            />
          </label>
        )}

        {/* ── SCANNING ── */}
        {uploadState === "scanning" && (
          <div className="flex flex-col items-center gap-4 py-10">
            <div className="relative flex h-16 w-16 items-center justify-center">
              <div className="absolute inset-0 rounded-full border-2 border-indigo-100 animate-ping opacity-50" />
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-indigo-50">
                <Scan className="h-7 w-7 text-indigo-600 animate-pulse" />
              </div>
            </div>
            <div className="text-center">
              <p className="text-sm font-semibold text-foreground">{he.docUpload.scanning}</p>
              <p className="text-xs text-muted-foreground mt-1">{he.docUpload.identifyingFields}</p>
            </div>
            <div className="flex items-center gap-1">
              <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground" />
              <span className="text-xs text-muted-foreground">{he.docUpload.pleaseWait}</span>
            </div>
          </div>
        )}

        {/* ── INVALID DOCUMENT ── */}
        {uploadState === "invalid_doc" && (
          <div className="flex flex-col items-center gap-4 py-8">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50">
              <AlertTriangle className="h-7 w-7 text-red-500" />
            </div>
            <div className="text-center">
              <p className="text-sm font-semibold text-red-700">{he.docUpload.invalidDocTitle}</p>
              <p className="text-xs text-muted-foreground mt-1.5">{he.docUpload.invalidDocDesc}</p>
            </div>
            <Button variant="outline" size="sm" onClick={resetState}>
              {he.docUpload.tryAgain}
            </Button>
          </div>
        )}

        {/* ── ERROR ── */}
        {uploadState === "error" && (
          <div className="flex flex-col items-center gap-3 p-6">
            <AlertCircle className="h-10 w-10 text-red-500" />
            <p className="text-sm text-red-600 text-center">{error}</p>
            <Button variant="outline" size="sm" onClick={resetState}>{he.docUpload.tryAgain}</Button>
          </div>
        )}

        {/* ── SCANNED: Success banner + editable form ── */}
        {(uploadState === "scanned" || uploadState === "saving") && scanResult && (
          <div className="space-y-4">
            {/* Success banner */}
            <div className="flex items-center gap-3 rounded-xl bg-emerald-50 border border-emerald-100 px-4 py-3">
              <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-emerald-800">{he.docUpload.scannedSuccess}</p>
                <p className="text-xs text-emerald-600 truncate mt-0.5">{scanResult.fileName}</p>
              </div>
              <span className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${
                scanResult.type === "invoice" ? "bg-blue-100 text-blue-700" : "bg-orange-100 text-orange-700"
              }`}>
                {scanResult.type === "invoice" ? he.docUpload.income : he.docUpload.expense}
              </span>
            </div>

            {error && (
              <div className="flex items-start gap-2 rounded-lg bg-red-50 px-3 py-2.5 text-sm text-red-600 border border-red-100">
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                {error}
              </div>
            )}

            {/* Editable fields */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs">{he.docUpload.docType}</Label>
                <Select value={docType} onValueChange={(v) => v && setDocType(v as "expense" | "invoice")}>
                  <SelectTrigger className="w-full h-9 text-sm">
                    <span className="flex flex-1">{docType === "expense" ? he.docUpload.expenseType : he.docUpload.invoiceType}</span>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="expense">{he.docUpload.expenseType}</SelectItem>
                    <SelectItem value="invoice">{he.docUpload.invoiceType}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs">{he.docUpload.amountLabel}</Label>
                <Input type="number" step="0.01" min="0" value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="h-9 text-sm" required />
              </div>

              <div className="col-span-2 space-y-1.5">
                <Label className="text-xs">{he.common.description}</Label>
                <Input value={description} onChange={(e) => setDescription(e.target.value)}
                  className="h-9 text-sm" required />
              </div>

              {docType === "invoice" && clients.length > 0 && (
                <div className="space-y-1.5">
                  <Label className="text-xs">{he.docUpload.clientOptional}</Label>
                  <Select value={clientId || "_none"} onValueChange={(v) => setClientId(v === "_none" ? "" : (v ?? ""))}>
                    <SelectTrigger className="w-full h-9 text-sm">
                      <span className="flex flex-1">{clientId ? (clients.find(c => c.id === clientId)?.name ?? clientId) : "{he.docUpload.noClient}"}</span>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="_none">{he.docUpload.noClient}</SelectItem>
                      {clients.map((c) => (
                        <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {docType === "expense" && (
                <>
                  <div className="space-y-1.5">
                    <Label className="text-xs">{he.docUpload.categoryLabel}</Label>
                    <Select value={category} onValueChange={(v) => v && setCategory(v)}>
                      <SelectTrigger className="w-full h-9 text-sm">
                        <span className="flex flex-1">{expenseCategories.find(c => c.value === category)?.label ?? category}</span>
                      </SelectTrigger>
                      <SelectContent>
                        {expenseCategories.map((cat) => (
                          <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs">{he.docUpload.vendorLabel}</Label>
                    <Input value={vendor} onChange={(e) => setVendor(e.target.value)} className="h-9 text-sm" />
                  </div>
                </>
              )}

              <div className="space-y-1.5">
                <Label className="text-xs">{he.common.date}</Label>
                <DatePicker value={date} onChange={setDate} name="date" />
              </div>

              <div className={`space-y-1.5 ${docType === "expense" ? "" : "col-span-2"}`}>
                <Label className="text-xs">{he.common.notes}</Label>
                <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} className="text-sm resize-none" />
              </div>
            </div>
          </div>
        )}

        {(uploadState === "scanned" || uploadState === "saving") && (
          <DialogFooter>
            <DialogClose render={<Button variant="outline" />}>{he.common.cancel}</DialogClose>
            <Button
              onClick={handleSave}
              disabled={isPending || uploadState === "saving" || !amount || !description}
              className="gap-1.5"
            >
              {uploadState === "saving" ? (
                <><Loader2 className="h-4 w-4 animate-spin" />{he.docUpload.savingLabel}</>
              ) : (
                <>{docType === "expense" ? he.docUpload.saveExpense : he.docUpload.saveInvoice}</>
              )}
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}
