"use client";

import { useSession } from "next-auth/react";
import { User, Mail, Shield } from "lucide-react";

export default function ProfileSettingsPage() {
  const { data: session } = useSession();
  const user = session?.user;

  return (
    <div className="max-w-2xl mx-auto space-y-6" dir="rtl">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">הגדרות חשבון</h1>
        <p className="mt-1 text-sm text-gray-500">פרטי המשתמש שלך</p>
      </div>

      {/* Profile card */}
      <div className="rounded-2xl border border-gray-200 bg-white shadow-sm px-6 py-6 space-y-5">
        {/* Avatar */}
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gray-900 text-white text-xl font-bold">
            {user?.name
              ? user.name.split(" ").map((n: string) => n[0]).join("").slice(0, 2).toUpperCase()
              : user?.email?.[0]?.toUpperCase() ?? "U"}
          </div>
          <div>
            <p className="text-base font-semibold text-gray-900">{user?.name ?? "—"}</p>
            <p className="text-sm text-gray-500">{user?.email}</p>
          </div>
        </div>

        <div className="h-px bg-gray-100" />

        {/* Fields */}
        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <User className="h-4 w-4 text-gray-400 mt-0.5" />
            <div>
              <p className="text-xs text-gray-500 font-medium">שם מלא</p>
              <p className="text-sm text-gray-800 font-medium mt-0.5">{user?.name ?? "לא הוגדר"}</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Mail className="h-4 w-4 text-gray-400 mt-0.5" />
            <div>
              <p className="text-xs text-gray-500 font-medium">כתובת דוא&quot;ל</p>
              <p className="text-sm text-gray-800 font-medium mt-0.5">{user?.email ?? "—"}</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Shield className="h-4 w-4 text-gray-400 mt-0.5" />
            <div>
              <p className="text-xs text-gray-500 font-medium">אבטחה</p>
              <p className="text-sm text-gray-500 mt-0.5">סיסמה מוצפנת · אימות בכניסה</p>
            </div>
          </div>
        </div>

        <div className="pt-2">
          <p className="text-xs text-gray-400">
            עריכת פרטים תהיה זמינה בקרוב.
          </p>
        </div>
      </div>
    </div>
  );
}
