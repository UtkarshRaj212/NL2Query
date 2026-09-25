"use client";

import React, { useState, useEffect, useMemo, Suspense } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import Logo from "../../public/Logo.png";
import type { ThemeId } from "@/components/nlSqlTypes";
import {
  type QuizQuestion,
  SQL_QUIZ_QUESTIONS,
  PLSQL_QUIZ_QUESTIONS,
  validateScriptAnswer,
} from "@/lib/quizData";

// Data Structure for Recent Quizzes History
export interface RecentQuizRecord {
  id: string;
  mode: "sql" | "plsql";
  timestamp: number;
  score: number;
  total: number;
  accuracy: number;
  timeTakenSeconds: number;
  difficulties: ("Easy" | "Medium" | "Hard")[];
}

// Helpers for Duration and Time Formatting
function formatDuration(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  const mins = Math.floor(seconds / 60);
  const remSecs = seconds % 60;
  return remSecs > 0 ? `${mins}m ${remSecs}s` : `${mins}m`;
}

function formatRelativeTime(timestamp: number): string {
  const diffSecs = Math.max(0, Math.round((Date.now() - timestamp) / 1000));
  if (diffSecs < 60) return "Just now";
  const diffMins = Math.floor(diffSecs / 60);
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `${diffDays}d ago`;
  return new Date(timestamp).toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

// LeetCode-style Status Icon for Attempted Questions
function LeetCodeStatusIcon({
  isSubmitted,
  isCorrect,
  isSkipped,
}: {
  isSubmitted?: boolean;
  isCorrect?: boolean;
  isSkipped?: boolean;
}) {
  if (isSubmitted && isCorrect) {
    // Green tick for correctly submitted
    return (
      <div
        className="w-5 h-5 rounded-full flex items-center justify-center bg-emerald-500/20 text-emerald-500 border border-emerald-500/40 shrink-0"
        title="Correctly Submitted"
      >
        <svg
          className="w-3.5 h-3.5"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={3}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polyline points="20 6 9 17 4 12" />
        </svg>
      </div>
    );
  }

  if (isSubmitted && !isCorrect) {
    // Red cross for incorrect
    return (
      <div
        className="w-5 h-5 rounded-full flex items-center justify-center bg-rose-500/20 text-rose-500 border border-rose-500/40 shrink-0"
        title="Incorrect"
      >
        <svg
          className="w-3.5 h-3.5"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={3}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </div>
    );
  }

  if (isSkipped) {
    // LeetCode attempted / skipped icon (amber/orange circle with minus/dash)
    return (
      <div
        className="w-5 h-5 rounded-full flex items-center justify-center bg-amber-500/20 text-amber-500 border border-amber-500/40 shrink-0"
        title="Skipped"
      >
        <svg
          className="w-3.5 h-3.5"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={3}
          strokeLinecap="round"
        >
          <line x1="6" y1="12" x2="18" y2="12" />
        </svg>
      </div>
    );
  }

  return null;
}

// Right Pane: Recent Quizzes Component (Visible ONLY before quiz starts / setup & finished)
function RecentQuizzesPane({
  mode,
  records,
  onClear,
}: {
  mode: "sql" | "plsql";
  records: RecentQuizRecord[];
  onClear: () => void;
}) {
  const stats = useMemo(() => {
    if (records.length === 0) return { total: 0, avgAccuracy: 0, avgTime: 0 };
    const total = records.length;
    const avgAccuracy = Math.round(
      records.reduce((acc, r) => acc + r.accuracy, 0) / total
    );
    const avgTime = Math.round(
      records.reduce((acc, r) => acc + r.timeTakenSeconds, 0) / total
    );
    return { total, avgAccuracy, avgTime };
  }, [records]);

  return (
    <aside
      className="w-full h-full flex flex-col overflow-hidden"
      style={{
        background: "var(--panel)",
        borderColor: "var(--border)",
      }}
    >
      {/* Pane Header */}
      <div
        className="p-3.5 sm:p-4 border-b flex items-center justify-between shrink-0"
        style={{
          borderColor: "var(--border)",
          background: "var(--surface-subtle)",
        }}
      >
        <div className="flex items-center gap-2">
          <span className="text-sm">⏱️</span>
          <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            <span>{mode === "sql" ? "Recent SQL Quizzes" : "Recent PL/SQL Quizzes"}</span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-[var(--accent)] text-[var(--accent-foreground)] font-mono font-bold">
              {records.length}
            </span>
          </h2>
        </div>

        {records.length > 0 && (
          <button
            type="button"
            onClick={onClear}
            className="text-[10px] text-zinc-500 hover:text-rose-500 transition-colors cursor-pointer underline"
          >
            Clear History
          </button>
        )}
      </div>

      {/* Quick Summary Metrics */}
      {records.length > 0 && (
        <div
          className="p-3 border-b grid grid-cols-3 gap-2 text-center text-xs shrink-0"
          style={{ borderColor: "var(--border)", background: "var(--panel)" }}
        >
          <div className="p-1.5 rounded-lg border" style={{ borderColor: "var(--border)", background: "var(--surface-subtle)" }}>
            <span className="text-[10px] opacity-70 block font-mono">Attempts</span>
            <span className="font-bold text-xs">{stats.total}</span>
          </div>
          <div className="p-1.5 rounded-lg border border-emerald-500/20 bg-emerald-500/10">
            <span className="text-[10px] text-emerald-600 dark:text-emerald-400 block font-mono">Avg Acc</span>
            <span className="font-bold text-xs text-emerald-600 dark:text-emerald-400">{stats.avgAccuracy}%</span>
          </div>
          <div className="p-1.5 rounded-lg border" style={{ borderColor: "var(--border)", background: "var(--surface-subtle)" }}>
            <span className="text-[10px] opacity-70 block font-mono">Avg Time</span>
            <span className="font-bold text-xs">{formatDuration(stats.avgTime)}</span>
          </div>
        </div>
      )}

      {/* Recent Quizzes List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2.5 scrollbar-thin">
        {records.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center p-6 text-center">
            <div
              className="w-12 h-12 rounded-2xl mb-3 flex items-center justify-center border text-xl"
              style={{
                background: "var(--surface-subtle)",
                borderColor: "var(--border)",
              }}
            >
              <span>📊</span>
            </div>
            <p className="text-xs font-bold" style={{ color: "var(--foreground)" }}>
              {mode === "sql" ? "No Recent SQL Quizzes" : "No Recent PL/SQL Quizzes"}
            </p>
            <p className="text-[11px] mt-1 text-zinc-500 dark:text-zinc-400 max-w-[200px]">
              Completed {mode === "sql" ? "SQL" : "PL/SQL"} quiz attempts will be stored here with time taken, accuracy, and score.
            </p>
          </div>
        ) : (
          records.map((rec) => {
            const accColor =
              rec.accuracy >= 75
                ? "text-emerald-600 dark:text-emerald-400 bg-emerald-500/15 border-emerald-500/30"
                : rec.accuracy >= 50
                ? "text-amber-600 dark:text-amber-400 bg-amber-500/15 border-amber-500/30"
                : "text-rose-600 dark:text-rose-400 bg-rose-500/15 border-rose-500/30";

            return (
              <div
                key={rec.id}
                className="p-3 rounded-xl border text-xs space-y-2 shadow-2xs hover:shadow-xs transition-shadow"
                style={{
                  background: "var(--surface-subtle)",
                  borderColor: "var(--border)",
                }}
              >
                {/* Header row: Mode badge, relative timestamp */}
                <div className="flex items-center justify-between">
                  <span
                    className="text-[10px] font-mono font-bold px-2 py-0.5 rounded border uppercase"
                    style={{
                      background:
                        rec.mode === "sql" ? "rgba(56, 189, 248, 0.15)" : "rgba(249, 115, 22, 0.15)",
                      borderColor:
                        rec.mode === "sql" ? "rgba(56, 189, 248, 0.3)" : "rgba(249, 115, 22, 0.3)",
                      color: rec.mode === "sql" ? "#38bdf8" : "#f97316",
                    }}
                  >
                    {rec.mode.toUpperCase()}
                  </span>
                  <span className="text-[10px] text-zinc-400 font-mono">
                    {formatRelativeTime(rec.timestamp)}
                  </span>
                </div>

                {/* Score and Accuracy metrics */}
                <div className="flex items-center justify-between pt-0.5">
                  <div>
                    <span className="text-[10px] text-zinc-500 dark:text-zinc-400 block font-mono">Score</span>
                    <span className="text-sm font-bold font-mono">
                      {rec.score} / {rec.total}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-zinc-500 dark:text-zinc-400 block font-mono">Accuracy</span>
                    <span className={`text-xs font-bold font-mono px-2 py-0.5 rounded border ${accColor}`}>
                      {rec.accuracy}%
                    </span>
                  </div>
                </div>

                {/* Time taken and difficulty pills */}
                <div className="flex items-center justify-between text-[11px] pt-1 border-t" style={{ borderColor: "var(--border)" }}>
                  <div className="flex items-center gap-1 text-zinc-500 dark:text-zinc-400 font-mono">
                    <span>⏱️</span>
                    <span>{formatDuration(rec.timeTakenSeconds)}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    {rec.difficulties.map((d) => (
                      <span
                        key={d}
                        className="text-[9px] font-semibold px-1.5 py-0.2 rounded border"
                        style={{
                          borderColor: "var(--border)",
                          background: "var(--panel)",
                          color:
                            d === "Easy" ? "#10b981" : d === "Medium" ? "#f59e0b" : "#ef4444",
                        }}
                      >
                        {d}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </aside>
  );
}

interface QuizContainerProps {
  initialMode: "sql" | "plsql";
}

export function QuizContainer({ initialMode }: QuizContainerProps) {
  const router = useRouter();
  const [mode, setMode] = useState<"sql" | "plsql">(initialMode);

  // App Theme State
  const [theme, setTheme] = useState<ThemeId>("slate");
  const isDark = theme !== "pearl";

  useEffect(() => {
    try {
      const savedTheme = localStorage.getItem("nlp-sql-theme") as ThemeId;
      if (savedTheme && (savedTheme === "slate" || savedTheme === "pearl")) {
        setTheme(savedTheme);
      }
    } catch {}
  }, []);

  const handleThemeChange = (nextTheme: ThemeId) => {
    setTheme(nextTheme);
    document.documentElement.setAttribute("data-theme", nextTheme);
    if (nextTheme !== "pearl") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    try {
      localStorage.setItem("nlp-sql-theme", nextTheme);
    } catch {}
  };

  // Switch mode handler that also updates URL to /sql/quiz or /plsql/quiz
  const handleSwitchMode = (targetMode: "sql" | "plsql") => {
    if (mode === targetMode) return;
    if (quizState === "active") {
      if (confirm("Switching mode will reset the active quiz. Continue?")) {
        setQuizState("setup");
        setMode(targetMode);
        router.push(targetMode === "sql" ? "/sql/quiz" : "/plsql/quiz");
      }
    } else {
      setMode(targetMode);
      router.push(targetMode === "sql" ? "/sql/quiz" : "/plsql/quiz");
    }
  };

  // Setup / Filter Configuration State
  // Default: 'all difficulty' (Easy, Medium, Hard) and '10 questions'
  const [selectedDifficulties, setSelectedDifficulties] = useState<Set<"Easy" | "Medium" | "Hard">>(
    new Set(["Easy", "Medium", "Hard"])
  );
  const [questionCount, setQuestionCount] = useState<number>(10);

  // Quiz Lifecycle State: "setup" | "active" | "finished"
  const [quizState, setQuizState] = useState<"setup" | "active" | "finished">("setup");

  // Timer Tracking for Recent Quizzes (stores time taken)
  const [quizStartTime, setQuizStartTime] = useState<number | null>(null);

  // Recent Quizzes History State (Separate storage keys for SQL and PL/SQL)
  const [sqlRecentQuizzes, setSqlRecentQuizzes] = useState<RecentQuizRecord[]>([]);
  const [plsqlRecentQuizzes, setPlsqlRecentQuizzes] = useState<RecentQuizRecord[]>([]);
  const [showRecentDrawer, setShowRecentDrawer] = useState<boolean>(false);

  useEffect(() => {
    try {
      // 1. Load SQL recent quizzes
      const rawSql = localStorage.getItem("nl2query-recent-quizzes-sql");
      if (rawSql) {
        setSqlRecentQuizzes(JSON.parse(rawSql));
      } else {
        // Fallback: migrate from legacy key if available
        const legacy = localStorage.getItem("nl2query-recent-quizzes");
        if (legacy) {
          const parsed: RecentQuizRecord[] = JSON.parse(legacy);
          const sqlOnly = parsed.filter((r) => r.mode === "sql");
          setSqlRecentQuizzes(sqlOnly);
          localStorage.setItem("nl2query-recent-quizzes-sql", JSON.stringify(sqlOnly));
        }
      }

      // 2. Load PL/SQL recent quizzes
      const rawPlsql = localStorage.getItem("nl2query-recent-quizzes-plsql");
      if (rawPlsql) {
        setPlsqlRecentQuizzes(JSON.parse(rawPlsql));
      } else {
        // Fallback: migrate from legacy key if available
        const legacy = localStorage.getItem("nl2query-recent-quizzes");
        if (legacy) {
          const parsed: RecentQuizRecord[] = JSON.parse(legacy);
          const plsqlOnly = parsed.filter((r) => r.mode === "plsql");
          setPlsqlRecentQuizzes(plsqlOnly);
          localStorage.setItem("nl2query-recent-quizzes-plsql", JSON.stringify(plsqlOnly));
        }
      }
    } catch {}
  }, []);

  // Mode-isolated active recent quizzes list
  const activeRecentQuizzes = useMemo(() => {
    return mode === "sql" ? sqlRecentQuizzes : plsqlRecentQuizzes;
  }, [mode, sqlRecentQuizzes, plsqlRecentQuizzes]);

  const handleClearRecentQuizzes = () => {
    const label = mode === "sql" ? "SQL" : "PL/SQL";
    if (confirm(`Are you sure you want to clear your recent ${label} quizzes history?`)) {
      if (mode === "sql") {
        setSqlRecentQuizzes([]);
        try {
          localStorage.removeItem("nl2query-recent-quizzes-sql");
        } catch {}
      } else {
        setPlsqlRecentQuizzes([]);
        try {
          localStorage.removeItem("nl2query-recent-quizzes-plsql");
        } catch {}
      }
    }
  };

  // Active Quiz State
  const [sessionQuestions, setSessionQuestions] = useState<QuizQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [questionRecords, setQuestionRecords] = useState<
    Record<
      string,
      {
        isSubmitted: boolean;
        isSkipped: boolean;
        isCorrect?: boolean;
        selectedOption?: number;
        userCode?: string;
        feedback?: string;
      }
    >
  >({});

  // Active question inputs
  const [selectedOption, setSelectedOption] = useState<number | undefined>(undefined);
  const [userCode, setUserCode] = useState<string>("");
  const [showExplanation, setShowExplanation] = useState<boolean>(false);

  // Finish confirmation modal
  const [isFinishModalOpen, setIsFinishModalOpen] = useState(false);

  // Current question on screen
  const currentQuestion: QuizQuestion | undefined = sessionQuestions[currentIndex];

  // Sync inputs when currentIndex or question changes
  useEffect(() => {
    if (currentQuestion) {
      const rec = questionRecords[currentQuestion.id];
      if (rec) {
        setSelectedOption(rec.selectedOption);
        setUserCode(rec.userCode ?? currentQuestion.starterCode ?? "");
        setShowExplanation(rec.isSubmitted);
      } else {
        setSelectedOption(undefined);
        setUserCode(currentQuestion.starterCode ?? "");
        setShowExplanation(false);
      }
    }
  }, [currentIndex, currentQuestion, questionRecords]);

  // Start Quiz Handler
  const handleStartQuiz = () => {
    const pool = mode === "sql" ? SQL_QUIZ_QUESTIONS : PLSQL_QUIZ_QUESTIONS;

    // Filter by selected difficulties
    const matching = pool.filter((q) => selectedDifficulties.has(q.difficulty));

    if (matching.length === 0) {
      alert("Please select at least one difficulty level.");
      return;
    }

    // Shuffle and pick desired count (clamped to <= 20)
    const countToPick = Math.min(Math.max(1, questionCount), 20);
    const shuffled = [...matching].sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, Math.min(countToPick, shuffled.length));

    setSessionQuestions(selected);
    setCurrentIndex(0);
    setQuestionRecords({});
    setQuizStartTime(Date.now());
    setQuizState("active");
  };

  // Toggle Difficulty in Setup
  const toggleDifficulty = (diff: "Easy" | "Medium" | "Hard") => {
    setSelectedDifficulties((prev) => {
      const next = new Set(prev);
      if (next.has(diff)) {
        if (next.size > 1) {
          next.delete(diff);
        } else {
          alert("At least one difficulty level must remain selected.");
          return prev;
        }
      } else {
        next.add(diff);
      }
      return next;
    });
  };

  // Handle Question Submission
  const handleSubmitAnswer = () => {
    if (!currentQuestion) return;

    if (currentQuestion.type === "mcq") {
      if (selectedOption === undefined) {
        alert("Please select one of the options before submitting.");
        return;
      }
      const isCorrect = selectedOption === currentQuestion.correctAnswer;
      setQuestionRecords((prev) => ({
        ...prev,
        [currentQuestion.id]: {
          isSubmitted: true,
          isSkipped: false,
          isCorrect,
          selectedOption,
          feedback: isCorrect
            ? "Correct! Well done."
            : `Incorrect. The correct option is (${String.fromCharCode(
                65 + (currentQuestion.correctAnswer ?? 0)
              )}).`,
        },
      }));
      setShowExplanation(true);
    } else {
      // Script submission
      if (!userCode.trim()) {
        alert("Please write your query/script before submitting.");
        return;
      }
      const result = validateScriptAnswer(userCode, currentQuestion);
      setQuestionRecords((prev) => ({
        ...prev,
        [currentQuestion.id]: {
          isSubmitted: true,
          isSkipped: false,
          isCorrect: result.isCorrect,
          userCode,
          feedback: result.feedback,
        },
      }));
      setShowExplanation(true);
    }
  };

  // Handle Skip Question
  const handleSkipQuestion = () => {
    if (!currentQuestion) return;

    // Mark as skipped in records
    setQuestionRecords((prev) => {
      if (prev[currentQuestion.id]?.isSubmitted) return prev;
      return {
        ...prev,
        [currentQuestion.id]: {
          isSubmitted: false,
          isSkipped: true,
          selectedOption,
          userCode,
          feedback: "Question skipped.",
        },
      };
    });

    // Advance to next question or conclude quiz if on last question
    if (currentIndex < sessionQuestions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      // Last question skipped, finish quiz
      handleFinishQuizConfirmed();
    }
  };

  // Handle Next Question (only clickable when submitted & results shown)
  const handleNextQuestion = () => {
    if (currentIndex < sessionQuestions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      // Last question finished
      handleFinishQuizConfirmed();
    }
  };

  // Confirm Finish Quiz
  const handleFinishQuizConfirmed = () => {
    setIsFinishModalOpen(false);

    // Calculate final stats and time taken
    const elapsedSeconds = quizStartTime
      ? Math.max(1, Math.round((Date.now() - quizStartTime) / 1000))
      : 0;

    let correctCount = 0;
    const updatedRecords = { ...questionRecords };

    for (const q of sessionQuestions) {
      if (!updatedRecords[q.id]?.isSubmitted && !updatedRecords[q.id]?.isSkipped) {
        updatedRecords[q.id] = {
          isSubmitted: false,
          isSkipped: true,
          feedback: "Skipped before completion.",
        };
      }
      if (updatedRecords[q.id]?.isSubmitted && updatedRecords[q.id]?.isCorrect) {
        correctCount++;
      }
    }

    setQuestionRecords(updatedRecords);

    const total = sessionQuestions.length;
    const accuracy = total > 0 ? Math.round((correctCount / total) * 100) : 0;

    // Save to Recent Quizzes history
    const newRecord: RecentQuizRecord = {
      id: `quiz-${Date.now()}`,
      mode,
      timestamp: Date.now(),
      score: correctCount,
      total,
      accuracy,
      timeTakenSeconds: elapsedSeconds,
      difficulties: Array.from(selectedDifficulties),
    };

    // Save to isolated Recent Quizzes history by mode
    if (mode === "sql") {
      setSqlRecentQuizzes((prev) => {
        const updated = [newRecord, ...prev].slice(0, 20);
        try {
          localStorage.setItem("nl2query-recent-quizzes-sql", JSON.stringify(updated));
        } catch {}
        return updated;
      });
    } else {
      setPlsqlRecentQuizzes((prev) => {
        const updated = [newRecord, ...prev].slice(0, 20);
        try {
          localStorage.setItem("nl2query-recent-quizzes-plsql", JSON.stringify(updated));
        } catch {}
        return updated;
      });
    }

    setQuizState("finished");
  };

  // Attempted questions list (stores and shows all attempted or skipped questions)
  const attemptedQuestions = useMemo(() => {
    return sessionQuestions
      .map((q, idx) => ({ q, originalIndex: idx, rec: questionRecords[q.id] }))
      .filter((item) => item.rec?.isSubmitted || item.rec?.isSkipped);
  }, [sessionQuestions, questionRecords]);

  // Find first unattempted question index to allow "Resume" when reviewing attempted
  const firstUnattemptedIndex = useMemo(() => {
    return sessionQuestions.findIndex(
      (q) => !questionRecords[q.id]?.isSubmitted && !questionRecords[q.id]?.isSkipped
    );
  }, [sessionQuestions, questionRecords]);

  // Statistics calculation
  const summaryStats = useMemo(() => {
    let correct = 0;
    let incorrect = 0;
    let skipped = 0;

    for (const q of sessionQuestions) {
      const rec = questionRecords[q.id];
      if (rec?.isSubmitted) {
        if (rec.isCorrect) correct++;
        else incorrect++;
      } else if (rec?.isSkipped) {
        skipped++;
      } else {
        skipped++;
      }
    }

    const total = sessionQuestions.length;
    const attemptedCount = correct + incorrect;
    const accuracy = attemptedCount > 0 ? Math.round((correct / attemptedCount) * 100) : 0;
    const scorePct = total > 0 ? Math.round((correct / total) * 100) : 0;

    return { total, correct, incorrect, skipped, attemptedCount, accuracy, scorePct };
  }, [sessionQuestions, questionRecords]);

  const currentRec = currentQuestion ? questionRecords[currentQuestion.id] : undefined;
  const isCurrentSubmitted = Boolean(currentRec?.isSubmitted);

  return (
    <div
      className="h-screen w-screen flex flex-col overflow-hidden select-none"
      style={{
        background: "var(--background)",
        color: "var(--foreground)",
      }}
    >
      {/* ============================================================== */}
      {/* TOP HEADER */}
      {/* Header retains ONLY Logo, Mode switcher, and Workspace button (Learn & Help removed). */}
      {/* "Go Back" button is located on the section below the header. */}
      {/* When Quiz is ACTIVE: Shows Logo, session badge, Finish Quiz, and Theme. */}
      {/* ============================================================== */}
      <header
        className="w-full flex items-center justify-between px-4 sm:px-6 py-2.5 sm:py-3 border-b shrink-0 shadow-xs z-30"
        style={{
          background: "var(--panel)",
          borderColor: "var(--border)",
        }}
      >
        {/* Left Side: Logo + Mode Pill + Workspace */}
        <div className="flex items-center gap-3 sm:gap-4 min-w-0">
          {/* Brand Logo */}
          <Link
            href={mode === "sql" ? "/sql" : "/plsql"}
            className="flex items-center gap-2 cursor-pointer focus:outline-none shrink-0"
            title="Return to Workspace"
          >
            <Image src={Logo} alt="NL2Query Logo" className="w-8 h-8" />
            <span className="text-base font-bold tracking-tight" style={{ color: "var(--foreground)" }}>
              NL2Query
            </span>
          </Link>

          {/* If QUIZ IS ACTIVE: Show only clean session identifier badge. No nav links! */}
          {quizState === "active" ? (
            <span
              className="text-[11px] font-mono font-bold px-2.5 py-0.5 rounded-full border uppercase shrink-0"
              style={{
                background: mode === "sql" ? "rgba(56, 189, 248, 0.15)" : "rgba(249, 115, 22, 0.15)",
                borderColor: mode === "sql" ? "rgba(56, 189, 248, 0.3)" : "rgba(249, 115, 22, 0.3)",
                color: mode === "sql" ? "#38bdf8" : "#f97316",
              }}
            >
              {mode === "sql" ? "SQL Quiz" : "PL/SQL Quiz"}
            </span>
          ) : (
            /* When SETUP or FINISHED: Show Mode Switcher & Workspace Button ONLY */
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Mode Switcher Pill */}
              <div
                className="flex items-center rounded-lg border p-0.5 text-xs font-mono shrink-0"
                style={{
                  borderColor: "var(--border)",
                  background: "var(--surface-subtle)",
                }}
              >
                <button
                  type="button"
                  onClick={() => handleSwitchMode("sql")}
                  className={`px-2.5 sm:px-3 py-1 rounded-md font-semibold transition-all cursor-pointer ${
                    mode === "sql"
                      ? isDark
                        ? "bg-sky-500/20 text-sky-300 border border-sky-500/40 font-bold"
                        : "bg-sky-100 text-sky-900 border border-sky-400 font-bold"
                      : "text-zinc-500 hover:text-zinc-300"
                  }`}
                >
                  SQL
                </button>
                <button
                  type="button"
                  onClick={() => handleSwitchMode("plsql")}
                  className={`px-2.5 sm:px-3 py-1 rounded-md font-semibold transition-all cursor-pointer ${
                    mode === "plsql"
                      ? isDark
                        ? "bg-orange-500/20 text-orange-300 border border-orange-500/40 font-bold"
                        : "bg-orange-100 text-orange-900 border border-orange-400 font-bold"
                      : "text-zinc-500 hover:text-zinc-300"
                  }`}
                >
                  PL/SQL
                </button>
              </div>

              {/* ONLY Workspace navigation button (Learn, Help removed) */}
              <button
                type="button"
                onClick={() => router.push(mode === "sql" ? "/sql" : "/plsql")}
                className="hidden sm:flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer shadow-2xs hover:bg-[var(--surface-hover)]"
                style={{
                  background: "var(--surface-subtle)",
                  borderColor: "var(--border)",
                  color: "var(--foreground)",
                }}
              >
                Workspace
              </button>
            </div>
          )}
        </div>

        {/* Right Section: Only Essential Buttons when Active (Finish Quiz & Theme). Recent button ONLY before start! */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Recent Quizzes drawer toggle: ONLY VISIBLE BEFORE START (Setup / Finished) */}
          {quizState !== "active" && (
            <button
              type="button"
              onClick={() => setShowRecentDrawer((prev) => !prev)}
              className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer shadow-2xs"
              style={{
                background: "var(--surface-subtle)",
                borderColor: "var(--border)",
                color: "var(--foreground)",
              }}
              title={`View Recent ${mode === "sql" ? "SQL" : "PL/SQL"} Quizzes`}
            >
              <span>⏱️</span>
              <span className="hidden sm:inline">Recent</span>
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-[var(--accent)] text-[var(--accent-foreground)] font-mono">
                {activeRecentQuizzes.length}
              </span>
            </button>
          )}

          {/* Essential Button: Finish Quiz (when quiz is active) */}
          {quizState === "active" && (
            <button
              type="button"
              onClick={() => setIsFinishModalOpen(true)}
              className="px-3.5 py-1.5 rounded-lg text-xs font-bold border transition-all cursor-pointer hover:bg-rose-500/10 text-rose-500 border-rose-500/40 active:scale-95 shadow-xs"
            >
              Finish Quiz
            </button>
          )}

          {/* Essential Button: Theme switcher */}
          <button
            type="button"
            onClick={() => handleThemeChange(isDark ? "pearl" : "slate")}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all cursor-pointer shadow-2xs hover:opacity-90 select-none"
            style={{
              background: "var(--surface-subtle)",
              color: "var(--foreground)",
              borderColor: "var(--border)",
            }}
          >
            {isDark ? (
              <>
                <span className="text-indigo-400">🌙</span>
                <span className="font-semibold text-xs hidden sm:inline">Dark</span>
              </>
            ) : (
              <>
                <span className="text-amber-500">☀️</span>
                <span className="font-semibold text-xs hidden sm:inline">Light</span>
              </>
            )}
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex-1 min-h-0 flex overflow-hidden w-full relative">
        {/* ============================================================== */}
        {/* 1. SETUP / PRE-QUIZ SCREEN WITH RIGHT PANE (BEFORE QUIZ STARTS) */}
        {/* ============================================================== */}
        {quizState === "setup" && (
          <div className="flex-1 flex flex-col overflow-hidden w-full relative">
            {/* Dedicated Top Action Bar on the section below the Nav Bar */}
            <div
              className="w-full px-4 sm:px-6 py-2.5 border-b flex items-center justify-between shrink-0"
              style={{
                background: "var(--panel)",
                borderColor: "var(--border)",
              }}
            >
              {/* Go Back button positioned cleanly at the top-left of the section below the nav */}
              <button
                type="button"
                onClick={() => router.push(mode === "sql" ? "/sql" : "/plsql")}
                className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer shadow-2xs hover:bg-[var(--surface-hover)] active:scale-95"
                style={{
                  background: "var(--surface-subtle)",
                  borderColor: "var(--border)",
                  color: "var(--foreground)",
                }}
                title="Return to Workspace"
              >
                <span className="text-sm font-mono leading-none">←</span>
                <span>Go Back</span>
              </button>

              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-500">
                  {mode === "sql" ? "SQL Assessment Setup" : "PL/SQL Assessment Setup"}
                </span>
              </div>
            </div>

            {/* Split Content: Center Setup Form + Right Recent Quizzes Pane */}
            <div className="flex-1 flex overflow-hidden w-full relative">
              {/* Left/Center Setup Form */}
              <div className="flex-1 overflow-y-auto flex flex-col items-center justify-center p-4 sm:p-8">
                <div
                  className="w-full max-w-xl p-6 sm:p-8 rounded-3xl border shadow-lg space-y-7 animate-in fade-in zoom-in-95 duration-200"
                style={{
                  background: "var(--panel)",
                  borderColor: "var(--border)",
                }}
              >
                {/* Header Title */}
                <div className="text-center space-y-2">
                  <span
                    className="text-xs font-mono font-bold px-3 py-1 rounded-full uppercase tracking-wider border inline-block"
                    style={{
                      background: mode === "sql" ? "rgba(56, 189, 248, 0.15)" : "rgba(249, 115, 22, 0.15)",
                      borderColor: mode === "sql" ? "rgba(56, 189, 248, 0.3)" : "rgba(249, 115, 22, 0.3)",
                      color: mode === "sql" ? "#38bdf8" : "#f97316",
                    }}
                  >
                    {mode === "sql" ? "SQL Assessment" : "PL/SQL Assessment"}
                  </span>
                  <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
                    Quiz Configuration
                  </h1>
                  <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 max-w-md mx-auto">
                    Select your desired difficulties and question count. Questions will be presented one at a time with instant results.
                  </p>
                </div>

                {/* 1. Difficulty Multi-Select (Default: All Difficulties) */}
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-300">
                      Difficulty (Multiple Options Allowed):
                    </label>
                    <button
                      type="button"
                      onClick={() => setSelectedDifficulties(new Set(["Easy", "Medium", "Hard"]))}
                      className="text-[11px] text-zinc-500 dark:text-zinc-400 hover:text-[var(--accent)] underline cursor-pointer"
                    >
                      Select All
                    </button>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    {(["Easy", "Medium", "Hard"] as const).map((diff) => {
                      const isSelected = selectedDifficulties.has(diff);
                      const colors = {
                        Easy: { border: "#10b981", text: "#10b981", bg: "rgba(16, 185, 129, 0.15)" },
                        Medium: { border: "#f59e0b", text: "#f59e0b", bg: "rgba(245, 158, 11, 0.15)" },
                        Hard: { border: "#ef4444", text: "#ef4444", bg: "rgba(239, 68, 68, 0.15)" },
                      }[diff];

                      return (
                        <button
                          key={diff}
                          type="button"
                          onClick={() => toggleDifficulty(diff)}
                          className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-1 transition-all cursor-pointer select-none ${
                            isSelected ? "shadow-xs" : "opacity-60 hover:opacity-100"
                          }`}
                          style={{
                            background: isSelected ? colors.bg : "var(--surface-subtle)",
                            borderColor: isSelected ? colors.border : "var(--border)",
                            color: isSelected ? colors.text : "var(--muted)",
                          }}
                        >
                          <span className="text-sm font-bold">{diff}</span>
                          <span className="text-[10px] opacity-75 font-mono">
                            {isSelected ? "✓ Included" : "+ Add"}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 2. Number of Questions Selection (<= 20, Default: 10) */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-300">
                      Number of Questions (Max 20):
                    </label>
                    <span className="text-sm font-bold font-mono text-[var(--accent)]">
                      {questionCount} Questions
                    </span>
                  </div>

                  {/* Quick Pills */}
                  <div className="grid grid-cols-4 gap-2">
                    {[5, 10, 15, 20].map((num) => (
                      <button
                        key={num}
                        type="button"
                        onClick={() => setQuestionCount(num)}
                        className={`py-2 rounded-lg text-xs font-bold font-mono border transition-all cursor-pointer ${
                          questionCount === num ? "shadow-xs" : "opacity-70 hover:opacity-100"
                        }`}
                        style={{
                          background: questionCount === num ? "var(--accent)" : "var(--surface-subtle)",
                          borderColor: questionCount === num ? "var(--accent)" : "var(--border)",
                          color: questionCount === num ? "var(--accent-foreground)" : "var(--foreground)",
                        }}
                      >
                        {num} Qs
                      </button>
                    ))}
                  </div>

                  {/* Slider for fine tuning */}
                  <input
                    type="range"
                    min={1}
                    max={20}
                    value={questionCount}
                    onChange={(e) => setQuestionCount(Number(e.target.value))}
                    className="w-full accent-[var(--accent)] cursor-pointer"
                  />
                </div>

                {/* Centered Start Quiz Button below filter area */}
                <div className="pt-2 flex flex-col items-center justify-center">
                  <button
                    type="button"
                    onClick={handleStartQuiz}
                    className="w-full sm:w-2/3 py-3.5 px-6 rounded-2xl text-sm sm:text-base font-bold shadow-md hover:shadow-lg transition-all cursor-pointer active:scale-98 flex items-center justify-center gap-2"
                    style={{
                      background: "var(--accent)",
                      color: "var(--accent-foreground)",
                    }}
                  >
                    <span>Start Quiz</span>
                    <span>🚀</span>
                  </button>
                  <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-2 text-center">
                    Questions are presented 1 at a time. Options: Skip & Submit only.
                  </p>
                </div>
              </div>
            </div>

            {/* Right Pane: Recent Quizzes subsection ONLY shown before quiz starts */}
            <div className="hidden lg:flex w-80 xl:w-96 border-l shrink-0 flex-col overflow-hidden" style={{ borderColor: "var(--border)" }}>
              <RecentQuizzesPane
                mode={mode}
                records={activeRecentQuizzes}
                onClear={handleClearRecentQuizzes}
              />
            </div>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* 2. ACTIVE QUIZ SCREEN (LEFT ATTEMPTED + CENTER QUESTION) */}
        {/* RECENT QUIZZES IS STRICTLY NOT SHOWN WHILE QUIZ IS IN SESSION */}
        {/* ============================================================== */}
        {quizState === "active" && currentQuestion && (
          <div className="flex-1 flex flex-col md:flex-row overflow-hidden w-full">
            {/* ------------------------------------------------------------- */}
            {/* LEFT SIDEBAR: Attempted Subsection (Theme Palette + LeetCode Icons) */}
            {/* ------------------------------------------------------------- */}
            <aside
              className="w-full md:w-80 lg:w-88 border-b md:border-b-0 md:border-r flex flex-col shrink-0 overflow-hidden"
              style={{
                background: "var(--panel)",
                borderColor: "var(--border)",
              }}
            >
              {/* Sidebar Header */}
              <div
                className="p-3.5 sm:p-4 border-b flex items-center justify-between shrink-0"
                style={{
                  borderColor: "var(--border)",
                  background: "var(--surface-subtle)",
                }}
              >
                <div>
                  <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                    <span>Attempted</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-[var(--accent)] text-[var(--accent-foreground)] font-mono font-bold">
                      {attemptedQuestions.length} / {sessionQuestions.length}
                    </span>
                  </h2>
                  <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5">
                    Stores and shows all attempted questions
                  </p>
                </div>
              </div>

              {/* Sidebar Attempted Questions List */}
              <div className="flex-1 overflow-y-auto p-2.5 space-y-1.5 scrollbar-thin">
                {attemptedQuestions.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center p-6 text-center">
                    <div
                      className="w-12 h-12 rounded-2xl mb-3 flex items-center justify-center border text-xl"
                      style={{
                        background: "var(--surface-subtle)",
                        borderColor: "var(--border)",
                      }}
                    >
                      <span>📝</span>
                    </div>
                    <p className="text-xs font-bold" style={{ color: "var(--foreground)" }}>
                      No Questions Attempted Yet
                    </p>
                    <p className="text-[11px] mt-1 text-zinc-500 dark:text-zinc-400 max-w-[200px]">
                      Questions you submit or skip will appear here with their LeetCode status icon.
                    </p>
                  </div>
                ) : (
                  attemptedQuestions.map((item) => {
                    const isActive = item.originalIndex === currentIndex;
                    const isSubmitted = item.rec?.isSubmitted;
                    const isCorrect = item.rec?.isCorrect;
                    const isSkipped = item.rec?.isSkipped;

                    return (
                      <button
                        key={item.q.id}
                        type="button"
                        onClick={() => setCurrentIndex(item.originalIndex)}
                        className={`w-full p-2.5 rounded-xl border text-left flex items-center justify-between gap-3 transition-all cursor-pointer ${
                          isActive
                            ? "shadow-xs border-[var(--accent)]"
                            : "border-transparent hover:border-[var(--border)] hover:bg-[var(--surface-subtle)]"
                        }`}
                        style={{
                          background: isActive
                            ? "rgba(var(--accent-rgb, 255, 106, 61), 0.1)"
                            : "transparent",
                        }}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <span
                            className={`w-6 h-6 rounded-md flex items-center justify-center text-xs font-mono font-bold shrink-0 border ${
                              isActive
                                ? "bg-[var(--accent)] text-[var(--accent-foreground)]"
                                : "bg-[var(--surface-subtle)] text-zinc-400"
                            }`}
                            style={{ borderColor: "var(--border)" }}
                          >
                            {item.originalIndex + 1}
                          </span>
                          <div className="min-w-0">
                            <p className="text-xs font-medium text-zinc-900 dark:text-zinc-100 truncate">
                              {item.q.topic}
                            </p>
                            <span
                              className="text-[10px] font-mono font-semibold"
                              style={{
                                color:
                                  item.q.difficulty === "Easy"
                                    ? "#10b981"
                                    : item.q.difficulty === "Medium"
                                    ? "#f59e0b"
                                    : "#ef4444",
                              }}
                            >
                              {item.q.difficulty} • {item.q.type.toUpperCase()}
                            </span>
                          </div>
                        </div>

                        {/* Right Status Icon (LeetCode style) */}
                        <LeetCodeStatusIcon
                          isSubmitted={isSubmitted}
                          isCorrect={isCorrect}
                          isSkipped={isSkipped}
                        />
                      </button>
                    );
                  })
                )}
              </div>

              {/* Sidebar Footer with LeetCode Icon Legend (clean spacing to prevent clipping) */}
              <div
                className="p-3 sm:p-4 border-t flex items-center justify-between text-[11px] text-zinc-500 dark:text-zinc-400 shrink-0 select-none z-10"
                style={{
                  borderColor: "var(--border)",
                  background: "var(--surface-subtle)",
                }}
              >
                <span className="flex items-center gap-1.5 font-medium">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" /> Correct
                </span>
                <span className="flex items-center gap-1.5 font-medium">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block" /> Incorrect
                </span>
                <span className="flex items-center gap-1.5 font-medium">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block" /> Skipped
                </span>
              </div>
            </aside>

            {/* ------------------------------------------------------------- */}
            {/* CENTER PANEL: 1 Question at a time Screen */}
            {/* ------------------------------------------------------------- */}
            <main
              className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 flex flex-col justify-between"
              style={{ background: "var(--background)" }}
            >
              <div className="w-full max-w-3xl mx-auto space-y-6">
                {/* Banner when reviewing an attempted question */}
                {currentRec?.isSubmitted || currentRec?.isSkipped ? (
                  firstUnattemptedIndex !== -1 && firstUnattemptedIndex !== currentIndex && (
                    <div
                      className="p-3 rounded-xl border flex items-center justify-between text-xs animate-in fade-in duration-150"
                      style={{
                        background: "var(--surface-subtle)",
                        borderColor: "var(--border)",
                      }}
                    >
                      <span className="text-zinc-600 dark:text-zinc-300">
                        Viewing attempted question #{currentIndex + 1}.
                      </span>
                      <button
                        type="button"
                        onClick={() => setCurrentIndex(firstUnattemptedIndex)}
                        className="font-bold text-[var(--accent)] hover:underline cursor-pointer flex items-center gap-1"
                      >
                        <span>Resume Current Question (#{firstUnattemptedIndex + 1})</span>
                        <span>→</span>
                      </button>
                    </div>
                  )
                ) : null}

                {/* Progress bar and counter */}
                <div className="flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400 pb-1">
                  <span className="font-semibold uppercase tracking-wider">
                    Question {currentIndex + 1} of {sessionQuestions.length}
                  </span>
                  <span className="font-mono">
                    {Math.round(((currentIndex + 1) / sessionQuestions.length) * 100)}% through
                  </span>
                </div>
                <div className="w-full bg-zinc-200 dark:bg-zinc-800 h-2 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[var(--accent)] transition-all duration-300"
                    style={{ width: `${((currentIndex + 1) / sessionQuestions.length) * 100}%` }}
                  />
                </div>

                {/* Question Card (Single Question on Screen) */}
                <article
                  className="rounded-2xl border p-5 sm:p-7 shadow-xs space-y-5"
                  style={{
                    background: "var(--panel)",
                    borderColor: isCurrentSubmitted
                      ? currentRec?.isCorrect
                        ? "rgba(16, 185, 129, 0.4)"
                        : "rgba(239, 68, 68, 0.4)"
                      : "var(--border)",
                  }}
                >
                  {/* Card Badges */}
                  <div
                    className="flex flex-wrap items-center justify-between gap-2.5 pb-3 border-b"
                    style={{ borderColor: "var(--border)" }}
                  >
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className="text-xs font-mono font-bold px-2.5 py-1 rounded-md border text-[var(--accent)]"
                        style={{ borderColor: "var(--border)", background: "var(--surface-subtle)" }}
                      >
                        #{String(currentIndex + 1).padStart(2, "0")}
                      </span>
                      <span
                        className="text-[11px] font-semibold px-2.5 py-0.5 rounded-md border text-zinc-800 dark:text-zinc-200"
                        style={{ borderColor: "var(--border)", background: "var(--surface-subtle)" }}
                      >
                        {currentQuestion.topic}
                      </span>
                      <span
                        className="text-[11px] font-bold px-2 py-0.5 rounded-full border uppercase"
                        style={{
                          color:
                            currentQuestion.difficulty === "Easy"
                              ? "#10b981"
                              : currentQuestion.difficulty === "Medium"
                              ? "#f59e0b"
                              : "#ef4444",
                          borderColor:
                            currentQuestion.difficulty === "Easy"
                              ? "rgba(16, 185, 129, 0.3)"
                              : currentQuestion.difficulty === "Medium"
                              ? "rgba(245, 158, 11, 0.3)"
                              : "rgba(239, 68, 68, 0.3)",
                          background:
                            currentQuestion.difficulty === "Easy"
                              ? "rgba(16, 185, 129, 0.1)"
                              : currentQuestion.difficulty === "Medium"
                              ? "rgba(245, 158, 11, 0.1)"
                              : "rgba(239, 68, 68, 0.1)",
                        }}
                      >
                        {currentQuestion.difficulty}
                      </span>
                      <span className="text-[11px] font-mono px-2 py-0.5 rounded border uppercase text-indigo-400 border-indigo-500/30 bg-indigo-500/10">
                        {currentQuestion.type === "mcq" ? "MCQ Choice" : "Script Challenge"}
                      </span>
                    </div>

                    {/* Status on card header */}
                    <div>
                      {isCurrentSubmitted ? (
                        currentRec?.isCorrect ? (
                          <span className="text-xs font-bold text-emerald-500 bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/30 flex items-center gap-1">
                            ✓ Correct
                          </span>
                        ) : (
                          <span className="text-xs font-bold text-rose-500 bg-rose-500/10 px-2.5 py-1 rounded-lg border border-rose-500/30 flex items-center gap-1">
                            ✗ Incorrect
                          </span>
                        )
                      ) : currentRec?.isSkipped ? (
                        <span className="text-xs font-bold text-amber-500 bg-amber-500/10 px-2.5 py-1 rounded-lg border border-amber-500/30 flex items-center gap-1">
                          − Skipped
                        </span>
                      ) : (
                        <span className="text-xs text-zinc-500 bg-zinc-200 dark:bg-zinc-800 px-2.5 py-1 rounded-lg border border-zinc-300 dark:border-zinc-700">
                          Unanswered
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Question Prompt */}
                  <h3 className="text-base sm:text-lg font-semibold leading-relaxed text-zinc-900 dark:text-zinc-100">
                    {currentQuestion.question}
                  </h3>

                  {/* Code snippet if any */}
                  {currentQuestion.codeSnippet && (
                    <div className="p-3.5 rounded-xl font-mono text-xs overflow-x-auto border bg-black/85 border-zinc-800 text-orange-300">
                      <pre>{currentQuestion.codeSnippet}</pre>
                    </div>
                  )}

                  {/* MCQ Options */}
                  {currentQuestion.type === "mcq" && currentQuestion.options && (
                    <div className="space-y-2.5 pt-1">
                      {currentQuestion.options.map((opt, optIdx) => {
                        const letter = String.fromCharCode(65 + optIdx);
                        const isSelected = selectedOption === optIdx;
                        const isAnswer = optIdx === currentQuestion.correctAnswer;

                        let cardBg = "var(--surface-subtle)";
                        let cardBorder = "var(--border)";
                        let letterBg = "var(--panel)";
                        let letterText = "var(--foreground)";

                        if (isCurrentSubmitted) {
                          if (isAnswer) {
                            cardBg = "rgba(16, 185, 129, 0.12)";
                            cardBorder = "#10b981";
                            letterBg = "#10b981";
                            letterText = "#ffffff";
                          } else if (isSelected && !currentRec?.isCorrect) {
                            cardBg = "rgba(239, 68, 68, 0.12)";
                            cardBorder = "#ef4444";
                            letterBg = "#ef4444";
                            letterText = "#ffffff";
                          }
                        } else if (isSelected) {
                          cardBg = "rgba(var(--accent-rgb, 255, 106, 61), 0.12)";
                          cardBorder = "var(--accent)";
                          letterBg = "var(--accent)";
                          letterText = "var(--accent-foreground)";
                        }

                        return (
                          <button
                            key={optIdx}
                            type="button"
                            disabled={isCurrentSubmitted}
                            onClick={() => !isCurrentSubmitted && setSelectedOption(optIdx)}
                            className={`w-full flex items-center gap-3 p-3.5 rounded-xl border text-left transition-all select-none ${
                              isCurrentSubmitted
                                ? "cursor-default"
                                : "cursor-pointer hover:border-[var(--accent)] active:scale-[0.99]"
                            }`}
                            style={{
                              background: cardBg,
                              borderColor: cardBorder,
                            }}
                          >
                            <div
                              className="w-7 h-7 rounded-lg border flex items-center justify-center text-xs font-mono font-bold shrink-0 transition-colors"
                              style={{
                                background: letterBg,
                                borderColor: cardBorder,
                                color: letterText,
                              }}
                            >
                              {letter}
                            </div>
                            <span className="text-xs sm:text-sm font-medium flex-1 text-zinc-900 dark:text-zinc-100">
                              {opt}
                            </span>
                            {isCurrentSubmitted && isAnswer && (
                              <span className="text-xs font-bold text-emerald-500 bg-emerald-500/20 px-2 py-0.5 rounded border border-emerald-500/40">
                                Correct Answer
                              </span>
                            )}
                            {isCurrentSubmitted && isSelected && !currentRec?.isCorrect && (
                              <span className="text-xs font-bold text-rose-500 bg-rose-500/20 px-2 py-0.5 rounded border border-rose-500/40">
                                Your Choice
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  )}

                  {/* Script Code Editor */}
                  {currentQuestion.type === "script" && (
                    <div className="space-y-2 pt-1">
                      <div className="flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400">
                        <span>Write your solution:</span>
                        {!isCurrentSubmitted && (
                          <button
                            type="button"
                            onClick={() => setUserCode(currentQuestion.starterCode ?? "")}
                            className="opacity-70 hover:opacity-100 text-xs font-mono cursor-pointer"
                          >
                            Reset Starter Code
                          </button>
                        )}
                      </div>
                      <textarea
                        value={userCode}
                        disabled={isCurrentSubmitted}
                        onChange={(e) => setUserCode(e.target.value)}
                        rows={6}
                        placeholder="-- Type your query/script here..."
                        className="w-full p-4 font-mono text-xs sm:text-sm leading-relaxed rounded-xl border outline-none resize-y"
                        style={{
                          background: "var(--surface-subtle)",
                          borderColor: "var(--border)",
                          color: "var(--foreground)",
                        }}
                      />
                    </div>
                  )}

                  {/* Feedback Banner upon submission */}
                  {isCurrentSubmitted && (
                    <div
                      className={`p-4 rounded-xl border text-xs sm:text-sm flex flex-col gap-1.5 animate-in fade-in-50 duration-150 ${
                        currentRec?.isCorrect
                          ? "bg-emerald-500/10 border-emerald-500/40 text-emerald-700 dark:text-emerald-300"
                          : "bg-rose-500/10 border-rose-500/40 text-rose-700 dark:text-rose-300"
                      }`}
                    >
                      <div className="flex items-center gap-2 font-bold">
                        <span>{currentRec?.isCorrect ? "🎉 Correct!" : "❌ Incorrect"}</span>
                      </div>
                      <p className="font-sans leading-relaxed text-xs opacity-90">
                        {currentRec?.feedback}
                      </p>
                    </div>
                  )}

                  {/* Concept Explanation upon submission */}
                  {showExplanation && currentQuestion.explanation && (
                    <div
                      className="p-4 rounded-xl border space-y-1.5"
                      style={{ background: "var(--surface-subtle)", borderColor: "var(--border)" }}
                    >
                      <div className="flex items-center gap-1.5 text-xs font-mono font-bold uppercase tracking-wider text-[var(--accent)]">
                        <span>📖 Explanation:</span>
                      </div>
                      <p className="text-xs leading-relaxed text-zinc-700 dark:text-zinc-300">
                        {currentQuestion.explanation}
                      </p>
                    </div>
                  )}
                </article>

                {/* ------------------------------------------------------------- */}
                {/* ACTION BUTTONS: "Skip", "Submit" only & "Next" (Visible only when submitted) */}
                {/* ------------------------------------------------------------- */}
                <div className="flex items-center justify-end gap-3 pt-2">
                  {!isCurrentSubmitted ? (
                    <>
                      {/* Skip Button: immediately marks skipped and moves to next */}
                      <button
                        type="button"
                        onClick={handleSkipQuestion}
                        className="px-6 py-2.5 rounded-xl text-xs sm:text-sm font-semibold border transition-all cursor-pointer hover:bg-[var(--surface-hover)] active:scale-95"
                        style={{
                          background: "var(--surface-subtle)",
                          borderColor: "var(--border)",
                          color: "var(--muted)",
                        }}
                      >
                        Skip
                      </button>

                      {/* Submit Button */}
                      <button
                        type="button"
                        onClick={handleSubmitAnswer}
                        className="px-7 py-2.5 rounded-xl text-xs sm:text-sm font-bold shadow-xs transition-all cursor-pointer active:scale-95"
                        style={{
                          background: "var(--accent)",
                          color: "var(--accent-foreground)",
                        }}
                      >
                        Submit
                      </button>
                    </>
                  ) : (
                    /* Next Button (clickable ONLY when submitted & results shown) */
                    <button
                      type="button"
                      onClick={handleNextQuestion}
                      className="px-8 py-2.5 rounded-xl text-xs sm:text-sm font-bold shadow-sm transition-all cursor-pointer active:scale-95 flex items-center gap-2"
                      style={{
                        background: "var(--accent)",
                        color: "var(--accent-foreground)",
                      }}
                    >
                      <span>
                        {currentIndex < sessionQuestions.length - 1 ? "Next" : "Finish Quiz"}
                      </span>
                      <span>→</span>
                    </button>
                  )}
                </div>
              </div>
            </main>
          </div>
        )}

        {/* ============================================================== */}
        {/* 3. FINISHED QUIZ / SUMMARY SCREEN */}
        {/* ============================================================== */}
        {quizState === "finished" && (
          <div className="flex-1 flex flex-col overflow-hidden w-full">
            {/* Dedicated Top Action Bar on the section below the Nav Bar */}
            <div
              className="w-full px-4 sm:px-6 py-2.5 border-b flex items-center justify-between shrink-0"
              style={{
                background: "var(--panel)",
                borderColor: "var(--border)",
              }}
            >
              <button
                type="button"
                onClick={() => router.push(mode === "sql" ? "/sql" : "/plsql")}
                className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer shadow-2xs hover:bg-[var(--surface-hover)] active:scale-95"
                style={{
                  background: "var(--surface-subtle)",
                  borderColor: "var(--border)",
                  color: "var(--foreground)",
                }}
                title="Return to Workspace"
              >
                <span className="text-sm font-mono leading-none">←</span>
                <span>Go Back</span>
              </button>

              <span className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-500">
                Assessment Results
              </span>
            </div>

            <div className="flex-1 overflow-y-auto p-4 sm:p-8 flex items-center justify-center">
              <div
                className="w-full max-w-2xl p-6 sm:p-9 rounded-3xl border shadow-xl space-y-7 animate-in fade-in zoom-in-95 duration-200"
                style={{
                  background: "var(--panel)",
                  borderColor: "var(--border)",
                }}
              >
                {/* Celebration Icon & Title */}
                <div className="text-center space-y-2">
                  <div className="w-16 h-16 rounded-2xl mx-auto flex items-center justify-center text-3xl shadow-inner border bg-[var(--surface-subtle)] border-[var(--border)]">
                    {summaryStats.accuracy >= 70 ? "🏆" : "📊"}
                  </div>
                  <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
                    Quiz Completed!
                  </h1>
                  <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400">
                    Here is the breakdown of your performance on {mode.toUpperCase()} assessment.
                  </p>
                </div>

                {/* Score Metric Cards */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                  <div
                    className="p-3.5 rounded-2xl border"
                    style={{ background: "var(--surface-subtle)", borderColor: "var(--border)" }}
                  >
                    <span className="text-[11px] font-semibold text-zinc-400 uppercase">Score</span>
                    <p className="text-xl sm:text-2xl font-bold font-mono text-[var(--foreground)] mt-1">
                      {summaryStats.correct} / {summaryStats.total}
                    </p>
                  </div>
                  <div className="p-3.5 rounded-2xl border border-emerald-500/30 bg-emerald-500/10">
                    <span className="text-[11px] font-semibold text-emerald-400 uppercase">Correct</span>
                    <p className="text-xl sm:text-2xl font-bold font-mono text-emerald-500 mt-1">
                      {summaryStats.correct}
                    </p>
                  </div>
                  <div className="p-3.5 rounded-2xl border border-rose-500/30 bg-rose-500/10">
                    <span className="text-[11px] font-semibold text-rose-400 uppercase">Incorrect</span>
                    <p className="text-xl sm:text-2xl font-bold font-mono text-rose-500 mt-1">
                      {summaryStats.incorrect}
                    </p>
                  </div>
                  <div className="p-3.5 rounded-2xl border border-amber-500/30 bg-amber-500/10">
                    <span className="text-[11px] font-semibold text-amber-400 uppercase">Skipped</span>
                    <p className="text-xl sm:text-2xl font-bold font-mono text-amber-500 mt-1">
                      {summaryStats.skipped}
                    </p>
                  </div>
                </div>

                {/* Progress Summary Breakdown Bar */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400">
                    <span>Accuracy: <strong>{summaryStats.accuracy}%</strong></span>
                    <span>Completion: <strong>{summaryStats.scorePct}%</strong></span>
                  </div>
                  <div className="w-full bg-zinc-200 dark:bg-zinc-800 h-3 rounded-full overflow-hidden flex">
                    <div
                      className="bg-emerald-500 h-full"
                      style={{ width: `${(summaryStats.correct / summaryStats.total) * 100}%` }}
                      title={`Correct: ${summaryStats.correct}`}
                    />
                    <div
                      className="bg-rose-500 h-full"
                      style={{ width: `${(summaryStats.incorrect / summaryStats.total) * 100}%` }}
                      title={`Incorrect: ${summaryStats.incorrect}`}
                    />
                    <div
                      className="bg-amber-500 h-full"
                      style={{ width: `${(summaryStats.skipped / summaryStats.total) * 100}%` }}
                      title={`Skipped: ${summaryStats.skipped}`}
                    />
                  </div>
                </div>

                {/* Questions List Review in Summary */}
                <div
                  className="space-y-2 max-h-56 overflow-y-auto p-2 border rounded-2xl scrollbar-thin"
                  style={{ borderColor: "var(--border)", background: "var(--surface-subtle)" }}
                >
                  {sessionQuestions.map((q, i) => {
                    const rec = questionRecords[q.id];
                    const isCorrect = rec?.isCorrect;
                    const isSubmitted = rec?.isSubmitted;
                    const isSkipped = rec?.isSkipped;

                    return (
                      <div
                        key={q.id}
                        className="p-2.5 rounded-xl border flex items-center justify-between gap-3 text-xs"
                        style={{ background: "var(--panel)", borderColor: "var(--border)" }}
                      >
                        <div className="flex items-center gap-2 truncate">
                          <span className="font-mono font-bold opacity-70">#{i + 1}</span>
                          <span className="truncate text-zinc-900 dark:text-zinc-100 font-medium">
                            {q.question}
                          </span>
                        </div>
                        <div className="shrink-0">
                          <LeetCodeStatusIcon
                            isSubmitted={isSubmitted}
                            isCorrect={isCorrect}
                            isSkipped={isSkipped}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setQuizState("setup");
                    }}
                    className="px-6 py-2.5 rounded-xl text-xs sm:text-sm font-bold border transition-all cursor-pointer shadow-xs active:scale-95"
                    style={{
                      background: "var(--accent)",
                      color: "var(--accent-foreground)",
                    }}
                  >
                    Start New Quiz
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setQuizState("active");
                      setCurrentIndex(0);
                    }}
                    className="px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold border transition-all cursor-pointer"
                    style={{
                      background: "var(--surface-subtle)",
                      borderColor: "var(--border)",
                      color: "var(--foreground)",
                    }}
                  >
                    Review Answers
                  </button>
                  <button
                    type="button"
                    onClick={() => router.push(mode === "sql" ? "/sql" : "/plsql")}
                    className="px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold border transition-all cursor-pointer"
                    style={{
                      background: "var(--surface-subtle)",
                      borderColor: "var(--border)",
                      color: "var(--foreground)",
                    }}
                  >
                    Back to Workspace
                  </button>
                </div>
              </div>
            </div>

            {/* Right Pane: Recent Quizzes in summary */}
            <div className="hidden lg:flex w-80 xl:w-96 border-l shrink-0 flex-col overflow-hidden" style={{ borderColor: "var(--border)" }}>
              <RecentQuizzesPane
                mode={mode}
                records={activeRecentQuizzes}
                onClear={handleClearRecentQuizzes}
              />
            </div>
          </div>
        )}
      </div>

      {/* ============================================================== */}
      {/* 4. MODALS & DRAWERS */}
      {/* ============================================================== */}

      {/* Reconfirmation Modal for Finish Quiz */}
      {isFinishModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div
            className="w-full max-w-md p-6 rounded-2xl border shadow-2xl space-y-4 animate-in zoom-in-95 duration-150"
            style={{
              background: "var(--panel)",
              borderColor: "var(--border)",
              color: "var(--foreground)",
            }}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-500 text-lg">
                ⚠️
              </div>
              <div>
                <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
                  Finish Quiz Early?
                </h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  Are you sure you want to end this quiz session?
                </p>
              </div>
            </div>

            <p className="text-xs leading-relaxed text-zinc-600 dark:text-zinc-300">
              Any unanswered questions will be marked as <strong>Skipped</strong>. Your completed submissions will be graded and saved to your recent quizzes history.
            </p>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setIsFinishModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold border transition-colors cursor-pointer"
                style={{
                  background: "var(--surface-subtle)",
                  borderColor: "var(--border)",
                  color: "var(--foreground)",
                }}
              >
                Continue Quiz
              </button>
              <button
                type="button"
                onClick={handleFinishQuizConfirmed}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white transition-colors cursor-pointer shadow-xs"
              >
                Yes, Finish Quiz
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Slide-out Drawer for Recent Quizzes (ONLY available when quiz is NOT active) */}
      {showRecentDrawer && quizState !== "active" && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
          <div
            className="w-full max-w-sm h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-200"
            style={{
              background: "var(--panel)",
            }}
          >
            <div className="p-3 border-b flex items-center justify-between" style={{ borderColor: "var(--border)" }}>
              <span className="text-xs font-bold uppercase tracking-wider">
                Recent {mode === "sql" ? "SQL" : "PL/SQL"} Quizzes
              </span>
              <button
                type="button"
                onClick={() => setShowRecentDrawer(false)}
                className="p-1 rounded-lg text-zinc-400 hover:text-zinc-100 cursor-pointer"
              >
                ✕
              </button>
            </div>
            <div className="flex-1 overflow-hidden">
              <RecentQuizzesPane
                mode={mode}
                records={activeRecentQuizzes}
                onClear={handleClearRecentQuizzes}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
