import { getScripts } from "@/lib/actions/script-actions";
import { getClients } from "@/lib/actions/client-actions";
import { getProjects } from "@/lib/actions/project-actions";
import { ScriptsPageClient } from "@/app/components/scripts/scripts-page-client";

export default async function ScriptsPage() {
  const [scripts, clients, projects] = await Promise.all([
    getScripts(),
    getClients(),
    getProjects(),
  ]);
  return (
    <ScriptsPageClient scripts={scripts} clients={clients} projects={projects} />
  );
}
