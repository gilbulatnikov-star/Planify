"use client";

import { Handle, Position, type NodeProps } from "@xyflow/react";
import { useState } from "react";

const STICKY_COLORS = [
  "#fef08a", // yellow
  "#bbf7d0", // green
  "#bfdbfe", // blue
  "#fecaca", // red/pink
  "#e9d5ff", // purple
  "#fed7aa", // orange
  "#ffffff", // white
];

export function StickyNoteNode({ data, selected }: NodeProps) {
  const d = data as { text: string; color: string };
  const [text, setText] = useState(d.text ?? "");
  const [color, setColor] = useState(d.color ?? "#fef08a");
  const [showColors, setShowColors] = useState(false);

  // Update node data in place
  d.text = text;
  d.color = color;

  return (
    <div
      className={`relative w-52 min-h-36 rounded-2xl shadow-md p-4 flex flex-col gap-2 ${
        selected ? "ring-2 ring-blue-500" : ""
      }`}
      style={{ background: color }}
    >
      <Handle type="target" position={Position.Left} className="!bg-gray-400" />
      <Handle type="source" position={Position.Right} className="!bg-gray-400" />

      {/* Color picker toggle */}
      <div className="flex gap-1.5 flex-wrap">
        {showColors ? (
          STICKY_COLORS.map((c) => (
            <button
              key={c}
              onClick={() => {
                setColor(c);
                setShowColors(false);
              }}
              className="w-5 h-5 rounded-full border-2 border-white shadow transition-transform hover:scale-110"
              style={{ background: c }}
            />
          ))
        ) : (
          <button
            onClick={() => setShowColors(true)}
            className="w-4 h-4 rounded-full border border-gray-300 shadow-sm"
            style={{ background: color }}
          />
        )}
      </div>

      {/* Text */}
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="כתוב כאן..."
        dir="rtl"
        className="flex-1 bg-transparent resize-none outline-none text-sm text-gray-800 placeholder-gray-400 min-h-20 nodrag"
        onMouseDown={(e) => e.stopPropagation()}
      />
    </div>
  );
}
