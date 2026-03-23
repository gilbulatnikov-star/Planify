"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2, Pencil, Check, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  createInspirationCategory,
  updateInspirationCategory,
  deleteInspirationCategory,
} from "@/lib/actions/inspiration-actions";
import { useT } from "@/lib/i18n";
import type { CategoryData } from "./inspiration-page-client";

interface CategoryManagerDialogProps {
  categories: CategoryData[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CategoryManagerDialog({ categories, open, onOpenChange }: CategoryManagerDialogProps) {
  const he = useT();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  // New category form
  const [newLabel, setNewLabel] = useState("");

  // Editing state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editLabel, setEditLabel] = useState("");

  // Error state
  const [error, setError] = useState<string | null>(null);

  function handleAdd() {
    if (!newLabel.trim()) return;
    setError(null);

    const formData = new FormData();
    formData.set("label", newLabel.trim());
    formData.set("color", "gray");

    startTransition(async () => {
      const result = await createInspirationCategory(formData);
      if (result.success) {
        setNewLabel("");
        router.refresh();
      } else {
        setError(result.error ?? he.inspirationExtra.createError);
      }
    });
  }

  function startEdit(cat: CategoryData) {
    setEditingId(cat.id);
    setEditLabel(cat.label);
    setError(null);
  }

  function cancelEdit() {
    setEditingId(null);
    setEditLabel("");
  }

  function handleUpdate(id: string) {
    if (!editLabel.trim()) return;
    setError(null);

    const formData = new FormData();
    formData.set("label", editLabel.trim());
    formData.set("color", "gray");

    startTransition(async () => {
      const result = await updateInspirationCategory(id, formData);
      if (result.success) {
        cancelEdit();
        router.refresh();
      } else {
        setError(result.error ?? he.inspirationExtra.updateError);
      }
    });
  }

  function handleDelete(id: string) {
    setError(null);
    startTransition(async () => {
      const result = await deleteInspirationCategory(id);
      if (result.success) {
        router.refresh();
      } else {
        setError(result.error ?? he.inspirationExtra.deleteError);
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{he.inspirationExtra.manageCategories}</DialogTitle>
          <DialogDescription>{he.inspirationExtra.manageCategoriesDesc}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Existing categories */}
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {categories.map((cat) =>
              editingId === cat.id ? (
                <div key={cat.id} className="flex items-center gap-2 p-2 rounded-lg bg-muted border border-border">
                  <Input
                    value={editLabel}
                    onChange={(e) => setEditLabel(e.target.value)}
                    className="flex-1 h-8 text-sm bg-muted"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleUpdate(cat.id);
                      if (e.key === "Escape") cancelEdit();
                    }}
                    autoFocus
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 hover:bg-emerald-50 hover:text-emerald-600"
                    onClick={() => handleUpdate(cat.id)}
                    disabled={isPending}
                  >
                    <Check className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 hover:bg-muted"
                    onClick={cancelEdit}
                  >
                    <X className="h-3.5 w-3.5" />
                  </Button>
                </div>
              ) : (
                <div
                  key={cat.id}
                  className="flex items-center gap-3 p-2 rounded-lg bg-muted/30 border border-border group hover:bg-muted transition-colors"
                >
                  <span className="flex-1 text-sm">{cat.label}</span>
                  <div className="flex items-center gap-1 opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-opacity delay-75">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 hover:bg-muted hover:text-foreground"
                      onClick={() => startEdit(cat)}
                    >
                      <Pencil className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 hover:bg-red-50 text-destructive"
                      onClick={() => handleDelete(cat.id)}
                      disabled={isPending}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              )
            )}
            {categories.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">
                {he.inspirationExtra.noCategoriesEmpty}
              </p>
            )}
          </div>

          {/* Error message */}
          {error && (
            <p className="text-sm text-red-500 px-1">{error}</p>
          )}

          {/* Add new category */}
          <div className="border-t border-border pt-4 space-y-3">
            <p className="text-sm font-medium text-muted-foreground">{he.inspirationExtra.newCategory}</p>
            <div className="flex items-center gap-2">
              <Input
                placeholder={he.inspirationExtra.categoryNamePlaceholder}
                value={newLabel}
                onChange={(e) => setNewLabel(e.target.value)}
                className="flex-1 h-9 bg-background border-border"
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleAdd();
                }}
              />
              <Button
                size="sm"
                onClick={handleAdd}
                disabled={isPending || !newLabel.trim()}
                className="bg-foreground text-background hover:bg-foreground/90 border-0 h-9"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

