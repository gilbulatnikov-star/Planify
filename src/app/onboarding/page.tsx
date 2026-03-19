"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Camera, Image, Share2, Film, Clapperboard, Building2,
  Target, Repeat, Receipt, FileText,
  User, Users, Building,
  CheckCircle2, ArrowLeft,
} from "lucide-react";

// ─── Step 1: Role (multi-select) ────────────────────────────────
const roles = [
  { value: "videographer",  label: "צלם וידאו",        icon: Camera,       desc: "מצלמים, עורכים, מעבירים" },
  { value: "photographer",  label: "צלם סטילס",         icon: Image,        desc: "צילום אנשי ומוצרים" },
  { value: "smm",           label: "מנהל סושיאל",       icon: Share2,       desc: "ריטיינרים ותוכן שוטף" },
  { value: "editor",        label: "עורך וידאו",         icon: Film,         desc: "עריכה, גרפיקה, אנימציה" },
  { value: "producer",      label: "מפיק",              icon: Clapperboard, desc: "ניהול הפקות ולוגיסטיקה" },
  { value: "agency",        label: "סוכנות / סטודיו",   icon: Building2,    desc: "צוות מלא, מספר לקוחות" },
];

// ─── Step 2: Goal (multi-select) ────────────────────────────────
const goals = [
  { value: "shoots_gear",  label: "ניהול צילומים",    icon: Camera,   desc: "לוחות זמנים, לוגיסטיקה" },
  { value: "retainer",     label: "תוכן שוטף",         icon: Repeat,   desc: "ריטיינרים, קונטנט חודשי" },
  { value: "financials",   label: "חשבוניות וכספים",   icon: Receipt,  desc: "הכנסות, הוצאות, הצעות מחיר" },
  { value: "scripts",      label: "סקריפטים ויוצרות",  icon: FileText, desc: "כתיבת סקריפטים, שוט ליסט" },
];

// ─── Step 3: Team Size (single-select) ──────────────────────────
const teamSizes = [
  { value: "solo",   label: "פרילנסר סולו",    icon: User,     desc: "עובד לבד בעיקר" },
  { value: "small",  label: "צוות קטן (2–5)",  icon: Users,    desc: "שותף או כמה עובדים" },
  { value: "studio", label: "סטודיו (5+)",      icon: Building, desc: "צוות מלא, מבנה ארגוני" },
];

const steps = [
  {
    title: "במה אתה עוסק?",
    subtitle: "ניתן לבחור יותר מאפשרות אחת",
    options: roles,
    key: "role" as const,
    multiSelect: true,
  },
  {
    title: "מה המטרה הראשית שלך?",
    subtitle: "ניתן לבחור יותר מאפשרות אחת",
    options: goals,
    key: "primaryGoal" as const,
    multiSelect: true,
  },
  {
    title: "איך אתה עובד?",
    subtitle: "בחר גודל צוות",
    options: teamSizes,
    key: "teamSize" as const,
    multiSelect: false,
  },
];

const slideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 60 : -60,
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
    transition: { duration: 0.35, ease: "easeOut" as const },
  },
  exit: (direction: number) => ({
    x: direction > 0 ? -60 : 60,
    opacity: 0,
    transition: { duration: 0.25, ease: "easeIn" as const },
  }),
};

export default function OnboardingPage() {
  const router = useRouter();
  const { update } = useSession();

  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState(1);
  // Values: multi-select steps store string[], single-select stores string
  const [selections, setSelections] = useState<Record<string, string | string[]>>({});
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);

  const currentStep = steps[Math.min(step, steps.length - 1)];
  const currentValue = selections[currentStep.key];

  // ── selection helpers ──────────────────────────────────────────
  function isOptionSelected(value: string) {
    if (Array.isArray(currentValue)) return currentValue.includes(value);
    return currentValue === value;
  }

  function handleToggle(value: string) {
    if (currentStep.multiSelect) {
      const current = (selections[currentStep.key] as string[] | undefined) ?? [];
      const already = current.includes(value);
      setSelections({
        ...selections,
        [currentStep.key]: already
          ? current.filter((v) => v !== value)
          : [...current, value],
      });
    } else {
      // single-select — auto-advance after brief highlight
      setSelections({ ...selections, [currentStep.key]: value });
      setTimeout(() => advanceStep({ ...selections, [currentStep.key]: value }), 220);
    }
  }

  const canContinue = Array.isArray(currentValue)
    ? currentValue.length > 0
    : !!currentValue;

  function advanceStep(sel = selections) {
    if (step < steps.length - 1) {
      setDirection(1);
      setStep((s) => s + 1);
    } else {
      handleFinish(sel);
    }
  }

  // ── submit ─────────────────────────────────────────────────────
  async function handleFinish(finalSelections: Record<string, string | string[]>) {
    setSaving(true);
    try {
      // Convert arrays to comma-separated strings for DB storage
      const payload = Object.fromEntries(
        Object.entries(finalSelections).map(([k, v]) => [
          k,
          Array.isArray(v) ? v.join(",") : v,
        ])
      );

      const res = await fetch("/api/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setDone(true);
        update({ onboardingCompleted: true }).catch(() => {});
        setTimeout(() => {
          window.location.href = "/";
        }, 1200);
      } else {
        update({ onboardingCompleted: true }).catch(() => {});
        window.location.href = "/";
      }
    } catch {
      window.location.href = "/";
    }
  }

  // ── loading / done state ───────────────────────────────────────
  if (saving || done) {
    return (
      <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center gap-6 text-white">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="flex flex-col items-center gap-5"
        >
          {done ? (
            <>
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-emerald-500/20">
                <CheckCircle2 className="h-10 w-10 text-emerald-400" />
              </div>
              <div className="text-center">
                <p className="text-xl font-semibold">הסביבה מוכנה!</p>
                <p className="text-gray-400 text-sm mt-1">מעביר אותך...</p>
              </div>
            </>
          ) : (
            <>
              <div className="relative flex h-20 w-20 items-center justify-center">
                <div className="absolute inset-0 rounded-full border-2 border-gray-700" />
                <div className="absolute inset-0 rounded-full border-2 border-t-white animate-spin" />
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-900 text-white font-bold text-lg">
                  P
                </div>
              </div>
              <div className="text-center">
                <p className="text-xl font-semibold">מכין לך את הסביבה...</p>
                <p className="text-gray-400 text-sm mt-1">שנייה אחת</p>
              </div>
            </>
          )}
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 flex flex-col" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between px-8 py-6">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-gray-900 font-bold text-sm">
            P
          </div>
          <button
            onClick={() => signOut({ callbackUrl: "/sign-in" })}
            className="text-xs text-gray-500 hover:text-gray-300 transition-colors"
          >
            יציאה
          </button>
        </div>
        <div className="flex items-center gap-2">
          {steps.map((_, i) => (
            <div
              key={i}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                i <= step ? "w-8 bg-white" : "w-4 bg-gray-700"
              }`}
            />
          ))}
        </div>
        <div className="text-xs text-gray-500" dir="ltr">
          {step + 1} / {steps.length}
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 pb-8">
        <div className="w-full max-w-2xl">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={step}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
            >
              {/* Title */}
              <div className="text-center mb-8">
                <h1 className="text-3xl font-bold text-white mb-2">
                  {currentStep.title}
                </h1>
                <p className="text-gray-400 text-sm">{currentStep.subtitle}</p>
              </div>

              {/* Options grid */}
              <div
                className={`grid gap-3 ${
                  currentStep.options.length === 3
                    ? "grid-cols-1 sm:grid-cols-3"
                    : currentStep.options.length === 4
                    ? "grid-cols-2"
                    : "grid-cols-2 sm:grid-cols-3"
                }`}
              >
                {currentStep.options.map((option) => {
                  const Icon = option.icon;
                  const isSelected = isOptionSelected(option.value);

                  return (
                    <motion.button
                      key={option.value}
                      onClick={() => handleToggle(option.value)}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.97 }}
                      className={`group relative flex flex-col items-center text-center gap-3 p-6 rounded-2xl border-2 transition-all duration-200 cursor-pointer ${
                        isSelected
                          ? "bg-white border-white text-gray-900"
                          : "bg-gray-900 border-gray-800 text-white hover:border-gray-600 hover:bg-gray-800"
                      }`}
                    >
                      <div
                        className={`flex h-12 w-12 items-center justify-center rounded-xl transition-colors ${
                          isSelected
                            ? "bg-gray-900 text-white"
                            : "bg-gray-800 text-gray-300 group-hover:bg-gray-700"
                        }`}
                      >
                        <Icon className="h-6 w-6" />
                      </div>
                      <div>
                        <p className="font-semibold text-sm">{option.label}</p>
                        <p className="text-xs mt-0.5 leading-relaxed text-gray-500">
                          {option.desc}
                        </p>
                      </div>
                      {isSelected && (
                        <div className="absolute top-3 left-3">
                          <CheckCircle2 className="h-4 w-4 text-gray-900" />
                        </div>
                      )}
                    </motion.button>
                  );
                })}
              </div>

              {/* Continue button — only for multi-select steps */}
              {currentStep.multiSelect && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: canContinue ? 1 : 0.3, y: 0 }}
                  transition={{ duration: 0.2 }}
                  className="mt-8 flex justify-center"
                >
                  <button
                    onClick={() => canContinue && advanceStep()}
                    disabled={!canContinue}
                    className="flex items-center gap-2 rounded-2xl bg-white text-gray-900 px-8 py-3.5 text-sm font-bold hover:bg-gray-100 transition-colors disabled:pointer-events-none"
                  >
                    {step === steps.length - 1 ? "סיים" : "המשך"}
                    <ArrowLeft className="h-4 w-4" />
                    {Array.isArray(currentValue) && currentValue.length > 1 && (
                      <span className="mr-1 rounded-full bg-gray-200 px-1.5 py-0.5 text-[11px] font-semibold text-gray-700">
                        {currentValue.length}
                      </span>
                    )}
                  </button>
                </motion.div>
              )}
            </motion.div>
          </AnimatePresence>

          {/* Back button */}
          {step > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex justify-center mt-6"
            >
              <button
                onClick={() => {
                  setDirection(-1);
                  setStep((s) => s - 1);
                }}
                className="text-sm text-gray-500 hover:text-gray-300 transition-colors"
              >
                → חזור
              </button>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
