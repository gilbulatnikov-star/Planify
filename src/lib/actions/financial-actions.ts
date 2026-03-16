"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db/prisma";

// ============ INVOICE ACTIONS ============

export async function createInvoice(formData: FormData) {
  try {
    const clientId = formData.get("clientId") as string;
    if (!clientId) return { success: false, error: "Client is required" };

    const amountStr = formData.get("amount") as string;
    const amount = amountStr ? parseFloat(amountStr) : NaN;
    if (isNaN(amount)) return { success: false, error: "A valid amount is required" };

    const status = (formData.get("status") as string) || "draft";
    const dateStr = formData.get("date") as string;
    const projectId = (formData.get("projectId") as string) || null;
    const externalLink = (formData.get("externalLink") as string) || null;
    const notes = (formData.get("notes") as string) || null;

    // Auto-generate invoice number
    const count = await prisma.invoice.count();
    const invoiceNumber = `INV-${String(count + 1).padStart(4, "0")}`;

    const tax = amount * 0.17;
    const total = amount + tax;

    await prisma.invoice.create({
      data: {
        invoiceNumber,
        clientId,
        projectId: projectId || undefined,
        status,
        subtotal: amount,
        tax,
        total,
        dueDate: dateStr ? new Date(dateStr) : null,
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
      error: error instanceof Error ? error.message : "Failed to create invoice",
    };
  }
}

export async function updateInvoice(id: string, formData: FormData) {
  try {
    const clientId = formData.get("clientId") as string;
    if (!clientId) return { success: false, error: "Client is required" };

    const amountStr = formData.get("amount") as string;
    const amount = amountStr ? parseFloat(amountStr) : NaN;
    if (isNaN(amount)) return { success: false, error: "A valid amount is required" };

    const status = (formData.get("status") as string) || "draft";
    const dateStr = formData.get("date") as string;
    const projectId = (formData.get("projectId") as string) || null;
    const externalLink = (formData.get("externalLink") as string) || null;
    const notes = (formData.get("notes") as string) || null;

    const tax = amount * 0.17;
    const total = amount + tax;

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

// ============ EXPENSE ACTIONS ============

export async function createExpense(formData: FormData) {
  try {
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

    await prisma.expense.create({
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
      error: error instanceof Error ? error.message : "Failed to create expense",
    };
  }
}

export async function updateExpense(id: string, formData: FormData) {
  try {
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
