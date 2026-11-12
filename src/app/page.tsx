"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Header } from "@/components/Header";
import { ExecutionCanvas } from "@/components/ExecutionCanvas";
import { TelemetryRail } from "@/components/TelemetryRail";
import { RoadmapPlannerDrawer } from "@/components/RoadmapPlannerDrawer";
import { SkipModal } from "@/components/SkipModal";
import { SettingsModal } from "@/components/SettingsModal";
import { PinModal } from "@/components/PinModal";
import { UserSettingsType, DailyLogType, DayStatus } from "@/lib/db";
import { addDaysToDate, getDayNumber } from "@/lib/dateUtils";
import { Loader2, AlertCircle } from "lucide-react";

interface DashboardData {
  userSettings: UserSettingsType;
  todayIST: string;
  selectedDate: string;
  selectedLog: DailyLogType;
  todayLog: DailyLogType;
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
  pinRequired: boolean;
  authenticated: boolean;
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Active viewing date
  const [currentDate, setCurrentDate] = useState<string>("");

  // Modals & Drawers
  const [isRoadmapOpen, setIsRoadmapOpen] = useState(false);
  const [isSkipModalOpen, setIsSkipModalOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isStartingPractice, setIsStartingPractice] = useState(false);
  const [isCompletingPractice, setIsCompletingPractice] = useState(false);

  // Load dashboard data for a given date
  const loadDashboard = useCallback(async (targetDate?: string) => {
    try {
      setError(null);
      const url = targetDate
        ? `/api/dashboard?date=${targetDate}`
        : "/api/dashboard";
      const res = await fetch(url, { cache: "no-store" });
      if (!res.ok) {
        throw new Error("Failed to load dashboard data");
      }
      const json: DashboardData = await res.json();
      setData(json);
      if (!targetDate) {
        setCurrentDate(json.todayIST);
      } else {
        setCurrentDate(targetDate);
      }
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

  // Date switching handlers
  const handleSelectDate = (date: string) => {
    setCurrentDate(date);
    loadDashboard(date);
  };

  const handlePrevDate = () => {
    const prev = addDaysToDate(currentDate || data?.todayIST || "", -1);
    handleSelectDate(prev);
  };

  const handleNextDate = () => {
    const next = addDaysToDate(currentDate || data?.todayIST || "", 1);
    handleSelectDate(next);
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

      // Reload dashboard state
      await loadDashboard(currentDate);
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

      await loadDashboard(currentDate);
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

    await loadDashboard(currentDate);
  };

  // Todo actions
  const handleAddTodo = async (title: string, isCoreGoal: boolean, date: string) => {
    const res = await fetch("/api/todos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, isCoreGoal, date }),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || "Failed to add task");

    await loadDashboard(currentDate);
  };

  const handleToggleTodo = async (id: string, isCompleted: boolean) => {
    // Optimistic update
    if (data) {
      const updatedTodos = data.selectedLog.todos.map((t) =>
        t.id === id ? { ...t, isCompleted } : t
      );
      setData({
        ...data,
        selectedLog: { ...data.selectedLog, todos: updatedTodos },
      });
    }

    try {
      const res = await fetch(`/api/todos/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isCompleted }),
      });
      if (!res.ok) {
        await loadDashboard(currentDate);
      }
    } catch {
      await loadDashboard(currentDate);
    }
  };

  const handleDeleteTodo = async (id: string) => {
    if (data) {
      const updatedTodos = data.selectedLog.todos.filter((t) => t.id !== id);
      setData({
        ...data,
        selectedLog: { ...data.selectedLog, todos: updatedTodos },
      });
    }

    try {
      await fetch(`/api/todos/${id}`, { method: "DELETE" });
    } catch {
      await loadDashboard(currentDate);
    }
  };

  // Save 30-Day Batch Roadmap
  const handleSaveRoadmap = async (
    startDate: string,
    days: Array<{
      date: string;
      dayNumber: number;
      coreGoal: string;
      subTasks: string[];
    }>
  ) => {
    const res = await fetch("/api/roadmap/batch", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ startDate, days }),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || "Failed to save roadmap batch");

    await loadDashboard(currentDate);
  };

  const handleSaveSettings = async (updated: Partial<UserSettingsType>) => {
    const res = await fetch("/api/settings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updated),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || "Failed to update settings");

    await loadDashboard(currentDate);
  };

  // LOADING STATE
  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center p-4 bg-canvas">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-obsidian animate-spin" />
          <p className="text-xs font-mono text-ink-muted">
            Initializing 30-Day Career Shift Engine...
          </p>
        </div>
      </main>
    );
  }

  // ERROR STATE
  if (error || !data) {
    return (
      <main className="min-h-screen flex items-center justify-center p-4 bg-canvas">
        <div className="max-w-md w-full p-6 rounded-2xl bg-white border border-hairline text-center shadow-xs">
          <AlertCircle className="w-8 h-8 text-rose-600 mx-auto mb-3" />
          <h2 className="text-base font-bold text-ink-primary mb-2">
            Failed to load dashboard
          </h2>
          <p className="text-xs text-ink-muted mb-4">{error}</p>
          <button
            onClick={() => loadDashboard()}
            className="px-4 py-2 bg-obsidian text-white rounded-xl text-xs font-semibold hover:bg-ink-secondary transition-colors"
          >
            Retry Connection
          </button>
        </div>
      </main>
    );
  }

  const {
    userSettings,
    todayIST,
    selectedLog,
    todayLog,
    roadmapDates,
    history30Days,
    pinRequired,
    authenticated,
  } = data;

  const showPinGate = pinRequired && !authenticated;
  const planStart = userSettings.planStartDate || todayIST;
  const currentDayNumber = getDayNumber(currentDate, planStart);
  const validDayNumber =
    currentDayNumber >= 1 && currentDayNumber <= 30 ? currentDayNumber : null;

  return (
    <div className="min-h-screen bg-canvas text-ink-primary flex flex-col font-sans selection:bg-obsidian selection:text-white">
      {/* PIN GATE OVERLAY */}
      <PinModal
        isOpen={showPinGate}
        onAuthenticated={() => {
          loadDashboard(currentDate);
        }}
      />

      {/* TOP MINIMALIST HEADER BAR */}
      <Header
        userName={userSettings.userName}
        targetRole={userSettings.targetCareerRole}
        selectedDate={currentDate}
        todayIST={todayIST}
        onSelectDate={handleSelectDate}
        onPrevDate={handlePrevDate}
        onNextDate={handleNextDate}
        onOpenRoadmap={() => setIsRoadmapOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        isPinProtected={pinRequired}
        onLockApp={handleLockApp}
      />

      {/* ASYMMETRIC 65 / 35 SPLIT WORKSPACE */}
      <main className="flex-1 w-full max-w-7xl mx-auto p-4 sm:p-8 flex flex-col lg:flex-row gap-6 items-start">
        {/* LEFT EXECUTION CANVAS (65% Width) */}
        <div className="w-full lg:flex-[65] self-stretch flex">
          <ExecutionCanvas
            selectedLog={selectedLog}
            selectedDate={currentDate}
            todayIST={todayIST}
            dayNumber={validDayNumber}
            onAddTodo={handleAddTodo}
            onToggleTodo={handleToggleTodo}
            onDeleteTodo={handleDeleteTodo}
            onCompletePractice={handleCompletePractice}
            onOpenSkipModal={() => setIsSkipModalOpen(true)}
            isCompleting={isCompletingPractice}
          />
        </div>

        {/* RIGHT TELEMETRY RAIL (35% Width) */}
        <div className="w-full lg:flex-[35]">
          <TelemetryRail
            currentStreak={userSettings.currentStreak}
            longestStreak={userSettings.longestStreak}
            todayLog={todayLog}
            selectedDate={currentDate}
            todayIST={todayIST}
            planStartDate={planStart}
            roadmapDates={roadmapDates}
            history30Days={history30Days}
            onSelectDate={handleSelectDate}
            onStartPractice={handleStartPractice}
            isStarting={isStartingPractice}
          />
        </div>
      </main>

      {/* FOOTER */}
      <footer className="w-full border-t border-hairline py-4 px-6 text-center text-xs text-ink-muted">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>
            Career Shift Tracker (v2 Roadmap Edition) &bull; Linear/Geist Editorial Architecture
          </span>
          <span className="font-mono text-[11px]">
            IST Engine (UTC+5:30) &bull; Next.js 14 & Prisma MongoDB
          </span>
        </div>
      </footer>

      {/* 30-DAY BATCH ROADMAP PLANNER DRAWER */}
      <RoadmapPlannerDrawer
        isOpen={isRoadmapOpen}
        onClose={() => setIsRoadmapOpen(false)}
        currentStartDate={planStart}
        onSaveRoadmap={handleSaveRoadmap}
      />

      {/* INTENTIONAL SKIP FRICTION MODAL */}
      <SkipModal
        isOpen={isSkipModalOpen}
        onClose={() => setIsSkipModalOpen(false)}
        onSubmit={handleSkipPractice}
        currentStreak={userSettings.currentStreak}
        partnerEmail={userSettings.partnerEmail}
      />

      {/* SETTINGS MODAL */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={userSettings}
        onSaveSettings={handleSaveSettings}
      />
    </div>
  );
}
