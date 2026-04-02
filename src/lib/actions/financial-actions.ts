"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db/prisma";
import { auth } from "@/auth";

const VALID_INVOICE_STATUSES = ["draft", "sent", "paid", "overdue", "cancelled"] as const;
const VALID_QUOTE_STATUSES   = ["draft", "sent", "accepted", "rejected", "expired"] as const;

// ============ INVOICE ACTIONS ============

export async function createInvoice(formData: FormData) {
  try {
    // ── Auth first ────────────────────────────────────────────────────────────
    const session = await auth();
    const userId = session?.user?.id;
    if (!userId) return { success: false, error: "Not authenticated" };

    const clientId = (formData.get("clientId") as string) || undefined;

    const amountStr = formData.get("amount") as string;
    const amount = amountStr ? parseFloat(amountStr) : NaN;
    if (isNaN(amount) || amount < 0 || amount > 10_000_000) return { success: false, error: "A valid amount is required" };

    const rawStatus = (formData.get("status") as string) || "draft";
    const status = VALID_INVOICE_STATUSES.includes(rawStatus as typeof VALID_INVOICE_STATUSES[number])
      ? rawStatus : "draft";

    const dateStr = formData.get("date") as string;
    const projectId = (formData.get("projectId") as string) || undefined;
    const externalLink = (formData.get("externalLink") as string) || null;
    const notes = ((formData.get("notes") as string) || null)?.slice(0, 2000) ?? null;

    // Auto-generate invoice number scoped to user (use max existing number to avoid duplicates)
    const lastInvoice = await prisma.invoice.findFirst({
      where: { userId: userId ?? undefined },
      orderBy: { createdAt: "desc" },
      select: { invoiceNumber: true },
    });
    const lastNum = lastInvoice?.invoiceNumber
      ? parseInt(lastInvoice.invoiceNumber.replace(/\D/g, ""), 10) || 0
      : 0;
    const invoiceNumber = `INV-${String(lastNum + 1).padStart(4, "0")}`;

    const includeVat = formData.get("includeVat") === "1";
    const tax = includeVat ? amount * 0.18 : 0;
    const total = amount + tax;

    await prisma.invoice.create({
      data: {
        invoiceNumber,
        clientId,
        projectId,
        status,
        subtotal: amount,
        tax,
        total,
        dueDate: dateStr ? new Date(dateStr) : null,
        paidAt: status === "paid" ? new Date() : null,
        externalLink,
        notes,
        userId: userId ?? undefined,
      },
    });

    revalidatePath("/financials");
    revalidatePath("/");
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create invoice",
    };
  }
}

export async function updateInvoice(id: string, formData: FormData) {
  try {
    const session = await auth();
    const userId = session?.user?.id;
    if (!userId) return { success: false, error: "Not authenticated" };

    const clientId = (formData.get("clientId") as string) || null;

    const amountStr = formData.get("amount") as string;
    const amount = amountStr ? parseFloat(amountStr) : NaN;
    if (isNaN(amount) || amount < 0 || amount > 10_000_000) return { success: false, error: "A valid amount is required" };

    const rawStatus = (formData.get("status") as string) || "draft";
    const status = VALID_INVOICE_STATUSES.includes(rawStatus as typeof VALID_INVOICE_STATUSES[number])
      ? rawStatus : "draft";
    const dateStr = formData.get("date") as string;
    const projectId = (formData.get("projectId") as string) || null;
    const externalLink = (formData.get("externalLink") as string) || null;
    const notes = (formData.get("notes") as string) || null;

    const includeVat = formData.get("includeVat") === "1";
    const tax = includeVat ? amount * 0.18 : 0;
    const total = amount + tax;

    const existing = await prisma.invoice.findFirst({ where: { id, userId } });
    if (!existing) return { success: false, error: "Not found" };

    await prisma.invoice.update({
      where: { id },
      data: {
        clientId,
        projectId: projectId || null,
        status,
        subtotal: amount,
        tax,
        total,
        dueDate: dateStr ? new Date(dateStr) : null,
        paidAt: status === "paid" ? new Date() : null,
        externalLink,
        notes,
      },
    });

    revalidatePath("/financials");
    revalidatePath("/");
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update invoice",
    };
  }
}

export async function deleteInvoice(id: string) {
  try {
    const session = await auth();
    const userId = session?.user?.id;
    if (!userId) return { success: false, error: "Not authenticated" };

    const existing = await prisma.invoice.findFirst({ where: { id, userId } });
    if (!existing) return { success: false, error: "Not found" };

    // Delete related items first
    await prisma.invoiceItem.deleteMany({ where: { invoiceId: id } });
    await prisma.invoice.delete({ where: { id } });

    revalidatePath("/financials");
    revalidatePath("/");
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to delete invoice",
    };
  }
}

export async function updateInvoiceStatus(id: string, status: string) {
  try {
    const session = await auth();
    const userId = session?.user?.id;
    if (!userId) return { success: false, error: "Not authenticated" };

    if (!VALID_INVOICE_STATUSES.includes(status as typeof VALID_INVOICE_STATUSES[number])) {
      return { success: false, error: "Invalid status" };
    }

    const existing = await prisma.invoice.findFirst({ where: { id, userId } });
    if (!existing) return { success: false, error: "Not found" };

    await prisma.invoice.update({
      where: { id },
      data: {
        status,
        paidAt: status === "paid" ? new Date() : null,
      },
    });

    revalidatePath("/financials");
    revalidatePath("/");
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update status",
    };
  }
}

// ============ QUOTE ACTIONS ============

export async function updateQuoteStatus(id: string, status: string) {
  try {
    const session = await auth();
    const userId = session?.user?.id;
    if (!userId) return { success: false, error: "Not authenticated" };

    if (!VALID_QUOTE_STATUSES.includes(status as typeof VALID_QUOTE_STATUSES[number])) {
      return { success: false, error: "Invalid status" };
    }

    const existing = await prisma.quote.findFirst({ where: { id, userId } });
    if (!existing) return { success: false, error: "Not found" };

    await prisma.quote.update({
      where: { id },
      data: { status },
    });

    revalidatePath("/financials");
    revalidatePath("/");
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update status",
    };
  }
}

export async function deleteQuote(id: string) {
  try {
    const session = await auth();
    const userId = session?.user?.id;
    if (!userId) return { success: false, error: "Not authenticated" };

    const existing = await prisma.quote.findFirst({ where: { id, userId } });
    if (!existing) return { success: false, error: "Not found" };

    await prisma.quoteItem.deleteMany({ where: { quoteId: id } });
    await prisma.quote.delete({ where: { id } });

    revalidatePath("/financials");
    revalidatePath("/");
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to delete quote",
    };
  }
}

// ============ EXPENSE ACTIONS ============

export async function createExpense(formData: FormData) {
  try {
    // ── Auth first ──────────────────────────────────────────────────────────
    const session = await auth();
    const userId = session?.user?.id;
    if (!userId) return { success: false, error: "Not authenticated" };

    const description = ((formData.get("description") as string) || "").slice(0, 500);
    if (!description.trim()) {
      return { success: false, error: "Description is required" };
    }

    const category = ((formData.get("category") as string) || "").slice(0, 100);
    if (!category.trim()) {
      return { success: false, error: "Category is required" };
    }

    const amountStr = formData.get("amount") as string;
    const amount = amountStr ? parseFloat(amountStr) : NaN;
    if (isNaN(amount) || amount < 0 || amount > 10_000_000) {
      return { success: false, error: "A valid amount is required" };
    }

    const dateStr = formData.get("date") as string;
    if (!dateStr) {
      return { success: false, error: "Date is required" };
    }

    await prisma.expense.create({
      data: {
        description,
        category,
        amount,
        date: new Date(dateStr),
        vendor: ((formData.get("vendor") as string) || null)?.slice(0, 200) ?? null,
        receiptUrl: (formData.get("receiptUrl") as string) || null,
        notes: ((formData.get("notes") as string) || null)?.slice(0, 2000) ?? null,
        userId,
      },
    });

    revalidatePath("/financials");
    revalidatePath("/");
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create expense",
    };
  }
}

export async function updateExpense(id: string, formData: FormData) {
  try {
    const session = await auth();
    const userId = session?.user?.id;
    if (!userId) return { success: false, error: "Not authenticated" };

    const description = formData.get("description") as string;
    if (!description) {
      return { success: false, error: "Description is required" };
    }

    const category = formData.get("category") as string;
    if (!category) {
      return { success: false, error: "Category is required" };
    }

    const amountStr = formData.get("amount") as string;
    const amount = amountStr ? parseFloat(amountStr) : NaN;
    if (isNaN(amount)) {
      return { success: false, error: "A valid amount is required" };
    }

    const dateStr = formData.get("date") as string;
    if (!dateStr) {
      return { success: false, error: "Date is required" };
    }

    const existing = await prisma.expense.findFirst({ where: { id, userId } });
    if (!existing) return { success: false, error: "Not found" };

    await prisma.expense.update({
      where: { id },
      data: {
        description,
        category,
        amount,
        date: new Date(dateStr),
        vendor: (formData.get("vendor") as string) || null,
        notes: (formData.get("notes") as string) || null,
      },
    });

    revalidatePath("/financials");
    revalidatePath("/");
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update expense",
    };
  }
}

export async function deleteExpense(id: string) {
  try {
    const session = await auth();
    const userId = session?.user?.id;
    if (!userId) return { success: false, error: "Not authenticated" };

    const existing = await prisma.expense.findFirst({ where: { id, userId } });
    if (!existing) return { success: false, error: "Not found" };

    await prisma.expense.delete({
      where: { id },
    });

    revalidatePath("/financials");
    revalidatePath("/");
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to delete expense",
    };
  }
}
