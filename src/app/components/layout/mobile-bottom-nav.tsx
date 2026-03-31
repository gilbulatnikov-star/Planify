"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  FolderKanban,
  Users,
  Plus,
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
  CalendarDays,
  Receipt,
  CheckSquare,
  UserPlus,
} from "lucide-react";
import { useT } from "@/lib/i18n";

export function MobileBottomNav() {
  const pathname = usePathname();
  const router = useRouter();
  const t = useT();
  const [moreOpen, setMoreOpen] = useState(false);
  const [addOpen, setAddOpen] = useState(false);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  // 4 flanking tabs (2 left, 2 right of center)
  const leftTabs = [
    { href: "/", label: "דשבורד", icon: LayoutDashboard },
    { href: "/projects", label: "פרויקטים", icon: FolderKanban },
  ];
  const rightTabs = [
    { href: "/clients", label: "לקוחות", icon: Users },
    { href: "/financials", label: "פיננסים", icon: FileBarChart2 },
  ];

  // Quick-add actions from center button
  const addActions = [
    { href: "/projects?new=1", label: "פרויקט חדש", icon: FolderKanban, color: "bg-violet-500" },
    { href: "/clients?new=1", label: "לקוח חדש", icon: UserPlus, color: "bg-blue-500" },
    { href: "/tasks?new=1", label: "משימה", icon: CheckSquare, color: "bg-emerald-500" },
    { href: "/financials?new=invoice", label: "חשבונית", icon: Receipt, color: "bg-amber-500" },
  ];

  // Secondary destinations
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

  // Shared tab appearance
  const TabItem = ({
    href,
    label,
    icon: Icon,
  }: {
    href: string;
    label: string;
    icon: React.ElementType;
  }) => {
    const active = isActive(href);
    return (
      <Link
        href={href}
        className="flex flex-1 flex-col items-center justify-end gap-[3px] pb-1 relative"
        style={{ paddingTop: 10 }}
      >
        {/* Active pill indicator */}
        <AnimatePresence>
          {active && (
            <motion.span
              layoutId="tab-indicator"
              className="absolute top-0 inset-x-0 mx-auto w-8 h-[3px] rounded-full bg-blue-600"
              initial={{ opacity: 0, scaleX: 0.5 }}
              animate={{ opacity: 1, scaleX: 1 }}
              exit={{ opacity: 0, scaleX: 0.5 }}
              transition={{ type: "spring", stiffness: 500, damping: 35 }}
            />
          )}
        </AnimatePresence>

        <Icon
          className={`transition-all duration-200 ${
            active ? "text-blue-600" : "text-foreground/30"
          }`}
          size={21}
          strokeWidth={active ? 2.1 : 1.6}
        />
        <span
          className={`text-[10px] leading-none tracking-tight transition-colors duration-200 ${
            active ? "text-blue-600 font-semibold" : "text-foreground/35 font-medium"
          }`}
        >
          {label}
        </span>
      </Link>
    );
  };

  return (
    <>
      {/* Backdrop — shared for both panels */}
      <AnimatePresence>
        {(moreOpen || addOpen) && (
          <motion.div
            className="fixed inset-0 z-40 bg-black/25 backdrop-blur-[1px] md:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            onClick={() => { setMoreOpen(false); setAddOpen(false); }}
          />
        )}
      </AnimatePresence>

      {/* ── Quick-add panel ── */}
      <AnimatePresence>
        {addOpen && (
          <motion.div
            className="fixed left-0 right-0 z-50 md:hidden px-4"
            style={{ bottom: "calc(72px + env(safe-area-inset-bottom, 16px))" }}
            initial={{ y: 24, opacity: 0, scale: 0.96 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 24, opacity: 0, scale: 0.96 }}
            transition={{ type: "spring", damping: 26, stiffness: 340 }}
          >
            <div className="rounded-2xl border border-border/50 bg-card/98 backdrop-blur-2xl shadow-[0_8px_40px_-8px_rgba(0,0,0,0.22)] overflow-hidden">
              <div className="flex items-center justify-between px-5 py-3.5 border-b border-border/30">
                <span className="text-[11px] font-bold tracking-[0.08em] uppercase text-foreground/35">
                  הוספה מהירה
                </span>
                <button
                  onClick={() => setAddOpen(false)}
                  className="flex h-6 w-6 items-center justify-center rounded-full bg-foreground/[0.06] text-foreground/40 transition-colors hover:bg-foreground/10"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
              <div className="grid grid-cols-2 gap-px bg-border/20">
                {addActions.map((action) => (
                  <Link
                    key={action.href}
                    href={action.href}
                    onClick={() => setAddOpen(false)}
                    className="flex items-center gap-3 bg-card px-4 py-4 transition-colors active:bg-foreground/[0.04]"
                  >
                    <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${action.color}`}>
                      <action.icon className="h-4 w-4 text-white" strokeWidth={2} />
                    </div>
                    <span className="text-[13px] font-semibold text-foreground/80">
                      {action.label}
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── More panel ── */}
      <AnimatePresence>
        {moreOpen && (
          <motion.div
            className="fixed left-0 right-0 z-50 md:hidden px-3"
            style={{ bottom: "calc(72px + env(safe-area-inset-bottom, 16px))" }}
            initial={{ y: 32, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 32, opacity: 0 }}
            transition={{ type: "spring", damping: 28, stiffness: 320 }}
          >
            <div className="rounded-2xl border border-border/50 bg-card/98 backdrop-blur-2xl shadow-[0_-8px_40px_-8px_rgba(0,0,0,0.18)] overflow-hidden">
              <div className="flex items-center justify-between px-5 py-3.5 border-b border-border/30">
                <span className="text-[11px] font-bold tracking-[0.08em] uppercase text-foreground/35">
                  ניווט
                </span>
                <button
                  onClick={() => setMoreOpen(false)}
                  className="flex h-6 w-6 items-center justify-center rounded-full bg-foreground/[0.06] text-foreground/40 transition-colors hover:bg-foreground/10"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>

              <div className="divide-y divide-border/25 max-h-[52vh] overflow-y-auto overscroll-contain">
                {moreItems.map((item) => {
                  const active = isActive(item.href);
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMoreOpen(false)}
                      className={`flex items-center gap-4 px-5 py-3.5 transition-colors ${
                        active ? "bg-blue-500/[0.05]" : "active:bg-foreground/[0.03]"
                      }`}
                    >
                      <div
                        className={`flex h-9 w-9 items-center justify-center rounded-[10px] shrink-0 ${
                          active ? "bg-blue-500/10" : "bg-foreground/[0.05]"
                        }`}
                      >
                        <item.icon
                          className={`h-[17px] w-[17px] ${
                            active ? "text-blue-600" : "text-foreground/35"
                          }`}
                          strokeWidth={1.8}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p
                          className={`text-[13.5px] font-semibold leading-tight ${
                            active ? "text-blue-600" : "text-foreground/75"
                          }`}
                        >
                          {item.label}
                        </p>
                        <p className="text-[11px] text-foreground/30 mt-0.5">{item.sub}</p>
                      </div>
                      <ChevronLeft
                        className={`h-3.5 w-3.5 shrink-0 ${
                          active ? "text-blue-500/40" : "text-foreground/15"
                        }`}
                      />
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
        style={{ paddingBottom: "max(env(safe-area-inset-bottom, 0px), 8px)" }}
      >
        {/* Frosted glass bar */}
        <div className="relative border-t border-border/30 bg-background/90 backdrop-blur-2xl">
          <div className="flex items-end h-[58px]">
            {/* Left tabs */}
            {leftTabs.map((tab) => (
              <TabItem key={tab.href} {...tab} />
            ))}

            {/* Center dominant tab */}
            <div className="flex flex-1 flex-col items-center justify-end pb-1 relative">
              <motion.button
                onClick={() => { setAddOpen((v) => !v); setMoreOpen(false); }}
                className={`flex h-[50px] w-[50px] -translate-y-3 items-center justify-center rounded-full shadow-lg transition-shadow ${
                  addOpen
                    ? "bg-blue-700 shadow-blue-700/40"
                    : "bg-blue-600 shadow-blue-600/35"
                }`}
                whileTap={{ scale: 0.91 }}
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
              >
                <motion.div
                  animate={{ rotate: addOpen ? 45 : 0 }}
                  transition={{ type: "spring", stiffness: 400, damping: 25 }}
                >
                  <Plus className="h-[22px] w-[22px] text-white" strokeWidth={2.5} />
                </motion.div>
              </motion.button>
            </div>

            {/* Right tabs */}
            {rightTabs.map((tab) => (
              <TabItem key={tab.href} {...tab} />
            ))}

            {/* More tab */}
            <button
              onClick={() => { setMoreOpen((v) => !v); setAddOpen(false); }}
              className="flex flex-1 flex-col items-center justify-end gap-[3px] pb-1 relative"
              style={{ paddingTop: 10 }}
            >
              <AnimatePresence>
                {moreOpen && (
                  <motion.span
                    className="absolute top-0 inset-x-0 mx-auto w-8 h-[3px] rounded-full bg-blue-600"
                    initial={{ opacity: 0, scaleX: 0.5 }}
                    animate={{ opacity: 1, scaleX: 1 }}
                    exit={{ opacity: 0, scaleX: 0.5 }}
                    transition={{ type: "spring", stiffness: 500, damping: 35 }}
                  />
                )}
              </AnimatePresence>
              <MoreHorizontal
                className={`transition-all duration-200 ${
                  moreOpen ? "text-blue-600" : "text-foreground/30"
                }`}
                size={21}
                strokeWidth={moreOpen ? 2.1 : 1.6}
              />
              <span
                className={`text-[10px] leading-none tracking-tight transition-colors duration-200 ${
                  moreOpen ? "text-blue-600 font-semibold" : "text-foreground/35 font-medium"
                }`}
              >
                {t.nav.more}
              </span>
            </button>
          </div>
        </div>
      </nav>
    </>
  );
}
