"use client";

import { useState, useEffect, useTransition } from "react";
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
import {
  createSubscription,
  updateSubscription,
} from "@/lib/actions/subscription-actions";
import { he } from "@/lib/he";

interface SubscriptionDialogProps {
  subscription?: {
    id: string;
    serviceName: string;
    billingCycle: string;
    amount: number;
    nextBillingDate: Date | null;
    status: string;
    notes: string | null;
  } | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function formatDateForInput(date: Date): string {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

const billingCycles = [
  { value: "monthly", label: "חודשי" },
  { value: "yearly", label: "שנתי" },
] as const;

const subscriptionStatuses = [
  { value: "active", label: "פעיל" },
  { value: "cancelled", label: "בוטל" },
] as const;

export function SubscriptionDialog({
  subscription,
  open,
  onOpenChange,
}: SubscriptionDialogProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const isEditing = !!subscription;

  const [serviceName, setServiceName] = useState("");
  const [billingCycle, setBillingCycle] = useState("monthly");
  const [amount, setAmount] = useState("");
  const [nextBillingDate, setNextBillingDate] = useState("");
  const [status, setStatus] = useState("active");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (subscription) {
      setServiceName(subscription.serviceName);
      setBillingCycle(subscription.billingCycle);
      setAmount(String(subscription.amount));
      setNextBillingDate(
        subscription.nextBillingDate
          ? formatDateForInput(subscription.nextBillingDate)
          : ""
      );
      setStatus(subscription.status);
      setNotes(subscription.notes ?? "");
    } else {
      setServiceName("");
      setBillingCycle("monthly");
      setAmount("");
      setNextBillingDate("");
      setStatus("active");
      setNotes("");
    }
  }, [subscription, open]);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const formData = new FormData(e.currentTarget);
    formData.set("billingCycle", billingCycle);
    formData.set("status", status);

    startTransition(async () => {
      if (isEditing) {
        await updateSubscription(subscription.id, formData);
      } else {
        await createSubscription(formData);
      }
      onOpenChange(false);
      router.refresh();
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "עריכת מנוי" : he.subscriptions.newSubscription}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? "ערוך את פרטי המנוי"
              : "הוסף מנוי חדש למערכת"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-2 gap-4 py-4">
            {/* שם השירות */}
            <div className="space-y-2">
              <Label htmlFor="serviceName">שם השירות</Label>
              <Input
                id="serviceName"
                name="serviceName"
                required
                value={serviceName}
                onChange={(e) => setServiceName(e.target.value)}
              />
            </div>

            {/* מחזור חיוב */}
            <div className="space-y-2">
              <Label htmlFor="billingCycle">מחזור חיוב</Label>
              <Select
                value={billingCycle}
                onValueChange={(v) => v && setBillingCycle(v)}
              >
                <SelectTrigger id="billingCycle" className="w-full">
                  <span className="flex flex-1">{billingCycles.find(c => c.value === billingCycle)?.label ?? billingCycle}</span>
                </SelectTrigger>
                <SelectContent>
                  {billingCycles.map((cycle) => (
                    <SelectItem key={cycle.value} value={cycle.value}>
                      {cycle.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* סכום */}
            <div className="space-y-2">
              <Label htmlFor="amount">סכום (&#8362;)</Label>
              <Input
                id="amount"
                name="amount"
                type="number"
                step="0.01"
                min="0"
                required
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </div>

            {/* תאריך חיוב הבא */}
            <div className="space-y-2">
              <Label htmlFor="nextBillingDate">חיוב הבא</Label>
              <Input
                id="nextBillingDate"
                name="nextBillingDate"
                type="date"
                value={nextBillingDate}
                onChange={(e) => setNextBillingDate(e.target.value)}
              />
            </div>

            {/* סטטוס */}
            <div className="space-y-2">
              <Label htmlFor="status">סטטוס</Label>
              <Select
                value={status}
                onValueChange={(v) => v && setStatus(v)}
              >
                <SelectTrigger id="status" className="w-full">
                  <span className="flex flex-1">{subscriptionStatuses.find(s => s.value === status)?.label ?? status}</span>
                </SelectTrigger>
                <SelectContent>
                  {subscriptionStatuses.map((s) => (
                    <SelectItem key={s.value} value={s.value}>
                      {s.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* הערות */}
            <div className="col-span-2 space-y-2">
              <Label htmlFor="notes">הערות</Label>
              <Textarea
                id="notes"
                name="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
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
