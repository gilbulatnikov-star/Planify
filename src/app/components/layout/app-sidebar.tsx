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
  Crown,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { he } from "@/lib/he";

const navItems = [
  { href: "/", label: he.nav.dashboard, icon: LayoutDashboard, tourId: "nav-dashboard" },
  { href: "/projects", label: he.nav.projects, icon: FolderKanban, tourId: "nav-projects" },
  { href: "/clients", label: he.nav.clients, icon: Users, tourId: "nav-clients" },
  { href: "/financials", label: he.nav.financials, icon: Receipt, tourId: "nav-financials" },
  { href: "/calendar", label: he.nav.calendar, icon: CalendarDays, tourId: "nav-calendar" },
  { href: "/scripts", label: he.nav.scripts, icon: FileText, tourId: "nav-scripts" },
  { href: "/contacts", label: he.nav.contacts, icon: Contact, tourId: "nav-contacts" },
  { href: "/subscriptions", label: he.nav.subscriptions, icon: CreditCard, tourId: "nav-subscriptions" },
  { href: "/inspiration", label: he.nav.inspiration, icon: Sparkles, tourId: "nav-inspiration" },
  { href: "/billing", label: he.nav.billing, icon: Crown, tourId: "nav-billing" },
];

export function AppSidebar() {
  const pathname = usePathname();

  return (
    <Sidebar side="right" collapsible="icon">
      <SidebarHeader className="border-b border-border px-4 py-4">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gray-900 text-white font-bold text-sm shadow-sm transition-all duration-300 group-hover:scale-105">
            P
          </div>
          <div className="flex flex-col group-data-[collapsible=icon]:hidden">
            <span className="text-sm font-bold tracking-tight text-gray-900">
              Planify
            </span>
            <span className="text-[11px] text-muted-foreground">
              מערכת ניהול
            </span>
          </div>
        </Link>
      </SidebarHeader>

      <SidebarContent className="pt-2">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => {
                const isActive =
                  item.href === "/"
                    ? pathname === "/"
                    : pathname.startsWith(item.href);
                return (
                  <SidebarMenuItem key={item.href} data-tour={item.tourId}>
                    <SidebarMenuButton
                      render={<Link href={item.href} />}
                      isActive={isActive}
                      tooltip={item.label}
                      className={`transition-all duration-200 ${
                        isActive
                          ? "bg-gray-900 text-white font-medium shadow-sm"
                          : "text-gray-500 hover:bg-gray-100 hover:text-gray-900"
                      }`}
                    >
                      <item.icon className="h-4 w-4" />
                      <span>{item.label}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-border p-4 group-data-[collapsible=icon]:hidden">
        <p className="text-[11px] text-muted-foreground text-center">
          Planify v1.0
        </p>
      </SidebarFooter>
    </Sidebar>
  );
}
