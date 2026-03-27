import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { getReportsData } from "@/lib/actions/reports-actions";
import { ReportsPageClient } from "@/app/components/reports/reports-page-client";

export default async function ReportsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const data = await getReportsData(6);

  return <ReportsPageClient data={data} />;
}
