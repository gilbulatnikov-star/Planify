"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Plus,
  Search,
  MoreHorizontal,
  Pencil,
  Trash2,
  Mail,
  Phone,
  Building2,
  FolderOpen,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ClientDialog } from "./client-dialog";
import { DeleteClientDialog } from "./delete-client-dialog";
import { UpgradeDialog } from "@/app/components/shared/upgrade-dialog";
import { useT } from "@/lib/i18n";

type ClientData = {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  company: string | null;
  website: string | null;
  instagram: string | null;
  youtube: string | null;
  linkedin: string | null;
  tiktok: string | null;
  notes: string | null;
  type: string;
  leadSource: string | null;
  leadStatus: string;
  isActive: boolean;
  isRetainer: boolean;
  tags: string[];
  projects: { id: string }[];
  _count: { interactions: number };
};

const stagger = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.04, delayChildren: 0.01 } },
};
const fadeUp = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: { duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] as const } },
};

const AVATAR_COLORS = [
  "bg-violet-100 text-violet-700 dark:bg-violet-950 dark:text-violet-300",
  "bg-cyan-100 text-cyan-700 dark:bg-cyan-950 dark:text-cyan-300",
  "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300",
  "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300",
  "bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300",
  "bg-sky-100 text-sky-700 dark:bg-sky-950 dark:text-sky-300",
];
function avatarColor(name: string) {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) & 0xffff;
  return AVATAR_COLORS[h % AVATAR_COLORS.length];
}

type FilterTab = "all" | "active" | "inactive";

export function ClientsPageClient({ clients, planLimit }: { clients: ClientData[]; planLimit: number }) {
  const he = useT();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<ClientData | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null);
  const [upgradeOpen, setUpgradeOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<FilterTab>("all");

  const searchLower = search.toLowerCase();
  const searched = clients.filter((c) => {
    if (!search) return true;
    return (
      c.name.toLowerCase().includes(searchLower) ||
      (c.email && c.email.toLowerCase().includes(searchLower)) ||
      (c.phone && c.phone.toLowerCase().includes(searchLower)) ||
      (c.company && c.company.toLowerCase().includes(searchLower))
    );
  });

  const filtered =
    filter === "active" ? searched.filter((c) => c.isActive) :
    filter === "inactive" ? searched.filter((c) => !c.isActive) :
    searched;

  const activeCount = searched.filter((c) => c.isActive).length;
  const inactiveCount = searched.filter((c) => !c.isActive).length;

  function handleEdit(client: ClientData) {
    setEditingClient(client);
    setDialogOpen(true);
  }

  function handleCreate() {
    if (planLimit !== -1 && clients.length >= planLimit) {
      setUpgradeOpen(true);
      return;
    }
    setEditingClient(null);
    setDialogOpen(true);
  }

  const tabs: { key: FilterTab; label: string; count: number }[] = [
    { key: "all", label: he.common.all, count: searched.length },
    { key: "active", label: he.common.active, count: activeCount },
    { key: "inactive", label: he.common.inactive, count: inactiveCount },
  ];

  return (
    <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-5">

      {/* ── Header ── */}
      <motion.div variants={fadeUp} className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-[22px] font-extrabold tracking-[-0.03em] text-foreground leading-tight">
            {he.client.title}
          </h1>
          <p className="text-[11.5px] text-foreground/40 mt-0.5">
            {clients.length > 0
              ? `${clients.length} לקוחות · ${clients.filter((c) => c.isActive).length} פעילים`
              : "נהל לקוחות ולידים"}
          </p>
        </div>
        <button
          onClick={handleCreate}
          className="inline-flex items-center gap-1.5 h-9 px-3.5 rounded-lg bg-foreground text-background hover:bg-foreground/90 shadow-sm text-[13px] font-medium transition-all duration-200 shrink-0"
        >
          <Plus className="h-4 w-4" />
          {he.client.newClient}
        </button>
      </motion.div>

      {/* ── Search + Filter row ── */}
      <motion.div variants={fadeUp} className="flex items-center gap-2 flex-wrap" dir="rtl">
        <div className="relative flex-1 min-w-[180px] max-w-sm">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-foreground/30" />
          <input
            placeholder="חיפוש לקוחות..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-border/40 bg-card pr-9 pl-4 py-2 text-[13px] text-foreground placeholder:text-foreground/30 outline-none focus:border-accent/40 focus:ring-1 focus:ring-accent/20 transition-all duration-200"
          />
        </div>

        <div className="flex items-center gap-0.5 bg-muted/70 rounded-xl p-1 border border-border/30">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key)}
              className={`flex items-center gap-1.5 h-7 px-3 rounded-lg text-[12px] font-medium transition-all duration-150 ${
                filter === tab.key
                  ? "bg-foreground text-background shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab.label}
              <span className={`text-[10px] tabular-nums ${filter === tab.key ? "opacity-60" : "opacity-40"}`}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>
      </motion.div>

      {/* ── Client list ── */}
      <motion.div variants={fadeUp}>
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3 rounded-2xl border border-dashed border-border/40">
            <p className="text-sm text-foreground/40">{search ? he.common.noResults : "אין לקוחות עדיין"}</p>
            {!search && (
              <button
                onClick={handleCreate}
                className="flex items-center gap-1.5 text-sm text-accent hover:text-accent/80 underline underline-offset-2 transition-colors"
              >
                <Plus className="h-3.5 w-3.5" />
                {he.client.newClient}
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-2">
            {filtered.map((client) => (
              <ClientCard
                key={client.id}
                client={client}
                he={he}
                onEdit={() => handleEdit(client)}
                onDelete={() => setDeleteTarget({ id: client.id, name: client.name })}
              />
            ))}
          </div>
        )}
      </motion.div>

      {/* ── Dialogs ── */}
      <UpgradeDialog
        open={upgradeOpen}
        onClose={() => setUpgradeOpen(false)}
        feature={he.client.title}
        limit={planLimit}
      />
      <ClientDialog
        client={editingClient}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onQuotaExceeded={() => { setDialogOpen(false); setUpgradeOpen(true); }}
      />
      {deleteTarget && (
        <DeleteClientDialog
          clientId={deleteTarget.id}
          clientName={deleteTarget.name}
          open={!!deleteTarget}
          onOpenChange={(open) => { if (!open) setDeleteTarget(null); }}
        />
      )}
    </motion.div>
  );
}

function ClientCard({
  client,
  he,
  onEdit,
  onDelete,
}: {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  client: ClientData; he: any; onEdit: () => void; onDelete: () => void;
}) {
  const initials = client.name
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div
      className="group relative flex items-center gap-3.5 rounded-2xl border border-border/40 bg-card px-4 py-3.5 hover:border-border/60 hover:shadow-[0_2px_12px_-4px_rgba(0,0,0,0.07)] transition-all duration-200 cursor-pointer"
      onClick={onEdit}
    >
      {/* Avatar */}
      <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-[13px] font-bold ${avatarColor(client.name)}`}>
        {initials}
      </div>

      {/* Main info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[14px] font-semibold text-foreground leading-tight">
            {client.name}
          </span>
          <Badge
            className={`border-0 text-[10px] px-1.5 py-0 leading-5 ${
              client.isActive
                ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300"
                : "bg-muted text-muted-foreground"
            }`}
          >
            {client.isActive ? he.common.active : he.common.inactive}
          </Badge>
          {client.isRetainer && (
            <Badge className="border-0 text-[10px] px-1.5 py-0 leading-5 bg-violet-50 text-violet-700 dark:bg-violet-950 dark:text-violet-300">
              ריטיינר
            </Badge>
          )}
        </div>

        <div className="flex items-center gap-3 mt-1 flex-wrap">
          {client.company && (
            <span className="flex items-center gap-1 text-[11.5px] text-muted-foreground">
              <Building2 className="h-3 w-3 shrink-0 opacity-60" />
              {client.company}
            </span>
          )}
          {client.email && (
            <span className="flex items-center gap-1 text-[11.5px] text-muted-foreground truncate max-w-[180px]">
              <Mail className="h-3 w-3 shrink-0 opacity-60" />
              {client.email}
            </span>
          )}
          {client.phone && (
            <span className="flex items-center gap-1 text-[11.5px] text-muted-foreground" dir="ltr">
              <Phone className="h-3 w-3 shrink-0 opacity-60" />
              {client.phone}
            </span>
          )}
        </div>
      </div>

      {/* Right meta + actions */}
      <div className="flex items-center gap-2 shrink-0">
        {client.projects.length > 0 && (
          <span className="hidden sm:flex items-center gap-1 text-[11px] text-muted-foreground bg-muted/80 rounded-lg px-2 py-1">
            <FolderOpen className="h-3 w-3" />
            {client.projects.length}
          </span>
        )}

        <DropdownMenu>
          <DropdownMenuTrigger
            className="flex h-7 w-7 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors outline-none sm:opacity-0 sm:group-hover:opacity-100 focus:opacity-100"
            onClick={(e) => e.stopPropagation()}
          >
            <MoreHorizontal className="h-4 w-4" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" sideOffset={4} dir="rtl">
            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onEdit(); }}>
              <Pencil className="h-4 w-4" />
              <span>עריכה</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem variant="destructive" onClick={(e) => { e.stopPropagation(); onDelete(); }}>
              <Trash2 className="h-4 w-4" />
              <span>מחיקה</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
