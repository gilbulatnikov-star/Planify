"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { CheckSquare, Trash2, Plus, ListTodo, Lock, Crown, Sparkles } from "lucide-react";
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
  const [upgradeOpen, setUpgradeOpen] = useState(false);

  const isFree = todosLimit !== -1;
  const atLimit = isFree && initialTodos.length >= todosLimit;

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
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#38b6ff]/10">
          <ListTodo className="h-5 w-5 text-[#38b6ff]" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground">משימות</h1>
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
          onClick={() => { if (atLimit) setUpgradeOpen(true); }}
          placeholder={atLimit ? `הגעת למגבלת ${todosLimit} משימות — לחץ לשדרוג` : "הוסף משימה חדשה..."}
          disabled={isPending}
          readOnly={atLimit}
          className={`flex-1 ${atLimit ? "cursor-pointer text-gray-400 bg-gray-50" : ""}`}
        />
        <Button
          onClick={atLimit ? () => setUpgradeOpen(true) : handleAdd}
          disabled={isPending || (!atLimit && !newTask.trim())}
          size="icon"
          className={atLimit
            ? "bg-[#38b6ff] text-white hover:bg-[#38b6ff]/90"
            : "bg-[#0a0a0a] text-white hover:bg-[#0a0a0a]/80"}
        >
          {atLimit ? <Lock className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
        </Button>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-1 rounded-xl bg-muted p-1 w-fit">
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
            {f === "all" ? "הכל" : f === "active" ? "פעילות" : "הושלמו"}
          </button>
        ))}
      </div>

      {/* Task list */}
      <div className="rounded-2xl border border-border bg-card shadow-sm divide-y divide-border">
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
              className="group flex items-center gap-3 px-4 py-3 hover:bg-[#38b6ff]/5 transition-colors"
            >
              {/* Checkbox */}
              <button
                onClick={() => handleToggle(todo.id)}
                disabled={isPending}
                className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md border-2 transition-all ${
                  todo.completed
                    ? "border-[#38b6ff] bg-[#38b6ff]"
                    : "border-gray-300 hover:border-[#38b6ff]/60"
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

      {/* Pro upgrade banner for free users */}
      {isFree && (
        <div
          className="rounded-2xl border border-[#38b6ff]/20 bg-gradient-to-l from-[#38b6ff]/5 to-white p-5 flex items-start gap-4 cursor-pointer group"
          onClick={() => setUpgradeOpen(true)}
        >
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#38b6ff] shadow-sm">
            <Crown className="h-5 w-5 text-white" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-bold text-foreground group-hover:text-[#38b6ff] transition-colors">
              שדרג לפרו — משימות ללא הגבלה
            </p>
            <p className="text-xs text-gray-500 mt-0.5">
              בתוכנית החינמית: {initialTodos.length} / {todosLimit} משימות
            </p>
            <div className="flex flex-wrap gap-3 mt-3">
              {["פרויקטים ולקוחות ללא הגבלה", "חשבוניות והצעות מחיר", "לוח השראה ותסריטים"].map((f) => (
                <div key={f} className="flex items-center gap-1.5">
                  <Sparkles className="h-3 w-3 text-[#38b6ff]" />
                  <span className="text-xs text-gray-500">{f}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
