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
  ExternalLink,
  HelpCircle,
  Key,
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
    mode?: string;
    previewUrl?: string;
    message?: string;
    hint?: string;
  } | null>(null);

  const [showSmtpGuide, setShowSmtpGuide] = useState(false);

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
          mode: data.mode,
          previewUrl: data.previewUrl,
          message: data.message || "Test email processed successfully!",
          hint: data.hint,
        });
      } else {
        setSmtpStatus({
          success: false,
          message: data.error || "Failed to dispatch test email.",
          hint: data.hint,
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
              Defaulted to Asia/Kolkata (Evening Audit Cron at 9:00 PM IST).
            </span>
          </div>

          {/* SMTP TEST & SETUP SECTION */}
          <div className="pt-3 border-t border-hairline">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold text-ink-muted uppercase tracking-wider">
                SMTP Email Verification
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
                    <span>Verifying...</span>
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
                className={`p-3.5 rounded-xl text-xs space-y-2 ${
                  smtpStatus.success
                    ? "bg-emerald-50 border border-emerald-200 text-emerald-900"
                    : "bg-rose-50 border border-rose-200 text-rose-900"
                }`}
              >
                <div className="flex items-start gap-2">
                  {smtpStatus.success ? (
                    <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-600" />
                  ) : (
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
                  )}
                  <div>
                    <span className="font-semibold">{smtpStatus.message}</span>
                    {smtpStatus.hint && (
                      <p className="mt-1 text-[11px] opacity-90">{smtpStatus.hint}</p>
                    )}
                  </div>
                </div>

                {smtpStatus.previewUrl && (
                  <div className="pt-1">
                    <a
                      href={smtpStatus.previewUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs transition-colors"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>Open Ethereal Email Preview &rarr;</span>
                    </a>
                  </div>
                )}
              </div>
            )}

            {/* EXPANDABLE GMAIL SETUP INSTRUCTIONS */}
            <div className="mt-2.5">
              <button
                type="button"
                onClick={() => setShowSmtpGuide((prev) => !prev)}
                className="text-[11px] text-ink-muted hover:text-ink-primary flex items-center gap-1 font-medium transition-colors"
              >
                <HelpCircle className="w-3.5 h-3.5" />
                <span>How to set up Gmail 16-character App Password?</span>
              </button>

              {showSmtpGuide && (
                <div className="mt-2 p-3.5 rounded-xl bg-subtle text-[11px] text-ink-secondary space-y-2 border border-hairline">
                  <div className="font-bold text-ink-primary flex items-center gap-1">
                    <Key className="w-3.5 h-3.5 text-amber-600" />
                    <span>Quick Gmail SMTP Setup (2 minutes):</span>
                  </div>
                  <ol className="list-decimal pl-4 space-y-1.5 leading-relaxed">
                    <li>
                      Go to{" "}
                      <a
                        href="https://myaccount.google.com/security"
                        target="_blank"
                        rel="noreferrer"
                        className="underline text-ink-primary font-semibold"
                      >
                        Google Account &rarr; Security
                      </a>{" "}
                      and enable <strong>2-Step Verification</strong>.
                    </li>
                    <li>
                      Go to{" "}
                      <a
                        href="https://myaccount.google.com/apppasswords"
                        target="_blank"
                        rel="noreferrer"
                        className="underline text-ink-primary font-semibold"
                      >
                        myaccount.google.com/apppasswords
                      </a>
                      .
                    </li>
                    <li>
                      Enter <strong>Career Tracker</strong> as app name and click <strong>Create</strong>.
                    </li>
                    <li>
                      Copy the <strong>16-character code</strong> (without spaces) and paste it into your local <code className="bg-white px-1 py-0.5 rounded border font-mono">.env</code>:
                      <pre className="mt-1 p-2 rounded bg-white font-mono text-[10px] text-ink-primary border">
                        SMTP_USER=&quot;your-gmail@gmail.com&quot;&#10;SMTP_PASS=&quot;abcd efgh ijkl mnop&quot;
                      </pre>
                    </li>
                  </ol>
                </div>
              )}
            </div>
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
