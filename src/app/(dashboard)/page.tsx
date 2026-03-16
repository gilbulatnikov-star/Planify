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
import { getDashboardStats, getRecentProjects, getUpcomingContent } from "@/lib/db/queries";
import { formatCurrency, formatDate, daysUntil } from "@/lib/utils/format";
import { he } from "@/lib/he";

const contentTypeDots: Record<string, string> = {
  client_shoot: "bg-blue-400",
  youtube_long: "bg-red-400",
  short_form: "bg-purple-400",
};

export default async function DashboardPage() {
  const [stats, recentProjects, upcomingContent] = await Promise.all([
    getDashboardStats(),
    getRecentProjects(),
    getUpcomingContent(),
  ]);

  return (
    <DashboardAnimations>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold bg-gradient-to-l from-cyan-300 via-white to-white bg-clip-text text-transparent">
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
            value={formatCurrency(stats.monthlyRevenue)}
            icon={TrendingUp}
          />
          <StatCard
            title={he.dashboard.outstandingInvoices}
            value={formatCurrency(stats.outstandingAmount)}
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
                <div className="rounded-lg bg-cyan-500/10 p-1.5">
                  <Camera className="h-4 w-4 text-cyan-400" />
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
                        className="flex items-center justify-between rounded-lg border border-white/[0.06] bg-white/[0.02] p-3 transition-all duration-200 hover:bg-white/[0.04] hover:border-cyan-500/20"
                      >
                        <div>
                          <p className="text-sm font-medium">{project.title}</p>
                          <p className="text-xs text-muted-foreground">
                            {project.client?.name} · {formatDate(project.shootDate)}
                          </p>
                        </div>
                        <Badge variant={days !== null && days <= 3 ? "destructive" : "secondary"}>
                          {days !== null ? `${days} ימים` : "—"}
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
                <div className="rounded-lg bg-cyan-500/10 p-1.5">
                  <Clock className="h-4 w-4 text-cyan-400" />
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
                        className="flex items-center justify-between rounded-lg border border-white/[0.06] bg-white/[0.02] p-3 transition-all duration-200 hover:bg-white/[0.04] hover:border-cyan-500/20"
                      >
                        <div>
                          <p className="text-sm font-medium">{project.title}</p>
                          <p className="text-xs text-muted-foreground">
                            {he.project.statuses[project.status as keyof typeof he.project.statuses] ?? project.status} · {formatDate(project.deadline)}
                          </p>
                        </div>
                        <Badge variant={days !== null && days <= 5 ? "destructive" : "secondary"}>
                          {days !== null ? `${days} ימים` : "—"}
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
              <div className="rounded-lg bg-cyan-500/10 p-1.5">
                <CalendarDays className="h-4 w-4 text-cyan-400" />
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
                      className="flex items-center justify-between rounded-lg border border-white/[0.06] bg-white/[0.02] p-3 transition-all duration-200 hover:bg-white/[0.04] hover:border-cyan-500/20"
                    >
                      <div className="flex items-center gap-2">
                        <span className={`w-2.5 h-2.5 rounded-full ${dot} flex-shrink-0`} />
                        <div>
                          <p className="text-sm font-medium">{item.title}</p>
                          <p className="text-xs text-muted-foreground">
                            {he.calendar.contentTypes[item.contentType as keyof typeof he.calendar.contentTypes] ?? item.contentType}
                            {item.client ? ` · ${item.client.name}` : ""}
                            {" · "}
                            {formatDate(item.date)}
                          </p>
                        </div>
                      </div>
                      <Badge
                        className={
                          he.calendar.statuses[item.status as keyof typeof he.calendar.statuses]
                            ? "bg-cyan-500/15 text-cyan-300 border-0"
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
                  className="flex items-center justify-between rounded-lg border border-white/[0.06] bg-white/[0.02] p-3 transition-all duration-200 hover:bg-white/[0.04] hover:border-cyan-500/20"
                >
                  <div className="flex items-center gap-3">
                    <div>
                      <p className="text-sm font-medium">{project.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {project.client?.name ?? "—"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="border-cyan-500/30 text-cyan-300">
                      {he.project.phases[project.phase as keyof typeof he.project.phases] ?? project.phase}
                    </Badge>
                    <Badge className="bg-cyan-500/20 text-cyan-300 hover:bg-cyan-500/30">
                      {he.project.statuses[project.status as keyof typeof he.project.statuses] ?? project.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardAnimations>
  );
}
