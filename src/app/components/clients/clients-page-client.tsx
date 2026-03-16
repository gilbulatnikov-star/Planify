"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Plus, Pencil, Trash2, Users, UserPlus, Contact } from "lucide-react";
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

export function ClientsPageClient({ clients }: { clients: ClientData[] }) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<ClientData | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null);

  const allClients = clients.filter((c) => c.type === "client");
  const allLeads = clients.filter((c) => c.type === "lead");

  function handleEdit(client: ClientData) {
    setEditingClient(client);
    setDialogOpen(true);
  }

  function handleCreate() {
    setEditingClient(null);
    setDialogOpen(true);
  }

  const statCards = [
    { label: "לקוחות פעילים", value: allClients.length, icon: Users, color: "from-cyan-400 to-teal-500" },
    { label: "לידים", value: allLeads.length, icon: UserPlus, color: "from-violet-400 to-purple-500" },
    { label: "סה״כ אנשי קשר", value: clients.length, icon: Contact, color: "from-amber-400 to-orange-500" },
  ];

  function renderTable(filtered: ClientData[]) {
    return (
      <Card className="glass-card overflow-hidden">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="border-white/[0.06] hover:bg-transparent">
                <TableHead className="text-muted-foreground">{he.client.name}</TableHead>
                <TableHead className="text-muted-foreground">{he.client.company}</TableHead>
                <TableHead className="text-muted-foreground">{he.client.email}</TableHead>
                <TableHead className="text-muted-foreground">{he.client.phone}</TableHead>
                <TableHead className="text-muted-foreground">{he.client.leadSource}</TableHead>
                <TableHead className="text-muted-foreground">סטטוס</TableHead>
                <TableHead className="text-muted-foreground">פרויקטים</TableHead>
                <TableHead className="w-[80px] text-muted-foreground">פעולות</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((client) => (
                <TableRow
                  key={client.id}
                  className="border-white/[0.04] transition-all duration-200 hover:bg-cyan-500/[0.04] group"
                >
                  <TableCell className="font-medium">{client.name}</TableCell>
                  <TableCell className="text-muted-foreground">{client.company ?? "—"}</TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {client.email ?? "—"}
                  </TableCell>
                  <TableCell dir="ltr" className="text-left text-muted-foreground">
                    {client.phone ?? "—"}
                  </TableCell>
                  <TableCell>
                    {client.leadSource ? (
                      <Badge variant="outline" className="border-white/10 text-muted-foreground">
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
                          ? "bg-cyan-500/15 text-cyan-300 hover:bg-cyan-500/25 border-0"
                          : "bg-violet-500/15 text-violet-300 hover:bg-violet-500/25 border-0"
                      }
                    >
                      {client.type === "client"
                        ? he.client.types.client
                        : he.client.leadStatuses[
                            client.leadStatus as keyof typeof he.client.leadStatuses
                          ] ?? client.leadStatus}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-muted-foreground">{client.projects.length}</span>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 hover:bg-cyan-500/10 hover:text-cyan-400 transition-colors duration-200"
                        onClick={() => handleEdit(client)}
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 hover:bg-red-500/10 text-destructive transition-colors duration-200"
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
        <h1 className="text-2xl font-bold bg-gradient-to-l from-cyan-300 via-white to-white bg-clip-text text-transparent">
          {he.client.title}
        </h1>
        <Button
          size="sm"
          onClick={handleCreate}
          className="bg-gradient-to-r from-cyan-500 to-teal-500 text-white hover:from-cyan-400 hover:to-teal-400 shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/40 transition-all duration-300 border-0"
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
        <Tabs defaultValue="clients" dir="rtl">
          <TabsList className="bg-white/[0.04] border border-white/[0.06]">
            <TabsTrigger value="clients" className="data-[state=active]:bg-cyan-500/15 data-[state=active]:text-cyan-300 transition-all duration-200">
              לקוחות ({allClients.length})
            </TabsTrigger>
            <TabsTrigger value="leads" className="data-[state=active]:bg-cyan-500/15 data-[state=active]:text-cyan-300 transition-all duration-200">
              לידים ({allLeads.length})
            </TabsTrigger>
            <TabsTrigger value="all" className="data-[state=active]:bg-cyan-500/15 data-[state=active]:text-cyan-300 transition-all duration-200">
              הכל ({clients.length})
            </TabsTrigger>
          </TabsList>
          <TabsContent value="clients">{renderTable(allClients)}</TabsContent>
          <TabsContent value="leads">{renderTable(allLeads)}</TabsContent>
          <TabsContent value="all">{renderTable(clients)}</TabsContent>
        </Tabs>
      </motion.div>

      <ClientDialog
        client={editingClient}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
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
