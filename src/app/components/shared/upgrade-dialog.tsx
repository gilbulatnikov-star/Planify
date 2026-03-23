"use client";

import { useRouter } from "next/navigation";
import { Crown, X, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useT } from "@/lib/i18n";

interface UpgradeDialogProps {
  open: boolean;
  onClose: () => void;
  feature: string;
  limit: number;
}

export function UpgradeDialog({ open, onClose, feature, limit }: UpgradeDialogProps) {
  const router = useRouter();
  const he = useT();

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div
        className="relative bg-card rounded-2xl shadow-2xl max-w-sm w-full p-6"
        dir="rtl"
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 left-4 p-1.5 rounded-full hover:bg-[#38b6ff]/10 text-muted-foreground hover:text-[#38b6ff] transition-colors"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Crown icon */}
        <div className="flex justify-center mb-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#38b6ff] shadow-lg">
            <Crown className="h-8 w-8 text-white" />
          </div>
        </div>

        {/* Title */}
        <h2 className="text-xl font-black text-foreground text-center mb-1">
          {he.upgrade.reachedLimit}
        </h2>
        <p className="text-sm text-muted-foreground text-center mb-5 leading-relaxed">
          {he.upgrade.freeLimit} <span className="font-bold text-foreground">{limit} {feature}</span>.{" "}
          {he.upgrade.upgradeForUnlimited}
        </p>

        {/* Features list */}
        <div className="rounded-xl bg-muted border border-border p-4 mb-5 space-y-2.5">
          {[
            he.upgrade.feature1,
            he.upgrade.feature2,
            he.upgrade.feature3,
          ].map((f) => (
            <div key={f} className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-emerald-500 shrink-0" />
              <span className="text-sm text-muted-foreground">{f}</span>
            </div>
          ))}
        </div>

        {/* Primary CTA */}
        <Button
          onClick={() => {
            onClose();
            router.push("/billing");
          }}
          className="w-full bg-[#38b6ff] text-white hover:bg-[#38b6ff]/90 rounded-xl py-3 text-sm font-bold flex items-center justify-center gap-2"
        >
          <Crown className="h-4 w-4" />
          {he.upgrade.upgradeNow}
        </Button>

        {/* Secondary dismiss */}
        <button
          onClick={onClose}
          className="w-full mt-2 text-xs text-muted-foreground hover:text-muted-foreground transition-colors py-2"
        >
          {he.upgrade.maybeLater}
        </button>
      </div>
    </div>
  );
}
