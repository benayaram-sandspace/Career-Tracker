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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-lg bg-slate-900 border border-amber-500/40 rounded-xl p-6 shadow-2xl">
        <button
          onClick={onClose}
          disabled={isSubmitting}
          className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-3 mb-4 text-amber-400">
          <div className="p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/20">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">
              Intentional Skip Protocol
            </h3>
            <span className="text-xs text-amber-400 font-semibold uppercase tracking-wider">
              High-Friction Accountability
            </span>
          </div>
        </div>

        <div className="mb-4 p-4 rounded-lg bg-amber-500/10 border border-amber-500/20 text-xs text-slate-300 leading-relaxed space-y-2">
          <p>
            Skipping will immediately{" "}
            <strong className="text-rose-400">reset your active streak of {currentStreak} days to 0</strong>.
          </p>
          <div className="flex items-center gap-1.5 text-amber-300 font-medium">
            <Mail className="w-3.5 h-3.5" />
            <span>
              An automated notification with your reason will be sent to you
              {partnerEmail ? ` and your partner (${partnerEmail})` : ""}.
            </span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Why are you skipping today? (Mandatory)
            </label>
            <textarea
              rows={3}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="State a genuine, honest reason (minimum 15 characters)..."
              className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 transition-colors"
            />
            <div className="flex items-center justify-between text-[11px] mt-1.5">
              <span
                className={`font-mono ${
                  isValid ? "text-emerald-400" : "text-slate-500"
                }`}
              >
                {currentLength} / {minLength} characters minimum
              </span>
              {!isValid && (
                <span className="text-amber-400">
                  {minLength - currentLength} more characters required
                </span>
              )}
            </div>
          </div>

          {error && (
            <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-xs text-rose-300">
              {error}
            </div>
          )}

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white transition-colors"
            >
              Cancel, I Will Practice
            </button>
            <button
              type="submit"
              disabled={!isValid || isSubmitting}
              className={`px-5 py-2.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                isValid
                  ? "bg-amber-600 hover:bg-amber-500 text-white shadow-lg shadow-amber-600/30 active:scale-[0.98]"
                  : "bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700"
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
