import Link from "next/link";

const sections = [
  {
    title: "הקדמה",
    content:
      "ברוכים הבאים ל-Planify. תנאי שימוש אלה מסדירים את השימוש שלך באתר, באפליקציה ובשירותים שלנו. השימוש בשירות מהווה הסכמה לתנאים אלו. אם אינך מסכים לתנאים, אנא הימנע משימוש בשירות.",
  },
  {
    title: "רישום וחשבון",
    content:
      "על מנת להשתמש בשירות, עליך ליצור חשבון ולספק מידע מדויק ועדכני. אתה אחראי לשמירה על סודיות פרטי הכניסה שלך ולכל הפעילות המתבצעת תחת חשבונך. יש להודיע לנו מיד על כל שימוש לא מורשה בחשבונך.",
  },
  {
    title: "שימוש מותר",
    content:
      "השירות מיועד לשימוש עסקי חוקי בלבד. אינך רשאי להשתמש בשירות לכל מטרה בלתי חוקית או בלתי מורשית. אסור להעתיק, לשנות, להפיץ או ליצור יצירות נגזרות מהשירות ללא אישור מפורש בכתב.",
  },
  {
    title: "קניין רוחני",
    content:
      "כל הזכויות בשירות, לרבות סימני מסחר, זכויות יוצרים, פטנטים וסודות מסחריים, שייכות ל-Planify. המידע שאתה מעלה לשירות נשאר בבעלותך, אך אתה מעניק לנו רישיון מוגבל לשימוש בו לצורך הפעלת השירות.",
  },
  {
    title: "אחריות",
    content:
      "השירות ניתן \"כפי שהוא\" (AS IS) ללא אחריות מכל סוג. Planify אינה אחראית לכל נזק ישיר, עקיף, מקרי או תוצאתי הנובע מהשימוש בשירות. אנו עושים מאמצים סבירים לשמור על זמינות ואמינות השירות.",
  },
  {
    title: "ביטול",
    content:
      "אתה רשאי לבטל את חשבונך בכל עת מתוך הגדרות החשבון. עם ביטול החשבון, הגישה לשירות תופסק. מידע מסוים עשוי להישמר בהתאם לדרישות חוקיות. ביטול לא יזכה בהחזר עבור תקופות ששולמו מראש.",
  },
  {
    title: "שינויים",
    content:
      "אנו שומרים לעצמנו את הזכות לעדכן תנאים אלה מעת לעת. שינויים מהותיים יפורסמו באתר ו/או ישלחו בהודעה. המשך השימוש בשירות לאחר עדכון התנאים מהווה הסכמה לתנאים המעודכנים.",
  },
  {
    title: "יצירת קשר",
    content:
      "לשאלות בנוגע לתנאי שימוש אלה, ניתן לפנות אלינו בכתובת support@planify.app. נשתדל לחזור אליך תוך 3 ימי עסקים.",
  },
];

export default function TermsPage() {
  return (
    <div className="min-h-screen" dir="rtl">
      {/* Header */}
      <header className="border-b border-gray-200 dark:border-gray-800">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-4 sm:px-6">
          <Link href="/landing" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-[#2563eb] to-[#0077cc] text-sm font-bold text-white">
              P
            </div>
            <span className="text-lg font-bold text-gray-900 dark:text-white">Planify</span>
          </Link>
          <Link
            href="/landing"
            className="text-sm text-gray-500 transition-colors hover:text-[#2563eb]"
          >
            &rarr; חזרה לדף הבית
          </Link>
        </div>
      </header>

      {/* Content */}
      <main className="mx-auto max-w-4xl px-4 py-16 sm:px-6">
        <h1 className="mb-2 text-4xl font-bold text-gray-900 dark:text-white">תנאי שימוש</h1>
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
