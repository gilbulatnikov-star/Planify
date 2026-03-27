export const dynamic = "force-dynamic";

import { SidebarProvider, SidebarTrigger, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/app/components/layout/app-sidebar";
import { UserMenu } from "@/app/components/layout/user-menu";
import { ThemeToggle } from "@/app/components/layout/theme-toggle";
import { WelcomeTour } from "@/app/components/layout/welcome-tour";
import { NotificationBell } from "@/app/components/layout/notification-bell";
import { HeaderSearch } from "@/app/components/layout/header-search";
import { MobileBottomNav } from "@/app/components/layout/mobile-bottom-nav";

import { LocaleSync } from "@/app/components/layout/locale-sync";
import { auth } from "@/auth";
import { LocaleProvider } from "@/lib/i18n";
import type { Locale } from "@/lib/i18n";
import { getNotifications, getUnreadCount } from "@/lib/actions/notification-actions";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const locale = ((session?.user as any)?.locale as Locale) ?? "he";
  const [notifications, unreadCount] = await Promise.all([
    getNotifications(),
    getUnreadCount(),
  ]);

  return (
    <LocaleProvider locale={locale}>
      <LocaleSync />
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <header className="sticky top-0 z-30 flex h-14 items-center justify-between gap-2 border-b border-border/50 px-6 bg-background/85 backdrop-blur-md">
            <SidebarTrigger className="-me-2 text-muted-foreground hover:text-foreground transition-colors duration-200" />
            <div className="flex items-center gap-3">
              <HeaderSearch />
              <NotificationBell
                initialNotifications={notifications}
                initialUnreadCount={unreadCount}
              />
              <ThemeToggle />
              <UserMenu />
            </div>
          </header>
          <main className="relative flex-1 overflow-auto p-6 pb-20 md:p-8 md:pb-8">{children}</main>
        </SidebarInset>
        <WelcomeTour />
        <MobileBottomNav />
      </SidebarProvider>
    </LocaleProvider>
  );
}
