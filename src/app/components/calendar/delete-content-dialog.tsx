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
import { deleteScheduledContent } from "@/lib/actions/calendar-actions";

interface DeleteContentDialogProps {
  contentId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DeleteContentDialog({
  contentId,
  open,
  onOpenChange,
}: DeleteContentDialogProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleDelete() {
    startTransition(async () => {
      const result = await deleteScheduledContent(contentId);
      if (result.success) {
        onOpenChange(false);
        // Force re-fetch server data so deleted events disappear immediately
        router.refresh();
      }
    });
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>מחיקת תוכן</AlertDialogTitle>
          <AlertDialogDescription>
            האם אתה בטוח שברצונך למחוק תוכן זה מהלוח?
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
