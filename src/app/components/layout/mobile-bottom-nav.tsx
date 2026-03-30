"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  FolderKanban,
  Users,
  CalendarDays,
  MoreHorizontal,
  X,
  FileText,
  Contact,
  Sparkles,
  LayoutTemplate,
  ListTodo,
  FileBarChart2,
  BarChart3,
  Settings,
  ChevronLeft,
} from "lucide-react";
import { useT } from "@/lib/i18n";

export function MobileBottomNav() {
  const pathname = usePathname();
  const t = useT();
  const [moreOpen, setMoreOpen] = useState(false);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  // 4 primary tabs — most-used destinations
  const mainItems = [
    { href: "/", label: t.nav.dashboard, icon: LayoutDashboard },
    { href: "/projects", label: t.nav.projects, icon: FolderKanban },
    { href: "/clients", label: t.nav.clients, icon: Users },
    { href: "/financials", label: t.nav.financials, icon: FileBarChart2 },
  ];

  // Secondary destinations in the "more" panel — grouped list with chevron
  const moreItems = [
    { href: "/calendar", label: t.nav.calendar, icon: CalendarDays, sub: "תוכן ולוח זמנים" },
    { href: "/tasks", label: t.widgets?.todos ?? "משימות", icon: ListTodo, sub: "מעקב ותזכורות" },
    { href: "/scripts", label: t.nav.scripts, icon: FileText, sub: "תסריטים ומסמכים" },
    { href: "/contacts", label: t.nav.contacts, icon: Contact, sub: "אנשי קשר" },
    { href: "/inspiration", label: t.nav.inspiration, icon: Sparkles, sub: "השראה ורעיונות" },
    { href: "/moodboard", label: t.nav.moodboard, icon: LayoutTemplate, sub: "לוח מצב רוח" },
    { href: "/reports", label: "דוחות", icon: BarChart3, sub: "נתונים עסקיים" },
    { href: "/settings/profile", label: "הגדרות", icon: Settings, sub: "חשבון והגדרות" },
  ];

  return (
    <>
      {/* Backdrop */}
      <AnimatePresence>
        {moreOpen && (
          <motion.div
            className="fixed inset-0 z-40 bg-black/30 backdrop-blur-[2px] md:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            onClick={() => setMoreOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* "More" slide-up panel — clean list style */}
      <AnimatePresence>
        {moreOpen && (
          <motion.div
            className="fixed left-0 right-0 z-50 md:hidden"
            style={{ bottom: "calc(3.5rem + env(safe-area-inset-bottom, 0px))" }}
            initial={{ y: "100%", opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: "100%", opacity: 0 }}
            transition={{ type: "spring", damping: 28, stiffness: 320 }}
          >
            <div className="mx-3 mb-2 rounded-2xl border border-border/60 bg-card/98 backdrop-blur-xl shadow-[0_-8px_40px_-8px_rgba(0,0,0,0.18)] overflow-hidden">
              {/* Panel header */}
              <div className="flex items-center justify-between border-b border-border/40 px-5 py-3.5">
                <span className="text-[11px] font-bold tracking-[0.1em] uppercase text-foreground/40">ניווט</span>
                <button
                  onClick={() => setMoreOpen(false)}
                  className="flex h-7 w-7 items-center justify-center rounded-full bg-foreground/[0.06] text-foreground/50 hover:bg-foreground/10 hover:text-foreground/70 transition-colors"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>

              {/* List items */}
              <div className="divide-y divide-border/30 max-h-[55vh] overflow-y-auto overscroll-contain">
                {moreItems.map((item) => {
                  const active = isActive(item.href);
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMoreOpen(false)}
                      className={`flex items-center gap-4 px-5 py-3.5 transition-colors ${
                        active
                          ? "bg-[#2563eb]/[0.05]"
                          : "hover:bg-foreground/[0.025]"
                      }`}
                    >
                      <div className={`flex h-9 w-9 items-center justify-center rounded-[10px] shrink-0 transition-colors ${
                        active
                          ? "bg-[#2563eb]/10"
                          : "bg-foreground/[0.05]"
                      }`}>
                        <item.icon className={`h-[18px] w-[18px] transition-colors ${
                          active ? "text-[#2563eb]" : "text-foreground/40"
                        }`} strokeWidth={1.8} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-[14px] font-semibold leading-tight ${
                          active ? "text-[#2563eb]" : "text-foreground/80"
                        }`}>
                          {item.label}
                        </p>
                        <p className="text-[11px] text-foreground/35 mt-px">{item.sub}</p>
                      </div>
                      <ChevronLeft className={`h-4 w-4 shrink-0 transition-colors ${
                        active ? "text-[#2563eb]/50" : "text-foreground/20"
                      }`} />
                    </Link>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Bottom tab bar ── */}
      <nav
        className="fixed bottom-0 left-0 right-0 z-50 md:hidden"
        style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
      >
        {/* Thin top border */}
        <div className="h-px bg-border/50" />
        <div className="flex items-stretch bg-card/95 backdrop-blur-xl">
          {mainItems.map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex flex-1 flex-col items-center justify-center gap-1 py-2.5 transition-colors relative"
              >
                {/* Active indicator dot */}
                {active && (
                  <span className="absolute top-0 left-1/2 -translate-x-1/2 w-5 h-[2px] rounded-full bg-[#2563eb]" />
                )}
                <item.icon
                  className={`h-[22px] w-[22px] transition-colors ${
                    active ? "text-[#2563eb]" : "text-foreground/35"
                  }`}
                  strokeWidth={active ? 2 : 1.7}
                />
                <span className={`text-[10px] font-semibold tracking-tight transition-colors ${
                  active ? "text-[#2563eb]" : "text-foreground/40"
                }`}>
                  {item.label}
                </span>
              </Link>
            );
          })}

          {/* More button */}
          <button
            onClick={() => setMoreOpen((v) => !v)}
            className="flex flex-1 flex-col items-center justify-center gap-1 py-2.5 transition-colors relative"
          >
            {moreOpen && (
              <span className="absolute top-0 left-1/2 -translate-x-1/2 w-5 h-[2px] rounded-full bg-[#2563eb]" />
            )}
            <MoreHorizontal
              className={`h-[22px] w-[22px] transition-colors ${
                moreOpen ? "text-[#2563eb]" : "text-foreground/35"
              }`}
              strokeWidth={moreOpen ? 2 : 1.7}
            />
            <span className={`text-[10px] font-semibold tracking-tight transition-colors ${
              moreOpen ? "text-[#2563eb]" : "text-foreground/40"
            }`}>
              {t.nav.more}
            </span>
          </button>
        </div>
      </nav>
    </>
  );
}
