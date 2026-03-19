"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Plus, Pencil, Trash2, Search, Phone, Mail, Banknote } from "lucide-react";
import { UpgradeDialog } from "@/app/components/shared/upgrade-dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ContactDialog } from "./contact-dialog";
import { DeleteContactDialog } from "./delete-contact-dialog";
import { he } from "@/lib/he";

type ContactData = {
  id: string;
  name: string;
  category: string;
  phone: string | null;
  email: string | null;
  dailyRate: number | null;
  notes: string | null;
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

export function ContactsPageClient({ contacts, planLimit }: { contacts: ContactData[]; planLimit: number }) {
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
        <h1 className="text-2xl font-bold text-gray-900">
          {he.contacts.title}
        </h1>
        <Button
          size="sm"
          onClick={handleCreate}
          className="bg-gray-900 text-white hover:bg-gray-800 shadow-sm transition-all duration-200 border-0"
        >
          <Plus className="h-4 w-4 me-2" />
          {he.contacts.newContact}
        </Button>
      </motion.div>

      {/* Search + Category Filter */}
      <motion.div variants={fadeUp} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
        <div className="relative flex-1">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="חיפוש..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pr-10 bg-white border-gray-200"
          />
        </div>
        <select
          value={activeCategory ?? ""}
          onChange={(e) => setActiveCategory(e.target.value || null)}
          className="h-9 rounded-md border border-gray-200 bg-white px-3 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-900 w-full sm:w-auto sm:min-w-[160px]"
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

      {/* Contact Cards Grid */}
      <motion.div variants={fadeUp} className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filtered.map((contact) => (
          <motion.div key={contact.id} variants={fadeUp}>
            <Card className="glass-card group transition-all duration-300 hover:scale-[1.02] hover:shadow-sm">
              <CardContent className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-semibold text-lg">{contact.name}</h3>
                    <Badge className={`${categoryColors[contact.category] ?? "bg-gray-100 text-gray-600"} border-0 mt-1`}>
                      {he.contacts.categories[contact.category as keyof typeof he.contacts.categories] ?? contact.category}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-1 opacity-100 sm:opacity-0 sm:pointer-events-none sm:group-hover:opacity-100 sm:group-hover:pointer-events-auto transition-opacity duration-200">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 hover:bg-gray-100 hover:text-gray-900 transition-colors duration-200"
                      onClick={() => handleEdit(contact)}
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 hover:bg-red-50 text-destructive transition-colors duration-200"
                      onClick={() => setDeleteTarget({ id: contact.id, name: contact.name })}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>

                <div className="space-y-2 text-sm text-muted-foreground">
                  {contact.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="h-3.5 w-3.5 flex-shrink-0" />
                      <span dir="ltr" className="text-left">{contact.phone}</span>
                    </div>
                  )}
                  {contact.email && (
                    <div className="flex items-center gap-2">
                      <Mail className="h-3.5 w-3.5 flex-shrink-0" />
                      <span className="truncate">{contact.email}</span>
                    </div>
                  )}
                  {contact.dailyRate !== null && (
                    <div className="flex items-center gap-2">
                      <Banknote className="h-3.5 w-3.5 flex-shrink-0" />
                      <span>{he.common.currency}{contact.dailyRate.toLocaleString()} / יום</span>
                    </div>
                  )}
                  {contact.notes && (
                    <p className="text-xs text-muted-foreground/70 mt-2 line-clamp-2">
                      {contact.notes}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
        {filtered.length === 0 && (
          <div className="col-span-full text-center text-muted-foreground py-12">
            {he.common.noResults}
          </div>
        )}
      </motion.div>

      {/* Dialogs */}
      <UpgradeDialog
        open={upgradeOpen}
        onClose={() => setUpgradeOpen(false)}
        feature="אנשי קשר"
        limit={planLimit}
      />
      <ContactDialog
        contact={editingContact}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        extraCategories={extraCategories}
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
