import { prisma } from "@/lib/db/prisma";
import { FinancialsPageClient } from "@/app/components/financials/financials-page-client";

export default async function FinancialsPage() {
  const [invoices, quotes, expenses, clients, projects] = await Promise.all([
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
  ]);

  return (
    <FinancialsPageClient
      invoices={invoices}
      quotes={quotes}
      expenses={expenses}
      clients={clients}
      projects={projects}
    />
  );
}
