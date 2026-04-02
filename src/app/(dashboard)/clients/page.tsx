import { prisma } from "@/lib/db/prisma";
import { auth } from "@/auth";
import { getLimitsForPlan } from "@/lib/plan-limits";
import { ClientsPageClient } from "@/app/components/clients/clients-page-client";

export default async function ClientsPage() {
  const session = await auth();
  const userId = session?.user?.id;

  const clients = userId
    ? await prisma.client.findMany({
        where: { userId },
        include: { _count: { select: { interactions: true, projects: true } } },
        orderBy: { updatedAt: "desc" },
      })
    : [];

  const plan = session?.user?.subscriptionPlan ?? "FREE";
  const limits = getLimitsForPlan(plan);

  return <ClientsPageClient clients={clients} planLimit={limits.clients} />;
}
