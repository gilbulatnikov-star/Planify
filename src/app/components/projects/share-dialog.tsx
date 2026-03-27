"use client";

import { useState, useEffect, useTransition, useCallback } from "react";
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
  updateShareLink,
  getUserShareLinks,
  regenerateShareToken,
  deactivateShareLink,
  deleteShareLink,
  getProjectFiles,
  toggleFileSharing,
} from "@/lib/actions/share-actions";
import {
  Link2,
  Copy,
  Check,
  Trash2,
  Ban,
  Loader2,
  ExternalLink,
  Settings,
  FolderOpen,
  RefreshCw,
  Lock,
  Eye,
  EyeOff,
  Image,
  Video,
  FileText,
  LinkIcon,
  Package,
  File,
  Calendar,
  Shield,
  Download,
  MessageSquare,
} from "lucide-react";

// ── Types ─────────────────────────────────────────────────────────────────────

type ShareLink = {
  id: string;
  token: string;
  allowDownload: boolean;
  expiresAt: Date | null;
  note: string | null;
  active: boolean;
  showDescription: boolean;
  showStatus: boolean;
  showDeadline: boolean;
  showTasks: boolean;
  showFiles: boolean;
  showClientName: boolean;
  passwordHash: string | null;
  regeneratedAt: Date | null;
  createdAt: Date;
};

type ProjectFile = {
  id: string;
  name: string;
  url: string;
  type: string;
  mimeType: string | null;
  size: number | null;
  isShared: boolean;
};

type Tab = "settings" | "files";

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatFileSize(bytes: number | null): string {
  if (!bytes) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function getFileTypeIcon(type: string) {
  switch (type) {
    case "image":
      return Image;
    case "video":
      return Video;
    case "document":
      return FileText;
    case "link":
      return LinkIcon;
    case "deliverable":
      return Package;
    default:
      return File;
  }
}

// ── Component ─────────────────────────────────────────────────────────────────

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

  // Tab state
  const [activeTab, setActiveTab] = useState<Tab>("settings");

  // Settings form state
  const [showDescription, setShowDescription] = useState(true);
  const [showStatus, setShowStatus] = useState(true);
  const [showDeadline, setShowDeadline] = useState(true);
  const [showTasks, setShowTasks] = useState(true);
  const [showFiles, setShowFiles] = useState(true);
  const [showClientName, setShowClientName] = useState(false);
  const [allowDownload, setAllowDownload] = useState(false);
  const [passwordProtect, setPasswordProtect] = useState(false);
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [expiryDate, setExpiryDate] = useState("");
  const [note, setNote] = useState("");

  // Loading / feedback state
  const [generating, setGenerating] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [regeneratingId, setRegeneratingId] = useState<string | null>(null);

  // Data state
  const [links, setLinks] = useState<ShareLink[]>([]);
  const [files, setFiles] = useState<ProjectFile[]>([]);
  const [loadingLinks, setLoadingLinks] = useState(true);
  const [loadingFiles, setLoadingFiles] = useState(true);
  const [togglingFileId, setTogglingFileId] = useState<string | null>(null);

  // ── Data fetching ─────────────────────────────────────────────────────────

  const refreshLinks = useCallback(async () => {
    const result = await getUserShareLinks(projectId);
    setLinks(result as ShareLink[]);
  }, [projectId]);

  const refreshFiles = useCallback(async () => {
    try {
      const result = await getProjectFiles(projectId);
      setFiles(result as ProjectFile[]);
    } catch {
      setFiles([]);
    }
  }, [projectId]);

  useEffect(() => {
    if (open) {
      setLoadingLinks(true);
      setLoadingFiles(true);
      refreshLinks().finally(() => setLoadingLinks(false));
      refreshFiles().finally(() => setLoadingFiles(false));
    }
  }, [open, projectId, refreshLinks, refreshFiles]);

  // ── Reset form ────────────────────────────────────────────────────────────

  function resetForm() {
    setShowDescription(true);
    setShowStatus(true);
    setShowDeadline(true);
    setShowTasks(true);
    setShowFiles(true);
    setShowClientName(false);
    setAllowDownload(false);
    setPasswordProtect(false);
    setPassword("");
    setExpiryDate("");
    setNote("");
  }

  // ── Handlers ──────────────────────────────────────────────────────────────

  async function handleGenerate() {
    setGenerating(true);
    try {
      const link = await createShareLink(projectId, {
        allowDownload,
        expiresAt: expiryDate || null,
        note: note || null,
        password: passwordProtect && password ? password : null,
        showDescription,
        showStatus,
        showDeadline,
        showTasks,
        showFiles,
        showClientName,
      });

      const url = `${window.location.origin}/share/${link.token}`;
      await navigator.clipboard.writeText(url);
      setCopiedId("new");
      setTimeout(() => setCopiedId(null), 2000);

      await refreshLinks();
      resetForm();
    } catch {
      // Handle error silently
    } finally {
      setGenerating(false);
    }
  }

  function handleCopyLink(link: ShareLink) {
    const url = `${window.location.origin}/share/${link.token}`;
    navigator.clipboard.writeText(url);
    setCopiedId(link.id);
    setTimeout(() => setCopiedId(null), 2000);
  }

  async function handleRegenerate(id: string) {
    setRegeneratingId(id);
    try {
      await regenerateShareToken(id);
      await refreshLinks();
    } catch {
      // Handle error silently
    } finally {
      setRegeneratingId(null);
    }
  }

  function handleDeactivate(id: string) {
    startTransition(async () => {
      await deactivateShareLink(id);
      await refreshLinks();
      router.refresh();
    });
  }

  function handleDelete(id: string) {
    startTransition(async () => {
      await deleteShareLink(id);
      await refreshLinks();
      router.refresh();
    });
  }

  async function handleToggleFileSharing(fileId: string) {
    setTogglingFileId(fileId);
    try {
      await toggleFileSharing(fileId);
      await refreshFiles();
    } catch {
      // Handle error silently
    } finally {
      setTogglingFileId(null);
    }
  }

  // ── Derived state ─────────────────────────────────────────────────────────

  const activeLinks = links.filter((l) => l.active);
  const inactiveLinks = links.filter((l) => !l.active);

  const filesByType: Record<string, ProjectFile[]> = {};
  for (const file of files) {
    if (!filesByType[file.type]) filesByType[file.type] = [];
    filesByType[file.type].push(file);
  }

  const fileTypeLabels: Record<string, string> = {
    image: t.share.images,
    video: t.share.videos,
    document: t.share.documents,
    link: t.share.links,
    deliverable: t.share.deliverables,
  };

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>{t.share.title}</DialogTitle>
          <DialogDescription>{t.share.subtitle}</DialogDescription>
        </DialogHeader>

        <div className="flex flex-col flex-1 min-h-0" dir="rtl">
          {/* ── Tab navigation ─────────────────────────────────────────── */}
          <div className="flex gap-1 rounded-[10px] bg-muted/60 p-1 mb-4">
            <button
              onClick={() => setActiveTab("settings")}
              className={`flex-1 flex items-center justify-center gap-2 rounded-[8px] px-3 py-2 text-sm font-medium transition-all ${
                activeTab === "settings"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Settings className="h-3.5 w-3.5" />
              {t.share.settings}
            </button>
            <button
              onClick={() => setActiveTab("files")}
              className={`flex-1 flex items-center justify-center gap-2 rounded-[8px] px-3 py-2 text-sm font-medium transition-all ${
                activeTab === "files"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <FolderOpen className="h-3.5 w-3.5" />
              {t.share.files}
            </button>
          </div>

          {/* ── Tab content (scrollable) ───────────────────────────────── */}
          <div className="flex-1 overflow-y-auto min-h-0 px-0.5 -mx-0.5">
            {activeTab === "settings" ? (
              <div className="space-y-5 pb-1">
                {/* Section: What to share */}
                <div className="rounded-[14px] border border-border/40 bg-card/50 p-4 space-y-3">
                  <h3 className="text-xs font-semibold text-muted-foreground tracking-wide">
                    {t.share.sharedFields}
                  </h3>
                  <div className="space-y-2.5">
                    {[
                      { key: "showDescription" as const, label: t.share.showDescription, value: showDescription, setter: setShowDescription },
                      { key: "showStatus" as const, label: t.share.showStatus, value: showStatus, setter: setShowStatus },
                      { key: "showDeadline" as const, label: t.share.showDeadline, value: showDeadline, setter: setShowDeadline },
                      { key: "showTasks" as const, label: t.share.showTasks, value: showTasks, setter: setShowTasks },
                      { key: "showFiles" as const, label: t.share.showFiles, value: showFiles, setter: setShowFiles },
                      { key: "showClientName" as const, label: t.share.showClientName, value: showClientName, setter: setShowClientName },
                    ].map(({ key, label, value, setter }) => (
                      <div
                        key={key}
                        className="flex items-center justify-between gap-3"
                      >
                        <Label className="text-sm font-normal cursor-pointer">
                          {label}
                        </Label>
                        <Switch
                          checked={value}
                          onCheckedChange={setter}
                        />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Section: Permissions */}
                <div className="rounded-[14px] border border-border/40 bg-card/50 p-4 space-y-3">
                  <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground tracking-wide">
                    <Download className="h-3.5 w-3.5" />
                    {t.share.allowDownload}
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <Label className="text-sm font-normal">
                      {t.share.allowDownload}
                    </Label>
                    <Switch
                      checked={allowDownload}
                      onCheckedChange={setAllowDownload}
                    />
                  </div>
                </div>

                {/* Section: Password protection */}
                <div className="rounded-[14px] border border-border/40 bg-card/50 p-4 space-y-3">
                  <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground tracking-wide">
                    <Shield className="h-3.5 w-3.5" />
                    {t.share.passwordProtect}
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <Label className="text-sm font-normal">
                      {t.share.password}
                    </Label>
                    <Switch
                      checked={passwordProtect}
                      onCheckedChange={(checked) => {
                        setPasswordProtect(checked);
                        if (!checked) setPassword("");
                      }}
                    />
                  </div>
                  {passwordProtect && (
                    <div className="relative">
                      <Input
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder={t.share.passwordPlaceholder}
                        className="h-9 text-sm pe-9"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute start-2 top-1/2 -translate-y-1/2 p-1 text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {showPassword ? (
                          <EyeOff className="h-3.5 w-3.5" />
                        ) : (
                          <Eye className="h-3.5 w-3.5" />
                        )}
                      </button>
                    </div>
                  )}
                </div>

                {/* Section: Expiry date */}
                <div className="rounded-[14px] border border-border/40 bg-card/50 p-4 space-y-3">
                  <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground tracking-wide">
                    <Calendar className="h-3.5 w-3.5" />
                    {t.share.expiryDate}
                  </div>
                  <Input
                    type="date"
                    value={expiryDate}
                    onChange={(e) => setExpiryDate(e.target.value)}
                    dir="ltr"
                    className="h-9 text-sm"
                    min={new Date().toISOString().split("T")[0]}
                  />
                </div>

                {/* Section: Note for client */}
                <div className="rounded-[14px] border border-border/40 bg-card/50 p-4 space-y-3">
                  <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground tracking-wide">
                    <MessageSquare className="h-3.5 w-3.5" />
                    {t.share.noteForClient}
                  </div>
                  <textarea
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder={t.share.notePlaceholder}
                    className="w-full rounded-[10px] border border-border bg-muted/50 px-3 py-2.5 text-sm outline-none transition-all focus:border-foreground/30 focus:bg-background focus:ring-2 focus:ring-ring/20 placeholder:text-muted-foreground resize-none h-20"
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
                  ) : copiedId === "new" ? (
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
              </div>
            ) : (
              /* ── Files tab ─────────────────────────────────────────────── */
              <div className="space-y-4 pb-1">
                {loadingFiles ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                  </div>
                ) : files.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <FolderOpen className="h-10 w-10 text-muted-foreground/40 mb-3" />
                    <p className="text-sm text-muted-foreground">
                      {t.share.noFiles}
                    </p>
                  </div>
                ) : (
                  Object.entries(filesByType).map(([type, typeFiles]) => (
                    <div key={type} className="space-y-2">
                      <h3 className="text-xs font-semibold text-muted-foreground tracking-wide px-1">
                        {fileTypeLabels[type] ?? type}
                      </h3>
                      <div className="space-y-1.5">
                        {typeFiles.map((file) => {
                          const IconComp = getFileTypeIcon(file.type);
                          const isToggling = togglingFileId === file.id;
                          return (
                            <div
                              key={file.id}
                              className="flex items-center gap-3 rounded-[12px] border border-border/40 bg-card/50 px-3 py-2.5 transition-colors hover:bg-card"
                            >
                              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[8px] bg-muted/70">
                                <IconComp className="h-4 w-4 text-muted-foreground" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium truncate">
                                  {file.name}
                                </p>
                                {file.size && (
                                  <p className="text-[11px] text-muted-foreground">
                                    {formatFileSize(file.size)}
                                  </p>
                                )}
                              </div>
                              <div className="flex items-center gap-2 shrink-0">
                                <span
                                  className={`text-[11px] font-medium ${
                                    file.isShared
                                      ? "text-emerald-600 dark:text-emerald-400"
                                      : "text-muted-foreground"
                                  }`}
                                >
                                  {file.isShared
                                    ? t.share.fileShared
                                    : t.share.fileNotShared}
                                </span>
                                {isToggling ? (
                                  <div className="h-5 w-9 flex items-center justify-center">
                                    <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground" />
                                  </div>
                                ) : (
                                  <Switch
                                    checked={file.isShared}
                                    onCheckedChange={() =>
                                      handleToggleFileSharing(file.id)
                                    }
                                  />
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>

          {/* ── Active links section (always visible below tabs) ──────── */}
          {!loadingLinks && links.length > 0 && (
            <div className="border-t border-border/40 pt-4 mt-4 space-y-3">
              <h3 className="text-xs font-semibold text-muted-foreground tracking-wide">
                {t.share.activeLinks} ({activeLinks.length})
              </h3>

              {activeLinks.length === 0 && inactiveLinks.length > 0 && (
                <p className="text-xs text-muted-foreground py-1">
                  {t.share.noLinks}
                </p>
              )}

              <div className="space-y-2 max-h-[180px] overflow-y-auto">
                {/* Active links */}
                {activeLinks.map((link) => {
                  const isExpired =
                    link.expiresAt && new Date() > new Date(link.expiresAt);
                  const isCopied = copiedId === link.id;
                  const isRegenerating = regeneratingId === link.id;

                  return (
                    <div
                      key={link.id}
                      className="rounded-[12px] border border-border/40 bg-card/50 px-3 py-2.5 space-y-2"
                    >
                      <div className="flex items-center gap-2">
                        <ExternalLink className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p
                            className="text-xs text-muted-foreground truncate font-mono"
                            dir="ltr"
                          >
                            /share/{link.token.slice(0, 12)}...
                          </p>
                        </div>
                        {link.passwordHash && (
                          <Lock className="h-3 w-3 text-muted-foreground shrink-0" />
                        )}
                        <span
                          className={`text-[10px] font-medium px-1.5 py-0.5 rounded-md shrink-0 ${
                            isExpired
                              ? "bg-red-500/10 text-red-600 dark:text-red-400"
                              : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                          }`}
                        >
                          {isExpired
                            ? t.share.expired
                            : link.expiresAt
                              ? new Date(link.expiresAt).toLocaleDateString()
                              : t.share.noExpiry}
                        </span>
                      </div>

                      <div className="flex items-center gap-1 justify-end">
                        <p className="text-[10px] text-muted-foreground flex-1">
                          {new Date(link.createdAt).toLocaleDateString()}
                        </p>
                        <button
                          onClick={() => handleCopyLink(link)}
                          className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                          title={t.share.copyLink}
                        >
                          {isCopied ? (
                            <Check className="h-3.5 w-3.5 text-emerald-500" />
                          ) : (
                            <Copy className="h-3.5 w-3.5" />
                          )}
                        </button>
                        <button
                          onClick={() => handleRegenerate(link.id)}
                          disabled={isRegenerating}
                          className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors disabled:opacity-50"
                          title={t.share.regenerateToken}
                        >
                          <RefreshCw
                            className={`h-3.5 w-3.5 ${
                              isRegenerating ? "animate-spin" : ""
                            }`}
                          />
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
                    </div>
                  );
                })}

                {/* Inactive links */}
                {inactiveLinks.map((link) => (
                  <div
                    key={link.id}
                    className="flex items-center gap-2 rounded-[12px] border border-border/40 bg-muted/20 px-3 py-2 opacity-50"
                  >
                    <ExternalLink className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p
                        className="text-xs text-muted-foreground line-through truncate font-mono"
                        dir="ltr"
                      >
                        /share/{link.token.slice(0, 12)}...
                      </p>
                    </div>
                    <span className="text-[10px] text-muted-foreground shrink-0">
                      {t.share.linkDisabled}
                    </span>
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
            </div>
          )}

          {/* No links empty state */}
          {!loadingLinks && links.length === 0 && (
            <div className="border-t border-border/40 pt-4 mt-4">
              <p className="text-xs text-muted-foreground text-center py-2">
                {t.share.noLinks} &middot; {t.share.createFirst}
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
