import { auth } from "@/auth";
import {
  getAutomationRules,
  initializeAutomations,
} from "@/lib/actions/automation-actions";
import { AutomationsPageClient } from "@/app/components/automations/automations-page-client";

export default async function AutomationsPage() {
  const session = await auth();
  if (!session?.user?.id) return null;

  // Initialize default rules on first visit
  await initializeAutomations();

  const rules = await getAutomationRules();

  return <AutomationsPageClient initialRules={rules} />;
}
