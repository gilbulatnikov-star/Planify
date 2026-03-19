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
    { label: "לקוחות פעילים", value: allClients.length, icon: Users,     color: "from-gray-700 to-gray-900" },
    { label: "לידים",          value: allLeads.length,   icon: UserPlus,  color: "from-violet-400 to-purple-500" },
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
                <TableHead className="hidden md:table-cell text-muted-foreground">{he.client.company}</TableHead>
                <TableHead className="hidden sm:table-cell text-muted-foreground">{he.client.email}</TableHead>
                <TableHead className="hidden sm:table-cell text-muted-foreground">{he.client.phone}</TableHead>
                <TableHead className="hidden md:table-cell text-muted-foreground">{he.client.leadSource}</TableHead>
                <TableHead className="text-muted-foreground">סטטוס</TableHead>
                <TableHead className="hidden sm:table-cell text-muted-foreground">פרויקטים</TableHead>
                <TableHead className="w-[80px] text-muted-foreground">פעולות</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((client) => (
                <TableRow
                  key={client.id}
                  className="border-gray-100 transition-all duration-200 hover:bg-gray-50 group"
                >
                  <TableCell className="font-medium">{client.name}</TableCell>
                  <TableCell className="hidden md:table-cell text-muted-foreground">{client.company ?? "—"}</TableCell>
                  <TableCell className="hidden sm:table-cell text-muted-foreground text-sm">
                    {client.email ?? "—"}
                  </TableCell>
                  <TableCell dir="ltr" className="hidden sm:table-cell text-left text-muted-foreground">
                    {client.phone ?? "—"}
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    {client.leadSource ? (
                      <Badge variant="outline" className="border-gray-200 text-muted-foreground">
                        {he.client.leadSources[
                          client.leadSource as keyof typeof he.client.leadSources
                        ] ?? client.leadSource}
                      </Badge>
                    ) : (
                      "—"
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge
                      className={
                        client.type === "client"
                          ? "bg-cyan-50 text-cyan-700 hover:bg-gray-200 border-0"
                          : "bg-violet-50 text-violet-700 hover:bg-violet-100 border-0"
                      }
                    >
                      {client.type === "client"
                        ? he.client.types.client
                        : he.client.leadStatuses[
                            client.leadStatus as keyof typeof he.client.leadStatuses
                          ] ?? client.leadStatus}
                    </Badge>
                  </TableCell>
                  <TableCell className="hidden sm:table-cell">
                    <span className="text-sm text-muted-foreground">{client.projects.length}</span>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1 opacity-100 sm:opacity-0 sm:pointer-events-none sm:group-hover:opacity-100 sm:group-hover:pointer-events-auto transition-opacity duration-200">
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
                        onClick={() =>
                          setDeleteTarget({ id: client.id, name: client.name })
                        }
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {filtered.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={8}
                    className="text-center text-muted-foreground py-12"
                  >
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
