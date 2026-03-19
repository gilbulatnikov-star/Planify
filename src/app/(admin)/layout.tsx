import { redirect } from "next/navigation";
import { auth } from "@/auth";

function isAdmin(email: string) {
  const admins = (process.env.ADMIN_EMAIL ?? "").split(",").map(e => e.trim().toLowerCase());
  return admins.includes(email.toLowerCase());
}

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user?.email || !isAdmin(session.user.email)) {
    redirect("/");
  }
  return <>{children}</>;
}
