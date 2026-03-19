"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Plus, Pencil, Trash2, Users, UserPlus } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ClientDialog } from "./client-dialog";
import { DeleteClientDialog } from "./delete-client-dialog";
import { UpgradeDialog } from "@/app/components/shared/upgrade-dialog";
import { he } from "@/lib/he";

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

// Lead pipeline steps in order
const PIPELINE_STEPS = [
  { key: "new",           label: "חדש" },
  { key: "contacted",     label: "נוצר קשר" },
  { key: "qualified",     label: "מתאים" },
  { key: "proposal_sent", label: "הצעה נשלחה" },
  { key: "won",           label: "נסגר" },
  { key: "lost",          label: "אבוד" },
];

function LeadStatusPipeline({ status }: { status: string }) {
  if (status === "lost") {
    return (
      <span className="inline-flex items-center rounded-full bg-red-50 px-2.5 py-1 text-xs font-medium text-red-600">
        אבוד
      </span>
    );
  }
  if (status === "won") {
    return (
      <span className="inline-flex items-center rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700">
        ✓ נסגר
      </span>
    );
  }

  const steps = PIPELINE_STEPS.filter((s) => s.key !== "won" && s.key !== "lost");
  const currentIdx = steps.findIndex((s) => s.key === status);
  const currentLabel = steps[currentIdx]?.label ?? status;

  return (
    <div className="flex flex-col gap-1">
      <span className="text-xs font-medium text-gray-700">{currentLabel}</span>
      <div className="flex gap-0.5">
        {steps.map((s, i) => (
          <div
            key={s.key}
            className={`h-1 w-5 rounded-full transition-colors ${
              i <= currentIdx ? "bg-indigo-500" : "bg-gray-200"
            }`}
          />
        ))}
      </div>
    </div>
  );
}

export function ClientsPageClient({ clients, planLimit }: { clients: ClientData[]; planLimit: number }) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<ClientData | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null);
  const [upgradeOpen, setUpgradeOpen] = useState(false);

  const allClients = clients.filter((c) => c.type === "client");
  const allLeads = clients.filter((c) => c.type === "lead");

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
    { label: "לקוחות פעילים", value: allClients.filter(c => c.isActive).length, icon: Users, color: "from-gray-700 to-gray-900" },
    { label: "לידים",          value: allLeads.length, icon: UserPlus, color: "from-violet-400 to-purple-500" },
  ];

  function renderTable(filtered: ClientData[]) {
    return (
      <Card className="glass-card overflow-hidden">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-gray-100 hover:bg-transparent">
                  <TableHead className="text-muted-foreground">{he.client.name}</TableHead>
                  <TableHead className="hidden sm:table-cell text-muted-foreground">{he.client.email}</TableHead>
                  <TableHead className="hidden sm:table-cell text-muted-foreground">{he.client.phone}</TableHead>
                  <TableHead className="text-muted-foreground">סטטוס</TableHead>
                  <TableHead className="hidden sm:table-cell text-muted-foreground">פרויקטים</TableHead>
                  <TableHead className="w-[80px] text-muted-foreground">פעולות</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((client) => (
                  <TableRow
                    key={client.id}
                    className="border-gray-100 transition-all duration-200 hover:bg-gray-50"
                  >
                    {/* Name */}
                    <TableCell>
                      <div className="flex flex-col gap-0.5">
                        <span className={`font-medium ${!client.isActive && client.type === "client" ? "text-muted-foreground" : ""}`}>
                          {client.name}
                        </span>
                        {client.type === "client" && (
                          <div className="flex gap-1">
                            {!client.isActive && (
                              <span className="text-[10px] text-gray-400">לא פעיל</span>
                            )}
                            {client.isRetainer && (
                              <span className="inline-flex items-center rounded-full bg-emerald-50 px-1.5 py-0.5 text-[10px] text-emerald-700 font-medium">
                                ריטיינר
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </TableCell>

                    {/* Email */}
                    <TableCell className="hidden sm:table-cell text-muted-foreground text-sm">
                      {client.email ?? "—"}
                    </TableCell>

                    {/* Phone */}
                    <TableCell dir="ltr" className="hidden sm:table-cell text-left text-muted-foreground">
                      {client.phone ?? "—"}
                    </TableCell>

                    {/* Status */}
                    <TableCell>
                      {client.type === "client" ? (
                        <Badge className={`border-0 text-xs ${client.isActive ? "bg-cyan-50 text-cyan-700" : "bg-gray-100 text-gray-500"}`}>
                          {client.isActive ? "לקוח פעיל" : "לא פעיל"}
                        </Badge>
                      ) : (
                        <LeadStatusPipeline status={client.leadStatus} />
                      )}
                    </TableCell>

                    {/* Projects count */}
                    <TableCell className="hidden sm:table-cell">
                      <span className="text-sm text-muted-foreground">{client.projects.length}</span>
                    </TableCell>

                    {/* Actions - always visible */}
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 hover:bg-gray-100 hover:text-gray-900 transition-colors duration-200"
                          onClick={() => handleEdit(client)}
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 hover:bg-red-50 text-destructive transition-colors duration-200"
                          onClick={() => setDeleteTarget({ id: client.id, name: client.name })}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {filtered.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground py-12">
                      {he.common.noResults}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
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
        <h1 className="text-2xl font-bold text-gray-900">
          {he.client.title}
        </h1>
        <Button
          size="sm"
          onClick={handleCreate}
          className="bg-gray-900 text-white hover:bg-gray-800 shadow-sm transition-all duration-200 border-0"
        >
          <Plus className="h-4 w-4 me-2" />
          {he.client.newClient}
        </Button>
      </motion.div>

      <motion.div variants={fadeUp} className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {statCards.map((stat) => (
          <Card key={stat.label} className="glass-card group transition-all duration-300 hover:scale-[1.02] cursor-default">
            <CardContent className="p-4 flex items-center gap-4">
              <div className={`rounded-xl bg-gradient-to-br ${stat.color} p-2.5 shadow-lg transition-transform duration-300 group-hover:scale-110`}>
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
          <TabsList className="bg-gray-50 border border-gray-100">
            <TabsTrigger value="all" className="data-[state=active]:bg-gray-900 data-[state=active]:text-white transition-all duration-200">
              הכל ({clients.length})
            </TabsTrigger>
            <TabsTrigger value="clients" className="data-[state=active]:bg-gray-900 data-[state=active]:text-white transition-all duration-200">
              לקוחות ({allClients.length})
            </TabsTrigger>
            <TabsTrigger value="leads" className="data-[state=active]:bg-gray-900 data-[state=active]:text-white transition-all duration-200">
              לידים ({allLeads.length})
            </TabsTrigger>
          </TabsList>
          <TabsContent value="all">{renderTable(clients)}</TabsContent>
          <TabsContent value="clients">{renderTable(allClients)}</TabsContent>
          <TabsContent value="leads">{renderTable(allLeads)}</TabsContent>
        </Tabs>
      </motion.div>

      <UpgradeDialog
        open={upgradeOpen}
        onClose={() => setUpgradeOpen(false)}
        feature="לקוחות"
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
