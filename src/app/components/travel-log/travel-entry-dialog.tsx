"use client";

import { useState, useEffect, useTransition } from "react";
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
import { DatePicker } from "@/components/ui/date-picker";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  createTravelEntry,
  updateTravelEntry,
} from "@/lib/actions/travel-actions";
import { useT } from "@/lib/i18n";

interface TravelEntryDialogProps {
  entry?: {
    id: string;
    date: Date;
    origin: string;
    destination: string;
    kilometers: number;
    purpose: string | null;
    clientId: string | null;
    projectId: string | null;
  } | null;
  clients: { id: string; name: string }[];
  projects: { id: string; title: string }[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function formatDateForInput(date: Date): string {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

const NONE_VALUE = "__none__";

export function TravelEntryDialog({
  entry,
  clients,
  projects,
  open,
  onOpenChange,
}: TravelEntryDialogProps) {
  const he = useT();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const isEditing = !!entry;

  const [date, setDate] = useState("");
  const [origin, setOrigin] = useState("");
  const [destination, setDestination] = useState("");
  const [kilometers, setKilometers] = useState("");
  const [purpose, setPurpose] = useState("");
  const [clientId, setClientId] = useState(NONE_VALUE);
  const [projectId, setProjectId] = useState(NONE_VALUE);

  useEffect(() => {
    if (entry) {
      setDate(formatDateForInput(entry.date));
      setOrigin(entry.origin);
      setDestination(entry.destination);
      setKilometers(String(entry.kilometers));
      setPurpose(entry.purpose ?? "");
      setClientId(entry.clientId ?? NONE_VALUE);
      setProjectId(entry.projectId ?? NONE_VALUE);
    } else {
      setDate("");
      setOrigin("");
      setDestination("");
      setKilometers("");
      setPurpose("");
      setClientId(NONE_VALUE);
      setProjectId(NONE_VALUE);
    }
  }, [entry, open]);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const formData = new FormData(e.currentTarget);
    formData.set("clientId", clientId === NONE_VALUE ? "" : clientId);
    formData.set("projectId", projectId === NONE_VALUE ? "" : projectId);

    startTransition(async () => {
      if (isEditing) {
        await updateTravelEntry(entry.id, formData);
      } else {
        await createTravelEntry(formData);
      }
      onOpenChange(false);
      router.refresh();
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? he.travelExtra.editTrip : he.travelLog.newEntry}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? he.travelExtra.editDetails
              : he.travelExtra.addNew}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-2 gap-4 py-4">
            {/* תאריך */}
            <div className="space-y-2">
              <Label htmlFor="date">{he.common.date}</Label>
              <DatePicker value={date} onChange={setDate} name="date" />
            </div>

            {/* ק״מ */}
            <div className="space-y-2">
              <Label htmlFor="kilometers">{he.travelLog.kilometers}</Label>
              <Input
                id="kilometers"
                name="kilometers"
                type="number"
                step="0.1"
                min="0"
                required
                value={kilometers}
                onChange={(e) => setKilometers(e.target.value)}
              />
            </div>

            {/* מוצא */}
            <div className="space-y-2">
              <Label htmlFor="origin">{he.travelLog.origin}</Label>
              <Input
                id="origin"
                name="origin"
                required
                value={origin}
                onChange={(e) => setOrigin(e.target.value)}
              />
            </div>

            {/* יעד */}
            <div className="space-y-2">
              <Label htmlFor="destination">{he.travelLog.destination}</Label>
              <Input
                id="destination"
                name="destination"
                required
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
              />
            </div>

            {/* לקוח */}
            <div className="space-y-2">
              <Label htmlFor="clientId">{he.common.client}</Label>
              <Select
                value={clientId}
                onValueChange={(v) => v && setClientId(v)}
              >
                <SelectTrigger id="clientId" className="w-full">
                  <span className="flex flex-1">{clientId === NONE_VALUE ? he.common.none : (clients.find(c => c.id === clientId)?.name ?? clientId)}</span>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={NONE_VALUE}>{he.common.none}</SelectItem>
                  {clients.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* פרויקט */}
            <div className="space-y-2">
              <Label htmlFor="projectId">{he.common.project}</Label>
              <Select
                value={projectId}
                onValueChange={(v) => v && setProjectId(v)}
              >
                <SelectTrigger id="projectId" className="w-full">
                  <span className="flex flex-1">{projectId === NONE_VALUE ? he.common.none : (projects.find(p => p.id === projectId)?.title ?? projectId)}</span>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={NONE_VALUE}>{he.common.none}</SelectItem>
                  {projects.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* מטרה */}
            <div className="col-span-2 space-y-2">
              <Label htmlFor="purpose">{he.travelExtra.purposeLabel}</Label>
              <Textarea
                id="purpose"
                name="purpose"
                value={purpose}
                onChange={(e) => setPurpose(e.target.value)}
              />
            </div>
          </div>

          <DialogFooter>
            <DialogClose render={<Button variant="outline" />}>
              {he.common.cancel}
            </DialogClose>
            <Button type="submit" disabled={isPending}>
              {isPending ? he.common.saving : he.common.save}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
