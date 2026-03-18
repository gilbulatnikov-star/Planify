"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import {
  CheckCircle2,
  CreditCard,
  CalendarDays,
  Crown,
  AlertTriangle,
  Loader2,
  Pencil,
  PartyPopper,
  FolderOpen,
  Users,
  FileText,
  Clapperboard,
} from "lucide-react";
import { getLimitsForPlan, formatLimit } from "@/lib/plan-limits";

// ─── Types ───────────────────────────────────────────────────────────────────

interface UserBilling {
  id: string;
  name: string | null;
  email: string;
  subscriptionPlan: string;
  subscriptionStatus: string | null;
  subscriptionEndsAt: string | null;
}

// ─── Plan display helpers ────────────────────────────────────────────────────

function getPlanLabel(plan: string) {
  switch (plan) {
    case "MONTHLY": return "Pro Monthly";
    case "ANNUAL":  return "Pro Annual";
    default:        return "Free";
  }
}

function formatDate(date: string | null | undefined) {
  if (!date) return "—";
  return new Date(date).toLocaleDateString("he-IL", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

// ─── Cancel Confirmation Modal ───────────────────────────────────────────────

function CancelModal({
  onClose,
  onConfirm,
  loading,
}: {
  onClose: () => void;
  onConfirm: () => Promise<void>;
  loading: boolean;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={!loading ? onClose : undefined}
      />

      {/* Dialog */}
      <div className="relative w-full max-w-md rounded-2xl bg-white shadow-2xl p-6">
        <div className="flex flex-col items-center text-center gap-3 mb-6">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
            <AlertTriangle className="h-6 w-6 text-red-600" />
          </div>
          <h2 className="text-lg font-bold text-gray-900">ביטול המנוי</h2>
          <p className="text-sm text-gray-500 leading-relaxed">
            האם אתה בטוח שברצונך לבטל את המנוי?<br />
            תאבד גישה לפיצ&#39;רים הפרמיום בסוף מחזור החיוב הנוכחי.
          </p>
        </div>

        <div className="flex flex-col gap-2">
          <button
            onClick={onClose}
            disabled={loading}
            className="w-full rounded-xl bg-gray-900 py-2.5 text-sm font-semibold text-white hover:bg-gray-800 transition-colors disabled:opacity-50"
          >
            שמור על המנוי שלי
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 rounded-xl border border-red-200 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                מבטל...
              </>
            ) : (
              "כן, בטל את המנוי"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ───────────────────────────────────────────────────────────────

export default function BillingPage() {
  const { update: updateSession } = useSession();
  const [user, setUser] = useState<UserBilling | null>(null);
  const [fetching, setFetching] = useState(true);
  const [fetchError, setFetchError] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [canceling, setCanceling] = useState(false);
  // Read ?success=true from URL without useSearchParams (avoids Suspense requirement)
  const [justUpgraded, setJustUpgraded] = useState(false);

  useEffect(() => {
    // Detect success param client-side
    const params = new URLSearchParams(window.location.search);
    const plan = params.get("plan");
    if (params.get("success") === "true") {
      setJustUpgraded(true);
      // Refresh the JWT so middleware picks up the new subscriptionPlan immediately
      if (plan) updateSession({ subscriptionPlan: plan });
    }

    // Fetch user billing data
    fetch("/api/user/me")
      .then(async (r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        const text = await r.text();
        if (!text) throw new Error("Empty response");
        return JSON.parse(text) as UserBilling;
      })
      .then(setUser)
      .catch(() => setFetchError(true))
      .finally(() => setFetching(false));
  }, []);

  async function handleCancel() {
    setCanceling(true);
    try {
      const res = await fetch("/api/checkout/cancel", { method: "POST" });
      if (res.ok && user) {
        setUser({ ...user, subscriptionStatus: "CANCELED" });
      }
      setShowCancelModal(false);
    } finally {
      setCanceling(false);
    }
  }

  if (fetching) {
    return (
      <div className="flex items-center justify-center h-48">
        <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
      </div>
    );
  }

  if (fetchError) {
    return (
      <div className="flex flex-col items-center justify-center h-48 gap-3" dir="rtl">
        <AlertTriangle className="h-8 w-8 text-red-400" />
        <p className="text-sm text-gray-500">לא ניתן לטעון את פרטי המנוי. נסה לרענן את הדף.</p>
        <button
          onClick={() => window.location.reload()}
          className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 transition-colors"
        >
          רענן
        </button>
      </div>
    );
  }

  const plan = user?.subscriptionPlan ?? "FREE";
  const status = user?.subscriptionStatus ?? "";
  const endsAt = user?.subscriptionEndsAt ?? null;

  const isPaid = plan !== "FREE";
  const isActive = status === "ACTIVE";
  const isCanceled = status === "CANCELED";

  return (
    <div className="max-w-2xl mx-auto space-y-6" dir="rtl">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">מנוי ותשלומים</h1>
        <p className="mt-1 text-sm text-gray-500">ניהול המנוי, שיטת התשלום ואפשרויות החיוב</p>
      </div>

      {/* Success banner after upgrade */}
      {justUpgraded && (
        <div className="flex items-center gap-3 rounded-2xl bg-emerald-50 border border-emerald-200 px-5 py-4">
          <PartyPopper className="h-5 w-5 text-emerald-600 shrink-0" />
          <div>
            <p className="text-sm font-semibold text-emerald-800">ברוך הבא לתוכנית הפרו! 🎉</p>
            <p className="text-xs text-emerald-600 mt-0.5">
              השדרוג הצליח. כעת יש לך גישה לכל הפיצ&#39;רים.
            </p>
          </div>
        </div>
      )}

      {/* ── Active Plan Card ─────────────────────────────────────────── */}
      <div className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
        <div className="px-6 py-5 flex items-center gap-4 border-b border-gray-100">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gray-900 text-white">
            <Crown className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">תוכנית פעילה</p>
            <p className="text-xl font-bold text-gray-900">{getPlanLabel(plan)}</p>
          </div>
        </div>

        <div className="px-6 py-5 grid grid-cols-2 gap-5">
          {/* Status */}
          <div className="flex flex-col gap-1">
            <p className="text-xs text-gray-500 font-medium">סטטוס</p>
            {isCanceled ? (
              <span className="inline-flex items-center gap-1.5 w-fit rounded-full bg-red-100 px-3 py-1 text-xs font-semibold text-red-700">
                <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
                בוטל
              </span>
            ) : isActive ? (
              <span className="inline-flex items-center gap-1.5 w-fit rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                פעיל
              </span>
            ) : plan === "FREE" ? (
              <span className="inline-flex items-center gap-1.5 w-fit rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-600">
                חינמי
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 w-fit rounded-full bg-yellow-100 px-3 py-1 text-xs font-semibold text-yellow-700">
                {status || "—"}
              </span>
            )}
          </div>

          {/* Next renewal */}
          <div className="flex flex-col gap-1">
            <p className="text-xs text-gray-500 font-medium flex items-center gap-1.5">
              <CalendarDays className="h-3.5 w-3.5" />
              {isCanceled ? "גישה עד" : "חידוש הבא"}
            </p>
            <p className="text-sm font-semibold text-gray-800">
              {formatDate(endsAt)}
            </p>
          </div>
        </div>

        {/* Quota limits for current plan */}
        {(() => {
          const lim = getLimitsForPlan(plan);
          const isUnlimited = (n: number) => n === -1;
          return (
            <div className="px-6 pb-5">
              <p className="text-xs text-gray-500 font-medium mb-3">מכסות התוכנית</p>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { icon: FolderOpen,   label: "פרויקטים",  value: lim.projects },
                  { icon: Users,        label: "אנשי קשר",  value: lim.contacts },
                  { icon: FileText,     label: "מסמכים",    value: lim.documents },
                  { icon: Clapperboard, label: "תסריטים",   value: lim.scripts },
                ].map(({ icon: Icon, label, value }) => (
                  <div key={label} className="flex items-center gap-2 rounded-xl bg-gray-50 border border-gray-100 px-3 py-2.5">
                    <Icon className="h-4 w-4 text-gray-400 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-[11px] text-gray-400">{label}</p>
                      <p className={`text-sm font-bold ${isUnlimited(value) ? "text-emerald-600" : "text-gray-900"}`}>
                        {isUnlimited(value) ? "ללא הגבלה" : formatLimit(value)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })()}

        {/* Features checklist */}
        {isPaid && (
          <div className="px-6 pb-5 flex flex-col gap-2 border-t border-gray-100 pt-4">
            <p className="text-xs text-gray-500 font-medium mb-1">מה כלול בתוכנית שלך</p>
            {[
              "כל פיצ'רי המערכת",
              "חשבוניות והצעות מחיר",
              "לוח תוכן + תסריטים + השראה",
              "גישה לכל העדכונים העתידיים",
            ].map((f) => (
              <div key={f} className="flex items-center gap-2 text-sm text-gray-700">
                <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                {f}
              </div>
            ))}
          </div>
        )}

        {/* Upgrade CTA for free users */}
        {!isPaid && (
          <div className="px-6 pb-5 border-t border-gray-100 pt-4">
            <p className="text-xs text-gray-500 mb-3">שדרג לקבלת מכסות גדולות יותר וגישה לכל הפיצ&#39;רים</p>
            <a
              href="/billing"
              className="inline-flex items-center gap-2 rounded-xl bg-gray-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-gray-800 transition-colors"
            >
              <Crown className="h-4 w-4" />
              שדרג לפרו
            </a>
          </div>
        )}
      </div>

      {/* ── Payment Method ───────────────────────────────────────────── */}
      <div className="rounded-2xl border border-gray-200 bg-white shadow-sm px-6 py-5">
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm font-semibold text-gray-900">שיטת תשלום</p>
          {/* TODO: replace href with Stripe Customer Portal URL once Stripe is connected */}
          <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-[11px] font-medium text-gray-400">
            בקרוב
          </span>
        </div>
        <div className="flex items-center gap-3 rounded-xl border border-dashed border-gray-200 bg-gray-50/60 px-4 py-3">
          <div className="flex h-9 w-14 items-center justify-center rounded-lg border border-gray-200 bg-white shrink-0">
            <CreditCard className="h-4 w-4 text-gray-400" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm text-gray-400">
              ניהול שיטת התשלום יהיה זמין לאחר חיבור מערכת הסליקה (Stripe).
            </p>
            <p className="text-xs text-gray-300 mt-0.5">
              לאחר החיבור — הכפתור יפתח את פורטל הלקוח של Stripe לניהול הכרטיס.
            </p>
          </div>
        </div>
      </div>

      {/* ── Danger zone: Cancel ──────────────────────────────────────── */}
      {isPaid && !isCanceled && (
        <div className="rounded-2xl border border-red-100 bg-red-50/50 px-6 py-5">
          <p className="text-sm font-semibold text-gray-900 mb-1">ביטול מנוי</p>
          <p className="text-xs text-gray-500 mb-4">
            לאחר הביטול תמשיך ליהנות מהגישה עד סוף תקופת החיוב הנוכחית.
          </p>
          <button
            onClick={() => setShowCancelModal(true)}
            className="text-sm font-medium text-red-600 hover:text-red-700 underline underline-offset-2 transition-colors"
          >
            ביטול מנוי
          </button>
        </div>
      )}

      {isCanceled && endsAt && (
        <div className="rounded-2xl border border-orange-100 bg-orange-50 px-6 py-4">
          <p className="text-sm font-medium text-orange-800">
            המנוי שלך בוטל. תוכל להמשיך להשתמש בפיצ&#39;רים הפרמיום עד{" "}
            {formatDate(endsAt)}.
          </p>
        </div>
      )}

      {/* Cancel modal */}
      {showCancelModal && (
        <CancelModal
          onClose={() => setShowCancelModal(false)}
          onConfirm={handleCancel}
          loading={canceling}
        />
      )}
    </div>
  );
}
