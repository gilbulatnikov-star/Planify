"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Plus, CalendarDays, Trash2, Users, FolderOpen, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { SearchableSelect } from "@/components/ui/searchable-select";
import { useT } from "@/lib/i18n";
import { createContentBoard, updateContentBoard, deleteContentBoard } from "@/lib/actions/content-board-actions";

type Board = {
  id: string;
  title: string;
  client: { id: string; name: string } | null;
  project: { id: string; title: string } | null;
  _count: { items: number };
  updatedAt: Date;
};

const fadeUp = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.25 } },
};

export function ContentBoardsPageClient({
  boards,
  clients,
  projects,
}: {
  boards: Board[];
  clients: { id: string; name: string }[];
  projects: { id: string; title: string; clientId: string | null }[];
}) {
  const he = useT();
  const router = useRouter();
  const [showNew, setShowNew] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newTitle, setNewTitle] = useState("");
  const [newClientId, setNewClientId] = useState("");
  const [newProjectId, setNewProjectId] = useState("");
  const [, startTransition] = useTransition();
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  function startEdit(board: Board, e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    setEditingId(board.id);
    setNewTitle(board.title);
    setNewClientId(board.client?.id ?? "");
    setNewProjectId(board.project?.id ?? "");
    setShowNew(true);
  }

  function resetForm() {
    setNewTitle("");
    setNewClientId("");
    setNewProjectId("");
    setShowNew(false);
    setEditingId(null);
  }

  async function handleSave() {
    if (!newTitle.trim()) return;
    const fd = new FormData();
    fd.set("title", newTitle.trim());
    fd.set("clientId", newClientId);
    fd.set("projectId", newProjectId);
    const result = editingId
      ? await updateContentBoard(editingId, fd)
      : await createContentBoard(fd);
    if (result.success) {
      resetForm();
      router.refresh();
    }
  }

  // Filter projects by selected client
  const filteredProjects = newClientId
    ? projects.filter(p => p.clientId === newClientId)
    : projects;

  return (
    <motion.div initial="hidden" animate="show" variants={{ show: { transition: { staggerChildren: 0.05 } } }} className="space-y-6">
      {/* Header */}
      <motion.div variants={fadeUp} className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-foreground">{he.nav.calendar}</h1>
        <Button size="sm" onClick={() => setShowNew(true)} className="bg-foreground text-background hover:bg-foreground/90">
          <Plus className="h-4 w-4 me-1.5" />
          {he.calendar.newBoard ?? "לוח חדש"}
        </Button>
      </motion.div>

      {/* New board form */}
      {showNew && (
        <motion.div variants={fadeUp} className="rounded-2xl border border-border bg-card p-5 space-y-3">
          <Input
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            placeholder={he.calendar.boardTitlePlaceholder ?? "שם הלוח..."}
            className="text-sm"
            autoFocus
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <SearchableSelect
              options={[
                { value: "", label: he.calendar.noClient ?? "ללא לקוח" },
                ...clients.map(c => ({ value: c.id, label: c.name })),
              ]}
              value={newClientId}
              onChange={(v) => { setNewClientId(v); setNewProjectId(""); }}
              placeholder={he.calendar.noClient ?? "ללא לקוח"}
              triggerClassName="w-full"
            />
            <SearchableSelect
              options={[
                { value: "", label: he.calendar.noProject ?? "ללא פרויקט" },
                ...filteredProjects.map(p => ({ value: p.id, label: p.title })),
              ]}
              value={newProjectId}
              onChange={(v) => setNewProjectId(v)}
              placeholder={he.calendar.noProject ?? "ללא פרויקט"}
              triggerClassName="w-full"
            />
          </div>
          <div className="flex gap-2">
            <Button size="sm" onClick={handleSave} disabled={!newTitle.trim()}>
              {editingId ? he.common.save : he.common.create}
            </Button>
            <Button size="sm" variant="ghost" onClick={resetForm}>
              {he.common.cancel}
            </Button>
          </div>
        </motion.div>
      )}

      {/* Boards grid */}
      {boards.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {boards.map(board => (
            <motion.div key={board.id} variants={fadeUp}>
              <Link href={`/calendar/${board.id}`}>
                <div className="group relative rounded-2xl border border-border bg-card p-5 hover:shadow-md hover:scale-[1.01] transition-all duration-200 cursor-pointer">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <CalendarDays className="h-4 w-4 text-muted-foreground" />
                      <h3 className="text-sm font-semibold text-foreground">{board.title}</h3>
                    </div>
                    <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={(e) => startEdit(board, e)}
                        title="ערוך לוח"
                        className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-all"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          if (deleteConfirm === board.id) {
                            startTransition(async () => {
                              await deleteContentBoard(board.id);
                              router.refresh();
                            });
                            setDeleteConfirm(null);
                          } else {
                            setDeleteConfirm(board.id);
                            setTimeout(() => setDeleteConfirm(null), 3000);
                          }
                        }}
                        title="מחק לוח"
                        className="p-1.5 rounded-lg text-muted-foreground hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950 transition-all"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {board.client && (
                      <Badge variant="outline" className="text-[10px] gap-1">
                        <Users className="h-2.5 w-2.5" />
                        {board.client.name}
                      </Badge>
                    )}
                    {board.project && (
                      <Badge variant="outline" className="text-[10px] gap-1">
                        <FolderOpen className="h-2.5 w-2.5" />
                        {board.project.title}
                      </Badge>
                    )}
                    <Badge className="text-[10px] bg-muted border-0 text-muted-foreground">
                      {board._count.items} {he.calendar.items ?? "פריטים"}
                    </Badge>
                  </div>
                  {deleteConfirm === board.id && (
                    <p className="text-[10px] text-red-500 mt-2">{he.common.clickAgainToDelete ?? "לחץ שוב למחיקה"}</p>
                  )}
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      ) : (
        !showNew && (
          <motion.div variants={fadeUp} className="flex flex-col items-center justify-center py-16 text-center">
            <CalendarDays className="h-12 w-12 text-muted-foreground/30 mb-4" />
            <p className="text-sm text-muted-foreground mb-4">{he.calendar.noBoards ?? "אין לוחות תוכן"}</p>
            <Button size="sm" variant="outline" onClick={() => setShowNew(true)}>
              <Plus className="h-4 w-4 me-1.5" />
              {he.calendar.createFirst ?? "צור לוח ראשון"}
            </Button>
          </motion.div>
        )
      )}
    </motion.div>
  );
}
