import type { Metadata } from "next";
import { Noto_Sans_Hebrew } from "next/font/google";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SessionProvider } from "@/app/components/layout/session-provider";
import NextTopLoader from "nextjs-toploader";
import { ThemeProvider } from "next-themes";
import "./globals.css";

const notoSansHebrew = Noto_Sans_Hebrew({
  variable: "--font-noto-sans-hebrew",
  subsets: ["hebrew", "latin"],
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Planify",
  description: "הכלי החכם לניהול ההפקות שלך — לקוחות, פרויקטים, תסריטים ולוחות תוכן במקום אחד.",
  icons: {
    icon: "/icon.svg",
    shortcut: "/icon.svg",
  },
  openGraph: {
    title: "Planify",
    description: "הכלי החכם לניהול ההפקות שלך — לקוחות, פרויקטים, תסריטים ולוחות תוכן במקום אחד.",
    siteName: "Planify",
  },
  twitter: {
    card: "summary",
    title: "Planify",
    description: "הכלי החכם לניהול ההפקות שלך — לקוחות, פרויקטים, תסריטים ולוחות תוכן במקום אחד.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="he" dir="rtl" suppressHydrationWarning>
      <body className={`${notoSansHebrew.variable} font-sans antialiased`}>
        <ThemeProvider attribute="class" defaultTheme="light" disableTransitionOnChange>
          <NextTopLoader color="#2563eb" height={3} showSpinner={false} shadow="0 0 10px #2563eb,0 0 5px #2563eb" />
          <SessionProvider>
            <TooltipProvider>{children}</TooltipProvider>
          </SessionProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
