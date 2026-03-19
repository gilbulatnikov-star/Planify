"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { CheckSquare, Trash2 } from "lucide-react";
import { UpgradeDialog } from "@/app/components/shared/upgrade-dialog";
import { he } from "@/lib/he";
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

interface TodoWidgetProps {
  initialTodos: TodoItem[];
  todosLimit: number; // -1 = unlimited
}

export function TodoWidget({ initialTodos, todosLimit }: TodoWidgetProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [newTask, setNewTask] = useState("");
  const [upgradeOpen, setUpgradeOpen] = useState(false);

  const atLimit = todosLimit !== -1 && initialTodos.length >= todosLimit;

  // Sort: uncompleted first, then completed
  const sortedTodos = [...initialTodos].sort((a, b) => {
    if (a.completed === b.completed) return 0;
    return a.completed ? 1 : -1;
  });

  function handleAddTodo(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key !== "Enter" || !newTask.trim()) return;
    if (atLimit) { setUpgradeOpen(true); return; }

    const text = newTask.trim();
    setNewTask("");

    startTransition(async () => {
      await createTodo(text);
      router.refresh();
    });
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
    <>
    <UpgradeDialog
      open={upgradeOpen}
      onClose={() => setUpgradeOpen(false)}
      feature="משימות יומיות"
      limit={todosLimit}
    />
    <Card className="glass-card">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {he.widgets.todos}
        </CardTitle>
        <div className="rounded-lg bg-gray-100 p-1.5">
          <CheckSquare className="h-4 w-4 text-gray-900" />
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <Input
          value={newTask}
          onChange={(e) => setNewTask(e.target.value)}
          onKeyDown={handleAddTodo}
          placeholder={atLimit ? `מגבלת ${todosLimit} משימות — לחץ Enter לשדרוג` : he.widgets.todosPlaceholder}
          className="bg-transparent"
          disabled={isPending}
        />

        <div className="space-y-1 max-h-[240px] overflow-y-auto">
          {sortedTodos.map((todo) => (
            <div
              key={todo.id}
              className="group flex items-center gap-2 rounded-md px-2 py-1.5 transition-colors hover:bg-gray-50"
            >
              <button
                onClick={() => handleToggle(todo.id)}
                disabled={isPending}
                className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border transition-colors ${
                  todo.completed
                    ? "border-emerald-500 bg-emerald-100 text-emerald-600"
                    : "border-muted-foreground/30 hover:border-gray-400"
                }`}
              >
                {todo.completed && (
                  <svg
                    width="10"
                    height="10"
                    viewBox="0 0 10 10"
                    fill="none"
                    className="text-emerald-600"
                  >
                    <path
                      d="M2 5L4 7L8 3"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                )}
              </button>

              <span
                className={`flex-1 text-sm transition-all ${
                  todo.completed
                    ? "text-muted-foreground line-through"
                    : "text-foreground"
                }`}
              >
                {todo.text}
              </span>

              <button
                onClick={() => handleDelete(todo.id)}
                disabled={isPending}
                className="opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-opacity text-muted-foreground hover:text-red-600"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
    </>
  );
}
