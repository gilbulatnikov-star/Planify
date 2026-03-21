import { getAdminStats, getAdminUsers } from "@/lib/actions/admin-actions";
import { getAdminFeedbacks } from "@/lib/actions/feedback-actions";
import { AdminPageClient } from "@/app/components/admin/admin-page-client";

export default async function AdminPage() {
  const [stats, users, feedbacks] = await Promise.all([getAdminStats(), getAdminUsers(), getAdminFeedbacks()]);
  return <AdminPageClient stats={stats} users={users} feedbacks={feedbacks} />;
}
