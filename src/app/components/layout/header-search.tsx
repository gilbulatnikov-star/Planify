"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Search, FolderKanban, Users, CalendarDays, CheckSquare, FileText, Zap } from "lucide-react";

const quickNav = [
  { label: "פרויקטים", href: "/projects", icon: FolderKanban },
  { label: "לקוחות", href: "/clients", icon: Users },
  { label: "לוח שנה", href: "/calendar", icon: CalendarDays },
  { label: "משימות", href: "/tasks", icon: CheckSquare },
  { label: "כספים", href: "/financials", icon: FileText },
  { label: "אוטומציות", href: "/automations", icon: Zap },
];

export function HeaderSearch() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [focused, setFocused] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const filtered = query.trim()
    ? quickNav.filter((item) =>
        item.label.toLowerCase().includes(query.toLowerCase())
      )
    : [];

  // Show all quick-nav when focused with empty query
  const showAll = focused && !query.trim();

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setFocused(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  // Keyboard shortcut: Ctrl/Cmd + K to focus search
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        const input = ref.current?.querySelector("input");
        input?.focus();
      }
    }
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, []);

  const displayItems = showAll ? quickNav : filtered;

  return (
    <div ref={ref} className="relative hidden md:block">
      <div className="relative">
        <Search className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground/50 pointer-events-none" />
        <input
          placeholder="חיפוש..."
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setFocused(true);
          }}
          onFocus={() => setFocused(true)}
          onKeyDown={(e) => {
            if (e.key === "Escape") {
              setFocused(false);
              (e.target as HTMLInputElement).blur();
            }
          }}
          className="w-[220px] rounded-lg border border-border/50 bg-muted/30 pe-3 ps-8 py-1.5 text-[12.5px] text-foreground placeholder:text-muted-foreground/40 outline-none focus:border-accent/40 focus:ring-1 focus:ring-accent/15 focus:bg-background focus:w-[280px] transition-all duration-200"
        />
      </div>
      {focused && displayItems.length > 0 && (
        <div className="absolute end-0 top-full mt-1.5 w-[280px] rounded-xl border border-border/50 bg-card shadow-[0_8px_24px_-6px_rgba(0,0,0,0.14)] z-50 overflow-hidden max-h-[320px] overflow-y-auto">
          {showAll && (
            <div className="px-3 pt-2.5 pb-1">
              <span className="text-[9.5px] font-bold text-muted-foreground/40 tracking-[0.08em] uppercase">ניווט מהיר</span>
            </div>
          )}
          {displayItems.map((item, i) => (
            <Link
              key={`${item.href}-${i}`}
              href={item.href}
              onClick={() => {
                setQuery("");
                setFocused(false);
              }}
              className="flex items-center gap-2.5 px-3 py-2 hover:bg-foreground/[0.04] transition-colors duration-150 group"
            >
              <div className="flex h-6 w-6 items-center justify-center rounded-md bg-foreground/[0.04] group-hover:bg-accent/10 transition-colors shrink-0">
                <item.icon className="h-3 w-3 text-muted-foreground/50 group-hover:text-accent transition-colors" />
              </div>
              <span className="text-[12px] font-semibold text-foreground/75 group-hover:text-foreground/90 transition-colors">{item.label}</span>
            </Link>
          ))}
          {query.trim() && filtered.length === 0 && (
            <div className="px-3 py-4 text-center">
              <p className="text-[11px] text-muted-foreground/40 font-medium">לא נמצאו תוצאות</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
