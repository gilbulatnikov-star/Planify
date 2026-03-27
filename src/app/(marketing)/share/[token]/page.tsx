import { notFound } from "next/navigation";
import { getShareLink } from "@/lib/actions/share-actions";
import { CheckCircle2, Circle, Clock, CalendarDays, User } from "lucide-react";
import Link from "next/link";

export default async function SharePage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const data = await getShareLink(token);
  if (!data) return notFound();

  const completedTasks = data.tasks.filter((t) => t.completed).length;
  const totalTasks = data.tasks.length;
  const progressPercent = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  const phaseLabels: Record<string, string> = {
    pre_production: "Pre-Production",
    production: "Production",
    post_production: "Post-Production",
    delivered: "Delivered",
    coordination: "Coordination",
    shoot_day: "Shoot Day",
    shoot_days: "Shoot Days",
    selection: "Selection",
    editing: "Editing",
    gallery_delivery: "Gallery Delivery",
    brief: "Brief",
    planning: "Planning",
    recording: "Recording",
    writing: "Writing",
    graphics: "Graphics",
    waiting_approval: "Waiting for Approval",
    published: "Published",
    materials_received: "Materials Received",
    first_cut: "First Cut",
    draft: "Draft",
    revisions: "Revisions",
  };

  return (
    <div className="min-h-screen bg-white dark:bg-[#0a0a0a]">
      {/* Header */}
      <header className="border-b border-gray-100 dark:border-gray-800 bg-white/80 dark:bg-[#0a0a0a]/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-4 flex items-center gap-3">
          <div className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-[#0a0a0a] dark:bg-white shadow-sm">
            <svg viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-6 w-6">
              <rect x="3" y="3" width="30" height="30" rx="9" fill="#0a0a0a" className="dark:fill-white" />
              <rect x="9" y="8" width="18" height="12" rx="5" fill="white" className="dark:fill-[#0a0a0a]" />
              <ellipse cx="24" cy="25" rx="5" ry="6.5" fill="#2563eb" transform="rotate(-15 24 25)" />
            </svg>
          </div>
          <span className="text-lg font-bold text-gray-900 dark:text-white">Planify</span>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-8">
        {/* Project title & client */}
        <div className="space-y-3">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
            {data.projectTitle}
          </h1>
          {data.clientName && (
            <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
              <User className="h-4 w-4" />
              <span>{data.clientName}</span>
            </div>
          )}
          <div className="flex flex-wrap gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 dark:bg-blue-900/30 px-3 py-1 text-xs font-medium text-blue-700 dark:text-blue-300">
              {phaseLabels[data.projectPhase] ?? data.projectPhase}
            </span>
          </div>
        </div>

        {/* Deadline */}
        {data.projectDeadline && (
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-800/50 rounded-xl px-4 py-3">
            <CalendarDays className="h-4 w-4 text-gray-400 dark:text-gray-500" />
            <span>
              Deadline:{" "}
              {new Date(data.projectDeadline).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </span>
          </div>
        )}

        {/* Description */}
        {data.projectDescription && (
          <div className="rounded-xl border border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/30 p-4 sm:p-5">
            <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-line leading-relaxed">
              {data.projectDescription}
            </p>
          </div>
        )}

        {/* Share note */}
        {data.note && (
          <div className="rounded-xl border border-amber-100 dark:border-amber-800/50 bg-amber-50/50 dark:bg-amber-900/20 p-4 sm:p-5">
            <p className="text-sm text-amber-800 dark:text-amber-200 whitespace-pre-line leading-relaxed">
              {data.note}
            </p>
          </div>
        )}

        {/* Task progress */}
        {totalTasks > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <Clock className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                Task Progress
              </h2>
              <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                {completedTasks}/{totalTasks} ({progressPercent}%)
              </span>
            </div>

            {/* Progress bar */}
            <div className="h-2 rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
              <div
                className="h-full rounded-full bg-emerald-500 transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>

            {/* Task list */}
            <div className="space-y-1.5">
              {data.tasks.map((task) => (
                <div
                  key={task.id}
                  className="flex items-center gap-3 rounded-lg border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900/50 px-4 py-2.5"
                >
                  {task.completed ? (
                    <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                  ) : (
                    <Circle className="h-4 w-4 text-gray-300 dark:text-gray-600 shrink-0" />
                  )}
                  <span
                    className={`text-sm ${
                      task.completed
                        ? "line-through text-gray-400 dark:text-gray-500"
                        : "text-gray-700 dark:text-gray-300"
                    }`}
                  >
                    {task.title}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Shared by */}
        {data.sharedByName && (
          <p className="text-xs text-gray-400 dark:text-gray-500">
            Shared by {data.sharedByName}
          </p>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-100 dark:border-gray-800 mt-12">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 flex flex-col items-center gap-4 text-center">
          <div className="flex items-center gap-2 text-sm text-gray-400 dark:text-gray-500">
            <span>Powered by</span>
            <span className="font-semibold text-gray-900 dark:text-white">Planify</span>
          </div>
          <p className="text-xs text-gray-400 dark:text-gray-500 max-w-sm">
            The smart management tool for photographers and producers.
          </p>
          <Link
            href="/landing"
            className="inline-flex items-center justify-center rounded-full bg-gray-900 dark:bg-white px-5 py-2 text-sm font-medium text-white dark:text-gray-900 hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors"
          >
            Try Planify Free
          </Link>
        </div>
      </footer>
    </div>
  );
}
