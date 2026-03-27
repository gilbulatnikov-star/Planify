import { notFound } from "next/navigation";
import { getMoodboard } from "@/lib/actions/moodboard-actions";
import { auth } from "@/auth";
import { getLimitsForPlan } from "@/lib/plan-limits";
import { MoodboardCanvas } from "@/app/components/moodboard/moodboard-canvas";

export default async function MoodboardPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [board, session] = await Promise.all([getMoodboard(id), auth()]);
  if (!board) notFound();

  const plan = session?.user?.subscriptionPlan ?? "FREE";
  const limits = getLimitsForPlan(plan);

  return (
    <div className="absolute inset-0 z-10 bg-muted -m-6 md:-m-8" style={{ height: "calc(100vh - 3.5rem)" }}>
      <MoodboardCanvas
        id={board.id}
        title={board.title}
        initialNodes={board.nodesData}
        initialEdges={board.edgesData}
        planLimit={limits.moodboardNodes}
      />
    </div>
  );
}
