"use client";

import { ThemeProvider } from "next-themes";
import { SessionProvider as NextAuthSessionProvider } from "next-auth/react";
import { TooltipProvider } from "@/components/ui/tooltip";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="light" disableTransitionOnChange>
      <NextAuthSessionProvider refetchOnWindowFocus={false} refetchWhenOffline={false}>
        <TooltipProvider>{children}</TooltipProvider>
      </NextAuthSessionProvider>
    </ThemeProvider>
  );
}
