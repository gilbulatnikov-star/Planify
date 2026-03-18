"use client";

import { useTransition } from "react";
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
import { deleteQuote } from "@/lib/actions/financial-actions";

interface DeleteQuoteDialogProps {
  quoteId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DeleteQuoteDialog({
  quoteId,
  open,
  onOpenChange,
}: DeleteQuoteDialogProps) {
  const [isPending, startTransition] = useTransition();

  function handleDelete() {
    startTransition(async () => {
      const result = await deleteQuote(quoteId);
      if (result.success) {
        onOpenChange(false);
      }
    });
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>מחיקת הצעת מחיר</AlertDialogTitle>
          <AlertDialogDescription>
            האם אתה בטוח שברצונך למחוק הצעת מחיר זו? פעולה זו אינה ניתנת לביטול.
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
