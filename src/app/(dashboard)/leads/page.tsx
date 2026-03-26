import { getLeads } from "@/lib/actions/client-actions";
import { auth } from "@/auth";
import { getLimitsForPlan } from "@/lib/plan-limits";
import { getLeadAnalytics } from "@/lib/actions/lead-analytics";
import { LeadsPipelineClient } from "@/app/components/leads/leads-pipeline-client";

export default async function LeadsPage() {
  const session = await auth();
  const leads = await getLeads();
  const plan = session?.user?.subscriptionPlan ?? "FREE";
  const limits = getLimitsForPlan(plan);
  const analytics = await getLeadAnalytics();
  return (
    <LeadsPipelineClient
      leads={leads}
      planLimit={limits.clients}
      analytics={analytics}
    />
  );
}
