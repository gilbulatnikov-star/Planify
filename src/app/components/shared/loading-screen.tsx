"use client";

import { createPortal } from "react-dom";
import { useEffect, useState } from "react";

export function LoadingScreen() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const content = (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-background">
      <svg
        viewBox="0 0 32 32"
        width="48"
        height="48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ animation: "planify-pulse 1.2s ease-in-out infinite" }}
      >
        <rect width="32" height="32" rx="8" fill="#38b6ff"/>
        <path d="M11 8h6a5 5 0 0 1 0 10h-6V8Zm3 3v4h3a2 2 0 1 0 0-4h-3Z" fill="white"/>
        <rect x="11" y="20" width="3" height="4" rx="0.5" fill="white" opacity="0.7"/>
      </svg>
      <style>{`
        @keyframes planify-pulse {
          0%, 100% { transform: scale(1); opacity: 1; }
          50%      { transform: scale(1.08); opacity: 0.85; }
        }
      `}</style>
    </div>
  );

  if (!mounted) return content;
  return createPortal(content, document.body);
}
