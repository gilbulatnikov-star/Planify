"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db/prisma";

export async function createSubscription(formData: FormData) {
  try {
    const serviceName = formData.get("serviceName") as string;
    if (!serviceName) {
      return { success: false, error: "Service name is required" };
    }

    const amountStr = formData.get("amount") as string;
    const amount = amountStr ? parseFloat(amountStr) : 0;
    if (isNaN(amount) || amount <= 0) {
      return { success: false, error: "Valid amount is required" };
    }

    const billingCycle = (formData.get("billingCycle") as string) || "monthly";
    const status = (formData.get("status") as string) || "active";
    const nextBillingDateStr = formData.get("nextBillingDate") as string;
    const notes = (formData.get("notes") as string) || null;

    await prisma.subscription.create({
      data: {
        serviceName,
        billingCycle,
        amount,
        nextBillingDate: nextBillingDateStr
          ? new Date(nextBillingDateStr)
          : null,
        status,
        notes,
      },
    });

    revalidatePath("/subscriptions");
    revalidatePath("/");
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to create subscription",
    };
  }
}

export async function updateSubscription(id: string, formData: FormData) {
  try {
    const serviceName = formData.get("serviceName") as string;
    if (!serviceName) {
      return { success: false, error: "Service name is required" };
    }

    const amountStr = formData.get("amount") as string;
    const amount = amountStr ? parseFloat(amountStr) : 0;
    if (isNaN(amount) || amount <= 0) {
      return { success: false, error: "Valid amount is required" };
    }

    const billingCycle = (formData.get("billingCycle") as string) || "monthly";
    const status = (formData.get("status") as string) || "active";
    const nextBillingDateStr = formData.get("nextBillingDate") as string;
    const notes = (formData.get("notes") as string) || null;

    await prisma.subscription.update({
      where: { id },
      data: {
        serviceName,
        billingCycle,
        amount,
        nextBillingDate: nextBillingDateStr
          ? new Date(nextBillingDateStr)
          : null,
        status,
        notes,
      },
    });

    revalidatePath("/subscriptions");
    revalidatePath("/");
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to update subscription",
    };
  }
}

export async function deleteSubscription(id: string) {
  try {
    await prisma.subscription.delete({
      where: { id },
    });

    revalidatePath("/subscriptions");
    revalidatePath("/");
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to delete subscription",
    };
  }
}
