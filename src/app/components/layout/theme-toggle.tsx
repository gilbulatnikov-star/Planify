"use client";

import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "./providers";
import { useT } from "@/lib/i18n";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const he = useT();
  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return (
      <button
        className="flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground"
        aria-hidden
      >
        <Sun className="h-4 w-4" />
      </button>
    );
  }

  return (
    <button
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className="flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
      title={theme === "dark" ? he.theme.lightMode : he.theme.darkMode}
    >
      {theme === "dark"
        ? <Sun className="h-4 w-4" />
        : <Moon className="h-4 w-4" />
      }
    </button>
  );
}
