export const AUTOMATION_TEMPLATES = [
  { id: "stale_lead_24h", trigger: "lead_no_response", delayHours: 24, delayDays: undefined, action: "notify", message: "ליד {name} ממתין למענה כבר 24 שעות" },
  { id: "stale_lead_72h", trigger: "lead_no_response", delayHours: 72, delayDays: undefined, action: "notify", message: "ליד {name} ממתין למענה כבר 3 ימים — סמן כקר?" },
  { id: "proposal_followup_3d", trigger: "proposal_no_response", delayHours: undefined, delayDays: 3, action: "notify", message: "הצעת מחיר ל-{name} נשלחה לפני 3 ימים ללא תגובה" },
  { id: "proposal_followup_7d", trigger: "proposal_no_response", delayHours: undefined, delayDays: 7, action: "notify", message: "הצעת מחיר ל-{name} פתוחה כבר שבוע — follow up?" },
  { id: "deadline_24h", trigger: "project_deadline", delayHours: 24, delayDays: undefined, action: "notify", message: "לפרויקט {title} נשאר פחות מ-24 שעות לדדליין" },
  { id: "overdue_invoice", trigger: "invoice_overdue", delayHours: undefined, delayDays: 1, action: "notify", message: "חשבונית #{number} — ₪{amount} באיחור תשלום" },
  { id: "task_reminder", trigger: "daily_tasks", delayHours: 0, delayDays: undefined, action: "notify", message: "יש לך {count} משימות להיום" },
];
