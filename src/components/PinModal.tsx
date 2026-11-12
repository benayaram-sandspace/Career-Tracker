"use client";

import React, { useState } from "react";
import { Lock, KeyRound, AlertCircle, ArrowRight } from "lucide-react";

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
        // Auto submit if 4 digits
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
      <div className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl text-center">
        <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center mx-auto mb-4 text-indigo-400">
          <Lock className="w-6 h-6" />
        </div>

        <h2 className="text-lg font-bold text-white mb-1">
          Career Shift Tracker
        </h2>
        <p className="text-xs text-slate-400 mb-6">
          Enter your Access PIN to unlock your focus workspace
        </p>

        {/* PIN DISPLAY CIRCLES */}
        <div className="flex justify-center gap-3 mb-6">
          {[0, 1, 2, 3].map((idx) => {
            const hasChar = pin.length > idx;
            return (
              <div
                key={idx}
                className={`w-4 h-4 rounded-full border transition-all ${
                  hasChar
                    ? "bg-indigo-500 border-indigo-400 scale-110 shadow-sm shadow-indigo-500/50"
                    : "border-slate-700 bg-slate-950"
                }`}
              />
            );
          })}
        </div>

        {error && (
          <div className="mb-4 p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/20 text-xs text-rose-300 flex items-center justify-center gap-1.5">
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
                  className="h-12 rounded-xl bg-slate-950/60 hover:bg-slate-800 text-slate-400 font-medium text-xs transition-colors"
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
                  className="h-12 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition-colors flex items-center justify-center"
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
                className="h-12 rounded-xl bg-slate-950/60 hover:bg-slate-800 text-white font-mono text-base font-bold transition-colors active:scale-95"
              >
                {key}
              </button>
            );
          })}
        </div>

        <p className="text-[11px] text-slate-500">
          Default PIN is <code className="text-indigo-400">1234</code> if configured in .env
        </p>
      </div>
    </div>
  );
}
