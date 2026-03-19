import { prisma } from "@/lib/db/prisma";
import { auth } from "@/auth";
import { getLimitsForPlan } from "@/lib/plan-limits";
import { ClientsPageClient } from "@/app/components/clients/clients-page-client";

export default async function ClientsPage() {
  const [clients, session] = await Promise.all([
    prisma.client.findMany({
      include: { projects: { select: { id: true } }, _count: { select: { interactions: true } } },
      orderBy: { updatedAt: "desc" },
    }),
    auth(),
  ]);

  const plan = session?.user?.subscriptionPlan ?? "FREE";
  const limits = getLimitsForPlan(plan);

  return <ClientsPageClient clients={clients} planLimit={limits.clients} />;
}
