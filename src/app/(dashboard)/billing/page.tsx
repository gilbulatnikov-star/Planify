"use client";

import { useEffect, useState } from "react";
import {
  CheckCircle2,
  Zap,
  Crown,
  Sparkles,
  FolderOpen,
  Users,
  FileText,
  Clapperboard,
  Check,
  Minus,
  Clock,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { PLANS, formatLimit } from "@/lib/plan-limits";

// ─── Quota row component ──────────────────────────────────────────────────────

function QuotaItem({
  icon: Icon,
  label,
  value,
  unlimited,
}: {
  icon: React.ElementType;
  label: string;
  value: number;
  unlimited?: boolean;
}) {
  return (
    <div className="flex items-center gap-2.5">
      <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gray-100 shrink-0">
        <Icon className="h-3.5 w-3.5 text-gray-500" />
      </div>
      <p className="text-xs text-gray-500 flex-1">{label}</p>
      <span
        className={`text-xs font-bold shrink-0 ${
          unlimited ? "text-emerald-600" : "text-gray-900"
        }`}
      >
        {unlimited ? "∞" : formatLimit(value)}
      </span>
    </div>
  );
}

// ─── Pricing card ─────────────────────────────────────────────────────────────

function PricingCard({
  plan,
  highlighted,
  onSelect,
}: {
  plan: (typeof PLANS)[number];
  highlighted?: boolean;
  onSelect?: (plan: "MONTHLY" | "ANNUAL") => void;
}) {
  const isFree = plan.key === "FREE";
  const lim = plan.limits;
  const isUnlimited = (n: number) => n === -1;
  const Icon = isFree ? Sparkles : plan.key === "MONTHLY" ? Zap : Crown;

  return (
    <div
      className={`relative flex flex-col rounded-2xl border p-6 transition-all duration-300 ${
        highlighted
          ? "bg-white border-gray-900 shadow-2xl ring-2 ring-gray-900 scale-[1.02]"
          : "bg-white border-gray-200 shadow-sm"
      }`}
    >
      {/* Badge */}
      {plan.badge && (
        <div className="absolute -top-3.5 right-1/2 translate-x-1/2 z-10">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500 px-4 py-1 text-xs font-bold text-white shadow-sm whitespace-nowrap">
            {plan.badge}
          </span>
        </div>
      )}

      {/* Icon + title */}
      <div className="flex items-center gap-3 mb-5">
        <div
          className={`flex h-10 w-10 items-center justify-center rounded-xl shrink-0 ${
            highlighted ? "bg-gray-900" : "bg-gray-100"
          }`}
        >
          <Icon className={`h-5 w-5 ${highlighted ? "text-white" : "text-gray-600"}`} />
        </div>
        <p className="text-base font-bold text-gray-900">{plan.label}</p>
      </div>

      {/* Price */}
      <div className="mb-2">
        <div className="flex items-end gap-1.5" dir="rtl">
          <span className="text-4xl font-black text-gray-900 leading-none">{plan.price}</span>
          <span className="text-sm font-medium text-gray-500 mb-1">{plan.priceSuffix}</span>
        </div>
        {plan.pricePerMonth && (
          <p className="text-xs text-emerald-600 font-semibold mt-1">{plan.pricePerMonth}</p>
        )}
      </div>

      {/* Description */}
      <p className="text-xs text-gray-400 mb-5 leading-relaxed">{plan.description}</p>

      {/* CTA */}
      {isFree ? (
        <div className="mb-5 w-full rounded-xl py-3 text-sm font-semibold text-center bg-gray-100 text-gray-400 cursor-default select-none">
          התוכנית הבסיסית
        </div>
      ) : (
        <button
          onClick={() => onSelect?.(plan.key as "MONTHLY" | "ANNUAL")}
          className={`mb-5 w-full rounded-xl py-3 text-sm font-semibold transition-all duration-200 flex items-center justify-center gap-2 ${
            highlighted
              ? "bg-gray-900 text-white hover:bg-gray-800"
              : "bg-gray-100 text-gray-900 hover:bg-gray-200"
          }`}
        >
          התחל עכשיו
        </button>
      )}

      {/* Quotas box */}
      <div className="rounded-xl bg-gray-50 border border-gray-100 p-4 mb-5 flex flex-col gap-2.5">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400 mb-1">מכסות</p>
        <QuotaItem icon={FolderOpen}   label="פרויקטים" value={lim.projects}  unlimited={isUnlimited(lim.projects)} />
        <QuotaItem icon={Users}        label="אנשי קשר"  value={lim.contacts}  unlimited={isUnlimited(lim.contacts)} />
        <QuotaItem icon={FileText}     label="מסמכים"    value={lim.documents} unlimited={isUnlimited(lim.documents)} />
        <QuotaItem icon={Clapperboard} label="תסריטים"   value={lim.scripts}   unlimited={isUnlimited(lim.scripts)} />
      </div>

      {/* Divider + features */}
      <div className="h-px bg-gray-100 mb-4" />
      <div className="flex flex-col gap-2.5 flex-1" dir="rtl">
        {plan.features.map((f) => (
          <div key={f} className="flex items-start gap-2.5">
            <CheckCircle2 className="h-4 w-4 mt-0.5 shrink-0 text-emerald-500" />
            <span className="text-sm leading-snug text-gray-600">{f}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Comparison table ─────────────────────────────────────────────────────────

type CellValue = boolean | string;

interface ComparisonRow {
  label: string;
  free: CellValue;
  monthly: CellValue;
  annual: CellValue;
}

const COMPARISON_ROWS: ComparisonRow[] = [
  { label: "פרויקטים",              free: "1",    monthly: "∞",   annual: "∞"   },
  { label: "אנשי קשר",              free: "10",   monthly: "∞",   annual: "∞"   },
  { label: "מסמכים להעלאה",         free: "5",    monthly: "∞",   annual: "∞"   },
  { label: "תסריטים",               free: "2",    monthly: "∞",   annual: "∞"   },
  { label: "לוח קנבן",              free: true,   monthly: true,  annual: true  },
  { label: "חשבוניות והצעות מחיר",  free: false,  monthly: true,  annual: true  },
  { label: "לוח תוכן",              free: false,  monthly: true,  annual: true  },
  { label: "לוח השראה",             free: false,  monthly: true,  annual: true  },
  { label: "ניהול הוצאות",          free: false,  monthly: true,  annual: true  },
  { label: "עדיפות בתמיכה",         free: false,  monthly: false, annual: true  },
  { label: "חודשיים חינם",          free: false,  monthly: false, annual: true  },
];

function CellDisplay({ value }: { value: CellValue }) {
  if (typeof value === "boolean") {
    return value
      ? <Check className="h-4 w-4 text-emerald-500 mx-auto" />
      : <Minus className="h-4 w-4 text-gray-300 mx-auto" />;
  }
  return (
    <span className={`text-sm font-semibold ${value === "∞" ? "text-emerald-600 text-base" : "text-gray-800"}`}>
      {value}
    </span>
  );
}

function ComparisonTable() {
  return (
    <div className="overflow-x-auto rounded-2xl border border-gray-200 bg-white shadow-sm">
      <table className="w-full text-right min-w-[460px]" dir="rtl">
        <thead>
          <tr className="border-b border-gray-100 bg-gray-50">
            <th className="px-5 py-4 text-sm font-semibold text-gray-500 text-right w-1/2">פיצ&#39;ר</th>
            <th className="px-4 py-4 text-sm font-bold text-gray-500 text-center">חינמי</th>
            <th className="px-4 py-4 text-sm font-bold text-gray-900 text-center">Pro חודשי</th>
            <th className="px-4 py-4 text-sm font-bold text-emerald-700 text-center bg-emerald-50/60">Pro שנתי</th>
          </tr>
        </thead>
        <tbody>
          {COMPARISON_ROWS.map((row, i) => (
            <tr key={row.label} className={`border-b border-gray-50 last:border-0 ${i % 2 === 0 ? "bg-white" : "bg-gray-50/40"}`}>
              <td className="px-5 py-3 text-sm text-gray-700">{row.label}</td>
              <td className="px-4 py-3 text-center"><CellDisplay value={row.free} /></td>
              <td className="px-4 py-3 text-center"><CellDisplay value={row.monthly} /></td>
              <td className="px-4 py-3 text-center bg-emerald-50/30"><CellDisplay value={row.annual} /></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function BillingPricingPage() {
  const [trialExpired, setTrialExpired] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("trial_expired") === "true") setTrialExpired(true);
  }, []);

  function handleSelect(plan: "MONTHLY" | "ANNUAL") {
    router.push(`/billing/checkout?plan=${plan}`);
  }

  const annualPlan = PLANS.find((p) => p.key === "ANNUAL")!;

  return (
    <div className="max-w-4xl mx-auto space-y-12" dir="rtl">
      {/* Trial expired banner */}
      {trialExpired && (
        <div className="flex items-start gap-3 rounded-2xl bg-red-50 border border-red-200 px-5 py-4">
          <Clock className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-bold text-red-800">תקופת הניסיון שלך הסתיימה</p>
            <p className="text-xs text-red-600 mt-0.5">
              ה-3 ימים חלפו. בחר תוכנית כדי להמשיך להשתמש במערכת ולשמור על כל הנתונים שלך.
            </p>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="text-center space-y-3">
        <p className="text-xs font-semibold uppercase tracking-widest text-gray-400">תמחור</p>
        <h1 className="text-3xl font-black text-gray-900 leading-tight">בחר את התוכנית המתאימה לך</h1>
        <p className="text-base text-gray-500 max-w-md mx-auto">
          כל תוכנית כוללת מכסות שונות. שדרג בכל עת ללא אובדן נתונים.
        </p>
      </div>

      {/* 3 Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start pt-4">
        {PLANS.map((plan) => (
          <PricingCard
            key={plan.key}
            plan={plan}
            highlighted={plan.key === "ANNUAL"}
            onSelect={handleSelect}
          />
        ))}
      </div>

      {/* Annual CTA banner */}
      <div className="rounded-2xl bg-gray-900 text-white px-8 py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div dir="rtl">
          <p className="text-base font-bold">חיסכון של ₪118 בשנה עם מנוי שנתי</p>
          <p className="text-sm text-gray-400 mt-0.5">{annualPlan.pricePerMonth} — ביטול בכל עת.</p>
        </div>
        <button
          onClick={() => handleSelect("ANNUAL")}
          className="shrink-0 rounded-xl bg-white text-gray-900 px-6 py-3 text-sm font-bold hover:bg-gray-100 transition-colors flex items-center gap-2"
        >
          <Crown className="h-4 w-4" />התחל עכשיו — {annualPlan.price}
        </button>
      </div>

      {/* Comparison table */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-gray-900">השוואה מלאה בין התוכניות</h2>
        <ComparisonTable />
      </div>

      {/* Footer */}
      <div className="rounded-2xl border border-gray-100 bg-gray-50 px-6 py-5 text-center">
        <p className="text-sm text-gray-500">
          אין חוזים, אין הפתעות. ניתן לשדרג, לשנמך או לבטל בכל עת.{" "}
          <a href="/settings/billing" className="font-medium text-gray-900 hover:underline">
            לניהול המנוי הנוכחי ←
          </a>
        </p>
      </div>
    </div>
  );
}
