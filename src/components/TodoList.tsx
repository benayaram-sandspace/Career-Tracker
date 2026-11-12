"use client";

import React, { useState } from "react";
import {
  Check,
  Plus,
  Trash2,
  Star,
  Sparkles,
  ListTodo,
  CheckCircle2,
} from "lucide-react";
import { TodoItemType } from "@/lib/db";

interface TodoListProps {
  todos: TodoItemType[];
  onAddTodo: (title: string, isCoreGoal: boolean) => Promise<void>;
  onToggleTodo: (id: string, isCompleted: boolean) => Promise<void>;
  onDeleteTodo: (id: string) => Promise<void>;
  isLocked: boolean; // if completed or skipped
}

export function TodoList({
  todos,
  onAddTodo,
  onToggleTodo,
  onDeleteTodo,
  isLocked,
}: TodoListProps) {
  const [newTitle, setNewTitle] = useState("");
  const [makeCoreGoal, setMakeCoreGoal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const coreGoal = todos.find((t) => t.isCoreGoal);
  const secondaryTodos = todos.filter((t) => !t.isCoreGoal);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    setIsSubmitting(true);
    try {
      // If there is no core goal yet, default to making this the core goal
      const shouldBeCore = makeCoreGoal || !coreGoal;
      await onAddTodo(newTitle.trim(), shouldBeCore);
      setNewTitle("");
      setMakeCoreGoal(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 mb-6 shadow-lg backdrop-blur-sm">
      <div className="flex items-center justify-between mb-4 border-b border-slate-800/80 pb-3">
        <div className="flex items-center gap-2">
          <ListTodo className="w-4 h-4 text-indigo-400" />
          <h3 className="text-sm font-bold uppercase tracking-wider text-white">
            Daily Execution Checklist
          </h3>
        </div>
        <span className="text-xs text-slate-500 font-mono">
          {todos.filter((t) => t.isCompleted).length}/{todos.length} Done
        </span>
      </div>

      {/* CORE GOAL ITEM */}
      {coreGoal ? (
        <div className="mb-4">
          <div className="text-[11px] font-bold text-amber-400 flex items-center gap-1.5 uppercase tracking-wider mb-2">
            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
            #1 Core Goal (Mandatory for Streak)
          </div>
          <div
            className={`group flex items-start gap-3 p-3.5 rounded-lg border transition-all ${
              coreGoal.isCompleted
                ? "bg-slate-950/60 border-emerald-500/30 text-slate-400"
                : "bg-indigo-950/20 border-indigo-500/40 text-white"
            }`}
          >
            <button
              onClick={() => onToggleTodo(coreGoal.id, !coreGoal.isCompleted)}
              disabled={isLocked}
              className={`mt-0.5 w-5 h-5 rounded flex items-center justify-center transition-all ${
                coreGoal.isCompleted
                  ? "bg-emerald-500 text-slate-950"
                  : "border border-indigo-400/50 hover:border-indigo-400 bg-slate-950/60"
              }`}
            >
              {coreGoal.isCompleted && <Check className="w-3.5 h-3.5 stroke-[3]" />}
            </button>

            <div className="flex-1 min-w-0">
              <span
                className={`text-sm font-semibold break-words block ${
                  coreGoal.isCompleted ? "line-through text-slate-500" : "text-white"
                }`}
              >
                {coreGoal.title}
              </span>
            </div>

            {!isLocked && (
              <button
                onClick={() => onDeleteTodo(coreGoal.id)}
                title="Remove task"
                className="opacity-0 group-hover:opacity-100 p-1 text-slate-500 hover:text-rose-400 transition-opacity"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="mb-4 p-3.5 rounded-lg border border-dashed border-amber-500/40 bg-amber-500/5 flex items-center gap-2.5 text-xs text-amber-300">
          <Sparkles className="w-4 h-4 shrink-0 text-amber-400" />
          <span>
            No <strong>#1 Core Goal</strong> set yet! Add your primary career objective
            below.
          </span>
        </div>
      )}

      {/* SECONDARY TASKS */}
      {secondaryTodos.length > 0 && (
        <div className="space-y-2 mb-4">
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            Supporting Tasks
          </div>
          {secondaryTodos.map((todo) => (
            <div
              key={todo.id}
              className="group flex items-start gap-3 p-3 rounded-lg border border-slate-800/80 bg-slate-950/40 hover:bg-slate-950/70 transition-all"
            >
              <button
                onClick={() => onToggleTodo(todo.id, !todo.isCompleted)}
                disabled={isLocked}
                className={`mt-0.5 w-4 h-4 rounded flex items-center justify-center transition-all ${
                  todo.isCompleted
                    ? "bg-slate-700 text-emerald-400"
                    : "border border-slate-700 hover:border-slate-500 bg-slate-900"
                }`}
              >
                {todo.isCompleted && <Check className="w-3 h-3 stroke-[3]" />}
              </button>

              <span
                className={`flex-1 text-xs break-words font-medium ${
                  todo.isCompleted
                    ? "line-through text-slate-500"
                    : "text-slate-300"
                }`}
              >
                {todo.title}
              </span>

              {!isLocked && (
                <button
                  onClick={() => onDeleteTodo(todo.id)}
                  title="Remove task"
                  className="opacity-0 group-hover:opacity-100 p-1 text-slate-500 hover:text-rose-400 transition-opacity"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* ADD TASK FORM */}
      {!isLocked && (
        <form onSubmit={handleAdd} className="mt-4 pt-3 border-t border-slate-800/80">
          <div className="flex gap-2">
            <input
              type="text"
              placeholder={
                coreGoal
                  ? "Add supporting task (e.g. review PRs, solve 1 problem)..."
                  : "Enter today's #1 Core Goal..."
              }
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              className="flex-1 bg-slate-950/80 border border-slate-800 rounded-lg px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
            />
            <button
              type="submit"
              disabled={isSubmitting || !newTitle.trim()}
              className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors disabled:opacity-50"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add</span>
            </button>
          </div>

          {coreGoal && (
            <label className="flex items-center gap-2 mt-2 cursor-pointer text-[11px] text-slate-400 select-none hover:text-slate-300">
              <input
                type="checkbox"
                checked={makeCoreGoal}
                onChange={(e) => setMakeCoreGoal(e.target.checked)}
                className="w-3.5 h-3.5 rounded border-slate-700 bg-slate-900 text-indigo-600 focus:ring-0"
              />
              <span>Set as #1 Core Goal (replaces current core goal)</span>
            </label>
          )}
        </form>
      )}
    </div>
  );
}

