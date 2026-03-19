import { prisma } from "@/lib/db/prisma";
import { auth } from "@/auth";
import { EquipmentPageClient } from "@/app/components/equipment/equipment-page-client";

export default async function EquipmentPage() {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    return <EquipmentPageClient equipment={[]} />;
  }

  const equipment = await prisma.equipment.findMany({
    where: { userId },
    include: {
      gearAssignments: {
        include: { project: { select: { title: true } } },
        where: { returnDate: null },
      },
    },
    orderBy: { name: "asc" },
  });

  return <EquipmentPageClient equipment={equipment} />;
}
