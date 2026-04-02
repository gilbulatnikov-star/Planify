import { prisma } from "@/lib/db/prisma";
import { auth } from "@/auth";
import { FinancialsPageClient } from "@/app/components/financials/financials-page-client";

export default async function FinancialsPage() {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    return (
      <FinancialsPageClient
        invoices={[]}
        expenses={[]}
        clients={[]}
        projects={[]}
        subscriptions={[]}
        totalMonthlyCost={0}
      />
    );
  }

  const [invoices, expenses, clients, projects, subscriptions] = await Promise.all([
    prisma.invoice.findMany({
      where: { userId },
      include: {
        client: { select: { name: true } },
        project: { select: { title: true } },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.expense.findMany({
      where: { userId },
      orderBy: { date: "desc" },
    }),
    prisma.client.findMany({
      where: { userId },
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
    prisma.project.findMany({
      where: { userId },
      select: { id: true, title: true },
      orderBy: { title: "asc" },
    }),
    prisma.subscription.findMany({
      where: { userId },
      orderBy: { serviceName: "asc" },
    }),
  ]);

  const totalMonthlyCost = subscriptions
    .filter((s) => s.status === "active")
    .reduce((sum, s) => sum + (s.billingCycle === "yearly" ? s.amount / 12 : s.amount), 0);

  return (
    <FinancialsPageClient
      invoices={invoices}
      expenses={expenses}
      clients={clients}
      projects={projects}
      subscriptions={subscriptions}
      totalMonthlyCost={totalMonthlyCost}
    />
  );
}
