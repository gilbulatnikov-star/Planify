import { prisma } from "@/lib/db/prisma";
import { auth } from "@/auth";
import { getLimitsForPlan } from "@/lib/plan-limits";
import { InspirationPageClient } from "@/app/components/inspiration/inspiration-page-client";

export default async function InspirationPage() {
  const [inspirations, categories, session] = await Promise.all([
    prisma.inspiration.findMany({ orderBy: { createdAt: "desc" } }),
    prisma.inspirationCategory.findMany({ orderBy: { sortOrder: "asc" } }),
    auth(),
  ]);

  const plan = session?.user?.subscriptionPlan ?? "FREE";
  const limits = getLimitsForPlan(plan);

  return <InspirationPageClient inspirations={inspirations} categories={categories} planLimit={limits.inspirationRefs} />;
}
