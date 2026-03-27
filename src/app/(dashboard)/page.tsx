import { SmartDashboard } from "@/app/components/dashboard/smart-dashboard";
import { QuickNotesWidget } from "@/app/components/dashboard/quick-notes-widget";
import { TodoWidget } from "@/app/components/dashboard/todo-widget";
import { getSmartDashboard } from "@/lib/actions/dashboard-actions";
import {
  getOrCreateQuickNote,
  getTodos,
} from "@/lib/actions/widget-actions";
import { auth } from "@/auth";
import { getLimitsForPlan } from "@/lib/plan-limits";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const plan = session.user.subscriptionPlan ?? "FREE";
  const todosLimit = getLimitsForPlan(plan).todos;

  const [dashboardData, quickNote, todos] = await Promise.all([
    getSmartDashboard(),
    getOrCreateQuickNote(),
    getTodos(),
  ]);

  if (!dashboardData) redirect("/login");

  return (
    <div className="space-y-6 max-w-[1100px]">
      <SmartDashboard data={dashboardData} userName={session.user.name} />

      {/* Dashboard Widgets */}
      <div className="grid gap-4 lg:grid-cols-2">
        <QuickNotesWidget initialContent={quickNote?.content ?? ""} />
        <TodoWidget initialTodos={todos} todosLimit={todosLimit} />
      </div>
    </div>
  );
}
