import { notFound } from "next/navigation";
import { getScript } from "@/lib/actions/script-actions";
import { getClients } from "@/lib/actions/client-actions";
import { getProjects } from "@/lib/actions/project-actions";
import { ScriptEditorClient } from "@/app/components/scripts/script-editor-client";

export default async function ScriptEditorPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [script, clients, projects] = await Promise.all([
    getScript(id),
    getClients(),
    getProjects(),
  ]);
  if (!script) notFound();
  return (
    <ScriptEditorClient script={script} clients={clients} projects={projects} />
  );
}
