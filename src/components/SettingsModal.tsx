"use client";

import React, { useState } from "react";
import {
  Settings,
  X,
  Mail,
  User,
  Briefcase,
  Globe,
  Send,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Calendar,
} from "lucide-react";
import { UserSettingsType } from "@/lib/db";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: UserSettingsType;
  onSaveSettings: (updated: Partial<UserSettingsType>) => Promise<void>;
}

export function SettingsModal({
  isOpen,
  onClose,
  settings,
  onSaveSettings,
}: SettingsModalProps) {
  const [userName, setUserName] = useState(settings.userName);
  const [userEmail, setUserEmail] = useState(settings.userEmail);
  const [partnerEmail, setPartnerEmail] = useState(settings.partnerEmail || "");
  const [targetRole, setTargetRole] = useState(settings.targetCareerRole);
  const [planStartDate, setPlanStartDate] = useState(
    settings.planStartDate || new Date().toISOString().split("T")[0]
  );
  const [timezone, setTimezone] = useState(settings.timezone || "Asia/Kolkata");

  const [isSaving, setIsSaving] = useState(false);
  const [isTestingSmtp, setIsTestingSmtp] = useState(false);
  const [smtpStatus, setSmtpStatus] = useState<{
    success?: boolean;
    message?: string;
  } | null>(null);

  if (!isOpen) return null;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await onSaveSettings({
        userName,
        userEmail,
        partnerEmail: partnerEmail.trim() || null,
        targetCareerRole: targetRole,
        planStartDate,
        timezone,
      });
      onClose();
    } finally {
      setIsSaving(false);
    }
  };

  const handleTestSmtp = async () => {
    setIsTestingSmtp(true);
    setSmtpStatus(null);
    try {
      const res = await fetch("/api/settings/test-email", { method: "POST" });
      const data = await res.json();
      if (res.ok && data.success) {
        setSmtpStatus({
          success: true,
          message: data.message || "Test email dispatched successfully!",
        });
      } else {
        setSmtpStatus({
          success: false,
          message:
            data.error ||
            data.hint ||
            "Failed to send test email. Check your SMTP credentials in .env.",
        });
      }
    } catch (err: any) {
      setSmtpStatus({
        success: false,
        message: err.message || "Network error while testing SMTP.",
      });
    } finally {
      setIsTestingSmtp(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-fade-in">
      <div className="relative w-full max-w-lg bg-white border border-hairline rounded-2xl p-6 sm:p-7 shadow-2xl max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 text-ink-muted hover:text-ink-primary rounded-lg hover:bg-subtle transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-3 mb-5 border-b border-hairline pb-4">
          <div className="p-2.5 rounded-xl bg-subtle text-ink-primary border border-hairline">
            <Settings className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-bold text-ink-primary">
              Accountability Settings
            </h3>
            <p className="text-xs text-ink-muted">
              Configure your career transition goals and notification alerts.
            </p>
          </div>
        </div>

        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-[11px] font-bold text-ink-muted uppercase tracking-wider mb-1 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-ink-muted" />
              Your Name
            </label>
            <input
              type="text"
              required
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              className="w-full bg-subtle border border-hairline rounded-xl p-2.5 text-xs sm:text-sm text-ink-primary focus:outline-none focus:border-obsidian"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-ink-muted uppercase tracking-wider mb-1 flex items-center gap-1.5">
              <Briefcase className="w-3.5 h-3.5 text-ink-muted" />
              Target Career Role
            </label>
            <input
              type="text"
              required
              value={targetRole}
              onChange={(e) => setTargetRole(e.target.value)}
              placeholder="e.g. Full-Stack Software Engineer"
              className="w-full bg-subtle border border-hairline rounded-xl p-2.5 text-xs sm:text-sm text-ink-primary focus:outline-none focus:border-obsidian"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-ink-muted uppercase tracking-wider mb-1 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-ink-muted" />
              Sprint Start Date (Day 1)
            </label>
            <input
              type="date"
              value={planStartDate}
              onChange={(e) => setPlanStartDate(e.target.value)}
              className="w-full bg-subtle border border-hairline rounded-xl p-2.5 text-xs sm:text-sm text-ink-primary font-mono focus:outline-none focus:border-obsidian"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-ink-muted uppercase tracking-wider mb-1 flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-ink-muted" />
              Your Email Address
            </label>
            <input
              type="email"
              required
              value={userEmail}
              onChange={(e) => setUserEmail(e.target.value)}
              className="w-full bg-subtle border border-hairline rounded-xl p-2.5 text-xs sm:text-sm text-ink-primary focus:outline-none focus:border-obsidian"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-ink-muted uppercase tracking-wider mb-1 flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-ink-muted" />
              Accountability Partner Email (Optional)
            </label>
            <input
              type="email"
              value={partnerEmail}
              onChange={(e) => setPartnerEmail(e.target.value)}
              placeholder="partner@example.com (will be CC'd on skips/misses)"
              className="w-full bg-subtle border border-hairline rounded-xl p-2.5 text-xs sm:text-sm text-ink-primary focus:outline-none focus:border-obsidian"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-ink-muted uppercase tracking-wider mb-1 flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-ink-muted" />
              Timezone
            </label>
            <input
              type="text"
              value={timezone}
              disabled
              className="w-full bg-subtle/50 border border-hairline rounded-xl p-2.5 text-xs text-ink-muted font-mono"
            />
            <span className="text-[10px] text-ink-muted mt-1 block">
              Defaulted to Asia/Kolkata (9 AM & 9 PM IST Cron).
            </span>
          </div>

          {/* SMTP TEST SECTION */}
          <div className="pt-3 border-t border-hairline">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold text-ink-muted uppercase tracking-wider">
                SMTP Delivery Verification
              </span>
              <button
                type="button"
                onClick={handleTestSmtp}
                disabled={isTestingSmtp}
                className="px-3 py-1.5 rounded-lg border border-hairline hover:bg-subtle text-xs font-semibold text-ink-primary flex items-center gap-1.5 transition-colors disabled:opacity-50"
              >
                {isTestingSmtp ? (
                  <>
                    <Loader2 className="w-3 h-3 animate-spin" />
                    <span>Testing...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-3 h-3" />
                    <span>Send Test Email</span>
                  </>
                )}
              </button>
            </div>

            {smtpStatus && (
              <div
                className={`p-3 rounded-xl text-xs flex items-start gap-2 ${
                  smtpStatus.success
                    ? "bg-emerald-50 border border-emerald-200 text-emerald-800"
                    : "bg-rose-50 border border-rose-200 text-rose-800"
                }`}
              >
                {smtpStatus.success ? (
                  <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-600" />
                ) : (
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
                )}
                <span>{smtpStatus.message}</span>
              </div>
            )}
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-hairline">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-ink-muted hover:text-ink-primary transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-5 py-2.5 rounded-xl bg-obsidian hover:bg-ink-secondary text-white text-xs font-semibold shadow-xs transition-all active:scale-[0.98] disabled:opacity-50"
            >
              {isSaving ? "Saving..." : "Save Settings"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
