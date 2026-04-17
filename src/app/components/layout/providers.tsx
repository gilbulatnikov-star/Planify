"use client";

import { createContext, useContext, useEffect, useState, useCallback, useMemo } from "react";
import { SessionProvider as NextAuthSessionProvider } from "next-auth/react";
import { TooltipProvider } from "@/components/ui/tooltip";

// ─── Minimal theme provider (no <script> injection — handled in layout <head>) ──

type Theme = "light" | "dark";

const ThemeContext = createContext<{
  theme: Theme;
  setTheme: (t: Theme) => void;
  resolvedTheme: Theme;
}>({
  theme: "light",
  setTheme: () => {},
  resolvedTheme: "light",
});

export const useTheme = () => useContext(ThemeContext);

function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(() => {
    if (typeof window === "undefined") return "light";
    return (localStorage.getItem("theme") as Theme) || "light";
  });

  const setTheme = useCallback((t: Theme) => {
    setThemeState(t);
    localStorage.setItem("theme", t);
    const root = document.documentElement;
    root.classList.remove("light", "dark");
    root.classList.add(t);
    root.style.colorScheme = t;
  }, []);

  // Sync on mount (SSR → client)
  useEffect(() => {
    const stored = (localStorage.getItem("theme") as Theme) || "light";
    setTheme(stored);
  }, [setTheme]);

  const value = useMemo(() => ({ theme, setTheme, resolvedTheme: theme }), [theme, setTheme]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

// ─── Combined Providers ─────────────────────────────────────────────────────

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <NextAuthSessionProvider refetchOnWindowFocus={false} refetchWhenOffline={false}>
        <TooltipProvider>{children}</TooltipProvider>
      </NextAuthSessionProvider>
    </ThemeProvider>
  );
}
