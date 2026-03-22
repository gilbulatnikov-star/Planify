import { getMoodboards, createMoodboard } from "@/lib/actions/moodboard-actions";
import { getProjects } from "@/lib/actions/project-actions";
import { auth } from "@/auth";
import { getLimitsForPlan } from "@/lib/plan-limits";
import Link from "next/link";
import { redirect } from "next/navigation";
import { LayoutTemplate, Pencil } from "lucide-react";
import { format } from "date-fns";
import { he as heLocale } from "date-fns/locale";
import { DeleteMoodboardButton } from "@/app/components/moodboard/delete-moodboard-button";
import { NewMoodboardButton } from "@/app/components/moodboard/new-moodboard-button";
import { MoodboardProjectLink } from "@/app/components/moodboard/moodboard-project-link";

export default async function MoodboardListPage() {
  const [boards, session, projects] = await Promise.all([getMoodboards(), auth(), getProjects()]);
  const plan = session?.user?.subscriptionPlan ?? "FREE";
  const limits = getLimitsForPlan(plan);
  const canCreate = limits.moodboards === -1 || boards.length < limits.moodboards;

  async function handleCreate() {
    "use server";
    const board = await createMoodboard();
    redirect(`/moodboard/${board.id}`);
  }

  return (
    <div className="space-y-6" dir="rtl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Moodboard</h1>
          <p className="text-sm text-muted-foreground mt-1">עצב ואסוף השראה ויזואלית לפרויקטים שלך</p>
        </div>
        <NewMoodboardButton action={handleCreate} canCreate={canCreate} planLimit={limits.moodboards} />
      </div>

      {boards.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-muted">
            <LayoutTemplate className="h-8 w-8 text-muted-foreground" />
          </div>
          <div>
            <p className="text-base font-semibold text-foreground">אין Moodboards עדיין</p>
            <p className="text-sm text-muted-foreground mt-1">צור Moodboard חדש כדי להתחיל לאסוף השראה</p>
          </div>
          <NewMoodboardButton action={handleCreate} canCreate={canCreate} planLimit={limits.moodboards} label="צור Moodboard ראשון" />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {boards.map((board) => (
            <div
              key={board.id}
              className="group relative rounded-2xl border border-border bg-card shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden"
            >
              {/* Preview area */}
              <Link href={`/moodboard/${board.id}`} className="block">
                <div className="h-40 bg-gradient-to-br from-muted/50 to-muted flex items-center justify-center">
                  <LayoutTemplate className="h-10 w-10 text-muted-foreground/30" />
                </div>
                <div className="p-4">
                  <p className="font-semibold text-foreground truncate">{board.title}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    עודכן {format(new Date(board.updatedAt), "d בMMM yyyy", { locale: heLocale })}
                  </p>
                </div>
              </Link>
              {/* Project link */}
              <div className="px-4 pb-3">
                <MoodboardProjectLink
                  boardId={board.id}
                  currentProjectId={board.project?.id ?? null}
                  currentProjectTitle={board.project?.title ?? null}
                  projects={projects}
                />
              </div>
              {/* Actions */}
              <div className="absolute top-3 left-3 flex gap-1.5 opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-opacity delay-75">
                <Link
                  href={`/moodboard/${board.id}`}
                  className="flex h-8 w-8 items-center justify-center rounded-lg bg-card shadow border border-border hover:bg-muted transition-colors"
                >
                  <Pencil className="h-3.5 w-3.5 text-muted-foreground" />
                </Link>
                <DeleteMoodboardButton id={board.id} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
