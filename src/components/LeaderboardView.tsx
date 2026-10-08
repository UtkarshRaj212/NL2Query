"use client";

import React, { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { useSession } from "@/lib/auth-client";
import { AuthModal } from "./AuthModal";

export interface LeaderboardUser {
  rank: number;
  id: string;
  name: string;
  image?: string | null;
  streak: number;
  totalScore: number;
  quizzesTaken: number;
}

export interface CurrentUserStats {
  id: string;
  name: string;
  image?: string | null;
  streak: number;
  totalScore: number;
  quizzesTaken: number;
  rank: number | string;
  totalParticipants: number;
}

interface LeaderboardViewProps {
  mode?: "sql" | "plsql";
}

export function LeaderboardView({ mode: propMode }: LeaderboardViewProps = {}) {
  const pathname = usePathname();
  const currentMode = propMode || (pathname?.includes("/plsql") ? "plsql" : "sql");
  const isPlSql = currentMode === "plsql";

  const { data: session } = useSession();
  const [leaderboard, setLeaderboard] = useState<LeaderboardUser[]>([]);
  const [currentUserStats, setCurrentUserStats] = useState<CurrentUserStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  const fetchLeaderboard = async () => {
    try {
      setIsLoading(true);
      const res = await fetch("/api/leaderboard");
      if (res.ok) {
        const data = await res.json();
        setLeaderboard(data.leaderboard || []);
        setCurrentUserStats(data.currentUserStats || null);
      }
    } catch (e) {
      console.error("Failed to load leaderboard", e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaderboard();
  }, [session?.user]);

  // Listen to quiz completions to reload leaderboard
  useEffect(() => {
    const handleQuizRecorded = () => {
      fetchLeaderboard();
    };
    window.addEventListener("quiz-recorded", handleQuizRecorded);
    return () => window.removeEventListener("quiz-recorded", handleQuizRecorded);
  }, []);

  return (
    <div className="space-y-6">
      {/* Header Banner - Mode-specific left-to-right gradient */}
      <div
        className={`relative overflow-hidden rounded-2xl p-6 border shadow-md transition-all ${isPlSql
          ? "bg-gradient-to-r from-yellow-500/15 via-orange-500/20 to-red-600/25 border-orange-500/40"
          : "bg-gradient-to-r from-white/10 via-sky-400/20 to-blue-700/30 border-sky-400/40"
          }`}
        style={{
          background: isPlSql
            ? "linear-gradient(to right, rgba(234, 179, 8, 0.16), rgba(249, 115, 22, 0.22), rgba(220, 38, 38, 0.26))"
            : "linear-gradient(to right, rgba(255, 255, 255, 0.14), rgba(56, 189, 248, 0.22), rgba(29, 78, 216, 0.32))",
          borderColor: isPlSql
            ? "rgba(249, 115, 22, 0.35)"
            : "rgba(56, 189, 248, 0.35)",
        }}
      >
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-2xl">🏆</span>
              <h2
                className="text-xl sm:text-2xl text-white font-bold tracking-tight"
              >
                Global SQL & PL/SQL Leaderboard
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-zinc-300">
              Solve daily quizzes, build your streak, and rank among top database engineers.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={fetchLeaderboard}
              disabled={isLoading}
              className="px-3 py-1.5 rounded-xl border border-zinc-700 bg-zinc-800/80 hover:bg-zinc-700 text-xs font-semibold text-zinc-200 transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <svg
                className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
              <span>Refresh</span>
            </button>
          </div>
        </div>
      </div>

      {/* Unauthenticated Login CTA Banner */}
      {
        !session?.user && (
          <div className="p-5 rounded-2xl border bg-gradient-to-r from-sky-500/10 via-indigo-500/10 to-sky-500/10 border-sky-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-lg">
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-sky-500/20 border border-sky-500/40 flex items-center justify-center text-sky-400 shrink-0">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"
                  />
                </svg>
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Join the Leaderboard</h3>
                <p className="text-xs text-zinc-300">
                  You must sign in to appear on the leaderboard and save your daily streak.
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsAuthModalOpen(true)}
              className="px-4 py-2 rounded-xl bg-white hover:bg-zinc-100 text-zinc-900 font-bold text-xs shadow-md transition-all shrink-0 cursor-pointer flex items-center justify-center gap-2"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
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
              <span>Sign In with Google</span>
            </button>
          </div>
        )
      }

      {/* Authenticated User Rank Banner */}
      {
        session?.user && currentUserStats && (
          <div className="p-4 rounded-2xl border bg-zinc-900/80 border-zinc-700 flex items-center justify-between gap-4 font-mono shadow-md">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-xl overflow-hidden bg-sky-500/20 border border-sky-400/40 flex items-center justify-center text-white text-xs font-bold shrink-0">
                {currentUserStats.image ? (
                  <img
                    src={currentUserStats.image}
                    alt={currentUserStats.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  currentUserStats.name.slice(0, 2).toUpperCase()
                )}
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-white truncate font-sans">
                    {currentUserStats.name} (You)
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-sky-500/20 text-sky-300 font-mono">
                    Rank {currentUserStats.rank !== "-" ? `#${currentUserStats.rank}` : "Unranked"}
                  </span>
                </div>
                <p className="text-[11px] text-zinc-400 font-sans">
                  {currentUserStats.quizzesTaken > 0
                    ? `Completed ${currentUserStats.quizzesTaken} quizzes with ${currentUserStats.totalScore} total pts`
                    : "Complete a quiz to earn your global ranking!"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <div className="text-right">
                <span className="text-[10px] text-zinc-400 block font-sans">DAILY STREAK</span>
                <span className="text-sm font-bold text-amber-400 flex items-center justify-end gap-1">
                  <span>🔥</span>
                  <span>{currentUserStats.streak} Days</span>
                </span>
              </div>
            </div>
          </div>
        )
      }

      {/* Leaderboard Table / Cards */}
      <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center text-zinc-400 text-sm">
            <div className="w-8 h-8 border-2 border-amber-400 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            Loading Leaderboard...
          </div>
        ) : leaderboard.length === 0 ? (
          <div className="p-12 text-center text-zinc-400">
            <span className="text-3xl block mb-2">🎯</span>
            <h4 className="text-base font-bold text-white">No ranked users yet</h4>
            <p className="text-xs text-zinc-500 mt-1 max-w-sm mx-auto">
              Be the first to complete a quiz today and claim the #1 spot on the leaderboard!
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse font-mono">
              <thead>
                <tr className="border-b border-zinc-800 text-zinc-400 bg-zinc-900/80 font-sans text-[11px] uppercase tracking-wider">
                  <th className="py-3.5 px-4 font-semibold w-16 text-center">Rank</th>
                  <th className="py-3.5 px-4 font-semibold">User</th>
                  <th className="py-3.5 px-4 font-semibold text-center">Daily Streak</th>
                  <th className="py-3.5 px-4 font-semibold text-center">Quizzes</th>
                  <th className="py-3.5 px-4 font-semibold text-right">Total Score</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60">
                {leaderboard.map((user) => {
                  const isCurrent = session?.user?.id === user.id;
                  const isTop1 = user.rank === 1;
                  const isTop2 = user.rank === 2;
                  const isTop3 = user.rank === 3;

                  return (
                    <tr
                      key={user.id}
                      className={`transition-colors ${isCurrent
                        ? "bg-sky-500/10 hover:bg-sky-500/15"
                        : "hover:bg-zinc-800/40"
                        }`}
                    >
                      {/* Rank Column */}
                      <td className="py-3.5 px-4 text-center font-bold">
                        {isTop1 ? (
                          <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/50 shadow-xs">
                            🥇
                          </span>
                        ) : isTop2 ? (
                          <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-zinc-300/20 text-zinc-200 border border-zinc-300/40 shadow-xs">
                            🥈
                          </span>
                        ) : isTop3 ? (
                          <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-amber-700/20 text-amber-600 border border-amber-600/40 shadow-xs">
                            🥉
                          </span>
                        ) : (
                          <span className="text-zinc-400">#{user.rank}</span>
                        )}
                      </td>

                      {/* User Column */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="relative w-8 h-8 rounded-full overflow-hidden bg-gradient-to-tr from-sky-500 to-indigo-600 border border-zinc-700 flex items-center justify-center text-white text-xs font-bold shrink-0">
                            {user.image ? (
                              <img
                                src={user.image}
                                alt={user.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              user.name.slice(0, 2).toUpperCase()
                            )}
                          </div>
                          <div>
                            <span
                              className={`font-semibold font-sans block truncate max-w-[160px] sm:max-w-xs ${isCurrent ? "text-sky-300" : "text-zinc-100"
                                }`}
                            >
                              {user.name} {isCurrent && "(You)"}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Streak Column */}
                      <td className="py-3.5 px-4 text-center">
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 font-bold text-xs">
                          <span>🔥</span>
                          <span>{user.streak}d</span>
                        </span>
                      </td>

                      {/* Quizzes Column */}
                      <td className="py-3.5 px-4 text-center text-zinc-300">
                        {user.quizzesTaken}
                      </td>

                      {/* Score Column */}
                      <td className="py-3.5 px-4 text-right font-black text-emerald-400 text-sm">
                        {user.totalScore} pts
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />
    </div >
  );
}
