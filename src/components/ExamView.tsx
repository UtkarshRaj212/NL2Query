"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
  type ExamQuestion,
  SQL_EXAM_QUESTIONS,
  PLSQL_EXAM_QUESTIONS,
} from "@/lib/examData";

interface ExamViewProps {
  initialMode?: "sql" | "plsql";
  onBackToWorkspace?: () => void;
  onLoadQueryInWorkspace?: (query: string, mode: "sql" | "plsql") => void;
}

export function ExamView({
  initialMode = "sql",
  onBackToWorkspace,
}: ExamViewProps) {
  // Mode is strictly locked to initialMode: No option to switch between SQL and PL/SQL inside the section!
  const mode = initialMode;
  const currentQuestions = mode === "sql" ? SQL_EXAM_QUESTIONS : PLSQL_EXAM_QUESTIONS;

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedExam, setSelectedExam] = useState<string>("all");
  const [selectedYear, setSelectedYear] = useState<string>("all");
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>("all");
  const [selectedType, setSelectedType] = useState<string>("all");
  const [selectedSort, setSelectedSort] = useState<string>("year-desc");

  // Track expanded state for each QUESTION CARD (ALL COLLAPSED BY DEFAULT)
  const [expandedQuestions, setExpandedQuestions] = useState<Record<string, boolean>>({});

  // Track expanded state for each SOLUTION (ALL COLLAPSED BY DEFAULT)
  const [expandedSolutions, setExpandedSolutions] = useState<Record<string, boolean>>({});

  // User input / choice state per question
  const [userMcqChoices, setUserMcqChoices] = useState<Record<string, "A" | "B" | "C" | "D">>({});
  const [userTextInputs, setUserTextInputs] = useState<Record<string, string>>({});
  const [userSubmissionStatus, setUserSubmissionStatus] = useState<Record<string, { submitted: boolean; isCorrect: boolean }>>({});

  const [copiedCodeId, setCopiedCodeId] = useState<string | null>(null);

  // Extract distinct exams for filtering
  const availableExams = useMemo(() => {
    const exams = new Set<string>();
    currentQuestions.forEach((q) => {
      if (q.examName.includes("GATE")) exams.add("GATE CS");
      else if (q.examName.includes("ISRO")) exams.add("ISRO CS");
      else if (q.examName.includes("UGC NET")) exams.add("UGC NET CS");
      else if (q.examName.includes("1Z0-071")) exams.add("Oracle 1Z0-071");
      else if (q.examName.includes("1Z0-149")) exams.add("Oracle 1Z0-149 (OCP)");
      else if (q.examName.includes("1Z0-144")) exams.add("Oracle 1Z0-144");
      else exams.add(q.examName);
    });
    return Array.from(exams);
  }, [currentQuestions]);

  // Extract distinct years sorted in descending order
  const availableYears = useMemo(() => {
    const years = Array.from(new Set(currentQuestions.map((q) => q.year))).sort((a, b) => b.localeCompare(a));
    return years;
  }, [currentQuestions]);

  const isFilterActive =
    searchQuery.trim() !== "" ||
    selectedExam !== "all" ||
    selectedYear !== "all" ||
    selectedDifficulty !== "all" ||
    selectedType !== "all" ||
    selectedSort !== "year-desc";

  const handleResetFilters = () => {
    setSearchQuery("");
    setSelectedExam("all");
    setSelectedYear("all");
    setSelectedDifficulty("all");
    setSelectedType("all");
    setSelectedSort("year-desc");
  };

  // Filter and Sort questions based on search, exam, year, difficulty, type, and time/year sort
  const filteredQuestions = useMemo(() => {
    const list = currentQuestions.filter((q) => {
      // Search text filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesTopic = q.topic.toLowerCase().includes(query);
        const matchesText = q.questionText.toLowerCase().includes(query);
        const matchesExam = q.examName.toLowerCase().includes(query);
        const matchesYear = q.year.includes(query);
        const matchesCode = q.codeSnippet?.toLowerCase().includes(query);
        if (!matchesTopic && !matchesText && !matchesExam && !matchesYear && !matchesCode) {
          return false;
        }
      }

      // Exam filter
      if (selectedExam !== "all") {
        if (!q.examName.toLowerCase().includes(selectedExam.toLowerCase())) {
          return false;
        }
      }

      // Year filter
      if (selectedYear !== "all" && q.year !== selectedYear) {
        return false;
      }

      // Difficulty filter
      if (selectedDifficulty !== "all" && q.difficulty.toLowerCase() !== selectedDifficulty.toLowerCase()) {
        return false;
      }

      // Type filter
      if (selectedType !== "all" && q.questionType !== selectedType) {
        return false;
      }

      return true;
    });

    // Sort according to time/year and other options
    return [...list].sort((a, b) => {
      if (selectedSort === "year-desc") {
        return b.year.localeCompare(a.year);
      }
      if (selectedSort === "year-asc") {
        return a.year.localeCompare(b.year);
      }
      if (selectedSort === "difficulty-asc") {
        const diffRank: Record<string, number> = { Easy: 1, Medium: 2, Hard: 3 };
        return (diffRank[a.difficulty] || 2) - (diffRank[b.difficulty] || 2);
      }
      if (selectedSort === "difficulty-desc") {
        const diffRank: Record<string, number> = { Easy: 1, Medium: 2, Hard: 3 };
        return (diffRank[b.difficulty] || 2) - (diffRank[a.difficulty] || 2);
      }
      return 0; // Default order
    });
  }, [currentQuestions, searchQuery, selectedExam, selectedYear, selectedDifficulty, selectedType, selectedSort]);

  // Toggle question expansion
  const toggleQuestionExpand = (id: string) => {
    setExpandedQuestions((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  // Toggle solution expansion
  const toggleSolutionExpand = (id: string) => {
    setExpandedSolutions((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const expandAllQuestions = () => {
    const nextState: Record<string, boolean> = {};
    filteredQuestions.forEach((q) => {
      nextState[q.id] = true;
    });
    setExpandedQuestions(nextState);
  };

  const collapseAllQuestions = () => {
    setExpandedQuestions({});
  };

  // Handle MCQ Selection & Validation
  const handleSelectMcq = (q: ExamQuestion, optionKey: "A" | "B" | "C" | "D") => {
    setUserMcqChoices((prev) => ({ ...prev, [q.id]: optionKey }));
    const isCorrect = q.correctOptionKey === optionKey;
    setUserSubmissionStatus((prev) => ({
      ...prev,
      [q.id]: { submitted: true, isCorrect },
    }));
  };

  // Handle Numerical / String Input Submit
  const handleCheckNumericalAnswer = (q: ExamQuestion) => {
    const inputVal = (userTextInputs[q.id] || "").trim();
    if (!inputVal) return;

    const normalizedInput = inputVal.toLowerCase();
    const normalizedCorrect = q.correctAnswer.trim().toLowerCase();

    // Check numerical equivalence or text equality
    let isCorrect = false;
    const inputNum = parseFloat(normalizedInput);
    const correctNum = parseFloat(normalizedCorrect);

    if (!isNaN(inputNum) && !isNaN(correctNum)) {
      isCorrect = Math.abs(inputNum - correctNum) < 0.0001;
    } else {
      isCorrect = normalizedInput === normalizedCorrect;
    }

    setUserSubmissionStatus((prev) => ({
      ...prev,
      [q.id]: { submitted: true, isCorrect },
    }));
  };

  const handleCopyCode = (id: string, code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCodeId(id);
    setTimeout(() => setCopiedCodeId(null), 2000);
  };

  // Difficulty badge helper (ONLY element keeping colors)
  const getDifficultyBadge = (diff: "Easy" | "Medium" | "Hard") => {
    switch (diff) {
      case "Easy":
        return "bg-emerald-500/10 text-emerald-400 border-emerald-500/25";
      case "Medium":
        return "bg-amber-500/10 text-amber-400 border-amber-500/25";
      case "Hard":
        return "bg-rose-500/10 text-rose-400 border-rose-500/25";
    }
  };

  return (
    <div
      className="flex-1 min-h-0 flex flex-col overflow-y-auto w-full select-text transition-colors"
      style={{
        background: "var(--background)",
        color: "var(--foreground)",
      }}
    >
      {/* Top Banner & Header */}
      <div
        className={`w-full border-b shrink-0 px-4 sm:px-8 py-6 relative overflow-hidden ${
          mode === "sql" ? "exam-banner-sql" : "exam-banner-plsql"
        }`}
        style={{
          borderColor: "var(--border)",
        }}
      >
        <div className="max-w-[1540px] mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>


            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Exam PYQ Bank:{" "}
              <span
                className={`font-black ${
                  mode === "sql" ? "exam-title-sql" : "exam-title-plsql"
                }`}
              >
                {mode === "sql" ? "SQL Queries" : "PL/SQL Queries"}
              </span>
            </h1>
            <p className="text-xs sm:text-sm text-[var(--muted)] mt-1.5 max-w-2xl leading-relaxed">
              {mode === "sql"
                ? "Official past year SQL questions from GATE CS, ISRO, UGC NET, and Oracle 1Z0-071. Click any question to expand, input your answer or select options, and inspect verified step-by-step solutions."
                : "Official past year PL/SQL questions from Oracle 1Z0-149 (OCP 19c) and 1Z0-144. Click any question to expand, test your knowledge, and inspect verified solutions with zero hallucination."}
            </p>
          </div>

          {/* Quick navigation / Back button */}
          <div className="flex items-center gap-2 shrink-0">
            {onBackToWorkspace && (
              <button
                type="button"
                onClick={onBackToWorkspace}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold border transition-all cursor-pointer shadow-xs hover:bg-[var(--surface-hover)]"
                style={{
                  background: "var(--surface-subtle)",
                  borderColor: "var(--border)",
                  color: "var(--foreground)",
                }}
              >
                <svg className="w-4 h-4 opacity-75" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                <span>Back to Workspace</span>
              </button>
            )}

            {/* <Link
              href={mode === "sql" ? "/sql" : "/plsql"}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold border transition-all cursor-pointer shadow-xs hover:bg-[var(--surface-hover)]"
              style={{
                background: "var(--surface-subtle)",
                borderColor: "var(--border)",
                color: "var(--foreground)",
              }}
            >

              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </Link> */}
          </div>
        </div>

        {/* Quick Summary Pill & Metric Counters (NO TAB SWITCHER) */}
        <div className="max-w-[1540px] mx-auto mt-5 flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-2 text-xs text-[var(--muted)]">
            <span className="hidden sm:inline font-mono text-[11px]">
              Click on any row to expand the question & test yourself
            </span>
          </div>
        </div>
      </div>

      {/* Main Container */}
      <div className="max-w-[1540px] mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 flex-1 flex flex-col gap-5">
        {/* Controls Toolbar: Search & Filters */}
        <div
          className="p-4 sm:p-5 rounded-xl border flex flex-col gap-3.5 shadow-sm"
          style={{
            background: "var(--panel)",
            borderColor: "var(--border)",
          }}
        >
          {/* Row 1: Long Search Bar with Search Icon & Results Counter */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full">
            <div className="relative flex-1">
              <svg
                className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Search by topic, year, or keywords (e.g. HAVING, JOIN, TRIGGER, CURSOR)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-16 py-2.5 rounded-lg text-xs sm:text-sm border transition-all focus:outline-none focus:ring-2 focus:ring-sky-500/40"
                style={{
                  background: "var(--surface-subtle)",
                  borderColor: "var(--border)",
                  color: "var(--foreground)",
                }}
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-zinc-400 hover:text-zinc-200 px-1.5 py-0.5 rounded-md cursor-pointer"
                >
                  Clear
                </button>
              )}
            </div>

            {/* Showing results count badge */}
            <div
              className="hidden sm:flex items-center gap-2 px-3 py-2.5 rounded-lg border text-xs font-mono text-[var(--muted)] shrink-0"
              style={{ background: "var(--surface-subtle)", borderColor: "var(--border)" }}
            >
              <span>Showing:</span>
              <span className="font-bold text-[var(--foreground)]">{filteredQuestions.length}</span>
              <span>of {currentQuestions.length}</span>
            </div>
          </div>

          {/* Row 2: Filter and Sort dropdown boxes - wraps gracefully into 2nd row below if length overflows */}
          <div className="flex flex-wrap items-center gap-2.5 sm:gap-3 w-full">
            {/* Exam Filter */}
            <div className="flex-1 min-w-[150px] sm:min-w-[170px] max-w-[240px]">
              <select
                value={selectedExam}
                onChange={(e) => setSelectedExam(e.target.value)}
                className="w-full px-3 py-2 rounded-lg text-xs font-medium border cursor-pointer focus:outline-none focus:ring-1 focus:ring-sky-500/40"
                style={{
                  background: "var(--surface-subtle)",
                  borderColor: "var(--border)",
                  color: "var(--foreground)",
                }}
                aria-label="Filter by Exam"
              >
                <option value="all">All Exams ({currentQuestions.length})</option>
                {availableExams.map((exam) => (
                  <option key={exam} value={exam}>
                    {exam}
                  </option>
                ))}
              </select>
            </div>

            {/* Year Filter (Last 15 Years) */}
            <div className="flex-1 min-w-[160px] sm:min-w-[180px] max-w-[230px]">
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                className="w-full px-3 py-2 rounded-lg text-xs font-medium border cursor-pointer focus:outline-none focus:ring-1 focus:ring-sky-500/40"
                style={{
                  background: "var(--surface-subtle)",
                  borderColor: "var(--border)",
                  color: "var(--foreground)",
                }}
                aria-label="Filter by Year"
              >
                <option value="all">All Years (15-Yr Archive)</option>
                {availableYears.map((yr) => (
                  <option key={yr} value={yr}>
                    Year {yr}
                  </option>
                ))}
              </select>
            </div>

            {/* Sort by Time/Year (Requested Sorting Feature) */}
            <div className="flex-1 min-w-[190px] sm:min-w-[215px] max-w-[270px]">
              <select
                value={selectedSort}
                onChange={(e) => setSelectedSort(e.target.value)}
                className="w-full px-3 py-2 rounded-lg text-xs font-semibold border cursor-pointer focus:outline-none focus:ring-1 focus:ring-sky-500/40"
                style={{
                  background: "var(--surface-subtle)",
                  borderColor: "var(--border)",
                  color: "var(--foreground)",
                }}
                aria-label="Sort Questions"
              >
                <option value="year-desc">Sort: Newest First (2024 → 2009)</option>
                <option value="year-asc">Sort: Oldest First (2009 → 2024)</option>
                <option value="default">Sort: Exam Order (Default)</option>
                <option value="difficulty-asc">Sort: Difficulty (Easy → Hard)</option>
                <option value="difficulty-desc">Sort: Difficulty (Hard → Easy)</option>
              </select>
            </div>

            {/* Question Type Filter */}
            <div className="flex-1 min-w-[130px] sm:min-w-[150px] max-w-[180px]">
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="w-full px-3 py-2 rounded-lg text-xs font-medium border cursor-pointer focus:outline-none focus:ring-1 focus:ring-sky-500/40"
                style={{
                  background: "var(--surface-subtle)",
                  borderColor: "var(--border)",
                  color: "var(--foreground)",
                }}
                aria-label="Filter by Question Type"
              >
                <option value="all">All Types</option>
                <option value="multiple-choice">MCQ Only</option>
                <option value="numerical">Numerical (NAT) Only</option>
              </select>
            </div>

            {/* Difficulty Filter */}
            <div className="flex-1 min-w-[130px] sm:min-w-[150px] max-w-[180px]">
              <select
                value={selectedDifficulty}
                onChange={(e) => setSelectedDifficulty(e.target.value)}
                className="w-full px-3 py-2 rounded-lg text-xs font-medium border cursor-pointer focus:outline-none focus:ring-1 focus:ring-sky-500/40"
                style={{
                  background: "var(--surface-subtle)",
                  borderColor: "var(--border)",
                  color: "var(--foreground)",
                }}
                aria-label="Filter by Difficulty"
              >
                <option value="all">All Difficulties</option>
                <option value="Easy">Easy</option>
                <option value="Medium">Medium</option>
                <option value="Hard">Hard</option>
              </select>
            </div>

            {/* Reset Filters button if any filter is active */}
            {isFilterActive && (
              <button
                type="button"
                onClick={handleResetFilters}
                className="px-3 py-2 rounded-lg text-xs font-semibold border text-sky-700 dark:text-sky-400 bg-sky-500/10 border-sky-500/30 hover:bg-sky-500/20 transition-colors cursor-pointer shrink-0"
                title="Reset all filters"
              >
                Reset Filters
              </button>
            )}

            {/* Expand / Collapse All Questions */}
            <div className="flex items-center rounded-lg border p-0.5 ml-auto shrink-0 shadow-2xs" style={{ borderColor: "var(--border)", background: "var(--surface-subtle)" }}>
              <button
                type="button"
                onClick={expandAllQuestions}
                className="px-3 py-1.5 text-xs font-medium rounded-lg hover:bg-[var(--surface-hover)] transition-colors text-[var(--muted)] hover:text-[var(--foreground)] cursor-pointer"
                title="Expand all questions"
              >
                Expand All
              </button>
              <span className="text-[var(--border)] px-0.5">|</span>
              <button
                type="button"
                onClick={collapseAllQuestions}
                className="px-3 py-1.5 text-xs font-medium rounded-lg hover:bg-[var(--surface-hover)] transition-colors text-[var(--muted)] hover:text-[var(--foreground)] cursor-pointer"
                title="Collapse all questions"
              >
                Collapse All
              </button>
            </div>
          </div>
        </div>

        {/* Empty State */}
        {filteredQuestions.length === 0 && (
          <div
            className="p-12 text-center rounded-xl border flex flex-col items-center justify-center gap-3 my-4"
            style={{
              background: "var(--panel)",
              borderColor: "var(--border)",
            }}
          >
            <div className="w-12 h-12 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-400">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="font-bold text-base">No Questions Match Your Filter</h3>
            <p className="text-xs text-[var(--muted)] max-w-sm">
              Try adjusting your search query, or clear the exam and difficulty filters.
            </p>
            <button
              type="button"
              onClick={handleResetFilters}
              className="mt-2 px-4 py-1.5 rounded-lg text-xs font-semibold border text-sky-700 dark:text-sky-400 bg-sky-500/10 border-sky-500/30 hover:bg-sky-500/20 transition-colors cursor-pointer"
            >
              Reset Filters
            </button>
          </div>
        )}

        {/* Questions Accordion List */}
        <div className="flex flex-col gap-3.5">
          {filteredQuestions.map((q, idx) => {
            const isQuestionExpanded = !!expandedQuestions[q.id];
            const isSolutionExpanded = !!expandedSolutions[q.id];

            const userChoice = userMcqChoices[q.id];
            const textInput = userTextInputs[q.id] || "";
            const status = userSubmissionStatus[q.id];

            return (
              <article
                key={q.id}
                className="rounded-lg border transition-all duration-200 overflow-hidden shadow-xs"
                style={{
                  background: "var(--panel)",
                  borderColor: isQuestionExpanded ? (mode === "sql" ? "rgba(2, 132, 199, 0.45)" : "rgba(234, 88, 12, 0.45)") : "var(--border)",
                }}
              >
                {/* ── COLLAPSED / EXPANDED HEADER BAR ── */}
                {/* As requested: Show just the question number, Exam name, and year on top; clicking on it shows the question! */}
                <button
                  type="button"
                  onClick={() => toggleQuestionExpand(q.id)}
                  aria-expanded={isQuestionExpanded}
                  className="w-full p-3.5 sm:p-4 text-left flex items-center justify-between gap-3 transition-colors cursor-pointer hover:bg-[var(--surface-hover)] focus:outline-none"
                  style={{
                    background: isQuestionExpanded ? "var(--surface-subtle)" : "transparent",
                  }}
                >
                  {/* Left: Question Number + Exam Badge + Year */}
                  <div className="flex items-center gap-2 sm:gap-3 flex-wrap min-w-0">
                    {/* Question Number */}
                    <span
                      className="px-2 py-0.5 rounded-md font-mono text-xs font-bold border shrink-0"
                      style={{
                        background: "var(--surface-subtle)",
                        borderColor: "var(--border)",
                        color: "var(--foreground)",
                      }}
                    >
                      Q{idx + 1}
                    </span>

                    {/* Exam Name & Year Badge (Plain black & white / monochrome) */}
                    <span
                      className="px-2.5 py-1 rounded-md text-xs font-semibold font-mono tracking-tight border flex items-center gap-1.5 shrink-0"
                      style={{
                        background: "var(--surface-subtle)",
                        borderColor: "var(--border)",
                        color: "var(--foreground)",
                      }}
                    >
                      {q.examName} ({q.year})
                    </span>

                    {/* Paper Details (e.g. Set 2, Q41) */}
                    {q.paperDetails && (
                      <span className="hidden md:inline text-[11px] font-mono text-[var(--muted)] px-2 py-0.5 rounded-md border border-[var(--border)] bg-[var(--background)]">
                        {q.paperDetails}
                      </span>
                    )}

                    {/* Topic Pill */}
                    <span className="hidden sm:inline text-xs font-medium px-2 py-0.5 rounded-md bg-[var(--background)] border border-[var(--border)] text-[var(--foreground)] truncate max-w-[200px] lg:max-w-none">
                      {q.topic}
                    </span>

                    {/* Question Type Tag (Plain black & white / monochrome) */}
                    <span
                      className="text-[10px] font-mono font-medium px-2 py-0.5 rounded-md border uppercase tracking-wider shrink-0"
                      style={{
                        background: "var(--surface-subtle)",
                        borderColor: "var(--border)",
                        color: "var(--muted)",
                      }}
                    >
                      {q.questionType === "multiple-choice" ? "MCQ" : "Numerical (NAT)"}
                    </span>

                    {/* Difficulty Badge (ONLY element keeping colors) */}
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-md border uppercase tracking-wider shrink-0 ${getDifficultyBadge(
                        q.difficulty
                      )}`}
                    >
                      {q.difficulty}
                    </span>

                    {/* Result badge if already attempted */}
                    {status && (
                      <span
                        className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-md border ${status.isCorrect
                          ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/40"
                          : "bg-rose-500/20 text-rose-400 border-rose-500/40"
                          }`}
                      >
                        {status.isCorrect ? "Solved" : "Attempted"}
                      </span>
                    )}
                  </div>

                  {/* Right: Expand Prompt & Chevron */}
                  <div className="flex items-center gap-2 shrink-0 text-xs text-[var(--muted)] font-mono">
                    <span className="hidden sm:inline text-[11px]">
                      {isQuestionExpanded ? "Collapse" : "Click to view question"}
                    </span>
                    <svg
                      className={`w-4 h-4 transition-transform duration-200 ${isQuestionExpanded ? "rotate-180" : ""}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </button>

                {/* ── EXPANDED QUESTION CONTENT ── */}
                {isQuestionExpanded && (
                  <div
                    className="p-4 sm:p-6 border-t flex flex-col gap-5 animate-in fade-in duration-200"
                    style={{ borderColor: "var(--border)" }}
                  >
                    {/* Question Statement */}
                    <div className="text-sm sm:text-base font-medium leading-relaxed text-[var(--foreground)]">
                      {q.questionText}
                    </div>

                    {/* Schema / Tuples / Context Table */}
                    {q.schemaDetails && (
                      <div className="flex flex-col gap-1.5">
                        <span className="text-xs font-mono uppercase tracking-wider text-[var(--muted)] font-bold">
                          Database Schema & Tuples:
                        </span>
                        <pre
                          className="p-3.5 rounded-lg border text-xs sm:text-[13px] font-mono overflow-x-auto leading-relaxed"
                          style={{
                            background: "var(--background)",
                            borderColor: "var(--border)",
                            color: "var(--foreground)",
                          }}
                        >
                          {q.schemaDetails}
                        </pre>
                      </div>
                    )}

                    {/* Code Snippet (SQL Query or PL/SQL Block) */}
                    {q.codeSnippet && (
                      <div className="flex flex-col gap-1.5">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-mono uppercase tracking-wider text-[var(--muted)] font-bold">
                            {q.category === "sql" ? "SQL Query Under Evaluation:" : "PL/SQL Program Under Evaluation:"}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleCopyCode(q.id, q.codeSnippet!)}
                            className="px-2.5 py-1 rounded-md text-[11px] font-mono border hover:bg-[var(--surface-hover)] transition-colors cursor-pointer flex items-center gap-1"
                            style={{
                              borderColor: "var(--border)",
                              color: "var(--muted)",
                            }}
                            title="Copy query code"
                          >
                            {copiedCodeId === q.id ? (
                              <span className="text-emerald-400 font-bold">Copied!</span>
                            ) : (
                              <>
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                </svg>
                                <span>Copy</span>
                              </>
                            )}
                          </button>
                        </div>

                        <div
                          className="rounded-lg border p-4 font-mono text-xs sm:text-[13px] overflow-x-auto leading-relaxed exam-code-box shadow-xs"
                          style={{
                            background: "var(--surface-subtle)",
                            borderColor: "var(--border)",
                          }}
                        >
                          <code
                            className={`whitespace-pre font-mono font-semibold ${
                              q.category === "sql"
                                ? "text-sky-900 dark:text-sky-300 exam-code-sql"
                                : "text-amber-950 dark:text-orange-300 exam-code-plsql"
                            }`}
                          >
                            {q.codeSnippet}
                          </code>
                        </div>
                      </div>
                    )}

                    {/* ── ANSWER INPUT SECTION ── */}
                    {/* MCQ Options vs Numerical / String Input Box */}
                    <div className="pt-2 flex flex-col gap-3">
                      {q.questionType === "multiple-choice" && q.options && q.options.length > 0 ? (
                        /* MCQ Question Type: Render Option Cards */
                        <div className="flex flex-col gap-2">
                          <span className="text-xs font-mono uppercase tracking-wider text-[var(--muted)] font-bold flex items-center gap-2">
                            <span>Select Your Answer:</span>
                            {status && (
                              <span
                                className={`text-[11px] font-bold ${status.isCorrect ? "text-emerald-700 dark:text-emerald-400" : "text-rose-700 dark:text-rose-400"
                                  }`}
                              >
                                {status.isCorrect ? "Correct Choice!" : "Incorrect Choice"}
                              </span>
                            )}
                          </span>

                          <div className="grid grid-cols-1 gap-2 sm:gap-2.5">
                            {q.options.map((opt) => {
                              const isSelected = userChoice === opt.key;
                              const isCorrect = isSolutionExpanded && q.correctOptionKey === opt.key;
                              const isWrong = isSolutionExpanded && isSelected && q.correctOptionKey !== opt.key;

                              return (
                                <button
                                  key={opt.key}
                                  type="button"
                                  onClick={() => handleSelectMcq(q, opt.key)}
                                  className={`p-3 rounded-lg border text-left flex items-start gap-3 transition-all cursor-pointer ${isCorrect
                                    ? "bg-emerald-500/10 border-emerald-500/50 text-emerald-700 dark:text-emerald-400 font-semibold"
                                    : isWrong
                                      ? "bg-rose-500/10 border-rose-500/50 text-rose-700 dark:text-rose-400 font-medium"
                                      : isSelected
                                        ? "bg-sky-500/10 border-sky-500/40 text-[var(--foreground)] font-medium"
                                        : "hover:bg-[var(--surface-hover)] border-[var(--border)] text-[var(--foreground)]"
                                    }`}
                                  style={{
                                    background: !isSelected && !isCorrect && !isWrong ? "var(--surface-subtle)" : undefined,
                                  }}
                                >
                                  <span
                                    className={`w-6 h-6 rounded-md flex items-center justify-center font-mono text-xs font-bold shrink-0 border ${isCorrect
                                      ? "bg-emerald-500 text-white border-emerald-600"
                                      : isWrong
                                        ? "bg-rose-500 text-white border-rose-600"
                                        : isSelected
                                          ? "bg-sky-500 text-white border-sky-600"
                                          : "bg-[var(--background)] border-[var(--border)] text-[var(--muted)]"
                                      }`}
                                  >
                                    {opt.key}
                                  </span>
                                  <span className="text-xs sm:text-sm leading-relaxed">{opt.text}</span>
                                  {isCorrect && (
                                    <span className="ml-auto text-xs font-mono font-bold text-emerald-700 dark:text-emerald-400 shrink-0">
                                      Correct
                                    </span>
                                  )}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      ) : (
                        /* Numerical / Text Answer Question Type: Render Dedicated Input Box */
                        <div className="flex flex-col gap-2">
                          <div className="flex items-center justify-between flex-wrap gap-1">
                            <span className="text-xs font-mono uppercase tracking-wider text-[var(--muted)] font-bold">
                              Enter Answer:
                            </span>
                            <span className="text-[11px] font-mono text-sky-800 dark:text-sky-400 font-semibold bg-sky-500/10 border border-sky-500/30 px-2 py-0.5 rounded-md">
                              {q.answerTypeHint || "Numerical value (e.g. integer or decimal)"}
                            </span>
                          </div>

                          <div className="flex items-center gap-2 max-w-md">
                            <div className="relative flex-1">
                              <input
                                type="text"
                                value={textInput}
                                onChange={(e) =>
                                  setUserTextInputs((prev) => ({
                                    ...prev,
                                    [q.id]: e.target.value,
                                  }))
                                }
                                onKeyDown={(e) => {
                                  if (e.key === "Enter") handleCheckNumericalAnswer(q);
                                }}
                                placeholder={q.answerTypeHint || "Enter numerical answer..."}
                                className="w-full px-3.5 py-2 rounded-lg text-xs sm:text-sm font-mono border focus:outline-none focus:ring-2 focus:ring-sky-500/40"
                                style={{
                                  background: "var(--surface-subtle)",
                                  borderColor: status
                                    ? status.isCorrect
                                      ? "rgba(16, 185, 129, 0.5)"
                                      : "rgba(244, 63, 94, 0.5)"
                                    : "var(--border)",
                                  color: "var(--foreground)",
                                }}
                              />
                            </div>

                            <button
                              type="button"
                              onClick={() => handleCheckNumericalAnswer(q)}
                              className="px-4 py-2 rounded-lg text-xs font-bold font-mono border transition-all cursor-pointer shadow-xs bg-sky-500/15 border-sky-500/35 text-sky-800 dark:text-sky-400 hover:bg-sky-500/25 shrink-0"
                            >
                              Check
                            </button>
                          </div>

                          {/* Submission Feedback Message */}
                          {status && (
                            <div className="mt-1 text-xs font-mono flex items-center gap-2">
                              {status.isCorrect ? (
                                <span className="text-emerald-700 dark:text-emerald-400 font-bold flex items-center gap-1">
                                  Correct! Your answer matches the official exam key.
                                </span>
                              ) : (
                                <span className="text-rose-700 dark:text-rose-400 font-bold flex items-center gap-1">
                                  Incorrect. Try calculating again or expand the solution below.
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* ── SOLUTION ACCORDION TOGGLE ── */}
                    <div
                      className="pt-3 border-t flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3"
                      style={{ borderColor: "var(--border)" }}
                    >
                      <button
                        type="button"
                        onClick={() => toggleSolutionExpand(q.id)}
                        aria-expanded={isSolutionExpanded}
                        className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg font-semibold text-xs sm:text-sm transition-all duration-200 cursor-pointer border shadow-xs"
                        style={{
                          background: isSolutionExpanded ? "rgba(16, 185, 129, 0.12)" : "var(--surface-subtle)",
                          borderColor: isSolutionExpanded ? "rgba(16, 185, 129, 0.4)" : "var(--border)",
                          color: isSolutionExpanded ? (mode === "sql" ? "#0284c7" : "#ea580c") : "var(--foreground)",
                        }}
                      >
                        <svg
                          className={`w-4 h-4 transition-transform duration-200 ${isSolutionExpanded ? "rotate-180" : ""}`}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                        <span>
                          {isSolutionExpanded
                            ? "Hide Verified Solution & Explanation"
                            : "View Verified Solution & Explanation"}
                        </span>
                      </button>

                      {/* Official Authority Citation */}
                      <div className="text-[11px] font-mono text-[var(--muted)] flex items-center gap-1.5 self-center">
                        <span>Source:</span>
                        <span className="font-semibold text-[var(--foreground)]">{q.sourceExamInfo.authority}</span>
                      </div>
                    </div>

                    {/* ── COLLAPSIBLE SOLUTION BODY ── */}
                    {isSolutionExpanded && (
                      <div
                        className="rounded-lg border p-4 sm:p-5 flex flex-col gap-4 animate-in fade-in duration-200"
                        style={{
                          background: "rgba(16, 185, 129, 0.03)",
                          borderColor: "rgba(16, 185, 129, 0.3)",
                        }}
                      >
                        {/* Correct Answer Header Banner */}
                        <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-emerald-500/20">
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 border border-emerald-500/40 flex items-center justify-center font-bold text-xs shrink-0">
                              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                              </svg>
                            </div>
                            <div>
                              <span className="text-[11px] font-mono uppercase tracking-wider text-emerald-700 dark:text-emerald-400 font-bold block">
                                Official Answer Key
                              </span>
                              <span className="text-sm sm:text-base font-extrabold text-[var(--foreground)]">
                                {q.correctAnswer}
                              </span>
                            </div>
                          </div>

                          <div className="text-[11px] font-mono text-[var(--muted)]">
                            Ref: {q.sourceExamInfo.reference}
                          </div>
                        </div>

                        {/* Summary */}
                        <div className="text-xs sm:text-sm text-[var(--foreground)] leading-relaxed bg-[var(--background)] p-3 rounded-lg border border-[var(--border)]">
                          <strong className="text-emerald-700 dark:text-emerald-400 font-semibold block mb-1">Executive Summary:</strong>
                          {q.solution.summary}
                        </div>

                        {/* Detailed Step-by-Step Breakdown */}
                        <div className="flex flex-col gap-3">
                          <span className="text-xs font-mono uppercase tracking-wider font-bold text-[var(--foreground)]">
                            Step-by-Step Rationale & Query Trace:
                          </span>

                          <div className="flex flex-col gap-2.5">
                            {q.solution.steps.map((st) => (
                              <div
                                key={st.stepNumber}
                                className="p-3 rounded-lg border flex flex-col gap-1.5"
                                style={{
                                  background: "var(--surface-subtle)",
                                  borderColor: "var(--border)",
                                }}
                              >
                                <div className="flex items-center gap-2">
                                  <span className="w-5 h-5 rounded-full bg-sky-500/10 text-sky-800 dark:text-sky-400 border border-sky-500/30 flex items-center justify-center font-mono text-[11px] font-bold shrink-0">
                                    {st.stepNumber}
                                  </span>
                                  <span className="font-semibold text-xs sm:text-sm text-[var(--foreground)]">
                                    {st.title}
                                  </span>
                                </div>
                                <p className="text-xs text-[var(--muted)] whitespace-pre-line leading-relaxed pl-7">
                                  {st.explanation}
                                </p>
                                {st.codeSnippet && (
                                  <pre
                                    className={`ml-7 p-2 rounded-md border text-[11px] font-mono overflow-x-auto font-semibold ${
                                      q.category === "sql"
                                        ? "text-sky-900 dark:text-sky-300 exam-code-sql"
                                        : "text-amber-950 dark:text-orange-300 exam-code-plsql"
                                    }`}
                                    style={{
                                      background: "var(--background)",
                                      borderColor: "var(--border)",
                                    }}
                                  >
                                    {st.codeSnippet}
                                  </pre>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Key Takeaway / Exam Tip */}
                        <div
                          className="p-3 rounded-lg border flex items-start gap-2.5"
                          style={{
                            background: "rgba(245, 158, 11, 0.08)",
                            borderColor: "rgba(245, 158, 11, 0.3)",
                          }}
                        >
                          <div className="text-xs leading-relaxed">
                            <strong className="text-amber-700 dark:text-amber-400 font-semibold">Key Exam Takeaway: </strong>
                            <span className="text-[var(--foreground)]">{q.solution.keyTakeaway}</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </article>
            );
          })}
        </div>
      </div>
    </div>
  );
}
