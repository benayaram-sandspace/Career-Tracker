"use client";

import React, { useState } from "react";
import { DayStatus } from "@/lib/db";
import { formatDateDisplay } from "@/lib/dateUtils";
import { Calendar, CheckCircle2, AlertTriangle, XCircle, Clock } from "lucide-react";

interface ConsistencyStripProps {
  todayIST: string;
  history: Record<
    string,
    { status: DayStatus; skipReason?: string | null; durationMinutes?: number }
  >;
  dates: string[];
}

export function ConsistencyStrip({
  todayIST,
  history,
  dates,
}: ConsistencyStripProps) {
  const [hoveredDate, setHoveredDate] = useState<string | null>(null);

  // Compute consistency stats
  const completedCount = dates.filter(
    (d) => history[d]?.status === "COMPLETED"
  ).length;
  const consistencyRate = Math.round((completedCount / dates.length) * 100);

  const getStatusColor = (date: string) => {
    const item = history[date];
    const isToday = date === todayIST;

    if (!item) {
      if (isToday) return "bg-indigo-500/20 border-indigo-400 border animate-pulse";
      return "bg-slate-800/60 border border-slate-700/40";
    }

    switch (item.status) {
      case "COMPLETED":
        return "bg-emerald-500 shadow-sm shadow-emerald-500/20";
      case "SKIPPED":
        return "bg-amber-500 shadow-sm shadow-amber-500/20";
      case "MISSED":
        return "bg-rose-500 shadow-sm shadow-rose-500/20";
      case "PENDING":
      default:
        if (isToday) return "bg-indigo-500/20 border-indigo-400 border animate-pulse";
        return "bg-slate-800/60 border border-slate-700/40";
    }
  };

  const getStatusDetails = (date: string) => {
    const item = history[date];
    const isToday = date === todayIST;

    if (!item || item.status === "PENDING") {
      return isToday ? "Today: Practice In Progress / Pending" : "No Practice Logged";
    }
    if (item.status === "COMPLETED") {
      return item.durationMinutes
        ? `Completed (${item.durationMinutes}m focus session)`
        : "Completed Practice";
    }
    if (item.status === "SKIPPED") {
      return item.skipReason
        ? `Skipped: "${item.skipReason}"`
        : "Logged Intentional Skip";
    }
    if (item.status === "MISSED") {
      return "Missed (Passed 9 PM IST)";
    }
    return item.status;
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 mb-6 shadow-lg backdrop-blur-sm">
      <div className="flex items-center justify-between mb-3 border-b border-slate-800/80 pb-3">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-indigo-400" />
          <h3 className="text-sm font-bold uppercase tracking-wider text-white">
            30-Day Consistency Strip
          </h3>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <span className="text-slate-400">Score:</span>
          <span className="font-mono font-bold text-emerald-400">
            {consistencyRate}%
          </span>
          <span className="text-slate-500">
            ({completedCount}/30 Days)
          </span>
        </div>
      </div>

      {/* Grid of 30 blocks */}
      <div className="grid grid-cols-10 sm:grid-cols-15 gap-1.5 py-2">
        {dates.map((date) => {
          const isToday = date === todayIST;
          return (
            <div
              key={date}
              onMouseEnter={() => setHoveredDate(date)}
              onMouseLeave={() => setHoveredDate(null)}
              className="relative group cursor-pointer"
            >
              <div
                className={`h-7 w-full rounded transition-transform group-hover:scale-110 ${getStatusColor(
                  date
                )}`}
              />
              {isToday && (
                <div className="absolute -top-1 -right-1 w-2 h-2 bg-indigo-400 rounded-full" />
              )}
            </div>
          );
        })}
      </div>

      {/* Tooltip / Status readout */}
      <div className="mt-3 pt-2 text-xs flex items-center justify-between min-h-[24px] text-slate-400 border-t border-slate-800/60">
        {hoveredDate ? (
          <div className="flex items-center gap-2 truncate">
            <span className="font-mono text-slate-300 font-semibold">
              {formatDateDisplay(hoveredDate)}:
            </span>
            <span className="text-slate-200 truncate">
              {getStatusDetails(hoveredDate)}
            </span>
          </div>
        ) : (
          <span className="text-slate-500 italic">
            Hover over any day in the strip for details
          </span>
        )}

        {/* Legend */}
        <div className="flex items-center gap-3 text-[10px] uppercase font-semibold text-slate-500 shrink-0">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            Done
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-amber-500" />
            Skip
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-rose-500" />
            Miss
          </span>
        </div>
      </div>
    </div>
  );
}

