"use client";

import React, { useState } from "react";
import { signIn } from "@/lib/auth-client";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  subtitle?: string;
}

export function AuthModal({
  isOpen,
  onClose,
  title = "Sign In to NL2Query",
  subtitle = "Sign in to save your daily streak, track quiz progress, and compete on the global leaderboard.",
}: AuthModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleGoogleSignIn = async () => {
    try {
      setIsLoading(true);
      setError(null);
      await signIn.social({
        provider: "google",
        callbackURL: typeof window !== "undefined" ? window.location.href : "/sql",
      });
    } catch (err: unknown) {
      console.error("Google sign in failed:", err);
      setError(err instanceof Error ? err.message : "Failed to initiate Google sign in");
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/75 backdrop-blur-md transition-opacity animate-in fade-in duration-200"
        onClick={onClose}
      />

      {/* Modal Card */}
      <div
        className="relative w-full max-w-md rounded-2xl border p-6 sm:p-8 shadow-2xl z-10 animate-in zoom-in-95 duration-200"
        style={{
          background: "var(--panel, #18181b)",
          borderColor: "var(--border, #27272a)",
          color: "var(--foreground, #fafafa)",
        }}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-lg opacity-70 hover:opacity-100 hover:bg-[var(--surface-subtle)] transition-colors cursor-pointer"
          style={{ color: "var(--foreground)" }}
          aria-label="Close modal"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Modal Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-sky-500/20 via-indigo-500/20 to-purple-500/20 border border-sky-500/30 text-sky-400 mb-4 shadow-lg shadow-sky-500/10">
            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight" style={{ color: "var(--foreground)" }}>{title}</h2>
          <p className="mt-2 text-xs sm:text-sm leading-relaxed max-w-xs mx-auto" style={{ color: "var(--muted)" }}>
            {subtitle}
          </p>
        </div>

        {/* Feature Highlights */}
        <div
          className="space-y-2.5 mb-6 border rounded-xl p-3.5 text-xs"
          style={{
            background: "var(--surface-subtle)",
            borderColor: "var(--border)",
            color: "var(--foreground)",
          }}
        >
          <div className="flex items-center gap-2.5">
            <span className="text-base shrink-0">🔥</span>
            <span>Maintain your <strong>daily quiz streak</strong> and level up.</span>
          </div>
          <div className="flex items-center gap-2.5">
            <span className="text-base shrink-0">🏆</span>
            <span>Climb the <strong>Global Leaderboard</strong> against peers.</span>
          </div>
          <div className="flex items-center gap-2.5">
            <span className="text-base shrink-0">⚡</span>
            <span>Save personalized practice stats and query history.</span>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs text-center font-medium">
            {error}
          </div>
        )}

        {/* Google Sign In Button */}
        <button
          onClick={handleGoogleSignIn}
          disabled={isLoading}
          type="button"
          className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-xl bg-white hover:bg-zinc-100 text-zinc-900 font-semibold text-sm shadow-md hover:shadow-lg border border-zinc-200 dark:border-transparent transition-all active:scale-[0.98] disabled:opacity-60 cursor-pointer"
        >
          {isLoading ? (
            <div className="w-5 h-5 border-2 border-zinc-900 border-t-transparent rounded-full animate-spin" />
          ) : (
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.66v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.15z"
              />
              <path
                fill="#34A853"
                d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.34 24 12 24z"
              />
              <path
                fill="#FBBC05"
                d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.16 0 9.94 0 12s.45 3.84 1.25 5.42l4.03-3.15z"
              />
              <path
                fill="#EA4335"
                d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.34 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
              />
            </svg>
          )}
          <span>{isLoading ? "Connecting to Google..." : "Continue with Google"}</span>
        </button>

        <p className="mt-4 text-center text-[11px]" style={{ color: "var(--muted)" }}>
          By signing in, you agree to our Terms of Service & Privacy Policy.
        </p>
      </div>
    </div>
  );
}
