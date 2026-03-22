"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { User, Mail, Shield, Eye, EyeOff, Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function ProfileSettingsPage() {
  const { data: session } = useSession();
  const user = session?.user;

  const [currentPassword, setCurrentPassword]   = useState("");
  const [newPassword, setNewPassword]           = useState("");
  const [confirmPassword, setConfirmPassword]   = useState("");
  const [showCurrent, setShowCurrent]           = useState(false);
  const [showNew, setShowNew]                   = useState(false);
  const [showConfirm, setShowConfirm]           = useState(false);
  const [loading, setLoading]                   = useState(false);
  const [error, setError]                       = useState("");
  const [success, setSuccess]                   = useState(false);

  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess(false);

    if (newPassword !== confirmPassword) {
      setError("הסיסמאות החדשות אינן תואמות");
      return;
    }
    if (newPassword.length < 6) {
      setError("הסיסמה החדשה חייבת להכיל לפחות 6 תווים");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/user/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "שגיאה בשינוי הסיסמה");
      } else {
        setSuccess(true);
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      }
    } catch {
      setError("שגיאת רשת, נסה שוב");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6" dir="rtl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">הגדרות חשבון</h1>
        <p className="mt-1 text-sm text-muted-foreground">פרטי המשתמש שלך</p>
      </div>

      {/* Profile card */}
      <div className="rounded-2xl border border-border bg-card shadow-sm px-6 py-6 space-y-5">
        {/* Avatar */}
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-foreground text-white text-xl font-bold">
            {user?.name
              ? user.name.split(" ").map((n: string) => n[0]).join("").slice(0, 2).toUpperCase()
              : user?.email?.[0]?.toUpperCase() ?? "U"}
          </div>
          <div>
            <p className="text-base font-semibold text-foreground">{user?.name ?? "—"}</p>
            <p className="text-sm text-muted-foreground">{user?.email}</p>
          </div>
        </div>

        <div className="h-px bg-muted" />

        {/* Info fields */}
        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <User className="h-4 w-4 text-muted-foreground mt-0.5" />
            <div>
              <p className="text-xs text-muted-foreground font-medium">שם מלא</p>
              <p className="text-sm text-foreground font-medium mt-0.5">{user?.name ?? "לא הוגדר"}</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Mail className="h-4 w-4 text-muted-foreground mt-0.5" />
            <div>
              <p className="text-xs text-muted-foreground font-medium">כתובת דוא&quot;ל</p>
              <p className="text-sm text-foreground font-medium mt-0.5">{user?.email ?? "—"}</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Shield className="h-4 w-4 text-muted-foreground mt-0.5" />
            <div>
              <p className="text-xs text-muted-foreground font-medium">אבטחה</p>
              <p className="text-sm text-muted-foreground mt-0.5">סיסמה מוצפנת · אימות בכניסה</p>
            </div>
          </div>
        </div>
      </div>

      {/* Change password card */}
      <div className="rounded-2xl border border-border bg-card shadow-sm px-6 py-6">
        <h2 className="text-base font-semibold text-foreground mb-1">שינוי סיסמה</h2>
        <p className="text-sm text-muted-foreground mb-5">בחר סיסמה חזקה של לפחות 6 תווים</p>

        <form onSubmit={handleChangePassword} className="space-y-4">
          {/* Current password */}
          <div className="space-y-1.5">
            <Label htmlFor="current">סיסמה נוכחית</Label>
            <div className="relative">
              <Input
                id="current"
                type={showCurrent ? "text" : "password"}
                value={currentPassword}
                onChange={e => setCurrentPassword(e.target.value)}
                required
                placeholder="הזן סיסמה נוכחית"
                className="pl-10"
              />
              <button type="button" onClick={() => setShowCurrent(v => !v)}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                {showCurrent ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {/* New password */}
          <div className="space-y-1.5">
            <Label htmlFor="new">סיסמה חדשה</Label>
            <div className="relative">
              <Input
                id="new"
                type={showNew ? "text" : "password"}
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                required
                placeholder="לפחות 6 תווים"
                className="pl-10"
              />
              <button type="button" onClick={() => setShowNew(v => !v)}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                {showNew ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {/* Confirm password */}
          <div className="space-y-1.5">
            <Label htmlFor="confirm">אימות סיסמה חדשה</Label>
            <div className="relative">
              <Input
                id="confirm"
                type={showConfirm ? "text" : "password"}
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                required
                placeholder="חזור על הסיסמה החדשה"
                className="pl-10"
              />
              <button type="button" onClick={() => setShowConfirm(v => !v)}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {/* Error / Success */}
          {error && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl px-4 py-2.5">{error}</p>
          )}
          {success && (
            <div className="flex items-center gap-2 text-sm text-emerald-700 bg-emerald-50 border border-emerald-100 rounded-xl px-4 py-2.5">
              <Check className="h-4 w-4 flex-shrink-0" />
              הסיסמה שונתה בהצלחה
            </div>
          )}

          <Button type="submit" disabled={loading} className="bg-foreground hover:bg-foreground/90 text-white w-full sm:w-auto">
            {loading ? <><Loader2 className="h-4 w-4 me-2 animate-spin" />שומר...</> : "שמור סיסמה"}
          </Button>
        </form>
      </div>
    </div>
  );
}
