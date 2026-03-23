"use client";

import { Handle, Position, type NodeProps } from "@xyflow/react";
import { useState } from "react";
import { LinkIcon, ExternalLink } from "lucide-react";

export function LinkCardNode({ data, selected }: NodeProps) {
  const d = data as { url: string; label: string };
  const [url, setUrl] = useState(d.url ?? "");
  const [label, setLabel] = useState(d.label ?? "");
  const [editing, setEditing] = useState(!d.url);

  d.url = url;
  d.label = label;

  const displayLabel = label || url || "קישור";

  return (
    <div
      className={`relative w-56 rounded-2xl shadow-md bg-card overflow-hidden ${
        selected ? "ring-2 ring-blue-500" : ""
      }`}
    >
      <Handle type="target" position={Position.Left} className="!bg-gray-400" />
      <Handle type="source" position={Position.Right} className="!bg-gray-400" />

      {!editing ? (
        <div className="p-4" onDoubleClick={() => setEditing(true)}>
          <div className="flex items-center gap-2 mb-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50">
              <LinkIcon className="h-4 w-4 text-blue-500" />
            </div>
            <p className="text-sm font-semibold text-foreground truncate flex-1">
              {displayLabel}
            </p>
          </div>
          {url && (
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="nodrag flex items-center gap-1 text-[11px] text-blue-500 hover:text-blue-700 truncate transition-colors"
            >
              <ExternalLink className="h-3 w-3 shrink-0" />
              <span className="truncate">{url}</span>
            </a>
          )}
        </div>
      ) : (
        <div
          className="p-4 flex flex-col gap-2"
          onMouseDown={(e) => e.stopPropagation()}
        >
          <input
            autoFocus
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://..."
            className="nodrag w-full rounded-lg border border-border px-3 py-2 text-xs outline-none focus:border-blue-400"
          />
          <input
            type="text"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            placeholder="כותרת (אופציונלי)"
            dir="rtl"
            className="nodrag w-full rounded-lg border border-border px-3 py-2 text-xs outline-none focus:border-blue-400"
          />
          <button
            onClick={() => setEditing(false)}
            className="rounded-lg bg-foreground py-1.5 text-xs font-medium text-background hover:bg-foreground/90 transition-colors nodrag"
          >
            שמור
          </button>
        </div>
      )}
    </div>
  );
}
