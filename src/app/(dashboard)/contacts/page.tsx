import { prisma } from "@/lib/db/prisma";
import { auth } from "@/auth";
import { getLimitsForPlan } from "@/lib/plan-limits";
import { ContactsPageClient } from "@/app/components/contacts/contacts-page-client";

export default async function ContactsPage() {
  const [contacts, session] = await Promise.all([
    prisma.contact.findMany({ orderBy: { name: "asc" } }),
    auth(),
  ]);

  const plan = session?.user?.subscriptionPlan ?? "FREE";
  const limits = getLimitsForPlan(plan);

  return <ContactsPageClient contacts={contacts} planLimit={limits.contacts} />;
}
