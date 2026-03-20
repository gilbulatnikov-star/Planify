"use client";

import { signOut, useSession } from "next-auth/react";
import { LogOut, Settings, CreditCard } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import Link from "next/link";

export function UserMenu() {
  const { data: session } = useSession();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  if (!session?.user) return null;

  const initials = session.user.name
    ? session.user.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()
    : session.user.email?.[0]?.toUpperCase() ?? "U";

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex h-8 w-8 items-center justify-center rounded-full bg-foreground text-background text-xs font-semibold hover:opacity-80 transition-colors"
        title={session.user.name ?? session.user.email ?? ""}
      >
        {initials}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute left-0 top-full mt-2 z-50 w-60 rounded-xl border border-border bg-popover shadow-lg overflow-hidden">
            {/* User info header — non-clickable */}
            <div className="px-4 py-3 border-b border-border">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-foreground text-background text-xs font-semibold shrink-0">
                  {initials}
                </div>
                <div className="min-w-0">
                  {session.user.name && (
                    <p className="text-sm font-semibold text-foreground truncate">
                      {session.user.name}
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground truncate">
                    {session.user.email}
                  </p>
                </div>
              </div>
            </div>

            {/* Navigation items */}
            <div className="p-1">
              <Link
                href="/settings/profile"
                onClick={() => setOpen(false)}
                className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-foreground hover:bg-muted transition-colors"
              >
                <Settings className="h-4 w-4 text-muted-foreground" />
                <span>הגדרות חשבון</span>
              </Link>

              <Link
                href="/settings/billing"
                onClick={() => setOpen(false)}
                className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-foreground hover:bg-muted transition-colors"
              >
                <CreditCard className="h-4 w-4 text-muted-foreground" />
                <span>מנוי ותשלומים</span>
              </Link>
            </div>

            {/* Divider */}
            <div className="h-px bg-border mx-2" />

            {/* Sign out */}
            <div className="p-1">
              <button
                onClick={() => signOut({ callbackUrl: "/sign-in" })}
                className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
              >
                <LogOut className="h-4 w-4" />
                <span>התנתקות</span>
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
