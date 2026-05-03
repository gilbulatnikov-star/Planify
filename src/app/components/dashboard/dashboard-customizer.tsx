"use client";

import { useState, useCallback, useTransition } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import {
  Settings2, Check, X, RotateCcw, ChevronUp, ChevronDown,
  Eye, EyeOff, GripVertical, Plus, Sparkles,
} from "lucide-react";
import { saveDashboardLayout, resetDashboardLayout } from "@/lib/actions/dashboard-actions";
import { WIDGET_REGISTRY, getWidgetMeta, type WidgetConfig, type WidgetId, DEFAULT_LAYOUT } from "@/lib/dashboard-config";
import {
  GreetingWidget,
  KpiWidget,
  QuickActionsWidget,
  UrgentWidget,
  ScheduleWidget,
  RecentProjectsWidget,
  stagger, staggerReduced, fade, fadeReduced,
} from "./smart-dashboard";
import { QuickNotesWidget } from "./quick-notes-widget";
import { TodoWidget } from "./todo-widget";
import type { SmartDashboardData } from "@/lib/actions/dashboard-actions";

// ─── Types ────────────────────────────────────────────────────────────────────

type WidgetRenderProps = {
  data: SmartDashboardData;
  userName?: string | null;
  quickNoteContent?: string;
  todos?: TodoItem[];
  todosLimit?: number;
};

type TodoItem = {
  id: string;
  text: string;
  completed: boolean;
};

// ─── Widget renderer — maps id → component ───────────────────────────────────

function WidgetRenderer({ id, props }: { id: WidgetId; props: WidgetRenderProps }) {
  const { data, userName, quickNoteContent, todos, todosLimit } = props;

  switch (id) {
    case "greeting":
      return <GreetingWidget userName={userName} />;
    case "kpis":
      return <KpiWidget data={data} />;
    case "quick_actions":
      return <QuickActionsWidget />;
    case "urgent":
      return <UrgentWidget data={data} />;
    case "schedule":
      return <ScheduleWidget data={data} />;
    case "recent_projects":
      return <RecentProjectsWidget data={data} />;
    case "quick_notes":
      return <QuickNotesWidget initialContent={quickNoteContent ?? ""} />;
    case "todos":
      return <TodoWidget initialTodos={todos ?? []} todosLimit={todosLimit ?? -1} />;
    default:
      return null;
  }
}

// ─── Inline WidgetCard (edit mode overlay) ────────────────────────────────────

function EditOverlay({
  config,
  index,
  total,
  onMoveUp,
  onMoveDown,
  onToggle,
  // drag props
  onDragStart,
  onDragEnter,
  onDragEnd,
}: {
  config: WidgetConfig;
  index: number;
  total: number;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onToggle: () => void;
  onDragStart: () => void;
  onDragEnter: () => void;
  onDragEnd: () => void;
}) {
  const meta = getWidgetMeta(config.id);
  const isFirst = index === 0;
  const isLast = index === total - 1;

  return (
    <div
      className="absolute inset-0 z-10 rounded-2xl ring-2 ring-accent/30 bg-accent/[0.03] backdrop-blur-[1px] pointer-events-none"
      aria-hidden
    >
      {/* Top bar with controls */}
      <div className="pointer-events-auto absolute top-2 inset-x-2 flex items-center justify-between bg-background/90 backdrop-blur-sm border border-border/40 rounded-xl px-2.5 py-1.5 shadow-sm">
        {/* Drag handle (desktop) */}
        <button
          className="cursor-grab active:cursor-grabbing text-foreground/30 hover:text-foreground/60 transition-colors touch-none hidden sm:flex"
          draggable
          onDragStart={onDragStart}
          onDragEnd={onDragEnd}
          aria-label="גרור לסידור מחדש"
        >
          <GripVertical className="h-4 w-4" />
        </button>

        {/* Widget name */}
        <span className="text-[11px] font-semibold text-foreground/60 truncate flex-1 mx-2 sm:text-center">
          {meta.label}
        </span>

        {/* Controls */}
        <div className="flex items-center gap-1">
          <button
            onClick={onMoveUp}
            disabled={isFirst}
            className="h-6 w-6 flex items-center justify-center rounded-lg hover:bg-foreground/[0.06] disabled:opacity-25 disabled:cursor-not-allowed transition-colors"
            aria-label="הזז למעלה"
          >
            <ChevronUp className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={onMoveDown}
            disabled={isLast}
            className="h-6 w-6 flex items-center justify-center rounded-lg hover:bg-foreground/[0.06] disabled:opacity-25 disabled:cursor-not-allowed transition-colors"
            aria-label="הזז למטה"
          >
            <ChevronDown className="h-3.5 w-3.5" />
          </button>

          {!meta.mandatory && (
            <button
              onClick={onToggle}
              className="h-6 w-6 flex items-center justify-center rounded-lg hover:bg-red-50 dark:hover:bg-red-500/10 text-foreground/40 hover:text-red-500 transition-colors ml-0.5"
              aria-label="הסתר ווידג'ט"
            >
              <EyeOff className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Widget Library Panel ─────────────────────────────────────────────────────

function WidgetLibrary({
  hiddenWidgets,
  onAdd,
  onClose,
}: {
  hiddenWidgets: WidgetConfig[];
  onAdd: (id: WidgetId) => void;
  onClose: () => void;
}) {
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black/40 flex items-end sm:items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ y: 60, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 60, opacity: 0 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="w-full max-w-sm bg-background rounded-2xl border border-border/50 shadow-2xl overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between px-5 py-4 border-b border-border/30">
            <h3 className="text-[14px] font-bold text-foreground">הוסף ווידג&apos;ט</h3>
            <button onClick={onClose} className="h-7 w-7 flex items-center justify-center rounded-lg hover:bg-foreground/[0.06] text-foreground/40 hover:text-foreground transition-colors">
              <X className="h-4 w-4" />
            </button>
          </div>

          {hiddenWidgets.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 gap-2">
              <Sparkles className="h-6 w-6 text-foreground/20" />
              <p className="text-[12.5px] text-foreground/40 font-medium">כל הווידג&apos;טים מוצגים</p>
            </div>
          ) : (
            <div className="p-3 space-y-1.5 max-h-[60vh] overflow-y-auto">
              {hiddenWidgets.map(w => {
                const meta = getWidgetMeta(w.id);
                return (
                  <button
                    key={w.id}
                    onClick={() => onAdd(w.id)}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl border border-border/30 bg-card hover:bg-foreground/[0.03] hover:border-border/50 transition-all text-right"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] font-semibold text-foreground/80">{meta.label}</p>
                      <p className="text-[11px] text-foreground/40 mt-0.5">{meta.description}</p>
                    </div>
                    <div className="h-7 w-7 rounded-lg bg-accent/10 flex items-center justify-center shrink-0">
                      <Plus className="h-3.5 w-3.5 text-accent" />
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

// ─── Reset Confirmation Dialog ─────────────────────────────────────────────────

function ResetConfirmDialog({ onConfirm, onCancel }: { onConfirm: () => void; onCancel: () => void }) {
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4"
        onClick={onCancel}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="w-full max-w-xs bg-background rounded-2xl border border-border/50 shadow-2xl p-6"
          onClick={(e) => e.stopPropagation()}
        >
          <h3 className="text-[15px] font-bold text-foreground mb-1.5">איפוס לברירת מחדל?</h3>
          <p className="text-[12.5px] text-foreground/50 leading-relaxed mb-5">
            כל השינויים שביצעת בסדר ובנראות הווידג&apos;טים יאופסו לסדר ברירת המחדל.
          </p>
          <div className="flex gap-2">
            <button
              onClick={onConfirm}
              className="flex-1 h-9 rounded-xl bg-red-500 hover:bg-red-600 text-white text-[13px] font-semibold transition-colors"
            >
              אפס
            </button>
            <button
              onClick={onCancel}
              className="flex-1 h-9 rounded-xl border border-border/50 hover:bg-foreground/[0.04] text-[13px] font-medium transition-colors"
            >
              ביטול
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

// ─── Main DashboardCustomizer ─────────────────────────────────────────────────

export function DashboardCustomizer({
  initialLayout,
  data,
  userName,
  quickNoteContent,
  todos,
  todosLimit,
}: {
  initialLayout: WidgetConfig[];
  data: SmartDashboardData;
  userName?: string | null;
  quickNoteContent?: string;
  todos?: TodoItem[];
  todosLimit?: number;
}) {
  const [layout, setLayout] = useState<WidgetConfig[]>(initialLayout);
  const [savedLayout, setSavedLayout] = useState<WidgetConfig[]>(initialLayout);
  const [editMode, setEditMode] = useState(false);
  const [showLibrary, setShowLibrary] = useState(false);
  const [showReset, setShowReset] = useState(false);
  const [dragFrom, setDragFrom] = useState<number | null>(null);
  const [dragOver, setDragOver] = useState<number | null>(null);
  const [isPending, startTransition] = useTransition();
  const prefersReduced = useReducedMotion();
  const sv = prefersReduced ? staggerReduced : stagger;
  const fv = prefersReduced ? fadeReduced : fade;

  const hasChanges = JSON.stringify(layout) !== JSON.stringify(savedLayout);

  // Sorted visible widgets
  const visibleWidgets = layout.filter(w => w.visible).sort((a, b) => a.order - b.order);
  const hiddenWidgets = layout.filter(w => !w.visible);

  const renderProps: WidgetRenderProps = { data, userName, quickNoteContent, todos, todosLimit };

  // ── Reorder ────────────────────────────────────────────────────────────────

  const moveWidget = useCallback((fromOrder: number, toOrder: number) => {
    setLayout(prev => {
      const next = [...prev];
      const fromIdx = next.findIndex(w => w.order === fromOrder);
      const toIdx = next.findIndex(w => w.order === toOrder);
      if (fromIdx === -1 || toIdx === -1) return prev;

      // Swap orders
      const temp = next[fromIdx].order;
      next[fromIdx] = { ...next[fromIdx], order: next[toIdx].order };
      next[toIdx] = { ...next[toIdx], order: temp };

      return next;
    });
  }, []);

  const moveByIndex = useCallback((visibleIndex: number, direction: "up" | "down") => {
    const sorted = layout.filter(w => w.visible).sort((a, b) => a.order - b.order);
    const targetIndex = direction === "up" ? visibleIndex - 1 : visibleIndex + 1;
    if (targetIndex < 0 || targetIndex >= sorted.length) return;
    moveWidget(sorted[visibleIndex].order, sorted[targetIndex].order);
  }, [layout, moveWidget]);

  // ── Toggle visibility ──────────────────────────────────────────────────────

  const toggleWidget = useCallback((id: WidgetId) => {
    const meta = getWidgetMeta(id);
    if (meta.mandatory) return;
    setLayout(prev => prev.map(w => w.id === id ? { ...w, visible: !w.visible } : w));
  }, []);

  const addWidget = useCallback((id: WidgetId) => {
    setLayout(prev => {
      const maxOrder = Math.max(...prev.map(w => w.order));
      return prev.map(w => w.id === id ? { ...w, visible: true, order: maxOrder + 1 } : w);
    });
    setShowLibrary(false);
  }, []);

  // ── Drag & Drop ────────────────────────────────────────────────────────────

  const handleDragStart = useCallback((visibleIdx: number) => {
    setDragFrom(visibleIdx);
  }, []);

  const handleDragEnter = useCallback((visibleIdx: number) => {
    setDragOver(visibleIdx);
  }, []);

  const handleDragEnd = useCallback(() => {
    if (dragFrom !== null && dragOver !== null && dragFrom !== dragOver) {
      const sorted = layout.filter(w => w.visible).sort((a, b) => a.order - b.order);
      if (sorted[dragFrom] && sorted[dragOver]) {
        moveWidget(sorted[dragFrom].order, sorted[dragOver].order);
      }
    }
    setDragFrom(null);
    setDragOver(null);
  }, [dragFrom, dragOver, layout, moveWidget]);

  // ── Save ───────────────────────────────────────────────────────────────────

  const handleSave = useCallback(() => {
    startTransition(async () => {
      await saveDashboardLayout(layout);
      setSavedLayout(layout);
      setEditMode(false);
    });
  }, [layout]);

  const handleCancel = useCallback(() => {
    setLayout(savedLayout);
    setEditMode(false);
  }, [savedLayout]);

  const handleReset = useCallback(() => {
    startTransition(async () => {
      await resetDashboardLayout();
      const fresh = [...DEFAULT_LAYOUT];
      setLayout(fresh);
      setSavedLayout(fresh);
      setShowReset(false);
      setEditMode(false);
    });
  }, []);

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-5 max-w-[1400px] mx-auto">

      {/* ── Toolbar (edit mode toggle) ── */}
      <div className="flex items-center justify-end gap-2">
        {editMode ? (
          <>
            {hasChanges && (
              <span className="text-[11px] text-foreground/40 font-medium hidden sm:block">
                שינויים לא שמורים
              </span>
            )}
            <button
              onClick={() => setShowReset(true)}
              className="h-8 px-3 flex items-center gap-1.5 rounded-xl border border-border/40 text-[12px] text-foreground/50 hover:text-foreground/80 hover:border-border/70 transition-colors"
            >
              <RotateCcw className="h-3 w-3" />
              <span className="hidden sm:inline">ברירת מחדל</span>
            </button>
            {hiddenWidgets.length > 0 && (
              <button
                onClick={() => setShowLibrary(true)}
                className="h-8 px-3 flex items-center gap-1.5 rounded-xl border border-accent/30 bg-accent/5 text-[12px] text-accent hover:bg-accent/10 transition-colors"
              >
                <Plus className="h-3 w-3" />
                <span>הוסף</span>
              </button>
            )}
            <button
              onClick={handleCancel}
              className="h-8 px-3 flex items-center gap-1.5 rounded-xl border border-border/40 text-[12px] text-foreground/50 hover:bg-foreground/[0.04] transition-colors"
            >
              <X className="h-3 w-3" />
              <span>ביטול</span>
            </button>
            <button
              onClick={handleSave}
              disabled={isPending}
              className="h-8 px-4 flex items-center gap-1.5 rounded-xl bg-foreground text-background text-[12px] font-semibold hover:bg-foreground/90 disabled:opacity-60 transition-all"
            >
              <Check className="h-3.5 w-3.5" />
              <span>{isPending ? "שומר..." : "שמור"}</span>
            </button>
          </>
        ) : (
          <button
            onClick={() => setEditMode(true)}
            className="h-8 px-3 flex items-center gap-1.5 rounded-xl border border-border/40 text-[12px] text-foreground/40 hover:text-foreground/70 hover:border-border/60 transition-colors"
          >
            <Settings2 className="h-3.5 w-3.5" />
            <span>התאם אישית</span>
          </button>
        )}
      </div>

      {/* ── Widget list ── */}
      <motion.div
        className="space-y-5"
        variants={sv}
        initial="hidden"
        animate="show"
      >
        {visibleWidgets.map((widgetConfig, idx) => {
          const isDragging = dragFrom === idx;
          const isDropTarget = dragOver === idx && dragFrom !== null && dragFrom !== idx;

          return (
            <motion.div
              key={widgetConfig.id}
              variants={fv}
              className={`relative transition-all duration-200 ${
                editMode ? "cursor-default" : ""
              } ${isDragging ? "opacity-50 scale-[0.98]" : ""} ${
                isDropTarget ? "ring-2 ring-accent/40 rounded-2xl" : ""
              }`}
              onDragOver={editMode ? (e) => { e.preventDefault(); handleDragEnter(idx); } : undefined}
            >
              {editMode && (
                <EditOverlay
                  config={widgetConfig}
                  index={idx}
                  total={visibleWidgets.length}
                  onMoveUp={() => moveByIndex(idx, "up")}
                  onMoveDown={() => moveByIndex(idx, "down")}
                  onToggle={() => toggleWidget(widgetConfig.id)}
                  onDragStart={() => handleDragStart(idx)}
                  onDragEnter={() => handleDragEnter(idx)}
                  onDragEnd={handleDragEnd}
                />
              )}
              {/* Widget content */}
              <div className={editMode ? "pointer-events-none select-none" : ""}>
                <WidgetRenderer id={widgetConfig.id} props={renderProps} />
              </div>
            </motion.div>
          );
        })}

        {/* Empty state */}
        {visibleWidgets.length === 0 && (
          <motion.div
            variants={fv}
            className="flex flex-col items-center justify-center py-20 gap-4 rounded-2xl border border-dashed border-border/40"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-muted/30">
              <Eye className="h-5 w-5 text-foreground/20" strokeWidth={1.5} />
            </div>
            <div className="text-center">
              <p className="text-[13.5px] font-semibold text-foreground/40">הדשבורד ריק</p>
              <p className="text-[11.5px] text-foreground/30 mt-0.5">הוסף ווידג&apos;טים דרך כפתור &ldquo;הוסף&rdquo;</p>
            </div>
            {editMode && (
              <button
                onClick={() => setShowLibrary(true)}
                className="flex items-center gap-1.5 px-4 h-9 rounded-xl bg-foreground text-background text-[12.5px] font-semibold hover:bg-foreground/90 transition-colors"
              >
                <Plus className="h-3.5 w-3.5" /> הוסף ווידג&apos;ט
              </button>
            )}
          </motion.div>
        )}
      </motion.div>

      {/* ── Widget Library ── */}
      {showLibrary && (
        <WidgetLibrary
          hiddenWidgets={hiddenWidgets}
          onAdd={addWidget}
          onClose={() => setShowLibrary(false)}
        />
      )}

      {/* ── Reset Confirm ── */}
      {showReset && (
        <ResetConfirmDialog
          onConfirm={handleReset}
          onCancel={() => setShowReset(false)}
        />
      )}
    </div>
  );
}
