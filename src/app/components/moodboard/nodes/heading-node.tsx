"use client";

import { Handle, Position, type NodeProps } from "@xyflow/react";
import { useState } from "react";

export function HeadingNode({ data, selected }: NodeProps) {
  const d = data as { text: string; size: string };
  const [text, setText] = useState(d.text ?? "כותרת");

  d.text = text;

  return (
    <div
      className={`relative px-2 py-1 ${
        selected ? "ring-2 ring-blue-500 rounded-lg" : ""
      }`}
    >
      <Handle type="target" position={Position.Left} className="!bg-gray-400" />
      <Handle type="source" position={Position.Right} className="!bg-gray-400" />

      <input
        value={text}
        onChange={(e) => setText(e.target.value)}
        dir="rtl"
        className="nodrag bg-transparent outline-none text-2xl font-black text-gray-900 placeholder-gray-300 min-w-[120px]"
        onMouseDown={(e) => e.stopPropagation()}
        placeholder="כותרת..."
      />
    </div>
  );
}
