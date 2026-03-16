import { prisma } from "@/lib/db/prisma";
import { EquipmentPageClient } from "@/app/components/equipment/equipment-page-client";

export default async function EquipmentPage() {
  const equipment = await prisma.equipment.findMany({
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
