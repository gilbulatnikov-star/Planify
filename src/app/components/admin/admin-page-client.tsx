"use client";

import { useState, useTransition } from "react";
import { Users, Crown, Trash2, Search, ShieldCheck, BarChart3, FileText, FolderOpen } from "lucide-react";
import { updateUserPlan, deleteUser } from "@/lib/actions/admin-actions";
import { format } from "date-fns";
import { he as heLocale } from "date-fns/locale";

type UserRow = {
  id: string;
  name: string | null;
  email: string;
  role: string | null;
  subscriptionPlan: string;
  subscriptionStatus: string | null;
  onboardingCompleted: boolean;
  createdAt: Date;
  updatedAt: Date;
  projectCount: number;
  scriptCount: number;
  contactCount: number;
};

type Stats = {
  totalUsers: number;
  freeUsers: number;
  monthlyUsers: number;
  annualUsers: number;
  totalProjects: number;
  totalScripts: number;
};

const PLAN_LABELS: Record<string, string> = {
  FREE: "חינמי",
  MONTHLY: "Pro חודשי",
  ANNUAL: "Pro שנתי",
};

const PLAN_COLORS: Record<string, string> = {
  FREE: "bg-gray-100 text-gray-600",
  MONTHLY: "bg-blue-100 text-blue-700",
  ANNUAL: "bg-amber-100 text-amber-700",
};

export function AdminPageClient({ stats, users }: { stats: Stats; users: UserRow[] }) {
  const [search, setSearch] = useState("");
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

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

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-8 py-5">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gray-900">
            <ShieldCheck className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">לוח ניהול</h1>
            <p className="text-sm text-gray-500">ניהול משתמשים ומנויים</p>
          </div>
        </div>
      </div>

      <div className="px-8 py-6 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {[
            { label: "סה״כ משתמשים", value: stats.totalUsers, icon: Users, color: "text-gray-700" },
            { label: "חינמי", value: stats.freeUsers, icon: Users, color: "text-gray-500" },
            { label: "Pro חודשי", value: stats.monthlyUsers, icon: Crown, color: "text-blue-600" },
            { label: "Pro שנתי", value: stats.annualUsers, icon: Crown, color: "text-amber-600" },
            { label: "פרויקטים", value: stats.totalProjects, icon: FolderOpen, color: "text-purple-600" },
            { label: "תסריטים", value: stats.totalScripts, icon: FileText, color: "text-green-600" },
          ].map(s => (
            <div key={s.label} className="bg-white rounded-2xl border border-gray-200 p-4 shadow-sm">
              <s.icon className={`h-5 w-5 ${s.color} mb-2`} />
              <p className="text-2xl font-bold text-gray-900">{s.value}</p>
              <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="חפש לפי שם או אימייל..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full rounded-xl border border-gray-200 bg-white pr-10 pl-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
          />
        </div>

        {/* Users Table */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <th className="text-right px-5 py-3 font-medium text-gray-500">משתמש</th>
                  <th className="text-right px-5 py-3 font-medium text-gray-500">תפקיד</th>
                  <th className="text-right px-5 py-3 font-medium text-gray-500">מנוי</th>
                  <th className="text-right px-5 py-3 font-medium text-gray-500">סטטוס</th>
                  <th className="text-right px-5 py-3 font-medium text-gray-500">הצטרף</th>
                  <th className="text-right px-5 py-3 font-medium text-gray-500">שינוי מנוי</th>
                  <th className="px-5 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(user => (
                  <tr key={user.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                    {/* User */}
                    <td className="px-5 py-3.5">
                      <div>
                        <p className="font-medium text-gray-900">{user.name ?? "—"}</p>
                        <p className="text-xs text-gray-500">{user.email}</p>
                      </div>
                    </td>
                    {/* Role */}
                    <td className="px-5 py-3.5 text-gray-600">{user.role ?? "—"}</td>
                    {/* Plan */}
                    <td className="px-5 py-3.5">
                      <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${PLAN_COLORS[user.subscriptionPlan] ?? PLAN_COLORS.FREE}`}>
                        {user.subscriptionPlan !== "FREE" && <Crown className="h-3 w-3" />}
                        {PLAN_LABELS[user.subscriptionPlan] ?? user.subscriptionPlan}
                      </span>
                    </td>
                    {/* Status */}
                    <td className="px-5 py-3.5">
                      <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${user.onboardingCompleted ? "bg-green-50 text-green-700" : "bg-yellow-50 text-yellow-700"}`}>
                        {user.onboardingCompleted ? "פעיל" : "אונבורדינג"}
                      </span>
                    </td>
                    {/* Joined */}
                    <td className="px-5 py-3.5 text-gray-500 text-xs">
                      {format(new Date(user.createdAt), "d MMM yyyy", { locale: heLocale })}
                    </td>
                    {/* Change Plan */}
                    <td className="px-5 py-3.5">
                      <select
                        value={user.subscriptionPlan}
                        onChange={e => handlePlanChange(user.id, e.target.value)}
                        disabled={isPending}
                        className="rounded-lg border border-gray-200 bg-white px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-gray-900 disabled:opacity-50"
                      >
                        <option value="FREE">חינמי</option>
                        <option value="MONTHLY">Pro חודשי</option>
                        <option value="ANNUAL">Pro שנתי</option>
                      </select>
                    </td>
                    {/* Delete */}
                    <td className="px-5 py-3.5">
                      {confirmDelete === user.id ? (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleDelete(user.id)}
                            disabled={isPending}
                            className="rounded-lg bg-red-600 px-2.5 py-1 text-xs font-medium text-white hover:bg-red-700 disabled:opacity-50"
                          >
                            מחק
                          </button>
                          <button
                            onClick={() => setConfirmDelete(null)}
                            className="rounded-lg border border-gray-200 px-2.5 py-1 text-xs text-gray-600 hover:bg-gray-50"
                          >
                            ביטול
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setConfirmDelete(user.id)}
                          className="flex h-7 w-7 items-center justify-center rounded-lg text-gray-400 hover:bg-red-50 hover:text-red-500 transition-colors"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-5 py-12 text-center text-gray-400">
                      <BarChart3 className="h-8 w-8 mx-auto mb-2 opacity-30" />
                      לא נמצאו משתמשים
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
