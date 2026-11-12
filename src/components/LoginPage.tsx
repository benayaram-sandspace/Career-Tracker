"use client";

import React, { useState, useEffect, useRef } from "react";
import { Lock, ArrowRight, AlertCircle, Compass, ShieldCheck, Check } from "lucide-react";

interface LoginPageProps {
  onAuthenticated: () => void;
  expectedPinConfigured: boolean;
}

export function LoginPage({ onAuthenticated, expectedPinConfigured }: LoginPageProps) {
  const [pin, setPin] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-focus hidden input on load
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleVerifyPin = async (pinToVerify: string) => {
    if (!pinToVerify || isSubmitting) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/auth/pin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pin: pinToVerify }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        onAuthenticated();
      } else {
        setError(data.error || "Incorrect PIN code. Please try again.");
        setPin("");
        inputRef.current?.focus();
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
        handleVerifyPin(nextPin);
      }
    }
  };

  const handleBackspace = () => {
    setPin((prev) => prev.slice(0, -1));
    setError(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Backspace") {
      handleBackspace();
    } else if (e.key === "Enter") {
      handleVerifyPin(pin);
    } else if (/^[0-9]$/.test(e.key)) {
      handleKeyPress(e.key);
    }
  };

  return (
    <div
      className="min-h-screen bg-canvas flex flex-col justify-between items-center py-10 px-4 sm:px-6 select-none"
      onClick={() => inputRef.current?.focus()}
      onKeyDown={handleKeyDown}
      tabIndex={0}
    >
      {/* Hidden real input for mobile keyboard support */}
      <input
        ref={inputRef}
        type="password"
        inputMode="numeric"
        pattern="[0-9]*"
        maxLength={6}
        value={pin}
        onChange={(e) => {
          const val = e.target.value.replace(/\D/g, "");
          setPin(val);
          if (val.length === 4) {
            handleVerifyPin(val);
          }
        }}
        className="opacity-0 absolute pointer-events-none w-0 h-0"
      />

      {/* TOP BRANDING */}
      <div className="w-full max-w-md flex items-center justify-between text-xs text-ink-muted">
        <div className="flex items-center gap-2">
          <Compass className="w-4 h-4 text-ink-primary" />
          <span className="font-semibold text-ink-primary tracking-tight">
            Career Shift Tracker
          </span>
        </div>
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-white border border-hairline text-ink-secondary">
          <ShieldCheck className="w-3 h-3 text-emerald-600" />
          Single-User Protected
        </span>
      </div>

      {/* CENTER LOGIN CARD */}
      <div className="w-full max-w-sm bg-white border border-hairline rounded-3xl p-8 sm:p-9 shadow-xs text-center my-auto animate-fade-in">
        {/* ICON */}
        <div className="w-14 h-14 rounded-2xl bg-subtle border border-hairline flex items-center justify-center mx-auto mb-5 text-ink-primary shadow-2xs">
          <Lock className="w-6 h-6 stroke-[1.8]" />
        </div>

        <h1 className="text-xl sm:text-2xl font-bold text-ink-primary tracking-tight mb-1.5">
          Welcome Back
        </h1>
        <p className="text-xs text-ink-muted leading-relaxed mb-6">
          Enter your 4-digit Access PIN to unlock your 30-day roadmap and daily practice.
        </p>

        {/* PIN DISPLAY INDICATORS */}
        <div className="flex justify-center gap-3.5 mb-6">
          {[0, 1, 2, 3].map((idx) => {
            const isFilled = pin.length > idx;
            const isCurrent = pin.length === idx;
            return (
              <div
                key={idx}
                className={`w-4 h-4 rounded-full border-2 transition-all duration-150 ${
                  isFilled
                    ? "bg-obsidian border-obsidian scale-110 shadow-2xs"
                    : isCurrent
                    ? "border-obsidian bg-white scale-105"
                    : "border-hairline bg-subtle/50"
                }`}
              />
            );
          })}
        </div>

        {/* ERROR MESSAGE */}
        {error && (
          <div className="mb-4 p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-center justify-center gap-1.5 animate-shake">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{error}</span>
          </div>
        )}

        {/* NUMERIC KEYPAD */}
        <div className="grid grid-cols-3 gap-2.5 max-w-[260px] mx-auto mb-5">
          {["1", "2", "3", "4", "5", "6", "7", "8", "9", "DEL", "0", "GO"].map((key) => {
            if (key === "DEL") {
              return (
                <button
                  key={key}
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleBackspace();
                  }}
                  className="h-12 rounded-2xl bg-subtle/80 hover:bg-hairline text-ink-secondary font-semibold text-xs transition-colors flex items-center justify-center active:scale-95"
                >
                  DEL
                </button>
              );
            }
            if (key === "GO") {
              return (
                <button
                  key={key}
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleVerifyPin(pin);
                  }}
                  disabled={isSubmitting || !pin}
                  className="h-12 rounded-2xl bg-obsidian hover:bg-ink-secondary text-white font-bold text-xs transition-all flex items-center justify-center shadow-xs disabled:opacity-40 active:scale-95"
                >
                  {isSubmitting ? (
                    <span className="animate-spin text-sm">&bull;</span>
                  ) : (
                    <ArrowRight className="w-4 h-4" />
                  )}
                </button>
              );
            }
            return (
              <button
                key={key}
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleKeyPress(key);
                }}
                className="h-12 rounded-2xl bg-subtle/60 hover:bg-hairline text-ink-primary font-mono text-base font-bold transition-all active:scale-95"
              >
                {key}
              </button>
            );
          })}
        </div>

        {/* FOOTNOTE / DEFAULT PIN */}
        <div className="pt-2 border-t border-hairline text-[11px] text-ink-muted">
          <span>Protected by </span>
          <code className="bg-subtle px-1.5 py-0.5 rounded border border-hairline font-mono text-ink-primary">
            APP_PIN
          </code>
          <span> in .env (Default: </span>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setPin("1234");
              handleVerifyPin("1234");
            }}
            className="text-ink-primary font-mono font-bold underline hover:text-black"
          >
            1234
          </button>
          <span>)</span>
        </div>
      </div>

      {/* FOOTER */}
      <div className="w-full max-w-md text-center text-xs text-ink-muted">
        <span>Career Shift Accountability &bull; Distraction-Free Single-Screen Architecture</span>
      </div>
    </div>
  );
}

