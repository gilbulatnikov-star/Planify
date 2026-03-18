"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { deleteTravelEntry } from "@/lib/actions/travel-actions";

interface DeleteTravelDialogProps {
  entryId: string;
  entryLabel: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DeleteTravelDialog({
  entryId,
  entryLabel,
  open,
  onOpenChange,
}: DeleteTravelDialogProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleDelete() {
    startTransition(async () => {
      await deleteTravelEntry(entryId);
      onOpenChange(false);
      router.refresh();
    });
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>מחיקת נסיעה</AlertDialogTitle>
          <AlertDialogDescription>
            האם אתה בטוח שברצונך למחוק את הנסיעה {entryLabel}?
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>ביטול</AlertDialogCancel>
          <AlertDialogAction
            variant="destructive"
            onClick={handleDelete}
            disabled={isPending}
          >
            {isPending ? "מוחק..." : "מחק"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
