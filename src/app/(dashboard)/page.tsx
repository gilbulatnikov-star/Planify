import {
  FolderKanban,
  Camera,
  Clock,
  TrendingUp,
  Receipt,
  Target,
  CalendarDays,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { StatCard } from "@/app/components/dashboard/stat-card";
import { DashboardAnimations } from "@/app/components/dashboard/dashboard-animations";
import { QuickNotesWidget } from "@/app/components/dashboard/quick-notes-widget";
import { TodoWidget } from "@/app/components/dashboard/todo-widget";
import { getDashboardStats, getRecentProjects, getUpcomingContent } from "@/lib/db/queries";
import {
  getOrCreateQuickNote,
  getTodos,
} from "@/lib/actions/widget-actions";
import { formatCurrency, formatDate, daysUntil } from "@/lib/utils/format";
import { getT, getLocale } from "@/lib/i18n-server";
import { getPhaseLabel } from "@/lib/project-config";
import { auth } from "@/auth";
import { getLimitsForPlan } from "@/lib/plan-limits";

const contentTypeDots: Record<string, string> = {
  client_shoot: "bg-blue-400",
  youtube_long: "bg-red-400",
  short_form: "bg-purple-400",
};

export default async function DashboardPage() {
  const session = await auth();
  const plan = session?.user?.subscriptionPlan ?? "FREE";
  const todosLimit = getLimitsForPlan(plan).todos;

  const [stats, recentProjects, upcomingContent, quickNote, todos, he, locale] = await Promise.all([
    getDashboardStats(),
    getRecentProjects(),
    getUpcomingContent(),
    getOrCreateQuickNote(),
    getTodos(),
    getT(),
    getLocale(),
  ]);

  return (
    <DashboardAnimations>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-foreground">
          {he.dashboard.title}
        </h1>

        {/* Stats Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <StatCard
            title={he.dashboard.activeProjects}
            value={stats.activeProjects}
            icon={FolderKanban}
          />
          <StatCard
            title={he.dashboard.monthlyRevenue}
            value={formatCurrency(stats.monthlyRevenue, locale)}
            icon={TrendingUp}
          />
          <StatCard
            title={he.dashboard.outstandingInvoices}
            value={formatCurrency(stats.outstandingAmount, locale)}
            icon={Receipt}
          />
          <StatCard
            title={he.dashboard.conversionRate}
            value={`${stats.conversionRate}%`}
            icon={Target}
          />
          <StatCard
            title={he.dashboard.upcomingShoots}
            value={stats.upcomingShoots.length}
            icon={Camera}
          />
          <StatCard
            title={he.dashboard.pendingDeadlines}
            value={stats.pendingDeadlines.length}
            icon={Clock}
          />
        </div>

        {/* Two-column layout */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Upcoming Shoots */}
          <Card className="glass-card transition-all duration-300">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <div className="rounded-lg bg-[#38b6ff]/10 p-1.5">
                  <Camera className="h-4 w-4 text-[#38b6ff]" />
                </div>
                {he.dashboard.upcomingShoots}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {stats.upcomingShoots.length === 0 ? (
                <p className="text-sm text-muted-foreground">{he.dashboard.noShoots}</p>
              ) : (
                <div className="space-y-2">
                  {stats.upcomingShoots.map((project) => {
                    const days = daysUntil(project.shootDate);
                    return (
                      <div
                        key={project.id}
                        className="flex items-center justify-between rounded-lg border border-border bg-muted/30 p-3 transition-all duration-200 hover:bg-muted/50 hover:border-border"
                      >
                        <div>
                          <p className="text-sm font-medium">{project.title}</p>
                          <p className="text-xs text-muted-foreground">
                            {project.client?.name} · {formatDate(project.shootDate, locale)}
                          </p>
                        </div>
                        <Badge variant={days !== null && days <= 3 ? "destructive" : "secondary"}>
                          {days !== null ? `${days} ${he.common.days}` : "—"}
                        </Badge>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Pending Deadlines */}
          <Card className="glass-card transition-all duration-300">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <div className="rounded-lg bg-[#38b6ff]/10 p-1.5">
                  <Clock className="h-4 w-4 text-[#38b6ff]" />
                </div>
                {he.dashboard.pendingDeadlines}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {stats.pendingDeadlines.length === 0 ? (
                <p className="text-sm text-muted-foreground">{he.dashboard.noProjects}</p>
              ) : (
                <div className="space-y-2">
                  {stats.pendingDeadlines.map((project) => {
                    const days = daysUntil(project.deadline);
                    return (
                      <div
                        key={project.id}
                        className="flex items-center justify-between rounded-lg border border-border bg-muted/30 p-3 transition-all duration-200 hover:bg-muted/50 hover:border-border"
                      >
                        <div>
                          <p className="text-sm font-medium">{project.title}</p>
                          <p className="text-xs text-muted-foreground">
                            {getPhaseLabel(project.phase, he)} · {formatDate(project.deadline, locale)}
                          </p>
                        </div>
                        <Badge variant={days !== null && days <= 5 ? "destructive" : "secondary"}>
                          {days !== null ? `${days} ${he.common.days}` : "—"}
                        </Badge>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Upcoming Content & Shoots */}
        <Card className="glass-card transition-all duration-300">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <div className="rounded-lg bg-[#38b6ff]/10 p-1.5">
                <CalendarDays className="h-4 w-4 text-[#38b6ff]" />
              </div>
              {he.calendar.upcomingContent}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {upcomingContent.length === 0 ? (
              <p className="text-sm text-muted-foreground">{he.calendar.noContent}</p>
            ) : (
              <div className="space-y-2">
                {upcomingContent.map((item) => {
                  const days = daysUntil(item.date);
                  const dot = contentTypeDots[item.contentType] ?? "bg-gray-400";
                  return (
                    <div
                      key={item.id}
                      className="flex items-center justify-between rounded-lg border border-border bg-muted/30 p-3 transition-all duration-200 hover:bg-muted/50 hover:border-border"
                    >
                      <div className="flex items-center gap-2">
                        <span className={`w-2.5 h-2.5 rounded-full ${dot} flex-shrink-0`} />
                        <div>
                          <p className="text-sm font-medium">{item.title}</p>
                          <p className="text-xs text-muted-foreground">
                            {he.calendar.contentTypes[item.contentType as keyof typeof he.calendar.contentTypes] ?? item.contentType}
                            {item.client ? ` · ${item.client.name}` : ""}
                            {" · "}
                            {formatDate(item.date, locale)}
                          </p>
                        </div>
                      </div>
                      <Badge
                        className={
                          he.calendar.statuses[item.status as keyof typeof he.calendar.statuses]
                            ? "bg-muted text-foreground border-0"
                            : ""
                        }
                      >
                        {he.calendar.statuses[item.status as keyof typeof he.calendar.statuses] ?? item.status}
                      </Badge>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Dashboard Widgets Grid */}
        <div className="grid gap-6 lg:grid-cols-2">
          <QuickNotesWidget initialContent={quickNote?.content ?? ""} />
          <TodoWidget initialTodos={todos} todosLimit={todosLimit} />
        </div>

        {/* Recent Projects */}
        <Card className="glass-card transition-all duration-300">
          <CardHeader>
            <CardTitle className="text-lg">{he.dashboard.recentProjects}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {recentProjects.map((project) => (
                <div
                  key={project.id}
                  className="flex items-center justify-between rounded-lg border border-border bg-muted/30 p-3 transition-all duration-200 hover:bg-muted/50 hover:border-border"
                >
                  <div className="flex items-center gap-3">
                    <div>
                      <p className="text-sm font-medium">{project.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {project.client?.name ?? "—"}
                      </p>
                    </div>
                  </div>
                  <Badge className="bg-muted text-muted-foreground border-0">
                    {getPhaseLabel(project.phase, he)}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardAnimations>
  );
}
