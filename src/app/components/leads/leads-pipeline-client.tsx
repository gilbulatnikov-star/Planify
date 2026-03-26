"use client";

import { useState, useTransition, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Phone, MessageSquare, Clock, Search, UserCheck, BarChart3, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useT } from "@/lib/i18n";
import {
  updateLeadStatus,
  convertLeadToClient,
  deleteClient,
} from "@/lib/actions/client-actions";
import { LeadDialog } from "./lead-dialog";
import { InteractionDialog } from "./interaction-dialog";
import { LeadsAnalytics } from "./leads-analytics";
import type { LeadAnalyticsData } from "@/lib/actions/lead-analytics";

// ─── Types ───────────────────────────────────────────────────────────────────

type Interaction = {
  id: string;
  clientId: string;
  type: string;
  summary: string;
  date: Date;
  createdAt: Date;
};

type Lead = {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  company: string | null;
  notes: string | null;
  type: string;
  leadSource: string | null;
  leadStatus: string;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
  interactions: Interaction[];
  _count: { interactions: number };
};

// ─── Constants ───────────────────────────────────────────────────────────────

const STAGES = [
  "new",
  "contacted",
  "qualified",
  "proposal_sent",
  "won",
  "lost",
] as const;

type Stage = (typeof STAGES)[number];

const STAGE_COLORS: Record<Stage, string> = {
  new: "bg-blue-400",
  contacted: "bg-cyan-400",
  qualified: "bg-violet-400",
  proposal_sent: "bg-amber-400",
  won: "bg-emerald-400",
  lost: "bg-red-400",
};

const SOURCE_KEYS = [
  "instagram",
  "tiktok",
  "facebook",
  "referral",
  "website",
  "linkedin",
  "organic",
  "other",
] as const;

type SourceKey = (typeof SOURCE_KEYS)[number];

// ─── Main component ─────────────────────────────────────────────────────────

interface LeadsPipelineClientProps {
  leads: Lead[];
  planLimit: number;
  analytics?: LeadAnalyticsData | null;
}

export function LeadsPipelineClient({
  leads,
  planLimit,
  analytics,
}: LeadsPipelineClientProps) {
  const t = useT();
  const [isPending, startTransition] = useTransition();

  // Dialogs
  const [leadDialogOpen, setLeadDialogOpen] = useState(false);
  const [editingLead, setEditingLead] = useState<Lead | null>(null);
  const [interactionDialogOpen, setInteractionDialogOpen] = useState(false);
  const [interactionClientId, setInteractionClientId] = useState("");

  // Analytics
  const [showAnalytics, setShowAnalytics] = useState(false);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [sourceFilter, setSourceFilter] = useState("");

  // DnD
  const [draggedId, setDraggedId] = useState<string | null>(null);

  // ── Filtering ──────────────────────────────────────────────────────────────
  const filtered = leads.filter((lead) => {
    if (searchQuery && !lead.name.toLowerCase().includes(searchQuery.toLowerCase()))
      return false;
    if (sourceFilter && lead.leadSource !== sourceFilter) return false;
    return true;
  });

  const getColumnLeads = useCallback(
    (stage: string) => filtered.filter((l) => l.leadStatus === stage),
    [filtered]
  );

  // ── Actions ────────────────────────────────────────────────────────────────
  function openNewLead() {
    setEditingLead(null);
    setLeadDialogOpen(true);
  }

  function openEditLead(lead: Lead) {
    setEditingLead(lead);
    setLeadDialogOpen(true);
  }

  function openInteraction(clientId: string) {
    setInteractionClientId(clientId);
    setInteractionDialogOpen(true);
  }

  function handleConvert(id: string) {
    startTransition(async () => {
      await convertLeadToClient(id);
    });
  }

  // ── Drag & Drop ────────────────────────────────────────────────────────────
  function handleDragStart(e: React.DragEvent, id: string) {
    e.dataTransfer.setData("text/plain", id);
    setDraggedId(id);
  }

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  }

  function handleDrop(e: React.DragEvent, newStatus: string) {
    e.preventDefault();
    const id = e.dataTransfer.getData("text/plain");
    setDraggedId(null);
    if (!id) return;
    const lead = leads.find((l) => l.id === id);
    if (!lead || lead.leadStatus === newStatus) return;
    startTransition(async () => {
      await updateLeadStatus(id, newStatus);
    });
  }

  function handleDragEnd() {
    setDraggedId(null);
  }

  // ── Helpers ────────────────────────────────────────────────────────────────
  function daysAgo(date: Date) {
    const ms = Date.now() - new Date(date).getTime();
    return Math.max(0, Math.floor(ms / 86400000));
  }

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col gap-4 p-4 sm:p-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold text-foreground">{t.leads.title}</h1>
        <div className="flex items-center gap-2">
          {analytics && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowAnalytics((v) => !v)}
              className="shrink-0"
            >
              <BarChart3 className="h-4 w-4 me-1.5" />
              {showAnalytics
                ? t.leads.analytics.hideAnalytics
                : t.leads.analytics.showAnalytics}
            </Button>
          )}
          <Button onClick={openNewLead} size="sm" className="shrink-0">
            <Plus className="h-4 w-4 me-1.5" />
            {t.leads.newLead}
          </Button>
        </div>
      </div>

      {/* Analytics Dashboard */}
      <AnimatePresence>
        {showAnalytics && analytics && <LeadsAnalytics data={analytics} />}
      </AnimatePresence>

      {/* Filters */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute start-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder={t.common.searchPlaceholder}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="ps-8 h-9"
          />
        </div>
        <select
          value={sourceFilter}
          onChange={(e) => setSourceFilter(e.target.value)}
          className="flex h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
        >
          <option value="">{t.leads.allSources}</option>
          {SOURCE_KEYS.map((key) => (
            <option key={key} value={key}>
              {t.leads.sources[key]}
            </option>
          ))}
        </select>
      </div>

      {/* Kanban columns */}
      <div className="flex gap-3 overflow-x-auto pb-4 -mx-4 px-4 sm:-mx-6 sm:px-6">
        {STAGES.map((stage) => {
          const columnLeads = getColumnLeads(stage);
          return (
            <div
              key={stage}
              className="flex flex-col shrink-0 w-[280px] min-h-[400px] rounded-xl border border-border bg-muted/50"
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, stage)}
            >
              {/* Column header */}
              <div className="flex items-center gap-2 px-3 py-2.5 border-b border-border">
                <span
                  className={`h-2.5 w-2.5 shrink-0 rounded-full ${STAGE_COLORS[stage]}`}
                />
                <span className="text-sm font-semibold text-foreground truncate">
                  {t.leads.stages[stage]}
                </span>
                <span className="ms-auto text-xs text-muted-foreground tabular-nums">
                  {columnLeads.length}
                </span>
              </div>

              {/* Cards */}
              <div className="flex flex-col gap-2 p-2 flex-1">
                <AnimatePresence mode="popLayout">
                  {columnLeads.map((lead) => (
                    <motion.div
                      key={lead.id}
                      layout
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.15 }}
                      draggable
                      onDragStart={(e) =>
                        handleDragStart(
                          e as unknown as React.DragEvent,
                          lead.id
                        )
                      }
                      onDragEnd={handleDragEnd}
                      onClick={() => openEditLead(lead)}
                      className={`rounded-lg border border-border bg-card p-3 cursor-grab active:cursor-grabbing transition-shadow hover:shadow-md ${
                        draggedId === lead.id ? "opacity-50" : ""
                      }`}
                    >
                      {/* Name + phone */}
                      <div className="flex items-start justify-between gap-2">
                        <span className="text-sm font-medium text-foreground truncate">
                          {lead.name}
                        </span>
                        {lead.phone && (
                          <a
                            href={`tel:${lead.phone}`}
                            onClick={(e) => e.stopPropagation()}
                            className="shrink-0 text-muted-foreground hover:text-foreground transition-colors"
                            title={lead.phone}
                          >
                            <Phone className="h-3.5 w-3.5" />
                          </a>
                        )}
                      </div>

                      {/* Badges: source + service */}
                      <div className="flex flex-wrap gap-1 mt-1.5">
                        {lead.leadSource && (
                          <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                            {t.leads.sources[lead.leadSource as SourceKey] ??
                              lead.leadSource}
                          </Badge>
                        )}
                        {lead.tags?.[0] && (
                          <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                            {lead.tags[0]}
                          </Badge>
                        )}
                      </div>

                      {/* Last interaction */}
                      {lead.interactions?.[0] && (
                        <div className="flex items-start gap-1.5 mt-2 text-xs text-muted-foreground">
                          <MessageSquare className="h-3 w-3 shrink-0 mt-0.5" />
                          <span className="line-clamp-1">
                            {lead.interactions[0].summary}
                          </span>
                        </div>
                      )}

                      {/* Days ago */}
                      <div className="flex items-center gap-1 mt-1.5 text-[11px] text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        <span>
                          {daysAgo(lead.createdAt)} {t.leads.daysAgo}
                        </span>
                      </div>

                      {/* Action buttons */}
                      <div className="flex items-center gap-2 mt-2 flex-wrap">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            openInteraction(lead.id);
                          }}
                          className="text-xs text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
                        >
                          <Plus className="h-3 w-3" />
                          {t.leads.addInteraction}
                        </button>

                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (confirm(t.common.delete + "?")) {
                              startTransition(async () => { await deleteClient(lead.id); });
                            }
                          }}
                          className="text-xs text-muted-foreground hover:text-red-500 transition-colors flex items-center gap-1"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>

                        {stage === "won" && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleConvert(lead.id);
                            }}
                            disabled={isPending}
                            className="ms-auto flex items-center gap-1 rounded-md bg-emerald-500/10 px-2 py-0.5 text-xs font-medium text-emerald-600 hover:bg-emerald-500/20 transition-colors dark:text-emerald-400"
                          >
                            <UserCheck className="h-3 w-3" />
                            {t.leads.convertToClient}
                          </button>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>

                {columnLeads.length === 0 && (
                  <div className="flex flex-1 items-center justify-center py-8">
                    <span className="text-xs text-muted-foreground">
                      {t.leads.noLeads}
                    </span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Dialogs */}
      <LeadDialog
        lead={editingLead}
        open={leadDialogOpen}
        onOpenChange={setLeadDialogOpen}
      />

      {interactionClientId && (
        <InteractionDialog
          clientId={interactionClientId}
          open={interactionDialogOpen}
          onOpenChange={setInteractionDialogOpen}
        />
      )}
    </div>
  );
}
