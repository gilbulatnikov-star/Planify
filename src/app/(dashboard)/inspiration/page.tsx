import { prisma } from "@/lib/db/prisma";
import { auth } from "@/auth";
import { getLimitsForPlan } from "@/lib/plan-limits";
import { InspirationPageClient } from "@/app/components/inspiration/inspiration-page-client";

export default async function InspirationPage() {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    return <InspirationPageClient inspirations={[]} categories={[]} planLimit={0} />;
  }

  const [inspirations, categories] = await Promise.all([
    prisma.inspiration.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    }),
    prisma.inspirationCategory.findMany({
      where: { userId },
      orderBy: { sortOrder: "asc" },
    }),
  ]);

  const plan = session?.user?.subscriptionPlan ?? "FREE";
  const limits = getLimitsForPlan(plan);

  return <InspirationPageClient inspirations={inspirations} categories={categories} planLimit={limits.inspirationRefs} />;
}
