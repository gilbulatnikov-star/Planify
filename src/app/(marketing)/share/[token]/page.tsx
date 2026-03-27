import { notFound } from "next/navigation";
import { getShareLink } from "@/lib/actions/share-actions";
import SharePageClient from "@/app/components/share/share-page-client";

export default async function SharePage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const data = await getShareLink(token);
  if (!data) return notFound();

  return <SharePageClient token={token} data={data} />;
}
