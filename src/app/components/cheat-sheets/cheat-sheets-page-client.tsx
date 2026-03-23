"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Plus, Pencil, Trash2, FileText, ChevronLeft } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheatSheetDialog } from "./cheat-sheet-dialog";
import { DeleteCheatSheetDialog } from "./delete-cheat-sheet-dialog";
import { useT } from "@/lib/i18n";

type CheatSheetData = {
  id: string;
  title: string;
  content: string;
  category: string;
  sortOrder: number;
};

const stagger = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.05, delayChildren: 0.02 },
  },
};

const fadeUp = {
  hidden: { opacity: 0, y: 12 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] as const },
  },
};

const categoryBadgeColors: string[] = [
  "bg-cyan-50 text-cyan-700",
  "bg-purple-50 text-purple-700",
  "bg-amber-50 text-amber-700",
  "bg-rose-50 text-rose-700",
  "bg-emerald-50 text-emerald-700",
  "bg-blue-50 text-blue-700",
];

function getCategoryColor(category: string, allCategories: string[]): string {
  const idx = allCategories.indexOf(category);
  return categoryBadgeColors[idx % categoryBadgeColors.length];
}

export function CheatSheetsPageClient({ cheatSheets }: { cheatSheets: CheatSheetData[] }) {
  const he = useT();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingSheet, setEditingSheet] = useState<CheatSheetData | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; title: string } | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(
    cheatSheets.length > 0 ? cheatSheets[0].id : null
  );

  const selectedSheet = cheatSheets.find((s) => s.id === selectedId) ?? null;

  // Group by category
  const grouped = cheatSheets.reduce<Record<string, CheatSheetData[]>>((acc, sheet) => {
    if (!acc[sheet.category]) acc[sheet.category] = [];
    acc[sheet.category].push(sheet);
    return acc;
  }, {});

  const allCategories = Object.keys(grouped);

  function handleEdit(sheet: CheatSheetData) {
    setEditingSheet(sheet);
    setDialogOpen(true);
  }

  function handleCreate() {
    setEditingSheet(null);
    setDialogOpen(true);
  }

  return (
    <motion.div
      variants={stagger}
      initial="hidden"
      animate="show"
      className="space-y-6"
    >
      {/* Header */}
      <motion.div variants={fadeUp} className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">
          {he.cheatSheets.title}
        </h1>
        <Button
          size="sm"
          onClick={handleCreate}
          className="bg-foreground text-background hover:bg-foreground/90 shadow-sm transition-all duration-200 border-0"
        >
          <Plus className="h-4 w-4 me-2" />
          {he.cheatSheets.newSheet}
        </Button>
      </motion.div>

      {/* Sidebar + Content Layout (sidebar on right for RTL) */}
      <motion.div variants={fadeUp} className="flex gap-6 min-h-[60vh]">
        {/* Main Content Area */}
        <div className="flex-1 min-w-0">
          {selectedSheet ? (
            <Card className="glass-card h-full">
              <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-4">
                <div>
                  <CardTitle className="text-xl">{selectedSheet.title}</CardTitle>
                  <Badge className={`${getCategoryColor(selectedSheet.category, allCategories)} border-0 mt-2`}>
                    {selectedSheet.category}
                  </Badge>
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 hover:bg-muted hover:text-foreground transition-colors duration-200"
                    onClick={() => handleEdit(selectedSheet)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 hover:bg-red-50 text-destructive transition-colors duration-200"
                    onClick={() => setDeleteTarget({ id: selectedSheet.id, title: selectedSheet.title })}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="whitespace-pre-wrap font-mono text-sm text-muted-foreground leading-relaxed bg-muted/50 rounded-lg p-4 border border-border min-h-[300px]">
                  {selectedSheet.content || "אין תוכן עדיין..."}
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="glass-card h-full flex items-center justify-center">
              <CardContent className="text-center text-muted-foreground py-20">
                <FileText className="h-12 w-12 mx-auto mb-4 opacity-30" />
                <p>בחר מדריך מהרשימה או צור חדש</p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar (right side for RTL) */}
        <div className="w-64 flex-shrink-0">
          <Card className="glass-card h-full">
            <CardContent className="p-3">
              {allCategories.length === 0 ? (
                <div className="text-center text-muted-foreground py-8 text-sm">
                  {he.common.noResults}
                </div>
              ) : (
                <div className="space-y-4">
                  {allCategories.map((category) => (
                    <div key={category}>
                      <div className="flex items-center gap-2 mb-2 px-2">
                        <Badge className={`${getCategoryColor(category, allCategories)} border-0 text-xs`}>
                          {category}
                        </Badge>
                      </div>
                      <div className="space-y-0.5">
                        {grouped[category].map((sheet) => (
                          <button
                            key={sheet.id}
                            onClick={() => setSelectedId(sheet.id)}
                            className={`w-full text-right px-3 py-2 rounded-lg text-sm transition-all duration-200 flex items-center gap-2 ${
                              selectedId === sheet.id
                                ? "bg-cyan-50 text-cyan-700"
                                : "text-muted-foreground hover:bg-muted hover:text-foreground"
                            }`}
                          >
                            <ChevronLeft className={`h-3 w-3 flex-shrink-0 transition-opacity duration-200 ${
                              selectedId === sheet.id ? "opacity-100" : "opacity-0"
                            }`} />
                            <span className="truncate">{sheet.title}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </motion.div>

      {/* Dialogs */}
      <CheatSheetDialog
        cheatSheet={editingSheet}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
      />

      {deleteTarget && (
        <DeleteCheatSheetDialog
          cheatSheetId={deleteTarget.id}
          cheatSheetTitle={deleteTarget.title}
          open={!!deleteTarget}
          onOpenChange={(open) => {
            if (!open) {
              setDeleteTarget(null);
              // If we deleted the currently selected sheet, clear selection
              if (deleteTarget.id === selectedId) {
                const remaining = cheatSheets.filter((s) => s.id !== deleteTarget.id);
                setSelectedId(remaining.length > 0 ? remaining[0].id : null);
              }
            }
          }}
        />
      )}
    </motion.div>
  );
}
