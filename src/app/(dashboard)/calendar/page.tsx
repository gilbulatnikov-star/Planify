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
  searchParams: Promise<{ month?: string }>;
}) {
  const params = await searchParams;
  const now = new Date();
  const currentMonth = params.month ? new Date(params.month + "-01") : now;
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);

  // Fetch content for current month (with buffer for calendar view)
  const rangeStart = startOfMonth(subMonths(monthStart, 1));
  const rangeEnd = endOfMonth(addMonths(monthEnd, 1));

  const [content, clients, projects] = await Promise.all([
    prisma.scheduledContent.findMany({
      where: {
        date: { gte: rangeStart, lte: rangeEnd },
      },
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

  return (
    <CalendarPageClient
      content={content}
      clients={clients}
      projects={projects}
      initialMonth={monthStart.toISOString()}
    />
  );
}
