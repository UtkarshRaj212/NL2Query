"use client";

import { useState } from "react";
import type { QueryExplanation } from "@/lib/queryExplainer";
import type { RelationalAlgebraPart } from "@/lib/relationalAlgebra";

interface QueryExplanationViewProps {
  explanation: QueryExplanation | null;
  hasExecuted: boolean;
}

export function QueryExplanationView({
  explanation,
  hasExecuted,
}: QueryExplanationViewProps) {
  const [notationFormat, setNotationFormat] = useState<"math" | "ascii" | "latex">("math");
  const [copiedNotation, setCopiedNotation] = useState(false);
  const [expandedComponents, setExpandedComponents] = useState<Record<number, boolean>>({});

  const isComponentExpanded = (idx: number) => {
    if (expandedComponents[idx] !== undefined) {
      return expandedComponents[idx];
    }
    return idx === 0; // Default first part expanded for preview
  };

  const toggleComponent = (idx: number) => {
    setExpandedComponents((prev) => ({
      ...prev,
      [idx]: !isComponentExpanded(idx),
    }));
  };

  if (!hasExecuted || !explanation) {
    return (
      <div
        className="panel p-8 rounded-xl border text-center flex flex-col items-center justify-center min-h-80 space-y-3"
        style={{
          background: "var(--panel)",
          borderColor: "var(--border)",
          color: "var(--foreground)",
        }}
        aria-label="No query explanation placeholder"
      >
        <div
          className="w-12 h-12 rounded-full border flex items-center justify-center mb-1"
          style={{
            background: "var(--surface-subtle)",
            borderColor: "var(--border)",
            color: "var(--muted)",
          }}
        >
          <svg className="w-6 h-6 opacity-70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h3 className="text-base md:text-lg font-bold" style={{ color: "var(--foreground)" }}>
          No query has been executed yet.
        </h3>
        <p className="text-xs md:text-sm opacity-80 max-w-md leading-relaxed" style={{ color: "var(--muted)" }}>
          Execute a natural-language or SQL query to inspect its step-by-step relational algebra decomposition, execution pipeline, and mathematical logic.
        </p>
      </div>
    );
  }

  const ra = explanation.relationalAlgebra;

  const currentFormula =
    notationFormat === "math"
      ? ra?.formula || explanation.sql
      : notationFormat === "ascii"
      ? ra?.asciiFormula || explanation.sql
      : ra?.latexFormula || explanation.sql;

  const handleCopyFormula = () => {
    navigator.clipboard.writeText(currentFormula);
    setCopiedNotation(true);
    setTimeout(() => setCopiedNotation(false), 2000);
  };

  return (
    <div className="space-y-6" aria-label="Detailed Query Explanation">
      {/* 1. Header & Executed SQL */}
      <div
        className="panel p-5 md:p-6 rounded-2xl border space-y-3.5 shadow-sm"
        style={{
          background: "var(--panel)",
          borderColor: "var(--border)",
          color: "var(--foreground)",
        }}
      >
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <span
              className="text-xs font-bold px-2.5 py-1 rounded-md border tracking-wide uppercase"
              style={{
                background: "var(--surface-subtle)",
                borderColor: "var(--accent)",
                color: "var(--accent)",
              }}
            >
              {explanation.statementType} Query
            </span>
            <h2 className="font-bold text-base md:text-lg tracking-tight" style={{ color: "var(--foreground)" }}>
              Executed SQL Query
            </h2>
          </div>
          <span className="text-xs sm:text-sm opacity-80 font-mono font-medium" style={{ color: "var(--muted)" }}>
            {explanation.finalOutputSummary.rowCount} row{explanation.finalOutputSummary.rowCount !== 1 ? "s" : ""} returned
          </span>
        </div>

        <pre
          className="p-4 rounded-xl border text-sm md:text-base font-mono whitespace-pre-wrap break-words leading-relaxed"
          style={{
            background: "var(--surface-subtle)",
            borderColor: "var(--border)",
            color: "var(--foreground)",
          }}
        >
          {explanation.sql}
        </pre>

        <p className="text-sm md:text-base opacity-90 leading-relaxed pt-0.5" style={{ color: "var(--foreground)" }}>
          {explanation.summary}
        </p>
      </div>

      {/* 2. Primary Relational Algebra Section with Deep Component Breakdown */}
      {ra && (
        <section
          className="panel p-5 md:p-6 rounded-2xl border space-y-5 shadow-sm"
          style={{
            background: "var(--panel)",
            borderColor: "var(--border)",
            color: "var(--foreground)",
          }}
          aria-label="Relational algebra equivalence and component breakdown"
        >
          {/* Section Header */}
          <div className="flex flex-wrap items-center justify-between gap-4 border-b pb-4" style={{ borderColor: "var(--border)" }}>
            <div className="flex items-center gap-3.5">
              <span
                className="w-10 h-10 rounded-xl border flex items-center justify-center font-serif text-xl font-bold select-none shrink-0 shadow-xs"
                style={{
                  background: "var(--surface-subtle)",
                  borderColor: "var(--accent)",
                  color: "var(--accent)",
                }}
              >
                π
              </span>
              <div>
                <h3 className="font-bold text-base md:text-xl tracking-tight" style={{ color: "var(--foreground)" }}>
                  Relational Algebra Equivalence
                </h3>
                <p className="text-xs md:text-sm text-zinc-400 font-medium mt-0.5" style={{ color: "var(--muted)" }}>
                  Codd&apos;s relational algebra &amp; procedural first-order logic translation
                </p>
              </div>
            </div>

            {/* Format selector tabs & copy button */}
            <div className="flex items-center gap-1.5 bg-[var(--surface-subtle)] p-1.5 rounded-xl border" style={{ borderColor: "var(--border)" }}>
              <button
                id="ra-format-math"
                type="button"
                onClick={() => setNotationFormat("math")}
                className={`px-3 py-1.5 text-xs sm:text-sm rounded-lg font-semibold transition-all ${
                  notationFormat === "math"
                    ? "bg-[var(--panel)] font-bold text-[var(--accent)] shadow-xs"
                    : "opacity-75 hover:opacity-100"
                }`}
                title="Display in Unicode mathematical symbols (π, σ, ⋈, etc.)"
              >
                Standard (Math)
              </button>
              <button
                id="ra-format-ascii"
                type="button"
                onClick={() => setNotationFormat("ascii")}
                className={`px-3 py-1.5 text-xs sm:text-sm rounded-lg font-semibold transition-all ${
                  notationFormat === "ascii"
                    ? "bg-[var(--panel)] font-bold text-[var(--accent)] shadow-xs"
                    : "opacity-75 hover:opacity-100"
                }`}
                title="Display in clean plain-text ASCII format"
              >
                ASCII
              </button>
              <button
                id="ra-format-latex"
                type="button"
                onClick={() => setNotationFormat("latex")}
                className={`px-3 py-1.5 text-xs sm:text-sm rounded-lg font-semibold transition-all ${
                  notationFormat === "latex"
                    ? "bg-[var(--panel)] font-bold text-[var(--accent)] shadow-xs"
                    : "opacity-75 hover:opacity-100"
                }`}
                title="Display in LaTeX equation code"
              >
                LaTeX
              </button>
              <button
                id="copy-ra-formula-btn"
                type="button"
                onClick={handleCopyFormula}
                className="ml-1 px-3 py-1.5 text-xs sm:text-sm font-mono font-semibold rounded-lg border hover:bg-[var(--panel)] transition-all flex items-center gap-1.5"
                style={{ borderColor: "var(--border)", color: "var(--foreground)" }}
                title="Copy current expression to clipboard"
              >
                {copiedNotation ? (
                  <span className="text-emerald-500 font-bold">Copied!</span>
                ) : (
                  <span>Copy</span>
                )}
              </button>
            </div>
          </div>

          {/* Master Formula Box */}
          <div
            className="p-4 sm:p-5 rounded-2xl border space-y-3"
            style={{
              background: "var(--surface-subtle)",
              borderColor: "var(--border)",
            }}
          >
            <div className="flex items-center justify-between text-xs sm:text-sm font-mono font-semibold tracking-wider" style={{ color: "var(--muted)" }}>
              <span>COMPOSED RELATIONAL EXPRESSION</span>
              <span>{ra.components.length} Operator{ra.components.length !== 1 ? "s" : ""} Composed</span>
            </div>
            <pre
              className="p-4 sm:p-5 rounded-xl border font-mono text-base sm:text-lg md:text-xl font-bold overflow-x-auto whitespace-pre-wrap leading-relaxed tracking-wide shadow-inner"
              style={{
                background: "var(--panel)",
                borderColor: "var(--border)",
                color: "var(--foreground)",
              }}
            >
              {currentFormula}
            </pre>
            <p className="text-xs sm:text-sm opacity-90 leading-relaxed pt-1" style={{ color: "var(--foreground)" }}>
              {ra.summary}
            </p>
          </div>

          {/* Inside-Out Execution Pipeline Chips */}
          {ra.evaluationPipeline && ra.evaluationPipeline.length > 0 && (
            <div className="space-y-2 pt-1">
              <span className="text-xs sm:text-sm font-bold tracking-tight opacity-80 block" style={{ color: "var(--muted)" }}>
                Inside-Out Evaluation Pipeline (Evaluation Order):
              </span>
              <div className="flex flex-wrap items-center gap-2">
                {ra.evaluationPipeline.map((p, pIdx) => (
                  <div key={p.step} className="flex items-center gap-2">
                    <span
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-mono font-medium border shadow-xs"
                      style={{
                        background: "var(--surface-subtle)",
                        borderColor: "var(--border)",
                        color: "var(--foreground)",
                      }}
                      title={p.description}
                    >
                      <strong className="font-bold" style={{ color: "var(--foreground)" }}>{p.step}.</strong>
                      <span style={{ color: "var(--foreground)" }}>{p.operator}</span>
                    </span>
                    {pIdx < ra.evaluationPipeline.length - 1 && (
                      <span className="text-sm opacity-60 font-bold px-0.5">➔</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Dissection of Each Part of the Relational Algebra */}
          <div className="space-y-4 pt-3 border-t" style={{ borderColor: "var(--border)" }}>
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <h4 className="font-bold text-base md:text-lg tracking-tight flex items-baseline gap-2 flex-wrap" style={{ color: "var(--foreground)" }}>
                <span>Dissection of Each Part of the Algebra</span>
                <span className="text-xs sm:text-sm font-normal opacity-75">
                  (Detailed examination of operators, subscripts, operands &amp; rules)
                </span>
              </h4>
              <div className="flex items-center gap-2.5">
                <span className="text-xs font-mono opacity-70" style={{ color: "var(--muted)" }}>
                  Click any part to inspect its set-theoretic semantics
                </span>
                {ra.components.length > 1 && (
                  <button
                    type="button"
                    onClick={() => {
                      const allCurrentlyExpanded = ra.components.every((_, idx) => isComponentExpanded(idx));
                      const nextState = !allCurrentlyExpanded;
                      const nextMap: Record<number, boolean> = {};
                      ra.components.forEach((_, idx) => {
                        nextMap[idx] = nextState;
                      });
                      setExpandedComponents(nextMap);
                    }}
                    className="text-xs font-semibold px-2.5 py-1 rounded-md border hover:bg-[var(--surface-subtle)] transition-colors cursor-pointer"
                    style={{ borderColor: "var(--border)", color: "var(--foreground)" }}
                    title="Toggle all dissection cards"
                  >
                    {ra.components.every((_, idx) => isComponentExpanded(idx)) ? "Collapse All ▲" : "Expand All ▼"}
                  </button>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {ra.components.map((part, cIdx) => {
                const isExpanded = isComponentExpanded(cIdx);
                return (
                  <div
                    key={cIdx}
                    className="p-4 sm:p-5 rounded-2xl border transition-all space-y-3.5 hover:border-[var(--accent)]"
                    style={{
                      background: isExpanded ? "var(--surface-subtle)" : "var(--panel)",
                      borderColor: isExpanded ? "var(--accent)" : "var(--border)",
                    }}
                  >
                    {/* Part Header (Clickable toggle) */}
                    <div
                      className="flex flex-wrap items-center justify-between gap-3 cursor-pointer select-none"
                      onClick={() => toggleComponent(cIdx)}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          toggleComponent(cIdx);
                        }
                      }}
                      aria-expanded={isExpanded}
                    >
                      <div className="flex items-center gap-3">
                        <span
                          className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl flex items-center justify-center font-serif text-xl sm:text-2xl font-bold border shrink-0 shadow-xs"
                          style={{
                            background: "var(--surface-subtle)",
                            borderColor: "var(--border)",
                            color: "var(--accent)",
                          }}
                        >
                          {part.symbol}
                        </span>
                        <div>
                          <div className="flex items-center gap-2.5 flex-wrap">
                            <span className="font-bold text-base sm:text-lg tracking-tight" style={{ color: "var(--foreground)" }}>
                              Part {cIdx + 1}: {part.name}
                            </span>
                            <span
                              className="text-xs px-2.5 py-0.5 rounded-md font-mono font-semibold border"
                              style={{
                                background: "var(--surface-subtle)",
                                borderColor: "var(--border)",
                                color: "var(--muted)",
                              }}
                            >
                              {part.category}
                            </span>
                          </div>
                          <span className="text-xs sm:text-sm font-mono font-semibold text-[var(--accent)] mt-0.5 block">
                            Subscript: {part.subscript}
                          </span>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleComponent(cIdx);
                        }}
                        className="text-xs sm:text-sm font-mono font-medium opacity-85 hover:opacity-100 underline focus:outline-none cursor-pointer"
                        style={{ color: "var(--foreground)" }}
                      >
                        {isExpanded ? "Collapse Details ▲" : "Inspect Semantics ▼"}
                      </button>
                    </div>

                    {/* Quick Explanation */}
                    <p className="text-sm sm:text-base opacity-90 leading-relaxed" style={{ color: "var(--foreground)" }}>
                      {part.mathematicalRole}
                    </p>

                    {/* Four-Part Deep Architectural Grid + Optimization law: ONLY shown when expanded! */}
                    {isExpanded && (
                      <div className="space-y-3.5 pt-1">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                          {/* 1. Subscript Part */}
                          <div
                            className="p-3.5 sm:p-4 rounded-xl border space-y-2"
                            style={{
                              background: "var(--surface-subtle)",
                              borderColor: "var(--border)",
                            }}
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-bold uppercase tracking-wider text-xs sm:text-sm text-[var(--accent)]">
                                1. Subscript / Parameter Part
                              </span>
                              <span className="font-mono text-xs sm:text-sm opacity-75 font-medium">Argument</span>
                            </div>
                            <div
                              className="font-mono font-bold text-sm sm:text-base px-3 py-2 rounded-lg bg-[var(--panel)] border break-words leading-relaxed"
                              style={{ borderColor: "var(--border)", color: "var(--foreground)" }}
                            >
                              {part.subscript}
                            </div>
                            <p className="text-xs sm:text-sm opacity-85 leading-relaxed" style={{ color: "var(--foreground)" }}>
                              {part.subscriptExplanation}
                            </p>
                          </div>

                          {/* 2. Input Relation Part */}
                          <div
                            className="p-3.5 sm:p-4 rounded-xl border space-y-2"
                            style={{
                              background: "var(--surface-subtle)",
                              borderColor: "var(--border)",
                            }}
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-bold uppercase tracking-wider text-xs sm:text-sm text-[var(--accent)]">
                                2. Input Operand Part
                              </span>
                              <span className="font-mono text-xs sm:text-sm opacity-75 font-medium">Relation R</span>
                            </div>
                            <div
                              className="font-mono font-bold text-sm sm:text-base px-3 py-2 rounded-lg bg-[var(--panel)] border break-words leading-relaxed"
                              style={{ borderColor: "var(--border)", color: "var(--foreground)" }}
                            >
                              {part.inputOperand}
                            </div>
                            <p className="text-xs sm:text-sm opacity-85 leading-relaxed" style={{ color: "var(--foreground)" }}>
                              {part.inputExplanation}
                            </p>
                          </div>

                          {/* 3. Output Relation Part */}
                          <div
                            className="p-3.5 sm:p-4 rounded-xl border space-y-2"
                            style={{
                              background: "var(--surface-subtle)",
                              borderColor: "var(--border)",
                            }}
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-bold uppercase tracking-wider text-xs sm:text-sm text-[var(--accent)]">
                                3. Output Result Part
                              </span>
                              <span className="font-mono text-xs sm:text-sm opacity-75 font-medium">Transformed R&apos;</span>
                            </div>
                            <div
                              className="font-mono font-bold text-sm sm:text-base px-3 py-2 rounded-lg bg-[var(--panel)] border break-words leading-relaxed"
                              style={{ borderColor: "var(--border)", color: "var(--foreground)" }}
                            >
                              {part.outputResult}
                            </div>
                            <p className="text-xs sm:text-sm opacity-85 leading-relaxed" style={{ color: "var(--foreground)" }}>
                              {part.outputExplanation}
                            </p>
                          </div>

                          {/* 4. Formal Definition Part */}
                          <div
                            className="p-3.5 sm:p-4 rounded-xl border space-y-2"
                            style={{
                              background: "var(--surface-subtle)",
                              borderColor: "var(--border)",
                            }}
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-bold uppercase tracking-wider text-xs sm:text-sm text-[var(--accent)]">
                                4. Formal Set-Theoretic Definition
                              </span>
                              <span className="font-mono text-xs sm:text-sm opacity-75 font-medium">First-Order Logic</span>
                            </div>
                            <div
                              className="font-mono font-bold text-sm sm:text-base px-3 py-2 rounded-lg bg-[var(--panel)] border break-words leading-relaxed"
                              style={{ borderColor: "var(--border)", color: "var(--foreground)" }}
                            >
                              {part.formalDefinition}
                            </div>
                            <p className="text-xs sm:text-sm opacity-85 leading-relaxed" style={{ color: "var(--foreground)" }}>
                              Defines relational transformation using propositional calculus over tuple spaces.
                            </p>
                          </div>
                        </div>

                        {/* Optimization law (Expanded View) */}
                        {part.optimizationRule && (
                          <div
                            className="p-3.5 rounded-xl border text-xs sm:text-sm flex items-start gap-2.5 leading-relaxed"
                            style={{
                              background: "var(--panel)",
                              borderColor: "var(--border)",
                            }}
                          >
                            <span className="font-bold text-[var(--accent)] shrink-0 text-xs sm:text-sm">Optimization Law:</span>
                            <span className="opacity-90" style={{ color: "var(--foreground)" }}>
                              {part.optimizationRule}
                            </span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* 3. Step-by-Step Relational Execution Breakdown */}
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b pb-3" style={{ borderColor: "var(--border)" }}>
          <h3 className="font-bold text-base md:text-lg tracking-tight" style={{ color: "var(--foreground)" }}>
            Step-by-Step Relational Execution Breakdown
          </h3>
          <span className="text-xs sm:text-sm opacity-75 font-mono font-medium" style={{ color: "var(--muted)" }}>
            {explanation.steps.length} execution step{explanation.steps.length !== 1 ? "s" : ""}
          </span>
        </div>

        {explanation.steps.map((st) => (
          <div
            key={st.stepNumber}
            className="panel p-5 rounded-2xl border space-y-4 shadow-xs"
            style={{
              background: "var(--panel)",
              borderColor: "var(--border)",
            }}
          >
            <div className="flex flex-wrap items-center justify-between gap-3 border-b pb-3" style={{ borderColor: "var(--border)" }}>
              <div className="flex items-center gap-2.5 flex-wrap">
                <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-md bg-[var(--surface-subtle)] text-[var(--accent)] border border-[var(--border)]">
                  STEP {st.stepNumber} — {st.clause}
                </span>
                <h4 className="font-bold text-base sm:text-lg" style={{ color: "var(--foreground)" }}>
                  {st.title}
                </h4>
              </div>
            </div>

            <p className="text-sm sm:text-base opacity-90 leading-relaxed" style={{ color: "var(--foreground)" }}>
              {st.description}
            </p>

            {/* Relational Algebra Box for this specific Step */}
            {st.algebra && (
              <div
                className="p-4 rounded-xl border space-y-2.5"
                style={{
                  background: "var(--surface-subtle)",
                  borderColor: "var(--border)",
                }}
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <span
                      className="w-7 h-7 rounded-lg flex items-center justify-center font-serif font-bold text-sm border shadow-xs"
                      style={{
                        background: "var(--panel)",
                        borderColor: "var(--border)",
                        color: "var(--accent)",
                      }}
                    >
                      {st.algebra.symbol}
                    </span>
                    <span className="font-bold text-sm sm:text-base" style={{ color: "var(--foreground)" }}>
                      Algebraic Part: {st.algebra.name}
                    </span>
                  </div>
                  <span className="font-mono text-xs sm:text-sm text-[var(--accent)] font-semibold">
                    {st.algebra.formalDefinition}
                  </span>
                </div>

                {/* Subscript & Input/Output explanation chips */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
                  <div className="p-3 rounded-lg bg-[var(--panel)] border text-xs sm:text-sm space-y-1" style={{ borderColor: "var(--border)" }}>
                    <span className="opacity-60 block font-semibold text-xs">Parameter / Subscript:</span>
                    <span className="font-mono font-bold block break-words text-xs sm:text-sm" style={{ color: "var(--foreground)" }}>
                      {st.algebra.subscript}
                    </span>
                    <span className="opacity-80 block text-xs leading-relaxed" style={{ color: "var(--foreground)" }}>
                      {st.algebra.subscriptExplanation}
                    </span>
                  </div>
                  <div className="p-3 rounded-lg bg-[var(--panel)] border text-xs sm:text-sm space-y-1" style={{ borderColor: "var(--border)" }}>
                    <span className="opacity-60 block font-semibold text-xs">Input Relation:</span>
                    <span className="font-mono font-bold block break-words text-xs sm:text-sm" style={{ color: "var(--foreground)" }}>
                      {st.algebra.inputOperand}
                    </span>
                    <span className="opacity-80 block text-xs leading-relaxed">
                      {st.algebra.inputExplanation}
                    </span>
                  </div>
                  <div className="p-3 rounded-lg bg-[var(--panel)] border text-xs sm:text-sm space-y-1" style={{ borderColor: "var(--border)" }}>
                    <span className="opacity-60 block font-semibold text-xs">Output Relation:</span>
                    <span className="font-mono font-bold block break-words text-xs sm:text-sm" style={{ color: "var(--foreground)" }}>
                      {st.algebra.outputResult}
                    </span>
                    <span className="opacity-80 block text-xs leading-relaxed">
                      {st.algebra.outputExplanation}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Metrics pills */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
              {st.metrics.map((m, mIdx) => (
                <div
                  key={mIdx}
                  className="p-3 rounded-xl border"
                  style={{
                    background: "var(--surface-subtle)",
                    borderColor: "var(--border)",
                  }}
                >
                  <span className="text-xs opacity-75 block font-medium" style={{ color: "var(--muted)" }}>
                    {m.label}
                  </span>
                  <span className="font-mono font-bold text-sm sm:text-base mt-0.5 block" style={{ color: "var(--foreground)" }}>
                    {m.value}
                  </span>
                </div>
              ))}
            </div>

            {/* Sample Table Rows if applicable */}
            {st.sampleRows && st.sampleRows.length > 0 && st.columns && st.columns.length > 0 && (
              <div className="pt-1 space-y-2">
                <span className="text-xs sm:text-sm font-semibold opacity-75 block" style={{ color: "var(--muted)" }}>
                  Working Relation Snapshot ({st.sampleRows.length} sample row{st.sampleRows.length !== 1 ? "s" : ""}):
                </span>
                <div className="overflow-x-auto rounded-xl border" style={{ borderColor: "var(--border)" }}>
                  <table className="text-xs sm:text-sm w-full border-collapse">
                    <thead>
                      <tr style={{ background: "var(--surface-subtle)" }}>
                        {st.columns.map((c) => (
                          <th
                            key={c}
                            className="text-left px-3 py-2 border-b font-mono font-bold"
                            style={{ borderColor: "var(--border)", color: "var(--foreground)" }}
                          >
                            {c}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {st.sampleRows.map((r, rIdx) => (
                        <tr key={rIdx} className="hover:opacity-90">
                          {st.columns!.map((c) => (
                            <td
                              key={c}
                              className="px-3 py-2 border-b font-mono"
                              style={{ borderColor: "var(--border)", color: "var(--foreground)" }}
                            >
                              {String(r[c] ?? "")}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* 4. Execution Pipeline Connection */}
      {explanation.pipelineConnection?.length > 0 && (
        <div
          className="panel p-5 md:p-6 rounded-2xl border space-y-3.5"
          style={{
            background: "var(--panel)",
            borderColor: "var(--border)",
            color: "var(--foreground)",
          }}
        >
          <div className="flex items-center gap-2.5">
            <span
              className="text-xs font-mono font-bold px-2.5 py-1 rounded-md border"
              style={{
                background: "var(--surface-subtle)",
                borderColor: "var(--accent)",
                color: "var(--accent)",
              }}
            >
              Pipeline
            </span>
            <h3 className="font-bold text-base md:text-lg tracking-tight" style={{ color: "var(--foreground)" }}>
              Physical Engine Pipeline Stages
            </h3>
          </div>

          <p className="text-xs sm:text-sm opacity-80" style={{ color: "var(--muted)" }}>
            How declarative SQL maps into the physical database operator execution flow:
          </p>

          <div className="space-y-2.5">
            {explanation.pipelineConnection.map((pipe) => (
              <div
                key={pipe.stepNumber}
                className="p-3 rounded-xl border text-xs sm:text-sm flex items-center justify-between gap-3"
                style={{
                  background: "var(--surface-subtle)",
                  borderColor: "var(--border)",
                }}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className="font-mono text-xs sm:text-sm opacity-60 shrink-0">
                    {pipe.stepNumber}.
                  </span>
                  <span className="font-mono font-bold text-xs sm:text-sm px-2.5 py-1 rounded-lg bg-[var(--panel)] border shrink-0" style={{ borderColor: "var(--border)", color: "var(--foreground)" }}>
                    {pipe.stage}
                  </span>
                  <span className="truncate opacity-90 font-medium" style={{ color: "var(--foreground)" }}>
                    {pipe.operation}
                  </span>
                </div>
                <span className="font-mono text-xs sm:text-sm font-semibold px-2.5 py-1 rounded-lg bg-[var(--panel)] shrink-0 border" style={{ borderColor: "var(--border)", color: "var(--muted)" }}>
                  {pipe.rows} row{pipe.rows !== 1 ? "s" : ""}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
