import { Suspense } from "react";
import { prisma } from "@/lib/db/prisma";
import { auth } from "@/auth";
import { FinancialsPageClient } from "@/app/components/financials/financials-page-client";

function FinancialsSkeleton() {
  return (
    <div className="space-y-6 animate-pulse" dir="rtl">
      <div className="flex items-center justify-between">
        <div>
          <div className="h-7 w-36 bg-muted rounded-lg" />
          <div className="h-4 w-52 bg-muted rounded-lg mt-2" />
        </div>
        <div className="h-9 w-28 bg-muted rounded-xl" />
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-24 bg-muted rounded-2xl" />
        ))}
      </div>
      <div className="h-64 bg-muted rounded-2xl" />
    </div>
  );
}

async function FinancialsContent() {
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

export default function FinancialsPage() {
  return (
    <Suspense fallback={<FinancialsSkeleton />}>
      <FinancialsContent />
    </Suspense>
  );
}
