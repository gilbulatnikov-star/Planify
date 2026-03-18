import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/db/prisma";

/**
 * POST /api/checkout/session
 * Creates a checkout session for the selected plan.
 *
 * ─── HOW TO PLUG IN STRIPE ───────────────────────────────────────────────────
 * 1. npm install stripe
 * 2. Add STRIPE_SECRET_KEY and NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY to .env
 * 3. Replace the TODO block below with:
 *
 *    import Stripe from "stripe";
 *    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
 *
 *    const session = await stripe.checkout.sessions.create({
 *      mode: "subscription",
 *      customer_email: userEmail,
 *      line_items: [{ price: PRICE_IDS[plan], quantity: 1 }],
 *      success_url: `${process.env.AUTH_URL}/settings/billing?success=true`,
 *      cancel_url:  `${process.env.AUTH_URL}/billing`,
 *      metadata: { userId },
 *    });
 *    return NextResponse.json({ url: session.url });
 *
 * ─── HOW TO PLUG IN LEMON SQUEEZY ───────────────────────────────────────────
 * 1. npm install @lemonsqueezy/lemonsqueezy.js
 * 2. Add LEMONSQUEEZY_API_KEY and variant IDs to .env
 * 3. Replace the TODO block with LemonSqueezy checkout URL generation
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * ─── "עדכן כרטיס" — Customer Portal (Stripe) ────────────────────────────────
 * Once Stripe is connected, the "Update Card" button should redirect to:
 *
 *    const portalSession = await stripe.billingPortal.sessions.create({
 *      customer: user.stripeCustomerId,
 *      return_url: `${process.env.AUTH_URL}/settings/billing`,
 *    });
 *    return NextResponse.json({ url: portalSession.url });
 *
 * Create a GET /api/checkout/portal route for this purpose.
 * ─────────────────────────────────────────────────────────────────────────────
 */

// Map plan names to Stripe Price IDs (replace with real IDs from Stripe dashboard)
const PRICE_IDS: Record<string, string> = {
  MONTHLY: "price_monthly_placeholder",
  ANNUAL:  "price_annual_placeholder",
};

export async function POST(request: NextRequest) {
  // ── Authenticate ─────────────────────────────────────────────────────────
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // ── Parse request ─────────────────────────────────────────────────────────
  const { plan } = await request.json() as { plan: "MONTHLY" | "ANNUAL" };

  if (!PRICE_IDS[plan]) {
    return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
  }

  // ── DEMO MODE: Update DB directly (replace with Stripe when ready) ────────
  // In production: create a Stripe checkout session and return session.url.
  // The Stripe webhook (/api/checkout/webhook) should then update the DB.
  // For now we update the DB immediately to simulate a successful payment.
  const endsAt = plan === "ANNUAL"
    ? new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)  // +1 year
    : new Date(Date.now() +  30 * 24 * 60 * 60 * 1000); // +30 days

  await prisma.user.update({
    where: { id: userId },
    data: {
      subscriptionPlan:   plan,
      subscriptionStatus: "ACTIVE",
      subscriptionEndsAt: endsAt,
    },
  });
  // ─────────────────────────────────────────────────────────────────────────

  // Pass the new plan to the billing page so it can refresh the JWT session
  const checkoutUrl = `/settings/billing?success=true&plan=${plan}`;
  return NextResponse.json({ url: checkoutUrl });
}
