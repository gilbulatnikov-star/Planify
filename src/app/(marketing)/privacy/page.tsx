import Link from "next/link";

const sections = [
  {
    title: "מידע שאנו אוספים",
    content:
      "אנו אוספים מידע שאתה מספק לנו ישירות בעת הרשמה ושימוש בשירות, כגון שם, כתובת דוא\"ל, מספר טלפון ופרטי עסק. בנוסף, אנו אוספים מידע טכני באופן אוטומטי, כולל כתובת IP, סוג דפדפן, מערכת הפעלה ודפוסי שימוש בשירות.",
  },
  {
    title: "שימוש במידע",
    content:
      "אנו משתמשים במידע שנאסף לצורך הפעלת השירות, שיפורו והתאמתו לצרכיך. המידע משמש גם ליצירת קשר עמך, שליחת עדכונים, ולמטרות אנליטיות פנימיות. לא נמכור את המידע האישי שלך לצדדים שלישיים.",
  },
  {
    title: "אבטחת מידע",
    content:
      "אנו נוקטים באמצעי אבטחה סבירים להגנה על המידע שלך, כולל הצפנת SSL, אחסון מאובטח ובקרת גישה. עם זאת, אף שיטת העברה או אחסון אלקטרוני אינה בטוחה ב-100%, ואיננו יכולים להבטיח אבטחה מוחלטת.",
  },
  {
    title: "שיתוף מידע",
    content:
      "אנו עשויים לשתף מידע עם ספקי שירות חיצוניים הפועלים מטעמנו (כגון אחסון ענן ועיבוד תשלומים). שיתוף כזה נעשה רק במידה הנדרשת ובכפוף להתחייבות לשמירה על סודיות. ייתכן שנחשוף מידע בהתאם לצו בית משפט או דרישה חוקית.",
  },
  {
    title: "עוגיות (Cookies)",
    content:
      "האתר משתמש בעוגיות לצורך תפעול תקין, אימות משתמשים וניתוח שימוש. ניתן לנהל את העדפות העוגיות דרך הגדרות הדפדפן. ביטול עוגיות עשוי לפגוע בחוויית השימוש בשירות.",
  },
  {
    title: "זכויות המשתמש",
    content:
      "יש לך זכות לגשת למידע האישי שלך, לתקנו או למחקו. ניתן לבקש עותק של המידע שאנו מחזיקים עליך או לבקש את מחיקתו באמצעות פנייה לכתובת support@planify.app. נטפל בבקשתך תוך 30 ימים.",
  },
  {
    title: "יצירת קשר",
    content:
      "לשאלות או בקשות הנוגעות למדיניות פרטיות זו, ניתן לפנות אלינו בכתובת support@planify.app או באמצעות טופס יצירת הקשר באתר.",
  },
];

export default function PrivacyPage() {
  return (
    <div className="min-h-screen" dir="rtl">
      {/* Header */}
      <header className="border-b border-gray-200 dark:border-gray-800">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-4 sm:px-6">
          <Link href="/landing" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-[#38b6ff] to-[#0077cc] text-sm font-bold text-white">
              P
            </div>
            <span className="text-lg font-bold text-gray-900 dark:text-white">Planify</span>
          </Link>
          <Link
            href="/landing"
            className="text-sm text-gray-500 transition-colors hover:text-[#38b6ff]"
          >
            &rarr; חזרה לדף הבית
          </Link>
        </div>
      </header>

      {/* Content */}
      <main className="mx-auto max-w-4xl px-4 py-16 sm:px-6">
        <h1 className="mb-2 text-4xl font-bold text-gray-900 dark:text-white">מדיניות פרטיות</h1>
        <p className="mb-12 text-sm text-gray-500">עדכון אחרון: מרץ 2026</p>

        <div className="space-y-10">
          {sections.map((section, i) => (
            <section key={i}>
              <h2 className="mb-3 text-xl font-semibold text-gray-900 dark:text-white">
                {i + 1}. {section.title}
              </h2>
              <p className="leading-relaxed text-gray-600 dark:text-gray-400">{section.content}</p>
            </section>
          ))}
        </div>
      </main>
    </div>
  );
}
