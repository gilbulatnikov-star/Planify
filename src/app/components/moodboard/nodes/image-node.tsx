"use client";

import { Handle, Position, type NodeProps } from "@xyflow/react";
import { useState } from "react";
import { ImageIcon } from "lucide-react";

export function ImageNode({ data, selected }: NodeProps) {
  const d = data as { url: string; alt: string };
  const [url, setUrl] = useState(d.url ?? "");
  const [alt, setAlt] = useState(d.alt ?? "");
  const [editing, setEditing] = useState(!d.url);

  d.url = url;
  d.alt = alt;

  return (
    <div
      className={`relative w-64 rounded-2xl shadow-md bg-card overflow-hidden ${
        selected ? "ring-2 ring-blue-500" : ""
      }`}
    >
      <Handle type="target" position={Position.Left} className="!bg-gray-400" />
      <Handle type="source" position={Position.Right} className="!bg-gray-400" />

      {url && !editing ? (
        <>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={url}
            alt={alt || "תמונה"}
            className="w-full object-cover max-h-64"
            onError={() => setEditing(true)}
            onDoubleClick={() => setEditing(true)}
          />
          {alt && <p className="text-xs text-muted-foreground px-3 py-2 text-center">{alt}</p>}
        </>
      ) : (
        <div
          className="p-4 flex flex-col gap-2"
          onMouseDown={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-center h-24 bg-muted rounded-xl border-2 border-dashed border-border">
            <ImageIcon className="h-8 w-8 text-muted-foreground" />
          </div>
          <input
            autoFocus
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="הדבק קישור לתמונה..."
            dir="rtl"
            className="nodrag w-full rounded-lg border border-border px-3 py-2 text-xs outline-none focus:border-blue-400"
          />
          <input
            type="text"
            value={alt}
            onChange={(e) => setAlt(e.target.value)}
            placeholder="תיאור (אופציונלי)"
            dir="rtl"
            className="nodrag w-full rounded-lg border border-border px-3 py-2 text-xs outline-none focus:border-blue-400"
          />
          {url && (
            <button
              onClick={() => setEditing(false)}
              className="rounded-lg bg-foreground py-1.5 text-xs font-medium text-white hover:bg-foreground/90 transition-colors nodrag"
            >
              הצג תמונה
            </button>
          )}
        </div>
      )}
    </div>
  );
}
