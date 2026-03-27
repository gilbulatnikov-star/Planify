"use client";

import { useState, useRef, useEffect } from "react";
import { useFormStatus } from "react-dom";
import { Plus, Loader2 } from "lucide-react";
import { UpgradeDialog } from "@/app/components/shared/upgrade-dialog";
import { useT } from "@/lib/i18n";

interface NewMoodboardButtonProps {
  action: (formData: FormData) => Promise<void>;
  canCreate: boolean;
  planLimit: number;
  label?: string;
}

function SubmitButton({ disabled }: { disabled: boolean }) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending || disabled}
      className="rounded-[10px] bg-foreground px-4 py-2 text-[13px] font-semibold text-background hover:bg-foreground/90 transition-colors disabled:opacity-40 disabled:pointer-events-none"
    >
      {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : "יצירה"}
    </button>
  );
}

export function NewMoodboardButton({ action, canCreate, planLimit, label }: NewMoodboardButtonProps) {
  const he = useT();
  const displayLabel = label ?? he.moodboard.newMoodboard;
  const [upgradeOpen, setUpgradeOpen] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const titleInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (dialogOpen) {
      setTimeout(() => titleInputRef.current?.focus(), 0);
    }
  }, [dialogOpen]);

  function openDialog() {
    if (!canCreate) {
      setUpgradeOpen(true);
      return;
    }
    setNewTitle("");
    setDialogOpen(true);
  }

  return (
    <>
      <UpgradeDialog
        open={upgradeOpen}
        onClose={() => setUpgradeOpen(false)}
        feature={he.moodboard.contentBoards}
        limit={planLimit}
      />

      <button
        type="button"
        onClick={openDialog}
        className="flex items-center gap-2 rounded-xl bg-foreground px-4 py-2.5 text-sm font-semibold text-background hover:bg-foreground/90 transition-colors shadow-sm"
      >
        <Plus className="h-4 w-4" />
        {displayLabel}
      </button>

      {dialogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setDialogOpen(false)} />
          <div
            className="relative z-10 w-full max-w-sm rounded-[14px] border border-border/40 bg-card p-6 shadow-xl"
            onKeyDown={(e) => {
              if (e.key === "Escape") setDialogOpen(false);
            }}
          >
            <h2 className="text-[15px] font-bold text-foreground mb-4">שם המודבורד</h2>
            <form
              action={(formData) => {
                setDialogOpen(false);
                action(formData);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !newTitle.trim()) {
                  e.preventDefault();
                }
              }}
            >
              <input
                ref={titleInputRef}
                type="text"
                name="title"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="הזן שם למודבורד..."
                className="w-full rounded-[10px] border border-border/40 bg-background px-4 py-2.5 text-[13px] text-foreground placeholder:text-foreground/30 outline-none focus:border-accent/40 focus:ring-1 focus:ring-accent/20 transition-all duration-200"
              />
              {newTitle.length > 0 && !newTitle.trim() && (
                <p className="mt-1.5 text-[11px] text-red-500">יש להזין שם תקין</p>
              )}
              <div className="mt-4 flex gap-2 justify-end">
                <button
                  type="button"
                  onClick={() => setDialogOpen(false)}
                  className="rounded-[10px] px-4 py-2 text-[13px] font-medium text-foreground/60 hover:bg-muted transition-colors"
                >
                  ביטול
                </button>
                <SubmitButton disabled={!newTitle.trim()} />
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
