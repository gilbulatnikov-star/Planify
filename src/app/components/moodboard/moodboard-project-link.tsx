"use client";

import { ProjectLinker } from "@/app/components/shared/project-linker";
import { updateMoodboard } from "@/lib/actions/moodboard-actions";

interface MoodboardProjectLinkProps {
  boardId: string;
  currentProjectId: string | null;
  currentProjectTitle: string | null;
  projects: { id: string; title: string }[];
}

export function MoodboardProjectLink({
  boardId,
  currentProjectId,
  currentProjectTitle,
  projects,
}: MoodboardProjectLinkProps) {
  return (
    <ProjectLinker
      currentProjectId={currentProjectId}
      currentProjectTitle={currentProjectTitle}
      projects={projects}
      onLink={async (projectId) => {
        await updateMoodboard(boardId, { projectId: projectId ?? null });
      }}
    />
  );
}
