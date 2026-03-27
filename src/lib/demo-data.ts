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

export const DEMO_CLIENTS = [
  { id: "cl1", name: "שירה כהן", email: "shira@example.com", phone: "052-1234567", isActive: true },
  { id: "cl2", name: "יונתן לוי", email: "yonatan@example.com", phone: "054-9876543", isActive: true },
  { id: "cl3", name: "נועה גולן", email: "noa@example.com", phone: "058-3334567", isActive: true },
  { id: "cl4", name: "דני שרון", email: "dani@example.com", phone: "053-7771234", isActive: false },
];

export const DEMO_SCRIPTS = [
  { id: "sc1", title: "ריל קולקציית אביב", platform: "Instagram", updatedAt: new Date(Date.now() - 2*86400000) },
  { id: "sc2", title: "סרטון תדמית - לוי", platform: "YouTube", updatedAt: new Date(Date.now() - 5*86400000) },
  { id: "sc3", title: "פרסומת TikTok", platform: "TikTok", updatedAt: new Date(Date.now() - 1*86400000) },
];

export const DEMO_TASKS = [
  { id: "t1", text: "לשלוח הצעת מחיר לשירה", completed: false },
  { id: "t2", text: "לערוך סרטון תדמית", completed: false },
  { id: "t3", text: "לתאם צילום עם יונתן", completed: true },
  { id: "t4", text: "להכין לוח תוכן לחודש הבא", completed: false },
  { id: "t5", text: "לשלוח חשבונית לנועה", completed: true },
];

export const DEMO_FINANCIALS = {
  monthlyRevenue: 24500,
  pendingInvoices: 3,
  totalExpenses: 8200,
  invoices: [
    { id: "inv1", number: "INV-001", client: "שירה כהן", total: 15000, status: "paid" as const },
    { id: "inv2", number: "INV-002", client: "יונתן לוי", total: 8000, status: "sent" as const },
    { id: "inv3", number: "INV-003", client: "נועה גולן", total: 4500, status: "overdue" as const },
  ],
};

export const DEMO_SMART_STATS = {
  newLeads: 3,
  pendingLeads: 2,
  activeProjects: 8,
  todayTasks: "3/12",
  monthRevenue: 24500,
  openInvoices: 3,
};

export const DEMO_URGENT = [
  { type: "lead", name: "מיכל אברהמי", detail: "הצעת מחיר ממתינה לפני יומיים" },
  { type: "deadline", name: "סרטון תדמית - לוי", detail: "דדליין מחר" },
  { type: "invoice", name: "חשבונית #INV-003", detail: "₪4,500 באיחור" },
];

export type DemoLead = (typeof DEMO_LEADS)[number];
export type DemoProject = (typeof DEMO_PROJECTS)[number];
export type DemoCalendarEvent = (typeof DEMO_CALENDAR)[number];
