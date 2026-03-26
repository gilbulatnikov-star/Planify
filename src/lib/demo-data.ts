export const DEMO_STATS = {
  activeProjects: 8,
  monthlyRevenue: 24500,
  openInvoices: 3,
  conversionRate: 68,
  upcomingShoots: 4,
  pendingDeadlines: 2,
};

export const DEMO_LEADS = [
  {
    id: "d1",
    name: "שירה כהן",
    phone: "052-1234567",
    leadStatus: "new" as const,
    leadSource: "instagram" as const,
    tags: ["צילום אירועים"],
    createdAt: new Date(Date.now() - 2 * 86400000),
    interactions: [
      {
        summary: "שלחה הודעה באינסטגרם",
        type: "note" as const,
        date: new Date(),
      },
    ],
  },
  {
    id: "d2",
    name: "יונתן לוי",
    phone: "054-9876543",
    leadStatus: "contacted" as const,
    leadSource: "referral" as const,
    tags: ["ניהול סושיאל"],
    createdAt: new Date(Date.now() - 5 * 86400000),
    interactions: [
      {
        summary: "שיחת טלפון ראשונית",
        type: "call" as const,
        date: new Date(Date.now() - 86400000),
      },
    ],
  },
  {
    id: "d3",
    name: "מיכל אברהמי",
    phone: "050-5551234",
    leadStatus: "proposal_sent" as const,
    leadSource: "facebook" as const,
    tags: ["סרטון תדמית"],
    createdAt: new Date(Date.now() - 10 * 86400000),
    interactions: [
      {
        summary: "נשלחה הצעת מחיר ₪8,000",
        type: "email" as const,
        date: new Date(Date.now() - 2 * 86400000),
      },
    ],
  },
  {
    id: "d4",
    name: "דני שרון",
    phone: "053-7771234",
    leadStatus: "qualified" as const,
    leadSource: "tiktok" as const,
    tags: ["ריל"],
    createdAt: new Date(Date.now() - 7 * 86400000),
    interactions: [],
  },
  {
    id: "d5",
    name: "נועה גולן",
    phone: "058-3334567",
    leadStatus: "won" as const,
    leadSource: "referral" as const,
    tags: ["צילום מוצר"],
    createdAt: new Date(Date.now() - 20 * 86400000),
    interactions: [
      {
        summary: "סגירת עסקה - ₪12,000",
        type: "meeting" as const,
        date: new Date(Date.now() - 3 * 86400000),
      },
    ],
  },
  {
    id: "d6",
    name: "אורי דוד",
    phone: "052-8889999",
    leadStatus: "lost" as const,
    leadSource: "organic" as const,
    tags: ["עריכת וידאו"],
    createdAt: new Date(Date.now() - 15 * 86400000),
    interactions: [
      {
        summary: "בחר מתחרה",
        type: "note" as const,
        date: new Date(Date.now() - 5 * 86400000),
      },
    ],
  },
];

export const DEMO_PROJECTS = [
  {
    id: "p1",
    title: "צילום חתונה - כהן",
    client: "שירה כהן",
    phase: "in_progress" as const,
    budget: 15000,
    shootDate: new Date(Date.now() + 7 * 86400000),
    tasks: { total: 8, completed: 3 },
  },
  {
    id: "p2",
    title: "סרטון תדמית - לוי",
    client: "יונתן לוי",
    phase: "planning" as const,
    budget: 8000,
    shootDate: new Date(Date.now() + 14 * 86400000),
    tasks: { total: 5, completed: 0 },
  },
  {
    id: "p3",
    title: "ניהול סושיאל - גולן",
    client: "נועה גולן",
    phase: "review" as const,
    budget: 4500,
    shootDate: null,
    tasks: { total: 12, completed: 10 },
  },
  {
    id: "p4",
    title: "ריל קולקציה - שרון",
    client: "דני שרון",
    phase: "done" as const,
    budget: 3000,
    shootDate: new Date(Date.now() - 3 * 86400000),
    tasks: { total: 6, completed: 6 },
  },
];

export const DEMO_CALENDAR = [
  {
    id: "c1",
    title: "צילום חתונה כהן",
    date: new Date(Date.now() + 7 * 86400000),
    status: "planned",
    color: "blue",
  },
  {
    id: "c2",
    title: "פרסום ריל #3",
    date: new Date(Date.now() + 2 * 86400000),
    status: "ready",
    color: "green",
  },
  {
    id: "c3",
    title: "עריכת סרטון תדמית",
    date: new Date(Date.now() + 5 * 86400000),
    status: "editing",
    color: "amber",
  },
  {
    id: "c4",
    title: "פגישת בריף - לוי",
    date: new Date(Date.now() + 1 * 86400000),
    status: "planned",
    color: "violet",
  },
];

export type DemoLead = (typeof DEMO_LEADS)[number];
export type DemoProject = (typeof DEMO_PROJECTS)[number];
export type DemoCalendarEvent = (typeof DEMO_CALENDAR)[number];
