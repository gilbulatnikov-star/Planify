"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { UpgradeDialog } from "@/app/components/shared/upgrade-dialog";

interface NewMoodboardButtonProps {
  action: () => Promise<void>;
  canCreate: boolean;
  planLimit: number;
  label?: string;
}

export function NewMoodboardButton({ action, canCreate, planLimit, label = "Moodboard חדש" }: NewMoodboardButtonProps) {
  const [upgradeOpen, setUpgradeOpen] = useState(false);

  function handleClick(e: React.MouseEvent) {
    if (!canCreate) {
      e.preventDefault();
      setUpgradeOpen(true);
    }
  }

  return (
    <>
      <UpgradeDialog
        open={upgradeOpen}
        onClose={() => setUpgradeOpen(false)}
        feature="לוחות תוכן"
        limit={planLimit}
      />
      <form action={action}>
        <button
          type="submit"
          onClick={handleClick}
          className="flex items-center gap-2 rounded-xl bg-foreground px-4 py-2.5 text-sm font-semibold text-white hover:bg-foreground/90 transition-colors shadow-sm"
        >
          <Plus className="h-4 w-4" />
          {label}
        </button>
      </form>
    </>
  );
}
