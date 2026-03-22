import { auth } from "@/auth";
import { getTodos } from "@/lib/actions/widget-actions";
import { getProjects } from "@/lib/actions/project-actions";
import { getLimitsForPlan } from "@/lib/plan-limits";
import { TasksPageClient } from "@/app/components/tasks/tasks-page-client";

export default async function TasksPage() {
  const session = await auth();
  const plan = session?.user?.subscriptionPlan ?? "FREE";
  const todosLimit = getLimitsForPlan(plan).todos;
  const [todos, projects] = await Promise.all([getTodos(), getProjects()]);

  return <TasksPageClient initialTodos={todos} todosLimit={todosLimit} projects={projects} />;
}
