export function formatCurrency(amount: number, locale?: string): string {
  const loc = locale === "en" ? "en-IL" : "he-IL";
  return new Intl.NumberFormat(loc, {
    style: "currency",
    currency: "ILS",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(date: Date | string | null | undefined, locale?: string): string {
  if (!date) return "—";
  const loc = locale === "en" ? "en-US" : "he-IL";
  return new Intl.DateTimeFormat(loc, {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(date));
}

export function formatDateShort(date: Date | string | null | undefined, locale?: string): string {
  if (!date) return "—";
  const loc = locale === "en" ? "en-US" : "he-IL";
  return new Intl.DateTimeFormat(loc, {
    day: "numeric",
    month: "short",
  }).format(new Date(date));
}

export function daysUntil(date: Date | string | null | undefined): number | null {
  if (!date) return null;
  const target = new Date(date);
  const now = new Date();
  return Math.ceil((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}
