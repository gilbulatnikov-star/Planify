"use client";

import { useState, useRef, useCallback } from "react";
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addDays,
  isSameMonth,
  isSameDay,
} from "date-fns";
import { he as heLocale } from "date-fns/locale";
import { X, Download, Image as ImageIcon, Grid3X3, List, Paintbrush, Sun, Moon, ZoomIn, ZoomOut } from "lucide-react";

type ContentItem = {
  id: string;
  title: string;
  date: Date;
  contentType: string;
  status: string;
  clientId: string | null;
  client: { id: string; name: string } | null;
  project: { id: string; title: string } | null;
  notes: string | null;
};

const platformLabel: Record<string, string> = {
  client_shoot: "צילום",
  youtube_long: "YouTube",
  short_form: "Reel",
};

const PRESET_COLORS = [
  { hex: "#6366f1", name: "Indigo" },
  { hex: "#ec4899", name: "Pink" },
  { hex: "#14b8a6", name: "Teal" },
  { hex: "#f97316", name: "Orange" },
  { hex: "#8b5cf6", name: "Purple" },
  { hex: "#06b6d4", name: "Cyan" },
  { hex: "#10b981", name: "Emerald" },
  { hex: "#f59e0b", name: "Amber" },
];

function buildCalendarWeeks(currentMonth: Date) {
  const mStart = startOfMonth(currentMonth);
  const mEnd = endOfMonth(currentMonth);
  const cStart = startOfWeek(mStart);
  const cEnd = endOfWeek(mEnd);
  const weeks: Date[][] = [];
  let d = cStart;
  while (d <= cEnd) {
    const week: Date[] = [];
    for (let i = 0; i < 7; i++) { week.push(d); d = addDays(d, 1); }
    weeks.push(week);
  }
  return weeks;
}

const DAY_NAMES = ["ראשון", "שני", "שלישי", "רביעי", "חמישי", "שישי", "שבת"];

// ── Theme tokens ─────────────────────────────────────────────────
function getTheme(dark: boolean, accent: string) {
  return dark
    ? {
        canvasBg:    "#0b1120",
        headerBg:    "transparent",
        text:        "#f1f5f9",
        subText:     "rgba(241,245,249,0.55)",
        border:      "#1e3a5f",
        cellBg:      "#0f172a",
        altRowBg:    "#172032",
        dayNum:      "#e2e8f0",
        outMonth:    "rgba(241,245,249,0.15)",
        chipBg:      accent + "30",
        chipColor:   accent === "#f59e0b" ? "#fbbf24" : accent,
        chipBorder:  accent,
        footer:      "rgba(241,245,249,0.25)",
        thHead:      accent,
        thText:      "#ffffff",
      }
    : {
        canvasBg:    "#ffffff",
        headerBg:    "transparent",
        text:        "#111827",
        subText:     "#6b7280",
        border:      "#e5e7eb",
        cellBg:      "#ffffff",
        altRowBg:    "#f9fafb",
        dayNum:      "#374151",
        outMonth:    "rgba(0,0,0,0.12)",
        chipBg:      accent + "15",
        chipColor:   accent,
        chipBorder:  accent,
        footer:      "#d1d5db",
        thHead:      accent,
        thText:      "#ffffff",
      };
}

// ── Grid Preview ────────────────────────────────────────────────
function GridPreview({
  content, currentMonth, themeColor, logoUrl, clientName, darkMode,
}: {
  content: ContentItem[]; currentMonth: Date; themeColor: string;
  logoUrl: string | null; clientName: string; darkMode: boolean;
}) {
  const weeks = buildCalendarWeeks(currentMonth);
  const monthLabel = format(currentMonth, "MMMM yyyy", { locale: heLocale });
  const t = getTheme(darkMode, themeColor);

  return (
    <div style={{ fontFamily: "system-ui,-apple-system,'Segoe UI',Arial,sans-serif", background: t.canvasBg, padding: "22px", direction: "rtl", color: t.text }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "18px", paddingBottom: "16px", minHeight: "90px", borderBottom: `3px solid ${darkMode ? t.border : themeColor}` }}>
        <div>
          <div style={{ fontSize: "24px", fontWeight: 800, color: darkMode ? t.text : themeColor, lineHeight: 1.15 }}>{monthLabel}</div>
          {clientName && <div style={{ fontSize: "13px", color: t.subText, marginTop: "3px" }}>{clientName}</div>}
        </div>
        {logoUrl && (
          <img src={logoUrl} alt="logo" crossOrigin="anonymous"
            style={{ maxHeight: "72px", maxWidth: "200px", width: "auto", objectFit: "contain", padding: "6px" }} />
        )}
      </div>

      {/* Calendar */}
      <table style={{ width: "100%", borderCollapse: "collapse", tableLayout: "fixed" }}>
        <thead>
          <tr>
            {DAY_NAMES.map((n) => (
              <th key={n} style={{ background: t.thHead, color: t.thText, padding: "8px 4px", fontSize: "11px", fontWeight: 600, textAlign: "center", border: `1px solid ${t.thHead}` }}>
                {n}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {weeks.map((week, wi) => (
            <tr key={wi}>
              {week.map((day, di) => {
                const inMonth = isSameMonth(day, currentMonth);
                const dayItems = content.filter((item) => isSameDay(new Date(item.date), day));
                return (
                  <td key={di} style={{ background: t.cellBg, border: `1px solid ${t.border}`, padding: "5px", verticalAlign: "top", height: "80px", opacity: inMonth ? 1 : (darkMode ? 0.15 : 0.2) }}>
                    <div style={{ fontSize: "11px", fontWeight: 700, color: t.dayNum, marginBottom: "4px" }}>{format(day, "d")}</div>
                    {dayItems.map((item) => (
                      <div key={item.id} style={{ background: t.chipBg, color: t.chipColor, fontSize: "9px", padding: "2px 5px", borderRadius: "4px", marginBottom: "2px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", borderRight: `3px solid ${t.chipBorder}` }}>
                        {item.title}
                        <span style={{ marginRight: "4px", opacity: 0.65 }}>· {platformLabel[item.contentType] ?? item.contentType}</span>
                      </div>
                    ))}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
      <div style={{ marginTop: "10px", fontSize: "9px", color: t.footer, textAlign: "left" }}>הופק ע"י Planify</div>
    </div>
  );
}

// ── Timeline Preview ─────────────────────────────────────────────
function TimelinePreview({
  content, currentMonth, themeColor, logoUrl, clientName, darkMode,
}: {
  content: ContentItem[]; currentMonth: Date; themeColor: string;
  logoUrl: string | null; clientName: string; darkMode: boolean;
}) {
  const monthLabel = format(currentMonth, "MMMM yyyy", { locale: heLocale });
  const sorted = [...content]
    .filter((item) => isSameMonth(new Date(item.date), currentMonth))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  const t = getTheme(darkMode, themeColor);

  return (
    <div style={{ fontFamily: "system-ui,-apple-system,'Segoe UI',Arial,sans-serif", background: t.canvasBg, padding: "26px", direction: "rtl", color: t.text }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px", paddingBottom: "16px", minHeight: "90px", borderBottom: `3px solid ${darkMode ? t.border : themeColor}` }}>
        <div>
          <div style={{ fontSize: "26px", fontWeight: 800, color: darkMode ? t.text : themeColor, lineHeight: 1.15 }}>{monthLabel}</div>
          {clientName && <div style={{ fontSize: "13px", color: t.subText, marginTop: "3px" }}>{clientName}</div>}
        </div>
        {logoUrl && (
          <img src={logoUrl} alt="logo" crossOrigin="anonymous"
            style={{ maxHeight: "72px", maxWidth: "200px", width: "auto", objectFit: "contain", padding: "6px" }} />
        )}
      </div>

      {sorted.length === 0 ? (
        <div style={{ color: t.subText, fontSize: "14px", textAlign: "center", padding: "40px 0" }}>אין ימי תוכן בחודש זה</div>
      ) : (
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: t.chipBg }}>
              <th style={{ padding: "9px 12px", fontSize: "11px", fontWeight: 700, color: t.chipColor, textAlign: "right", width: "110px" }}>תאריך</th>
              <th style={{ padding: "9px 12px", fontSize: "11px", fontWeight: 700, color: t.chipColor, textAlign: "right" }}>תוצר</th>
              <th style={{ padding: "9px 12px", fontSize: "11px", fontWeight: 700, color: t.chipColor, textAlign: "right", width: "85px" }}>פלטפורמה</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((item, i) => (
              <tr key={item.id} style={{ background: i % 2 === 0 ? t.cellBg : t.altRowBg }}>
                <td style={{ padding: "9px 12px", fontSize: "12px", color: t.subText, borderBottom: `1px solid ${t.border}` }}>
                  {format(new Date(item.date), "d בMMMM", { locale: heLocale })}
                </td>
                <td style={{ padding: "9px 12px", fontSize: "13px", fontWeight: 600, color: t.text, borderBottom: `1px solid ${t.border}` }}>
                  {item.title}
                </td>
                <td style={{ padding: "9px 12px", fontSize: "11px", borderBottom: `1px solid ${t.border}` }}>
                  <span style={{ background: t.chipBg, color: t.chipColor, padding: "2px 8px", borderRadius: "12px", fontWeight: 600 }}>
                    {platformLabel[item.contentType] ?? item.contentType}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      <div style={{ marginTop: "14px", fontSize: "9px", color: t.footer, textAlign: "left" }}>הופק ע"י Planify</div>
    </div>
  );
}

// ── Main Component ───────────────────────────────────────────────
export function CalendarExportStudio({
  open, onClose, content, currentMonth, clientName,
}: {
  open: boolean; onClose: () => void; content: ContentItem[];
  currentMonth: Date; clientName: string;
}) {
  const exportRef = useRef<HTMLDivElement>(null);
  const colorInputRef = useRef<HTMLInputElement>(null);
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [themeColor, setThemeColor] = useState("#6366f1");
  const [layout, setLayout] = useState<"grid" | "timeline">("grid");
  const [darkMode, setDarkMode] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [zoom, setZoom] = useState(0.7);

  const handleLogoUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setLogoUrl(ev.target?.result as string);
    reader.readAsDataURL(file);
  }, []);

  // ── Capture: SVG foreignObject approach — no html2canvas, no CSS interference ──
  async function captureToCanvas(): Promise<HTMLCanvasElement> {
    const srcEl = exportRef.current;
    if (!srcEl) throw new Error("preview element not found");

    const bg  = darkMode ? "#0b1120" : "#ffffff";
    const SCALE = 2;

    // The GridPreview / TimelinePreview use ONLY inline styles.
    // Strip any residual class="" attrs for safety, then render via SVG foreignObject
    // so no browser stylesheet (including Tailwind's oklch) is ever touched.
    const w = srcEl.scrollWidth;
    const h = srcEl.scrollHeight;
    const cleanHtml = srcEl.outerHTML.replace(/\s+class="[^"]*"/g, "");

    const svgXml = [
      `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}">`,
      `<foreignObject width="${w}" height="${h}">`,
      `<div xmlns="http://www.w3.org/1999/xhtml"`,
      ` style="width:${w}px;height:${h}px;overflow:hidden;background:${bg};">`,
      cleanHtml,
      `</div></foreignObject></svg>`,
    ].join("");

    const dataUrl = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svgXml)}`;

    return new Promise<HTMLCanvasElement>((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width  = w * SCALE;
        canvas.height = h * SCALE;
        const ctx = canvas.getContext("2d")!;
        ctx.fillStyle = bg;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, w * SCALE, h * SCALE);
        resolve(canvas);
      };
      img.onerror = () => reject(new Error("SVG render failed"));
      img.src = dataUrl;
    });
  }

  async function downloadPNG() {
    setExporting(true);
    try {
      const canvas = await captureToCanvas();
      const link = document.createElement("a");
      link.download = `לוח-תוכן-${clientName || "export"}-${format(currentMonth, "yyyy-MM")}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    } catch (err) {
      console.error("PNG export failed:", err);
      alert("ייצוא PNG נכשל — נסה שוב");
    } finally {
      setExporting(false);
    }
  }

  async function downloadPDF() {
    setExporting(true);
    try {
      const canvas = await captureToCanvas();
      const { default: jsPDF } = await import("jspdf");

      // Fit the canvas inside A4 landscape (297×210 mm)
      const PAGE_W = 297;
      const PAGE_H = 210;
      const aspect = canvas.width / canvas.height;
      let imgW = PAGE_W;
      let imgH = PAGE_W / aspect;
      if (imgH > PAGE_H) { imgH = PAGE_H; imgW = PAGE_H * aspect; }
      const x = (PAGE_W - imgW) / 2;
      const y = (PAGE_H - imgH) / 2;

      const pdf = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
      pdf.addImage(canvas.toDataURL("image/jpeg", 0.95), "JPEG", x, y, imgW, imgH);
      pdf.save(`לוח-תוכן-${clientName || "export"}-${format(currentMonth, "yyyy-MM")}.pdf`);
    } catch (err) {
      console.error("PDF export failed:", err);
      alert("ייצוא PDF נכשל — נסה שוב");
    } finally {
      setExporting(false);
    }
  }

  if (!open) return null;

  const previewProps = { content, currentMonth, themeColor, logoUrl, clientName, darkMode };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm sm:p-4">
      <div className="bg-card rounded-t-2xl sm:rounded-2xl shadow-2xl flex flex-col w-full sm:max-w-5xl h-[95vh] sm:max-h-[92vh] overflow-hidden">

        {/* Modal Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 border-b border-border shrink-0">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-foreground">ייצוא ללקוח</h2>
            <p className="text-xs sm:text-sm text-muted-foreground">
              {clientName || "כל הלקוחות"} — {format(currentMonth, "MMMM yyyy", { locale: heLocale })}
            </p>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg text-muted-foreground hover:text-muted-foreground hover:bg-muted transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Mobile controls strip */}
        <div className="sm:hidden flex items-center gap-2 px-4 py-2.5 border-b border-border bg-muted shrink-0 overflow-x-auto">
          {/* Layout */}
          <div className="flex rounded-lg border border-border overflow-hidden bg-card shrink-0">
            <button onClick={() => setLayout("grid")} className={`flex items-center gap-1 px-3 py-1.5 text-xs font-medium transition-colors ${layout === "grid" ? "bg-foreground text-white" : "text-muted-foreground"}`}>
              <Grid3X3 className="h-3 w-3" /> לוח
            </button>
            <button onClick={() => setLayout("timeline")} className={`flex items-center gap-1 px-3 py-1.5 text-xs font-medium transition-colors ${layout === "timeline" ? "bg-foreground text-white" : "text-muted-foreground"}`}>
              <List className="h-3 w-3" /> רשימה
            </button>
          </div>
          {/* Theme */}
          <div className="flex rounded-lg border border-border overflow-hidden bg-card shrink-0">
            <button onClick={() => setDarkMode(false)} className={`flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium transition-colors ${!darkMode ? "bg-muted text-foreground" : "text-muted-foreground"}`}>
              <Sun className="h-3 w-3" />
            </button>
            <button onClick={() => setDarkMode(true)} className={`flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium transition-colors ${darkMode ? "bg-foreground text-white" : "text-muted-foreground"}`}>
              <Moon className="h-3 w-3" />
            </button>
          </div>
          {/* Colors */}
          <div className="flex gap-1.5 shrink-0">
            {PRESET_COLORS.map((c) => (
              <button key={c.hex} onClick={() => setThemeColor(c.hex)}
                style={{ background: c.hex }}
                className={`h-6 w-6 rounded-full transition-all ${themeColor === c.hex ? "ring-2 ring-offset-1 ring-gray-400 scale-110" : ""}`}
              />
            ))}
          </div>
          {/* Zoom */}
          <div className="flex rounded-lg border border-border overflow-hidden bg-card shrink-0 ms-auto">
            <button onClick={() => setZoom(z => Math.max(0.3, +(z - 0.1).toFixed(1)))} className="px-2.5 py-1.5 text-muted-foreground hover:bg-muted">
              <ZoomOut className="h-3.5 w-3.5" />
            </button>
            <span className="px-2 py-1.5 text-xs text-muted-foreground border-x border-border min-w-[36px] text-center">{Math.round(zoom * 100)}%</span>
            <button onClick={() => setZoom(z => Math.min(1.5, +(z + 0.1).toFixed(1)))} className="px-2.5 py-1.5 text-muted-foreground hover:bg-muted">
              <ZoomIn className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        <div className="flex flex-1 overflow-hidden min-h-0">

          {/* Controls Panel — desktop only */}
          <div className="hidden sm:flex w-64 flex-shrink-0 border-l border-border bg-muted p-5 flex-col gap-6 overflow-y-auto">

            {/* Layout */}
            <div>
              <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-widest mb-2">תצוגה</p>
              <div className="flex rounded-xl border border-border overflow-hidden bg-card">
                <button onClick={() => setLayout("grid")} className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-sm font-medium transition-colors ${layout === "grid" ? "bg-foreground text-white" : "text-muted-foreground hover:bg-muted"}`}>
                  <Grid3X3 className="h-3.5 w-3.5" /> לוח
                </button>
                <button onClick={() => setLayout("timeline")} className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-sm font-medium transition-colors ${layout === "timeline" ? "bg-foreground text-white" : "text-muted-foreground hover:bg-muted"}`}>
                  <List className="h-3.5 w-3.5" /> רשימה
                </button>
              </div>
            </div>

            {/* Theme */}
            <div>
              <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-widest mb-2">ערכת נושא</p>
              <div className="flex rounded-xl border border-border overflow-hidden bg-card">
                <button onClick={() => setDarkMode(false)} className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-sm font-medium transition-colors ${!darkMode ? "bg-muted text-foreground" : "text-muted-foreground hover:bg-muted"}`}>
                  <Sun className="h-3.5 w-3.5" /> בהיר
                </button>
                <button onClick={() => setDarkMode(true)} className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-sm font-medium transition-colors ${darkMode ? "bg-foreground text-white" : "text-muted-foreground hover:bg-muted"}`}>
                  <Moon className="h-3.5 w-3.5" /> כהה
                </button>
              </div>
              <p className="text-[10px] text-muted-foreground mt-1.5 text-center">מצב כהה מתאים ללוגו לבן</p>
            </div>

            {/* Color */}
            <div>
              <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-widest mb-3">צבע מותג</p>
              <div className="grid grid-cols-4 gap-2 mb-3">
                {PRESET_COLORS.map((c) => (
                  <button key={c.hex} title={c.name} onClick={() => setThemeColor(c.hex)}
                    style={{ background: c.hex }}
                    className={`h-9 w-9 rounded-full transition-all duration-150 ${themeColor === c.hex ? "ring-2 ring-offset-2 ring-gray-400 scale-110" : "hover:scale-110"}`}
                  />
                ))}
              </div>
              <button
                onClick={() => colorInputRef.current?.click()}
                className="w-full flex items-center justify-center gap-2 rounded-xl border border-dashed border-border bg-card py-2.5 text-sm text-muted-foreground hover:border-gray-400 hover:text-foreground transition-colors"
              >
                <Paintbrush className="h-4 w-4" style={{ color: themeColor }} />
                <span>צבע מותאם אישית</span>
              </button>
              <input ref={colorInputRef} type="color" value={themeColor}
                onChange={(e) => setThemeColor(e.target.value)} className="sr-only" />
            </div>

            {/* Logo */}
            <div>
              <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-widest mb-2">לוגו</p>
              <label className={`flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed p-4 cursor-pointer transition-colors ${darkMode ? "border-slate-600 bg-slate-800 hover:border-slate-400" : "border-border bg-card hover:border-gray-400"}`}>
                {logoUrl ? (
                  <img src={logoUrl} alt="logo" className="h-14 object-contain" />
                ) : (
                  <>
                    <ImageIcon className={`h-6 w-6 ${darkMode ? "text-slate-500" : "text-muted-foreground"}`} />
                    <span className={`text-xs text-center ${darkMode ? "text-slate-400" : "text-muted-foreground"}`}>לחץ להעלאת לוגו</span>
                  </>
                )}
                <input type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} />
              </label>
              {logoUrl && (
                <button onClick={() => setLogoUrl(null)} className="mt-1.5 text-xs text-red-400 hover:text-red-600 w-full text-center">
                  הסר לוגו
                </button>
              )}
            </div>

            {/* Zoom — desktop */}
            <div>
              <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-widest mb-2">זום תצוגה</p>
              <div className="flex items-center gap-2">
                <button onClick={() => setZoom(z => Math.max(0.3, +(z - 0.1).toFixed(1)))} className="p-1.5 rounded-lg border border-border bg-card text-muted-foreground hover:bg-muted">
                  <ZoomOut className="h-4 w-4" />
                </button>
                <span className="flex-1 text-center text-sm font-medium text-foreground">{Math.round(zoom * 100)}%</span>
                <button onClick={() => setZoom(z => Math.min(1.5, +(z + 0.1).toFixed(1)))} className="p-1.5 rounded-lg border border-border bg-card text-muted-foreground hover:bg-muted">
                  <ZoomIn className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Preview */}
          <div className={`flex-1 overflow-auto p-3 sm:p-6 flex items-start justify-center transition-colors ${darkMode ? "bg-slate-900" : "bg-muted"}`}>
            <div className="shadow-2xl rounded-xl overflow-hidden origin-top" style={{ transform: `scale(${zoom})`, transformOrigin: "top center", width: `${100 / zoom}%` }}>
              <div ref={exportRef}>
                {layout === "grid"
                  ? <GridPreview {...previewProps} />
                  : <TimelinePreview {...previewProps} />}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 border-t border-border bg-muted shrink-0">
          <p className="hidden sm:block text-xs text-muted-foreground">הלוגו, הצבעים והתוכן הם לצורך תצוגת לקוח בלבד</p>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button onClick={downloadPNG} disabled={exporting}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 rounded-lg border border-border bg-card px-4 py-2.5 text-sm font-medium text-foreground hover:bg-muted transition-colors disabled:opacity-40">
              <Download className="h-4 w-4 text-indigo-500" />
              {exporting ? "מייצא..." : "PNG"}
            </button>
            <button onClick={downloadPDF} disabled={exporting}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 rounded-lg bg-foreground px-4 py-2.5 text-sm font-medium text-white hover:bg-foreground/90 transition-colors disabled:opacity-40">
              <Download className="h-4 w-4" />
              {exporting ? "מייצא..." : "PDF"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
