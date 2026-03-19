import { prisma } from "@/lib/db/prisma";
import { auth } from "@/auth";
import { getLimitsForPlan } from "@/lib/plan-limits";
import { ProjectsPageClient } from "@/app/components/projects/projects-page-client";

export default async function ProjectsPage() {
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

  return <ProjectsPageClient projects={projects} clients={clients} planLimit={limits.projects} />;
}
