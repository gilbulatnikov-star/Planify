"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FolderKanban,
  Users,
  Camera,
  Receipt,
  CalendarDays,
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
  { href: "/", label: he.nav.dashboard, icon: LayoutDashboard },
  { href: "/projects", label: he.nav.projects, icon: FolderKanban },
  { href: "/clients", label: he.nav.clients, icon: Users },
  { href: "/equipment", label: he.nav.equipment, icon: Camera },
  { href: "/financials", label: he.nav.financials, icon: Receipt },
  { href: "/calendar", label: he.nav.calendar, icon: CalendarDays },
];

export function AppSidebar() {
  const pathname = usePathname();

  return (
    <Sidebar side="right" collapsible="icon">
      <SidebarHeader className="border-b border-white/[0.06] px-4 py-4">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-400 to-teal-500 text-white font-bold text-sm shadow-lg shadow-cyan-500/20 transition-all duration-300 group-hover:shadow-cyan-500/40 group-hover:scale-105">
            GP
          </div>
          <div className="flex flex-col group-data-[collapsible=icon]:hidden">
            <span className="text-sm font-bold tracking-tight bg-gradient-to-l from-cyan-300 to-white bg-clip-text text-transparent">
              Gil Productions
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
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      render={<Link href={item.href} />}
                      isActive={isActive}
                      tooltip={item.label}
                      className={`transition-all duration-200 ${
                        isActive
                          ? "bg-cyan-500/10 text-cyan-400 border-cyan-500/20 shadow-sm shadow-cyan-500/5"
                          : "hover:bg-white/[0.04] text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      <item.icon className={`h-4 w-4 ${isActive ? "text-cyan-400" : ""}`} />
                      <span>{item.label}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-white/[0.06] p-4 group-data-[collapsible=icon]:hidden">
        <p className="text-[11px] text-muted-foreground/60 text-center">
          Gil Productions CRM v1.0
        </p>
      </SidebarFooter>
    </Sidebar>
  );
}
