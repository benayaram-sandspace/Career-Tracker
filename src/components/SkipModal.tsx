"use client";

import React, { useState } from "react";
import { AlertTriangle, Mail, X, ArrowRight } from "lucide-react";

interface SkipModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (reason: string) => Promise<void>;
  currentStreak: number;
  partnerEmail: string | null;
}

export function SkipModal({
  isOpen,
  onClose,
  onSubmit,
  currentStreak,
  partnerEmail,
}: SkipModalProps) {
  const [reason, setReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const minLength = 15;
  const currentLength = reason.trim().length;
  const isValid = currentLength >= minLength;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid) return;

    setError(null);
    setIsSubmitting(true);
    try {
      await onSubmit(reason.trim());
      setReason("");
      onClose();
    } catch (err: any) {
      setError(err.message || "Failed to submit skip reason.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-fade-in">
      <div className="relative w-full max-w-lg bg-white border border-hairline rounded-2xl p-6 sm:p-7 shadow-2xl">
        <button
          onClick={onClose}
          disabled={isSubmitting}
          className="absolute top-4 right-4 p-1.5 text-ink-muted hover:text-ink-primary rounded-lg hover:bg-subtle transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="p-2.5 rounded-xl bg-amber-50 text-amber-700 border border-amber-200">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-bold text-ink-primary">
              Intentional Skip Friction
            </h3>
            <span className="text-[11px] text-amber-700 font-semibold uppercase tracking-wider">
              Accountability Protocol
            </span>
          </div>
        </div>

        <div className="mb-4 p-4 rounded-xl bg-amber-50/60 border border-amber-200/80 text-xs text-ink-secondary leading-relaxed space-y-2">
          <p>
            Skipping will immediately{" "}
            <strong className="text-rose-600 font-bold">reset your active streak of {currentStreak} days to 0</strong>.
          </p>
          <div className="flex items-center gap-1.5 text-amber-900 font-medium">
            <Mail className="w-3.5 h-3.5" />
            <span>
              An automated notification will be dispatched to you
              {partnerEmail ? ` and your accountability partner (${partnerEmail})` : ""}.
            </span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[11px] font-bold text-ink-muted uppercase tracking-wider mb-2">
              Why are you skipping today? (Mandatory)
            </label>
            <textarea
              rows={3}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="State a genuine, honest reason (minimum 15 characters)..."
              className="w-full bg-subtle border border-hairline rounded-xl p-3 text-xs sm:text-sm text-ink-primary placeholder-ink-muted focus:outline-none focus:border-obsidian transition-colors"
            />
            <div className="flex items-center justify-between text-[11px] mt-1.5">
              <span
                className={`font-mono ${
                  isValid ? "text-emerald-600 font-semibold" : "text-ink-muted"
                }`}
              >
                {currentLength} / {minLength} characters minimum
              </span>
              {!isValid && (
                <span className="text-amber-700 font-medium">
                  {minLength - currentLength} more characters required
                </span>
              )}
            </div>
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700">
              {error}
            </div>
          )}

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-hairline">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 text-xs font-semibold text-ink-muted hover:text-ink-primary transition-colors"
            >
              Cancel, I Will Practice
            </button>
            <button
              type="submit"
              disabled={!isValid || isSubmitting}
              className={`px-5 py-2.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
                isValid
                  ? "bg-amber-700 hover:bg-amber-800 text-white shadow-xs active:scale-[0.98]"
                  : "bg-subtle text-ink-muted cursor-not-allowed border border-hairline"
              }`}
            >
              {isSubmitting ? (
                "Logging Skip..."
              ) : (
                <>
                  <span>Confirm Skip & Reset Streak</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
