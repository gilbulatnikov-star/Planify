import { prisma } from "@/lib/db/prisma";
import { SubscriptionsPageClient } from "@/app/components/subscriptions/subscriptions-page-client";

export default async function SubscriptionsPage() {
  const subscriptions = await prisma.subscription.findMany({
    orderBy: [{ status: "asc" }, { serviceName: "asc" }],
  });

  // Calculate total monthly cost: active subs only, yearly divided by 12
  const totalMonthlyCost = subscriptions
    .filter((s) => s.status === "active")
    .reduce((sum, s) => {
      return sum + (s.billingCycle === "yearly" ? s.amount / 12 : s.amount);
    }, 0);

  return (
    <SubscriptionsPageClient
      subscriptions={subscriptions}
      totalMonthlyCost={totalMonthlyCost}
    />
  );
}
