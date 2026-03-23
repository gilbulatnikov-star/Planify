"use client";

import { useState, useTransition } from "react";
import { Users, Crown, Trash2, Search, ShieldCheck, BarChart3, Key, Calendar, MessageSquare, Star } from "lucide-react";
import { updateUserPlan, deleteUser, resetUserPassword, updateUserSubscriptionExpiry } from "@/lib/actions/admin-actions";
import { DatePicker } from "@/components/ui/date-picker";
import { deleteFeedback } from "@/lib/actions/feedback-actions";
import { format } from "date-fns";
import { he as heLocale } from "date-fns/locale";
import { useT } from "@/lib/i18n";

type UserRow = {
  id: string;
  name: string | null;
  email: string;
  subscriptionPlan: string;
  subscriptionStatus: string | null;
  subscriptionEndsAt: Date | null;
  onboardingCompleted: boolean;
  createdAt: Date;
};

type Stats = {
  totalUsers: number;
  freeUsers: number;
  monthlyUsers: number;
  annualUsers: number;
  newThisWeek: number;
  newThisMonth: number;
  incompleteOnboarding: number;
  totalProjects: number;
  totalScripts: number;
  totalContacts: number;
  mrr: number;
};

type FeedbackRow = {
  id: string;
  message: string;
  rating: number | null;
  userEmail: string | null;
  userName: string | null;
  createdAt: Date;
};

const PLAN_LABELS: Record<string, string> = {
  FREE: "חינמי",
  MONTHLY: "Pro חודשי",
  ANNUAL: "Pro שנתי",
};

const PLAN_COLORS: Record<string, string> = {
  FREE: "bg-muted text-muted-foreground",
  MONTHLY: "bg-blue-100 text-blue-700",
  ANNUAL: "bg-amber-100 text-amber-700",
};

export function AdminPageClient({ stats, users, feedbacks }: { stats: Stats; users: UserRow[]; feedbacks: FeedbackRow[] }) {
  const he = useT();
  const [search, setSearch] = useState("");
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [passwordModal, setPasswordModal] = useState<{ userId: string; name: string } | null>(null);
  const [expiryModal, setExpiryModal] = useState<{ userId: string; name: string; current: Date | null } | null>(null);
  const [newPassword, setNewPassword] = useState("");
  const [newExpiry, setNewExpiry] = useState("");
  const [isPending, startTransition] = useTransition();
  const [feedback, setFeedback] = useState<string | null>(null);

  const filtered = users.filter(u =>
    u.name?.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  function handlePlanChange(userId: string, plan: string) {
    startTransition(() => updateUserPlan(userId, plan));
  }

  function handleDelete(userId: string) {
    startTransition(async () => {
      await deleteUser(userId);
      setConfirmDelete(null);
    });
  }

  function handleResetPassword() {
    if (!passwordModal || !newPassword) return;
    startTransition(async () => {
      await resetUserPassword(passwordModal.userId, newPassword);
      setPasswordModal(null);
      setNewPassword("");
      setFeedback(he.admin.passwordUpdated);
      setTimeout(() => setFeedback(null), 3000);
    });
  }

  function handleUpdateExpiry() {
    if (!expiryModal) return;
    startTransition(async () => {
      await updateUserSubscriptionExpiry(expiryModal.userId, newExpiry ? new Date(newExpiry) : null);
      setExpiryModal(null);
      setNewExpiry("");
      setFeedback(he.admin.expiryUpdated);
      setTimeout(() => setFeedback(null), 3000);
    });
  }

  return (
    <div className="min-h-screen bg-muted" dir="rtl">
      {/* Header */}
      <div className="bg-card border-b border-border px-8 py-5">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-foreground">
            <ShieldCheck className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground">{he.admin.dashboard}</h1>
            <p className="text-sm text-muted-foreground">{he.admin.dashboardDesc}</p>
          </div>
        </div>
      </div>

      <div className="px-8 py-6 space-y-6">
        {/* Feedback */}
        {feedback && (
          <div className="rounded-xl bg-green-50 border border-green-200 px-4 py-3 text-sm text-green-700 font-medium">
            {feedback}
          </div>
        )}

        {/* Stats — plans */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: he.admin.totalUsers, value: stats.totalUsers, icon: Users, color: "text-foreground" },
            { label: he.admin.free, value: stats.freeUsers, icon: Users, color: "text-muted-foreground" },
            { label: he.admin.proMonthly, value: stats.monthlyUsers, icon: Crown, color: "text-blue-600" },
            { label: he.admin.proAnnual, value: stats.annualUsers, icon: Crown, color: "text-amber-600" },
          ].map(s => (
            <div key={s.label} className="bg-card rounded-2xl border border-border p-4 shadow-sm">
              <s.icon className={`h-5 w-5 ${s.color} mb-2`} />
              <p className="text-2xl font-bold text-foreground">{s.value}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Stats — growth & revenue */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-card rounded-2xl border border-border p-4 shadow-sm">
            <p className="text-xs text-muted-foreground">MRR</p>
            <p className="text-2xl font-bold text-emerald-600">₪{stats.mrr.toLocaleString()}</p>
          </div>
          <div className="bg-card rounded-2xl border border-border p-4 shadow-sm">
            <p className="text-xs text-muted-foreground">נרשמו השבוע</p>
            <p className="text-2xl font-bold text-foreground">{stats.newThisWeek}</p>
          </div>
          <div className="bg-card rounded-2xl border border-border p-4 shadow-sm">
            <p className="text-xs text-muted-foreground">נרשמו החודש</p>
            <p className="text-2xl font-bold text-foreground">{stats.newThisMonth}</p>
          </div>
          <div className="bg-card rounded-2xl border border-border p-4 shadow-sm">
            <p className="text-xs text-muted-foreground">לא השלימו אונבורדינג</p>
            <p className="text-2xl font-bold text-orange-500">{stats.incompleteOnboarding}</p>
          </div>
        </div>

        {/* Stats — usage */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-card rounded-2xl border border-border p-4 shadow-sm">
            <p className="text-xs text-muted-foreground">סה״כ פרויקטים</p>
            <p className="text-2xl font-bold text-foreground">{stats.totalProjects}</p>
            <p className="text-[10px] text-muted-foreground mt-0.5">ממוצע {stats.totalUsers ? (stats.totalProjects / stats.totalUsers).toFixed(1) : 0} למשתמש</p>
          </div>
          <div className="bg-card rounded-2xl border border-border p-4 shadow-sm">
            <p className="text-xs text-muted-foreground">סה״כ תסריטים</p>
            <p className="text-2xl font-bold text-foreground">{stats.totalScripts}</p>
            <p className="text-[10px] text-muted-foreground mt-0.5">ממוצע {stats.totalUsers ? (stats.totalScripts / stats.totalUsers).toFixed(1) : 0} למשתמש</p>
          </div>
          <div className="bg-card rounded-2xl border border-border p-4 shadow-sm">
            <p className="text-xs text-muted-foreground">סה״כ אנשי קשר</p>
            <p className="text-2xl font-bold text-foreground">{stats.totalContacts}</p>
            <p className="text-[10px] text-muted-foreground mt-0.5">ממוצע {stats.totalUsers ? (stats.totalContacts / stats.totalUsers).toFixed(1) : 0} למשתמש</p>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder={he.admin.searchPlaceholder}
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full rounded-xl border border-border bg-card pr-10 pl-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
          />
        </div>

        {/* Users Table */}
        <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted">
                  <th className="text-right px-5 py-3 font-medium text-muted-foreground">{he.admin.user}</th>
                  <th className="text-right px-5 py-3 font-medium text-muted-foreground">{he.admin.subscription}</th>
                  <th className="text-right px-5 py-3 font-medium text-muted-foreground">{he.admin.expiry}</th>
                  <th className="text-right px-5 py-3 font-medium text-muted-foreground">{he.admin.statusCol}</th>
                  <th className="text-right px-5 py-3 font-medium text-muted-foreground">{he.admin.joined}</th>
                  <th className="text-right px-5 py-3 font-medium text-muted-foreground">{he.admin.changePlan}</th>
                  <th className="px-5 py-3 text-right font-medium text-muted-foreground">{he.admin.actionsCol}</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(user => (
                  <tr key={user.id} className="border-b border-gray-50 hover:bg-muted transition-colors">
                    {/* User */}
                    <td className="px-5 py-3.5">
                      <div>
                        <p className="font-medium text-foreground">{user.name ?? "—"}</p>
                        <p className="text-xs text-muted-foreground">{user.email}</p>
                      </div>
                    </td>
                    {/* Plan */}
                    <td className="px-5 py-3.5">
                      <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${PLAN_COLORS[user.subscriptionPlan] ?? PLAN_COLORS.FREE}`}>
                        {user.subscriptionPlan !== "FREE" && <Crown className="h-3 w-3" />}
                        {PLAN_LABELS[user.subscriptionPlan] ?? user.subscriptionPlan}
                      </span>
                    </td>
                    {/* Expiry */}
                    <td className="px-5 py-3.5 text-xs">
                      {user.subscriptionEndsAt ? (
                        <span className={new Date(user.subscriptionEndsAt) < new Date() ? "text-red-500 font-medium" : "text-muted-foreground"}>
                          {format(new Date(user.subscriptionEndsAt), "d MMM yyyy", { locale: heLocale })}
                        </span>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </td>
                    {/* Status */}
                    <td className="px-5 py-3.5">
                      <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${user.onboardingCompleted ? "bg-green-50 text-green-700" : "bg-yellow-50 text-yellow-700"}`}>
                        {user.onboardingCompleted ? he.admin.active : he.admin.onboardingStatus}
                      </span>
                    </td>
                    {/* Joined */}
                    <td className="px-5 py-3.5 text-muted-foreground text-xs">
                      {format(new Date(user.createdAt), "d MMM yyyy", { locale: heLocale })}
                    </td>
                    {/* Change Plan */}
                    <td className="px-5 py-3.5">
                      <select
                        value={user.subscriptionPlan}
                        onChange={e => handlePlanChange(user.id, e.target.value)}
                        disabled={isPending}
                        className="rounded-lg border border-border bg-card px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-gray-900 disabled:opacity-50"
                      >
                        <option value="FREE">{he.admin.free}</option>
                        <option value="MONTHLY">{he.admin.proMonthly}</option>
                        <option value="ANNUAL">{he.admin.proAnnual}</option>
                      </select>
                    </td>
                    {/* Actions */}
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-1.5">
                        {/* Reset password */}
                        <button
                          onClick={() => setPasswordModal({ userId: user.id, name: user.name ?? user.email })}
                          className="flex h-7 w-7 items-center justify-center rounded-lg text-muted-foreground hover:bg-blue-50 hover:text-blue-500 transition-colors"
                          title="איפוס סיסמה"
                        >
                          <Key className="h-3.5 w-3.5" />
                        </button>
                        {/* Expiry */}
                        <button
                          onClick={() => { setExpiryModal({ userId: user.id, name: user.name ?? user.email, current: user.subscriptionEndsAt }); setNewExpiry(user.subscriptionEndsAt ? format(new Date(user.subscriptionEndsAt), "yyyy-MM-dd") : ""); }}
                          className="flex h-7 w-7 items-center justify-center rounded-lg text-muted-foreground hover:bg-amber-50 hover:text-amber-500 transition-colors"
                          title="עדכון תוקף מנוי"
                        >
                          <Calendar className="h-3.5 w-3.5" />
                        </button>
                        {/* Delete */}
                        {confirmDelete === user.id ? (
                          <div className="flex items-center gap-1">
                            <button onClick={() => handleDelete(user.id)} disabled={isPending} className="rounded-lg bg-red-600 px-2 py-1 text-xs font-medium text-background hover:bg-red-700 disabled:opacity-50">{he.admin.deleteConfirm}</button>
                            <button onClick={() => setConfirmDelete(null)} className="rounded-lg border border-border px-2 py-1 text-xs text-muted-foreground hover:bg-muted">{he.admin.cancelAction}</button>
                          </div>
                        ) : (
                          <button onClick={() => setConfirmDelete(user.id)} className="flex h-7 w-7 items-center justify-center rounded-lg text-muted-foreground hover:bg-red-50 hover:text-red-500 transition-colors" title="מחק משתמש">
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-5 py-12 text-center text-muted-foreground">
                      <BarChart3 className="h-8 w-8 mx-auto mb-2 opacity-30" />
                      {he.admin.noUsersFound}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
        {/* Feedbacks Section */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <MessageSquare className="h-5 w-5 text-muted-foreground" />
            <h2 className="text-base font-semibold text-foreground">{he.admin.feedbackTitle}</h2>
            <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">{feedbacks.length}</span>
          </div>
          {feedbacks.length === 0 ? (
            <div className="rounded-2xl border border-border bg-card p-8 text-center text-muted-foreground text-sm">
              {he.admin.noFeedback}
            </div>
          ) : (
            <div className="space-y-3">
              {feedbacks.map(fb => (
                <div key={fb.id} className="rounded-2xl border border-border bg-card p-4 shadow-sm">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-foreground whitespace-pre-wrap">{fb.message}</p>
                    </div>
                    {fb.rating && (
                      <div className="flex items-center gap-0.5 shrink-0">
                        {Array.from({ length: fb.rating }).map((_, i) => (
                          <Star key={i} className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span>{fb.userName ?? fb.userEmail ?? "אנונימי"}</span>
                      <span>·</span>
                      <span>{format(new Date(fb.createdAt), "d MMM yyyy, HH:mm", { locale: heLocale })}</span>
                    </div>
                    <button
                      onClick={() => startTransition(async () => { await deleteFeedback(fb.id); window.location.reload(); })}
                      disabled={isPending}
                      className="flex h-6 w-6 items-center justify-center rounded-lg text-muted-foreground hover:bg-red-50 hover:text-red-500 transition-colors"
                      title="מחק פידבק"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Password Modal */}
      {passwordModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => setPasswordModal(null)}>
          <div className="bg-card rounded-2xl shadow-xl p-6 w-full max-w-sm mx-4" onClick={e => e.stopPropagation()} dir="rtl">
            <h2 className="text-base font-bold text-foreground mb-1">{he.admin.resetPassword}</h2>
            <p className="text-sm text-muted-foreground mb-4">{passwordModal.name}</p>
            <input
              type="password"
              placeholder={he.admin.newPasswordPlaceholder}
              value={newPassword}
              onChange={e => setNewPassword(e.target.value)}
              className="w-full rounded-xl border border-border px-3 py-2.5 text-sm mb-4 focus:outline-none focus:ring-2 focus:ring-gray-900"
            />
            <div className="flex gap-2">
              <button onClick={handleResetPassword} disabled={isPending || !newPassword} className="flex-1 rounded-xl bg-foreground py-2.5 text-sm font-semibold text-background hover:bg-foreground/90 disabled:opacity-50">{he.admin.updatePassword}</button>
              <button onClick={() => setPasswordModal(null)} className="flex-1 rounded-xl border border-border py-2.5 text-sm text-muted-foreground hover:bg-muted">{he.admin.cancelAction}</button>
            </div>
          </div>
        </div>
      )}

      {/* Expiry Modal */}
      {expiryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => setExpiryModal(null)}>
          <div className="bg-card rounded-2xl shadow-xl p-6 w-full max-w-sm mx-4" onClick={e => e.stopPropagation()} dir="rtl">
            <h2 className="text-base font-bold text-foreground mb-1">{he.admin.expiryTitle}</h2>
            <p className="text-sm text-muted-foreground mb-4">{expiryModal.name}</p>
            <div className="mb-4">
              <DatePicker value={newExpiry} onChange={setNewExpiry} name="newExpiry" />
            </div>
            <div className="flex gap-2">
              <button onClick={handleUpdateExpiry} disabled={isPending} className="flex-1 rounded-xl bg-foreground py-2.5 text-sm font-semibold text-background hover:bg-foreground/90 disabled:opacity-50">{he.admin.updateBtn}</button>
              <button onClick={() => { setExpiryModal(null); updateUserSubscriptionExpiry(expiryModal.userId, null); }} className="rounded-xl border border-border px-3 py-2.5 text-sm text-red-500 hover:bg-red-50">{he.admin.removeExpiry}</button>
              <button onClick={() => setExpiryModal(null)} className="flex-1 rounded-xl border border-border py-2.5 text-sm text-muted-foreground hover:bg-muted">{he.admin.cancelAction}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
