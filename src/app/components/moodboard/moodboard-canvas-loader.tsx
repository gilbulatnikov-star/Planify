"use client";

import dynamic from "next/dynamic";

const MoodboardCanvas = dynamic(
  () => import("@/app/components/moodboard/moodboard-canvas").then(m => m.MoodboardCanvas),
  { ssr: false, loading: () => <div className="h-full w-full bg-muted animate-pulse" /> },
);

export function MoodboardCanvasLoader(props: {
  id: string;
  title: string;
  initialNodes: string;
  initialEdges: string;
  planLimit: number;
}) {
  return <MoodboardCanvas {...props} />;
}
