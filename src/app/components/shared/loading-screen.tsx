"use client";

export function LoadingScreen() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-white">
      <svg
        viewBox="0 0 200 175"
        width="100"
        height="88"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Q ring — chasing arc spinner */}
        <rect
          x="10"
          y="15"
          width="165"
          height="110"
          rx="55"
          fill="none"
          stroke="#0a0a0a"
          strokeWidth="22"
          strokeLinecap="round"
          strokeDasharray="400 56"
          style={{
            animation: "qlipy-ring 1.4s linear infinite",
            transformOrigin: "92.5px 70px",
          }}
        />
        {/* Blue teardrop — bounces */}
        <ellipse
          cx="158"
          cy="153"
          rx="13"
          ry="16"
          fill="#38b6ff"
          style={{
            animation: "qlipy-drop 1.4s ease-in-out infinite",
          }}
        />
      </svg>
      <style>{`
        @keyframes qlipy-ring {
          to { stroke-dashoffset: -456; }
        }
        @keyframes qlipy-drop {
          0%, 100% { transform: translateY(0px);  }
          50%       { transform: translateY(-10px); }
        }
      `}</style>
    </div>
  );
}
