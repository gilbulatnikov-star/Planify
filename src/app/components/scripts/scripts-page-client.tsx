"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { UpgradeDialog } from "@/app/components/shared/upgrade-dialog";
import {
  FileText,
  Plus,
  Trash2,
  Clock,
  Youtube,
  Instagram,
  Podcast,
  Tv,
  Megaphone,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { createScript, deleteScript } from "@/lib/actions/script-actions";
import { formatDate } from "@/lib/utils/format";

const platformIcons: Record<string, React.ReactNode> = {
  youtube: <Youtube className="h-4 w-4 text-red-500" />,
  tiktok: <Tv className="h-4 w-4 text-gray-800" />,
  instagram: <Instagram className="h-4 w-4 text-pink-500" />,
  podcast: <Podcast className="h-4 w-4 text-purple-500" />,
  commercial: <Megaphone className="h-4 w-4 text-blue-500" />,
};

const platformLabels: Record<string, string> = {
  youtube: "YouTube",
  tiktok: "TikTok",
  instagram: "Instagram",
  podcast: "פודקאסט",
  commercial: "פרסומת",
};

type Script = {
  id: string;
  title: string;
  platform: string;
  content: string;
  updatedAt: Date;
  project: { id: string; title: string } | null;
  client: { id: string; name: string } | null;
};

export function ScriptsPageClient({
  scripts,
  planLimit,
}: {
  scripts: Script[];
  clients: { id: string; name: string }[];
  projects: { id: string; title: string }[];
  planLimit: number;
}) {
  const router = useRouter();
  const [creating, setCreating] = useState(false);
  const [upgradeOpen, setUpgradeOpen] = useState(false);

  async function handleCreate() {
    if (planLimit !== -1 && scripts.length >= planLimit) {
      setUpgradeOpen(true);
      return;
    }
    setCreating(true);
    const result = await createScript({});
    if ("quotaExceeded" in result) {
      setUpgradeOpen(true);
      setCreating(false);
      return;
    }
    router.push(`/scripts/${result.id}`);
  }

  async function handleDelete(id: string, e: React.MouseEvent) {
    e.stopPropagation();
    if (confirm("למחוק את התסריט?")) {
      await deleteScript(id);
    }
  }

  return (
    <>
    <UpgradeDialog
      open={upgradeOpen}
      onClose={() => setUpgradeOpen(false)}
      feature="תסריטים"
      limit={planLimit}
    />
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">תסריטים</h1>
        <Button onClick={handleCreate} disabled={creating} className="gap-2">
          <Plus className="h-4 w-4" />
          תסריט חדש
        </Button>
      </div>

      {scripts.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="mb-4 rounded-full bg-gray-100 p-6">
            <FileText className="h-10 w-10 text-gray-400" />
          </div>
          <h2 className="text-lg font-semibold text-gray-700">
            אין תסריטים עדיין
          </h2>
          <p className="mt-1 text-sm text-gray-400">
            צור תסריט חדש כדי להתחיל
          </p>
          <Button
            onClick={handleCreate}
            disabled={creating}
            className="mt-6 gap-2"
          >
            <Plus className="h-4 w-4" />
            צור תסריט ראשון
          </Button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {scripts.map((script) => (
            <div
              key={script.id}
              onClick={() => router.push(`/scripts/${script.id}`)}
              className="glass-card cursor-pointer rounded-xl border border-gray-200 bg-white p-5 transition-all hover:shadow-md hover:border-gray-300"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  {platformIcons[script.platform] ?? (
                    <FileText className="h-4 w-4 text-gray-400" />
                  )}
                  <span className="truncate font-semibold text-gray-900">
                    {script.title}
                  </span>
                </div>
                <button
                  onClick={(e) => handleDelete(script.id, e)}
                  className="shrink-0 rounded p-1 text-gray-400 hover:bg-red-50 hover:text-red-500"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>

              <div className="mt-3 flex flex-wrap gap-2">
                <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs text-gray-500">
                  {platformLabels[script.platform] ?? script.platform}
                </span>
                {script.client && (
                  <span className="rounded-full bg-blue-50 px-2.5 py-0.5 text-xs text-blue-600">
                    {script.client.name}
                  </span>
                )}
                {script.project && (
                  <span className="rounded-full bg-purple-50 px-2.5 py-0.5 text-xs text-purple-600">
                    {script.project.title}
                  </span>
                )}
              </div>

              {script.content && (
                <p className="mt-3 line-clamp-2 text-xs text-gray-400 leading-relaxed">
                  {script.content.replace(/<[^>]+>/g, "").slice(0, 120)}
                </p>
              )}

              <div className="mt-4 flex items-center gap-1 text-xs text-gray-400">
                <Clock className="h-3 w-3" />
                <span>{formatDate(script.updatedAt)}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
    </>
  );
}
