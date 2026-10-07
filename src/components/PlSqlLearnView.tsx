"use client";

import React, { useState } from "react";

interface PlSqlLearnViewProps {
  onBackToWorkspace?: () => void;
}

// Collapsible subcard component for structured subsections
interface PlSqlLearnSubcardProps {
  title: string;
  content: string;
  isCode?: boolean;
  highlight?: boolean;
}

function PlSqlLearnSubcard({
  title,
  content,
  isCode = false,
  highlight = false,
}: PlSqlLearnSubcardProps) {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div
      className="rounded-lg border transition-all overflow-hidden"
      style={{
        background: highlight
          ? "rgba(var(--accent-rgb, 255, 106, 61), 0.05)"
          : "var(--surface-subtle)",
        borderColor: highlight ? "var(--accent)" : "var(--border)",
      }}
    >
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full p-3 sm:p-3.5 flex items-center justify-between text-left cursor-pointer transition-colors hover:opacity-90"
        style={{
          background: highlight
            ? "rgba(var(--accent-rgb, 255, 106, 61), 0.1)"
            : "transparent",
        }}
      >
        <span
          className="text-xs sm:text-sm font-bold flex items-center gap-2"
          style={{
            color: highlight ? "var(--accent)" : "var(--foreground)",
          }}
        >
          {title}
        </span>
        <div
          className="flex items-center gap-1.5 text-xs font-medium"
          style={{ color: "var(--muted)" }}
        >
          <span className="hidden sm:inline">
            {isOpen ? "Collapse" : "Expand"}
          </span>
          <svg
            className={`w-3.5 h-3.5 transition-transform duration-200 ${isOpen ? "rotate-180" : ""
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
          className="p-4 border-t text-sm md:text-base leading-relaxed"
          style={{
            borderColor: "var(--border)",
            background: "var(--panel)",
            color: "var(--foreground)",
          }}
        >
          {isCode ? (
            <pre className="font-mono text-xs md:text-sm p-3 rounded-lg overflow-x-auto bg-black/85 border border-[var(--border)] text-orange-400">
              <code>{content}</code>
            </pre>
          ) : (
            <p className="text-xs sm:text-sm leading-relaxed">{content}</p>
          )}
        </div>
      )}
    </div>
  );
}

// Main collapsible card component matching LearnCard
interface PlSqlLearnCardProps {
  id: string;
  num: string;
  category: string;
  title: string;
  preview: string;
  isOpen: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}

function PlSqlLearnCard({
  id,
  num,
  category,
  title,
  preview,
  isOpen,
  onToggle,
  children,
}: PlSqlLearnCardProps) {
  return (
    <section
      id={id}
      className="panel rounded-xl border transition-all duration-200 overflow-hidden shadow-xs"
      style={{
        background: "var(--panel)",
        borderColor: isOpen ? "var(--accent)" : "var(--border)",
      }}
    >
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={isOpen}
        className="w-full p-4 md:p-5 flex items-center justify-between text-left cursor-pointer transition-colors hover:bg-[var(--surface-subtle)] focus:outline-none"
      >
        <div className="flex items-start md:items-center gap-3 md:gap-4 pr-3 min-w-0">
          <span
            className="text-xs md:text-sm font-mono font-bold px-2.5 py-1 rounded shrink-0 border"
            style={{
              background: isOpen ? "var(--accent)" : "var(--surface-subtle)",
              color: isOpen ? "var(--accent-foreground)" : "var(--accent)",
              borderColor: "var(--border)",
            }}
          >
            {num}
          </span>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <span
                className="text-[10px] md:text-[11px] font-bold px-2 py-0.5 rounded border uppercase tracking-wider shrink-0"
                style={{
                  background: "var(--surface-subtle)",
                  color: "var(--accent)",
                  borderColor: "var(--border)",
                }}
              >
                {category}
              </span>
            </div>
            <h2
              className="text-base md:text-lg font-bold tracking-tight truncate"
              style={{ color: "var(--foreground)" }}
            >
              {title}
            </h2>
            {!isOpen && (
              <p
                className="text-xs md:text-sm opacity-70 truncate mt-0.5"
                style={{ color: "var(--muted)" }}
              >
                {preview}
              </p>
            )}
          </div>
        </div>

        <div
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold shrink-0 transition-colors"
          style={{
            background: isOpen ? "var(--accent)" : "var(--surface-subtle)",
            color: isOpen ? "var(--accent-foreground)" : "var(--foreground)",
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
          {children}
        </div>
      )}
    </section>
  );
}

export function PlSqlLearnView({ }: PlSqlLearnViewProps) {
  // Initially expand first 2 cards
  const [openCards, setOpenCards] = useState<Record<string, boolean>>({
    "sec-01": true,
    "sec-02": true,
  });
  const [selectedModule, setSelectedModule] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");

  const toggleCard = (id: string) => {
    setOpenCards((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const expandAll = () => {
    const all: Record<string, boolean> = {};
    for (let i = 1; i <= 25; i++) {
      const id = `sec-${String(i).padStart(2, "0")}`;
      all[id] = true;
    }
    setOpenCards(all);
  };

  const collapseAll = () => {
    setOpenCards({});
  };

  const matchesSearch = (textList: string[]) => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    return textList.some((t) => t.toLowerCase().includes(query));
  };

  return (
    <main
      className="flex-1 min-h-0 flex flex-col p-4 sm:p-6 md:p-8 lg:p-10 xl:p-12 overflow-y-auto overflow-x-hidden w-full max-w-none leading-relaxed"
      style={{ color: "var(--foreground)" }}
      aria-label="Learn section: Complete PL/SQL Procedural Database Curriculum"
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
            PL/SQL Commands &amp; Procedural Engine Curriculum
          </h1>
          <p
            className="text-sm md:text-base opacity-80 mt-1.5"
            style={{ color: "var(--muted)" }}
          >
            Comprehensive reference manual covering all PL/SQL constructs (Block architecture, Data types, Cursors, Control flow, Subprograms, Packages, Triggers, Exceptions, Collections, Bulk processing, Dynamic SQL), operational syntax, execution behaviors, and procedural theory. Click any card to expand or collapse.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={expandAll}
            className="px-3 py-2 rounded-lg text-xs md:text-sm font-semibold border transition-all cursor-pointer hover:opacity-90"
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
            className="px-3 py-2 rounded-lg text-xs md:text-sm font-semibold border transition-all cursor-pointer hover:opacity-90"
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

      {/* Module Filter & Search Toolbar */}
      <div
        className="p-3.5 rounded-xl border mb-6 flex flex-wrap items-center justify-between gap-3 shadow-2xs"
        style={{
          background: "var(--panel)",
          borderColor: "var(--border)",
        }}
      >
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            type="button"
            onClick={() => setSelectedModule("all")}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer"
            style={{
              background: selectedModule === "all" ? "var(--accent)" : "var(--surface-subtle)",
              color: selectedModule === "all" ? "var(--accent-foreground)" : "var(--foreground)",
              borderColor: "var(--border)",
            }}
          >
            All Topics (25)
          </button>
          <button
            type="button"
            onClick={() => setSelectedModule("basics")}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer"
            style={{
              background: selectedModule === "basics" ? "var(--accent)" : "var(--surface-subtle)",
              color: selectedModule === "basics" ? "var(--accent-foreground)" : "var(--foreground)",
              borderColor: "var(--border)",
            }}
          >
            Basics &amp; Block (3)
          </button>
          <button
            type="button"
            onClick={() => setSelectedModule("control")}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer"
            style={{
              background: selectedModule === "control" ? "var(--accent)" : "var(--surface-subtle)",
              color: selectedModule === "control" ? "var(--accent-foreground)" : "var(--foreground)",
              borderColor: "var(--border)",
            }}
          >
            Control Flow (2)
          </button>
          <button
            type="button"
            onClick={() => setSelectedModule("cursors")}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer"
            style={{
              background: selectedModule === "cursors" ? "var(--accent)" : "var(--surface-subtle)",
              color: selectedModule === "cursors" ? "var(--accent-foreground)" : "var(--foreground)",
              borderColor: "var(--border)",
            }}
          >
            DML &amp; Cursors (5)
          </button>
          <button
            type="button"
            onClick={() => setSelectedModule("subprograms")}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer"
            style={{
              background: selectedModule === "subprograms" ? "var(--accent)" : "var(--surface-subtle)",
              color: selectedModule === "subprograms" ? "var(--accent-foreground)" : "var(--foreground)",
              borderColor: "var(--border)",
            }}
          >
            Subprograms &amp; Packages (4)
          </button>
          <button
            type="button"
            onClick={() => setSelectedModule("exceptions")}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer"
            style={{
              background: selectedModule === "exceptions" ? "var(--accent)" : "var(--surface-subtle)",
              color: selectedModule === "exceptions" ? "var(--accent-foreground)" : "var(--foreground)",
              borderColor: "var(--border)",
            }}
          >
            Exceptions (3)
          </button>
          <button
            type="button"
            onClick={() => setSelectedModule("triggers")}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer"
            style={{
              background: selectedModule === "triggers" ? "var(--accent)" : "var(--surface-subtle)",
              color: selectedModule === "triggers" ? "var(--accent-foreground)" : "var(--foreground)",
              borderColor: "var(--border)",
            }}
          >
            Triggers (2)
          </button>
          <button
            type="button"
            onClick={() => setSelectedModule("collections")}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer"
            style={{
              background: selectedModule === "collections" ? "var(--accent)" : "var(--surface-subtle)",
              color: selectedModule === "collections" ? "var(--accent-foreground)" : "var(--foreground)",
              borderColor: "var(--border)",
            }}
          >
            Collections &amp; Bulk (2)
          </button>
          <button
            type="button"
            onClick={() => setSelectedModule("advanced")}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer"
            style={{
              background: selectedModule === "advanced" ? "var(--accent)" : "var(--surface-subtle)",
              color: selectedModule === "advanced" ? "var(--accent-foreground)" : "var(--foreground)",
              borderColor: "var(--border)",
            }}
          >
            Dynamic &amp; Security (3)
          </button>
          <button
            type="button"
            onClick={() => setSelectedModule("references")}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer"
            style={{
              background: selectedModule === "references" ? "var(--accent)" : "var(--surface-subtle)",
              color: selectedModule === "references" ? "var(--accent-foreground)" : "var(--foreground)",
              borderColor: "var(--border)",
            }}
          >
            Media &amp; References (1)
          </button>
        </div>

        {/* Search input */}
        <div className="relative flex-1 sm:max-w-xs min-w-[200px]">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search PL/SQL (e.g. CURSOR, TRIGGER, FORALL)..."
            className="w-full pl-8 pr-3 py-1.5 rounded-lg text-xs border bg-[var(--surface-subtle)] focus:outline-none focus:border-[var(--accent)]"
            style={{
              borderColor: "var(--border)",
              color: "var(--foreground)",
            }}
          />
          <svg
            className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 opacity-60"
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
      </div>

      {/* Cards List */}
      <div className="flex flex-col gap-4">
        {/* Card 01: PL/SQL Architecture & Anonymous Block */}
        {(selectedModule === "all" || selectedModule === "basics") &&
          matchesSearch(["PL/SQL Architecture", "Anonymous Block", "DECLARE", "BEGIN", "EXCEPTION", "END", "architecture"]) && (
            <PlSqlLearnCard
              id="sec-01"
              num="01"
              category="Architecture"
              title="PL/SQL Architecture &amp; The Anonymous Block"
              preview="The fundamental execution unit in PL/SQL: DECLARE, BEGIN, EXCEPTION, and END."
              isOpen={!!openCards["sec-01"]}
              onToggle={() => toggleCard("sec-01")}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <PlSqlLearnSubcard
                  title="What it does &amp; Functionality:"
                  content={"PL/SQL (Procedural Language/Structured Query Language) is Oracle's procedural extension to SQL. It combines relational SQL data manipulation with procedural constructs like variables, conditions, loops, and exception handling. An anonymous block is an unnamed, dynamically compiled program unit passed to the engine at runtime that executes in memory without being stored in the data dictionary catalog."}
                />
                <PlSqlLearnSubcard
                  title="Code Example &amp; Practical Implementation:"
                  content={"SET SERVEROUTPUT ON;\n\nDECLARE\n  -- Declaration Section (Optional): local variables, constants, cursors\n  v_app_name CONSTANT VARCHAR2(30) := 'NL2Query DBMS';\n  v_version  NUMBER(3,1) := 1.0;\n  v_status   VARCHAR2(20);\nBEGIN\n  -- Executable Section (Mandatory): procedural logic & embedded SQL\n  v_status := 'ACTIVE';\n  DBMS_OUTPUT.PUT_LINE('Running: ' || v_app_name || ' v' || TO_CHAR(v_version));\n  DBMS_OUTPUT.PUT_LINE('System Status: ' || v_status);\nEXCEPTION\n  -- Exception Section (Optional): intercepts and handles runtime errors\n  WHEN OTHERS THEN\n    DBMS_OUTPUT.PUT_LINE('Runtime exception trapped: ' || SQLERRM);\nEND;\n/"}
                  isCode={true}
                />
                <PlSqlLearnSubcard
                  title="What happens during processing (Engine Behavior):"
                  content={"The client sends the entire block to the Oracle server in a single call. The PL/SQL engine strips procedural statements to execute internally in the Procedural Statement Executor, while routing embedded SQL statements directly to the SQL Statement Executor. This eliminates costly network round-trips compared to sending individual SQL commands."}
                />
                <PlSqlLearnSubcard
                  title="Performance, Pitfalls &amp; Best Practices:"
                  content={"Always encapsulate related SQL operations inside a single PL/SQL block or stored procedure to minimize client-server network round-trips. Always verify that SERVEROUTPUT is enabled when debugging DBMS_OUTPUT calls."}
                  highlight={true}
                />
              </div>
            </PlSqlLearnCard>
          )}

        {/* Card 02: Variables, Data Types & Anchored Types */}
        {(selectedModule === "all" || selectedModule === "basics") &&
          matchesSearch(["Data Types", "Constants", "Anchored", "%TYPE", "%ROWTYPE", "variables"]) && (
            <PlSqlLearnCard
              id="sec-02"
              num="02"
              category="Variables &amp; Types"
              title="Data Types, Constants &amp; Anchored Declarations (%TYPE &amp; %ROWTYPE)"
              preview="Scalar data types, constants, NOT NULL constraints, and dynamic schema binding with %TYPE and %ROWTYPE."
              isOpen={!!openCards["sec-02"]}
              onToggle={() => toggleCard("sec-02")}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <PlSqlLearnSubcard
                  title="What it does &amp; Functionality:"
                  content={"PL/SQL provides rich scalar types (NUMBER, VARCHAR2, DATE, TIMESTAMP, BOOLEAN) and anchor attributes (%TYPE and %ROWTYPE). %TYPE anchors a variable's data type to an existing column or variable, while %ROWTYPE anchors a record variable to an entire database table or cursor row structure."}
                />
                <PlSqlLearnSubcard
                  title="Code Example &amp; Practical Implementation:"
                  content={"DECLARE\n  -- Primitive scalar declarations\n  c_tax_rate      CONSTANT NUMBER(3,2) := 0.18; -- Constant cannot be reassigned\n  v_hire_date     DATE := SYSDATE;\n  v_is_eligible   BOOLEAN := TRUE;\n  \n  -- Anchored to table column datatype (dynamically tracks schema changes)\n  v_emp_id        employees.employee_id%TYPE := 101;\n  v_salary        employees.salary%TYPE;\n  \n  -- Anchored to entire table row structure (record composite)\n  v_emp_record    employees%ROWTYPE;\nBEGIN\n  SELECT * INTO v_emp_record FROM employees WHERE employee_id = v_emp_id;\n  v_salary := v_emp_record.salary * (1 + c_tax_rate);\n  DBMS_OUTPUT.PUT_LINE('Employee: ' || v_emp_record.first_name || ' | Adjusted: $' || v_salary);\nEND;\n/"}
                  isCode={true}
                />
                <PlSqlLearnSubcard
                  title="What happens during processing (Engine Behavior):"
                  content={"At compilation time, the PL/SQL compiler queries the data dictionary to resolve %TYPE and %ROWTYPE definitions and stores internal dependency timestamps. If the underlying table schema changes (e.g. column width increased), dependent PL/SQL units are marked INVALID and automatically recompiled upon subsequent execution."}
                />
                <PlSqlLearnSubcard
                  title="Performance, Pitfalls &amp; Best Practices:"
                  content={"Always prefer %TYPE and %ROWTYPE over hardcoded datatypes like VARCHAR2(100). If table schemas evolve, anchored variables automatically scale and adapt, preventing unexpected data truncation (ORA-06502) and code maintenance nightmares."}
                  highlight={true}
                />
              </div>
            </PlSqlLearnCard>
          )}

        {/* Card 03: Operators, Expressions & Three-Valued Logic */}
        {(selectedModule === "all" || selectedModule === "basics") &&
          matchesSearch(["Operators", "Expressions", "NULL", "Three-Valued Logic", "NVL", "COALESCE"]) && (
            <PlSqlLearnCard
              id="sec-03"
              num="03"
              category="Expressions"
              title="Operators, Expressions &amp; Three-Valued Logic (NULL Semantics)"
              preview="Arithmetic, relational, logical operators, string concatenation, and 3-valued boolean truth tables."
              isOpen={!!openCards["sec-03"]}
              onToggle={() => toggleCard("sec-03")}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <PlSqlLearnSubcard
                  title="What it does &amp; Functionality:"
                  content={"PL/SQL supports arithmetic (+, -, *, /, **), relational (=, !=, <>, <, >, <=, >=, IS NULL, LIKE, BETWEEN, IN), logical (AND, OR, NOT), and string concatenation (||). Unlike binary programming languages, PL/SQL uses three-valued logic: TRUE, FALSE, and NULL (UNKNOWN). Any arithmetic or relational comparison involving NULL evaluates to NULL."}
                />
                <PlSqlLearnSubcard
                  title="Code Example &amp; Practical Implementation:"
                  content={"DECLARE\n  v_bonus   NUMBER := NULL;\n  v_salary  NUMBER := 5000;\n  v_total   NUMBER;\n  v_check   BOOLEAN;\nBEGIN\n  -- NULL arithmetic returns NULL unless guarded with NVL or COALESCE\n  v_total := v_salary + NVL(v_bonus, 0);\n  \n  -- Three-valued comparison test\n  v_check := (v_bonus > 0); -- Evaluates to NULL (neither TRUE nor FALSE)\n  \n  IF v_check THEN\n    DBMS_OUTPUT.PUT_LINE('Bonus is positive');\n  ELSIF NOT v_check THEN\n    DBMS_OUTPUT.PUT_LINE('Bonus is not positive');\n  ELSE\n    DBMS_OUTPUT.PUT_LINE('Condition evaluated to NULL! Handling unknown state.');\n  END IF;\n  \n  DBMS_OUTPUT.PUT_LINE('Total compensation: $' || v_total);\nEND;\n/"}
                  isCode={true}
                />
                <PlSqlLearnSubcard
                  title="What happens during processing (Engine Behavior):"
                  content={"The PL/SQL evaluation engine uses short-circuit evaluation for boolean expressions: in 'A AND B', if A is FALSE, B is never evaluated; in 'A OR B', if A is TRUE, B is bypassed. However, in conditions evaluating to NULL, IF statements treat NULL as non-truth (branching directly to ELSE or ELSIF)."}
                />
                <PlSqlLearnSubcard
                  title="Performance, Pitfalls &amp; Best Practices:"
                  content={"Never write 'variable = NULL'; always use 'variable IS NULL'. Use NVL or COALESCE to provide sensible fallbacks in mathematical calculations to prevent unintentional NULL propagation throughout complex procedural pipelines."}
                  highlight={true}
                />
              </div>
            </PlSqlLearnCard>
          )}

        {/* Card 04: Conditional Branching (IF-THEN-ELSIF & CASE) */}
        {(selectedModule === "all" || selectedModule === "control") &&
          matchesSearch(["IF", "THEN", "ELSIF", "ELSE", "CASE", "Conditional", "Branching"]) && (
            <PlSqlLearnCard
              id="sec-04"
              num="04"
              category="Control Flow"
              title="Conditional Control: IF-THEN-ELSIF, Simple CASE &amp; Searched CASE"
              preview="Multi-way branching logic, CASE expressions vs CASE statements, and the NULL statement."
              isOpen={!!openCards["sec-04"]}
              onToggle={() => toggleCard("sec-04")}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <PlSqlLearnSubcard
                  title="What it does &amp; Functionality:"
                  content={"Conditional branching controls execution based on boolean evaluations. PL/SQL offers the IF-THEN-ELSIF-ELSE ladder, simple CASE statements (matching an expression against discrete values), searched CASE statements (evaluating arbitrary boolean conditions), and inline CASE expressions returning values."}
                />
                <PlSqlLearnSubcard
                  title="Code Example &amp; Practical Implementation:"
                  content={"DECLARE\n  v_rating     CHAR(1) := 'B';\n  v_bonus_pct  NUMBER;\n  v_tier_label VARCHAR2(30);\nBEGIN\n  -- 1. Searched CASE Statement\n  CASE\n    WHEN v_rating = 'A' THEN v_bonus_pct := 0.25;\n    WHEN v_rating = 'B' THEN v_bonus_pct := 0.15;\n    WHEN v_rating = 'C' THEN v_bonus_pct := 0.05;\n    ELSE v_bonus_pct := 0.00;\n  END CASE;\n\n  -- 2. Simple CASE Expression (inline assignment)\n  v_tier_label := CASE v_rating\n    WHEN 'A' THEN 'Executive Tier'\n    WHEN 'B' THEN 'Senior Tier'\n    WHEN 'C' THEN 'Standard Tier'\n    ELSE 'Probationary Tier'\n  END;\n\n  DBMS_OUTPUT.PUT_LINE('Rating ' || v_rating || ' -> ' || v_tier_label || ' (' || (v_bonus_pct*100) || '% bonus)');\nEND;\n/"}
                  isCode={true}
                />
                <PlSqlLearnSubcard
                  title="What happens during processing (Engine Behavior):"
                  content={"In CASE statements, cases are evaluated sequentially in lexical order. When a condition evaluates to TRUE, its statement block executes and control immediately leaves the CASE structure. If no WHEN condition matches and there is no ELSE clause in a CASE statement, Oracle throws runtime error ORA-06592 (CASE_NOT_FOUND)."}
                />
                <PlSqlLearnSubcard
                  title="Performance, Pitfalls &amp; Best Practices:"
                  content={"Prefer CASE over long chains of nested IF statements for readability and compiler branch optimization. Always supply an ELSE clause in CASE statements to avoid unexpected CASE_NOT_FOUND exceptions."}
                  highlight={true}
                />
              </div>
            </PlSqlLearnCard>
          )}

        {/* Card 05: Iterative Loops: Basic, WHILE, and Numeric FOR */}
        {(selectedModule === "all" || selectedModule === "control") &&
          matchesSearch(["Loops", "FOR", "WHILE", "LOOP", "EXIT WHEN", "REVERSE", "CONTINUE"]) && (
            <PlSqlLearnCard
              id="sec-05"
              num="05"
              category="Control Flow"
              title="Iterative Loops: Basic LOOP, WHILE LOOP, Numeric FOR &amp; REVERSE"
              preview="Iterating with EXIT WHEN, pre-tested loops, automated FOR indexing, labels, and CONTINUE WHEN."
              isOpen={!!openCards["sec-05"]}
              onToggle={() => toggleCard("sec-05")}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <PlSqlLearnSubcard
                  title="What it does &amp; Functionality:"
                  content={"PL/SQL provides three core loop structures: Basic LOOP (infinite loop terminated explicitly by EXIT WHEN), WHILE LOOP (pre-tested loop executing while a condition remains TRUE), and Numeric FOR LOOP (iterating automatically across an integer range, optionally in REVERSE). PL/SQL also supports CONTINUE and CONTINUE WHEN to skip to the next iteration."}
                />
                <PlSqlLearnSubcard
                  title="Code Example &amp; Practical Implementation:"
                  content={"DECLARE\n  v_counter NUMBER := 1;\nBEGIN\n  -- 1. Basic LOOP with EXIT WHEN and label\n  <<basic_loop>>\n  LOOP\n    v_counter := v_counter + 1;\n    EXIT basic_loop WHEN v_counter > 3;\n  END LOOP basic_loop;\n\n  -- 2. WHILE LOOP\n  WHILE v_counter <= 5 LOOP\n    v_counter := v_counter + 1;\n  END LOOP;\n\n  -- 3. Numeric FOR LOOP with REVERSE and CONTINUE WHEN\n  FOR i IN REVERSE 1..5 LOOP\n    CONTINUE WHEN MOD(i, 2) = 0; -- Skip even numbers\n    DBMS_OUTPUT.PUT_LINE('Odd index in reverse: ' || i);\n  END LOOP;\nEND;\n/"}
                  isCode={true}
                />
                <PlSqlLearnSubcard
                  title="What happens during processing (Engine Behavior):"
                  content={"In numeric FOR loops, the loop index variable (i) is automatically declared as an integer local to the loop body; it shadows any outer variable with the same name and is read-only (attempting to assign 'i := 10;' causes compiler error PLS-00363). The range bounds are evaluated once upon loop entry."}
                />
                <PlSqlLearnSubcard
                  title="Performance, Pitfalls &amp; Best Practices:"
                  content={"Use label identifiers (e.g. <<outer_loop>>) when nesting loops to make EXIT and CONTINUE statements unambiguous and maintainable. Avoid manually managing index counters when a numeric FOR loop can guarantee boundary safety."}
                  highlight={true}
                />
              </div>
            </PlSqlLearnCard>
          )}

        {/* Card 06: Embedded SQL & Transactions */}
        {(selectedModule === "all" || selectedModule === "cursors") &&
          matchesSearch(["DML", "SELECT INTO", "COMMIT", "ROLLBACK", "SAVEPOINT", "RETURNING INTO", "transactions"]) && (
            <PlSqlLearnCard
              id="sec-06"
              num="06"
              category="DML &amp; Transactions"
              title="DML Operations, SELECT INTO &amp; Transaction Control (COMMIT, ROLLBACK, SAVEPOINT)"
              preview="Executing DML statements inside PL/SQL, single-row SELECT INTO, RETURNING INTO, and atomic transactions."
              isOpen={!!openCards["sec-06"]}
              onToggle={() => toggleCard("sec-06")}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <PlSqlLearnSubcard
                  title="What it does &amp; Functionality:"
                  content={"Standard SQL statements (SELECT, INSERT, UPDATE, DELETE, MERGE) can be written directly inside PL/SQL executable blocks. SELECT INTO fetches exactly one row into local variables. The RETURNING INTO clause captures affected row values directly from INSERT/UPDATE/DELETE. Transaction consistency is managed via COMMIT, ROLLBACK, and SAVEPOINT."}
                />
                <PlSqlLearnSubcard
                  title="Code Example &amp; Practical Implementation:"
                  content={"DECLARE\n  v_new_id     orders.order_id%TYPE;\n  v_total_paid orders.total_amount%TYPE;\nBEGIN\n  -- Savepoint before starting business operation\n  SAVEPOINT before_order_placement;\n\n  -- Embedded INSERT with RETURNING clause\n  INSERT INTO orders (customer_id, order_date, total_amount, status)\n  VALUES (42, SYSDATE, 450.00, 'CONFIRMED')\n  RETURNING order_id, total_amount INTO v_new_id, v_total_paid;\n\n  -- Embedded UPDATE\n  UPDATE customer_balances\n  SET balance = balance - v_total_paid\n  WHERE customer_id = 42;\n\n  -- Commit transaction changes atomically\n  COMMIT;\n  DBMS_OUTPUT.PUT_LINE('Order #' || v_new_id || ' placed and account debited.');\nEXCEPTION\n  WHEN OTHERS THEN\n    ROLLBACK TO before_order_placement;\n    DBMS_OUTPUT.PUT_LINE('Transaction rolled back: ' || SQLERRM);\n    RAISE;\nEND;\n/"}
                  isCode={true}
                />
                <PlSqlLearnSubcard
                  title="What happens during processing (Engine Behavior):"
                  content={"When the PL/SQL engine encounters a DML or transaction command, it passes the SQL statement to the SQL runtime engine. A database transaction begins implicitly with the first DML statement and persists across blocks until explicitly ended with COMMIT, ROLLBACK, or session disconnect."}
                />
                <PlSqlLearnSubcard
                  title="Performance, Pitfalls &amp; Best Practices:"
                  content={"Always use RETURNING INTO instead of performing a secondary SELECT to retrieve generated primary keys or trigger-populated sequence values. Keep transactions short to minimize table locks and undo log space utilization."}
                  highlight={true}
                />
              </div>
            </PlSqlLearnCard>
          )}

        {/* Card 07: Implicit Cursors & SQL Cursor Attributes */}
        {(selectedModule === "all" || selectedModule === "cursors") &&
          matchesSearch(["Implicit Cursor", "SQL%FOUND", "SQL%NOTFOUND", "SQL%ROWCOUNT", "SQL%ISOPEN", "cursors"]) && (
            <PlSqlLearnCard
              id="sec-07"
              num="07"
              category="Cursors"
              title="The Implicit Cursor (SQL) &amp; Dynamic DML Attributes"
              preview="Inspecting SQL%FOUND, SQL%NOTFOUND, SQL%ROWCOUNT, and SQL%ISOPEN for DML feedback."
              isOpen={!!openCards["sec-07"]}
              onToggle={() => toggleCard("sec-07")}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <PlSqlLearnSubcard
                  title="What it does &amp; Functionality:"
                  content={"Whenever Oracle executes an implicit SQL statement (such as a single-row SELECT INTO, INSERT, UPDATE, or DELETE), it automatically opens, manages, and closes an implicit cursor named 'SQL'. PL/SQL exposes cursor attributes to inspect the outcome of the most recent SQL statement executed in the current session."}
                />
                <PlSqlLearnSubcard
                  title="Code Example &amp; Practical Implementation:"
                  content={"DECLARE\n  v_rows_affected NUMBER;\n  v_dept_target   NUMBER := 30;\nBEGIN\n  UPDATE employees\n  SET salary = salary * 1.05\n  WHERE department_id = v_dept_target;\n\n  -- Inspecting implicit cursor attributes immediately after DML\n  IF SQL%FOUND THEN\n    v_rows_affected := SQL%ROWCOUNT;\n    DBMS_OUTPUT.PUT_LINE('Success: ' || v_rows_affected || ' salaries updated in Dept ' || v_dept_target);\n  ELSIF SQL%NOTFOUND THEN\n    DBMS_OUTPUT.PUT_LINE('No employees found in Department ' || v_dept_target);\n  END IF;\n  \n  -- SQL%ISOPEN always evaluates to FALSE for implicit cursors\n  IF NOT SQL%ISOPEN THEN\n    DBMS_OUTPUT.PUT_LINE('Implicit cursor automatically closed by engine.');\n  END IF;\nEND;\n/"}
                  isCode={true}
                />
                <PlSqlLearnSubcard
                  title="What happens during processing (Engine Behavior):"
                  content={"Oracle maintains the implicit SQL cursor attributes in the session's Program Global Area (PGA). Every newly executed SQL statement immediately overwrites the values of SQL%FOUND, SQL%NOTFOUND, and SQL%ROWCOUNT, so their values must be checked or cached into local variables before running any subsequent SQL statement."}
                />
                <PlSqlLearnSubcard
                  title="Performance, Pitfalls &amp; Best Practices:"
                  content={"Always inspect SQL%ROWCOUNT to verify that your UPDATE or DELETE statements impacted the expected volume of rows. This prevents silent logical bugs where a query updates 0 rows without throwing an error."}
                  highlight={true}
                />
              </div>
            </PlSqlLearnCard>
          )}

        {/* Card 08: Explicit Cursors: Lifecycle & Multi-Row Fetching */}
        {(selectedModule === "all" || selectedModule === "cursors") &&
          matchesSearch(["Explicit Cursor", "CURSOR", "OPEN", "FETCH", "CLOSE", "%FOUND", "%NOTFOUND", "%ROWCOUNT"]) && (
            <PlSqlLearnCard
              id="sec-08"
              num="08"
              category="Cursors"
              title="Explicit Cursors: Declaration, OPEN, FETCH INTO &amp; CLOSE Lifecycle"
              preview="Manual cursor work areas for multi-row query retrieval and explicit attribute checking."
              isOpen={!!openCards["sec-08"]}
              onToggle={() => toggleCard("sec-08")}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <PlSqlLearnSubcard
                  title="What it does &amp; Functionality:"
                  content={"An explicit cursor is a named query work area declared in the DECLARE section that allows row-by-row navigation of multi-row result sets. The full lifecycle consists of 4 distinct steps: 1) DECLARE cursor, 2) OPEN (parses, binds, and executes query), 3) FETCH INTO (retrieves current row pointer and advances), and 4) CLOSE (releases PGA memory)."}
                />
                <PlSqlLearnSubcard
                  title="Code Example &amp; Practical Implementation:"
                  content={"DECLARE\n  -- 1. Declaration\n  CURSOR cur_top_earners IS\n    SELECT employee_id, first_name, salary\n    FROM employees\n    WHERE salary > 8000\n    ORDER BY salary DESC;\n\n  v_emp_id employees.employee_id%TYPE;\n  v_name   employees.first_name%TYPE;\n  v_sal    employees.salary%TYPE;\nBEGIN\n  -- 2. Open\n  OPEN cur_top_earners;\n  \n  -- 3. Fetch in a loop\n  LOOP\n    FETCH cur_top_earners INTO v_emp_id, v_name, v_sal;\n    EXIT WHEN cur_top_earners%NOTFOUND; -- Terminate when active set exhausted\n    \n    DBMS_OUTPUT.PUT_LINE('Ranked #' || cur_top_earners%ROWCOUNT || ': ' || v_name || ' ($' || v_sal || ')');\n  END LOOP;\n  \n  -- 4. Close\n  CLOSE cur_top_earners;\nEXCEPTION\n  WHEN OTHERS THEN\n    IF cur_top_earners%ISOPEN THEN\n      CLOSE cur_top_earners;\n    END IF;\n    RAISE;\nEND;\n/"}
                  isCode={true}
                />
                <PlSqlLearnSubcard
                  title="What happens during processing (Engine Behavior):"
                  content={"OPEN allocates work area memory in the private SQL area, evaluates bind parameters, and creates the active query result set. FETCH copies column data into PL/SQL variables. CLOSE deallocates private memory buffers. Failing to close cursors can exhaust open cursor quotas (ORA-01000: maximum open cursors exceeded)."}
                />
                <PlSqlLearnSubcard
                  title="Performance, Pitfalls &amp; Best Practices:"
                  content={"Always close explicit cursors, including within exception handlers. For simple iteration, prefer Cursor FOR Loops (Card 09) which guarantee automatic cursor closing even when unexpected exceptions occur."}
                  highlight={true}
                />
              </div>
            </PlSqlLearnCard>
          )}

        {/* Card 09: Parameterized Cursors & Cursor FOR Loops */}
        {(selectedModule === "all" || selectedModule === "cursors") &&
          matchesSearch(["Parameterized Cursor", "Cursor FOR Loop", "Subquery Cursor", "parameters"]) && (
            <PlSqlLearnCard
              id="sec-09"
              num="09"
              category="Cursors"
              title="Parameterized Cursors &amp; Automated Cursor FOR Loops"
              preview="Passing runtime arguments to cursors and writing leak-free, clean iteration with Cursor FOR loops."
              isOpen={!!openCards["sec-09"]}
              onToggle={() => toggleCard("sec-09")}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <PlSqlLearnSubcard
                  title="What it does &amp; Functionality:"
                  content={"Parameterized cursors accept input parameters directly in their declaration, allowing query reuse across different criteria. A Cursor FOR Loop is the most elegant way to traverse cursors: it automatically declares a record variable matching the query rowtype, opens the cursor, fetches rows iteratively, checks %NOTFOUND to exit, and automatically closes the cursor upon exit."}
                />
                <PlSqlLearnSubcard
                  title="Code Example &amp; Practical Implementation:"
                  content={"DECLARE\n  -- Parameterized cursor declaration\n  CURSOR cur_dept_roster (p_dept_id NUMBER, p_min_sal NUMBER) IS\n    SELECT employee_id, first_name, last_name, salary\n    FROM employees\n    WHERE department_id = p_dept_id\n      AND salary >= p_min_sal;\nBEGIN\n  -- Cursor FOR Loop manages OPEN, FETCH, EXIT, and CLOSE automatically!\n  FOR emp_rec IN cur_dept_roster(p_dept_id => 20, p_min_sal => 4000) LOOP\n    DBMS_OUTPUT.PUT_LINE('ID: ' || emp_rec.employee_id || ' | Name: ' || emp_rec.first_name || ' ' || emp_rec.last_name);\n  END LOOP;\n\n  -- Subquery Cursor FOR Loop (Inline query without formal cursor declaration)\n  FOR dept_rec IN (SELECT department_id, department_name FROM departments ORDER BY department_id) LOOP\n    DBMS_OUTPUT.PUT_LINE('Dept [' || dept_rec.department_id || ']: ' || dept_rec.department_name);\n  END LOOP;\nEND;\n/"}
                  isCode={true}
                />
                <PlSqlLearnSubcard
                  title="What happens during processing (Engine Behavior):"
                  content={"The Oracle PL/SQL compiler internally optimizes Cursor FOR Loops by transforming them to automatically fetch 100 rows per batch under the hood (bulk array fetch optimization), yielding substantial performance improvements without requiring explicit BULK COLLECT syntax."}
                />
                <PlSqlLearnSubcard
                  title="Performance, Pitfalls &amp; Best Practices:"
                  content={"Always choose Cursor FOR Loops over manual OPEN-FETCH-CLOSE loops for standard row-by-row traversals. They eliminate memory leaks and reduce boilerplate code by 70%."}
                  highlight={true}
                />
              </div>
            </PlSqlLearnCard>
          )}

        {/* Card 10: Locking (FOR UPDATE) & REF CURSORS */}
        {(selectedModule === "all" || selectedModule === "cursors") &&
          matchesSearch(["FOR UPDATE", "WHERE CURRENT OF", "REF CURSOR", "SYS_REFCURSOR", "locking", "pessimistic"]) && (
            <PlSqlLearnCard
              id="sec-10"
              num="10"
              category="Cursors"
              title="Pessimistic Locking (FOR UPDATE, WHERE CURRENT OF) &amp; REF CURSORS"
              preview="Row-level locking during query traversal and dynamic result-set passing with SYS_REFCURSOR."
              isOpen={!!openCards["sec-10"]}
              onToggle={() => toggleCard("sec-10")}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <PlSqlLearnSubcard
                  title="What it does &amp; Functionality:"
                  content={"SELECT ... FOR UPDATE locks the query result set against concurrent modifications until the current transaction commits or rolls back. The WHERE CURRENT OF cursor_name clause performs in-place UPDATE or DELETE on the exact row currently fetched by the cursor. REF CURSORS (cursor variables) are pointers to result sets that can be passed between PL/SQL subprograms and client tiers (Java, Python, C#)."}
                />
                <PlSqlLearnSubcard
                  title="Code Example &amp; Practical Implementation:"
                  content={"DECLARE\n  -- Pessimistic locking cursor with NOWAIT or WAIT n\n  CURSOR c_orders IS\n    SELECT order_id, status FROM orders\n    WHERE status = 'PENDING'\n    FOR UPDATE OF status NOWAIT;\n\n  -- Weakly-typed dynamic cursor variable\n  v_ref_cur SYS_REFCURSOR;\n  v_emp_id  NUMBER;\n  v_emp_name VARCHAR2(100);\nBEGIN\n  -- 1. Locking and WHERE CURRENT OF update\n  FOR ord IN c_orders LOOP\n    UPDATE orders\n    SET status = 'PROCESSED'\n    WHERE CURRENT OF c_orders; -- Updates the exact row under the cursor\n  END LOOP;\n  COMMIT;\n\n  -- 2. Opening and passing a SYS_REFCURSOR dynamically\n  OPEN v_ref_cur FOR SELECT employee_id, first_name FROM employees WHERE department_id = 10;\n  FETCH v_ref_cur INTO v_emp_id, v_emp_name;\n  DBMS_OUTPUT.PUT_LINE('Ref Cursor fetched: ' || v_emp_name || ' (ID: ' || v_emp_id || ')');\n  CLOSE v_ref_cur;\nEND;\n/"}
                  isCode={true}
                />
                <PlSqlLearnSubcard
                  title="What happens during processing (Engine Behavior):"
                  content={"FOR UPDATE requests exclusive row-level locks in the database buffer cache. If NOWAIT is specified and another transaction holds a conflicting lock, Oracle immediately throws ORA-00054 (resource busy). WHERE CURRENT OF uses the underlying rowid stored by the cursor to update the row with zero index-lookup overhead."}
                />
                <PlSqlLearnSubcard
                  title="Performance, Pitfalls &amp; Best Practices:"
                  content={"Always specify NOWAIT or WAIT n with FOR UPDATE to prevent threads from hanging indefinitely waiting for deadlocks. Use SYS_REFCURSOR to return tabular datasets efficiently to front-end callers."}
                  highlight={true}
                />
              </div>
            </PlSqlLearnCard>
          )}

        {/* Card 11: Stored Procedures */}
        {(selectedModule === "all" || selectedModule === "subprograms") &&
          matchesSearch(["Stored Procedure", "PROCEDURE", "IN", "OUT", "IN OUT", "DEFAULT", "parameters"]) && (
            <PlSqlLearnCard
              id="sec-11"
              num="11"
              category="Subprograms"
              title="Stored Procedures: IN, OUT &amp; IN OUT Parameters and Schema Compilation"
              preview="Reusable compiled catalog procedures, parameter passing modes, and default arguments."
              isOpen={!!openCards["sec-11"]}
              onToggle={() => toggleCard("sec-11")}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <PlSqlLearnSubcard
                  title="What it does &amp; Functionality:"
                  content={"Stored procedures are named PL/SQL blocks stored permanently in the database catalog. They perform actions and can accept input values (IN), return output values (OUT), or read and mutate values (IN OUT). Unlike anonymous blocks, stored procedures are compiled once, validated against catalog privileges, and executed repeatedly with high performance."}
                />
                <PlSqlLearnSubcard
                  title="Code Example &amp; Practical Implementation:"
                  content={"CREATE OR REPLACE PROCEDURE process_salary_hike(\n  p_emp_id    IN     employees.employee_id%TYPE,\n  p_hike_pct  IN     NUMBER DEFAULT 5, -- Default parameter value\n  p_old_sal   OUT    employees.salary%TYPE,\n  p_new_sal   OUT    employees.salary%TYPE\n) IS\nBEGIN\n  -- Retrieve existing salary\n  SELECT salary INTO p_old_sal FROM employees WHERE employee_id = p_emp_id;\n\n  -- Calculate and update\n  p_new_sal := p_old_sal * (1 + (p_hike_pct / 100));\n  UPDATE employees SET salary = p_new_sal WHERE employee_id = p_emp_id;\n  \n  DBMS_OUTPUT.PUT_LINE('Procedure complete for Employee #' || p_emp_id);\nEXCEPTION\n  WHEN NO_DATA_FOUND THEN\n    RAISE_APPLICATION_ERROR(-20001, 'Employee ID ' || p_emp_id || ' does not exist.');\nEND process_salary_hike;\n/\n\n-- Calling the procedure via anonymous block:\nDECLARE\n  v_prior NUMBER;\n  v_post  NUMBER;\nBEGIN\n  -- Named notation passing\n  process_salary_hike(p_emp_id => 102, p_hike_pct => 10, p_old_sal => v_prior, p_new_sal => v_post);\n  DBMS_OUTPUT.PUT_LINE('Prior: $' || v_prior || ' -> New: $' || v_post);\nEND;\n/"}
                  isCode={true}
                />
                <PlSqlLearnSubcard
                  title="What happens during processing (Engine Behavior):"
                  content={"Procedures are parsed and compiled into machine bytecode (MCODE) and stored in the data dictionary (USER_SOURCE, USER_OBJECTS). When executed, the bytecode is loaded into the database Shared Pool (SGA) library cache so multiple sessions share the compiled executable plan."}
                />
                <PlSqlLearnSubcard
                  title="Performance, Pitfalls &amp; Best Practices:"
                  content={"Use IN parameters by default (passed by reference). For OUT and IN OUT parameters handling large records or collections, use the NOCOPY hint (e.g. p_coll IN OUT NOCOPY t_coll) to pass by reference and avoid expensive memory copy operations."}
                  highlight={true}
                />
              </div>
            </PlSqlLearnCard>
          )}

        {/* Card 12: Stored Functions & Purity Rules */}
        {(selectedModule === "all" || selectedModule === "subprograms") &&
          matchesSearch(["Stored Function", "FUNCTION", "RETURN", "DETERMINISTIC", "RESULT_CACHE", "purity"]) && (
            <PlSqlLearnCard
              id="sec-12"
              num="12"
              category="Subprograms"
              title="Stored Functions: Return Types, SQL Purity Constraints &amp; Result Caching"
              preview="Creating functions, calling functions in SQL expressions, DETERMINISTIC, and RESULT_CACHE."
              isOpen={!!openCards["sec-12"]}
              onToggle={() => toggleCard("sec-12")}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <PlSqlLearnSubcard
                  title="What it does &amp; Functionality:"
                  content={"A stored function is a compiled subprogram that computes and returns a single value via the RETURN clause. Functions can be invoked within PL/SQL blocks or directly inside SQL SELECT, WHERE, and ORDER BY clauses, provided they respect SQL purity rules (functions called from SQL must not execute DML statements or commit/rollback transactions)."}
                />
                <PlSqlLearnSubcard
                  title="Code Example &amp; Practical Implementation:"
                  content={"CREATE OR REPLACE FUNCTION calculate_annual_tax(\n  p_monthly_salary IN NUMBER,\n  p_tax_rate       IN NUMBER DEFAULT 0.15\n) RETURN NUMBER\nDETERMINISTIC\nRESULT_CACHE\nIS\n  v_annual_income NUMBER;\n  v_annual_tax    NUMBER;\nBEGIN\n  IF p_monthly_salary IS NULL OR p_monthly_salary <= 0 THEN\n    RETURN 0;\n  END IF;\n\n  v_annual_income := p_monthly_salary * 12;\n  v_annual_tax    := v_annual_income * p_tax_rate;\n  RETURN ROUND(v_annual_tax, 2);\nEND calculate_annual_tax;\n/\n\n-- Calling the stored function directly inside a SQL query:\nSELECT employee_id, salary, calculate_annual_tax(salary, 0.18) AS annual_tax\nFROM employees\nWHERE calculate_annual_tax(salary, 0.18) > 5000;"}
                  isCode={true}
                />
                <PlSqlLearnSubcard
                  title="What happens during processing (Engine Behavior):"
                  content={"Marking a function DETERMINISTIC tells the query optimizer that the function always returns the exact same result for identical arguments, allowing expression caching during queries. Adding RESULT_CACHE stores computed results in the shared pool, completely skipping function execution on subsequent calls with duplicate parameters."}
                />
                <PlSqlLearnSubcard
                  title="Performance, Pitfalls &amp; Best Practices:"
                  content={"Avoid excessive context switching: calling PL/SQL functions for millions of rows in a SQL query incurs overhead. Use the UDF (User Defined Function) PRAGMA or RESULT_CACHE to minimize execution latency in analytical workloads."}
                  highlight={true}
                />
              </div>
            </PlSqlLearnCard>
          )}

        {/* Card 13: Packages Part 1: Specification */}
        {(selectedModule === "all" || selectedModule === "subprograms") &&
          matchesSearch(["Package Specification", "PACKAGE", "Header", "Contract", "Public", "packages"]) && (
            <PlSqlLearnCard
              id="sec-13"
              num="13"
              category="Packages"
              title="Packages: Specification (Header Contract &amp; Public API Declarations)"
              preview="Encapsulation, public interfaces, types, constants, and cursor declarations."
              isOpen={!!openCards["sec-13"]}
              onToggle={() => toggleCard("sec-13")}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <PlSqlLearnSubcard
                  title="What it does &amp; Functionality:"
                  content={"A PL/SQL package is a schema object that groups logically related PL/SQL types, variables, constants, cursors, exceptions, and subprograms together. A package consists of two distinct components: the Package Specification (the public API contract) and the Package Body (the private implementation). Anything declared in the specification is globally accessible to any user with EXECUTE privileges on the package."}
                />
                <PlSqlLearnSubcard
                  title="Code Example &amp; Practical Implementation:"
                  content={"CREATE OR REPLACE PACKAGE emp_management_pkg IS\n  -- Public Global Constant\n  c_max_bonus_limit CONSTANT NUMBER := 50000;\n\n  -- Public Custom Record Type & Collection Type\n  TYPE t_emp_summary IS RECORD (\n    emp_id   employees.employee_id%TYPE,\n    fullname VARCHAR2(100),\n    net_pay  NUMBER(10,2)\n  );\n\n  -- Public Cursors\n  CURSOR cur_active_staff RETURN employees%ROWTYPE;\n\n  -- Public Subprogram Specifications (Signatures only)\n  PROCEDURE transfer_employee(\n    p_emp_id  IN employees.employee_id%TYPE,\n    p_to_dept IN departments.department_id%TYPE\n  );\n\n  FUNCTION get_total_department_salary(\n    p_dept_id IN departments.department_id%TYPE\n  ) RETURN NUMBER;\nEND emp_management_pkg;\n/"}
                  isCode={true}
                />
                <PlSqlLearnSubcard
                  title="What happens during processing (Engine Behavior):"
                  content={"The Package Specification can be compiled independently of the Package Body. When client programs or other procedures call the package, they depend only on the specification. Changing or recompiling the Package Body does NOT invalidate dependent programs, eliminating cascading recompilations."}
                />
                <PlSqlLearnSubcard
                  title="Performance, Pitfalls &amp; Best Practices:"
                  content={"Always design modular packages instead of standalone procedures. Packages load entirely into the Shared Pool upon first invocation, making subsequent subprogram calls practically instantaneous."}
                  highlight={true}
                />
              </div>
            </PlSqlLearnCard>
          )}

        {/* Card 14: Packages Part 2: Body, Private Items & Session State */}
        {(selectedModule === "all" || selectedModule === "subprograms") &&
          matchesSearch(["Package Body", "PACKAGE BODY", "Private Subprograms", "Session State", "packages"]) && (
            <PlSqlLearnCard
              id="sec-14"
              num="14"
              category="Packages"
              title="Packages: Body, Private Subprograms &amp; Session State Lifecycle"
              preview="Implementing the package body, information hiding, private helpers, and package initialization."
              isOpen={!!openCards["sec-14"]}
              onToggle={() => toggleCard("sec-14")}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <PlSqlLearnSubcard
                  title="What it does &amp; Functionality:"
                  content={"The Package Body contains the executable implementation of all cursors and subprograms declared in the specification, as well as private subprograms, private variables, and an optional package initialization block. Private items are completely hidden from outside callers, enforcing true object-oriented encapsulation and information hiding."}
                />
                <PlSqlLearnSubcard
                  title="Code Example &amp; Practical Implementation:"
                  content={"CREATE OR REPLACE PACKAGE BODY emp_management_pkg IS\n  -- Private package state variable (persists for the entire session)\n  g_operations_count NUMBER := 0;\n\n  -- Private helper function (invisible outside package body)\n  FUNCTION is_dept_valid(p_dept_id IN NUMBER) RETURN BOOLEAN IS\n    v_dummy NUMBER;\n  BEGIN\n    SELECT 1 INTO v_dummy FROM departments WHERE department_id = p_dept_id;\n    RETURN TRUE;\n  EXCEPTION\n    WHEN NO_DATA_FOUND THEN RETURN FALSE;\n  END is_dept_valid;\n\n  -- Public Procedure Implementation\n  PROCEDURE transfer_employee(p_emp_id IN NUMBER, p_to_dept IN NUMBER) IS\n  BEGIN\n    IF NOT is_dept_valid(p_to_dept) THEN\n      RAISE_APPLICATION_ERROR(-20002, 'Target department does not exist.');\n    END IF;\n    UPDATE employees SET department_id = p_to_dept WHERE employee_id = p_emp_id;\n    g_operations_count := g_operations_count + 1;\n  END transfer_employee;\n\n  -- Public Function Implementation\n  FUNCTION get_total_department_salary(p_dept_id IN NUMBER) RETURN NUMBER IS\n    v_total NUMBER;\n  BEGIN\n    SELECT NVL(SUM(salary), 0) INTO v_total FROM employees WHERE department_id = p_dept_id;\n    RETURN v_total;\n  END get_total_department_salary;\n\n-- Optional Package Initialization Block (runs once per session upon first reference)\nBEGIN\n  g_operations_count := 0;\nEND emp_management_pkg;\n/"}
                  isCode={true}
                />
                <PlSqlLearnSubcard
                  title="What happens during processing (Engine Behavior):"
                  content={"Package variables maintain session state: their values persist across separate calls from the same database session in the User Global Area (UGA). When a package is first referenced, Oracle runs the initialization block once, setting up caches and initial values for the session lifetime."}
                />
                <PlSqlLearnSubcard
                  title="Performance, Pitfalls &amp; Best Practices:"
                  content={"Keep package initialization blocks lightweight. Do not execute heavy queries or long-running computations during initialization, as it will delay the session's initial package call."}
                  highlight={true}
                />
              </div>
            </PlSqlLearnCard>
          )}

        {/* Card 15: Predefined System Exceptions */}
        {(selectedModule === "all" || selectedModule === "exceptions") &&
          matchesSearch(["Predefined Exceptions", "NO_DATA_FOUND", "TOO_MANY_ROWS", "ZERO_DIVIDE", "DUP_VAL_ON_INDEX", "WHEN OTHERS"]) && (
            <PlSqlLearnCard
              id="sec-15"
              num="15"
              category="Exceptions"
              title="Exception Handling: Predefined System Exceptions &amp; Block Trapping"
              preview="Handling NO_DATA_FOUND, TOO_MANY_ROWS, ZERO_DIVIDE, DUP_VAL_ON_INDEX, and WHEN OTHERS."
              isOpen={!!openCards["sec-15"]}
              onToggle={() => toggleCard("sec-15")}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <PlSqlLearnSubcard
                  title="What it does &amp; Functionality:"
                  content={"In PL/SQL, any warning or error condition is treated as an exception. When an exception occurs, normal procedural execution halts immediately, and control transfers to the EXCEPTION section of the current block. Oracle provides dozens of named predefined exceptions for standard error codes."}
                />
                <PlSqlLearnSubcard
                  title="Code Example &amp; Practical Implementation:"
                  content={"DECLARE\n  v_emp_id employees.employee_id%TYPE := 99999;\n  v_name   employees.first_name%TYPE;\nBEGIN\n  -- Statement that will cause NO_DATA_FOUND\n  SELECT first_name INTO v_name FROM employees WHERE employee_id = v_emp_id;\n  DBMS_OUTPUT.PUT_LINE('Employee: ' || v_name);\n\nEXCEPTION\n  WHEN NO_DATA_FOUND THEN\n    -- ORA-01403: Single-row SELECT INTO returned zero rows\n    DBMS_OUTPUT.PUT_LINE('Handled: No employee exists with ID ' || v_emp_id);\n    \n  WHEN TOO_MANY_ROWS THEN\n    -- ORA-01422: Single-row SELECT INTO returned more than 1 row\n    DBMS_OUTPUT.PUT_LINE('Handled: Query returned multiple rows instead of single scalar.');\n\n  WHEN ZERO_DIVIDE THEN\n    -- ORA-01476: Attempted division by zero\n    DBMS_OUTPUT.PUT_LINE('Handled: Division by zero intercepted.');\n\n  WHEN DUP_VAL_ON_INDEX THEN\n    -- ORA-00001: Unique or primary key constraint violation\n    DBMS_OUTPUT.PUT_LINE('Handled: Duplicate primary/unique key inserted.');\n\n  WHEN OTHERS THEN\n    -- Fallback handler for all unexpected exceptions\n    DBMS_OUTPUT.PUT_LINE('Unhandled exception [' || SQLCODE || ']: ' || SQLERRM);\nEND;\n/"}
                  isCode={true}
                />
                <PlSqlLearnSubcard
                  title="What happens during processing (Engine Behavior):"
                  content={"If an exception is not handled in the current block, it propagates outward to enclosing parent blocks until a matching WHEN handler is found or the client interface is reached (which unrolls transactions and displays the ORA error stack)."}
                />
                <PlSqlLearnSubcard
                  title="Performance, Pitfalls &amp; Best Practices:"
                  content={"Never write an empty 'WHEN OTHERS THEN NULL;' block! Silently swallowing exceptions masks critical database corruption, constraint violations, and logical failures."}
                  highlight={true}
                />
              </div>
            </PlSqlLearnCard>
          )}

        {/* Card 16: User-Defined Exceptions & PRAGMA EXCEPTION_INIT */}
        {(selectedModule === "all" || selectedModule === "exceptions") &&
          matchesSearch(["User-Defined Exceptions", "PRAGMA EXCEPTION_INIT", "RAISE", "SQLCODE", "SQLERRM", "backtrace"]) && (
            <PlSqlLearnCard
              id="sec-16"
              num="16"
              category="Exceptions"
              title="User-Defined Exceptions, PRAGMA EXCEPTION_INIT &amp; Diagnostics"
              preview="Declaring custom exceptions, explicit RAISE, binding to Oracle error numbers, and backtraces."
              isOpen={!!openCards["sec-16"]}
              onToggle={() => toggleCard("sec-16")}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <PlSqlLearnSubcard
                  title="What it does &amp; Functionality:"
                  content={"Business rules frequently demand custom exceptions (e.g. e_overdraft, e_inactive_account). Developers declare them with the EXCEPTION keyword and trigger them explicitly using the RAISE statement. PRAGMA EXCEPTION_INIT instructs the compiler to associate a custom exception name with any numeric Oracle error code (such as -2292 for foreign key violations)."}
                />
                <PlSqlLearnSubcard
                  title="Code Example &amp; Practical Implementation:"
                  content={"DECLARE\n  -- 1. Pure User-Defined Exception\n  e_insufficient_funds EXCEPTION;\n  v_balance NUMBER := 100;\n  v_withdraw NUMBER := 250;\n\n  -- 2. Associating custom name to standard Oracle error code (Child Record Found)\n  e_child_record_exists EXCEPTION;\n  PRAGMA EXCEPTION_INIT(e_child_record_exists, -02292);\nBEGIN\n  IF v_withdraw > v_balance THEN\n    RAISE e_insufficient_funds; -- Explicitly raise custom exception\n  END IF;\nEXCEPTION\n  WHEN e_insufficient_funds THEN\n    DBMS_OUTPUT.PUT_LINE('Transaction Aborted: Insufficient funds (Available: $' || v_balance || ')');\n\n  WHEN e_child_record_exists THEN\n    DBMS_OUTPUT.PUT_LINE('Integrity Trap: Cannot delete parent department with active employees.');\n\n  WHEN OTHERS THEN\n    DBMS_OUTPUT.PUT_LINE('Error Stack: ' || DBMS_UTILITY.FORMAT_ERROR_STACK);\n    DBMS_OUTPUT.PUT_LINE('Error Backtrace: ' || DBMS_UTILITY.FORMAT_ERROR_BACKTRACE);\n    RAISE;\nEND;\n/"}
                  isCode={true}
                />
                <PlSqlLearnSubcard
                  title="What happens during processing (Engine Behavior):"
                  content={"PRAGMA is a compiler directive resolved at compile time. DBMS_UTILITY.FORMAT_ERROR_BACKTRACE pinpoints the exact line number where the exception originally occurred, even if it was re-raised or passed across multiple procedure call frames."}
                />
                <PlSqlLearnSubcard
                  title="Performance, Pitfalls &amp; Best Practices:"
                  content={"Always log DBMS_UTILITY.FORMAT_ERROR_BACKTRACE when trapping unexpected exceptions in production error tables to locate the exact source line of failure."}
                  highlight={true}
                />
              </div>
            </PlSqlLearnCard>
          )}

        {/* Card 17: RAISE_APPLICATION_ERROR */}
        {(selectedModule === "all" || selectedModule === "exceptions") &&
          matchesSearch(["RAISE_APPLICATION_ERROR", "-20000", "Custom Error", "exceptions", "error codes"]) && (
            <PlSqlLearnCard
              id="sec-17"
              num="17"
              category="Exceptions"
              title="Custom Error Propagation: RAISE_APPLICATION_ERROR (-20000..-20999)"
              preview="Transmitting meaningful custom error codes and error descriptions back to client applications."
              isOpen={!!openCards["sec-17"]}
              onToggle={() => toggleCard("sec-17")}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <PlSqlLearnSubcard
                  title="What it does &amp; Functionality:"
                  content={"RAISE_APPLICATION_ERROR is a built-in procedure provided by package DBMS_STANDARD that allows developers to issue user-defined error messages from stored subprograms and triggers. It accepts an error code between -20000 and -20999 and a custom text message up to 2048 characters."}
                />
                <PlSqlLearnSubcard
                  title="Code Example &amp; Practical Implementation:"
                  content={"CREATE OR REPLACE PROCEDURE debit_customer_wallet(\n  p_wallet_id IN NUMBER,\n  p_amount    IN NUMBER\n) IS\n  v_current_bal NUMBER;\nBEGIN\n  -- Validation logic\n  IF p_amount <= 0 THEN\n    RAISE_APPLICATION_ERROR(-20001, 'Debit amount must be strictly greater than zero.');\n  END IF;\n\n  SELECT balance INTO v_current_bal FROM wallets WHERE wallet_id = p_wallet_id;\n\n  IF v_current_bal < p_amount THEN\n    -- Halt execution and bubble error back to API client / front-end\n    RAISE_APPLICATION_ERROR(-20002, 'Wallet balance ($' || v_current_bal || ') is insufficient for debit of $' || p_amount || '.');\n  END IF;\n\n  UPDATE wallets SET balance = balance - p_amount WHERE wallet_id = p_wallet_id;\nEXCEPTION\n  WHEN NO_DATA_FOUND THEN\n    RAISE_APPLICATION_ERROR(-20003, 'Specified wallet ID ' || p_wallet_id || ' does not exist.');\nEND debit_customer_wallet;\n/"}
                  isCode={true}
                />
                <PlSqlLearnSubcard
                  title="What happens during processing (Engine Behavior):"
                  content={"RAISE_APPLICATION_ERROR terminates the active PL/SQL subprogram, rolls back uncommitted changes up to the most recent savepoint or transaction boundary, and sends the custom ORA-20xxx code and error message directly to the calling client application (e.g. Node.js, Spring Boot, Python)."}
                />
                <PlSqlLearnSubcard
                  title="Performance, Pitfalls &amp; Best Practices:"
                  content={"Standardize error code allocations within your engineering team (e.g. -20000 to -20099 for Auth, -20100 to -20199 for Orders) to facilitate automated error handling on API gateways."}
                  highlight={true}
                />
              </div>
            </PlSqlLearnCard>
          )}

        {/* Card 18: DML Row & Statement Triggers */}
        {(selectedModule === "all" || selectedModule === "triggers") &&
          matchesSearch(["DML Trigger", "BEFORE", "AFTER", "FOR EACH ROW", ":NEW", ":OLD", "triggers", "INSERTING", "UPDATING", "DELETING"]) && (
            <PlSqlLearnCard
              id="sec-18"
              num="18"
              category="Triggers"
              title="DML Triggers: BEFORE/AFTER, Row-Level (:NEW &amp; :OLD) &amp; Predicates"
              preview="Automating business rules, audit trails, correlation identifiers, and conditional predicates."
              isOpen={!!openCards["sec-18"]}
              onToggle={() => toggleCard("sec-18")}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <PlSqlLearnSubcard
                  title="What it does &amp; Functionality:"
                  content={"A database trigger is a named PL/SQL block implicitly executed (fired) when a specific database event occurs. DML triggers fire on INSERT, UPDATE, or DELETE on a table or view. They can be statement-level (executing once for the entire DML statement) or row-level (FOR EACH ROW, executing for every affected row). Row-level triggers provide access to old and new column values via :OLD and :NEW."}
                />
                <PlSqlLearnSubcard
                  title="Code Example &amp; Practical Implementation:"
                  content={"CREATE OR REPLACE TRIGGER trg_audit_employees\nBEFORE INSERT OR UPDATE OR DELETE ON employees\nFOR EACH ROW\nBEGIN\n  -- Using conditional predicates\n  IF INSERTING THEN\n    :NEW.created_at := SYSDATE;\n    :NEW.created_by := USER;\n    :NEW.email := LOWER(:NEW.email);\n    \n  ELSIF UPDATING THEN\n    -- Prevent salary reduction\n    IF :NEW.salary < :OLD.salary THEN\n      RAISE_APPLICATION_ERROR(-20010, 'Employee salary cannot be reduced.');\n    END IF;\n    :NEW.updated_at := SYSDATE;\n\n  ELSIF DELETING THEN\n    -- Log deletion to audit archive table\n    INSERT INTO employee_audit_log (emp_id, old_salary, deleted_by, deleted_date)\n    VALUES (:OLD.employee_id, :OLD.salary, USER, SYSDATE);\n  END IF;\nEND trg_audit_employees;\n/"}
                  isCode={true}
                />
                <PlSqlLearnSubcard
                  title="What happens during processing (Engine Behavior):"
                  content={"BEFORE row triggers fire prior to writing the row to table data blocks, allowing in-place modification of :NEW fields. AFTER triggers fire after row constraints are verified and changes are applied. Statement triggers fire once regardless of how many rows are affected."}
                />
                <PlSqlLearnSubcard
                  title="Performance, Pitfalls &amp; Best Practices:"
                  content={"Keep triggers fast and concise. Complex triggers firing on high-throughput batch inserts can degrade DML performance significantly. Avoid heavy cross-table queries inside row triggers."}
                  highlight={true}
                />
              </div>
            </PlSqlLearnCard>
          )}

        {/* Card 19: Advanced Triggers: INSTEAD OF Views & Compound Triggers */}
        {(selectedModule === "all" || selectedModule === "triggers") &&
          matchesSearch(["INSTEAD OF", "Compound Trigger", "Mutating Table", "ORA-04091", "triggers", "views"]) && (
            <PlSqlLearnCard
              id="sec-19"
              num="19"
              category="Triggers"
              title="Advanced Triggers: INSTEAD OF Views &amp; Compound Triggers (Mutating Table ORA-04091)"
              preview="Making complex views updatable with INSTEAD OF, and avoiding mutating table errors with Compound Triggers."
              isOpen={!!openCards["sec-19"]}
              onToggle={() => toggleCard("sec-19")}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <PlSqlLearnSubcard
                  title="What it does &amp; Functionality:"
                  content={"INSTEAD OF triggers fire in place of DML operations on complex, non-updatable views (e.g. joins, aggregations), redirecting updates to base tables. Compound Triggers allow combining BEFORE STATEMENT, BEFORE EACH ROW, AFTER EACH ROW, and AFTER STATEMENT timing points into a single trigger with shared state variables, providing a clean solution to mutating table errors (ORA-04091)."}
                />
                <PlSqlLearnSubcard
                  title="Code Example &amp; Practical Implementation:"
                  content={"-- 1. INSTEAD OF Trigger on Joined View\nCREATE OR REPLACE TRIGGER trg_customer_orders_view\nINSTEAD OF INSERT ON v_customer_orders\nFOR EACH ROW\nDECLARE\n  v_cust_id NUMBER;\nBEGIN\n  INSERT INTO customers (customer_name) VALUES (:NEW.customer_name)\n  RETURNING customer_id INTO v_cust_id;\n  \n  INSERT INTO orders (customer_id, total_amount) VALUES (v_cust_id, :NEW.total_amount);\nEND;\n/\n\n-- 2. Compound Trigger (Resolves ORA-04091 mutating table errors)\nCREATE OR REPLACE TRIGGER trg_check_dept_salary_cap\nFOR INSERT OR UPDATE OF salary ON employees\nCOMPOUND TRIGGER\n  TYPE t_sal_list IS TABLE OF NUMBER INDEX BY PLS_INTEGER;\n  v_salaries t_sal_list;\n\n  AFTER EACH ROW IS\n  BEGIN\n    v_salaries(v_salaries.COUNT + 1) := :NEW.salary;\n  END AFTER EACH ROW;\n\n  AFTER STATEMENT IS\n  BEGIN\n    -- Validate entire statement batch safely without mutating table error\n    v_salaries.DELETE;\n  END AFTER STATEMENT;\nEND trg_check_dept_salary_cap;\n/"}
                  isCode={true}
                />
                <PlSqlLearnSubcard
                  title="What happens during processing (Engine Behavior):"
                  content={"Mutating table error ORA-04091 occurs when a row trigger attempts to query the very table that is currently undergoing DML. Compound triggers solve this because the AFTER STATEMENT section executes after all row changes have finished, when the table is no longer in a mutating state."}
                />
                <PlSqlLearnSubcard
                  title="Performance, Pitfalls &amp; Best Practices:"
                  content={"Compound triggers eliminate the clumsy legacy workaround of using package temporary tables to track modified rows, resulting in cleaner, faster, and thread-safe execution."}
                  highlight={true}
                />
              </div>
            </PlSqlLearnCard>
          )}

        {/* Card 20: Collections: Associative Arrays */}
        {(selectedModule === "all" || selectedModule === "collections") &&
          matchesSearch(["Associative Arrays", "INDEX BY", "PLS_INTEGER", "VARCHAR2", "Collections", "maps", "hash"]) && (
            <PlSqlLearnCard
              id="sec-20"
              num="20"
              category="Collections"
              title="Collections: Associative Arrays (INDEX BY PLS_INTEGER / VARCHAR2)"
              preview="In-memory key-value lookups, hash maps, sparse indexing, and built-in collection methods."
              isOpen={!!openCards["sec-20"]}
              onToggle={() => toggleCard("sec-20")}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <PlSqlLearnSubcard
                  title="What it does &amp; Functionality:"
                  content={"Associative arrays (formerly known as Index-by tables) are single-dimension in-memory key-value structures. Unlike arrays in C or Java, associative arrays are dynamic, unbounded, can be indexed by PLS_INTEGER or VARCHAR2 strings (hash map lookup), and require no constructor initialization or memory pre-allocation."}
                />
                <PlSqlLearnSubcard
                  title="Code Example &amp; Practical Implementation:"
                  content={"DECLARE\n  -- 1. Associative array indexed by integer (sparse list)\n  TYPE t_emp_salaries IS TABLE OF NUMBER INDEX BY PLS_INTEGER;\n  v_salaries t_emp_salaries;\n\n  -- 2. Associative array indexed by string (Key-Value Dictionary / Lookup Map)\n  TYPE t_config_map IS TABLE OF VARCHAR2(100) INDEX BY VARCHAR2(50);\n  v_config t_config_map;\n  v_key    VARCHAR2(50);\nBEGIN\n  -- Storing values\n  v_salaries(101) := 7500;\n  v_salaries(205) := 9200; -- Non-contiguous (sparse) index\n\n  v_config('db_host') := 'db-prod-01.internal';\n  v_config('timeout') := '30s';\n\n  -- Using built-in collection methods: EXISTS, COUNT, FIRST, NEXT, DELETE\n  IF v_salaries.EXISTS(101) THEN\n    DBMS_OUTPUT.PUT_LINE('Emp 101 Salary: $' || v_salaries(101));\n  END IF;\n\n  -- Iterating through string-keyed associative array\n  v_key := v_config.FIRST;\n  WHILE v_key IS NOT NULL LOOP\n    DBMS_OUTPUT.PUT_LINE('Config [' || v_key || '] = ' || v_config(v_key));\n    v_key := v_config.NEXT(v_key);\n  END LOOP;\n  \n  DBMS_OUTPUT.PUT_LINE('Total configs stored: ' || v_config.COUNT);\nEND;\n/"}
                  isCode={true}
                />
                <PlSqlLearnSubcard
                  title="What happens during processing (Engine Behavior):"
                  content={"Associative arrays exist solely in the session's Program Global Area (PGA) memory and cannot be stored persistently in database table columns. Lookups by string key use internal binary tree structures optimized for rapid key retrieval."}
                />
                <PlSqlLearnSubcard
                  title="Performance, Pitfalls &amp; Best Practices:"
                  content={"Associative arrays are the fastest choice for internal caching and translation maps within a single PL/SQL subprogram or package call because they incur zero memory allocation overhead."}
                  highlight={true}
                />
              </div>
            </PlSqlLearnCard>
          )}

        {/* Card 21: Collections: Nested Tables & VARRAYs */}
        {(selectedModule === "all" || selectedModule === "collections") &&
          matchesSearch(["Nested Tables", "VARRAY", "Collections", "EXTEND", "TABLE()", "constructors"]) && (
            <PlSqlLearnCard
              id="sec-21"
              num="21"
              category="Collections"
              title="Collections: Nested Tables &amp; Variable-Size Arrays (VARRAYs)"
              preview="Schema-level collections, constructors, EXTEND, and the TABLE() operator."
              isOpen={!!openCards["sec-21"]}
              onToggle={() => toggleCard("sec-21")}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <PlSqlLearnSubcard
                  title="What it does &amp; Functionality:"
                  content={"Nested Tables and VARRAYs are collection types that can be declared in PL/SQL or created as permanent schema objects in the database catalog (CREATE OR REPLACE TYPE). Nested Tables are unbounded and support multiset operations. VARRAYs (Variable-size Arrays) have a declared maximum size and preserve element order. Both require constructor initialization and use .EXTEND to allocate elements."}
                />
                <PlSqlLearnSubcard
                  title="Code Example &amp; Practical Implementation:"
                  content={"DECLARE\n  -- Nested Table declaration (unbounded)\n  TYPE t_names_list IS TABLE OF VARCHAR2(50);\n  v_names t_names_list := t_names_list(); -- Constructor initialization required\n\n  -- VARRAY declaration (bounded to maximum 5 elements)\n  TYPE t_phone_list IS VARRAY(5) OF VARCHAR2(20);\n  v_phones t_phone_list := t_phone_list('555-0101', '555-0102');\nBEGIN\n  -- Allocating new slots with EXTEND\n  v_names.EXTEND(2);\n  v_names(1) := 'Alice';\n  v_names(2) := 'Bob';\n\n  v_names.EXTEND;\n  v_names(3) := 'Charlie';\n\n  FOR i IN 1..v_names.COUNT LOOP\n    DBMS_OUTPUT.PUT_LINE('Name #' || i || ': ' || v_names(i));\n  END LOOP;\n\n  DBMS_OUTPUT.PUT_LINE('Phones count: ' || v_phones.COUNT || ' (Max capacity: ' || v_phones.LIMIT || ')');\nEND;\n/"}
                  isCode={true}
                />
                <PlSqlLearnSubcard
                  title="What happens during processing (Engine Behavior):"
                  content={"Nested tables can be stored in relational tables using nested table storage clauses. When queried, the TABLE() operator transforms a collection into a relational rowset that can be joined with other tables (e.g. SELECT * FROM TABLE(v_names))."}
                />
                <PlSqlLearnSubcard
                  title="Performance, Pitfalls &amp; Best Practices:"
                  content={"Always use .EXTEND in bulk when adding multiple items (e.g. v_list.EXTEND(100)) rather than calling .EXTEND(1) inside tight loops, which triggers repetitive memory reallocations."}
                  highlight={true}
                />
              </div>
            </PlSqlLearnCard>
          )}

        {/* Card 22: High-Performance Bulk Processing */}
        {(selectedModule === "all" || selectedModule === "advanced") &&
          matchesSearch(["BULK COLLECT", "FORALL", "SAVE EXCEPTIONS", "Performance", "Context Switching", "LIMIT"]) && (
            <PlSqlLearnCard
              id="sec-22"
              num="22"
              category="Performance"
              title="High Performance: BULK COLLECT &amp; FORALL (Context Switching Optimization)"
              preview="Eliminating engine context switches, batch fetching with LIMIT, and SAVE EXCEPTIONS."
              isOpen={!!openCards["sec-22"]}
              onToggle={() => toggleCard("sec-22")}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <PlSqlLearnSubcard
                  title="What it does &amp; Functionality:"
                  content={"Context switching between the PL/SQL procedural engine and the SQL database engine is the #1 performance bottleneck in procedural database programming. BULK COLLECT retrieves entire query result sets into collections in a single round-trip. FORALL passes entire batches of DML operations to the SQL engine simultaneously."}
                />
                <PlSqlLearnSubcard
                  title="Code Example &amp; Practical Implementation:"
                  content={"DECLARE\n  TYPE t_emp_ids IS TABLE OF employees.employee_id%TYPE;\n  TYPE t_salaries IS TABLE OF employees.salary%TYPE;\n\n  v_ids  t_emp_ids;\n  v_sals t_salaries;\n\n  CURSOR cur_staff IS SELECT employee_id, salary FROM employees;\nBEGIN\n  OPEN cur_staff;\n  LOOP\n    -- Bulk collect in chunks of 500 rows to bound PGA memory consumption\n    FETCH cur_staff BULK COLLECT INTO v_ids, v_sals LIMIT 500;\n    EXIT WHEN v_ids.COUNT = 0;\n\n    -- Batch update all 500 rows in a single engine context switch!\n    FORALL i IN 1..v_ids.COUNT SAVE EXCEPTIONS\n      UPDATE employees\n      SET salary = salary * 1.05\n      WHERE employee_id = v_ids(i);\n\n    COMMIT;\n  END LOOP;\n  CLOSE cur_staff;\n  DBMS_OUTPUT.PUT_LINE('Bulk update completed successfully.');\nEXCEPTION\n  WHEN OTHERS THEN\n    DBMS_OUTPUT.PUT_LINE('Bulk error trapped: ' || SQL%BULK_EXCEPTIONS.COUNT || ' failures.');\nEND;\n/"}
                  isCode={true}
                />
                <PlSqlLearnSubcard
                  title="What happens during processing (Engine Behavior):"
                  content={"Instead of switching back and forth 10,000 times between the PL/SQL runtime engine and the SQL engine (row-by-row / 'slow-by-slow'), BULK COLLECT with FORALL transfers array buffers in bulk, commonly resulting in 10x to 50x speedups."}
                />
                <PlSqlLearnSubcard
                  title="Performance, Pitfalls &amp; Best Practices:"
                  content={"Always specify a reasonable LIMIT clause (e.g. LIMIT 100 to 1000) when using BULK COLLECT with queries that may return millions of rows. Omitting LIMIT can exhaust PGA server memory (ORA-04030)."}
                  highlight={true}
                />
              </div>
            </PlSqlLearnCard>
          )}

        {/* Card 23: Dynamic SQL: Native Dynamic SQL */}
        {(selectedModule === "all" || selectedModule === "advanced") &&
          matchesSearch(["Dynamic SQL", "EXECUTE IMMEDIATE", "OPEN FOR", "USING", "Bind Variables", "NDS"]) && (
            <PlSqlLearnCard
              id="sec-23"
              num="23"
              category="Dynamic SQL"
              title="Dynamic SQL: EXECUTE IMMEDIATE, Bind Variables &amp; OPEN-FOR-USING"
              preview="Constructing and executing dynamic SQL and DDL statements safely at runtime."
              isOpen={!!openCards["sec-23"]}
              onToggle={() => toggleCard("sec-23")}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <PlSqlLearnSubcard
                  title="What it does &amp; Functionality:"
                  content={"Native Dynamic SQL (NDS) allows executing SQL statements constructed dynamically at runtime as strings. It is necessary for executing DDL commands (which cannot be written statically in PL/SQL), building flexible search filters, or querying tables whose names are unknown until runtime. Values are bound securely using the USING clause."}
                />
                <PlSqlLearnSubcard
                  title="Code Example &amp; Practical Implementation:"
                  content={"DECLARE\n  v_table_name  VARCHAR2(30) := 'EMPLOYEES';\n  v_dept_id     NUMBER := 20;\n  v_emp_count   NUMBER;\n  v_dyn_sql     VARCHAR2(1000);\n  \n  -- Dynamic cursor variable\n  v_cur SYS_REFCURSOR;\n  v_name VARCHAR2(100);\nBEGIN\n  -- 1. Dynamic query with bind variable and INTO clause\n  v_dyn_sql := 'SELECT COUNT(*) FROM ' || DBMS_ASSERT.ENQUOTE_NAME(v_table_name) || ' WHERE department_id = :dept';\n  EXECUTE IMMEDIATE v_dyn_sql INTO v_emp_count USING v_dept_id;\n  DBMS_OUTPUT.PUT_LINE('Dynamic count: ' || v_emp_count);\n\n  -- 2. Dynamic DDL execution (DDL cannot be run statically in PL/SQL)\n  EXECUTE IMMEDIATE 'CREATE TABLE temp_session_log (log_msg VARCHAR2(255), logged_at DATE)';\n  EXECUTE IMMEDIATE 'DROP TABLE temp_session_log';\n\n  -- 3. Dynamic multi-row cursor\n  OPEN v_cur FOR 'SELECT first_name FROM employees WHERE department_id = :d' USING v_dept_id;\n  FETCH v_cur INTO v_name;\n  DBMS_OUTPUT.PUT_LINE('First fetched via dynamic cursor: ' || v_name);\n  CLOSE v_cur;\nEND;\n/"}
                  isCode={true}
                />
                <PlSqlLearnSubcard
                  title="What happens during processing (Engine Behavior):"
                  content={"Dynamic SQL statements are parsed and planned at runtime rather than compile time. Using bind variables with USING allows the database shared pool to reuse execution plans (cursor sharing), preventing hard parses."}
                />
                <PlSqlLearnSubcard
                  title="Performance, Pitfalls &amp; Best Practices:"
                  content={"Always use bind variables (:param) with USING for dynamic filter values rather than concatenating user input into the string. This prevents SQL injection vulnerabilities and prevents Shared Pool library cache exhaustion."}
                  highlight={true}
                />
              </div>
            </PlSqlLearnCard>
          )}

        {/* Card 24: Autonomous Transactions & Security */}
        {(selectedModule === "all" || selectedModule === "advanced") &&
          matchesSearch(["Autonomous Transactions", "PRAGMA AUTONOMOUS_TRANSACTION", "AUTHID", "CURRENT_USER", "DEFINER", "Security"]) && (
            <PlSqlLearnCard
              id="sec-24"
              num="24"
              category="Architecture &amp; Security"
              title="Advanced Architecture: Autonomous Transactions &amp; Invoker Rights (AUTHID)"
              preview="Independent transaction scope (PRAGMA AUTONOMOUS_TRANSACTION) and Definer vs Invoker rights."
              isOpen={!!openCards["sec-24"]}
              onToggle={() => toggleCard("sec-24")}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <PlSqlLearnSubcard
                  title="What it does &amp; Functionality:"
                  content={"PRAGMA AUTONOMOUS_TRANSACTION enables a subprogram to execute its own independent transaction: it can COMMIT or ROLLBACK without affecting the parent calling transaction. This is essential for error audit logging. The AUTHID clause determines execution privileges: AUTHID DEFINER (default) executes with the package owner's rights, while AUTHID CURRENT_USER executes with the caller's rights and schema resolution."}
                />
                <PlSqlLearnSubcard
                  title="Code Example &amp; Practical Implementation:"
                  content={"-- Autonomous audit logging procedure\nCREATE OR REPLACE PROCEDURE log_system_event(\n  p_module  IN VARCHAR2,\n  p_message IN VARCHAR2\n) \nAUTHID DEFINER -- Runs with owner rights\nIS\n  PRAGMA AUTONOMOUS_TRANSACTION; -- Independent transaction boundary\nBEGIN\n  INSERT INTO system_audit_logs (module_name, message_text, logged_at, db_user)\n  VALUES (p_module, p_message, SYSDATE, USER);\n  \n  -- Commits ONLY the audit record; parent transaction remains completely uncommitted!\n  COMMIT;\nEND log_system_event;\n/\n\n-- Caller Demonstration:\nBEGIN\n  UPDATE accounts SET balance = balance - 1000 WHERE account_id = 99;\n  \n  -- Even if the main transaction rolls back, this audit log remains committed!\n  log_system_event('TRANSFER', 'Deducted $1000 from Account 99');\n  \n  -- Simulating failure and rollback in parent transaction\n  ROLLBACK;\n  DBMS_OUTPUT.PUT_LINE('Parent transaction rolled back, but audit log was safely committed!');\nEND;\n/"}
                  isCode={true}
                />
                <PlSqlLearnSubcard
                  title="What happens during processing (Engine Behavior):"
                  content={"When an autonomous transaction begins, the Oracle engine suspends the parent transaction's locks and undo segments, switches to a new transaction context, executes the autonomous block to its COMMIT or ROLLBACK, and seamlessly resumes the parent transaction context."}
                />
                <PlSqlLearnSubcard
                  title="Performance, Pitfalls &amp; Best Practices:"
                  content={"Every autonomous transaction must end with an explicit COMMIT or ROLLBACK; failing to do so causes runtime error ORA-06519 (active autonomous transaction detected and rolled back)."}
                  highlight={true}
                />
              </div>
            </PlSqlLearnCard>
          )}

        {/* Card 25: REFERENCES & YOUTUBE VIDEO EMBED */}
        {(selectedModule === "all" || selectedModule === "references") &&
          matchesSearch(["references & youtube video embed", "media & bibliography", "references", "youtube", "textbooks", "bibliography", "video"]) && (
            <PlSqlLearnCard
              id="sec-25"
              num="25"
              category="Media &amp; Bibliography"
              title="REFERENCES &amp; YOUTUBE VIDEO EMBED"
              preview="Authoritative academic textbooks, Oracle documentation, language specifications, and embedded PL/SQL full course video."
              isOpen={!!openCards["sec-25"]}
              onToggle={() => toggleCard("sec-25")}
            >
              <ol className="list-decimal list-inside space-y-2.5 text-xs sm:text-sm leading-relaxed opacity-90 pl-1" style={{ color: "var(--foreground)" }}>
                <li>
                  Feuerstein, S., &amp; Pribyl, B. (2014). <em>Oracle PL/SQL Programming</em> (6th ed.). O&apos;Reilly Media.
                </li>
                <li>
                  Oracle Corporation. (2023). <em>Database PL/SQL Language Reference, 19c &amp; 23c</em>. Oracle Help Center Documentation.
                </li>
                <li>
                  McLaughlin, M. (2016). <em>Oracle Database 12c PL/SQL Advanced Programming Techniques</em>. McGraw-Hill Education / Oracle Press.
                </li>
                <li>
                  Silberschatz, A., Korth, H. F., &amp; Sudarshan, S. (2020). <em>Database System Concepts</em> (7th ed., Chapter on Stored Procedures, Functions &amp; Triggers). McGraw-Hill Education.
                </li>
                <li>
                  Casteel, J. (2015). <em>Oracle 12c: SQL &amp; PL/SQL Comprehensive</em>. Cengage Learning.
                </li>
                <li>
                  Urman, S., &amp; Smith, R. (1997). <em>Oracle PL/SQL Programming</em>. Osborne McGraw-Hill.
                </li>
                <li>
                  Price, J. (2007). <em>Oracle Database 11g SQL &amp; PL/SQL: The Complete Reference</em>. McGraw-Hill Osborne Media.
                </li>
              </ol>

              <div
                className="relative w-full aspect-video rounded-xl overflow-hidden border shadow-lg bg-black/40"
                style={{ borderColor: "var(--border)" }}
              >
                <iframe
                  className="w-full h-full"
                  src="https://www.youtube.com/embed/9ic3KEH4Ah4?si=ViOKoT54ZYPQz-ZZ"
                  title="Oracle PL/SQL Full Course Tutorial for Beginners"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                />
              </div>
            </PlSqlLearnCard>
          )}
      </div>
    </main>
  );
}
