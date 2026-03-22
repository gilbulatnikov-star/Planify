"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Plus, Pencil, Trash2, Search, ExternalLink } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { AssetDialog } from "./asset-dialog";
import { DeleteAssetDialog } from "./delete-asset-dialog";
import { he } from "@/lib/he";

type AssetData = {
  id: string;
  name: string;
  type: string;
  source: string | null;
  originalUrl: string | null;
  notes: string | null;
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

const typeColors: Record<string, string> = {
  music: "bg-purple-50 text-purple-700",
  sfx: "bg-amber-50 text-amber-700",
  font: "bg-cyan-50 text-cyan-700",
  stock_footage: "bg-rose-50 text-rose-700",
};

const allTypes = ["music", "sfx", "font", "stock_footage"] as const;

export function AssetsPageClient({ assets }: { assets: AssetData[] }) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingAsset, setEditingAsset] = useState<AssetData | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null);
  const [search, setSearch] = useState("");
  const [activeType, setActiveType] = useState<string | null>(null);

  function handleEdit(asset: AssetData) {
    setEditingAsset(asset);
    setDialogOpen(true);
  }

  function handleCreate() {
    setEditingAsset(null);
    setDialogOpen(true);
  }

  const filtered = assets.filter((a) => {
    const matchesSearch = a.name.toLowerCase().includes(search.toLowerCase());
    const matchesType = !activeType || a.type === activeType;
    return matchesSearch && matchesType;
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
          {he.assets.title}
        </h1>
        <Button
          size="sm"
          onClick={handleCreate}
          className="bg-foreground text-white hover:bg-foreground/90 shadow-sm transition-all duration-200 border-0"
        >
          <Plus className="h-4 w-4 me-2" />
          {he.assets.newAsset}
        </Button>
      </motion.div>

      {/* Search + Type Filters */}
      <motion.div variants={fadeUp} className="space-y-3">
        <div className="relative">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="חיפוש..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pr-10 bg-card border-border"
          />
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Button
            variant={activeType === null ? "default" : "outline"}
            size="sm"
            onClick={() => setActiveType(null)}
            className={
              activeType === null
                ? "bg-foreground text-white border-gray-900 hover:bg-foreground/90"
                : "border-border text-muted-foreground hover:text-foreground hover:bg-muted"
            }
          >
            הכל
          </Button>
          {allTypes.map((t) => (
            <Button
              key={t}
              variant={activeType === t ? "default" : "outline"}
              size="sm"
              onClick={() => setActiveType(activeType === t ? null : t)}
              className={
                activeType === t
                  ? "bg-foreground text-white border-gray-900 hover:bg-foreground/90"
                  : "border-border text-muted-foreground hover:text-foreground hover:bg-muted"
              }
            >
              {he.assets.types[t as keyof typeof he.assets.types]}
            </Button>
          ))}
        </div>
      </motion.div>

      {/* Assets Table */}
      <motion.div variants={fadeUp}>
        <Card className="glass-card overflow-hidden">
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="border-border hover:bg-transparent">
                  <TableHead className="text-muted-foreground">שם</TableHead>
                  <TableHead className="text-muted-foreground">סוג</TableHead>
                  <TableHead className="text-muted-foreground">מקור</TableHead>
                  <TableHead className="text-muted-foreground">קישור</TableHead>
                  <TableHead className="text-muted-foreground">הערות</TableHead>
                  <TableHead className="w-[80px] text-muted-foreground">פעולות</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((asset) => (
                  <TableRow
                    key={asset.id}
                    className="border-border transition-all duration-200 hover:bg-muted group"
                  >
                    <TableCell className="font-medium">{asset.name}</TableCell>
                    <TableCell>
                      <Badge className={`${typeColors[asset.type] ?? "bg-muted text-muted-foreground"} border-0`}>
                        {he.assets.types[asset.type as keyof typeof he.assets.types] ?? asset.type}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {asset.source ?? "—"}
                    </TableCell>
                    <TableCell>
                      {asset.originalUrl ? (
                        <a
                          href={asset.originalUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-foreground hover:text-foreground transition-colors duration-200 text-sm"
                        >
                          <ExternalLink className="h-3.5 w-3.5" />
                          <span className="truncate max-w-[150px]">פתח</span>
                        </a>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm max-w-[200px] truncate">
                      {asset.notes ?? "—"}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-opacity duration-200 delay-75">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 hover:bg-muted hover:text-foreground transition-colors duration-200"
                          onClick={() => handleEdit(asset)}
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 hover:bg-red-50 text-destructive transition-colors duration-200"
                          onClick={() => setDeleteTarget({ id: asset.id, name: asset.name })}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {filtered.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="text-center text-muted-foreground py-12"
                    >
                      {he.common.noResults}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </motion.div>

      {/* Dialogs */}
      <AssetDialog
        asset={editingAsset}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
      />

      {deleteTarget && (
        <DeleteAssetDialog
          assetId={deleteTarget.id}
          assetName={deleteTarget.name}
          open={!!deleteTarget}
          onOpenChange={(open) => {
            if (!open) setDeleteTarget(null);
          }}
        />
      )}
    </motion.div>
  );
}
