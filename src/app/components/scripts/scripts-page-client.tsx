"use client";
import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { UpgradeDialog } from "@/app/components/shared/upgrade-dialog";
import {
  FileText,
  Plus,
  Trash2,
  Clock,
  Youtube,
  Instagram,
  Podcast,
  Tv,
  Megaphone,
  Search,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { createScript, deleteScript } from "@/lib/actions/script-actions";
import { formatDate } from "@/lib/utils/format";
import { useT } from "@/lib/i18n";

const platformIcons: Record<string, React.ReactNode> = {
  youtube: <Youtube className="h-4 w-4 text-red-500" />,
  tiktok: <Tv className="h-4 w-4 text-foreground" />,
  instagram: <Instagram className="h-4 w-4 text-pink-500" />,
  podcast: <Podcast className="h-4 w-4 text-purple-500" />,
  commercial: <Megaphone className="h-4 w-4 text-blue-500" />,
};

const platformLabels: Record<string, string> = {
  youtube: "YouTube",
  tiktok: "TikTok",
  instagram: "Instagram",
  podcast: "Podcast",
  commercial: "Commercial",
};

type Script = {
  id: string;
  title: string;
  platform: string;
  content: string;
  updatedAt: Date;
  project: { id: string; title: string } | null;
  client: { id: string; name: string } | null;
};

export function ScriptsPageClient({
  scripts,
  planLimit,
}: {
  scripts: Script[];
  clients: { id: string; name: string }[];
  projects: { id: string; title: string }[];
  planLimit: number;
}) {
  const router = useRouter();
  const he = useT();
  const [creating, setCreating] = useState(false);
  const [upgradeOpen, setUpgradeOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const titleInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (dialogOpen) {
      setTimeout(() => titleInputRef.current?.focus(), 0);
    }
  }, [dialogOpen]);

  function openCreateDialog() {
    if (planLimit !== -1 && scripts.length >= planLimit) {
      setUpgradeOpen(true);
      return;
    }
    setNewTitle("");
    setDialogOpen(true);
  }

  async function handleCreate() {
    const trimmed = newTitle.trim();
    if (!trimmed) return;
    setCreating(true);
    setDialogOpen(false);
    const result = await createScript({ title: trimmed });
    if (!("id" in result)) {
      setUpgradeOpen(true);
      setCreating(false);
      return;
    }
    router.push(`/scripts/${result.id}`);
  }

  async function handleDelete(id: string, e: React.MouseEvent) {
    e.stopPropagation();
    if (confirm(he.scripts.deleteConfirm)) {
      await deleteScript(id);
    }
  }

  return (
    <>
    <UpgradeDialog
      open={upgradeOpen}
      onClose={() => setUpgradeOpen(false)}
      feature={he.scripts.title}
      limit={planLimit}
    />

    {/* Create script dialog */}
    {dialogOpen && (
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setDialogOpen(false)} />
        <div
          className="relative z-10 w-full max-w-sm rounded-[14px] border border-border/40 bg-card p-6 shadow-xl"
          onKeyDown={(e) => {
            if (e.key === "Escape") setDialogOpen(false);
            if (e.key === "Enter" && newTitle.trim()) handleCreate();
          }}
        >
          <h2 className="text-[15px] font-bold text-foreground mb-4">שם התסריט</h2>
          <input
            ref={titleInputRef}
            type="text"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            placeholder="הזן שם לתסריט..."
            className="w-full rounded-[10px] border border-border/40 bg-background px-4 py-2.5 text-[13px] text-foreground placeholder:text-foreground/30 outline-none focus:border-accent/40 focus:ring-1 focus:ring-accent/20 transition-all duration-200"
          />
          {newTitle.length > 0 && !newTitle.trim() && (
            <p className="mt-1.5 text-[11px] text-red-500">יש להזין שם תקין</p>
          )}
          <div className="mt-4 flex gap-2 justify-end">
            <button
              onClick={() => setDialogOpen(false)}
              className="rounded-[10px] px-4 py-2 text-[13px] font-medium text-foreground/60 hover:bg-muted transition-colors"
            >
              ביטול
            </button>
            <button
              onClick={handleCreate}
              disabled={!newTitle.trim()}
              className="rounded-[10px] bg-foreground px-4 py-2 text-[13px] font-semibold text-background hover:bg-foreground/90 transition-colors disabled:opacity-40 disabled:pointer-events-none"
            >
              יצירה
            </button>
          </div>
        </div>
      </div>
    )}

    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-[22px] font-extrabold tracking-[-0.03em] text-foreground">{he.scripts.title}</h1>
        <Button onClick={openCreateDialog} disabled={creating} className="bg-foreground text-background hover:bg-foreground/90 shadow-sm transition-all duration-200 border-0 gap-2">
          <Plus className="h-4 w-4" />
          {he.scripts.newScript}
        </Button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-foreground/30" />
        <input
          placeholder="חיפוש תסריטים..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full max-w-xs rounded-[10px] border border-border/40 bg-card pr-4 pl-10 py-2.5 text-[13px] text-foreground placeholder:text-foreground/30 outline-none focus:border-accent/40 focus:ring-1 focus:ring-accent/20 transition-all duration-200"
        />
      </div>

      {scripts.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="mb-4 rounded-[14px] bg-foreground/[0.03] p-5 ring-1 ring-border/20">
            <FileText className="h-8 w-8 text-foreground/30" />
          </div>
          <h2 className="text-[12.5px] font-semibold text-foreground/40">
            {he.scripts.noScripts}
          </h2>
          <p className="mt-1 text-[11px] text-foreground/30">
            {he.scriptEditor.createFirstScriptDesc}
          </p>
          <Button
            onClick={openCreateDialog}
            disabled={creating}
            className="mt-6 gap-2"
          >
            <Plus className="h-4 w-4" />
            {he.scriptEditor.createFirstScript}
          </Button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {scripts.filter((script) => script.title.toLowerCase().includes(search.toLowerCase())).map((script) => (
            <div
              key={script.id}
              onClick={() => router.push(`/scripts/${script.id}`)}
              className="glass-card cursor-pointer rounded-[14px] border border-border/40 bg-card p-5 transition-all duration-300 hover:border-border/60 hover:shadow-[0_4px_16px_-4px_rgba(0,0,0,0.08)]"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  {platformIcons[script.platform] ?? (
                    <FileText className="h-4 w-4 text-muted-foreground" />
                  )}
                  <span className="truncate font-semibold text-foreground">
                    {script.title}
                  </span>
                </div>
                <button
                  onClick={(e) => handleDelete(script.id, e)}
                  className="shrink-0 rounded p-1 text-muted-foreground hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-950 dark:hover:text-red-400"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>

              <div className="mt-3 flex flex-wrap gap-2">
                <span className="rounded-full bg-muted px-2.5 py-0.5 text-xs text-muted-foreground">
                  {platformLabels[script.platform] ?? script.platform}
                </span>
                {script.client && (
                  <span className="rounded-full bg-blue-50 px-2.5 py-0.5 text-xs text-blue-600 dark:bg-blue-950 dark:text-blue-300">
                    {script.client.name}
                  </span>
                )}
                {script.project && (
                  <span className="rounded-full bg-purple-50 px-2.5 py-0.5 text-xs text-purple-600 dark:bg-purple-950 dark:text-purple-300">
                    {script.project.title}
                  </span>
                )}
              </div>

              {script.content && (
                <p className="mt-3 line-clamp-2 text-xs text-muted-foreground leading-relaxed">
                  {script.content.replace(/<[^>]+>/g, "").slice(0, 120)}
                </p>
              )}

              <div className="mt-4 flex items-center gap-1 text-xs text-muted-foreground">
                <Clock className="h-3 w-3" />
                <span>{formatDate(script.updatedAt)}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
    </>
  );
}
