"use client";

import { createPortal } from "react-dom";
import { useEffect, useState } from "react";

export function LoadingScreen() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const content = (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-background">
      <img
        src="/qlipy-new-logo.png"
        alt="Qlipy"
        width={120}
        height={30}
        style={{ animation: "qlipy-pulse 1.2s ease-in-out infinite" }}
      />
      <style>{`
        @keyframes qlipy-pulse {
          0%, 100% { transform: scale(1); opacity: 1; }
          50%      { transform: scale(1.08); opacity: 0.85; }
        }
      `}</style>
    </div>
  );

  if (!mounted) return content;
  return createPortal(content, document.body);
}
