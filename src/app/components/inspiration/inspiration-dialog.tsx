"use client";

import { useState, useTransition, useRef } from "react";
import { useRouter } from "next/navigation";
import { ImageIcon, Loader2, X } from "lucide-react";
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
import { useT } from "@/lib/i18n";
import type { CategoryData } from "./inspiration-page-client";

interface InspirationDialogProps {
  inspiration?: {
    id: string;
    title: string;
    url: string | null;
    imageUrl: string | null;
    category: string;
    categoryId: string | null;
    notes: string | null;
  } | null;
  categories: CategoryData[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function compressImage(file: File, maxWidth = 1200, quality = 0.75): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      let w = img.width, h = img.height;
      if (w > maxWidth) { h = Math.round(h * maxWidth / w); w = maxWidth; }
      canvas.width = w; canvas.height = h;
      const ctx = canvas.getContext("2d");
      if (!ctx) { reject(new Error("Canvas not supported")); return; }
      ctx.drawImage(img, 0, 0, w, h);
      resolve(canvas.toDataURL("image/jpeg", quality));
    };
    img.onerror = () => reject(new Error("Failed to load image"));
    img.src = URL.createObjectURL(file);
  });
}

export function InspirationDialog({ inspiration, categories, open, onOpenChange }: InspirationDialogProps) {
  const he = useT();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [saveError, setSaveError] = useState<string | null>(null);
  const isEditing = !!inspiration;

  const defaultCategoryId = inspiration?.categoryId ?? categories[0]?.id ?? "";
  const [categoryId, setCategoryId] = useState(defaultCategoryId);
  const [imageUrl, setImageUrl] = useState<string | null>(inspiration?.imageUrl ?? null);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  function handleOpenChange(open: boolean) {
    if (open) {
      setCategoryId(inspiration?.categoryId ?? categories[0]?.id ?? "");
      setImageUrl(inspiration?.imageUrl ?? null);
      setSaveError(null);
    }
    onOpenChange(open);
  }

  function handleFile(file: File | null) {
    if (!file || !file.type.startsWith("image/")) return;
    setUploading(true);
    compressImage(file).then(dataUrl => {
      setImageUrl(dataUrl);
      setUploading(false);
    }).catch(() => { setUploading(false); });
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaveError(null);

    if (!categoryId) {
      setSaveError(he.inspirationExtra.needCategoryFirst);
      return;
    }

    const formData = new FormData(e.currentTarget);
    formData.set("categoryId", categoryId);
    formData.set("imageUrl", imageUrl ?? "");

    startTransition(async () => {
      const result = isEditing
        ? await updateInspiration(inspiration.id, formData)
        : await createInspiration(formData);

      if (result.success) {
        onOpenChange(false);
        router.refresh();
      } else {
        setSaveError(result.error ?? he.inspirationExtra.saveError);
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? he.inspirationExtra.editInspiration : he.inspiration.newItem}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? he.inspirationExtra.editDetails
              : he.inspirationExtra.addToBoard}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-2 gap-4 py-4">
            {/* Title */}
            <div className="col-span-2 space-y-2">
              <Label htmlFor="title">{he.inspirationExtra.titleRequired}</Label>
              <Input
                id="title"
                name="title"
                required
                defaultValue={inspiration?.title ?? ""}
              />
            </div>

            {/* Image upload */}
            <div className="col-span-2 space-y-2">
              <Label>{he.moodboard?.uploadTab ?? "תמונה"}</Label>
              {imageUrl ? (
                <div className="relative rounded-xl overflow-hidden border border-border">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={imageUrl} alt="" className="w-full max-h-48 object-cover" />
                  <button type="button" onClick={() => setImageUrl(null)}
                    className="absolute top-2 left-2 flex h-6 w-6 items-center justify-center rounded-full bg-black/60 text-white hover:bg-black/80 transition-colors">
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              ) : (
                <button type="button" onClick={() => fileRef.current?.click()} disabled={uploading}
                  onDragOver={e => { e.preventDefault(); e.currentTarget.classList.add("border-blue-400"); }}
                  onDragLeave={e => { e.currentTarget.classList.remove("border-blue-400"); }}
                  onDrop={e => { e.preventDefault(); e.currentTarget.classList.remove("border-blue-400"); handleFile(e.dataTransfer.files?.[0] ?? null); }}
                  className="flex flex-col items-center justify-center gap-2 w-full h-24 bg-muted rounded-xl border-2 border-dashed border-border hover:border-blue-300 transition-colors">
                  {uploading
                    ? <Loader2 className="h-5 w-5 text-muted-foreground animate-spin" />
                    : <><ImageIcon className="h-5 w-5 text-muted-foreground" /><span className="text-[11px] text-muted-foreground">{he.moodboard?.dragOrClick ?? "גרור תמונה או לחץ"}</span></>
                  }
                </button>
              )}
              <input ref={fileRef} type="file" accept="image/*" className="hidden"
                onChange={e => handleFile(e.target.files?.[0] ?? null)} />
            </div>

            {/* URL */}
            <div className="col-span-2 space-y-2">
              <Label htmlFor="url">{he.inspirationExtra.linkLabel}</Label>
              <Input
                id="url"
                name="url"
                type="url"
                defaultValue={inspiration?.url ?? ""}
              />
            </div>

            {/* Category */}
            <div className="col-span-2 space-y-2">
              <Label>{he.inspirationExtra.categoryRequired}</Label>
              {categories.length === 0 ? (
                <p className="text-sm text-amber-600 bg-amber-50 dark:bg-amber-950/30 dark:text-amber-400 rounded-lg px-3 py-2">
                  {he.inspirationExtra.noCategoriesYet}
                </p>
              ) : (
                <Select value={categoryId} onValueChange={(v) => v && setCategoryId(v)}>
                  <SelectTrigger className="w-full">
                    <span className="flex flex-1">{categoryId ? (categories.find(cat => cat.id === categoryId)?.label ?? categoryId) : he.inspirationExtra.selectCategory}</span>
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
              <Label htmlFor="notes">{he.common.notes}</Label>
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
              {isPending ? he.common.saving : he.common.save}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
