"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Plus, Pencil, Trash2, Search } from "lucide-react";
import { UpgradeDialog } from "@/app/components/shared/upgrade-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ContactDialog } from "./contact-dialog";
import { DeleteContactDialog } from "./delete-contact-dialog";
import { useT } from "@/lib/i18n";

type ContactData = {
  id: string;
  name: string;
  category: string;
  phone: string | null;
  email: string | null;
  dailyRate: number | null;
  notes: string | null;
  projectId: string | null;
  project: { id: string; title: string } | null;
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
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] as const },
  },
};

const categoryColors: Record<string, string> = {
  editor: "bg-cyan-50 text-cyan-700",
  stills_photographer: "bg-violet-50 text-violet-700",
  video_photographer: "bg-purple-50 text-purple-700",
  lighting: "bg-yellow-50 text-yellow-700",
  director: "bg-orange-50 text-orange-700",
  art: "bg-lime-50 text-lime-700",
  production_assistant: "bg-sky-50 text-sky-700",
  producer: "bg-red-50 text-red-700",
  three_d: "bg-indigo-50 text-indigo-700",
  sound_designer: "bg-teal-50 text-teal-700",
  makeup: "bg-rose-50 text-rose-700",
  actor: "bg-amber-50 text-amber-700",
  rental_house: "bg-emerald-50 text-emerald-700",
  studio: "bg-blue-50 text-blue-700",
  social_manager: "bg-pink-50 text-pink-700",
};

const PRESET_CATEGORIES_LIST = ["editor", "stills_photographer", "video_photographer", "lighting", "director", "art", "production_assistant", "producer", "three_d", "sound_designer", "makeup", "actor", "rental_house", "studio", "social_manager"] as const;
const PRESET_SET = new Set<string>(PRESET_CATEGORIES_LIST);

export function ContactsPageClient({ contacts, planLimit, projects }: { contacts: ContactData[]; planLimit: number; projects: { id: string; title: string }[] }) {
  const he = useT();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingContact, setEditingContact] = useState<ContactData | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null);
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [upgradeOpen, setUpgradeOpen] = useState(false);

  // Discover any custom categories already in the contacts list
  const extraCategories = Array.from(new Set(contacts.map(c => c.category).filter(c => !PRESET_SET.has(c))));

  function handleEdit(contact: ContactData) {
    setEditingContact(contact);
    setDialogOpen(true);
  }

  function handleCreate() {
    if (planLimit !== -1 && contacts.length >= planLimit) {
      setUpgradeOpen(true);
      return;
    }
    setEditingContact(null);
    setDialogOpen(true);
  }

  const filtered = contacts.filter((c) => {
    const matchesSearch = c.name.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = !activeCategory || c.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <motion.div
      variants={stagger}
      initial="hidden"
      animate="show"
      className="space-y-6"
    >
      {/* Header */}
      <motion.div variants={fadeUp} className="flex items-center justify-between">
        <h1 className="text-[22px] font-extrabold tracking-[-0.03em] text-foreground">
          {he.contacts.title}
        </h1>
        <Button
          size="sm"
          onClick={handleCreate}
          className="bg-foreground text-background hover:bg-foreground/90 shadow-sm transition-all duration-200 border-0"
        >
          <Plus className="h-4 w-4 me-2" />
          {he.contacts.newContact}
        </Button>
      </motion.div>

      {/* Search + Category Filter */}
      <motion.div variants={fadeUp} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={he.common.searchPlaceholder}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="ps-10 bg-background border-border"
          />
        </div>
        <select
          value={activeCategory ?? ""}
          onChange={(e) => setActiveCategory(e.target.value || null)}
          className="h-9 rounded-md border border-border bg-background px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring w-full sm:w-auto sm:min-w-[160px]"
        >
          <option value="">כל הקטגוריות</option>
          {PRESET_CATEGORIES_LIST.map((cat) => (
            <option key={cat} value={cat}>
              {he.contacts.categories[cat as keyof typeof he.contacts.categories]}
            </option>
          ))}
          {extraCategories.map((cat) => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
      </motion.div>

      {/* Contact List */}
      <motion.div variants={fadeUp} className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {filtered.map((contact) => (
          <div
            key={contact.id}
            className="flex items-center gap-3 rounded-xl border border-border/40 bg-card px-4 py-3 group hover:bg-foreground/[0.02] transition-colors cursor-pointer"
            onClick={() => handleEdit(contact)}
          >
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-bold text-muted-foreground">
              {contact.name.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm font-medium text-foreground">{contact.name}</span>
                <Badge className={`${categoryColors[contact.category] ?? "bg-muted text-muted-foreground"} border-0 text-[10px]`}>
                  {he.contacts.categories[contact.category as keyof typeof he.contacts.categories] ?? contact.category}
                </Badge>
              </div>
              <div className="flex items-center gap-3 mt-0.5 text-xs text-muted-foreground">
                {contact.phone && <span dir="ltr">{contact.phone}</span>}
                {contact.phone && contact.email && <span>·</span>}
                {contact.email && <span className="truncate">{contact.email}</span>}
                {contact.dailyRate !== null && (
                  <>
                    <span>·</span>
                    <span>{he.common.currency}{contact.dailyRate.toLocaleString()} / יום</span>
                  </>
                )}
              </div>
            </div>
            <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
              <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-muted hover:text-foreground"
                onClick={(e) => { e.stopPropagation(); handleEdit(contact); }}>
                <Pencil className="h-3.5 w-3.5" />
              </Button>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-950 dark:hover:text-red-400"
                onClick={(e) => { e.stopPropagation(); setDeleteTarget({ id: contact.id, name: contact.name }); }}>
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="rounded-[14px] border border-dashed border-border/40 p-10 text-center">
            <span className="text-[12.5px] font-semibold text-foreground/40">{he.common.noResults}</span>
          </div>
        )}
      </motion.div>

      {/* Dialogs */}
      <UpgradeDialog
        open={upgradeOpen}
        onClose={() => setUpgradeOpen(false)}
        feature={he.contactsPage.contactsFeature}
        limit={planLimit}
      />
      <ContactDialog
        contact={editingContact}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        extraCategories={extraCategories}
        projects={projects}
        onQuotaExceeded={() => { setDialogOpen(false); setUpgradeOpen(true); }}
      />

      {deleteTarget && (
        <DeleteContactDialog
          contactId={deleteTarget.id}
          contactName={deleteTarget.name}
          open={!!deleteTarget}
          onOpenChange={(open) => {
            if (!open) setDeleteTarget(null);
          }}
        />
      )}
    </motion.div>
  );
}
