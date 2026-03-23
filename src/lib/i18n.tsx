"use client";

import { createContext, useContext } from "react";
import { he } from "./he";
import { en } from "./en";

export type Locale = "he" | "en";
// Use a deep string type so both he and en satisfy it
type DeepString<T> = { [K in keyof T]: T[K] extends string ? string : DeepString<T[K]> };
export type Translations = DeepString<typeof he>;

const LocaleContext = createContext<Locale>("he");

export function LocaleProvider({ locale, children }: { locale: Locale; children: React.ReactNode }) {
  return <LocaleContext.Provider value={locale}>{children}</LocaleContext.Provider>;
}

/** Returns the translation object for the current locale */
export function useT(): Translations {
  const locale = useContext(LocaleContext);
  return locale === "en" ? en : he;
}

/** Returns the current locale string ("he" | "en") */
export function useLocale(): Locale {
  return useContext(LocaleContext);
}

/** Returns true if the current locale is RTL */
export function useIsRTL(): boolean {
  const locale = useContext(LocaleContext);
  return locale === "he";
}
