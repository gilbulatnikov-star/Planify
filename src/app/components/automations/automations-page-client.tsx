"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Zap,
  UserPlus,
  FileText,
  FolderKanban,
  Receipt,
  ListTodo,
} from "lucide-react";
import { motion } from "framer-motion";
import { useT } from "@/lib/i18n";
import { toggleAutomation } from "@/lib/actions/automation-actions";
import { AUTOMATION_TEMPLATES } from "@/lib/automation-templates";

interface AutomationRule {
  id: string;
  templateId: string;
  enabled: boolean;
  config: unknown;
  createdAt: Date;
  updatedAt: Date;
}

const CATEGORY_MAP: Record<string, string> = {
  stale_lead_24h: "leads",
  stale_lead_72h: "leads",
  proposal_followup_3d: "proposals",
  proposal_followup_7d: "proposals",
  deadline_24h: "projects",
  overdue_invoice: "payments",
  task_reminder: "tasks",
};

const CATEGORY_ICONS: Record<string, React.ElementType> = {
  leads: UserPlus,
  proposals: FileText,
  projects: FolderKanban,
  payments: Receipt,
  tasks: ListTodo,
};

const CATEGORY_ORDER = ["leads", "proposals", "projects", "payments", "tasks"];

export function AutomationsPageClient({
  initialRules,
}: {
  initialRules: AutomationRule[];
}) {
  const t = useT();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const handleToggle = (rule: AutomationRule | null, templateId: string, currentEnabled: boolean) => {
    setTogglingId(rule?.id ?? templateId);
    startTransition(async () => {
      if (rule) {
        await toggleAutomation(rule.id, !currentEnabled);
      } else {
        // No DB rule yet — initialize automations first, then toggle
        const { initializeAutomations } = await import("@/lib/actions/automation-actions");
        await initializeAutomations();
      }
      setTogglingId(null);
      router.refresh();
    });
  };

  // Group templates by category — use DB rules if available, otherwise show defaults
  const grouped = CATEGORY_ORDER.reduce<
    Record<string, { rule: AutomationRule | null; template: (typeof AUTOMATION_TEMPLATES)[number] }[]>
  >((acc, cat) => {
    acc[cat] = [];
    return acc;
  }, {});

  for (const template of AUTOMATION_TEMPLATES) {
    const cat = CATEGORY_MAP[template.id] ?? "tasks";
    const rule = initialRules.find((r) => r.templateId === template.id) ?? null;
    grouped[cat].push({ rule, template });
  }

  return (
    <div className="space-y-8">
      {/* Page header */}
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-[10px] bg-primary/10">
          <Zap className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h1 className="text-[22px] font-extrabold tracking-[-0.03em] text-foreground">
            {t.automations.title}
          </h1>
          <p className="text-sm text-muted-foreground">
            {t.automations.description}
          </p>
        </div>
      </div>

      {/* Category groups */}
      {CATEGORY_ORDER.map((cat) => {
        const items = grouped[cat];
        if (!items || items.length === 0) return null;
        const CatIcon = CATEGORY_ICONS[cat] ?? Zap;
        const catKey = cat as keyof typeof t.automations.categories;

        return (
          <div key={cat}>
            <div className="flex items-center gap-2 mb-3">
              <CatIcon className="h-4 w-4 text-muted-foreground" />
              <h2 className="text-[10.5px] font-bold text-foreground/50 uppercase tracking-[0.1em]">
                {t.automations.categories[catKey]}
              </h2>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {items.map(({ rule, template }, idx) => {
                const templateKey = template.id as keyof typeof t.automations.templates;
                const templateT = t.automations.templates[templateKey];
                const isEnabled = rule?.enabled ?? true;
                const ruleKey = rule?.id ?? template.id;

                return (
                  <motion.div
                    key={ruleKey}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className={`relative rounded-[14px] border p-4 transition-all duration-200 ${
                      isEnabled
                        ? "border-border/40 bg-card shadow-sm"
                        : "border-border/50 bg-muted/30 opacity-60"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <h3 className={`text-sm font-medium ${isEnabled ? "text-foreground" : "text-muted-foreground"}`}>
                          {templateT?.title ?? template.id}
                        </h3>
                        <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                          {templateT?.desc ?? template.message}
                        </p>
                      </div>

                      {/* Toggle switch — dir=ltr to fix RTL issues */}
                      <div dir="ltr" className="shrink-0">
                        <button
                          onClick={() => handleToggle(rule, template.id, isEnabled)}
                          disabled={isPending && togglingId === ruleKey}
                          className={`relative inline-flex h-7 w-12 cursor-pointer items-center rounded-full transition-colors duration-200 ${
                            isEnabled ? "bg-emerald-500" : "bg-muted-foreground/30"
                          } ${isPending && togglingId === ruleKey ? "opacity-50" : ""}`}
                          role="switch"
                          aria-checked={isEnabled}
                        >
                          <span
                            className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition-transform duration-200 ${
                              isEnabled ? "translate-x-6" : "translate-x-1"
                            }`}
                          />
                        </button>
                      </div>
                    </div>

                    <div className="mt-2">
                      <span
                        className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                          isEnabled
                            ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {isEnabled ? t.automations.enabled : t.automations.disabled}
                      </span>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
