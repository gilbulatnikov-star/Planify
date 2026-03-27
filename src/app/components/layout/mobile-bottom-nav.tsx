"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  UserPlus,
  FolderKanban,
  CalendarDays,
  MoreHorizontal,
  X,
  Users,
  FileText,
  Contact,
  Sparkles,
  LayoutTemplate,
  ListTodo,
  Zap,
  FileBarChart2,
  CreditCard,
} from "lucide-react";
import { useT } from "@/lib/i18n";

export function MobileBottomNav() {
  const pathname = usePathname();
  const t = useT();
  const [moreOpen, setMoreOpen] = useState(false);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  const mainItems = [
    { href: "/", label: t.nav.dashboard, icon: LayoutDashboard },
    { href: "/leads", label: t.leads?.title ?? "לידים", icon: UserPlus },
    { href: "/projects", label: t.nav.projects, icon: FolderKanban },
    { href: "/calendar", label: t.nav.calendar, icon: CalendarDays },
  ];

  const moreItems = [
    { href: "/clients", label: t.nav.clients, icon: Users },
    { href: "/scripts", label: t.nav.scripts, icon: FileText },
    { href: "/contacts", label: t.nav.contacts, icon: Contact },
    { href: "/inspiration", label: t.nav.inspiration, icon: Sparkles },
    { href: "/moodboard", label: t.nav.moodboard, icon: LayoutTemplate },
    { href: "/tasks", label: t.widgets?.todos ?? "משימות", icon: ListTodo },
    { href: "/automations", label: t.automations?.title ?? "אוטומציות", icon: Zap },
    { href: "/financials", label: t.nav.financials, icon: FileBarChart2 },
    { href: "/subscriptions", label: t.nav.subscriptions, icon: CreditCard },
  ];

  return (
    <>
      {/* Overlay when "More" menu is open */}
      <AnimatePresence>
        {moreOpen && (
          <motion.div
            className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm md:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setMoreOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Slide-up "More" menu */}
      <AnimatePresence>
        {moreOpen && (
          <motion.div
            className="fixed bottom-0 left-0 right-0 z-50 rounded-t-2xl border-t border-border bg-card/95 backdrop-blur-lg pb-[env(safe-area-inset-bottom)] md:hidden"
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-border px-5 py-3">
              <h3 className="text-sm font-semibold text-foreground">{t.nav.more}</h3>
              <button
                onClick={() => setMoreOpen(false)}
                className="rounded-full p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Grid of items */}
            <div className="grid grid-cols-3 gap-1 p-3 overflow-y-auto max-h-[60vh]">
              {moreItems.map((item) => {
                const active = isActive(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMoreOpen(false)}
                    className={`flex flex-col items-center gap-1.5 rounded-xl px-2 py-3 text-xs transition-colors ${
                      active
                        ? "bg-foreground/10 font-semibold text-foreground"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    }`}
                  >
                    <item.icon className="h-5 w-5" />
                    <span className="truncate">{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bottom nav bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 flex items-center justify-around border-t border-border bg-card/80 backdrop-blur-lg pb-[env(safe-area-inset-bottom)] md:hidden">
        {mainItems.map((item) => {
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-1 flex-col items-center gap-0.5 py-2 text-[10px] transition-colors ${
                active
                  ? "font-semibold text-[#38b6ff]"
                  : "text-muted-foreground"
              }`}
            >
              <item.icon className={`h-5 w-5 ${active ? "text-[#38b6ff]" : ""}`} />
              <span>{item.label}</span>
            </Link>
          );
        })}

        {/* More button */}
        <button
          onClick={() => setMoreOpen((v) => !v)}
          className={`flex flex-1 flex-col items-center gap-0.5 py-2 text-[10px] transition-colors ${
            moreOpen
              ? "font-semibold text-[#38b6ff]"
              : "text-muted-foreground"
          }`}
        >
          <MoreHorizontal className={`h-5 w-5 ${moreOpen ? "text-[#38b6ff]" : ""}`} />
          <span>{t.nav.more}</span>
        </button>
      </nav>
    </>
  );
}
