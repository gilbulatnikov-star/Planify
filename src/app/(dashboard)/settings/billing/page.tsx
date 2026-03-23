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
import { useT } from "@/lib/i18n";

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
  const he = useT();
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={!loading ? onClose : undefined}
      />

      {/* Dialog */}
      <div className="relative w-full max-w-md rounded-2xl bg-card shadow-2xl p-6">
        <div className="flex flex-col items-center text-center gap-3 mb-6">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
            <AlertTriangle className="h-6 w-6 text-red-600" />
          </div>
          <h2 className="text-lg font-bold text-foreground">{he.billing.cancelConfirmTitle}</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {he.billing.cancelConfirmDesc}
          </p>
        </div>

        <div className="flex flex-col gap-2">
          <button
            onClick={onClose}
            disabled={loading}
            className="w-full rounded-xl bg-foreground py-2.5 text-sm font-semibold text-white hover:bg-foreground/90 transition-colors disabled:opacity-50"
          >
            {he.billing.keepSubscription}
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 rounded-xl border border-red-200 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                {he.billing.canceling}
              </>
            ) : (
              he.billing.yesCancelSubscription
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ───────────────────────────────────────────────────────────────

export default function BillingPage() {
  const he = useT();
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
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (fetchError) {
    return (
      <div className="flex flex-col items-center justify-center h-48 gap-3" dir="rtl">
        <AlertTriangle className="h-8 w-8 text-red-400" />
        <p className="text-sm text-muted-foreground">{he.billing.loadError}</p>
        <button
          onClick={() => window.location.reload()}
          className="rounded-lg bg-foreground px-4 py-2 text-sm font-medium text-white hover:bg-foreground/90 transition-colors"
        >
          {he.billing.refresh}
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
        <h1 className="text-2xl font-bold text-foreground">{he.billing.subscriptionAndPayments}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{he.billing.subscriptionManagement}</p>
      </div>

      {/* Success banner after upgrade */}
      {justUpgraded && (
        <div className="flex items-center gap-3 rounded-2xl bg-emerald-50 border border-emerald-200 px-5 py-4">
          <PartyPopper className="h-5 w-5 text-emerald-600 shrink-0" />
          <div>
            <p className="text-sm font-semibold text-emerald-800">{he.billing.welcomePro} 🎉</p>
            <p className="text-xs text-emerald-600 mt-0.5">
              {he.billing.upgradeSuccess}
            </p>
          </div>
        </div>
      )}

      {/* ── Active Plan Card ─────────────────────────────────────────── */}
      <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
        <div className="px-6 py-5 flex items-center gap-4 border-b border-border">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-foreground text-white">
            <Crown className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">{he.billing.activePlan}</p>
            <p className="text-xl font-bold text-foreground">{getPlanLabel(plan)}</p>
          </div>
        </div>

        <div className="px-6 py-5 grid grid-cols-2 gap-5">
          {/* Status */}
          <div className="flex flex-col gap-1">
            <p className="text-xs text-muted-foreground font-medium">{he.billing.statusLabel}</p>
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
              <span className="inline-flex items-center gap-1.5 w-fit rounded-full bg-muted px-3 py-1 text-xs font-semibold text-muted-foreground">
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
            <p className="text-xs text-muted-foreground font-medium flex items-center gap-1.5">
              <CalendarDays className="h-3.5 w-3.5" />
              {isCanceled ? he.billing.accessUntil : he.billing.nextRenewal}
            </p>
            <p className="text-sm font-semibold text-foreground">
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
              <p className="text-xs text-muted-foreground font-medium mb-3">{he.billing.planQuotas}</p>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { icon: FolderOpen,   label: he.billing.projectsQuota,  value: lim.projects },
                  { icon: Users,        label: he.billing.contactsQuota,  value: lim.contacts },
                  { icon: FileText,     label: he.billing.documentsQuota,    value: lim.documents },
                  { icon: Clapperboard, label: he.billing.scriptsQuota,   value: lim.scripts },
                ].map(({ icon: Icon, label, value }) => (
                  <div key={label} className="flex items-center gap-2 rounded-xl bg-muted border border-border px-3 py-2.5">
                    <Icon className="h-4 w-4 text-muted-foreground shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-[11px] text-muted-foreground">{label}</p>
                      <p className={`text-sm font-bold ${isUnlimited(value) ? "text-emerald-600" : "text-foreground"}`}>
                        {isUnlimited(value) ? "{he.billing.unlimited}" : formatLimit(value)}
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
          <div className="px-6 pb-5 flex flex-col gap-2 border-t border-border pt-4">
            <p className="text-xs text-muted-foreground font-medium mb-1">{he.billing.includedInPlan}</p>
            {[
              he.billing.includedFeature1,
              he.billing.includedFeature2,
              he.billing.includedFeature3,
              he.billing.includedFeature4,
            ].map((f) => (
              <div key={f} className="flex items-center gap-2 text-sm text-foreground">
                <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                {f}
              </div>
            ))}
          </div>
        )}

        {/* Upgrade CTA for free users */}
        {!isPaid && (
          <div className="px-6 pb-5 border-t border-border pt-4">
            <p className="text-xs text-muted-foreground mb-3">{he.billing.upgradeForMore}</p>
            <a
              href="/billing"
              className="inline-flex items-center gap-2 rounded-xl bg-foreground px-4 py-2.5 text-sm font-semibold text-white hover:bg-foreground/90 transition-colors"
            >
              <Crown className="h-4 w-4" />
              {he.billing.upgradeToPro}
            </a>
          </div>
        )}
      </div>

      {/* ── Payment Method ───────────────────────────────────────────── */}
      <div className="rounded-2xl border border-border bg-card shadow-sm px-6 py-5">
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm font-semibold text-foreground">{he.billing.paymentMethod}</p>
          {/* TODO: replace href with Stripe Customer Portal URL once Stripe is connected */}
          <span className="rounded-full bg-muted px-2.5 py-0.5 text-[11px] font-medium text-muted-foreground">
            בקרוב
          </span>
        </div>
        <div className="flex items-center gap-3 rounded-xl border border-dashed border-border bg-muted/60 px-4 py-3">
          <div className="flex h-9 w-14 items-center justify-center rounded-lg border border-border bg-card shrink-0">
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm text-muted-foreground">
              {he.billing.paymentMethodDesc}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              {he.billing.paymentMethodNote}
            </p>
          </div>
        </div>
      </div>

      {/* ── Danger zone: Cancel ──────────────────────────────────────── */}
      {isPaid && !isCanceled && (
        <div className="rounded-2xl border border-red-100 bg-red-50/50 px-6 py-5">
          <p className="text-sm font-semibold text-foreground mb-1">{he.billing.cancelSubscription}</p>
          <p className="text-xs text-muted-foreground mb-4">
            {he.billing.cancelDesc}
          </p>
          <button
            onClick={() => setShowCancelModal(true)}
            className="text-sm font-medium text-red-600 hover:text-red-700 underline underline-offset-2 transition-colors"
          >
            {he.billing.cancelSubscription}
          </button>
        </div>
      )}

      {isCanceled && endsAt && (
        <div className="rounded-2xl border border-orange-100 bg-orange-50 px-6 py-4">
          <p className="text-sm font-medium text-orange-800">
            {he.billing.canceledNotice} {formatDate(endsAt)}.
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
