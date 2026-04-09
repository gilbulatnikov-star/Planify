import { Suspense } from "react";
import { getScripts } from "@/lib/actions/script-actions";
import { getClients } from "@/lib/actions/client-actions";
import { getProjects } from "@/lib/actions/project-actions";
import { auth } from "@/auth";
import { getLimitsForPlan } from "@/lib/plan-limits";
import { ScriptsPageClient } from "@/app/components/scripts/scripts-page-client";

function ScriptsSkeleton() {
  return (
    <div className="space-y-6 animate-pulse" dir="rtl">
      <div className="flex items-center justify-between">
        <div>
          <div className="h-7 w-32 bg-muted rounded-lg" />
          <div className="h-4 w-48 bg-muted rounded-lg mt-2" />
        </div>
        <div className="h-9 w-28 bg-muted rounded-xl" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="h-44 bg-muted rounded-2xl" />
        ))}
      </div>
    </div>
  );
}

async function ScriptsContent() {
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

export default function ScriptsPage() {
  return (
    <Suspense fallback={<ScriptsSkeleton />}>
      <ScriptsContent />
    </Suspense>
  );
}
