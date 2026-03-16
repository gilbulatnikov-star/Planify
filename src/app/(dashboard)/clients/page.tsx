import { prisma } from "@/lib/db/prisma";
import { ClientsPageClient } from "@/app/components/clients/clients-page-client";

export default async function ClientsPage() {
  const clients = await prisma.client.findMany({
    include: { projects: { select: { id: true } }, _count: { select: { interactions: true } } },
    orderBy: { updatedAt: "desc" },
  });

  return <ClientsPageClient clients={clients} />;
}
