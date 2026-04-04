import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { getReportsData } from "@/lib/actions/reports-actions";
import dynamic from "next/dynamic";

const ReportsPageClient = dynamic(
  () => import("@/app/components/reports/reports-page-client").then(m => m.ReportsPageClient),
  { loading: () => <div className="p-8 space-y-6">{[...Array(4)].map((_, i) => <div key={i} className="h-64 bg-muted animate-pulse rounded-2xl" />)}</div> },
);

export default async function ReportsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/sign-in");

  const data = await getReportsData(6);

  return <ReportsPageClient data={data} />;
}
