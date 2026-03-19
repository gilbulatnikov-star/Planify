"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { CheckSquare, Trash2, Plus, ListTodo } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { UpgradeDialog } from "@/app/components/shared/upgrade-dialog";
import {
  createTodo,
  toggleTodo,
  deleteTodo,
} from "@/lib/actions/widget-actions";

interface TodoItem {
  id: string;
  text: string;
  completed: boolean;
}

interface TasksPageClientProps {
  initialTodos: TodoItem[];
  todosLimit: number;
}

export function TasksPageClient({ initialTodos, todosLimit }: TasksPageClientProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [newTask, setNewTask] = useState("");
  const [filter, setFilter] = useState<"all" | "active" | "done">("all");

  const atLimit = todosLimit !== -1 && initialTodos.length >= todosLimit;
  const [upgradeOpen, setUpgradeOpen] = useState(false);

  const sortedTodos = [...initialTodos].sort((a, b) => {
    if (a.completed === b.completed) return 0;
    return a.completed ? 1 : -1;
  });

  const filtered = sortedTodos.filter((t) => {
    if (filter === "active") return !t.completed;
    if (filter === "done") return t.completed;
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
        feature="משימות יומיות"
        limit={todosLimit}
      />
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-900 text-white shadow-sm">
          <ListTodo className="h-5 w-5" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">משימות</h1>
          <p className="text-sm text-gray-500">
            {activeCount} פעילות · {doneCount} הושלמו
          </p>
        </div>
      </div>

      {/* Add task */}
      <div className="flex gap-2">
        <Input
          value={newTask}
          onChange={(e) => setNewTask(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={atLimit ? `הגעת למגבלת ${todosLimit} משימות` : "הוסף משימה חדשה..."}
          disabled={isPending || atLimit}
          className="flex-1"
        />
        <Button
          onClick={handleAdd}
          disabled={isPending || (!atLimit && !newTask.trim())}
          size="icon"
          variant={atLimit ? "outline" : "default"}
          className={atLimit ? "border-amber-300 text-amber-600 hover:bg-amber-50" : ""}
        >
          {atLimit ? "🔒" : <Plus className="h-4 w-4" />}
        </Button>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-1 rounded-xl bg-gray-100 p-1 w-fit">
        {(["all", "active", "done"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`rounded-lg px-4 py-1.5 text-sm font-medium transition-all ${
              filter === f
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            {f === "all" ? "הכל" : f === "active" ? "פעילות" : "הושלמו"}
          </button>
        ))}
      </div>

      {/* Task list */}
      <div className="rounded-2xl border border-gray-200 bg-white shadow-sm divide-y divide-gray-50">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <CheckSquare className="h-10 w-10 text-gray-200 mb-3" />
            <p className="text-sm text-gray-400">
              {filter === "done" ? "עוד לא סיימת משימות" : "אין משימות כאן"}
            </p>
          </div>
        ) : (
          filtered.map((todo) => (
            <div
              key={todo.id}
              className="group flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors"
            >
              {/* Checkbox */}
              <button
                onClick={() => handleToggle(todo.id)}
                disabled={isPending}
                className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md border-2 transition-all ${
                  todo.completed
                    ? "border-emerald-500 bg-emerald-500"
                    : "border-gray-300 hover:border-gray-400"
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

              {/* Text */}
              <span
                className={`flex-1 text-sm transition-all ${
                  todo.completed ? "text-gray-400 line-through" : "text-gray-800"
                }`}
              >
                {todo.text}
              </span>

              {/* Delete */}
              <button
                onClick={() => handleDelete(todo.id)}
                disabled={isPending}
                className="opacity-0 group-hover:opacity-100 transition-opacity text-gray-400 hover:text-red-500 p-1 rounded"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))
        )}
      </div>

      {/* Pro limit indicator */}
      {todosLimit !== -1 && (
        <p className="text-center text-xs text-gray-400">
          {initialTodos.length} / {todosLimit} משימות בתוכנית החינמית
        </p>
      )}
    </div>
  );
}
