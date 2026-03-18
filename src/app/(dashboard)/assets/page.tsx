import { prisma } from "@/lib/db/prisma";
import { AssetsPageClient } from "@/app/components/assets/assets-page-client";

export default async function AssetsPage() {
  const assets = await prisma.asset.findMany({
    orderBy: { createdAt: "desc" },
  });

  return <AssetsPageClient assets={assets} />;
}
