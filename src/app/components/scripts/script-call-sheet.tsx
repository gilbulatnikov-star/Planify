"use client";

import { useRef, useState } from "react";
import { format } from "date-fns";
import { he as heLocale } from "date-fns/locale";
import { Download, Sun, Moon, FileText } from "lucide-react";

type ShotItem = {
  id: string; shotNum: number; customShotNum: string;
  startTime: string; endTime: string; frameUrl: string;
  shotSize: string; duration: string; content: string;
  dialogues: string; note: string; sound: string; shotType: string;
  lens: string; movement: string; equipment: string; frameRate: string;
  lighting: string; castId: string; prop: string; clothing: string; makeup: string;
};

function getTheme(dark: boolean) {
  return dark
    ? { bg: "#0f172a", headerBg: "#1e293b", text: "#f1f5f9", subText: "#94a3b8", border: "#334155", rowAlt: "#1a2a3d", accent: "#818cf8" }
    : { bg: "#ffffff", headerBg: "#f8fafc", text: "#111827", subText: "#6b7280", border: "#e5e7eb", rowAlt: "#f9fafb", accent: "#6366f1" };
}

function SectionHeader({ title, t }: { title: string; t: ReturnType<typeof getTheme> }) {
  return (
    <div style={{ background: t.headerBg, borderBottom: `1px solid ${t.border}`, padding: "8px 14px", borderRadius: "8px 8px 0 0" }}>
      <span style={{ color: t.accent, fontSize: "11px", fontWeight: 700, textTransform: "uppercase" as const, letterSpacing: "0.06em" }}>{title}</span>
    </div>
  );
}

export function ScriptCallSheet({
  title, platform, projectTitle, clientName, shotList,
}: {
  title: string; platform: string; projectTitle: string;
  clientName: string; shotList: ShotItem[];
}) {
  const callSheetRef = useRef<HTMLDivElement>(null);
  const [darkMode, setDarkMode] = useState(false);
  const [exporting, setExporting] = useState(false);
  const t = getTheme(darkMode);
  const today = format(new Date(), "d MMMM yyyy", { locale: heLocale });

  async function exportPDF() {
    if (!callSheetRef.current) return;
    setExporting(true);
    try {
      const { default: html2canvas } = await import("html2canvas");
      const { default: jsPDF } = await import("jspdf");
      const srcEl = callSheetRef.current;
      const w = srcEl.scrollWidth;
      const bg = darkMode ? "#0f172a" : "#ffffff";
      const cleanHtml = srcEl.outerHTML.replace(/\s+class="[^"]*"/g, "");
      const container = document.createElement("div");
      container.style.cssText = `position:fixed;top:0;left:-9999px;width:${w}px;z-index:-1;background-color:${bg};`;
      container.innerHTML = cleanHtml;
      document.body.appendChild(container);
      // html2canvas v1.4.1 parses ALL page stylesheets and crashes on Tailwind v4's
      // oklch() colors. Temporarily disable every stylesheet while capturing —
      // the clone uses only inline styles so it renders correctly without them.
      const sheets = [...document.styleSheets];
      sheets.forEach((s) => { try { s.disabled = true; } catch { /* cross-origin */ } });
      let canvas;
      try {
        canvas = await html2canvas(container.firstElementChild as HTMLElement, {
          scale: 2, useCORS: true, allowTaint: true,
          backgroundColor: bg,
          logging: false, width: w,
        });
      } finally {
        document.body.removeChild(container);
        sheets.forEach((s) => { try { s.disabled = false; } catch { /* cross-origin */ } });
      }
      const h = (canvas.height / canvas.width) * w;
      const pdf = new jsPDF({ orientation: "landscape", unit: "px", format: [w, h], hotfixes: ["px_scaling"] });
      pdf.addImage(canvas.toDataURL("image/jpeg", 0.95), "JPEG", 0, 0, w, h);
      pdf.save(`קול-שיט-${title || "export"}.pdf`);
    } catch (err) {
      console.error("Call sheet PDF export failed:", err);
    } finally {
      setExporting(false);
    }
  }

  const tdStyle = (accent = false): React.CSSProperties => ({
    padding: "7px 10px",
    borderBottom: `1px solid ${t.border}`,
    color: accent ? t.accent : t.text,
    fontWeight: accent ? 700 : 400,
    fontSize: "11px",
    whiteSpace: "nowrap" as const,
  });

  // Collect unique cast members
  const castMembers = [...new Set(shotList.map((s) => s.castId).filter(Boolean))];
  // Collect unique locations (using equipment as secondary if needed)
  const lensUsed = [...new Set(shotList.map((s) => s.lens).filter(Boolean))];

  return (
    <div className="flex-1 overflow-auto bg-muted flex flex-col">
      {/* Controls */}
      <div className="flex items-center justify-between px-6 py-3 bg-card border-b border-border shrink-0">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <FileText className="h-4 w-4 text-muted-foreground" />
          <span className="font-medium">קול שיט — {title}</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex rounded-lg border border-border overflow-hidden">
            <button onClick={() => setDarkMode(false)}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium transition-colors ${!darkMode ? "bg-muted text-foreground" : "text-muted-foreground hover:bg-muted"}`}>
              <Sun className="h-3 w-3" />בהיר
            </button>
            <button onClick={() => setDarkMode(true)}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium transition-colors ${darkMode ? "bg-foreground text-white" : "text-muted-foreground hover:bg-muted"}`}>
              <Moon className="h-3 w-3" />כהה
            </button>
          </div>
          <button onClick={exportPDF} disabled={exporting}
            className="flex items-center gap-1.5 rounded-lg bg-foreground text-white px-4 py-2 text-sm font-medium hover:bg-foreground/90 transition-colors disabled:opacity-40">
            <Download className="h-4 w-4" />
            {exporting ? "מייצא..." : "ייצוא PDF"}
          </button>
        </div>
      </div>

      {/* Preview */}
      <div className="flex-1 overflow-auto p-8 flex justify-center">
        <div ref={callSheetRef}
          style={{
            fontFamily: "system-ui,-apple-system,'Segoe UI',Arial,sans-serif",
            background: t.bg, color: t.text,
            width: "1100px", minHeight: "700px",
            direction: "rtl", padding: "40px 48px",
          }}
        >
          {/* Header */}
          <div style={{ borderBottom: `3px solid ${t.accent}`, paddingBottom: "20px", marginBottom: "28px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div>
                <div style={{ fontSize: "30px", fontWeight: 800, color: t.accent, letterSpacing: "-0.5px", lineHeight: 1 }}>CALL SHEET</div>
                <div style={{ fontSize: "17px", fontWeight: 700, color: t.text, marginTop: "6px" }}>{title}</div>
                {projectTitle && <div style={{ fontSize: "13px", color: t.subText, marginTop: "3px" }}>פרויקט: {projectTitle}</div>}
                {clientName && <div style={{ fontSize: "13px", color: t.subText }}>לקוח: {clientName}</div>}
                {platform && <div style={{ fontSize: "12px", color: t.subText, marginTop: "2px" }}>פלטפורמה: {platform}</div>}
              </div>
              <div style={{ textAlign: "left" }}>
                <div style={{ fontSize: "11px", color: t.subText, textTransform: "uppercase", letterSpacing: "0.06em" }}>תאריך</div>
                <div style={{ fontSize: "18px", fontWeight: 700, color: t.text, marginTop: "2px" }}>{today}</div>
                <div style={{ marginTop: "10px", background: t.accent + "20", color: t.accent, borderRadius: "6px", padding: "4px 10px", fontSize: "11px", fontWeight: 700, textAlign: "center" }}>
                  {shotList.length} שוטים
                </div>
              </div>
            </div>
          </div>

          {/* Quick Info Row */}
          {(castMembers.length > 0 || lensUsed.length > 0) && (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px", marginBottom: "20px" }}>
              {castMembers.length > 0 && (
                <div style={{ border: `1px solid ${t.border}`, borderRadius: "8px", overflow: "hidden" }}>
                  <SectionHeader title="הרכב שחקנים" t={t} />
                  <div style={{ padding: "10px 14px" }}>
                    {castMembers.map((c, i) => (
                      <div key={i} style={{ padding: "4px 0", borderBottom: i < castMembers.length - 1 ? `1px solid ${t.border}` : "none", color: t.text, fontSize: "12px", display: "flex", alignItems: "center", gap: "6px" }}>
                        <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: t.accent, flexShrink: 0, display: "inline-block" }} />
                        {c}
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {lensUsed.length > 0 && (
                <div style={{ border: `1px solid ${t.border}`, borderRadius: "8px", overflow: "hidden" }}>
                  <SectionHeader title="עדשות" t={t} />
                  <div style={{ padding: "10px 14px" }}>
                    {lensUsed.map((l, i) => (
                      <div key={i} style={{ padding: "4px 0", borderBottom: i < lensUsed.length - 1 ? `1px solid ${t.border}` : "none", color: t.text, fontSize: "12px" }}>{l}</div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Shooting Schedule */}
          <div style={{ marginBottom: "24px" }}>
            <SectionHeader title="לו״ז צילומים" t={t} />
            <div style={{ borderLeft: `1px solid ${t.border}`, borderRight: `1px solid ${t.border}`, borderBottom: `1px solid ${t.border}`, borderRadius: "0 0 8px 8px", overflow: "hidden" }}>
              {shotList.length === 0 ? (
                <div style={{ padding: "20px 14px", color: t.subText, fontSize: "13px" }}>לא נוספו שוטים לשוט ליסט</div>
              ) : (
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "11px" }}>
                  <thead>
                    <tr style={{ background: t.headerBg }}>
                      {["#", "שם סצנה", "SHOT SIZE", "תנועה", "עדשה", "FPS", "אודיו", "שחקן", "אקשן / תיאור"].map((h) => (
                        <th key={h} style={{ padding: "8px 10px", textAlign: "right", color: t.subText, fontWeight: 600, borderBottom: `1px solid ${t.border}`, whiteSpace: "nowrap" as const }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {shotList.map((shot, i) => (
                      <tr key={shot.id} style={{ background: i % 2 === 0 ? t.bg : t.rowAlt }}>
                        <td style={tdStyle(true)}>{shot.customShotNum || shot.shotNum}</td>
                        <td style={tdStyle()}>{shot.shotType || "—"}</td>
                        <td style={tdStyle()}>{shot.shotSize || "—"}</td>
                        <td style={tdStyle()}>{shot.movement || "—"}</td>
                        <td style={tdStyle()}>{shot.lens || "—"}</td>
                        <td style={tdStyle()}>{shot.frameRate || "—"}</td>
                        <td style={tdStyle()}>{shot.sound || "—"}</td>
                        <td style={tdStyle()}>{shot.castId || "—"}</td>
                        <td style={{ ...tdStyle(), maxWidth: "240px", whiteSpace: "normal" }}>{shot.content || ""}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>

          {/* Footer */}
          <div style={{ borderTop: `1px solid ${t.border}`, paddingTop: "12px", display: "flex", justifyContent: "space-between", fontSize: "10px", color: t.subText }}>
            <span>הופק ע"י Planify</span>
            <span>{today}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
