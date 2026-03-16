import { prisma } from "@/lib/db/prisma";
import { ProjectsPageClient } from "@/app/components/projects/projects-page-client";

export default async function ProjectsPage() {
  const [projects, clients] = await Promise.all([
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
  ]);

  return <ProjectsPageClient projects={projects} clients={clients} />;
}
