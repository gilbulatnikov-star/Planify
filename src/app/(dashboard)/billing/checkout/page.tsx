"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  CreditCard,
  Lock,
  CheckCircle2,
  ArrowRight,
  Loader2,
  Zap,
  Crown,
  ShieldCheck,
} from "lucide-react";
import { PLANS } from "@/lib/plan-limits";

// ─── Card number formatter ────────────────────────────────────────────────────

function formatCardNumber(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 16);
  return digits.replace(/(.{4})/g, "$1 ").trim();
}

function formatExpiry(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 4);
  if (digits.length >= 3) return digits.slice(0, 2) + "/" + digits.slice(2);
  return digits;
}

// ─── Mini plan summary ────────────────────────────────────────────────────────

function PlanSummary({ planKey }: { planKey: "MONTHLY" | "ANNUAL" }) {
  const plan = PLANS.find((p) => p.key === planKey)!;
  const Icon = planKey === "MONTHLY" ? Zap : Crown;
  const isAnnual = planKey === "ANNUAL";

  return (
    <div className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
      {/* Header */}
      <div className={`px-6 py-5 ${isAnnual ? "bg-gray-900" : "bg-gray-100"}`}>
        <div className="flex items-center gap-3">
          <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${isAnnual ? "bg-white/10" : "bg-gray-200"}`}>
            <Icon className={`h-5 w-5 ${isAnnual ? "text-white" : "text-gray-700"}`} />
          </div>
          <div>
            <p className={`text-sm font-bold ${isAnnual ? "text-white" : "text-gray-900"}`}>{plan.label}</p>
            <p className={`text-xs ${isAnnual ? "text-gray-300" : "text-gray-500"}`}>{plan.description}</p>
          </div>
        </div>
      </div>

      {/* Price */}
      <div className="px-6 py-4 border-b border-gray-100">
        <div className="flex items-end justify-between" dir="rtl">
          <div>
            <span className="text-3xl font-black text-gray-900">{plan.price}</span>
            <span className="text-sm text-gray-400 mr-1.5">{plan.priceSuffix}</span>
          </div>
          {isAnnual && (
            <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 border border-emerald-100 rounded-lg px-2.5 py-1">
              חיסכון ₪118
            </span>
          )}
        </div>
        {plan.pricePerMonth && (
          <p className="text-xs text-emerald-600 font-semibold mt-1">{plan.pricePerMonth}</p>
        )}
      </div>

      {/* Features */}
      <div className="px-6 py-4 space-y-2.5" dir="rtl">
        {plan.features.map((f) => (
          <div key={f} className="flex items-start gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
            <span className="text-sm text-gray-600">{f}</span>
          </div>
        ))}
      </div>

      {/* Guarantee */}
      <div className="px-6 py-3 bg-gray-50 border-t border-gray-100 flex items-center gap-2" dir="rtl">
        <ShieldCheck className="h-4 w-4 text-gray-400 shrink-0" />
        <p className="text-xs text-gray-500">ביטול בכל עת, ללא חיוב נוסף</p>
      </div>
    </div>
  );
}

// ─── Credit card visual ───────────────────────────────────────────────────────

function CardVisual({
  number,
  name,
  expiry,
}: {
  number: string;
  name: string;
  expiry: string;
}) {
  const display = (number + "                ").replace(/ /g, "").padEnd(16, "•").replace(/(.{4})/g, "$1 ").trim();

  return (
    <div className="relative h-[160px] w-full max-w-[320px] mx-auto rounded-2xl bg-gradient-to-br from-gray-800 to-gray-950 shadow-xl overflow-hidden select-none">
      {/* Shine */}
      <div className="absolute inset-0 bg-gradient-to-tr from-white/5 via-white/10 to-transparent" />
      {/* Chip */}
      <div className="absolute top-7 right-6 h-8 w-10 rounded-md bg-gradient-to-br from-yellow-300 to-yellow-500 shadow-inner" />
      {/* Number */}
      <p className="absolute bottom-10 right-6 left-6 text-white font-mono text-lg tracking-[0.18em] font-medium" dir="ltr">
        {display}
      </p>
      {/* Footer */}
      <div className="absolute bottom-4 right-6 left-6 flex items-end justify-between" dir="ltr">
        <div>
          <p className="text-gray-400 text-[9px] uppercase tracking-widest">Card Holder</p>
          <p className="text-white text-xs font-semibold truncate max-w-[140px]">
            {name || "YOUR NAME"}
          </p>
        </div>
        <div className="text-right">
          <p className="text-gray-400 text-[9px] uppercase tracking-widest">Expires</p>
          <p className="text-white text-xs font-semibold">{expiry || "MM/YY"}</p>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function CheckoutPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const planParam = searchParams.get("plan") as "MONTHLY" | "ANNUAL" | null;

  const [cardNumber, setCardNumber] = useState("");
  const [cardName, setCardName] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const plan = planParam === "MONTHLY" || planParam === "ANNUAL" ? planParam : null;

  useEffect(() => {
    if (!plan) router.replace("/billing");
  }, [plan, router]);

  if (!plan) return null;

  const planMeta = PLANS.find((p) => p.key === plan)!;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    // Basic validation
    const digits = cardNumber.replace(/\D/g, "");
    if (digits.length < 16) { setError("מספר כרטיס אינו תקין"); return; }
    if (!cardName.trim()) { setError("יש להזין שם בעל הכרטיס"); return; }
    const expiryDigits = expiry.replace(/\D/g, "");
    if (expiryDigits.length < 4) { setError("תאריך תפוגה אינו תקין"); return; }
    if (cvv.length < 3) { setError("CVV אינו תקין"); return; }

    setLoading(true);
    try {
      const res = await fetch("/api/checkout/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "שגיאה בעיבוד התשלום");
      } else if (data.url) {
        router.push(data.url);
      }
    } catch {
      setError("שגיאת רשת, נסה שוב");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6" dir="rtl">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 transition-colors"
        >
          <ArrowRight className="h-4 w-4" />
          חזור
        </button>
        <div className="h-4 w-px bg-gray-200" />
        <h1 className="text-xl font-bold text-gray-900">סיום רכישה</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
        {/* Left: Plan summary */}
        <div className="space-y-4">
          <PlanSummary planKey={plan} />

          {/* Security badges */}
          <div className="flex items-center justify-center gap-6 py-2">
            <div className="flex items-center gap-1.5">
              <Lock className="h-3.5 w-3.5 text-gray-400" />
              <span className="text-xs text-gray-400">תשלום מאובטח SSL</span>
            </div>
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="h-3.5 w-3.5 text-gray-400" />
              <span className="text-xs text-gray-400">הצפנה PCI DSS</span>
            </div>
          </div>
        </div>

        {/* Right: Payment form */}
        <div className="rounded-2xl border border-gray-200 bg-white shadow-sm p-6 space-y-5">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-900">
              <CreditCard className="h-4 w-4 text-white" />
            </div>
            <h2 className="text-base font-bold text-gray-900">פרטי כרטיס אשראי</h2>
          </div>

          {/* Card visual */}
          <CardVisual number={cardNumber} name={cardName} expiry={expiry} />

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Card number */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                מספר כרטיס
              </label>
              <input
                type="text"
                inputMode="numeric"
                placeholder="0000 0000 0000 0000"
                value={cardNumber}
                onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                maxLength={19}
                dir="ltr"
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm font-mono text-gray-900 placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all"
              />
            </div>

            {/* Cardholder name */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                שם בעל הכרטיס
              </label>
              <input
                type="text"
                placeholder="ישראל ישראלי"
                value={cardName}
                onChange={(e) => setCardName(e.target.value)}
                dir="rtl"
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-900 placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all"
              />
            </div>

            {/* Expiry + CVV */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  תאריך תפוגה
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  placeholder="MM/YY"
                  value={expiry}
                  onChange={(e) => setExpiry(formatExpiry(e.target.value))}
                  maxLength={5}
                  dir="ltr"
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm font-mono text-gray-900 placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  CVV
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  placeholder="123"
                  value={cvv}
                  onChange={(e) => setCvv(e.target.value.replace(/\D/g, "").slice(0, 4))}
                  maxLength={4}
                  dir="ltr"
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm font-mono text-gray-900 placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all"
                />
              </div>
            </div>

            {/* Error */}
            {error && (
              <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl px-4 py-2.5">
                {error}
              </p>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-gray-900 text-white py-3.5 text-sm font-bold hover:bg-gray-800 disabled:opacity-60 transition-all flex items-center justify-center gap-2 shadow-sm"
            >
              {loading ? (
                <><Loader2 className="h-4 w-4 animate-spin" />מעבד תשלום...</>
              ) : (
                <><Lock className="h-4 w-4" />שלם {planMeta.price} עכשיו</>
              )}
            </button>

            <p className="text-center text-xs text-gray-400">
              על ידי לחיצה על &quot;שלם&quot; אתה מסכים ל
              <a href="#" className="underline hover:text-gray-700">תנאי השירות</a>
              {" "}ול
              <a href="#" className="underline hover:text-gray-700">מדיניות הפרטיות</a>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
