"use client";

import React, { useState, useEffect, useRef } from "react";
import { useSession, signOut } from "@/lib/auth-client";
import { AuthModal } from "./AuthModal";

interface UserStats {
  id: string;
  name: string;
  email: string;
  image?: string | null;
  streak: number;
  lastQuizDate?: string | null;
  totalScore: number;
  quizzesTaken: number;
  rank: number | string;
  totalParticipants: number;
}

export function UserAuthButton() {
  const { data: session, isPending } = useSession();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const fetchStats = async () => {
    if (!session?.user) return;
    try {
      const res = await fetch("/api/user/stats");
      if (res.ok) {
        const data = await res.json();
        if (data.user) {
          setStats(data.user);
        }
      }
    } catch (e) {
      console.error("Failed to fetch user stats", e);
    }
  };

  useEffect(() => {
    if (session?.user) {
      fetchStats();
    } else {
      setStats(null);
    }
  }, [session?.user]);

  // Listen for global custom events when a quiz is completed to refresh stats immediately
  useEffect(() => {
    const handleQuizRecorded = () => {
      fetchStats();
    };
    window.addEventListener("quiz-recorded", handleQuizRecorded);
    return () => window.removeEventListener("quiz-recorded", handleQuizRecorded);
  }, [session?.user]);

  const handleMouseEnter = () => {
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    hoverTimeoutRef.current = setTimeout(() => {
      setIsHovered(false);
    }, 200);
  };

  const handleSignOut = async () => {
    try {
      setIsLoggingOut(true);
      await signOut();
      setStats(null);
      setIsHovered(false);
      window.location.reload();
    } catch (err) {
      console.error("Sign out error", err);
    } finally {
      setIsLoggingOut(false);
    }
  };

  if (isPending) {
    return (
      <div className="h-8 w-20 rounded-xl bg-zinc-800/40 animate-pulse border border-zinc-700/30" />
    );
  }

  if (!session?.user) {
    return (
      <>
        <button
          type="button"
          onClick={() => setIsAuthModalOpen(true)}
          className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold bg-gradient-to-r from-sky-500/15 via-indigo-500/15 to-purple-500/15 hover:from-sky-500/25 hover:via-indigo-500/25 hover:to-purple-500/25 text-sky-400 hover:text-sky-300 border border-sky-500/30 hover:border-sky-500/50 shadow-xs transition-all cursor-pointer group"
          id="header-sign-in-button"
        >
          <svg
            className="w-3.5 h-3.5 group-hover:scale-110 transition-transform"
            viewBox="0 0 24 24"
          >
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
          <span>Sign In</span>
        </button>

        <AuthModal
          isOpen={isAuthModalOpen}
          onClose={() => setIsAuthModalOpen(false)}
        />
      </>
    );
  }

  const user = session.user;
  const streak = stats?.streak ?? (user as unknown as { streak?: number }).streak ?? 0;
  const rank = stats?.rank ?? "-";
  const userInitials = (user.name || "U")
    .split(" ")
    .map((n: string) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div
      className="relative inline-block"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Avatar + Streak Pill Trigger */}
      <div
        className="flex items-center gap-2 p-1 pl-2.5 rounded-full border bg-zinc-900/60 dark:bg-zinc-900/80 border-zinc-700/60 hover:border-zinc-500 cursor-pointer transition-all shadow-xs"
        id="header-user-avatar"
      >
        {/* Streak Indicator */}
        <div className="flex items-center gap-1 text-xs font-mono font-bold text-amber-400">
          <span className="text-sm">🔥</span>
          <span>{streak}</span>
        </div>

        {/* User Image / Initials */}
        <div className="relative w-7 h-7 rounded-full overflow-hidden bg-gradient-to-tr from-sky-500 to-indigo-600 border border-sky-400/40 flex items-center justify-center text-white text-xs font-bold shrink-0">
          {user.image ? (
            <img
              src={user.image}
              alt={user.name || "User Avatar"}
              className="w-full h-full object-cover"
            />
          ) : (
            userInitials
          )}
        </div>
      </div>

      {/* Hover Card / Tooltip Menu */}
      {isHovered && (
        <div
          className="absolute right-0 mt-2 w-72 rounded-2xl border p-4 shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-150 backdrop-blur-md"
          style={{
            background: "var(--panel, #18181b)",
            borderColor: "var(--border, #27272a)",
            color: "var(--foreground, #fafafa)",
          }}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          {/* User Info Header */}
          <div className="flex items-center gap-3 pb-3 border-b border-zinc-800/80">
            <div className="relative w-11 h-11 rounded-xl overflow-hidden bg-gradient-to-tr from-sky-500 to-indigo-600 border border-sky-400/50 flex items-center justify-center text-white text-sm font-bold shrink-0 shadow-md">
              {user.image ? (
                <img
                  src={user.image}
                  alt={user.name || "User"}
                  className="w-full h-full object-cover"
                />
              ) : (
                userInitials
              )}
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="text-sm font-bold truncate leading-tight">
                {user.name || "NL2Query Learner"}
              </h3>
              <p className="text-[11px] text-zinc-400 truncate mt-0.5">{user.email}</p>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-2 my-3 font-mono">
            {/* Streak Card */}
            <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 flex flex-col">
              <div className="flex items-center gap-1.5 text-[11px] font-semibold text-amber-400 uppercase tracking-wider">
                <span>🔥</span>
                <span>Streak</span>
              </div>
              <p className="text-base font-black text-amber-300 mt-1">
                {streak} {streak === 1 ? "Day" : "Days"}
              </p>
              <span className="text-[10px] text-zinc-400 font-sans mt-0.5">
                Daily Quiz Active
              </span>
            </div>

            {/* Leaderboard Rank Card */}
            <div className="p-2.5 rounded-xl bg-sky-500/10 border border-sky-500/20 flex flex-col">
              <div className="flex items-center gap-1.5 text-[11px] font-semibold text-sky-400 uppercase tracking-wider">
                <span>🏆</span>
                <span>Leaderboard</span>
              </div>
              <p className="text-base font-black text-sky-300 mt-1">
                {rank !== "-" ? `#${rank}` : "Unranked"}
              </p>
              <span className="text-[10px] text-zinc-400 font-sans mt-0.5">
                {stats?.totalParticipants ? `of ${stats.totalParticipants} users` : "Take a quiz"}
              </span>
            </div>
          </div>

          {/* Additional Quick Stats */}
          <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-zinc-900/60 border border-zinc-800 text-xs text-zinc-300 mb-3 font-mono">
            <div>
              <span className="text-zinc-500 text-[10px] block">TOTAL SCORE</span>
              <span className="font-bold text-emerald-400">{stats?.totalScore ?? 0} pts</span>
            </div>
            <div className="text-right">
              <span className="text-zinc-500 text-[10px] block">QUIZZES SOLVED</span>
              <span className="font-bold text-indigo-400">{stats?.quizzesTaken ?? 0}</span>
            </div>
          </div>

          {/* Sign Out Button */}
          <button
            type="button"
            onClick={handleSignOut}
            disabled={isLoggingOut}
            className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 text-xs font-semibold transition-all cursor-pointer disabled:opacity-60"
          >
            {isLoggingOut ? (
              <div className="w-3.5 h-3.5 border-2 border-rose-400 border-t-transparent rounded-full animate-spin" />
            ) : (
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            )}
            <span>Sign Out</span>
          </button>
        </div>
      )}
    </div>
  );
}
