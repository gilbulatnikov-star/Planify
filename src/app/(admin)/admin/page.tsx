import { getAdminStats, getAdminUsers } from "@/lib/actions/admin-actions";
import { AdminPageClient } from "@/app/components/admin/admin-page-client";

export default async function AdminPage() {
  const [stats, users] = await Promise.all([getAdminStats(), getAdminUsers()]);
  return <AdminPageClient stats={stats} users={users} />;
}
