import { prisma } from "@/lib/db/prisma";
import { auth } from "@/auth";
import { notFound } from "next/navigation";
import { CalendarPageClient } from "@/app/components/calendar/calendar-page-client";
import { startOfMonth, endOfMonth, subMonths, addMonths } from "date-fns";

export default async function BoardPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ month?: string }>;
}) {
  const { id } = await params;
  const sp = await searchParams;
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) notFound();

  const board = await prisma.contentBoard.findFirst({
    where: { id, userId },
    include: {
      client: { select: { id: true, name: true } },
      project: { select: { id: true, title: true } },
    },
  });
  if (!board) notFound();

  const now = new Date();
  const currentMonth = sp.month ? new Date(sp.month + "-01") : now;
  const monthStart = startOfMonth(currentMonth);
  const rangeStart = startOfMonth(subMonths(monthStart, 1));
  const rangeEnd = endOfMonth(addMonths(monthStart, 1));

  const [content, clients, projects, scripts] = await Promise.all([
    prisma.scheduledContent.findMany({
      where: { boardId: id, userId, date: { gte: rangeStart, lte: rangeEnd } },
      include: {
        client: { select: { id: true, name: true } },
        project: { select: { id: true, title: true } },
      },
      orderBy: { date: "asc" },
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
    prisma.script.findMany({
      where: { userId },
      select: { id: true, title: true, projectId: true, clientId: true },
      orderBy: { title: "asc" },
    }),
  ]);

  return (
    <CalendarPageClient
      content={content}
      clients={clients}
      projects={projects}
      scripts={scripts}
      initialMonth={monthStart.toISOString()}
      activeClientId={board.clientId}
      activeClientName={board.client?.name ?? null}
      boardId={id}
      boardTitle={board.title}
      boardClientId={board.clientId}
      boardProjectId={board.projectId}
    />
  );
}
