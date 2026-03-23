"use client";

import { useState, useTransition } from "react";
import { MessageSquarePlus, Star, X, Send } from "lucide-react";
import { submitFeedback } from "@/lib/actions/feedback-actions";
import { useT } from "@/lib/i18n";

export function FeedbackButton() {
  const he = useT();
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [rating, setRating] = useState<number | null>(null);
  const [hoveredStar, setHoveredStar] = useState<number | null>(null);
  const [done, setDone] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleOpen() {
    setOpen(true);
    setDone(false);
    setMessage("");
    setRating(null);
  }

  function handleSubmit() {
    if (!message.trim()) return;
    startTransition(async () => {
      await submitFeedback(message, rating ?? undefined);
      setDone(true);
      setTimeout(() => setOpen(false), 2000);
    });
  }

  return (
    <>
      {/* Floating button */}
      <button
        onClick={handleOpen}
        className="fixed bottom-5 left-5 z-40 flex items-center gap-2 rounded-full bg-foreground text-background px-3.5 py-2 text-sm font-medium shadow-lg hover:bg-foreground/90 transition-all duration-200"
        title={he.common.sendFeedback}
      >
        <MessageSquarePlus className="h-4 w-4" />
        <span className="hidden sm:inline">{he.common.feedback}</span>
      </button>

      {/* Dialog backdrop */}
      {open && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-start sm:items-end sm:justify-start p-4 sm:p-6"
          onClick={(e) => { if (e.target === e.currentTarget) setOpen(false); }}
        >
          <div
            className="w-full max-w-sm rounded-2xl bg-card border border-border shadow-2xl p-5 space-y-4"
            dir="rtl"
          >
            {/* Header */}
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-foreground">{he.common.sendFeedback}</h3>
              <button
                onClick={() => setOpen(false)}
                className="flex h-7 w-7 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {done ? (
              <div className="text-center py-6">
                <p className="text-2xl mb-2">🙏</p>
                <p className="font-medium text-foreground">{he.common.thankYouFeedback}</p>
                <p className="text-sm text-muted-foreground mt-1">{he.common.helpsUsImprove}</p>
              </div>
            ) : (
              <>
                {/* Stars */}
                <div>
                  <p className="text-sm text-muted-foreground mb-2">{he.common.ratingOptional}</p>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onMouseEnter={() => setHoveredStar(star)}
                        onMouseLeave={() => setHoveredStar(null)}
                        onClick={() => setRating(rating === star ? null : star)}
                        className="transition-transform hover:scale-110"
                      >
                        <Star
                          className={`h-6 w-6 transition-colors ${
                            star <= (hoveredStar ?? rating ?? 0)
                              ? "fill-amber-400 text-amber-400"
                              : "text-muted-foreground/40"
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                {/* Message */}
                <div>
                  <p className="text-sm text-muted-foreground mb-2">{he.common.feedbackQuestion}</p>
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder={he.common.writeHere}
                    rows={4}
                    className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring placeholder:text-muted-foreground"
                    autoFocus
                  />
                </div>

                {/* Submit */}
                <button
                  onClick={handleSubmit}
                  disabled={isPending || !message.trim()}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-foreground text-background py-2.5 text-sm font-medium hover:bg-foreground/90 disabled:opacity-40 transition-all"
                >
                  <Send className="h-4 w-4" />
                  {isPending ? he.common.sending : he.common.sendFeedback}
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
