import { getNotifications, getUnreadCount } from "@/lib/actions/notification-actions";
import { NotificationBell } from "./notification-bell";

/**
 * Async server component that fetches notification data independently.
 * Wrapped in Suspense in layout.tsx so it streams in after the rest of the shell.
 */
export async function NotificationBellLoader() {
  const [notifications, unreadCount] = await Promise.all([
    getNotifications(),
    getUnreadCount(),
  ]);
  return (
    <NotificationBell
      initialNotifications={notifications}
      initialUnreadCount={unreadCount}
    />
  );
}
