"use client";

import { useEffect, useState } from "react";
import { Check, Minus, Crown, Clock, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";
import { useT } from "@/lib/i18n";

function Cell({ value, unlimitedLabel }: { value: boolean | string; unlimitedLabel?: string }) {
  if (value === true)  return <Check className="h-4 w-4 text-[#38b6ff] mx-auto" />;
  if (value === false) return <Minus className="h-4 w-4 text-gray-200 mx-auto" />;
  return (
    <span className={`text-sm font-semibold ${value === unlimitedLabel ? "text-[#38b6ff]" : "text-foreground"}`}>
      {value}
    </span>
  );
}

export default function BillingPricingPage() {
  const [billing, setBilling] = useState<"annual" | "monthly">("annual");
  const [trialExpired, setTrialExpired] = useState(false);
  const router = useRouter();
  const he = useT();

  const FEATURES = [
    { label: he.billing.featureProjects,         free: "1",    pro: he.billing.unlimited },
    { label: he.billing.featureClients,           free: "3",    pro: he.billing.unlimited },
    { label: he.billing.featureContacts,          free: "2",    pro: he.billing.unlimited },
    { label: he.billing.featureDocuments,          free: "5",    pro: he.billing.unlimited },
    { label: he.billing.featureScripts,            free: "1",    pro: he.billing.unlimited },
    { label: he.billing.featureInspiration,        free: "2",    pro: he.billing.unlimited },
    { label: he.billing.featureMoodboards,         free: "1",    pro: he.billing.unlimited },
    { label: he.billing.featureDailyTasks,         free: "3",    pro: he.billing.unlimited },
    { label: he.billing.featureInvoices,           free: false,  pro: true },
    { label: he.billing.featureCalendar,           free: false,  pro: true },
    { label: he.billing.featureExpenses,           free: false,  pro: true },
    { label: he.billing.featurePrioritySupport,    free: false,  pro: true },
  ];

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("trial_expired") === "true") setTrialExpired(true);
  }, []);

  const isAnnual = billing === "annual";
  const price = isAnnual ? "₪49" : "₪59";
  const priceSub = isAnnual ? he.billing.annualPriceSuffix : he.billing.monthlyPriceSuffix;
  const planKey = isAnnual ? "ANNUAL" : "MONTHLY";

  return (
    <div className="min-h-screen" dir="rtl">

      {/* Trial expired banner */}
      {trialExpired && (
        <div className="mb-6 flex items-start gap-3 rounded-2xl bg-red-50 border border-red-200 px-5 py-4">
          <Clock className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-bold text-red-800">{he.billing.trialExpiredTitle}</p>
            <p className="text-xs text-red-600 mt-0.5">
              {he.billing.trialExpiredDesc}
            </p>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="text-center mb-6 sm:mb-8 space-y-2 sm:space-y-3">
        <p className="inline-flex items-center gap-1.5 rounded-full bg-[#38b6ff]/10 px-3 py-1 text-xs font-semibold text-[#38b6ff]">
          <Crown className="h-3.5 w-3.5" /> {he.billing.transparentPricing}
        </p>
        <h1 className="text-2xl sm:text-4xl font-black text-foreground leading-tight">
          {he.billing.allIncluded}
        </h1>
        <p className="text-base text-muted-foreground max-w-md mx-auto">
          {he.billing.cancelAnytime}
        </p>

        {/* Billing toggle */}
        <div className="flex items-center justify-center gap-3 pt-2">
          <span className={`text-sm font-semibold ${billing === "monthly" ? "text-foreground" : "text-muted-foreground"}`}>
            חודשי
          </span>
          <button
            dir="ltr"
            onClick={() => setBilling(b => b === "annual" ? "monthly" : "annual")}
            className={`relative inline-flex h-7 w-14 shrink-0 rounded-full transition-colors duration-300 ${isAnnual ? "bg-[#38b6ff]" : "bg-muted-foreground/30"}`}
          >
            <span
              className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-card shadow-sm ring-0 transition-transform duration-300 mt-1 ${
                isAnnual ? "translate-x-1" : "translate-x-8"
              }`}
            />
          </button>
          <span className={`text-sm font-semibold flex items-center gap-1.5 ${billing === "annual" ? "text-foreground" : "text-muted-foreground"}`}>
            שנתי
            <span className={`inline-flex items-center rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-black text-amber-600 transition-opacity duration-200 ${isAnnual ? "opacity-100" : "opacity-0"}`}>
              {he.billing.savings}
            </span>
          </span>
        </div>
      </div>

      {/* 2 Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch mb-12 max-w-3xl mx-auto">

        {/* Free */}
        <div className="flex flex-col rounded-2xl border border-border bg-card p-5 sm:p-8 shadow-sm">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-muted mb-4 sm:mb-5">
            <Sparkles className="h-5 w-5 text-muted-foreground" />
          </div>
          <p className="text-lg sm:text-xl font-black text-foreground mb-1">{he.billing.freePlan}</p>
          <p className="text-xs text-muted-foreground mb-4 sm:mb-6">{he.billing.trialDays}</p>

          <div className="mb-1">
            <span className="text-4xl sm:text-5xl font-black text-foreground leading-none">₪0</span>
          </div>
          <p className="text-xs text-muted-foreground mb-5 sm:mb-8">{he.billing.forTrialDays}</p>

          <div className="mb-5 sm:mb-8 w-full rounded-xl py-3 sm:py-3.5 text-sm font-semibold text-center bg-muted text-muted-foreground cursor-default select-none">
            התוכנית הנוכחית
          </div>

          <div className="flex flex-col gap-3 flex-1">
            {[he.billing.freeFeature1, he.billing.freeFeature2, he.billing.freeFeature3, he.billing.freeFeature4].map((f) => (
              <div key={f} className="flex items-center gap-2.5">
                <div className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-muted">
                  <Check className="h-2.5 w-2.5 text-muted-foreground" />
                </div>
                <span className="text-sm text-muted-foreground">{f}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Pro */}
        <div className="relative flex flex-col rounded-2xl p-5 sm:p-8 shadow-2xl" style={{ background: "linear-gradient(145deg, #0284c7 0%, #38b6ff 55%, #7dd3fc 100%)" }}>
          {isAnnual && (
            <div className="absolute -top-4 right-6">
              <span className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-amber-400 to-orange-400 px-4 py-1.5 text-xs font-black text-white shadow-lg whitespace-nowrap">
                {he.billing.bestValue}
              </span>
            </div>
          )}

          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-card/20 mb-4 sm:mb-5">
            <Crown className="h-5 w-5 text-white" />
          </div>
          <p className="text-lg sm:text-xl font-black text-white mb-1">Planify Pro {isAnnual ? he.billing.annual : he.billing.monthly}</p>
          <p className="text-xs text-white/40 mb-4 sm:mb-6">{isAnnual ? he.billing.annualBilling : he.billing.monthlyBilling}</p>

          <div className="mb-1 flex items-end gap-1.5">
            <span className="text-4xl sm:text-5xl font-black text-white leading-none">{price}</span>
            <span className="text-sm text-white/40 mb-1.5">{he.billing.perMonth}</span>
          </div>
          <p className="text-xs text-white/40 mb-2">{priceSub}</p>
          {isAnnual && (
            <p className="text-xs font-bold text-white/90 mb-6">{he.billing.twoMonthsFree}</p>
          )}
          {!isAnnual && <div className="mb-6" />}

          <button
            onClick={() => router.push(`/billing/checkout?plan=${planKey}`)}
            className="mb-8 w-full rounded-xl py-3.5 text-sm font-black transition-all duration-200 bg-[#0a0a0a] text-white hover:bg-[#0a0a0a]/80 shadow-lg"
          >
            {he.billing.startNow}
          </button>

          <div className="flex flex-col gap-3 flex-1">
            {[
              he.billing.proFeature1,
              he.billing.proFeature2,
              he.billing.proFeature3,
              he.billing.proFeature4,
              he.billing.proFeature5,
              he.billing.proFeature6,
              ...(isAnnual ? [he.billing.proFeatureAnnual1, he.billing.proFeatureAnnual2] : []),
            ].map((f) => (
              <div key={f} className="flex items-center gap-2.5">
                <div className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-card/25">
                  <Check className="h-2.5 w-2.5 text-white" />
                </div>
                <span className="text-sm text-white/70">{f}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Comparison table — hidden on mobile */}
      <div className="mb-10 max-w-3xl mx-auto hidden sm:block">
        <h2 className="text-xl font-black text-foreground mb-5 text-center">{he.billing.fullComparison}</h2>
        <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
          <table className="w-full" dir="rtl">
            <thead>
              <tr className="border-b border-border">
                <th className="px-6 py-4 text-sm font-semibold text-muted-foreground text-right bg-muted">פיצ&#39;ר</th>
                <th className="px-4 py-4 text-sm font-bold text-muted-foreground text-center bg-muted">{he.billing.freePlan}</th>
                <th className="px-4 py-4 text-sm font-black text-foreground text-center bg-[#38b6ff]/5">
                  Pro {isAnnual ? he.billing.annual : he.billing.monthly}
                </th>
              </tr>
            </thead>
            <tbody>
              {FEATURES.map((row, i) => (
                <tr key={row.label} className={`border-b border-gray-50 last:border-0 ${i % 2 === 0 ? "bg-card" : "bg-muted/40"}`}>
                  <td className="px-6 py-3.5 text-sm text-foreground font-medium">{row.label}</td>
                  <td className="px-4 py-3.5 text-center"><Cell value={row.free} unlimitedLabel={he.billing.unlimited} /></td>
                  <td className="px-4 py-3.5 text-center bg-[#38b6ff]/5"><Cell value={row.pro} unlimitedLabel={he.billing.unlimited} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Trust strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10 max-w-3xl mx-auto text-center">
        {[
          { title: he.billing.trustCancel, desc: he.billing.trustCancelDesc },
          { title: he.billing.trustUpgrade, desc: he.billing.trustUpgradeDesc },
          { title: he.billing.trustData, desc: he.billing.trustDataDesc },
        ].map((item) => (
          <div key={item.title} className="rounded-2xl border border-[#38b6ff]/15 bg-[#38b6ff]/5 px-5 py-5">
            <p className="text-sm font-bold text-foreground mb-1">{item.title}</p>
            <p className="text-xs text-muted-foreground">{item.desc}</p>
          </div>
        ))}
      </div>

      <p className="text-center text-xs text-muted-foreground pb-6">
        {he.billing.manageSubscription}{" "}
        <a href="/settings/billing" className="font-medium text-[#38b6ff] hover:underline">
          {he.billing.clickHere}
        </a>
      </p>
    </div>
  );
}
