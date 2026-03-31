"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FolderKanban,
  Users,
  UserPlus,
  CalendarDays,
  Contact,
  Sparkles,
  FileText,
  LayoutTemplate,
  FileBarChart2,
  Crown,
  ListTodo,
  Zap,
  LogOut,
  BarChart3,
} from "lucide-react";
// import { useState } from "react";
import { useSession, signOut } from "next-auth/react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";
import { useT, useLocale } from "@/lib/i18n";

export function AppSidebar() {
  const he = useT();
  const locale = useLocale();
  const isRTL = locale === "he";

  // Shared className for all menu buttons — premium charcoal sidebar
  const btnBase = `${isRTL ? "!text-right" : "!text-left"} transition-all duration-200 rounded-[9px] md:text-[14.5px] text-[16px] tracking-[-0.01em] md:py-2.5 py-4`;
  const btnActive = `${btnBase} bg-white/[0.08] text-white font-semibold shadow-[inset_0_1px_0_rgba(255,255,255,0.04),0_1px_2px_rgba(0,0,0,0.15)]`;
  const btnIdle   = `${btnBase} text-sidebar-foreground hover:text-white/85 hover:bg-white/[0.05]`;
  const pathname = usePathname();
  const { data: session } = useSession();
  const { state } = useSidebar();
  const isCollapsed = state === "collapsed";

  // Grouped navigation
  const mainItems = [
    { href: "/", label: he.nav.dashboard, icon: LayoutDashboard, tourId: "nav-dashboard" },
  ];

  const workItems = [
    { href: "/projects", label: he.nav.projects, icon: FolderKanban, tourId: "nav-projects" },
    { href: "/clients", label: he.nav.clients, icon: Users, tourId: "nav-clients" },
    { href: "/contacts", label: he.nav.contacts, icon: Contact, tourId: "nav-contacts" },
  ];

  const contentItems = [
    { href: "/calendar", label: he.nav.calendar, icon: CalendarDays, tourId: "nav-calendar" },
    { href: "/scripts", label: he.nav.scripts, icon: FileText, tourId: "nav-scripts" },
    { href: "/inspiration", label: he.nav.inspiration, icon: Sparkles, tourId: "nav-inspiration" },
    { href: "/moodboard", label: he.nav.moodboard, icon: LayoutTemplate, tourId: "nav-moodboard" },
  ];

  const managementItems = [
    { href: "/financials", label: he.nav.financials, icon: FileBarChart2, tourId: "nav-financials" },
    { href: "/tasks", label: he.widgets.todos, icon: ListTodo, tourId: "nav-tasks" },
    { href: "/reports", label: "דוחות", icon: BarChart3, tourId: "nav-reports" },
  ];

  const groupLabelClass = "text-[10px] font-semibold uppercase tracking-[0.12em] text-white/30 px-3 mb-1 group-data-[collapsible=icon]:hidden";

  const user = session?.user;
  const initials = user?.name
    ? user.name.split(" ").map((n: string) => n[0]).join("").slice(0, 2).toUpperCase()
    : user?.email?.[0]?.toUpperCase() ?? "U";

  return (
    <Sidebar side={isRTL ? "right" : "left"} collapsible="icon" dir={isRTL ? "rtl" : "ltr"}>
      {/* ── Logo header ── */}
      <SidebarHeader className="border-b border-sidebar-border/60 px-3 py-4">
        <div className="flex w-full items-center gap-2.5">
          {/* Logo — expanded (wordmark only) */}
          <Link href="/" className="flex items-center group-data-[collapsible=icon]:hidden select-none">
            <img src="/qlipy-wordmark.svg" alt="Qlipy" className="h-7 w-auto" />
          </Link>
          {/* Logo — collapsed (Q letter) */}
          <Link href="/" className="hidden group-data-[collapsible=icon]:flex items-center justify-center">
            <span className="text-white font-black text-xl tracking-tight">Q</span>
          </Link>
        </div>
      </SidebarHeader>

      {/* ── Main nav ── */}
      <SidebarContent className="pt-2">
        {/* ── ראשי ── */}
        <SidebarGroup className="pb-1">
          <SidebarGroupContent>
            <SidebarMenu>
              {mainItems.map((item) => {
                const isActive = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
                return (
                  <SidebarMenuItem key={item.href} data-tour={item.tourId}>
                    <SidebarMenuButton
                      render={<Link href={item.href} />}
                      isActive={isActive}
                      tooltip={item.label}
                      className={isActive ? btnActive : btnIdle}
                    >
                      <item.icon className="md:h-5 md:w-5 h-6 w-6 shrink-0" />
                      <span className="truncate">{item.label}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* ── עבודה ── */}
        <SidebarGroup className="py-1">
          <SidebarGroupLabel className={groupLabelClass}>עבודה</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {workItems.map((item) => {
                const isActive = pathname.startsWith(item.href);
                return (
                  <SidebarMenuItem key={item.href} data-tour={item.tourId}>
                    <SidebarMenuButton
                      render={<Link href={item.href} />}
                      isActive={isActive}
                      tooltip={item.label}
                      className={isActive ? btnActive : btnIdle}
                    >
                      <item.icon className="md:h-5 md:w-5 h-6 w-6 shrink-0" />
                      <span className="truncate">{item.label}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* ── תוכן ── */}
        <SidebarGroup className="py-1">
          <SidebarGroupLabel className={groupLabelClass}>תוכן</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {contentItems.map((item) => {
                const isActive = pathname.startsWith(item.href);
                return (
                  <SidebarMenuItem key={item.href} data-tour={item.tourId}>
                    <SidebarMenuButton
                      render={<Link href={item.href} />}
                      isActive={isActive}
                      tooltip={item.label}
                      className={isActive ? btnActive : btnIdle}
                    >
                      <item.icon className="md:h-5 md:w-5 h-6 w-6 shrink-0" />
                      <span className="truncate">{item.label}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* ── ניהול ── */}
        <SidebarGroup className="py-1">
          <SidebarGroupLabel className={groupLabelClass}>ניהול</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {managementItems.map((item) => {
                const isActive = pathname.startsWith(item.href);
                return (
                  <SidebarMenuItem key={item.href} data-tour={item.tourId}>
                    <SidebarMenuButton
                      render={<Link href={item.href} />}
                      isActive={isActive}
                      tooltip={item.label}
                      className={isActive ? btnActive : btnIdle}
                    >
                      <item.icon className="md:h-5 md:w-5 h-6 w-6 shrink-0" />
                      <span className="truncate">{item.label}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* ── Footer: billing + sign out ── */}
      <SidebarFooter className="border-t border-sidebar-border/60 p-3 space-y-0.5">
        <SidebarMenuButton
          render={<Link href="/billing" />}
          isActive={pathname.startsWith("/billing")}
          tooltip={he.nav.billing}
          className={pathname.startsWith("/billing") ? btnActive : btnIdle}
        >
          <Crown className="h-5 w-5 shrink-0 text-amber-400" />
          <span className="truncate group-data-[collapsible=icon]:hidden">{he.common.billingPlan}</span>
        </SidebarMenuButton>
        <SidebarMenuButton
          onClick={() => signOut({ callbackUrl: "/login" })}
          tooltip={he.common.signOut}
          className={`${btnIdle} cursor-pointer`}
        >
          <LogOut className="h-5 w-5 shrink-0 text-red-400" />
          <span className="truncate group-data-[collapsible=icon]:hidden">{he.common.signOut}</span>
        </SidebarMenuButton>
      </SidebarFooter>
    </Sidebar>
  );
}
