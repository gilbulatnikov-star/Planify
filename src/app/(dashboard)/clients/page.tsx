import { Suspense } from "react";
import { prisma } from "@/lib/db/prisma";
import { auth } from "@/auth";
import { getLimitsForPlan } from "@/lib/plan-limits";
import { ClientsPageClient } from "@/app/components/clients/clients-page-client";

function ClientsSkeleton() {
  return (
    <div className="space-y-6 animate-pulse" dir="rtl">
      <div className="flex items-center justify-between">
        <div>
          <div className="h-7 w-36 bg-muted rounded-lg" />
          <div className="h-4 w-52 bg-muted rounded-lg mt-2" />
        </div>
        <div className="h-9 w-28 bg-muted rounded-xl" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="h-36 bg-muted rounded-2xl" />
        ))}
      </div>
    </div>
  );
}

async function ClientsContent() {
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

export default function ClientsPage() {
  return (
    <Suspense fallback={<ClientsSkeleton />}>
      <ClientsContent />
    </Suspense>
  );
}
