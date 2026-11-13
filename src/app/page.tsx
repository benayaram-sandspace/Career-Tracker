"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Header } from "@/components/Header";
import { ExecutionCanvas } from "@/components/ExecutionCanvas";
import { TelemetryRail } from "@/components/TelemetryRail";
import { RoadmapPlannerDrawer } from "@/components/RoadmapPlannerDrawer";
import { SkipModal } from "@/components/SkipModal";
import { SettingsModal } from "@/components/SettingsModal";
import { LoginPage } from "@/components/LoginPage";
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
  const [isUndoingPractice, setIsUndoingPractice] = useState(false);

  // Authenticated fetch wrapper supporting headers and credentials
  const authFetch = useCallback(
    (url: string, init?: RequestInit, pinOverride?: string) => {
      const headers = new Headers(init?.headers);
      if (!headers.has("Content-Type") && init?.body && typeof init.body === "string") {
        headers.set("Content-Type", "application/json");
      }
      const pin =
        pinOverride ||
        (typeof window !== "undefined"
          ? localStorage.getItem("career_tracker_pin") || ""
          : "");
      if (pin) {
        headers.set("x-app-pin", pin);
      }
      return fetch(url, {
        ...init,
        headers,
        credentials: "include",
      });
    },
    []
  );

  // Load dashboard data for a given date
  const loadDashboard = useCallback(
    async (targetDate?: string, pinOverride?: string) => {
      try {
        setError(null);
        const url = targetDate
          ? `/api/dashboard?date=${targetDate}`
          : "/api/dashboard";
        const res = await authFetch(url, { cache: "no-store" }, pinOverride);
        if (!res.ok) {
          throw new Error("Failed to load dashboard data");
        }
        const json: DashboardData = await res.json();
        setData(json);
        try {
          if (typeof window !== "undefined") {
            sessionStorage.setItem("career_tracker_dash_cache", JSON.stringify(json));
          }
        } catch {
          // ignore session storage quota
        }
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
    },
    [authFetch]
  );

  useEffect(() => {
    // Instant paint from session cache if available
    try {
      if (typeof window !== "undefined") {
        const cached = sessionStorage.getItem("career_tracker_dash_cache");
        if (cached) {
          const parsed = JSON.parse(cached);
          setData(parsed);
          setCurrentDate(parsed.selectedDate || parsed.todayIST);
          setLoading(false);
        }
      }
    } catch {
      // ignore
    }

    const savedPin =
      typeof window !== "undefined"
        ? localStorage.getItem("career_tracker_pin") || undefined
        : undefined;
    loadDashboard(undefined, savedPin);
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
    if (typeof window !== "undefined") {
      localStorage.removeItem("career_tracker_pin");
    }
    await authFetch("/api/auth/logout", { method: "POST" });
    if (data) {
      setData({ ...data, authenticated: false });
    }
  };

  // Practice session actions
  const handleStartPractice = async () => {
    setIsStartingPractice(true);
    try {
      const res = await authFetch("/api/practice/start", { method: "POST" });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to start practice");

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
      const res = await authFetch("/api/practice/complete", { method: "POST" });
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
    const res = await authFetch("/api/practice/skip", {
      method: "POST",
      body: JSON.stringify({ reason }),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || "Failed to skip practice");

    await loadDashboard(currentDate);
  };

  // Undo Practice status & streak
  const handleUndoPractice = async () => {
    setIsUndoingPractice(true);
    try {
      const res = await authFetch("/api/practice/undo", {
        method: "POST",
        body: JSON.stringify({ date: currentDate }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to undo practice status");

      await loadDashboard(currentDate);
    } catch (err: any) {
      alert(err.message || "Could not undo practice");
    } finally {
      setIsUndoingPractice(false);
    }
  };

  // Todo actions
  const handleAddTodo = async (title: string, isCoreGoal: boolean, date: string) => {
    const res = await authFetch("/api/todos", {
      method: "POST",
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
      const res = await authFetch(`/api/todos/${id}`, {
        method: "PATCH",
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
      await authFetch(`/api/todos/${id}`, { method: "DELETE" });
    } catch {
      await loadDashboard(currentDate);
    }
  };

  // Save 30-Day Batch Roadmap with Instant Optimistic UI
  const handleSaveRoadmap = async (
    startDate: string,
    days: Array<{
      date: string;
      dayNumber: number;
      coreGoal: string;
      subTasks: string[];
    }>
  ) => {
    // Optimistically update local state immediately so user experiences zero lag
    if (data) {
      const updatedHistory = { ...data.history30Days };
      days.forEach((d) => {
        const existing = updatedHistory[d.date];
        updatedHistory[d.date] = {
          dayNumber: d.dayNumber,
          status: existing?.status || "PENDING",
          skipReason: existing?.skipReason || null,
          coreGoal: d.coreGoal,
          totalTasks: (d.coreGoal ? 1 : 0) + (d.subTasks?.length || 0),
          completedTasks: existing?.completedTasks || 0,
        };
      });

      let updatedSelectedLog = data.selectedLog;
      const matchingDay = days.find((d) => d.date === currentDate);
      if (matchingDay) {
        const todos = [
          ...(matchingDay.coreGoal
            ? [
                {
                  id: `opt-core-${Date.now()}`,
                  dailyLogId: data.selectedLog.id,
                  title: matchingDay.coreGoal,
                  isCoreGoal: true,
                  isCompleted: false,
                  order: 0,
                  createdAt: new Date(),
                },
              ]
            : []),
          ...(matchingDay.subTasks || []).map((sub, idx) => ({
            id: `opt-sub-${Date.now()}-${idx}`,
            dailyLogId: data.selectedLog.id,
            title: sub,
            isCoreGoal: false,
            isCompleted: false,
            order: idx + 1,
            createdAt: new Date(),
          })),
        ];
        updatedSelectedLog = {
          ...data.selectedLog,
          dayNumber: matchingDay.dayNumber,
          todos,
        };
      }

      setData({
        ...data,
        userSettings: {
          ...data.userSettings,
          planStartDate: startDate,
        },
        selectedLog: updatedSelectedLog,
        history30Days: updatedHistory,
      });
    }

    try {
      const res = await authFetch("/api/roadmap/batch", {
        method: "POST",
        body: JSON.stringify({ startDate, days }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to save roadmap batch");

      // Background revalidation
      await loadDashboard(currentDate);
    } catch (err: any) {
      console.error(err);
      alert(err.message || "Failed to save roadmap batch");
      await loadDashboard(currentDate);
    }
  };

  const handleSaveSettings = async (updated: Partial<UserSettingsType>) => {
    const res = await authFetch("/api/settings", {
      method: "POST",
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

  // DEDICATED LOGIN SCREEN (Requested by user)
  if (showPinGate) {
    return (
      <LoginPage
        onAuthenticated={(verifiedPin: string) => {
          // 1. Immediately unlock dashboard in client state
          setData((prev) => (prev ? { ...prev, authenticated: true } : prev));
          // 2. Fetch fresh dashboard data with verified PIN header
          loadDashboard(currentDate, verifiedPin);
        }}
        expectedPinConfigured={pinRequired}
      />
    );
  }

  const planStart = userSettings.planStartDate || todayIST;
  const currentDayNumber = getDayNumber(currentDate, planStart);
  const validDayNumber =
    currentDayNumber >= 1 && currentDayNumber <= 30 ? currentDayNumber : null;

  return (
    <div className="min-h-screen bg-canvas text-ink-primary flex flex-col font-sans selection:bg-obsidian selection:text-white">
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
            onUndoPractice={handleUndoPractice}
            isCompleting={isCompletingPractice}
            isUndoing={isUndoingPractice}
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
            onUndoPractice={handleUndoPractice}
            isStarting={isStartingPractice}
            isUndoing={isUndoingPractice}
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
            IST Engine (UTC+5:30) &bull; 9 PM Evening Audit Cron &bull; Next.js 14
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
