"use client";

import React, { useState } from "react";
import {
  X,
  Calendar,
  Save,
  Wand2,
  FileText,
  CheckCircle2,
  Sparkles,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { addDaysToDate, formatDateDisplay } from "@/lib/dateUtils";

interface RoadmapPlannerDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  currentStartDate: string;
  onSaveRoadmap: (
    startDate: string,
    days: Array<{
      date: string;
      dayNumber: number;
      coreGoal: string;
      subTasks: string[];
    }>
  ) => Promise<void>;
}

// 30-Day curated Full-Stack transition syllabus
const DEFAULT_30_DAY_SYLLABUS = [
  { goal: "Advanced TypeScript Types & Generics", tasks: ["Conditional types", "Utility types deep dive", "Solve 5 Type-Gymnastics challenges"] },
  { goal: "Next.js 14 App Router Architecture", tasks: ["Server vs Client components", "Streaming & Suspense", "Build parallel routes demo"] },
  { goal: "Server Actions & Form Mutations", tasks: ["Zod schema validation", "Optimistic UI with useOptimistic", "Error boundaries"] },
  { goal: "Relational Modeling with PostgreSQL & Prisma", tasks: ["Schema migrations", "Indexes & foreign keys", "Many-to-many relationships"] },
  { goal: "MongoDB Document Schema & Aggregation Pipelines", tasks: ["Indexes & compound indexes", "$match, $group, $lookup", "Atlas search setup"] },
  { goal: "Full-Stack Authentication & RBAC", tasks: ["Session vs JWT", "NextAuth / Lucia Auth", "Middleware route protection"] },
  { goal: "REST & RPC API Design (tRPC / Next API)", tasks: ["Clean contract typing", "Rate limiting with Upstash", "OpenAPI spec generation"] },
  { goal: "State Management in Modern React", tasks: ["Zustand store architecture", "React Query cache invalidation", "Persistent client state"] },
  { goal: "Tailwind CSS Design Systems & Tokens", tasks: ["CVA component variants", "Accessible radix primitives", "Dark mode token hierarchy"] },
  { goal: "Unit & Integration Testing with Vitest", tasks: ["Component testing with React Testing Library", "Mocking API handlers with MSW", "Achieve 80% coverage on core logic"] },
  { goal: "End-to-End Testing with Playwright", tasks: ["Auth session reuse", "Flaky test prevention", "Cross-browser mobile viewport matrix"] },
  { goal: "Docker Containerization & Multi-Stage Builds", tasks: ["Alpine minimal base image", "Docker compose local dev environment", "Environment variable injection"] },
  { goal: "CI/CD Pipeline with GitHub Actions", tasks: ["Lint & typecheck automated step", "Vercel preview branch deployment", "Automated Playwright smoke tests"] },
  { goal: "Database Performance & Query Optimization", tasks: ["N+1 query detection", "Prisma query logging", "Database connection pooling on serverless"] },
  { goal: "Caching Strategies (Redis & HTTP Headers)", tasks: ["Stale-While-Revalidate headers", "Redis KV caching for hot queries", "Cache tagging in Next.js"] },
  { goal: "System Design: Scalable URL Shortener", tasks: ["Capacity estimation (QPS, storage)", "Hashing vs Base62 ID generator", "High-concurrency read replica topology"] },
  { goal: "System Design: Real-Time Chat & WebSockets", tasks: ["Socket.io / WS architecture", "Redis Pub/Sub message broker", "Offline queue & message persistence"] },
  { goal: "Microservices & Message Queues (Kafka/RabbitMQ)", tasks: ["Event-driven architecture fundamentals", "Idempotent event consumers", "Dead letter queue patterns"] },
  { goal: "Cloud Infrastructure Fundamentals (AWS/GCP)", tasks: ["S3 bucket presigned upload URLs", "CloudFront CDN edge caching", "IAM role principle of least privilege"] },
  { goal: "Web Security & OWASP Top 10", tasks: ["CSRF & XSS prevention", "SQL/NoSQL injection mitigations", "Content Security Policy (CSP) headers"] },
  { goal: "Web Performance & Core Web Vitals", tasks: ["Largest Contentful Paint (LCP) debugging", "Bundle size optimization with @next/bundle-analyzer", "Font & Image CDN optimization"] },
  { goal: "Full-Stack Capstone Project: Architecture & Setup", tasks: ["Monorepo or clean repo init", "Prisma schema & database provisioning", "Core auth flow implementation"] },
  { goal: "Full-Stack Capstone: Core Feature Execution", tasks: ["Primary business logic implementation", "Real-time updates / webhook listener", "Optimistic responsive UI"] },
  { goal: "Full-Stack Capstone: Polish & Production Hardening", tasks: ["Sentry error monitoring integration", "Mobile responsive polish", "SEO metadata & OpenGraph dynamic images"] },
  { goal: "Production Deployment & Live Smoke Testing", tasks: ["Custom domain & SSL certificate", "Vercel / Railway production deployment", "Live end-to-end user sanity checks"] },
  { goal: "Resume & Portfolio Redesign for Target Role", tasks: ["Impact-driven bullet points (XYZ formula)", "Deploy live portfolio with project showcase", "Link GitHub repos with clean READMEs"] },
  { goal: "Data Structures: Top 10 LeetCode Patterns", tasks: ["Two Pointers & Sliding Window", "DFS / BFS Tree traversal", "Top K frequent elements / Heap"] },
  { goal: "System Design Mock Interview Practice", tasks: ["Live whiteboard walkthrough of E-Commerce cart", "Tradeoff analysis (CAP theorem)", "Database partitioning & sharding"] },
  { goal: "Behavioral & Technical Leadership Stories", tasks: ["Write 5 STAR method stories", "Overcoming production outages", "Handling technical disagreements"] },
  { goal: "Sprint Retrospective & Job Application Launch", tasks: ["Review 30-day streak & metrics", "Submit 10 targeted engineering applications", "Schedule networking coffee chats"] },
];

export function RoadmapPlannerDrawer({
  isOpen,
  onClose,
  currentStartDate,
  onSaveRoadmap,
}: RoadmapPlannerDrawerProps) {
  const [startDate, setStartDate] = useState(currentStartDate);
  const [planDays, setPlanDays] = useState<
    Array<{ dayNumber: number; coreGoal: string; subTasks: string }>
  >(() => {
    return Array.from({ length: 30 }, (_, i) => ({
      dayNumber: i + 1,
      coreGoal: "",
      subTasks: "",
    }));
  });

  const [expandedDay, setExpandedDay] = useState<number | null>(1);
  const [isSaving, setIsSaving] = useState(false);
  const [pasteModalOpen, setPasteModalOpen] = useState(false);
  const [pastedText, setPastedText] = useState("");

  if (!isOpen) return null;

  const handleLoadCuratedSyllabus = () => {
    const updated = planDays.map((d, idx) => {
      const template = DEFAULT_30_DAY_SYLLABUS[idx];
      return {
        ...d,
        coreGoal: template ? template.goal : "",
        subTasks: template ? template.tasks.join(", ") : "",
      };
    });
    setPlanDays(updated);
  };

  const handleParsePastedSyllabus = () => {
    const lines = pastedText.split("\n").filter((l) => l.trim().length > 0);
    const updated = [...planDays];

    lines.slice(0, 30).forEach((line, idx) => {
      // Split by colon or dash
      const parts = line.replace(/^Day\s*\d+[\s:\.\-]*/i, "").split(/[-–—:]/);
      const coreGoal = parts[0]?.trim() || line.trim();
      const subTasks = parts.slice(1).join(", ").trim();

      updated[idx] = {
        dayNumber: idx + 1,
        coreGoal,
        subTasks,
      };
    });

    setPlanDays(updated);
    setPasteModalOpen(false);
    setPastedText("");
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const payload = planDays.map((d) => {
        const date = addDaysToDate(startDate, d.dayNumber - 1);
        const tasks = d.subTasks
          .split(/[,;\n]/)
          .map((t) => t.trim())
          .filter(Boolean);
        return {
          date,
          dayNumber: d.dayNumber,
          coreGoal: d.coreGoal,
          subTasks: tasks,
        };
      });

      await onSaveRoadmap(startDate, payload);
      onClose();
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-end bg-black/40 backdrop-blur-xs animate-fade-in">
      <div className="w-full max-w-2xl h-full bg-white border-l border-hairline shadow-2xl flex flex-col justify-between">
        {/* TOP BAR */}
        <div className="p-6 border-b border-hairline flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-subtle text-ink-primary border border-hairline">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-ink-primary">
                30-Day Batch Roadmap Planner
              </h2>
              <p className="text-xs text-ink-muted">
                Pre-plan every day&apos;s Core Goal & sub-tasks upfront.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg border border-hairline hover:bg-subtle text-ink-muted hover:text-ink-primary transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* MIDDLE CONTENT: CONFIG & DAYS LIST */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Start Date & Quick Actions */}
          <div className="p-4 rounded-xl bg-subtle/70 border border-hairline flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <label className="block text-[11px] font-bold text-ink-muted uppercase tracking-wider mb-1">
                Sprint Start Date (Day 1)
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="bg-white border border-hairline rounded-lg px-3 py-1.5 text-xs text-ink-primary font-mono focus:outline-none focus:border-obsidian"
              />
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleLoadCuratedSyllabus}
                className="px-3 py-1.5 rounded-lg bg-white border border-hairline hover:bg-white/80 text-xs font-semibold text-ink-primary flex items-center gap-1.5 shadow-2xs"
              >
                <Wand2 className="w-3.5 h-3.5 text-amber-600" />
                <span>Load 30-Day Syllabus</span>
              </button>
              <button
                type="button"
                onClick={() => setPasteModalOpen(true)}
                className="px-3 py-1.5 rounded-lg bg-white border border-hairline hover:bg-white/80 text-xs font-semibold text-ink-secondary flex items-center gap-1.5"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Paste Text</span>
              </button>
            </div>
          </div>

          {/* PASTE MODAL */}
          {pasteModalOpen && (
            <div className="p-4 rounded-xl bg-white border border-obsidian/30 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-ink-primary">
                  Paste 30-Day Syllabus (1 line per day)
                </span>
                <button
                  onClick={() => setPasteModalOpen(false)}
                  className="text-xs text-ink-muted hover:text-ink-primary"
                >
                  Cancel
                </button>
              </div>
              <textarea
                rows={6}
                value={pastedText}
                onChange={(e) => setPastedText(e.target.value)}
                placeholder="Day 1: Advanced TypeScript - Generics, Utility Types&#10;Day 2: Next.js 14 App Router Architecture - Server Actions&#10;Day 3: PostgreSQL Modeling..."
                className="w-full bg-subtle border border-hairline rounded-lg p-3 text-xs font-mono text-ink-primary focus:outline-none focus:border-obsidian"
              />
              <button
                type="button"
                onClick={handleParsePastedSyllabus}
                className="px-4 py-2 bg-obsidian text-white rounded-lg text-xs font-semibold"
              >
                Apply to 30 Days
              </button>
            </div>
          )}

          {/* DAY BY DAY LIST */}
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs text-ink-muted pb-1 border-b border-hairline">
              <span className="font-bold uppercase tracking-wider text-[11px]">
                Schedule Days 1 through 30
              </span>
              <span>30 Days Configured</span>
            </div>

            {planDays.map((day) => {
              const dateStr = addDaysToDate(startDate, day.dayNumber - 1);
              const isExpanded = expandedDay === day.dayNumber;

              return (
                <div
                  key={day.dayNumber}
                  className="rounded-xl border border-hairline bg-white overflow-hidden transition-all"
                >
                  {/* Summary Bar */}
                  <div
                    onClick={() =>
                      setExpandedDay(isExpanded ? null : day.dayNumber)
                    }
                    className="p-3.5 flex items-center justify-between cursor-pointer hover:bg-subtle/50 transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="px-2 py-0.5 rounded-md bg-subtle text-ink-primary font-mono text-xs font-bold shrink-0">
                        Day {day.dayNumber}
                      </span>
                      <span className="text-xs font-mono text-ink-muted shrink-0">
                        {formatDateDisplay(dateStr)}
                      </span>
                      <span className="text-xs font-medium text-ink-primary truncate">
                        {day.coreGoal || (
                          <span className="text-ink-muted italic">
                            No goal set yet
                          </span>
                        )}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-ink-muted">
                      {isExpanded ? (
                        <ChevronUp className="w-4 h-4" />
                      ) : (
                        <ChevronDown className="w-4 h-4" />
                      )}
                    </div>
                  </div>

                  {/* Expanded Edit Form */}
                  {isExpanded && (
                    <div className="p-4 pt-1 border-t border-hairline bg-subtle/30 space-y-3">
                      <div>
                        <label className="block text-[10px] font-bold text-ink-muted uppercase tracking-wider mb-1">
                          #1 Mandatory Core Goal
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. Master React Server Components & Streaming"
                          value={day.coreGoal}
                          onChange={(e) => {
                            const updated = [...planDays];
                            updated[day.dayNumber - 1].coreGoal = e.target.value;
                            setPlanDays(updated);
                          }}
                          className="w-full bg-white border border-hairline rounded-lg p-2.5 text-xs text-ink-primary focus:outline-none focus:border-obsidian"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-ink-muted uppercase tracking-wider mb-1">
                          Supporting Sub-Tasks (comma or newline separated)
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. Read docs, Build suspense demo, Write 3 tests"
                          value={day.subTasks}
                          onChange={(e) => {
                            const updated = [...planDays];
                            updated[day.dayNumber - 1].subTasks = e.target.value;
                            setPlanDays(updated);
                          }}
                          className="w-full bg-white border border-hairline rounded-lg p-2.5 text-xs text-ink-primary focus:outline-none focus:border-obsidian"
                        />
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* BOTTOM SAVE BAR */}
        <div className="p-5 border-t border-hairline bg-white flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 text-xs font-semibold text-ink-secondary hover:text-ink-primary transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            className="px-6 py-2.5 rounded-xl bg-obsidian hover:bg-ink-secondary text-white text-xs font-semibold flex items-center gap-2 transition-colors disabled:opacity-50 shadow-xs"
          >
            <Save className="w-4 h-4" />
            <span>{isSaving ? "Saving Roadmap..." : "Save 30-Day Plan"}</span>
          </button>
        </div>
      </div>
    </div>
  );
}

