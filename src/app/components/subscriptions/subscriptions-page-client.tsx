"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Plus, Pencil, Trash2, MoreHorizontal } from "lucide-react";
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
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { SubscriptionDialog } from "./subscription-dialog";
import { DeleteSubscriptionDialog } from "./delete-subscription-dialog";
import { useT } from "@/lib/i18n";
import { formatCurrency, formatDate } from "@/lib/utils/format";

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

const statusStyles: Record<string, string> = {
  active: "bg-emerald-50 text-emerald-700 border-0",
  cancelled: "bg-muted text-muted-foreground border-0",
};

const cycleStyles: Record<string, string> = {
  monthly: "bg-cyan-50 text-cyan-700 border-0",
  yearly: "bg-purple-50 text-purple-700 border-0",
};

type SubscriptionData = {
  id: string;
  serviceName: string;
  billingCycle: string;
  amount: number;
  nextBillingDate: Date | null;
  status: string;
  notes: string | null;
};

export function SubscriptionsPageClient({
  subscriptions,
  totalMonthlyCost,
}: {
  subscriptions: SubscriptionData[];
  totalMonthlyCost: number;
}) {
  const he = useT();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<SubscriptionData | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<{
    id: string;
    name: string;
  } | null>(null);

  function handleCreate() {
    setEditingItem(null);
    setDialogOpen(true);
  }

  function handleEdit(item: SubscriptionData) {
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
        <h1 className="text-2xl font-bold text-foreground">
          {he.subscriptions.title}
        </h1>
        <Button
          size="sm"
          onClick={handleCreate}
          className="bg-foreground text-background hover:bg-foreground/90 shadow-sm transition-all duration-200 border-0"
        >
          <Plus className="h-4 w-4 me-2" />
          {he.subscriptions.newSubscription}
        </Button>
      </motion.div>

      {/* Total monthly cost stat card */}
      <motion.div variants={fadeUp}>
        <Card className="glass-card group transition-all duration-300 hover:scale-[1.01]">
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">
                {he.subscriptions.totalMonthly}
              </p>
              <p className="text-3xl font-bold tracking-tight text-foreground">
                {formatCurrency(Math.round(totalMonthlyCost))}
              </p>
            </div>
            <div className="text-xs text-muted-foreground">
              {subscriptions.filter((s) => s.status === "active").length} פעילים
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Subscriptions table */}
      <motion.div variants={fadeUp}>
        <Card className="glass-card overflow-hidden">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-border hover:bg-transparent">
                  <TableHead className="text-muted-foreground">
                    שם השירות
                  </TableHead>
                  <TableHead className="hidden sm:table-cell text-muted-foreground">
                    מחזור חיוב
                  </TableHead>
                  <TableHead className="text-muted-foreground">
                    סכום
                  </TableHead>
                  <TableHead className="hidden sm:table-cell text-muted-foreground">
                    חיוב הבא
                  </TableHead>
                  <TableHead className="text-muted-foreground">
                    סטטוס
                  </TableHead>
                  <TableHead className="w-[60px] text-muted-foreground">
                    פעולות
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {subscriptions.map((sub) => (
                  <TableRow
                    key={sub.id}
                    className="border-border transition-all duration-200 hover:bg-muted group"
                  >
                    <TableCell className="font-medium">
                      {sub.serviceName}
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      <Badge
                        className={
                          cycleStyles[sub.billingCycle] ??
                          "bg-muted text-muted-foreground border-0"
                        }
                      >
                        {he.subscriptions.cycles[
                          sub.billingCycle as keyof typeof he.subscriptions.cycles
                        ] ?? sub.billingCycle}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {formatCurrency(sub.amount)}
                    </TableCell>
                    <TableCell className="hidden sm:table-cell text-muted-foreground">
                      {formatDate(sub.nextBillingDate)}
                    </TableCell>
                    <TableCell>
                      <Badge
                        className={
                          statusStyles[sub.status] ??
                          "bg-muted text-muted-foreground border-0"
                        }
                      >
                        {he.subscriptions.statuses[
                          sub.status as keyof typeof he.subscriptions.statuses
                        ] ?? sub.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger
                          render={
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 opacity-100 sm:opacity-0 sm:pointer-events-none sm:group-hover:opacity-100 sm:group-hover:pointer-events-auto transition-opacity duration-200"
                            />
                          }
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleEdit(sub)}>
                            <Pencil className="h-3.5 w-3.5 me-2" />
                            {he.common.edit}
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={() =>
                              setDeleteTarget({
                                id: sub.id,
                                name: sub.serviceName,
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
                {subscriptions.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="text-center text-muted-foreground py-8"
                    >
                      {he.common.noResults}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <SubscriptionDialog
        subscription={editingItem}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
      />

      {deleteTarget && (
        <DeleteSubscriptionDialog
          subscriptionId={deleteTarget.id}
          subscriptionName={deleteTarget.name}
          open={!!deleteTarget}
          onOpenChange={(open) => {
            if (!open) setDeleteTarget(null);
          }}
        />
      )}
    </motion.div>
  );
}
