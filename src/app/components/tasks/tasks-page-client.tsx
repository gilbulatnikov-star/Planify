"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { CheckSquare, Trash2, Plus, ListTodo, Lock, Crown, Sparkles, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { UpgradeDialog } from "@/app/components/shared/upgrade-dialog";
import {
  createTodo,
  toggleTodo,
  deleteTodo,
  updateTodoProject,
} from "@/lib/actions/widget-actions";
import { ProjectLinker } from "@/app/components/shared/project-linker";
import { useT } from "@/lib/i18n";

interface TodoItem {
  id: string;
  text: string;
  completed: boolean;
  project?: { id: string; title: string } | null;
}

interface TasksPageClientProps {
  initialTodos: TodoItem[];
  todosLimit: number;
  projects: { id: string; title: string }[];
}

export function TasksPageClient({ initialTodos, todosLimit, projects }: TasksPageClientProps) {
  const router = useRouter();
  const he = useT();
  const [isPending, startTransition] = useTransition();
  const [newTask, setNewTask] = useState("");
  const [filter, setFilter] = useState<"all" | "active" | "done">("all");
  const [upgradeOpen, setUpgradeOpen] = useState(false);
  const [search, setSearch] = useState("");

  const isFree = todosLimit !== -1;
  const atLimit = isFree && initialTodos.length >= todosLimit;

  const sortedTodos = [...initialTodos].sort((a, b) => {
    if (a.completed === b.completed) return 0;
    return a.completed ? 1 : -1;
  });

  const filtered = sortedTodos.filter((t) => {
    if (filter === "active" && t.completed) return false;
    if (filter === "done" && !t.completed) return false;
    if (search && !t.text.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const activeCount = initialTodos.filter((t) => !t.completed).length;
  const doneCount = initialTodos.filter((t) => t.completed).length;

  function handleAdd() {
    if (!newTask.trim()) return;
    if (atLimit) { setUpgradeOpen(true); return; }
    const text = newTask.trim();
    setNewTask("");
    startTransition(async () => {
      await createTodo(text);
      router.refresh();
    });
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") handleAdd();
  }

  function handleToggle(id: string) {
    startTransition(async () => {
      await toggleTodo(id);
      router.refresh();
    });
  }

  function handleDelete(id: string) {
    startTransition(async () => {
      await deleteTodo(id);
      router.refresh();
    });
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6" dir="rtl">
      <UpgradeDialog
        open={upgradeOpen}
        onClose={() => setUpgradeOpen(false)}
        feature={he.tasks.dailyTasks}
        limit={todosLimit}
      />

      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-[10px] bg-accent/10">
          <ListTodo className="h-5 w-5 text-accent" />
        </div>
        <div>
          <h1 className="text-[22px] font-extrabold tracking-[-0.03em] text-foreground">{he.tasks.title}</h1>
          <p className="text-sm text-muted-foreground">
            {activeCount} {he.tasks.activeCount} · {doneCount} {he.tasks.doneCount}
          </p>
        </div>
      </div>

      <div className="relative">
        <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-foreground/30" />
        <input
          placeholder="חיפוש משימות..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-[10px] border border-border/40 bg-card px-4 py-2.5 pe-10 text-[13px] text-foreground placeholder:text-foreground/30 outline-none focus:border-accent/40 focus:ring-1 focus:ring-accent/20 transition-all duration-200"
        />
      </div>

      {/* Add task */}
      <div className="flex gap-2">
        <Input
          value={newTask}
          onChange={(e) => setNewTask(e.target.value)}
          onKeyDown={handleKeyDown}
          onClick={() => { if (atLimit) setUpgradeOpen(true); }}
          placeholder={atLimit ? he.tasks.reachedLimit.replace("{limit}", String(todosLimit)) : he.tasks.addNewTask}
          disabled={isPending}
          readOnly={atLimit}
          className={`flex-1 ${atLimit ? "cursor-pointer text-muted-foreground bg-muted" : ""}`}
        />
        <Button
          onClick={atLimit ? () => setUpgradeOpen(true) : handleAdd}
          disabled={isPending || (!atLimit && !newTask.trim())}
          size="icon"
          className={atLimit
            ? "bg-accent text-white hover:bg-accent/90"
            : "bg-foreground text-white hover:bg-foreground/80"}
        >
          {atLimit ? <Lock className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
        </Button>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 rounded-xl bg-muted p-1 w-fit">
        {(["all", "active", "done"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`rounded-lg px-4 py-1.5 text-sm font-medium transition-all ${
              filter === f
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {f === "all" ? he.tasks.allFilter : f === "active" ? he.tasks.activeFilter : he.tasks.doneFilter}
          </button>
        ))}
      </div>

      {/* Task list */}
      <div className="rounded-[14px] border border-border/40 bg-card shadow-[0_1px_2px_rgba(0,0,0,0.04),inset_0_1px_0_rgba(255,255,255,0.75)] divide-y divide-border/30">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <CheckSquare className="h-10 w-10 text-muted-foreground/20 mb-3" />
            <p className="text-sm text-muted-foreground">
              {filter === "done" ? he.tasks.noDoneTasks : he.tasks.noTasksHere}
            </p>
          </div>
        ) : (
          filtered.map((todo) => (
            <div
              key={todo.id}
              className="group flex items-center gap-3 px-4 py-3 hover:bg-accent/5 transition-colors"
            >
              {/* Checkbox */}
              <button
                onClick={() => handleToggle(todo.id)}
                disabled={isPending}
                className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-md border-2 transition-all ${
                  todo.completed
                    ? "border-accent bg-accent"
                    : "border-border/40 hover:border-accent/60"
                }`}
              >
                {todo.completed && (
                  <svg width="10" height="10" viewBox="0 0 10 10" fill="none" className="text-white">
                    <path
                      d="M2 5L4 7L8 3"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                )}
              </button>

              {/* Text + project */}
              <div className="flex-1 min-w-0">
                <span
                  className={`text-sm transition-all ${
                    todo.completed ? "text-muted-foreground line-through" : "text-foreground"
                  }`}
                >
                  {todo.text}
                </span>
                <div className="mt-1">
                  <ProjectLinker
                    currentProjectId={todo.project?.id ?? null}
                    currentProjectTitle={todo.project?.title ?? null}
                    projects={projects}
                    onLink={async (projectId) => {
                      await updateTodoProject(todo.id, projectId);
                    }}
                  />
                </div>
              </div>

              {/* Delete */}
              <button
                onClick={() => handleDelete(todo.id)}
                disabled={isPending}
                className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-red-500 p-1 rounded"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))
        )}
      </div>

      {/* Pro upgrade banner for free users */}
      {isFree && (
        <div
          className="rounded-2xl border border-accent/20 bg-gradient-to-l from-accent/5 to-card p-5 flex items-start gap-4 cursor-pointer group"
          onClick={() => setUpgradeOpen(true)}
        >
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] bg-accent shadow-sm">
            <Crown className="h-5 w-5 text-white" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-bold text-foreground group-hover:text-accent transition-colors">
              {he.tasks.upgradeUnlimited}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              {he.tasks.freeLimit} {initialTodos.length} / {todosLimit}
            </p>
            <div className="flex flex-wrap gap-3 mt-3">
              {[he.tasks.upgradeFeature1, he.tasks.upgradeFeature2, he.tasks.upgradeFeature3].map((f) => (
                <div key={f} className="flex items-center gap-1.5">
                  <Sparkles className="h-3 w-3 text-accent" />
                  <span className="text-xs text-muted-foreground">{f}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
