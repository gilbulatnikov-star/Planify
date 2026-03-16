"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Plus, Pencil, Trash2, TrendingUp, Clock, MinusCircle, Wallet, ExternalLink } from "lucide-react";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { InvoiceDialog } from "./invoice-dialog";
import { DeleteInvoiceDialog } from "./delete-invoice-dialog";
import { ExpenseDialog } from "./expense-dialog";
import { DeleteExpenseDialog } from "./delete-expense-dialog";
import { he } from "@/lib/he";
import { formatCurrency, formatDate } from "@/lib/utils/format";

const invoiceStatusStyles: Record<string, string> = {
  draft: "bg-white/[0.06] text-muted-foreground border-0",
  sent: "bg-cyan-500/15 text-cyan-300 border-0",
  paid: "bg-emerald-500/15 text-emerald-300 border-0",
  overdue: "bg-red-500/15 text-red-300 border-0",
  cancelled: "bg-white/[0.06] text-muted-foreground border-0",
};

const quoteStatusStyles: Record<string, string> = {
  draft: "bg-white/[0.06] text-muted-foreground border-0",
  sent: "bg-cyan-500/15 text-cyan-300 border-0",
  accepted: "bg-emerald-500/15 text-emerald-300 border-0",
  declined: "bg-red-500/15 text-red-300 border-0",
};

type ExpenseData = {
  id: string;
  description: string;
  category: string;
  amount: number;
  date: Date;
  vendor: string | null;
  notes: string | null;
};

type InvoiceData = {
  id: string;
  invoiceNumber: string;
  clientId: string;
  projectId: string | null;
  status: string;
  subtotal: number;
  tax: number;
  total: number;
  dueDate: Date | null;
  externalLink: string | null;
  notes: string | null;
  client: { name: string };
  project: { title: string } | null;
};

type QuoteData = {
  id: string;
  quoteNumber: string;
  status: string;
  total: number;
  validUntil: Date | null;
  client: { name: string };
  project: { title: string } | null;
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

export function FinancialsPageClient({
  invoices,
  quotes,
  expenses,
  clients,
  projects,
}: {
  invoices: InvoiceData[];
  quotes: QuoteData[];
  expenses: ExpenseData[];
  clients: { id: string; name: string }[];
  projects: { id: string; title: string }[];
}) {
  // Invoice state
  const [invoiceDialogOpen, setInvoiceDialogOpen] = useState(false);
  const [editingInvoice, setEditingInvoice] = useState<InvoiceData | null>(null);
  const [deleteInvoiceTarget, setDeleteInvoiceTarget] = useState<string | null>(null);

  // Expense state
  const [expenseDialogOpen, setExpenseDialogOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<ExpenseData | null>(null);
  const [deleteExpenseTarget, setDeleteExpenseTarget] = useState<string | null>(null);

  const totalRevenue = invoices
    .filter((i) => i.status === "paid")
    .reduce((sum, i) => sum + i.total, 0);
  const totalOutstanding = invoices
    .filter((i) => ["sent", "overdue"].includes(i.status))
    .reduce((sum, i) => sum + i.total, 0);
  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);

  function handleCreateInvoice() {
    setEditingInvoice(null);
    setInvoiceDialogOpen(true);
  }

  function handleEditInvoice(invoice: InvoiceData) {
    setEditingInvoice(invoice);
    setInvoiceDialogOpen(true);
  }

  function handleCreateExpense() {
    setEditingExpense(null);
    setExpenseDialogOpen(true);
  }

  function handleEditExpense(expense: ExpenseData) {
    setEditingExpense(expense);
    setExpenseDialogOpen(true);
  }

  const statCards = [
    { label: "הכנסות (שולם)", value: formatCurrency(totalRevenue), icon: TrendingUp, color: "from-emerald-400 to-green-500", textColor: "text-emerald-400" },
    { label: "חשבוניות פתוחות", value: formatCurrency(totalOutstanding), icon: Clock, color: "from-amber-400 to-yellow-500", textColor: "text-amber-400" },
    { label: "הוצאות", value: formatCurrency(totalExpenses), icon: MinusCircle, color: "from-red-400 to-rose-500", textColor: "text-red-400" },
    { label: "רווח נטו", value: formatCurrency(totalRevenue - totalExpenses), icon: Wallet, color: "from-cyan-400 to-teal-500", textColor: "text-cyan-400" },
  ];

  return (
    <motion.div
      variants={stagger}
      initial="hidden"
      animate="show"
      className="space-y-6"
    >
      <motion.div variants={fadeUp} className="flex items-center justify-between">
        <h1 className="text-2xl font-bold bg-gradient-to-l from-cyan-300 via-white to-white bg-clip-text text-transparent">
          {he.financial.title}
        </h1>
      </motion.div>

      <motion.div variants={fadeUp} className="grid grid-cols-1 gap-4 md:grid-cols-4">
        {statCards.map((stat) => (
          <Card key={stat.label} className="glass-card group transition-all duration-300 hover:scale-[1.02] cursor-default">
            <CardContent className="p-4 flex items-center gap-4">
              <div className={`rounded-xl bg-gradient-to-br ${stat.color} p-2.5 shadow-lg transition-transform duration-300 group-hover:scale-110`}>
                <stat.icon className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
                <p className={`text-2xl font-bold tracking-tight ${stat.textColor}`}>
                  {stat.value}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </motion.div>

      <motion.div variants={fadeUp}>
        <Tabs defaultValue="invoices" dir="rtl">
          <TabsList className="bg-white/[0.04] border border-white/[0.06]">
            <TabsTrigger value="invoices" className="data-[state=active]:bg-cyan-500/15 data-[state=active]:text-cyan-300 transition-all duration-200">
              {he.financial.invoices} ({invoices.length})
            </TabsTrigger>
            <TabsTrigger value="quotes" className="data-[state=active]:bg-cyan-500/15 data-[state=active]:text-cyan-300 transition-all duration-200">
              {he.financial.quotes} ({quotes.length})
            </TabsTrigger>
            <TabsTrigger value="expenses" className="data-[state=active]:bg-cyan-500/15 data-[state=active]:text-cyan-300 transition-all duration-200">
              {he.financial.expenses} ({expenses.length})
            </TabsTrigger>
          </TabsList>

          {/* INVOICES TAB */}
          <TabsContent value="invoices">
            <div className="flex justify-end mb-3">
              <Button
                size="sm"
                onClick={handleCreateInvoice}
                className="bg-gradient-to-r from-cyan-500 to-teal-500 text-white hover:from-cyan-400 hover:to-teal-400 shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/40 transition-all duration-300 border-0"
              >
                <Plus className="h-4 w-4 me-2" />
                {he.financial.newInvoice}
              </Button>
            </div>
            <Card className="glass-card overflow-hidden">
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow className="border-white/[0.06] hover:bg-transparent">
                      <TableHead className="text-muted-foreground">מספר</TableHead>
                      <TableHead className="text-muted-foreground">לקוח</TableHead>
                      <TableHead className="text-muted-foreground">פרויקט</TableHead>
                      <TableHead className="text-muted-foreground">סטטוס</TableHead>
                      <TableHead className="text-muted-foreground">{he.financial.total}</TableHead>
                      <TableHead className="text-muted-foreground">תאריך יעד</TableHead>
                      <TableHead className="w-[100px] text-muted-foreground">פעולות</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {invoices.map((inv) => (
                      <TableRow key={inv.id} className="border-white/[0.04] transition-all duration-200 hover:bg-cyan-500/[0.04] group">
                        <TableCell className="font-medium font-mono text-sm">
                          {inv.invoiceNumber}
                        </TableCell>
                        <TableCell>{inv.client.name}</TableCell>
                        <TableCell className="text-muted-foreground">{inv.project?.title ?? "—"}</TableCell>
                        <TableCell>
                          <Badge className={invoiceStatusStyles[inv.status] ?? "bg-white/[0.06] text-muted-foreground border-0"}>
                            {he.financial.invoiceStatuses[
                              inv.status as keyof typeof he.financial.invoiceStatuses
                            ] ?? inv.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-medium">
                          {formatCurrency(inv.total)}
                        </TableCell>
                        <TableCell className="text-muted-foreground">{formatDate(inv.dueDate)}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                            {inv.externalLink && (
                              <a href={inv.externalLink} target="_blank" rel="noopener noreferrer">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-7 w-7 hover:bg-cyan-500/10 hover:text-cyan-400 transition-colors duration-200"
                                >
                                  <ExternalLink className="h-3.5 w-3.5" />
                                </Button>
                              </a>
                            )}
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 hover:bg-cyan-500/10 hover:text-cyan-400 transition-colors duration-200"
                              onClick={() => handleEditInvoice(inv)}
                            >
                              <Pencil className="h-3.5 w-3.5" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 hover:bg-red-500/10 text-destructive transition-colors duration-200"
                              onClick={() => setDeleteInvoiceTarget(inv.id)}
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
          </TabsContent>

          {/* QUOTES TAB */}
          <TabsContent value="quotes">
            <Card className="glass-card overflow-hidden">
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow className="border-white/[0.06] hover:bg-transparent">
                      <TableHead className="text-muted-foreground">מספר</TableHead>
                      <TableHead className="text-muted-foreground">לקוח</TableHead>
                      <TableHead className="text-muted-foreground">פרויקט</TableHead>
                      <TableHead className="text-muted-foreground">סטטוס</TableHead>
                      <TableHead className="text-muted-foreground">{he.financial.total}</TableHead>
                      <TableHead className="text-muted-foreground">בתוקף עד</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {quotes.map((q) => (
                      <TableRow key={q.id} className="border-white/[0.04] transition-all duration-200 hover:bg-cyan-500/[0.04]">
                        <TableCell className="font-medium font-mono text-sm">
                          {q.quoteNumber}
                        </TableCell>
                        <TableCell>{q.client.name}</TableCell>
                        <TableCell className="text-muted-foreground">{q.project?.title ?? "—"}</TableCell>
                        <TableCell>
                          <Badge className={quoteStatusStyles[q.status] ?? "bg-white/[0.06] text-muted-foreground border-0"}>
                            {he.financial.quoteStatuses[
                              q.status as keyof typeof he.financial.quoteStatuses
                            ] ?? q.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-medium">
                          {formatCurrency(q.total)}
                        </TableCell>
                        <TableCell className="text-muted-foreground">{formatDate(q.validUntil)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* EXPENSES TAB */}
          <TabsContent value="expenses">
            <div className="flex justify-end mb-3">
              <Button
                size="sm"
                onClick={handleCreateExpense}
                className="bg-gradient-to-r from-cyan-500 to-teal-500 text-white hover:from-cyan-400 hover:to-teal-400 shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/40 transition-all duration-300 border-0"
              >
                <Plus className="h-4 w-4 me-2" />
                {he.financial.newExpense}
              </Button>
            </div>
            <Card className="glass-card overflow-hidden">
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow className="border-white/[0.06] hover:bg-transparent">
                      <TableHead className="text-muted-foreground">תיאור</TableHead>
                      <TableHead className="text-muted-foreground">קטגוריה</TableHead>
                      <TableHead className="text-muted-foreground">סכום</TableHead>
                      <TableHead className="text-muted-foreground">תאריך</TableHead>
                      <TableHead className="text-muted-foreground">ספק</TableHead>
                      <TableHead className="w-[80px] text-muted-foreground">פעולות</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {expenses.map((exp) => (
                      <TableRow key={exp.id} className="border-white/[0.04] transition-all duration-200 hover:bg-cyan-500/[0.04] group">
                        <TableCell className="font-medium">
                          {exp.description}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="border-white/10 text-muted-foreground">
                            {he.financial.expenseCategories[
                              exp.category as keyof typeof he.financial.expenseCategories
                            ] ?? exp.category}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-medium text-red-400">
                          {formatCurrency(exp.amount)}
                        </TableCell>
                        <TableCell className="text-muted-foreground">{formatDate(exp.date)}</TableCell>
                        <TableCell className="text-muted-foreground">{exp.vendor ?? "—"}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 hover:bg-cyan-500/10 hover:text-cyan-400 transition-colors duration-200"
                              onClick={() => handleEditExpense(exp)}
                            >
                              <Pencil className="h-3.5 w-3.5" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 hover:bg-red-500/10 text-destructive transition-colors duration-200"
                              onClick={() => setDeleteExpenseTarget(exp.id)}
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
          </TabsContent>
        </Tabs>
      </motion.div>

      {/* Invoice dialogs */}
      <InvoiceDialog
        invoice={editingInvoice}
        clients={clients}
        projects={projects}
        open={invoiceDialogOpen}
        onOpenChange={setInvoiceDialogOpen}
      />

      {deleteInvoiceTarget && (
        <DeleteInvoiceDialog
          invoiceId={deleteInvoiceTarget}
          open={!!deleteInvoiceTarget}
          onOpenChange={(open) => {
            if (!open) setDeleteInvoiceTarget(null);
          }}
        />
      )}

      {/* Expense dialogs */}
      <ExpenseDialog
        expense={editingExpense}
        open={expenseDialogOpen}
        onOpenChange={setExpenseDialogOpen}
      />

      {deleteExpenseTarget && (
        <DeleteExpenseDialog
          expenseId={deleteExpenseTarget}
          open={!!deleteExpenseTarget}
          onOpenChange={(open) => {
            if (!open) setDeleteExpenseTarget(null);
          }}
        />
      )}
    </motion.div>
  );
}
