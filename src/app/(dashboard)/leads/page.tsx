import { Suspense } from "react";
import { getLeads } from "@/lib/actions/client-actions";
import { auth } from "@/auth";
import { getLimitsForPlan } from "@/lib/plan-limits";
import { getLeadAnalytics } from "@/lib/actions/lead-analytics";
import { LeadsPipelineClient } from "@/app/components/leads/leads-pipeline-client";

function LeadsSkeleton() {
  return (
    <div className="space-y-6 animate-pulse" dir="rtl">
      <div className="flex items-center justify-between">
        <div>
          <div className="h-7 w-32 bg-muted rounded-lg" />
          <div className="h-4 w-48 bg-muted rounded-lg mt-2" />
        </div>
        <div className="h-9 w-28 bg-muted rounded-xl" />
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-24 bg-muted rounded-2xl" />
        ))}
      </div>
      <div className="h-64 bg-muted rounded-2xl" />
    </div>
  );
}

async function LeadsContent() {
  const [session, leads, analytics] = await Promise.all([
    auth(),
    getLeads(),
    getLeadAnalytics(),
  ]);
  const plan = session?.user?.subscriptionPlan ?? "FREE";
  const limits = getLimitsForPlan(plan);
  return (
    <LeadsPipelineClient
      leads={leads}
      planLimit={limits.clients}
      analytics={analytics}
    />
  );
}

export default function LeadsPage() {
  return (
    <Suspense fallback={<LeadsSkeleton />}>
      <LeadsContent />
    </Suspense>
  );
}
