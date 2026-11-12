"use client";

import React from "react";
import { Flame, Trophy, Clock, CheckCircle2, AlertTriangle, XCircle } from "lucide-react";
import { DayStatus } from "@/lib/db";

interface StreakCardProps {
  currentStreak: number;
  longestStreak: number;
  status: DayStatus;
  isSessionActive: boolean;
}

export function StreakCard({
  currentStreak,
  longestStreak,
  status,
  isSessionActive,
}: StreakCardProps) {
  const getStatusBadge = () => {
    if (isSessionActive && status === "PENDING") {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/15 text-indigo-400 border border-indigo-500/30 animate-pulse">
          <Clock className="w-3.5 h-3.5" />
          Focus Mode Live
        </span>
      );
    }

    switch (status) {
      case "COMPLETED":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Today Completed
          </span>
        );
      case "SKIPPED":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/15 text-amber-400 border border-amber-500/30">
            <AlertTriangle className="w-3.5 h-3.5" />
            Logged Skip
          </span>
        );
      case "MISSED":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-rose-500/15 text-rose-400 border border-rose-500/30">
            <XCircle className="w-3.5 h-3.5" />
            Missed (Reset)
          </span>
        );
      case "PENDING":
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-slate-800 text-slate-300 border border-slate-700">
            <Clock className="w-3.5 h-3.5" />
            Practice Pending
          </span>
        );
    }
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 mb-5 shadow-lg backdrop-blur-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center">
              <Flame
                className={`w-8 h-8 ${
                  currentStreak > 0
                    ? "text-amber-500 animate-flame"
                    : "text-slate-600"
                }`}
              />
            </div>
            {currentStreak > 0 && (
              <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-emerald-500 border-2 border-slate-900 rounded-full" />
            )}
          </div>

          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl sm:text-4xl font-extrabold tracking-tight font-mono text-white">
                {currentStreak}
              </span>
              <span className="text-sm font-semibold text-slate-400 uppercase tracking-wide">
                {currentStreak === 1 ? "Day Streak" : "Days Streak"}
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-0.5">
              <Trophy className="w-3.5 h-3.5 text-amber-400" />
              <span>
                Personal Record:{" "}
                <strong className="text-slate-200 font-mono">
                  {longestStreak} {longestStreak === 1 ? "day" : "days"}
                </strong>
              </span>
            </div>
          </div>
        </div>

        <div className="flex flex-col items-end gap-2">
          {getStatusBadge()}
          <span className="text-[11px] text-slate-500">
            Reset daily at 9:00 PM IST
          </span>
        </div>
      </div>
    </div>
  );
}

