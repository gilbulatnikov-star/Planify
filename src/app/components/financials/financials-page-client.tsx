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
  FileText,
  Receipt,
  ChevronDown,
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
  const [editingInvoice, setEditingInvoice] = useState<InvoiceData | null>(null);
  const [deleteInvoiceTarget, setDeleteInvoiceTarget] = useState<string | null>(null);

  // Quote state
  const [deleteQuoteTarget, setDeleteQuoteTarget] = useState<string | null>(null);

  // Expense state
  const [expenseDialogOpen, setExpenseDialogOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<ExpenseData | null>(null);
  const [deleteExpenseTarget, setDeleteExpenseTarget] = useState<string | null>(null);

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
      iconBg: "bg-emerald-500/10",
      iconColor: "text-emerald-600",
      textColor: "text-emerald-600 dark:text-emerald-400",
    },
    {
      label: he.financialPage.openInvoices,
      value: formatCurrency(totalOutstanding),
      icon: Clock,
      iconBg: "bg-amber-500/10",
      iconColor: "text-amber-600",
      textColor: "text-amber-600 dark:text-amber-400",
    },
    {
      label: he.financialPage.expenses,
      value: formatCurrency(totalExpenses),
      icon: MinusCircle,
      iconBg: "bg-red-500/10",
      iconColor: "text-red-500",
      textColor: "text-red-500",
    },
    {
      label: he.financialPage.profitLoss,
      value: formatCurrency(totalRevenue - totalExpenses),
      icon: Wallet,
      iconBg: "bg-foreground/8",
      iconColor: "text-foreground/70",
      textColor: "text-foreground",
    },
  ];

  return (
    <motion.div
      variants={stagger}
      initial="hidden"
      animate="show"
      className="space-y-5"
    >
      {/* ── Header ── */}
      <motion.div variants={fadeUp} className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-[22px] font-extrabold tracking-[-0.03em] text-foreground leading-tight">
            {he.financial.title}
          </h1>
          <p className="text-[11.5px] text-foreground/40 mt-0.5">
            מעקב הכנסות, הוצאות ומסמכים פיננסיים
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {/* Primary: Add new */}
          <DropdownMenu>
            <DropdownMenuTrigger className="inline-flex items-center gap-1.5 h-9 px-3.5 rounded-lg bg-foreground text-background hover:bg-foreground/90 shadow-sm text-[13px] font-medium transition-all duration-200 outline-none">
              <Plus className="h-4 w-4" />
              <span>הוסף</span>
              <ChevronDown className="h-3.5 w-3.5 opacity-60" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" side="bottom" sideOffset={6} className="w-52" dir="rtl">
              <DropdownMenuItem
                onClick={handleCreateInvoice}
                className="flex items-center gap-3 py-2.5 cursor-pointer"
              >
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500/10">
                  <FileText className="h-3.5 w-3.5 text-emerald-600" />
                </div>
                <div>
                  <p className="text-[13px] font-medium">הוספת הכנסה</p>
                  <p className="text-[11px] text-muted-foreground">חשבונית חדשה</p>
                </div>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={handleCreateExpense}
                className="flex items-center gap-3 py-2.5 cursor-pointer"
              >
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-red-500/10">
                  <Receipt className="h-3.5 w-3.5 text-red-500" />
                </div>
                <div>
                  <p className="text-[13px] font-medium">הוספת הוצאה</p>
                  <p className="text-[11px] text-muted-foreground">הוצאה חדשה</p>
                </div>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => { window.location.href = "/subscriptions"; }}
                className="flex items-center gap-3 py-2.5 cursor-pointer"
              >
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-purple-500/10">
                  <RefreshCw className="h-3.5 w-3.5 text-purple-600" />
                </div>
                <div>
                  <p className="text-[13px] font-medium">הוצאה קבועה</p>
                  <p className="text-[11px] text-muted-foreground">מנוי / הוצאה חוזרת</p>
                </div>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => setUploadDialogOpen(true)}
                className="flex items-center gap-3 py-2.5 cursor-pointer"
              >
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-muted">
                  <Upload className="h-3.5 w-3.5 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-[13px] font-medium">{he.financialPage.uploadDocument}</p>
                  <p className="text-[11px] text-muted-foreground">חשבונית, קבלה, PDF</p>
                </div>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </motion.div>

      {/* ── Search + Month Filter row ── */}
      <motion.div variants={fadeUp} className="space-y-3">
        <div className="flex items-center gap-2 flex-wrap" dir="rtl">
          {/* Search */}
          <div className="relative flex-1 min-w-[160px] max-w-xs">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-foreground/30" />
            <input
              placeholder="חיפוש..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border border-border/40 bg-card pr-9 pl-4 py-2 text-[13px] text-foreground placeholder:text-foreground/30 outline-none focus:border-accent/40 focus:ring-1 focus:ring-accent/20 transition-all duration-200"
            />
          </div>

          {/* Month nav */}
          <div className="relative flex items-center gap-0.5 bg-card border border-border/40 rounded-xl px-2 py-1 shadow-sm">
            <button
              onClick={goPrev}
              className="flex h-7 w-7 items-center justify-center rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
            >
              <ChevronRight className="h-3.5 w-3.5" />
            </button>

            <button
              onClick={() => { setPickerOpen(v => !v); setPickerYear(selectedYear); }}
              className="text-[13px] font-semibold text-foreground min-w-[110px] text-center select-none hover:text-accent transition-colors px-1"
            >
              {hasDateFilter ? (
                <span className="text-accent">{he.financialPage.dateFilter}</span>
              ) : (
                `${MONTH_NAMES[selectedMonth]} ${selectedYear}`
              )}
            </button>

            <button
              onClick={goNext}
              className="flex h-7 w-7 items-center justify-center rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
            </button>

            <div className="w-px h-4 bg-border/40 mx-0.5" />
            <button
              onClick={() => { setPickerOpen(v => !v); setPickerYear(selectedYear); }}
              className="flex h-7 w-7 items-center justify-center rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
            >
              <CalendarDays className="h-3.5 w-3.5" />
            </button>

            {/* Month picker popover */}
            {pickerOpen && (
              <div
                ref={pickerRef}
                className="absolute top-full mt-2 right-0 z-50 bg-popover border border-border rounded-2xl shadow-xl p-4 w-60"
                dir="rtl"
              >
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
                          isSel ? "bg-foreground text-background" : "hover:bg-muted text-foreground"
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

          {/* Date range filter toggle */}
          <button
            onClick={() => setDateFilterOpen(v => !v)}
            className={`flex items-center gap-1.5 h-[36px] px-3 rounded-xl border text-[13px] font-medium transition-all shadow-sm ${
              hasDateFilter
                ? "bg-foreground text-background border-foreground"
                : "bg-card border-border/40 text-muted-foreground hover:text-foreground hover:bg-muted"
            }`}
          >
            <SlidersHorizontal className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">{he.financialPage.dateFilter}</span>
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

        {/* Date range panel */}
        {dateFilterOpen && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-3 flex-wrap"
            dir="rtl"
          >
            <div className="flex items-center gap-2 bg-card border border-border/40 rounded-xl px-3 py-2.5 shadow-sm">
              <label className="text-xs text-muted-foreground font-medium whitespace-nowrap">{he.financialPage.fromDate}</label>
              <DatePicker value={dateFrom} onChange={setDateFrom} name="dateFrom" placeholder={he.financialPage.fromDate} />
            </div>
            <div className="flex items-center gap-2 bg-card border border-border/40 rounded-xl px-3 py-2.5 shadow-sm">
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

      {/* ── Summary cards — 2 cols on mobile, 4 on desktop ── */}
      <motion.div
        variants={fadeUp}
        className="grid grid-cols-2 gap-2.5 lg:grid-cols-4"
      >
        {statCards.map((stat) => (
          <Card
            key={stat.label}
            className="glass-card transition-all duration-300 cursor-default"
          >
            <CardContent className="p-3.5 flex items-center gap-3">
              <div className={`rounded-xl ${stat.iconBg} p-2 shrink-0`}>
                <stat.icon className={`h-4 w-4 ${stat.iconColor}`} />
              </div>
              <div className="min-w-0">
                <p className="text-[11px] text-muted-foreground truncate">{stat.label}</p>
                <p className={`text-base font-bold tracking-tight leading-tight ${stat.textColor}`}>
                  {stat.value}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </motion.div>

      {/* ── Tabs ── */}
      <motion.div variants={fadeUp}>
        <Tabs defaultValue="invoices" dir="rtl">
          <TabsList className="bg-muted border border-border/50 h-9">
            <TabsTrigger
              value="invoices"
              className="text-[13px] h-7 data-[state=active]:bg-foreground data-[state=active]:text-background transition-all duration-200"
            >
              {he.financial.invoices} ({filteredInvoices.length})
            </TabsTrigger>
            <TabsTrigger
              value="quotes"
              className="text-[13px] h-7 data-[state=active]:bg-foreground data-[state=active]:text-background transition-all duration-200"
            >
              {he.financial.quotes} ({filteredQuotes.length})
            </TabsTrigger>
            <TabsTrigger
              value="expenses"
              className="text-[13px] h-7 data-[state=active]:bg-foreground data-[state=active]:text-background transition-all duration-200"
            >
              {he.financial.expenses} ({filteredExpenses.length})
            </TabsTrigger>
            <TabsTrigger
              value="subscriptions"
              className="text-[13px] h-7 data-[state=active]:bg-foreground data-[state=active]:text-background transition-all duration-200"
            >
              {he.financialPage.fixedExpenses}
            </TabsTrigger>
          </TabsList>

          {/* ── INVOICES ── */}
          <TabsContent value="invoices" className="mt-3">
            {filteredInvoices.length === 0 ? (
              <EmptyState label="אין חשבוניות בתקופה זו" onAdd={handleCreateInvoice} addLabel="חשבונית חדשה" />
            ) : (
              <>
                {/* Mobile cards */}
                <div className="sm:hidden space-y-2">
                  {filteredInvoices.map((inv) => (
                    <div key={inv.id} className="bg-card border border-border/50 rounded-2xl p-3.5 flex items-center gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge className={`text-[10px] px-1.5 py-0 ${invoiceStatusStyles[inv.status] ?? "bg-muted text-muted-foreground border-0"}`}>
                            {he.financial.invoiceStatuses[inv.status as keyof typeof he.financial.invoiceStatuses] ?? inv.status}
                          </Badge>
                          <span className="text-[11px] text-muted-foreground font-mono">{inv.invoiceNumber}</span>
                        </div>
                        <p className="text-[13px] font-semibold text-foreground truncate">{inv.client?.name ?? "—"}</p>
                        {inv.dueDate && (
                          <p className="text-[11px] text-muted-foreground mt-0.5">{formatDate(inv.dueDate)}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-[15px] font-bold text-foreground">{formatCurrency(inv.total)}</span>
                        <InvoiceActionMenu
                          inv={inv}
                          he={he}
                          invoiceStatusFlow={invoiceStatusFlow}
                          invoiceStatusStyles={invoiceStatusStyles}
                          isPending={isPending}
                          onEdit={() => handleEditInvoice(inv)}
                          onDelete={() => setDeleteInvoiceTarget(inv.id)}
                          onStatus={(s) => handleQuickInvoiceStatus(inv.id, s)}
                        />
                      </div>
                    </div>
                  ))}
                </div>

                {/* Desktop table */}
                <Card className="glass-card overflow-hidden hidden sm:block">
                  <CardContent className="p-0">
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow className="border-border hover:bg-transparent">
                            <TableHead className="text-muted-foreground text-xs">{he.financialPage.number}</TableHead>
                            <TableHead className="text-muted-foreground text-xs">{he.common.client}</TableHead>
                            <TableHead className="hidden md:table-cell text-muted-foreground text-xs">{he.common.project}</TableHead>
                            <TableHead className="text-muted-foreground text-xs">{he.common.status}</TableHead>
                            <TableHead className="text-muted-foreground text-xs">{he.financial.total}</TableHead>
                            <TableHead className="hidden md:table-cell text-muted-foreground text-xs">{he.financialPage.dueDate}</TableHead>
                            <TableHead className="w-[50px]" />
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {filteredInvoices.map((inv) => (
                            <TableRow key={inv.id} className="border-border transition-all duration-200 hover:bg-muted/50 group">
                              <TableCell className="font-medium font-mono text-sm">{inv.invoiceNumber}</TableCell>
                              <TableCell className="text-sm">{inv.client?.name ?? "—"}</TableCell>
                              <TableCell className="hidden md:table-cell text-muted-foreground text-sm">{inv.project?.title ?? "—"}</TableCell>
                              <TableCell>
                                <Badge className={invoiceStatusStyles[inv.status] ?? "bg-muted text-muted-foreground border-0"}>
                                  {he.financial.invoiceStatuses[inv.status as keyof typeof he.financial.invoiceStatuses] ?? inv.status}
                                </Badge>
                              </TableCell>
                              <TableCell className="font-semibold text-sm">{formatCurrency(inv.total)}</TableCell>
                              <TableCell className="hidden md:table-cell text-muted-foreground text-sm">{formatDate(inv.dueDate)}</TableCell>
                              <TableCell>
                                <InvoiceActionMenu
                                  inv={inv}
                                  he={he}
                                  invoiceStatusFlow={invoiceStatusFlow}
                                  invoiceStatusStyles={invoiceStatusStyles}
                                  isPending={isPending}
                                  onEdit={() => handleEditInvoice(inv)}
                                  onDelete={() => setDeleteInvoiceTarget(inv.id)}
                                  onStatus={(s) => handleQuickInvoiceStatus(inv.id, s)}
                                />
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </CardContent>
                </Card>
              </>
            )}
          </TabsContent>

          {/* ── QUOTES ── */}
          <TabsContent value="quotes" className="mt-3">
            {filteredQuotes.length === 0 ? (
              <EmptyState label="אין הצעות מחיר בתקופה זו" />
            ) : (
              <>
                {/* Mobile cards */}
                <div className="sm:hidden space-y-2">
                  {filteredQuotes.map((q) => (
                    <div key={q.id} className="bg-card border border-border/50 rounded-2xl p-3.5 flex items-center gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge className={`text-[10px] px-1.5 py-0 ${quoteStatusStyles[q.status] ?? "bg-muted text-muted-foreground border-0"}`}>
                            {he.financial.quoteStatuses[q.status as keyof typeof he.financial.quoteStatuses] ?? q.status}
                          </Badge>
                          <span className="text-[11px] text-muted-foreground font-mono">{q.quoteNumber}</span>
                        </div>
                        <p className="text-[13px] font-semibold text-foreground truncate">{q.client.name}</p>
                        {q.validUntil && (
                          <p className="text-[11px] text-muted-foreground mt-0.5">{formatDate(q.validUntil)}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-[15px] font-bold text-foreground">{formatCurrency(q.total)}</span>
                        <QuoteActionMenu
                          q={q}
                          he={he}
                          quoteStatusFlow={quoteStatusFlow}
                          quoteStatusStyles={quoteStatusStyles}
                          isPending={isPending}
                          onDelete={() => setDeleteQuoteTarget(q.id)}
                          onStatus={(s) => handleQuickQuoteStatus(q.id, s)}
                        />
                      </div>
                    </div>
                  ))}
                </div>

                {/* Desktop table */}
                <Card className="glass-card overflow-hidden hidden sm:block">
                  <CardContent className="p-0">
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow className="border-border hover:bg-transparent">
                            <TableHead className="text-muted-foreground text-xs">{he.financialPage.number}</TableHead>
                            <TableHead className="text-muted-foreground text-xs">{he.common.client}</TableHead>
                            <TableHead className="hidden md:table-cell text-muted-foreground text-xs">{he.common.project}</TableHead>
                            <TableHead className="text-muted-foreground text-xs">{he.common.status}</TableHead>
                            <TableHead className="text-muted-foreground text-xs">{he.financial.total}</TableHead>
                            <TableHead className="hidden md:table-cell text-muted-foreground text-xs">{he.financialPage.validUntil}</TableHead>
                            <TableHead className="w-[50px]" />
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {filteredQuotes.map((q) => (
                            <TableRow key={q.id} className="border-border transition-all duration-200 hover:bg-muted/50 group">
                              <TableCell className="font-medium font-mono text-sm">{q.quoteNumber}</TableCell>
                              <TableCell className="text-sm">{q.client.name}</TableCell>
                              <TableCell className="hidden md:table-cell text-muted-foreground text-sm">{q.project?.title ?? "—"}</TableCell>
                              <TableCell>
                                <Badge className={quoteStatusStyles[q.status] ?? "bg-muted text-muted-foreground border-0"}>
                                  {he.financial.quoteStatuses[q.status as keyof typeof he.financial.quoteStatuses] ?? q.status}
                                </Badge>
                              </TableCell>
                              <TableCell className="font-semibold text-sm">{formatCurrency(q.total)}</TableCell>
                              <TableCell className="hidden md:table-cell text-muted-foreground text-sm">{formatDate(q.validUntil)}</TableCell>
                              <TableCell>
                                <QuoteActionMenu
                                  q={q}
                                  he={he}
                                  quoteStatusFlow={quoteStatusFlow}
                                  quoteStatusStyles={quoteStatusStyles}
                                  isPending={isPending}
                                  onDelete={() => setDeleteQuoteTarget(q.id)}
                                  onStatus={(s) => handleQuickQuoteStatus(q.id, s)}
                                />
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </CardContent>
                </Card>
              </>
            )}
          </TabsContent>

          {/* ── EXPENSES ── */}
          <TabsContent value="expenses" className="mt-3">
            {filteredExpenses.length === 0 ? (
              <EmptyState label="אין הוצאות בתקופה זו" onAdd={handleCreateExpense} addLabel="הוצאה חדשה" />
            ) : (
              <>
                {/* Mobile cards */}
                <div className="sm:hidden space-y-2">
                  {filteredExpenses.map((exp) => (
                    <div key={exp.id} className="bg-card border border-border/50 rounded-2xl p-3.5 flex items-center gap-3">
                      <div className="flex-1 min-w-0">
                        <p className="text-[13px] font-semibold text-foreground truncate">{exp.description}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline" className="text-[10px] px-1.5 py-0 border-border text-muted-foreground">
                            {he.financial.expenseCategories[exp.category as keyof typeof he.financial.expenseCategories] ?? exp.category}
                          </Badge>
                          <span className="text-[11px] text-muted-foreground">{formatDate(exp.date)}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-[15px] font-bold text-red-500">{formatCurrency(exp.amount)}</span>
                        <DropdownMenu>
                          <DropdownMenuTrigger className="flex h-7 w-7 items-center justify-center rounded-lg hover:bg-muted transition-colors outline-none">
                            <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" sideOffset={4}>
                            <DropdownMenuItem onClick={() => handleEditExpense(exp)}>
                              <Pencil className="h-4 w-4" />
                              <span>{he.financialPage.editAction}</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem variant="destructive" onClick={() => setDeleteExpenseTarget(exp.id)}>
                              <Trash2 className="h-4 w-4" />
                              <span>{he.financialPage.deleteAction}</span>
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Desktop table */}
                <Card className="glass-card overflow-hidden hidden sm:block">
                  <CardContent className="p-0">
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow className="border-border hover:bg-transparent">
                            <TableHead className="text-muted-foreground text-xs">{he.common.description}</TableHead>
                            <TableHead className="hidden md:table-cell text-muted-foreground text-xs">{he.common.category}</TableHead>
                            <TableHead className="text-muted-foreground text-xs">{he.financialExtra.amount}</TableHead>
                            <TableHead className="hidden md:table-cell text-muted-foreground text-xs">{he.common.date}</TableHead>
                            <TableHead className="hidden lg:table-cell text-muted-foreground text-xs">{he.financialExtra.vendor}</TableHead>
                            <TableHead className="w-[70px]" />
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {filteredExpenses.map((exp) => (
                            <TableRow key={exp.id} className="border-border transition-all duration-200 hover:bg-muted/50 group">
                              <TableCell className="font-medium text-sm">{exp.description}</TableCell>
                              <TableCell className="hidden md:table-cell">
                                <Badge variant="outline" className="border-border text-muted-foreground text-xs">
                                  {he.financial.expenseCategories[exp.category as keyof typeof he.financial.expenseCategories] ?? exp.category}
                                </Badge>
                              </TableCell>
                              <TableCell className="font-semibold text-red-500 text-sm">{formatCurrency(exp.amount)}</TableCell>
                              <TableCell className="hidden md:table-cell text-muted-foreground text-sm">{formatDate(exp.date)}</TableCell>
                              <TableCell className="hidden lg:table-cell text-muted-foreground text-sm">{exp.vendor ?? "—"}</TableCell>
                              <TableCell>
                                <div className="flex items-center gap-1 opacity-100 sm:opacity-0 sm:pointer-events-none sm:group-hover:opacity-100 sm:group-hover:pointer-events-auto transition-opacity duration-200">
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-7 w-7 hover:bg-muted hover:text-foreground"
                                    onClick={() => handleEditExpense(exp)}
                                  >
                                    <Pencil className="h-3.5 w-3.5" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-7 w-7 hover:bg-red-50 text-destructive"
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
              </>
            )}
          </TabsContent>

          {/* ── SUBSCRIPTIONS ── */}
          <TabsContent value="subscriptions" className="mt-3">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm text-muted-foreground">
                {he.subscriptions.totalMonthly}: <span className="font-semibold text-red-500">{formatCurrency(totalMonthlyCost)}</span>
              </p>
              <a
                href="/subscriptions"
                onClick={(e) => { e.preventDefault(); window.location.href = "/subscriptions"; }}
                className="text-xs text-muted-foreground hover:text-foreground underline underline-offset-2 transition-colors"
              >
                {he.financialPage.manageFixedExpenses}
              </a>
            </div>

            {/* Mobile cards */}
            <div className="sm:hidden space-y-2">
              {subscriptions.map((sub) => {
                const monthlyCost = sub.billingCycle === "yearly" ? sub.amount / 12 : sub.amount;
                return (
                  <div key={sub.id} className="bg-card border border-border/50 rounded-2xl p-3.5 flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-muted shrink-0">
                      <RefreshCw className="h-3.5 w-3.5 text-muted-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] font-semibold text-foreground truncate">{sub.serviceName}</p>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <Badge variant="outline" className={`text-[10px] px-1.5 py-0 ${sub.billingCycle === "yearly" ? "border-purple-200 text-purple-700" : "border-cyan-200 text-cyan-700"}`}>
                          {sub.billingCycle === "yearly" ? he.subscriptions.cycles.yearly : he.subscriptions.cycles.monthly}
                        </Badge>
                        <Badge className={`text-[10px] px-1.5 py-0 ${sub.status === "active" ? "bg-emerald-50 text-emerald-700 border-0" : "bg-muted text-muted-foreground border-0"}`}>
                          {sub.status === "active" ? he.subscriptions.statuses.active : he.subscriptions.statuses.cancelled}
                        </Badge>
                      </div>
                    </div>
                    <div className="shrink-0 text-right">
                      <p className="text-[14px] font-bold text-red-500">{formatCurrency(monthlyCost)}</p>
                      {sub.billingCycle === "yearly" && (
                        <p className="text-[10px] text-muted-foreground">{formatCurrency(sub.amount)}{he.financialPage.perYear}</p>
                      )}
                    </div>
                  </div>
                );
              })}
              {subscriptions.length === 0 && (
                <div className="text-center py-10 text-foreground/40 text-sm">{he.financialPage.noFixedExpenses}</div>
              )}
            </div>

            {/* Desktop table */}
            <Card className="glass-card overflow-hidden hidden sm:block">
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-border hover:bg-transparent">
                        <TableHead className="text-muted-foreground text-xs">{he.financialPage.serviceName}</TableHead>
                        <TableHead className="hidden md:table-cell text-muted-foreground text-xs">{he.financialPage.cycle}</TableHead>
                        <TableHead className="text-muted-foreground text-xs">{he.financialPage.monthlyCost}</TableHead>
                        <TableHead className="hidden md:table-cell text-muted-foreground text-xs">{he.financialPage.nextBilling}</TableHead>
                        <TableHead className="text-muted-foreground text-xs">{he.common.status}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {subscriptions.map((sub) => {
                        const monthlyCost = sub.billingCycle === "yearly" ? sub.amount / 12 : sub.amount;
                        return (
                          <TableRow key={sub.id} className="border-border hover:bg-muted/50">
                            <TableCell className="font-medium text-sm flex items-center gap-2">
                              <RefreshCw className="h-3.5 w-3.5 text-muted-foreground" />
                              {sub.serviceName}
                            </TableCell>
                            <TableCell className="hidden md:table-cell">
                              <Badge variant="outline" className={sub.billingCycle === "yearly" ? "border-purple-200 text-purple-700" : "border-cyan-200 text-cyan-700"}>
                                {sub.billingCycle === "yearly" ? he.subscriptions.cycles.yearly : he.subscriptions.cycles.monthly}
                              </Badge>
                            </TableCell>
                            <TableCell className="font-semibold text-red-500 text-sm">
                              {formatCurrency(monthlyCost)}
                              {sub.billingCycle === "yearly" && (
                                <span className="text-xs text-muted-foreground mr-1">({formatCurrency(sub.amount)}{he.financialPage.perYear})</span>
                              )}
                            </TableCell>
                            <TableCell className="hidden md:table-cell text-muted-foreground text-sm">{formatDate(sub.nextBillingDate)}</TableCell>
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

      {/* ── Dialogs ── */}
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
          onOpenChange={(open) => { if (!open) setDeleteInvoiceTarget(null); }}
        />
      )}
      {deleteQuoteTarget && (
        <DeleteQuoteDialog
          quoteId={deleteQuoteTarget}
          open={!!deleteQuoteTarget}
          onOpenChange={(open) => { if (!open) setDeleteQuoteTarget(null); }}
        />
      )}
      <ExpenseDialog
        expense={editingExpense}
        open={expenseDialogOpen}
        onOpenChange={setExpenseDialogOpen}
      />
      {deleteExpenseTarget && (
        <DeleteExpenseDialog
          expenseId={deleteExpenseTarget}
          open={!!deleteExpenseTarget}
          onOpenChange={(open) => { if (!open) setDeleteExpenseTarget(null); }}
        />
      )}
      <DocumentUploadDialog
        open={uploadDialogOpen}
        onOpenChange={setUploadDialogOpen}
        clients={clients}
      />
    </motion.div>
  );
}

// ── Helpers ──

function EmptyState({ label, onAdd, addLabel }: { label: string; onAdd?: () => void; addLabel?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-14 gap-3 text-center">
      <p className="text-sm text-foreground/40">{label}</p>
      {onAdd && addLabel && (
        <button
          onClick={onAdd}
          className="flex items-center gap-1.5 text-sm text-accent hover:text-accent/80 underline underline-offset-2 transition-colors"
        >
          <Plus className="h-3.5 w-3.5" />
          {addLabel}
        </button>
      )}
    </div>
  );
}

function InvoiceActionMenu({
  inv,
  he,
  invoiceStatusFlow,
  invoiceStatusStyles,
  isPending,
  onEdit,
  onDelete,
  onStatus,
}: {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  inv: any; he: any; invoiceStatusFlow: any[]; invoiceStatusStyles: Record<string, string>;
  isPending: boolean; onEdit: () => void; onDelete: () => void; onStatus: (s: string) => void;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex h-7 w-7 items-center justify-center rounded-lg hover:bg-muted transition-colors outline-none">
        <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" sideOffset={4}>
        {inv.externalLink && (
          <>
            <DropdownMenuItem onClick={() => window.open(inv.externalLink!, "_blank", "noopener")}>
              <ExternalLink className="h-4 w-4" />
              <span>{he.financialPage.viewInvoice}</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
          </>
        )}
        <DropdownMenuSub>
          <DropdownMenuSubTrigger>
            <ArrowRightLeft className="h-4 w-4" />
            <span>{he.financialPage.changeStatus}</span>
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent>
            {invoiceStatusFlow.map((s) => (
              <DropdownMenuItem
                key={s.value}
                disabled={inv.status === s.value || isPending}
                onClick={() => onStatus(s.value)}
              >
                <Badge className={`${invoiceStatusStyles[s.value]} text-[11px] px-1.5 py-0`}>{s.label}</Badge>
                {inv.status === s.value && <span className="mr-auto text-xs text-muted-foreground">{he.financialPage.current}</span>}
              </DropdownMenuItem>
            ))}
          </DropdownMenuSubContent>
        </DropdownMenuSub>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={onEdit}>
          <Pencil className="h-4 w-4" />
          <span>{he.financialPage.editAction}</span>
        </DropdownMenuItem>
        <DropdownMenuItem variant="destructive" onClick={onDelete}>
          <Trash2 className="h-4 w-4" />
          <span>{he.financialPage.deleteAction}</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function QuoteActionMenu({
  q,
  he,
  quoteStatusFlow,
  quoteStatusStyles,
  isPending,
  onDelete,
  onStatus,
}: {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  q: any; he: any; quoteStatusFlow: any[]; quoteStatusStyles: Record<string, string>;
  isPending: boolean; onDelete: () => void; onStatus: (s: string) => void;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex h-7 w-7 items-center justify-center rounded-lg hover:bg-muted transition-colors outline-none">
        <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" sideOffset={4}>
        <DropdownMenuSub>
          <DropdownMenuSubTrigger>
            <ArrowRightLeft className="h-4 w-4" />
            <span>{he.financialPage.changeStatus}</span>
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent>
            {quoteStatusFlow.map((s) => (
              <DropdownMenuItem
                key={s.value}
                disabled={q.status === s.value || isPending}
                onClick={() => onStatus(s.value)}
              >
                <Badge className={`${quoteStatusStyles[s.value]} text-[11px] px-1.5 py-0`}>{s.label}</Badge>
                {q.status === s.value && <span className="mr-auto text-xs text-muted-foreground">{he.financialPage.current}</span>}
              </DropdownMenuItem>
            ))}
          </DropdownMenuSubContent>
        </DropdownMenuSub>
        <DropdownMenuSeparator />
        <DropdownMenuItem variant="destructive" onClick={onDelete}>
          <Trash2 className="h-4 w-4" />
          <span>{he.financialPage.deleteAction}</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
