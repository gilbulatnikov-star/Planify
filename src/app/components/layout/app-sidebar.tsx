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
} from "lucide-react";
import { useState } from "react";
import { useSession } from "next-auth/react";
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
import { he } from "@/lib/he";

const navItems = [
  { href: "/", label: he.nav.dashboard, icon: LayoutDashboard, tourId: "nav-dashboard" },
  { href: "/projects", label: he.nav.projects, icon: FolderKanban, tourId: "nav-projects" },
  { href: "/clients", label: he.nav.clients, icon: Users, tourId: "nav-clients" },
  { href: "/calendar", label: he.nav.calendar, icon: CalendarDays, tourId: "nav-calendar" },
  { href: "/scripts", label: he.nav.scripts, icon: FileText, tourId: "nav-scripts" },
  { href: "/contacts", label: he.nav.contacts, icon: Contact, tourId: "nav-contacts" },
  { href: "/inspiration", label: he.nav.inspiration, icon: Sparkles, tourId: "nav-inspiration" },
  { href: "/moodboard", label: he.nav.moodboard, icon: LayoutTemplate, tourId: "nav-moodboard" },
  { href: "/tasks", label: "משימות", icon: ListTodo, tourId: "nav-tasks" },
];

const financialsSubItems = [
  { href: "/financials", label: "חשבוניות והצעות מחיר", icon: Receipt },
  { href: "/subscriptions", label: he.nav.subscriptions, icon: CreditCard },
];

// Shared className for all menu buttons – overrides the hardcoded text-left
const btnBase = "!text-right transition-all duration-200";
const btnActive = `${btnBase} bg-[#0a0a0a] text-white font-medium shadow-sm`;
const btnIdle   = `${btnBase} text-gray-500 hover:bg-gray-100 hover:text-[#0a0a0a]`;

export function AppSidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const { state } = useSidebar();
  const isCollapsed = state === "collapsed";

  const isFinancialsActive =
    pathname.startsWith("/financials") || pathname.startsWith("/subscriptions");

  const [financialsOpen, setFinancialsOpen] = useState(isFinancialsActive);

  const user = session?.user;
  const initials = user?.name
    ? user.name.split(" ").map((n: string) => n[0]).join("").slice(0, 2).toUpperCase()
    : user?.email?.[0]?.toUpperCase() ?? "U";

  return (
    <Sidebar side="right" collapsible="icon" dir="rtl">
      {/* ── Logo header ── */}
      <SidebarHeader className="border-b border-border px-4 py-3">
        <Link href="/" className="flex w-full items-center gap-2.5 group">
          {/* Icon mark — Q with blue drop */}
          <div className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-[12px] bg-[#0a0a0a] shadow-sm transition-all duration-300 group-hover:scale-105 overflow-hidden">
            <svg viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-7 w-7">
              <rect x="3" y="3" width="30" height="30" rx="9" fill="#0a0a0a"/>
              <rect x="9" y="8" width="18" height="12" rx="5" fill="white"/>
              <ellipse cx="24" cy="25" rx="5" ry="6.5" fill="#38b6ff" transform="rotate(-15 24 25)"/>
            </svg>
          </div>
          <div className="flex flex-col items-end group-data-[collapsible=icon]:hidden">
            <span className="text-sm font-black tracking-tight text-[#0a0a0a]">Qlipy</span>
            <span className="text-[11px] text-muted-foreground">מערכת ניהול</span>
          </div>
        </Link>
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
                  <ChevronDown
                    className={`h-3.5 w-3.5 shrink-0 transition-transform duration-200 ${
                      financialsOpen ? "rotate-180" : ""
                    }`}
                  />
                  <span className="truncate">{he.nav.financials}</span>
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
                                ? "bg-[#38b6ff]/10 text-[#0a0a0a] font-medium"
                                : "text-gray-500 hover:bg-[#38b6ff]/5 hover:text-[#0a0a0a]"
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

      {/* ── Footer: subscription + profile ── */}
      <SidebarFooter className="border-t border-border p-3 space-y-1">
        {/* Billing */}
        <SidebarMenuButton
          render={<Link href="/billing" />}
          isActive={pathname.startsWith("/billing")}
          tooltip="ניהול המנוי"
          className={pathname.startsWith("/billing") ? btnActive : btnIdle}
        >
          <Crown className="h-4 w-4 shrink-0" />
          <span className="truncate group-data-[collapsible=icon]:hidden">ניהול המנוי</span>
        </SidebarMenuButton>

        {/* Profile */}
        <SidebarMenuButton
          render={<Link href="/settings/profile" />}
          isActive={pathname.startsWith("/settings")}
          tooltip={user?.name ?? "פרופיל"}
          className={`${pathname.startsWith("/settings") ? btnActive : btnIdle} gap-2`}
        >
          <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#0a0a0a] text-white text-[10px] font-bold">
            {initials}
          </div>
          <span className="truncate text-sm group-data-[collapsible=icon]:hidden">
            {user?.name ?? user?.email ?? "פרופיל"}
          </span>
        </SidebarMenuButton>
      </SidebarFooter>
    </Sidebar>
  );
}
