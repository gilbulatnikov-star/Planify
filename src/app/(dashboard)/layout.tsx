export const dynamic = "force-dynamic";

import { SidebarProvider, SidebarTrigger, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/app/components/layout/app-sidebar";
import { UserMenu } from "@/app/components/layout/user-menu";
import { ThemeToggle } from "@/app/components/layout/theme-toggle";
import { WelcomeTour } from "@/app/components/layout/welcome-tour";

import { LocaleSync } from "@/app/components/layout/locale-sync";
import { auth } from "@/auth";
import { LocaleProvider } from "@/lib/i18n";
import type { Locale } from "@/lib/i18n";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const locale = ((session?.user as any)?.locale as Locale) ?? "he";

  return (
    <LocaleProvider locale={locale}>
      <LocaleSync />
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <header className="sticky top-0 z-30 flex h-14 items-center justify-between gap-2 border-b border-border px-6 bg-background/80 backdrop-blur-sm">
            <SidebarTrigger className="-me-2 text-muted-foreground hover:text-foreground transition-colors duration-200" />
            <div className="flex items-center gap-2">
              <ThemeToggle />
              <UserMenu />
            </div>
          </header>
          <main className="relative z-10 flex-1 overflow-auto p-6 md:p-8">{children}</main>
        </SidebarInset>
        <WelcomeTour />
      </SidebarProvider>
    </LocaleProvider>
  );
}
