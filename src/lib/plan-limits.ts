// ─── Plan Limits — Single source of truth ────────────────────────────────────
// Import this anywhere to get the limits/features for each subscription plan.

export type PlanKey = "FREE" | "MONTHLY" | "ANNUAL";

export interface PlanLimits {
  projects: number;        // -1 = unlimited
  contacts: number;
  documents: number;
  scripts: number;
  clients: number;
  invoices: number;        // total invoices
  expenses: number;        // total expenses
  moodboards: number;      // total moodboard canvases
  moodboardNodes: number;  // items per moodboard canvas
  inspirationRefs: number; // items in inspiration board
  todos: number;           // daily tasks
}

export interface PlanMeta {
  key: PlanKey;
  label: string;
  price: string;
  priceSuffix: string;
  pricePerMonth?: string;
  description: string;
  badge?: string;
  trialDays?: number;        // free trial days (FREE plan only)
  limits: PlanLimits;
  features: string[];
}

export const PLAN_LIMITS: Record<PlanKey, PlanLimits> = {
  FREE: {
    projects:        1,   // first project free
    contacts:        2,
    documents:       5,
    scripts:         1,
    clients:         3,
    invoices:        3,   // total invoices
    expenses:        5,   // total expenses
    moodboards:      1,   // total moodboard canvases
    moodboardNodes:  3,   // items per moodboard canvas
    inspirationRefs: 2,   // items in inspiration board
    todos:           3,   // daily tasks
  },
  MONTHLY: {
    projects:        -1,  // unlimited
    contacts:        -1,
    documents:       -1,
    scripts:         -1,
    clients:         -1,
    invoices:        -1,
    expenses:        -1,
    moodboards:      -1,
    moodboardNodes:  -1,
    inspirationRefs: -1,
    todos:           -1,
  },
  ANNUAL: {
    projects:        -1,
    contacts:        -1,
    documents:       -1,
    scripts:         -1,
    clients:         -1,
    invoices:        -1,
    expenses:        -1,
    moodboards:      -1,
    moodboardNodes:  -1,
    inspirationRefs: -1,
    todos:           -1,
  },
};

/** How many free trial days the FREE plan includes */
export const FREE_TRIAL_DAYS = 3;

export const PLANS: PlanMeta[] = [
  {
    key: "FREE",
    label: "חינמי",
    price: "₪0",
    priceSuffix: "/ 3 ימים",
    description: "ניסיון חינם ל-3 ימים. פרויקט אחד ראשון ללא עלות.",
    trialDays: FREE_TRIAL_DAYS,
    limits: PLAN_LIMITS.FREE,
    features: [
      "פרויקט ראשון חינם",
      "גישה מלאה ל-3 ימים",
      "ללא צורך בכרטיס אשראי",
    ],
  },
  {
    key: "MONTHLY",
    label: "Pro Monthly",
    price: "₪59",
    priceSuffix: "/ לחודש",
    description: "חיוב חודשי, ללא התחייבות. ביטול מתי שתרצה.",
    limits: PLAN_LIMITS.MONTHLY,
    features: [
      "כל פיצ'רי המערכת",
      "חשבוניות והצעות מחיר",
      "לוח תוכן + תסריטים",
      "לוח השראה",
    ],
  },
  {
    key: "ANNUAL",
    label: "Pro Annual",
    price: "₪590",
    priceSuffix: "/ לשנה",
    pricePerMonth: "≈ ₪49 לחודש — חיסכון של ₪118 בשנה",
    description: "חיוב שנתי, תשלום מראש המעניק חודשיים חינם.",
    badge: "הכי משתלם ✦",
    limits: PLAN_LIMITS.ANNUAL,
    features: [
      "כל פיצ'רי המערכת",
      "חשבוניות והצעות מחיר",
      "לוח תוכן + תסריטים",
      "לוח השראה",
      "עדיפות בתמיכה",
      "חודשיים חינם לעומת מנוי חודשי",
    ],
  },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Human-readable label for a limit value (-1 → "ללא הגבלה") */
export function formatLimit(n: number): string {
  return n === -1 ? "ללא הגבלה" : String(n);
}

/** Get the limits for the user's current plan */
export function getLimitsForPlan(plan: string): PlanLimits {
  const key = plan as PlanKey;
  return PLAN_LIMITS[key] ?? PLAN_LIMITS.FREE;
}
