"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { FolderOpen, X, Check } from "lucide-react";

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
        className="flex items-center gap-1.5 rounded-full bg-muted px-2.5 py-1 text-[11px] text-muted-foreground hover:text-foreground transition-colors"
      >
        <FolderOpen className="h-3 w-3" />
        {currentProjectTitle ?? "שייך לפרויקט"}
      </button>
    );
  }

  return (
    <div
      className="rounded-lg border border-border bg-card shadow-lg p-2 space-y-1 min-w-[180px] z-50"
      onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
    >
      <div className="flex items-center justify-between px-1 pb-1 border-b border-border">
        <span className="text-[11px] font-medium text-muted-foreground">שייך לפרויקט</span>
        <button type="button" onClick={() => setOpen(false)} className="text-muted-foreground hover:text-foreground">
          <X className="h-3 w-3" />
        </button>
      </div>
      {currentProjectId && (
        <button
          type="button"
          onClick={() => handleSelect(null)}
          disabled={isPending}
          className="flex w-full items-center gap-2 rounded px-2 py-1.5 text-xs text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
        >
          <X className="h-3 w-3" />
          הסר שיוך
        </button>
      )}
      {projects.length === 0 ? (
        <p className="text-[11px] text-muted-foreground px-2 py-1">אין פרויקטים</p>
      ) : (
        projects.map((p) => (
          <button
            key={p.id}
            type="button"
            onClick={() => handleSelect(p.id)}
            disabled={isPending}
            className={`flex w-full items-center gap-2 rounded px-2 py-1.5 text-xs transition-colors ${
              p.id === currentProjectId
                ? "bg-muted font-medium text-foreground"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            }`}
          >
            {p.id === currentProjectId && <Check className="h-3 w-3" />}
            {p.title}
          </button>
        ))
      )}
    </div>
  );
}
