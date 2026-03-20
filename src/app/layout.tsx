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
  title: "Qlipy",
  description: "הכלי החכם לניהול ההפקות שלך — לקוחות, פרויקטים, תסריטים ולוחות תוכן במקום אחד.",
  icons: {
    icon: "/icon.svg",
    shortcut: "/icon.svg",
  },
  openGraph: {
    title: "Qlipy",
    description: "הכלי החכם לניהול ההפקות שלך — לקוחות, פרויקטים, תסריטים ולוחות תוכן במקום אחד.",
    siteName: "Qlipy",
  },
  twitter: {
    card: "summary",
    title: "Qlipy",
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
          <NextTopLoader color="#38b6ff" height={3} showSpinner={false} shadow="0 0 10px #38b6ff,0 0 5px #38b6ff" />
          <SessionProvider>
            <TooltipProvider>{children}</TooltipProvider>
          </SessionProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
