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
  const [selectedComponentIdx, setSelectedComponentIdx] = useState<number | null>(null);

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
    <div className="space-y-5" aria-label="Detailed Query Explanation">
      {/* 1. Header & Executed SQL */}
      <div
        className="panel p-4 rounded-xl border space-y-2.5 shadow-xs"
        style={{
          background: "var(--panel)",
          borderColor: "var(--border)",
          color: "var(--foreground)",
        }}
      >
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span
              className="text-xs font-bold px-2 py-0.5 rounded border"
              style={{
                background: "var(--surface-subtle)",
                borderColor: "var(--accent)",
                color: "var(--accent)",
              }}
            >
              {explanation.statementType} Query
            </span>
            <h2 className="font-bold text-sm md:text-base tracking-tight" style={{ color: "var(--foreground)" }}>
              Executed SQL Query
            </h2>
          </div>
          <span className="text-xs opacity-75 font-mono" style={{ color: "var(--muted)" }}>
            {explanation.finalOutputSummary.rowCount} row{explanation.finalOutputSummary.rowCount !== 1 ? "s" : ""} returned
          </span>
        </div>

        <pre
          className="p-3 rounded-lg border text-xs md:text-sm font-mono whitespace-pre-wrap wrap-break-word"
          style={{
            background: "var(--surface-subtle)",
            borderColor: "var(--border)",
            color: "var(--foreground)",
          }}
        >
          {explanation.sql}
        </pre>

        <p className="text-xs opacity-85 leading-relaxed pt-0.5" style={{ color: "var(--foreground)" }}>
          {explanation.summary}
        </p>
      </div>

      {/* 2. Primary Relational Algebra Section with Deep Component Breakdown */}
      {ra && (
        <section
          className="panel p-4 md:p-5 rounded-xl border space-y-4 shadow-sm"
          style={{
            background: "var(--panel)",
            borderColor: "var(--border)",
            color: "var(--foreground)",
          }}
          aria-label="Relational algebra equivalence and component breakdown"
        >
          {/* Section Header */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b pb-3" style={{ borderColor: "var(--border)" }}>
            <div className="flex items-center gap-2.5">
              <span
                className="w-7 h-7 rounded-lg border flex items-center justify-center font-serif text-base font-bold select-none shrink-0"
                style={{
                  background: "var(--surface-subtle)",
                  borderColor: "var(--accent)",
                  color: "var(--accent)",
                }}
              >
                π
              </span>
              <div>
                <h3 className="font-bold text-sm md:text-base tracking-tight" style={{ color: "var(--foreground)" }}>
                  Relational Algebra Equivalence
                </h3>
                <p className="text-[11px] opacity-75" style={{ color: "var(--muted)" }}>
                  Codd&apos;s relational algebra &amp; procedural first-order logic translation
                </p>
              </div>
            </div>

            {/* Format selector tabs & copy button */}
            <div className="flex items-center gap-1.5 bg-[var(--surface-subtle)] p-1 rounded-lg border" style={{ borderColor: "var(--border)" }}>
              <button
                id="ra-format-math"
                type="button"
                onClick={() => setNotationFormat("math")}
                className={`px-2 py-0.5 text-xs rounded font-medium transition-colors ${
                  notationFormat === "math"
                    ? "bg-[var(--panel)] font-bold text-[var(--accent)] shadow-xs"
                    : "opacity-70 hover:opacity-100"
                }`}
                title="Display in Unicode mathematical symbols (π, σ, ⋈, etc.)"
              >
                Standard (Math)
              </button>
              <button
                id="ra-format-ascii"
                type="button"
                onClick={() => setNotationFormat("ascii")}
                className={`px-2 py-0.5 text-xs rounded font-medium transition-colors ${
                  notationFormat === "ascii"
                    ? "bg-[var(--panel)] font-bold text-[var(--accent)] shadow-xs"
                    : "opacity-70 hover:opacity-100"
                }`}
                title="Display in clean plain-text ASCII format"
              >
                ASCII
              </button>
              <button
                id="ra-format-latex"
                type="button"
                onClick={() => setNotationFormat("latex")}
                className={`px-2 py-0.5 text-xs rounded font-medium transition-colors ${
                  notationFormat === "latex"
                    ? "bg-[var(--panel)] font-bold text-[var(--accent)] shadow-xs"
                    : "opacity-70 hover:opacity-100"
                }`}
                title="Display in LaTeX equation code"
              >
                LaTeX
              </button>
              <button
                id="copy-ra-formula-btn"
                type="button"
                onClick={handleCopyFormula}
                className="ml-1 px-2 py-0.5 text-xs font-mono font-medium rounded border hover:bg-[var(--panel)] transition-colors flex items-center gap-1"
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
            className="p-3.5 rounded-xl border space-y-2"
            style={{
              background: "var(--surface-subtle)",
              borderColor: "var(--border)",
            }}
          >
            <div className="flex items-center justify-between text-[11px] opacity-75 font-mono" style={{ color: "var(--muted)" }}>
              <span>COMPOSED RELATIONAL EXPRESSION</span>
              <span>{ra.components.length} Operator{ra.components.length !== 1 ? "s" : ""} Composed</span>
            </div>
            <pre
              className="p-3 rounded-lg border font-mono text-xs md:text-sm font-bold overflow-x-auto whitespace-pre-wrap leading-relaxed"
              style={{
                background: "var(--panel)",
                borderColor: "var(--border)",
                color: "var(--accent)",
              }}
            >
              {currentFormula}
            </pre>
            <p className="text-xs opacity-85 leading-relaxed pt-1" style={{ color: "var(--foreground)" }}>
              {ra.summary}
            </p>
          </div>

          {/* Inside-Out Execution Pipeline Chips */}
          {ra.evaluationPipeline && ra.evaluationPipeline.length > 0 && (
            <div className="space-y-1.5 pt-1">
              <span className="text-xs font-semibold opacity-75 block" style={{ color: "var(--muted)" }}>
                Inside-Out Evaluation Pipeline (Evaluation Order):
              </span>
              <div className="flex flex-wrap items-center gap-1.5">
                {ra.evaluationPipeline.map((p, pIdx) => (
                  <div key={p.step} className="flex items-center gap-1.5">
                    <span
                      className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-mono border"
                      style={{
                        background: "var(--surface-subtle)",
                        borderColor: "var(--border)",
                        color: "var(--foreground)",
                      }}
                      title={p.description}
                    >
                      <strong className="text-[var(--accent)]">{p.step}.</strong>
                      <span>{p.operator}</span>
                    </span>
                    {pIdx < ra.evaluationPipeline.length - 1 && (
                      <span className="text-xs opacity-50 font-bold">➔</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Dissection of Each Part of the Relational Algebra */}
          <div className="space-y-3 pt-2 border-t" style={{ borderColor: "var(--border)" }}>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h4 className="font-bold text-sm tracking-tight flex items-center gap-1.5" style={{ color: "var(--foreground)" }}>
                <span>Dissection of Each Part of the Algebra</span>
                <span className="text-xs font-normal opacity-70">
                  (Detailed examination of operators, subscripts, operands &amp; rules)
                </span>
              </h4>
              <span className="text-[11px] font-mono opacity-70" style={{ color: "var(--muted)" }}>
                Click any part to inspect its set-theoretic semantics
              </span>
            </div>

            <div className="grid grid-cols-1 gap-3">
              {ra.components.map((part, cIdx) => {
                const isSelected = selectedComponentIdx === cIdx;
                return (
                  <div
                    key={cIdx}
                    onClick={() => setSelectedComponentIdx(isSelected ? null : cIdx)}
                    className="p-3.5 rounded-xl border transition-all cursor-pointer space-y-3"
                    style={{
                      background: isSelected ? "var(--surface-subtle)" : "var(--panel)",
                      borderColor: isSelected ? "var(--accent)" : "var(--border)",
                    }}
                  >
                    {/* Part Header */}
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        <span
                          className="w-8 h-8 rounded-lg flex items-center justify-center font-serif text-lg font-bold border shrink-0"
                          style={{
                            background: "var(--surface-subtle)",
                            borderColor: "var(--border)",
                            color: "var(--accent)",
                          }}
                        >
                          {part.symbol}
                        </span>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-sm" style={{ color: "var(--foreground)" }}>
                              Part {cIdx + 1}: {part.name}
                            </span>
                            <span
                              className="text-[11px] px-2 py-0.2 rounded font-mono font-medium border"
                              style={{
                                background: "var(--surface-subtle)",
                                borderColor: "var(--border)",
                                color: "var(--muted)",
                              }}
                            >
                              {part.category}
                            </span>
                          </div>
                          <span className="text-xs font-mono font-semibold text-[var(--accent)]">
                            Subscript: {part.subscript}
                          </span>
                        </div>
                      </div>

                      <span className="text-xs font-mono opacity-70 underline">
                        {isSelected ? "Collapse Details ▲" : "Inspect Semantics ▼"}
                      </span>
                    </div>

                    {/* Quick Explanation */}
                    <p className="text-xs md:text-sm opacity-90 leading-relaxed" style={{ color: "var(--foreground)" }}>
                      {part.mathematicalRole}
                    </p>

                    {/* Four-Part Deep Architectural Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 pt-1">
                      {/* 1. Subscript Part */}
                      <div
                        className="p-2.5 rounded-lg border text-xs space-y-1"
                        style={{
                          background: "var(--surface-subtle)",
                          borderColor: "var(--border)",
                        }}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold uppercase tracking-wider text-[10px] text-[var(--accent)]">
                            1. Subscript / Parameter Part
                          </span>
                          <span className="font-mono text-[11px] opacity-75">Argument</span>
                        </div>
                        <div className="font-mono font-bold text-xs p-1 rounded bg-[var(--panel)] border truncate" style={{ borderColor: "var(--border)" }}>
                          {part.subscript}
                        </div>
                        <p className="text-[11px] opacity-80 leading-snug" style={{ color: "var(--foreground)" }}>
                          {part.subscriptExplanation}
                        </p>
                      </div>

                      {/* 2. Input Relation Part */}
                      <div
                        className="p-2.5 rounded-lg border text-xs space-y-1"
                        style={{
                          background: "var(--surface-subtle)",
                          borderColor: "var(--border)",
                        }}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold uppercase tracking-wider text-[10px] text-[var(--accent)]">
                            2. Input Operand Part
                          </span>
                          <span className="font-mono text-[11px] opacity-75">Relation R</span>
                        </div>
                        <div className="font-mono font-bold text-xs p-1 rounded bg-[var(--panel)] border truncate" style={{ borderColor: "var(--border)" }}>
                          {part.inputOperand}
                        </div>
                        <p className="text-[11px] opacity-80 leading-snug" style={{ color: "var(--foreground)" }}>
                          {part.inputExplanation}
                        </p>
                      </div>

                      {/* 3. Output Relation Part */}
                      <div
                        className="p-2.5 rounded-lg border text-xs space-y-1"
                        style={{
                          background: "var(--surface-subtle)",
                          borderColor: "var(--border)",
                        }}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold uppercase tracking-wider text-[10px] text-[var(--accent)]">
                            3. Output Result Part
                          </span>
                          <span className="font-mono text-[11px] opacity-75">Transformed R&apos;</span>
                        </div>
                        <div className="font-mono font-bold text-xs p-1 rounded bg-[var(--panel)] border truncate" style={{ borderColor: "var(--border)" }}>
                          {part.outputResult}
                        </div>
                        <p className="text-[11px] opacity-80 leading-snug" style={{ color: "var(--foreground)" }}>
                          {part.outputExplanation}
                        </p>
                      </div>

                      {/* 4. Formal Definition Part */}
                      <div
                        className="p-2.5 rounded-lg border text-xs space-y-1"
                        style={{
                          background: "var(--surface-subtle)",
                          borderColor: "var(--border)",
                        }}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold uppercase tracking-wider text-[10px] text-[var(--accent)]">
                            4. Formal Set-Theoretic Definition
                          </span>
                          <span className="font-mono text-[11px] opacity-75">First-Order Logic</span>
                        </div>
                        <div className="font-mono font-bold text-xs p-1 rounded bg-[var(--panel)] border text-[var(--accent)] truncate" style={{ borderColor: "var(--border)" }}>
                          {part.formalDefinition}
                        </div>
                        <p className="text-[11px] opacity-80 leading-snug" style={{ color: "var(--foreground)" }}>
                          Defines relational transformation using propositional calculus over tuple spaces.
                        </p>
                      </div>
                    </div>

                    {/* Optimization law (Expanded View) */}
                    {part.optimizationRule && (
                      <div
                        className="p-2.5 rounded-lg border text-xs flex items-start gap-2"
                        style={{
                          background: "var(--panel)",
                          borderColor: "var(--border)",
                        }}
                      >
                        <span className="font-bold text-[var(--accent)] shrink-0">Optimization Law:</span>
                        <span className="opacity-90 leading-snug" style={{ color: "var(--foreground)" }}>
                          {part.optimizationRule}
                        </span>
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
      <div className="space-y-3.5">
        <div className="flex items-center justify-between border-b pb-2" style={{ borderColor: "var(--border)" }}>
          <h3 className="font-bold text-sm md:text-base tracking-tight" style={{ color: "var(--foreground)" }}>
            Step-by-Step Relational Execution Breakdown
          </h3>
          <span className="text-xs opacity-70 font-mono" style={{ color: "var(--muted)" }}>
            {explanation.steps.length} execution step{explanation.steps.length !== 1 ? "s" : ""}
          </span>
        </div>

        {explanation.steps.map((st) => (
          <div
            key={st.stepNumber}
            className="panel p-4 rounded-xl border space-y-3.5 shadow-xs"
            style={{
              background: "var(--panel)",
              borderColor: "var(--border)",
            }}
          >
            <div className="flex flex-wrap items-center justify-between gap-2 border-b pb-2.5" style={{ borderColor: "var(--border)" }}>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-[var(--surface-subtle)] text-[var(--accent)] border border-[var(--border)]">
                  STEP {st.stepNumber} — {st.clause}
                </span>
                <h4 className="font-bold text-sm" style={{ color: "var(--foreground)" }}>
                  {st.title}
                </h4>
              </div>
            </div>

            <p className="text-xs md:text-sm opacity-90 leading-relaxed" style={{ color: "var(--foreground)" }}>
              {st.description}
            </p>

            {/* Relational Algebra Box for this specific Step */}
            {st.algebra && (
              <div
                className="p-3 rounded-xl border space-y-2 text-xs"
                style={{
                  background: "var(--surface-subtle)",
                  borderColor: "var(--border)",
                }}
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-5 h-5 rounded flex items-center justify-center font-serif font-bold text-xs border"
                      style={{
                        background: "var(--panel)",
                        borderColor: "var(--border)",
                        color: "var(--accent)",
                      }}
                    >
                      {st.algebra.symbol}
                    </span>
                    <span className="font-bold text-xs" style={{ color: "var(--foreground)" }}>
                      Algebraic Part: {st.algebra.name}
                    </span>
                  </div>
                  <span className="font-mono text-[11px] text-[var(--accent)] font-semibold">
                    {st.algebra.formalDefinition}
                  </span>
                </div>

                {/* Subscript & Input/Output explanation chips */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-0.5">
                  <div className="p-2 rounded-lg bg-[var(--panel)] border text-[11px] space-y-0.5" style={{ borderColor: "var(--border)" }}>
                    <span className="opacity-60 block font-semibold">Parameter / Subscript:</span>
                    <span className="font-mono font-bold text-[var(--accent)] block truncate">
                      {st.algebra.subscript}
                    </span>
                    <span className="opacity-80 block text-[10px] leading-tight">
                      {st.algebra.subscriptExplanation}
                    </span>
                  </div>
                  <div className="p-2 rounded-lg bg-[var(--panel)] border text-[11px] space-y-0.5" style={{ borderColor: "var(--border)" }}>
                    <span className="opacity-60 block font-semibold">Input Relation:</span>
                    <span className="font-mono font-bold block truncate" style={{ color: "var(--foreground)" }}>
                      {st.algebra.inputOperand}
                    </span>
                    <span className="opacity-80 block text-[10px] leading-tight">
                      {st.algebra.inputExplanation}
                    </span>
                  </div>
                  <div className="p-2 rounded-lg bg-[var(--panel)] border text-[11px] space-y-0.5" style={{ borderColor: "var(--border)" }}>
                    <span className="opacity-60 block font-semibold">Output Relation:</span>
                    <span className="font-mono font-bold block truncate" style={{ color: "var(--foreground)" }}>
                      {st.algebra.outputResult}
                    </span>
                    <span className="opacity-80 block text-[10px] leading-tight">
                      {st.algebra.outputExplanation}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Metrics pills */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {st.metrics.map((m, mIdx) => (
                <div
                  key={mIdx}
                  className="p-2 rounded-lg border text-xs"
                  style={{
                    background: "var(--surface-subtle)",
                    borderColor: "var(--border)",
                  }}
                >
                  <span className="text-xs opacity-70 block" style={{ color: "var(--muted)" }}>
                    {m.label}
                  </span>
                  <span className="font-mono font-bold text-xs md:text-sm" style={{ color: "var(--foreground)" }}>
                    {m.value}
                  </span>
                </div>
              ))}
            </div>

            {/* Sample Table Rows if applicable */}
            {st.sampleRows && st.sampleRows.length > 0 && st.columns && st.columns.length > 0 && (
              <div className="pt-1">
                <span className="text-xs font-semibold opacity-70 block mb-1.5" style={{ color: "var(--muted)" }}>
                  Working Relation Snapshot ({st.sampleRows.length} sample row{st.sampleRows.length !== 1 ? "s" : ""}):
                </span>
                <div className="overflow-x-auto rounded-lg border" style={{ borderColor: "var(--border)" }}>
                  <table className="text-xs w-full border-collapse">
                    <thead>
                      <tr style={{ background: "var(--surface-subtle)" }}>
                        {st.columns.map((c) => (
                          <th
                            key={c}
                            className="text-left px-2 py-1 border-b font-mono font-bold"
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
                              className="px-2 py-1 border-b"
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
          className="panel p-4 rounded-xl border space-y-3"
          style={{
            background: "var(--panel)",
            borderColor: "var(--border)",
            color: "var(--foreground)",
          }}
        >
          <div className="flex items-center gap-2">
            <span
              className="text-xs font-mono font-bold px-2 py-0.5 rounded border"
              style={{
                background: "var(--surface-subtle)",
                borderColor: "var(--accent)",
                color: "var(--accent)",
              }}
            >
              Pipeline
            </span>
            <h3 className="font-bold text-sm md:text-base" style={{ color: "var(--foreground)" }}>
              Physical Engine Pipeline Stages
            </h3>
          </div>

          <p className="text-xs opacity-80" style={{ color: "var(--muted)" }}>
            How declarative SQL maps into the physical database operator execution flow:
          </p>

          <div className="space-y-2">
            {explanation.pipelineConnection.map((pipe) => (
              <div
                key={pipe.stepNumber}
                className="p-2.5 rounded-lg border text-xs flex items-center justify-between gap-3"
                style={{
                  background: "var(--surface-subtle)",
                  borderColor: "var(--border)",
                }}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span className="font-mono text-xs opacity-60 shrink-0">
                    {pipe.stepNumber}.
                  </span>
                  <span className="font-mono font-bold px-2 py-0.5 rounded bg-[var(--panel)] border text-[var(--accent)] shrink-0" style={{ borderColor: "var(--border)" }}>
                    {pipe.stage}
                  </span>
                  <span className="truncate opacity-90" style={{ color: "var(--foreground)" }}>
                    {pipe.operation}
                  </span>
                </div>
                <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded bg-[var(--panel)] shrink-0" style={{ color: "var(--muted)" }}>
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
