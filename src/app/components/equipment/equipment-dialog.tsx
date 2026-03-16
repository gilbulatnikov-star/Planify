"use client";

import { useTransition, useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
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
import { createEquipment, updateEquipment } from "@/lib/actions/equipment-actions";

interface EquipmentDialogProps {
  equipment?: {
    id: string;
    name: string;
    category: string;
    brand: string | null;
    model: string | null;
    serialNumber: string | null;
    purchasePrice: number | null;
    status: string;
    notes: string | null;
  } | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const categories = [
  { value: "camera", label: "מצלמה" },
  { value: "lens", label: "עדשה" },
  { value: "drone", label: "רחפן" },
  { value: "lighting", label: "תאורה" },
  { value: "audio", label: "אודיו" },
  { value: "grip", label: "גריפ" },
  { value: "other", label: "אחר" },
];

const statuses = [
  { value: "available", label: "זמין" },
  { value: "rented", label: "מושכר" },
  { value: "in_repair", label: "בתיקון" },
  { value: "retired", label: "לא בשימוש" },
];

export function EquipmentDialog({
  equipment,
  open,
  onOpenChange,
}: EquipmentDialogProps) {
  const [isPending, startTransition] = useTransition();
  const isEditing = !!equipment;

  const [name, setName] = useState("");
  const [category, setCategory] = useState("camera");
  const [brand, setBrand] = useState("");
  const [model, setModel] = useState("");
  const [serialNumber, setSerialNumber] = useState("");
  const [purchasePrice, setPurchasePrice] = useState("");
  const [status, setStatus] = useState("available");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (equipment) {
      setName(equipment.name);
      setCategory(equipment.category);
      setBrand(equipment.brand ?? "");
      setModel(equipment.model ?? "");
      setSerialNumber(equipment.serialNumber ?? "");
      setPurchasePrice(
        equipment.purchasePrice != null ? String(equipment.purchasePrice) : ""
      );
      setStatus(equipment.status);
      setNotes(equipment.notes ?? "");
    } else {
      setName("");
      setCategory("camera");
      setBrand("");
      setModel("");
      setSerialNumber("");
      setPurchasePrice("");
      setStatus("available");
      setNotes("");
    }
  }, [equipment, open]);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const formData = new FormData(e.currentTarget);

    // Manually inject select-controlled values (base-ui Select doesn't populate FormData)
    formData.set("category", category);
    formData.set("status", status);

    startTransition(async () => {
      if (isEditing) {
        await updateEquipment(equipment.id, formData);
      } else {
        await createEquipment(formData);
      }
      onOpenChange(false);
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "עריכת ציוד" : "הוספת ציוד חדש"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            {/* name */}
            <div className="space-y-2">
              <Label htmlFor="name">שם</Label>
              <Input
                id="name"
                name="name"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            {/* category */}
            <div className="space-y-2">
              <Label htmlFor="category">קטגוריה</Label>
              <Select
                name="category"
                value={category}
                onValueChange={(v) => v && setCategory(v)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.value} value={cat.value}>
                      {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* brand */}
            <div className="space-y-2">
              <Label htmlFor="brand">מותג</Label>
              <Input
                id="brand"
                name="brand"
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
              />
            </div>

            {/* model */}
            <div className="space-y-2">
              <Label htmlFor="model">דגם</Label>
              <Input
                id="model"
                name="model"
                value={model}
                onChange={(e) => setModel(e.target.value)}
              />
            </div>

            {/* serialNumber */}
            <div className="space-y-2">
              <Label htmlFor="serialNumber">מספר סריאלי</Label>
              <Input
                id="serialNumber"
                name="serialNumber"
                value={serialNumber}
                onChange={(e) => setSerialNumber(e.target.value)}
              />
            </div>

            {/* purchasePrice */}
            <div className="space-y-2">
              <Label htmlFor="purchasePrice">מחיר רכישה (&#8362;)</Label>
              <Input
                id="purchasePrice"
                name="purchasePrice"
                type="number"
                min="0"
                step="0.01"
                value={purchasePrice}
                onChange={(e) => setPurchasePrice(e.target.value)}
              />
            </div>

            {/* status */}
            <div className="space-y-2">
              <Label htmlFor="status">סטטוס</Label>
              <Select
                name="status"
                value={status}
                onValueChange={(v) => v && setStatus(v)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {statuses.map((s) => (
                    <SelectItem key={s.value} value={s.value}>
                      {s.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* notes — full width */}
          <div className="space-y-2">
            <Label htmlFor="notes">הערות</Label>
            <Textarea
              id="notes"
              name="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isPending}
            >
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
