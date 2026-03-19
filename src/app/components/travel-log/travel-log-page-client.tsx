"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Plus, Pencil, Trash2, MoreHorizontal } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { TravelEntryDialog } from "./travel-entry-dialog";
import { DeleteTravelDialog } from "./delete-travel-dialog";
import { he } from "@/lib/he";
import { formatDate } from "@/lib/utils/format";

const stagger = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.03, delayChildren: 0.02 },
  },
};

const fadeUp = {
  hidden: { opacity: 0, y: 12 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.35, ease: "easeOut" as const },
  },
};

type TravelLogData = {
  id: string;
  date: Date;
  origin: string;
  destination: string;
  kilometers: number;
  purpose: string | null;
  clientId: string | null;
  projectId: string | null;
  client: { id: string; name: string } | null;
  project: { id: string; title: string } | null;
};

type ClientOption = { id: string; name: string };
type ProjectOption = { id: string; title: string };

export function TravelLogPageClient({
  travelLogs,
  totalKmThisMonth,
  clients,
  projects,
}: {
  travelLogs: TravelLogData[];
  totalKmThisMonth: number;
  clients: ClientOption[];
  projects: ProjectOption[];
}) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<TravelLogData | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<{
    id: string;
    label: string;
  } | null>(null);

  function handleCreate() {
    setEditingItem(null);
    setDialogOpen(true);
  }

  function handleEdit(item: TravelLogData) {
    setEditingItem(item);
    setDialogOpen(true);
  }

  return (
    <motion.div
      variants={stagger}
      initial="hidden"
      animate="show"
      className="space-y-6"
    >
      <motion.div
        variants={fadeUp}
        className="flex items-center justify-between"
      >
        <h1 className="text-2xl font-bold text-gray-900">
          {he.travelLog.title}
        </h1>
        <Button
          size="sm"
          onClick={handleCreate}
          className="bg-gray-900 text-white hover:bg-gray-800 shadow-sm transition-all duration-200 border-0"
        >
          <Plus className="h-4 w-4 me-2" />
          {he.travelLog.newEntry}
        </Button>
      </motion.div>

      {/* Total km stat card */}
      <motion.div variants={fadeUp}>
        <Card className="glass-card group transition-all duration-300 hover:scale-[1.01]">
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">
                {he.travelLog.totalKm}
              </p>
              <p className="text-3xl font-bold tracking-tight text-gray-900">
                {totalKmThisMonth.toLocaleString("he-IL")} {he.travelLog.kilometers}
              </p>
            </div>
            <div className="text-xs text-muted-foreground">
              {travelLogs.length} נסיעות
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Travel log table */}
      <motion.div variants={fadeUp}>
        <Card className="glass-card overflow-hidden">
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="border-gray-100 hover:bg-transparent">
                  <TableHead className="text-muted-foreground">
                    תאריך
                  </TableHead>
                  <TableHead className="text-muted-foreground">
                    {he.travelLog.origin} &larr; {he.travelLog.destination}
                  </TableHead>
                  <TableHead className="text-muted-foreground">
                    {he.travelLog.kilometers}
                  </TableHead>
                  <TableHead className="text-muted-foreground">
                    מטרה
                  </TableHead>
                  <TableHead className="text-muted-foreground">
                    לקוח
                  </TableHead>
                  <TableHead className="text-muted-foreground">
                    פרויקט
                  </TableHead>
                  <TableHead className="w-[60px] text-muted-foreground">
                    פעולות
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {travelLogs.map((entry) => (
                  <TableRow
                    key={entry.id}
                    className="border-gray-100 transition-all duration-200 hover:bg-gray-50 group"
                  >
                    <TableCell className="text-muted-foreground">
                      {formatDate(entry.date)}
                    </TableCell>
                    <TableCell className="font-medium">
                      {entry.origin} &larr; {entry.destination}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {entry.kilometers}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {entry.purpose ?? "—"}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {entry.client?.name ?? "—"}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {entry.project?.title ?? "—"}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger
                          render={
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-opacity duration-200 delay-75"
                            />
                          }
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleEdit(entry)}>
                            <Pencil className="h-3.5 w-3.5 me-2" />
                            {he.common.edit}
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={() =>
                              setDeleteTarget({
                                id: entry.id,
                                label: `${entry.origin} \u2190 ${entry.destination}`,
                              })
                            }
                          >
                            <Trash2 className="h-3.5 w-3.5 me-2" />
                            {he.common.delete}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
                {travelLogs.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={7}
                      className="text-center text-muted-foreground py-8"
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

      <TravelEntryDialog
        entry={editingItem}
        clients={clients}
        projects={projects}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
      />

      {deleteTarget && (
        <DeleteTravelDialog
          entryId={deleteTarget.id}
          entryLabel={deleteTarget.label}
          open={!!deleteTarget}
          onOpenChange={(open) => {
            if (!open) setDeleteTarget(null);
          }}
        />
      )}
    </motion.div>
  );
}
