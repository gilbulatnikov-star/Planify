"use client";

import { useState, useRef, useEffect, useTransition } from "react";
import { createPortal } from "react-dom";
import { Bell, Info, AlertTriangle, AlertCircle, Check, Trash2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { useT } from "@/lib/i18n";
import {
  markAsRead,
  markAllAsRead,
  deleteNotification,
} from "@/lib/actions/notification-actions";

interface Notification {
  id: string;
  title: string;
  message: string;
  link: string | null;
  read: boolean;
  type: string;
  createdAt: Date;
}

function timeAgo(date: Date, t: ReturnType<typeof useT>): string {
  const now = new Date();
  const diffMs = now.getTime() - new Date(date).getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return t.notifications.timeAgo.now;
  if (diffMins < 60) return `${diffMins} ${t.notifications.timeAgo.minutes}`;
  if (diffHours < 24) return `${diffHours} ${t.notifications.timeAgo.hours}`;
  return `${diffDays} ${t.notifications.timeAgo.days}`;
}

function TypeIcon({ type }: { type: string }) {
  switch (type) {
    case "urgent":
      return <AlertCircle className="h-4 w-4 text-red-500 shrink-0" />;
    case "warning":
      return <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0" />;
    default:
      return <Info className="h-4 w-4 text-blue-500 shrink-0" />;
  }
}

export function NotificationBell({
  initialNotifications,
  initialUnreadCount,
}: {
  initialNotifications: Notification[];
  initialUnreadCount: number;
}) {
  const t = useT();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const btnRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState({ top: 0, left: 0 });

  // Close on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (
        btnRef.current &&
        !btnRef.current.contains(e.target as Node) &&
        menuRef.current &&
        !menuRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  // Position dropdown
  useEffect(() => {
    if (open && btnRef.current) {
      const rect = btnRef.current.getBoundingClientRect();
      const menuWidth = 360;
      let left = rect.left + rect.width / 2 - menuWidth / 2;
      left = Math.max(8, Math.min(left, window.innerWidth - menuWidth - 8));
      setPos({ top: rect.bottom + 8, left });
    }
  }, [open]);

  const handleNotificationClick = (notification: Notification) => {
    startTransition(async () => {
      if (!notification.read) {
        await markAsRead(notification.id);
      }
      if (notification.link) {
        router.push(notification.link);
      }
      setOpen(false);
    });
  };

  const handleMarkAllRead = () => {
    startTransition(async () => {
      await markAllAsRead();
      router.refresh();
    });
  };

  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    startTransition(async () => {
      await deleteNotification(id);
      router.refresh();
    });
  };

  return (
    <>
      <button
        ref={btnRef}
        onClick={() => setOpen((v) => !v)}
        className="relative flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
        title={t.notifications.title}
      >
        <Bell className="h-4 w-4" />
        {initialUnreadCount > 0 && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-0.5 -end-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white"
          >
            {initialUnreadCount > 9 ? "9+" : initialUnreadCount}
          </motion.span>
        )}
      </button>

      {open &&
        typeof document !== "undefined" &&
        createPortal(
          <>
            <div
              className="fixed inset-0 z-[9998] bg-black/5"
              onClick={() => setOpen(false)}
            />
            <motion.div
              ref={menuRef}
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.15 }}
              style={{ top: pos.top, left: pos.left }}
              className="fixed z-[9999] w-[360px] max-h-[420px] rounded-xl border border-border bg-popover shadow-lg overflow-hidden flex flex-col"
            >
              {/* Header */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-border">
                <h3 className="text-sm font-semibold text-foreground">
                  {t.notifications.title}
                </h3>
                {initialUnreadCount > 0 && (
                  <button
                    onClick={handleMarkAllRead}
                    disabled={isPending}
                    className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
                  >
                    <Check className="h-3 w-3" />
                    {t.notifications.markAllRead}
                  </button>
                )}
              </div>

              {/* Notifications list */}
              <div className="flex-1 overflow-y-auto">
                {initialNotifications.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-10 text-muted-foreground">
                    <Bell className="h-8 w-8 mb-2 opacity-30" />
                    <p className="text-sm">{t.notifications.noNotifications}</p>
                  </div>
                ) : (
                  <AnimatePresence>
                    {initialNotifications.map((n) => (
                      <motion.div
                        key={n.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 10 }}
                        onClick={() => handleNotificationClick(n)}
                        className={`group flex items-start gap-3 px-4 py-3 cursor-pointer transition-colors border-b border-border/50 last:border-b-0 ${
                          n.read
                            ? "bg-transparent hover:bg-muted/50"
                            : "bg-primary/5 hover:bg-primary/10"
                        }`}
                      >
                        <div className="mt-0.5">
                          <TypeIcon type={n.type} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p
                              className={`text-sm truncate ${
                                n.read
                                  ? "text-muted-foreground"
                                  : "text-foreground font-medium"
                              }`}
                            >
                              {n.title}
                            </p>
                            {!n.read && (
                              <span className="h-2 w-2 rounded-full bg-blue-500 shrink-0" />
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                            {n.message}
                          </p>
                          <p className="text-[10px] text-muted-foreground/60 mt-1">
                            {timeAgo(n.createdAt, t)}
                          </p>
                        </div>
                        <button
                          onClick={(e) => handleDelete(e, n.id)}
                          className="opacity-0 group-hover:opacity-100 mt-0.5 p-1 rounded hover:bg-muted transition-all"
                          title="Delete"
                        >
                          <Trash2 className="h-3 w-3 text-muted-foreground" />
                        </button>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                )}
              </div>
            </motion.div>
          </>,
          document.body
        )}
    </>
  );
}
