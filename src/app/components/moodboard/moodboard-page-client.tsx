"use client";

import { useState } from "react";
import Link from "next/link";
import { LayoutTemplate, Pencil, Search } from "lucide-react";
import { DeleteMoodboardButton } from "./delete-moodboard-button";
import { NewMoodboardButton } from "./new-moodboard-button";
import { MoodboardProjectLink } from "./moodboard-project-link";

type Board = {
  id: string;
  title: string;
  updatedAt: string;
  project: { id: string; title: string } | null;
};

type Project = { id: string; title: string };

export function MoodboardPageClient({
  boards,
  projects,
  canCreate,
  planLimit,
  handleCreate,
  t,
  dateMap,
}: {
  boards: Board[];
  projects: Project[];
  canCreate: boolean;
  planLimit: number;
  handleCreate: () => void;
  t: { subtitle: string; noMoodboards: string; noMoodboardsDesc: string; createFirst: string; updated: string };
  dateMap: Record<string, string>;
}) {
  const [search, setSearch] = useState("");

  const filteredBoards = boards.filter((board) => {
    if (!search) return true;
    return board.title.toLowerCase().includes(search.toLowerCase());
  });

  return (
    <div className="space-y-6" dir="rtl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Moodboard</h1>
          <p className="text-sm text-muted-foreground mt-1">{t.subtitle}</p>
        </div>
        <NewMoodboardButton action={handleCreate} canCreate={canCreate} planLimit={planLimit} />
      </div>

      {/* Search bar */}
      <div className="relative">
        <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-foreground/30" />
        <input
          placeholder="חיפוש מוד בורד..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-[10px] border border-border/40 bg-card px-4 py-2.5 pe-10 text-[13px] text-foreground placeholder:text-foreground/30 outline-none focus:border-accent/40 focus:ring-1 focus:ring-accent/20 transition-all duration-200"
        />
      </div>

      {boards.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-muted">
            <LayoutTemplate className="h-8 w-8 text-muted-foreground" />
          </div>
          <div>
            <p className="text-base font-semibold text-foreground">{t.noMoodboards}</p>
            <p className="text-sm text-muted-foreground mt-1">{t.noMoodboardsDesc}</p>
          </div>
          <NewMoodboardButton action={handleCreate} canCreate={canCreate} planLimit={planLimit} label={t.createFirst} />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredBoards.map((board) => (
            <div
              key={board.id}
              className="group relative rounded-2xl border border-border bg-card shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden"
            >
              {/* Preview area */}
              <Link href={`/moodboard/${board.id}`} className="block">
                <div className="h-40 bg-gradient-to-br from-muted/50 to-muted flex items-center justify-center">
                  <LayoutTemplate className="h-10 w-10 text-muted-foreground/30" />
                </div>
                <div className="p-4">
                  <p className="font-semibold text-foreground truncate">{board.title}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {t.updated} {dateMap[board.updatedAt] ?? board.updatedAt}
                  </p>
                </div>
              </Link>
              {/* Project link */}
              <div className="px-4 pb-3">
                <MoodboardProjectLink
                  boardId={board.id}
                  currentProjectId={board.project?.id ?? null}
                  currentProjectTitle={board.project?.title ?? null}
                  projects={projects}
                />
              </div>
              {/* Actions */}
              <div className="absolute top-3 left-3 flex gap-1.5 opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-opacity delay-75">
                <Link
                  href={`/moodboard/${board.id}`}
                  className="flex h-8 w-8 items-center justify-center rounded-lg bg-card shadow border border-border hover:bg-muted transition-colors"
                >
                  <Pencil className="h-3.5 w-3.5 text-muted-foreground" />
                </Link>
                <DeleteMoodboardButton id={board.id} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
