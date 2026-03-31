"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
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
  const t = useT();
  const [moreOpen, setMoreOpen] = useState(false);
  const [addOpen, setAddOpen] = useState(false);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  const leftTabs = [
    { href: "/", label: "דשבורד", icon: LayoutDashboard },
    { href: "/projects", label: "פרויקטים", icon: FolderKanban },
  ];
  const rightTabs = [
    { href: "/clients", label: "לקוחות", icon: Users },
    { href: "/financials", label: "פיננסים", icon: FileBarChart2 },
  ];

  const addActions = [
    { href: "/projects?new=1", label: "פרויקט חדש", icon: FolderKanban },
    { href: "/clients?new=1", label: "לקוח חדש", icon: UserPlus },
    { href: "/tasks?new=1", label: "משימה חדשה", icon: CheckSquare },
    { href: "/financials?new=invoice", label: "חשבונית", icon: Receipt },
  ];

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

  const panelBottom = "calc(82px + env(safe-area-inset-bottom, 12px))";

  /* ── shared tab item ── */
  const Tab = ({ href, label, icon: Icon }: { href: string; label: string; icon: React.ElementType }) => {
    const active = isActive(href);
    return (
      <Link href={href} className="relative flex flex-1 flex-col items-center justify-center gap-[3px] h-full">
        {active && (
          <motion.div
            layoutId="tab-bg"
            className="absolute inset-x-1 inset-y-[5px] rounded-[10px] bg-white/[0.10]"
            transition={{ type: "spring", stiffness: 460, damping: 36 }}
          />
        )}
        <Icon
          className={`relative z-10 transition-colors duration-200 ${active ? "text-white" : "text-white/30"}`}
          size={20}
          strokeWidth={active ? 2.1 : 1.5}
        />
        <span className={`relative z-10 text-[9.5px] leading-none font-semibold tracking-tight transition-colors duration-200 ${active ? "text-white/80" : "text-white/25"}`}>
          {label}
        </span>
      </Link>
    );
  };

  return (
    <>
      {/* Backdrop */}
      <AnimatePresence>
        {(moreOpen || addOpen) && (
          <motion.div
            className="fixed inset-0 z-40 md:hidden bg-black/50"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
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
            style={{ bottom: panelBottom }}
            initial={{ y: 16, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 16, opacity: 0 }}
            transition={{ type: "spring", damping: 28, stiffness: 380 }}
          >
            <div className="rounded-2xl overflow-hidden bg-[#18181b] border border-white/[0.07] shadow-[0_24px_64px_-8px_rgba(0,0,0,0.65)]">
              <div className="flex items-center justify-between px-5 py-3.5 border-b border-white/[0.06]">
                <span className="text-[10px] font-bold tracking-[0.12em] uppercase text-white/25">הוספה מהירה</span>
                <button onClick={() => setAddOpen(false)} className="flex h-6 w-6 items-center justify-center rounded-full bg-white/[0.06] text-white/35">
                  <X className="h-3 w-3" />
                </button>
              </div>
              <div className="grid grid-cols-2">
                {addActions.map((a, i) => (
                  <Link key={a.href} href={a.href} onClick={() => setAddOpen(false)}
                    className={`flex items-center gap-3 px-5 py-4 active:bg-white/[0.04] transition-colors
                      ${i % 2 === 0 ? "border-l border-white/[0.05]" : ""}
                      ${i < 2 ? "border-b border-white/[0.05]" : ""}`}>
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[10px] bg-white/[0.08]">
                      <a.icon className="h-4 w-4 text-white/60" strokeWidth={1.7} />
                    </div>
                    <span className="text-[13px] font-semibold text-white/65">{a.label}</span>
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
            style={{ bottom: panelBottom }}
            initial={{ y: 16, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 16, opacity: 0 }}
            transition={{ type: "spring", damping: 28, stiffness: 380 }}
          >
            <div className="rounded-2xl overflow-hidden bg-[#18181b] border border-white/[0.07] shadow-[0_24px_64px_-8px_rgba(0,0,0,0.65)]">
              <div className="flex items-center justify-between px-5 py-3.5 border-b border-white/[0.06]">
                <span className="text-[10px] font-bold tracking-[0.12em] uppercase text-white/25">ניווט</span>
                <button onClick={() => setMoreOpen(false)} className="flex h-6 w-6 items-center justify-center rounded-full bg-white/[0.06] text-white/35">
                  <X className="h-3 w-3" />
                </button>
              </div>
              <div className="divide-y divide-white/[0.05] max-h-[52vh] overflow-y-auto overscroll-contain">
                {moreItems.map((item) => {
                  const active = isActive(item.href);
                  return (
                    <Link key={item.href} href={item.href} onClick={() => setMoreOpen(false)}
                      className="flex items-center gap-4 px-5 py-3.5 active:bg-white/[0.03] transition-colors">
                      <div className={`flex h-9 w-9 items-center justify-center rounded-[10px] shrink-0 ${active ? "bg-white/10" : "bg-white/[0.05]"}`}>
                        <item.icon className={`h-[17px] w-[17px] ${active ? "text-white/85" : "text-white/30"}`} strokeWidth={1.7} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-[13.5px] font-semibold ${active ? "text-white/85" : "text-white/55"}`}>{item.label}</p>
                        <p className="text-[11px] text-white/22 mt-0.5">{item.sub}</p>
                      </div>
                      <ChevronLeft className={`h-3.5 w-3.5 shrink-0 ${active ? "text-white/28" : "text-white/12"}`} />
                    </Link>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Tab bar ── */}
      <div
        className="fixed bottom-0 left-0 right-0 z-50 md:hidden"
        style={{ paddingBottom: "max(env(safe-area-inset-bottom, 0px), 8px)" }}
      >
        <div className="mx-3 mb-2">
          {/* Dark floating bar */}
          <div className="relative flex items-center h-[60px] rounded-2xl bg-[#0f0f0f]/96 backdrop-blur-2xl border border-white/[0.07] shadow-[0_8px_40px_-4px_rgba(0,0,0,0.55)]">

            {/* Left tabs */}
            {leftTabs.map((tab) => <Tab key={tab.href} {...tab} />)}

            {/* Center add button — inset, dark with white icon */}
            <div className="flex flex-col items-center justify-center w-16 shrink-0 h-full">
              <motion.button
                onClick={() => { setAddOpen((v) => !v); setMoreOpen(false); }}
                className="flex h-11 w-11 items-center justify-center rounded-full bg-white shadow-[0_2px_12px_rgba(0,0,0,0.35)] transition-shadow active:shadow-none"
                whileTap={{ scale: 0.90 }}
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
              >
                <motion.div
                  animate={{ rotate: addOpen ? 45 : 0 }}
                  transition={{ type: "spring", stiffness: 400, damping: 26 }}
                >
                  <Plus className="h-5 w-5 text-[#0f0f0f]" strokeWidth={2.5} />
                </motion.div>
              </motion.button>
            </div>

            {/* Right tabs */}
            {rightTabs.map((tab) => <Tab key={tab.href} {...tab} />)}

            {/* More */}
            <button
              onClick={() => { setMoreOpen((v) => !v); setAddOpen(false); }}
              className="relative flex flex-1 flex-col items-center justify-center gap-[3px] h-full"
            >
              {moreOpen && (
                <motion.div
                  className="absolute inset-x-1 inset-y-[5px] rounded-[10px] bg-white/[0.10]"
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                />
              )}
              <MoreHorizontal className={`relative z-10 transition-colors ${moreOpen ? "text-white" : "text-white/30"}`} size={20} strokeWidth={1.5} />
              <span className={`relative z-10 text-[9.5px] leading-none font-semibold tracking-tight transition-colors ${moreOpen ? "text-white/80" : "text-white/25"}`}>
                עוד
              </span>
            </button>

          </div>
        </div>
      </div>
    </>
  );
}
