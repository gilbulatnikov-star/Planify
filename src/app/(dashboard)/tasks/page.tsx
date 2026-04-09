import { Suspense } from "react";
import { auth } from "@/auth";
import { getTodos } from "@/lib/actions/widget-actions";
import { getProjects } from "@/lib/actions/project-actions";
import { getLimitsForPlan } from "@/lib/plan-limits";
import { TasksPageClient } from "@/app/components/tasks/tasks-page-client";

function TasksSkeleton() {
  return (
    <div className="space-y-6 animate-pulse" dir="rtl">
      <div className="flex items-center justify-between">
        <div>
          <div className="h-7 w-32 bg-muted rounded-lg" />
          <div className="h-4 w-48 bg-muted rounded-lg mt-2" />
        </div>
        <div className="h-9 w-28 bg-muted rounded-xl" />
      </div>
      <div className="space-y-3">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-14 bg-muted rounded-xl" />
        ))}
      </div>
    </div>
  );
}

async function TasksContent() {
  const session = await auth();
  const plan = session?.user?.subscriptionPlan ?? "FREE";
  const todosLimit = getLimitsForPlan(plan).todos;
  const [todos, projects] = await Promise.all([getTodos(), getProjects()]);

  return <TasksPageClient initialTodos={todos} todosLimit={todosLimit} projects={projects} />;
}

export default function TasksPage() {
  return (
    <Suspense fallback={<TasksSkeleton />}>
      <TasksContent />
    </Suspense>
  );
}
