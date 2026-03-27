"use client";

import Link from "next/link";
import { useState } from "react";

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);

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
        <h1 className="mb-4 text-4xl font-bold text-gray-900 dark:text-white">יצירת קשר</h1>
        <p className="mb-12 text-lg text-gray-600 dark:text-gray-400">
          נשמח לשמוע ממך! מלא את הטופס ונחזור אליך בהקדם.
        </p>

        <div className="grid gap-12 md:grid-cols-2">
          {/* Form */}
          <div>
            {submitted ? (
              <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-8 text-center dark:border-emerald-800 dark:bg-emerald-950">
                <div className="mb-3 text-4xl">&#10003;</div>
                <h3 className="mb-2 text-xl font-bold text-emerald-700 dark:text-emerald-300">
                  ההודעה נשלחה בהצלחה!
                </h3>
                <p className="text-sm text-emerald-600 dark:text-emerald-400">
                  נחזור אליך תוך 1-2 ימי עסקים.
                </p>
              </div>
            ) : (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  setSubmitted(true);
                }}
                className="space-y-5"
              >
                <div>
                  <label
                    htmlFor="name"
                    className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300"
                  >
                    שם מלא
                  </label>
                  <input
                    id="name"
                    type="text"
                    required
                    className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm transition-colors focus:border-[#2563eb] focus:outline-none focus:ring-1 focus:ring-[#2563eb] dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                    placeholder="השם שלך"
                  />
                </div>
                <div>
                  <label
                    htmlFor="email"
                    className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300"
                  >
                    דוא&quot;ל
                  </label>
                  <input
                    id="email"
                    type="email"
                    required
                    className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm transition-colors focus:border-[#2563eb] focus:outline-none focus:ring-1 focus:ring-[#2563eb] dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                    placeholder="your@email.com"
                    dir="ltr"
                  />
                </div>
                <div>
                  <label
                    htmlFor="subject"
                    className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300"
                  >
                    נושא
                  </label>
                  <input
                    id="subject"
                    type="text"
                    required
                    className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm transition-colors focus:border-[#2563eb] focus:outline-none focus:ring-1 focus:ring-[#2563eb] dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                    placeholder="במה נוכל לעזור?"
                  />
                </div>
                <div>
                  <label
                    htmlFor="message"
                    className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300"
                  >
                    הודעה
                  </label>
                  <textarea
                    id="message"
                    required
                    rows={5}
                    className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm transition-colors focus:border-[#2563eb] focus:outline-none focus:ring-1 focus:ring-[#2563eb] dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                    placeholder="ספר לנו..."
                  />
                </div>
                <button
                  type="submit"
                  className="w-full rounded-xl bg-gradient-to-r from-[#2563eb] to-[#0077cc] py-3 text-sm font-bold text-white shadow-lg shadow-[#2563eb]/25 transition-transform hover:scale-[1.02]"
                >
                  שלח הודעה
                </button>
              </form>
            )}
          </div>

          {/* Info */}
          <div className="space-y-8">
            <div>
              <h3 className="mb-3 text-lg font-semibold text-gray-900 dark:text-white">
                פרטי התקשרות
              </h3>
              <div className="space-y-3 text-sm text-gray-600 dark:text-gray-400">
                <p className="flex items-center gap-2">
                  <span className="text-base">&#9993;</span>
                  <a
                    href="mailto:support@planify.app"
                    className="transition-colors hover:text-[#2563eb]"
                    dir="ltr"
                  >
                    support@planify.app
                  </a>
                </p>
                <p className="flex items-center gap-2">
                  <span className="text-base">&#9200;</span>
                  זמני מענה: א&apos;-ה&apos; 09:00-18:00
                </p>
              </div>
            </div>

            <div>
              <h3 className="mb-3 text-lg font-semibold text-gray-900 dark:text-white">
                עקבו אחרינו
              </h3>
              <div className="flex gap-3">
                {[
                  { label: "Instagram", letter: "I" },
                  { label: "Facebook", letter: "F" },
                  { label: "X", letter: "X" },
                  { label: "LinkedIn", letter: "L" },
                ].map((social) => (
                  <a
                    key={social.letter}
                    href="#"
                    aria-label={social.label}
                    className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 text-sm font-bold text-gray-500 transition-colors hover:bg-[#2563eb] hover:text-white dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-[#2563eb]"
                  >
                    {social.letter}
                  </a>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-gray-200 bg-gray-50 p-6 dark:border-gray-800 dark:bg-gray-900">
              <h3 className="mb-2 text-sm font-semibold text-gray-900 dark:text-white">
                שאלות נפוצות?
              </h3>
              <p className="text-sm text-gray-500">
                בדקו את{" "}
                <Link href="/landing#faq" className="text-[#2563eb] hover:underline">
                  עמוד השאלות הנפוצות
                </Link>{" "}
                שלנו לתשובות מהירות.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
