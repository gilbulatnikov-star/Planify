"use client";

import { useState, useEffect, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useT } from "@/lib/i18n";
import {
  createShareLink,
  getUserShareLinks,
  deactivateShareLink,
  deleteShareLink,
} from "@/lib/actions/share-actions";
import {
  Link2,
  Copy,
  Check,
  Trash2,
  Ban,
  Loader2,
  ExternalLink,
} from "lucide-react";

type ShareLink = {
  id: string;
  token: string;
  allowDownload: boolean;
  expiresAt: Date | null;
  note: string | null;
  active: boolean;
  createdAt: Date;
};

export function ShareDialog({
  projectId,
  open,
  onOpenChange,
}: {
  projectId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const t = useT();
  const router = useRouter();
  const [, startTransition] = useTransition();

  const [allowDownload, setAllowDownload] = useState(false);
  const [expiryDate, setExpiryDate] = useState("");
  const [note, setNote] = useState("");
  const [generating, setGenerating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [links, setLinks] = useState<ShareLink[]>([]);
  const [loadingLinks, setLoadingLinks] = useState(true);

  // Fetch existing links when dialog opens
  useEffect(() => {
    if (open) {
      setLoadingLinks(true);
      getUserShareLinks(projectId).then((result) => {
        setLinks(result as ShareLink[]);
        setLoadingLinks(false);
      });
    }
  }, [open, projectId]);

  async function handleGenerate() {
    setGenerating(true);
    try {
      const link = await createShareLink(projectId, {
        allowDownload,
        expiresAt: expiryDate || null,
        note: note || null,
      });

      const url = `${window.location.origin}/share/${link.token}`;
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);

      // Refresh links list
      const updated = await getUserShareLinks(projectId);
      setLinks(updated as ShareLink[]);

      // Reset form
      setAllowDownload(false);
      setExpiryDate("");
      setNote("");
    } catch {
      // Handle error silently
    } finally {
      setGenerating(false);
    }
  }

  function handleDeactivate(id: string) {
    startTransition(async () => {
      await deactivateShareLink(id);
      const updated = await getUserShareLinks(projectId);
      setLinks(updated as ShareLink[]);
      router.refresh();
    });
  }

  function handleDelete(id: string) {
    startTransition(async () => {
      await deleteShareLink(id);
      const updated = await getUserShareLinks(projectId);
      setLinks(updated as ShareLink[]);
      router.refresh();
    });
  }

  function copyLink(token: string) {
    const url = `${window.location.origin}/share/${token}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const activeLinks = links.filter((l) => l.active);
  const inactiveLinks = links.filter((l) => !l.active);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t.share.title}</DialogTitle>
          <DialogDescription>{t.share.generateLink}</DialogDescription>
        </DialogHeader>

        <div className="space-y-5" dir="rtl">
          {/* Allow download toggle */}
          <div className="flex items-center justify-between gap-3">
            <Label className="text-sm font-medium">{t.share.allowDownload}</Label>
            <Switch
              checked={allowDownload}
              onCheckedChange={setAllowDownload}
            />
          </div>

          {/* Expiry date */}
          <div className="space-y-1.5">
            <Label className="text-sm font-medium">{t.share.expiryDate}</Label>
            <Input
              type="date"
              value={expiryDate}
              onChange={(e) => setExpiryDate(e.target.value)}
              dir="ltr"
              className="h-9 text-sm"
            />
          </div>

          {/* Note */}
          <div className="space-y-1.5">
            <Label className="text-sm font-medium">{t.share.noteForClient}</Label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder={t.share.notePlaceholder}
              className="w-full rounded-xl border border-border bg-muted px-4 py-2.5 text-sm outline-none transition-all focus:border-foreground focus:bg-background focus:ring-2 focus:ring-ring placeholder:text-muted-foreground resize-none h-20"
            />
          </div>

          {/* Generate button */}
          <Button
            onClick={handleGenerate}
            disabled={generating}
            className="w-full gap-2"
          >
            {generating ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : copied ? (
              <>
                <Check className="h-4 w-4" />
                {t.share.copied}
              </>
            ) : (
              <>
                <Link2 className="h-4 w-4" />
                {t.share.generateLink}
              </>
            )}
          </Button>

          {/* Active links list */}
          {!loadingLinks && activeLinks.length > 0 && (
            <div className="space-y-2.5">
              <h3 className="text-xs font-semibold text-muted-foreground">
                {t.share.activeLinks} ({activeLinks.length})
              </h3>
              <div className="space-y-2">
                {activeLinks.map((link) => {
                  const isExpired =
                    link.expiresAt && new Date() > new Date(link.expiresAt);
                  return (
                    <div
                      key={link.id}
                      className="flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2"
                    >
                      <ExternalLink className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                      <div className="flex-1 min-w-0 space-y-0.5">
                        <p className="text-xs text-muted-foreground truncate" dir="ltr">
                          /share/{link.token.slice(0, 8)}...
                        </p>
                        <p className="text-[10px] text-muted-foreground">
                          {isExpired
                            ? t.share.expired
                            : link.expiresAt
                              ? new Date(link.expiresAt).toLocaleDateString()
                              : t.share.noExpiry}
                        </p>
                      </div>
                      <button
                        onClick={() => copyLink(link.token)}
                        className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                        title={t.share.copyLink}
                      >
                        <Copy className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeactivate(link.id)}
                        className="p-1.5 rounded-md text-muted-foreground hover:text-amber-600 hover:bg-muted transition-colors"
                        title={t.share.deactivate}
                      >
                        <Ban className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(link.id)}
                        className="p-1.5 rounded-md text-muted-foreground hover:text-red-500 hover:bg-muted transition-colors"
                        title={t.common.delete}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Inactive links */}
          {!loadingLinks && inactiveLinks.length > 0 && (
            <div className="space-y-2">
              {inactiveLinks.map((link) => (
                <div
                  key={link.id}
                  className="flex items-center gap-2 rounded-lg border border-border bg-muted/30 px-3 py-2 opacity-50"
                >
                  <ExternalLink className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-muted-foreground line-through truncate" dir="ltr">
                      /share/{link.token.slice(0, 8)}...
                    </p>
                  </div>
                  <button
                    onClick={() => handleDelete(link.id)}
                    className="p-1.5 rounded-md text-muted-foreground hover:text-red-500 hover:bg-muted transition-colors"
                    title={t.common.delete}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
