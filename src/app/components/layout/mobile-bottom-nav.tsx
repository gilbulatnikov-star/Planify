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

  const mainTabs = [
    { href: "/", label: "דשבורד", icon: LayoutDashboard },
    { href: "/projects", label: "פרויקטים", icon: FolderKanban },
    { href: "/clients", label: "לקוחות", icon: Users },
    { href: "/financials", label: "פיננסים", icon: FileBarChart2 },
  ];

  const addActions = [
    { href: "/projects?new=1", label: "פרויקט חדש", icon: FolderKanban, color: "bg-indigo-500" },
    { href: "/clients?new=1", label: "לקוח חדש", icon: UserPlus, color: "bg-sky-500" },
    { href: "/tasks?new=1", label: "משימה חדשה", icon: CheckSquare, color: "bg-emerald-500" },
    { href: "/financials?new=invoice", label: "חשבונית", icon: Receipt, color: "bg-amber-500" },
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

  const panelBottom = "calc(80px + env(safe-area-inset-bottom, 12px))";

  return (
    <>
      {/* Backdrop */}
      <AnimatePresence>
        {(moreOpen || addOpen) && (
          <motion.div
            className="fixed inset-0 z-40 md:hidden"
            style={{ background: "rgba(0,0,0,0.45)" }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => { setMoreOpen(false); setAddOpen(false); }}
          />
        )}
      </AnimatePresence>

      {/* ── Quick-add sheet ── */}
      <AnimatePresence>
        {addOpen && (
          <motion.div
            className="fixed left-0 right-0 z-50 md:hidden px-4"
            style={{ bottom: panelBottom }}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 20, opacity: 0 }}
            transition={{ type: "spring", damping: 28, stiffness: 360 }}
          >
            <div className="rounded-2xl overflow-hidden bg-[#18181b] border border-white/[0.08] shadow-[0_20px_60px_-10px_rgba(0,0,0,0.6)]">
              <div className="flex items-center justify-between px-5 py-3.5 border-b border-white/[0.07]">
                <span className="text-[10.5px] font-bold tracking-[0.1em] uppercase text-white/30">הוספה מהירה</span>
                <button onClick={() => setAddOpen(false)} className="flex h-6 w-6 items-center justify-center rounded-full bg-white/[0.07] text-white/40 hover:bg-white/10 transition-colors">
                  <X className="h-3 w-3" />
                </button>
              </div>
              <div className="grid grid-cols-2">
                {addActions.map((action, i) => (
                  <Link
                    key={action.href}
                    href={action.href}
                    onClick={() => setAddOpen(false)}
                    className={`flex items-center gap-3 px-5 py-4 transition-colors active:bg-white/[0.04] ${i % 2 === 0 && i < addActions.length - 1 ? "border-l border-white/[0.06]" : ""} ${i < 2 ? "border-b border-white/[0.06]" : ""}`}
                  >
                    <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl ${action.color}/80`}>
                      <action.icon className="h-4 w-4 text-white" strokeWidth={1.8} />
                    </div>
                    <span className="text-[13px] font-semibold text-white/75">{action.label}</span>
                  </Link>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── More sheet ── */}
      <AnimatePresence>
        {moreOpen && (
          <motion.div
            className="fixed left-0 right-0 z-50 md:hidden px-3"
            style={{ bottom: panelBottom }}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 20, opacity: 0 }}
            transition={{ type: "spring", damping: 28, stiffness: 360 }}
          >
            <div className="rounded-2xl overflow-hidden bg-[#18181b] border border-white/[0.08] shadow-[0_20px_60px_-10px_rgba(0,0,0,0.6)]">
              <div className="flex items-center justify-between px-5 py-3.5 border-b border-white/[0.07]">
                <span className="text-[10.5px] font-bold tracking-[0.1em] uppercase text-white/30">ניווט</span>
                <button onClick={() => setMoreOpen(false)} className="flex h-6 w-6 items-center justify-center rounded-full bg-white/[0.07] text-white/40 hover:bg-white/10 transition-colors">
                  <X className="h-3 w-3" />
                </button>
              </div>
              <div className="divide-y divide-white/[0.06] max-h-[52vh] overflow-y-auto overscroll-contain">
                {moreItems.map((item) => {
                  const active = isActive(item.href);
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMoreOpen(false)}
                      className="flex items-center gap-4 px-5 py-3.5 transition-colors active:bg-white/[0.03]"
                    >
                      <div className={`flex h-9 w-9 items-center justify-center rounded-[10px] shrink-0 ${active ? "bg-white/10" : "bg-white/[0.05]"}`}>
                        <item.icon className={`h-4 w-4 ${active ? "text-white/90" : "text-white/35"}`} strokeWidth={1.7} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-[13.5px] font-semibold leading-tight ${active ? "text-white/90" : "text-white/60"}`}>{item.label}</p>
                        <p className="text-[11px] text-white/25 mt-0.5">{item.sub}</p>
                      </div>
                      <ChevronLeft className={`h-3.5 w-3.5 shrink-0 ${active ? "text-white/30" : "text-white/15"}`} />
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
        {/* Floating pill bar */}
        <div className="mx-3 mb-2">
          <div className="flex items-center rounded-2xl bg-[#111111]/95 backdrop-blur-2xl border border-white/[0.08] shadow-[0_8px_32px_-4px_rgba(0,0,0,0.5)] px-1 h-[58px]">

            {/* Main tabs */}
            {mainTabs.map((tab) => {
              const active = isActive(tab.href);
              return (
                <Link
                  key={tab.href}
                  href={tab.href}
                  className="relative flex flex-1 flex-col items-center justify-center gap-[3px] h-full rounded-xl transition-colors"
                >
                  {/* Active background pill */}
                  {active && (
                    <motion.div
                      layoutId="active-pill"
                      className="absolute inset-x-1 inset-y-[6px] rounded-[10px] bg-white/[0.09]"
                      transition={{ type: "spring", stiffness: 500, damping: 38 }}
                    />
                  )}
                  <tab.icon
                    className={`relative z-10 transition-colors duration-200 ${active ? "text-white" : "text-white/30"}`}
                    size={19}
                    strokeWidth={active ? 2.2 : 1.6}
                  />
                  <span className={`relative z-10 text-[9.5px] leading-none font-semibold tracking-tight transition-colors duration-200 ${active ? "text-white/85" : "text-white/25"}`}>
                    {tab.label}
                  </span>
                </Link>
              );
            })}

            {/* Divider */}
            <div className="w-px h-7 bg-white/[0.08] shrink-0 mx-0.5" />

            {/* Add button */}
            <button
              onClick={() => { setAddOpen((v) => !v); setMoreOpen(false); }}
              className="relative flex flex-col items-center justify-center gap-[3px] w-11 h-full rounded-xl transition-colors"
            >
              {addOpen && (
                <motion.div
                  className="absolute inset-x-1 inset-y-[6px] rounded-[10px] bg-white/[0.09]"
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                />
              )}
              <motion.div
                className="relative z-10"
                animate={{ rotate: addOpen ? 45 : 0 }}
                transition={{ type: "spring", stiffness: 420, damping: 26 }}
              >
                <Plus className={`transition-colors ${addOpen ? "text-white" : "text-white/30"}`} size={19} strokeWidth={addOpen ? 2.2 : 1.9} />
              </motion.div>
              <span className={`relative z-10 text-[9.5px] leading-none font-semibold tracking-tight transition-colors ${addOpen ? "text-white/85" : "text-white/25"}`}>
                הוסף
              </span>
            </button>

            {/* More button */}
            <button
              onClick={() => { setMoreOpen((v) => !v); setAddOpen(false); }}
              className="relative flex flex-col items-center justify-center gap-[3px] w-11 h-full rounded-xl transition-colors"
            >
              {moreOpen && (
                <motion.div
                  className="absolute inset-x-1 inset-y-[6px] rounded-[10px] bg-white/[0.09]"
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                />
              )}
              <MoreHorizontal className={`relative z-10 transition-colors ${moreOpen ? "text-white" : "text-white/30"}`} size={19} strokeWidth={1.6} />
              <span className={`relative z-10 text-[9.5px] leading-none font-semibold tracking-tight transition-colors ${moreOpen ? "text-white/85" : "text-white/25"}`}>
                עוד
              </span>
            </button>

          </div>
        </div>
      </div>
    </>
  );
}
