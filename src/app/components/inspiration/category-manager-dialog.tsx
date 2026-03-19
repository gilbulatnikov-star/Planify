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
import type { CategoryData } from "./inspiration-page-client";

interface CategoryManagerDialogProps {
  categories: CategoryData[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CategoryManagerDialog({ categories, open, onOpenChange }: CategoryManagerDialogProps) {
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
        setError(result.error ?? "שגיאה ביצירת קטגוריה");
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
        setError(result.error ?? "שגיאה בעדכון קטגוריה");
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
        setError(result.error ?? "שגיאה במחיקת קטגוריה");
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>ניהול קטגוריות</DialogTitle>
          <DialogDescription>הוסף, ערוך או מחק קטגוריות השראה</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Existing categories */}
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {categories.map((cat) =>
              editingId === cat.id ? (
                <div key={cat.id} className="flex items-center gap-2 p-2 rounded-lg bg-gray-50 border border-gray-200">
                  <Input
                    value={editLabel}
                    onChange={(e) => setEditLabel(e.target.value)}
                    className="flex-1 h-8 text-sm bg-gray-50"
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
                    className="h-7 w-7 hover:bg-gray-100"
                    onClick={cancelEdit}
                  >
                    <X className="h-3.5 w-3.5" />
                  </Button>
                </div>
              ) : (
                <div
                  key={cat.id}
                  className="flex items-center gap-3 p-2 rounded-lg bg-gray-50/50 border border-gray-100 group hover:bg-gray-50 transition-colors"
                >
                  <span className="flex-1 text-sm">{cat.label}</span>
                  <div className="flex items-center gap-1 opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-opacity">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 hover:bg-gray-100 hover:text-gray-900"
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
                אין קטגוריות עדיין. הוסף אחת למטה.
              </p>
            )}
          </div>

          {/* Error message */}
          {error && (
            <p className="text-sm text-red-500 px-1">{error}</p>
          )}

          {/* Add new category */}
          <div className="border-t border-gray-200 pt-4 space-y-3">
            <p className="text-sm font-medium text-muted-foreground">קטגוריה חדשה</p>
            <div className="flex items-center gap-2">
              <Input
                placeholder="שם הקטגוריה..."
                value={newLabel}
                onChange={(e) => setNewLabel(e.target.value)}
                className="flex-1 h-9 bg-white border-gray-200"
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleAdd();
                }}
              />
              <Button
                size="sm"
                onClick={handleAdd}
                disabled={isPending || !newLabel.trim()}
                className="bg-gradient-to-r from-gray-800 to-gray-900 text-white hover:bg-gray-800 border-0 h-9"
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

