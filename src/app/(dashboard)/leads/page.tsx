import { getLeads } from "@/lib/actions/client-actions";
import { auth } from "@/auth";
import { getLimitsForPlan } from "@/lib/plan-limits";
import { LeadsPipelineClient } from "@/app/components/leads/leads-pipeline-client";

export default async function LeadsPage() {
  const session = await auth();
  const leads = await getLeads();
  const plan = session?.user?.subscriptionPlan ?? "FREE";
  const limits = getLimitsForPlan(plan);
  return <LeadsPipelineClient leads={leads} planLimit={limits.clients} />;
}
