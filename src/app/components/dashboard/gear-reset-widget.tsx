"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Wrench, HardDrive, Film, Battery } from "lucide-react";
import { he } from "@/lib/he";
import { toggleGearStatus } from "@/lib/actions/widget-actions";
import { type LucideIcon } from "lucide-react";

interface GearStatusItem {
  id: string;
  key: string;
  label: string;
  isReady: boolean;
}

interface GearResetWidgetProps {
  initialStatuses: GearStatusItem[];
}

const gearIconMap: Record<string, LucideIcon> = {
  sd_cards: HardDrive,
  footage: Film,
  batteries: Battery,
};

export function GearResetWidget({ initialStatuses }: GearResetWidgetProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleToggle(id: string) {
    startTransition(async () => {
      await toggleGearStatus(id);
      router.refresh();
    });
  }

  return (
    <Card className="glass-card">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {he.widgets.gearReset}
        </CardTitle>
        <div className="rounded-lg bg-gray-100 p-1.5">
          <Wrench className="h-4 w-4 text-foreground" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 gap-3">
          {initialStatuses.map((status) => {
            const Icon = gearIconMap[status.key] || HardDrive;
            const label =
              he.widgets.gearItems[
                status.key as keyof typeof he.widgets.gearItems
              ] || status.label;

            return (
              <button
                key={status.id}
                onClick={() => handleToggle(status.id)}
                disabled={isPending}
                className={`flex flex-col items-center gap-2 rounded-xl border p-4 transition-all ${
                  status.isReady
                    ? "border-emerald-200 bg-emerald-50 hover:bg-emerald-100"
                    : "border-red-200 bg-red-50 hover:bg-red-100"
                } ${isPending ? "opacity-50" : ""}`}
              >
                <Icon
                  className={`h-6 w-6 ${
                    status.isReady ? "text-emerald-600" : "text-red-500"
                  }`}
                />
                <span className="text-xs font-medium text-foreground">
                  {label}
                </span>
                <span
                  className={`text-[10px] font-medium ${
                    status.isReady ? "text-emerald-600" : "text-red-500"
                  }`}
                >
                  {status.isReady
                    ? he.widgets.gearReady
                    : he.widgets.gearNotReady}
                </span>
              </button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
