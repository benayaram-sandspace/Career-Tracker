"use client";

import React from "react";
import {
  ChevronLeft,
  ChevronRight,
  Calendar,
  Settings,
  Lock,
  Compass,
} from "lucide-react";
import { formatHeaderDate } from "@/lib/dateUtils";

interface HeaderProps {
  userName: string;
  targetRole: string;
  selectedDate: string;
  todayIST: string;
  onSelectDate: (date: string) => void;
  onPrevDate: () => void;
  onNextDate: () => void;
  onOpenRoadmap: () => void;
  onOpenSettings: () => void;
  isPinProtected: boolean;
  onLockApp?: () => void;
}

export function Header({
  targetRole,
  selectedDate,
  todayIST,
  onSelectDate,
  onPrevDate,
  onNextDate,
  onOpenRoadmap,
  onOpenSettings,
  isPinProtected,
  onLockApp,
}: HeaderProps) {
  const isToday = selectedDate === todayIST;

  return (
    <header className="w-full bg-white border-b border-hairline py-3 px-4 sm:px-8 sticky top-0 z-30 shadow-xs">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        {/* Left: Breadcrumb */}
        <div className="flex items-center gap-2 text-xs">
          <span className="text-ink-muted font-medium">Career Shift</span>
          <span className="text-hairline">/</span>
          <span className="text-ink-primary font-semibold flex items-center gap-1.5">
            <Compass className="w-3.5 h-3.5 text-ink-primary" />
            {targetRole}
          </span>
          <span className="hidden md:inline-flex items-center ml-2 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-subtle text-ink-secondary border border-hairline">
            30-Day Sprint
          </span>
        </div>

        {/* Right: Date Switcher & Actions */}
        <div className="flex items-center justify-between sm:justify-end gap-2 sm:gap-3">
          {/* Day Navigation */}
          <div className="flex items-center bg-subtle border border-hairline rounded-lg p-0.5 text-xs">
            <button
              onClick={onPrevDate}
              title="Previous Day"
              className="p-1.5 hover:bg-white rounded text-ink-secondary hover:text-ink-primary transition-colors"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>

            <span className="px-2.5 font-medium text-ink-primary font-mono tabular-nums text-xs">
              {formatHeaderDate(selectedDate)}
            </span>

            <button
              onClick={onNextDate}
              title="Next Day"
              className="p-1.5 hover:bg-white rounded text-ink-secondary hover:text-ink-primary transition-colors"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {!isToday && (
            <button
              onClick={() => onSelectDate(todayIST)}
              className="text-xs px-2.5 py-1.5 rounded-lg border border-hairline hover:bg-subtle text-ink-secondary font-medium transition-colors"
            >
              Jump to Today
            </button>
          )}

          {/* 30-Day Roadmap button */}
          <button
            onClick={onOpenRoadmap}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-hairline hover:bg-subtle text-ink-primary text-xs font-semibold transition-colors shadow-2xs"
          >
            <Calendar className="w-3.5 h-3.5 text-ink-secondary" />
            <span className="hidden sm:inline">30-Day Roadmap</span>
            <span className="sm:hidden">Roadmap</span>
          </button>

          {/* Settings button */}
          <button
            onClick={onOpenSettings}
            title="Accountability Settings"
            className="p-1.5 rounded-lg border border-hairline hover:bg-subtle text-ink-secondary hover:text-ink-primary transition-colors"
          >
            <Settings className="w-4 h-4" />
          </button>

          {/* PIN Lock */}
          {isPinProtected && onLockApp && (
            <button
              onClick={onLockApp}
              title="Lock Dashboard"
              className="p-1.5 rounded-lg border border-hairline hover:bg-subtle text-ink-secondary hover:text-ink-primary transition-colors"
            >
              <Lock className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
