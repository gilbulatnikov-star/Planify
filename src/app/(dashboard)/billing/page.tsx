"use client";

import { useEffect, useState } from "react";
import {
  Check,
  Minus,
  Crown,
  Clock,
  Zap,
  Sparkles,
} from "lucide-react";
import { useRouter } from "next/navigation";

// ─── Feature rows ─────────────────────────────────────────────────────────────

const FEATURES = [
  { label: "פרויקטים",              free: "1", monthly: "ללא הגבלה", annual: "ללא הגבלה" },
  { label: "לקוחות",                free: "2", monthly: "ללא הגבלה", annual: "ללא הגבלה" },
  { label: "אנשי קשר",              free: "2", monthly: "ללא הגבלה", annual: "ללא הגבלה" },
  { label: "מסמכים להעלאה",         free: "5", monthly: "ללא הגבלה", annual: "ללא הגבלה" },
  { label: "תסריטים",               free: "1", monthly: "ללא הגבלה", annual: "ללא הגבלה" },
  { label: "לוחות השראה (פריטים)",  free: "2", monthly: "ללא הגבלה", annual: "ללא הגבלה" },
  { label: "לוחות מודבורד",         free: "1", monthly: "ללא הגבלה", annual: "ללא הגבלה" },
  { label: "לוח קנבן",              free: true,  monthly: true,  annual: true  },
  { label: "חשבוניות והצעות מחיר",  free: false, monthly: true,  annual: true  },
  { label: "לוח תוכן",              free: false, monthly: true,  annual: true  },
  { label: "ניהול הוצאות",          free: false, monthly: true,  annual: true  },
  { label: "עדיפות בתמיכה",         free: false, monthly: false, annual: true  },
  { label: "חודשיים חינם",          free: false, monthly: false, annual: true  },
];

// ─── Cell ─────────────────────────────────────────────────────────────────────

function Cell({ value }: { value: boolean | string }) {
  if (value === true)  return <Check className="h-4 w-4 text-violet-500 mx-auto" />;
  if (value === false) return <Minus className="h-4 w-4 text-gray-300 mx-auto" />;
  return (
    <span className={`text-sm font-semibold ${value === "ללא הגבלה" ? "text-violet-600" : "text-gray-700"}`}>
      {value}
    </span>
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

  return (
    <div className="min-h-screen" dir="rtl">
      {/* Trial expired banner */}
      {trialExpired && (
        <div className="mb-6 flex items-start gap-3 rounded-2xl bg-red-50 border border-red-200 px-5 py-4">
          <Clock className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-bold text-red-800">תקופת הניסיון שלך הסתיימה</p>
            <p className="text-xs text-red-600 mt-0.5">
              ה-3 ימים חלפו. בחר תוכנית כדי להמשיך להשתמש במערכת ולשמור על כל הנתונים שלך.
            </p>
          </div>
        </div>
      )}

      {/* ── Header ── */}
      <div className="text-center mb-10 space-y-3">
        <p className="inline-flex items-center gap-1.5 rounded-full bg-violet-100 px-3 py-1 text-xs font-semibold text-violet-700">
          <Crown className="h-3.5 w-3.5" /> תמחור שקוף וגמיש
        </p>
        <h1 className="text-4xl font-black text-gray-900 leading-tight">
          הכל כלול. ללא הפתעות.
        </h1>
        <p className="text-base text-gray-500 max-w-md mx-auto">
          בחר תוכנית, שדרג בכל עת. ביטול חופשי — אין חוזים, אין קנסות.
        </p>
      </div>

      {/* ── 3 Cards: Free | Annual (highlighted) | Monthly ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch mb-14">

        {/* Free */}
        <div className="flex flex-col rounded-2xl border border-gray-200 bg-white p-7 shadow-sm">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-100 mb-5">
            <Sparkles className="h-5 w-5 text-gray-500" />
          </div>
          <p className="text-lg font-bold text-gray-900 mb-1">חינמי</p>
          <p className="text-xs text-gray-400 mb-5">ניסיון של 3 ימים</p>

          <div className="mb-1">
            <span className="text-5xl font-black text-gray-900 leading-none">₪0</span>
          </div>
          <p className="text-xs text-gray-400 mb-7">ל-3 ימי ניסיון</p>

          <div className="mb-7 w-full rounded-xl py-3 text-sm font-semibold text-center bg-gray-100 text-gray-400 cursor-default select-none">
            התוכנית הנוכחית
          </div>

          <div className="flex flex-col gap-3 flex-1">
            {[
              "1 פרויקט ראשון",
              "2 לקוחות + אנשי קשר",
              "גישה מלאה ל-3 ימים",
              "ללא כרטיס אשראי",
            ].map((f) => (
              <div key={f} className="flex items-center gap-2.5">
                <div className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-gray-100">
                  <Check className="h-2.5 w-2.5 text-gray-500" />
                </div>
                <span className="text-sm text-gray-600">{f}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Pro Annual — highlighted, center */}
        <div
          className="relative flex flex-col rounded-2xl p-7 shadow-2xl md:-my-3 z-10"
          style={{ background: "linear-gradient(160deg, #1e1b4b 0%, #312e81 40%, #4c1d95 100%)" }}
        >
          {/* Badge */}
          <div className="absolute -top-4 right-1/2 translate-x-1/2">
            <span className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-amber-400 to-orange-400 px-4 py-1.5 text-xs font-black text-white shadow-lg whitespace-nowrap">
              ✦ הכי משתלם — חיסכון ₪118
            </span>
          </div>

          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 mb-5">
            <Crown className="h-5 w-5 text-white" />
          </div>
          <p className="text-lg font-bold text-white mb-1">Pro שנתי</p>
          <p className="text-xs text-white/50 mb-5">חיוב שנתי — ₪590 לשנה</p>

          <div className="mb-1 flex items-end gap-1.5" dir="ltr">
            <span className="text-5xl font-black text-white leading-none">₪49</span>
            <span className="text-sm text-white/50 mb-1.5">/ חודש</span>
          </div>
          <p className="text-xs font-bold text-emerald-400 mb-7">✓ חודשיים חינם לעומת מנוי חודשי</p>

          <button
            onClick={() => handleSelect("ANNUAL")}
            className="mb-7 w-full rounded-xl py-3.5 text-sm font-black transition-all duration-200 bg-white text-indigo-900 hover:bg-gray-100 shadow-lg"
          >
            התחל עכשיו
          </button>

          <div className="flex flex-col gap-3 flex-1">
            {[
              "פרויקטים ללא הגבלה",
              "לקוחות ואנשי קשר ללא הגבלה",
              "כל פיצ'רי המערכת",
              "חשבוניות והצעות מחיר",
              "לוח תוכן + תסריטים",
              "לוח השראה ומודבורד",
              "עדיפות בתמיכה",
              "חודשיים חינם",
            ].map((f) => (
              <div key={f} className="flex items-center gap-2.5">
                <div className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-white/20">
                  <Check className="h-2.5 w-2.5 text-white" />
                </div>
                <span className="text-sm text-white/80">{f}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Pro Monthly */}
        <div className="flex flex-col rounded-2xl border border-gray-200 bg-white p-7 shadow-sm">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-100 mb-5">
            <Zap className="h-5 w-5 text-gray-600" />
          </div>
          <p className="text-lg font-bold text-gray-900 mb-1">Pro חודשי</p>
          <p className="text-xs text-gray-400 mb-5">חיוב חודשי, ביטול בכל עת</p>

          <div className="mb-1 flex items-end gap-1.5" dir="ltr">
            <span className="text-5xl font-black text-gray-900 leading-none">₪59</span>
            <span className="text-sm text-gray-500 mb-1.5">/ חודש</span>
          </div>
          <p className="text-xs text-gray-400 mb-7">חיוב חודשי — ₪59 לחודש</p>

          <button
            onClick={() => handleSelect("MONTHLY")}
            className="mb-7 w-full rounded-xl py-3 text-sm font-bold transition-all duration-200 bg-gray-100 text-gray-900 hover:bg-gray-200"
          >
            התחל עכשיו
          </button>

          <div className="flex flex-col gap-3 flex-1">
            {[
              "פרויקטים ללא הגבלה",
              "לקוחות ואנשי קשר ללא הגבלה",
              "כל פיצ'רי המערכת",
              "חשבוניות והצעות מחיר",
              "לוח תוכן + תסריטים",
              "לוח השראה ומודבורד",
            ].map((f) => (
              <div key={f} className="flex items-center gap-2.5">
                <div className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-gray-100">
                  <Check className="h-2.5 w-2.5 text-gray-600" />
                </div>
                <span className="text-sm text-gray-600">{f}</span>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* ── Comparison Table ── */}
      <div className="mb-10">
        <h2 className="text-xl font-black text-gray-900 mb-6 text-center">השוואה מלאה</h2>

        <div className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
          <table className="w-full min-w-[500px]" dir="rtl">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="px-6 py-4 text-sm font-semibold text-gray-500 text-right w-2/5 bg-gray-50">פיצ&#39;ר</th>
                <th className="px-4 py-4 text-sm font-bold text-gray-500 text-center bg-gray-50">חינמי</th>
                <th className="px-4 py-4 text-sm font-black text-indigo-700 text-center" style={{ background: "rgba(238,237,255,0.6)" }}>Pro שנתי</th>
                <th className="px-4 py-4 text-sm font-bold text-gray-700 text-center bg-gray-50">Pro חודשי</th>
              </tr>
            </thead>
            <tbody>
              {FEATURES.map((row, i) => (
                <tr key={row.label} className={`border-b border-gray-50 last:border-0 ${i % 2 === 0 ? "bg-white" : "bg-gray-50/30"}`}>
                  <td className="px-6 py-3.5 text-sm text-gray-700 font-medium">{row.label}</td>
                  <td className="px-4 py-3.5 text-center"><Cell value={row.free} /></td>
                  <td className="px-4 py-3.5 text-center" style={{ background: "rgba(238,237,255,0.3)" }}><Cell value={row.annual} /></td>
                  <td className="px-4 py-3.5 text-center"><Cell value={row.monthly} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Trust strip ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10 text-center">
        {[
          { title: "ביטול בכל עת", desc: "אין חוזים, אין קנסות." },
          { title: "שדרוג מיידי", desc: "עוברים לתוכנית גבוהה יותר בלחיצה." },
          { title: "נתונים שלך", desc: "כל הנתונים נשמרים גם לאחר הביטול." },
        ].map((item) => (
          <div key={item.title} className="rounded-2xl border border-gray-100 bg-gray-50 px-5 py-5">
            <p className="text-sm font-bold text-gray-900 mb-1">{item.title}</p>
            <p className="text-xs text-gray-500">{item.desc}</p>
          </div>
        ))}
      </div>

      <p className="text-center text-xs text-gray-400">
        לניהול המנוי הנוכחי{" "}
        <a href="/settings/billing" className="font-medium text-gray-700 hover:underline">
          לחץ כאן ←
        </a>
      </p>
    </div>
  );
}
