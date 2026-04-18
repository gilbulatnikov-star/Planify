"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { motion, useInView, AnimatePresence } from "framer-motion";
import {
  Camera,
  Video,
  Smartphone,
  Clapperboard,
  Users,
  KanbanSquare,
  CalendarDays,
  FileText,
  Wallet,
  Palette,
  Shuffle,
  UserX,
  FolderOpen,
  MessageSquareWarning,
  Receipt,
  CalendarClock,
  ArrowLeft,
  Check,
  ChevronDown,
  Sparkles,
  Shield,
  Zap,
  Clock,
  Star,
  BarChart3,
  ListChecks,
  Play,
  Menu,
  X,
  ArrowUpRight,
  Infinity,
  Lock,
} from "lucide-react";

/* ------------------------------------------------------------------ */
/*  Animation variants                                                 */
/* ------------------------------------------------------------------ */
const easeOut = [0.25, 0.1, 0.25, 1] as const;

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" as const } },
};

const fadeIn = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.6 } },
};

const stagger = {
  visible: { transition: { staggerChildren: 0.08 } },
};

const floatCard = {
  hidden: { opacity: 0, y: 20, scale: 0.95 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { delay: 0.4 + i * 0.1, duration: 0.6, ease: "easeOut" as const },
  }),
};

const scaleIn = {
  hidden: { opacity: 0, scale: 0.92 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.7, ease: "easeOut" as const } },
};

/* ------------------------------------------------------------------ */
/*  Section wrapper with viewport animation                            */
/* ------------------------------------------------------------------ */
function Section({
  children,
  className = "",
  id,
}: {
  children: React.ReactNode;
  className?: string;
  id?: string;
}) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.15 });

  return (
    <motion.section
      ref={ref}
      id={id}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      variants={stagger}
      className={className}
    >
      {children}
    </motion.section>
  );
}

/* ------------------------------------------------------------------ */
/*  Data                                                               */
/* ------------------------------------------------------------------ */
const audiences = [
  {
    icon: Camera,
    title: "צלמים",
    desc: "ניהול אירועים, לקוחות, גלריות ומסירות מקצה לקצה",
  },
  {
    icon: Video,
    title: "יוצרי תוכן",
    desc: "תכנון תוכן, בריפים, תסריטים ולוחות זמנים",
  },
  {
    icon: Smartphone,
    title: "מנהלי סושיאל",
    desc: "לוח תוכן חודשי, סטטוס פרסומים ודיווח ללקוחות",
  },
  {
    icon: Clapperboard,
    title: "מפיקים ופרילנסרים",
    desc: "משימות, צוותים, שוט ליסט, קול שיט ולוגיסטיקה",
  },
];

const painPoints = [
  {
    icon: Shuffle,
    title: "הכלים מפוזרים",
    desc: "אקסלים, Google Docs, WhatsApp, תיקיות בדרייב ורשימות בפתקים",
  },
  {
    icon: UserX,
    title: "לידים נופלים",
    desc: "פניות נעלמות בין ההודעות ואין מעקב מסודר",
  },
  {
    icon: FolderOpen,
    title: "פרויקטים בלאגן",
    desc: "אין תמונה ברורה על מה בתהליך, מה מאחר ומה הושלם",
  },
  {
    icon: CalendarClock,
    title: "תוכן בלי מערכת",
    desc: "תכנון תוכן חודשי על מסמך שמתיישן ולא מתעדכן",
  },
  {
    icon: MessageSquareWarning,
    title: "תקשורת לקוחות",
    desc: "פידבקים, אישורים ותיקונים מתפזרים בין ערוצים",
  },
  {
    icon: Receipt,
    title: "כסף בלי שליטה",
    desc: "אין תמונה ברורה על הכנסות, הוצאות ותזרים כספי",
  },
];

const features = [
  {
    icon: Users,
    title: "מעקב לידים",
    desc: "צפה בכל הפניות בצנרת מסודרת. מרגע הפנייה ועד סגירה.",
    color: "from-blue-500/10 to-blue-600/5",
    iconColor: "text-blue-600",
  },
  {
    icon: KanbanSquare,
    title: "ניהול פרויקטים",
    desc: "שלבים, משימות, דדליינים ומעקב התקדמות בלוח אחד.",
    color: "from-violet-500/10 to-violet-600/5",
    iconColor: "text-violet-600",
  },
  {
    icon: CalendarDays,
    title: "לוח תוכן",
    desc: "תכנון חודשי, סטטוס פרסומים וייצוא ללקוח בלחיצה.",
    color: "from-emerald-500/10 to-emerald-600/5",
    iconColor: "text-emerald-600",
  },
  {
    icon: FileText,
    title: "תסריטים ושוט ליסט",
    desc: "כתיבת תסריטים עם AI, רשימת שוטים וקול שיט מקצועי.",
    color: "from-orange-500/10 to-orange-600/5",
    iconColor: "text-orange-600",
  },
  {
    icon: Wallet,
    title: "ניהול כספים",
    desc: "חשבוניות, הצעות מחיר, הוצאות ותזרים כספי בזמן אמת.",
    color: "from-rose-500/10 to-rose-600/5",
    iconColor: "text-rose-600",
  },
  {
    icon: Palette,
    title: "מוד בורד והשראה",
    desc: "לוח השראה ויזואלי לאיסוף רפרנסים, צבעים ורעיונות.",
    color: "from-pink-500/10 to-pink-600/5",
    iconColor: "text-pink-600",
  },
];

const showcaseTabs = [
  {
    id: "projects",
    label: "פרויקטים",
    icon: KanbanSquare,
    headline: "מעקב מלא על כל פרויקט",
    desc: "כל פרויקט מנוהל בשלבים ברורים \u2014 מרגע קבלת הבריף ועד המסירה הסופית.",
    mockItems: [
      { name: "קליפ לעסקים", status: "בצילומים", color: "bg-blue-500" },
      { name: "צילום מוצר - AURA", status: "עריכה", color: "bg-violet-500" },
      { name: "פרסומת דיגיטל", status: "ממתין לאישור", color: "bg-amber-500" },
      { name: "סטילס למותג", status: "הושלם", color: "bg-emerald-500" },
    ],
  },
  {
    id: "calendar",
    label: "לוח תוכן",
    icon: CalendarDays,
    headline: "תכנון חודשי שעובד",
    desc: "תכנן, נהל ופרסם תוכן ללקוחות מלוח שנתי אחד מאורגן.",
    mockItems: [
      { name: "פוסט - טיפ צילום", status: "פורסם", color: "bg-emerald-500" },
      { name: "ריל - מאחורי הקלעים", status: "בעריכה", color: "bg-blue-500" },
      { name: "סטורי - תודה ללקוח", status: "מתוכנן", color: "bg-slate-400" },
      { name: "YouTube - סקירת ציוד", status: "מוכן לפרסום", color: "bg-amber-500" },
    ],
  },
  {
    id: "clients",
    label: "לקוחות",
    icon: Users,
    headline: "כל הלקוחות במקום אחד",
    desc: "מידע מלא על כל לקוח, היסטוריית אינטראקציות ופרויקטים משויכים.",
    mockItems: [
      { name: "שירה כהן", status: "לקוח פעיל", color: "bg-emerald-500" },
      { name: "סטודיו לאופנה", status: "ליד חדש", color: "bg-blue-500" },
      { name: "FLAVOR", status: "הצעה נשלחה", color: "bg-amber-500" },
      { name: "נועם אביב", status: "לקוח פעיל", color: "bg-emerald-500" },
    ],
  },
  {
    id: "finances",
    label: "כספים",
    icon: Wallet,
    headline: "שליטה מלאה בכסף",
    desc: "הכנסות, הוצאות, חשבוניות והצעות מחיר \u2014 מסך אחד שנותן תמונה ברורה.",
    mockItems: [
      { name: "חשבונית #1024", status: "שולמה", color: "bg-emerald-500" },
      { name: "חשבונית #1025", status: "נשלחה", color: "bg-blue-500" },
      { name: "הצעת מחיר - מותג", status: "ממתינה", color: "bg-amber-500" },
      { name: "הוצאה - ציוד תאורה", status: "הוצאה", color: "bg-rose-500" },
    ],
  },
  {
    id: "scripts",
    label: "תסריטים",
    icon: FileText,
    headline: "כתיבה והפקה חכמה",
    desc: "תסריטים עם AI, שוט ליסט מקצועי וקול שיט ליום הצילום.",
    mockItems: [
      { name: "תסריט - פרסומת קיץ", status: "טיוטה", color: "bg-slate-400" },
      { name: "שוט ליסט - קליפ", status: "12 שוטים", color: "bg-violet-500" },
      { name: "קול שיט - צילום חצר", status: "מוכן", color: "bg-emerald-500" },
      { name: "תסריט - ריל מוצר", status: "כתיבה עם AI", color: "bg-blue-500" },
    ],
  },
];

const steps = [
  {
    num: "01",
    title: "נרשמים בחינם",
    desc: "יוצרים חשבון תוך 30 שניות, ללא כרטיס אשראי",
    icon: Zap,
  },
  {
    num: "02",
    title: "מגדירים את העסק",
    desc: "בוחרים סוג עסק, מוסיפים לקוחות ופרויקטים ראשונים",
    icon: ListChecks,
  },
  {
    num: "03",
    title: "מנהלים הכל ממקום אחד",
    desc: "לידים, פרויקטים, תוכן, כספים ומשימות \u2014 הכל זורם",
    icon: Sparkles,
  },
];

const credibilityPoints = [
  { icon: Clock, title: "חוסך שעות בשבוע", desc: "אוטומציות ומרכוז כלים חוסכים זמן יקר" },
  { icon: Shield, title: "מידע מוגן ומוצפן", desc: "אבטחה מתקדמת בכל שכבה במערכת" },
  { icon: Zap, title: "נבנה לקריאייטיבים", desc: "כל פיצ\u05F3ר תוכנן לזרימת עבודה יצירתית" },
  { icon: Star, title: "מרכז את העסק", desc: "במקום 6 כלים שונים \u2014 פלטפורמה אחת" },
];

const faqs = [
  { q: "למי Qlipy מתאים?", a: "Qlipy נבנתה לצלמים, יוצרי תוכן, מנהלי סושיאל, מפיקי אירועים ופרילנסרים בתחום הקריאייטיב. כל מי שמנהל פרויקטים, לקוחות ותוכן." },
  { q: "כמה עולה?", a: "יש ניסיון חינם של 3 ימים עם גישה מלאה. לאחר מכן, תוכנית Pro עולה 59 שקלים לחודש או 590 שקלים לשנה (חיסכון של חודשיים)." },
  { q: "האם המידע שלי מאובטח?", a: "בהחלט. כל המידע מוצפן ומאוחסן בשרתים מאובטחים. אנחנו משתמשים בפרוטוקולי אבטחה מתקדמים." },
  { q: "אפשר לבטל בכל רגע?", a: "כן. ללא התחייבות, ללא חוזים וללא קנסות. ביטול בלחיצת כפתור." },
  { q: "האם יש תמיכה?", a: "כן, תמיכה מלאה במייל ובצ\u05F3אט. אנחנו כאן לעזור." },
  { q: "המערכת עובדת בטלפון?", a: "כן, Qlipy מותאמת לחלוטין למובייל. ניתן לנהל את העסק מכל מקום." },
];

const proPlanFeatures = [
  "פרויקטים ללא הגבלה",
  "לקוחות ואנשי קשר ללא הגבלה",
  "חשבוניות והצעות מחיר",
  "לוח תוכן + תסריטים",
  "מוד בורד + לוח השראה",
  "כל פיצ\u05F3רי המערכת",
  "עדיפות בתמיכה",
];

const freePlanFeatures = [
  "3 ימי ניסיון מלאים",
  "עד 1 פרויקט",
  "עד 3 לקוחות",
  "גישה מלאה לכל הפיצ\u05F3רים",
];

/* ------------------------------------------------------------------ */
/*  Phone Mockup Component                                             */
/* ------------------------------------------------------------------ */
function PhoneMockup() {
  return (
    <div className="relative mx-auto w-[260px] sm:w-[280px] md:w-[300px]">
      {/* Phone frame */}
      <div className="relative rounded-[40px] border-[6px] border-[#1a1a1f] bg-[#1a1a1f] shadow-2xl shadow-black/20 dark:border-[#2a2a30] dark:shadow-black/40">
        {/* Notch */}
        <div className="absolute left-1/2 top-0 z-10 h-[22px] w-[100px] -translate-x-1/2 rounded-b-2xl bg-[#1a1a1f] dark:bg-[#2a2a30]" />

        {/* Screen */}
        <div className="relative overflow-hidden rounded-[34px] bg-gradient-to-b from-[#f8f7f5] to-[#eeecea] dark:from-[#0e0e12] dark:to-[#141418]">
          {/* Status bar */}
          <div className="flex items-center justify-between px-6 pb-1 pt-8">
            <span className="text-[9px] font-semibold text-foreground/60">9:41</span>
            <div className="flex items-center gap-1">
              <div className="h-[6px] w-[6px] rounded-full bg-foreground/40" />
              <div className="h-[6px] w-[18px] rounded-full bg-foreground/40" />
            </div>
          </div>

          {/* Mock dashboard header */}
          <div className="px-4 pb-2 pt-1">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[8px] text-muted-foreground">בוקר טוב</p>
                <p className="text-[11px] font-bold text-foreground">גיל כהן</p>
              </div>
              <div className="h-7 w-7 rounded-full bg-gradient-to-br from-blue-500 to-blue-600" />
            </div>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-2 gap-1.5 px-4 py-2">
            <div className="rounded-lg bg-white/70 p-2 dark:bg-white/5">
              <p className="text-[7px] text-muted-foreground">פרויקטים פעילים</p>
              <p className="text-[14px] font-bold text-foreground">7</p>
            </div>
            <div className="rounded-lg bg-white/70 p-2 dark:bg-white/5">
              <p className="text-[7px] text-muted-foreground">הכנסה החודש</p>
              <p className="text-[14px] font-bold text-foreground">12,400</p>
            </div>
          </div>

          {/* Mini tasks */}
          <div className="px-4 pb-1 pt-1.5">
            <p className="mb-1.5 text-[8px] font-semibold text-foreground">משימות היום</p>
            {[
              { text: "עריכת קליפ - AURA", done: true },
              { text: "שליחת הצעת מחיר", done: false },
              { text: "תכנון תוכן חודשי", done: false },
            ].map((t, i) => (
              <div key={i} className="mb-1 flex items-center gap-1.5 rounded-md bg-white/50 px-2 py-1 dark:bg-white/5">
                <div
                  className={`flex h-3 w-3 shrink-0 items-center justify-center rounded-[3px] ${
                    t.done
                      ? "bg-emerald-500"
                      : "border border-border"
                  }`}
                >
                  {t.done && <Check className="h-2 w-2 text-white" />}
                </div>
                <span className={`text-[7px] ${t.done ? "text-muted-foreground line-through" : "text-foreground"}`}>
                  {t.text}
                </span>
              </div>
            ))}
          </div>

          {/* Mini chart bar */}
          <div className="px-4 pb-4 pt-2">
            <p className="mb-1.5 text-[8px] font-semibold text-foreground">הכנסות</p>
            <div className="flex items-end gap-1">
              {[40, 65, 50, 80, 70, 95, 60].map((h, i) => (
                <div
                  key={i}
                  className="flex-1 rounded-t-sm bg-gradient-to-t from-blue-500 to-blue-400"
                  style={{ height: `${h * 0.35}px` }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Floating Cards around phone                                        */
/* ------------------------------------------------------------------ */
const floatingCards = [
  { label: "5 משימות", sublabel: "להיום", pos: "top-4 -right-16 sm:-right-24 md:-right-32", icon: ListChecks },
  { label: "3 פרויקטים", sublabel: "פעילים", pos: "top-1/3 -left-16 sm:-left-24 md:-left-36", icon: KanbanSquare },
  { label: "12 לקוחות", sublabel: "פעילים", pos: "bottom-1/3 -right-14 sm:-right-20 md:-right-32", icon: Users },
  { label: "לוח תוכן", sublabel: "מעודכן", pos: "bottom-12 -left-12 sm:-left-20 md:-left-28", icon: CalendarDays },
];

/* ------------------------------------------------------------------ */
/*  Main Component                                                     */
/* ------------------------------------------------------------------ */
export default function LandingPage() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState("projects");
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { label: "פיצ\u05F3רים", href: "#features" },
    { label: "למי מתאים", href: "#audience" },
    { label: "איך זה עובד", href: "#how" },
    { label: "תמחור", href: "#pricing" },
    { label: "שאלות", href: "#faq" },
  ];

  const activeShowcase = showcaseTabs.find((t) => t.id === activeTab)!;

  return (
    <div dir="rtl" className="relative overflow-x-hidden text-foreground">
      {/* ====== NAVBAR ====== */}
      <nav
        className={`sticky top-0 z-50 w-full transition-all duration-300 ${
          scrolled
            ? "border-b border-border/30 bg-background/70 backdrop-blur-xl shadow-[0_1px_3px_rgba(0,0,0,0.04)]"
            : "bg-transparent"
        }`}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-3.5 sm:px-8">
          <Link href="/landing" className="flex items-center gap-2">
            <img src="/qlipy-new-logo.png" alt="Qlipy" className="h-7 w-auto dark:hidden" />
            <img src="/qlipy-inverse-logo.png" alt="Qlipy" className="h-7 w-auto hidden dark:block" />
          </Link>

          {/* Desktop nav */}
          <div className="hidden items-center gap-7 lg:flex">
            {navLinks.map((l) => (
              <a
                key={l.href}
                href={l.href}
                className="text-[13px] font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                {l.label}
              </a>
            ))}
          </div>

          {/* Desktop CTA */}
          <div className="hidden items-center gap-3 lg:flex">
            <Link
              href="/sign-in"
              className="text-[13px] font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              כניסה
            </Link>
            <Link
              href="/sign-up"
              className="rounded-full bg-foreground px-5 py-2 text-[13px] font-semibold text-background transition-all hover:opacity-90 active:scale-[0.98]"
            >
              התחל בחינם
            </Link>
          </div>

          {/* Mobile hamburger */}
          <button
            className="flex h-10 w-10 items-center justify-center rounded-full hover:bg-muted transition-colors lg:hidden"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {/* Mobile menu */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="overflow-hidden border-t border-border/30 bg-background/95 backdrop-blur-xl lg:hidden"
            >
              <div className="flex flex-col gap-1 px-5 py-4">
                {navLinks.map((l) => (
                  <a
                    key={l.href}
                    href={l.href}
                    onClick={() => setMobileOpen(false)}
                    className="rounded-lg px-3 py-2.5 text-sm font-medium text-foreground/80 transition-colors hover:bg-muted"
                  >
                    {l.label}
                  </a>
                ))}
                <hr className="my-2 border-border/30" />
                <Link
                  href="/sign-in"
                  className="rounded-lg px-3 py-2.5 text-sm font-medium text-foreground/80"
                >
                  כניסה
                </Link>
                <Link
                  href="/sign-up"
                  className="mt-1 rounded-full bg-foreground px-5 py-2.5 text-center text-sm font-semibold text-background"
                >
                  התחל בחינם
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* ====== HERO ====== */}
      <section className="relative px-5 pb-16 pt-12 sm:px-8 sm:pb-24 sm:pt-20 lg:pb-32 lg:pt-24">
        {/* Background glow */}
        <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute right-1/4 top-0 h-[600px] w-[600px] rounded-full bg-[#2563eb]/[0.06] blur-[120px]" />
          <div className="absolute -left-20 top-1/4 h-[400px] w-[400px] rounded-full bg-[#2563eb]/[0.04] blur-[100px]" />
        </div>

        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col items-center gap-12 lg:flex-row lg:gap-16">
            {/* Text */}
            <motion.div
              className="flex-1 text-center lg:text-right"
              initial="hidden"
              animate="visible"
              variants={stagger}
            >
              <motion.div variants={fadeUp} className="mb-5">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-border/50 bg-card/80 px-3.5 py-1.5 text-[11px] font-medium text-muted-foreground backdrop-blur-sm">
                  <Sparkles className="h-3 w-3 text-[#2563eb]" />
                  מערכת ניהול לקריאייטיבים
                </span>
              </motion.div>

              <motion.h1
                variants={fadeUp}
                className="text-[32px] font-extrabold leading-[1.15] tracking-[-0.03em] sm:text-[42px] md:text-[50px] lg:text-[56px]"
              >
                העסק הקריאייטיבי שלך.
                <br />
                <span className="bg-gradient-to-l from-[#2563eb] to-[#0077cc] bg-clip-text text-transparent">
                  סוף סוף מאורגן.
                </span>
              </motion.h1>

              <motion.p
                variants={fadeUp}
                className="mx-auto mt-5 max-w-xl text-[15px] leading-relaxed text-muted-foreground sm:text-[17px] lg:mx-0"
              >
                לידים, פרויקטים, לקוחות, לוח תוכן, תסריטים וכספים &mdash; הכל בפלטפורמה אחת שנבנתה במיוחד בשביל יוצרי תוכן, צלמים ומנהלי סושיאל.
              </motion.p>

              <motion.div
                variants={fadeUp}
                className="mt-8 flex flex-col items-center gap-3 sm:flex-row lg:justify-start"
              >
                <Link
                  href="/sign-up"
                  className="group inline-flex items-center gap-2 rounded-full bg-foreground px-7 py-3 text-[14px] font-semibold text-background shadow-lg shadow-foreground/10 transition-all hover:shadow-xl hover:shadow-foreground/15 active:scale-[0.98]"
                >
                  התחל בחינם
                  <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
                </Link>
                <a
                  href="#features"
                  className="inline-flex items-center gap-2 rounded-full border border-border/60 px-7 py-3 text-[14px] font-medium text-muted-foreground transition-all hover:border-border hover:text-foreground"
                >
                  גלה עוד
                </a>
              </motion.div>

              {/* Trust strip */}
              <motion.div
                variants={fadeUp}
                className="mt-8 flex items-center justify-center gap-4 text-[11px] text-muted-foreground/70 lg:justify-start"
              >
                <span className="flex items-center gap-1">
                  <Check className="h-3 w-3 text-emerald-500" />
                  ללא כרטיס אשראי
                </span>
                <span className="flex items-center gap-1">
                  <Check className="h-3 w-3 text-emerald-500" />
                  3 ימי ניסיון חינם
                </span>
                <span className="flex items-center gap-1">
                  <Check className="h-3 w-3 text-emerald-500" />
                  ביטול בכל עת
                </span>
              </motion.div>
            </motion.div>

            {/* Phone Mockup */}
            <motion.div
              className="relative flex-shrink-0"
              initial="hidden"
              animate="visible"
              variants={scaleIn}
            >
              <PhoneMockup />

              {/* Floating cards */}
              {floatingCards.map((card, i) => (
                <motion.div
                  key={card.label}
                  custom={i}
                  variants={floatCard}
                  initial="hidden"
                  animate="visible"
                  className={`absolute ${card.pos} z-10 hidden sm:flex items-center gap-2 rounded-xl border border-border/40 bg-card/90 px-3 py-2 shadow-lg backdrop-blur-sm`}
                >
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#2563eb]/10">
                    <card.icon className="h-3.5 w-3.5 text-[#2563eb]" />
                  </div>
                  <div>
                    <p className="text-[10px] font-semibold text-foreground">{card.label}</p>
                    <p className="text-[8px] text-muted-foreground">{card.sublabel}</p>
                  </div>
                </motion.div>
              ))}

              {/* Glow behind phone */}
              <div className="pointer-events-none absolute inset-0 -z-10 m-auto h-[80%] w-[80%] rounded-full bg-[#2563eb]/[0.08] blur-[60px]" />
            </motion.div>
          </div>
        </div>
      </section>

      {/* ====== AUDIENCE ====== */}
      <Section id="audience" className="px-5 py-20 sm:px-8 sm:py-28">
        <div className="mx-auto max-w-6xl">
          <motion.div variants={fadeUp} className="mb-14 text-center">
            <span className="mb-3 inline-block text-[12px] font-semibold uppercase tracking-[0.15em] text-[#2563eb]">
              למי זה מתאים
            </span>
            <h2 className="text-[28px] font-extrabold tracking-[-0.03em] sm:text-[36px]">
              נבנתה לאנשים שיוצרים
            </h2>
            <p className="mx-auto mt-3 max-w-lg text-[15px] text-muted-foreground">
              Qlipy מתאימה לכל מי שמנהל עסק בתחום הקריאייטיב ורוצה סוף סוף סדר ושליטה.
            </p>
          </motion.div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {audiences.map((a) => (
              <motion.div
                key={a.title}
                variants={fadeUp}
                className="group rounded-2xl border border-border/30 bg-card/60 p-6 backdrop-blur-sm transition-all hover:border-border/60 hover:bg-card hover:shadow-lg hover:shadow-black/[0.03]"
              >
                <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-[#2563eb]/[0.08] transition-colors group-hover:bg-[#2563eb]/[0.12]">
                  <a.icon className="h-5 w-5 text-[#2563eb]" />
                </div>
                <h3 className="text-[16px] font-bold">{a.title}</h3>
                <p className="mt-1.5 text-[13px] leading-relaxed text-muted-foreground">{a.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </Section>

      {/* ====== PAIN POINTS ====== */}
      <Section className="relative px-5 py-20 sm:px-8 sm:py-28">
        <div className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-b from-transparent via-muted/50 to-transparent" />
        <div className="mx-auto max-w-6xl">
          <motion.div variants={fadeUp} className="mb-14 text-center">
            <span className="mb-3 inline-block text-[12px] font-semibold uppercase tracking-[0.15em] text-rose-500">
              הבעיה
            </span>
            <h2 className="text-[28px] font-extrabold tracking-[-0.03em] sm:text-[36px]">
              ניהול עסק קריאייטיבי לא צריך להיות כאוס
            </h2>
            <p className="mx-auto mt-3 max-w-lg text-[15px] text-muted-foreground">
              כלים שונים, מסמכים מפוזרים ותחושת חוסר שליטה? זה נגמר.
            </p>
          </motion.div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {painPoints.map((p) => (
              <motion.div
                key={p.title}
                variants={fadeUp}
                className="flex items-start gap-4 rounded-2xl border border-border/30 bg-card/60 p-5 backdrop-blur-sm"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-rose-500/[0.08]">
                  <p.icon className="h-4.5 w-4.5 text-rose-500" />
                </div>
                <div>
                  <h3 className="text-[14px] font-bold">{p.title}</h3>
                  <p className="mt-1 text-[13px] leading-relaxed text-muted-foreground">{p.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </Section>

      {/* ====== FEATURES ====== */}
      <Section id="features" className="px-5 py-20 sm:px-8 sm:py-28">
        <div className="mx-auto max-w-6xl">
          <motion.div variants={fadeUp} className="mb-14 text-center">
            <span className="mb-3 inline-block text-[12px] font-semibold uppercase tracking-[0.15em] text-[#2563eb]">
              הכלים
            </span>
            <h2 className="text-[28px] font-extrabold tracking-[-0.03em] sm:text-[36px]">
              כל מה שצריך לנהל את העסק
            </h2>
            <p className="mx-auto mt-3 max-w-lg text-[15px] text-muted-foreground">
              מלידים ועד מסירות, מתוכן ועד חשבוניות &mdash; הכל בפלטפורמה אחת.
            </p>
          </motion.div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((f) => (
              <motion.div
                key={f.title}
                variants={fadeUp}
                className="group rounded-2xl border border-border/30 bg-card/60 p-6 backdrop-blur-sm transition-all hover:border-border/60 hover:bg-card hover:shadow-lg hover:shadow-black/[0.03]"
              >
                <div className={`mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br ${f.color}`}>
                  <f.icon className={`h-5 w-5 ${f.iconColor}`} />
                </div>
                <h3 className="text-[16px] font-bold">{f.title}</h3>
                <p className="mt-1.5 text-[13px] leading-relaxed text-muted-foreground">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </Section>

      {/* ====== PRODUCT SHOWCASE ====== */}
      <Section className="relative px-5 py-20 sm:px-8 sm:py-28">
        <div className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-b from-transparent via-muted/40 to-transparent" />
        <div className="mx-auto max-w-6xl">
          <motion.div variants={fadeUp} className="mb-10 text-center">
            <span className="mb-3 inline-block text-[12px] font-semibold uppercase tracking-[0.15em] text-[#2563eb]">
              הפלטפורמה
            </span>
            <h2 className="text-[28px] font-extrabold tracking-[-0.03em] sm:text-[36px]">
              הצצה לתוך Qlipy
            </h2>
          </motion.div>

          {/* Tabs */}
          <motion.div
            variants={fadeUp}
            className="mx-auto mb-8 flex max-w-2xl flex-wrap items-center justify-center gap-1.5 rounded-2xl border border-border/30 bg-card/60 p-1.5 backdrop-blur-sm"
          >
            {showcaseTabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-[12px] font-medium transition-all ${
                  activeTab === tab.id
                    ? "bg-foreground text-background shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <tab.icon className="h-3.5 w-3.5" />
                {tab.label}
              </button>
            ))}
          </motion.div>

          {/* Showcase content */}
          <motion.div variants={fadeUp}>
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.3 }}
                className="rounded-2xl border border-border/30 bg-card/80 p-6 backdrop-blur-sm sm:p-8 lg:p-10"
              >
                <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:gap-12">
                  {/* Text */}
                  <div className="flex-1">
                    <h3 className="text-[22px] font-bold sm:text-[26px]">{activeShowcase.headline}</h3>
                    <p className="mt-2 text-[14px] leading-relaxed text-muted-foreground sm:text-[15px]">
                      {activeShowcase.desc}
                    </p>
                    <Link
                      href="/sign-up"
                      className="group mt-5 inline-flex items-center gap-1.5 text-[13px] font-semibold text-[#2563eb] transition-colors hover:text-[#1d4ed8]"
                    >
                      נסה בחינם
                      <ArrowLeft className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-0.5" />
                    </Link>
                  </div>

                  {/* Mock UI */}
                  <div className="flex-1">
                    <div className="space-y-2">
                      {activeShowcase.mockItems.map((item, i) => (
                        <motion.div
                          key={item.name}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.06 }}
                          className="flex items-center justify-between rounded-xl border border-border/20 bg-background/60 px-4 py-3"
                        >
                          <div className="flex items-center gap-3">
                            <div className={`h-2 w-2 rounded-full ${item.color}`} />
                            <span className="text-[13px] font-medium">{item.name}</span>
                          </div>
                          <span className="text-[11px] text-muted-foreground">{item.status}</span>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </motion.div>
        </div>
      </Section>

      {/* ====== HOW IT WORKS ====== */}
      <Section id="how" className="px-5 py-20 sm:px-8 sm:py-28">
        <div className="mx-auto max-w-5xl">
          <motion.div variants={fadeUp} className="mb-14 text-center">
            <span className="mb-3 inline-block text-[12px] font-semibold uppercase tracking-[0.15em] text-[#2563eb]">
              איך מתחילים
            </span>
            <h2 className="text-[28px] font-extrabold tracking-[-0.03em] sm:text-[36px]">
              שלושה צעדים &mdash; וזה רץ
            </h2>
          </motion.div>

          <div className="grid gap-8 sm:grid-cols-3">
            {steps.map((s) => (
              <motion.div key={s.num} variants={fadeUp} className="text-center">
                <div className="relative mx-auto mb-5 flex h-16 w-16 items-center justify-center">
                  <div className="absolute inset-0 rounded-2xl bg-[#2563eb]/[0.08]" />
                  <s.icon className="relative h-6 w-6 text-[#2563eb]" />
                  <span className="absolute -left-1.5 -top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-foreground text-[10px] font-bold text-background">
                    {s.num}
                  </span>
                </div>
                <h3 className="text-[16px] font-bold">{s.title}</h3>
                <p className="mt-2 text-[13px] leading-relaxed text-muted-foreground">{s.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </Section>

      {/* ====== CREDIBILITY ====== */}
      <Section className="relative px-5 py-20 sm:px-8 sm:py-28">
        <div className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-b from-transparent via-muted/40 to-transparent" />
        <div className="mx-auto max-w-6xl">
          <motion.div variants={fadeUp} className="mb-14 text-center">
            <h2 className="text-[28px] font-extrabold tracking-[-0.03em] sm:text-[36px]">
              למה דווקא Qlipy
            </h2>
            <p className="mx-auto mt-3 max-w-lg text-[15px] text-muted-foreground">
              לא עוד כלי גנרי. פלטפורמה שנבנתה מאפס עבור עסקים קריאייטיביים.
            </p>
          </motion.div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {credibilityPoints.map((cp) => (
              <motion.div
                key={cp.title}
                variants={fadeUp}
                className="rounded-2xl border border-border/30 bg-card/60 p-6 text-center backdrop-blur-sm"
              >
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#2563eb]/[0.08]">
                  <cp.icon className="h-5 w-5 text-[#2563eb]" />
                </div>
                <h3 className="text-[15px] font-bold">{cp.title}</h3>
                <p className="mt-1.5 text-[12px] leading-relaxed text-muted-foreground">{cp.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </Section>

      {/* ====== PRICING ====== */}
      <Section id="pricing" className="px-5 py-20 sm:px-8 sm:py-28">
        <div className="mx-auto max-w-4xl">
          <motion.div variants={fadeUp} className="mb-14 text-center">
            <span className="mb-3 inline-block text-[12px] font-semibold uppercase tracking-[0.15em] text-[#2563eb]">
              תמחור
            </span>
            <h2 className="text-[28px] font-extrabold tracking-[-0.03em] sm:text-[36px]">
              תמחור שקוף. ללא הפתעות.
            </h2>
            <p className="mx-auto mt-3 max-w-lg text-[15px] text-muted-foreground">
              התחל בחינם, שדרג כשתהיה מוכן. ביטול בכל עת.
            </p>
          </motion.div>

          <div className="grid gap-5 sm:grid-cols-2">
            {/* Free */}
            <motion.div
              variants={fadeUp}
              className="flex flex-col rounded-2xl border border-border/30 bg-card/60 p-7 backdrop-blur-sm"
            >
              <div className="mb-6">
                <h3 className="text-[14px] font-semibold text-muted-foreground">ניסיון חינם</h3>
                <div className="mt-2 flex items-baseline gap-1">
                  <span className="text-[40px] font-extrabold tracking-tight">0</span>
                  <span className="text-[14px] text-muted-foreground">₪</span>
                </div>
                <p className="mt-1 text-[12px] text-muted-foreground">ל-3 ימים מלאים</p>
              </div>

              <ul className="flex flex-1 flex-col gap-3">
                {freePlanFeatures.map((f) => (
                  <li key={f} className="flex items-center gap-2.5 text-[13px] text-muted-foreground">
                    <Check className="h-3.5 w-3.5 shrink-0 text-emerald-500" />
                    {f}
                  </li>
                ))}
              </ul>

              <Link
                href="/sign-up"
                className="mt-7 block rounded-full border border-border/60 py-3 text-center text-[13px] font-semibold transition-all hover:border-foreground hover:bg-foreground hover:text-background"
              >
                התחל ניסיון
              </Link>
            </motion.div>

            {/* Pro */}
            <motion.div
              variants={fadeUp}
              className="relative flex flex-col rounded-2xl border-2 border-[#2563eb]/60 bg-card p-7 shadow-xl shadow-[#2563eb]/[0.06]"
            >
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <span className="rounded-full bg-[#2563eb] px-4 py-1 text-[10px] font-bold text-white">
                  הכי פופולרי
                </span>
              </div>

              <div className="mb-6">
                <h3 className="text-[14px] font-semibold text-[#2563eb]">Pro</h3>
                <div className="mt-2 flex items-baseline gap-1">
                  <span className="text-[40px] font-extrabold tracking-tight">59</span>
                  <span className="text-[14px] text-muted-foreground">₪ / חודש</span>
                </div>
                <p className="mt-1 text-[12px] text-muted-foreground">
                  או 590₪ לשנה (חיסכון של חודשיים)
                </p>
              </div>

              <ul className="flex flex-1 flex-col gap-3">
                {proPlanFeatures.map((f) => (
                  <li key={f} className="flex items-center gap-2.5 text-[13px]">
                    <Check className="h-3.5 w-3.5 shrink-0 text-[#2563eb]" />
                    {f}
                  </li>
                ))}
              </ul>

              <Link
                href="/sign-up"
                className="mt-7 block rounded-full bg-[#2563eb] py-3 text-center text-[13px] font-bold text-white shadow-lg shadow-[#2563eb]/20 transition-all hover:bg-[#1d4ed8] active:scale-[0.98]"
              >
                שדרג ל-Pro
              </Link>
            </motion.div>
          </div>

          {/* Trust badges */}
          <motion.div
            variants={fadeUp}
            className="mt-8 flex flex-wrap items-center justify-center gap-6 text-[11px] text-muted-foreground/70"
          >
            <span className="flex items-center gap-1.5">
              <Lock className="h-3 w-3" />
              תשלום מאובטח SSL
            </span>
            <span className="flex items-center gap-1.5">
              <Shield className="h-3 w-3" />
              ביטול בכל עת
            </span>
            <span className="flex items-center gap-1.5">
              <Zap className="h-3 w-3" />
              שדרוג מיידי
            </span>
          </motion.div>
        </div>
      </Section>

      {/* ====== FAQ ====== */}
      <Section id="faq" className="relative px-5 py-20 sm:px-8 sm:py-28">
        <div className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-b from-transparent via-muted/40 to-transparent" />
        <div className="mx-auto max-w-2xl">
          <motion.div variants={fadeUp} className="mb-12 text-center">
            <span className="mb-3 inline-block text-[12px] font-semibold uppercase tracking-[0.15em] text-[#2563eb]">
              שאלות נפוצות
            </span>
            <h2 className="text-[28px] font-extrabold tracking-[-0.03em] sm:text-[36px]">
              יש שאלות? יש תשובות.
            </h2>
          </motion.div>

          <div className="flex flex-col gap-2">
            {faqs.map((faq, i) => (
              <motion.div
                key={i}
                variants={fadeUp}
                className="overflow-hidden rounded-xl border border-border/30 bg-card/60 backdrop-blur-sm transition-colors hover:bg-card/80"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="flex w-full items-center justify-between px-5 py-4 text-right"
                >
                  <span className="text-[14px] font-semibold">{faq.q}</span>
                  <ChevronDown
                    className={`mr-auto h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200 ${
                      openFaq === i ? "rotate-180" : ""
                    }`}
                  />
                </button>
                <AnimatePresence initial={false}>
                  {openFaq === i && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25 }}
                    >
                      <p className="px-5 pb-4 text-[13px] leading-relaxed text-muted-foreground">{faq.a}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        </div>
      </Section>

      {/* ====== FINAL CTA ====== */}
      <section className="relative px-5 py-24 sm:px-8 sm:py-32">
        <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute left-1/2 top-1/2 h-[500px] w-[800px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#2563eb]/[0.05] blur-[120px]" />
        </div>
        <motion.div
          className="mx-auto max-w-2xl text-center"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={stagger}
        >
          <motion.h2
            variants={fadeUp}
            className="text-[28px] font-extrabold tracking-[-0.03em] sm:text-[40px]"
          >
            מוכנים לסדר את העסק?
          </motion.h2>
          <motion.p
            variants={fadeUp}
            className="mt-4 text-[15px] leading-relaxed text-muted-foreground sm:text-[17px]"
          >
            הצטרפו לקריאייטיבים שכבר מנהלים את הכל ממקום אחד &mdash; בצורה מקצועית, חכמה ומסודרת.
          </motion.p>
          <motion.div variants={fadeUp} className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <Link
              href="/sign-up"
              className="group inline-flex items-center gap-2 rounded-full bg-foreground px-8 py-3.5 text-[15px] font-bold text-background shadow-lg shadow-foreground/10 transition-all hover:shadow-xl active:scale-[0.98]"
            >
              התחל בחינם
              <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
            </Link>
          </motion.div>
          <motion.p variants={fadeUp} className="mt-4 text-[12px] text-muted-foreground/60">
            ללא כרטיס אשראי. 3 ימי ניסיון חינם.
          </motion.p>
        </motion.div>
      </section>

      {/* ====== FOOTER ====== */}
      <footer className="border-t border-border/30 px-5 py-10 sm:px-8">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-6 sm:flex-row sm:justify-between">
          <div className="flex flex-col items-center gap-2 sm:items-start">
            <img src="/qlipy-new-logo.png" alt="Qlipy" className="h-5 w-auto dark:hidden" />
            <img src="/qlipy-inverse-logo.png" alt="Qlipy" className="h-5 w-auto hidden dark:block" />
            <p className="text-[11px] text-muted-foreground/60">
              מערכת הניהול לעסקים קריאייטיביים
            </p>
          </div>

          <div className="flex gap-6 text-[12px] text-muted-foreground/70">
            <Link href="/terms" className="transition-colors hover:text-foreground">תנאי שימוש</Link>
            <Link href="/privacy" className="transition-colors hover:text-foreground">פרטיות</Link>
            <Link href="/contact" className="transition-colors hover:text-foreground">יצירת קשר</Link>
          </div>

          <p className="text-[11px] text-muted-foreground/50">&copy; 2026 Qlipy. כל הזכויות שמורות.</p>
        </div>
      </footer>
    </div>
  );
}
