"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff, Loader2, AlertCircle } from "lucide-react";

export default function SignUpPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Register
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    });

    const data = await res.json();

    if (!res.ok) {
      setLoading(false);
      setError(data.error || "משהו השתבש. נסה שוב.");
      return;
    }

    // Auto sign-in after registration
    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    setLoading(false);

    if (result?.error) {
      setError("ההרשמה הצליחה אך הכניסה נכשלה. נסה להיכנס ידנית.");
    } else {
      router.push("/onboarding");
      router.refresh();
    }
  }

  return (
    <div className="w-full max-w-md">
      {/* Logo */}
      <div className="text-center mb-8">
        <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-[#0a0a0a] shadow-lg mb-4">
          <svg viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-10 w-10">
            <rect x="3" y="3" width="30" height="30" rx="9" fill="#0a0a0a"/>
            <rect x="9" y="8" width="18" height="12" rx="5" fill="white"/>
            <ellipse cx="24" cy="25" rx="5" ry="6.5" fill="#38b6ff" transform="rotate(-15 24 25)"/>
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-gray-900">צור חשבון ב-Qlipy</h1>
        <p className="text-sm text-gray-500 mt-1">מערכת הניהול לצלמים ומפיקים</p>
      </div>

      {/* Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8">
        <form onSubmit={handleSubmit} className="space-y-5" dir="rtl">
          {/* Error */}
          {error && (
            <div className="flex items-center gap-2.5 rounded-xl bg-red-50 border border-red-100 px-4 py-3 text-sm text-red-600">
              <AlertCircle className="h-4 w-4 shrink-0" />
              {error}
            </div>
          )}

          {/* Name */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-gray-700">שם מלא</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="גיל כהן"
              dir="rtl"
              className="w-full h-11 rounded-xl border border-gray-200 bg-gray-50 px-4 text-sm outline-none transition-all focus:border-gray-900 focus:bg-white focus:ring-2 focus:ring-gray-900/10 placeholder:text-gray-400"
            />
          </div>

          {/* Email */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-gray-700">אימייל</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              dir="ltr"
              className="w-full h-11 rounded-xl border border-gray-200 bg-gray-50 px-4 text-sm outline-none transition-all focus:border-gray-900 focus:bg-white focus:ring-2 focus:ring-gray-900/10 placeholder:text-gray-400"
            />
          </div>

          {/* Password */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-gray-700">סיסמה</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="לפחות 6 תווים"
                required
                dir="ltr"
                className="w-full h-11 rounded-xl border border-gray-200 bg-gray-50 px-4 pl-11 text-sm outline-none transition-all focus:border-gray-900 focus:bg-white focus:ring-2 focus:ring-gray-900/10 placeholder:text-gray-400"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full h-11 rounded-xl bg-gray-900 text-white text-sm font-semibold transition-all hover:bg-gray-800 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>יוצר חשבון...</span>
              </>
            ) : (
              "יצירת חשבון חינם"
            )}
          </button>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-100" />
            </div>
            <div className="relative flex justify-center text-xs text-gray-400">
              <span className="bg-white px-3">או המשך עם</span>
            </div>
          </div>

          {/* Social buttons */}
          <button
            type="button"
            onClick={() => signIn("google", { callbackUrl: "/" })}
            className="w-full h-11 rounded-xl border border-gray-200 bg-white text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Google
          </button>

          {/* Terms */}
          <p className="text-center text-xs text-gray-400">
            בהרשמה אתה מסכים לתנאי השימוש ומדיניות הפרטיות
          </p>
        </form>
      </div>

      {/* Sign in link */}
      <p className="text-center text-sm text-gray-500 mt-6" dir="rtl">
        כבר יש לך חשבון?{" "}
        <Link href="/sign-in" className="font-semibold text-gray-900 hover:underline">
          כניסה
        </Link>
      </p>
    </div>
  );
}
