import { getScripts } from "@/lib/actions/script-actions";
import { getClients } from "@/lib/actions/client-actions";
import { getProjects } from "@/lib/actions/project-actions";
import { auth } from "@/auth";
import { getLimitsForPlan } from "@/lib/plan-limits";
import { ScriptsPageClient } from "@/app/components/scripts/scripts-page-client";

export default async function ScriptsPage() {
  const [scripts, clients, projects, session] = await Promise.all([
    getScripts(),
    getClients(),
    getProjects(),
    auth(),
  ]);

  const plan = session?.user?.subscriptionPlan ?? "FREE";
  const limits = getLimitsForPlan(plan);

  return (
    <ScriptsPageClient scripts={scripts} clients={clients} projects={projects} planLimit={limits.scripts} />
  );
}
