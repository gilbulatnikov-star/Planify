"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { EquipmentDialog } from "./equipment-dialog";
import { DeleteEquipmentDialog } from "./delete-equipment-dialog";
import { he } from "@/lib/he";
import { formatCurrency } from "@/lib/utils/format";

const statusStyles: Record<string, string> = {
  available: "bg-emerald-500/15 text-emerald-300 border-0",
  rented: "bg-cyan-500/15 text-cyan-300 border-0",
  in_repair: "bg-red-500/15 text-red-300 border-0",
  retired: "bg-white/[0.06] text-muted-foreground border-0",
};

type EquipmentData = {
  id: string;
  name: string;
  category: string;
  brand: string | null;
  model: string | null;
  serialNumber: string | null;
  purchasePrice: number | null;
  status: string;
  notes: string | null;
  gearAssignments: { project: { title: string } }[];
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
  show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: "easeOut" as const } },
};

export function EquipmentPageClient({
  equipment,
}: {
  equipment: EquipmentData[];
}) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<EquipmentData | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<{
    id: string;
    name: string;
  } | null>(null);

  function handleCreate() {
    setEditingItem(null);
    setDialogOpen(true);
  }

  function handleEdit(item: EquipmentData) {
    setEditingItem(item);
    setDialogOpen(true);
  }

  const categoryCounts = equipment.reduce<Record<string, number>>(
    (acc, item) => {
      acc[item.category] = (acc[item.category] || 0) + 1;
      return acc;
    },
    {}
  );

  return (
    <motion.div
      variants={stagger}
      initial="hidden"
      animate="show"
      className="space-y-6"
    >
      <motion.div variants={fadeUp} className="flex items-center justify-between">
        <h1 className="text-2xl font-bold bg-gradient-to-l from-cyan-300 via-white to-white bg-clip-text text-transparent">
          {he.equipment.title}
        </h1>
        <Button
          size="sm"
          onClick={handleCreate}
          className="bg-gradient-to-r from-cyan-500 to-teal-500 text-white hover:from-cyan-400 hover:to-teal-400 shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/40 transition-all duration-300 border-0"
        >
          <Plus className="h-4 w-4 me-2" />
          {he.equipment.newItem}
        </Button>
      </motion.div>

      <motion.div variants={fadeUp} className="grid grid-cols-2 gap-3 md:grid-cols-4 lg:grid-cols-7">
        {Object.entries(he.equipment.categories).map(([key, label]) => (
          <Card key={key} className="glass-card group transition-all duration-300 hover:scale-[1.03] cursor-default">
            <CardContent className="p-3 text-center">
              <p className="text-xs text-muted-foreground">{label}</p>
              <p className="text-xl font-bold tracking-tight">{categoryCounts[key] ?? 0}</p>
            </CardContent>
          </Card>
        ))}
      </motion.div>

      <motion.div variants={fadeUp}>
        <Card className="glass-card overflow-hidden">
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="border-white/[0.06] hover:bg-transparent">
                  <TableHead className="text-muted-foreground">{he.equipment.name}</TableHead>
                  <TableHead className="text-muted-foreground">{he.equipment.category}</TableHead>
                  <TableHead className="text-muted-foreground">{he.equipment.brand}</TableHead>
                  <TableHead className="text-muted-foreground">{he.equipment.model}</TableHead>
                  <TableHead className="text-muted-foreground">{he.equipment.status}</TableHead>
                  <TableHead className="text-muted-foreground">{he.equipment.purchasePrice}</TableHead>
                  <TableHead className="text-muted-foreground">משויך לפרויקט</TableHead>
                  <TableHead className="w-[80px] text-muted-foreground">פעולות</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {equipment.map((item) => (
                  <TableRow
                    key={item.id}
                    className="border-white/[0.04] transition-all duration-200 hover:bg-cyan-500/[0.04] group"
                  >
                    <TableCell className="font-medium">{item.name}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="border-white/10 text-muted-foreground">
                        {he.equipment.categories[
                          item.category as keyof typeof he.equipment.categories
                        ] ?? item.category}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{item.brand ?? "—"}</TableCell>
                    <TableCell className="text-muted-foreground">{item.model ?? "—"}</TableCell>
                    <TableCell>
                      <Badge className={statusStyles[item.status] ?? "bg-white/[0.06] text-muted-foreground border-0"}>
                        {he.equipment.statuses[
                          item.status as keyof typeof he.equipment.statuses
                        ] ?? item.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {item.purchasePrice
                        ? formatCurrency(item.purchasePrice)
                        : "—"}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {item.gearAssignments.length > 0
                        ? item.gearAssignments
                            .map((ga) => ga.project.title)
                            .join(", ")
                        : "—"}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 hover:bg-cyan-500/10 hover:text-cyan-400 transition-colors duration-200"
                          onClick={() => handleEdit(item)}
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 hover:bg-red-500/10 text-destructive transition-colors duration-200"
                          onClick={() =>
                            setDeleteTarget({ id: item.id, name: item.name })
                          }
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </motion.div>

      <EquipmentDialog
        equipment={editingItem}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
      />

      {deleteTarget && (
        <DeleteEquipmentDialog
          equipmentId={deleteTarget.id}
          equipmentName={deleteTarget.name}
          open={!!deleteTarget}
          onOpenChange={(open) => {
            if (!open) setDeleteTarget(null);
          }}
        />
      )}
    </motion.div>
  );
}
