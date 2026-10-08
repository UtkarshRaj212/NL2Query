"use client";

import React, { useState, useEffect } from "react";

export type FeatureHelpTab = "quiz" | "pyq" | "terminal";

interface FeatureHelpModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: FeatureHelpTab;
  onNavigateSection?: (section: "quiz" | "exam") => void;
  onOpenTerminal?: () => void;
  mode?: "sql" | "plsql";
}

interface FaqItem {
  question: string;
  answer: string;
}

export function FeatureHelpModal({
  isOpen,
  onClose,
  initialTab = "quiz",
  onNavigateSection,
  onOpenTerminal,
  mode = "sql",
}: FeatureHelpModalProps) {
  const [activeTab, setActiveTab] = useState<FeatureHelpTab>(initialTab);
  const [openFaq, setOpenFaq] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (isOpen) {
      setActiveTab(initialTab);
    }
  }, [isOpen, initialTab]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const toggleFaq = (key: string) => {
    setOpenFaq((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const quizFaqs: FaqItem[] = [
    {
      question: "How do I start a daily quiz and earn streak points?",
      answer:
        "Click the 'Quiz' button in the top navigation bar. Select a question difficulty or daily challenge, solve the problem, and click 'Submit Answer'. A correct answer increments your daily streak and records your score on the leaderboard.",
    },
    {
      question: "How does the Daily Streak calculation work?",
      answer:
        "Streaks track consecutive calendar days where you complete at least one quiz challenge. Each day you solve a challenge, your streak count increments by 1. The flame icon (🔥) on your profile avatar shows your active streak count. If you miss a calendar day, your streak will reset to 1 upon your next solve.",
    },
    {
      question: "Do I need an account to save my quiz score and streak?",
      answer:
        "Yes! Click the user profile icon at the top right to sign in with Google. While guest users can practice questions, an active account is required to preserve your streak across devices and appear on the Global Leaderboard.",
    },
    {
      question: "Can I get hints if I get stuck on a query problem?",
      answer:
        "Yes, each quiz problem features progressive hints. Clicking 'Show Hint' reveals directional guidance without spoiling the exact solution query, helping you deduce the answer on your own.",
    },
    {
      question: "How is my Global Leaderboard Rank calculated?",
      answer:
        "Rankings are calculated primarily by your current active consecutive daily streak, followed by total verified points earned and query accuracy percentage. Higher streak consistency guarantees higher placement.",
    },
    {
      question: "How do I return to the database workspace from Quiz view?",
      answer:
        "Click the 'Workspace' button in the top navigation bar or the 'Back to Workspace' button in the quiz header to resume your SQL or PL/SQL workspace immediately.",
    },
  ];

  const pyqFaqs: FaqItem[] = [
    {
      question: "What is the Exam PYQ section and where are questions from?",
      answer:
        "The Exam PYQ (Previous Year Questions) section is an authentic question bank containing verified questions from major competitive exams and technical certifications, including GATE CS, ISRO Scientist, UGC-NET Computer Science, Oracle 1Z0-071 Database SQL, and top campus recruitment tests (TCS, Infosys, Wipro).",
    },
    {
      question: "How do I navigate to and filter Exam PYQs?",
      answer:
        "Click 'Exam PYQs' in the top navigation bar. Use the filter controls at the top of the page to filter by Exam Body (GATE, ISRO, UGC-NET, Oracle), Year (2005 - 2024+), Topic (Joins, Subqueries, Normalization, Relational Algebra, Indexes), and Difficulty level (Easy, Medium, Hard).",
    },
    {
      question: "Can I test and run my queries directly inside the PYQ solver?",
      answer:
        "Yes! Unlike static PDF past papers, every question features an interactive live SQL/PLSQL code sandbox. You can write your query and click 'Run Query' to execute it against the exact test schema provided in the exam question.",
    },
    {
      question: "Are complete official solutions and step-by-step proofs provided?",
      answer:
        "Yes. Each problem includes detailed official answer keys, relational algebra derivations, step-by-step tuple tracing, and examiner notes explaining why alternative distractors are incorrect.",
    },
    {
      question: "Can I bookmark questions to review them later before an exam?",
      answer:
        "Yes. Click the bookmark icon on any question card to save it into your revision list. You can toggle the 'Bookmarked Only' filter at the top to practice your personal review questions.",
    },
    {
      question: "How do I navigate between SQL PYQs and PL/SQL PYQs?",
      answer:
        "You can switch between SQL and PL/SQL modes using the mode toggle pills in the header, or direct URLs `/sql/exam` and `/plsql/exam`.",
    },
  ];

  const terminalFaqs: FaqItem[] = [
    {
      question: "How do I open and exit the interactive Terminal CLI?",
      answer:
        "Click the '>_ Terminal' button in the top navigation bar to open the full-screen interactive CLI. To exit, type 'EXIT' or 'QUIT' into the terminal prompt and press Enter, or click the exit button (✕) in the top right corner of the terminal window.",
    },
    {
      question: "What built-in system commands are supported in the terminal?",
      answer:
        "Supported commands include:\n• HELP or ? : Show command guide and syntax cheat sheet\n• SHOW DATABASES : List all active and custom databases\n• USE <dbname> : Switch active working database catalog\n• SHOW TABLES : List relations in current database\n• DESC <table> or DESCRIBE <table> : Inspect table schema, columns, and primary keys\n• CLEAR or CLS : Flush the terminal screen buffer\n• EXIT or QUIT : Return to the visual GUI workspace",
    },
    {
      question: "Can I run standard SQL DDL, DML, and DQL commands?",
      answer:
        "Yes! You can run SELECT, INSERT, UPDATE, DELETE, CREATE TABLE, DROP TABLE, and ALTER TABLE statements. All queries execute against the in-memory SQLite/Relational engine and display formatted ASCII tables with execution timings.",
    },
    {
      question: "How does command history work in the terminal?",
      answer:
        "Use the Up Arrow (↑) and Down Arrow (↓) keys on your keyboard to navigate back and forth through your previously executed command history, just like a real Unix bash or MySQL terminal.",
    },
    {
      question: "Does executing queries in the terminal modify the visual workspace?",
      answer:
        "Yes! The terminal shares the same underlying database session. Any tables created or rows inserted, updated, or deleted via the terminal will immediately appear in the visual Schema and Result tabs once you return to the workspace.",
    },
    {
      question: "How do I reset the database if I made unwanted modifications in the terminal?",
      answer:
        "Click the 'Reset Database' button in the terminal header or type 'USE <current_db>' to reload the default sample catalog and restore original table data.",
    },
  ];

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-5 md:p-8"
      role="dialog"
      aria-modal="true"
      aria-label="Features & Navigation Guide"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/80 backdrop-blur-md transition-opacity animate-in fade-in duration-200"
        onClick={onClose}
      />

      {/* Modal Dialog Card */}
      <div
        className="relative w-full max-w-4xl max-h-[92vh] flex flex-col rounded-2xl border shadow-2xl z-10 animate-in zoom-in-95 duration-200 overflow-hidden"
        style={{
          background: "var(--panel, #18181b)",
          borderColor: "var(--border, #27272a)",
          color: "var(--foreground, #fafafa)",
        }}
      >
        {/* Modal Header */}
        <div
          className="flex flex-wrap items-center justify-between gap-3 p-4 sm:p-5 border-b shrink-0"
          style={{ borderColor: "var(--border, #27272a)" }}
        >
          <div className="flex items-center gap-2.5">
            <span className="text-xl">🧭</span>
            <div>
              <h2 className="text-lg sm:text-xl font-bold tracking-tight">
                Features &amp; Navigation Help
              </h2>
              <p className="text-xs opacity-75 mt-0.5" style={{ color: "var(--muted)" }}>
                Quick guide and complete FAQ for Quiz, Exam PYQs, and Terminal CLI
              </p>
            </div>
          </div>

          {/* Close Button */}
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl border border-zinc-700/60 hover:border-zinc-500 bg-zinc-800/50 hover:bg-zinc-800 text-zinc-300 hover:text-white transition-all cursor-pointer"
            aria-label="Close guide modal"
            title="Close guide (Esc)"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Tab Switcher */}
        <div
          className="flex border-b px-4 sm:px-5 pt-3 gap-2 shrink-0 bg-[var(--surface-subtle,#141417)] overflow-x-auto"
          style={{ borderColor: "var(--border, #27272a)" }}
        >
          <button
            type="button"
            onClick={() => setActiveTab("quiz")}
            className={`pb-3 px-3 text-xs sm:text-sm font-semibold border-b-2 transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap ${
              activeTab === "quiz"
                ? "border-amber-400 text-amber-400"
                : "border-transparent text-zinc-400 hover:text-zinc-200"
            }`}
          >
            <span>🏆</span>
            <span>Daily Quiz &amp; Streaks</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("pyq")}
            className={`pb-3 px-3 text-xs sm:text-sm font-semibold border-b-2 transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap ${
              activeTab === "pyq"
                ? "border-sky-400 text-sky-400"
                : "border-transparent text-zinc-400 hover:text-zinc-200"
            }`}
          >
            <span>🎓</span>
            <span>Exam PYQ Bank</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("terminal")}
            className={`pb-3 px-3 text-xs sm:text-sm font-semibold border-b-2 transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap ${
              activeTab === "terminal"
                ? "border-emerald-400 text-emerald-400"
                : "border-transparent text-zinc-400 hover:text-zinc-200"
            }`}
          >
            <span>💻</span>
            <span>Interactive Terminal CLI</span>
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 text-sm leading-relaxed">
          {/* TAB 1: QUIZ HELP */}
          {activeTab === "quiz" && (
            <div className="space-y-6">
              {/* Quick Launch & Overview Banner */}
              <div
                className="p-4 sm:p-5 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                style={{
                  background:
                    "linear-gradient(135deg, rgba(245, 158, 11, 0.08) 0%, rgba(217, 119, 6, 0.03) 100%)",
                  borderColor: "rgba(245, 158, 11, 0.3)",
                }}
              >
                <div>
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30 mb-2">
                    🔥 Daily Challenges &amp; Streaks
                  </div>
                  <h3 className="text-base sm:text-lg font-bold text-amber-300">
                    Test Database Mastery &amp; Climb the Leaderboard
                  </h3>
                  <p className="text-xs sm:text-sm opacity-85 mt-1" style={{ color: "var(--muted)" }}>
                    Practice curated SQL and PL/SQL challenges, build continuous daily streaks, and compete with global developers.
                  </p>
                </div>

                {onNavigateSection && (
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onNavigateSection("quiz");
                    }}
                    className="px-4 py-2 rounded-xl text-xs sm:text-sm font-bold bg-amber-500 hover:bg-amber-400 text-black transition-all cursor-pointer shadow-md shrink-0 flex items-center justify-center gap-2"
                  >
                    <span>Launch Quiz Now</span>
                    <span>→</span>
                  </button>
                )}
              </div>

              {/* How to Navigate Section */}
              <div
                className="p-4 sm:p-5 rounded-xl border space-y-3"
                style={{
                  background: "var(--surface-subtle, #141417)",
                  borderColor: "var(--border, #27272a)",
                }}
              >
                <h4 className="text-sm font-bold uppercase tracking-wider text-amber-400 flex items-center gap-2">
                  <span>📍</span>
                  <span>How to Navigate to Quiz</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                  <div className="p-3 rounded-lg border bg-[var(--panel)]" style={{ borderColor: "var(--border)" }}>
                    <div className="text-xs font-mono font-bold text-amber-400">Step 1: Top Navigation</div>
                    <p className="text-xs mt-1 text-zinc-300">
                      Click the <strong className="text-white">"Quiz"</strong> button in the top navigation bar at any time.
                    </p>
                  </div>
                  <div className="p-3 rounded-lg border bg-[var(--panel)]" style={{ borderColor: "var(--border)" }}>
                    <div className="text-xs font-mono font-bold text-amber-400">Step 2: Solve &amp; Submit</div>
                    <p className="text-xs mt-1 text-zinc-300">
                      Pick difficulty level, inspect the schema, formulate your answer, and click <strong className="text-white">"Submit Answer"</strong>.
                    </p>
                  </div>
                  <div className="p-3 rounded-lg border bg-[var(--panel)]" style={{ borderColor: "var(--border)" }}>
                    <div className="text-xs font-mono font-bold text-amber-400">Step 3: Return to Workspace</div>
                    <p className="text-xs mt-1 text-zinc-300">
                      Click <strong className="text-white">"Workspace"</strong> in the top header or the back arrow to resume development.
                    </p>
                  </div>
                </div>
              </div>

              {/* Core Features & Mechanics */}
              <div className="space-y-3">
                <h4 className="text-sm font-bold uppercase tracking-wider text-zinc-300 flex items-center gap-2">
                  <span>⚡</span>
                  <span>Key Features &amp; Capabilities</span>
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                  <div
                    className="p-3.5 rounded-xl border bg-[var(--surface-subtle)] space-y-1"
                    style={{ borderColor: "var(--border)" }}
                  >
                    <div className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
                      <span>🔥</span>
                      <span>Daily Streak Multiplier</span>
                    </div>
                    <p className="text-xs text-zinc-300">
                      Solve at least one challenge every 24 hours to increase your streak. Your consecutive streak count is displayed in the user avatar pill.
                    </p>
                  </div>

                  <div
                    className="p-3.5 rounded-xl border bg-[var(--surface-subtle)] space-y-1"
                    style={{ borderColor: "var(--border)" }}
                  >
                    <div className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
                      <span>🏆</span>
                      <span>Global Leaderboard</span>
                    </div>
                    <p className="text-xs text-zinc-300">
                      Compete globally! Rankings are based on streak length, verified points, and precision. Sign in with Google to secure your leaderboard position.
                    </p>
                  </div>

                  <div
                    className="p-3.5 rounded-xl border bg-[var(--surface-subtle)] space-y-1"
                    style={{ borderColor: "var(--border)" }}
                  >
                    <div className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
                      <span>💡</span>
                      <span>Progressive Hints</span>
                    </div>
                    <p className="text-xs text-zinc-300">
                      Stuck on a query? Click "Show Hint" for non-spoiler conceptual clues that guide you toward the correct SQL/PLSQL logic.
                    </p>
                  </div>

                  <div
                    className="p-3.5 rounded-xl border bg-[var(--surface-subtle)] space-y-1"
                    style={{ borderColor: "var(--border)" }}
                  >
                    <div className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
                      <span>📖</span>
                      <span>Detailed Answer Review</span>
                    </div>
                    <p className="text-xs text-zinc-300">
                      After submitting, inspect the canonical query solution, relational execution theory, and explanations for why other choices were invalid.
                    </p>
                  </div>
                </div>
              </div>

              {/* Frequently Asked Questions */}
              <div className="space-y-3">
                <h4 className="text-sm font-bold uppercase tracking-wider text-zinc-300 flex items-center gap-2">
                  <span>❓</span>
                  <span>Frequently Asked Questions (FAQ)</span>
                </h4>
                <div className="space-y-2">
                  {quizFaqs.map((faq, idx) => {
                    const key = `quiz-${idx}`;
                    const isOpen = !!openFaq[key];
                    return (
                      <div
                        key={key}
                        className="rounded-xl border overflow-hidden transition-all"
                        style={{
                          borderColor: isOpen ? "rgba(245, 158, 11, 0.4)" : "var(--border)",
                          background: "var(--surface-subtle)",
                        }}
                      >
                        <button
                          type="button"
                          onClick={() => toggleFaq(key)}
                          className="w-full p-3.5 flex items-center justify-between text-left text-xs sm:text-sm font-semibold cursor-pointer hover:bg-zinc-800/40 transition-colors"
                          style={{ color: "var(--foreground)" }}
                        >
                          <span className="flex items-center gap-2">
                            <span className="text-amber-400 font-mono text-xs">Q{idx + 1}.</span>
                            <span>{faq.question}</span>
                          </span>
                          <span className="text-xs text-zinc-400 ml-2">{isOpen ? "▲" : "▼"}</span>
                        </button>
                        {isOpen && (
                          <div
                            className="p-3.5 pt-0 text-xs sm:text-sm opacity-90 border-t mt-1"
                            style={{ borderColor: "var(--border)", color: "var(--muted)" }}
                          >
                            <p className="whitespace-pre-line leading-relaxed">{faq.answer}</p>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: EXAM PYQ HELP */}
          {activeTab === "pyq" && (
            <div className="space-y-6">
              {/* Quick Launch & Overview Banner */}
              <div
                className="p-4 sm:p-5 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                style={{
                  background:
                    "linear-gradient(135deg, rgba(14, 165, 233, 0.08) 0%, rgba(2, 132, 199, 0.03) 100%)",
                  borderColor: "rgba(14, 165, 233, 0.3)",
                }}
              >
                <div>
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-sky-500/20 text-sky-400 border border-sky-500/30 mb-2">
                    🎓 Competitive &amp; Certification Papers
                  </div>
                  <h3 className="text-base sm:text-lg font-bold text-sky-300">
                    Real Exam PYQs from GATE, ISRO, UGC-NET &amp; Oracle
                  </h3>
                  <p className="text-xs sm:text-sm opacity-85 mt-1" style={{ color: "var(--muted)" }}>
                    Practice authentic previous year exam questions with live interactive code sandboxes and step-by-step proofs.
                  </p>
                </div>

                {onNavigateSection && (
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onNavigateSection("exam");
                    }}
                    className="px-4 py-2 rounded-xl text-xs sm:text-sm font-bold bg-sky-500 hover:bg-sky-400 text-black transition-all cursor-pointer shadow-md shrink-0 flex items-center justify-center gap-2"
                  >
                    <span>Launch Exam PYQs Now</span>
                    <span>→</span>
                  </button>
                )}
              </div>

              {/* How to Navigate Section */}
              <div
                className="p-4 sm:p-5 rounded-xl border space-y-3"
                style={{
                  background: "var(--surface-subtle, #141417)",
                  borderColor: "var(--border, #27272a)",
                }}
              >
                <h4 className="text-sm font-bold uppercase tracking-wider text-sky-400 flex items-center gap-2">
                  <span>📍</span>
                  <span>How to Navigate to Exam PYQs</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                  <div className="p-3 rounded-lg border bg-[var(--panel)]" style={{ borderColor: "var(--border)" }}>
                    <div className="text-xs font-mono font-bold text-sky-400">Step 1: Top Navigation</div>
                    <p className="text-xs mt-1 text-zinc-300">
                      Click the <strong className="text-white">"Exam PYQs"</strong> button in the top navigation bar or go to <code className="text-sky-300">/sql/exam</code>.
                    </p>
                  </div>
                  <div className="p-3 rounded-lg border bg-[var(--panel)]" style={{ borderColor: "var(--border)" }}>
                    <div className="text-xs font-mono font-bold text-sky-400">Step 2: Filter by Body &amp; Topic</div>
                    <p className="text-xs mt-1 text-zinc-300">
                      Select Exam Body (e.g. GATE CS, ISRO, Oracle), Year, Topic, and Difficulty from the filter bar.
                    </p>
                  </div>
                  <div className="p-3 rounded-lg border bg-[var(--panel)]" style={{ borderColor: "var(--border)" }}>
                    <div className="text-xs font-mono font-bold text-sky-400">Step 3: Test &amp; Verify Live</div>
                    <p className="text-xs mt-1 text-zinc-300">
                      Run queries inside the embedded sandbox, compare against official answers, and bookmark for revision.
                    </p>
                  </div>
                </div>
              </div>

              {/* Exam Bodies & Topic Coverage */}
              <div className="space-y-3">
                <h4 className="text-sm font-bold uppercase tracking-wider text-zinc-300 flex items-center gap-2">
                  <span>🏛️</span>
                  <span>Exam Coverage &amp; Supported Topics</span>
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                  <div
                    className="p-3.5 rounded-xl border bg-[var(--surface-subtle)] space-y-1"
                    style={{ borderColor: "var(--border)" }}
                  >
                    <div className="text-xs font-bold text-sky-400">GATE CS &amp; ISRO Scientist</div>
                    <p className="text-xs text-zinc-300">
                      Relational Algebra equivalences, Tuple Relational Calculus, B+ tree height &amp; fanout, Serializability, Conflict Equivalence, and Normal Forms (2NF, 3NF, BCNF).
                    </p>
                  </div>

                  <div
                    className="p-3.5 rounded-xl border bg-[var(--surface-subtle)] space-y-1"
                    style={{ borderColor: "var(--border)" }}
                  >
                    <div className="text-xs font-bold text-sky-400">Oracle 1Z0-071 &amp; PL/SQL Certification</div>
                    <p className="text-xs text-zinc-300">
                      Standard enterprise SQL syntax, multi-table joins, analytic functions, views, sequence manipulation, constraints, and PL/SQL block structure.
                    </p>
                  </div>

                  <div
                    className="p-3.5 rounded-xl border bg-[var(--surface-subtle)] space-y-1"
                    style={{ borderColor: "var(--border)" }}
                  >
                    <div className="text-xs font-bold text-sky-400">UGC-NET &amp; University DBMS Finals</div>
                    <p className="text-xs text-zinc-300">
                      Lossless-join decomposition, Dependency preservation, Functional dependency closures, Candidate key derivation, and Transaction ACID recovery.
                    </p>
                  </div>

                  <div
                    className="p-3.5 rounded-xl border bg-[var(--surface-subtle)] space-y-1"
                    style={{ borderColor: "var(--border)" }}
                  >
                    <div className="text-xs font-bold text-sky-400">Technical Interviews &amp; Placement Tests</div>
                    <p className="text-xs text-zinc-300">
                      Real interview problems from TCS NQT, Infosys Specialist Programmer, and Cognizant on complex subqueries, GROUP BY HAVING, and window analytics.
                    </p>
                  </div>
                </div>
              </div>

              {/* Frequently Asked Questions */}
              <div className="space-y-3">
                <h4 className="text-sm font-bold uppercase tracking-wider text-zinc-300 flex items-center gap-2">
                  <span>❓</span>
                  <span>Frequently Asked Questions (FAQ)</span>
                </h4>
                <div className="space-y-2">
                  {pyqFaqs.map((faq, idx) => {
                    const key = `pyq-${idx}`;
                    const isOpen = !!openFaq[key];
                    return (
                      <div
                        key={key}
                        className="rounded-xl border overflow-hidden transition-all"
                        style={{
                          borderColor: isOpen ? "rgba(14, 165, 233, 0.4)" : "var(--border)",
                          background: "var(--surface-subtle)",
                        }}
                      >
                        <button
                          type="button"
                          onClick={() => toggleFaq(key)}
                          className="w-full p-3.5 flex items-center justify-between text-left text-xs sm:text-sm font-semibold cursor-pointer hover:bg-zinc-800/40 transition-colors"
                          style={{ color: "var(--foreground)" }}
                        >
                          <span className="flex items-center gap-2">
                            <span className="text-sky-400 font-mono text-xs">Q{idx + 1}.</span>
                            <span>{faq.question}</span>
                          </span>
                          <span className="text-xs text-zinc-400 ml-2">{isOpen ? "▲" : "▼"}</span>
                        </button>
                        {isOpen && (
                          <div
                            className="p-3.5 pt-0 text-xs sm:text-sm opacity-90 border-t mt-1"
                            style={{ borderColor: "var(--border)", color: "var(--muted)" }}
                          >
                            <p className="whitespace-pre-line leading-relaxed">{faq.answer}</p>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: TERMINAL HELP */}
          {activeTab === "terminal" && (
            <div className="space-y-6">
              {/* Quick Launch & Overview Banner */}
              <div
                className="p-4 sm:p-5 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                style={{
                  background:
                    "linear-gradient(135deg, rgba(16, 185, 129, 0.08) 0%, rgba(5, 150, 105, 0.03) 100%)",
                  borderColor: "rgba(16, 185, 129, 0.3)",
                }}
              >
                <div>
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 mb-2">
                    💻 Interactive Command-Line Interface
                  </div>
                  <h3 className="text-base sm:text-lg font-bold text-emerald-300">
                    Full-Screen Unix &amp; SQL*Plus Terminal Environment
                  </h3>
                  <p className="text-xs sm:text-sm opacity-85 mt-1" style={{ color: "var(--muted)" }}>
                    Execute raw SQL, inspect catalogs with system commands, and test database operations with real command history.
                  </p>
                </div>

                {onOpenTerminal && (
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onOpenTerminal();
                    }}
                    className="px-4 py-2 rounded-xl text-xs sm:text-sm font-bold bg-emerald-500 hover:bg-emerald-400 text-black transition-all cursor-pointer shadow-md shrink-0 flex items-center justify-center gap-2"
                  >
                    <span>Open Terminal Now</span>
                    <span>→</span>
                  </button>
                )}
              </div>

              {/* How to Navigate Section */}
              <div
                className="p-4 sm:p-5 rounded-xl border space-y-3"
                style={{
                  background: "var(--surface-subtle, #141417)",
                  borderColor: "var(--border, #27272a)",
                }}
              >
                <h4 className="text-sm font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-2">
                  <span>📍</span>
                  <span>How to Navigate to Terminal</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                  <div className="p-3 rounded-lg border bg-[var(--panel)]" style={{ borderColor: "var(--border)" }}>
                    <div className="text-xs font-mono font-bold text-emerald-400">Step 1: Open Terminal</div>
                    <p className="text-xs mt-1 text-zinc-300">
                      Click the <strong className="text-white">&gt;_ Terminal</strong> icon button located in the top navigation bar.
                    </p>
                  </div>
                  <div className="p-3 rounded-lg border bg-[var(--panel)]" style={{ borderColor: "var(--border)" }}>
                    <div className="text-xs font-mono font-bold text-emerald-400">Step 2: Type or Use Quick Help</div>
                    <p className="text-xs mt-1 text-zinc-300">
                      Type commands at the prompt or click quick buttons like <code className="text-emerald-300">HELP</code> or <code className="text-emerald-300">SHOW TABLES</code>.
                    </p>
                  </div>
                  <div className="p-3 rounded-lg border bg-[var(--panel)]" style={{ borderColor: "var(--border)" }}>
                    <div className="text-xs font-mono font-bold text-emerald-400">Step 3: Exit Back to GUI</div>
                    <p className="text-xs mt-1 text-zinc-300">
                      Type <strong className="text-white">EXIT</strong> or <strong className="text-white">QUIT</strong> and press Enter, or click ✕ in the top right.
                    </p>
                  </div>
                </div>
              </div>

              {/* Built-in Commands Reference */}
              <div className="space-y-3">
                <h4 className="text-sm font-bold uppercase tracking-wider text-zinc-300 flex items-center gap-2">
                  <span>⌨️</span>
                  <span>System Commands Reference</span>
                </h4>
                <div className="overflow-x-auto rounded-xl border border-zinc-700/60">
                  <table className="w-full text-left text-xs font-mono">
                    <thead className="bg-zinc-800/80 text-zinc-300 font-sans border-b border-zinc-700/60">
                      <tr>
                        <th className="p-2.5 sm:p-3 font-bold">Command</th>
                        <th className="p-2.5 sm:p-3 font-bold">Example</th>
                        <th className="p-2.5 sm:p-3 font-bold font-sans">Description</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-800/60 bg-zinc-900/60">
                      <tr>
                        <td className="p-2.5 sm:p-3 text-emerald-400 font-bold">HELP / ?</td>
                        <td className="p-2.5 sm:p-3 text-zinc-400">HELP</td>
                        <td className="p-2.5 sm:p-3 font-sans text-zinc-300">Prints the full system command reference and cheat sheet</td>
                      </tr>
                      <tr>
                        <td className="p-2.5 sm:p-3 text-emerald-400 font-bold">SHOW DATABASES</td>
                        <td className="p-2.5 sm:p-3 text-zinc-400">SHOW DATABASES</td>
                        <td className="p-2.5 sm:p-3 font-sans text-zinc-300">Lists all available database schemas and active datasets</td>
                      </tr>
                      <tr>
                        <td className="p-2.5 sm:p-3 text-emerald-400 font-bold">USE &lt;db&gt;</td>
                        <td className="p-2.5 sm:p-3 text-zinc-400">USE university</td>
                        <td className="p-2.5 sm:p-3 font-sans text-zinc-300">Switches the active catalog to the specified database</td>
                      </tr>
                      <tr>
                        <td className="p-2.5 sm:p-3 text-emerald-400 font-bold">SHOW TABLES</td>
                        <td className="p-2.5 sm:p-3 text-zinc-400">SHOW TABLES</td>
                        <td className="p-2.5 sm:p-3 font-sans text-zinc-300">Displays all tables defined in the active database schema</td>
                      </tr>
                      <tr>
                        <td className="p-2.5 sm:p-3 text-emerald-400 font-bold">DESC &lt;table&gt;</td>
                        <td className="p-2.5 sm:p-3 text-zinc-400">DESC customers</td>
                        <td className="p-2.5 sm:p-3 font-sans text-zinc-300">Describes column names, data types, nullability, and primary keys</td>
                      </tr>
                      <tr>
                        <td className="p-2.5 sm:p-3 text-emerald-400 font-bold">CLEAR / CLS</td>
                        <td className="p-2.5 sm:p-3 text-zinc-400">CLEAR</td>
                        <td className="p-2.5 sm:p-3 font-sans text-zinc-300">Clears previous output lines and resets the screen view</td>
                      </tr>
                      <tr>
                        <td className="p-2.5 sm:p-3 text-emerald-400 font-bold">EXIT / QUIT</td>
                        <td className="p-2.5 sm:p-3 text-zinc-400">EXIT</td>
                        <td className="p-2.5 sm:p-3 font-sans text-zinc-300">Leaves terminal mode and returns to standard workspace GUI</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Frequently Asked Questions */}
              <div className="space-y-3">
                <h4 className="text-sm font-bold uppercase tracking-wider text-zinc-300 flex items-center gap-2">
                  <span>❓</span>
                  <span>Frequently Asked Questions (FAQ)</span>
                </h4>
                <div className="space-y-2">
                  {terminalFaqs.map((faq, idx) => {
                    const key = `term-${idx}`;
                    const isOpen = !!openFaq[key];
                    return (
                      <div
                        key={key}
                        className="rounded-xl border overflow-hidden transition-all"
                        style={{
                          borderColor: isOpen ? "rgba(16, 185, 129, 0.4)" : "var(--border)",
                          background: "var(--surface-subtle)",
                        }}
                      >
                        <button
                          type="button"
                          onClick={() => toggleFaq(key)}
                          className="w-full p-3.5 flex items-center justify-between text-left text-xs sm:text-sm font-semibold cursor-pointer hover:bg-zinc-800/40 transition-colors"
                          style={{ color: "var(--foreground)" }}
                        >
                          <span className="flex items-center gap-2">
                            <span className="text-emerald-400 font-mono text-xs">Q{idx + 1}.</span>
                            <span>{faq.question}</span>
                          </span>
                          <span className="text-xs text-zinc-400 ml-2">{isOpen ? "▲" : "▼"}</span>
                        </button>
                        {isOpen && (
                          <div
                            className="p-3.5 pt-0 text-xs sm:text-sm opacity-90 border-t mt-1"
                            style={{ borderColor: "var(--border)", color: "var(--muted)" }}
                          >
                            <p className="whitespace-pre-line leading-relaxed">{faq.answer}</p>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div
          className="p-3.5 sm:p-4 border-t flex items-center justify-between gap-3 shrink-0 bg-[var(--surface-subtle,#141417)]"
          style={{ borderColor: "var(--border, #27272a)" }}
        >
          <div className="text-xs opacity-70 hidden sm:block" style={{ color: "var(--muted)" }}>
            Tip: Press <kbd className="px-1.5 py-0.5 rounded bg-zinc-800 border border-zinc-700 text-zinc-300 font-mono text-[11px]">Esc</kbd> anytime to return.
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-5 py-2 rounded-xl text-xs sm:text-sm font-semibold border border-zinc-700 hover:border-zinc-500 bg-zinc-800/80 hover:bg-zinc-800 text-zinc-200 hover:text-white transition-all cursor-pointer ml-auto"
          >
            Close Help Guide
          </button>
        </div>
      </div>
    </div>
  );
}
