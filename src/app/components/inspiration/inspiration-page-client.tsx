"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Plus, Pencil, Trash2, Search, ExternalLink, Play, Settings2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { InspirationDialog } from "./inspiration-dialog";
import { DeleteInspirationDialog } from "./delete-inspiration-dialog";
import { CategoryManagerDialog } from "./category-manager-dialog";
import { UpgradeDialog } from "@/app/components/shared/upgrade-dialog";
import { useT } from "@/lib/i18n";

type InspirationData = {
  id: string;
  title: string;
  url: string | null;
  imageUrl: string | null;
  category: string;
  categoryId: string | null;
  notes: string | null;
};

export type CategoryData = {
  id: string;
  name: string;
  label: string;
  color: string;
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

const colorMap: Record<string, string> = {
  amber: "bg-amber-50 text-amber-700",
  cyan: "bg-cyan-50 text-cyan-700",
  rose: "bg-rose-50 text-rose-700",
  purple: "bg-purple-50 text-purple-700",
  emerald: "bg-emerald-50 text-emerald-700",
  blue: "bg-blue-50 text-blue-700",
  orange: "bg-orange-50 text-orange-700",
  pink: "bg-pink-50 text-pink-700",
  lime: "bg-lime-50 text-lime-700",
  indigo: "bg-indigo-50 text-indigo-700",
  red: "bg-red-50 text-red-700",
  yellow: "bg-yellow-50 text-yellow-700",
};

function getCategoryStyle(color: string): string {
  return colorMap[color] ?? "bg-muted text-muted-foreground";
}

function isYouTubeUrl(url: string): boolean {
  return url.includes("youtube.com") || url.includes("youtu.be");
}

export function InspirationPageClient({
  inspirations,
  categories,
  planLimit,
}: {
  inspirations: InspirationData[];
  categories: CategoryData[];
  planLimit: number;
}) {
  const he = useT();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingInspiration, setEditingInspiration] = useState<InspirationData | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; title: string } | null>(null);
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [categoryManagerOpen, setCategoryManagerOpen] = useState(false);
  const [upgradeOpen, setUpgradeOpen] = useState(false);

  // Build a lookup map for categories
  const categoryMap = new Map(categories.map((c) => [c.name, c]));

  function handleEdit(item: InspirationData) {
    setEditingInspiration(item);
    setDialogOpen(true);
  }

  function handleCreate() {
    if (planLimit !== -1 && inspirations.length >= planLimit) {
      setUpgradeOpen(true);
      return;
    }
    setEditingInspiration(null);
    setDialogOpen(true);
  }

  const filtered = inspirations.filter((item) => {
    const matchesSearch = item.title.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = !activeCategory || item.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

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
          {he.inspiration.title}
        </h1>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => setCategoryManagerOpen(true)}
            className="border-border text-muted-foreground hover:text-foreground hover:bg-muted"
          >
            <Settings2 className="h-4 w-4 me-2" />
            {he.inspirationExtra.categoriesBtn}
          </Button>
          <Button
            size="sm"
            onClick={handleCreate}
            className="bg-foreground text-background hover:bg-foreground/90 shadow-sm transition-all duration-200 border-0"
          >
            <Plus className="h-4 w-4 me-2" />
            {he.inspiration.newItem}
          </Button>
        </div>
      </motion.div>

      {/* Search + Category Filters */}
      <motion.div variants={fadeUp} className="space-y-3">
        <div className="relative w-full max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={he.common.searchPlaceholder}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 bg-background border-border"
          />
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Button
            variant={activeCategory === null ? "default" : "outline"}
            size="sm"
            onClick={() => setActiveCategory(null)}
            className={
              activeCategory === null
                ? "bg-foreground text-background border-foreground hover:bg-foreground/90"
                : "border-border text-muted-foreground hover:text-foreground hover:bg-muted"
            }
          >
            {he.common.all}
          </Button>
          {categories.map((cat) => (
            <Button
              key={cat.name}
              variant={activeCategory === cat.name ? "default" : "outline"}
              size="sm"
              onClick={() => setActiveCategory(activeCategory === cat.name ? null : cat.name)}
              className={
                activeCategory === cat.name
                  ? "bg-foreground text-background border-foreground hover:bg-foreground/90"
                  : "border-border text-muted-foreground hover:text-foreground hover:bg-muted"
              }
            >
              {cat.label}
            </Button>
          ))}
        </div>
      </motion.div>

      {/* Inspiration Cards — masonry-like grid */}
      <motion.div
        variants={fadeUp}
        className="columns-1 md:columns-2 lg:columns-3 gap-4 space-y-4"
      >
        {filtered.map((item) => {
          const cat = categoryMap.get(item.category);
          return (
            <motion.div key={item.id} variants={fadeUp} className="break-inside-avoid">
              <Card className="glass-card group transition-all duration-300 hover:scale-[1.02] hover:shadow-sm">
                <CardContent className="p-5">
                  {/* Image */}
                  {item.imageUrl && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={item.imageUrl} alt={item.title} className="w-full rounded-lg object-cover max-h-48 mb-3" />
                  )}

                  {/* YouTube play overlay hint */}
                  {item.url && !item.imageUrl && isYouTubeUrl(item.url) && (
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center w-full h-24 rounded-lg bg-red-50 mb-4 transition-all duration-200 hover:bg-red-100"
                    >
                      <Play className="h-10 w-10 text-red-500" />
                    </a>
                  )}

                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-lg truncate">{item.title}</h3>
                      <Badge className={`${cat ? getCategoryStyle(cat.color) : "bg-muted text-muted-foreground"} border-0 mt-1`}>
                        {cat?.label ?? item.category}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-1 opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-opacity duration-200 flex-shrink-0 ms-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 hover:bg-muted hover:text-foreground transition-colors duration-200"
                        onClick={() => handleEdit(item)}
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 hover:bg-red-50 text-destructive transition-colors duration-200"
                        onClick={() => setDeleteTarget({ id: item.id, title: item.title })}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>

                  {/* URL link (non-YouTube) */}
                  {item.url && !isYouTubeUrl(item.url) && (
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-foreground hover:text-foreground/70 transition-colors duration-200 text-sm mb-2"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                      <span className="truncate max-w-[200px]">{he.inspirationExtra.openLink}</span>
                    </a>
                  )}

                  {item.notes && (
                    <p className="text-sm text-muted-foreground/80 mt-2 whitespace-pre-line line-clamp-4">
                      {item.notes}
                    </p>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </motion.div>

      {filtered.length === 0 && (
        <motion.div variants={fadeUp} className="text-center text-muted-foreground py-12">
          {he.common.noResults}
        </motion.div>
      )}

      {/* Dialogs */}
      <UpgradeDialog
        open={upgradeOpen}
        onClose={() => setUpgradeOpen(false)}
        feature={he.inspirationExtra.inspirationRefs}
        limit={planLimit}
      />
      <InspirationDialog
        inspiration={editingInspiration}
        categories={categories}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
      />

      {deleteTarget && (
        <DeleteInspirationDialog
          inspirationId={deleteTarget.id}
          inspirationTitle={deleteTarget.title}
          open={!!deleteTarget}
          onOpenChange={(open) => {
            if (!open) setDeleteTarget(null);
          }}
        />
      )}

      <CategoryManagerDialog
        categories={categories}
        open={categoryManagerOpen}
        onOpenChange={setCategoryManagerOpen}
      />
    </motion.div>
  );
}
