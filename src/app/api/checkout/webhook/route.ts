import { NextRequest, NextResponse } from "next/server";

/**
 * POST /api/checkout/webhook
 * Handles payment provider webhooks to update subscription status in the DB.
 *
 * ─── STRIPE WEBHOOK SETUP ────────────────────────────────────────────────────
 * 1. Add STRIPE_WEBHOOK_SECRET to .env
 * 2. In Stripe Dashboard → Developers → Webhooks, add endpoint:
 *    https://yourdomain.com/api/checkout/webhook
 * 3. Subscribe to events:
 *    - checkout.session.completed
 *    - customer.subscription.updated
 *    - customer.subscription.deleted
 *    - invoice.payment_failed
 *
 * 4. Replace TODO block with:
 *
 *    import Stripe from "stripe";
 *    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
 *    const sig = request.headers.get("stripe-signature")!;
 *    const body = await request.text();
 *    const event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!);
 *
 *    switch (event.type) {
 *      case "checkout.session.completed": {
 *        const session = event.data.object as Stripe.Checkout.Session;
 *        const userId = session.metadata?.userId;
 *        const isSubscription = session.mode === "subscription";
 *        await prisma.user.update({
 *          where: { id: userId },
 *          data: {
 *            stripeCustomerId: session.customer as string,
 *            subscriptionPlan: isSubscription ? "MONTHLY" : "LIFETIME",
 *            subscriptionStatus: "ACTIVE",
 *            subscriptionEndsAt: isSubscription
 *              ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
 *              : null,
 *          },
 *        });
 *        break;
 *      }
 *      case "customer.subscription.deleted": {
 *        // set subscriptionStatus: "CANCELED", subscriptionPlan: "FREE"
 *        break;
 *      }
 *    }
 * ─────────────────────────────────────────────────────────────────────────────
 */

export async function POST(request: NextRequest) {
  // TODO: verify webhook signature and process events (see comments above)
  void request;
  return NextResponse.json({ received: true });
}
