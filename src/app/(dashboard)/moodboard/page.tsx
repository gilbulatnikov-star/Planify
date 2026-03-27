import { getMoodboards, createMoodboard } from "@/lib/actions/moodboard-actions";
import { getProjects } from "@/lib/actions/project-actions";
import { auth } from "@/auth";
import { getLimitsForPlan } from "@/lib/plan-limits";
import { getT, getLocale } from "@/lib/i18n-server";
import { redirect } from "next/navigation";
import { format } from "date-fns";
import { he as heLocale } from "date-fns/locale/he";
import { enUS } from "date-fns/locale/en-US";
import { MoodboardPageClient } from "@/app/components/moodboard/moodboard-page-client";

export default async function MoodboardListPage() {
  const [boards, session, projects, t, locale] = await Promise.all([getMoodboards(), auth(), getProjects(), getT(), getLocale()]);
  const plan = session?.user?.subscriptionPlan ?? "FREE";
  const limits = getLimitsForPlan(plan);
  const dateFnsLocale = locale === "en" ? enUS : heLocale;
  const canCreate = limits.moodboards === -1 || boards.length < limits.moodboards;

  async function handleCreate() {
    "use server";
    const board = await createMoodboard();
    redirect(`/moodboard/${board.id}`);
  }

  // Serialize boards for the client component
  const serializedBoards = boards.map((board) => ({
    id: board.id,
    title: board.title,
    updatedAt: new Date(board.updatedAt).toISOString(),
    project: board.project ? { id: board.project.id, title: board.project.title } : null,
  }));

  // Pre-format dates on the server so the client doesn't need date-fns
  const formatDateStr = (iso: string) => format(new Date(iso), "d MMM yyyy", { locale: dateFnsLocale });

  // We pass a mapping of pre-formatted dates instead of a function
  const dateMap: Record<string, string> = {};
  for (const board of serializedBoards) {
    dateMap[board.updatedAt] = formatDateStr(board.updatedAt);
  }

  return (
    <MoodboardPageClient
      boards={serializedBoards}
      projects={projects}
      canCreate={canCreate}
      planLimit={limits.moodboards}
      handleCreate={handleCreate}
      t={{
        subtitle: t.moodboard.subtitle,
        noMoodboards: t.moodboard.noMoodboards,
        noMoodboardsDesc: t.moodboard.noMoodboardsDesc,
        createFirst: t.moodboard.createFirst,
        updated: t.moodboard.updated,
      }}
      dateMap={dateMap}
    />
  );
}
