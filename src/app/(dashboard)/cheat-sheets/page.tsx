import { prisma } from "@/lib/db/prisma";
import { auth } from "@/auth";
import { CheatSheetsPageClient } from "@/app/components/cheat-sheets/cheat-sheets-page-client";

export default async function CheatSheetsPage() {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    return <CheatSheetsPageClient cheatSheets={[]} />;
  }

  const cheatSheets = await prisma.cheatSheet.findMany({
    where: { userId },
    orderBy: [{ sortOrder: "asc" }, { title: "asc" }],
  });

  return <CheatSheetsPageClient cheatSheets={cheatSheets} />;
}
