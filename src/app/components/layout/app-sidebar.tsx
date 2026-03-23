"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FolderKanban,
  Users,
  Receipt,
  CalendarDays,
  Contact,
  CreditCard,
  Sparkles,
  FileText,
  LayoutTemplate,
  ChevronDown,
  FileBarChart2,
  Crown,
  ListTodo,
  LogOut,
} from "lucide-react";
import { useState } from "react";
import { useSession, signOut } from "next-auth/react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";
import { useT, useLocale } from "@/lib/i18n";

export function AppSidebar() {
  const he = useT();
  const locale = useLocale();
  const isRTL = locale === "he";

  // Shared className for all menu buttons
  const btnBase = `${isRTL ? "!text-right" : "!text-left"} transition-all duration-200`;
  const btnActive = `${btnBase} bg-foreground text-background font-medium shadow-sm`;
  const btnIdle   = `${btnBase} text-muted-foreground hover:bg-muted hover:text-foreground`;
  const pathname = usePathname();
  const { data: session } = useSession();
  const { state } = useSidebar();
  const isCollapsed = state === "collapsed";

  const navItems = [
    { href: "/", label: he.nav.dashboard, icon: LayoutDashboard, tourId: "nav-dashboard" },
    { href: "/projects", label: he.nav.projects, icon: FolderKanban, tourId: "nav-projects" },
    { href: "/clients", label: he.nav.clients, icon: Users, tourId: "nav-clients" },
    { href: "/calendar", label: he.nav.calendar, icon: CalendarDays, tourId: "nav-calendar" },
    { href: "/scripts", label: he.nav.scripts, icon: FileText, tourId: "nav-scripts" },
    { href: "/contacts", label: he.nav.contacts, icon: Contact, tourId: "nav-contacts" },
    { href: "/inspiration", label: he.nav.inspiration, icon: Sparkles, tourId: "nav-inspiration" },
    { href: "/moodboard", label: he.nav.moodboard, icon: LayoutTemplate, tourId: "nav-moodboard" },
    { href: "/tasks", label: he.widgets.todos, icon: ListTodo, tourId: "nav-tasks" },
  ];

  const financialsSubItems = [
    { href: "/financials", label: he.financial.invoices + " " + he.financial.quotes, icon: Receipt },
    { href: "/subscriptions", label: he.nav.subscriptions, icon: CreditCard },
  ];

  const isFinancialsActive =
    pathname.startsWith("/financials") || pathname.startsWith("/subscriptions");

  const [financialsOpen, setFinancialsOpen] = useState(isFinancialsActive);

  const user = session?.user;
  const initials = user?.name
    ? user.name.split(" ").map((n: string) => n[0]).join("").slice(0, 2).toUpperCase()
    : user?.email?.[0]?.toUpperCase() ?? "U";

  return (
    <Sidebar side={isRTL ? "right" : "left"} collapsible="icon" dir={isRTL ? "rtl" : "ltr"}>
      {/* ── Logo header ── */}
      <SidebarHeader className="border-b border-border px-3 py-3">
        <div className="flex w-full items-center gap-2">
          {/* Logo — expanded */}
          <Link href="/" className="flex items-center gap-1.5 group-data-[collapsible=icon]:hidden select-none">
            <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 shrink-0">
              <rect width="32" height="32" rx="8" fill="#38b6ff"/>
              <path d="M11 8h6a5 5 0 0 1 0 10h-6V8Zm3 3v4h3a2 2 0 1 0 0-4h-3Z" fill="white"/>
              <rect x="11" y="20" width="3" height="4" rx="0.5" fill="white" opacity="0.7"/>
            </svg>
            <span className="text-base font-bold tracking-tight text-foreground">Planify</span>
          </Link>
          {/* Logo — collapsed */}
          <Link href="/" className="hidden group-data-[collapsible=icon]:flex items-center">
            <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-7 w-7">
              <rect width="32" height="32" rx="8" fill="#38b6ff"/>
              <path d="M11 8h6a5 5 0 0 1 0 10h-6V8Zm3 3v4h3a2 2 0 1 0 0-4h-3Z" fill="white"/>
              <rect x="11" y="20" width="3" height="4" rx="0.5" fill="white" opacity="0.7"/>
            </svg>
          </Link>
        </div>
      </SidebarHeader>

      {/* ── Main nav ── */}
      <SidebarContent className="pt-2">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => {
                const isActive =
                  item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
                return (
                  <SidebarMenuItem key={item.href} data-tour={item.tourId}>
                    <SidebarMenuButton
                      render={<Link href={item.href} />}
                      isActive={isActive}
                      tooltip={item.label}
                      className={isActive ? btnActive : btnIdle}
                    >
                      {/* icon first → rightmost in RTL flex → icon on far right */}
                      <item.icon className="h-4 w-4 shrink-0" />
                      <span className="truncate">{item.label}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}

              {/* ── כספים (collapsible) ── */}
              <SidebarMenuItem data-tour="nav-financials">
                <SidebarMenuButton
                  render={isCollapsed ? <Link href="/financials" /> : undefined}
                  onClick={isCollapsed ? undefined : () => setFinancialsOpen((v) => !v)}
                  isActive={isFinancialsActive}
                  tooltip={he.nav.financials}
                  className={isFinancialsActive ? btnActive : btnIdle}
                >
                  <FileBarChart2 className="h-4 w-4 shrink-0" />
                  <span className="truncate">{he.nav.financials}</span>
                  <ChevronDown
                    className={`h-3.5 w-3.5 shrink-0 transition-transform duration-200 group-data-[collapsible=icon]:hidden ${
                      financialsOpen ? "rotate-180" : ""
                    }`}
                  />
                </SidebarMenuButton>

                {financialsOpen && (
                  <SidebarMenuSub>
                    {financialsSubItems.map((sub) => {
                      const isSubActive = pathname.startsWith(sub.href);
                      return (
                        <SidebarMenuSubItem key={sub.href}>
                          <SidebarMenuSubButton
                            render={<Link href={sub.href} />}
                            isActive={isSubActive}
                            className={`!text-right transition-all duration-200 ${
                              isSubActive
                                ? "bg-[#38b6ff]/10 text-foreground font-medium"
                                : "text-muted-foreground hover:bg-[#38b6ff]/5 hover:text-foreground"
                            }`}
                          >
                            <sub.icon className="h-3.5 w-3.5 shrink-0" />
                            <span className="truncate">{sub.label}</span>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      );
                    })}
                  </SidebarMenuSub>
                )}
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* ── Footer: billing + sign out ── */}
      <SidebarFooter className="border-t border-border p-3 space-y-1">
        <SidebarMenuButton
          render={<Link href="/billing" />}
          isActive={pathname.startsWith("/billing")}
          tooltip={he.nav.billing}
          className={pathname.startsWith("/billing") ? btnActive : btnIdle}
        >
          <Crown className="h-4 w-4 shrink-0" />
          <span className="truncate group-data-[collapsible=icon]:hidden">{he.common.billingPlan}</span>
        </SidebarMenuButton>
        <SidebarMenuButton
          onClick={() => signOut({ callbackUrl: "/login" })}
          tooltip={he.common.signOut}
          className={`${btnIdle} cursor-pointer`}
        >
          <LogOut className="h-4 w-4 shrink-0" />
          <span className="truncate group-data-[collapsible=icon]:hidden">{he.common.signOut}</span>
        </SidebarMenuButton>
      </SidebarFooter>
    </Sidebar>
  );
}
