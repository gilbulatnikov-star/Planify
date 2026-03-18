"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Link2,
  Plus,
  X,
  ExternalLink,
  Globe,
  Youtube,
  Music,
  Camera,
  Mail,
  FileText,
  Calendar,
  Folder,
  Settings,
  Star,
  Heart,
  Bookmark,
  type LucideIcon,
} from "lucide-react";
import { he } from "@/lib/he";
import {
  createQuickLink,
  deleteQuickLink,
} from "@/lib/actions/widget-actions";

interface QuickLinkItem {
  id: string;
  name: string;
  url: string;
  icon: string;
}

interface QuickLinksWidgetProps {
  initialLinks: QuickLinkItem[];
}

const iconMap: Record<string, LucideIcon> = {
  link: ExternalLink,
  globe: Globe,
  youtube: Youtube,
  music: Music,
  camera: Camera,
  mail: Mail,
  file: FileText,
  calendar: Calendar,
  folder: Folder,
  settings: Settings,
  star: Star,
  heart: Heart,
  bookmark: Bookmark,
};

function getIcon(iconName: string): LucideIcon {
  return iconMap[iconName] || ExternalLink;
}

export function QuickLinksWidget({ initialLinks }: QuickLinksWidgetProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [showForm, setShowForm] = useState(false);
  const [newName, setNewName] = useState("");
  const [newUrl, setNewUrl] = useState("");
  const [newIcon, setNewIcon] = useState("link");

  function handleAddLink() {
    if (!newName.trim() || !newUrl.trim()) return;

    const formData = new FormData();
    formData.set("name", newName.trim());
    formData.set("url", newUrl.trim());
    formData.set("icon", newIcon);

    setNewName("");
    setNewUrl("");
    setNewIcon("link");
    setShowForm(false);

    startTransition(async () => {
      await createQuickLink(formData);
      router.refresh();
    });
  }

  function handleDeleteLink(id: string) {
    startTransition(async () => {
      await deleteQuickLink(id);
      router.refresh();
    });
  }

  return (
    <Card className="glass-card">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {he.widgets.quickLinks}
        </CardTitle>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowForm(!showForm)}
            className="rounded-md p-1 text-muted-foreground transition-colors hover:text-gray-900 hover:bg-gray-100"
          >
            <Plus className="h-4 w-4" />
          </button>
          <div className="rounded-lg bg-gray-100 p-1.5">
            <Link2 className="h-4 w-4 text-gray-900" />
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {showForm && (
          <div className="space-y-2 rounded-lg border border-gray-100 bg-gray-50/50 p-3">
            <Input
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="שם הקישור"
              className="bg-transparent"
            />
            <Input
              value={newUrl}
              onChange={(e) => setNewUrl(e.target.value)}
              placeholder="https://..."
              className="bg-transparent"
              dir="ltr"
            />
            <div className="flex items-center gap-2">
              <select
                value={newIcon}
                onChange={(e) => setNewIcon(e.target.value)}
                className="h-8 flex-1 rounded-lg border border-input bg-transparent px-2 text-sm text-foreground outline-none"
              >
                {Object.keys(iconMap).map((key) => (
                  <option key={key} value={key}>
                    {key}
                  </option>
                ))}
              </select>
              <Button
                size="sm"
                onClick={handleAddLink}
                disabled={isPending || !newName.trim() || !newUrl.trim()}
              >
                {he.common.add}
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setShowForm(false)}
              >
                {he.common.cancel}
              </Button>
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 gap-2">
          {initialLinks.map((link) => {
            const Icon = getIcon(link.icon);
            return (
              <a
                key={link.id}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group/link relative flex items-center gap-2 rounded-lg border border-gray-100 bg-gray-50/50 px-3 py-2.5 text-sm transition-all hover:border-gray-300 hover:bg-gray-50"
              >
                <Icon className="h-4 w-4 shrink-0 text-gray-900" />
                <span className="truncate text-foreground">{link.name}</span>
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleDeleteLink(link.id);
                  }}
                  disabled={isPending}
                  className="absolute top-1 left-1 opacity-0 group-hover/link:opacity-100 transition-opacity rounded-full p-0.5 text-muted-foreground hover:text-red-600 hover:bg-red-50"
                >
                  <X className="h-3 w-3" />
                </button>
              </a>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
