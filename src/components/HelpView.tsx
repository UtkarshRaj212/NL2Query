"use client";

import React, { useState, useMemo } from "react";

interface HelpViewProps {
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

// Clickable section heading box without '---' that toggles expand/collapse for that specific section
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

export function HelpView({
  onBackToWorkspace,
  onNavigateSection,
  onOpenTerminal,
}: HelpViewProps) {
  const [sectionsOpen, setSectionsOpen] = useState({
    manual: true,
    quiz: true,
    pyq: true,
    terminal: true,
  });
  const [openCards, setOpenCards] = useState<Record<number, boolean>>({
    1: true,
    2: true,
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
    for (let i = 1; i <= 19; i++) {
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
      title: "Getting Started",
      whatItDoes: "Provides an interactive responsive workspace for learning and visualizing relational database execution and natural language to SQL translation.",
      whatToDo: "Upon opening the application, the default landing view is the Workspace. You can resize the left panel by dragging the vertical resizer divider bar or clicking its arrow to collapse or expand it.",
      controls: "Main navigation bar at the top ([Workspace], [Download], [Quiz], [Exam PYQs], [Learn], [Help]), Theme dropdown on the far right, and panel resize slider.",
      processing: "The app initializes an in-memory relational database schema buffer populated with initial sample tables and records.",
      expectedOutput: "A responsive workspace ready to accept natural language prompts or direct SQL code, with the central canvas spanning full width.",
    },
    {
      id: 2,
      title: "Choosing a Dataset",
      whatItDoes: "Switches the active database catalog between different domains (E-Commerce, University, Hospital, Library) or custom user-created datasets.",
      whatToDo: "Click the dataset selector in the left panel to choose any domain, create a new custom dataset, or import datasets from your computer (.csv, .json, .tsv, .sql, .db).",
      controls: "The 'Choose a dataset' dropdown box located at the top-left of the Input Panel, including '+ Create New Dataset...' and 'Import Dataset...'.",
      processing: "The relational database engine clears the current buffer, loads the chosen schema relations, indexes, and initial records, and updates the ER diagram and sample queries.",
      expectedOutput: "The input sample queries and center Schema/ER diagram immediately update to reflect the newly selected dataset domain.",
    },
    {
      id: 3,
      title: "Asking a Question Using Natural Language",
      whatItDoes: "Enables users to query relational data in conversational plain English without writing database code.",
      whatToDo: "Click into the textarea under '1. Ask by Voice or Natural Language' and type any query (e.g. 'Show the names and cities of customers from Mumbai'). Alternatively, click any item under 'Sample Inputs'.",
      controls: "The Natural Language textarea labeled 'Speak via mic above or type (e.g. \"How many customers are there?\")'.",
      processing: "The input string is staged in component state ready to be dispatched to the Gemini translation engine.",
      expectedOutput: "The text appears in the input field, and the 'Translate & Run' button becomes active and clickable.",
    },
    {
      id: 4,
      title: "Using Voice Input",
      whatItDoes: "Captures spoken voice queries using the browser's Web Speech API and converts audio into text in real time.",
      whatToDo: "Click the 'Start Voice Input' button (microphone icon). Grant microphone permission in your browser if prompted, then speak your question clearly into your mic.",
      controls: "The large 'Start Voice Input' microphone button, the 'Auto-Translate on stop' checkbox, and the 'Read SQL summary' checkbox in the Voice Controls bar.",
      processing: "Speech recognition converts audio waveforms into text tokens. A pulsating red 'Recording Audio' badge displays live interim transcripts. If 'Auto-Translate on stop' is checked, translation triggers automatically after speech stops.",
      expectedOutput: "Your spoken question is automatically transcribed into the natural language textarea and executed.",
    },
    {
      id: 5,
      title: "Translating Natural Language to SQL",
      whatItDoes: "Sends your conversational query alongside the active database schema catalog to the LLM (Gemini) to generate standard SQL.",
      whatToDo: "Click the purple 'Translate & Run' button below the natural language textarea.",
      controls: "The 'Translate & Run' button with arrow icon.",
      processing: "The system builds a structured prompt containing table columns, types, primary/foreign keys, and sample rows. The model synthesizes the SQL, validates keywords, and returns an explanation and confidence score.",
      expectedOutput: "A spinner displays 'Translating to SQL...'. Upon completion, the synthesized query appears in the SQL editor, a confidence pill displays the rating (e.g., 95%), and the query is executed automatically.",
    },
    {
      id: 6,
      title: "Writing SQL Directly",
      whatItDoes: "Allows students and developers to write or modify SQL statements manually, supporting DQL (SELECT), DML (INSERT/UPDATE/DELETE), and DDL (CREATE/ALTER/DROP).",
      whatToDo: "Scroll to '2. Or write SQL directly' in the left sidebar and type or edit SQL in the monospaced editor box.",
      controls: "The monospace SQL textarea under '2. Or write SQL directly'.",
      processing: "The editor captures raw SQL text and preserves formatting, indentation, and casing.",
      expectedOutput: "Custom SQL syntax ready for one-click compilation and execution against the in-memory database.",
    },
    {
      id: 7,
      title: "Executing SQL",
      whatItDoes: "Parses, validates, compiles, and executes the SQL query currently present in the SQL editor against active relational tables.",
      whatToDo: "Click the 'Execute SQL' button below the SQL textarea.",
      controls: "The 'Execute SQL' button.",
      processing: "The in-memory relational engine runs lexical tokenization, catalog verification, predicate filtering, joins, aggregates, and projections.",
      expectedOutput: "Execution steps populate the Center Canvas pipeline, and the 'Final Result' table renders output records.",
    },
    {
      id: 8,
      title: "Understanding the Generated SQL",
      whatItDoes: "Displays the translated SQL code generated by the AI model so you can inspect, learn, and verify its correctness.",
      whatToDo: "Review the query displayed in the SQL editor under section 2. You can freely edit keywords, add WHERE conditions, or change column selections.",
      controls: "The SQL textarea and the 'Confidence' box with the natural language interpretation.",
      processing: "The interpretation box breaks down what the AI understood your request to mean. Clicking 'Read aloud' will narrate this explanation using speech synthesis.",
      expectedOutput: "Full visibility into the exact SQL code that will execute on the database.",
    },
    {
      id: 9,
      title: "Understanding the Final Result",
      whatItDoes: "Displays the tabular output dataset produced by the executed query.",
      whatToDo: "Scroll down in the center 'Pipeline & Result' tab to the 'Final Result' card.",
      controls: "The 'Final Result' table, showing total row counts, column names, and scrollable data cells.",
      processing: "The engine projects the designated output attributes for each surviving tuple and maps them into an accessible HTML data grid.",
      expectedOutput: "A high-contrast grid displaying result columns and rows. For mutations (INSERT/UPDATE/DELETE), a notification confirms the number of affected rows.",
    },
    {
      id: 10,
      title: "Understanding the Execution Pipeline",
      whatItDoes: "Breaks down physical query execution into discrete observable stages (PARSER, CATALOG, CONSTRAINT, FROM, JOIN, WHERE, GROUP BY, AGGREGATE, SELECT, ORDER BY, LIMIT).",
      whatToDo: "Click on any stage pill in the 'Execution Pipeline' box (e.g. click 'WHERE' or 'SELECT'), or click the 'Animate' button.",
      controls: "The stage badges (e.g. `FROM (10)`, `WHERE (4)`, `SELECT (4)`) and the 'Animate' / 'Pause' button.",
      processing: "Selecting a step updates the 'Step X/Y' card below, displaying the operational detail and intermediate working table at that exact stage.",
      expectedOutput: "Visual verification of how rows are filtered, joined, aggregated, or projected at each step of query execution.",
    },
    {
      id: 11,
      title: "Understanding Schema / ER",
      whatItDoes: "Renders the relational schema tables, column data types, key constraints, and a complete Chen Entity-Relationship (ER) diagram.",
      whatToDo: "Click the 'Schema / ER' tab at the top of the center canvas.",
      controls: "The 'Schema / ER' tab button above the center panel, zoom/reset controls, and table cards.",
      processing: "Extracts table definitions, attribute types, PK flags, and foreign key relations from the catalog and draws an interactive SVG Chen ER diagram with entities, attributes, and relationship diamonds.",
      expectedOutput: "A visual representation of table structures, primary keys (PK), foreign keys (FK), and relationship connectors.",
    },
    {
      id: 12,
      title: "Understanding Theory / Relational Foundations",
      whatItDoes: "Provides query-specific execution theory, big-O complexity upper bounds, relational algebra equivalences, and buffer page models.",
      whatToDo: "Click the 'Theory' tab at the top of the center canvas.",
      controls: "The 'Theory' tab button in the center panel.",
      processing: "Calculates stage-specific algorithmic complexities, relational algebra operators, and disk I/O slotted block access models for the active executed statement.",
      expectedOutput: "Execution Theory & Insights cards tailored dynamically to the executed query and active operator stage.",
    },
    {
      id: 13,
      title: "Understanding Complexity Information",
      whatItDoes: "Displays algorithmic time complexity metrics for database operations (e.g. O(N) scans, O(N × M) nested joins, O(N log N) external sorts).",
      whatToDo: "Click the 'Theory' tab in the central canvas while inspecting any pipeline step.",
      controls: "The 'Theory' tab and stage selection pills.",
      processing: "Maps the active operator to its operational notes and big-O computational upper bounds for Best, Average, and Worst cases.",
      expectedOutput: "Algorithmic expressions and operational complexity notes explaining why specific database operators perform with certain efficiencies.",
    },
    {
      id: 14,
      title: "Using Query History",
      whatItDoes: "Maintains a persistent chronological log of queries executed during your session.",
      whatToDo: "Scroll down to 'History' in the left sidebar and click on any previous query card to reload it.",
      controls: "The history items listed under the 'History' section in the left panel.",
      processing: "Loads the saved SQL query and question back into the editor and re-executes it automatically.",
      expectedOutput: "Instant restoration of prior queries with their timestamp, statement type badge, and row counts.",
    },
    {
      id: 15,
      title: "Editing the Dataset",
      whatItDoes: "Enables adding custom tables, modifying schema definitions, adding columns, setting Primary/Foreign keys, and populating custom records.",
      whatToDo: "Click the 3-dots menu or 'Edit Dataset' button next to the dataset dropdown.",
      controls: "'Edit Dataset' button, 'New Dataset' button, or 'Reset Database' button.",
      processing: "Opens the Dataset Modal dialog where tables, column types (INTEGER, TEXT, REAL), and sample records can be defined and saved to localStorage.",
      expectedOutput: "A customized database schema that immediately becomes the active target for voice and natural language queries.",
    },
    {
      id: 16,
      title: "Importing Datasets (.csv, .json, .sql, .db)",
      whatItDoes: "Imports local database files or tabular data (.csv, .tsv, .json, .sql, and SQLite .db binaries) into the active workspace.",
      whatToDo: "Click 'Import Dataset...' from the dataset dropdown or '+ Import' in the left panel.",
      controls: "The Import Dataset Modal with drag-and-drop file upload zone.",
      processing: "Parses CSV headers, JSON records, SQL dumps, or binary SQLite .db tables using sql.js in the browser.",
      expectedOutput: "The uploaded tables, records, and schema catalog are immediately registered and active in the database.",
    },
    {
      id: 17,
      title: "Exporting Reports & Datasets (Download View)",
      whatItDoes: "Provides comprehensive export capabilities for execution reports, result tables, ER diagrams, and complete session history.",
      whatToDo: "Click 'Download' in the top navigation bar to open the dedicated Download Center.",
      controls: "The 'Download' navigation tab and format buttons (PDF, DOCX, CSV, Excel, MD, JSON, TSV, SQL, SQLite .db, SVG, PNG).",
      processing: "Generates formatted PDF/Word reports with embedded ER diagrams, converts tables to spreadsheets or CSV, and packages query logs.",
      expectedOutput: "Instant file download in your selected format with complete execution metadata.",
    },
    {
      id: 18,
      title: "Switching Day/Night & Themes",
      whatItDoes: "Changes the color palette and dark/light mode of the application.",
      whatToDo: "Click the 'Theme' button in the top-right corner of the top navigation bar and select a theme.",
      controls: "The 'Theme' dropdown menu in the header (Slate, Pearl, etc.).",
      processing: "Updates CSS custom variables (`data-theme` attribute on the root element) and persists your preference in `localStorage`.",
      expectedOutput: "The interface updates its appearance immediately, with 'Pearl' providing light mode and 'Slate' providing the dark theme.",
    },
    {
      id: 19,
      title: "Handling Errors & Constraint Violations",
      whatItDoes: "Identifies and highlights syntax mistakes, non-existent table/column names, or constraint violations.",
      whatToDo: "If a query fails, read the red error alert box displayed under the SQL editor and in the canvas Theory tab.",
      controls: "Red error banners in the Input Panel and Theory tab.",
      processing: "The engine catches the exception, halts execution safely, leaves database buffers untainted, and explains which identifier was invalid.",
      expectedOutput: "Clear actionable guidance telling you whether a column was not found, a table name was misspelled, or SQL grammar was malformed.",
    },
  ];

  const quizFaqs = [
    {
      id: "q1",
      question: "How do I start a daily quiz and earn streak points?",
      answer: "Click the 'Quiz' button in the top navigation bar. Select a difficulty tier or daily challenge, inspect the database schema, write or select your answer, and click 'Submit Answer'. A correct answer increments your daily streak count and updates your placement on the global leaderboard.",
    },
    {
      id: "q2",
      question: "How does the Daily Streak calculation work?",
      answer: "Streaks measure consecutive calendar days where you complete at least one verified quiz challenge. Each day you solve a challenge, your streak count increments by 1. The flame icon (🔥) on your profile avatar shows your active streak count. If you miss a calendar day, your streak will reset to 1 upon your next solve.",
    },
    {
      id: "q3",
      question: "Do I need an account to save my quiz score and streak?",
      answer: "Yes. Click the user profile button in the top-right header to sign in with Google. While guest users can practice challenges locally, an authenticated account is required to preserve your streak across devices and appear on the Global Leaderboard.",
    },
    {
      id: "q4",
      question: "Can I get hints if I get stuck on a query problem?",
      answer: "Yes. Each quiz problem features progressive hints. Clicking 'Show Hint' provides directional guidance and relational clues without spoiling the exact solution query, helping you deduce the answer independently.",
    },
    {
      id: "q5",
      question: "How is my Global Leaderboard Rank calculated?",
      answer: "Rankings are calculated primarily by your current active consecutive daily streak, followed by verified points earned and query precision percentage. Maintaining consistent daily streaks is the fastest path to the top 10.",
    },
    {
      id: "q6",
      question: "How do I return to the database workspace from Quiz view?",
      answer: "Click the 'Workspace' button in the top navigation bar or the back navigation link in the quiz header to return to your SQL or PL/SQL workspace immediately.",
    },
  ];

  const pyqFaqs = [
    {
      id: "p1",
      question: "What is the Exam PYQ section and where are questions sourced from?",
      answer: "The Exam PYQ (Previous Year Questions) bank contains authentic questions from major competitive exams and certifications: GATE CS, ISRO Scientist, UGC-NET Computer Science, Oracle Database SQL (1Z0-071), and tech campus recruitment rounds (TCS Digital, Infosys SP, Cognizant, Wipro).",
    },
    {
      id: "p2",
      question: "How do I navigate to and filter Exam PYQs?",
      answer: "Click 'Exam PYQs' in the top navigation bar. Use the filter controls at the top of the page to filter by Exam Body (GATE, ISRO, UGC-NET, Oracle), Year (2005 - 2024+), Topic (Joins, Subqueries, Normalization, Relational Algebra, Indexes), and Difficulty level (Easy, Medium, Hard).",
    },
    {
      id: "p3",
      question: "Can I test and execute queries directly inside the PYQ solver?",
      answer: "Yes. Unlike static PDF past papers, every question features an interactive live SQL/PLSQL code sandbox. You can write your query and click 'Run Query' to execute it against the exact test schema provided in the exam problem.",
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
      aria-label="Help and User Manual"
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
            Help &amp; User Manual
          </h1>
          <p className="text-sm md:text-base opacity-80 mt-1.5" style={{ color: "var(--muted)" }}>
            Complete operating manual for the NL2Query workspace, controls, and features.
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
            placeholder="Search help topics, commands, features, FAQs..."
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
                <h2 className="text-lg md:text-2xl font-bold tracking-tight" style={{ color: "var(--foreground)" }}>
                  Detailed Feature Manual (Sections 1 — 19)
                </h2>
                <p className="text-sm md:text-base opacity-80 mt-1" style={{ color: "var(--muted)" }}>
                  Detailed operation rules, input requirements, button names, processing lifecycles, and expected outputs. Click any card to expand or collapse.
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
                        {/* Numbering box: Site theme color (Blue) with white text */}
                        <span
                          className="text-xs md:text-sm font-mono font-bold px-2.5 py-1 rounded-lg shrink-0 shadow-xs border border-transparent"
                          style={{
                            background: "var(--accent, #2563eb)",
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
                          className={`w-4 h-4 transition-transform duration-200 ${
                            isOpen ? "rotate-180" : ""
                          }`}
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
                    Daily Quiz Challenges &amp; Global Leaderboard
                  </h3>
                  <p className="text-xs sm:text-sm opacity-85 mt-1" style={{ color: "var(--muted)" }}>
                    Solve verified SQL problems, build consecutive daily streaks, and compete on the global leaderboard.
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
                      style={{ background: "var(--accent, #2563eb)", color: "#ffffff" }}
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
                      style={{ background: "var(--accent, #2563eb)", color: "#ffffff" }}
                    >
                      Step 2: Solve &amp; Submit
                    </div>
                    <p className="text-xs" style={{ color: "var(--muted)" }}>
                      Select difficulty tier, read problem instructions, formulate answer, and click <strong>Submit Answer</strong>.
                    </p>
                  </div>
                  <div
                    className="p-3.5 rounded-lg border"
                    style={{ background: "var(--surface-subtle)", borderColor: "var(--border)" }}
                  >
                    <div
                      className="text-xs font-mono font-bold px-2 py-0.5 rounded-md inline-block mb-1.5"
                      style={{ background: "var(--accent, #2563eb)", color: "#ffffff" }}
                    >
                      Step 3: Return to Workspace
                    </div>
                    <p className="text-xs" style={{ color: "var(--muted)" }}>
                      Click <strong>Workspace</strong> in the top header or back arrow to resume your database session.
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
                    Solve at least one challenge every 24 hours. The active flame icon (🔥) on your profile shows your consecutive days streak.
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
                    Click 'Show Hint' when stuck to receive structural and relational clues without exposing the complete solution.
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
                    Inspect the canonical SQL query, execution behavior, and clear explanations for why alternative choices fail.
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
                            style={{ background: "var(--accent, #2563eb)", color: "#ffffff" }}
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
                      style={{ background: "var(--accent, #2563eb)", color: "#ffffff" }}
                    >
                      Step 1: Top Navigation
                    </div>
                    <p className="text-xs" style={{ color: "var(--muted)" }}>
                      Click the <strong>Exam PYQs</strong> button in the top navigation bar or navigate to <code>/sql/exam</code>.
                    </p>
                  </div>
                  <div
                    className="p-3.5 rounded-lg border"
                    style={{ background: "var(--surface-subtle)", borderColor: "var(--border)" }}
                  >
                    <div
                      className="text-xs font-mono font-bold px-2 py-0.5 rounded-md inline-block mb-1.5"
                      style={{ background: "var(--accent, #2563eb)", color: "#ffffff" }}
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
                      style={{ background: "var(--accent, #2563eb)", color: "#ffffff" }}
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
                    Real placement questions from TCS NQT, Infosys Specialist Programmer, and Cognizant on subqueries and GROUP BY HAVING.
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
                            style={{ background: "var(--accent, #2563eb)", color: "#ffffff" }}
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
                      style={{ background: "var(--accent, #2563eb)", color: "#ffffff" }}
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
                      style={{ background: "var(--accent, #2563eb)", color: "#ffffff" }}
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
                      style={{ background: "var(--accent, #2563eb)", color: "#ffffff" }}
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
                            style={{ background: "var(--accent, #2563eb)", color: "#ffffff" }}
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
