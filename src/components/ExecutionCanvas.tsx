"use client";

import React, { useState } from "react";
import {
  Check,
  Plus,
  Trash2,
  Star,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Clock,
  Sparkles,
  Lock,
  ArrowRight,
} from "lucide-react";
import { DailyLogType, TodoItemType } from "@/lib/db";
import { formatFullDate } from "@/lib/dateUtils";
import confetti from "canvas-confetti";

interface ExecutionCanvasProps {
  selectedLog: DailyLogType;
  selectedDate: string;
  todayIST: string;
  dayNumber: number | null;
  onAddTodo: (title: string, isCoreGoal: boolean, date: string) => Promise<void>;
  onToggleTodo: (id: string, isCompleted: boolean) => Promise<void>;
  onDeleteTodo: (id: string) => Promise<void>;
  onCompletePractice: () => Promise<void>;
  onOpenSkipModal: () => void;
  isCompleting: boolean;
}

export function ExecutionCanvas({
  selectedLog,
  selectedDate,
  todayIST,
  dayNumber,
  onAddTodo,
  onToggleTodo,
  onDeleteTodo,
  onCompletePractice,
  onOpenSkipModal,
  isCompleting,
}: ExecutionCanvasProps) {
  const [newTitle, setNewTitle] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isToday = selectedDate === todayIST;
  const isPast = selectedDate < todayIST;
  const isFuture = selectedDate > todayIST;

  const coreGoal = selectedLog.todos?.find((t) => t.isCoreGoal);
  const secondaryTodos = selectedLog.todos?.filter((t) => !t.isCoreGoal) || [];

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    setIsSubmitting(true);
    try {
      const shouldBeCore = !coreGoal;
      await onAddTodo(newTitle.trim(), shouldBeCore, selectedDate);
      setNewTitle("");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleComplete = async () => {
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ["#10B981", "#09090B", "#D97706"],
      });
    } catch {
      // ignore
    }
    await onCompletePractice();
  };

  // Day Badge Text
  const getBadgeLabel = () => {
    const dayStr = dayNumber ? `DAY ${dayNumber} OF 30` : "ROADMAP DAY";
    if (isToday) return `${dayStr} • TODAY`;
    if (isFuture) return `${dayStr} • UPCOMING`;
    if (selectedLog.status === "COMPLETED") return `${dayStr} • COMPLETED`;
    if (selectedLog.status === "SKIPPED") return `${dayStr} • SKIPPED`;
    if (selectedLog.status === "MISSED") return `${dayStr} • MISSED`;
    return `${dayStr} • PAST`;
  };

  const getBadgeStyle = () => {
    if (isToday) return "bg-obsidian text-white border-obsidian";
    if (selectedLog.status === "COMPLETED")
      return "bg-emerald-50 text-emerald-700 border-emerald-200";
    if (selectedLog.status === "SKIPPED")
      return "bg-amber-50 text-amber-700 border-amber-200";
    if (selectedLog.status === "MISSED")
      return "bg-rose-50 text-rose-700 border-rose-200";
    return "bg-subtle text-ink-secondary border-hairline";
  };

  return (
    <div className="flex-1 bg-white border border-hairline rounded-2xl p-6 sm:p-8 shadow-xs flex flex-col justify-between min-h-[580px]">
      <div>
        {/* Top: Day Badge & Date */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-hairline pb-4 mb-6">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span
                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold tracking-wider uppercase border ${getBadgeStyle()}`}
              >
                {getBadgeLabel()}
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-ink-primary">
              {formatFullDate(selectedDate)}
            </h2>
          </div>

          {/* Audit / Past status pill */}
          {isPast && (
            <div className="self-start sm:self-auto">
              {selectedLog.status === "COMPLETED" && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Practice Completed
                </span>
              )}
              {selectedLog.status === "SKIPPED" && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  Intentional Skip
                </span>
              )}
              {selectedLog.status === "MISSED" && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
                  <XCircle className="w-3.5 h-3.5" />
                  Missed at 9 PM IST
                </span>
              )}
            </div>
          )}
        </div>

        {/* Skipped reason display if in past */}
        {selectedLog.status === "SKIPPED" && selectedLog.skipReason && (
          <div className="mb-6 p-4 rounded-xl bg-amber-50/60 border border-amber-200 text-xs">
            <span className="font-bold text-amber-800 uppercase tracking-wider block mb-1">
              Logged Skip Reason:
            </span>
            <p className="italic text-amber-900">&ldquo;{selectedLog.skipReason}&rdquo;</p>
          </div>
        )}

        {/* SECTION: #1 CORE GOAL */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-ink-muted uppercase tracking-wider flex items-center gap-1.5">
              <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
              #1 Mandatory Core Goal
            </span>
            {isFuture && (
              <span className="text-[11px] text-ink-muted">Pre-planned goal</span>
            )}
          </div>

          {coreGoal ? (
            <div
              className={`group flex items-start gap-3.5 p-4 rounded-xl border transition-all ${
                coreGoal.isCompleted
                  ? "bg-subtle/60 border-hairline text-ink-muted"
                  : "bg-white border-obsidian/30 shadow-xs text-ink-primary"
              }`}
            >
              <button
                onClick={() => onToggleTodo(coreGoal.id, !coreGoal.isCompleted)}
                disabled={!isToday}
                className={`mt-0.5 w-5 h-5 rounded-md flex items-center justify-center transition-all ${
                  coreGoal.isCompleted
                    ? "bg-emerald-600 text-white border-none"
                    : isToday
                    ? "border border-ink-muted hover:border-obsidian bg-white"
                    : "border border-hairline bg-subtle cursor-default"
                }`}
              >
                {coreGoal.isCompleted && <Check className="w-3.5 h-3.5 stroke-[3]" />}
              </button>

              <div className="flex-1 min-w-0">
                <span
                  className={`text-sm sm:text-base font-semibold block leading-snug ${
                    coreGoal.isCompleted
                      ? "line-through text-ink-muted"
                      : "text-ink-primary"
                  }`}
                >
                  {coreGoal.title}
                </span>
              </div>

              {(isToday || isFuture) && (
                <button
                  onClick={() => onDeleteTodo(coreGoal.id)}
                  title="Remove goal"
                  className="opacity-0 group-hover:opacity-100 p-1 text-ink-muted hover:text-rose-600 transition-opacity"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          ) : (
            <div className="p-4 rounded-xl border border-dashed border-hairline bg-subtle/50 text-xs text-ink-muted flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-ink-muted" />
              <span>
                No Core Goal defined for this day. Enter your primary deliverable below.
              </span>
            </div>
          )}
        </div>

        {/* SECTION: SUB-TASKS CHECKLIST */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2.5">
            <span className="text-[11px] font-bold text-ink-muted uppercase tracking-wider">
              Supporting Checklist ({secondaryTodos.filter((t) => t.isCompleted).length}/
              {secondaryTodos.length})
            </span>
          </div>

          <div className="space-y-2">
            {secondaryTodos.map((todo) => (
              <div
                key={todo.id}
                className="group flex items-start gap-3 p-3 rounded-xl border border-hairline bg-white hover:bg-subtle/40 transition-colors"
              >
                <button
                  onClick={() => onToggleTodo(todo.id, !todo.isCompleted)}
                  disabled={!isToday}
                  className={`mt-0.5 w-4 h-4 rounded flex items-center justify-center transition-all ${
                    todo.isCompleted
                      ? "bg-emerald-600 text-white border-none"
                      : isToday
                      ? "border border-hairline hover:border-ink-muted bg-white"
                      : "border border-hairline bg-subtle cursor-default"
                  }`}
                >
                  {todo.isCompleted && <Check className="w-3 h-3 stroke-[3]" />}
                </button>

                <span
                  className={`flex-1 text-xs sm:text-sm font-medium leading-relaxed ${
                    todo.isCompleted
                      ? "line-through text-ink-muted"
                      : "text-ink-secondary"
                  }`}
                >
                  {todo.title}
                </span>

                {(isToday || isFuture) && (
                  <button
                    onClick={() => onDeleteTodo(todo.id)}
                    title="Remove task"
                    className="opacity-0 group-hover:opacity-100 p-1 text-ink-muted hover:text-rose-600 transition-opacity"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            ))}
          </div>

          {/* INLINE ADD TASK (Allowed on Today and Future days) */}
          {(isToday || isFuture) && (
            <form onSubmit={handleAdd} className="mt-3 flex gap-2">
              <input
                type="text"
                placeholder={
                  coreGoal
                    ? "Add supporting task..."
                    : "Add #1 Core Goal for this date..."
                }
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                className="flex-1 bg-subtle/70 border border-hairline rounded-xl px-3.5 py-2 text-xs sm:text-sm text-ink-primary placeholder-ink-muted focus:outline-none focus:border-obsidian transition-colors"
              />
              <button
                type="submit"
                disabled={isSubmitting || !newTitle.trim()}
                className="px-4 py-2 bg-obsidian text-white rounded-xl text-xs font-semibold hover:bg-ink-secondary transition-colors disabled:opacity-40 flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add</span>
              </button>
            </form>
          )}
        </div>
      </div>

      {/* BOTTOM ACTION BAR */}
      <div className="pt-6 border-t border-hairline mt-auto">
        {isToday && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            {selectedLog.status === "COMPLETED" ? (
              <div className="flex items-center gap-2 text-emerald-700 bg-emerald-50 border border-emerald-200 px-4 py-2.5 rounded-xl w-full justify-center sm:justify-start">
                <CheckCircle2 className="w-4 h-4" />
                <span className="text-xs font-semibold">
                  Today&apos;s practice is locked in and verified.
                </span>
              </div>
            ) : selectedLog.status === "SKIPPED" ? (
              <div className="flex items-center gap-2 text-amber-800 bg-amber-50 border border-amber-200 px-4 py-2.5 rounded-xl w-full justify-center sm:justify-start">
                <AlertTriangle className="w-4 h-4" />
                <span className="text-xs font-semibold">
                  Intentional skip logged. Tomorrow is non-negotiable.
                </span>
              </div>
            ) : (
              <>
                <button
                  onClick={handleComplete}
                  disabled={isCompleting || (coreGoal ? !coreGoal.isCompleted : false)}
                  className={`w-full sm:w-auto px-6 py-3 rounded-xl font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all shadow-xs ${
                    coreGoal && !coreGoal.isCompleted
                      ? "bg-subtle text-ink-muted cursor-not-allowed border border-hairline"
                      : "bg-obsidian hover:bg-ink-secondary text-white active:scale-[0.99]"
                  }`}
                >
                  <Check className="w-4 h-4" />
                  {isCompleting
                    ? "Recording Completion..."
                    : coreGoal && !coreGoal.isCompleted
                    ? "Check #1 Core Goal to Complete"
                    : "Complete Today's Practice"}
                </button>

                <button
                  onClick={onOpenSkipModal}
                  className="text-xs text-ink-muted hover:text-amber-700 transition-colors font-medium hover:underline py-1"
                >
                  Skip today (Requires reason)
                </button>
              </>
            )}
          </div>
        )}

        {isFuture && (
          <div className="flex items-center gap-2.5 p-3.5 rounded-xl bg-subtle text-ink-secondary text-xs border border-hairline">
            <Lock className="w-4 h-4 text-ink-muted shrink-0" />
            <span>
              <strong>Pre-Planning Mode:</strong> You can edit and schedule tasks for
              this date. Practice session execution unlocks on this calendar day.
            </span>
          </div>
        )}

        {isPast && selectedLog.status !== "COMPLETED" && selectedLog.status !== "SKIPPED" && (
          <div className="flex items-center gap-2 p-3 rounded-xl bg-rose-50 text-rose-700 text-xs border border-rose-200">
            <XCircle className="w-4 h-4 shrink-0" />
            <span>Past date marked MISSED. Keep your active streak protected today.</span>
          </div>
        )}
      </div>
    </div>
  );
}

