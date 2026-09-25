"use client";

import React, { useState, useEffect, useMemo, useCallback, useRef } from "react";
import {
  type QuizQuestion,
  SQL_QUIZ_QUESTIONS,
  PLSQL_QUIZ_QUESTIONS,
  SQL_TOPICS,
  PLSQL_TOPICS,
  validateScriptAnswer,
} from "@/lib/quizData";

interface QuizViewProps {
  mode: "sql" | "plsql";
  onBackToWorkspace?: () => void;
}

interface AttemptRecord {
  selectedOption?: number; // for MCQ
  userCode?: string; // for script
  isSubmitted: boolean;
  isCorrect?: boolean;
  feedback?: string;
}

export function QuizView({ mode, onBackToWorkspace }: QuizViewProps) {
  const isSql = mode === "sql";
  const storageKey = `nl2query-quiz-progress-${mode}`;
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Recovery: continuously clamp window and root document scroll to (0, 0)
  useEffect(() => {
    const handleWindowScroll = () => {
      if (window.scrollY !== 0 || window.scrollX !== 0) {
        window.scrollTo(0, 0);
      }
    };
    window.addEventListener("scroll", handleWindowScroll, { passive: true });
    window.scrollTo(0, 0);
    if (document.documentElement) document.documentElement.scrollTop = 0;
    if (document.body) document.body.scrollTop = 0;

    return () => window.removeEventListener("scroll", handleWindowScroll);
  }, []);

  // Questions and topics based on mode
  const allQuestions = useMemo(() => {
    return isSql ? SQL_QUIZ_QUESTIONS : PLSQL_QUIZ_QUESTIONS;
  }, [isSql]);

  const allTopics = useMemo(() => {
    return isSql ? SQL_TOPICS : PLSQL_TOPICS;
  }, [isSql]);

  // User attempts state (persisted in localStorage)
  const [attempts, setAttempts] = useState<Record<string, AttemptRecord>>({});

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        setAttempts(JSON.parse(saved));
      }
    } catch {
      // ignore
    }
  }, [storageKey]);

  // Save to localStorage when attempts change
  const saveAttempt = useCallback(
    (questionId: string, record: AttemptRecord) => {
      setAttempts((prev) => {
        const next = { ...prev, [questionId]: record };
        try {
          localStorage.setItem(storageKey, JSON.stringify(next));
        } catch {
          // ignore
        }
        return next;
      });
    },
    [storageKey]
  );

  // Reset all progress
  const handleResetAll = useCallback(() => {
    if (
      window.confirm(
        "Are you sure you want to reset all your quiz answers and progress for this section?"
      )
    ) {
      setAttempts({});
      try {
        localStorage.removeItem(storageKey);
      } catch {
        // ignore
      }
    }
  }, [storageKey]);

  // Filtering states
  const [difficultyFilter, setDifficultyFilter] = useState<
    "All" | "Easy" | "Medium" | "Hard"
  >("All");
  const [typeFilter, setTypeFilter] = useState<"All" | "mcq" | "script">("All");
  const [topicFilter, setTopicFilter] = useState<string>("All Topics");
  const [statusFilter, setStatusFilter] = useState<
    "All" | "unattempted" | "correct" | "incorrect"
  >("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"questions" | "grid">("questions");

  // Pagination states (allow switching page size or showing all)
  const [pageSize, setPageSize] = useState<number>(10);
  const [currentPage, setCurrentPage] = useState<number>(1);

  // Filtered questions: unattempted questions first, attempted questions moved to the end
  const filteredQuestions = useMemo(() => {
    const list = allQuestions.filter((q) => {
      // Difficulty filter
      if (difficultyFilter !== "All" && q.difficulty !== difficultyFilter) {
        return false;
      }
      // Type filter
      if (typeFilter !== "All" && q.type !== typeFilter) {
        return false;
      }
      // Topic filter
      if (topicFilter !== "All Topics" && q.topic !== topicFilter) {
        return false;
      }
      // Status filter
      const att = attempts[q.id];
      if (statusFilter === "unattempted" && att?.isSubmitted) {
        return false;
      }
      if (statusFilter === "correct" && (!att?.isSubmitted || !att?.isCorrect)) {
        return false;
      }
      if (statusFilter === "incorrect" && (!att?.isSubmitted || att?.isCorrect)) {
        return false;
      }
      // Search query
      if (searchQuery.trim()) {
        const qText = (
          q.question +
          " " +
          q.topic +
          " " +
          (q.explanation || "")
        ).toLowerCase();
        if (!qText.includes(searchQuery.toLowerCase())) {
          return false;
        }
      }
      return true;
    });

    // Partition: unattempted questions first, attempted questions at the end
    const unattempted: QuizQuestion[] = [];
    const attempted: QuizQuestion[] = [];

    for (const q of list) {
      if (attempts[q.id]?.isSubmitted) {
        attempted.push(q);
      } else {
        unattempted.push(q);
      }
    }

    return [...unattempted, ...attempted];
  }, [
    allQuestions,
    difficultyFilter,
    typeFilter,
    topicFilter,
    statusFilter,
    searchQuery,
    attempts,
  ]);

  // Identify boundary where attempted questions start
  const firstAttemptedId = useMemo(() => {
    const hasUnattempted = filteredQuestions.some(
      (q) => !attempts[q.id]?.isSubmitted
    );
    if (!hasUnattempted) return null;
    const first = filteredQuestions.find((q) => attempts[q.id]?.isSubmitted);
    return first?.id ?? null;
  }, [filteredQuestions, attempts]);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [difficultyFilter, typeFilter, topicFilter, statusFilter, searchQuery, pageSize]);

  // Paginated questions
  const effectivePageSize = pageSize === 0 ? filteredQuestions.length : pageSize;
  const totalPages = Math.ceil(filteredQuestions.length / (effectivePageSize || 1)) || 1;
  const paginatedQuestions = useMemo(() => {
    if (pageSize === 0) return filteredQuestions;
    const start = (currentPage - 1) * pageSize;
    return filteredQuestions.slice(start, start + pageSize);
  }, [filteredQuestions, currentPage, pageSize]);

  // Computed summary stats
  const stats = useMemo(() => {
    const total = allQuestions.length;
    let attempted = 0;
    let correct = 0;
    let incorrect = 0;

    for (const q of allQuestions) {
      const att = attempts[q.id];
      if (att?.isSubmitted) {
        attempted++;
        if (att.isCorrect) correct++;
        else incorrect++;
      }
    }

    const accuracy = attempted > 0 ? Math.round((correct / attempted) * 100) : 0;
    const progressPct = Math.round((attempted / total) * 100);
    const unattempted = total - attempted;

    return { total, attempted, correct, incorrect, unattempted, accuracy, progressPct };
  }, [allQuestions, attempts]);

  // Safe container-only scrolling without breaking the outer viewport
  const handleJumpToQuestion = (qId: string) => {
    const idx = filteredQuestions.findIndex((q) => q.id === qId);
    if (idx !== -1) {
      if (pageSize !== 0) {
        const targetPage = Math.floor(idx / pageSize) + 1;
        setCurrentPage(targetPage);
      }
      setActiveTab("questions");

      setTimeout(() => {
        const container = scrollContainerRef.current;
        const el = document.getElementById(`question-card-${qId}`);
        if (container && el) {
          const containerRect = container.getBoundingClientRect();
          const elRect = el.getBoundingClientRect();
          const targetScroll = container.scrollTop + (elRect.top - containerRect.top) - 20;
          container.scrollTo({ top: Math.max(0, targetScroll), behavior: "smooth" });
        }
      }, 100);
    }
  };

  return (
    <div
      ref={scrollContainerRef}
      className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden w-full"
      style={{
        background: "var(--background)",
        color: "var(--foreground)",
      }}
    >
      <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Top Header / Breadcrumb */}
        <div
          className="flex flex-wrap items-center justify-between gap-4 pb-5 border-b"
          style={{ borderColor: "var(--border)" }}
        >
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span
                className="text-xs md:text-sm font-semibold px-2.5 py-1 rounded border uppercase tracking-wider"
                style={{
                  background: isSql
                    ? "rgba(56, 189, 248, 0.12)"
                    : "rgba(249, 115, 22, 0.12)",
                  borderColor: isSql
                    ? "rgba(56, 189, 248, 0.3)"
                    : "rgba(249, 115, 22, 0.3)",
                  color: isSql ? "#38bdf8" : "#f97316",
                }}
              >
                {isSql ? "SQL Mastery Quiz" : "PL/SQL Mastery Quiz"}
              </span>
              <span className="text-xs md:text-sm text-zinc-500 dark:text-zinc-400 font-medium">
                {allQuestions.length} Questions (MCQ Choice &amp; Script Challenges)
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
              {isSql
                ? "SQL Interactive Assessment & Question Bank"
                : "PL/SQL Interactive Assessment & Question Bank"}
            </h1>
            <p className="text-xs md:text-sm text-zinc-600 dark:text-zinc-400 mt-1">
              Select any question to test your knowledge, write queries, and receive instant feedback with canonical solutions.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            {onBackToWorkspace && (
              <button
                type="button"
                onClick={onBackToWorkspace}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs md:text-sm font-semibold border transition-all cursor-pointer hover:opacity-90 shadow-2xs text-zinc-800 dark:text-zinc-200"
                style={{
                  background: "var(--surface-subtle)",
                  borderColor: "var(--border)",
                }}
              >
                <span>←</span>
                <span>Back to Workspace</span>
              </button>
            )}

            <button
              type="button"
              onClick={handleResetAll}
              title="Clear all saved quiz responses"
              className="px-3 py-2 rounded-lg text-xs md:text-sm font-semibold border transition-all cursor-pointer hover:bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30"
            >
              Reset Progress
            </button>
          </div>
        </div>

        {/* Progress & Statistics Banner */}
        <div
          className="p-5 rounded-2xl border shadow-xs"
          style={{
            background: "var(--panel)",
            borderColor: "var(--border)",
          }}
        >
          <div className="flex flex-wrap items-center justify-between gap-4 mb-5">
            {/* Numeric Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6 flex-1 min-w-[280px]">
              {/* Total Questions */}
              <div className="flex flex-col">
                <span className="text-[11px] uppercase tracking-wider font-semibold text-zinc-500 dark:text-zinc-400">
                  Total Questions
                </span>
                <span className="text-2xl sm:text-3xl font-bold font-mono text-zinc-900 dark:text-zinc-100 mt-1">
                  {stats.total}
                </span>
              </div>

              {/* Attempted */}
              <div className="flex flex-col">
                <span className="text-[11px] uppercase tracking-wider font-semibold text-zinc-500 dark:text-zinc-400">
                  Attempted
                </span>
                <span className="text-2xl sm:text-3xl font-bold font-mono text-sky-600 dark:text-sky-400 mt-1">
                  {stats.attempted}{" "}
                  <span className="text-xs font-normal text-zinc-500 dark:text-zinc-400">
                    ({stats.progressPct}%)
                  </span>
                </span>
              </div>

              {/* Correct */}
              <div className="flex flex-col">
                <span className="text-[11px] uppercase tracking-wider font-semibold text-zinc-500 dark:text-zinc-400">
                  Correct
                </span>
                <span className="text-2xl sm:text-3xl font-bold font-mono text-emerald-600 dark:text-emerald-400 mt-1">
                  {stats.correct}
                </span>
              </div>

              {/* Accuracy */}
              <div className="flex flex-col">
                <span className="text-[11px] uppercase tracking-wider font-semibold text-zinc-500 dark:text-zinc-400">
                  Accuracy
                </span>
                <span className="text-2xl sm:text-3xl font-bold font-mono text-amber-600 dark:text-amber-400 mt-1">
                  {stats.accuracy}%
                </span>
              </div>
            </div>

            {/* View Tab Buttons */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setActiveTab("questions")}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                  activeTab === "questions" ? "shadow-xs" : "opacity-80 hover:opacity-100"
                }`}
                style={{
                  background:
                    activeTab === "questions" ? "var(--accent)" : "var(--surface-subtle)",
                  color:
                    activeTab === "questions"
                      ? "var(--accent-foreground)"
                      : "var(--foreground)",
                  borderColor:
                    activeTab === "questions" ? "var(--accent)" : "var(--border)",
                }}
              >
                List View
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("grid")}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                  activeTab === "grid" ? "shadow-xs" : "opacity-80 hover:opacity-100"
                }`}
                style={{
                  background:
                    activeTab === "grid" ? "var(--accent)" : "var(--surface-subtle)",
                  color:
                    activeTab === "grid"
                      ? "var(--accent-foreground)"
                      : "var(--foreground)",
                  borderColor:
                    activeTab === "grid" ? "var(--accent)" : "var(--border)",
                }}
              >
                Navigator Grid ({allQuestions.length})
              </button>
            </div>
          </div>

          {/* Progress Bar with Legend */}
          <div className="space-y-2 pt-2 border-t" style={{ borderColor: "var(--border)" }}>
            <div className="w-full bg-zinc-200 dark:bg-zinc-800 rounded-full h-2.5 overflow-hidden flex">
              <div
                className="bg-emerald-500 h-full transition-all duration-300"
                style={{ width: `${(stats.correct / stats.total) * 100}%` }}
                title={`Correct: ${stats.correct}`}
              />
              <div
                className="bg-rose-500 h-full transition-all duration-300"
                style={{ width: `${(stats.incorrect / stats.total) * 100}%` }}
                title={`Incorrect: ${stats.incorrect}`}
              />
            </div>

            <div className="flex items-center justify-between text-[11px] text-zinc-500 dark:text-zinc-400">
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
                  Correct ({stats.correct})
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block" />
                  Incorrect ({stats.incorrect})
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-zinc-300 dark:bg-zinc-700 inline-block" />
                  Unattempted ({stats.unattempted})
                </span>
              </div>
              <span className="font-mono">{stats.attempted} / {stats.total} Answered</span>
            </div>
          </div>
        </div>

        {/* Filter and Search Toolbar */}
        <div
          className="p-4 rounded-xl border flex flex-col gap-4 shadow-2xs"
          style={{
            background: "var(--panel)",
            borderColor: "var(--border)",
          }}
        >
          {/* Top Filter Buttons Row */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            {/* Difficulty Filter */}
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-xs font-semibold uppercase tracking-wider mr-1 text-zinc-500 dark:text-zinc-400">
                Difficulty:
              </span>
              {(["All", "Easy", "Medium", "Hard"] as const).map((diff) => {
                const isActive = difficultyFilter === diff;
                let bg = "var(--surface-subtle)";
                let border = "var(--border)";
                let textColor = "var(--foreground)";

                if (isActive) {
                  if (diff === "Easy") {
                    bg = "rgba(16, 185, 129, 0.2)";
                    border = "#10b981";
                    textColor = "#10b981";
                  } else if (diff === "Medium") {
                    bg = "rgba(245, 158, 11, 0.2)";
                    border = "#f59e0b";
                    textColor = "#f59e0b";
                  } else if (diff === "Hard") {
                    bg = "rgba(239, 68, 68, 0.2)";
                    border = "#ef4444";
                    textColor = "#ef4444";
                  } else {
                    bg = "var(--accent)";
                    border = "var(--accent)";
                    textColor = "var(--accent-foreground)";
                  }
                }

                return (
                  <button
                    key={diff}
                    type="button"
                    onClick={() => setDifficultyFilter(diff)}
                    className="px-2.5 py-1 rounded-md text-xs font-semibold border transition-all cursor-pointer"
                    style={{
                      background: bg,
                      borderColor: border,
                      color: textColor,
                    }}
                  >
                    {diff}
                  </button>
                );
              })}
            </div>

            {/* Type Filter */}
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-xs font-semibold uppercase tracking-wider mr-1 text-zinc-500 dark:text-zinc-400">
                Type:
              </span>
              <button
                type="button"
                onClick={() => setTypeFilter("All")}
                className="px-2.5 py-1 rounded-md text-xs font-semibold border transition-all cursor-pointer"
                style={{
                  background: typeFilter === "All" ? "var(--accent)" : "var(--surface-subtle)",
                  color: typeFilter === "All" ? "var(--accent-foreground)" : "var(--foreground)",
                  borderColor: typeFilter === "All" ? "var(--accent)" : "var(--border)",
                }}
              >
                All Types
              </button>
              <button
                type="button"
                onClick={() => setTypeFilter("mcq")}
                className="px-2.5 py-1 rounded-md text-xs font-semibold border transition-all cursor-pointer"
                style={{
                  background: typeFilter === "mcq" ? "var(--accent)" : "var(--surface-subtle)",
                  color: typeFilter === "mcq" ? "var(--accent-foreground)" : "var(--foreground)",
                  borderColor: typeFilter === "mcq" ? "var(--accent)" : "var(--border)",
                }}
              >
                MCQ (Choice)
              </button>
              <button
                type="button"
                onClick={() => setTypeFilter("script")}
                className="px-2.5 py-1 rounded-md text-xs font-semibold border transition-all cursor-pointer"
                style={{
                  background: typeFilter === "script" ? "var(--accent)" : "var(--surface-subtle)",
                  color: typeFilter === "script" ? "var(--accent-foreground)" : "var(--foreground)",
                  borderColor: typeFilter === "script" ? "var(--accent)" : "var(--border)",
                }}
              >
                Script (Code)
              </button>
            </div>

            {/* Status Filter */}
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-xs font-semibold uppercase tracking-wider mr-1 text-zinc-500 dark:text-zinc-400">
                Status:
              </span>
              {(["All", "unattempted", "correct", "incorrect"] as const).map((st) => (
                <button
                  key={st}
                  type="button"
                  onClick={() => setStatusFilter(st)}
                  className="px-2.5 py-1 rounded-md text-xs font-semibold border transition-all cursor-pointer capitalize"
                  style={{
                    background: statusFilter === st ? "var(--accent)" : "var(--surface-subtle)",
                    color: statusFilter === st ? "var(--accent-foreground)" : "var(--foreground)",
                    borderColor: statusFilter === st ? "var(--accent)" : "var(--border)",
                  }}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>

          {/* Topic Dropdown, Search Input, and Page Size */}
          <div
            className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t"
            style={{ borderColor: "var(--border)" }}
          >
            {/* Topic dropdown */}
            <div className="flex items-center gap-2 flex-1 min-w-[260px]">
              <label
                htmlFor="topic-filter-select"
                className="text-xs font-semibold whitespace-nowrap text-zinc-600 dark:text-zinc-400"
              >
                Topic:
              </label>
              <select
                id="topic-filter-select"
                value={topicFilter}
                onChange={(e) => setTopicFilter(e.target.value)}
                className="px-3 py-1.5 text-xs rounded-lg border outline-none cursor-pointer flex-1 max-w-sm transition-all"
                style={{
                  background: "var(--surface-subtle)",
                  borderColor: "var(--border)",
                  color: "var(--foreground)",
                }}
              >
                {allTopics.map((topic) => (
                  <option key={topic} value={topic}>
                    {topic}
                  </option>
                ))}
              </select>
            </div>

            {/* Search Input */}
            <div className="flex items-center gap-2 flex-1 min-w-[220px] max-w-md">
              <div className="relative w-full">
                <input
                  type="text"
                  placeholder="Search questions by keyword..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border outline-none transition-all"
                  style={{
                    background: "var(--surface-subtle)",
                    borderColor: "var(--border)",
                    color: "var(--foreground)",
                  }}
                />
                <svg
                  className="w-3.5 h-3.5 absolute left-2.5 top-2.5 opacity-50"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="text-xs px-2 py-1 rounded border opacity-70 hover:opacity-100 cursor-pointer"
                  style={{ borderColor: "var(--border)" }}
                >
                  Clear
                </button>
              )}
            </div>

            {/* Page Size & Count Indicator */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5 text-xs text-zinc-500 dark:text-zinc-400">
                <span>View:</span>
                <select
                  value={pageSize}
                  onChange={(e) => setPageSize(Number(e.target.value))}
                  className="px-2 py-1 text-xs rounded border outline-none cursor-pointer"
                  style={{
                    background: "var(--surface-subtle)",
                    borderColor: "var(--border)",
                    color: "var(--foreground)",
                  }}
                >
                  <option value={10}>10 / page</option>
                  <option value={25}>25 / page</option>
                  <option value={50}>50 / page</option>
                  <option value={0}>Show All (100)</option>
                </select>
              </div>

              <div className="text-xs font-mono text-zinc-500 dark:text-zinc-400 whitespace-nowrap">
                Showing <strong className="text-zinc-900 dark:text-zinc-100">{filteredQuestions.length}</strong> of {allQuestions.length}
              </div>
            </div>
          </div>
        </div>

        {/* Navigator Grid View */}
        {activeTab === "grid" && (
          <div
            className="p-5 rounded-2xl border shadow-xs"
            style={{
              background: "var(--panel)",
              borderColor: "var(--border)",
            }}
          >
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
              <div>
                <h3 className="text-sm font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
                  Question Navigator Grid (Click to Jump)
                </h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                  Click any question number to jump directly to it in list view.
                </p>
              </div>
              <div className="flex items-center gap-4 text-xs font-medium">
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-md bg-emerald-500 inline-block" /> Correct
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-md bg-rose-500 inline-block" /> Incorrect
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-md bg-zinc-300 dark:bg-zinc-700 inline-block" /> Unattempted
                </span>
              </div>
            </div>

            <div className="grid grid-cols-5 sm:grid-cols-10 md:grid-cols-12 lg:grid-cols-20 gap-2">
              {allQuestions.map((q, idx) => {
                const att = attempts[q.id];
                let bg = "var(--surface-subtle)";
                let border = "var(--border)";
                let textColor = "var(--muted)";

                if (att?.isSubmitted) {
                  if (att.isCorrect) {
                    bg = "rgba(16, 185, 129, 0.25)";
                    border = "#10b981";
                    textColor = "#10b981";
                  } else {
                    bg = "rgba(239, 68, 68, 0.25)";
                    border = "#ef4444";
                    textColor = "#ef4444";
                  }
                }

                return (
                  <button
                    key={q.id}
                    type="button"
                    onClick={() => handleJumpToQuestion(q.id)}
                    title={`#${idx + 1}: ${q.topic} (${q.difficulty}, ${q.type.toUpperCase()})`}
                    className="h-9 rounded-lg border text-xs font-mono font-bold flex items-center justify-center transition-all cursor-pointer hover:scale-105 active:scale-95"
                    style={{
                      background: bg,
                      borderColor: border,
                      color: textColor,
                    }}
                  >
                    {idx + 1}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Questions List */}
        {activeTab === "questions" && (
          <div className="flex flex-col gap-6">
            {filteredQuestions.length === 0 ? (
              <div
                className="p-12 text-center rounded-2xl border flex flex-col items-center justify-center gap-3"
                style={{
                  background: "var(--panel)",
                  borderColor: "var(--border)",
                }}
              >
                <div className="w-12 h-12 rounded-full bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center text-xl">
                  🔍
                </div>
                <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
                  No questions match your filter
                </h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 max-w-md">
                  Try clearing the search query or resetting your difficulty and type filters to show all 100 questions.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setDifficultyFilter("All");
                    setTypeFilter("All");
                    setTopicFilter("All Topics");
                    setStatusFilter("All");
                    setSearchQuery("");
                  }}
                  className="mt-2 px-4 py-2 rounded-lg text-xs font-semibold border cursor-pointer hover:opacity-90"
                  style={{
                    background: "var(--accent)",
                    color: "var(--accent-foreground)",
                    borderColor: "var(--accent)",
                  }}
                >
                  Reset All Filters
                </button>
              </div>
            ) : (
              paginatedQuestions.map((q) => {
                const globalIndex = allQuestions.findIndex((item) => item.id === q.id) + 1;
                const attempt = attempts[q.id];
                const isFirstAttempted = q.id === firstAttemptedId;

                return (
                  <React.Fragment key={q.id}>
                    {isFirstAttempted && (
                      <div className="flex items-center gap-3 my-2">
                        <div className="h-px bg-zinc-200 dark:bg-zinc-800 flex-1" />
                        <span className="text-xs font-semibold px-3 py-1 rounded-full border bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700 flex items-center gap-1.5 shadow-2xs">
                          <span>✓</span>
                          <span>Attempted Questions ({stats.attempted})</span>
                        </span>
                        <div className="h-px bg-zinc-200 dark:bg-zinc-800 flex-1" />
                      </div>
                    )}
                    <QuestionCard
                      question={q}
                      index={globalIndex}
                      attempt={attempt}
                      onSaveAttempt={saveAttempt}
                    />
                  </React.Fragment>
                );
              })
            )}

            {/* Pagination Controls */}
            {pageSize !== 0 && totalPages > 1 && (
              <div
                className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-xl border mt-2 shadow-2xs"
                style={{
                  background: "var(--panel)",
                  borderColor: "var(--border)",
                }}
              >
                <div className="text-xs text-zinc-500 dark:text-zinc-400">
                  Page <strong className="text-zinc-900 dark:text-zinc-100">{currentPage}</strong> of {totalPages}
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    disabled={currentPage === 1}
                    onClick={() => {
                      setCurrentPage((p) => Math.max(1, p - 1));
                      scrollContainerRef.current?.scrollTo({ top: 0, behavior: "smooth" });
                    }}
                    className="px-3 py-1.5 rounded-lg text-xs font-medium border transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                    style={{
                      background: "var(--surface-subtle)",
                      borderColor: "var(--border)",
                      color: "var(--foreground)",
                    }}
                  >
                    Previous
                  </button>

                  {Array.from({ length: totalPages }, (_, i) => i + 1)
                    .filter(
                      (p) =>
                        p === 1 ||
                        p === totalPages ||
                        Math.abs(p - currentPage) <= 2
                    )
                    .map((p, idx, arr) => {
                      const prev = arr[idx - 1];
                      const showEllipsis = prev && p - prev > 1;

                      return (
                        <React.Fragment key={p}>
                          {showEllipsis && (
                            <span className="px-1 text-xs opacity-50">...</span>
                          )}
                          <button
                            type="button"
                            onClick={() => {
                              setCurrentPage(p);
                              scrollContainerRef.current?.scrollTo({ top: 0, behavior: "smooth" });
                            }}
                            className="w-8 h-8 rounded-lg text-xs font-bold font-mono border transition-all cursor-pointer"
                            style={{
                              background:
                                currentPage === p
                                  ? "var(--accent)"
                                  : "var(--surface-subtle)",
                              color:
                                currentPage === p
                                  ? "var(--accent-foreground)"
                                  : "var(--foreground)",
                              borderColor:
                                currentPage === p
                                  ? "var(--accent)"
                                  : "var(--border)",
                            }}
                          >
                            {p}
                          </button>
                        </React.Fragment>
                      );
                    })}

                  <button
                    type="button"
                    disabled={currentPage === totalPages}
                    onClick={() => {
                      setCurrentPage((p) => Math.min(totalPages, p + 1));
                      scrollContainerRef.current?.scrollTo({ top: 0, behavior: "smooth" });
                    }}
                    className="px-3 py-1.5 rounded-lg text-xs font-medium border transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                    style={{
                      background: "var(--surface-subtle)",
                      borderColor: "var(--border)",
                      color: "var(--foreground)",
                    }}
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// -------------------------------------------------------------
// INDIVIDUAL QUESTION CARD COMPONENT
// -------------------------------------------------------------
function QuestionCard({
  question,
  index,
  attempt,
  onSaveAttempt,
}: {
  question: QuizQuestion;
  index: number;
  attempt?: AttemptRecord;
  onSaveAttempt: (questionId: string, record: AttemptRecord) => void;
}) {
  const isMcq = question.type === "mcq";

  // Local interactive state for MCQ
  const [selectedOption, setSelectedOption] = useState<number | undefined>(
    attempt?.selectedOption
  );

  // Local interactive state for Script
  const [userCode, setUserCode] = useState<string>(
    attempt?.userCode ?? question.starterCode ?? ""
  );

  // Submission feedback message & view answer toggle
  const [showExplanation, setShowExplanation] = useState<boolean>(
    Boolean(attempt?.isSubmitted)
  );
  const [showHint, setShowHint] = useState<boolean>(false);
  const [showExpectedScript, setShowExpectedScript] = useState<boolean>(false);

  // Synchronize if attempt changes externally
  useEffect(() => {
    if (attempt) {
      if (attempt.selectedOption !== undefined) {
        setSelectedOption(attempt.selectedOption);
      }
      if (attempt.userCode !== undefined) {
        setUserCode(attempt.userCode);
      }
      if (attempt.isSubmitted) {
        setShowExplanation(true);
      }
    }
  }, [attempt]);

  // Handle MCQ submission
  const handleMcqSubmit = () => {
    if (selectedOption === undefined) {
      alert("Please select one of the options before submitting.");
      return;
    }

    const isCorrect = selectedOption === question.correctAnswer;
    onSaveAttempt(question.id, {
      selectedOption,
      isSubmitted: true,
      isCorrect,
      feedback: isCorrect
        ? "Correct! Well done."
        : `Incorrect. The correct answer is (${String.fromCharCode(
            65 + (question.correctAnswer ?? 0)
          )}).`,
    });
    setShowExplanation(true);
  };

  // Handle Script submission
  const handleScriptSubmit = () => {
    if (!userCode.trim()) {
      alert("Please write your script or query before submitting.");
      return;
    }

    const result = validateScriptAnswer(userCode, question);
    onSaveAttempt(question.id, {
      userCode,
      isSubmitted: true,
      isCorrect: result.isCorrect,
      feedback: result.feedback,
    });
    setShowExplanation(true);
  };

  // Handle Reset / Retry
  const handleRetry = () => {
    onSaveAttempt(question.id, {
      selectedOption: undefined,
      userCode: question.starterCode ?? "",
      isSubmitted: false,
    });
    setSelectedOption(undefined);
    setUserCode(question.starterCode ?? "");
    setShowExplanation(false);
    setShowExpectedScript(false);
  };

  const difficultyColors = {
    Easy: {
      bg: "rgba(16, 185, 129, 0.15)",
      text: "#10b981",
      border: "rgba(16, 185, 129, 0.3)",
    },
    Medium: {
      bg: "rgba(245, 158, 11, 0.15)",
      text: "#f59e0b",
      border: "rgba(245, 158, 11, 0.3)",
    },
    Hard: {
      bg: "rgba(239, 68, 68, 0.15)",
      text: "#ef4444",
      border: "rgba(239, 68, 68, 0.3)",
    },
  };

  const diffStyle =
    difficultyColors[question.difficulty] || difficultyColors.Medium;

  return (
    <article
      id={`question-card-${question.id}`}
      className="rounded-2xl border transition-all duration-200 overflow-hidden shadow-xs"
      style={{
        background: "var(--panel)",
        borderColor: attempt?.isSubmitted
          ? attempt.isCorrect
            ? "rgba(16, 185, 129, 0.4)"
            : "rgba(239, 68, 68, 0.4)"
          : "var(--border)",
      }}
    >
      {/* Question Card Header */}
      <div
        className="p-4 sm:p-5 border-b flex flex-wrap items-center justify-between gap-3"
        style={{
          borderColor: "var(--border)",
          background: "var(--surface-subtle)",
        }}
      >
        <div className="flex flex-wrap items-center gap-2">
          {/* Question Index Badge */}
          <span
            className="text-xs font-mono font-bold px-2.5 py-1 rounded-md border"
            style={{
              background: "var(--panel)",
              borderColor: "var(--border)",
              color: "var(--accent)",
            }}
          >
            #{String(index).padStart(3, "0")}
          </span>

          {/* Topic Badge */}
          <span
            className="text-[11px] font-semibold px-2.5 py-1 rounded-md border uppercase tracking-wider text-zinc-800 dark:text-zinc-200"
            style={{
              background: "var(--panel)",
              borderColor: "var(--border)",
            }}
          >
            {question.topic}
          </span>

          {/* Difficulty Badge */}
          <span
            className="text-[11px] font-bold px-2.5 py-0.5 rounded-full border uppercase tracking-wider"
            style={{
              background: diffStyle.bg,
              color: diffStyle.text,
              borderColor: diffStyle.border,
            }}
          >
            {question.difficulty}
          </span>

          {/* Type Badge */}
          <span
            className="text-[11px] font-mono font-medium px-2 py-0.5 rounded border uppercase tracking-wider"
            style={{
              background: isMcq
                ? "rgba(99, 102, 241, 0.15)"
                : "rgba(236, 72, 153, 0.15)",
              color: isMcq ? "#818cf8" : "#f472b6",
              borderColor: isMcq
                ? "rgba(99, 102, 241, 0.3)"
                : "rgba(236, 72, 153, 0.3)",
            }}
          >
            {isMcq ? "MCQ Choice" : "Script Challenge"}
          </span>
        </div>

        {/* Status Indicator Badge */}
        <div>
          {attempt?.isSubmitted ? (
            attempt.isCorrect ? (
              <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-500 dark:text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/30">
                <svg
                  className="w-3.5 h-3.5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2.5}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                Correct
              </span>
            ) : (
              <span className="flex items-center gap-1.5 text-xs font-bold text-rose-500 dark:text-rose-400 bg-rose-500/10 px-2.5 py-1 rounded-lg border border-rose-500/30">
                <svg
                  className="w-3.5 h-3.5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2.5}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
                Incorrect
              </span>
            )
          ) : (
            <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400 bg-zinc-200 dark:bg-zinc-800 px-2.5 py-1 rounded-lg border border-zinc-300 dark:border-zinc-700/50">
              Unattempted
            </span>
          )}
        </div>
      </div>

      {/* Question Prompt */}
      <div className="p-5 sm:p-6 flex flex-col gap-4">
        <h2 className="text-sm sm:text-base font-semibold leading-relaxed text-zinc-900 dark:text-zinc-100">
          {question.question}
        </h2>

        {question.codeSnippet && (
          <div
            className="p-3.5 rounded-xl font-mono text-xs overflow-x-auto border shadow-inner text-zinc-900 dark:text-zinc-100"
            style={{
              background: "var(--surface-subtle)",
              borderColor: "var(--border)",
            }}
          >
            <pre>{question.codeSnippet}</pre>
          </div>
        )}

        {/* ---------------- MCQ MODE ---------------- */}
        {isMcq && question.options && (
          <div className="flex flex-col gap-2.5 mt-2">
            {question.options.map((opt, optIdx) => {
              const letter = String.fromCharCode(65 + optIdx);
              const isSelected = selectedOption === optIdx;
              const isSubmitted = attempt?.isSubmitted;
              const isAnswer = optIdx === question.correctAnswer;

              let cardBg = "var(--surface-subtle)";
              let cardBorder = "var(--border)";
              let letterBg = "var(--panel)";
              let letterText = "var(--foreground)";

              if (isSubmitted) {
                if (isAnswer) {
                  // Always mark correct answer green
                  cardBg = "rgba(16, 185, 129, 0.12)";
                  cardBorder = "#10b981";
                  letterBg = "#10b981";
                  letterText = "#ffffff";
                } else if (isSelected && !attempt?.isCorrect) {
                  // User chose this and it was wrong
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
                  disabled={isSubmitted}
                  onClick={() => {
                    if (!isSubmitted) setSelectedOption(optIdx);
                  }}
                  className={`w-full flex items-center gap-3 p-3.5 rounded-xl border text-left transition-all select-none ${
                    isSubmitted
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
                  {isSubmitted && isAnswer && (
                    <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/20 px-2 py-0.5 rounded border border-emerald-500/40">
                      Correct Answer
                    </span>
                  )}
                  {isSubmitted && isSelected && !attempt?.isCorrect && (
                    <span className="text-xs font-bold text-rose-600 dark:text-rose-400 bg-rose-500/20 px-2 py-0.5 rounded border border-rose-500/40">
                      Your Choice
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        )}

        {/* ---------------- SCRIPT MODE ---------------- */}
        {!isMcq && (
          <div className="flex flex-col gap-3 mt-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-zinc-500 dark:text-zinc-400">
                Write SQL / PL/SQL Script:
              </span>
              <button
                type="button"
                onClick={() => setUserCode(question.starterCode ?? "")}
                disabled={attempt?.isSubmitted}
                className="text-xs font-mono px-2 py-1 rounded border opacity-70 hover:opacity-100 disabled:opacity-30 cursor-pointer"
                style={{
                  background: "var(--surface-subtle)",
                  borderColor: "var(--border)",
                  color: "var(--foreground)",
                }}
              >
                Reset Starter Code
              </button>
            </div>

            <div
              className="relative rounded-xl overflow-hidden border"
              style={{ borderColor: "var(--border)" }}
            >
              <textarea
                value={userCode}
                onChange={(e) => setUserCode(e.target.value)}
                rows={Math.max(5, (userCode.match(/\n/g) || []).length + 2)}
                disabled={attempt?.isSubmitted}
                placeholder="-- Type your solution here..."
                className="w-full p-4 font-mono text-xs sm:text-sm leading-relaxed resize-y outline-none transition-colors"
                style={{
                  background: "var(--surface-subtle)",
                  color: "var(--foreground)",
                }}
                spellCheck={false}
              />
            </div>
          </div>
        )}

        {/* Action Buttons: Submit / Retry / Hint */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
          <div className="flex items-center gap-2">
            {!attempt?.isSubmitted ? (
              <button
                type="button"
                onClick={isMcq ? handleMcqSubmit : handleScriptSubmit}
                className="px-5 py-2 rounded-xl text-xs sm:text-sm font-bold border transition-all cursor-pointer shadow-xs active:scale-95"
                style={{
                  background: "var(--accent)",
                  borderColor: "var(--accent)",
                  color: "var(--accent-foreground)",
                }}
              >
                Submit Answer
              </button>
            ) : (
              <button
                type="button"
                onClick={handleRetry}
                className="px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold border transition-all cursor-pointer hover:bg-[var(--surface-hover)] shadow-2xs"
                style={{
                  background: "var(--surface-subtle)",
                  borderColor: "var(--border)",
                  color: "var(--foreground)",
                }}
              >
                Try Again / Edit
              </button>
            )}

            {question.hint && (
              <button
                type="button"
                onClick={() => setShowHint((h) => !h)}
                className="px-3 py-2 rounded-xl text-xs font-medium border transition-all cursor-pointer text-zinc-600 dark:text-zinc-400 opacity-80 hover:opacity-100"
                style={{
                  background: "var(--surface-subtle)",
                  borderColor: "var(--border)",
                }}
              >
                {showHint ? "Hide Hint" : "💡 Show Hint"}
              </button>
            )}
          </div>

          {attempt?.isSubmitted && !isMcq && (
            <button
              type="button"
              onClick={() => setShowExpectedScript((s) => !s)}
              className="text-xs font-semibold px-3 py-1.5 rounded-lg border transition-colors cursor-pointer"
              style={{
                background: "var(--surface-subtle)",
                borderColor: "var(--border)",
                color: "var(--accent)",
              }}
            >
              {showExpectedScript
                ? "Hide Expected Solution"
                : "View Expected Solution"}
            </button>
          )}
        </div>

        {/* Hint Accordion */}
        {showHint && question.hint && (
          <div className="p-3.5 rounded-xl border text-xs leading-relaxed flex items-start gap-2.5 bg-amber-500/10 border-amber-500/30 text-amber-700 dark:text-amber-200">
            <span className="text-sm">💡</span>
            <div>
              <strong className="font-semibold">Hint: </strong>
              <span>{question.hint}</span>
            </div>
          </div>
        )}

        {/* Submission Feedback Alert */}
        {attempt?.isSubmitted && (
          <div
            className={`p-4 rounded-xl border text-xs sm:text-sm flex flex-col gap-1.5 transition-all ${
              attempt.isCorrect
                ? "bg-emerald-500/10 border-emerald-500/40 text-emerald-700 dark:text-emerald-300"
                : "bg-rose-500/10 border-rose-500/40 text-rose-700 dark:text-rose-300"
            }`}
          >
            <div className="flex items-center gap-2 font-bold">
              {attempt.isCorrect ? (
                <>
                  <span className="text-base">🎉</span>
                  <span>Correct!</span>
                </>
              ) : (
                <>
                  <span className="text-base">❌</span>
                  <span>Incorrect</span>
                </>
              )}
            </div>
            <p className="font-sans leading-relaxed text-xs opacity-90">
              {attempt.feedback}
            </p>
          </div>
        )}

        {/* Expected Solution Drawer (For Script Mode) */}
        {showExpectedScript && question.expectedScript && (
          <div
            className="p-4 rounded-xl border space-y-2"
            style={{
              background: "var(--surface-subtle)",
              borderColor: "var(--border)",
            }}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-[var(--accent)]">
                Canonical / Expected Solution:
              </span>
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(question.expectedScript ?? "");
                  alert("Copied expected solution to clipboard!");
                }}
                className="text-[11px] px-2 py-0.5 rounded border hover:opacity-100 opacity-70 cursor-pointer"
                style={{ borderColor: "var(--border)" }}
              >
                Copy
              </button>
            </div>
            <pre className="font-mono text-xs p-3 rounded-lg overflow-x-auto bg-black/85 border border-zinc-800 text-emerald-400">
              <code>{question.expectedScript}</code>
            </pre>
          </div>
        )}

        {/* Detailed Explanation */}
        {showExplanation && question.explanation && (
          <div
            className="p-4 rounded-xl border space-y-1.5"
            style={{
              background: "var(--surface-subtle)",
              borderColor: "var(--border)",
            }}
          >
            <div
              className="flex items-center gap-1.5 text-xs font-mono font-bold uppercase tracking-wider"
              style={{ color: "var(--accent)" }}
            >
              <span>📖 Explanation:</span>
            </div>
            <p className="text-xs leading-relaxed text-zinc-700 dark:text-zinc-300">
              {question.explanation}
            </p>
          </div>
        )}
      </div>
    </article>
  );
}
