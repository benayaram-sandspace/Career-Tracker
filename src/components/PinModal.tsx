"use client";

import React, { useState } from "react";
import { Lock, ArrowRight, AlertCircle, ShieldCheck } from "lucide-react";

interface PinModalProps {
  isOpen: boolean;
  onAuthenticated: () => void;
}

export function PinModal({ isOpen, onAuthenticated }: PinModalProps) {
  const [pin, setPin] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!pin) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/auth/pin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pin }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        onAuthenticated();
      } else {
        setError(data.error || "Incorrect PIN code. Please try again.");
        setPin("");
      }
    } catch (err: any) {
      setError(err.message || "Failed to verify PIN");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleKeyPress = (num: string) => {
    if (pin.length < 6) {
      const nextPin = pin + num;
      setPin(nextPin);
      if (nextPin.length === 4) {
        setTimeout(() => {
          fetch("/api/auth/pin", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ pin: nextPin }),
          })
            .then((r) => r.json())
            .then((d) => {
              if (d.success) onAuthenticated();
              else setError(d.error || "Incorrect PIN code");
            })
            .catch(() => setError("Error verifying PIN"));
        }, 100);
      }
    }
  };

  const handleBackspace = () => {
    setPin((prev) => prev.slice(0, -1));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
      <div className="w-full max-w-sm bg-white border border-hairline rounded-2xl p-7 shadow-2xl text-center">
        <div className="w-12 h-12 rounded-2xl bg-subtle border border-hairline flex items-center justify-center mx-auto mb-4 text-ink-primary">
          <Lock className="w-5 h-5" />
        </div>

        <h2 className="text-base sm:text-lg font-bold text-ink-primary mb-1">
          Career Shift Tracker
        </h2>
        <p className="text-xs text-ink-muted mb-6">
          Enter your Access PIN to unlock your focus workspace
        </p>

        {/* PIN DISPLAY CIRCLES */}
        <div className="flex justify-center gap-3 mb-6">
          {[0, 1, 2, 3].map((idx) => {
            const hasChar = pin.length > idx;
            return (
              <div
                key={idx}
                className={`w-3.5 h-3.5 rounded-full border transition-all ${
                  hasChar
                    ? "bg-obsidian border-obsidian scale-110"
                    : "border-hairline bg-subtle"
                }`}
              />
            );
          })}
        </div>

        {error && (
          <div className="mb-4 p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-center justify-center gap-1.5">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* NUMPAD */}
        <div className="grid grid-cols-3 gap-2 max-w-[240px] mx-auto mb-4">
          {["1", "2", "3", "4", "5", "6", "7", "8", "9", "C", "0", "OK"].map((key) => {
            if (key === "C") {
              return (
                <button
                  key={key}
                  type="button"
                  onClick={handleBackspace}
                  className="h-12 rounded-xl bg-subtle hover:bg-hairline text-ink-secondary font-medium text-xs transition-colors"
                >
                  DEL
                </button>
              );
            }
            if (key === "OK") {
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => handleSubmit()}
                  disabled={isSubmitting || !pin}
                  className="h-12 rounded-xl bg-obsidian hover:bg-ink-secondary text-white font-bold text-xs transition-colors flex items-center justify-center shadow-xs"
                >
                  <ArrowRight className="w-4 h-4" />
                </button>
              );
            }
            return (
              <button
                key={key}
                type="button"
                onClick={() => handleKeyPress(key)}
                className="h-12 rounded-xl bg-subtle hover:bg-hairline text-ink-primary font-mono text-base font-bold transition-colors active:scale-95"
              >
                {key}
              </button>
            );
          })}
        </div>

        <div className="pt-2 border-t border-hairline text-[11px] text-ink-muted flex items-center justify-center gap-1">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Single-user protected workspace</span>
        </div>
      </div>
    </div>
  );
}
