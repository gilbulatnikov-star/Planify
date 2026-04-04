"use client";

import { useState, useTransition } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { User, Mail, Shield, Eye, EyeOff, Check, Loader2, Globe, MessageSquarePlus, Star, Send, Pencil, X, Camera, Trash2 } from "lucide-react";
import { updateLocale, updateName, updateAvatar } from "@/lib/actions/user-actions";
import { submitFeedback } from "@/lib/actions/feedback-actions";
import { useLocale, useT } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRef } from "react";

export default function ProfileSettingsPage() {
  const { data: session, update: updateSession } = useSession();
  const user = session?.user;
  const router = useRouter();
  const currentLocale = useLocale();
  const he = useT();
  const [isPendingLocale, startLocaleTransition] = useTransition();

  // Prefer URL-based image; fall back to avatar endpoint for base64 avatars stored in DB
  const avatarSrc = user?.image ?? ((user as { hasAvatar?: boolean } | undefined)?.hasAvatar ? "/api/user/avatar" : null);
  const hasAvatar = !!(user?.image ?? (user as { hasAvatar?: boolean } | undefined)?.hasAvatar);

  const [editingName, setEditingName] = useState(false);
  const [nameValue, setNameValue] = useState(user?.name ?? "");
  const [nameSaving, setNameSaving] = useState(false);
  const [nameError, setNameError] = useState("");

  // ── Avatar state ──
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [avatarSaving, setAvatarSaving] = useState(false);
  const [avatarError, setAvatarError] = useState("");

  async function handleAvatarFile(file: File) {
    if (!file.type.startsWith("image/")) { setAvatarError("יש לבחור קובץ תמונה"); return; }
    setAvatarError("");
    setAvatarSaving(true);
    try {
      // Resize to 200×200 via canvas
      const dataUrl = await new Promise<string>((resolve, reject) => {
        const img = new window.Image();
        const reader = new FileReader();
        reader.onload = (ev) => { img.src = ev.target?.result as string; };
        img.onload = () => {
          const SIZE = 200;
          const canvas = document.createElement("canvas");
          canvas.width = SIZE; canvas.height = SIZE;
          const ctx = canvas.getContext("2d")!;
          // Crop to square from center
          const s = Math.min(img.width, img.height);
          const sx = (img.width - s) / 2;
          const sy = (img.height - s) / 2;
          ctx.drawImage(img, sx, sy, s, s, 0, 0, SIZE, SIZE);
          resolve(canvas.toDataURL("image/jpeg", 0.85));
        };
        img.onerror = reject;
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
      const res = await updateAvatar(dataUrl);
      if (res.success) {
        await updateSession({ image: dataUrl });
      } else {
        setAvatarError(res.error ?? "שגיאה בשמירה");
      }
    } catch {
      setAvatarError("שגיאה בעיבוד התמונה");
    } finally {
      setAvatarSaving(false);
    }
  }

  async function handleRemoveAvatar() {
    setAvatarSaving(true);
    const res = await updateAvatar("");
    if (res.success) await updateSession({ image: null });
    setAvatarSaving(false);
  }

  async function handleSaveName() {
    setNameError("");
    setNameSaving(true);
    const res = await updateName(nameValue);
    setNameSaving(false);
    if (res.success) {
      await updateSession({ name: nameValue });
      setEditingName(false);
    } else {
      setNameError(res.error ?? "שגיאה בשמירה");
    }
  }

  function handleLocaleChange(newLocale: "he" | "en") {
    startLocaleTransition(async () => {
      await updateLocale(newLocale);
      await updateSession({ locale: newLocale });
      router.refresh();
    });
  }

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
      setError(he.profile.passwordsDoNotMatch);
      return;
    }
    if (newPassword.length < 6) {
      setError(he.profile.passwordTooShort);
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
        setError(data.error ?? he.profile.passwordChangeError);
      } else {
        setSuccess(true);
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      }
    } catch {
      setError(he.profile.networkError);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6" dir="rtl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">{he.profile.accountSettings}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{he.profile.userDetails}</p>
      </div>

      {/* Profile card */}
      <div className="rounded-2xl border border-border bg-card shadow-sm px-6 py-6 space-y-5">
        {/* Avatar */}
        <div className="flex items-center gap-4">
          {/* Clickable avatar with overlay */}
          <div className="relative group shrink-0">
            <div
              className="h-16 w-16 rounded-full overflow-hidden cursor-pointer ring-2 ring-transparent group-hover:ring-foreground/20 transition-all"
              onClick={() => !avatarSaving && fileInputRef.current?.click()}
            >
              {avatarSrc ? (
                <img src={avatarSrc} alt={user?.name ?? ""} className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-foreground text-background text-xl font-bold select-none">
                  {user?.name
                    ? user.name.split(" ").map((n: string) => n[0]).join("").slice(0, 2).toUpperCase()
                    : user?.email?.[0]?.toUpperCase() ?? "U"}
                </div>
              )}
              {/* Hover overlay */}
              <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
                {avatarSaving
                  ? <Loader2 className="h-5 w-5 text-white animate-spin" />
                  : <Camera className="h-5 w-5 text-white" />}
              </div>
            </div>
            {/* Remove button (shown only when there's a custom image) */}
            {hasAvatar && !avatarSaving && (
              <button
                onClick={handleRemoveAvatar}
                title="הסר תמונה"
                className="absolute -bottom-1 -left-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-white shadow hover:bg-red-600 transition-colors"
              >
                <X className="h-3 w-3" />
              </button>
            )}
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => { const f = e.target.files?.[0]; if (f) handleAvatarFile(f); e.target.value = ""; }}
          />
          <div>
            <p className="text-base font-semibold text-foreground">{user?.name ?? "—"}</p>
            <p className="text-sm text-muted-foreground">{user?.email}</p>
            <button
              onClick={() => !avatarSaving && fileInputRef.current?.click()}
              className="mt-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors underline underline-offset-2"
            >
              {hasAvatar ? "החלף תמונה" : "הוסף תמונת פרופיל"}
            </button>
            {avatarError && <p className="text-xs text-red-500 mt-1">{avatarError}</p>}
          </div>
        </div>

        <div className="h-px bg-muted" />

        {/* Info fields */}
        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <User className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-xs text-muted-foreground font-medium mb-1">{he.profile.fullName}</p>
              {editingName ? (
                <div className="space-y-2">
                  <input
                    value={nameValue}
                    onChange={(e) => setNameValue(e.target.value)}
                    autoFocus
                    className="w-full h-9 rounded-lg border border-border bg-muted px-3 text-sm outline-none focus:border-foreground focus:bg-background transition-all"
                  />
                  {nameError && <p className="text-xs text-red-500">{nameError}</p>}
                  <div className="flex gap-2">
                    <button onClick={handleSaveName} disabled={nameSaving || !nameValue.trim()}
                      className="flex items-center gap-1.5 rounded-lg bg-foreground text-background px-3 py-1.5 text-xs font-medium disabled:opacity-50">
                      {nameSaving ? <Loader2 className="h-3 w-3 animate-spin" /> : <Check className="h-3 w-3" />}
                      שמור
                    </button>
                    <button onClick={() => { setEditingName(false); setNameValue(user?.name ?? ""); setNameError(""); }}
                      className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground">
                      <X className="h-3 w-3" />
                      ביטול
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <p className="text-sm text-foreground font-medium">{user?.name ?? he.profile.notSet}</p>
                  <button onClick={() => { setNameValue(user?.name ?? ""); setEditingName(true); }}
                    className="flex items-center gap-1 rounded-md px-1.5 py-0.5 text-xs text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
                    <Pencil className="h-3 w-3" />
                    עריכה
                  </button>
                </div>
              )}
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Mail className="h-4 w-4 text-muted-foreground mt-0.5" />
            <div>
              <p className="text-xs text-muted-foreground font-medium">{he.profile.emailAddress}</p>
              <p className="text-sm text-foreground font-medium mt-0.5">{user?.email ?? "—"}</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Shield className="h-4 w-4 text-muted-foreground mt-0.5" />
            <div>
              <p className="text-xs text-muted-foreground font-medium">{he.profile.security}</p>
              <p className="text-sm text-muted-foreground mt-0.5">{he.profile.securityDesc}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Language selector */}
      <div className="rounded-2xl border border-border bg-card shadow-sm px-6 py-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Globe className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-sm font-semibold text-foreground">{he.profile.languageLabel}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{currentLocale === "he" ? "עברית" : "English"}</p>
            </div>
          </div>
          <div className="flex gap-1.5">
            <button
              onClick={() => handleLocaleChange("he")}
              disabled={isPendingLocale}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                currentLocale === "he" ? "bg-foreground text-background" : "bg-muted text-muted-foreground hover:text-foreground"
              }`}
            >
              עברית
            </button>
            <button
              onClick={() => handleLocaleChange("en")}
              disabled={isPendingLocale}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                currentLocale === "en" ? "bg-foreground text-background" : "bg-muted text-muted-foreground hover:text-foreground"
              }`}
            >
              English
            </button>
          </div>
        </div>
      </div>

      {/* Change password card */}
      <div className="rounded-2xl border border-border bg-card shadow-sm px-6 py-6">
        <h2 className="text-base font-semibold text-foreground mb-1">{he.profile.changePassword}</h2>
        <p className="text-sm text-muted-foreground mb-5">{he.profile.changePasswordDesc}</p>

        <form onSubmit={handleChangePassword} className="space-y-4">
          {/* Current password */}
          <div className="space-y-1.5">
            <Label htmlFor="current">{he.profile.currentPassword}</Label>
            <div className="relative">
              <Input
                id="current"
                type={showCurrent ? "text" : "password"}
                value={currentPassword}
                onChange={e => setCurrentPassword(e.target.value)}
                required
                placeholder={he.profile.currentPasswordPlaceholder}
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
            <Label htmlFor="new">{he.profile.newPassword}</Label>
            <div className="relative">
              <Input
                id="new"
                type={showNew ? "text" : "password"}
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                required
                placeholder={he.auth.minChars}
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
            <Label htmlFor="confirm">{he.profile.confirmNewPassword}</Label>
            <div className="relative">
              <Input
                id="confirm"
                type={showConfirm ? "text" : "password"}
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                required
                placeholder={he.profile.confirmNewPasswordPlaceholder}
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
              {he.profile.passwordChanged}
            </div>
          )}

          <Button type="submit" disabled={loading} className="bg-foreground hover:bg-foreground/90 text-background w-full sm:w-auto">
            {loading ? <><Loader2 className="h-4 w-4 me-2 animate-spin" />{he.common.saving}</> : he.profile.savePassword}
          </Button>
        </form>
      </div>

      {/* ── Feedback ── */}
      <FeedbackSection />
    </div>
  );
}

function FeedbackSection() {
  const he = useT();
  const [message, setMessage] = useState("");
  const [rating, setRating] = useState<number | null>(null);
  const [hoveredStar, setHoveredStar] = useState<number | null>(null);
  const [done, setDone] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleSubmit() {
    if (!message.trim()) return;
    startTransition(async () => {
      await submitFeedback(message, rating ?? undefined);
      setDone(true);
      setMessage("");
      setRating(null);
    });
  }

  return (
    <div className="glass-card rounded-2xl p-6">
      <div className="flex items-center gap-3 mb-5">
        <MessageSquarePlus className="h-5 w-5 text-muted-foreground" />
        <h2 className="text-lg font-bold text-foreground">{he.common.sendFeedback}</h2>
      </div>

      {done ? (
        <div className="text-center py-6">
          <p className="text-2xl mb-2">🙏</p>
          <p className="font-medium text-foreground">{he.common.thankYouFeedback}</p>
          <p className="text-sm text-muted-foreground mt-1">{he.common.helpsUsImprove}</p>
          <button onClick={() => setDone(false)} className="text-sm text-muted-foreground hover:text-foreground mt-3 underline transition-colors">
            {he.common.sendAnother ?? "Send another"}
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <div>
            <p className="text-sm text-muted-foreground mb-2">{he.common.ratingOptional}</p>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button key={star} type="button"
                  onMouseEnter={() => setHoveredStar(star)}
                  onMouseLeave={() => setHoveredStar(null)}
                  onClick={() => setRating(rating === star ? null : star)}
                  className="transition-transform hover:scale-110">
                  <Star className={`h-6 w-6 transition-colors ${star <= (hoveredStar ?? rating ?? 0) ? "fill-amber-400 text-amber-400" : "text-muted-foreground/40"}`} />
                </button>
              ))}
            </div>
          </div>
          <div>
            <p className="text-sm text-muted-foreground mb-2">{he.common.feedbackQuestion}</p>
            <textarea value={message} onChange={(e) => setMessage(e.target.value)}
              placeholder={he.common.writeHere} rows={4}
              className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring placeholder:text-muted-foreground" />
          </div>
          <Button onClick={handleSubmit} disabled={isPending || !message.trim()}
            className="bg-foreground hover:bg-foreground/90 text-background w-full sm:w-auto gap-2">
            <Send className="h-4 w-4" />
            {isPending ? he.common.sending : he.common.sendFeedback}
          </Button>
        </div>
      )}
    </div>
  );
}
