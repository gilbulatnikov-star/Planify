import { prisma } from "@/lib/db/prisma";
import { ContactsPageClient } from "@/app/components/contacts/contacts-page-client";

export default async function ContactsPage() {
  const contacts = await prisma.contact.findMany({
    orderBy: { name: "asc" },
  });

  return <ContactsPageClient contacts={contacts} />;
}
