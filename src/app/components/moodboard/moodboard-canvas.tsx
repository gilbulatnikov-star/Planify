"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  ArrowRight, Check, Loader2, StickyNote, Image as ImageIcon,
  Link as LinkIcon, Type, Trash2, X, ZoomIn, ZoomOut, Maximize,
  GripHorizontal, Table2, Pencil, Bold, Italic, Underline,
  AlignLeft, AlignCenter, AlignRight, Plus, Minus, Camera,
  Square, Circle, Triangle, Star, Eraser, RotateCcw, Hexagon,
  MousePointer2,
} from "lucide-react";
import Link from "next/link";
import { updateMoodboard } from "@/lib/actions/moodboard-actions";
import { UpgradeDialog } from "@/app/components/shared/upgrade-dialog";
import { useT } from "@/lib/i18n";

// ─── Types ───────────────────────────────────────────────────────────────────

type NodeType = "sticky" | "image" | "link" | "heading" | "text" | "table" | "shape" | "draw";

interface BoardNode {
  id: string;
  type: NodeType;
  x: number;
  y: number;
  data: Record<string, string>;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function uid() { return `n_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`; }

const STICKY_COLORS = ["#fef08a", "#bbf7d0", "#bfdbfe", "#fecaca", "#e9d5ff", "#fed7aa", "#ffffff"];

const FONT_FAMILIES = [
  { labelKey: "default", label: "", value: "inherit" },
  { labelKey: "", label: "Arial", value: "Arial, sans-serif" },
  { labelKey: "", label: "Georgia", value: "Georgia, serif" },
  { labelKey: "", label: "Verdana", value: "Verdana, sans-serif" },
  { labelKey: "", label: "Courier", value: "'Courier New', monospace" },
  { labelKey: "", label: "Times", value: "'Times New Roman', serif" },
];

const FONT_SIZES = ["10", "12", "14", "16", "18", "24", "32", "48", "64"];

const SHAPE_TYPES = [
  { id: "rect",     labelKey: "rect" as const,     Icon: Square    },
  { id: "circle",   labelKey: "circle" as const,   Icon: Circle    },
  { id: "triangle", labelKey: "triangle" as const, Icon: Triangle  },
  { id: "diamond",  labelKey: "diamond" as const,  Icon: Hexagon   },
  { id: "star",     labelKey: "star" as const,     Icon: Star      },
  { id: "arrow",    labelKey: "arrow" as const,    Icon: ArrowRight },
];

// ─── Shared drag handle ───────────────────────────────────────────────────────

function DragHandle() {
  return (
    <div data-drag-handle className="flex justify-center py-1 cursor-grab active:cursor-grabbing opacity-25 hover:opacity-50 transition-opacity select-none">
      <GripHorizontal className="h-3.5 w-3.5" />
    </div>
  );
}

// ─── Sticky Note ─────────────────────────────────────────────────────────────

function StickyCard({ node, onChange }: { node: BoardNode; onChange: (d: Record<string, string>) => void }) {
  const he = useT();
  const [text, setText] = useState(node.data.text ?? "");
  const [color, setColor] = useState(node.data.color ?? "#fef08a");
  const [showPicker, setShowPicker] = useState(false);
  return (
    <div className="w-52 min-h-36 rounded-2xl shadow-md flex flex-col" style={{ background: color }}>
      <div className="flex items-center gap-2 px-3 pt-1 pb-0">
        <DragHandle />
        <div className="flex gap-1.5 flex-wrap" onMouseDown={e => e.stopPropagation()}>
          {showPicker
            ? STICKY_COLORS.map(c => (
                <button key={c} onClick={() => { setColor(c); onChange({ ...node.data, color: c }); setShowPicker(false); }}
                  className="w-5 h-5 rounded-full border-2 border-white shadow" style={{ background: c }} />
              ))
            : <button onClick={() => setShowPicker(true)} className="w-4 h-4 rounded-full border border-border" style={{ background: color }} />
          }
        </div>
      </div>
      <textarea value={text}
        onChange={e => { setText(e.target.value); onChange({ ...node.data, text: e.target.value, color }); }}
        placeholder={he.moodboard.writeHere} dir="rtl"
        className="flex-1 bg-transparent resize-none outline-none text-sm text-foreground placeholder-muted-foreground min-h-20 px-3 pb-3"
      />
    </div>
  );
}

// ─── Image ───────────────────────────────────────────────────────────────────

function ImageCard({ node, onChange }: { node: BoardNode; onChange: (d: Record<string, string>) => void }) {
  const he = useT();
  const [url, setUrl] = useState(node.data.url ?? "");
  const [caption, setCaption] = useState(node.data.caption ?? "");
  const [editing, setEditing] = useState(!node.data.url);
  const [tab, setTab] = useState<"url" | "upload" | "camera">("url");
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const camRef = useRef<HTMLInputElement>(null);

  function compressImage(file: File, maxWidth = 1600, quality = 0.8): Promise<string> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        let w = img.width, h = img.height;
        if (w > maxWidth) { h = Math.round(h * maxWidth / w); w = maxWidth; }
        canvas.width = w; canvas.height = h;
        const ctx = canvas.getContext("2d");
        if (!ctx) { reject(new Error("Canvas not supported")); return; }
        ctx.drawImage(img, 0, 0, w, h);
        resolve(canvas.toDataURL("image/jpeg", quality));
      };
      img.onerror = () => reject(new Error("Failed to load image"));
      img.src = URL.createObjectURL(file);
    });
  }

  function handleFile(file: File | null) {
    if (!file) return;
    setUploading(true);
    compressImage(file).then(dataUrl => {
      setUrl(dataUrl); onChange({ ...node.data, url: dataUrl, caption });
      setEditing(false); setUploading(false);
    }).catch(() => { setUploading(false); alert("שגיאה בעיבוד התמונה"); });
  }

  const [dragOver, setDragOver] = useState(false);

  function handleDrop(e: React.DragEvent) {
    e.preventDefault(); e.stopPropagation(); setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file?.type.startsWith("image/")) { handleFile(file); }
  }

  return (
    <div className="w-64 rounded-2xl shadow-md bg-card flex flex-col overflow-hidden"
      onDragOver={e => { e.preventDefault(); e.stopPropagation(); setDragOver(true); }}
      onDragLeave={e => { e.preventDefault(); setDragOver(false); }}
      onDrop={handleDrop}
    >
      <DragHandle />
      {url && !editing ? (
        <>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={url} alt={caption || he.moodboard.imageAlt} className="w-full object-cover max-h-64"
            onError={() => setEditing(true)}
            onDoubleClick={e => { e.stopPropagation(); setEditing(true); }} />
          <div className="px-3 py-2">
            <input value={caption}
              onChange={e => { setCaption(e.target.value); onChange({ ...node.data, url, caption: e.target.value }); }}
              placeholder={he.moodboard.addDescription} dir="rtl"
              className="w-full bg-transparent text-xs text-muted-foreground outline-none placeholder-muted-foreground border-b border-transparent focus:border-border"
            />
          </div>
        </>
      ) : (
        <div className="p-3 flex flex-col gap-2 relative">
          {/* Drop overlay */}
          {dragOver && (
            <div className="absolute inset-0 z-10 flex items-center justify-center rounded-xl bg-blue-500/20 border-2 border-dashed border-blue-400 backdrop-blur-sm">
              <span className="text-xs font-medium text-blue-600 dark:text-blue-300">שחרר כאן</span>
            </div>
          )}
          {/* Tabs */}
          <div className="flex rounded-lg border border-border p-0.5 gap-0.5 bg-muted text-[11px]">
            {(["url", "upload", "camera"] as const).map(t => (
              <button key={t} onClick={() => setTab(t)}
                className={`flex-1 rounded-md py-1 font-medium transition-colors ${tab === t ? "bg-card shadow text-foreground" : "text-muted-foreground hover:text-muted-foreground"}`}>
                {t === "url" ? he.moodboard.linkTab : t === "upload" ? he.moodboard.uploadTab : he.moodboard.cameraTab}
              </button>
            ))}
          </div>

          {tab === "url" && (
            <>
              <input autoFocus type="url" value={url}
                onChange={e => { setUrl(e.target.value); onChange({ ...node.data, url: e.target.value, caption }); }}
                placeholder="https://..." dir="ltr"
                className="w-full rounded-lg border border-border px-3 py-2 text-xs outline-none focus:border-blue-400"
              />
              {url && <button onClick={() => setEditing(false)}
                className="rounded-lg bg-foreground py-1.5 text-xs font-medium text-background hover:bg-foreground/90 transition-colors">{he.moodboard.showImage}</button>}
            </>
          )}

          {tab === "upload" && (
            <>
              <button onClick={() => fileRef.current?.click()} disabled={uploading}
                className="flex flex-col items-center justify-center gap-2 h-24 bg-muted rounded-xl border-2 border-dashed border-border hover:border-blue-300 hover:bg-blue-50 dark:hover:bg-blue-950 transition-colors">
                {uploading ? <Loader2 className="h-5 w-5 text-muted-foreground animate-spin" />
                  : <><ImageIcon className="h-5 w-5 text-muted-foreground" /><span className="text-[11px] text-muted-foreground">{he.moodboard.dragOrClick ?? "גרור תמונה או לחץ לבחירה"}</span></>}
              </button>
              <input ref={fileRef} type="file" accept="image/*,video/*" className="hidden"
                onChange={e => handleFile(e.target.files?.[0] ?? null)} />
            </>
          )}

          {tab === "camera" && (
            <>
              <button onClick={() => camRef.current?.click()} disabled={uploading}
                className="flex flex-col items-center justify-center gap-2 h-20 bg-muted rounded-xl border-2 border-dashed border-border hover:border-blue-300 hover:bg-blue-50 transition-colors">
                {uploading ? <Loader2 className="h-5 w-5 text-muted-foreground animate-spin" />
                  : <><Camera className="h-5 w-5 text-muted-foreground" /><span className="text-[11px] text-muted-foreground">{he.moodboard.openCamera}</span></>}
              </button>
              <input ref={camRef} type="file" accept="image/*" capture="environment" className="hidden"
                onChange={e => handleFile(e.target.files?.[0] ?? null)} />
            </>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Link ────────────────────────────────────────────────────────────────────

function LinkCard({ node, onChange }: { node: BoardNode; onChange: (d: Record<string, string>) => void }) {
  const he = useT();
  const [url, setUrl]       = useState(node.data.url ?? "");
  const [label, setLabel]   = useState(node.data.label ?? "");
  const [editing, setEdit]  = useState(!node.data.url);

  function commitUrl() {
    onChange({ ...node.data, url, label });
    if (url.trim()) setEdit(false);
  }

  return (
    <div className="w-56 rounded-2xl shadow-md bg-card flex flex-col">
      <DragHandle />
      <div className="px-4 pb-4 flex flex-col gap-2">
        <input value={label}
          onChange={e => { setLabel(e.target.value); onChange({ ...node.data, label: e.target.value, url }); }}
          placeholder={he.moodboard.linkDescription} dir="rtl"
          className="text-sm font-medium outline-none border-b border-border pb-1 focus:border-foreground"
        />
        {editing ? (
          <div className="flex gap-1">
            <input type="url" autoFocus value={url}
              onChange={e => { setUrl(e.target.value); onChange({ ...node.data, url: e.target.value, label }); }}
              onBlur={commitUrl}
              onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); commitUrl(); } }}
              placeholder="https://..." dir="ltr"
              className="flex-1 text-xs text-blue-500 outline-none border-b border-dashed border-border pb-0.5 focus:border-blue-400 min-w-0"
            />
          </div>
        ) : (
          <div className="flex items-center gap-1 group/link">
            <a href={url} target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()}
              className="flex-1 text-xs text-blue-600 underline truncate hover:text-blue-800 transition-colors">
              {url}
            </a>
            <button onClick={() => setEdit(true)}
              className="opacity-0 group-hover/link:opacity-100 flex h-5 w-5 items-center justify-center rounded text-muted-foreground hover:text-foreground hover:bg-muted transition-all flex-shrink-0"
              title={he.moodboard.editLink}>
              <Pencil className="h-3 w-3" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Heading ─────────────────────────────────────────────────────────────────

function HeadingCard({ node, onChange, selected }: { node: BoardNode; onChange: (d: Record<string, string>) => void; selected: boolean }) {
  const he = useT();
  const [text, setText] = useState(node.data.text ?? he.moodboard.heading);
  return (
    <div className="min-w-40 flex flex-col">
      <DragHandle />
      <div>
        <input value={text}
          onChange={e => { setText(e.target.value); onChange({ ...node.data, text: e.target.value }); }}
          dir="rtl"
          className={`bg-transparent outline-none text-2xl font-bold text-foreground w-full min-w-40 pb-1 border-b-2 ${selected ? "border-blue-400" : "border-transparent"} focus:border-foreground`}
        />
      </div>
    </div>
  );
}

// ─── Rich Text ────────────────────────────────────────────────────────────────

function TextCard({ node, onChange, selected }: { node: BoardNode; onChange: (d: Record<string, string>) => void; selected: boolean }) {
  const he = useT();
  const [text, setText]           = useState(node.data.text ?? "");
  const [fontSize, setFontSize]   = useState(node.data.fontSize ?? "14");
  const [fontFamily, setFamily]   = useState(node.data.fontFamily ?? "inherit");
  const [color, setColor]         = useState(node.data.color ?? "#111827");
  const [bgColor, setBg]          = useState(node.data.bgColor ?? "transparent");
  const [bold, setBold]           = useState(node.data.bold === "true");
  const [italic, setItalic]       = useState(node.data.italic === "true");
  const [underline, setUnderline] = useState(node.data.underline === "true");
  const [align, setAlign]         = useState(node.data.align ?? "right");

  function emit(patch: Record<string, string>) {
    onChange({ ...node.data, text, fontSize, fontFamily, color, bgColor,
      bold: bold ? "true" : "false", italic: italic ? "true" : "false",
      underline: underline ? "true" : "false", align, ...patch });
  }

  const btnCls = (active: boolean) =>
    `flex items-center justify-center w-6 h-6 rounded-md text-xs transition-colors ${active ? "bg-gray-200 text-foreground" : "text-muted-foreground hover:bg-muted"}`;

  return (
    <div className="flex flex-col min-w-40" style={{ position: "relative" }}>
      {/* Drag handle — always visible */}
      <DragHandle />

      {/* Text area — transparent background */}
      <textarea value={text}
        onChange={e => { setText(e.target.value); emit({ text: e.target.value }); }}
        placeholder={he.moodboard.typeText}
        dir={align === "left" ? "ltr" : "rtl"}
        className="resize-none outline-none p-1 min-h-16 min-w-40 w-full bg-transparent"
        style={{
          fontFamily, fontSize: `${fontSize}px`, color,
          background: bgColor !== "transparent" ? bgColor : undefined,
          fontWeight: bold ? "bold" : "normal",
          fontStyle: italic ? "italic" : "normal",
          textDecoration: underline ? "underline" : "none",
          textAlign: align as "left" | "center" | "right",
        }}
      />

      {/* Formatting toolbar — floats below textarea when selected */}
      {selected && (
        <div
          onMouseDown={e => e.stopPropagation()}
          style={{ position: "absolute", top: "100%", left: "50%", transform: "translateX(-50%)", marginTop: 8, zIndex: 30, whiteSpace: "nowrap" }}
          className="flex items-center gap-0.5 px-2 py-1.5 bg-card border border-border rounded-xl shadow-lg"
        >
          <select value={fontFamily} onChange={e => { setFamily(e.target.value); emit({ fontFamily: e.target.value }); }}
            className="text-[10px] border border-border rounded px-1 py-0.5 outline-none bg-card max-w-[72px]">
            {FONT_FAMILIES.map(f => <option key={f.value} value={f.value}>{f.labelKey === "default" ? he.moodboard.defaultFont : f.label}</option>)}
          </select>
          <select value={fontSize} onChange={e => { setFontSize(e.target.value); emit({ fontSize: e.target.value }); }}
            className="text-[10px] border border-border rounded px-1 py-0.5 outline-none bg-card w-10">
            {FONT_SIZES.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <div className="h-4 w-px bg-gray-200 mx-0.5" />
          <button onClick={() => { const v = !bold; setBold(v); emit({ bold: v ? "true" : "false" }); }} className={btnCls(bold)}><Bold className="h-3 w-3" /></button>
          <button onClick={() => { const v = !italic; setItalic(v); emit({ italic: v ? "true" : "false" }); }} className={btnCls(italic)}><Italic className="h-3 w-3" /></button>
          <button onClick={() => { const v = !underline; setUnderline(v); emit({ underline: v ? "true" : "false" }); }} className={btnCls(underline)}><Underline className="h-3 w-3" /></button>
          <div className="h-4 w-px bg-gray-200 mx-0.5" />
          <button onClick={() => { setAlign("right"); emit({ align: "right" }); }} className={btnCls(align === "right")}><AlignRight className="h-3 w-3" /></button>
          <button onClick={() => { setAlign("center"); emit({ align: "center" }); }} className={btnCls(align === "center")}><AlignCenter className="h-3 w-3" /></button>
          <button onClick={() => { setAlign("left"); emit({ align: "left" }); }} className={btnCls(align === "left")}><AlignLeft className="h-3 w-3" /></button>
          <div className="h-4 w-px bg-gray-200 mx-0.5" />
          <label className="flex flex-col items-center gap-0.5 cursor-pointer" title={he.moodboard.textColorTitle}>
            <input type="color" value={color} onChange={e => { setColor(e.target.value); emit({ color: e.target.value }); }} className="w-7 h-7 rounded border border-border cursor-pointer p-0" />
            <span className="text-[8px] text-muted-foreground leading-none">{he.moodboard.textColor}</span>
          </label>
          <label className="flex flex-col items-center gap-0.5 cursor-pointer" title={he.moodboard.bgColorTitle}>
            <input type="color" value={bgColor === "transparent" ? "#ffffff" : bgColor}
              onChange={e => { setBg(e.target.value); emit({ bgColor: e.target.value }); }} className="w-7 h-7 rounded border border-border cursor-pointer p-0" />
            <span className="text-[8px] text-muted-foreground leading-none">{he.moodboard.bgColor}</span>
          </label>
          <button onClick={() => { setBg("transparent"); emit({ bgColor: "transparent" }); }}
            className="flex h-5 w-5 items-center justify-center rounded text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            title={he.moodboard.noBg} style={{ fontSize: "10px" }}>
            ✕
          </button>
        </div>
      )}
    </div>
  );
}

// ─── Table ────────────────────────────────────────────────────────────────────

const CORNER_R = 5;
const MIN_COL_W = 44;
const MIN_ROW_H = 26;
const DEFAULT_COL_W = 100;
const DEFAULT_ROW_H = 32;

function TableCard({
  node, onChange, onMove, selected, zoom,
}: {
  node: BoardNode;
  onChange: (d: Record<string, string>) => void;
  onMove: (x: number, y: number) => void;
  selected: boolean;
  zoom: number;
}) {
  const he = useT();
  const parseCells = (): string[][] => {
    try { return JSON.parse(node.data.cells || "[['']]"); } catch { return [[""]]; }
  };
  const [cells, setCells] = useState<string[][]>(parseCells);

  const numCols = cells[0]?.length ?? 1;
  const numRows = cells.length;

  const [colWidths, setColWidths] = useState<number[]>(() => {
    try {
      const s = JSON.parse(node.data.colWidths || "null");
      if (Array.isArray(s) && s.length === numCols) return s;
    } catch {}
    return new Array(numCols).fill(DEFAULT_COL_W);
  });

  const [rowHeights, setRowHeights] = useState<number[]>(() => {
    try {
      const s = JSON.parse(node.data.rowHeights || "null");
      if (Array.isArray(s) && s.length === numRows) return s;
    } catch {}
    return new Array(numRows).fill(DEFAULT_ROW_H);
  });

  // Always-fresh refs for drag closures
  const colWidthsRef  = useRef(colWidths);
  const rowHeightsRef = useRef(rowHeights);
  const cellsRef      = useRef(cells);
  colWidthsRef.current  = colWidths;
  rowHeightsRef.current = rowHeights;
  cellsRef.current      = cells;

  const tableW = colWidths.reduce((a, b) => a + b, 0);
  const tableH = rowHeights.reduce((a, b) => a + b, 0);

  function emitAll(c: string[][], cw: number[], rh: number[]) {
    onChange({
      ...node.data,
      cells: JSON.stringify(c),
      rows: String(c.length),
      cols: String(c[0]?.length ?? 1),
      colWidths: JSON.stringify(cw),
      rowHeights: JSON.stringify(rh),
    });
  }

  function setCell(r: number, c: number, val: string) {
    const next = cellsRef.current.map((row, ri) =>
      row.map((cell, ci) => ri === r && ci === c ? val : cell));
    setCells(next);
    emitAll(next, colWidthsRef.current, rowHeightsRef.current);
  }

  function addRow() {
    const next = [...cellsRef.current, new Array(colWidthsRef.current.length).fill("")];
    const nextH = [...rowHeightsRef.current, DEFAULT_ROW_H];
    setCells(next); setRowHeights(nextH);
    emitAll(next, colWidthsRef.current, nextH);
  }
  function removeRow() {
    if (cellsRef.current.length <= 1) return;
    const next = cellsRef.current.slice(0, -1);
    const nextH = rowHeightsRef.current.slice(0, -1);
    setCells(next); setRowHeights(nextH);
    emitAll(next, colWidthsRef.current, nextH);
  }
  function addCol() {
    const next = cellsRef.current.map(row => [...row, ""]);
    const nextW = [...colWidthsRef.current, DEFAULT_COL_W];
    setCells(next); setColWidths(nextW);
    emitAll(next, nextW, rowHeightsRef.current);
  }
  function removeCol() {
    if ((cellsRef.current[0]?.length ?? 1) <= 1) return;
    const next = cellsRef.current.map(row => row.slice(0, -1));
    const nextW = colWidthsRef.current.slice(0, -1);
    setCells(next); setColWidths(nextW);
    emitAll(next, nextW, rowHeightsRef.current);
  }

  // ── Column resize ──────────────────────────────────────────────────────────
  function startColResize(e: React.MouseEvent, colIdx: number) {
    e.preventDefault(); e.stopPropagation();
    const startX = e.clientX;
    const startW = colWidthsRef.current[colIdx];
    function onMv(ev: MouseEvent) {
      const dx = (ev.clientX - startX) / zoom;
      const next = colWidthsRef.current.map((w, i) => i === colIdx ? Math.max(MIN_COL_W, Math.round(startW + dx)) : w);
      setColWidths(next);
      emitAll(cellsRef.current, next, rowHeightsRef.current);
    }
    function onUp() { window.removeEventListener("mousemove", onMv); window.removeEventListener("mouseup", onUp); }
    window.addEventListener("mousemove", onMv); window.addEventListener("mouseup", onUp);
  }

  // ── Row resize ────────────────────────────────────────────────────────────
  function startRowResize(e: React.MouseEvent, rowIdx: number) {
    e.preventDefault(); e.stopPropagation();
    const startY = e.clientY;
    const startH = rowHeightsRef.current[rowIdx];
    function onMv(ev: MouseEvent) {
      const dy = (ev.clientY - startY) / zoom;
      const next = rowHeightsRef.current.map((h, i) => i === rowIdx ? Math.max(MIN_ROW_H, Math.round(startH + dy)) : h);
      setRowHeights(next);
      emitAll(cellsRef.current, colWidthsRef.current, next);
    }
    function onUp() { window.removeEventListener("mousemove", onMv); window.removeEventListener("mouseup", onUp); }
    window.addEventListener("mousemove", onMv); window.addEventListener("mouseup", onUp);
  }

  // ── Corner resize (proportional scale) ───────────────────────────────────
  function startCornerResize(e: React.MouseEvent, anchorX: -1 | 1, anchorY: -1 | 1) {
    e.preventDefault(); e.stopPropagation();
    const startMx = e.clientX, startMy = e.clientY;
    const startW = tableW, startH = tableH;
    const snapColW = [...colWidthsRef.current];
    const snapRowH = [...rowHeightsRef.current];
    const startNx = node.x, startNy = node.y;
    function onMv(ev: MouseEvent) {
      const dx = (ev.clientX - startMx) / zoom;
      const dy = (ev.clientY - startMy) / zoom;
      const newW = Math.max(snapColW.length * MIN_COL_W, startW + dx * anchorX);
      const newH = Math.max(snapRowH.length * MIN_ROW_H, startH + dy * anchorY);
      const scaleX = newW / startW;
      const scaleY = newH / startH;
      const nextColW = snapColW.map(w => Math.max(MIN_COL_W, Math.round(w * scaleX)));
      const nextRowH = snapRowH.map(h => Math.max(MIN_ROW_H, Math.round(h * scaleY)));
      setColWidths(nextColW); setRowHeights(nextRowH);
      onMove(
        anchorX === -1 ? startNx + (startW - nextColW.reduce((a, b) => a + b, 0)) : startNx,
        anchorY === -1 ? startNy + (startH - nextRowH.reduce((a, b) => a + b, 0)) : startNy,
      );
      emitAll(cellsRef.current, nextColW, nextRowH);
    }
    function onUp() { window.removeEventListener("mousemove", onMv); window.removeEventListener("mouseup", onUp); }
    window.addEventListener("mousemove", onMv); window.addEventListener("mouseup", onUp);
  }

  // Compute boundaries for resize handle overlay positions
  const colBoundaries: number[] = [];
  { let cx = 0; colWidths.slice(0, -1).forEach(w => { cx += w; colBoundaries.push(cx); }); }
  const rowBoundaries: number[] = [];
  { let ry = 0; rowHeights.slice(0, -1).forEach(h => { ry += h; rowBoundaries.push(ry); }); }

  const cornerDefs: { ax: -1|1; ay: -1|1; style: React.CSSProperties }[] = [
    { ax: -1, ay: -1, style: { top: -CORNER_R, left: -CORNER_R, cursor: "nwse-resize" } },
    { ax:  1, ay: -1, style: { top: -CORNER_R, right: -CORNER_R, cursor: "nesw-resize" } },
    { ax: -1, ay:  1, style: { bottom: -CORNER_R, left: -CORNER_R, cursor: "nesw-resize" } },
    { ax:  1, ay:  1, style: { bottom: -CORNER_R, right: -CORNER_R, cursor: "nwse-resize" } },
  ];

  return (
    <div className="flex flex-col">
      <DragHandle />

      {/* Row/col controls — only when selected */}
      {selected && (
        <div className="flex items-center gap-1 px-2 py-1 mb-2 bg-card border border-border rounded-xl shadow-md text-[10px]" onMouseDown={e => e.stopPropagation()}>
          <span className="text-muted-foreground">{he.moodboard.rows}:</span>
          <button onClick={removeRow} className="flex h-5 w-5 items-center justify-center rounded hover:bg-gray-200 text-muted-foreground"><Minus className="h-3 w-3" /></button>
          <span className="font-medium text-foreground w-4 text-center">{cells.length}</span>
          <button onClick={addRow} className="flex h-5 w-5 items-center justify-center rounded hover:bg-gray-200 text-muted-foreground"><Plus className="h-3 w-3" /></button>
          <div className="w-px h-3 bg-gray-200 mx-1" />
          <span className="text-muted-foreground">{he.moodboard.columns}:</span>
          <button onClick={removeCol} className="flex h-5 w-5 items-center justify-center rounded hover:bg-gray-200 text-muted-foreground"><Minus className="h-3 w-3" /></button>
          <span className="font-medium text-foreground w-4 text-center">{cells[0]?.length ?? 1}</span>
          <button onClick={addCol} className="flex h-5 w-5 items-center justify-center rounded hover:bg-gray-200 text-muted-foreground"><Plus className="h-3 w-3" /></button>
        </div>
      )}

      {/* Table + resize handles wrapper */}
      <div style={{ position: "relative", display: "inline-block" }}>

        {/* ── Corner handles ── */}
        {selected && cornerDefs.map((c, i) => (
          <div key={i}
            onMouseDown={e => startCornerResize(e, c.ax, c.ay)}
            style={{
              position: "absolute",
              width: CORNER_R * 2, height: CORNER_R * 2,
              background: "white", border: "2px solid #3b82f6", borderRadius: "50%",
              zIndex: 20, ...c.style,
            }}
          />
        ))}

        {/* ── Column resize handles (vertical bars between columns) ── */}
        {selected && colBoundaries.map((bx, i) => (
          <div key={i}
            onMouseDown={e => startColResize(e, i)}
            style={{
              position: "absolute", left: bx - 3, top: 0,
              width: 6, height: tableH,
              cursor: "col-resize", zIndex: 10,
            }}
            className="hover:bg-blue-400/30 transition-colors"
          />
        ))}

        {/* ── Row resize handles (horizontal bars between rows) ── */}
        {selected && rowBoundaries.map((by, i) => (
          <div key={i}
            onMouseDown={e => startRowResize(e, i)}
            style={{
              position: "absolute", top: by - 3, left: 0,
              width: tableW, height: 6,
              cursor: "row-resize", zIndex: 10,
            }}
            className="hover:bg-blue-400/30 transition-colors"
          />
        ))}

        {/* ── The actual table ── */}
        <table
          className="border-collapse text-xs"
          style={{ tableLayout: "fixed", width: tableW, borderSpacing: 0 }}
        >
          <colgroup>
            {colWidths.map((w, i) => <col key={i} style={{ width: w }} />)}
          </colgroup>
          <tbody>
            {cells.map((row, ri) => (
              <tr key={ri}>
                {row.map((cell, ci) => (
                  <td key={ci}
                    className="border border-border bg-card/90 overflow-hidden"
                    style={{ width: colWidths[ci] ?? DEFAULT_COL_W, height: rowHeights[ri] ?? DEFAULT_ROW_H, padding: 0 }}
                  >
                    <input
                      value={cell}
                      onChange={e => setCell(ri, ci, e.target.value)}
                      dir="rtl"
                      className="outline-none bg-transparent px-1.5"
                      style={{ width: "100%", height: "100%", display: "block" }}
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── Shape ────────────────────────────────────────────────────────────────────

function ShapeCard({ node, onChange, onMove, selected, zoom }: { node: BoardNode; onChange: (d: Record<string, string>) => void; onMove: (x: number, y: number) => void; selected: boolean; zoom: number }) {
  const he = useT();
  const [shape, setShape]       = useState(node.data.shape ?? "rect");
  const [fill, setFill]         = useState(node.data.fill ?? "#3b82f6");
  const [stroke, setStroke]     = useState(node.data.stroke ?? "#1d4ed8");
  const [sw, setSw]             = useState(Number(node.data.strokeWidth ?? "3"));
  const [W, setW]               = useState(Number(node.data.w ?? "200"));
  const [H, setH]               = useState(Number(node.data.h ?? "150"));
  const [rotation, setRotation] = useState(Number(node.data.rotation ?? "0"));
  const svgRef                  = useRef<SVGSVGElement>(null);

  function emit(patch: Record<string, string>) {
    onChange({ ...node.data, shape, fill, stroke, strokeWidth: String(sw), w: String(W), h: String(H), rotation: String(rotation), ...patch });
  }

  function startSVGResize(e: React.MouseEvent<SVGCircleElement>, anchorX: -1 | 1, anchorY: -1 | 1) {
    e.preventDefault();
    e.stopPropagation();
    const startMx = e.clientX, startMy = e.clientY;
    const startW = W, startH = H;
    const startNx = node.x, startNy = node.y;
    function onMoveR(ev: MouseEvent) {
      const dx = (ev.clientX - startMx) / zoom;
      const dy = (ev.clientY - startMy) / zoom;
      const newW = Math.max(40, startW + dx * anchorX);
      const newH = Math.max(40, startH + dy * anchorY);
      const newX = anchorX === -1 ? startNx + (startW - newW) : startNx;
      const newY = anchorY === -1 ? startNy + (startH - newH) : startNy;
      setW(Math.round(newW));
      setH(Math.round(newH));
      onMove(newX, newY);
      onChange({ ...node.data, shape, fill, stroke, strokeWidth: String(sw), rotation: String(rotation), w: String(Math.round(newW)), h: String(Math.round(newH)) });
    }
    function onUpR() { window.removeEventListener("mousemove", onMoveR); window.removeEventListener("mouseup", onUpR); }
    window.addEventListener("mousemove", onMoveR);
    window.addEventListener("mouseup", onUpR);
  }

  function startRotate(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    const svgEl = svgRef.current;
    if (!svgEl) return;
    const rect = svgEl.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const startAngle = Math.atan2(e.clientY - cy, e.clientX - cx) * (180 / Math.PI);
    const startRot = rotation;
    function onMoveRot(ev: MouseEvent) {
      const angle = Math.atan2(ev.clientY - cy, ev.clientX - cx) * (180 / Math.PI);
      const newRot = Math.round(startRot + (angle - startAngle));
      setRotation(newRot);
      emit({ rotation: String(newRot) });
    }
    function onUpRot() { window.removeEventListener("mousemove", onMoveRot); window.removeEventListener("mouseup", onUpRot); }
    window.addEventListener("mousemove", onMoveRot);
    window.addEventListener("mouseup", onUpRot);
  }

  function renderShape(w: number, h: number, f: string, s: string, sw2: number) {
    const p = sw2 + 4;
    switch (shape) {
      case "rect":
        return <rect x={p} y={p} width={w - p * 2} height={h - p * 2} rx="8" fill={f} stroke={s} strokeWidth={sw2} />;
      case "circle":
        return <ellipse cx={w / 2} cy={h / 2} rx={(w - p * 2) / 2} ry={(h - p * 2) / 2} fill={f} stroke={s} strokeWidth={sw2} />;
      case "triangle": {
        const pts = `${w / 2},${p} ${w - p},${h - p} ${p},${h - p}`;
        return <polygon points={pts} fill={f} stroke={s} strokeWidth={sw2} />;
      }
      case "diamond": {
        const pts = `${w / 2},${p} ${w - p},${h / 2} ${w / 2},${h - p} ${p},${h / 2}`;
        return <polygon points={pts} fill={f} stroke={s} strokeWidth={sw2} />;
      }
      case "star": {
        const cx = w / 2, cy = h / 2, r1 = Math.min(w, h) / 2 - p, r2 = r1 * 0.4;
        const pts = Array.from({ length: 10 }, (_, i) => {
          const angle = (Math.PI / 5) * i - Math.PI / 2;
          const r = i % 2 === 0 ? r1 : r2;
          return `${cx + r * Math.cos(angle)},${cy + r * Math.sin(angle)}`;
        }).join(" ");
        return <polygon points={pts} fill={f} stroke={s} strokeWidth={sw2} />;
      }
      case "arrow": {
        const aw = w - p * 2, ah = h - p * 2;
        const bodyH = ah * 0.22, headW = aw * 0.42, bodyY = (h - bodyH) / 2;
        const pts = [
          `${p},${bodyY}`,
          `${w - p - headW},${bodyY}`,
          `${w - p - headW},${p}`,
          `${w - p},${h / 2}`,
          `${w - p - headW},${h - p}`,
          `${w - p - headW},${bodyY + bodyH}`,
          `${p},${bodyY + bodyH}`,
        ].join(" ");
        return <polygon points={pts} fill={f} stroke={s} strokeWidth={sw2} />;
      }
      default:
        return <rect x={p} y={p} width={w - p * 2} height={h - p * 2} rx="8" fill={f} stroke={s} strokeWidth={sw2} />;
    }
  }

  return (
    <div className="flex flex-col">
      <DragHandle />

      {/* SVG wrapper — toolbar + rotate handle positioned relative to this */}
      <div style={{ position: "relative", display: "inline-block" }}>
        {/* Rotate handle — stem + circle above shape center */}
        {selected && (
          <>
            <div style={{ position: "absolute", left: W / 2 - 0.5, top: -10, width: 1, height: 10, background: "#93c5fd", zIndex: 29, pointerEvents: "none" }} />
            <div
              onMouseDown={startRotate}
              style={{ position: "absolute", left: W / 2 - 11, top: -32, zIndex: 30, cursor: "grab" }}
              className="flex h-[22px] w-[22px] items-center justify-center rounded-full bg-card border border-blue-300 shadow-md text-blue-500 hover:bg-blue-50 transition-colors"
              title={he.moodboard.rotate}
            >
              <RotateCcw className="h-3 w-3" />
            </div>
          </>
        )}

        {/* Floating toolbar BELOW the shape — doesn't shift layout, always reachable */}
        {selected && (
          <div
            onMouseDown={e => e.stopPropagation()}
            style={{ position: "absolute", top: H + 10, left: "50%", transform: "translateX(-50%)", zIndex: 30, whiteSpace: "nowrap" }}
            className="flex items-center gap-1 px-2 py-1.5 bg-card border border-border rounded-xl shadow-lg"
          >
            {/* Shape type buttons */}
            {SHAPE_TYPES.map(s => (
              <button key={s.id} onClick={() => { setShape(s.id); emit({ shape: s.id }); }}
                title={(he.moodboard as Record<string, string>)[s.labelKey]}
                className={`flex h-7 w-7 items-center justify-center rounded-lg transition-colors ${shape === s.id ? "bg-blue-100 text-blue-600" : "text-muted-foreground hover:bg-muted"}`}>
                <s.Icon className="h-4 w-4" />
              </button>
            ))}
            <div className="h-5 w-px bg-gray-200 mx-0.5" />
            {/* Fill color */}
            <label className="flex flex-col items-center gap-0.5 cursor-pointer" title={he.moodboard.fillColor}>
              <input type="color" value={fill} onChange={e => { setFill(e.target.value); emit({ fill: e.target.value }); }} className="w-6 h-6 rounded cursor-pointer border border-border p-0" />
              <span className="text-[8px] text-muted-foreground leading-none">{he.moodboard.fillLabel}</span>
            </label>
            {/* Stroke color */}
            <label className="flex flex-col items-center gap-0.5 cursor-pointer" title={he.moodboard.strokeColor}>
              <input type="color" value={stroke} onChange={e => { setStroke(e.target.value); emit({ stroke: e.target.value }); }} className="w-6 h-6 rounded cursor-pointer border border-border p-0" />
              <span className="text-[8px] text-muted-foreground leading-none">{he.moodboard.strokeLabel}</span>
            </label>
            <div className="h-5 w-px bg-gray-200 mx-0.5" />
            {/* Stroke width */}
            <label className="flex flex-col items-center gap-0.5 cursor-pointer text-[8px] text-muted-foreground">
              <input type="range" min="0" max="16" value={sw} onChange={e => { const v = Number(e.target.value); setSw(v); emit({ strokeWidth: String(v) }); }}
                className="w-16 h-2 accent-blue-500" />
              <span className="leading-none">{he.moodboard.strokeWidth} {sw}</span>
            </label>
          </div>
        )}

        <svg ref={svgRef} width={W} height={H}
          style={{ display: "block", overflow: "visible", transform: `rotate(${rotation}deg)`, transformOrigin: "center center" }}>
          {renderShape(W, H, fill, stroke, sw)}
          {/* Corner resize handles — only when not rotated to avoid direction confusion */}
          {selected && rotation === 0 && ([[-1,-1],[1,-1],[-1,1],[1,1]] as const).map(([ax, ay]) => {
            const cx = ax === -1 ? 0 : W;
            const cy = ay === -1 ? 0 : H;
            const cursor = (ax === ay ? "nwse" : "nesw") + "-resize";
            const r = 6 / zoom;
            return (
              <circle key={`${ax}${ay}`}
                cx={cx} cy={cy} r={r}
                fill="white" stroke="#3b82f6" strokeWidth={1.5 / zoom}
                style={{ cursor, filter: "drop-shadow(0 1px 2px rgba(0,0,0,0.25))" }}
                onMouseDown={e => startSVGResize(e, ax as -1|1, ay as -1|1)}
              />
            );
          })}
        </svg>
      </div>
    </div>
  );
}

// ─── Draw ─────────────────────────────────────────────────────────────────────

function DrawCard({ node, onChange, selected }: { node: BoardNode; onChange: (d: Record<string, string>) => void; selected: boolean }) {
  const he = useT();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawing = useRef(false);
  const lastPos = useRef<{ x: number; y: number } | null>(null);
  const [tool, setTool]       = useState<"pen" | "eraser">("pen");
  const [color, setColor]     = useState(node.data.penColor ?? "#1a1a1a");
  const [lineWidth, setWidth] = useState(Number(node.data.lineWidth ?? "3"));
  const initialized = useRef(false);

  // Load saved drawing once — transparent background
  useEffect(() => {
    if (initialized.current || !canvasRef.current) return;
    initialized.current = true;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d")!;
    // Clear to transparent
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (node.data.dataUrl) {
      const img = new Image();
      img.onload = () => ctx.drawImage(img, 0, 0);
      img.src = node.data.dataUrl;
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function getPos(e: React.PointerEvent) {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    return { x: (e.clientX - rect.left) * scaleX, y: (e.clientY - rect.top) * scaleY };
  }

  function startDraw(e: React.PointerEvent) {
    e.stopPropagation();
    drawing.current = true;
    lastPos.current = getPos(e);
    canvasRef.current?.setPointerCapture(e.pointerId);
  }

  function draw(e: React.PointerEvent) {
    if (!drawing.current || !lastPos.current || !canvasRef.current) return;
    e.stopPropagation();
    const ctx = canvasRef.current.getContext("2d")!;
    const pos = getPos(e);
    ctx.beginPath();
    ctx.moveTo(lastPos.current.x, lastPos.current.y);
    ctx.lineTo(pos.x, pos.y);
    if (tool === "eraser") {
      ctx.globalCompositeOperation = "destination-out";
      ctx.strokeStyle = "rgba(0,0,0,1)";
      ctx.lineWidth = lineWidth * 5;
    } else {
      ctx.globalCompositeOperation = "source-over";
      ctx.strokeStyle = color;
      ctx.lineWidth = lineWidth;
    }
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.stroke();
    lastPos.current = pos;
  }

  function endDraw(e: React.PointerEvent) {
    e.stopPropagation();
    if (!drawing.current) return;
    drawing.current = false;
    lastPos.current = null;
    if (canvasRef.current) {
      onChange({ ...node.data, dataUrl: canvasRef.current.toDataURL("image/png"), penColor: color, lineWidth: String(lineWidth) });
    }
  }

  function clearCanvas() {
    if (!canvasRef.current) return;
    const ctx = canvasRef.current.getContext("2d")!;
    ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    onChange({ ...node.data, dataUrl: "" });
  }

  const btnCls = (active: boolean) =>
    `flex h-6 w-6 items-center justify-center rounded-md transition-colors ${active ? "bg-card shadow text-foreground" : "text-muted-foreground hover:bg-card/60"}`;

  return (
    <div className="flex flex-col" style={{ width: 480, height: 360 }}>
      {/* Floating toolbar — only when selected */}
      {selected && (
        <div className="flex items-center gap-1.5 px-2 py-1 mb-1 bg-card border border-border rounded-xl shadow-md" onMouseDown={e => e.stopPropagation()}>
          <button onClick={() => setTool("pen")}    className={btnCls(tool === "pen")}><Pencil  className="h-3.5 w-3.5" /></button>
          <button onClick={() => setTool("eraser")} className={btnCls(tool === "eraser")}><Eraser className="h-3.5 w-3.5" /></button>
          <div className="h-4 w-px bg-gray-200" />
          <input type="color" value={color} onChange={e => setColor(e.target.value)} className="w-7 h-7 rounded border-none cursor-pointer" title={he.moodboard.color} />
          <div className="h-4 w-px bg-gray-200" />
          {[2, 4, 8, 14].map(w => (
            <button key={w} onClick={() => setWidth(w)}
              className={`flex h-6 w-6 items-center justify-center rounded-md transition-colors ${lineWidth === w ? "bg-muted" : "hover:bg-muted"}`}>
              <div className="rounded-full bg-gray-700" style={{ width: Math.min(w, 12), height: Math.min(w, 12) }} />
            </button>
          ))}
          <div className="flex-1" />
          <button onClick={clearCanvas} className="flex h-6 w-6 items-center justify-center rounded-md text-muted-foreground hover:bg-muted" title={he.moodboard.clear}>
            <RotateCcw className="h-3.5 w-3.5" />
          </button>
        </div>
      )}
      {/* Drag handle — tiny, only visible */}
      <div data-drag-handle className="flex justify-center py-0.5 cursor-grab active:cursor-grabbing opacity-10 hover:opacity-30 transition-opacity select-none absolute top-0 left-1/2 -translate-x-1/2 z-10">
        <GripHorizontal className="h-3 w-3" />
      </div>
      {/* Transparent canvas — no borders, no background */}
      <canvas ref={canvasRef} width={960} height={720}
        className="w-full h-full cursor-crosshair"
        style={{ touchAction: "none", background: "transparent", border: "none", outline: "none", display: "block" }}
        onPointerDown={startDraw} onPointerMove={draw}
        onPointerUp={endDraw} onPointerLeave={endDraw}
      />
    </div>
  );
}

// ─── Committed Draw (global draw committed to node) ───────────────────────────

function CommittedDrawCard({ node, onChange, selected }: { node: BoardNode; onChange: (d: Record<string, string>) => void; selected: boolean }) {
  const he = useT();
  const [rotation, setRotation] = useState(Number(node.data.rotation ?? "0"));
  const imgRef = useRef<HTMLImageElement>(null);
  const w = Number(node.data.w ?? 200);
  const h = Number(node.data.h ?? 200);

  function startRotate(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation(); // prevent drag from starting
    const imgEl = imgRef.current;
    if (!imgEl) return;
    const rect = imgEl.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const startAngle = Math.atan2(e.clientY - cy, e.clientX - cx) * (180 / Math.PI);
    const startRot = rotation;
    function onMoveRot(ev: MouseEvent) {
      const angle = Math.atan2(ev.clientY - cy, ev.clientX - cx) * (180 / Math.PI);
      const newRot = Math.round(startRot + (angle - startAngle));
      setRotation(newRot);
      onChange({ ...node.data, rotation: String(newRot) });
    }
    function onUpRot() { window.removeEventListener("mousemove", onMoveRot); window.removeEventListener("mouseup", onUpRot); }
    window.addEventListener("mousemove", onMoveRot);
    window.addEventListener("mouseup", onUpRot);
  }

  return (
    <div style={{ display: "inline-block", position: "relative" }}>
      {/* Rotate handle — outside the drag-handle div so it doesn't trigger drag */}
      {selected && (
        <>
          <div style={{ position: "absolute", left: w / 2 - 0.5, top: -10, width: 1, height: 10, background: "#93c5fd", zIndex: 29, pointerEvents: "none" }} />
          <div
            onMouseDown={startRotate}
            style={{ position: "absolute", left: w / 2 - 11, top: -32, zIndex: 30, cursor: "grab" }}
            className="flex h-[22px] w-[22px] items-center justify-center rounded-full bg-card border border-blue-300 shadow-md text-blue-500 hover:bg-blue-50 transition-colors"
            title={he.moodboard.rotate}
          >
            <RotateCcw className="h-3 w-3" />
          </div>
        </>
      )}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        ref={imgRef}
        src={node.data.dataUrl}
        style={{ width: w, height: h, display: "block", objectFit: "fill", transform: `rotate(${rotation}deg)`, transformOrigin: "center center", cursor: "grab" }}
        alt={he.moodboard.drawingAlt}
        draggable={false}
      />
    </div>
  );
}

// ─── Draggable Node Wrapper ───────────────────────────────────────────────────

function DraggableNode({ node, zoom, selected, onSelect, onMove, onChange, onDelete }: {
  node: BoardNode; zoom: number; selected: boolean;
  onSelect: (addToSelection: boolean) => void; onMove: (x: number, y: number) => void;
  onChange: (d: Record<string, string>) => void; onDelete: () => void;
}) {
  const dragStart = useRef<{ mx: number; my: number; nx: number; ny: number } | null>(null);

  function onMouseDown(e: React.MouseEvent) {
    const addToSelection = e.ctrlKey || e.metaKey;
    onSelect(addToSelection);
    const t = e.target as HTMLElement;
    // Don't start drag when clicking on form elements, buttons, or links
    if (
      t.tagName === "INPUT" ||
      t.tagName === "TEXTAREA" ||
      t.tagName === "SELECT" ||
      t.tagName === "BUTTON" ||
      t.tagName === "A" ||
      t.closest("button") ||
      t.closest("a") ||
      (t as HTMLInputElement).type === "color"
    ) return;
    e.preventDefault();
    e.stopPropagation();
    dragStart.current = { mx: e.clientX, my: e.clientY, nx: node.x, ny: node.y };
    function onMove2(ev: MouseEvent) {
      if (!dragStart.current) return;
      const dx = (ev.clientX - dragStart.current.mx) / zoom;
      const dy = (ev.clientY - dragStart.current.my) / zoom;
      onMove(dragStart.current.nx + dx, dragStart.current.ny + dy);
    }
    function onUp() {
      dragStart.current = null;
      window.removeEventListener("mousemove", onMove2);
      window.removeEventListener("mouseup", onUp);
    }
    window.addEventListener("mousemove", onMove2);
    window.addEventListener("mouseup", onUp);
  }

  const isCommittedDraw = node.type === "draw" && node.data.committed === "true";
  const hasCard = (node.type !== "text" && node.type !== "table" && node.type !== "draw" && node.type !== "heading" && node.type !== "shape") || isCommittedDraw;

  return (
    <div onMouseDown={onMouseDown} style={{ userSelect: "none", position: "relative" }}>
      {selected && (
        <button onMouseDown={e => e.stopPropagation()} onClick={onDelete}
          style={{ position: "absolute", top: -10, right: -10, zIndex: 20 }}
          className="flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-background shadow hover:bg-red-600 transition-colors">
          <X className="h-3.5 w-3.5" />
        </button>
      )}

      <div className={selected && hasCard ? "ring-2 ring-blue-500 ring-offset-1 rounded-2xl" : ""}>
        {node.type === "sticky"  && <StickyCard  node={node} onChange={onChange} />}
        {node.type === "image"   && <ImageCard   node={node} onChange={onChange} />}
        {node.type === "link"    && <LinkCard    node={node} onChange={onChange} />}
        {node.type === "heading" && <HeadingCard node={node} onChange={onChange} selected={selected} />}
        {node.type === "text"    && <TextCard    node={node} onChange={onChange} selected={selected} />}
        {node.type === "table"   && <TableCard   node={node} onChange={onChange} onMove={onMove} selected={selected} zoom={zoom} />}
        {node.type === "shape"   && <ShapeCard   node={node} onChange={onChange} onMove={onMove} selected={selected} zoom={zoom} />}
        {node.type === "draw" && isCommittedDraw && <CommittedDrawCard node={node} onChange={onChange} selected={selected} />}
        {node.type === "draw" && !isCommittedDraw && !node.data._drawLayer && <DrawCard node={node} onChange={onChange} selected={selected} />}
      </div>
    </div>
  );
}

// ─── Main Canvas ─────────────────────────────────────────────────────────────

export function MoodboardCanvas({ id, title: initialTitle, initialNodes, planLimit }: {
  id: string; title: string; initialNodes: string; initialEdges: string; planLimit: number;
}) {
  const he = useT();
  const [nodes, setNodes]       = useState<BoardNode[]>(() => { try { return JSON.parse(initialNodes || "[]"); } catch { return []; } });
  const [history, setHistory]   = useState<BoardNode[][]>([]);
  const [upgradeOpen, setUpgradeOpen] = useState(false);

  // Always-fresh nodes ref — lets isAtNodeLimit work correctly in stale closures
  const nodesRef = useRef(nodes);
  nodesRef.current = nodes;
  const planLimitRef = useRef(planLimit);
  planLimitRef.current = planLimit;

  // No element limit on moodboard
  function isAtNodeLimit() { return false; }
  const [title, setTitle]       = useState(initialTitle);
  const [editingTitle, setET]   = useState(false);
  const [selectedId, setSelId]  = useState<string | null>(null);
  const [selBox, setSelBox]     = useState<{ x1: number; y1: number; x2: number; y2: number } | null>(null);
  const [multiSel, setMultiSel] = useState<Set<string>>(new Set());
  const [saveState, setSave]    = useState<"saved" | "saving" | "unsaved">("saved");
  const [zoom, setZoom]         = useState(1);
  const [pan, setPan]           = useState({ x: 0, y: 0 });
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const canvasRef = useRef<HTMLDivElement>(null);
  const isPanning      = useRef(false);
  const panStart       = useRef({ mx: 0, my: 0, px: 0, py: 0 });
  const spaceHeld      = useRef(false);

  // ── Global draw layer ──────────────────────────────────────────────────────
  const [drawMode, setDrawMode]     = useState(false);
  const [penColor, setPenColor]     = useState("#1a1a1a");
  const [penWidth, setPenWidth]     = useState(3);
  const [penTool, setPenTool]       = useState<"pen" | "eraser">("pen");
  const drawCanvasRef                = useRef<HTMLCanvasElement>(null);
  const isDrawingG                   = useRef(false);
  const lastDrawPosG                 = useRef<{ x: number; y: number } | null>(null);

  // Convert screen pointer event → canvas pixel on the global draw canvas
  function getGlobalDrawPos(e: React.PointerEvent<HTMLCanvasElement>): { x: number; y: number } {
    const canvas = drawCanvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    return {
      x: (e.clientX - rect.left) * (canvas.width / rect.width),
      y: (e.clientY - rect.top)  * (canvas.height / rect.height),
    };
  }

  function startGlobalDraw(e: React.PointerEvent<HTMLCanvasElement>) {
    e.stopPropagation();
    isDrawingG.current = true;
    lastDrawPosG.current = getGlobalDrawPos(e);
    drawCanvasRef.current?.setPointerCapture(e.pointerId);
  }

  function continueGlobalDraw(e: React.PointerEvent<HTMLCanvasElement>) {
    if (!isDrawingG.current || !lastDrawPosG.current || !drawCanvasRef.current) return;
    const ctx = drawCanvasRef.current.getContext("2d")!;
    const pos = getGlobalDrawPos(e);
    ctx.beginPath();
    ctx.moveTo(lastDrawPosG.current.x, lastDrawPosG.current.y);
    ctx.lineTo(pos.x, pos.y);
    if (penTool === "eraser") {
      ctx.globalCompositeOperation = "destination-out";
      ctx.strokeStyle = "rgba(0,0,0,1)";
      ctx.lineWidth = penWidth * 5;
    } else {
      ctx.globalCompositeOperation = "source-over";
      ctx.strokeStyle = penColor;
      ctx.lineWidth = penWidth;
    }
    ctx.lineCap = "round"; ctx.lineJoin = "round"; ctx.stroke();
    lastDrawPosG.current = pos;
  }

  function endGlobalDraw(_e: React.PointerEvent<HTMLCanvasElement>) {
    if (!isDrawingG.current) return;
    isDrawingG.current = false;
    lastDrawPosG.current = null;
    // Drawing is kept on canvas until user exits draw mode
  }

  function exitDrawMode() {
    if (drawCanvasRef.current) {
      const canvas = drawCanvasRef.current;
      const ctx = canvas.getContext("2d")!;
      const W = canvas.width, H = canvas.height;
      const imageData = ctx.getImageData(0, 0, W, H);
      const data = imageData.data;

      // Find bounding box of drawn pixels by scanning alpha channel
      let minX = W, minY = H, maxX = 0, maxY = 0, hasContent = false;
      for (let y = 0; y < H; y++) {
        for (let x = 0; x < W; x++) {
          if (data[(y * W + x) * 4 + 3] > 0) {
            hasContent = true;
            if (x < minX) minX = x;
            if (x > maxX) maxX = x;
            if (y < minY) minY = y;
            if (y > maxY) maxY = y;
          }
        }
      }

      if (hasContent) {
        const pad = 8;
        minX = Math.max(0, minX - pad);
        minY = Math.max(0, minY - pad);
        maxX = Math.min(W - 1, maxX + pad);
        maxY = Math.min(H - 1, maxY + pad);
        const cropW = maxX - minX + 1;
        const cropH = maxY - minY + 1;

        // Crop to bounding box using an offscreen canvas
        const off = document.createElement("canvas");
        off.width = cropW; off.height = cropH;
        off.getContext("2d")!.drawImage(canvas, minX, minY, cropW, cropH, 0, 0, cropW, cropH);
        const dataUrl = off.toDataURL("image/png");

        // Canvas is at world (-1500, -1500), so canvas pixel (px,py) = world (px-1500, py-1500)
        const worldX = minX - 1500;
        const worldY = minY - 1500;

        const newNode: BoardNode = {
          id: uid(), type: "draw", x: worldX, y: worldY,
          data: { dataUrl, committed: "true", w: String(cropW), h: String(cropH) },
        };
        if (isAtNodeLimit()) { setUpgradeOpen(true); ctx.clearRect(0, 0, W, H); setDrawMode(false); return; }
        setHistory(h => [...h, nodes]);
        setNodes(prev => [...prev.filter(n => n.data._drawLayer !== "true"), newNode]);
        ctx.clearRect(0, 0, W, H);
      }
    }
    setDrawMode(false);
  }

  // Clipboard ref for copy/paste
  const clipboard = useRef<BoardNode | null>(null);

  // Keyboard shortcuts
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      // Don't intercept when typing in any editable element
      const t = e.target as HTMLElement;
      if (
        t.tagName === "INPUT" ||
        t.tagName === "TEXTAREA" ||
        t.tagName === "SELECT" ||
        t.isContentEditable ||
        (t as HTMLInputElement).type === "color"
      ) return;

      if (e.key === "Delete" || e.key === "Backspace") {
        if (multiSel.size > 0) {
          setHistory(h => [...h, nodes]);
          setNodes(prev => prev.filter(n => !multiSel.has(n.id)));
          setMultiSel(new Set());
        } else if (selectedId) {
          setHistory(h => [...h, nodes]);
          setNodes(prev => prev.filter(n => n.id !== selectedId));
          setSelId(null);
        }
        return;
      }
      if (e.key === "Escape") {
        setSelId(null); setMultiSel(new Set());
        if (drawMode) {
          // Discard draw (don't commit) and clear canvas
          const ctx = drawCanvasRef.current?.getContext("2d");
          if (ctx && drawCanvasRef.current) ctx.clearRect(0, 0, drawCanvasRef.current.width, drawCanvasRef.current.height);
          setDrawMode(false);
        }
        return;
      }
      if (e.code === "Space") { e.preventDefault(); spaceHeld.current = true; return; }
      if ((e.ctrlKey || e.metaKey) && e.key === "z") {
        e.preventDefault();
        setHistory(h => {
          if (h.length === 0) return h;
          const prev = h[h.length - 1];
          setNodes(prev);
          return h.slice(0, -1);
        });
        return;
      }
      if ((e.ctrlKey || e.metaKey) && e.key === "c" && selectedId) {
        const node = nodes.find(n => n.id === selectedId);
        if (node) clipboard.current = node;
        return;
      }
      if ((e.ctrlKey || e.metaKey) && e.key === "v" && clipboard.current) {
        e.preventDefault();
        if (isAtNodeLimit()) { setUpgradeOpen(true); return; }
        const copy: BoardNode = { ...clipboard.current, id: uid(), x: clipboard.current.x + 24, y: clipboard.current.y + 24 };
        setHistory(h => [...h, nodes]);
        setNodes(prev => [...prev, copy]);
        setSelId(copy.id);
        return;
      }
      if ((e.ctrlKey || e.metaKey) && e.key === "d" && selectedId) {
        e.preventDefault();
        const node = nodes.find(n => n.id === selectedId);
        if (node) {
          if (isAtNodeLimit()) { setUpgradeOpen(true); return; }
          const copy: BoardNode = { ...node, id: uid(), x: node.x + 24, y: node.y + 24 };
          setHistory(h => [...h, nodes]);
          setNodes(prev => [...prev, copy]);
          setSelId(copy.id);
        }
        return;
      }
    }
    function onKeyUp(e: KeyboardEvent) { if (e.code === "Space") spaceHeld.current = false; }
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    return () => { window.removeEventListener("keydown", onKeyDown); window.removeEventListener("keyup", onKeyUp); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedId, nodes, drawMode]);

  // Track latest title in ref for beforeunload
  const titleRef = useRef(title);
  titleRef.current = title;
  const pendingSave = useRef(false);

  // Direct save function (no debounce)
  const doSave = useCallback(async (ns: BoardNode[], t: string) => {
    setSave("saving");
    pendingSave.current = false;
    try { await updateMoodboard(id, { title: t, nodesData: JSON.stringify(ns), edgesData: "[]" }); setSave("saved"); }
    catch { setSave("unsaved"); }
  }, [id]);

  // Auto-save with 800ms debounce
  const scheduleSave = useCallback((ns: BoardNode[], t: string) => {
    setSave("unsaved");
    pendingSave.current = true;
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => doSave(ns, t), 800);
  }, [doSave]);

  // Manual save
  const forceSave = useCallback(async () => {
    if (saveTimer.current) clearTimeout(saveTimer.current);
    await doSave(nodesRef.current, titleRef.current);
  }, [doSave]);

  useEffect(() => { scheduleSave(nodes, title); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [nodes, title]);

  // Save on page close/navigate — flush pending changes
  useEffect(() => {
    const onBeforeUnload = () => {
      if (pendingSave.current) {
        // Use sendBeacon for reliable save on tab close
        const payload = JSON.stringify({ title: titleRef.current, nodesData: JSON.stringify(nodesRef.current), edgesData: "[]" });
        navigator.sendBeacon?.(`/api/moodboard-save/${id}`, payload);
      }
    };
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", onBeforeUnload);
      // Also flush on component unmount (navigation within app)
      if (pendingSave.current && saveTimer.current) {
        clearTimeout(saveTimer.current);
        doSave(nodesRef.current, titleRef.current);
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  // Add node
  function addNode(type: NodeType) {
    if (isAtNodeLimit()) { setUpgradeOpen(true); return; }
    const defaults: Record<NodeType, Record<string, string>> = {
      sticky:  { text: he.moodboard.newNote, color: "#fef08a" },
      image:   { url: "", alt: "" },
      link:    { url: "", label: he.moodboard.link },
      heading: { text: he.moodboard.newHeading },
      text:    { text: "", fontSize: "14", fontFamily: "inherit", color: "#111827", bgColor: "transparent", bold: "false", italic: "false", underline: "false", align: "right" },
      table:   { cells: JSON.stringify([["", "", ""], ["", "", ""], ["", "", ""]]), rows: "3", cols: "3" },
      shape:   { shape: "rect", fill: "#3b82f6", stroke: "#1d4ed8", strokeWidth: "3", w: "200", h: "150" },
      draw:    { dataUrl: "", penColor: "#1a1a1a", lineWidth: "3" },
    };
    // Place new node near center of current viewport
    const vx = (canvasRef.current?.clientWidth ?? 800) / 2;
    const vy = (canvasRef.current?.clientHeight ?? 600) / 2;
    const x = (vx - pan.x) / zoom - 100 + Math.random() * 40;
    const y = (vy - pan.y) / zoom - 60 + Math.random() * 40;
    const n: BoardNode = { id: uid(), type, x, y, data: defaults[type] };
    setHistory(h => [...h, nodes]);
    setNodes(prev => [...prev, n]);
    setSelId(n.id);
  }

  // Canvas pan (middle-mouse or space+drag) / box-select (left-mouse drag on empty area)
  function onCanvasMouseDown(e: React.MouseEvent) {
    // In draw mode the draw canvas captures everything — ignore background clicks
    if (drawMode) return;
    // Only fires on the canvas background itself (not on nodes)
    if (e.currentTarget !== e.target) return;

    if (e.button === 1) {
      // Middle mouse → pan
      isPanning.current = true;
      panStart.current = { mx: e.clientX, my: e.clientY, px: pan.x, py: pan.y };
      function onMoveP(ev: MouseEvent) { if (!isPanning.current) return; setPan({ x: panStart.current.px + ev.clientX - panStart.current.mx, y: panStart.current.py + ev.clientY - panStart.current.my }); }
      function onUpP() { isPanning.current = false; window.removeEventListener("mousemove", onMoveP); window.removeEventListener("mouseup", onUpP); }
      window.addEventListener("mousemove", onMoveP);
      window.addEventListener("mouseup", onUpP);
      return;
    }

    if (e.button === 0 && (e.altKey || spaceHeld.current)) {
      // Alt/Space + left drag → pan
      isPanning.current = true;
      panStart.current = { mx: e.clientX, my: e.clientY, px: pan.x, py: pan.y };
      setSelId(null);
      function onMoveA(ev: MouseEvent) { if (!isPanning.current) return; setPan({ x: panStart.current.px + ev.clientX - panStart.current.mx, y: panStart.current.py + ev.clientY - panStart.current.my }); }
      function onUpA() { isPanning.current = false; window.removeEventListener("mousemove", onMoveA); window.removeEventListener("mouseup", onUpA); }
      window.addEventListener("mousemove", onMoveA);
      window.addEventListener("mouseup", onUpA);
      return;
    }

    if (e.button === 0) {
      // Left click on empty canvas → box selection
      setSelId(null);
      setMultiSel(new Set());
      const rect = canvasRef.current!.getBoundingClientRect();
      // Convert screen coords to canvas world coords
      const x0 = (e.clientX - rect.left - pan.x) / zoom;
      const y0 = (e.clientY - rect.top  - pan.y) / zoom;
      let box = { x1: x0, y1: y0, x2: x0, y2: y0 };
      setSelBox(box);

      function onMoveB(ev: MouseEvent) {
        const x1 = Math.min(x0, (ev.clientX - rect.left - pan.x) / zoom);
        const y1 = Math.min(y0, (ev.clientY - rect.top  - pan.y) / zoom);
        const x2 = Math.max(x0, (ev.clientX - rect.left - pan.x) / zoom);
        const y2 = Math.max(y0, (ev.clientY - rect.top  - pan.y) / zoom);
        box = { x1, y1, x2, y2 };
        setSelBox({ ...box });
      }
      function onUpB(ev: MouseEvent) {
        window.removeEventListener("mousemove", onMoveB);
        window.removeEventListener("mouseup", onUpB);
        setSelBox(null);
        // If the drag was tiny, treat as click (deselect all)
        const dx = Math.abs(ev.clientX - e.clientX), dy = Math.abs(ev.clientY - e.clientY);
        if (dx < 4 && dy < 4) { setMultiSel(new Set()); return; }
        // Select all nodes overlapping the box
        setNodes(prev => {
          const ids = new Set(
            prev.filter(n => n.x < box.x2 && n.x + 200 > box.x1 && n.y < box.y2 && n.y + 200 > box.y1).map(n => n.id)
          );
          setMultiSel(ids);
          return prev;
        });
      }
      window.addEventListener("mousemove", onMoveB);
      window.addEventListener("mouseup", onUpB);
    }
  }


  function onWheel(e: React.WheelEvent) {
    e.preventDefault();
    setZoom(z => Math.min(3, Math.max(0.2, z - e.deltaY * 0.001)));
  }

  const tools: { type: NodeType; Icon: React.ElementType; label: string }[] = [
    { type: "sticky",  Icon: StickyNote,  label: he.moodboard.stickyNote },
    { type: "image",   Icon: ImageIcon,   label: he.moodboard.image     },
    { type: "link",    Icon: LinkIcon,    label: he.moodboard.link      },
    { type: "text",    Icon: Type,        label: he.moodboard.text      },
    { type: "table",   Icon: Table2,      label: he.moodboard.table     },
    { type: "shape",   Icon: Square,      label: he.moodboard.shape     },
  ];

  return (
    <>
    <UpgradeDialog
      open={upgradeOpen}
      onClose={() => setUpgradeOpen(false)}
      feature={he.moodboard.upgradeFeature}
      limit={planLimit}
    />
    <div className="w-full h-full flex flex-col bg-[#f4f4f5]" dir="ltr">

      {/* Top bar */}
      <div className="flex items-center gap-3 px-4 py-3 bg-card border-b border-border shadow-sm z-10 flex-shrink-0" dir="rtl">
        <Link href="/moodboard" className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors shrink-0">
          <ArrowRight className="h-4 w-4" />{he.moodboard.back}
        </Link>
        <div className="h-4 w-px bg-gray-200" />
        {editingTitle
          ? <input autoFocus value={title} onChange={e => setTitle(e.target.value)}
              onBlur={() => setET(false)} onKeyDown={e => { if (e.key === "Enter" || e.key === "Escape") setET(false); }}
              className="flex-1 text-base font-semibold text-foreground bg-transparent border-b border-border outline-none focus:border-foreground min-w-0" />
          : <button onClick={() => setET(true)} className="flex-1 text-right text-base font-semibold text-foreground hover:text-muted-foreground truncate min-w-0">{title}</button>
        }
        <div className="flex items-center gap-1.5 text-xs shrink-0">
          {saveState === "saving"  && <><Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground" /><span className="text-muted-foreground">{he.moodboard.saving}</span></>}
          {saveState === "saved"   && <><Check   className="h-3.5 w-3.5 text-emerald-500" /><span className="text-muted-foreground">{he.moodboard.saved}</span></>}
          {saveState === "unsaved" && <span className="text-orange-500">{he.moodboard.unsaved}</span>}
          <button
            onClick={forceSave}
            disabled={saveState === "saving"}
            className="ms-1 rounded-lg border border-border bg-card px-2.5 py-1 text-xs font-medium text-foreground hover:bg-muted transition-colors disabled:opacity-50"
          >
            {he.moodboard.save}
          </button>
        </div>
      </div>

      {/* Canvas area */}
      <div className="flex-1 flex overflow-hidden relative">

        {/* Left toolbar */}
        <div className="absolute left-3 top-1/2 -translate-y-1/2 z-20 flex flex-col gap-1 bg-card border border-border rounded-2xl shadow-lg p-2">
          {!drawMode && <>
            <p className="text-[8px] font-semibold uppercase tracking-widest text-muted-foreground text-center mb-0.5">{he.moodboard.add}</p>
            {tools.map(({ type, Icon, label }) => (
              <button key={type} onClick={() => addNode(type)}
                className="flex flex-col items-center gap-0.5 w-12 rounded-xl py-1.5 hover:bg-muted transition-colors text-muted-foreground hover:text-foreground">
                <Icon className="h-4 w-4" />
                <span className="text-[9px] font-medium">{label}</span>
              </button>
            ))}
            <div className="h-px bg-muted my-0.5" />
            <button onClick={() => { setDrawMode(true); setSelId(null); setMultiSel(new Set()); }}
              className="flex flex-col items-center gap-0.5 w-12 rounded-xl py-1.5 hover:bg-muted transition-colors text-muted-foreground hover:text-foreground">
              <Pencil className="h-4 w-4" />
              <span className="text-[9px] font-medium">{he.moodboard.draw}</span>
            </button>
            <div className="h-px bg-muted my-0.5" />
          </>}

          {drawMode && <>
            <p className="text-[8px] font-semibold uppercase tracking-widest text-blue-500 text-center mb-0.5">{he.moodboard.draw}</p>
            <button onClick={() => setPenTool("pen")}
              className={`flex flex-col items-center gap-0.5 w-12 rounded-xl py-1.5 transition-colors ${penTool === "pen" ? "bg-blue-50 text-blue-600" : "hover:bg-muted text-muted-foreground"}`}>
              <Pencil className="h-4 w-4" />
              <span className="text-[9px] font-medium">{he.moodboard.pen}</span>
            </button>
            <button onClick={() => setPenTool("eraser")}
              className={`flex flex-col items-center gap-0.5 w-12 rounded-xl py-1.5 transition-colors ${penTool === "eraser" ? "bg-blue-50 text-blue-600" : "hover:bg-muted text-muted-foreground"}`}>
              <Eraser className="h-4 w-4" />
              <span className="text-[9px] font-medium">{he.moodboard.eraser}</span>
            </button>
            <label className="flex flex-col items-center gap-0.5 w-12 cursor-pointer">
              <input type="color" value={penColor} onChange={e => setPenColor(e.target.value)}
                className="w-7 h-7 rounded cursor-pointer border border-border" />
              <span className="text-[9px] text-muted-foreground">{he.moodboard.color}</span>
            </label>
            {[2, 4, 8, 14].map(w => (
              <button key={w} onClick={() => setPenWidth(w)}
                className={`flex items-center justify-center w-12 h-7 rounded-xl transition-colors ${penWidth === w ? "bg-blue-50" : "hover:bg-muted"}`}>
                <div className="rounded-full bg-gray-700" style={{ width: Math.min(w, 12), height: Math.min(w, 12) }} />
              </button>
            ))}
            <button onClick={() => {
              const ctx = drawCanvasRef.current?.getContext("2d");
              if (ctx && drawCanvasRef.current) { ctx.clearRect(0, 0, drawCanvasRef.current.width, drawCanvasRef.current.height); }
            }} className="flex items-center justify-center w-12 h-7 rounded-xl hover:bg-muted text-muted-foreground" title={he.moodboard.clear}>
              <RotateCcw className="h-3.5 w-3.5" />
            </button>
            <div className="h-px bg-muted my-0.5" />
            <button onClick={exitDrawMode}
              className="flex flex-col items-center gap-0.5 w-12 rounded-xl py-1.5 hover:bg-muted text-muted-foreground">
              <MousePointer2 className="h-4 w-4" />
              <span className="text-[9px] font-medium">{he.moodboard.finish}</span>
            </button>
          </>}

          <div className="h-px bg-muted my-0.5" />
          <button onClick={() => setZoom(z => Math.min(3, z + 0.15))} className="flex items-center justify-center w-12 h-7 rounded-xl hover:bg-muted transition-colors text-muted-foreground"><ZoomIn className="h-3.5 w-3.5" /></button>
          <button onClick={() => setZoom(z => Math.max(0.2, z - 0.15))} className="flex items-center justify-center w-12 h-7 rounded-xl hover:bg-muted transition-colors text-muted-foreground"><ZoomOut className="h-3.5 w-3.5" /></button>
          <button onClick={() => { setZoom(1); setPan({ x: 0, y: 0 }); }} className="flex items-center justify-center w-12 h-7 rounded-xl hover:bg-muted transition-colors text-muted-foreground"><Maximize className="h-3.5 w-3.5" /></button>
        </div>

        {/* Delete button */}
        {(selectedId || multiSel.size > 0) && (
          <button onClick={() => {
            setHistory(h => [...h, nodes]);
            if (multiSel.size > 0) { setNodes(prev => prev.filter(n => !multiSel.has(n.id))); setMultiSel(new Set()); }
            else { setNodes(prev => prev.filter(n => n.id !== selectedId)); setSelId(null); }
          }}
            className="absolute top-3 right-3 z-20 flex items-center gap-1.5 rounded-xl bg-red-50 border border-red-200 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-100 transition-colors shadow-sm">
            <Trash2 className="h-3.5 w-3.5" />{multiSel.size > 1 ? `${he.moodboard.deleteNode} (${multiSel.size})` : he.moodboard.deleteNode} <span className="opacity-50 text-[10px]">Del</span>
          </button>
        )}

        {/* Zoom indicator */}
        <div className="absolute bottom-3 left-3 z-20 text-xs text-muted-foreground bg-card/80 rounded-lg px-2 py-1 border border-border select-none">
          {Math.round(zoom * 100)}%
        </div>

        {/* Dot grid */}
        <div ref={canvasRef} className="flex-1 overflow-hidden relative"
          style={{
            backgroundImage: "radial-gradient(circle, #d1d5db 1px, transparent 1px)",
            backgroundSize: `${24 * zoom}px ${24 * zoom}px`,
            backgroundPosition: `${pan.x % (24 * zoom)}px ${pan.y % (24 * zoom)}px`,
            cursor: drawMode ? (penTool === "eraser" ? "cell" : "crosshair") : "default",
          }}
          onMouseDown={onCanvasMouseDown} onWheel={onWheel}>

          {/* Nodes layer — pointer-events: none on wrapper so background gets clicks */}
          <div style={{ position: "absolute", top: 0, left: 0, transformOrigin: "0 0", transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`, width: "100%", height: "100%", pointerEvents: "none" }}>

            {/* Global draw canvas — transparent, 8000×8000, centered */}
            <canvas ref={drawCanvasRef}
              width={3000} height={3000}
              style={{
                position: "absolute", left: -1500, top: -1500,
                width: 3000, height: 3000,
                background: "transparent", border: "none", outline: "none", display: "block",
                pointerEvents: drawMode ? "all" : "none",
                zIndex: drawMode ? 50 : 1,
              }}
              onPointerDown={startGlobalDraw}
              onPointerMove={continueGlobalDraw}
              onPointerUp={endGlobalDraw}
              onPointerLeave={endGlobalDraw}
            />

            {/* Regular nodes — skip draw-layer node (rendered separately above) */}
            {nodes.filter(n => n.data._drawLayer !== "true").map(node => (
              <div key={node.id} style={{ position: "absolute", left: node.x, top: node.y, pointerEvents: drawMode ? "none" : "auto" }}>
                <DraggableNode node={node} zoom={zoom}
                  selected={selectedId === node.id || multiSel.has(node.id)}
                  onSelect={(addToSelection) => {
                    if (addToSelection) {
                      // Ctrl/Cmd: toggle this node in multi-selection
                      setMultiSel(prev => {
                        const next = new Set(prev);
                        if (next.has(node.id)) next.delete(node.id);
                        else next.add(node.id);
                        return next;
                      });
                      setSelId(null);
                    } else {
                      // Regular click: select only this node and bring to front
                      setSelId(node.id);
                      setMultiSel(new Set());
                      setNodes(prev => {
                        const idx = prev.findIndex(n => n.id === node.id);
                        if (idx === -1 || idx === prev.length - 1) return prev;
                        const next = [...prev];
                        next.push(next.splice(idx, 1)[0]);
                        return next;
                      });
                    }
                  }}
                  onMove={(x, y) => setNodes(prev => prev.map(n => n.id === node.id ? { ...n, x, y } : n))}
                  onChange={data => setNodes(prev => prev.map(n => n.id === node.id ? { ...n, data } : n))}
                  onDelete={() => { setHistory(h => [...h, nodes]); setNodes(prev => prev.filter(n => n.id !== node.id)); setSelId(null); }}
                />
              </div>
            ))}

            {/* Selection box */}
            {selBox && (
              <div style={{
                position: "absolute",
                left: selBox.x1, top: selBox.y1,
                width: selBox.x2 - selBox.x1, height: selBox.y2 - selBox.y1,
                border: "1.5px dashed #3b82f6",
                background: "rgba(59,130,246,0.06)",
                borderRadius: 4,
                pointerEvents: "none",
              }} />
            )}
          </div>
        </div>
      </div>
    </div>
    </>
  );
}
