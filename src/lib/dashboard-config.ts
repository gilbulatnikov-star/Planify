// Dashboard Customization — Widget Registry & Layout Engine

export type WidgetId =
  | "greeting"
  | "kpis"
  | "quick_actions"
  | "urgent"
  | "schedule"
  | "recent_projects"
  | "quick_notes"
  | "todos";

export type WidgetConfig = {
  id: WidgetId;
  visible: boolean;
  order: number;
};

export type WidgetMeta = {
  id: WidgetId;
  label: string;        // Hebrew display name
  description: string;  // Short description
  mandatory: boolean;   // Cannot be hidden
  defaultOrder: number;
};

export const WIDGET_REGISTRY: WidgetMeta[] = [
  {
    id: "greeting",
    label: "ברכה אישית",
    description: "שם, שעה ביום וסיכום יום",
    mandatory: false,
    defaultOrder: 0,
  },
  {
    id: "kpis",
    label: "כרטיסי KPI",
    description: "הכנסות, פרויקטים, לקוחות ומשימות",
    mandatory: true,
    defaultOrder: 1,
  },
  {
    id: "quick_actions",
    label: "פעולות מהירות",
    description: "כפתורי קיצור לפעולות נפוצות",
    mandatory: false,
    defaultOrder: 2,
  },
  {
    id: "urgent",
    label: "התראות דחופות",
    description: "דדליינים קרובים וחשבוניות באיחור",
    mandatory: false,
    defaultOrder: 3,
  },
  {
    id: "schedule",
    label: "לוח שבועי",
    description: "דדליינים ומשימות לשבוע הקרוב",
    mandatory: false,
    defaultOrder: 4,
  },
  {
    id: "recent_projects",
    label: "פרויקטים אחרונים",
    description: "הפרויקטים שעודכנו לאחרונה",
    mandatory: false,
    defaultOrder: 5,
  },
  {
    id: "quick_notes",
    label: "הערות מהירות",
    description: "פנקס הערות אישי תמיד זמין",
    mandatory: false,
    defaultOrder: 6,
  },
  {
    id: "todos",
    label: "משימות",
    description: "רשימת המשימות שלך",
    mandatory: false,
    defaultOrder: 7,
  },
];

export const DEFAULT_LAYOUT: WidgetConfig[] = WIDGET_REGISTRY.map((w) => ({
  id: w.id,
  visible: true,
  order: w.defaultOrder,
}));

/**
 * Merges a stored layout with the current registry.
 * Handles new widgets added after user customized, removes orphaned IDs.
 */
export function resolveLayout(stored: unknown): WidgetConfig[] {
  if (!stored || !Array.isArray(stored) || stored.length === 0) {
    return [...DEFAULT_LAYOUT];
  }

  const storedMap = new Map<string, { visible: boolean; order: number }>();
  for (const item of stored) {
    if (item && typeof item === "object" && "id" in item) {
      storedMap.set(item.id as string, {
        visible: (item as { visible?: boolean }).visible ?? true,
        order: (item as { order?: number }).order ?? 999,
      });
    }
  }

  const result: WidgetConfig[] = [];
  for (const widget of WIDGET_REGISTRY) {
    const saved = storedMap.get(widget.id);
    result.push({
      id: widget.id,
      visible: widget.mandatory ? true : (saved?.visible ?? true),
      order: saved?.order ?? widget.defaultOrder + 100, // new widgets go to end
    });
  }

  result.sort((a, b) => a.order - b.order);
  result.forEach((w, i) => { w.order = i; });

  return result;
}

export function getWidgetMeta(id: WidgetId): WidgetMeta {
  return WIDGET_REGISTRY.find((w) => w.id === id)!;
}
