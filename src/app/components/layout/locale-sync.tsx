"use client";

import { useEffect } from "react";
import { useLocale } from "@/lib/i18n";

/** Syncs the <html> element's dir and lang attributes with the current locale */
export function LocaleSync() {
  const locale = useLocale();

  useEffect(() => {
    document.documentElement.dir = locale === "he" ? "rtl" : "ltr";
    document.documentElement.lang = locale;
  }, [locale]);

  return null;
}
