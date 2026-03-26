"use client";

import { useState, useRef, useEffect, useId } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowRight, Wand2, Send, Sparkles, Save, ChevronDown,
  Youtube, Instagram, Tv, Podcast, Megaphone, Facebook, Loader2, Check,
  MessageSquare, Film, AlignLeft, FileText, Plus, Trash2,
  Eye, EyeOff, Image, Type, LayoutGrid, X,
  ChevronsUpDown, ChevronUp, ChevronDown as ChevronDn,
  SlidersHorizontal, Download,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { updateScript } from "@/lib/actions/script-actions";
import { ScriptCallSheet } from "./script-call-sheet";
import { UpgradeDialog } from "@/app/components/shared/upgrade-dialog";
import { useT } from "@/lib/i18n";

// ─── Types ────────────────────────────────────────────────────────────────────

type ShotItem = {
  id: string;
  shotNum: number;
  customShotNum: string;
  startTime: string;
  endTime: string;
  frameUrl: string;
  shotSize: string;
  duration: string;
  content: string;
  dialogues: string;
  note: string;
  sound: string;
  shotType: string;
  lens: string;
  movement: string;
  equipment: string;
  frameRate: string;
  lighting: string;
  castId: string;
  prop: string;
  clothing: string;
  makeup: string;
};

type DisplayMode = "image_text" | "storyboard";
type FoldMode = "unfold" | "fold";
type ShotOrdering = "asc" | "desc";
type ChatMsg = { role: "user" | "model"; text: string };
type Tab = "script" | "shotlist" | "callsheet";

type Script = {
  id: string; title: string; content: string; platform: string;
  duration: string; notes: string; shotListData: string;
  project: { id: string; title: string } | null;
  client: { id: string; name: string } | null;
};

// ─── Column Definitions ───────────────────────────────────────────────────────

type ColDef = { id: keyof ShotItem; label: string; defaultVisible: boolean };

const COLUMNS: ColDef[] = [
  { id: "shotNum",    label: "SHOT",       defaultVisible: true  },
  { id: "frameUrl",   label: "FRAME",      defaultVisible: true  },
  { id: "content",    label: "CONTENT",    defaultVisible: true  },
  { id: "shotSize",   label: "SHOT SIZE",  defaultVisible: true  },
  { id: "lens",       label: "LENS",       defaultVisible: true  },
  { id: "movement",   label: "MOVEMENT",   defaultVisible: true  },
  { id: "startTime",  label: "START TIME", defaultVisible: false },
  { id: "endTime",    label: "END TIME",   defaultVisible: false },
  { id: "duration",   label: "DURATION",   defaultVisible: false },
  { id: "dialogues",  label: "DIALOGUES",  defaultVisible: false },
  { id: "note",       label: "NOTE",       defaultVisible: false },
  { id: "sound",      label: "SOUND",      defaultVisible: false },
  { id: "shotType",   label: "SHOT TYPE",  defaultVisible: false },
  { id: "equipment",  label: "EQUIPMENT",  defaultVisible: false },
  { id: "frameRate",  label: "FPS",        defaultVisible: false },
  { id: "lighting",   label: "LIGHTING",   defaultVisible: false },
  { id: "castId",     label: "CAST",       defaultVisible: false },
  { id: "prop",       label: "PROP",       defaultVisible: false },
  { id: "clothing",   label: "CLOTHING",   defaultVisible: false },
  { id: "makeup",     label: "MAKEUP",     defaultVisible: false },
];

// ─── Dropdown Options ─────────────────────────────────────────────────────────

const SHOT_SIZE_OPTS = ["WIDE", "MED", "CU", "ECU", "MACRO"];
const SOUND_OPTS = ["Sync", "Mute", "VO", "SFX"];
const SHOT_TYPE_OPTS = ["Establishing", "Insert", "POV", "OTS", "Cutaway", "B-Roll"];
const LENS_OPTS = [
  "8mm", "12mm", "14mm", "16mm", "20mm", "24mm", "28mm", "35mm",
  "40mm", "50mm", "85mm", "100mm", "135mm", "200mm",
  "16-35mm", "24-70mm", "70-200mm",
];
const MOVEMENT_OPTS = ["Static", "Handheld", "Gimbal", "Slider", "Drone", "Dolly", "Steadicam"];
const FPS_OPTS = ["23.98", "24", "25", "29.97", "30", "48", "50", "60", "100", "120"];

function getPlatforms(t: ReturnType<typeof useT>) {
  return [
    { value: "youtube",    label: "YouTube",          icon: Youtube,   color: "text-red-500" },
    { value: "tiktok",     label: "TikTok",           icon: Tv,        color: "text-foreground" },
    { value: "instagram",  label: "Instagram",        icon: Instagram, color: "text-pink-500" },
    { value: "podcast",    label: t.scriptEditor.podcast,    icon: Podcast,   color: "text-purple-500" },
    { value: "commercial", label: t.scriptEditor.commercial, icon: Megaphone, color: "text-blue-500" },
    { value: "facebook",   label: "Facebook",         icon: Facebook,  color: "text-blue-600" },
  ];
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function newShot(num: number): ShotItem {
  return {
    id: Math.random().toString(36).slice(2),
    shotNum: num, customShotNum: String(num),
    startTime: "", endTime: "", frameUrl: "",
    shotSize: "", duration: "", content: "",
    dialogues: "", note: "", sound: "", shotType: "",
    lens: "", movement: "", equipment: "", frameRate: "",
    lighting: "", castId: "", prop: "", clothing: "", makeup: "",
  };
}

function autoResize(el: HTMLTextAreaElement) {
  el.style.height = "auto";
  el.style.height = el.scrollHeight + "px";
}

// ─── Inline cell helpers ──────────────────────────────────────────────────────

const inputCls = "w-full rounded border border-transparent bg-transparent px-1.5 py-0.5 text-xs text-foreground focus:outline-none focus:border-border focus:bg-background transition-colors";
const selectCls = inputCls + " cursor-pointer";

function ComboCell({ value, opts, onChange, placeholder }: {
  value: string; opts: string[]; onChange: (v: string) => void; placeholder?: string;
}) {
  const [editing, setEditing] = useState(false);
  if (editing) {
    return (
      <input
        autoFocus
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onBlur={() => {
          const v = value.trim();
          if (v && /^\d+$/.test(v)) onChange(v + "mm");
          else if (v && /^\d+-\d+$/.test(v)) onChange(v + "mm");
          setEditing(false);
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            const v = value.trim();
            if (v && /^\d+$/.test(v)) onChange(v + "mm");
            else if (v && /^\d+-\d+$/.test(v)) onChange(v + "mm");
            setEditing(false);
          }
        }}
        placeholder={placeholder ?? "—"}
        className={inputCls}
      />
    );
  }
  return (
    <select
      value={opts.includes(value) ? value : (value ? "__custom__" : "")}
      onChange={(e) => { if (e.target.value === "__custom__") { setEditing(true); } else { onChange(e.target.value); } }}
      onDoubleClick={() => setEditing(true)}
      className={selectCls}
    >
      <option value="">{placeholder ?? "—"}</option>
      {opts.map((o) => <option key={o} value={o}>{o}</option>)}
      {value && !opts.includes(value) && <option value="__custom__">{value}</option>}
    </select>
  );
}

function SelectCell({ value, opts, onChange }: { value: string; opts: string[]; onChange: (v: string) => void }) {
  return (
    <select value={value} onChange={(e) => onChange(e.target.value)} className={selectCls}>
      <option value="">—</option>
      {opts.map((o) => <option key={o} value={o}>{o}</option>)}
    </select>
  );
}

function LensInput({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <input
      value={value}
      onChange={(e) => onChange(e.target.value)}
      onBlur={(e) => {
        const v = e.target.value.trim();
        if (v && /^\d+$/.test(v)) onChange(v + "mm");
        if (v && /^\d+-\d+$/.test(v)) onChange(v + "mm");
      }}
      placeholder={placeholder ?? "—"}
      className={inputCls}
    />
  );
}

function InputCell({ value, onChange, placeholder, type = "text" }: {
  value: string; onChange: (v: string) => void; placeholder?: string; type?: string;
}) {
  return (
    <input type={type} value={value} onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder} className={inputCls} />
  );
}

// ─── Shot Row ─────────────────────────────────────────────────────────────────

function ShotTableRow({ shot, idx, visibleCols, showFrames, foldMode, customShotNo, rowHeight, onUpdate, onDelete, onRowResize }: {
  shot: ShotItem;
  idx: number;
  visibleCols: Set<string>;
  showFrames: boolean;
  foldMode: FoldMode;
  customShotNo: boolean;
  rowHeight?: number;
  onUpdate: (id: string, field: keyof ShotItem, value: string) => void;
  onDelete: (id: string) => void;
  onRowResize?: (id: string, height: number) => void;
}) {
  const he = useT();
  const upd = (field: keyof ShotItem) => (v: string) => onUpdate(shot.id, field, v);
  const rowBg = idx % 2 === 0 ? "bg-card" : "bg-muted/50";
  const rowH = foldMode === "fold" ? "h-8" : "";
  const overflow = foldMode === "fold" ? "overflow-hidden" : "";
  const cellPad = "px-2 py-1.5";

  function cell(colId: string, content: React.ReactNode) {
    if (!visibleCols.has(colId)) return null;
    return <td key={colId} className={`${cellPad} ${overflow} ${foldMode === "fold" ? "max-h-8" : ""}`}>{content}</td>;
  }

  const showFrame = showFrames && visibleCols.has("frameUrl");

  return (
    <tr className={`border-b border-border hover:bg-blue-50/20 transition-colors group ${rowBg} ${rowH}`}
      style={rowHeight ? { height: rowHeight } : undefined}
    >
      {/* Shot # */}
      {visibleCols.has("shotNum") && (
        <td className={`${cellPad} w-14 text-center`}>
          {customShotNo
            ? <input value={shot.customShotNum} onChange={(e) => onUpdate(shot.id, "customShotNum", e.target.value)}
                className="w-full text-center rounded border border-transparent bg-transparent px-1 py-0.5 text-xs font-bold text-muted-foreground focus:outline-none focus:border-border focus:bg-background" />
            : <span className="text-xs font-bold text-muted-foreground">{shot.shotNum}</span>
          }
        </td>
      )}

      {/* Frame / storyboard thumbnail */}
      {showFrame && (
        <td className={`${cellPad} w-24`}>
          {shot.frameUrl ? (
            <div className="relative group/frame">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={shot.frameUrl} alt="" className="h-12 w-20 rounded object-cover border border-border" />
              <button onClick={() => onUpdate(shot.id, "frameUrl", "")}
                className="absolute top-0 right-0 hidden group-hover/frame:flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-white text-[9px]">×</button>
            </div>
          ) : (
            <label className="flex h-10 w-20 cursor-pointer flex-col items-center justify-center rounded border-2 border-dashed border-border text-muted-foreground hover:border-border hover:text-muted-foreground transition-colors">
              <Image className="h-3.5 w-3.5 mb-0.5" />
              <span className="text-[9px]">{he.scriptEditor.addFrame}</span>
              <input type="file" accept="image/*" className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  const reader = new FileReader();
                  reader.onload = () => onUpdate(shot.id, "frameUrl", reader.result as string);
                  reader.readAsDataURL(file);
                  e.target.value = "";
                }} />
            </label>
          )}
        </td>
      )}

      {cell("content", <InputCell value={shot.content} onChange={upd("content")} placeholder={he.scriptEditor.action} />)}
      {cell("shotSize", <SelectCell value={shot.shotSize} opts={SHOT_SIZE_OPTS} onChange={upd("shotSize")} />)}
      {cell("lens", <ComboCell value={shot.lens} opts={LENS_OPTS} onChange={upd("lens")} placeholder={he.scriptEditor.lensPlaceholder} />)}
      {cell("movement", <SelectCell value={shot.movement} opts={MOVEMENT_OPTS} onChange={upd("movement")} />)}
      {cell("startTime", <InputCell type="time" value={shot.startTime} onChange={upd("startTime")} />)}
      {cell("endTime", <InputCell type="time" value={shot.endTime} onChange={upd("endTime")} />)}
      {cell("duration", <InputCell value={shot.duration} onChange={upd("duration")} placeholder="00:30" />)}
      {cell("dialogues", <InputCell value={shot.dialogues} onChange={upd("dialogues")} placeholder={he.scriptEditor.dialoguePlaceholder} />)}
      {cell("note", <InputCell value={shot.note} onChange={upd("note")} placeholder={he.scriptEditor.notePlaceholder} />)}
      {cell("sound", <InputCell value={shot.sound} onChange={upd("sound")} placeholder={he.scriptEditor.soundPlaceholder ?? "סאונד..."} />)}
      {cell("shotType", <SelectCell value={shot.shotType} opts={SHOT_TYPE_OPTS} onChange={upd("shotType")} />)}
      {cell("equipment", <InputCell value={shot.equipment} onChange={upd("equipment")} placeholder={he.scriptEditor.equipmentPlaceholder} />)}
      {cell("frameRate", <SelectCell value={shot.frameRate} opts={FPS_OPTS} onChange={upd("frameRate")} />)}
      {cell("lighting", <InputCell value={shot.lighting} onChange={upd("lighting")} placeholder={he.scriptEditor.lightingPlaceholder} />)}
      {cell("castId", <InputCell value={shot.castId} onChange={upd("castId")} placeholder={he.scriptEditor.actorPlaceholder} />)}
      {cell("prop", <InputCell value={shot.prop} onChange={upd("prop")} placeholder={he.scriptEditor.propPlaceholder} />)}
      {cell("clothing", <InputCell value={shot.clothing} onChange={upd("clothing")} placeholder={he.scriptEditor.costumePlaceholder} />)}
      {cell("makeup", <InputCell value={shot.makeup} onChange={upd("makeup")} placeholder={he.scriptEditor.makeupPlaceholder} />)}

      {/* Delete + Row resize */}
      <td className={`${cellPad} w-10 text-center`}>
        <div className="flex flex-col items-center gap-1">
          <button onClick={() => onDelete(shot.id)}
            className="p-1 text-gray-200 hover:text-red-500 transition-colors opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto">
            <Trash2 className="h-3.5 w-3.5" />
          </button>
          {onRowResize && (
            <div
              className="w-8 h-1 rounded-full bg-border hover:bg-blue-400 cursor-row-resize transition-colors"
              title="גרור למתיחה"
              onMouseDown={(e) => {
                e.preventDefault();
                const tr = e.currentTarget.closest("tr")!;
                const startY = e.clientY;
                const startH = tr.offsetHeight;
                const onMove = (ev: MouseEvent) => {
                  onRowResize(shot.id, Math.max(32, startH + (ev.clientY - startY)));
                };
                const onUp = () => { document.removeEventListener("mousemove", onMove); document.removeEventListener("mouseup", onUp); };
                document.addEventListener("mousemove", onMove);
                document.addEventListener("mouseup", onUp);
              }}
            />
          )}
        </div>
      </td>
    </tr>
  );
}

// ─── Storyboard Card ──────────────────────────────────────────────────────────

function StoryboardCard({ shot, customShotNo, showFrames, onUpdate, onDelete }: {
  shot: ShotItem; customShotNo: boolean; showFrames: boolean;
  onUpdate: (id: string, field: keyof ShotItem, value: string) => void;
  onDelete: (id: string) => void;
}) {
  const he = useT();
  return (
    <div className="group rounded-xl border border-border bg-card overflow-hidden shadow-sm hover:shadow-md transition-shadow">
      {/* Frame */}
      {showFrames && <div className="relative bg-muted h-36">
        {shot.frameUrl ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={shot.frameUrl} alt="" className="h-full w-full object-cover" />
            <button onClick={() => onUpdate(shot.id, "frameUrl", "")}
              className="absolute top-1.5 right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-black/60 text-background text-xs hover:bg-red-500 transition-colors">×</button>
          </>
        ) : (
          <label className="flex h-full w-full cursor-pointer flex-col items-center justify-center text-muted-foreground hover:text-muted-foreground hover:bg-gray-200 transition-colors">
            <Image className="h-6 w-6 mb-1" />
            <span className="text-xs">{he.scriptEditor.addImageStoryboard}</span>
            <input type="file" accept="image/*" className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                const reader = new FileReader();
                reader.onload = () => onUpdate(shot.id, "frameUrl", reader.result as string);
                reader.readAsDataURL(file);
                e.target.value = "";
              }} />
          </label>
        )}
        <div className="absolute top-1.5 left-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-black/70 text-background text-xs font-bold">
          {customShotNo ? shot.customShotNum : shot.shotNum}
        </div>
      </div>}
      {/* Info */}
      <div className="p-3 space-y-1.5">
        <div className="flex items-start justify-between gap-1">
          <div className="flex gap-1.5 flex-wrap flex-1">
            {shot.shotSize && <span className="rounded-full bg-indigo-50 text-indigo-600 px-2 py-0.5 text-[10px] font-semibold">{shot.shotSize}</span>}
            {shot.lens && <span className="rounded-full bg-muted text-muted-foreground px-2 py-0.5 text-[10px] font-semibold">{shot.lens}</span>}
            {shot.movement && <span className="rounded-full bg-muted text-muted-foreground px-2 py-0.5 text-[10px] font-semibold">{shot.movement}</span>}
          </div>
          <button
            onClick={() => onDelete(shot.id)}
            className="flex h-5 w-5 shrink-0 items-center justify-center rounded text-muted-foreground hover:text-red-500 hover:bg-red-50 transition-colors"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
        <textarea
          value={shot.content}
          onChange={(e) => onUpdate(shot.id, "content", e.target.value)}
          placeholder={he.scriptEditor.actionDesc}
          rows={2}
          className="w-full resize-none rounded-lg border border-transparent bg-transparent px-1 py-0.5 text-xs text-foreground focus:outline-none focus:border-border focus:bg-muted font-[inherit] transition-colors"
        />
      </div>
    </div>
  );
}

// ─── Column Visibility Menu ───────────────────────────────────────────────────

function ColumnMenu({ visibleCols, onToggle, onClose }: {
  visibleCols: Set<string>;
  onToggle: (id: string) => void;
  onClose: () => void;
}) {
  const he = useT();
  return (
    <div className="absolute left-0 top-full z-50 mt-1 w-52 rounded-xl border border-border bg-card py-2 shadow-xl">
      <div className="px-3 py-1.5 text-[10px] font-semibold text-muted-foreground uppercase tracking-widest">{he.scriptEditor.filterColumns}</div>
      {COLUMNS.map((col) => {
        const visible = visibleCols.has(col.id);
        return (
          <button key={col.id} onClick={() => onToggle(col.id)}
            className="flex w-full items-center gap-2.5 px-3 py-2 text-xs hover:bg-muted transition-colors">
            {visible
              ? <Eye className="h-3.5 w-3.5 text-foreground" />
              : <EyeOff className="h-3.5 w-3.5 text-muted-foreground" />}
            <span className={visible ? "text-foreground font-medium" : "text-muted-foreground"}>{col.label}</span>
          </button>
        );
      })}
      <div className="mx-3 mt-1 border-t border-border pt-1">
        <button onClick={onClose} className="w-full rounded-lg py-1.5 text-xs text-muted-foreground hover:text-muted-foreground transition-colors">{he.scriptEditor.close}</button>
      </div>
    </div>
  );
}

// ─── View Settings Popover ────────────────────────────────────────────────────

function ViewSettingsMenu({ displayMode, setDisplayMode, foldMode, setFoldMode, customShotNo, setCustomShotNo, shotOrdering, setShotOrdering, showFrames, setShowFrames, onClose, isPro, onCinemaLocked }: {
  displayMode: DisplayMode; setDisplayMode: (m: DisplayMode) => void;
  foldMode: FoldMode; setFoldMode: (m: FoldMode) => void;
  customShotNo: boolean; setCustomShotNo: (v: boolean) => void;
  showFrames: boolean; setShowFrames: (v: boolean) => void;
  shotOrdering: ShotOrdering; setShotOrdering: (o: ShotOrdering) => void;
  onClose: () => void;
  isPro: boolean;
  onCinemaLocked: () => void;
}) {
  const he = useT();
  const sectionCls = "px-4 py-3 border-b border-border last:border-0";
  const labelCls = "mb-3 text-[10px] font-semibold text-muted-foreground uppercase tracking-widest";

  function ModeBtn({ active, onClick, icon, label, locked }: { active: boolean; onClick: () => void; icon: React.ReactNode; label: string; locked?: boolean }) {
    return (
      <button onClick={onClick}
        className={`relative flex flex-col items-center gap-1.5 flex-1 rounded-xl py-3 border transition-all ${
          active ? "border-gray-900 bg-foreground text-background" : "border-border text-muted-foreground hover:border-border hover:bg-muted"
        }`}>
        {locked && (
          <span className="absolute top-1 left-1 text-amber-400">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-3 w-3"><path d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"/></svg>
          </span>
        )}
        <div className="text-current">{icon}</div>
        <span className="text-[10px] font-medium leading-tight text-center">{label}</span>
      </button>
    );
  }

  return (
    <div className="absolute left-0 top-full z-50 mt-1 w-64 rounded-xl border border-border bg-card shadow-xl overflow-hidden">
      {/* Display Mode */}
      <div className={sectionCls}>
        <div className={labelCls}>{he.scriptEditor.displayMode}</div>
        <div className="flex gap-2">
          <ModeBtn active={displayMode === "storyboard"} onClick={() => setDisplayMode("storyboard")}
            icon={<LayoutGrid className="h-5 w-5" />} label={he.scriptEditor.storyboard} />
          <ModeBtn active={displayMode === "image_text"}
            onClick={() => isPro ? setDisplayMode("image_text") : onCinemaLocked()}
            icon={<Image className="h-5 w-5" />} label={he.scriptEditor.cinematic}
            locked={!isPro} />
        </div>
      </div>

      {/* Show Frames toggle */}
      <div className={sectionCls}>
        <div className="flex items-center justify-between">
          <div>
            <div className={labelCls + " mb-0"}>{he.scriptEditor.showFrames ?? "הצג תמונה"}</div>
          </div>
          <button onClick={() => setShowFrames(!showFrames)}
            className={`relative h-5 w-9 rounded-full transition-colors ${showFrames ? "bg-foreground" : "bg-gray-200"}`}>
            <span className={`absolute top-0.5 h-4 w-4 rounded-full bg-card shadow transition-transform ${showFrames ? "translate-x-4" : "translate-x-0.5"}`} />
          </button>
        </div>
      </div>

      {/* Fold Mode */}
      <div className={sectionCls}>
        <div className={labelCls}>{he.scriptEditor.foldRows}</div>
        <div className="flex gap-2">
          <button onClick={() => setFoldMode("unfold")}
            className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg border py-2 text-xs font-medium transition-all ${
              foldMode === "unfold" ? "border-gray-900 bg-foreground text-background" : "border-border text-muted-foreground hover:border-border"
            }`}>
            <ChevronsUpDown className="h-3.5 w-3.5" />{he.scriptEditor.open}
          </button>
          <button onClick={() => setFoldMode("fold")}
            className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg border py-2 text-xs font-medium transition-all ${
              foldMode === "fold" ? "border-gray-900 bg-foreground text-background" : "border-border text-muted-foreground hover:border-border"
            }`}>
            <ChevronDn className="h-3.5 w-3.5" />{he.scriptEditor.folded}
          </button>
        </div>
      </div>

      {/* Custom Shot No */}
      <div className={sectionCls}>
        <div className="flex items-center justify-between">
          <div>
            <div className={labelCls + " mb-0"}>{he.scriptEditor.customShotNo}</div>
            <p className="text-[10px] text-muted-foreground mt-0.5">{he.scriptEditor.customShotNoDesc}</p>
          </div>
          <button onClick={() => setCustomShotNo(!customShotNo)}
            className={`relative h-5 w-9 rounded-full transition-colors ${customShotNo ? "bg-foreground" : "bg-gray-200"}`}>
            <span className={`absolute top-0.5 h-4 w-4 rounded-full bg-card shadow transition-transform ${customShotNo ? "translate-x-4" : "translate-x-0.5"}`} />
          </button>
        </div>
      </div>

      {/* Shot Ordering */}
      <div className={sectionCls}>
        <div className={labelCls}>{he.scriptEditor.shotOrder}</div>
        <div className="flex gap-2">
          <button onClick={() => setShotOrdering("asc")}
            className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg border py-2 text-xs font-medium transition-all ${
              shotOrdering === "asc" ? "border-gray-900 bg-foreground text-background" : "border-border text-muted-foreground hover:border-border"
            }`}>
            <ChevronUp className="h-3.5 w-3.5" />{he.scriptEditor.ascending}
          </button>
          <button onClick={() => setShotOrdering("desc")}
            className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg border py-2 text-xs font-medium transition-all ${
              shotOrdering === "desc" ? "border-gray-900 bg-foreground text-background" : "border-border text-muted-foreground hover:border-border"
            }`}>
            <ChevronDn className="h-3.5 w-3.5" />{he.scriptEditor.descending}
          </button>
        </div>
      </div>

      <div className="px-4 py-2">
        <button onClick={onClose} className="w-full rounded-lg py-1.5 text-xs text-muted-foreground hover:text-muted-foreground transition-colors">{he.scriptEditor.close}</button>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function ScriptEditorClient({
  script, clients, projects, isPro,
}: {
  script: Script;
  clients: { id: string; name: string }[];
  projects: { id: string; title: string }[];
  isPro: boolean;
}) {
  const he = useT();
  const router = useRouter();

  const PLATFORMS = getPlatforms(he);

  const [title, setTitle] = useState(script.title);
  const [content, setContent] = useState(script.content);
  const [platform, setPlatform] = useState(script.platform);
  const [linkedProjectId, setLinkedProjectId] = useState(script.project?.id ?? "");
  const [linkedClientId, setLinkedClientId] = useState(script.client?.id ?? "");
  const [showProjectMenu, setShowProjectMenu] = useState(false);
  const [showClientMenu, setShowClientMenu] = useState(false);
  const [duration] = useState(script.duration); // kept for save compatibility, no UI
  const isPredefinedPlatform = PLATFORMS.some((p: { value: string }) => p.value === platform);
  const [customPlatformMode, setCustomPlatformMode] = useState(!isPredefinedPlatform && !!platform);
  const [shotList, setShotList] = useState<ShotItem[]>(() => {
    try { return JSON.parse(script.shotListData || "[]"); } catch { return []; }
  });
  const [activeTab, setActiveTab] = useState<Tab>("script");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // Shot list view state
  const [visibleCols, setVisibleCols] = useState<Set<string>>(
    () => new Set(COLUMNS.filter((c) => c.defaultVisible).map((c) => c.id))
  );
  const [displayMode, setDisplayMode] = useState<DisplayMode>("storyboard");
  const [showFrames, setShowFrames] = useState(true);
  const [colWidths, setColWidths] = useState<Record<string, number>>({});
  const [rowHeights, setRowHeights] = useState<Record<string, number>>({});
  const [cinemaUpgradeOpen, setCinemaUpgradeOpen] = useState(false);
  const [callsheetUpgradeOpen, setCallsheetUpgradeOpen] = useState(false);
  const [storyboardUpgradeOpen, setStoryboardUpgradeOpen] = useState(false);
  const [scriptCtxMenu, setScriptCtxMenu] = useState<{ x: number; y: number; text: string } | null>(null);
  const [foldMode, setFoldMode] = useState<FoldMode>("unfold");
  const [customShotNo, setCustomShotNo] = useState(false);
  const [shotOrdering, setShotOrdering] = useState<ShotOrdering>("asc");
  const [showColMenu, setShowColMenu] = useState(false);
  const [showViewMenu, setShowViewMenu] = useState(false);
  const [showPlatformMenu, setShowPlatformMenu] = useState(false);

  // AI state
  const [aiMode, setAiMode] = useState<"idle" | "generate">("idle");
  const [genInstruction, setGenInstruction] = useState("");
  const [aiLoading, setAiLoading] = useState(false);

  // Chat state
  const [chatOpen, setChatOpen] = useState(false);
  const [aiSidebarOpen, setAiSidebarOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const chatInputRef = useRef<HTMLTextAreaElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const saveTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Auto-resize textarea on mount
  useEffect(() => {
    if (textareaRef.current) autoResize(textareaRef.current);
  }, []);

  // Close menus on outside click
  useEffect(() => {
    if (!showColMenu && !showViewMenu) return;
    function handler(e: MouseEvent) {
      const target = e.target as Element;
      if (!target.closest("[data-menu]")) { setShowColMenu(false); setShowViewMenu(false); }
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [showColMenu, showViewMenu]);

  // Auto-save
  useEffect(() => {
    if (saveTimeout.current) clearTimeout(saveTimeout.current);
    setSaved(false);
    saveTimeout.current = setTimeout(async () => {
      setSaving(true);
      await updateScript(script.id, {
        title, content, platform, duration,
        shotListData: JSON.stringify(shotList),
        projectId: linkedProjectId || undefined,
        clientId: linkedClientId || undefined,
      });
      setSaving(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    }, 1500);
    return () => { if (saveTimeout.current) clearTimeout(saveTimeout.current); };
  }, [title, content, platform, duration, shotList, linkedProjectId, linkedClientId, script.id]);

  // Scroll chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, chatLoading]);

  // AI
  async function callAI(mode: "generate" | "upgrade") {
    setAiLoading(true);
    try {
      const body = mode === "generate"
        ? { mode, content, instruction: genInstruction, platform, duration }
        : { mode, content, platform, duration };
      const res = await fetch("/api/ai/script", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setContent(data.result);
      if (textareaRef.current) { textareaRef.current.value = data.result; autoResize(textareaRef.current); }
      setAiMode("idle"); setGenInstruction("");
    } catch (e) { console.error(e); }
    finally { setAiLoading(false); }
  }

  async function sendChat() {
    const text = chatInput.trim();
    if (!text || chatLoading) return;
    const newMessages: ChatMsg[] = [...messages, { role: "user", text }];
    setMessages(newMessages); setChatInput(""); setChatLoading(true);
    try {
      const res = await fetch("/api/ai/script", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode: "chat", content, platform, duration, messages: newMessages }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      if (data.updatedScript) {
        setContent(data.updatedScript);
        if (textareaRef.current) { textareaRef.current.value = data.updatedScript; autoResize(textareaRef.current); }
      }
      setMessages([...newMessages, { role: "model", text: data.result }]);
    } catch {
      setMessages([...newMessages, { role: "model", text: he.scriptEditor.errorTryAgain }]);
    } finally { setChatLoading(false); }
  }

  // Script context menu — right-click selected text → add to shot list
  function handleScriptContextMenu(e: React.MouseEvent<HTMLTextAreaElement>) {
    const selected = window.getSelection()?.toString().trim() ||
      e.currentTarget.value.substring(e.currentTarget.selectionStart, e.currentTarget.selectionEnd).trim();
    if (!selected) return; // no selection → use native menu
    e.preventDefault();
    setScriptCtxMenu({ x: e.clientX, y: e.clientY, text: selected });
  }

  function addSelectedTextToShotList(text: string) {
    if (!isPro && displayMode === "storyboard" && shotList.length >= STORYBOARD_FREE_LIMIT) {
      setStoryboardUpgradeOpen(true);
      return;
    }
    const shot: ShotItem = { ...newShot(shotList.length + 1), content: text };
    setShotList((prev) => [...prev, shot]);
    setActiveTab("shotlist");
    setScriptCtxMenu(null);
  }

  async function exportShotListPDF() {
    try {
      const { default: jsPDF } = await import("jspdf");
      const cols = COLUMNS.filter(c => visibleCols.has(c.id));
      const shots = shotOrdering === "desc" ? [...shotList].reverse() : shotList;

      // Use print-based approach: open a new window with styled HTML table
      const thStyle = "padding:8px 10px;text-align:right;font-size:11px;font-weight:600;color:#6b7280;border-bottom:2px solid #e5e7eb;white-space:nowrap;background:#f8fafc;";
      const tdStyleBase = "padding:7px 10px;font-size:11px;border-bottom:1px solid #e5e7eb;color:#111827;text-align:right;";

      let headerHtml = `<th style="${thStyle}">#</th>`;
      cols.forEach(col => { headerHtml += `<th style="${thStyle}">${col.label}</th>`; });

      let bodyHtml = "";
      shots.forEach((shot, idx) => {
        const bg = idx % 2 === 0 ? "#ffffff" : "#f9fafb";
        let row = `<td style="${tdStyleBase}background:${bg};font-weight:700;color:#6366f1;">${customShotNo ? shot.customShotNum : shot.shotNum}</td>`;
        cols.forEach(col => {
          const val = String((shot as Record<string, unknown>)[col.id] ?? "") || "\u2014";
          row += `<td style="${tdStyleBase}background:${bg};">${val}</td>`;
        });
        bodyHtml += `<tr>${row}</tr>`;
      });

      const html = `<!DOCTYPE html><html dir="rtl"><head><meta charset="utf-8"><title>Shot List</title>
        <style>@page{size:landscape;margin:20mm;}body{font-family:system-ui,-apple-system,sans-serif;direction:rtl;padding:0;margin:0;color:#111827;}table{width:100%;border-collapse:collapse;}</style>
        </head><body>
        <div style="padding:32px 40px;">
          <div style="border-bottom:3px solid #6366f1;padding-bottom:16px;margin-bottom:20px;display:flex;justify-content:space-between;align-items:flex-end;">
            <div style="font-size:22px;font-weight:800;">${title || "Shot List"}</div>
            <div style="font-size:12px;color:#6b7280;">${shots.length} shots</div>
          </div>
          <table><thead><tr>${headerHtml}</tr></thead><tbody>${bodyHtml}</tbody></table>
          <div style="margin-top:20px;text-align:center;font-size:10px;color:#9ca3af;">Planify</div>
        </div></body></html>`;

      const printWin = window.open("", "_blank");
      if (printWin) {
        printWin.document.write(html);
        printWin.document.close();
        setTimeout(() => { printWin.print(); }, 300);
      }
    } catch (err) {
      console.error("PDF export error:", err);
      alert("שגיאה בייצוא. נסה שוב.");
    }
  }

  const STORYBOARD_FREE_LIMIT = 5;
  const storyboardAtLimit = !isPro && displayMode === "storyboard" && shotList.length >= STORYBOARD_FREE_LIMIT;

  // Shot list
  function addShot() {
    if (!isPro && displayMode === "storyboard" && shotList.length >= STORYBOARD_FREE_LIMIT) {
      setStoryboardUpgradeOpen(true);
      return;
    }
    setShotList((prev) => [...prev, newShot(prev.length + 1)]);
  }
  function updateShot(id: string, field: keyof ShotItem, value: string) {
    setShotList((prev) => prev.map((s) => s.id === id ? { ...s, [field]: value } : s));
  }
  function deleteShot(id: string) {
    setShotList((prev) => prev.filter((s) => s.id !== id).map((s, i) => ({ ...s, shotNum: i + 1 })));
  }
  function toggleCol(id: string) {
    setVisibleCols((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }

  const orderedShots = shotOrdering === "desc" ? [...shotList].reverse() : shotList;

  const currentPlatform = PLATFORMS.find((p) => p.value === platform) ?? PLATFORMS[0];
  const PlatformIcon = currentPlatform.icon;

  const TABS: { id: Tab; label: string; Icon: React.ElementType; badge?: number }[] = [
    { id: "script",    label: he.scriptEditor.tabScript,    Icon: AlignLeft },
    { id: "shotlist",  label: he.scriptEditor.tabShotList, Icon: Film, badge: shotList.length || undefined },
    { id: "callsheet", label: he.scriptEditor.tabCallSheet,  Icon: FileText },
  ];

  // ─── Visible columns for table header ────────────────────────────────────────
  const showFrame = showFrames && visibleCols.has("frameUrl");
  const headerCols = COLUMNS.filter((c) => {
    if (c.id === "frameUrl") return showFrame;
    return visibleCols.has(c.id);
  });

  // ─── Render ──────────────────────────────────────────────────────────────────
  return (
    <>
    <UpgradeDialog
      open={cinemaUpgradeOpen}
      onClose={() => setCinemaUpgradeOpen(false)}
      feature={he.scriptEditor.cinematicFeature}
      limit={-1}
    />
    <UpgradeDialog
      open={callsheetUpgradeOpen}
      onClose={() => setCallsheetUpgradeOpen(false)}
      feature={he.scriptEditor.callSheetFeature}
      limit={-1}
    />
    <UpgradeDialog
      open={storyboardUpgradeOpen}
      onClose={() => setStoryboardUpgradeOpen(false)}
      feature={he.scriptEditor.storyboardShotsFeature}
      limit={STORYBOARD_FREE_LIMIT}
    />
    <div className="flex h-[calc(100vh-80px)] flex-col">

      {/* ── Top Bar ── */}
      <div className="flex flex-wrap items-center gap-2 md:gap-3 border-b border-border bg-card px-3 md:px-4 py-2.5 md:py-3 shrink-0">
        <button onClick={() => router.push("/scripts")}
          className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors shrink-0">
          <ArrowRight className="h-4 w-4" /><span className="hidden sm:inline">{he.scriptEditor.scriptsBack}</span>
        </button>
        <span className="text-muted-foreground hidden sm:inline">/</span>
        <input value={title} onChange={(e) => setTitle(e.target.value)}
          className="flex-1 min-w-0 bg-transparent text-sm font-semibold text-foreground outline-none placeholder:text-muted-foreground"
          placeholder={he.scriptEditor.scriptTitlePlaceholder} />
        <div className="flex items-center gap-1.5 md:gap-2 shrink-0">
          {/* Platform / Category picker — hidden on small mobile */}
          {customPlatformMode ? (
            <div className="hidden sm:flex items-center gap-1.5 rounded-lg border border-border bg-muted px-2.5 py-1.5">
              <Megaphone className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
              <input
                value={platform}
                onChange={(e) => setPlatform(e.target.value)}
                placeholder={he.scriptEditor.customPlatformPlaceholder}
                autoFocus
                className="bg-transparent text-xs text-foreground outline-none w-32 placeholder:text-muted-foreground"
              />
              <button onClick={() => { setCustomPlatformMode(false); setPlatform("youtube"); }}
                className="text-muted-foreground hover:text-muted-foreground transition-colors">
                <X className="h-3 w-3" />
              </button>
            </div>
          ) : (
            <div className="relative hidden sm:block">
              {showPlatformMenu && <div className="fixed inset-0 z-40" onClick={() => setShowPlatformMenu(false)} />}
              <button onClick={() => setShowPlatformMenu((v) => !v)}
                className="flex items-center gap-1.5 rounded-lg border border-border bg-muted px-3 py-1.5 text-xs font-medium text-muted-foreground hover:bg-muted transition-colors">
                <PlatformIcon className={`h-3.5 w-3.5 ${currentPlatform.color}`} />
                {currentPlatform.label}
                <ChevronDown className="h-3 w-3 text-muted-foreground" />
              </button>
              {showPlatformMenu && (
                <div className="absolute left-0 top-full z-50 mt-1 min-w-[150px] rounded-lg border border-border bg-card py-1 shadow-lg">
                  {PLATFORMS.map((p) => (
                    <button key={p.value} onClick={() => { setPlatform(p.value); setShowPlatformMenu(false); }}
                      className={`flex w-full items-center gap-2 px-3 py-2 text-xs hover:bg-muted ${platform === p.value ? "font-semibold text-foreground" : "text-muted-foreground"}`}>
                      <p.icon className={`h-3.5 w-3.5 ${p.color}`} />{p.label}
                    </button>
                  ))}
                  <div className="mx-2 my-1 border-t border-border" />
                  <button onClick={() => { setCustomPlatformMode(true); setPlatform(""); setShowPlatformMenu(false); }}
                    className="flex w-full items-center gap-2 px-3 py-2 text-xs text-muted-foreground hover:bg-muted">
                    <Megaphone className="h-3.5 w-3.5 text-muted-foreground" />{he.scriptEditor.other}
                  </button>
                </div>
              )}
            </div>
          )}
          {/* Client link */}
          {clients.length > 0 && (
            <div className="relative hidden sm:block">
              {showClientMenu && <div className="fixed inset-0 z-40" onClick={() => setShowClientMenu(false)} />}
              <button
                onClick={() => setShowClientMenu((v) => !v)}
                className="flex items-center gap-1.5 rounded-lg border border-border bg-muted px-3 py-1.5 text-xs font-medium text-muted-foreground hover:bg-muted transition-colors max-w-[140px]"
              >
                <span className="truncate">{linkedClientId ? (clients.find(c => c.id === linkedClientId)?.name ?? he.common.client) : `👤 ${he.common.client}`}</span>
                <ChevronDown className="h-3 w-3 text-muted-foreground shrink-0" />
              </button>
              {showClientMenu && (
                <div className="absolute left-0 top-full z-50 mt-1 min-w-[180px] rounded-lg border border-border bg-card py-1 shadow-lg max-h-48 overflow-y-auto">
                  <button
                    onClick={() => { setLinkedClientId(""); setShowClientMenu(false); }}
                    className={`flex w-full items-center px-3 py-2 text-xs hover:bg-muted ${!linkedClientId ? "font-semibold text-foreground" : "text-muted-foreground"}`}
                  >
                    {he.calendar?.noClient ?? "ללא לקוח"}
                  </button>
                  <div className="mx-2 my-1 border-t border-border" />
                  {clients.map(c => (
                    <button
                      key={c.id}
                      onClick={() => { setLinkedClientId(c.id); setShowClientMenu(false); }}
                      className={`flex w-full items-center px-3 py-2 text-xs hover:bg-muted ${linkedClientId === c.id ? "font-semibold text-foreground" : "text-muted-foreground"}`}
                    >
                      {c.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
          {/* Project link */}
          {projects.length > 0 && (
            <div className="relative hidden sm:block">
              {showProjectMenu && <div className="fixed inset-0 z-40" onClick={() => setShowProjectMenu(false)} />}
              <button
                onClick={() => setShowProjectMenu((v) => !v)}
                className="flex items-center gap-1.5 rounded-lg border border-border bg-muted px-3 py-1.5 text-xs font-medium text-muted-foreground hover:bg-muted transition-colors max-w-[140px]"
              >
                <span className="truncate">{linkedProjectId ? (projects.find(p => p.id === linkedProjectId)?.title ?? he.scriptEditor.linkedProject) : `📁 ${he.scriptEditor.assignToProject}`}</span>
                <ChevronDown className="h-3 w-3 text-muted-foreground shrink-0" />
              </button>
              {showProjectMenu && (
                <div className="absolute left-0 top-full z-50 mt-1 min-w-[180px] rounded-lg border border-border bg-card py-1 shadow-lg">
                  <button
                    onClick={() => { setLinkedProjectId(""); setShowProjectMenu(false); }}
                    className={`flex w-full items-center px-3 py-2 text-xs hover:bg-muted ${!linkedProjectId ? "font-semibold text-foreground" : "text-muted-foreground"}`}
                  >
                    {he.scriptEditor.noProject}
                  </button>
                  <div className="mx-2 my-1 border-t border-border" />
                  {projects.map(p => (
                    <button
                      key={p.id}
                      onClick={() => { setLinkedProjectId(p.id); setShowProjectMenu(false); }}
                      className={`flex w-full items-center px-3 py-2 text-xs hover:bg-muted ${linkedProjectId === p.id ? "font-semibold text-foreground" : "text-muted-foreground"}`}
                    >
                      {p.title}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : saved ? <Check className="h-3.5 w-3.5 text-green-500" /> : <Save className="h-3.5 w-3.5" />}
            <span className="hidden sm:inline">{saving ? he.scriptEditor.saving : saved ? he.scriptEditor.saved : he.scriptEditor.autoSave}</span>
          </div>
        </div>
      </div>

      {/* ── Tab Bar ── */}
      <div className="flex items-center border-b border-border bg-card px-2 md:px-4 shrink-0">
        {TABS.map(({ id, label, Icon, badge }) => {
          const locked = id === "callsheet" && !isPro;
          return (
            <button key={id}
              onClick={() => locked ? setCallsheetUpgradeOpen(true) : setActiveTab(id)}
              className={`relative flex items-center gap-1.5 px-3 md:px-4 py-2.5 text-xs md:text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                activeTab === id ? "border-foreground text-foreground" : "border-transparent text-muted-foreground hover:text-muted-foreground"
              }`}>
              <Icon className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">{label}</span>
              {locked && <span className="text-amber-400 text-[10px]">★</span>}
              {!locked && badge !== undefined && badge > 0 && (
                <span className="rounded-full bg-muted text-muted-foreground px-1.5 py-0.5 text-[10px] font-medium">{badge}</span>
              )}
            </button>
          );
        })}
      </div>

      {/* ── Content Area ── */}
      <div className="flex flex-1 overflow-hidden">

        {/* ── SCRIPT TAB ── */}
        {activeTab === "script" && (
          <>
            <div className="relative flex flex-1 flex-col overflow-hidden">
              <div className={`overflow-auto bg-muted p-3 md:p-6 ${chatOpen ? "max-h-[40vh] md:max-h-none md:flex-1" : "flex-1"}`}>
                <textarea
                  ref={textareaRef}
                  defaultValue={content}
                  onChange={(e) => { setContent(e.target.value); autoResize(e.target); }}
                  onContextMenu={handleScriptContextMenu}
                  placeholder={he.scriptEditor.scriptPlaceholder}
                  className="w-full rounded-xl border border-border bg-card p-4 md:p-6 text-base leading-8 text-foreground shadow-sm outline-none focus:border-border focus:shadow-md resize-none overflow-hidden"
                  style={{ direction: "rtl", fontFamily: "inherit", minHeight: "300px" }}
                />
                {/* Right-click context menu */}
                {scriptCtxMenu && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setScriptCtxMenu(null)} />
                    <div
                      className="fixed z-50 rounded-xl border border-border bg-card py-1.5 shadow-xl min-w-[180px]"
                      style={{ top: scriptCtxMenu.y, left: scriptCtxMenu.x }}
                      dir="rtl"
                    >
                      <button
                        className="flex w-full items-center gap-2.5 px-4 py-2 text-sm text-foreground hover:bg-muted transition-colors"
                        onClick={() => addSelectedTextToShotList(scriptCtxMenu.text)}
                      >
                        <Film className="h-3.5 w-3.5 text-muted-foreground" />
                        {he.scriptEditor.addToShotList}
                      </button>
                    </div>
                  </>
                )}
              </div>

              <button
                onClick={() => { setChatOpen((o) => !o); if (!chatOpen && window.innerWidth >= 768) setTimeout(() => chatInputRef.current?.focus(), 300); }}
                className="flex h-9 shrink-0 items-center gap-2 border-t border-border bg-card px-4 text-xs text-muted-foreground hover:bg-muted transition-colors">
                <MessageSquare className="h-3.5 w-3.5" /><span>{he.scriptEditor.aiHelp}</span>
                {messages.length > 0 && <span className="rounded-full bg-muted px-1.5 py-0.5 text-muted-foreground">{messages.length}</span>}
                <ChevronDown className={`mr-auto h-3.5 w-3.5 transition-transform duration-300 ${chatOpen ? "rotate-180" : ""}`} />
              </button>

              {/* AI floating button — hide when chat is open */}
              <div className={`absolute bottom-12 left-3 z-30 transition-opacity ${chatOpen ? "opacity-0 pointer-events-none" : "opacity-100"}`}>
                <button onClick={() => setAiSidebarOpen(!aiSidebarOpen)}
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-foreground text-background shadow-lg hover:scale-105 active:scale-95 transition-transform">
                  <Sparkles className="h-4 w-4" />
                </button>
                {aiSidebarOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setAiSidebarOpen(false)} />
                    <div className="absolute bottom-full mb-2 left-0 z-50 w-64 rounded-xl border border-border bg-card shadow-xl p-3 space-y-1">
                      {aiMode === "generate" ? (
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 mb-1">
                            <Sparkles className="h-3.5 w-3.5 text-muted-foreground" />
                            <span className="text-xs font-semibold text-foreground">{he.scriptEditor.generateScript}</span>
                          </div>
                          <textarea value={genInstruction} onChange={(e) => setGenInstruction(e.target.value)}
                            placeholder={he.scriptEditor.aiPromptPlaceholder}
                            className="w-full min-h-[70px] resize-none rounded-lg border border-border bg-muted px-3 py-2 text-xs text-foreground outline-none placeholder:text-muted-foreground"
                            autoFocus />
                          <div className="flex gap-2">
                            <Button onClick={() => { callAI("generate"); setAiSidebarOpen(false); }} disabled={aiLoading || !genInstruction.trim()} size="sm" className="flex-1 gap-1.5 text-xs">
                              {aiLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />}{he.scriptEditor.generate}
                            </Button>
                            <Button onClick={() => setAiMode("idle")} size="sm" variant="ghost" className="text-xs px-2">{he.scriptEditor.cancel}</Button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <button onClick={() => setAiMode("generate")}
                            className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-right hover:bg-muted transition-colors">
                            <Sparkles className="h-4 w-4 text-muted-foreground shrink-0" />
                            <div>
                              <p className="text-xs font-semibold text-foreground">{he.scriptEditor.generateScript}</p>
                              <p className="text-[10px] text-muted-foreground">{he.scriptEditor.fromPrompt}</p>
                            </div>
                          </button>
                          <button onClick={() => { callAI("upgrade"); setAiSidebarOpen(false); }}
                            disabled={aiLoading || !content.trim()}
                            className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-right hover:bg-muted transition-colors disabled:opacity-40">
                            <Wand2 className="h-4 w-4 text-muted-foreground shrink-0" />
                            <div>
                              <p className="text-xs font-semibold text-foreground">{he.scriptEditor.upgradeScript}</p>
                              <p className="text-[10px] text-muted-foreground">{he.scriptEditor.upgradeScriptDesc}</p>
                            </div>
                          </button>
                        </>
                      )}
                    </div>
                  </>
                )}
              </div>

              <div style={{ maxHeight: chatOpen ? "600px" : "0px" }}
                className={`${chatOpen ? "flex-1 min-h-[200px] md:flex-none md:min-h-0" : ""} flex flex-col border-t border-border bg-card overflow-hidden transition-[max-height] duration-300 ease-in-out`}>
                <div className="flex h-10 shrink-0 items-center justify-between border-b border-border px-4">
                  <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                    <MessageSquare className="h-4 w-4 text-muted-foreground" />{he.scriptEditor.writingAssistant}
                  </div>
                  <button onClick={() => setChatOpen(false)} className="text-xs text-muted-foreground hover:text-muted-foreground">{he.scriptEditor.close}</button>
                </div>
                <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
                  {messages.length === 0 && <p className="text-center text-xs text-muted-foreground pt-6">{he.scriptEditor.chatEmpty}</p>}
                  {messages.map((m, i) => (
                    <div key={i} className={`flex ${m.role === "user" ? "justify-start" : "justify-end"}`}>
                      <div className={`max-w-[78%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed whitespace-pre-wrap ${
                        m.role === "user" ? "bg-muted text-foreground rounded-tr-sm" : "bg-foreground text-background rounded-tl-sm"
                      }`}>{m.text}</div>
                    </div>
                  ))}
                  {chatLoading && (
                    <div className="flex justify-end">
                      <div className="flex items-center gap-1.5 rounded-2xl rounded-tl-sm bg-foreground px-4 py-3">
                        <span className="h-1.5 w-1.5 rounded-full bg-card/60 animate-bounce [animation-delay:0ms]" />
                        <span className="h-1.5 w-1.5 rounded-full bg-card/60 animate-bounce [animation-delay:150ms]" />
                        <span className="h-1.5 w-1.5 rounded-full bg-card/60 animate-bounce [animation-delay:300ms]" />
                      </div>
                    </div>
                  )}
                  <div ref={chatEndRef} />
                </div>
                <div className="flex items-end gap-2 border-t border-border px-3 py-2">
                  <textarea ref={chatInputRef} value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendChat(); } }}
                    placeholder={he.scriptEditor.chatPlaceholder} rows={1}
                    className="flex-1 resize-none rounded-xl border border-border bg-muted px-3 py-2 text-sm text-foreground outline-none focus:border-gray-400 placeholder:text-muted-foreground max-h-20 overflow-auto font-[inherit]"
                    style={{ lineHeight: "1.5" }} />
                  <button onClick={sendChat} disabled={!chatInput.trim() || chatLoading}
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-foreground text-background transition-opacity disabled:opacity-40 hover:bg-gray-700">
                    <Send className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>

          </>
        )}

        {/* ── SHOT LIST TAB ── */}
        {activeTab === "shotlist" && (
          <div className="flex-1 overflow-auto bg-muted flex flex-col">

            {/* Toolbar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-3 md:px-5 py-3 bg-card border-b border-border shrink-0">
              <div className="flex items-center justify-between sm:block">
                <h3 className="text-sm font-semibold text-foreground truncate">{he.scriptEditor.shotListTitle}</h3>
                <p className="text-xs text-muted-foreground">{shotList.length} {he.scriptEditor.shotsCount}</p>
              </div>
              <div className="flex items-center gap-1.5">
                {displayMode === "image_text" && (
                  <div className="relative" data-menu>
                    <button onClick={() => { setShowColMenu((v) => !v); setShowViewMenu(false); }}
                      className={`flex items-center gap-1 rounded-lg border px-2.5 py-1.5 text-xs font-medium transition-colors ${
                        showColMenu ? "border-gray-900 bg-foreground text-background" : "border-border bg-card text-muted-foreground hover:bg-muted"
                      }`}>
                      <SlidersHorizontal className="h-3.5 w-3.5" /><span className="hidden sm:inline">{he.scriptEditor.filter}</span>
                    </button>
                    {showColMenu && (
                      <ColumnMenu visibleCols={visibleCols} onToggle={toggleCol} onClose={() => setShowColMenu(false)} />
                    )}
                  </div>
                )}
                <div className="relative" data-menu>
                  <button onClick={() => { setShowViewMenu((v) => !v); setShowColMenu(false); }}
                    className={`flex items-center gap-1 rounded-lg border px-2.5 py-1.5 text-xs font-medium transition-colors ${
                      showViewMenu ? "border-gray-900 bg-foreground text-background" : "border-border bg-card text-muted-foreground hover:bg-muted"
                    }`}>
                    <Eye className="h-3.5 w-3.5" /><span className="hidden sm:inline">{he.scriptEditor.view}</span>
                  </button>
                  {showViewMenu && (
                    <ViewSettingsMenu
                      displayMode={displayMode} setDisplayMode={setDisplayMode}
                      foldMode={foldMode} setFoldMode={setFoldMode}
                      customShotNo={customShotNo} setCustomShotNo={setCustomShotNo}
                      shotOrdering={shotOrdering} setShotOrdering={setShotOrdering}
                      showFrames={showFrames} setShowFrames={setShowFrames}
                      onClose={() => setShowViewMenu(false)}
                      isPro={isPro}
                      onCinemaLocked={() => { setShowViewMenu(false); setCinemaUpgradeOpen(true); }}
                    />
                  )}
                </div>
                <button onClick={exportShotListPDF}
                  className="flex items-center gap-1 rounded-lg border border-border bg-card text-muted-foreground px-2.5 py-1.5 text-xs font-medium hover:bg-muted transition-colors">
                  <Download className="h-3.5 w-3.5" /><span className="hidden sm:inline">PDF</span>
                </button>
                {storyboardAtLimit ? (
                  <button onClick={() => setStoryboardUpgradeOpen(true)}
                    className="flex items-center gap-1.5 rounded-lg bg-amber-500 text-background px-2.5 py-1.5 text-xs font-medium hover:bg-amber-600 transition-colors">
                    🔒 <span className="hidden sm:inline">Pro —</span> {he.scriptEditor.moreShots}
                  </button>
                ) : (
                  <button onClick={addShot}
                    className="flex items-center gap-1.5 rounded-lg bg-foreground text-background px-2.5 py-1.5 text-xs font-medium hover:bg-foreground/90 transition-colors">
                    <Plus className="h-3.5 w-3.5" /><span className="hidden sm:inline">{he.scriptEditor.addFrame}</span> {he.scriptEditor.addShot}
                  </button>
                )}
              </div>
            </div>

            {shotList.length === 0 ? (
              <div className="flex flex-col items-center justify-center flex-1 text-center">
                <Film className="h-12 w-12 text-gray-200 mb-4" />
                <p className="text-muted-foreground font-medium">{he.scriptEditor.noShotsYet}</p>
                <p className="text-sm text-muted-foreground mt-1">{he.scriptEditor.emptyShotListHint}</p>
                <button onClick={addShot}
                  className="mt-4 flex items-center gap-1.5 rounded-lg bg-foreground text-background px-4 py-2 text-sm font-medium hover:bg-foreground/90 transition-colors">
                  <Plus className="h-4 w-4" />{he.scriptEditor.addFirstShot}
                </button>
              </div>
            ) : displayMode === "storyboard" ? (
              /* Storyboard grid */
              <div className="flex-1 overflow-auto p-5">
                <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                  {orderedShots.map((shot) => (
                    <StoryboardCard key={shot.id} shot={shot} customShotNo={customShotNo} showFrames={showFrames} onUpdate={updateShot} onDelete={deleteShot} />
                  ))}
                  {storyboardAtLimit ? (
                    <button onClick={() => setStoryboardUpgradeOpen(true)}
                      className="flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-amber-200 bg-amber-50 text-amber-500 hover:border-amber-300 transition-colors min-h-[200px] text-center px-2">
                      <span className="text-2xl">🔒</span>
                      <span className="text-xs font-medium">{he.scriptEditor.shotLimit} {STORYBOARD_FREE_LIMIT} {he.scriptEditor.shotLimitSuffix}</span>
                      <span className="text-[10px] text-amber-400">{he.scriptEditor.upgradeToPro}</span>
                    </button>
                  ) : (
                    <button onClick={addShot}
                      className="flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border bg-card text-muted-foreground hover:border-border hover:text-muted-foreground transition-colors min-h-[200px]">
                      <Plus className="h-6 w-6" />
                      <span className="text-xs">{he.scriptEditor.addShotFull}</span>
                    </button>
                  )}
                </div>
              </div>
            ) : (
              /* Table */
              <div className="overflow-x-auto flex-1">
                <table className="w-full border-collapse text-sm" style={{ direction: "rtl" }}>
                  <thead>
                    <tr className="bg-muted text-right sticky top-0 z-10 shadow-sm">
                      {headerCols.map((col) => (
                        <th
                          key={col.id}
                          style={colWidths[col.id] ? { width: colWidths[col.id], minWidth: colWidths[col.id] } : undefined}
                          className="relative px-3 py-2.5 text-xs font-semibold text-muted-foreground whitespace-nowrap border-b border-border"
                        >
                          {col.label}
                          <div
                            className="absolute top-0 left-0 h-full w-1 cursor-col-resize bg-border/50 hover:bg-blue-400 active:bg-blue-500 z-20 transition-colors"
                            onMouseDown={(e) => {
                              e.preventDefault();
                              const th = e.currentTarget.parentElement!;
                              const startX = e.clientX;
                              const startW = th.offsetWidth;
                              const onMove = (ev: MouseEvent) => {
                                const diff = startX - ev.clientX;
                                setColWidths(prev => ({ ...prev, [col.id]: Math.max(60, startW + diff) }));
                              };
                              const onUp = () => { document.removeEventListener("mousemove", onMove); document.removeEventListener("mouseup", onUp); };
                              document.addEventListener("mousemove", onMove);
                              document.addEventListener("mouseup", onUp);
                            }}
                          />
                        </th>
                      ))}
                      <th className="w-10 border-b border-border" />
                    </tr>
                  </thead>
                  <tbody>
                    {orderedShots.map((shot, idx) => (
                      <ShotTableRow
                        key={shot.id} shot={shot} idx={idx}
                        visibleCols={visibleCols} showFrames={showFrames}
                        foldMode={foldMode} customShotNo={customShotNo}
                        rowHeight={rowHeights[shot.id]}
                        onUpdate={updateShot} onDelete={deleteShot}
                        onRowResize={(id, h) => setRowHeights(prev => ({ ...prev, [id]: h }))}
                      />
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ── CALL SHEET TAB ── */}
        {activeTab === "callsheet" && (
          <ScriptCallSheet
            title={script.title}
            platform={platform}
            projectTitle={script.project?.title ?? ""}
            clientName={script.client?.name ?? ""}
            shotList={shotList}
          />
        )}

      </div>
    </div>
    </>
  );
}
