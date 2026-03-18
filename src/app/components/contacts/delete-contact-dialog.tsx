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
import { deleteContact } from "@/lib/actions/contact-actions";

interface DeleteContactDialogProps {
  contactId: string;
  contactName: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DeleteContactDialog({
  contactId,
  contactName,
  open,
  onOpenChange,
}: DeleteContactDialogProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleDelete() {
    startTransition(async () => {
      const result = await deleteContact(contactId);
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
          <AlertDialogTitle>מחיקת איש קשר</AlertDialogTitle>
          <AlertDialogDescription>
            האם אתה בטוח שברצונך למחוק את {contactName}?
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
