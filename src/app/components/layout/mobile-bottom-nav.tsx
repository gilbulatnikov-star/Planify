"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import {
  LayoutDashboard,
  FolderKanban,
  Users,
  Plus,
  FileText,
  Contact,
  Sparkles,
  LayoutTemplate,
  ListTodo,
  FileBarChart2,
  BarChart3,
  Settings,
  CalendarDays,
  Receipt,
  CheckSquare,
  UserPlus,
} from "lucide-react";
import { useT } from "@/lib/i18n";

export function MobileBottomNav() {
  const pathname = usePathname();
  const t = useT();
  const [addOpen, setAddOpen] = useState(false);
  const prefersReduced = useReducedMotion();
  const scrollRef = useRef<HTMLDivElement>(null);

  // Lock background scroll when panel is open (works on iOS + Android)
  useEffect(() => {
    if (addOpen) {
      const scrollY = window.scrollY;
      document.body.style.position = "fixed";
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = "100%";
      document.body.style.overflowY = "scroll"; // prevent layout shift
    } else {
      const scrollY = document.body.style.top;
      document.body.style.position = "";
      document.body.style.top = "";
      document.body.style.width = "";
      document.body.style.overflowY = "";
      if (scrollY) {
        window.scrollTo(0, parseInt(scrollY) * -1);
      }
    }
    return () => {
      // cleanup on unmount
      document.body.style.position = "";
      document.body.style.top = "";
      document.body.style.width = "";
      document.body.style.overflowY = "";
    };
  }, [addOpen]);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  const leftTabs = [
    { href: "/", label: "לוח בקרה", icon: LayoutDashboard },
    { href: "/projects", label: "פרויקטים", icon: FolderKanban },
  ];
  const rightTabs = [
    { href: "/clients", label: "לקוחות", icon: Users },
    { href: "/financials", label: "פיננסים", icon: FileBarChart2 },
  ];

  const allItems = [
    { href: "/projects?new=1",      label: "פרויקט",   icon: FolderKanban,   gradient: "from-violet-500 to-purple-600",  isNew: true },
    { href: "/clients?new=1",       label: "לקוח",     icon: UserPlus,       gradient: "from-blue-500 to-blue-600",      isNew: true },
    { href: "/tasks?new=1",         label: "משימה",    icon: CheckSquare,    gradient: "from-emerald-500 to-teal-600",   isNew: true },
    { href: "/financials?new=invoice", label: "חשבונית", icon: Receipt,      gradient: "from-green-500 to-emerald-600",  isNew: true },
    { href: "/calendar",            label: t.nav.calendar,                   icon: CalendarDays,   gradient: "from-sky-500 to-cyan-500"      },
    { href: "/tasks",               label: t.widgets?.todos ?? "משימות",    icon: ListTodo,       gradient: "from-amber-500 to-orange-500"  },
    { href: "/scripts",             label: t.nav.scripts,                    icon: FileText,       gradient: "from-rose-500 to-pink-500"     },
    { href: "/contacts",            label: t.nav.contacts,                   icon: Contact,        gradient: "from-indigo-500 to-blue-500"   },
    { href: "/inspiration",         label: t.nav.inspiration,                icon: Sparkles,       gradient: "from-yellow-400 to-amber-500"  },
    { href: "/moodboard",           label: t.nav.moodboard,                  icon: LayoutTemplate, gradient: "from-fuchsia-500 to-pink-500"  },
    { href: "/reports",             label: "דוחות",                          icon: BarChart3,      gradient: "from-teal-500 to-cyan-600"     },
    { href: "/settings/profile",    label: "הגדרות",                         icon: Settings,       gradient: "from-slate-500 to-slate-600"   },
  ];

  /* ── shared tab item ── */
  const Tab = ({
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
        className="relative flex flex-1 flex-col items-center justify-center gap-[3px] h-full"
      >
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
        <span
          className={`relative z-10 text-[9.5px] leading-none font-semibold tracking-tight transition-colors duration-200 ${active ? "text-white/80" : "text-white/25"}`}
        >
          {label}
        </span>
      </Link>
    );
  };

  return (
    <>
      {/* Backdrop */}
      <AnimatePresence>
        {addOpen && (
          <motion.div
            className="fixed inset-0 z-40 lg:hidden bg-black/50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            onClick={() => setAddOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* ── Panel ── */}
      <AnimatePresence>
        {addOpen && (
          <motion.div
            className="fixed inset-x-0 bottom-0 z-50 lg:hidden flex flex-col"
            style={{ maxHeight: "85dvh" }}
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={prefersReduced ? { duration: 0 } : { type: "spring", damping: 34, stiffness: 360 }}
            onTouchMove={(e) => e.stopPropagation()}
          >
            <div
              className="flex flex-col rounded-t-[28px] bg-[#161618] border-t border-white/[0.06] shadow-[0_-20px_80px_rgba(0,0,0,0.7)] overflow-hidden"
              style={{ paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 16px)" }}
            >
              {/* Handle */}
              <div className="flex justify-center pt-3.5 pb-4 shrink-0">
                <div className="h-[5px] w-12 rounded-full bg-white/[0.15]" />
              </div>
              {/* Scrollable grid wrapper */}
              <div
                ref={scrollRef}
                className="overflow-y-auto min-h-0"
                style={{
                  WebkitOverflowScrolling: "touch",
                  overscrollBehavior: "contain",
                } as React.CSSProperties}
                onTouchMove={(e) => e.stopPropagation()}
              >
                <div className="grid grid-cols-4 gap-y-1 px-3 pb-2">
                  {allItems.map((item) => {
                    const active = isActive(item.href);
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setAddOpen(false)}
                        className="relative flex flex-col items-center gap-2 py-3 rounded-2xl active:scale-95 transition-transform duration-150"
                      >
                        {item.isNew && (
                          <div className="absolute top-2 right-[18px] flex h-4 w-4 items-center justify-center rounded-full bg-white/[0.12] z-10">
                            <Plus className="h-2.5 w-2.5 text-white/60" strokeWidth={2.5} />
                          </div>
                        )}
                        <div
                          className={`flex h-[52px] w-[52px] items-center justify-center rounded-[16px] bg-gradient-to-br ${item.gradient} shadow-lg shadow-black/30 ${active ? "opacity-100" : "opacity-75"}`}
                        >
                          <item.icon
                            className="h-[23px] w-[23px] text-white drop-shadow-sm"
                            strokeWidth={1.6}
                          />
                        </div>
                        <span
                          className={`text-[11px] font-medium text-center leading-snug px-0.5 ${active ? "text-white/85" : "text-white/45"}`}
                        >
                          {item.label}
                        </span>
                      </Link>
                    );
                  })}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Tab bar ── */}
      <div
        className="fixed bottom-0 left-0 right-0 z-50 lg:hidden"
        style={{ paddingBottom: "max(env(safe-area-inset-bottom, 0px), 8px)" }}
      >
        <div className="mx-3 mb-2">
          <div className="relative flex items-center h-[60px] rounded-2xl bg-[#0f0f0f]/96 backdrop-blur-2xl border border-white/[0.07] shadow-[0_8px_40px_-4px_rgba(0,0,0,0.55)]">
            {leftTabs.map((tab) => (
              <Tab key={tab.href} {...tab} />
            ))}

            {/* Center + button */}
            <div className="flex flex-col items-center justify-center w-16 shrink-0 h-full">
              <motion.button
                onClick={() => setAddOpen((v) => !v)}
                className="flex h-11 w-11 items-center justify-center rounded-full bg-white shadow-[0_2px_12px_rgba(0,0,0,0.35)] transition-shadow active:shadow-none"
                whileTap={prefersReduced ? {} : { scale: 0.9 }}
                transition={prefersReduced ? { duration: 0 } : { type: "spring", stiffness: 500, damping: 30 }}
              >
                <motion.div
                  animate={{ rotate: addOpen ? 45 : 0 }}
                  transition={prefersReduced ? { duration: 0 } : { type: "spring", stiffness: 400, damping: 26 }}
                >
                  <Plus className="h-5 w-5 text-[#0f0f0f]" strokeWidth={2.5} />
                </motion.div>
              </motion.button>
            </div>

            {rightTabs.map((tab) => (
              <Tab key={tab.href} {...tab} />
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
