import { prisma } from "@/lib/db/prisma";
import { auth } from "@/auth";
import { ContentBoardsPageClient } from "@/app/components/calendar/content-boards-page-client";

export default async function CalendarPage() {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    return <ContentBoardsPageClient boards={[]} clients={[]} projects={[]} />;
  }

  const [boards, clients, projects] = await Promise.all([
    prisma.contentBoard.findMany({
      where: { userId },
      include: {
        client: { select: { id: true, name: true } },
        project: { select: { id: true, title: true } },
        _count: { select: { items: true } },
      },
      orderBy: { updatedAt: "desc" },
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

  return <ContentBoardsPageClient boards={boards} clients={clients} projects={projects} />;
}
