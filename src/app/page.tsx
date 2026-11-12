"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Header } from "@/components/Header";
import { StreakCard } from "@/components/StreakCard";
import { PracticeCard } from "@/components/PracticeCard";
import { TodoList } from "@/components/TodoList";
import { ConsistencyStrip } from "@/components/ConsistencyStrip";
import { SkipModal } from "@/components/SkipModal";
import { SettingsModal } from "@/components/SettingsModal";
import { PinModal } from "@/components/PinModal";
import { UserSettingsType, DailyLogType, DayStatus } from "@/lib/db";
import { Loader2, AlertCircle } from "lucide-react";

interface DashboardData {
  userSettings: UserSettingsType;
  todayLog: DailyLogType;
  history30Days: Record<
    string,
    { status: DayStatus; skipReason?: string | null; durationMinutes?: number }
  >;
  todayIST: string;
  pinRequired: boolean;
  authenticated: boolean;
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modals & theme
  const [isSkipModalOpen, setIsSkipModalOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isDark, setIsDark] = useState(true);
  const [isStartingPractice, setIsStartingPractice] = useState(false);
  const [isCompletingPractice, setIsCompletingPractice] = useState(false);

  // Load dashboard data
  const loadDashboard = useCallback(async () => {
    try {
      setError(null);
      const res = await fetch("/api/dashboard", { cache: "no-store" });
      if (!res.ok) {
        throw new Error("Failed to load dashboard data");
      }
      const json: DashboardData = await res.json();
      setData(json);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "An unexpected error occurred loading data");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  // Theme toggle
  const toggleTheme = () => {
    setIsDark((prev) => {
      const next = !prev;
      if (next) {
        document.documentElement.classList.add("dark");
        document.documentElement.classList.remove("light");
      } else {
        document.documentElement.classList.remove("dark");
        document.documentElement.classList.add("light");
      }
      return next;
    });
  };

  // Lock Dashboard (logout PIN)
  const handleLockApp = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    if (data) {
      setData({ ...data, authenticated: false });
    }
  };

  // Practice session actions
  const handleStartPractice = async () => {
    setIsStartingPractice(true);
    try {
      const res = await fetch("/api/practice/start", { method: "POST" });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to start practice");

      // Optimistically update todayLog
      if (data) {
        setData({
          ...data,
          todayLog: {
            ...data.todayLog,
            startedAt: json.log.startedAt,
          },
        });
      }
    } catch (err: any) {
      alert(err.message || "Could not start practice");
    } finally {
      setIsStartingPractice(false);
    }
  };

  const handleCompletePractice = async () => {
    setIsCompletingPractice(true);
    try {
      const res = await fetch("/api/practice/complete", { method: "POST" });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to complete practice");

      // Refresh to get full updated streak & logs
      await loadDashboard();
    } catch (err: any) {
      alert(err.message || "Could not complete practice");
    } finally {
      setIsCompletingPractice(false);
    }
  };

  const handleSkipPractice = async (reason: string) => {
    const res = await fetch("/api/practice/skip", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reason }),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || "Failed to skip practice");

    await loadDashboard();
  };

  // Todo actions
  const handleAddTodo = async (title: string, isCoreGoal: boolean) => {
    const res = await fetch("/api/todos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, isCoreGoal }),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || "Failed to add task");

    await loadDashboard();
  };

  const handleToggleTodo = async (id: string, isCompleted: boolean) => {
    // Optimistic update
    if (data) {
      const updatedTodos = data.todayLog.todos.map((t) =>
        t.id === id ? { ...t, isCompleted } : t
      );
      setData({
        ...data,
        todayLog: { ...data.todayLog, todos: updatedTodos },
      });
    }

    try {
      const res = await fetch(`/api/todos/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isCompleted }),
      });
      if (!res.ok) {
        // Rollback
        await loadDashboard();
      }
    } catch {
      await loadDashboard();
    }
  };

  const handleDeleteTodo = async (id: string) => {
    // Optimistic delete
    if (data) {
      const updatedTodos = data.todayLog.todos.filter((t) => t.id !== id);
      setData({
        ...data,
        todayLog: { ...data.todayLog, todos: updatedTodos },
      });
    }

    try {
      await fetch(`/api/todos/${id}`, { method: "DELETE" });
    } catch {
      await loadDashboard();
    }
  };

  const handleSaveSettings = async (updated: Partial<UserSettingsType>) => {
    const res = await fetch("/api/settings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updated),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || "Failed to update settings");

    await loadDashboard();
  };

  // LOADING STATE
  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center p-4">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
          <p className="text-xs font-mono text-slate-400">
            Initializing Career Shift Tracker...
          </p>
        </div>
      </main>
    );
  }

  // ERROR STATE
  if (error || !data) {
    return (
      <main className="min-h-screen flex items-center justify-center p-4">
        <div className="max-w-md w-full p-6 rounded-xl bg-slate-900 border border-rose-500/30 text-center">
          <AlertCircle className="w-8 h-8 text-rose-500 mx-auto mb-3" />
          <h2 className="text-base font-bold text-white mb-2">
            Failed to load dashboard
          </h2>
          <p className="text-xs text-slate-400 mb-4">{error}</p>
          <button
            onClick={loadDashboard}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold"
          >
            Retry Connection
          </button>
        </div>
      </main>
    );
  }

  const { userSettings, todayLog, history30Days, todayIST, pinRequired, authenticated } = data;
  const showPinGate = pinRequired && !authenticated;

  const coreGoal = todayLog.todos?.find((t) => t.isCoreGoal);
  const isPracticeActive = todayLog.status === "PENDING" && Boolean(todayLog.startedAt);
  const isLocked = todayLog.status === "COMPLETED" || todayLog.status === "SKIPPED";

  // Compute last 30 dates array for consistency strip
  const dates30 = Object.keys(history30Days);

  return (
    <main className="min-h-screen py-8 px-4 sm:px-6">
      {/* PIN GATE OVERLAY */}
      <PinModal
        isOpen={showPinGate}
        onAuthenticated={() => {
          loadDashboard();
        }}
      />

      {/* SINGLE COLUMN FOCUSED CONTAINER (Max 720px) */}
      <div className="max-w-2xl mx-auto">
        {/* HEADER */}
        <Header
          userName={userSettings.userName}
          targetRole={userSettings.targetCareerRole}
          todayIST={todayIST}
          isDark={isDark}
          onToggleTheme={toggleTheme}
          onOpenSettings={() => setIsSettingsOpen(true)}
          isPinProtected={pinRequired}
          onLockApp={handleLockApp}
        />

        {/* STREAK & RECORD CARD */}
        <StreakCard
          currentStreak={userSettings.currentStreak}
          longestStreak={userSettings.longestStreak}
          status={todayLog.status}
          isSessionActive={isPracticeActive}
        />

        {/* PRACTICE EXECUTION CARD (States: Idle, Focus Mode, Completed, Skipped, Missed) */}
        <PracticeCard
          todayLog={todayLog}
          coreGoal={coreGoal}
          onStartPractice={handleStartPractice}
          onCompletePractice={handleCompletePractice}
          onOpenSkipModal={() => setIsSkipModalOpen(true)}
          isStarting={isStartingPractice}
          isCompleting={isCompletingPractice}
        />

        {/* DAILY TODO CHECKLIST & CORE GOAL */}
        <TodoList
          todos={todayLog.todos || []}
          onAddTodo={handleAddTodo}
          onToggleTodo={handleToggleTodo}
          onDeleteTodo={handleDeleteTodo}
          isLocked={isLocked}
        />

        {/* 30-DAY CONSISTENCY STRIP */}
        <ConsistencyStrip
          todayIST={todayIST}
          history={history30Days}
          dates={dates30}
        />

        {/* FOOTER */}
        <footer className="mt-8 pt-4 border-t border-slate-800/80 text-center text-xs text-slate-500">
          <p>
            Career Shift Tracker &bull; Distraction-Free Focused Architecture &bull; Next.js 14 & Prisma
          </p>
        </footer>
      </div>

      {/* MODALS */}
      <SkipModal
        isOpen={isSkipModalOpen}
        onClose={() => setIsSkipModalOpen(false)}
        onSubmit={handleSkipPractice}
        currentStreak={userSettings.currentStreak}
        partnerEmail={userSettings.partnerEmail}
      />

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={userSettings}
        onSaveSettings={handleSaveSettings}
      />
    </main>
  );
}
