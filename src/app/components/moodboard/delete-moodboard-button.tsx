"use client";

import { Trash2 } from "lucide-react";
import { deleteMoodboard } from "@/lib/actions/moodboard-actions";
import { useTransition } from "react";

export function DeleteMoodboardButton({ id }: { id: string }) {
  const [isPending, startTransition] = useTransition();

  function handleDelete(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (!confirm("למחוק את הלוח?")) return;
    startTransition(() => deleteMoodboard(id));
  }

  return (
    <button
      onClick={handleDelete}
      disabled={isPending}
      className="flex h-8 w-8 items-center justify-center rounded-lg bg-white shadow border border-gray-200 hover:bg-red-50 hover:border-red-200 transition-colors"
    >
      <Trash2 className="h-3.5 w-3.5 text-red-400" />
    </button>
  );
}
