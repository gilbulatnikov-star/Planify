import type { Metadata } from "next";
import { Noto_Sans_Hebrew } from "next/font/google";
import NextTopLoader from "nextjs-toploader";
import { Providers } from "@/app/components/layout/providers";
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
    <html lang="he" dir="rtl" suppressHydrationWarning data-scroll-behavior="smooth">
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem("theme")||"light";document.documentElement.classList.add(t);document.documentElement.style.colorScheme=t}catch(e){}})()`,
          }}
        />
      </head>
      <body className={`${notoSansHebrew.variable} font-sans antialiased`}>
        <Providers>
          <NextTopLoader color="#2563eb" height={3} showSpinner={false} shadow="0 0 10px #2563eb,0 0 5px #2563eb" />
          {children}
        </Providers>
      </body>
    </html>
  );
}
