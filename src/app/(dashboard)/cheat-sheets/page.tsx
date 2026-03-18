import { prisma } from "@/lib/db/prisma";
import { CheatSheetsPageClient } from "@/app/components/cheat-sheets/cheat-sheets-page-client";

export default async function CheatSheetsPage() {
  const cheatSheets = await prisma.cheatSheet.findMany({
    orderBy: [{ sortOrder: "asc" }, { title: "asc" }],
  });

  return <CheatSheetsPageClient cheatSheets={cheatSheets} />;
}
