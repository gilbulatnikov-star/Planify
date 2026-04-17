"use client";

import { useState, useRef } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Eye, EyeOff, Loader2, AlertCircle, Lock } from "lucide-react";
import { Turnstile, type TurnstileInstance } from "@marsidev/react-turnstile";
import { useT } from "@/lib/i18n";

export default function SignUpPage() {
  const router = useRouter();
  const he = useT();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const turnstileRef = useRef<TurnstileInstance | undefined>(undefined);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (!turnstileToken) {
      setLoading(false);
      setError("אנא המתן לאימות אבטחה");
      return;
    }

    // Register
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password, turnstileToken }),
    });

    const data = await res.json();

    if (!res.ok) {
      setLoading(false);
      setError(data.error || he.auth.signUpFailed);
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
      setError(he.auth.signUpSuccessSignInFailed);
      turnstileRef.current?.reset();
      setTurnstileToken(null);
    } else {
      router.push("/onboarding");
      router.refresh();
    }
  }

  return (
    <div className="w-full max-w-md">
      {/* Logo */}
      <div className="text-center mb-8">
        <div className="mb-4">
          <Image src="/qlipy-new-logo.png" alt="Qlipy" width={681} height={164} className="h-10 w-auto mx-auto dark:hidden" priority />
          <Image src="/qlipy-inverse-logo.png" alt="Qlipy" width={681} height={164} className="h-10 w-auto mx-auto hidden dark:block" priority />
        </div>
        <h1 className="text-[22px] font-extrabold tracking-[-0.03em] text-foreground">{he.auth.createAccount}</h1>
        <p className="text-sm text-muted-foreground mt-1">{he.auth.createAccountSubtitle}</p>
      </div>

      {/* Card */}
      <div className="bg-card rounded-[16px] shadow-[0_1px_2px_rgba(0,0,0,0.04),0_2px_6px_-1px_rgba(0,0,0,0.04),inset_0_1px_0_rgba(255,255,255,0.75)] border border-border/40 p-6 sm:p-8">
        <form onSubmit={handleSubmit} className="space-y-5" dir="rtl">
          {/* Error */}
          {error && (
            <div className="flex items-center gap-2.5 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-100 dark:border-red-900/30 px-4 py-3 text-sm text-red-600 dark:text-red-400">
              <AlertCircle className="h-4 w-4 shrink-0" />
              {error}
            </div>
          )}

          {/* Name */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground">{he.auth.fullName}</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Gil Cohen"
              dir="rtl"
              className="w-full h-11 rounded-[10px] border border-border bg-muted px-4 text-sm outline-none transition-all focus:border-foreground focus:bg-background focus:ring-2 focus:ring-ring placeholder:text-muted-foreground"
            />
          </div>

          {/* Email */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground">{he.auth.email}</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              dir="ltr"
              className="w-full h-11 rounded-[10px] border border-border bg-muted px-4 text-sm outline-none transition-all focus:border-foreground focus:bg-background focus:ring-2 focus:ring-ring placeholder:text-muted-foreground"
            />
          </div>

          {/* Password */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground">{he.auth.password}</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={he.auth.minChars}
                required
                dir="ltr"
                className="w-full h-11 rounded-[10px] border border-border bg-muted px-4 pl-11 text-sm outline-none transition-all focus:border-foreground focus:bg-background focus:ring-2 focus:ring-ring placeholder:text-muted-foreground"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-muted-foreground transition-colors"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {/* Terms checkbox */}
          <label className="flex items-start gap-2.5 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={agreedToTerms}
              onChange={(e) => setAgreedToTerms(e.target.checked)}
              className="mt-0.5 h-4 w-4 rounded accent-foreground"
            />
            <span className="text-xs text-muted-foreground leading-relaxed">
              {he.auth.agreeCheckbox ?? "אני מסכים/ה לתנאי השימוש ומדיניות הפרטיות"}{" "}
              <Link href="/terms" className="underline hover:text-foreground transition-colors">
                {he.auth.termsLink ?? "תנאי השימוש"}
              </Link>
              {" "}
              <Link href="/privacy" className="underline hover:text-foreground transition-colors">
                {he.auth.privacyLink ?? "מדיניות הפרטיות"}
              </Link>
            </span>
          </label>

          {/* Turnstile */}
          <div className="flex justify-center">
            <Turnstile
              ref={turnstileRef}
              siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY!}
              onSuccess={setTurnstileToken}
              onExpire={() => setTurnstileToken(null)}
              options={{ theme: "light", language: "he" }}
            />
          </div>

          {/* Submit */}
          <div className="space-y-2">
            <button
              type="submit"
              disabled={loading || !agreedToTerms || !turnstileToken}
              className="w-full h-11 rounded-[10px] bg-foreground text-background text-sm font-semibold transition-all hover:bg-foreground/90 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>{he.auth.creatingAccount}</span>
                </>
              ) : (
                he.auth.createAccountButton
              )}
            </button>
            {/* Trust microcopy near submit */}
            <div className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
              <Lock className="h-3 w-3" />
              <span>{he.auth.secureSignUp ?? "הרשמה מאובטחת — ללא כרטיס אשראי"}</span>
            </div>
            <p className="text-center text-[11px] text-muted-foreground/70">
              {he.auth.freeTrial ?? "ניסיון חינם ל-3 ימים"}
            </p>
          </div>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs text-muted-foreground">
              <span className="bg-card px-3">{he.auth.orContinueWith}</span>
            </div>
          </div>

          {/* Social buttons */}
          <button
            type="button"
            onClick={() => signIn("google", { callbackUrl: "/" })}
            className="w-full h-11 rounded-[10px] border border-border bg-card text-sm font-medium text-muted-foreground hover:bg-muted transition-colors flex items-center justify-center gap-2"
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
          <div className="flex items-center justify-center gap-2 text-[11px] text-muted-foreground/60">
            <Link href="/terms" className="hover:text-foreground transition-colors hover:underline">
              {he.auth.termsLink ?? "תנאי השימוש"}
            </Link>
            <span>·</span>
            <Link href="/privacy" className="hover:text-foreground transition-colors hover:underline">
              {he.auth.privacyLink ?? "מדיניות הפרטיות"}
            </Link>
          </div>
        </form>
      </div>

      {/* Sign in link */}
      <p className="text-center text-sm text-muted-foreground mt-6" dir="rtl">
        {he.auth.alreadyHaveAccount}{" "}
        <Link href="/sign-in" className="font-semibold text-foreground hover:underline">
          {he.auth.signIn}
        </Link>
      </p>
    </div>
  );
}
