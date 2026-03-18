import { prisma } from "@/lib/db/prisma";
import { FinancialsPageClient } from "@/app/components/financials/financials-page-client";

export default async function FinancialsPage() {
  const [invoices, quotes, expenses, clients, projects, subscriptions] = await Promise.all([
    prisma.invoice.findMany({
      include: {
        client: { select: { name: true } },
        project: { select: { title: true } },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.quote.findMany({
      include: {
        client: { select: { name: true } },
        project: { select: { title: true } },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.expense.findMany({
      orderBy: { date: "desc" },
    }),
    prisma.client.findMany({
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
    prisma.project.findMany({
      select: { id: true, title: true },
      orderBy: { title: "asc" },
    }),
    prisma.subscription.findMany({
      orderBy: { serviceName: "asc" },
    }),
  ]);

  const totalMonthlyCost = subscriptions
    .filter((s) => s.status === "active")
    .reduce((sum, s) => sum + (s.billingCycle === "yearly" ? s.amount / 12 : s.amount), 0);

  return (
    <FinancialsPageClient
      invoices={invoices}
      quotes={quotes}
      expenses={expenses}
      clients={clients}
      projects={projects}
      subscriptions={subscriptions}
      totalMonthlyCost={totalMonthlyCost}
    />
  );
}
