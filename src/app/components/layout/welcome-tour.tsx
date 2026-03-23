"use client";

import { useState, useEffect, useCallback, useRef, useId } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  FolderKanban,
  Users,
  Receipt,
  CalendarDays,
  Sparkles,
  FileText,
  X,
  ArrowLeft,
  ArrowRight,
  Contact,
} from "lucide-react";
import { useT } from "@/lib/i18n";

const TOUR_KEY = "gp_tour_completed";
const SPOTLIGHT_PAD = 10;
const TOOLTIP_WIDTH = 296;
const TOOLTIP_GAP = 18;

// Steps are defined inside the component to use translations

// ─── Types ────────────────────────────────────────────────────────────────────

interface SpotRect { x: number; y: number; w: number; h: number }
interface TipPos   { x: number; y: number }

// ─── Main component ───────────────────────────────────────────────────────────

export function WelcomeTour() {
  const he = useT();

  const steps = [
    { target: null as string | null, title: `${he.tour.welcome} 🚀`, description: he.tour.welcomeDesc, icon: Sparkles, color: "from-violet-500 to-purple-600" },
    { target: '[data-tour="nav-dashboard"]' as string | null, title: he.tour.dashboardTitle, description: he.tour.dashboardDesc, icon: LayoutDashboard, color: "from-blue-500 to-cyan-500" },
    { target: '[data-tour="nav-projects"]' as string | null, title: he.tour.projectsTitle, description: he.tour.projectsDesc, icon: FolderKanban, color: "from-amber-500 to-orange-500" },
    { target: '[data-tour="nav-clients"]' as string | null, title: he.tour.clientsTitle, description: he.tour.clientsDesc, icon: Users, color: "from-emerald-500 to-green-600" },
    { target: '[data-tour="nav-financials"]' as string | null, title: he.tour.financialsTitle, description: he.tour.financialsDesc, icon: Receipt, color: "from-pink-500 to-rose-500" },
    { target: '[data-tour="nav-calendar"]' as string | null, title: he.tour.calendarTitle, description: he.tour.calendarDesc, icon: CalendarDays, color: "from-indigo-500 to-blue-600" },
    { target: '[data-tour="nav-scripts"]' as string | null, title: he.tour.scriptsTitle, description: he.tour.scriptsDesc, icon: FileText, color: "from-teal-500 to-cyan-600" },
    { target: '[data-tour="nav-contacts"]' as string | null, title: he.tour.contactsTitle, description: he.tour.contactsDesc, icon: Contact, color: "from-sky-500 to-indigo-500" },
    { target: '[data-tour="nav-inspiration"]' as string | null, title: he.tour.inspirationTitle, description: he.tour.inspirationDesc, icon: Sparkles, color: "from-purple-500 to-fuchsia-600" },
  ];

  const [visible,    setVisible]    = useState(false);
  const [step,       setStep]       = useState(0);
  const [spotRect,   setSpotRect]   = useState<SpotRect | null>(null);
  const [tipPos,     setTipPos]     = useState<TipPos   | null>(null);
  const maskId = useId();

  // Compute spotlight rect and tooltip position for a given step index
  const updateSpotlight = useCallback((idx: number) => {
    const target = steps[idx].target;
    if (!target) {
      setSpotRect(null);
      setTipPos(null);
      return;
    }
    const el = document.querySelector(target);
    if (!el) {
      setSpotRect(null);
      setTipPos(null);
      return;
    }
    const r = el.getBoundingClientRect();
    setSpotRect({ x: r.left, y: r.top, w: r.width, h: r.height });

    // Sidebar is on the right → place tooltip to the left of it
    const tooltipEstH = 210;
    const tipX = r.left - TOOLTIP_WIDTH - TOOLTIP_GAP;
    const tipY = Math.max(
      16,
      Math.min(
        window.innerHeight - tooltipEstH - 16,
        r.top + r.height / 2 - tooltipEstH / 2,
      ),
    );
    setTipPos({ x: tipX, y: tipY });
  }, []);

  // Show on first visit
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!localStorage.getItem(TOUR_KEY)) {
        setVisible(true);
        updateSpotlight(0);
      }
    }, 800);
    return () => clearTimeout(timer);
  }, [updateSpotlight]);

  // Recompute when step changes
  useEffect(() => {
    if (visible) updateSpotlight(step);
  }, [step, visible, updateSpotlight]);

  // Recompute on window resize
  useEffect(() => {
    if (!visible) return;
    const onResize = () => updateSpotlight(step);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [visible, step, updateSpotlight]);

  function dismiss() {
    localStorage.setItem(TOUR_KEY, "1");
    setVisible(false);
  }

  function next() {
    if (step < steps.length - 1) setStep((s) => s + 1);
    else dismiss();
  }

  function prev() {
    if (step > 0) setStep((s) => s - 1);
  }

  const current = steps[step];
  const Icon    = current.icon;
  const isLast  = step === steps.length - 1;
  const hasSpot = !!spotRect && !!tipPos;

  // Spotlight geometry (with padding)
  const sx = spotRect ? spotRect.x - SPOTLIGHT_PAD : 0;
  const sy = spotRect ? spotRect.y - SPOTLIGHT_PAD : 0;
  const sw = spotRect ? spotRect.w + SPOTLIGHT_PAD * 2 : 0;
  const sh = spotRect ? spotRect.h + SPOTLIGHT_PAD * 2 : 0;

  return (
    <AnimatePresence>
      {visible && (
        <>
          {/* ── Overlay ─────────────────────────────────────────── */}
          {hasSpot ? (
            /* SVG dark overlay with animated spotlight cutout */
            <svg
              className="fixed inset-0 z-50 pointer-events-none"
              style={{ width: "100vw", height: "100vh" }}
            >
              <defs>
                <mask id={maskId}>
                  <rect width="100%" height="100%" fill="white" />
                  <motion.rect
                    animate={{ x: sx, y: sy, width: sw, height: sh }}
                    transition={{ type: "spring", stiffness: 280, damping: 28 }}
                    rx={10}
                    fill="black"
                  />
                </mask>
              </defs>

              {/* Dark backdrop */}
              <rect
                width="100%"
                height="100%"
                fill="rgba(0,0,0,0.72)"
                mask={`url(#${maskId})`}
              />

              {/* Animated highlight ring */}
              <motion.rect
                animate={{ x: sx, y: sy, width: sw, height: sh }}
                transition={{ type: "spring", stiffness: 280, damping: 28 }}
                rx={10}
                fill="none"
                stroke="white"
                strokeWidth="1.5"
                strokeOpacity={0.45}
              />
            </svg>
          ) : (
            /* Plain backdrop for center step */
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/65 backdrop-blur-sm"
              onClick={dismiss}
            />
          )}

          {/* ── Tooltip card ─────────────────────────────────────── */}
          {hasSpot && tipPos ? (
            /* Anchored beside the spotlight */
            <motion.div
              key={`tip-${step}`}
              initial={{ opacity: 0, x: 8, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 8, scale: 0.95 }}
              transition={{ type: "spring", stiffness: 340, damping: 28 }}
              className="fixed z-[60] pointer-events-auto"
              style={{ left: tipPos.x, top: tipPos.y, width: TOOLTIP_WIDTH }}
            >
              <TourCard
                current={current}
                Icon={Icon}
                step={step}
                total={steps.length}
                isLast={isLast}
                isFirst={step === 0}
                onNext={next}
                onPrev={prev}
                onDismiss={dismiss}
                onDot={setStep}
              />
            </motion.div>
          ) : (
            /* Centered card for intro step */
            <motion.div
              key="center-card"
              initial={{ opacity: 0, scale: 0.9, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 16 }}
              transition={{ type: "spring", stiffness: 310, damping: 26 }}
              className="fixed inset-0 z-[60] flex items-center justify-center p-4 pointer-events-none"
            >
              <div
                className="pointer-events-auto w-full max-w-sm"
                onClick={(e) => e.stopPropagation()}
              >
                <TourCard
                  current={current}
                  Icon={Icon}
                  step={step}
                  total={steps.length}
                  isLast={isLast}
                  isFirst={step === 0}
                  onNext={next}
                  onPrev={prev}
                  onDismiss={dismiss}
                  onDot={setStep}
                  centered
                />
              </div>
            </motion.div>
          )}
        </>
      )}
    </AnimatePresence>
  );
}

// ─── Reusable card ────────────────────────────────────────────────────────────

function TourCard({
  current,
  Icon,
  step,
  total,
  isLast,
  isFirst,
  onNext,
  onPrev,
  onDismiss,
  onDot,
  centered = false,
}: {
  current: { target: string | null; title: string; description: string; icon: React.ElementType; color: string };
  Icon: React.ElementType;
  step: number;
  total: number;
  isLast: boolean;
  isFirst: boolean;
  onNext: () => void;
  onPrev: () => void;
  onDismiss: () => void;
  onDot: (i: number) => void;
  centered?: boolean;
}) {
  const he = useT();
  return (
    <div className="rounded-2xl bg-card shadow-2xl overflow-hidden" dir="rtl">
      {/* Gradient color strip */}
      <div className={`h-1.5 w-full bg-gradient-to-r ${current.color}`} />

      <div className={centered ? "px-6 pt-6 pb-5" : "px-5 pt-5 pb-4"}>
        {/* Step dots + Skip */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex gap-1.5">
            {Array.from({ length: total }).map((_, i) => (
              <button
                key={i}
                onClick={() => onDot(i)}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  i === step
                    ? "w-5 bg-foreground"
                    : "w-1.5 bg-gray-200 hover:bg-gray-300"
                }`}
              />
            ))}
          </div>
          <button
            onClick={onDismiss}
            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-muted-foreground transition-colors"
          >
            <X className="h-3.5 w-3.5" />
            {he.tour.skip}
          </button>
        </div>

        {/* Icon + title + description */}
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            transition={{ duration: 0.16 }}
            className={`flex gap-3 mb-5 ${centered ? "flex-col items-center text-center" : "items-start"}`}
          >
            <div
              className={`flex shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${current.color} shadow-md ${
                centered ? "h-14 w-14 rounded-2xl" : "h-10 w-10"
              }`}
            >
              <Icon className={centered ? "h-7 w-7 text-white" : "h-5 w-5 text-white"} />
            </div>
            <div className="flex-1 min-w-0">
              <h3
                className={`font-bold text-foreground leading-snug mb-1 ${
                  centered ? "text-lg" : "text-sm"
                }`}
              >
                {current.title}
              </h3>
              <p
                className={`text-muted-foreground leading-relaxed ${
                  centered ? "text-sm max-w-xs mx-auto" : "text-xs"
                }`}
              >
                {current.description}
              </p>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Navigation buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={onPrev}
            disabled={isFirst}
            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors disabled:opacity-0 disabled:pointer-events-none shrink-0"
          >
            <ArrowRight className="h-3.5 w-3.5" />
            {he.tour.prev}
          </button>
          <button
            onClick={onNext}
            className={`flex-1 flex items-center justify-center gap-1.5 rounded-xl py-2.5 text-xs font-bold transition-all bg-gradient-to-r ${current.color} text-white hover:opacity-90 shadow-sm`}
          >
            {isLast ? `${he.tour.letsStart} 🚀` : he.tour.next}
            {!isLast && <ArrowLeft className="h-3.5 w-3.5" />}
          </button>
        </div>

        {/* Counter */}
        <p className="text-center text-[10px] text-muted-foreground mt-3">
          {step + 1} {he.tour.stepOf} {total}
        </p>
      </div>
    </div>
  );
}
