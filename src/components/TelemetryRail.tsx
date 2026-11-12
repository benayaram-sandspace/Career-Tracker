"use client";

import React, { useState, useEffect } from "react";
import {
  Flame,
  Trophy,
  Play,
  Timer,
  CheckCircle2,
  Calendar,
  AlertTriangle,
  XCircle,
} from "lucide-react";
import { DayStatus, DailyLogType } from "@/lib/db";
import { formatDuration, getDayNumber, formatDateDisplay } from "@/lib/dateUtils";

interface TelemetryRailProps {
  currentStreak: number;
  longestStreak: number;
  todayLog: DailyLogType;
  selectedDate: string;
  todayIST: string;
  planStartDate: string;
  roadmapDates: string[];
  history30Days: Record<
    string,
    {
      dayNumber?: number | null;
      status: DayStatus;
      skipReason?: string | null;
      durationMinutes?: number;
      coreGoal?: string;
      totalTasks?: number;
      completedTasks?: number;
    }
  >;
  onSelectDate: (date: string) => void;
  onStartPractice: () => Promise<void>;
  isStarting: boolean;
}

export function TelemetryRail({
  currentStreak,
  longestStreak,
  todayLog,
  selectedDate,
  todayIST,
  planStartDate,
  roadmapDates,
  history30Days,
  onSelectDate,
  onStartPractice,
  isStarting,
}: TelemetryRailProps) {
  const [elapsedMs, setElapsedMs] = useState<number>(0);
  const [hoveredCell, setHoveredCell] = useState<string | null>(null);

  // Live timer for today's active session
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

  const isTodaySessionActive =
    todayLog.status === "PENDING" && Boolean(todayLog.startedAt);

  // Consistency metrics
  const completedCount = roadmapDates.filter(
    (d) => history30Days[d]?.status === "COMPLETED"
  ).length;
  const consistencyPercent = Math.round((completedCount / 30) * 100);

  const getCellStatusClass = (date: string) => {
    const item = history30Days[date];
    const isToday = date === todayIST;
    const isSelected = date === selectedDate;

    let baseBg = "bg-subtle text-ink-muted border-hairline";
    if (item?.status === "COMPLETED") {
      baseBg = "bg-emerald-500 text-white border-emerald-500 font-bold";
    } else if (item?.status === "SKIPPED") {
      baseBg = "bg-amber-500 text-white border-amber-500 font-bold";
    } else if (item?.status === "MISSED") {
      baseBg = "bg-rose-500 text-white border-rose-500 font-bold";
    } else if (isToday) {
      baseBg = "bg-white text-ink-primary border-obsidian font-bold";
    }

    if (isSelected) {
      return `${baseBg} ring-2 ring-obsidian ring-offset-1`;
    }
    return baseBg;
  };

  return (
    <aside className="w-full lg:w-[350px] flex flex-col gap-4">
      {/* 1. STREAK & PERSONAL RECORD */}
      <div className="bg-white border border-hairline rounded-2xl p-5 shadow-xs">
        <div className="flex items-center justify-between mb-3 border-b border-hairline pb-2.5">
          <span className="text-[11px] font-bold text-ink-muted uppercase tracking-wider flex items-center gap-1.5">
            <Flame className="w-4 h-4 text-amber-500" />
            Active Streak
          </span>
          <span className="text-[10px] text-ink-muted font-medium">
            Reset 9:00 PM IST
          </span>
        </div>

        <div className="flex items-baseline gap-2">
          <span className="text-3xl sm:text-4xl font-extrabold font-mono tabular-nums text-ink-primary tracking-tight">
            {currentStreak}
          </span>
          <span className="text-sm font-semibold text-ink-muted uppercase">
            {currentStreak === 1 ? "Day" : "Days"}
          </span>
        </div>

        <div className="flex items-center gap-1.5 text-xs text-ink-secondary mt-2 pt-2 border-t border-hairline">
          <Trophy className="w-3.5 h-3.5 text-amber-600" />
          <span>
            Personal Best:{" "}
            <strong className="text-ink-primary font-mono tabular-nums">
              {longestStreak} {longestStreak === 1 ? "day" : "days"}
            </strong>
          </span>
        </div>
      </div>

      {/* 2. LIVE FOCUS SESSION TIMER */}
      <div className="bg-white border border-hairline rounded-2xl p-5 shadow-xs">
        <div className="flex items-center justify-between mb-3 border-b border-hairline pb-2.5">
          <span className="text-[11px] font-bold text-ink-muted uppercase tracking-wider flex items-center gap-1.5">
            <Timer className="w-4 h-4 text-ink-primary" />
            Daily Focus Session
          </span>
          {isTodaySessionActive && (
            <span className="flex items-center gap-1 text-[11px] text-emerald-700 font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              Active
            </span>
          )}
        </div>

        {todayLog.status === "COMPLETED" ? (
          <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-center">
            <div className="flex items-center justify-center gap-1.5 text-emerald-800 font-semibold text-xs mb-1">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Practice Completed</span>
            </div>
            {todayLog.completedAt && todayLog.startedAt && (
              <span className="font-mono text-xs text-emerald-700">
                Duration:{" "}
                {formatDuration(
                  new Date(todayLog.completedAt).getTime() -
                    new Date(todayLog.startedAt).getTime()
                )}
              </span>
            )}
          </div>
        ) : todayLog.status === "SKIPPED" ? (
          <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-center text-xs text-amber-800 font-semibold">
            Practice Skipped Today
          </div>
        ) : isTodaySessionActive ? (
          <div className="text-center py-2">
            <div className="text-3xl font-bold font-mono tabular-nums text-ink-primary tracking-tight">
              {formatDuration(elapsedMs)}
            </div>
            <p className="text-[11px] text-ink-muted mt-1">
              Focus timer running. Conquer your #1 Core Goal.
            </p>
          </div>
        ) : (
          <div className="pt-1">
            <p className="text-xs text-ink-muted mb-3 leading-relaxed">
              Start your timed session to lock in deep work for your career transition.
            </p>
            <button
              onClick={onStartPractice}
              disabled={isStarting}
              className="w-full py-2.5 px-4 rounded-xl bg-obsidian hover:bg-ink-secondary text-white text-xs font-semibold flex items-center justify-center gap-2 transition-colors disabled:opacity-50 shadow-xs"
            >
              <Play className="w-3.5 h-3.5 fill-white" />
              {isStarting ? "Starting..." : "Start Practice Session"}
            </button>
          </div>
        )}
      </div>

      {/* 3. INTERACTIVE 30-DAY CONSISTENCY MATRIX */}
      <div className="bg-white border border-hairline rounded-2xl p-5 shadow-xs">
        <div className="flex items-center justify-between mb-3 border-b border-hairline pb-2.5">
          <span className="text-[11px] font-bold text-ink-muted uppercase tracking-wider flex items-center gap-1.5">
            <Calendar className="w-4 h-4 text-ink-primary" />
            30-Day Matrix
          </span>
          <span className="text-xs font-mono font-bold text-emerald-700">
            {consistencyPercent}% ({completedCount}/30)
          </span>
        </div>

        {/* 6 columns x 5 rows grid */}
        <div className="grid grid-cols-6 gap-1.5 py-1">
          {roadmapDates.map((date, idx) => {
            const dayNum = idx + 1;
            const isToday = date === todayIST;
            return (
              <button
                key={date}
                onClick={() => onSelectDate(date)}
                onMouseEnter={() => setHoveredCell(date)}
                onMouseLeave={() => setHoveredCell(null)}
                className={`h-9 rounded-lg border text-[11px] font-mono flex flex-col items-center justify-center transition-all hover:scale-105 relative ${getCellStatusClass(
                  date
                )}`}
              >
                <span>{dayNum}</span>
                {isToday && (
                  <span className="absolute -top-1 -right-1 w-1.5 h-1.5 bg-obsidian rounded-full" />
                )}
              </button>
            );
          })}
        </div>

        {/* Hover Readout / Details */}
        <div className="mt-3 pt-2 text-[11px] border-t border-hairline min-h-[36px] flex flex-col justify-center text-ink-secondary">
          {hoveredCell ? (
            <div className="truncate">
              <span className="font-semibold text-ink-primary">
                Day {getDayNumber(hoveredCell, planStartDate)} ({formatDateDisplay(hoveredCell)}):
              </span>{" "}
              <span>
                {history30Days[hoveredCell]?.status === "COMPLETED"
                  ? `Completed (${history30Days[hoveredCell]?.durationMinutes || 0}m)`
                  : history30Days[hoveredCell]?.status === "SKIPPED"
                  ? `Skipped: "${history30Days[hoveredCell]?.skipReason || ""}"`
                  : history30Days[hoveredCell]?.status === "MISSED"
                  ? "Missed at 9 PM"
                  : history30Days[hoveredCell]?.coreGoal || "Planned goal"}
              </span>
            </div>
          ) : (
            <div className="flex items-center justify-between text-[10px] text-ink-muted uppercase">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500" /> Done
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-amber-500" /> Skip
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-rose-500" /> Miss
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-subtle border border-hairline" /> Planned
              </span>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}

