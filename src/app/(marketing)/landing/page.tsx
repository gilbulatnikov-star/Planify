"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";

/* ------------------------------------------------------------------ */
/*  Animation helpers                                                  */
/* ------------------------------------------------------------------ */
const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" as const } },
};

const stagger = {
  visible: { transition: { staggerChildren: 0.12 } },
};

/* ------------------------------------------------------------------ */
/*  Data                                                               */
/* ------------------------------------------------------------------ */
const audiences = [
  { icon: "📸", title: "צלמים", desc: "ניהול אירועים, לקוחות, קבצים ומסירות" },
  { icon: "🎬", title: "יוצרי תוכן", desc: "ניהול שת״פים, בריפים, תוצרים ופלטפורמות" },
  { icon: "📱", title: "מנהלות סושיאל", desc: "לוח תוכן, deliverables, סטטוס פוסטים" },
  { icon: "🎯", title: "מפיקים ופרילנסרים", desc: "משימות, צוות, לוחות זמנים וספקים" },
];

const painPoints = [
  { before: "פניות נופלות בין הכיסאות", after: "מעקב אוטומטי שלא מפספס אף פנייה" },
  { before: "אין סדר בפרויקטים", after: "ניהול פרויקטים עם שלבים ומשימות" },
  { before: "לא יודע כמה הרווחתי", after: "מסך ראשי עם נתונים וגרפים בזמן אמת" },
  { before: "הכל מפוזר באקסלים", after: "הכל במקום אחד — לקוחות, לוח תוכן, תסריטים" },
];

const features = [
  { icon: "🔄", title: "מעקב פניות", desc: "מלוח מסודר שעוקב אחרי כל פנייה — מרגע הפנייה ועד סגירה" },
  { icon: "📋", title: "ניהול פרויקטים", desc: "קנבן, משימות, שלבים, דדליינים ומעקב התקדמות" },
  { icon: "📅", title: "לוח תוכן", desc: "תכנון תוכן חודשי, סטטוס פוסטים וייצוא לקלנדר" },
  { icon: "📝", title: "תסריטים", desc: "כתיבת תסריטים עם AI, שוט ליסט וקול שיט" },
  { icon: "💰", title: "כספים", desc: "חשבוניות, הצעות מחיר, הוצאות ומעקב הכנסות" },
  { icon: "🎨", title: "מוד בורד", desc: "לוח השראה ויזואלי עם תמונות, צבעים והערות" },
];

const steps = [
  { num: "1", title: "נרשמים בחינם", desc: "יוצרים חשבון ב-30 שניות" },
  { num: "2", title: "מגדירים את העסק", desc: "בוחרים סוג עסק ומתחילים להוסיף לידים" },
  { num: "3", title: "מנהלים הכל ממקום אחד", desc: "לידים, פרויקטים, לקוחות ותשלומים" },
];

const faqs = [
  { q: "האם המערכת מתאימה לי?", a: "Qlipy נבנתה במיוחד לצלמים, יוצרי תוכן, מנהלות סושיאל ומפיקים." },
  { q: "כמה עולה?", a: "יש תוכנית חינמית ל-3 ימים. Pro עולה ₪59/חודש או ₪590/שנה." },
  { q: "האם המידע שלי מאובטח?", a: "כל המידע מוצפן ומאוחסן בשרתים מאובטחים." },
  { q: "אפשר לבטל בכל רגע?", a: "כן, ללא התחייבות וללא קנסות." },
  { q: "האם יש תמיכה?", a: "כן, תמיכה מלאה במייל ובצ׳אט." },
  { q: "האם המערכת עובדת בטלפון?", a: "כן, Qlipy מותאמת לחלוטין למובייל." },
];

const freePlanFeatures = ["3 ימי ניסיון", "עד 1 פרויקט", "עד 3 לקוחות"];
const proPlanFeatures = [
  "∞ פרויקטים",
  "∞ לקוחות",
  "∞ תסריטים",
  "AI",
  "אנליטיקה",
];

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */
export default function LandingPage() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const navLinks = [
    { label: "פיצ׳רים", href: "#features" },
    { label: "למי מתאים", href: "#audience" },
    { label: "תמחור", href: "#pricing" },
    { label: "שאלות נפוצות", href: "#faq" },
  ];

  return (
    <div dir="rtl" className="relative overflow-x-hidden text-foreground dark:text-foreground">
      {/* ====== NAVBAR ====== */}
      <nav className="sticky top-0 z-50 w-full border-b border-border/30 bg-card/80 backdrop-blur-md dark:bg-background/80">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
          {/* Logo */}
          <Link href="/landing" className="flex items-center gap-2">
            <img src="/qlipy-new-logo.png" alt="Qlipy" className="h-7 w-auto" />
          </Link>

          {/* Desktop nav */}
          <div className="hidden items-center gap-6 md:flex">
            {navLinks.map((l) => (
              <a
                key={l.href}
                href={l.href}
                className="text-sm font-medium text-muted-foreground transition-colors hover:text-[#2563eb] dark:text-muted-foreground dark:hover:text-[#2563eb]"
              >
                {l.label}
              </a>
            ))}
          </div>

          {/* Desktop CTA */}
          <div className="hidden items-center gap-3 md:flex">
            <Link
              href="/sign-in"
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-[#2563eb] dark:text-muted-foreground"
            >
              כניסה
            </Link>
            <Link
              href="/sign-up"
              className="rounded-lg bg-gradient-to-r from-[#2563eb] to-[#0077cc] px-5 py-2 text-sm font-semibold text-white shadow-lg shadow-[#2563eb]/25 transition-transform hover:scale-105"
            >
              התחל בחינם
            </Link>
          </div>

          {/* Mobile hamburger */}
          <button
            className="flex flex-col gap-1.5 md:hidden"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            <span
              className={`h-0.5 w-6 bg-foreground transition-transform dark:bg-foreground ${mobileOpen ? "translate-y-2 rotate-45" : ""}`}
            />
            <span
              className={`h-0.5 w-6 bg-foreground transition-opacity dark:bg-foreground ${mobileOpen ? "opacity-0" : ""}`}
            />
            <span
              className={`h-0.5 w-6 bg-foreground transition-transform dark:bg-foreground ${mobileOpen ? "-translate-y-2 -rotate-45" : ""}`}
            />
          </button>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-t border-border bg-card px-4 py-4 dark:border-border dark:bg-background md:hidden"
          >
            <div className="flex flex-col gap-4">
              {navLinks.map((l) => (
                <a
                  key={l.href}
                  href={l.href}
                  onClick={() => setMobileOpen(false)}
                  className="text-sm font-medium text-foreground/80 dark:text-foreground"
                >
                  {l.label}
                </a>
              ))}
              <hr className="border-border dark:border-border" />
              <Link href="/sign-in" className="text-sm font-medium text-foreground/80 dark:text-foreground">
                כניסה
              </Link>
              <Link
                href="/sign-up"
                className="rounded-lg bg-gradient-to-r from-[#2563eb] to-[#0077cc] px-5 py-2 text-center text-sm font-semibold text-white"
              >
                התחל בחינם
              </Link>
            </div>
          </motion.div>
        )}
      </nav>

      {/* ====== HERO ====== */}
      <section className="relative flex min-h-[85vh] items-center justify-center overflow-hidden px-4 py-20 sm:px-6">
        {/* Animated blobs */}
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute -right-40 -top-40 h-[500px] w-[500px] animate-pulse rounded-full bg-[#2563eb]/20 blur-[120px]" />
          <div className="absolute -bottom-40 -left-40 h-[400px] w-[400px] animate-pulse rounded-full bg-[#0077cc]/15 blur-[120px] [animation-delay:2s]" />
          <div className="absolute left-1/2 top-1/3 h-[300px] w-[300px] animate-pulse rounded-full bg-[#2563eb]/10 blur-[100px] [animation-delay:4s]" />
        </div>

        <motion.div
          className="mx-auto max-w-4xl text-center"
          initial="hidden"
          animate="visible"
          variants={stagger}
        >
          <motion.h1
            variants={fadeUp}
            className="text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl md:text-6xl"
          >
            כל מה שעסק קריאייטיבי צריך.{" "}
            <span className="bg-gradient-to-r from-[#2563eb] to-[#0077cc] bg-clip-text text-transparent">
              במקום אחד.
            </span>
          </motion.h1>

          <motion.p
            variants={fadeUp}
            className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground dark:text-muted-foreground sm:text-xl"
          >
            ניהול לידים, פרויקטים, לקוחות, תוכן ותשלומים &mdash; בפלטפורמה אחת שנבנתה במיוחד לצלמים, יוצרי תוכן ומנהלות סושיאל.
          </motion.p>

          <motion.div variants={fadeUp} className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Link
              href="/sign-up"
              className="rounded-xl bg-gradient-to-r from-[#2563eb] to-[#0077cc] px-8 py-3.5 text-base font-bold text-white shadow-xl shadow-[#2563eb]/30 transition-transform hover:scale-105"
            >
              התחל בחינם &larr;
            </Link>
            <Link
              href="/demo"
              className="rounded-xl border border-border bg-card/60 px-8 py-3.5 text-base font-semibold text-foreground/80 backdrop-blur-sm transition-colors hover:border-[#2563eb] hover:text-[#2563eb] dark:border-border dark:bg-card/60 dark:text-foreground"
            >
              צפה בדמו
            </Link>
          </motion.div>
        </motion.div>
      </section>

      {/* ====== AUDIENCE ====== */}
      <section id="audience" className="px-4 py-20 sm:px-6">
        <motion.div
          className="mx-auto max-w-6xl"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={stagger}
        >
          <motion.h2 variants={fadeUp} className="mb-12 text-center text-3xl font-bold sm:text-4xl">
            למי המערכת מתאימה
          </motion.h2>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {audiences.map((a) => (
              <motion.div
                key={a.title}
                variants={fadeUp}
                className="group rounded-[14px] border border-border/20 bg-card/80 p-6 shadow-[0_1px_2px_rgba(0,0,0,0.04),0_2px_6px_-1px_rgba(0,0,0,0.04)] backdrop-blur-sm transition-shadow hover:shadow-lg dark:border-border dark:bg-card/80"
              >
                <span className="text-4xl">{a.icon}</span>
                <h3 className="mt-4 text-lg font-bold">{a.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground dark:text-muted-foreground">{a.desc}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* ====== PAIN POINTS ====== */}
      <section className="bg-muted px-4 py-20 dark:bg-background sm:px-6">
        <motion.div
          className="mx-auto max-w-5xl"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={stagger}
        >
          <motion.h2 variants={fadeUp} className="mb-12 text-center text-3xl font-bold sm:text-4xl">
            בעיות שאנחנו פותרים
          </motion.h2>

          <div className="grid gap-6 sm:grid-cols-2">
            {painPoints.map((p, i) => (
              <motion.div
                key={i}
                variants={fadeUp}
                className="rounded-[14px] border border-border/20 bg-card/80 p-6 backdrop-blur-sm shadow-[0_1px_2px_rgba(0,0,0,0.04),0_2px_6px_-1px_rgba(0,0,0,0.04)] dark:border-border dark:bg-card/80"
              >
                <div className="flex items-start gap-3">
                  <span className="mt-0.5 text-red-400">✘</span>
                  <p className="text-sm text-muted-foreground line-through dark:text-muted-foreground">{p.before}</p>
                </div>
                <div className="mt-3 flex items-start gap-3">
                  <span className="mt-0.5 text-emerald-500">✔</span>
                  <p className="text-sm font-medium">{p.after}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* ====== FEATURES ====== */}
      <section id="features" className="px-4 py-20 sm:px-6">
        <motion.div
          className="mx-auto max-w-6xl"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={stagger}
        >
          <motion.h2 variants={fadeUp} className="mb-4 text-center text-3xl font-bold sm:text-4xl">
            הכלים שתקבלו
          </motion.h2>
          <motion.p variants={fadeUp} className="mx-auto mb-12 max-w-xl text-center text-muted-foreground dark:text-muted-foreground">
            כל מה שצריך לנהל את העסק, במקום אחד.
          </motion.p>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((f) => (
              <motion.div
                key={f.title}
                variants={fadeUp}
                className="group rounded-[14px] border border-border/20 bg-card/80 p-6 backdrop-blur-sm shadow-[0_1px_2px_rgba(0,0,0,0.04),0_2px_6px_-1px_rgba(0,0,0,0.04)] transition-shadow hover:shadow-lg dark:border-border dark:bg-card/80"
              >
                <span className="text-3xl">{f.icon}</span>
                <h3 className="mt-4 text-lg font-bold">{f.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground dark:text-muted-foreground">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* ====== HOW IT WORKS ====== */}
      <section className="bg-muted px-4 py-20 dark:bg-background sm:px-6">
        <motion.div
          className="mx-auto max-w-4xl"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={stagger}
        >
          <motion.h2 variants={fadeUp} className="mb-12 text-center text-3xl font-bold sm:text-4xl">
            איך זה עובד
          </motion.h2>

          <div className="grid gap-8 sm:grid-cols-3">
            {steps.map((s) => (
              <motion.div key={s.num} variants={fadeUp} className="text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-[#2563eb] to-[#0077cc] text-xl font-bold text-white">
                  {s.num}
                </div>
                <h3 className="mt-4 text-lg font-bold">{s.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground dark:text-muted-foreground">{s.desc}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* ====== PRICING ====== */}
      <section id="pricing" className="px-4 py-20 sm:px-6">
        <motion.div
          className="mx-auto max-w-4xl"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={stagger}
        >
          <motion.h2 variants={fadeUp} className="mb-12 text-center text-3xl font-bold sm:text-4xl">
            תמחור
          </motion.h2>

          <div className="grid gap-8 sm:grid-cols-2">
            {/* Free */}
            <motion.div
              variants={fadeUp}
              className="flex flex-col rounded-[14px] border border-border/20 bg-card/80 p-8 backdrop-blur-sm shadow-[0_1px_2px_rgba(0,0,0,0.04),0_2px_6px_-1px_rgba(0,0,0,0.04)] dark:border-border dark:bg-card/80"
            >
              <h3 className="text-xl font-bold">חינמי</h3>
              <div className="mt-4 flex items-baseline gap-1">
                <span className="text-4xl font-extrabold">₪0</span>
              </div>
              <ul className="mt-6 flex flex-1 flex-col gap-3">
                {freePlanFeatures.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm text-muted-foreground dark:text-muted-foreground">
                    <span className="text-emerald-500">✓</span> {f}
                  </li>
                ))}
              </ul>
              <Link
                href="/sign-up"
                className="mt-8 block rounded-xl border border-border py-3 text-center text-sm font-semibold transition-colors hover:border-[#2563eb] hover:text-[#2563eb] dark:border-border"
              >
                התחל בחינם
              </Link>
            </motion.div>

            {/* Pro */}
            <motion.div
              variants={fadeUp}
              className="relative flex flex-col rounded-[14px] border-2 border-[#2563eb] bg-card/80 p-8 shadow-xl shadow-[#2563eb]/10 backdrop-blur-sm dark:bg-card/80"
            >
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-[#2563eb] to-[#0077cc] px-4 py-1 text-xs font-bold text-white">
                הכי פופולרי
              </span>
              <h3 className="text-xl font-bold">Pro</h3>
              <div className="mt-4 flex items-baseline gap-1">
                <span className="text-4xl font-extrabold">₪59</span>
                <span className="text-sm text-muted-foreground">/חודש</span>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">הכל ללא הגבלה</p>
              <ul className="mt-6 flex flex-1 flex-col gap-3">
                {proPlanFeatures.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm text-muted-foreground dark:text-muted-foreground">
                    <span className="text-[#2563eb]">✓</span> {f}
                  </li>
                ))}
              </ul>
              <Link
                href="/sign-up"
                className="mt-8 block rounded-xl bg-gradient-to-r from-[#2563eb] to-[#0077cc] py-3 text-center text-sm font-bold text-white shadow-lg shadow-[#2563eb]/25 transition-transform hover:scale-105"
              >
                שדרג ל-Pro
              </Link>
            </motion.div>
          </div>
        </motion.div>
      </section>

      {/* ====== FAQ ====== */}
      <section id="faq" className="bg-muted px-4 py-20 dark:bg-background sm:px-6">
        <motion.div
          className="mx-auto max-w-3xl"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={stagger}
        >
          <motion.h2 variants={fadeUp} className="mb-12 text-center text-3xl font-bold sm:text-4xl">
            שאלות נפוצות
          </motion.h2>

          <div className="flex flex-col gap-3">
            {faqs.map((faq, i) => (
              <motion.div
                key={i}
                variants={fadeUp}
                className="rounded-xl border border-border/20 bg-card/80 backdrop-blur-sm dark:border-border dark:bg-card/80"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="flex w-full items-center justify-between px-6 py-4 text-right"
                >
                  <span className="font-semibold">{faq.q}</span>
                  <span
                    className={`mr-auto text-xl text-muted-foreground transition-transform ${openFaq === i ? "rotate-45" : ""}`}
                  >
                    +
                  </span>
                </button>
                {openFaq === i && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="px-6 pb-4"
                  >
                    <p className="text-sm text-muted-foreground dark:text-muted-foreground">{faq.a}</p>
                  </motion.div>
                )}
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* ====== FINAL CTA ====== */}
      <section className="px-4 py-24 sm:px-6">
        <motion.div
          className="mx-auto max-w-3xl text-center"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={stagger}
        >
          <motion.h2 variants={fadeUp} className="text-3xl font-bold sm:text-4xl">
            מוכנים להתחיל?
          </motion.h2>
          <motion.p variants={fadeUp} className="mt-4 text-lg text-muted-foreground dark:text-muted-foreground">
            הצטרפו לאלפי קריאייטיבים שכבר מנהלים את העסק שלהם עם Qlipy.
          </motion.p>
          <motion.div variants={fadeUp} className="mt-8">
            <Link
              href="/sign-up"
              className="inline-block rounded-xl bg-gradient-to-r from-[#2563eb] to-[#0077cc] px-10 py-4 text-base font-bold text-white shadow-xl shadow-[#2563eb]/30 transition-transform hover:scale-105"
            >
              התחל בחינם &larr;
            </Link>
          </motion.div>
        </motion.div>
      </section>

      {/* ====== FOOTER ====== */}
      <footer className="border-t border-border bg-muted px-4 py-12 dark:border-border dark:bg-background sm:px-6">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-6 sm:flex-row sm:justify-between">
          {/* Logo + tagline */}
          <div className="flex flex-col items-center gap-2 sm:items-start">
            <div className="flex items-center gap-2">
              <img src="/qlipy-new-logo.png" alt="Qlipy" className="h-6 w-auto" />
            </div>
            <p className="text-xs text-muted-foreground">הכלי החכם לניהול העסק הקריאייטיבי שלך</p>
          </div>

          {/* Links */}
          <div className="flex gap-6 text-sm text-muted-foreground">
            <Link href="/terms" className="transition-colors hover:text-[#2563eb]">תנאי שימוש</Link>
            <Link href="/privacy" className="transition-colors hover:text-[#2563eb]">מדיניות פרטיות</Link>
            <Link href="/contact" className="transition-colors hover:text-[#2563eb]">יצירת קשר</Link>
          </div>

          {/* Social placeholder + copyright */}
          <div className="flex flex-col items-center gap-2 sm:items-end">
            <div className="flex gap-3">
              {/* Social icon placeholders */}
              {["M", "X", "I"].map((s) => (
                <span
                  key={s}
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-xs font-bold text-muted-foreground dark:bg-border dark:text-muted-foreground"
                >
                  {s}
                </span>
              ))}
            </div>
            <p className="text-xs text-muted-foreground">&copy; 2026 Qlipy</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

// force rebuild 1774597756
