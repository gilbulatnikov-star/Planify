"use client";

import * as React from "react";
import { CalendarDays } from "lucide-react";
import { Calendar } from "./calendar";
import { useLocale } from "@/lib/i18n";
import { he as heLocale } from "date-fns/locale/he";
import { enUS } from "date-fns/locale/en-US";

const MAX_YEAR = new Date().getFullYear() + 5;
const MIN_YEAR = new Date().getFullYear() - 5;

interface DatePickerProps {
  value?: string; // ISO date string yyyy-mm-dd
  onChange?: (value: string) => void;
  placeholder?: string;
  name?: string;
  className?: string;
}

export function DatePicker({ value, onChange, placeholder, name, className }: DatePickerProps) {
  const locale = useLocale();
  const [open, setOpen] = React.useState(false);
  const ref = React.useRef<HTMLDivElement>(null);

  const selected = value ? new Date(value + "T00:00:00") : undefined;

  const calLocale = locale === "he" ? heLocale : enUS;

  const formatDisplay = (date: Date) =>
    date.toLocaleDateString(locale === "he" ? "he-IL" : "en-US", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });

  React.useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    if (open) document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  return (
    <div ref={ref} className={`relative ${className ?? ""}`}>
      {name && <input type="hidden" name={name} value={value ?? ""} />}
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="flex h-10 w-full items-center gap-2 rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground transition-colors hover:bg-muted/50 focus:outline-none focus:ring-2 focus:ring-ring"
      >
        <CalendarDays className="h-4 w-4 text-muted-foreground shrink-0" />
        <span className={selected ? "" : "text-muted-foreground"}>
          {selected ? formatDisplay(selected) : (placeholder ?? "Select date")}
        </span>
      </button>
      {open && (
        <div className="absolute top-full mt-1 z-50 rounded-xl border border-border bg-card shadow-xl">
          <Calendar
            mode="single"
            selected={selected}
            onSelect={(date) => {
              if (date) {
                const iso = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
                onChange?.(iso);
              } else {
                onChange?.("");
              }
              setOpen(false);
            }}
            defaultMonth={selected}
            locale={calLocale}
            captionLayout="dropdown"
            startMonth={new Date(MIN_YEAR, 0)}
            endMonth={new Date(MAX_YEAR, 11)}
            disabled={{ after: new Date(MAX_YEAR, 11, 31), before: new Date(MIN_YEAR, 0, 1) }}
          />
        </div>
      )}
    </div>
  );
}
