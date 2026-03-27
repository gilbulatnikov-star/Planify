"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { FolderOpen, X, Check, ChevronDown, Link2 } from "lucide-react";

interface ProjectLinkerProps {
  currentProjectId: string | null;
  currentProjectTitle: string | null;
  projects: { id: string; title: string }[];
  onLink: (projectId: string | null) => Promise<void>;
}

export function ProjectLinker({
  currentProjectId,
  currentProjectTitle,
  projects,
  onLink,
}: ProjectLinkerProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleSelect(projectId: string | null) {
    startTransition(async () => {
      await onLink(projectId);
      setOpen(false);
      router.refresh();
    });
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={(e) => { e.preventDefault(); e.stopPropagation(); setOpen(true); }}
        className={`flex items-center gap-2 rounded-lg border px-3 py-1.5 text-xs transition-colors ${
          currentProjectTitle
            ? "border-[#2563eb]/30 bg-[#2563eb]/5 text-[#2563eb] hover:bg-[#2563eb]/10"
            : "border-border bg-card text-muted-foreground hover:bg-muted hover:text-foreground"
        }`}
      >
        <Link2 className="h-3.5 w-3.5" />
        {currentProjectTitle ? (
          <span className="font-medium">{currentProjectTitle}</span>
        ) : (
          <span>הוסף לפרויקט</span>
        )}
        <ChevronDown className="h-3 w-3 opacity-50" />
      </button>
    );
  }

  return (
    <div
      className="rounded-xl border border-border bg-card shadow-lg p-2 space-y-1 min-w-[200px] z-50"
      onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
    >
      <div className="flex items-center justify-between px-2 pb-1.5 border-b border-border">
        <span className="text-xs font-medium text-foreground">הוסף לפרויקט</span>
        <button type="button" onClick={() => setOpen(false)} className="text-muted-foreground hover:text-foreground">
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
      {currentProjectId && (
        <button
          type="button"
          onClick={() => handleSelect(null)}
          disabled={isPending}
          className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-xs text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
        >
          <X className="h-3.5 w-3.5" />
          הסר שיוך
        </button>
      )}
      {projects.length === 0 ? (
        <p className="text-xs text-muted-foreground px-2.5 py-2">אין פרויקטים — צור פרויקט קודם</p>
      ) : (
        projects.map((p) => (
          <button
            key={p.id}
            type="button"
            onClick={() => handleSelect(p.id)}
            disabled={isPending}
            className={`flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-xs transition-colors ${
              p.id === currentProjectId
                ? "bg-[#2563eb]/10 font-medium text-[#2563eb]"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            }`}
          >
            {p.id === currentProjectId ? <Check className="h-3.5 w-3.5" /> : <FolderOpen className="h-3.5 w-3.5 opacity-40" />}
            {p.title}
          </button>
        ))
      )}
    </div>
  );
}
