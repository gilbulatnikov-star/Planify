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
import { createAsset, updateAsset } from "@/lib/actions/asset-actions";
import { useT } from "@/lib/i18n";

interface AssetDialogProps {
  asset?: {
    id: string;
    name: string;
    type: string;
    source: string | null;
    originalUrl: string | null;
    notes: string | null;
  } | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AssetDialog({ asset, open, onOpenChange }: AssetDialogProps) {
  const he = useT();

  const typeOptions = [
    { value: "music", label: he.assets.types.music },
    { value: "sfx", label: he.assets.types.sfx },
    { value: "font", label: he.assets.types.font },
    { value: "stock_footage", label: he.assets.types.stock_footage },
  ] as const;

  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const isEditing = !!asset;

  const [type, setType] = useState(asset?.type ?? "music");

  function handleOpenChange(open: boolean) {
    if (open) {
      setType(asset?.type ?? "music");
    }
    onOpenChange(open);
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    formData.set("type", type);

    startTransition(async () => {
      const result = isEditing
        ? await updateAsset(asset.id, formData)
        : await createAsset(formData);

      if (result.success) {
        onOpenChange(false);
        router.refresh();
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "עריכת נכס" : he.assets.newAsset}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? "ערוך את פרטי הנכס"
              : "הוסף נכס חדש לספרייה"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-2 gap-4 py-4">
            {/* Name */}
            <div className="col-span-2 space-y-2">
              <Label htmlFor="name">שם *</Label>
              <Input
                id="name"
                name="name"
                required
                defaultValue={asset?.name ?? ""}
              />
            </div>

            {/* Type */}
            <div className="space-y-2">
              <Label>סוג *</Label>
              <Select value={type} onValueChange={(v) => v && setType(v)}>
                <SelectTrigger className="w-full">
                  <span className="flex flex-1">{typeOptions.find(o => o.value === type)?.label ?? type}</span>
                </SelectTrigger>
                <SelectContent>
                  {typeOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Source */}
            <div className="space-y-2">
              <Label htmlFor="source">מקור</Label>
              <Input
                id="source"
                name="source"
                placeholder="Artlist, Envato..."
                defaultValue={asset?.source ?? ""}
              />
            </div>

            {/* URL */}
            <div className="col-span-2 space-y-2">
              <Label htmlFor="originalUrl">קישור</Label>
              <Input
                id="originalUrl"
                name="originalUrl"
                type="url"
                defaultValue={asset?.originalUrl ?? ""}
              />
            </div>

            {/* Notes */}
            <div className="col-span-2 space-y-2">
              <Label htmlFor="notes">הערות</Label>
              <Textarea
                id="notes"
                name="notes"
                defaultValue={asset?.notes ?? ""}
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
