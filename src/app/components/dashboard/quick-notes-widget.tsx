"use client";

import { useState, useCallback, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StickyNote } from "lucide-react";
import { useT } from "@/lib/i18n";
import { updateQuickNote } from "@/lib/actions/widget-actions";

interface QuickNotesWidgetProps {
  initialContent: string;
}

export function QuickNotesWidget({ initialContent }: QuickNotesWidgetProps) {
  const he = useT();
  const [content, setContent] = useState(initialContent);
  const [saved, setSaved] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleBlur = useCallback(async () => {
    if (content === initialContent) return;

    await updateQuickNote(content);

    setSaved(true);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => setSaved(false), 2000);
  }, [content, initialContent]);

  return (
    <Card className="glass-card">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {he.widgets.quickNotes}
        </CardTitle>
        <div className="flex items-center gap-2">
          {saved && (
            <span className="text-xs text-emerald-600 animate-in fade-in duration-300">
              נשמר
            </span>
          )}
          <div className="rounded-lg bg-[#38b6ff]/10 p-1.5">
            <StickyNote className="h-4 w-4 text-[#38b6ff]" />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onBlur={handleBlur}
          placeholder={he.widgets.quickNotesPlaceholder}
          className="w-full min-h-[120px] resize-none bg-transparent border-none outline-none text-sm text-foreground placeholder:text-muted-foreground/50 leading-relaxed"
        />
      </CardContent>
    </Card>
  );
}
