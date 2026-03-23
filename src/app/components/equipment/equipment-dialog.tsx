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
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { createEquipment, updateEquipment } from "@/lib/actions/equipment-actions";
import { useT } from "@/lib/i18n";

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

// Categories and statuses are now resolved dynamically via useT()

export function EquipmentDialog({
  equipment,
  open,
  onOpenChange,
}: EquipmentDialogProps) {
  const [isPending, startTransition] = useTransition();
  const he = useT();
  const isEditing = !!equipment;

  const categories = [
    { value: "camera", label: he.equipment.categories.camera },
    { value: "lens", label: he.equipment.categories.lens },
    { value: "drone", label: he.equipment.categories.drone },
    { value: "lighting", label: he.equipment.categories.lighting },
    { value: "audio", label: he.equipment.categories.audio },
    { value: "grip", label: he.equipment.categories.grip },
    { value: "other", label: he.equipment.categories.other },
  ];

  const statuses = [
    { value: "available", label: he.equipment.statuses.available },
    { value: "rented", label: he.equipment.statuses.rented },
    { value: "in_repair", label: he.equipment.statuses.in_repair },
    { value: "retired", label: he.equipment.statuses.retired },
  ];

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
            {isEditing ? he.financialExtra.editEquipment : he.financialExtra.newEquipment}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            {/* name */}
            <div className="space-y-2">
              <Label htmlFor="name">{he.equipment.name}</Label>
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
              <Label htmlFor="category">{he.equipment.category}</Label>
              <Select
                name="category"
                value={category}
                onValueChange={(v) => v && setCategory(v)}
              >
                <SelectTrigger className="w-full">
                  <span className="flex flex-1">{categories.find(cat => cat.value === category)?.label ?? category}</span>
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
              <Label htmlFor="brand">{he.equipment.brand}</Label>
              <Input
                id="brand"
                name="brand"
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
              />
            </div>

            {/* model */}
            <div className="space-y-2">
              <Label htmlFor="model">{he.equipment.model}</Label>
              <Input
                id="model"
                name="model"
                value={model}
                onChange={(e) => setModel(e.target.value)}
              />
            </div>

            {/* serialNumber */}
            <div className="space-y-2">
              <Label htmlFor="serialNumber">{he.equipment.serialNumber}</Label>
              <Input
                id="serialNumber"
                name="serialNumber"
                value={serialNumber}
                onChange={(e) => setSerialNumber(e.target.value)}
              />
            </div>

            {/* purchasePrice */}
            <div className="space-y-2">
              <Label htmlFor="purchasePrice">{he.financialExtra.purchasePriceLabel}</Label>
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
              <Label htmlFor="status">{he.equipment.status}</Label>
              <Select
                name="status"
                value={status}
                onValueChange={(v) => v && setStatus(v)}
              >
                <SelectTrigger className="w-full">
                  <span className="flex flex-1">{statuses.find(s => s.value === status)?.label ?? status}</span>
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
            <Label htmlFor="notes">{he.common.notes}</Label>
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
              {he.common.cancel}
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? he.common.saving : he.common.save}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
