"use client";

import { signOut, useSession } from "next-auth/react";
import { LogOut, Settings, CreditCard } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { useT } from "@/lib/i18n";

export function UserMenu() {
  const he = useT();
  const { data: session } = useSession();
  const [open, setOpen] = useState(false);
  const btnRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState({ top: 0, left: 0 });

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (
        btnRef.current && !btnRef.current.contains(e.target as Node) &&
        menuRef.current && !menuRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  useEffect(() => {
    if (open && btnRef.current) {
      const rect = btnRef.current.getBoundingClientRect();
      const menuWidth = 240; // w-60 = 15rem = 240px
      // Position so the menu doesn't overflow either side
      let left = rect.left + rect.width / 2 - menuWidth / 2;
      left = Math.max(8, Math.min(left, window.innerWidth - menuWidth - 8));
      setPos({ top: rect.bottom + 8, left });
    }
  }, [open]);

  if (!session?.user) return null;

  const initials = session.user.name
    ? session.user.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()
    : session.user.email?.[0]?.toUpperCase() ?? "U";

  return (
    <>
      <button
        ref={btnRef}
        onClick={() => setOpen((v) => !v)}
        className="flex h-8 w-8 items-center justify-center rounded-full bg-foreground text-background text-xs font-semibold hover:opacity-80 transition-colors overflow-hidden"
        title={session.user.name ?? session.user.email ?? ""}
      >
        {session.user.image ? (
          <img src={session.user.image} alt={session.user.name ?? ""} className="h-8 w-8 rounded-full object-cover" />
        ) : initials}
      </button>

      {open && typeof document !== "undefined" && createPortal(
        <>
          <div className="fixed inset-0 z-[9998] bg-black/5" onClick={() => setOpen(false)} />
          <div
            ref={menuRef}
            style={{ top: pos.top, left: pos.left }}
            className="fixed z-[9999] w-60 rounded-xl border border-border bg-popover shadow-lg overflow-hidden"
          >
            {/* User info */}
            <div className="px-4 py-3 border-b border-border">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-foreground text-background text-xs font-semibold shrink-0 overflow-hidden">
                  {session.user.image ? (
                    <img src={session.user.image} alt={session.user.name ?? ""} className="h-9 w-9 rounded-full object-cover" />
                  ) : initials}
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

            {/* Navigation */}
            <div className="p-1">
              <Link
                href="/settings/profile"
                onClick={() => setOpen(false)}
                className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-foreground hover:bg-muted transition-colors"
              >
                <Settings className="h-4 w-4 text-muted-foreground" />
                <span>{he.common.accountSettings}</span>
              </Link>

              <Link
                href="/settings/billing"
                onClick={() => setOpen(false)}
                className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-foreground hover:bg-muted transition-colors"
              >
                <CreditCard className="h-4 w-4 text-muted-foreground" />
                <span>{he.common.billingPayments}</span>
              </Link>
            </div>

            <div className="h-px bg-border mx-2" />

            {/* Sign out */}
            <div className="p-1">
              <button
                onClick={() => signOut({ callbackUrl: "/sign-in" })}
                className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-950 transition-colors"
              >
                <LogOut className="h-4 w-4" />
                <span>{he.common.signOutAction}</span>
              </button>
            </div>
          </div>
        </>,
        document.body
      )}
    </>
  );
}
