import type { Metadata } from "next";
import { Noto_Sans_Hebrew } from "next/font/google";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SessionProvider } from "@/app/components/layout/session-provider";
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
    <html lang="he" dir="rtl">
      <body className={`${notoSansHebrew.variable} font-sans antialiased`}>
        <SessionProvider>
          <TooltipProvider>{children}</TooltipProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
