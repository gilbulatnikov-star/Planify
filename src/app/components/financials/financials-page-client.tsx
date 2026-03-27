"use client";

import { useState, useTransition, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Plus,
  Pencil,
  Trash2,
  TrendingUp,
  Clock,
  MinusCircle,
  Wallet,
  ExternalLink,
  MoreHorizontal,
  ArrowRightLeft,
  Upload,
  RefreshCw,
  ChevronRight,
  ChevronLeft,
  CalendarDays,
  SlidersHorizontal,
  X,
  Search,
} from "lucide-react";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { InvoiceDialog } from "./invoice-dialog";
import { DeleteInvoiceDialog } from "./delete-invoice-dialog";
import { DeleteQuoteDialog } from "./delete-quote-dialog";
import { ExpenseDialog } from "./expense-dialog";
import { DeleteExpenseDialog } from "./delete-expense-dialog";
import { DocumentUploadDialog } from "./document-upload-dialog";
import {
  updateInvoiceStatus,
  updateQuoteStatus,
} from "@/lib/actions/financial-actions";
import { useT } from "@/lib/i18n";
import { formatCurrency, formatDate } from "@/lib/utils/format";
import { DatePicker } from "@/components/ui/date-picker";

const invoiceStatusStyles: Record<string, string> = {
  draft: "bg-muted text-muted-foreground border-0",
  sent: "bg-cyan-50 text-cyan-700 dark:bg-cyan-950 dark:text-cyan-300 border-0",
  paid: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 border-0",
  overdue: "bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300 border-0",
  cancelled: "bg-muted text-muted-foreground border-0",
};

const quoteStatusStyles: Record<string, string> = {
  draft: "bg-muted text-muted-foreground border-0",
  sent: "bg-cyan-50 text-cyan-700 dark:bg-cyan-950 dark:text-cyan-300 border-0",
  accepted: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 border-0",
  declined: "bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300 border-0",
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

type SubscriptionData = {
  id: string;
  serviceName: string;
  billingCycle: string;
  amount: number;
  nextBillingDate: Date | null;
  status: string;
  notes: string | null;
};

type InvoiceData = {
  id: string;
  invoiceNumber: string;
  clientId: string | null;
  projectId: string | null;
  status: string;
  subtotal: number;
  tax: number;
  total: number;
  dueDate: Date | null;
  externalLink: string | null;
  notes: string | null;
  client: { name: string } | null;
  project: { title: string } | null;
};

type QuoteData = {
  id: string;
  quoteNumber: string;
  clientId: string;
  projectId: string | null;
  status: string;
  subtotal: number;
  tax: number;
  total: number;
  validUntil: Date | null;
  notes: string | null;
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
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.35, ease: "easeOut" as const },
  },
};

/* invoiceStatusFlow, quoteStatusFlow, and month names are built inside the component to access i18n */

export function FinancialsPageClient({
  invoices,
  quotes,
  expenses,
  clients,
  projects,
  subscriptions,
  totalMonthlyCost,
}: {
  invoices: InvoiceData[];
  quotes: QuoteData[];
  expenses: ExpenseData[];
  clients: { id: string; name: string }[];
  projects: { id: string; title: string }[];
  subscriptions: SubscriptionData[];
  totalMonthlyCost: number;
}) {
  const he = useT();

  const invoiceStatusFlow: { value: string; label: string }[] = [
    { value: "draft", label: he.financial.invoiceStatuses.draft },
    { value: "sent", label: he.financial.invoiceStatuses.sent },
    { value: "paid", label: he.financial.invoiceStatuses.paid },
    { value: "overdue", label: he.financial.invoiceStatuses.overdue },
    { value: "cancelled", label: he.financial.invoiceStatuses.cancelled },
  ];

  const quoteStatusFlow: { value: string; label: string }[] = [
    { value: "draft", label: he.financial.quoteStatuses.draft },
    { value: "sent", label: he.financial.quoteStatuses.sent },
    { value: "accepted", label: he.financial.quoteStatuses.accepted },
    { value: "declined", label: he.financial.quoteStatuses.declined },
  ];

  const MONTH_NAMES = he.financialPage.monthNames as unknown as string[];

  const [isPending, startTransition] = useTransition();

  // Month navigation
  const now = new Date();
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth());
  const [selectedYear, setSelectedYear]   = useState(now.getFullYear());
  const [pickerOpen, setPickerOpen]       = useState(false);
  const [pickerYear, setPickerYear]       = useState(now.getFullYear());
  const pickerRef = useRef<HTMLDivElement>(null);

  // Search
  const [search, setSearch] = useState("");

  // Date range filter
  const [dateFilterOpen, setDateFilterOpen] = useState(false);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo]     = useState("");
  const hasDateFilter = !!dateFrom || !!dateTo;

  // Close picker on outside click
  useEffect(() => {
    function handle(e: MouseEvent) {
      if (pickerRef.current && !pickerRef.current.contains(e.target as Node)) {
        setPickerOpen(false);
      }
    }
    if (pickerOpen) document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, [pickerOpen]);

  // In RTL: right arrow = older (prev), left arrow = newer (next)
  function goPrev() {
    if (selectedMonth === 0) { setSelectedMonth(11); setSelectedYear(y => y - 1); }
    else setSelectedMonth(m => m - 1);
  }
  function goNext() {
    if (selectedMonth === 11) { setSelectedMonth(0); setSelectedYear(y => y + 1); }
    else setSelectedMonth(m => m + 1);
  }
  function pickMonth(m: number) {
    setSelectedMonth(m);
    setSelectedYear(pickerYear);
    setPickerOpen(false);
  }

  function inSelectedMonth(date: Date | null | undefined): boolean {
    if (!date) return false;
    const d = new Date(date);
    return d.getMonth() === selectedMonth && d.getFullYear() === selectedYear;
  }
  function inDateRange(date: Date | null | undefined): boolean {
    if (!date) return false;
    const d = new Date(date);
    if (dateFrom && d < new Date(dateFrom)) return false;
    if (dateTo   && d > new Date(dateTo + "T23:59:59")) return false;
    return true;
  }
  function matchesFilter(date: Date | null | undefined): boolean {
    return hasDateFilter ? inDateRange(date) : inSelectedMonth(date);
  }

  // Invoice state
  const [invoiceDialogOpen, setInvoiceDialogOpen] = useState(false);
  const [editingInvoice, setEditingInvoice] = useState<InvoiceData | null>(
    null,
  );
  const [deleteInvoiceTarget, setDeleteInvoiceTarget] = useState<string | null>(
    null,
  );

  // Quote state
  const [deleteQuoteTarget, setDeleteQuoteTarget] = useState<string | null>(
    null,
  );

  // Expense state
  const [expenseDialogOpen, setExpenseDialogOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<ExpenseData | null>(
    null,
  );
  const [deleteExpenseTarget, setDeleteExpenseTarget] = useState<string | null>(
    null,
  );

  // Upload state
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);

  // Filter all data
  const searchLower = search.toLowerCase();
  const filteredInvoices = invoices.filter((i) => {
    if (!matchesFilter(i.dueDate)) return false;
    if (!search) return true;
    return (
      (i.client?.name ?? "").toLowerCase().includes(searchLower) ||
      (i.notes ?? "").toLowerCase().includes(searchLower) ||
      i.invoiceNumber.toLowerCase().includes(searchLower) ||
      String(i.total).includes(search)
    );
  });
  const filteredQuotes = quotes.filter((q) => {
    if (!matchesFilter(q.validUntil)) return false;
    if (!search) return true;
    return (
      q.client.name.toLowerCase().includes(searchLower) ||
      (q.notes ?? "").toLowerCase().includes(searchLower) ||
      q.quoteNumber.toLowerCase().includes(searchLower) ||
      String(q.total).includes(search)
    );
  });
  const filteredExpenses = expenses.filter((e) => {
    if (!matchesFilter(e.date)) return false;
    if (!search) return true;
    return (
      e.description.toLowerCase().includes(searchLower) ||
      (e.vendor ?? "").toLowerCase().includes(searchLower) ||
      String(e.amount).includes(search)
    );
  });

  const totalRevenue = filteredInvoices
    .filter((i) => i.status === "paid")
    .reduce((sum, i) => sum + i.total, 0);
  const totalOutstanding = filteredInvoices
    .filter((i) => ["sent", "overdue"].includes(i.status))
    .reduce((sum, i) => sum + i.total, 0);
  const totalExpenses = filteredExpenses.reduce((sum, e) => sum + e.amount, 0) + totalMonthlyCost;

  function handleCreateInvoice() {
    setEditingInvoice(null);
    setInvoiceDialogOpen(true);
  }

  function handleEditInvoice(invoice: InvoiceData) {
    setEditingInvoice(invoice);
    setInvoiceDialogOpen(true);
  }

  function handleQuickInvoiceStatus(id: string, status: string) {
    startTransition(async () => {
      await updateInvoiceStatus(id, status);
    });
  }

  function handleQuickQuoteStatus(id: string, status: string) {
    startTransition(async () => {
      await updateQuoteStatus(id, status);
    });
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
    {
      label: he.financialPage.revenuePaid,
      value: formatCurrency(totalRevenue),
      icon: TrendingUp,
      color: "from-emerald-500 to-green-600",
      textColor: "text-emerald-600",
    },
    {
      label: he.financialPage.openInvoices,
      value: formatCurrency(totalOutstanding),
      icon: Clock,
      color: "from-amber-500 to-yellow-500",
      textColor: "text-amber-600",
    },
    {
      label: he.financialPage.expenses,
      value: formatCurrency(totalExpenses),
      icon: MinusCircle,
      color: "from-red-500 to-rose-500",
      textColor: "text-red-500",
    },
    {
      label: he.financialPage.profitLoss,
      value: formatCurrency(totalRevenue - totalExpenses),
      icon: Wallet,
      color: "from-gray-700 to-gray-900",
      textColor: "text-foreground",
    },
  ];

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
        <div>
          <h1 className="text-[22px] font-extrabold tracking-[-0.03em] text-foreground">
            {he.financial.title}
          </h1>
          <p className="text-[11.5px] text-foreground/40 mt-0.5">סריקה ומעקב מסמכים פיננסיים — לא ליצירת חשבוניות</p>
        </div>
        <Button
          size="sm"
          onClick={() => setUploadDialogOpen(true)}
          className="bg-foreground text-background hover:bg-foreground/90 shadow-sm transition-all duration-200 border-0"
        >
          <Upload className="h-4 w-4 me-2" />
          {he.financialPage.uploadDocument}
        </Button>
      </motion.div>

      {/* Search bar */}
      <motion.div variants={fadeUp}>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-foreground/30" />
          <input
            placeholder="חיפוש מסמכים..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full max-w-xs rounded-[10px] border border-border/40 bg-card pr-4 pl-10 py-2.5 text-[13px] text-foreground placeholder:text-foreground/30 outline-none focus:border-accent/40 focus:ring-1 focus:ring-accent/20 transition-all duration-200"
          />
        </div>
      </motion.div>

      {/* Month navigator + filters */}
      <motion.div variants={fadeUp} className="space-y-3">
        <div className="flex items-center gap-2 justify-center flex-wrap">

          {/* Month nav bar */}
          <div className="relative flex items-center gap-1 bg-background border border-border/40 rounded-2xl px-3 py-2 shadow-sm" dir="rtl">
            {/* RTL: right = older, left = newer */}
            <button
              onClick={goPrev}
              className="flex h-8 w-8 items-center justify-center rounded-xl hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
              title={he.financialPage.prevMonth}
            >
              <ChevronRight className="h-4 w-4" />
            </button>

            <div className="text-sm font-bold text-foreground min-w-[130px] text-center select-none">
              {hasDateFilter ? (
                <span className="text-foreground">{he.financialPage.dateFilter}</span>
              ) : (
                `${MONTH_NAMES[selectedMonth]} ${selectedYear}`
              )}
            </div>

            <button
              onClick={goNext}
              className="flex h-8 w-8 items-center justify-center rounded-xl hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
              title={he.financialPage.nextMonth}
            >
              <ChevronLeft className="h-4 w-4" />
            </button>

            {/* Calendar picker button */}
            <div className="w-px h-5 bg-border/40 mx-1" />
            <button
              onClick={() => { setPickerOpen(v => !v); setPickerYear(selectedYear); }}
              className="flex h-8 w-8 items-center justify-center rounded-xl hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
              title={he.financialPage.selectMonth}
            >
              <CalendarDays className="h-4 w-4" />
            </button>

            {/* Month picker popover */}
            {pickerOpen && (
              <div
                ref={pickerRef}
                className="absolute top-full mt-2 right-0 z-50 bg-popover border border-border rounded-2xl shadow-xl p-4 w-64"
                dir="rtl"
              >
                {/* Year nav inside picker */}
                <div className="flex items-center justify-between mb-3">
                  <button onClick={() => setPickerYear(y => y - 1)} className="h-7 w-7 flex items-center justify-center rounded-lg hover:bg-muted">
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  </button>
                  <span className="text-sm font-bold text-foreground">{pickerYear}</span>
                  <button onClick={() => setPickerYear(y => y + 1)} className="h-7 w-7 flex items-center justify-center rounded-lg hover:bg-muted">
                    <ChevronLeft className="h-4 w-4 text-muted-foreground" />
                  </button>
                </div>
                <div className="grid grid-cols-3 gap-1.5">
                  {MONTH_NAMES.map((label, idx) => {
                    const isSel = idx === selectedMonth && pickerYear === selectedYear;
                    return (
                      <button
                        key={idx}
                        onClick={() => pickMonth(idx)}
                        className={`rounded-xl py-1.5 text-xs font-medium transition-colors ${
                          isSel
                            ? "bg-foreground text-background"
                            : "hover:bg-muted text-foreground"
                        }`}
                      >
                        {label}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Date filter toggle button */}
          <button
            onClick={() => setDateFilterOpen(v => !v)}
            className={`flex items-center gap-2 h-[44px] px-4 rounded-2xl border text-sm font-medium transition-all shadow-sm ${
              hasDateFilter
                ? "bg-foreground text-background border-foreground"
                : "bg-background border-border text-muted-foreground hover:text-foreground hover:bg-muted"
            }`}
          >
            <SlidersHorizontal className="h-4 w-4" />
            {he.financialPage.dateFilter}
            {hasDateFilter && (
              <span
                onClick={(e) => { e.stopPropagation(); setDateFrom(""); setDateTo(""); }}
                className="flex items-center justify-center h-4 w-4 rounded-full bg-card/20 hover:bg-card/40"
              >
                <X className="h-2.5 w-2.5" />
              </span>
            )}
          </button>
        </div>

        {/* Date range filter panel */}
        {dateFilterOpen && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-3 justify-center flex-wrap"
            dir="rtl"
          >
            <div className="flex items-center gap-2 bg-background border border-border rounded-2xl px-4 py-3 shadow-sm">
              <label className="text-xs text-muted-foreground font-medium whitespace-nowrap">{he.financialPage.fromDate}</label>
              <DatePicker value={dateFrom} onChange={setDateFrom} name="dateFrom" placeholder={he.financialPage.fromDate} />
            </div>
            <div className="flex items-center gap-2 bg-background border border-border rounded-2xl px-4 py-3 shadow-sm">
              <label className="text-xs text-muted-foreground font-medium whitespace-nowrap">{he.financialPage.toDate}</label>
              <DatePicker value={dateTo} onChange={setDateTo} name="dateTo" placeholder={he.financialPage.toDate} />
            </div>
            {hasDateFilter && (
              <button
                onClick={() => { setDateFrom(""); setDateTo(""); }}
                className="text-xs text-muted-foreground hover:text-foreground underline underline-offset-2"
              >
                {he.financialPage.clearFilter}
              </button>
            )}
          </motion.div>
        )}
      </motion.div>

      <motion.div
        variants={fadeUp}
        className="grid grid-cols-1 sm:grid-cols-2 gap-3 lg:grid-cols-4"
      >
        {statCards.map((stat) => (
          <Card
            key={stat.label}
            className="glass-card group transition-all duration-300 cursor-default"
          >
            <CardContent className="p-4 flex items-center gap-4">
              <div
                className={`rounded-xl bg-gradient-to-br ${stat.color} p-2.5 shadow-sm transition-transform duration-300`}
              >
                <stat.icon className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
                <p
                  className={`text-2xl font-bold tracking-tight ${stat.textColor}`}
                >
                  {stat.value}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </motion.div>

      <motion.div variants={fadeUp}>
        <Tabs defaultValue="invoices" dir="rtl">
          <TabsList className="bg-muted border border-border">
            <TabsTrigger
              value="invoices"
              className="data-[state=active]:bg-foreground data-[state=active]:text-background transition-all duration-200"
            >
              {he.financial.invoices} ({filteredInvoices.length})
            </TabsTrigger>
            <TabsTrigger
              value="quotes"
              className="data-[state=active]:bg-foreground data-[state=active]:text-background transition-all duration-200"
            >
              {he.financial.quotes} ({filteredQuotes.length})
            </TabsTrigger>
            <TabsTrigger
              value="expenses"
              className="data-[state=active]:bg-foreground data-[state=active]:text-background transition-all duration-200"
            >
              {he.financial.expenses} ({filteredExpenses.length})
            </TabsTrigger>
            <TabsTrigger
              value="subscriptions"
              className="data-[state=active]:bg-foreground data-[state=active]:text-background transition-all duration-200"
            >
              {he.financialPage.fixedExpenses} ({subscriptions.length})
            </TabsTrigger>
          </TabsList>

          {/* ==================== INVOICES TAB ==================== */}
          <TabsContent value="invoices">
            <div className="flex justify-end mb-3">
              <Button
                size="sm"
                onClick={handleCreateInvoice}
                className="bg-foreground text-background hover:bg-foreground/90 shadow-sm transition-all duration-200 border-0"
              >
                <Plus className="h-4 w-4 me-2" />
                {he.financial.newInvoice}
              </Button>
            </div>
            <Card className="glass-card overflow-hidden">
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-border hover:bg-transparent">
                      <TableHead className="text-muted-foreground">
                        {he.financialPage.number}
                      </TableHead>
                      <TableHead className="text-muted-foreground">
                        {he.common.client}
                      </TableHead>
                      <TableHead className="hidden sm:table-cell text-muted-foreground">
                        {he.common.project}
                      </TableHead>
                      <TableHead className="text-muted-foreground">
                        {he.common.status}
                      </TableHead>
                      <TableHead className="text-muted-foreground">
                        {he.financial.total}
                      </TableHead>
                      <TableHead className="hidden sm:table-cell text-muted-foreground">
                        {he.financialPage.dueDate}
                      </TableHead>
                      <TableHead className="w-[60px] text-muted-foreground">
                        {he.common.actions}
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredInvoices.map((inv) => (
                      <TableRow
                        key={inv.id}
                        className="border-border transition-all duration-200 hover:bg-muted/50 group"
                      >
                        <TableCell className="font-medium font-mono text-sm">
                          {inv.invoiceNumber}
                        </TableCell>
                        <TableCell>{inv.client?.name ?? "—"}</TableCell>
                        <TableCell className="hidden sm:table-cell text-muted-foreground">
                          {inv.project?.title ?? "—"}
                        </TableCell>
                        <TableCell>
                          <Badge
                            className={
                              invoiceStatusStyles[inv.status] ??
                              "bg-muted text-muted-foreground border-0"
                            }
                          >
                            {he.financial.invoiceStatuses[
                              inv.status as keyof typeof he.financial.invoiceStatuses
                            ] ?? inv.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-medium">
                          {formatCurrency(inv.total)}
                        </TableCell>
                        <TableCell className="hidden sm:table-cell text-muted-foreground">
                          {formatDate(inv.dueDate)}
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger
                              className="flex h-8 w-8 items-center justify-center rounded-md hover:bg-muted transition-colors duration-200 outline-none"
                            >
                              <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
                            </DropdownMenuTrigger>
                            <DropdownMenuContent
                              align="end"
                              side="bottom"
                              sideOffset={4}
                            >
                              {/* View external link */}
                              {inv.externalLink && (
                                <>
                                  <DropdownMenuItem
                                    onClick={() =>
                                      window.open(
                                        inv.externalLink!,
                                        "_blank",
                                        "noopener",
                                      )
                                    }
                                  >
                                    <ExternalLink className="h-4 w-4" />
                                    <span>{he.financialPage.viewInvoice}</span>
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                </>
                              )}

                              {/* Quick status change sub-menu */}
                              <DropdownMenuSub>
                                <DropdownMenuSubTrigger>
                                  <ArrowRightLeft className="h-4 w-4" />
                                  <span>{he.financialPage.changeStatus}</span>
                                </DropdownMenuSubTrigger>
                                <DropdownMenuSubContent>
                                  {invoiceStatusFlow.map((s) => (
                                    <DropdownMenuItem
                                      key={s.value}
                                      disabled={
                                        inv.status === s.value || isPending
                                      }
                                      onClick={() =>
                                        handleQuickInvoiceStatus(
                                          inv.id,
                                          s.value,
                                        )
                                      }
                                    >
                                      <Badge
                                        className={`${invoiceStatusStyles[s.value]} text-[11px] px-1.5 py-0`}
                                      >
                                        {s.label}
                                      </Badge>
                                      {inv.status === s.value && (
                                        <span className="mr-auto text-xs text-muted-foreground">
                                          {he.financialPage.current}
                                        </span>
                                      )}
                                    </DropdownMenuItem>
                                  ))}
                                </DropdownMenuSubContent>
                              </DropdownMenuSub>

                              <DropdownMenuSeparator />

                              {/* Edit */}
                              <DropdownMenuItem
                                onClick={() => handleEditInvoice(inv)}
                              >
                                <Pencil className="h-4 w-4" />
                                <span>{he.financialPage.editAction}</span>
                              </DropdownMenuItem>

                              {/* Delete */}
                              <DropdownMenuItem
                                variant="destructive"
                                onClick={() => setDeleteInvoiceTarget(inv.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                                <span>{he.financialPage.deleteAction}</span>
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ==================== QUOTES TAB ==================== */}
          <TabsContent value="quotes">
            <Card className="glass-card overflow-hidden">
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-border hover:bg-transparent">
                      <TableHead className="text-muted-foreground">
                        {he.financialPage.number}
                      </TableHead>
                      <TableHead className="text-muted-foreground">
                        {he.common.client}
                      </TableHead>
                      <TableHead className="hidden sm:table-cell text-muted-foreground">
                        {he.common.project}
                      </TableHead>
                      <TableHead className="text-muted-foreground">
                        {he.common.status}
                      </TableHead>
                      <TableHead className="text-muted-foreground">
                        {he.financial.total}
                      </TableHead>
                      <TableHead className="hidden sm:table-cell text-muted-foreground">
                        {he.financialPage.validUntil}
                      </TableHead>
                      <TableHead className="w-[60px] text-muted-foreground">
                        {he.common.actions}
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredQuotes.map((q) => (
                      <TableRow
                        key={q.id}
                        className="border-border transition-all duration-200 hover:bg-muted/50 group"
                      >
                        <TableCell className="font-medium font-mono text-sm">
                          {q.quoteNumber}
                        </TableCell>
                        <TableCell>{q.client.name}</TableCell>
                        <TableCell className="hidden sm:table-cell text-muted-foreground">
                          {q.project?.title ?? "—"}
                        </TableCell>
                        <TableCell>
                          <Badge
                            className={
                              quoteStatusStyles[q.status] ??
                              "bg-muted text-muted-foreground border-0"
                            }
                          >
                            {he.financial.quoteStatuses[
                              q.status as keyof typeof he.financial.quoteStatuses
                            ] ?? q.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-medium">
                          {formatCurrency(q.total)}
                        </TableCell>
                        <TableCell className="hidden sm:table-cell text-muted-foreground">
                          {formatDate(q.validUntil)}
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger
                              className="flex h-8 w-8 items-center justify-center rounded-md hover:bg-muted transition-colors duration-200 outline-none"
                            >
                              <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
                            </DropdownMenuTrigger>
                            <DropdownMenuContent
                              align="end"
                              side="bottom"
                              sideOffset={4}
                            >
                              {/* Quick status change sub-menu */}
                              <DropdownMenuSub>
                                <DropdownMenuSubTrigger>
                                  <ArrowRightLeft className="h-4 w-4" />
                                  <span>{he.financialPage.changeStatus}</span>
                                </DropdownMenuSubTrigger>
                                <DropdownMenuSubContent>
                                  {quoteStatusFlow.map((s) => (
                                    <DropdownMenuItem
                                      key={s.value}
                                      disabled={
                                        q.status === s.value || isPending
                                      }
                                      onClick={() =>
                                        handleQuickQuoteStatus(q.id, s.value)
                                      }
                                    >
                                      <Badge
                                        className={`${quoteStatusStyles[s.value]} text-[11px] px-1.5 py-0`}
                                      >
                                        {s.label}
                                      </Badge>
                                      {q.status === s.value && (
                                        <span className="mr-auto text-xs text-muted-foreground">
                                          {he.financialPage.current}
                                        </span>
                                      )}
                                    </DropdownMenuItem>
                                  ))}
                                </DropdownMenuSubContent>
                              </DropdownMenuSub>

                              <DropdownMenuSeparator />

                              {/* Delete */}
                              <DropdownMenuItem
                                variant="destructive"
                                onClick={() => setDeleteQuoteTarget(q.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                                <span>{he.financialPage.deleteAction}</span>
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ==================== EXPENSES TAB ==================== */}
          <TabsContent value="expenses">
            <div className="flex justify-end mb-3">
              <Button
                size="sm"
                onClick={handleCreateExpense}
                className="bg-foreground text-background hover:bg-foreground/90 shadow-sm transition-all duration-200 border-0"
              >
                <Plus className="h-4 w-4 me-2" />
                {he.financial.newExpense}
              </Button>
            </div>
            <Card className="glass-card overflow-hidden">
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-border hover:bg-transparent">
                      <TableHead className="text-muted-foreground">
                        {he.common.description}
                      </TableHead>
                      <TableHead className="hidden sm:table-cell text-muted-foreground">
                        {he.common.category}
                      </TableHead>
                      <TableHead className="text-muted-foreground">
                        {he.financialExtra.amount}
                      </TableHead>
                      <TableHead className="hidden sm:table-cell text-muted-foreground">
                        {he.common.date}
                      </TableHead>
                      <TableHead className="hidden md:table-cell text-muted-foreground">
                        {he.financialExtra.vendor}
                      </TableHead>
                      <TableHead className="w-[80px] text-muted-foreground">
                        {he.common.actions}
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredExpenses.map((exp) => (
                      <TableRow
                        key={exp.id}
                        className="border-border transition-all duration-200 hover:bg-muted/50 group"
                      >
                        <TableCell className="font-medium">
                          {exp.description}
                        </TableCell>
                        <TableCell className="hidden sm:table-cell">
                          <Badge
                            variant="outline"
                            className="border-border text-muted-foreground"
                          >
                            {he.financial.expenseCategories[
                              exp.category as keyof typeof he.financial.expenseCategories
                            ] ?? exp.category}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-medium text-red-500">
                          {formatCurrency(exp.amount)}
                        </TableCell>
                        <TableCell className="hidden sm:table-cell text-muted-foreground">
                          {formatDate(exp.date)}
                        </TableCell>
                        <TableCell className="hidden md:table-cell text-muted-foreground">
                          {exp.vendor ?? "—"}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1 opacity-100 sm:opacity-0 sm:pointer-events-none sm:group-hover:opacity-100 sm:group-hover:pointer-events-auto transition-opacity duration-200">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 hover:bg-muted hover:text-foreground transition-colors duration-200"
                              onClick={() => handleEditExpense(exp)}
                            >
                              <Pencil className="h-3.5 w-3.5" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 hover:bg-red-50 text-destructive transition-colors duration-200"
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
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ==================== SUBSCRIPTIONS TAB ==================== */}
          <TabsContent value="subscriptions">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm text-muted-foreground">
                {he.subscriptions.totalMonthly}: <span className="font-semibold text-red-500">{formatCurrency(totalMonthlyCost)}</span>
              </p>
              <a
                href="/financials"
                onClick={(e) => { e.preventDefault(); window.location.href = "/subscriptions"; }}
                className="text-xs text-muted-foreground hover:text-foreground underline underline-offset-2 transition-colors"
              >
                {he.financialPage.manageFixedExpenses}
              </a>
            </div>
            <Card className="glass-card overflow-hidden">
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-border hover:bg-transparent">
                      <TableHead className="text-muted-foreground">{he.financialPage.serviceName}</TableHead>
                      <TableHead className="hidden sm:table-cell text-muted-foreground">{he.financialPage.cycle}</TableHead>
                      <TableHead className="text-muted-foreground">{he.financialPage.monthlyCost}</TableHead>
                      <TableHead className="hidden sm:table-cell text-muted-foreground">{he.financialPage.nextBilling}</TableHead>
                      <TableHead className="text-muted-foreground">{he.common.status}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {subscriptions.map((sub) => {
                      const monthlyCost = sub.billingCycle === "yearly" ? sub.amount / 12 : sub.amount;
                      return (
                        <TableRow key={sub.id} className="border-border hover:bg-muted/50">
                          <TableCell className="font-medium flex items-center gap-2">
                            <RefreshCw className="h-3.5 w-3.5 text-muted-foreground" />
                            {sub.serviceName}
                          </TableCell>
                          <TableCell className="hidden sm:table-cell">
                            <Badge variant="outline" className={sub.billingCycle === "yearly" ? "border-purple-200 text-purple-700" : "border-cyan-200 text-cyan-700"}>
                              {sub.billingCycle === "yearly" ? he.subscriptions.cycles.yearly : he.subscriptions.cycles.monthly}
                            </Badge>
                          </TableCell>
                          <TableCell className="font-medium text-red-500">
                            {formatCurrency(monthlyCost)}
                            {sub.billingCycle === "yearly" && (
                              <span className="text-xs text-muted-foreground mr-1">({formatCurrency(sub.amount)}{he.financialPage.perYear})</span>
                            )}
                          </TableCell>
                          <TableCell className="hidden sm:table-cell text-muted-foreground">
                            {formatDate(sub.nextBillingDate)}
                          </TableCell>
                          <TableCell>
                            <Badge className={sub.status === "active" ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 border-0" : "bg-muted text-muted-foreground border-0"}>
                              {sub.status === "active" ? he.subscriptions.statuses.active : he.subscriptions.statuses.cancelled}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                    {subscriptions.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center text-foreground/40 py-8">
                          {he.financialPage.noFixedExpenses}
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
                </div>
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

      {/* Quote dialogs */}
      {deleteQuoteTarget && (
        <DeleteQuoteDialog
          quoteId={deleteQuoteTarget}
          open={!!deleteQuoteTarget}
          onOpenChange={(open) => {
            if (!open) setDeleteQuoteTarget(null);
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

      {/* Document upload dialog */}
      <DocumentUploadDialog
        open={uploadDialogOpen}
        onOpenChange={setUploadDialogOpen}
        clients={clients}
      />
    </motion.div>
  );
}
