"use client";

import React from "react";
import { Sparkles, Settings, Sun, Moon, Lock, Unlock } from "lucide-react";
import { formatFullDate } from "@/lib/dateUtils";

interface HeaderProps {
  userName: string;
  targetRole: string;
  todayIST: string;
  isDark: boolean;
  onToggleTheme: () => void;
  onOpenSettings: () => void;
  isPinProtected: boolean;
  onLockApp?: () => void;
}

export function Header({
  userName,
  targetRole,
  todayIST,
  isDark,
  onToggleTheme,
  onOpenSettings,
  isPinProtected,
  onLockApp,
}: HeaderProps) {
  return (
    <header className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-800/80 pb-5">
      <div>
        <div className="flex items-center gap-2 mb-1.5">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            <Sparkles className="w-3.5 h-3.5" />
            Target: {targetRole}
          </span>
          <span className="text-xs text-slate-400 font-mono">
            IST (UTC+5:30)
          </span>
        </div>
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white flex items-center gap-2">
          <span>{userName}&apos;s Career Shift</span>
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
          {formatFullDate(todayIST)}
        </p>
      </div>

      <div className="flex items-center gap-2 self-end sm:self-center">
        {isPinProtected && onLockApp && (
          <button
            onClick={onLockApp}
            title="Lock Dashboard (PIN Gate)"
            className="p-2 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 transition-colors border border-slate-800"
          >
            <Lock className="w-4 h-4" />
          </button>
        )}
        <button
          onClick={onToggleTheme}
          title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
          className="p-2 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 transition-colors border border-slate-800"
        >
          {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>
        <button
          onClick={onOpenSettings}
          title="Accountability Settings"
          className="p-2 rounded-lg text-slate-400 hover:text-indigo-400 hover:bg-slate-800/60 transition-colors border border-slate-800 flex items-center gap-1.5 text-xs font-medium"
        >
          <Settings className="w-4 h-4" />
          <span className="hidden sm:inline">Settings</span>
        </button>
      </div>
    </header>
  );
}
