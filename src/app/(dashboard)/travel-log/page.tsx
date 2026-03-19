import { prisma } from "@/lib/db/prisma";
import { auth } from "@/auth";
import { TravelLogPageClient } from "@/app/components/travel-log/travel-log-page-client";

export default async function TravelLogPage() {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    return (
      <TravelLogPageClient
        travelLogs={[]}
        totalKmThisMonth={0}
        clients={[]}
        projects={[]}
      />
    );
  }

  // Current month boundaries
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

  const [allTravelLogs, currentMonthLogs, clients, projects] =
    await Promise.all([
      prisma.travelLog.findMany({
        where: { userId },
        include: {
          client: { select: { id: true, name: true } },
          project: { select: { id: true, title: true } },
        },
        orderBy: { date: "desc" },
      }),
      prisma.travelLog.findMany({
        where: {
          userId,
          date: {
            gte: startOfMonth,
            lte: endOfMonth,
          },
        },
        select: { kilometers: true },
      }),
      prisma.client.findMany({
        where: { userId },
        select: { id: true, name: true },
        orderBy: { name: "asc" },
      }),
      prisma.project.findMany({
        where: { userId },
        select: { id: true, title: true },
        orderBy: { title: "asc" },
      }),
    ]);

  const totalKmThisMonth = currentMonthLogs.reduce(
    (sum, log) => sum + log.kilometers,
    0
  );

  return (
    <TravelLogPageClient
      travelLogs={allTravelLogs}
      totalKmThisMonth={totalKmThisMonth}
      clients={clients}
      projects={projects}
    />
  );
}
