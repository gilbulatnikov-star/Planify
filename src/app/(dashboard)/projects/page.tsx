import { Suspense } from "react";
import { prisma } from "@/lib/db/prisma";
import { auth } from "@/auth";
import { getLimitsForPlan } from "@/lib/plan-limits";
import { ProjectsPageClient } from "@/app/components/projects/projects-page-client";

function ProjectsSkeleton() {
  return (
    <div className="space-y-6 animate-pulse" dir="rtl">
      <div className="flex items-center justify-between">
        <div>
          <div className="h-7 w-40 bg-muted rounded-lg" />
          <div className="h-4 w-56 bg-muted rounded-lg mt-2" />
        </div>
        <div className="h-9 w-28 bg-muted rounded-xl" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="h-48 bg-muted rounded-2xl" />
        ))}
      </div>
    </div>
  );
}

async function ProjectsContent() {
  const session = await auth();
  const userId = session?.user?.id;

  const [projects, clients] = await Promise.all([
    userId
      ? prisma.project.findMany({
          where: { userId },
          include: {
            client: { select: { id: true, name: true } },
            tasks: { select: { id: true, completed: true } },
          },
          orderBy: { updatedAt: "desc" },
        })
      : [],
    userId
      ? prisma.client.findMany({
          where: { userId },
          select: { id: true, name: true },
          orderBy: { name: "asc" },
        })
      : [],
  ]);

  const plan = session?.user?.subscriptionPlan ?? "FREE";
  const limits = getLimitsForPlan(plan);
  const activeProjectCount = projects.filter((p) => p.phase !== "delivered").length;

  return <ProjectsPageClient projects={projects} clients={clients} planLimit={limits.projects} activeProjectCount={activeProjectCount} />;
}

export default function ProjectsPage() {
  return (
    <Suspense fallback={<ProjectsSkeleton />}>
      <ProjectsContent />
    </Suspense>
  );
}
