"use client";

import { useState, useRef, useEffect, useId } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowRight, Wand2, Send, Sparkles, Save, ChevronDown,
  Youtube, Instagram, Tv, Podcast, Megaphone, Loader2, Check,
  MessageSquare, Film, AlignLeft, FileText, Plus, Trash2,
  Eye, EyeOff, Image, Type, LayoutGrid, X,
  ChevronsUpDown, ChevronUp, ChevronDown as ChevronDn,
  SlidersHorizontal,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { updateScript } from "@/lib/actions/script-actions";
import { ScriptCallSheet } from "./script-call-sheet";
import { UpgradeDialog } from "@/app/components/shared/upgrade-dialog";

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

type DisplayMode = "image_text" | "text" | "storyboard";
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

const PLATFORMS = [
  { value: "youtube",    label: "YouTube",   icon: Youtube,   color: "text-red-500" },
  { value: "tiktok",     label: "TikTok",    icon: Tv,        color: "text-gray-800" },
  { value: "instagram",  label: "Instagram", icon: Instagram, color: "text-pink-500" },
  { value: "podcast",    label: "פודקאסט",   icon: Podcast,   color: "text-purple-500" },
  { value: "commercial", label: "פרסומת",    icon: Megaphone, color: "text-blue-500" },
];

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

const inputCls = "w-full rounded border border-transparent bg-transparent px-1.5 py-0.5 text-xs text-gray-700 focus:outline-none focus:border-gray-300 focus:bg-white transition-colors";
const selectCls = inputCls + " cursor-pointer";

function ComboCell({ value, opts, onChange, placeholder }: {
  value: string; opts: string[]; onChange: (v: string) => void; placeholder?: string;
}) {
  const listId = useId();
  return (
    <>
      <input
        list={listId}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder ?? "—"}
        className={inputCls}
      />
      <datalist id={listId}>
        {opts.map((o) => <option key={o} value={o} />)}
      </datalist>
    </>
  );
}

function SelectCell({ value, opts, onChange }: { value: string; opts: string[]; onChange: (v: string) => void }) {
  return (
    <select value={value} onChange={(e) => onChange(e.target.value)} className={selectCls}>
      <option value="">—</option>
      {opts.map((o) => <option key={o}>{o}</option>)}
    </select>
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

function ShotTableRow({ shot, idx, visibleCols, displayMode, foldMode, customShotNo, onUpdate, onDelete }: {
  shot: ShotItem;
  idx: number;
  visibleCols: Set<string>;
  displayMode: DisplayMode;
  foldMode: FoldMode;
  customShotNo: boolean;
  onUpdate: (id: string, field: keyof ShotItem, value: string) => void;
  onDelete: (id: string) => void;
}) {
  const upd = (field: keyof ShotItem) => (v: string) => onUpdate(shot.id, field, v);
  const rowBg = idx % 2 === 0 ? "bg-white" : "bg-gray-50/50";
  const rowH = foldMode === "fold" ? "h-8" : "";
  const overflow = foldMode === "fold" ? "overflow-hidden" : "";
  const cellPad = "px-2 py-1.5";

  function cell(colId: string, content: React.ReactNode) {
    if (!visibleCols.has(colId)) return null;
    return <td key={colId} className={`${cellPad} ${overflow} ${foldMode === "fold" ? "max-h-8" : ""}`}>{content}</td>;
  }

  const showFrame = displayMode !== "text" && visibleCols.has("frameUrl");

  return (
    <tr className={`border-b border-gray-100 hover:bg-blue-50/20 transition-colors group ${rowBg} ${rowH}`}>
      {/* Shot # */}
      {visibleCols.has("shotNum") && (
        <td className={`${cellPad} w-14 text-center`}>
          {customShotNo
            ? <input value={shot.customShotNum} onChange={(e) => onUpdate(shot.id, "customShotNum", e.target.value)}
                className="w-full text-center rounded border border-transparent bg-transparent px-1 py-0.5 text-xs font-bold text-gray-500 focus:outline-none focus:border-gray-300 focus:bg-white" />
            : <span className="text-xs font-bold text-gray-400">{shot.shotNum}</span>
          }
        </td>
      )}

      {/* Frame / storyboard thumbnail */}
      {showFrame && (
        <td className={`${cellPad} w-24`}>
          {shot.frameUrl ? (
            <div className="relative group/frame">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={shot.frameUrl} alt="" className="h-12 w-20 rounded object-cover border border-gray-200" />
              <button onClick={() => onUpdate(shot.id, "frameUrl", "")}
                className="absolute top-0 right-0 hidden group-hover/frame:flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-white text-[9px]">×</button>
            </div>
          ) : (
            <label className="flex h-10 w-20 cursor-pointer flex-col items-center justify-center rounded border-2 border-dashed border-gray-200 text-gray-300 hover:border-gray-300 hover:text-gray-400 transition-colors">
              <Image className="h-3.5 w-3.5 mb-0.5" />
              <span className="text-[9px]">הוסף</span>
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

      {cell("content", <InputCell value={shot.content} onChange={upd("content")} placeholder="אקשן..." />)}
      {cell("shotSize", <SelectCell value={shot.shotSize} opts={SHOT_SIZE_OPTS} onChange={upd("shotSize")} />)}
      {cell("lens", <ComboCell value={shot.lens} opts={LENS_OPTS} onChange={upd("lens")} placeholder="עדשה..." />)}
      {cell("movement", <SelectCell value={shot.movement} opts={MOVEMENT_OPTS} onChange={upd("movement")} />)}
      {cell("startTime", <InputCell type="time" value={shot.startTime} onChange={upd("startTime")} />)}
      {cell("endTime", <InputCell type="time" value={shot.endTime} onChange={upd("endTime")} />)}
      {cell("duration", <InputCell value={shot.duration} onChange={upd("duration")} placeholder="00:30" />)}
      {cell("dialogues", <InputCell value={shot.dialogues} onChange={upd("dialogues")} placeholder="דיאלוג..." />)}
      {cell("note", <InputCell value={shot.note} onChange={upd("note")} placeholder="הערה..." />)}
      {cell("sound", <SelectCell value={shot.sound} opts={SOUND_OPTS} onChange={upd("sound")} />)}
      {cell("shotType", <SelectCell value={shot.shotType} opts={SHOT_TYPE_OPTS} onChange={upd("shotType")} />)}
      {cell("equipment", <InputCell value={shot.equipment} onChange={upd("equipment")} placeholder="ציוד..." />)}
      {cell("frameRate", <ComboCell value={shot.frameRate} opts={FPS_OPTS} onChange={upd("frameRate")} placeholder="FPS..." />)}
      {cell("lighting", <InputCell value={shot.lighting} onChange={upd("lighting")} placeholder="תאורה..." />)}
      {cell("castId", <InputCell value={shot.castId} onChange={upd("castId")} placeholder="שחקן..." />)}
      {cell("prop", <InputCell value={shot.prop} onChange={upd("prop")} placeholder="פרופ..." />)}
      {cell("clothing", <InputCell value={shot.clothing} onChange={upd("clothing")} placeholder="תלבושת..." />)}
      {cell("makeup", <InputCell value={shot.makeup} onChange={upd("makeup")} placeholder="איפור..." />)}

      {/* Delete */}
      <td className={`${cellPad} w-10 text-center`}>
        <button onClick={() => onDelete(shot.id)}
          className="p-1 text-gray-200 hover:text-red-500 transition-colors opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto">
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </td>
    </tr>
  );
}

// ─── Storyboard Card ──────────────────────────────────────────────────────────

function StoryboardCard({ shot, customShotNo, onUpdate, onDelete }: {
  shot: ShotItem; customShotNo: boolean;
  onUpdate: (id: string, field: keyof ShotItem, value: string) => void;
  onDelete: (id: string) => void;
}) {
  return (
    <div className="group rounded-xl border border-gray-200 bg-white overflow-hidden shadow-sm hover:shadow-md transition-shadow">
      {/* Frame */}
      <div className="relative bg-gray-100 h-36">
        {shot.frameUrl ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={shot.frameUrl} alt="" className="h-full w-full object-cover" />
            <button onClick={() => onUpdate(shot.id, "frameUrl", "")}
              className="absolute top-1.5 right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-black/60 text-white text-xs hover:bg-red-500 transition-colors">×</button>
          </>
        ) : (
          <label className="flex h-full w-full cursor-pointer flex-col items-center justify-center text-gray-300 hover:text-gray-400 hover:bg-gray-200 transition-colors">
            <Image className="h-6 w-6 mb-1" />
            <span className="text-xs">הוסף תמונה</span>
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
        <div className="absolute top-1.5 left-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-black/70 text-white text-xs font-bold">
          {customShotNo ? shot.customShotNum : shot.shotNum}
        </div>
      </div>
      {/* Info */}
      <div className="p-3 space-y-1.5">
        <div className="flex items-start justify-between gap-1">
          <div className="flex gap-1.5 flex-wrap flex-1">
            {shot.shotSize && <span className="rounded-full bg-indigo-50 text-indigo-600 px-2 py-0.5 text-[10px] font-semibold">{shot.shotSize}</span>}
            {shot.lens && <span className="rounded-full bg-gray-100 text-gray-600 px-2 py-0.5 text-[10px] font-semibold">{shot.lens}</span>}
            {shot.movement && <span className="rounded-full bg-gray-100 text-gray-600 px-2 py-0.5 text-[10px] font-semibold">{shot.movement}</span>}
          </div>
          <button
            onClick={() => onDelete(shot.id)}
            className="flex h-5 w-5 shrink-0 items-center justify-center rounded text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
        <textarea
          value={shot.content}
          onChange={(e) => onUpdate(shot.id, "content", e.target.value)}
          placeholder="אקשן / תיאור..."
          rows={2}
          className="w-full resize-none rounded-lg border border-transparent bg-transparent px-1 py-0.5 text-xs text-gray-700 focus:outline-none focus:border-gray-200 focus:bg-gray-50 font-[inherit] transition-colors"
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
  return (
    <div className="absolute left-0 top-full z-50 mt-1 w-52 rounded-xl border border-gray-200 bg-white py-2 shadow-xl">
      <div className="px-3 py-1.5 text-[10px] font-semibold text-gray-400 uppercase tracking-widest">סינון עמודות</div>
      {COLUMNS.map((col) => {
        const visible = visibleCols.has(col.id);
        return (
          <button key={col.id} onClick={() => onToggle(col.id)}
            className="flex w-full items-center gap-2.5 px-3 py-2 text-xs hover:bg-gray-50 transition-colors">
            {visible
              ? <Eye className="h-3.5 w-3.5 text-gray-700" />
              : <EyeOff className="h-3.5 w-3.5 text-gray-300" />}
            <span className={visible ? "text-gray-700 font-medium" : "text-gray-400"}>{col.label}</span>
          </button>
        );
      })}
      <div className="mx-3 mt-1 border-t border-gray-100 pt-1">
        <button onClick={onClose} className="w-full rounded-lg py-1.5 text-xs text-gray-400 hover:text-gray-600 transition-colors">סגור</button>
      </div>
    </div>
  );
}

// ─── View Settings Popover ────────────────────────────────────────────────────

function ViewSettingsMenu({ displayMode, setDisplayMode, foldMode, setFoldMode, customShotNo, setCustomShotNo, shotOrdering, setShotOrdering, onClose, isPro, onCinemaLocked }: {
  displayMode: DisplayMode; setDisplayMode: (m: DisplayMode) => void;
  foldMode: FoldMode; setFoldMode: (m: FoldMode) => void;
  customShotNo: boolean; setCustomShotNo: (v: boolean) => void;
  shotOrdering: ShotOrdering; setShotOrdering: (o: ShotOrdering) => void;
  onClose: () => void;
  isPro: boolean;
  onCinemaLocked: () => void;
}) {
  const sectionCls = "px-4 py-3 border-b border-gray-100 last:border-0";
  const labelCls = "mb-3 text-[10px] font-semibold text-gray-400 uppercase tracking-widest";

  function ModeBtn({ active, onClick, icon, label, locked }: { active: boolean; onClick: () => void; icon: React.ReactNode; label: string; locked?: boolean }) {
    return (
      <button onClick={onClick}
        className={`relative flex flex-col items-center gap-1.5 flex-1 rounded-xl py-3 border transition-all ${
          active ? "border-gray-900 bg-gray-900 text-white" : "border-gray-200 text-gray-500 hover:border-gray-300 hover:bg-gray-50"
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
    <div className="absolute left-0 top-full z-50 mt-1 w-64 rounded-xl border border-gray-200 bg-white shadow-xl overflow-hidden">
      {/* Display Mode */}
      <div className={sectionCls}>
        <div className={labelCls}>מצב תצוגה</div>
        <div className="flex gap-2">
          <ModeBtn active={displayMode === "storyboard"} onClick={() => setDisplayMode("storyboard")}
            icon={<LayoutGrid className="h-5 w-5" />} label={"סטורי\nבורד"} />
          <ModeBtn active={displayMode === "text"} onClick={() => setDisplayMode("text")}
            icon={<Type className="h-5 w-5" />} label={"טקסט\nבלבד"} />
          <ModeBtn active={displayMode === "image_text"}
            onClick={() => isPro ? setDisplayMode("image_text") : onCinemaLocked()}
            icon={<Image className="h-5 w-5" />} label={"קולנועי"}
            locked={!isPro} />
        </div>
      </div>

      {/* Fold Mode */}
      <div className={sectionCls}>
        <div className={labelCls}>קיפול שורות</div>
        <div className="flex gap-2">
          <button onClick={() => setFoldMode("unfold")}
            className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg border py-2 text-xs font-medium transition-all ${
              foldMode === "unfold" ? "border-gray-900 bg-gray-900 text-white" : "border-gray-200 text-gray-500 hover:border-gray-300"
            }`}>
            <ChevronsUpDown className="h-3.5 w-3.5" />פתוח
          </button>
          <button onClick={() => setFoldMode("fold")}
            className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg border py-2 text-xs font-medium transition-all ${
              foldMode === "fold" ? "border-gray-900 bg-gray-900 text-white" : "border-gray-200 text-gray-500 hover:border-gray-300"
            }`}>
            <ChevronDn className="h-3.5 w-3.5" />מקופל
          </button>
        </div>
      </div>

      {/* Custom Shot No */}
      <div className={sectionCls}>
        <div className="flex items-center justify-between">
          <div>
            <div className={labelCls + " mb-0"}>מספור שוט מותאם</div>
            <p className="text-[10px] text-gray-400 mt-0.5">אפשר עריכת מספרים כ-1A, 2B</p>
          </div>
          <button onClick={() => setCustomShotNo(!customShotNo)}
            className={`relative h-5 w-9 rounded-full transition-colors ${customShotNo ? "bg-gray-900" : "bg-gray-200"}`}>
            <span className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform ${customShotNo ? "translate-x-4" : "translate-x-0.5"}`} />
          </button>
        </div>
      </div>

      {/* Shot Ordering */}
      <div className={sectionCls}>
        <div className={labelCls}>סדר שוטים</div>
        <div className="flex gap-2">
          <button onClick={() => setShotOrdering("asc")}
            className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg border py-2 text-xs font-medium transition-all ${
              shotOrdering === "asc" ? "border-gray-900 bg-gray-900 text-white" : "border-gray-200 text-gray-500 hover:border-gray-300"
            }`}>
            <ChevronUp className="h-3.5 w-3.5" />עולה
          </button>
          <button onClick={() => setShotOrdering("desc")}
            className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg border py-2 text-xs font-medium transition-all ${
              shotOrdering === "desc" ? "border-gray-900 bg-gray-900 text-white" : "border-gray-200 text-gray-500 hover:border-gray-300"
            }`}>
            <ChevronDn className="h-3.5 w-3.5" />יורד
          </button>
        </div>
      </div>

      <div className="px-4 py-2">
        <button onClick={onClose} className="w-full rounded-lg py-1.5 text-xs text-gray-400 hover:text-gray-600 transition-colors">סגור</button>
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
  void clients; void projects;
  const router = useRouter();

  const [title, setTitle] = useState(script.title);
  const [content, setContent] = useState(script.content);
  const [platform, setPlatform] = useState(script.platform);
  const [duration] = useState(script.duration); // kept for save compatibility, no UI
  const isPredefinedPlatform = PLATFORMS.some((p) => p.value === platform);
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
      });
      setSaving(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    }, 1500);
    return () => { if (saveTimeout.current) clearTimeout(saveTimeout.current); };
  }, [title, content, platform, duration, shotList, script.id]);

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
      setMessages([...newMessages, { role: "model", text: "שגיאה. נסה שוב." }]);
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
    { id: "script",    label: "תסריט",    Icon: AlignLeft },
    { id: "shotlist",  label: "שוט ליסט", Icon: Film, badge: shotList.length || undefined },
    { id: "callsheet", label: "קול שיט",  Icon: FileText },
  ];

  // ─── Visible columns for table header ────────────────────────────────────────
  const showFrame = displayMode !== "text" && visibleCols.has("frameUrl");
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
      feature='תצוגה "קולנועי"'
      limit={-1}
    />
    <UpgradeDialog
      open={callsheetUpgradeOpen}
      onClose={() => setCallsheetUpgradeOpen(false)}
      feature="קול שיט"
      limit={-1}
    />
    <UpgradeDialog
      open={storyboardUpgradeOpen}
      onClose={() => setStoryboardUpgradeOpen(false)}
      feature="שוטים בסטורי בורד"
      limit={STORYBOARD_FREE_LIMIT}
    />
    <div className="flex h-[calc(100vh-80px)] flex-col">

      {/* ── Top Bar ── */}
      <div className="flex items-center gap-3 border-b border-gray-200 bg-white px-4 py-3 shrink-0">
        <button onClick={() => router.push("/scripts")}
          className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-700 transition-colors">
          <ArrowRight className="h-4 w-4" /><span>תסריטים</span>
        </button>
        <span className="text-gray-300">/</span>
        <input value={title} onChange={(e) => setTitle(e.target.value)}
          className="flex-1 bg-transparent text-sm font-semibold text-gray-900 outline-none placeholder:text-gray-400"
          placeholder="כותרת התסריט..." />
        <div className="flex items-center gap-2">
          {/* Platform / Category picker */}
          {customPlatformMode ? (
            <div className="flex items-center gap-1.5 rounded-lg border border-gray-200 bg-gray-50 px-2.5 py-1.5">
              <Megaphone className="h-3.5 w-3.5 text-gray-400 shrink-0" />
              <input
                value={platform}
                onChange={(e) => setPlatform(e.target.value)}
                placeholder="פלטפורמה מותאמת..."
                autoFocus
                className="bg-transparent text-xs text-gray-700 outline-none w-32 placeholder:text-gray-400"
              />
              <button onClick={() => { setCustomPlatformMode(false); setPlatform("youtube"); }}
                className="text-gray-300 hover:text-gray-600 transition-colors">
                <X className="h-3 w-3" />
              </button>
            </div>
          ) : (
            <div className="relative">
              {showPlatformMenu && <div className="fixed inset-0 z-40" onClick={() => setShowPlatformMenu(false)} />}
              <button onClick={() => setShowPlatformMenu((v) => !v)}
                className="flex items-center gap-1.5 rounded-lg border border-gray-200 bg-gray-50 px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-100 transition-colors">
                <PlatformIcon className={`h-3.5 w-3.5 ${currentPlatform.color}`} />
                {currentPlatform.label}
                <ChevronDown className="h-3 w-3 text-gray-400" />
              </button>
              {showPlatformMenu && (
                <div className="absolute left-0 top-full z-50 mt-1 min-w-[150px] rounded-lg border border-gray-200 bg-white py-1 shadow-lg">
                  {PLATFORMS.map((p) => (
                    <button key={p.value} onClick={() => { setPlatform(p.value); setShowPlatformMenu(false); }}
                      className={`flex w-full items-center gap-2 px-3 py-2 text-xs hover:bg-gray-50 ${platform === p.value ? "font-semibold text-gray-900" : "text-gray-600"}`}>
                      <p.icon className={`h-3.5 w-3.5 ${p.color}`} />{p.label}
                    </button>
                  ))}
                  <div className="mx-2 my-1 border-t border-gray-100" />
                  <button onClick={() => { setCustomPlatformMode(true); setPlatform(""); setShowPlatformMenu(false); }}
                    className="flex w-full items-center gap-2 px-3 py-2 text-xs text-gray-500 hover:bg-gray-50">
                    <Megaphone className="h-3.5 w-3.5 text-gray-400" />אחר...
                  </button>
                </div>
              )}
            </div>
          )}
          <div className="flex items-center gap-1 text-xs text-gray-400">
            {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : saved ? <Check className="h-3.5 w-3.5 text-green-500" /> : <Save className="h-3.5 w-3.5" />}
            <span>{saving ? "שומר..." : saved ? "נשמר" : "שמור אוטומטי"}</span>
          </div>
        </div>
      </div>

      {/* ── Tab Bar ── */}
      <div className="flex items-center border-b border-gray-200 bg-white px-4 shrink-0">
        {TABS.map(({ id, label, Icon, badge }) => {
          const locked = id === "callsheet" && !isPro;
          return (
            <button key={id}
              onClick={() => locked ? setCallsheetUpgradeOpen(true) : setActiveTab(id)}
              className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
                activeTab === id ? "border-gray-900 text-gray-900" : "border-transparent text-gray-400 hover:text-gray-600"
              }`}>
              <Icon className="h-3.5 w-3.5" />
              {label}
              {locked && <span className="text-amber-400 text-[10px]">★ פרו</span>}
              {!locked && badge !== undefined && badge > 0 && (
                <span className="rounded-full bg-gray-100 text-gray-500 px-1.5 py-0.5 text-[10px] font-medium">{badge}</span>
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
            <div className="flex flex-1 flex-col overflow-hidden">
              <div className="flex-1 overflow-auto bg-gray-50 p-6">
                <textarea
                  ref={textareaRef}
                  defaultValue={content}
                  onChange={(e) => { setContent(e.target.value); autoResize(e.target); }}
                  onContextMenu={handleScriptContextMenu}
                  placeholder="התחל לכתוב את התסריט שלך..."
                  className="w-full rounded-xl border border-gray-200 bg-white p-6 text-base leading-8 text-gray-800 shadow-sm outline-none focus:border-gray-300 focus:shadow-md resize-none overflow-hidden"
                  style={{ direction: "rtl", fontFamily: "inherit", minHeight: "400px" }}
                />
                {/* Right-click context menu */}
                {scriptCtxMenu && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setScriptCtxMenu(null)} />
                    <div
                      className="fixed z-50 rounded-xl border border-gray-200 bg-white py-1.5 shadow-xl min-w-[180px]"
                      style={{ top: scriptCtxMenu.y, left: scriptCtxMenu.x }}
                      dir="rtl"
                    >
                      <button
                        className="flex w-full items-center gap-2.5 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                        onClick={() => addSelectedTextToShotList(scriptCtxMenu.text)}
                      >
                        <Film className="h-3.5 w-3.5 text-gray-400" />
                        הוסף לשוט ליסט
                      </button>
                    </div>
                  </>
                )}
              </div>

              <button
                onClick={() => { setChatOpen((o) => !o); if (!chatOpen) setTimeout(() => chatInputRef.current?.focus(), 300); }}
                className="flex h-9 shrink-0 items-center gap-2 border-t border-gray-200 bg-white px-4 text-xs text-gray-500 hover:bg-gray-50 transition-colors">
                <MessageSquare className="h-3.5 w-3.5" /><span>עזרה מ-AI</span>
                {messages.length > 0 && <span className="rounded-full bg-gray-100 px-1.5 py-0.5 text-gray-500">{messages.length}</span>}
                <ChevronDown className={`mr-auto h-3.5 w-3.5 transition-transform duration-300 ${chatOpen ? "rotate-180" : ""}`} />
              </button>

              <div style={{ maxHeight: chatOpen ? "288px" : "0px" }}
                className="shrink-0 flex flex-col border-t border-gray-200 bg-white overflow-hidden transition-[max-height] duration-300 ease-in-out">
                <div className="flex h-10 shrink-0 items-center justify-between border-b border-gray-100 px-4">
                  <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
                    <MessageSquare className="h-4 w-4 text-gray-400" />עוזר כתיבה
                  </div>
                  <button onClick={() => setChatOpen(false)} className="text-xs text-gray-400 hover:text-gray-600">סגור</button>
                </div>
                <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
                  {messages.length === 0 && <p className="text-center text-xs text-gray-400 pt-6">כתוב מה לשנות בתסריט...</p>}
                  {messages.map((m, i) => (
                    <div key={i} className={`flex ${m.role === "user" ? "justify-start" : "justify-end"}`}>
                      <div className={`max-w-[78%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed whitespace-pre-wrap ${
                        m.role === "user" ? "bg-gray-100 text-gray-800 rounded-tr-sm" : "bg-gray-900 text-white rounded-tl-sm"
                      }`}>{m.text}</div>
                    </div>
                  ))}
                  {chatLoading && (
                    <div className="flex justify-end">
                      <div className="flex items-center gap-1.5 rounded-2xl rounded-tl-sm bg-gray-900 px-4 py-3">
                        <span className="h-1.5 w-1.5 rounded-full bg-white/60 animate-bounce [animation-delay:0ms]" />
                        <span className="h-1.5 w-1.5 rounded-full bg-white/60 animate-bounce [animation-delay:150ms]" />
                        <span className="h-1.5 w-1.5 rounded-full bg-white/60 animate-bounce [animation-delay:300ms]" />
                      </div>
                    </div>
                  )}
                  <div ref={chatEndRef} />
                </div>
                <div className="flex items-end gap-2 border-t border-gray-100 px-3 py-2">
                  <textarea ref={chatInputRef} value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendChat(); } }}
                    placeholder="מה לשנות? (Enter לשליחה)" rows={1}
                    className="flex-1 resize-none rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-800 outline-none focus:border-gray-400 placeholder:text-gray-400 max-h-20 overflow-auto font-[inherit]"
                    style={{ lineHeight: "1.5" }} />
                  <button onClick={sendChat} disabled={!chatInput.trim() || chatLoading}
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gray-900 text-white transition-opacity disabled:opacity-40 hover:bg-gray-700">
                    <Send className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* AI Sidebar */}
            <div className="flex w-72 shrink-0 flex-col border-r border-gray-200 bg-white">
              <div className="border-b border-gray-100 px-4 py-3">
                <div className="flex items-center gap-2">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gray-900">
                    <Sparkles className="h-3.5 w-3.5 text-white" />
                  </div>
                  <span className="text-sm font-semibold text-gray-900">AI Copilot</span>
                </div>
              </div>
              <div className="flex flex-1 flex-col gap-3 overflow-auto p-4">
                <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                  <div className="mb-2 flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-gray-600" />
                    <span className="text-sm font-semibold text-gray-800">צור תסריט</span>
                  </div>
                  <p className="mb-3 text-xs text-gray-500">על מה הוידאו? לאיזה קהל? מה הטון?</p>
                  {aiMode === "generate" ? (
                    <div className="space-y-2">
                      <textarea value={genInstruction} onChange={(e) => setGenInstruction(e.target.value)}
                        placeholder="לדוג׳: וידאו על מוצר תכשיטים, קהל 25-35, טון שאיפתי"
                        className="w-full min-h-[85px] resize-none rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs text-gray-700 outline-none focus:border-gray-400 placeholder:text-gray-400 font-[inherit]"
                        autoFocus />
                      <div className="flex gap-2">
                        <Button onClick={() => callAI("generate")} disabled={aiLoading || !genInstruction.trim()} size="sm" className="flex-1 gap-1.5 text-xs">
                          {aiLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />}צור
                        </Button>
                        <Button onClick={() => setAiMode("idle")} size="sm" variant="ghost" className="text-xs px-2">ביטול</Button>
                      </div>
                    </div>
                  ) : (
                    <Button onClick={() => setAiMode("generate")} size="sm" variant="outline" className="w-full gap-1.5 text-xs">
                      <Sparkles className="h-3.5 w-3.5" />התחל מפרומפט
                    </Button>
                  )}
                </div>
                <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                  <div className="mb-2 flex items-center gap-2">
                    <Wand2 className="h-4 w-4 text-gray-600" />
                    <span className="text-sm font-semibold text-gray-800">שדרג תסריט</span>
                  </div>
                  <p className="mb-3 text-xs text-gray-500">ה-AI ישפר הוק, פייסינג וניסוח.</p>
                  <Button onClick={() => callAI("upgrade")} disabled={aiLoading || !content.trim()} size="sm" variant="outline" className="w-full gap-1.5 text-xs">
                    {aiLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Wand2 className="h-3.5 w-3.5" />}שדרג עם AI
                  </Button>
                </div>
              </div>
            </div>
          </>
        )}

        {/* ── SHOT LIST TAB ── */}
        {activeTab === "shotlist" && (
          <div className="flex-1 overflow-auto bg-gray-50 flex flex-col">

            {/* Toolbar */}
            <div className="flex items-center justify-between gap-3 px-5 py-3 bg-white border-b border-gray-200 shrink-0">
              <div>
                <h3 className="font-semibold text-gray-900">שוט ליסט — {script.title}</h3>
                <p className="text-xs text-gray-400 mt-0.5">{shotList.length} שוטים</p>
              </div>
              <div className="flex items-center gap-2">
                {/* Column visibility / filter */}
                <div className="relative" data-menu>
                  <button onClick={() => { setShowColMenu((v) => !v); setShowViewMenu(false); }}
                    className={`flex items-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-medium transition-colors ${
                      showColMenu ? "border-gray-900 bg-gray-900 text-white" : "border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
                    }`}>
                    <SlidersHorizontal className="h-3.5 w-3.5" />סינון
                  </button>
                  {showColMenu && (
                    <ColumnMenu visibleCols={visibleCols} onToggle={toggleCol} onClose={() => setShowColMenu(false)} />
                  )}
                </div>

                {/* View settings */}
                <div className="relative" data-menu>
                  <button onClick={() => { setShowViewMenu((v) => !v); setShowColMenu(false); }}
                    className={`flex items-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-medium transition-colors ${
                      showViewMenu ? "border-gray-900 bg-gray-900 text-white" : "border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
                    }`}>
                    <Eye className="h-3.5 w-3.5" />תצוגה
                  </button>
                  {showViewMenu && (
                    <ViewSettingsMenu
                      displayMode={displayMode} setDisplayMode={setDisplayMode}
                      foldMode={foldMode} setFoldMode={setFoldMode}
                      customShotNo={customShotNo} setCustomShotNo={setCustomShotNo}
                      shotOrdering={shotOrdering} setShotOrdering={setShotOrdering}
                      onClose={() => setShowViewMenu(false)}
                      isPro={isPro}
                      onCinemaLocked={() => { setShowViewMenu(false); setCinemaUpgradeOpen(true); }}
                    />
                  )}
                </div>

                {storyboardAtLimit ? (
                  <button onClick={() => setStoryboardUpgradeOpen(true)}
                    className="flex items-center gap-1.5 rounded-lg bg-amber-500 text-white px-3 py-2 text-xs font-medium hover:bg-amber-600 transition-colors">
                    🔒 Pro — עוד שוטים
                  </button>
                ) : (
                  <button onClick={addShot}
                    className="flex items-center gap-1.5 rounded-lg bg-gray-900 text-white px-3 py-2 text-xs font-medium hover:bg-gray-800 transition-colors">
                    <Plus className="h-3.5 w-3.5" />הוסף שוט
                  </button>
                )}
              </div>
            </div>

            {shotList.length === 0 ? (
              <div className="flex flex-col items-center justify-center flex-1 text-center">
                <Film className="h-12 w-12 text-gray-200 mb-4" />
                <p className="text-gray-500 font-medium">אין שוטים עדיין</p>
                <p className="text-sm text-gray-400 mt-1">לחץ "הוסף שוט" להתחיל לבנות את השוט ליסט</p>
                <button onClick={addShot}
                  className="mt-4 flex items-center gap-1.5 rounded-lg bg-gray-900 text-white px-4 py-2 text-sm font-medium hover:bg-gray-800 transition-colors">
                  <Plus className="h-4 w-4" />הוסף שוט ראשון
                </button>
              </div>
            ) : displayMode === "storyboard" ? (
              /* Storyboard grid */
              <div className="flex-1 overflow-auto p-5">
                <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                  {orderedShots.map((shot) => (
                    <StoryboardCard key={shot.id} shot={shot} customShotNo={customShotNo} onUpdate={updateShot} onDelete={deleteShot} />
                  ))}
                  {storyboardAtLimit ? (
                    <button onClick={() => setStoryboardUpgradeOpen(true)}
                      className="flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-amber-200 bg-amber-50 text-amber-500 hover:border-amber-300 transition-colors min-h-[200px] text-center px-2">
                      <span className="text-2xl">🔒</span>
                      <span className="text-xs font-medium">מגבלת {STORYBOARD_FREE_LIMIT} שוטים</span>
                      <span className="text-[10px] text-amber-400">שדרג ל-Pro</span>
                    </button>
                  ) : (
                    <button onClick={addShot}
                      className="flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-gray-200 bg-white text-gray-300 hover:border-gray-300 hover:text-gray-400 transition-colors min-h-[200px]">
                      <Plus className="h-6 w-6" />
                      <span className="text-xs">הוסף שוט</span>
                    </button>
                  )}
                </div>
              </div>
            ) : (
              /* Table */
              <div className="overflow-x-auto flex-1">
                <table className="w-full border-collapse text-sm" style={{ direction: "rtl" }}>
                  <thead>
                    <tr className="bg-gray-100 text-right sticky top-0 z-10 shadow-sm">
                      {headerCols.map((col) => (
                        <th key={col.id} className="px-3 py-2.5 text-xs font-semibold text-gray-500 whitespace-nowrap border-b border-gray-200">
                          {col.label}
                        </th>
                      ))}
                      <th className="w-10 border-b border-gray-200" />
                    </tr>
                  </thead>
                  <tbody>
                    {orderedShots.map((shot, idx) => (
                      <ShotTableRow
                        key={shot.id} shot={shot} idx={idx}
                        visibleCols={visibleCols} displayMode={displayMode}
                        foldMode={foldMode} customShotNo={customShotNo}
                        onUpdate={updateShot} onDelete={deleteShot}
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
