"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { ChevronDownIcon, Search, Check } from "lucide-react";
import { cn } from "@/lib/utils";

export interface SearchableSelectOption {
  value: string;
  label: string;
}

interface SearchableSelectProps {
  options: SearchableSelectOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  emptyMessage?: string;
  className?: string;
  triggerClassName?: string;
  /** Render a "create new" action at the bottom of the dropdown */
  createAction?: React.ReactNode;
  disabled?: boolean;
}

export function SearchableSelect({
  options,
  value,
  onChange,
  placeholder = "בחר...",
  searchPlaceholder = "חיפוש...",
  emptyMessage = "לא נמצאו תוצאות",
  className,
  triggerClassName,
  createAction,
  disabled,
}: SearchableSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [highlightIndex, setHighlightIndex] = useState(0);
  const [dropdownStyle, setDropdownStyle] = useState<React.CSSProperties>({});
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  const selectedOption = options.find((o) => o.value === value);

  const filtered = search
    ? options.filter((o) => o.label.toLowerCase().includes(search.toLowerCase()))
    : options;

  // Calculate fixed position when opening
  function computeDropdownStyle() {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const viewportHeight = window.innerHeight;
    const spaceBelow = viewportHeight - rect.bottom;
    const spaceAbove = rect.top;
    const dropdownHeight = Math.min(280, options.length * 36 + 60);

    let top: number;
    if (spaceBelow >= dropdownHeight || spaceBelow >= spaceAbove) {
      top = rect.bottom + 4;
    } else {
      top = rect.top - dropdownHeight - 4;
    }

    setDropdownStyle({
      position: "fixed",
      top,
      left: rect.left,
      width: Math.max(rect.width, 200),
      zIndex: 9999,
    });
  }

  // Reset search & highlight + compute position when opening
  useEffect(() => {
    if (isOpen) {
      setSearch("");
      setHighlightIndex(0);
      computeDropdownStyle();
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  // Click outside to close
  useEffect(() => {
    if (!isOpen) return;
    function handleClick(e: MouseEvent) {
      const target = e.target as Node;
      if (
        containerRef.current && !containerRef.current.contains(target) &&
        !document.getElementById("searchable-select-portal")?.contains(target)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [isOpen]);

  // Keep highlighted item in view
  useEffect(() => {
    if (!isOpen || !listRef.current) return;
    const item = listRef.current.children[highlightIndex] as HTMLElement | undefined;
    item?.scrollIntoView({ block: "nearest" });
  }, [highlightIndex, isOpen]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (!isOpen) {
        if (e.key === "Enter" || e.key === " " || e.key === "ArrowDown") {
          e.preventDefault();
          setIsOpen(true);
        }
        return;
      }
      switch (e.key) {
        case "ArrowDown":
          e.preventDefault();
          setHighlightIndex((i) => Math.min(i + 1, filtered.length - 1));
          break;
        case "ArrowUp":
          e.preventDefault();
          setHighlightIndex((i) => Math.max(i - 1, 0));
          break;
        case "Enter":
          e.preventDefault();
          if (filtered[highlightIndex]) {
            onChange(filtered[highlightIndex].value);
            setIsOpen(false);
          }
          break;
        case "Escape":
          e.preventDefault();
          setIsOpen(false);
          break;
      }
    },
    [isOpen, filtered, highlightIndex, onChange]
  );

  useEffect(() => { setHighlightIndex(0); }, [search]);

  const dropdown = isOpen && mounted ? (
    <div id="searchable-select-portal" style={dropdownStyle}
      className="rounded-lg bg-popover text-popover-foreground shadow-md ring-1 ring-foreground/10 overflow-hidden animate-in fade-in-0 zoom-in-95 slide-in-from-top-2 duration-100">
      {/* Search input */}
      <div className="p-2 border-b border-border/40">
        <div className="relative">
          <Search className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
          <input
            ref={inputRef}
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={searchPlaceholder}
            className="w-full rounded-md border border-input bg-background py-1.5 pr-8 pl-2.5 text-sm outline-none placeholder:text-muted-foreground focus:border-ring focus:ring-1 focus:ring-ring/50"
            dir="rtl"
          />
        </div>
      </div>
      {/* Options list */}
      <div ref={listRef} className="max-h-[200px] overflow-y-auto p-1 scroll-py-1">
        {filtered.length === 0 ? (
          <div className="py-4 text-center text-sm text-muted-foreground">{emptyMessage}</div>
        ) : (
          filtered.map((option, i) => (
            <button
              key={option.value}
              type="button"
              onMouseDown={(e) => { e.preventDefault(); onChange(option.value); setIsOpen(false); }}
              onMouseEnter={() => setHighlightIndex(i)}
              className={cn(
                "relative flex w-full items-center gap-1.5 rounded-md py-1.5 pr-2 pl-7 text-sm outline-none select-none transition-colors text-right",
                i === highlightIndex && "bg-accent text-accent-foreground",
                option.value === value && "font-medium"
              )}
            >
              {option.value === value && <Check className="absolute left-1.5 h-3.5 w-3.5" />}
              {option.label}
            </button>
          ))
        )}
      </div>
      {createAction && (
        <>
          <div className="mx-1 border-t border-border/40" />
          <div className="p-1">{createAction}</div>
        </>
      )}
    </div>
  ) : null;

  return (
    <div ref={containerRef} className={cn("relative", className)} onKeyDown={handleKeyDown}>
      {/* Trigger button */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen((o) => !o)}
        className={cn(
          "flex w-full items-center justify-between gap-1.5 rounded-lg border border-input bg-transparent py-2 pr-2 pl-2.5 text-sm whitespace-nowrap transition-colors outline-none select-none h-8",
          "focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50",
          "disabled:cursor-not-allowed disabled:opacity-50",
          "dark:bg-input/30 dark:hover:bg-input/50",
          triggerClassName
        )}
      >
        <span className="flex flex-1 text-right truncate">
          {selectedOption?.label ?? placeholder}
        </span>
        <ChevronDownIcon className="pointer-events-none size-4 text-muted-foreground shrink-0" />
      </button>

      {/* Portal dropdown — renders at document.body to escape any overflow:hidden parent */}
      {mounted && dropdown && createPortal(dropdown, document.body)}
    </div>
  );
}
