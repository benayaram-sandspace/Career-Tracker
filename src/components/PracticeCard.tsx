"use client";

import React, { useState, useEffect } from "react";
import {
  Play,
  CheckCircle2,
  AlertOctagon,
  Timer,
  Sparkles,
  ShieldCheck,
  Flame,
  ArrowRight,
} from "lucide-react";
import { DayStatus, DailyLogType, TodoItemType } from "@/lib/db";
import { formatDuration } from "@/lib/dateUtils";
import confetti from "canvas-confetti";

interface PracticeCardProps {
  todayLog: DailyLogType;
  coreGoal: TodoItemType | undefined;
  onStartPractice: () => Promise<void>;
  onCompletePractice: () => Promise<void>;
  onOpenSkipModal: () => void;
  isStarting: boolean;
  isCompleting: boolean;
}

export function PracticeCard({
  todayLog,
  coreGoal,
  onStartPractice,
  onCompletePractice,
  onOpenSkipModal,
  isStarting,
  isCompleting,
}: PracticeCardProps) {
  const [elapsedMs, setElapsedMs] = useState<number>(0);

  // Focus Mode live session timer
  useEffect(() => {
    if (todayLog.status === "PENDING" && todayLog.startedAt) {
      const startTime = new Date(todayLog.startedAt).getTime();
      const updateTimer = () => {
        setElapsedMs(Math.max(0, Date.now() - startTime));
      };
      updateTimer();
      const interval = setInterval(updateTimer, 1000);
      return () => clearInterval(interval);
    }
  }, [todayLog.status, todayLog.startedAt]);

  const handleComplete = async () => {
    try {
      // Trigger confetti
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ["#10B981", "#4F46E5", "#F59E0B"],
      });
    } catch {
      // ignore
    }
    await onCompletePractice();
  };

  const isFocusMode = todayLog.status === "PENDING" && Boolean(todayLog.startedAt);
  const isCompleted = todayLog.status === "COMPLETED";
  const isSkipped = todayLog.status === "SKIPPED";
  const isMissed = todayLog.status === "MISSED";
  const isIdle = todayLog.status === "PENDING" && !todayLog.startedAt;

  // Calculate practice duration if completed
  const durationMs =
    todayLog.completedAt && todayLog.startedAt
      ? new Date(todayLog.completedAt).getTime() -
        new Date(todayLog.startedAt).getTime()
      : null;

  return (
    <div
      className={`relative rounded-xl border p-6 mb-6 transition-all shadow-xl ${
        isFocusMode
          ? "bg-slate-900 border-indigo-500/50 ring-1 ring-indigo-500/30"
          : isCompleted
          ? "bg-slate-900/90 border-emerald-500/40"
          : isSkipped
          ? "bg-slate-900/90 border-amber-500/40"
          : isMissed
          ? "bg-slate-900/90 border-rose-500/40"
          : "bg-slate-900/90 border-slate-800"
      }`}
    >
      {/* 1. IDLE STATE */}
      {isIdle && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Today&apos;s Focus Block
            </span>
            <span className="text-xs text-indigo-400 font-medium">
              Single-Task Ritual
            </span>
          </div>

          <div className="mb-6">
            <h2 className="text-lg font-semibold text-white mb-2">
              Ready to execute today&apos;s career shift work?
            </h2>
            <p className="text-sm text-slate-400 leading-relaxed">
              No endless task lists. Lock in your session, start the focus timer, and
              conquer your #1 Core Goal to extend your streak.
            </p>
          </div>

          {coreGoal && (
            <div className="mb-6 p-4 rounded-lg bg-slate-950/60 border border-slate-800 flex items-start gap-3">
              <div className="p-1 rounded bg-indigo-500/10 text-indigo-400 mt-0.5">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <div className="text-[11px] font-bold text-indigo-400 uppercase tracking-wider">
                  Pinned Deliverable
                </div>
                <div className="text-sm font-medium text-slate-200 mt-0.5">
                  {coreGoal.title}
                </div>
              </div>
            </div>
          )}

          <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
            <button
              onClick={onStartPractice}
              disabled={isStarting}
              className="w-full sm:flex-1 py-3 px-6 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 transition-all active:scale-[0.99] disabled:opacity-50"
            >
              <Play className="w-4 h-4 fill-white" />
              {isStarting ? "Starting Session..." : "Start Today's Practice"}
            </button>
            <button
              onClick={onOpenSkipModal}
              className="text-xs text-slate-400 hover:text-amber-400 py-2.5 px-4 transition-colors font-medium hover:underline"
            >
              Skip Today (Requires Reason)
            </button>
          </div>
        </div>
      )}

      {/* 2. ACTIVE FOCUS MODE */}
      {isFocusMode && (
        <div>
          <div className="flex items-center justify-between mb-4 border-b border-indigo-500/20 pb-3">
            <div className="flex items-center gap-2">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-indigo-500"></span>
              </span>
              <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider">
                Focus Mode Active
              </span>
            </div>
            <div className="flex items-center gap-1.5 font-mono text-base font-bold text-white bg-slate-950/80 px-3 py-1 rounded-md border border-indigo-500/30">
              <Timer className="w-4 h-4 text-indigo-400 animate-spin-slow" />
              <span>{formatDuration(elapsedMs)}</span>
            </div>
          </div>

          <div className="mb-6">
            <h2 className="text-lg font-bold text-white mb-1">
              Deep Work In Progress
            </h2>
            <p className="text-xs text-slate-400">
              Work on your daily deliverable without interruption. When you finish
              your #1 Core Goal below, check it off to unlock completion.
            </p>
          </div>

          {coreGoal && (
            <div className="mb-6 p-4 rounded-lg bg-indigo-950/20 border border-indigo-500/30 flex items-start gap-3">
              <div
                className={`p-1 rounded mt-0.5 ${
                  coreGoal.isCompleted
                    ? "bg-emerald-500/20 text-emerald-400"
                    : "bg-indigo-500/20 text-indigo-400"
                }`}
              >
                {coreGoal.isCompleted ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                ) : (
                  <Sparkles className="w-4 h-4" />
                )}
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-indigo-400 uppercase tracking-wider">
                    #1 Core Goal Requirement
                  </span>
                  <span
                    className={`text-[11px] font-semibold ${
                      coreGoal.isCompleted
                        ? "text-emerald-400 font-mono"
                        : "text-amber-400"
                    }`}
                  >
                    {coreGoal.isCompleted ? "Goal Completed" : "Must be checked"}
                  </span>
                </div>
                <div
                  className={`text-sm font-semibold mt-0.5 ${
                    coreGoal.isCompleted
                      ? "line-through text-slate-400"
                      : "text-white"
                  }`}
                >
                  {coreGoal.title}
                </div>
              </div>
            </div>
          )}

          <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
            <button
              onClick={handleComplete}
              disabled={isCompleting || (coreGoal ? !coreGoal.isCompleted : false)}
              className={`w-full sm:flex-1 py-3 px-6 rounded-lg font-semibold text-sm shadow-lg flex items-center justify-center gap-2 transition-all ${
                coreGoal && !coreGoal.isCompleted
                  ? "bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700"
                  : "bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/30 active:scale-[0.99]"
              }`}
            >
              <CheckCircle2 className="w-4 h-4" />
              {isCompleting
                ? "Recording Completion..."
                : coreGoal && !coreGoal.isCompleted
                ? "Complete Core Goal First"
                : "Complete Today's Practice"}
            </button>

            <button
              onClick={onOpenSkipModal}
              className="text-xs text-slate-500 hover:text-amber-400 py-2.5 px-4 transition-colors font-medium hover:underline"
            >
              Abandon & Log Skip
            </button>
          </div>
        </div>
      )}

      {/* 3. COMPLETED STATE */}
      {isCompleted && (
        <div>
          <div className="flex items-center justify-between mb-4 border-b border-emerald-500/20 pb-3">
            <div className="flex items-center gap-2 text-emerald-400">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
              <span className="text-xs font-bold uppercase tracking-wider">
                Practice Finished & Verified
              </span>
            </div>
            {durationMs && (
              <span className="font-mono text-xs text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded border border-emerald-500/20">
                Duration: {formatDuration(durationMs)}
              </span>
            )}
          </div>

          <div className="mb-4">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <span>Day Locked In</span>
              <Flame className="w-5 h-5 text-amber-500" />
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 leading-relaxed">
              Your practice for today has been logged and your streak extended.
              The evening check will confirm your momentum. Great job pushing your career forward!
            </p>
          </div>

          {coreGoal && (
            <div className="p-3 rounded-lg bg-emerald-950/20 border border-emerald-500/20 flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span className="text-xs text-slate-300 font-medium line-through">
                {coreGoal.title}
              </span>
            </div>
          )}
        </div>
      )}

      {/* 4. SKIPPED STATE */}
      {isSkipped && (
        <div>
          <div className="flex items-center justify-between mb-3 border-b border-amber-500/20 pb-3">
            <div className="flex items-center gap-2 text-amber-400">
              <AlertOctagon className="w-5 h-5" />
              <span className="text-xs font-bold uppercase tracking-wider">
                Practice Skipped Today
              </span>
            </div>
            <span className="text-xs font-mono text-amber-400/80 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
              Streak Reset
            </span>
          </div>

          <div className="mb-4">
            <p className="text-xs text-slate-400">
              You chose to skip today. An accountability notification was sent to you
              and your accountability partner.
            </p>
          </div>

          {todayLog.skipReason && (
            <div className="p-3.5 rounded-lg bg-amber-950/20 border-l-4 border-amber-500 mb-4">
              <div className="text-[10px] font-bold text-amber-400 uppercase tracking-wider mb-1">
                Reason Logged:
              </div>
              <p className="text-xs italic text-slate-200">
                &ldquo;{todayLog.skipReason}&rdquo;
              </p>
            </div>
          )}

          <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800 text-xs text-slate-300">
            <strong className="text-amber-400">Reminder:</strong> One skip is a conscious choice. Tomorrow is non-negotiable.
          </div>
        </div>
      )}

      {/* 5. MISSED STATE */}
      {isMissed && (
        <div>
          <div className="flex items-center justify-between mb-3 border-b border-rose-500/20 pb-3">
            <div className="flex items-center gap-2 text-rose-400">
              <AlertOctagon className="w-5 h-5" />
              <span className="text-xs font-bold uppercase tracking-wider">
                9:00 PM Cutoff Passed — Missed
              </span>
            </div>
            <span className="text-xs font-mono text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/20">
              Streak: 0
            </span>
          </div>

          <div className="mb-4">
            <p className="text-xs text-slate-300 leading-relaxed">
              Today was neither completed nor consciously skipped before the 9:00 PM IST
              accountability check. Streak has been reset.
            </p>
          </div>

          <div className="p-3 rounded-lg bg-slate-950/60 border border-rose-500/20 text-xs text-slate-300 flex items-center justify-between">
            <span>Tomorrow morning at 9:00 AM IST starts Day 1.</span>
            <ArrowRight className="w-4 h-4 text-rose-400" />
          </div>
        </div>
      )}
    </div>
  );
}

