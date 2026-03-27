"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  Lock,
  Eye,
  EyeOff,
  CheckCircle2,
  Circle,
  CalendarDays,
  User,
  Clock,
  Image as ImageIcon,
  FileText,
  Video,
  Link2,
  Package,
  Download,
  ExternalLink,
  MessageSquare,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { validateSharePassword } from "@/lib/actions/share-actions";

// ── Types ──────────────────────────────────────────────────────────────────────

interface ShareFile {
  id: string;
  name: string;
  url: string;
  size?: number | null;
}

interface ShareLink {
  id: string;
  name: string;
  url: string;
}

interface ShareData {
  projectTitle: string;
  projectDescription?: string | null;
  projectPhase?: string;
  projectDeadline?: string | Date | null;
  clientName?: string | null;
  tasks?: { id: string; title: string; completed: boolean }[];
  note?: string | null;
  sharedByName?: string | null;
  allowDownload: boolean;
  createdAt: string | Date;
  isPasswordProtected?: boolean;
  files?: {
    image?: ShareFile[];
    video?: ShareFile[];
    document?: ShareFile[];
    link?: ShareLink[];
    deliverable?: ShareFile[];
  };
}

interface SharePageClientProps {
  token: string;
  data: ShareData;
}

// ── Constants ──────────────────────────────────────────────────────────────────

const phaseLabels: Record<string, string> = {
  pre_production: "קדם הפקה",
  production: "הפקה",
  post_production: "פוסט פרודקשן",
  delivered: "נמסר",
  coordination: "תיאום",
  shoot_day: "יום צילום",
  shoot_days: "ימי צילום",
  selection: "ברירה",
  editing: "עריכה",
  gallery_delivery: "מסירת גלריה",
  brief: "בריף",
  planning: "תכנון",
  recording: "הקלטה",
  writing: "כתיבה",
  graphics: "גרפיקה",
  waiting_approval: "ממתין לאישור",
  published: "פורסם",
  materials_received: "חומרים התקבלו",
  first_cut: "גרסה ראשונה",
  draft: "טיוטה",
  revisions: "תיקונים",
};

// ── Helpers ────────────────────────────────────────────────────────────────────

function formatFileSize(bytes: number | null | undefined): string {
  if (!bytes) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDateHebrew(date: string | Date | null | undefined): string {
  if (!date) return "";
  return new Date(date).toLocaleDateString("he-IL", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

// ── Planify Logo ───────────────────────────────────────────────────────────────

function PlanifyLogo({ size = 36 }: { size?: number }) {
  return (
    <svg
      viewBox="0 0 36 36"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
    >
      <rect
        x="3"
        y="3"
        width="30"
        height="30"
        rx="9"
        fill="#0a0a0a"
        className="dark:fill-white"
      />
      <rect
        x="9"
        y="8"
        width="18"
        height="12"
        rx="5"
        fill="white"
        className="dark:fill-[#0a0a0a]"
      />
      <ellipse
        cx="24"
        cy="25"
        rx="5"
        ry="6.5"
        fill="#2563eb"
        transform="rotate(-15 24 25)"
      />
    </svg>
  );
}

// ── Password Gate ──────────────────────────────────────────────────────────────

function PasswordGate({
  token,
  onSuccess,
}: {
  token: string;
  onSuccess: () => void;
}) {
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!password.trim()) return;

    setLoading(true);
    setError(false);

    try {
      const valid = await validateSharePassword(token, password);
      if (valid) {
        onSuccess();
      } else {
        setError(true);
      }
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      dir="rtl"
      className="min-h-screen bg-background flex flex-col items-center justify-center px-4"
    >
      <div className="w-full max-w-sm space-y-8">
        {/* Logo */}
        <div className="flex flex-col items-center gap-3">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-foreground shadow-lg">
            <PlanifyLogo size={32} />
          </div>
          <span className="text-lg font-bold text-foreground">Planify</span>
        </div>

        {/* Card */}
        <div className="rounded-2xl border border-border bg-card p-6 sm:p-8 shadow-sm space-y-6">
          <div className="flex flex-col items-center gap-3 text-center">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-muted">
              <Lock className="h-5 w-5 text-muted-foreground" />
            </div>
            <div className="space-y-1">
              <h1 className="text-lg font-semibold text-foreground">
                תוכן מוגן בסיסמה
              </h1>
              <p className="text-sm text-muted-foreground">
                הזינו את הסיסמה שקיבלתם כדי לצפות בפרויקט
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label
                htmlFor="share-password"
                className="text-sm font-medium text-foreground"
              >
                סיסמה
              </label>
              <div className="relative">
                <input
                  id="share-password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setError(false);
                  }}
                  placeholder="הזינו סיסמה..."
                  className="w-full rounded-xl border border-border bg-background px-4 py-3 pe-11 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all"
                  autoFocus
                  dir="ltr"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 rounded-lg bg-destructive/10 px-3 py-2.5 text-sm text-destructive">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>סיסמה שגויה, נסו שנית</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !password.trim()}
              className="w-full rounded-xl bg-primary px-4 py-3 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>בודק...</span>
                </>
              ) : (
                <span>כניסה</span>
              )}
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-muted-foreground">
          הקישור שותף באמצעות{" "}
          <span className="font-medium text-foreground">Planify</span>
        </p>
      </div>
    </div>
  );
}

// ── File Section Components ────────────────────────────────────────────────────

function ImageGrid({
  images,
  allowDownload,
}: {
  images: ShareFile[];
  allowDownload: boolean;
}) {
  if (!images.length) return null;

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
        <ImageIcon className="h-4 w-4 text-muted-foreground" />
        תמונות
        <span className="text-xs font-normal text-muted-foreground">
          ({images.length})
        </span>
      </h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {images.map((img) => (
          <div
            key={img.id}
            className="group relative aspect-square rounded-xl overflow-hidden border border-border bg-muted"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={img.url}
              alt={img.name}
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
            <div className="absolute bottom-0 inset-x-0 p-2 flex items-end justify-between opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              <span className="text-xs text-white truncate max-w-[60%]">
                {img.name}
              </span>
              <div className="flex gap-1">
                <a
                  href={img.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-white/20 backdrop-blur-sm text-white hover:bg-white/30 transition-colors"
                  title="צפייה"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
                {allowDownload && (
                  <a
                    href={img.url}
                    download={img.name}
                    className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-white/20 backdrop-blur-sm text-white hover:bg-white/30 transition-colors"
                    title="הורדה"
                  >
                    <Download className="h-3.5 w-3.5" />
                  </a>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function FileCards({
  files,
  icon: Icon,
  title,
  allowDownload,
}: {
  files: ShareFile[];
  icon: React.ElementType;
  title: string;
  allowDownload: boolean;
}) {
  if (!files.length) return null;

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
        <Icon className="h-4 w-4 text-muted-foreground" />
        {title}
        <span className="text-xs font-normal text-muted-foreground">
          ({files.length})
        </span>
      </h3>
      <div className="space-y-2">
        {files.map((file) => (
          <div
            key={file.id}
            className="flex items-center gap-3 rounded-xl border border-border bg-card px-4 py-3 hover:bg-accent/50 transition-colors"
          >
            <div className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-muted">
              <Icon className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">
                {file.name}
              </p>
              {file.size ? (
                <p className="text-xs text-muted-foreground">
                  {formatFileSize(file.size)}
                </p>
              ) : null}
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              <a
                href={file.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                title="צפייה"
              >
                <ExternalLink className="h-4 w-4" />
              </a>
              {allowDownload && (
                <a
                  href={file.url}
                  download={file.name}
                  className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                  title="הורדה"
                >
                  <Download className="h-4 w-4" />
                </a>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function LinkCards({ links }: { links: ShareLink[] }) {
  if (!links.length) return null;

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
        <Link2 className="h-4 w-4 text-muted-foreground" />
        קישורים
        <span className="text-xs font-normal text-muted-foreground">
          ({links.length})
        </span>
      </h3>
      <div className="space-y-2">
        {links.map((link) => (
          <a
            key={link.id}
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 rounded-xl border border-border bg-card px-4 py-3 hover:bg-accent/50 hover:border-primary/30 transition-colors group"
          >
            <div className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-50 dark:bg-blue-900/30">
              <Link2 className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">
                {link.name}
              </p>
              <p className="text-xs text-muted-foreground truncate" dir="ltr">
                {link.url}
              </p>
            </div>
            <ExternalLink className="h-4 w-4 shrink-0 text-muted-foreground group-hover:text-primary transition-colors" />
          </a>
        ))}
      </div>
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────────

export default function SharePageClient({ token, data }: SharePageClientProps) {
  const [authenticated, setAuthenticated] = useState(
    !data.isPasswordProtected
  );

  // Password gate
  if (!authenticated) {
    return <PasswordGate token={token} onSuccess={() => setAuthenticated(true)} />;
  }

  return <ShareContent data={data} />;
}

// ── Share Content ──────────────────────────────────────────────────────────────

function ShareContent({ data }: { data: ShareData }) {
  const tasks = data.tasks ?? [];
  const completedTasks = tasks.filter((t) => t.completed).length;
  const totalTasks = tasks.length;
  const progressPercent = useMemo(
    () => (totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0),
    [completedTasks, totalTasks]
  );

  const files = data.files;
  const images = files?.image ?? [];
  const videos = files?.video ?? [];
  const documents = files?.document ?? [];
  const links = files?.link ?? [];
  const deliverables = files?.deliverable ?? [];
  const hasFiles =
    images.length > 0 ||
    videos.length > 0 ||
    documents.length > 0 ||
    links.length > 0 ||
    deliverables.length > 0;

  return (
    <div dir="rtl" className="min-h-screen bg-background flex flex-col">
      {/* ── Header ──────────────────────────────────────────────────────── */}
      <header className="border-b border-border bg-background/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-4 flex items-center gap-3">
          <div className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-foreground shadow-sm">
            <PlanifyLogo size={24} />
          </div>
          <span className="text-lg font-bold text-foreground">Planify</span>
        </div>
      </header>

      {/* ── Content ─────────────────────────────────────────────────────── */}
      <main className="flex-1 max-w-3xl w-full mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-8">
        {/* Project Title & Meta */}
        <div className="space-y-4">
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground leading-tight">
            {data.projectTitle}
          </h1>

          <div className="flex flex-wrap items-center gap-3">
            {/* Phase Badge */}
            {data.projectPhase && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3.5 py-1.5 text-xs font-semibold text-primary">
                {phaseLabels[data.projectPhase] ?? data.projectPhase}
              </span>
            )}

            {/* Client Name */}
            {data.clientName && (
              <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                <User className="h-3.5 w-3.5" />
                <span>{data.clientName}</span>
              </div>
            )}
          </div>
        </div>

        {/* Deadline */}
        {data.projectDeadline && (
          <div className="flex items-center gap-2.5 rounded-xl border border-border bg-card px-4 py-3 text-sm text-foreground">
            <CalendarDays className="h-4 w-4 text-muted-foreground shrink-0" />
            <span>
              <span className="text-muted-foreground">דדליין: </span>
              <span className="font-medium">
                {formatDateHebrew(data.projectDeadline)}
              </span>
            </span>
          </div>
        )}

        {/* Description */}
        {data.projectDescription && (
          <div className="rounded-2xl border border-border bg-card p-5 sm:p-6">
            <h2 className="text-sm font-semibold text-foreground mb-3">
              תיאור הפרויקט
            </h2>
            <p className="text-sm text-muted-foreground whitespace-pre-line leading-relaxed">
              {data.projectDescription}
            </p>
          </div>
        )}

        {/* Note from Sharer */}
        {data.note && (
          <div className="rounded-2xl border border-amber-200 dark:border-amber-800/40 bg-amber-50 dark:bg-amber-950/30 p-5 sm:p-6">
            <div className="flex items-start gap-3">
              <div className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-amber-100 dark:bg-amber-900/50 mt-0.5">
                <MessageSquare className="h-4 w-4 text-amber-600 dark:text-amber-400" />
              </div>
              <div className="flex-1 min-w-0 space-y-1">
                <p className="text-sm font-medium text-amber-900 dark:text-amber-200">
                  {data.sharedByName
                    ? `הערה מ${data.sharedByName}`
                    : "הערה"}
                </p>
                <p className="text-sm text-amber-800 dark:text-amber-300/80 whitespace-pre-line leading-relaxed">
                  {data.note}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Task Progress */}
        {totalTasks > 0 && (
          <div className="rounded-2xl border border-border bg-card p-5 sm:p-6 space-y-5">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                התקדמות משימות
              </h2>
              <span className="text-xs font-medium text-muted-foreground tabular-nums">
                {completedTasks}/{totalTasks} ({progressPercent}%)
              </span>
            </div>

            {/* Progress Bar */}
            <div className="h-2.5 rounded-full bg-muted overflow-hidden">
              <div
                className="h-full rounded-full bg-emerald-500 transition-all duration-700 ease-out"
                style={{ width: `${progressPercent}%` }}
              />
            </div>

            {/* Task List */}
            <div className="space-y-1.5">
              {tasks.map((task) => (
                <div
                  key={task.id}
                  className="flex items-center gap-3 rounded-xl px-3 py-2.5 hover:bg-accent/50 transition-colors"
                >
                  {task.completed ? (
                    <CheckCircle2 className="h-4.5 w-4.5 text-emerald-500 shrink-0" />
                  ) : (
                    <Circle className="h-4.5 w-4.5 text-muted-foreground/40 shrink-0" />
                  )}
                  <span
                    className={`text-sm ${
                      task.completed
                        ? "line-through text-muted-foreground/60"
                        : "text-foreground"
                    }`}
                  >
                    {task.title}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Files Section */}
        {hasFiles && (
          <div className="rounded-2xl border border-border bg-card p-5 sm:p-6 space-y-6">
            <h2 className="text-sm font-semibold text-foreground">קבצים</h2>

            {images.length > 0 && (
              <ImageGrid images={images} allowDownload={data.allowDownload} />
            )}

            {videos.length > 0 && (
              <FileCards
                files={videos}
                icon={Video}
                title="סרטונים"
                allowDownload={data.allowDownload}
              />
            )}

            {documents.length > 0 && (
              <FileCards
                files={documents}
                icon={FileText}
                title="מסמכים"
                allowDownload={data.allowDownload}
              />
            )}

            {deliverables.length > 0 && (
              <FileCards
                files={deliverables}
                icon={Package}
                title="תוצרים"
                allowDownload={data.allowDownload}
              />
            )}

            {links.length > 0 && <LinkCards links={links} />}
          </div>
        )}

        {/* Shared By */}
        {data.sharedByName && (
          <p className="text-xs text-muted-foreground">
            שותף על ידי{" "}
            <span className="font-medium text-foreground/80">
              {data.sharedByName}
            </span>{" "}
            &middot; {formatDateHebrew(data.createdAt)}
          </p>
        )}
      </main>

      {/* ── Footer ──────────────────────────────────────────────────────── */}
      <footer className="border-t border-border mt-auto">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10 flex flex-col items-center gap-4 text-center">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>מופעל באמצעות</span>
            <span className="font-bold text-foreground">Planify</span>
          </div>
          <p className="text-xs text-muted-foreground max-w-xs leading-relaxed">
            כלי הניהול החכם לצלמים, מפיקים ויוצרי תוכן.
          </p>
          <Link
            href="/landing"
            className="inline-flex items-center justify-center rounded-full bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors shadow-sm"
          >
            נסו את Planify בחינם
          </Link>
        </div>
      </footer>
    </div>
  );
}
