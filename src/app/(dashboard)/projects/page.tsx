import { prisma } from "@/lib/db/prisma";
import { auth } from "@/auth";
import { getLimitsForPlan } from "@/lib/plan-limits";
import { ProjectsPageClient } from "@/app/components/projects/projects-page-client";

export default async function ProjectsPage() {
  const [projects, clients, session] = await Promise.all([
    prisma.project.findMany({
      include: {
        client: { select: { id: true, name: true } },
        tasks: { select: { id: true, completed: true } },
      },
      orderBy: { updatedAt: "desc" },
    }),
    prisma.client.findMany({
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
    auth(),
  ]);

  const plan = session?.user?.subscriptionPlan ?? "FREE";
  const limits = getLimitsForPlan(plan);

  return <ProjectsPageClient projects={projects} clients={clients} planLimit={limits.projects} />;
}
