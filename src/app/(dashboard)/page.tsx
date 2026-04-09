import { Suspense } from "react";
import { DashboardCustomizer } from "@/app/components/dashboard/dashboard-customizer";
import { getSmartDashboard, getDashboardLayout } from "@/lib/actions/dashboard-actions";
import {
  getOrCreateQuickNote,
  getTodos,
} from "@/lib/actions/widget-actions";
import { auth } from "@/auth";
import { getLimitsForPlan } from "@/lib/plan-limits";
import { redirect } from "next/navigation";

function DashboardSkeleton() {
  return (
    <div className="space-y-6 animate-pulse" dir="rtl">
      {/* Header skeleton */}
      <div className="flex items-center justify-between">
        <div>
          <div className="h-7 w-48 bg-muted rounded-lg" />
          <div className="h-4 w-64 bg-muted rounded-lg mt-2" />
        </div>
        <div className="h-9 w-28 bg-muted rounded-xl" />
      </div>
      {/* KPI cards skeleton */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-24 bg-muted rounded-2xl" />
        ))}
      </div>
      {/* Content skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="h-64 bg-muted rounded-2xl" />
        <div className="h-64 bg-muted rounded-2xl" />
      </div>
    </div>
  );
}

async function DashboardContent() {
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

export default function DashboardPage() {
  return (
    <Suspense fallback={<DashboardSkeleton />}>
      <DashboardContent />
    </Suspense>
  );
}
