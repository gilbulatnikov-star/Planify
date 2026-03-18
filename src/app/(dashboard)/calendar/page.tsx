import { prisma } from "@/lib/db/prisma";
import { CalendarPageClient } from "@/app/components/calendar/calendar-page-client";
import {
  startOfMonth,
  endOfMonth,
  subMonths,
  addMonths,
} from "date-fns";

export default async function CalendarPage({
  searchParams,
}: {
  searchParams: Promise<{ month?: string; clientId?: string }>;
}) {
  const params = await searchParams;
  const now = new Date();
  const currentMonth = params.month ? new Date(params.month + "-01") : now;
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const activeClientId = params.clientId || null;

  // Fetch ALL content for current month (with buffer for calendar view)
  // Client-side filtering handles isolation — server always loads everything
  const rangeStart = startOfMonth(subMonths(monthStart, 1));
  const rangeEnd = endOfMonth(addMonths(monthEnd, 1));

  const [content, clients, projects] = await Promise.all([
    prisma.scheduledContent.findMany({
      where: { date: { gte: rangeStart, lte: rangeEnd } },
      include: {
        client: { select: { id: true, name: true } },
        project: { select: { id: true, title: true } },
      },
      orderBy: { date: "asc" },
    }),
    prisma.client.findMany({
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
    prisma.project.findMany({
      select: { id: true, title: true },
      orderBy: { title: "asc" },
    }),
  ]);

  // Get active client name for display
  const activeClientName = activeClientId
    ? clients.find((c) => c.id === activeClientId)?.name ?? null
    : null;

  return (
    <CalendarPageClient
      content={content}
      clients={clients}
      projects={projects}
      initialMonth={monthStart.toISOString()}
      activeClientId={activeClientId}
      activeClientName={activeClientName}
    />
  );
}
