import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/db/prisma";

/**
 * POST /api/checkout/cancel
 * Marks the user's subscription as CANCELED in the database.
 *
 * In production, you should also call Stripe to cancel the subscription:
 *
 *   const user = await prisma.user.findUnique({ where: { id: userId } });
 *   await stripe.subscriptions.cancel(user.stripeSubscriptionId!);
 *
 * Then rely on the Stripe webhook (/api/checkout/webhook) to confirm cancellation
 * and update the DB — don't update the DB directly in this route in production.
 */
export async function POST() {
  // Authenticate
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await prisma.user.update({
      where: { id: userId },
      data: {
        subscriptionStatus: "CANCELED",
        // Keep subscriptionEndsAt intact — user retains access until billing cycle ends
      },
    });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to cancel subscription" }, { status: 500 });
  }
}
