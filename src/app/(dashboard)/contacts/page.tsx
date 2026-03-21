import { prisma } from "@/lib/db/prisma";
import { auth } from "@/auth";
import { getLimitsForPlan } from "@/lib/plan-limits";
import { ContactsPageClient } from "@/app/components/contacts/contacts-page-client";

export default async function ContactsPage() {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    return <ContactsPageClient contacts={[]} planLimit={0} projects={[]} />;
  }

  const [contacts, projects] = await Promise.all([
    prisma.contact.findMany({
      where: { userId },
      orderBy: { name: "asc" },
      include: { project: { select: { id: true, title: true } } },
    }),
    prisma.project.findMany({
      where: { userId },
      orderBy: { title: "asc" },
      select: { id: true, title: true },
    }),
  ]);

  const plan = session?.user?.subscriptionPlan ?? "FREE";
  const limits = getLimitsForPlan(plan);

  return <ContactsPageClient contacts={contacts} planLimit={limits.contacts} projects={projects} />;
}
