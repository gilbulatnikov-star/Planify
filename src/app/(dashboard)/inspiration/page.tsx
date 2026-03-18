import { prisma } from "@/lib/db/prisma";
import { InspirationPageClient } from "@/app/components/inspiration/inspiration-page-client";

export default async function InspirationPage() {
  const [inspirations, categories] = await Promise.all([
    prisma.inspiration.findMany({ orderBy: { createdAt: "desc" } }),
    prisma.inspirationCategory.findMany({ orderBy: { sortOrder: "asc" } }),
  ]);

  return <InspirationPageClient inspirations={inspirations} categories={categories} />;
}
