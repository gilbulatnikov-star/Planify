import { Suspense } from "react";
import { prisma } from "@/lib/db/prisma";
import { auth } from "@/auth";
import { ContentBoardsPageClient } from "@/app/components/calendar/content-boards-page-client";

function CalendarSkeleton() {
  return (
    <div className="space-y-6 animate-pulse" dir="rtl">
      <div className="flex items-center justify-between">
        <div>
          <div className="h-7 w-40 bg-muted rounded-lg" />
          <div className="h-4 w-56 bg-muted rounded-lg mt-2" />
        </div>
        <div className="h-9 w-28 bg-muted rounded-xl" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-48 bg-muted rounded-2xl" />
        ))}
      </div>
    </div>
  );
}

async function CalendarContent() {
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
      select: { id: true, title: true, clientId: true },
      orderBy: { title: "asc" },
    }),
  ]);

  return <ContentBoardsPageClient boards={boards} clients={clients} projects={projects} />;
}

export default function CalendarPage() {
  return (
    <Suspense fallback={<CalendarSkeleton />}>
      <CalendarContent />
    </Suspense>
  );
}
