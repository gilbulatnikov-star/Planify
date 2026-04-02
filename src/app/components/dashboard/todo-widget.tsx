"use client";

import { useState, useTransition, useRef } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { CheckSquare, Trash2, Pencil, Check, X } from "lucide-react";
import { UpgradeDialog } from "@/app/components/shared/upgrade-dialog";
import { useT } from "@/lib/i18n";
import {
  createTodo,
  toggleTodo,
  deleteTodo,
  updateTodoText,
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
  const he = useT();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [newTask, setNewTask] = useState("");
  const [upgradeOpen, setUpgradeOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState("");
  const editInputRef = useRef<HTMLInputElement>(null);

  const atLimit = todosLimit !== -1 && initialTodos.length >= todosLimit;

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
    if (editingId === id) return;
    startTransition(async () => {
      await toggleTodo(id);
      router.refresh();
    });
  }

  function handleDelete(id: string) {
    if (editingId === id) setEditingId(null);
    startTransition(async () => {
      await deleteTodo(id);
      router.refresh();
    });
  }

  function startEdit(todo: TodoItem) {
    setEditingId(todo.id);
    setEditingText(todo.text);
    setTimeout(() => editInputRef.current?.focus(), 0);
  }

  function cancelEdit() {
    setEditingId(null);
    setEditingText("");
  }

  function commitEdit(id: string) {
    const text = editingText.trim();
    if (!text) { cancelEdit(); return; }
    const original = initialTodos.find(t => t.id === id)?.text;
    setEditingId(null);
    if (text === original) return;
    startTransition(async () => {
      await updateTodoText(id, text);
      router.refresh();
    });
  }

  return (
    <>
    <UpgradeDialog
      open={upgradeOpen}
      onClose={() => setUpgradeOpen(false)}
      feature={he.todoExtra.dailyTasks}
      limit={todosLimit}
    />
    <Card className="glass-card">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {he.widgets.todos}
        </CardTitle>
        <div className="rounded-[8px] bg-foreground/[0.04] p-1.5">
          <CheckSquare className="h-4 w-4 text-foreground/30" />
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <Input
          value={newTask}
          onChange={(e) => setNewTask(e.target.value)}
          onKeyDown={handleAddTodo}
          placeholder={atLimit ? he.todoExtra.limitReached.replace("{limit}", String(todosLimit)) : he.widgets.todosPlaceholder}
          className="bg-transparent"
          disabled={isPending}
        />

        <div className="space-y-1 max-h-[240px] overflow-y-auto">
          {sortedTodos.map((todo) => (
            <div
              key={todo.id}
              className="group flex items-center gap-2 rounded-md px-2 py-1.5 transition-colors hover:bg-[#2563eb]/5"
            >
              {/* Checkbox */}
              <button
                onClick={() => handleToggle(todo.id)}
                disabled={isPending || editingId === todo.id}
                className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border transition-colors ${
                  todo.completed
                    ? "border-[#2563eb] bg-[#2563eb]/10 text-[#2563eb]"
                    : "border-muted-foreground/30 hover:border-[#2563eb]/50"
                }`}
              >
                {todo.completed && (
                  <svg width="10" height="10" viewBox="0 0 10 10" fill="none" className="text-[#2563eb]">
                    <path d="M2 5L4 7L8 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </button>

              {/* Text or inline editor */}
              {editingId === todo.id ? (
                <input
                  ref={editInputRef}
                  value={editingText}
                  onChange={(e) => setEditingText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") commitEdit(todo.id);
                    if (e.key === "Escape") cancelEdit();
                  }}
                  onBlur={() => commitEdit(todo.id)}
                  className="flex-1 text-sm bg-background border border-border/60 rounded px-2 py-0.5 outline-none focus:border-[#2563eb]/50"
                  dir="rtl"
                />
              ) : (
                <span
                  className={`flex-1 text-sm transition-all cursor-default ${
                    todo.completed ? "text-muted-foreground line-through" : "text-foreground"
                  }`}
                  onDoubleClick={() => !todo.completed && startEdit(todo)}
                >
                  {todo.text}
                </span>
              )}

              {/* Actions */}
              {editingId === todo.id ? (
                <div className="flex items-center gap-0.5 shrink-0">
                  <button
                    onMouseDown={(e) => { e.preventDefault(); commitEdit(todo.id); }}
                    className="flex h-5 w-5 items-center justify-center rounded text-emerald-600 hover:bg-emerald-50 transition-colors"
                  >
                    <Check className="h-3 w-3" />
                  </button>
                  <button
                    onMouseDown={(e) => { e.preventDefault(); cancelEdit(); }}
                    className="flex h-5 w-5 items-center justify-center rounded text-muted-foreground hover:bg-muted transition-colors"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-0.5 shrink-0 opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-opacity">
                  {!todo.completed && (
                    <button
                      onClick={() => startEdit(todo)}
                      disabled={isPending}
                      className="flex h-5 w-5 items-center justify-center rounded text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                    >
                      <Pencil className="h-3 w-3" />
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(todo.id)}
                    disabled={isPending}
                    className="flex h-5 w-5 items-center justify-center rounded text-muted-foreground hover:text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
    </>
  );
}
