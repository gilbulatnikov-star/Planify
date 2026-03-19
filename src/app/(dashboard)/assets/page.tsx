import { prisma } from "@/lib/db/prisma";
import { auth } from "@/auth";
import { AssetsPageClient } from "@/app/components/assets/assets-page-client";

export default async function AssetsPage() {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    return <AssetsPageClient assets={[]} />;
  }

  const assets = await prisma.asset.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });

  return <AssetsPageClient assets={assets} />;
}
