import { notFound } from "next/navigation";
import { getProjectDetail } from "@/lib/actions/project-actions";
import { getClients } from "@/lib/actions/client-actions";
import { ProjectDetailClient } from "@/app/components/projects/project-detail-client";

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [project, clients] = await Promise.all([
    getProjectDetail(id),
    getClients(),
  ]);
  if (!project) notFound();
  return <ProjectDetailClient project={project} clients={clients} />;
}
