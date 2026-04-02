"use client";

import { Handle, Position, type NodeProps } from "@xyflow/react";
import { useState } from "react";
import { ImageIcon, MessageSquare, MessageSquareOff } from "lucide-react";
import { useT } from "@/lib/i18n";

export function ImageNode({ data, selected }: NodeProps) {
  const he = useT();
  const d = data as { url: string; alt: string; showCaption?: boolean };
  const [url, setUrl] = useState(d.url ?? "");
  const [alt, setAlt] = useState(d.alt ?? "");
  const [editing, setEditing] = useState(!d.url);
  const [showCaption, setShowCaption] = useState(d.showCaption !== false);

  d.url = url;
  d.alt = alt;
  d.showCaption = showCaption;

  return (
    <div
      className={`group relative w-64 rounded-2xl shadow-md bg-card overflow-hidden ${
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
            alt={alt || he.moodboard.imageAlt}
            className="w-full object-cover max-h-64"
            onError={() => setEditing(true)}
            onDoubleClick={() => setEditing(true)}
          />

          {showCaption && alt && (
            <p className="text-xs text-muted-foreground px-3 py-2 text-center">{alt}</p>
          )}

          {/* Toggle caption button — appears on hover or when selected */}
          <button
            className={`nodrag absolute top-2 left-2 flex h-6 w-6 items-center justify-center rounded-full bg-black/40 text-white/80 hover:bg-black/60 transition-all backdrop-blur-sm ${
              selected ? "opacity-100" : "opacity-0 group-hover:opacity-100"
            }`}
            title={showCaption ? "הסתר תיאור" : "הצג תיאור"}
            onClick={(e) => {
              e.stopPropagation();
              setShowCaption((v) => !v);
            }}
          >
            {showCaption ? (
              <MessageSquareOff className="h-3 w-3" />
            ) : (
              <MessageSquare className="h-3 w-3" />
            )}
          </button>
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
            placeholder={he.moodboard.pasteImageLink}
            dir="rtl"
            className="nodrag w-full rounded-lg border border-border px-3 py-2 text-xs outline-none focus:border-blue-400"
          />

          {/* Caption toggle */}
          <button
            type="button"
            className={`nodrag flex items-center gap-1.5 self-start rounded-lg px-2 py-1 text-xs transition-colors ${
              showCaption ? "bg-muted text-foreground" : "text-muted-foreground hover:text-foreground"
            }`}
            onClick={() => setShowCaption((v) => !v)}
          >
            <MessageSquare className="h-3 w-3" />
            {showCaption ? "הסתר תיאור" : "הוסף תיאור"}
          </button>

          {showCaption && (
            <input
              type="text"
              value={alt}
              onChange={(e) => setAlt(e.target.value)}
              placeholder={he.moodboard.descriptionOptional}
              dir="rtl"
              className="nodrag w-full rounded-lg border border-border px-3 py-2 text-xs outline-none focus:border-blue-400"
            />
          )}

          {url && (
            <button
              onClick={() => setEditing(false)}
              className="rounded-lg bg-foreground py-1.5 text-xs font-medium text-background hover:bg-foreground/90 transition-colors nodrag"
            >
              {he.moodboard.showImage}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
