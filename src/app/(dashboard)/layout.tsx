export const dynamic = "force-dynamic";

import { SidebarProvider, SidebarTrigger, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/app/components/layout/app-sidebar";
import { UserMenu } from "@/app/components/layout/user-menu";
import { WelcomeTour } from "@/app/components/layout/welcome-tour";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-14 items-center justify-between gap-2 border-b border-border px-6 bg-background/80 backdrop-blur-sm">
          <SidebarTrigger className="-me-2 text-muted-foreground hover:text-foreground transition-colors duration-200" />
          <UserMenu />
        </header>
        <main className="flex-1 overflow-auto p-6 md:p-8">{children}</main>
      </SidebarInset>
      <WelcomeTour />
    </SidebarProvider>
  );
}
