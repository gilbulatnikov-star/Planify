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

export function formatDateTime(date: Date | string | null | undefined, locale?: string): string {
  if (!date) return "—";
  const d = new Date(date);
  const loc = locale === "en" ? "en-US" : "he-IL";
  const datePart = new Intl.DateTimeFormat(loc, {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(d);
  const timePart = new Intl.DateTimeFormat(loc, {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(d);
  return `${datePart}, ${timePart}`;
}

export function timeAgo(date: Date | string | null | undefined, locale?: string): string {
  if (!date) return "—";
  const d = new Date(date);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);
  const isHe = locale !== "en";

  if (diffMin < 1) return isHe ? "עכשיו" : "just now";
  if (diffMin < 60) return isHe ? `לפני ${diffMin} דק׳` : `${diffMin}m ago`;
  if (diffHours < 24) return isHe ? `לפני ${diffHours} ${diffHours === 1 ? "שעה" : "שעות"}` : `${diffHours}h ago`;
  if (diffDays < 7) return isHe ? `לפני ${diffDays} ${diffDays === 1 ? "יום" : "ימים"}` : `${diffDays}d ago`;
  return formatDateTime(date, locale);
}

export function daysUntil(date: Date | string | null | undefined): number | null {
  if (!date) return null;
  const target = new Date(date);
  const now = new Date();
  return Math.ceil((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}
