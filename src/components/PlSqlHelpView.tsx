"use client";

import React, { useState, useMemo } from "react";

interface PlSqlHelpViewProps {
  onBackToWorkspace?: () => void;
  onNavigateSection?: (section: "quiz" | "exam") => void;
  onOpenTerminal?: () => void;
}

// Subcard component inside each manual section
function HelpSubcard({
  title,
  content,
  highlight = false,
  defaultOpen = true,
}: {
  title: string;
  content: string;
  highlight?: boolean;
  defaultOpen?: boolean;
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div
      className="rounded-xl border transition-all overflow-hidden shadow-2xs"
      style={{
        borderColor: "var(--border)",
        background: "var(--surface-subtle)",
      }}
    >
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        className="w-full p-3.5 flex items-center justify-between text-left cursor-pointer transition-colors hover:opacity-95 focus:outline-none"
        style={{
          background: isOpen ? "rgba(255, 255, 255, 0.03)" : "transparent",
        }}
      >
        <span
          className="font-semibold text-xs md:text-sm uppercase tracking-wider"
          style={{ color: "var(--foreground)" }}
        >
          {title}
        </span>
        <div className="flex items-center gap-1.5 text-xs opacity-75 font-mono" style={{ color: "var(--foreground)" }}>
          <span className="hidden sm:inline font-sans">{isOpen ? "Hide" : "Click to view"}</span>
          <svg
            className={`w-4 h-4 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>
      {isOpen && (
        <div
          className="p-4 border-t text-sm md:text-base leading-relaxed"
          style={{
            borderColor: "var(--border)",
            background: "var(--panel)",
            color: "var(--foreground)",
          }}
        >
          <p>{content}</p>
        </div>
      )}
    </div>
  );
}

function SectionHeadingBox({
  id,
  title,
  isOpen,
  onToggle,
  count,
}: {
  id: string;
  title: string;
  isOpen: boolean;
  onToggle: () => void;
  count?: number;
}) {
  return (
    <div id={id} className="flex items-center justify-center gap-3 my-8 pt-2 scroll-mt-6">
      <div className="h-px flex-1" style={{ background: "var(--border)" }} />
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={isOpen}
        className="px-5 py-2.5 rounded-xl border text-xs md:text-sm font-mono font-bold tracking-wider uppercase transition-all cursor-pointer flex items-center gap-3 shadow-xs hover:opacity-90 select-none"
        style={{
          background: "var(--surface-subtle)",
          borderColor: "var(--border)",
          color: "var(--foreground)",
        }}
        title={`Click to ${isOpen ? "collapse" : "expand"} ${title}`}
      >
        <span>{title}</span>
        {typeof count === "number" && (
          <span
            className="text-[10px] px-2 py-0.5 rounded-full border opacity-70"
            style={{ borderColor: "var(--border)" }}
          >
            {count}
          </span>
        )}
        <span className="text-xs opacity-75 font-sans">
          {isOpen ? "▲" : "▼"}
        </span>
      </button>
      <div className="h-px flex-1" style={{ background: "var(--border)" }} />
    </div>
  );
}

export function PlSqlHelpView({
  onBackToWorkspace,
  onNavigateSection,
  onOpenTerminal,
}: PlSqlHelpViewProps) {
  const [sectionsOpen, setSectionsOpen] = useState({
    manual: true,
    quiz: true,
    pyq: true,
    terminal: true,
  });
  const [openCards, setOpenCards] = useState<Record<number, boolean>>({
    1: true,
    2: true,
    3: true,
  });
  const [openFaqs, setOpenFaqs] = useState<Record<string, boolean>>({});
  const [searchQuery, setSearchQuery] = useState("");

  const toggleSection = (key: "manual" | "quiz" | "pyq" | "terminal") => {
    setSectionsOpen((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const toggleCard = (id: number) => {
    setOpenCards((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const toggleFaq = (key: string) => {
    setOpenFaqs((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const expandAll = () => {
    const all: Record<number, boolean> = {};
    for (let i = 1; i <= 20; i++) {
      all[i] = true;
    }
    setOpenCards(all);
    setSectionsOpen({
      manual: true,
      quiz: true,
      pyq: true,
      terminal: true,
    });
  };

  const collapseAll = () => {
    setOpenCards({});
    setSectionsOpen({
      manual: false,
      quiz: false,
      pyq: false,
      terminal: false,
    });
  };

  const scrollToSection = (id: string, sectionKey?: "manual" | "quiz" | "pyq" | "terminal") => {
    if (sectionKey) {
      setSectionsOpen((prev) => ({ ...prev, [sectionKey]: true }));
    }
    setTimeout(() => {
      const el = document.getElementById(id);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }, 50);
  };

  const manualSections = [
    {
      id: 1,
      title: "The PL/SQL Workspace & Split-Panel Layout",
      whatItDoes:
        "Provides an integrated, responsive procedural development studio designed specifically for Oracle PL/SQL, featuring live block interpretation, output stream capture, and variable tracking.",
      whatToDo:
        "Open the PL/SQL Studio. Adjust the panel width by dragging the central vertical resizer divider bar, or click its collapse/expand toggle button for a full-screen canvas view.",
      controls:
        "Top navigation bar ([Workspace], [Download], [Quiz], [Exam PYQs], [Learn], [Help]), theme switcher, and the draggable panel resizer divider.",
      processing:
        "Initializes the relational in-memory schema, mounts the procedural AST interpreter, and prepares the dual-stream DBMS_OUTPUT buffer.",
      expectedOutput:
        "A responsive dual-panel environment ready to compile and execute Oracle PL/SQL anonymous blocks and procedural commands.",
    },
    {
      id: 2,
      title: "Choosing & Managing Datasets in PL/SQL",
      whatItDoes:
        "Switches the active relational schema and table records between pre-configured enterprise domains (E-Commerce, University, Hospital, Library) or user-created custom catalogs.",
      whatToDo:
        "Click the dataset dropdown at the top of the input sidebar to switch catalogs, edit schema definitions, create custom datasets, or import database files (.csv, .json, .tsv, .sql, .db).",
      controls:
        "The 'Choose a dataset' select dropdown, '+ Create New Dataset...', and 'Import Dataset...' modal triggers in the left panel.",
      processing:
        "Clears previous execution buffers, populates the relational engine with new tables and records, refreshes the ER diagram, and loads relevant PL/SQL sample scripts.",
      expectedOutput:
        "The schema viewer, sample blocks, and auto-completion immediately reflect tables and foreign keys belonging to the chosen domain.",
    },
    {
      id: 3,
      title: "Natural Language Translation to PL/SQL (Gemini AI)",
      whatItDoes:
        "Converts conversational plain English business requirements into structurally sound, executable Oracle PL/SQL blocks using Gemini AI.",
      whatToDo:
        "Enter your requirement in '1. Ask by Voice or Natural Language' (e.g. 'Calculate total revenue for delivered orders and print status with DBMS_OUTPUT') and click 'Translate & Run'.",
      controls:
        "The natural language textarea and the purple 'Translate & Run' action button.",
      processing:
        "Gemini inspects the active database schema, synthesizes appropriate DECLARE variable types, explicit CURSOR definitions, loop constructs, and DBMS_OUTPUT.PUT_LINE invocations.",
      expectedOutput:
        "The synthesized PL/SQL script populates the code editor, a confidence rating pill is displayed, and the procedural pipeline executes immediately.",
    },
    {
      id: 4,
      title: "Spoken Prompts & Voice Dictation",
      whatItDoes:
        "Uses the browser's Web Speech API to capture spoken procedural requirements and automatically transcribe them into the prompt box.",
      whatToDo:
        "Click the microphone button under Voice Controls, grant mic permission in your browser, and speak your query clearly. Optionally enable 'Auto-Translate on stop'.",
      controls:
        "The microphone toggle button, 'Auto-Translate on stop' checkbox, and audio waveform indicator in the input panel.",
      processing:
        "Converts audio speech tokens into text in real time. Upon pause or stop, automatically feeds the transcription to the Gemini translator.",
      expectedOutput:
        "The spoken query appears in the natural language text area and triggers automated procedural synthesis.",
    },
    {
      id: 5,
      title: "Fast-Path Direct Execution (DECLARE / BEGIN Detection)",
      whatItDoes:
        "Automatically identifies raw PL/SQL syntax typed into the top prompt box and bypasses AI translation for instantaneous zero-latency execution.",
      whatToDo:
        "Type or paste any PL/SQL block starting with keywords like DECLARE, BEGIN, or CREATE OR REPLACE directly into the prompt box and click 'Translate & Run'.",
      controls:
        "The top text area and 'Translate & Run' button.",
      processing:
        "The engine performs prefix regex matching on keywords; upon detecting raw PL/SQL grammar, it bypasses the network LLM call and routes code directly to the execution pipeline.",
      expectedOutput:
        "Instant execution without any network latency, loading spinners, or token consumption.",
    },
    {
      id: 6,
      title: "Writing PL/SQL Directly & Code Templates",
      whatItDoes:
        "Offers a monospaced code editor with dedicated syntax highlighting, indentation support, and one-click starter templates for common procedural patterns.",
      whatToDo:
        "Scroll to '2. Or write PL/SQL directly' in the left panel. Write custom anonymous blocks or click template buttons to insert Cursors, Loops, or Exception handling skeletons.",
      controls:
        "The monospaced code textarea, template snippet buttons, and 'Clear' editor button.",
      processing:
        "Maintains the code buffer in component state and tracks cursor positions for template snippet insertion.",
      expectedOutput:
        "Formatted, indented PL/SQL code ready for execution or modification.",
    },
    {
      id: 7,
      title: "Executing Anonymous Blocks & Scripts",
      whatItDoes:
        "Parses, validates, and runs the current PL/SQL script against the active relational dataset, executing control flow, embedded DML, and output operations.",
      whatToDo:
        "Click the 'Execute PL/SQL' button below the code editor.",
      controls:
        "The primary 'Execute PL/SQL' button with play icon.",
      processing:
        "The procedural engine performs lexical analysis, builds a statement-level execution tree, evaluates variable assignments, steps through cursors, executes embedded queries, and updates table records.",
      expectedOutput:
        "The execution pipeline populates with discrete stages, the DBMS_OUTPUT terminal prints lines, and modified table rows update in real time.",
    },
    {
      id: 8,
      title: "The Step-by-Step Procedural Execution Pipeline",
      whatItDoes:
        "Deconstructs procedural execution into an animated, observable chronological sequence of discrete operations (DECLARE, ASSIGN, CURSOR, LOOP, CONDITIONAL, OUTPUT, MUTATION, COMMIT, EXCEPTION).",
      whatToDo:
        "Inspect the 'Execution Pipeline' timeline in the center canvas. Click any stage pill to jump directly to that operational point in time.",
      controls:
        "Color-coded stage badges (e.g., `DECLARE (1)`, `CURSOR (3)`, `LOOP (8)`, `OUTPUT (5)`) and the step overview card.",
      processing:
        "The interpreter records an audit snapshot of memory, active variables, and database state at each execution step.",
      expectedOutput:
        "Clicking any stage highlights its exact code line, intermediate variable values, and affected database records.",
    },
    {
      id: 9,
      title: "Pipeline Playback Controls (Play / Pause / Next / Prev)",
      whatItDoes:
        "Provides media-style playback controls to step forward, step backward, or auto-animate through the procedural execution lifecycle.",
      whatToDo:
        "Click the 'Play / Animate' button to watch steps advance automatically, or use the 'Next Step' (▶) and 'Prev Step' (◀) buttons to inspect execution step-by-step.",
      controls:
        "The Play/Pause toggle button, Previous Step button, Next Step button, and playback timeline scrubber.",
      processing:
        "A managed interval timer advances the active step index and updates the variable watch view and working buffers synchronously.",
      expectedOutput:
        "Smooth visual progression through loops, conditional branches, and cursor fetches, providing unparalleled educational insight.",
    },
    {
      id: 10,
      title: "The DBMS_OUTPUT Terminal & Console Logging",
      whatItDoes:
        "Emulates the standard Oracle SQL*Plus `SET SERVEROUTPUT ON` console, capturing and displaying all `DBMS_OUTPUT.PUT_LINE` text streams in real time.",
      whatToDo:
        "Run any block containing `DBMS_OUTPUT.PUT_LINE('...');`. Scroll to the DBMS_OUTPUT Terminal under the 'Pipeline & Output' tab to read stdout logs.",
      controls:
        "The DBMS_OUTPUT Terminal window, 'Console' view tab, and 'Copy Output' button.",
      processing:
        "The runtime intercepts all output buffer calls, formats messages with timestamps and line indices, and appends them to the console stream.",
      expectedOutput:
        "High-contrast terminal screen displaying formatted console output text with line numbers and copy-to-clipboard functionality.",
    },
    {
      id: 11,
      title: "Tabular View of Console Outputs & Copy Logs",
      whatItDoes:
        "Transforms raw DBMS_OUTPUT console logs into a structured tabular data grid and provides one-click clipboard copying.",
      whatToDo:
        "Click the 'Table' toggle button inside the DBMS_OUTPUT Terminal header. Click 'Copy Output' to copy all log messages to your clipboard.",
      controls:
        "The 'Console' vs 'Table' display toggle buttons and 'Copy Output' action button.",
      processing:
        "Parses semi-structured delimiters, key-value pairs, or numbered items into table columns and rows for easier review and analysis.",
      expectedOutput:
        "A clear tabular breakdown of output messages and a confirmation toast when text is copied to clipboard.",
    },
    {
      id: 12,
      title: "Explicit Cursors & Cursor FOR Loops",
      whatItDoes:
        "Supports standard Oracle cursor lifecycles (CURSOR declaration, OPEN, FETCH INTO, %FOUND, %NOTFOUND, %ROWCOUNT, CLOSE) as well as concise `FOR r IN (SELECT ...)` loops.",
      whatToDo:
        "Define an explicit cursor in DECLARE or use a cursor FOR loop in the BEGIN block. Execute the script to trace cursor iterations.",
      controls:
        "Code editor cursor templates and stage pills tagged with `CURSOR` and `LOOP`.",
      processing:
        "Compiles the cursor's underlying SQL query, fetches rows tuple-by-tuple into local memory, and increments `%ROWCOUNT` on each loop pass.",
      expectedOutput:
        "Visual tracing of each cursor fetch showing which table tuple was retrieved and how loop variables were populated.",
    },
    {
      id: 13,
      title: "Conditional Logic & Branching (IF-THEN-ELSIF-ELSE)",
      whatItDoes:
        "Evaluates Boolean expressions and branches execution paths dynamically according to variable values or query outcomes.",
      whatToDo:
        "Include `IF condition THEN ... ELSIF condition THEN ... ELSE ... END IF;` statements within your procedural block.",
      controls:
        "Monospaced code editor and `CONDITIONAL` pipeline stage pills.",
      processing:
        "Evaluates the truth value of predicates (e.g., `v_total > 5000`); marks unreached branches as skipped and routes execution into the matching branch.",
      expectedOutput:
        "The pipeline player clearly shows which branch condition evaluated to TRUE and which branch was taken.",
    },
    {
      id: 14,
      title: "Embedded DML & In-Memory Mutations (INSERT, UPDATE, DELETE)",
      whatItDoes:
        "Allows procedural blocks to mutate relational tables directly via embedded `INSERT`, `UPDATE`, and `DELETE` statements.",
      whatToDo:
        "Write DML statements inside your PL/SQL block (e.g., `UPDATE customers SET status = 'VIP' WHERE total_spent > 10000;`).",
      controls:
        "The code editor and `MUTATION` pipeline stage pills.",
      processing:
        "The in-memory database engine locates target rows, applies updates or inserts new tuples, updates table indexes, and counts `SQL%ROWCOUNT`.",
      expectedOutput:
        "A notification displaying the number of rows modified and an updated Final Result / Schema table showing changed values.",
    },
    {
      id: 15,
      title: "SELECT INTO & Variable Assignments",
      whatItDoes:
        "Fetches a single row of database values directly into declared scalar variables using standard `SELECT col1, col2 INTO var1, var2 FROM ...`.",
      whatToDo:
        "Declare target variables in DECLARE, then write a `SELECT ... INTO ... FROM ... WHERE ...` statement in your BEGIN block.",
      controls:
        "The code editor and `ASSIGN` pipeline stage badges.",
      processing:
        "Verifies that exactly one tuple matches the query predicate. Binds column values to target variables in the procedural scope.",
      expectedOutput:
        "Variables in the Procedural Logic tab reflect their freshly assigned values, ready for subsequent computation.",
    },
    {
      id: 16,
      title: "Exception Handling & Autonomous Error Recovery",
      whatItDoes:
        "Traps runtime exceptions (`NO_DATA_FOUND`, `TOO_MANY_ROWS`, `ZERO_DIVIDE`, `OTHERS`) and executes customized fallback logic.",
      whatToDo:
        "Add an `EXCEPTION WHEN NO_DATA_FOUND THEN ... WHEN OTHERS THEN ...` block at the bottom of your PL/SQL script.",
      controls:
        "The code editor exception template and `EXCEPTION` stage pills in the pipeline.",
      processing:
        "Catches runtime database errors without crashing the session, logs diagnostic error codes, and routes control flow into the exception handler.",
      expectedOutput:
        "The pipeline highlights the handled exception stage and prints the custom fallback message to DBMS_OUTPUT.",
    },
    {
      id: 17,
      title: "Procedural Logic Tab & Variable State Watch",
      whatItDoes:
        "Provides deep structural inspection of the PL/SQL program: live variable watch table, cursor tracking, control flow diagram, and cyclomatic complexity.",
      whatToDo:
        "Click the 'Procedural Logic' tab in the center canvas after executing a block.",
      controls:
        "The 'Procedural Logic' tab button above the center panel.",
      processing:
        "Performs AST analysis on the script to extract variable scopes, cursor attributes, loop nesting depths, and branching complexity.",
      expectedOutput:
        "An organized dashboard displaying variable types and values, cursor state, control flow overview, and algorithmic insights.",
    },
    {
      id: 18,
      title: "Schema Viewer & Chen Entity-Relationship Diagram",
      whatItDoes:
        "Visualizes all relational tables, column data types, primary/foreign keys, and an interactive SVG Chen ER diagram with relationship diamonds.",
      whatToDo:
        "Click the 'Schema / ER' tab at the top of the center canvas.",
      controls:
        "The 'Schema / ER' tab button, zoom controls, and 'View Insights' buttons on table cards.",
      processing:
        "Renders table definitions and relational constraints from the active database catalog, displaying entities, attributes, and relationships.",
      expectedOutput:
        "An interactive Chen ER diagram with distinct entity rectangles, attribute ellipses (PK underlined), and relationship diamonds.",
    },
    {
      id: 19,
      title: "PL/SQL Theory & Oracle Execution Architecture",
      whatItDoes:
        "Explains the inner workings of Oracle PL/SQL architecture: SQL Engine vs PL/SQL Engine context switching, bytecode execution, and optimization tips.",
      whatToDo:
        "Click the 'PL/SQL Theory' tab at the top of the center canvas.",
      controls:
        "The 'PL/SQL Theory' tab button above the canvas.",
      processing:
        "Renders curated architectural diagrams and educational breakdowns of engine context switches, bulk processing (`FORALL` / `BULK COLLECT`), and package compilation.",
      expectedOutput:
        "Rich theoretical explanations that bridge university DBMS curriculum with enterprise Oracle database administration.",
    },
    {
      id: 20,
      title: "Exporting Reports & Execution Logs (CSV, PDF, DOCX, MD)",
      whatItDoes:
        "Generates publication-quality execution reports, data exports, and audit logs in multiple industry formats.",
      whatToDo:
        "Click 'CSV' in the canvas header to download table/console data, click 'Report' for instant Markdown export, or navigate to 'Download' in the top bar for PDF and Word DOCX formats.",
      controls:
        "Canvas export buttons ('CSV', 'Report') and the 'Download' top navigation section.",
      processing:
        "Compiles execution metadata, script source, DBMS_OUTPUT logs, affected records, and ER diagrams into a structured document.",
      expectedOutput:
        "Immediate file download in your selected format with complete execution audit details.",
    },
  ];

  const quizFaqs = [
    {
      id: "q1",
      question: "How do I start a daily quiz and earn streak points in PL/SQL?",
      answer: "Click the 'Quiz' button in the top navigation bar. Select a challenge difficulty tier, solve the problem, and click 'Submit Answer'. A correct answer increments your daily streak and updates your placement on the global leaderboard.",
    },
    {
      id: "q2",
      question: "How does the Daily Streak calculation work?",
      answer: "Streaks track consecutive calendar days where you complete at least one verified quiz challenge. Each day you solve a challenge, your streak increments by 1. The flame icon (🔥) on your profile avatar displays your current active streak count.",
    },
    {
      id: "q3",
      question: "Do I need an account to save my PL/SQL quiz score and streak?",
      answer: "Yes. Click the user profile icon at the top right to sign in with Google. While guest users can practice questions, an active account is required to preserve your streak across devices and appear on the Global Leaderboard.",
    },
    {
      id: "q4",
      question: "Can I get hints if I get stuck on a procedural problem?",
      answer: "Yes. Each quiz problem features progressive hints. Clicking 'Show Hint' reveals directional guidance without spoiling the exact solution code, helping you deduce the answer on your own.",
    },
    {
      id: "q5",
      question: "How is my Global Leaderboard Rank calculated?",
      answer: "Rankings are calculated primarily by your current active consecutive daily streak, followed by verified points earned and query precision percentage. Maintaining consistent daily streaks is the key to top ranking.",
    },
    {
      id: "q6",
      question: "How do I return to the PL/SQL workspace from Quiz view?",
      answer: "Click the 'Workspace' button in the top navigation bar or the 'Back to Workspace' link in the quiz header to resume your PL/SQL development workspace immediately.",
    },
  ];

  const pyqFaqs = [
    {
      id: "p1",
      question: "What is the Exam PYQ section and where are questions sourced from?",
      answer: "The Exam PYQ (Previous Year Questions) section is an authentic question bank containing verified questions from major competitive exams and technical certifications, including GATE CS, ISRO Scientist, UGC-NET Computer Science, Oracle Database SQL (1Z0-071), and top campus recruitment tests (TCS, Infosys, Wipro).",
    },
    {
      id: "p2",
      question: "How do I navigate to and filter PL/SQL Exam PYQs?",
      answer: "Click 'Exam PYQs' in the top navigation bar. Use the filter controls at the top of the page to filter by Exam Body (GATE, ISRO, UGC-NET, Oracle), Year (2005 - 2024+), Topic (Cursors, Triggers, Exceptions, Subqueries, Normalization), and Difficulty level (Easy, Medium, Hard).",
    },
    {
      id: "p3",
      question: "Can I test and run my procedural code directly inside the PYQ solver?",
      answer: "Yes! Unlike static PDF past papers, every question features an interactive live code sandbox. You can write your procedural block and click 'Run Query' to execute it against the exact test schema provided in the exam problem.",
    },
    {
      id: "p4",
      question: "Are complete official solutions and step-by-step proofs provided?",
      answer: "Yes. Each problem includes detailed official answer keys, relational algebra derivations, step-by-step tuple tracing, and examiner notes explaining why alternative distractors are incorrect.",
    },
    {
      id: "p5",
      question: "Can I bookmark questions to review them later before an exam?",
      answer: "Yes. Click the bookmark icon on any question card to save it into your revision list. You can toggle the 'Bookmarked Only' filter at the top to practice your personal review questions.",
    },
    {
      id: "p6",
      question: "How do I navigate between SQL PYQs and PL/SQL PYQs?",
      answer: "You can switch between SQL and PL/SQL modes using the mode toggle pills in the header, or direct URLs /sql/exam and /plsql/exam.",
    },
  ];

  const terminalFaqs = [
    {
      id: "t1",
      question: "How do I open and exit the interactive Terminal CLI?",
      answer: "Click the '>_ Terminal' button in the top navigation bar to launch the full-screen interactive CLI. To exit, type 'EXIT' or 'QUIT' into the terminal prompt and press Enter, or click the exit button (✕) in the top-right corner of the terminal window.",
    },
    {
      id: "t2",
      question: "What built-in system commands are supported in the terminal?",
      answer: "Supported commands include:\n• HELP or ? : Show command guide and syntax cheat sheet\n• SHOW DATABASES : List all active and custom databases\n• USE <dbname> : Switch active working database catalog\n• SHOW TABLES : List relations in current database\n• DESC <table> or DESCRIBE <table> : Inspect table schema, columns, and primary keys\n• CLEAR or CLS : Flush the terminal screen buffer\n• EXIT or QUIT : Return to the visual GUI workspace",
    },
    {
      id: "t3",
      question: "Can I run standard SQL DDL, DML, and DQL commands?",
      answer: "Yes. You can run SELECT, INSERT, UPDATE, DELETE, CREATE TABLE, DROP TABLE, and ALTER TABLE statements. All queries execute against the in-memory relational engine and display formatted ASCII tables with execution timings.",
    },
    {
      id: "t4",
      question: "How does command history work in the terminal?",
      answer: "Use the Up Arrow (↑) and Down Arrow (↓) keys on your keyboard to navigate back and forth through your previously executed command history, just like a real Unix bash or MySQL terminal.",
    },
    {
      id: "t5",
      question: "Does executing queries in the terminal modify the visual workspace?",
      answer: "Yes. The terminal shares the same underlying database session. Any tables created or rows inserted, updated, or deleted via the terminal will immediately appear in the visual Schema and Result tabs once you return to the workspace.",
    },
    {
      id: "t6",
      question: "How do I reset the database if I made unwanted modifications in the terminal?",
      answer: "Click the 'Reset Database' button in the terminal header or type 'USE <current_db>' to reload the default sample catalog and restore original table data.",
    },
  ];

  // Search filtering logic
  const query = searchQuery.trim().toLowerCase();

  const filteredManualSections = useMemo(() => {
    if (!query) return manualSections;
    return manualSections.filter(
      (s) =>
        s.title.toLowerCase().includes(query) ||
        s.whatItDoes.toLowerCase().includes(query) ||
        s.whatToDo.toLowerCase().includes(query) ||
        s.controls.toLowerCase().includes(query) ||
        s.processing.toLowerCase().includes(query) ||
        s.expectedOutput.toLowerCase().includes(query)
    );
  }, [query]);

  const filteredQuizFaqs = useMemo(() => {
    if (!query) return quizFaqs;
    return quizFaqs.filter(
      (f) => f.question.toLowerCase().includes(query) || f.answer.toLowerCase().includes(query)
    );
  }, [query]);

  const filteredPyqFaqs = useMemo(() => {
    if (!query) return pyqFaqs;
    return pyqFaqs.filter(
      (f) => f.question.toLowerCase().includes(query) || f.answer.toLowerCase().includes(query)
    );
  }, [query]);

  const filteredTerminalFaqs = useMemo(() => {
    if (!query) return terminalFaqs;
    return terminalFaqs.filter(
      (f) => f.question.toLowerCase().includes(query) || f.answer.toLowerCase().includes(query)
    );
  }, [query]);

  return (
    <main
      className="flex-1 min-h-0 flex flex-col p-4 sm:p-6 md:p-8 lg:p-10 xl:p-12 overflow-y-auto overflow-x-hidden w-full max-w-none leading-relaxed"
      style={{ color: "var(--foreground)" }}
      aria-label="Help section: Comprehensive PL/SQL Manual"
    >
      {/* Top Header / Breadcrumb */}
      <div
        className="flex flex-wrap items-center justify-between gap-4 pb-5 mb-6 border-b"
        style={{ borderColor: "var(--border)" }}
      >
        <div>
          <h1
            className="text-2xl md:text-4xl font-bold tracking-tight"
            style={{ color: "var(--foreground)" }}
          >
            PL/SQL Studio Operations &amp; User Manual
          </h1>
          <p className="text-sm md:text-base opacity-80 mt-1.5" style={{ color: "var(--muted)" }}>
            Complete operating manual for the procedural PL/SQL workspace, engine controls, and procedural features.
          </p>
        </div>

        {/* Action Buttons: Section Jump Links + Expand/Collapse */}
        <div className="flex flex-wrap items-center gap-2">
          <div
            className="flex flex-wrap items-center gap-1 p-1 rounded-xl border"
            style={{ borderColor: "var(--border)", background: "var(--surface-subtle)" }}
          >
            <button
              type="button"
              onClick={() => scrollToSection("section-manual", "manual")}
              className="px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer hover:bg-[var(--panel)]"
              style={{ color: "var(--foreground)" }}
            >
              Features
            </button>
            <button
              type="button"
              onClick={() => scrollToSection("section-quiz", "quiz")}
              className="px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer hover:bg-[var(--panel)]"
              style={{ color: "var(--foreground)" }}
            >
              Quiz Help
            </button>
            <button
              type="button"
              onClick={() => scrollToSection("section-pyq", "pyq")}
              className="px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer hover:bg-[var(--panel)]"
              style={{ color: "var(--foreground)" }}
            >
              PYQ Help
            </button>
            <button
              type="button"
              onClick={() => scrollToSection("section-terminal", "terminal")}
              className="px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer hover:bg-[var(--panel)]"
              style={{ color: "var(--foreground)" }}
            >
              Terminal Help
            </button>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={expandAll}
              className="px-3 py-1.5 rounded-lg text-xs md:text-sm font-semibold border transition-all cursor-pointer hover:opacity-90"
              style={{
                background: "var(--surface-subtle)",
                borderColor: "var(--border)",
                color: "var(--foreground)",
              }}
            >
              Expand All
            </button>
            <button
              type="button"
              onClick={collapseAll}
              className="px-3 py-1.5 rounded-lg text-xs md:text-sm font-semibold border transition-all cursor-pointer hover:opacity-90"
              style={{
                background: "var(--surface-subtle)",
                borderColor: "var(--border)",
                color: "var(--foreground)",
              }}
            >
              Collapse All
            </button>
          </div>
        </div>
      </div>

      {/* Prominent Search Bar on Top of Content */}
      <div className="mb-8">
        <div className="relative w-full">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none opacity-60">
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              style={{ color: "var(--foreground)" }}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search PL/SQL topics, blocks, cursors, commands, FAQs..."
            className="w-full pl-10 pr-12 py-2.5 rounded-xl border text-sm transition-all focus:outline-none shadow-2xs"
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
              className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-xs opacity-60 hover:opacity-100 cursor-pointer font-sans"
              style={{ color: "var(--foreground)" }}
              title="Clear search"
            >
              Clear
            </button>
          )}
        </div>
        {query && (
          <div
            className="mt-2 text-xs flex items-center justify-between px-1"
            style={{ color: "var(--muted)" }}
          >
            <span>
              Search results for &quot;{searchQuery}&quot; (
              {filteredManualSections.length +
                filteredQuizFaqs.length +
                filteredPyqFaqs.length +
                filteredTerminalFaqs.length}{" "}
              topics matched)
            </span>
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="underline cursor-pointer hover:opacity-100"
            >
              Reset filter
            </button>
          </div>
        )}
      </div>

      {/* SECTION 1: DETAILED FEATURE MANUAL */}
      {(!query || filteredManualSections.length > 0) && (
        <div className="space-y-4">
          <SectionHeadingBox
            id="section-manual"
            title="FEATURE MANUAL"
            count={filteredManualSections.length}
            isOpen={query ? true : sectionsOpen.manual}
            onToggle={() => toggleSection("manual")}
          />

          {(query || sectionsOpen.manual) && (
            <>
              <div className="pb-2">
                <h2
                  className="text-lg md:text-2xl font-bold tracking-tight"
                  style={{ color: "var(--foreground)" }}
                >
                  Detailed Feature Manual (Sections 1 — 20)
                </h2>
                <p className="text-sm md:text-base opacity-80 mt-1" style={{ color: "var(--muted)" }}>
                  Detailed operational rules, procedural requirements, control buttons, runtime lifecycles, and expected outputs. Click any card to expand or collapse.
                </p>
              </div>

              {filteredManualSections.map((sec) => {
                const isOpen = query ? true : !!openCards[sec.id];
                return (
                  <section
                    key={sec.id}
                    className="panel rounded-xl border transition-all duration-200 overflow-hidden shadow-xs"
                    style={{
                      background: "var(--panel)",
                      borderColor: "var(--border)",
                    }}
                  >
                    <button
                      type="button"
                      onClick={() => toggleCard(sec.id)}
                      aria-expanded={isOpen}
                      className="w-full p-4 md:p-5 flex items-center justify-between text-left cursor-pointer transition-colors hover:bg-[var(--surface-subtle)] focus:outline-none"
                    >
                      <div className="flex items-center gap-3 md:gap-4 pr-3 min-w-0">
                        {/* Numbering box: Site theme color (Orange) with white text */}
                        <span
                          className="text-xs md:text-sm font-mono font-bold px-2.5 py-1 rounded-lg shrink-0 shadow-xs border border-transparent"
                          style={{
                            background: "var(--accent, #FF6A3D)",
                            color: "#ffffff",
                          }}
                        >
                          {sec.id}
                        </span>
                        <div className="min-w-0">
                          <h3
                            className="text-base md:text-lg font-bold tracking-tight truncate"
                            style={{ color: "var(--foreground)" }}
                          >
                            {sec.title}
                          </h3>
                          {!isOpen && (
                            <p
                              className="text-xs md:text-sm opacity-70 truncate mt-0.5"
                              style={{ color: "var(--muted)" }}
                            >
                              {sec.whatItDoes}
                            </p>
                          )}
                        </div>
                      </div>

                      <div
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold shrink-0 transition-colors"
                        style={{
                          background: "var(--surface-subtle)",
                          color: "var(--foreground)",
                          borderColor: "var(--border)",
                        }}
                        title={isOpen ? "Click to collapse card" : "Click to view more details"}
                      >
                        <span className="hidden sm:inline font-sans">
                          {isOpen ? "Collapse" : "Click to view"}
                        </span>
                        <svg
                          className={`w-4 h-4 transition-transform duration-200 ${isOpen ? "rotate-180" : ""
                            }`}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 9l-7 7-7-7"
                          />
                        </svg>
                      </div>
                    </button>

                    {isOpen && (
                      <div
                        className="p-5 md:p-6 border-t space-y-4"
                        style={{ borderColor: "var(--border)" }}
                      >
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <HelpSubcard title="What it does:" content={sec.whatItDoes} />
                          <HelpSubcard title="What the user needs to enter/do:" content={sec.whatToDo} />
                          <HelpSubcard title="Which button / control to use:" content={sec.controls} />
                          <HelpSubcard title="What happens during processing:" content={sec.processing} />
                        </div>

                        <HelpSubcard
                          title="What output the user should expect:"
                          content={sec.expectedOutput}
                          highlight={true}
                        />
                      </div>
                    )}
                  </section>
                );
              })}
            </>
          )}
        </div>
      )}

      {/* SECTION 2: QUIZ & STREAKS */}
      {(!query || filteredQuizFaqs.length > 0) && (
        <section className="space-y-4">
          <SectionHeadingBox
            id="section-quiz"
            title="QUIZ & STREAKS"
            count={filteredQuizFaqs.length}
            isOpen={query ? true : sectionsOpen.quiz}
            onToggle={() => toggleSection("quiz")}
          />

          {(query || sectionsOpen.quiz) && (
            <>
              {/* Overview Banner */}
              <div
                className="p-5 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                style={{
                  background: "var(--panel)",
                  borderColor: "var(--border)",
                }}
              >
                <div>
                  <div
                    className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold border mb-2"
                    style={{
                      background: "var(--surface-subtle)",
                      borderColor: "var(--border)",
                      color: "var(--foreground)",
                    }}
                  >
                    <span>🔥 Daily Challenges &amp; Streaks</span>
                  </div>
                  <h3 className="text-base sm:text-lg font-bold" style={{ color: "var(--foreground)" }}>
                    Daily PL/SQL Challenges &amp; Global Leaderboard
                  </h3>
                  <p className="text-xs sm:text-sm opacity-85 mt-1" style={{ color: "var(--muted)" }}>
                    Solve procedural challenges, build continuous daily streaks, and compete on the global leaderboard.
                  </p>
                </div>

                {onNavigateSection && (
                  <button
                    type="button"
                    onClick={() => onNavigateSection("quiz")}
                    className="px-4 py-2 rounded-xl text-xs sm:text-sm font-bold border transition-all cursor-pointer shadow-xs shrink-0 hover:opacity-90"
                    style={{
                      background: "var(--surface-subtle)",
                      borderColor: "var(--border)",
                      color: "var(--foreground)",
                    }}
                  >
                    Launch Quiz Now →
                  </button>
                )}
              </div>

              {/* How to Navigate Steps */}
              <div
                className="p-5 rounded-xl border space-y-3"
                style={{
                  background: "var(--panel)",
                  borderColor: "var(--border)",
                }}
              >
                <h4
                  className="text-xs md:text-sm font-bold uppercase tracking-wider"
                  style={{ color: "var(--foreground)" }}
                >
                  How to Navigate to Quiz
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                  <div
                    className="p-3.5 rounded-lg border"
                    style={{ background: "var(--surface-subtle)", borderColor: "var(--border)" }}
                  >
                    <div
                      className="text-xs font-mono font-bold px-2 py-0.5 rounded-md inline-block mb-1.5"
                      style={{ background: "var(--accent, #FF6A3D)", color: "#ffffff" }}
                    >
                      Step 1: Top Navigation
                    </div>
                    <p className="text-xs" style={{ color: "var(--muted)" }}>
                      Click the <strong>Quiz</strong> button in the top navigation bar from any view.
                    </p>
                  </div>
                  <div
                    className="p-3.5 rounded-lg border"
                    style={{ background: "var(--surface-subtle)", borderColor: "var(--border)" }}
                  >
                    <div
                      className="text-xs font-mono font-bold px-2 py-0.5 rounded-md inline-block mb-1.5"
                      style={{ background: "var(--accent, #FF6A3D)", color: "#ffffff" }}
                    >
                      Step 2: Solve &amp; Submit
                    </div>
                    <p className="text-xs" style={{ color: "var(--muted)" }}>
                      Select difficulty tier, read problem requirements, formulate code, and click <strong>Submit Answer</strong>.
                    </p>
                  </div>
                  <div
                    className="p-3.5 rounded-lg border"
                    style={{ background: "var(--surface-subtle)", borderColor: "var(--border)" }}
                  >
                    <div
                      className="text-xs font-mono font-bold px-2 py-0.5 rounded-md inline-block mb-1.5"
                      style={{ background: "var(--accent, #FF6A3D)", color: "#ffffff" }}
                    >
                      Step 3: Return to Workspace
                    </div>
                    <p className="text-xs" style={{ color: "var(--muted)" }}>
                      Click <strong>Workspace</strong> in the top header or back link to resume your PL/SQL session.
                    </p>
                  </div>
                </div>
              </div>

              {/* Quiz Features Breakdown */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                <div
                  className="p-4 rounded-xl border space-y-1"
                  style={{ background: "var(--panel)", borderColor: "var(--border)" }}
                >
                  <div className="text-xs font-bold" style={{ color: "var(--foreground)" }}>
                    Daily Streak Mechanics
                  </div>
                  <p className="text-xs" style={{ color: "var(--muted)" }}>
                    Solve at least one challenge every 24 hours. The active flame icon (🔥) on your profile shows your continuous days streak.
                  </p>
                </div>
                <div
                  className="p-4 rounded-xl border space-y-1"
                  style={{ background: "var(--panel)", borderColor: "var(--border)" }}
                >
                  <div className="text-xs font-bold" style={{ color: "var(--foreground)" }}>
                    Global Leaderboard
                  </div>
                  <p className="text-xs" style={{ color: "var(--muted)" }}>
                    Rankings are scored by streak length and verified accuracy. Sign in with Google to save your progress permanently.
                  </p>
                </div>
                <div
                  className="p-4 rounded-xl border space-y-1"
                  style={{ background: "var(--panel)", borderColor: "var(--border)" }}
                >
                  <div className="text-xs font-bold" style={{ color: "var(--foreground)" }}>
                    Progressive Hints
                  </div>
                  <p className="text-xs" style={{ color: "var(--muted)" }}>
                    Click 'Show Hint' when stuck to receive conceptual and procedural clues without exposing the full solution block.
                  </p>
                </div>
                <div
                  className="p-4 rounded-xl border space-y-1"
                  style={{ background: "var(--panel)", borderColor: "var(--border)" }}
                >
                  <div className="text-xs font-bold" style={{ color: "var(--foreground)" }}>
                    Detailed Solutions &amp; Theory
                  </div>
                  <p className="text-xs" style={{ color: "var(--muted)" }}>
                    Inspect the canonical procedural solution, execution traces, and explanations for why alternative approaches fail.
                  </p>
                </div>
              </div>

              {/* Quiz FAQ Accordion */}
              <div className="space-y-2 pt-2">
                <h4
                  className="text-xs md:text-sm font-bold uppercase tracking-wider"
                  style={{ color: "var(--foreground)" }}
                >
                  Quiz &amp; Streaks Questions (FAQ)
                </h4>
                {filteredQuizFaqs.map((faq, idx) => {
                  const key = `quiz-${faq.id}`;
                  const isOpen = query ? true : !!openFaqs[key];
                  return (
                    <div
                      key={faq.id}
                      className="rounded-xl border overflow-hidden"
                      style={{ background: "var(--surface-subtle)", borderColor: "var(--border)" }}
                    >
                      <button
                        type="button"
                        onClick={() => toggleFaq(key)}
                        className="w-full p-3.5 flex items-center justify-between text-left text-xs sm:text-sm font-semibold cursor-pointer hover:opacity-90"
                        style={{ color: "var(--foreground)" }}
                      >
                        <span className="flex items-center gap-2.5">
                          <span
                            className="text-[11px] font-mono font-bold px-1.5 py-0.5 rounded shrink-0"
                            style={{ background: "var(--accent, #FF6A3D)", color: "#ffffff" }}
                          >
                            Q{idx + 1}
                          </span>
                          <span>{faq.question}</span>
                        </span>
                        <span className="text-xs ml-2 opacity-70">{isOpen ? "▲" : "▼"}</span>
                      </button>
                      {isOpen && (
                        <div
                          className="p-3.5 pt-0 text-xs sm:text-sm border-t mt-1"
                          style={{ borderColor: "var(--border)", color: "var(--muted)" }}
                        >
                          <p className="leading-relaxed whitespace-pre-line pl-8">{faq.answer}</p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </section>
      )}

      {/* SECTION 3: EXAM PYQS */}
      {(!query || filteredPyqFaqs.length > 0) && (
        <section className="space-y-4">
          <SectionHeadingBox
            id="section-pyq"
            title="EXAM PYQ BANK"
            count={filteredPyqFaqs.length}
            isOpen={query ? true : sectionsOpen.pyq}
            onToggle={() => toggleSection("pyq")}
          />

          {(query || sectionsOpen.pyq) && (
            <>
              {/* Overview Banner */}
              <div
                className="p-5 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                style={{
                  background: "var(--panel)",
                  borderColor: "var(--border)",
                }}
              >
                <div>
                  <div
                    className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold border mb-2"
                    style={{
                      background: "var(--surface-subtle)",
                      borderColor: "var(--border)",
                      color: "var(--foreground)",
                    }}
                  >
                    Competitive &amp; Certification Papers
                  </div>
                  <h3 className="text-base sm:text-lg font-bold" style={{ color: "var(--foreground)" }}>
                    Authentic Exam Questions Bank (GATE, ISRO, UGC-NET &amp; Oracle)
                  </h3>
                  <p className="text-xs sm:text-sm opacity-85 mt-1" style={{ color: "var(--muted)" }}>
                    Practice real previous year questions with interactive live code sandboxes, difficulty filters, and step-by-step proofs.
                  </p>
                </div>

                {onNavigateSection && (
                  <button
                    type="button"
                    onClick={() => onNavigateSection("exam")}
                    className="px-4 py-2 rounded-xl text-xs sm:text-sm font-bold border transition-all cursor-pointer shadow-xs shrink-0 hover:opacity-90"
                    style={{
                      background: "var(--surface-subtle)",
                      borderColor: "var(--border)",
                      color: "var(--foreground)",
                    }}
                  >
                    Launch Exam PYQs Now →
                  </button>
                )}
              </div>

              {/* How to Navigate Steps */}
              <div
                className="p-5 rounded-xl border space-y-3"
                style={{
                  background: "var(--panel)",
                  borderColor: "var(--border)",
                }}
              >
                <h4
                  className="text-xs md:text-sm font-bold uppercase tracking-wider"
                  style={{ color: "var(--foreground)" }}
                >
                  How to Navigate to Exam PYQs
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                  <div
                    className="p-3.5 rounded-lg border"
                    style={{ background: "var(--surface-subtle)", borderColor: "var(--border)" }}
                  >
                    <div
                      className="text-xs font-mono font-bold px-2 py-0.5 rounded-md inline-block mb-1.5"
                      style={{ background: "var(--accent, #FF6A3D)", color: "#ffffff" }}
                    >
                      Step 1: Top Navigation
                    </div>
                    <p className="text-xs" style={{ color: "var(--muted)" }}>
                      Click the <strong>Exam PYQs</strong> button in the top navigation bar or navigate to <code>/plsql/exam</code>.
                    </p>
                  </div>
                  <div
                    className="p-3.5 rounded-lg border"
                    style={{ background: "var(--surface-subtle)", borderColor: "var(--border)" }}
                  >
                    <div
                      className="text-xs font-mono font-bold px-2 py-0.5 rounded-md inline-block mb-1.5"
                      style={{ background: "var(--accent, #FF6A3D)", color: "#ffffff" }}
                    >
                      Step 2: Filter by Exam &amp; Topic
                    </div>
                    <p className="text-xs" style={{ color: "var(--muted)" }}>
                      Filter by Exam Body (GATE CS, ISRO, Oracle, UGC-NET), Year, Topic, and Difficulty level.
                    </p>
                  </div>
                  <div
                    className="p-3.5 rounded-lg border"
                    style={{ background: "var(--surface-subtle)", borderColor: "var(--border)" }}
                  >
                    <div
                      className="text-xs font-mono font-bold px-2 py-0.5 rounded-md inline-block mb-1.5"
                      style={{ background: "var(--accent, #FF6A3D)", color: "#ffffff" }}
                    >
                      Step 3: Test &amp; Verify Live
                    </div>
                    <p className="text-xs" style={{ color: "var(--muted)" }}>
                      Run queries in the live code sandbox against sample schema tables and bookmark tricky questions.
                    </p>
                  </div>
                </div>
              </div>

              {/* Exam Coverage Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                <div
                  className="p-4 rounded-xl border space-y-1"
                  style={{ background: "var(--panel)", borderColor: "var(--border)" }}
                >
                  <div className="text-xs font-bold" style={{ color: "var(--foreground)" }}>
                    GATE CS &amp; ISRO Scientist
                  </div>
                  <p className="text-xs" style={{ color: "var(--muted)" }}>
                    Relational Algebra equivalences, Tuple Relational Calculus, B+ Tree indexing, Serializability, and Normal Forms (2NF, 3NF, BCNF).
                  </p>
                </div>
                <div
                  className="p-4 rounded-xl border space-y-1"
                  style={{ background: "var(--panel)", borderColor: "var(--border)" }}
                >
                  <div className="text-xs font-bold" style={{ color: "var(--foreground)" }}>
                    Oracle 1Z0-071 &amp; Enterprise Certifications
                  </div>
                  <p className="text-xs" style={{ color: "var(--muted)" }}>
                    Standard enterprise SQL syntax, multi-table joins, analytic functions, views, sequence manipulation, constraints, and PL/SQL blocks.
                  </p>
                </div>
                <div
                  className="p-4 rounded-xl border space-y-1"
                  style={{ background: "var(--panel)", borderColor: "var(--border)" }}
                >
                  <div className="text-xs font-bold" style={{ color: "var(--foreground)" }}>
                    UGC-NET Computer Science
                  </div>
                  <p className="text-xs" style={{ color: "var(--muted)" }}>
                    Lossless-join decomposition, Dependency preservation, Functional dependency closures, Candidate key derivation, and ACID recovery.
                  </p>
                </div>
                <div
                  className="p-4 rounded-xl border space-y-1"
                  style={{ background: "var(--panel)", borderColor: "var(--border)" }}
                >
                  <div className="text-xs font-bold" style={{ color: "var(--foreground)" }}>
                    Technical Campus Interviews
                  </div>
                  <p className="text-xs" style={{ color: "var(--muted)" }}>
                    Real placement questions from TCS NQT, Infosys Specialist Programmer, and Cognizant on subqueries and procedural logic.
                  </p>
                </div>
              </div>

              {/* PYQ FAQ Accordion */}
              <div className="space-y-2 pt-2">
                <h4
                  className="text-xs md:text-sm font-bold uppercase tracking-wider"
                  style={{ color: "var(--foreground)" }}
                >
                  Exam PYQ Bank Questions (FAQ)
                </h4>
                {filteredPyqFaqs.map((faq, idx) => {
                  const key = `pyq-${faq.id}`;
                  const isOpen = query ? true : !!openFaqs[key];
                  return (
                    <div
                      key={faq.id}
                      className="rounded-xl border overflow-hidden"
                      style={{ background: "var(--surface-subtle)", borderColor: "var(--border)" }}
                    >
                      <button
                        type="button"
                        onClick={() => toggleFaq(key)}
                        className="w-full p-3.5 flex items-center justify-between text-left text-xs sm:text-sm font-semibold cursor-pointer hover:opacity-90"
                        style={{ color: "var(--foreground)" }}
                      >
                        <span className="flex items-center gap-2.5">
                          <span
                            className="text-[11px] font-mono font-bold px-1.5 py-0.5 rounded shrink-0"
                            style={{ background: "var(--accent, #FF6A3D)", color: "#ffffff" }}
                          >
                            Q{idx + 1}
                          </span>
                          <span>{faq.question}</span>
                        </span>
                        <span className="text-xs ml-2 opacity-70">{isOpen ? "▲" : "▼"}</span>
                      </button>
                      {isOpen && (
                        <div
                          className="p-3.5 pt-0 text-xs sm:text-sm border-t mt-1"
                          style={{ borderColor: "var(--border)", color: "var(--muted)" }}
                        >
                          <p className="leading-relaxed whitespace-pre-line pl-8">{faq.answer}</p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </section>
      )}

      {/* SECTION 4: TERMINAL CLI */}
      {(!query || filteredTerminalFaqs.length > 0) && (
        <section className="space-y-4">
          <SectionHeadingBox
            id="section-terminal"
            title="TERMINAL CLI"
            count={filteredTerminalFaqs.length}
            isOpen={query ? true : sectionsOpen.terminal}
            onToggle={() => toggleSection("terminal")}
          />

          {(query || sectionsOpen.terminal) && (
            <>
              {/* Overview Banner */}
              <div
                className="p-5 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                style={{
                  background: "var(--panel)",
                  borderColor: "var(--border)",
                }}
              >
                <div>
                  <div
                    className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold border mb-2"
                    style={{
                      background: "var(--surface-subtle)",
                      borderColor: "var(--border)",
                      color: "var(--foreground)",
                    }}
                  >
                    Command-Line Shell
                  </div>
                  <h3 className="text-base sm:text-lg font-bold" style={{ color: "var(--foreground)" }}>
                    Interactive SQL &amp; PL/SQL Terminal CLI
                  </h3>
                  <p className="text-xs sm:text-sm opacity-85 mt-1" style={{ color: "var(--muted)" }}>
                    Execute raw SQL statements, inspect schemas with system commands, and test queries with real command history.
                  </p>
                </div>

                {onOpenTerminal && (
                  <button
                    type="button"
                    onClick={onOpenTerminal}
                    className="px-4 py-2 rounded-xl text-xs sm:text-sm font-bold border transition-all cursor-pointer shadow-xs shrink-0 hover:opacity-90"
                    style={{
                      background: "var(--surface-subtle)",
                      borderColor: "var(--border)",
                      color: "var(--foreground)",
                    }}
                  >
                    Open Terminal Now →
                  </button>
                )}
              </div>

              {/* How to Navigate Steps */}
              <div
                className="p-5 rounded-xl border space-y-3"
                style={{
                  background: "var(--panel)",
                  borderColor: "var(--border)",
                }}
              >
                <h4
                  className="text-xs md:text-sm font-bold uppercase tracking-wider"
                  style={{ color: "var(--foreground)" }}
                >
                  How to Navigate to Terminal
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                  <div
                    className="p-3.5 rounded-lg border"
                    style={{ background: "var(--surface-subtle)", borderColor: "var(--border)" }}
                  >
                    <div
                      className="text-xs font-mono font-bold px-2 py-0.5 rounded-md inline-block mb-1.5"
                      style={{ background: "var(--accent, #FF6A3D)", color: "#ffffff" }}
                    >
                      Step 1: Open Terminal
                    </div>
                    <p className="text-xs" style={{ color: "var(--muted)" }}>
                      Click the <strong>&gt;_ Terminal</strong> icon button in the top navigation bar.
                    </p>
                  </div>
                  <div
                    className="p-3.5 rounded-lg border"
                    style={{ background: "var(--surface-subtle)", borderColor: "var(--border)" }}
                  >
                    <div
                      className="text-xs font-mono font-bold px-2 py-0.5 rounded-md inline-block mb-1.5"
                      style={{ background: "var(--accent, #FF6A3D)", color: "#ffffff" }}
                    >
                      Step 2: Type or Run Commands
                    </div>
                    <p className="text-xs" style={{ color: "var(--muted)" }}>
                      Type standard SQL or system commands like <code>HELP</code> and <code>SHOW TABLES</code>.
                    </p>
                  </div>
                  <div
                    className="p-3.5 rounded-lg border"
                    style={{ background: "var(--surface-subtle)", borderColor: "var(--border)" }}
                  >
                    <div
                      className="text-xs font-mono font-bold px-2 py-0.5 rounded-md inline-block mb-1.5"
                      style={{ background: "var(--accent, #FF6A3D)", color: "#ffffff" }}
                    >
                      Step 3: Exit Back to Workspace
                    </div>
                    <p className="text-xs" style={{ color: "var(--muted)" }}>
                      Type <strong>EXIT</strong> or <strong>QUIT</strong> and press Enter, or click ✕ in the top-right corner.
                    </p>
                  </div>
                </div>
              </div>

              {/* Built-in System Commands Reference Table */}
              <div className="space-y-2">
                <h4
                  className="text-xs md:text-sm font-bold uppercase tracking-wider"
                  style={{ color: "var(--foreground)" }}
                >
                  System Commands Reference
                </h4>
                <div
                  className="overflow-x-auto rounded-xl border"
                  style={{ borderColor: "var(--border)" }}
                >
                  <table className="w-full text-left text-xs font-mono">
                    <thead
                      className="font-sans border-b"
                      style={{
                        background: "var(--surface-subtle)",
                        borderColor: "var(--border)",
                        color: "var(--foreground)",
                      }}
                    >
                      <tr>
                        <th className="p-3 font-bold">Command</th>
                        <th className="p-3 font-bold">Example</th>
                        <th className="p-3 font-bold font-sans">Description</th>
                      </tr>
                    </thead>
                    <tbody
                      className="divide-y"
                      style={{
                        borderColor: "var(--border)",
                        background: "var(--panel)",
                        color: "var(--foreground)",
                      }}
                    >
                      <tr>
                        <td className="p-3 font-bold">HELP / ?</td>
                        <td className="p-3 opacity-80">HELP</td>
                        <td className="p-3 font-sans opacity-90">Prints the full system command reference and cheat sheet</td>
                      </tr>
                      <tr>
                        <td className="p-3 font-bold">SHOW DATABASES</td>
                        <td className="p-3 opacity-80">SHOW DATABASES</td>
                        <td className="p-3 font-sans opacity-90">Lists all available database schemas and active datasets</td>
                      </tr>
                      <tr>
                        <td className="p-3 font-bold">USE &lt;db&gt;</td>
                        <td className="p-3 opacity-80">USE university</td>
                        <td className="p-3 font-sans opacity-90">Switches the active catalog to the specified database</td>
                      </tr>
                      <tr>
                        <td className="p-3 font-bold">SHOW TABLES</td>
                        <td className="p-3 opacity-80">SHOW TABLES</td>
                        <td className="p-3 font-sans opacity-90">Displays all tables defined in the active database schema</td>
                      </tr>
                      <tr>
                        <td className="p-3 font-bold">DESC &lt;table&gt;</td>
                        <td className="p-3 opacity-80">DESC customers</td>
                        <td className="p-3 font-sans opacity-90">Describes column names, data types, nullability, and primary keys</td>
                      </tr>
                      <tr>
                        <td className="p-3 font-bold">CLEAR / CLS</td>
                        <td className="p-3 opacity-80">CLEAR</td>
                        <td className="p-3 font-sans opacity-90">Clears previous output lines and resets the terminal screen</td>
                      </tr>
                      <tr>
                        <td className="p-3 font-bold">EXIT / QUIT</td>
                        <td className="p-3 opacity-80">EXIT</td>
                        <td className="p-3 font-sans opacity-90">Leaves terminal mode and returns to standard visual workspace</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Terminal FAQ Accordion */}
              <div className="space-y-2 pt-2">
                <h4
                  className="text-xs md:text-sm font-bold uppercase tracking-wider"
                  style={{ color: "var(--foreground)" }}
                >
                  Terminal CLI Questions (FAQ)
                </h4>
                {filteredTerminalFaqs.map((faq, idx) => {
                  const key = `term-${faq.id}`;
                  const isOpen = query ? true : !!openFaqs[key];
                  return (
                    <div
                      key={faq.id}
                      className="rounded-xl border overflow-hidden"
                      style={{ background: "var(--surface-subtle)", borderColor: "var(--border)" }}
                    >
                      <button
                        type="button"
                        onClick={() => toggleFaq(key)}
                        className="w-full p-3.5 flex items-center justify-between text-left text-xs sm:text-sm font-semibold cursor-pointer hover:opacity-90"
                        style={{ color: "var(--foreground)" }}
                      >
                        <span className="flex items-center gap-2.5">
                          <span
                            className="text-[11px] font-mono font-bold px-1.5 py-0.5 rounded shrink-0"
                            style={{ background: "var(--accent, #FF6A3D)", color: "#ffffff" }}
                          >
                            Q{idx + 1}
                          </span>
                          <span>{faq.question}</span>
                        </span>
                        <span className="text-xs ml-2 opacity-70">{isOpen ? "▲" : "▼"}</span>
                      </button>
                      {isOpen && (
                        <div
                          className="p-3.5 pt-0 text-xs sm:text-sm border-t mt-1"
                          style={{ borderColor: "var(--border)", color: "var(--muted)" }}
                        >
                          <p className="leading-relaxed whitespace-pre-line pl-8">{faq.answer}</p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </section>
      )}
    </main>
  );
}
