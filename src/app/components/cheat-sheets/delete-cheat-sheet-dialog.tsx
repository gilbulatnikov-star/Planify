"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogAction,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";
import { deleteCheatSheet } from "@/lib/actions/cheat-sheet-actions";

interface DeleteCheatSheetDialogProps {
  cheatSheetId: string;
  cheatSheetTitle: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DeleteCheatSheetDialog({
  cheatSheetId,
  cheatSheetTitle,
  open,
  onOpenChange,
}: DeleteCheatSheetDialogProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleDelete() {
    startTransition(async () => {
      const result = await deleteCheatSheet(cheatSheetId);
      if (result.success) {
        onOpenChange(false);
        router.refresh();
      }
    });
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>מחיקת מדריך</AlertDialogTitle>
          <AlertDialogDescription>
            האם אתה בטוח שברצונך למחוק את &quot;{cheatSheetTitle}&quot;?
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>ביטול</AlertDialogCancel>
          <AlertDialogAction
            variant="destructive"
            disabled={isPending}
            onClick={handleDelete}
          >
            {isPending ? "מוחק..." : "מחק"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
