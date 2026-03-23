import { auth } from "@/auth";
import { he as heTranslations } from "./he";
import { en as enTranslations } from "./en";
import type { Locale } from "./i18n";

export async function getLocale(): Promise<Locale> {
  const session = await auth();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return ((session?.user as any)?.locale as Locale) ?? "he";
}

export async function getT() {
  const locale = await getLocale();
  return locale === "en" ? enTranslations : heTranslations;
}
