// ─── Project Categories & Types Config ───────────────────────────────────────
// Single source of truth for all project types, their phases, and UI config.

export type ProjectCategory = "photography" | "video" | "content" | "editing";

export interface PhaseOption {
  value: string;
  label: string;
}

export interface ProjectTypeConfig {
  label: string;
  category: ProjectCategory;
  phases: PhaseOption[];
}

export type UniversalColumn = "planning" | "in_progress" | "review" | "done";

export const CATEGORY_LABELS: Record<ProjectCategory, string> = {
  photography: "📸 צילום",
  video: "🎬 וידאו",
  content: "📱 סושיאל",
  editing: "✂️ עריכה",
};

export const UNIVERSAL_COLUMNS: {
  key: UniversalColumn;
  label: string;
  color: string;
}[] = [
  { key: "planning",    label: "תכנון",         color: "from-violet-500 to-purple-600" },
  { key: "in_progress", label: "בביצוע",         color: "from-amber-500 to-orange-500" },
  { key: "review",      label: "ממתין לאישור",   color: "from-blue-500 to-cyan-500" },
  { key: "done",        label: "הושלם",          color: "from-emerald-500 to-green-500" },
];

// ─── All project types ────────────────────────────────────────────────────────
export const PROJECT_TYPE_CONFIG: Record<string, ProjectTypeConfig> = {
  // ── Photography ────────────────────────────────────────────────────────────
  wedding: {
    label: "חתונה",
    category: "photography",
    phases: [
      { value: "coordination",     label: "תיאום" },
      { value: "shoot_day",        label: "יום הצילום" },
      { value: "selection",        label: "ברירה" },
      { value: "editing",          label: "עריכה" },
      { value: "gallery_delivery", label: "גלריה למסירה" },
    ],
  },
  bar_bat_mitzva: {
    label: "בר / בת מצווה",
    category: "photography",
    phases: [
      { value: "coordination",     label: "תיאום" },
      { value: "shoot_day",        label: "יום הצילום" },
      { value: "selection",        label: "ברירה" },
      { value: "editing",          label: "עריכה" },
      { value: "gallery_delivery", label: "גלריה למסירה" },
    ],
  },
  event_photo: {
    label: "אירוע",
    category: "photography",
    phases: [
      { value: "coordination",     label: "תיאום" },
      { value: "shoot_day",        label: "יום הצילום" },
      { value: "editing",          label: "עריכה" },
      { value: "gallery_delivery", label: "מסירה" },
    ],
  },
  portrait: {
    label: "פורטרט / מיני סשן",
    category: "photography",
    phases: [
      { value: "coordination",     label: "תיאום" },
      { value: "shoot_day",        label: "יום הצילום" },
      { value: "selection",        label: "ברירה" },
      { value: "editing",          label: "עריכה" },
      { value: "gallery_delivery", label: "מסירה" },
    ],
  },
  product_photography: {
    label: "צילום מוצר",
    category: "photography",
    phases: [
      { value: "brief",            label: "בריף" },
      { value: "shoot_day",        label: "יום הצילום" },
      { value: "editing",          label: "עריכה" },
      { value: "gallery_delivery", label: "מסירה" },
    ],
  },
  real_estate: {
    label: 'נדל"ן',
    category: "photography",
    phases: [
      { value: "coordination",     label: "תיאום" },
      { value: "shoot_day",        label: "יום הצילום" },
      { value: "editing",          label: "עריכה" },
      { value: "gallery_delivery", label: "מסירה" },
    ],
  },
  fashion: {
    label: "אופנה / מוד",
    category: "photography",
    phases: [
      { value: "brief",            label: "בריף" },
      { value: "shoot_day",        label: "יום הצילום" },
      { value: "selection",        label: "ברירה" },
      { value: "editing",          label: "עריכה" },
      { value: "gallery_delivery", label: "מסירה" },
    ],
  },
  family: {
    label: "משפחה / הריון",
    category: "photography",
    phases: [
      { value: "coordination",     label: "תיאום" },
      { value: "shoot_day",        label: "יום הצילום" },
      { value: "editing",          label: "עריכה" },
      { value: "gallery_delivery", label: "מסירה" },
    ],
  },

  // ── Video ──────────────────────────────────────────────────────────────────
  music_video: {
    label: "קליפ מוזיקלי",
    category: "video",
    phases: [
      { value: "brief",           label: "בריף" },
      { value: "pre_production",  label: "פרה-פרודקשן" },
      { value: "shoot_days",      label: "ימי הצילום" },
      { value: "post_production", label: "עריכה" },
      { value: "revisions",       label: "תיקונים" },
      { value: "delivered",       label: "הושלם" },
    ],
  },
  commercial: {
    label: "פרסומת",
    category: "video",
    phases: [
      { value: "brief",           label: "בריף" },
      { value: "pre_production",  label: "פרה-פרודקשן" },
      { value: "shoot_days",      label: "ימי הצילום" },
      { value: "post_production", label: "עריכה" },
      { value: "revisions",       label: "תיקונים" },
      { value: "delivered",       label: "הושלם" },
    ],
  },
  corporate: {
    label: "תדמית",
    category: "video",
    phases: [
      { value: "brief",           label: "בריף" },
      { value: "pre_production",  label: "פרה-פרודקשן" },
      { value: "shoot_days",      label: "ימי הצילום" },
      { value: "post_production", label: "עריכה" },
      { value: "revisions",       label: "תיקונים" },
      { value: "delivered",       label: "הושלם" },
    ],
  },
  youtube: {
    label: "סרטון YouTube",
    category: "video",
    phases: [
      { value: "planning",        label: "תכנון" },
      { value: "recording",       label: "הקלטה" },
      { value: "post_production", label: "עריכה" },
      { value: "revisions",       label: "תיקונים" },
      { value: "published",       label: "פורסם" },
    ],
  },
  podcast: {
    label: "פודקאסט",
    category: "video",
    phases: [
      { value: "planning",        label: "תכנון" },
      { value: "recording",       label: "הקלטה" },
      { value: "post_production", label: "עריכה" },
      { value: "published",       label: "פורסם" },
    ],
  },
  interview: {
    label: "כתבה / ריאיון",
    category: "video",
    phases: [
      { value: "coordination",    label: "תיאום" },
      { value: "shoot_day",       label: "צילום" },
      { value: "post_production", label: "עריכה" },
      { value: "delivered",       label: "מסירה" },
    ],
  },
  bts: {
    label: "BTS",
    category: "video",
    phases: [
      { value: "shoot_days",      label: "ימי הצילום" },
      { value: "post_production", label: "עריכה" },
      { value: "delivered",       label: "מסירה" },
    ],
  },

  // ── Content / Social ───────────────────────────────────────────────────────
  social: {
    label: "סושיאל",
    category: "content",
    phases: [
      { value: "planning",         label: "תכנון" },
      { value: "writing",          label: "כתיבה" },
      { value: "graphics",         label: "גרפיקה" },
      { value: "waiting_approval", label: "ממתין לאישור" },
      { value: "published",        label: "פורסם" },
    ],
  },
  reel: {
    label: "ריל / סטורי",
    category: "content",
    phases: [
      { value: "planning",         label: "תכנון" },
      { value: "writing",          label: "כתיבה" },
      { value: "graphics",         label: "גרפיקה" },
      { value: "waiting_approval", label: "ממתין לאישור" },
      { value: "published",        label: "פורסם" },
    ],
  },
  post_carousel: {
    label: "פוסט / קרוסלה",
    category: "content",
    phases: [
      { value: "planning",         label: "תכנון" },
      { value: "writing",          label: "כתיבה" },
      { value: "graphics",         label: "גרפיקה" },
      { value: "waiting_approval", label: "ממתין לאישור" },
      { value: "published",        label: "פורסם" },
    ],
  },
  page_management: {
    label: "ניהול עמוד (ריטיינר)",
    category: "content",
    phases: [
      { value: "monthly_planning", label: "תכנון חודשי" },
      { value: "writing",          label: "כתיבה" },
      { value: "waiting_approval", label: "ממתין לאישור" },
      { value: "scheduling",       label: "תזמון" },
      { value: "active",           label: "פעיל" },
    ],
  },
  content_strategy: {
    label: "אסטרטגיית תוכן",
    category: "content",
    phases: [
      { value: "planning",         label: "תכנון" },
      { value: "research",         label: "מחקר" },
      { value: "writing",          label: "כתיבה" },
      { value: "waiting_approval", label: "ממתין לאישור" },
      { value: "delivered",        label: "הגשה" },
    ],
  },

  // ── Editing only ───────────────────────────────────────────────────────────
  video_editing: {
    label: "עריכת וידאו",
    category: "editing",
    phases: [
      { value: "materials_received", label: "חומרים התקבלו" },
      { value: "first_cut",          label: "גרסה ראשונה" },
      { value: "revisions",          label: "תיקונים" },
      { value: "delivered",          label: "מסירה" },
    ],
  },
  podcast_editing: {
    label: "עריכת פודקאסט",
    category: "editing",
    phases: [
      { value: "materials_received", label: "חומרים התקבלו" },
      { value: "post_production",    label: "עריכה" },
      { value: "delivered",          label: "מסירה" },
    ],
  },
  motion_graphics: {
    label: "גרפיקה / מושן",
    category: "editing",
    phases: [
      { value: "brief",     label: "בריף" },
      { value: "draft",     label: "טיוטה" },
      { value: "revisions", label: "תיקונים" },
      { value: "delivered", label: "מסירה" },
    ],
  },
};

// ─── Universal phase → column mapping ────────────────────────────────────────
export const UNIVERSAL_PHASE_MAP: Record<string, UniversalColumn> = {
  // Planning
  brief:            "planning",
  coordination:     "planning",
  planning:         "planning",
  monthly_planning: "planning",
  pre_production:   "planning",
  research:         "planning",
  // In progress
  shoot_day:          "in_progress",
  shoot_days:         "in_progress",
  selection:          "in_progress",
  recording:          "in_progress",
  writing:            "in_progress",
  graphics:           "in_progress",
  post_production:    "in_progress",
  materials_received: "in_progress",
  first_cut:          "in_progress",
  draft:              "in_progress",
  scheduling:         "in_progress",
  editing:            "in_progress",
  // Review
  revisions:        "review",
  waiting_approval: "review",
  // Done
  gallery_delivery: "done",
  delivered:        "done",
  published:        "done",
  active:           "done",
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

export function getPhasesForType(typeKey: string): PhaseOption[] {
  // Check category key first (new simple flow)
  if (typeKey in CATEGORY_PHASES) return CATEGORY_PHASES[typeKey as ProjectCategory];
  // Then check specific type config (legacy/backward compat)
  const cfg = PROJECT_TYPE_CONFIG[typeKey];
  if (cfg) return cfg.phases;
  // Legacy fallback
  return [
    { value: "pre_production",  label: "לפני הצילומים" },
    { value: "post_production", label: "עריכה" },
    { value: "revisions",       label: "תיקונים" },
    { value: "delivered",       label: "הושלם" },
  ];
}

export function getTypeCategory(typeKey: string): ProjectCategory | null {
  // Direct category key
  if (typeKey in CATEGORY_PHASES) return typeKey as ProjectCategory;
  return PROJECT_TYPE_CONFIG[typeKey]?.category ?? null;
}

export function getTypesByCategory(category: ProjectCategory) {
  return Object.entries(PROJECT_TYPE_CONFIG)
    .filter(([, cfg]) => cfg.category === category)
    .map(([value, cfg]) => ({ value, label: cfg.label }));
}

export function toUniversalColumn(phase: string): UniversalColumn {
  return UNIVERSAL_PHASE_MAP[phase] ?? "in_progress";
}

export function getTypeKeyByLabel(label: string): string | null {
  const lower = label.trim().toLowerCase();
  for (const [key, cfg] of Object.entries(PROJECT_TYPE_CONFIG)) {
    if (cfg.label.toLowerCase() === lower) return key;
  }
  return null;
}

/** Default phases for each top-level category (used when type = category key). */
export const CATEGORY_PHASES: Record<ProjectCategory, PhaseOption[]> = {
  photography: [
    { value: "coordination",     label: "תיאום" },
    { value: "shoot_day",        label: "יום הצילום" },
    { value: "editing",          label: "עריכה" },
    { value: "gallery_delivery", label: "מסירה" },
  ],
  video: [
    { value: "brief",           label: "בריף" },
    { value: "pre_production",  label: "פרה-פרודקשן" },
    { value: "shoot_days",      label: "צילום" },
    { value: "post_production", label: "עריכה" },
    { value: "revisions",       label: "תיקונים" },
    { value: "delivered",       label: "הושלם" },
  ],
  content: [
    { value: "planning",         label: "תכנון" },
    { value: "writing",          label: "כתיבה" },
    { value: "graphics",         label: "גרפיקה" },
    { value: "waiting_approval", label: "ממתין לאישור" },
    { value: "published",        label: "פורסם" },
  ],
  editing: [
    { value: "materials_received", label: "חומרים התקבלו" },
    { value: "first_cut",          label: "גרסה ראשונה" },
    { value: "revisions",          label: "תיקונים" },
    { value: "delivered",          label: "מסירה" },
  ],
};

export function getPhaseLabel(phase: string): string {
  // Universal statuses (primary)
  const universal: Record<string, string> = {
    planning:    "תכנון",
    in_progress: "בביצוע",
    review:      "ממתין לאישור",
    done:        "הושלם",
  };
  if (universal[phase]) return universal[phase];
  // Legacy / specific phases
  for (const cfg of Object.values(PROJECT_TYPE_CONFIG)) {
    const found = cfg.phases.find((p) => p.value === phase);
    if (found) return found.label;
  }
  const legacy: Record<string, string> = {
    pre_production: "תכנון",
    post_production: "בביצוע",
    revisions:       "ממתין לאישור",
    delivered:       "הושלם",
  };
  return legacy[phase] ?? phase;
}
