"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Plus, Pencil, Trash2, Users, UserPlus } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.05, delayChildren: 0.02 },
  },
};

const fadeUp = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] as const } },
};


export function ClientsPageClient({ clients, planLimit }: { clients: ClientData[]; planLimit: number }) {
  const he = useT();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<ClientData | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null);
  const [upgradeOpen, setUpgradeOpen] = useState(false);

  const activeClients = clients.filter((c) => c.isActive);
  const inactiveClients = clients.filter((c) => !c.isActive);

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

  const statCards = [
    { label: he.common.activeClients, value: activeClients.length, icon: Users, color: "from-gray-700 to-gray-900" },
    { label: he.common.totalClients, value: clients.length, icon: UserPlus, color: "from-violet-400 to-purple-500" },
  ];

  function renderList(filtered: ClientData[]) {
    if (filtered.length === 0) {
      return (
        <div className="text-center py-12 rounded-[14px] border border-dashed border-border/40 p-10">
          <p className="text-[12.5px] font-semibold text-foreground/40">{he.common.noResults}</p>
        </div>
      );
    }
    return (
      <div className="space-y-2">
        {filtered.map((client) => (
          <div
            key={client.id}
            className="flex items-center gap-3 rounded-xl border border-border/40 bg-card px-4 py-3 group hover:bg-foreground/[0.02] transition-colors cursor-pointer"
            onClick={() => handleEdit(client)}
          >
            {/* Avatar circle */}
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-bold text-muted-foreground">
              {client.name.charAt(0)}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className={`text-sm font-medium ${!client.isActive && client.type === "client" ? "text-muted-foreground" : "text-foreground"}`}>
                  {client.name}
                </span>
                <Badge className={`border-0 text-[10px] ${client.isActive ? "bg-cyan-50 text-cyan-700 dark:bg-cyan-950 dark:text-cyan-300" : "bg-muted text-muted-foreground"}`}>
                  {client.isActive ? he.common.active : he.common.inactive}
                </Badge>
                {client.isRetainer && (
                  <Badge className="border-0 text-[10px] bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                    ריטיינר
                  </Badge>
                )}
              </div>
              {(client.phone || client.email) && (
                <p className="text-xs text-muted-foreground mt-0.5 truncate">
                  {client.phone && <span dir="ltr">{client.phone}</span>}
                  {client.phone && client.email && " · "}
                  {client.email}
                </p>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 hover:bg-muted hover:text-foreground"
                onClick={(e) => { e.stopPropagation(); handleEdit(client); }}
              >
                <Pencil className="h-3.5 w-3.5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-950"
                onClick={(e) => { e.stopPropagation(); setDeleteTarget({ id: client.id, name: client.name }); }}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <motion.div
      variants={stagger}
      initial="hidden"
      animate="show"
      className="space-y-6"
    >
      <motion.div variants={fadeUp} className="flex items-center justify-between">
        <h1 className="text-[22px] font-extrabold tracking-[-0.03em] text-foreground">
          {he.client.title}
        </h1>
        <Button
          size="sm"
          onClick={handleCreate}
          className="bg-foreground text-background hover:bg-foreground/90 shadow-sm transition-all duration-200 border-0"
        >
          <Plus className="h-4 w-4 me-2" />
          {he.client.newClient}
        </Button>
      </motion.div>

      <motion.div variants={fadeUp} className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {statCards.map((stat) => (
          <Card key={stat.label} className="glass-card group border-border/40 transition-all duration-300 hover:border-border/60 hover:shadow-[0_4px_16px_-4px_rgba(0,0,0,0.08)] cursor-default">
            <CardContent className="p-4 flex items-center gap-4">
              <div className={`rounded-xl bg-gradient-to-br ${stat.color} p-2.5 shadow-sm`}>
                <stat.icon className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
                <p className="text-2xl font-bold tracking-tight">{stat.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </motion.div>

      <motion.div variants={fadeUp}>
        <Tabs defaultValue="all" dir="rtl">
          <TabsList className="bg-muted border border-border">
            <TabsTrigger value="all" className="data-[state=active]:bg-foreground data-[state=active]:text-background transition-all duration-200">
              {he.common.all} ({clients.length})
            </TabsTrigger>
            <TabsTrigger value="active" className="data-[state=active]:bg-foreground data-[state=active]:text-background transition-all duration-200">
              {he.common.active} ({activeClients.length})
            </TabsTrigger>
            <TabsTrigger value="inactive" className="data-[state=active]:bg-foreground data-[state=active]:text-background transition-all duration-200">
              {he.common.inactive} ({inactiveClients.length})
            </TabsTrigger>
          </TabsList>
          <TabsContent value="all">{renderList(clients)}</TabsContent>
          <TabsContent value="active">{renderList(activeClients)}</TabsContent>
          <TabsContent value="inactive">{renderList(inactiveClients)}</TabsContent>
        </Tabs>
      </motion.div>

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
          onOpenChange={(open) => {
            if (!open) setDeleteTarget(null);
          }}
        />
      )}
    </motion.div>
  );
}
