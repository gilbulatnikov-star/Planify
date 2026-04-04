import { DashboardCustomizer } from "@/app/components/dashboard/dashboard-customizer";
import { getSmartDashboard, getDashboardLayout } from "@/lib/actions/dashboard-actions";
import {
  getOrCreateQuickNote,
  getTodos,
} from "@/lib/actions/widget-actions";
import { auth } from "@/auth";
import { getLimitsForPlan } from "@/lib/plan-limits";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/sign-in");

  const plan = session.user.subscriptionPlan ?? "FREE";
  const todosLimit = getLimitsForPlan(plan).todos;

  const [dashboardData, quickNote, todos, layout] = await Promise.all([
    getSmartDashboard(),
    getOrCreateQuickNote(),
    getTodos(),
    getDashboardLayout(),
  ]);

  if (!dashboardData) redirect("/sign-in");

  // Map to the shape TodoWidget expects
  const todoItems = todos.map((t) => ({ id: t.id, text: t.text, completed: t.completed }));

  return (
    <DashboardCustomizer
      initialLayout={layout}
      data={dashboardData}
      userName={session.user.name}
      quickNoteContent={quickNote?.content ?? ""}
      todos={todoItems}
      todosLimit={todosLimit}
    />
  );
}
