"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { createContact, updateContact } from "@/lib/actions/contact-actions";
import { he } from "@/lib/he";

interface ContactDialogProps {
  contact?: {
    id: string;
    name: string;
    category: string;
    phone: string | null;
    email: string | null;
    dailyRate: number | null;
    notes: string | null;
  } | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const categoryOptions = [
  { value: "editor", label: he.contacts.categories.editor },
  { value: "stills_photographer", label: he.contacts.categories.stills_photographer },
  { value: "video_photographer", label: he.contacts.categories.video_photographer },
  { value: "lighting", label: he.contacts.categories.lighting },
  { value: "director", label: he.contacts.categories.director },
  { value: "art", label: he.contacts.categories.art },
  { value: "production_assistant", label: he.contacts.categories.production_assistant },
  { value: "producer", label: he.contacts.categories.producer },
  { value: "three_d", label: he.contacts.categories.three_d },
  { value: "sound_designer", label: he.contacts.categories.sound_designer },
  { value: "makeup", label: he.contacts.categories.makeup },
  { value: "actor", label: he.contacts.categories.actor },
  { value: "rental_house", label: he.contacts.categories.rental_house },
  { value: "studio", label: he.contacts.categories.studio },
  { value: "social_manager", label: he.contacts.categories.social_manager },
] as const;

export function ContactDialog({ contact, open, onOpenChange }: ContactDialogProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const isEditing = !!contact;

  const [category, setCategory] = useState(contact?.category ?? "editor");

  function handleOpenChange(open: boolean) {
    if (open) {
      setCategory(contact?.category ?? "editor");
    }
    onOpenChange(open);
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    formData.set("category", category);

    startTransition(async () => {
      const result = isEditing
        ? await updateContact(contact.id, formData)
        : await createContact(formData);

      if (result.success) {
        onOpenChange(false);
        router.refresh();
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "עריכת איש קשר" : he.contacts.newContact}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? "ערוך את פרטי איש הקשר"
              : "הוסף איש קשר חדש לרשת"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-2 gap-4 py-4">
            {/* Name */}
            <div className="col-span-2 space-y-2">
              <Label htmlFor="name">שם *</Label>
              <Input
                id="name"
                name="name"
                required
                defaultValue={contact?.name ?? ""}
              />
            </div>

            {/* Category */}
            <div className="space-y-2">
              <Label>קטגוריה *</Label>
              <Select value={category} onValueChange={(v) => v && setCategory(v)}>
                <SelectTrigger className="w-full">
                  <span className="flex flex-1">{categoryOptions.find(o => o.value === category)?.label ?? category}</span>
                </SelectTrigger>
                <SelectContent>
                  {categoryOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Phone */}
            <div className="space-y-2">
              <Label htmlFor="phone">טלפון</Label>
              <Input
                id="phone"
                name="phone"
                type="tel"
                defaultValue={contact?.phone ?? ""}
              />
            </div>

            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email">אימייל</Label>
              <Input
                id="email"
                name="email"
                type="email"
                defaultValue={contact?.email ?? ""}
              />
            </div>

            {/* Daily Rate */}
            <div className="space-y-2">
              <Label htmlFor="dailyRate">תעריף יומי (₪)</Label>
              <Input
                id="dailyRate"
                name="dailyRate"
                type="number"
                step="0.01"
                defaultValue={contact?.dailyRate ?? ""}
              />
            </div>

            {/* Notes */}
            <div className="col-span-2 space-y-2">
              <Label htmlFor="notes">הערות</Label>
              <Textarea
                id="notes"
                name="notes"
                defaultValue={contact?.notes ?? ""}
              />
            </div>
          </div>

          <DialogFooter>
            <DialogClose render={<Button variant="outline" />}>
              {he.common.cancel}
            </DialogClose>
            <Button type="submit" disabled={isPending}>
              {isPending ? "שומר..." : he.common.save}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
