"use client";

import { useState, useMemo } from "react";
import type { Table } from "@/lib/schema";
import type { PipelineStep, Row } from "@/lib/sqlEngine";
import type { Tab, ThemeId } from "./nlSqlTypes";
import { ChenERDiagram } from "./ChenERDiagram";
import { analyzePlSqlScript } from "@/lib/plsqlAnalyzer";

interface PlSqlVisualizationPanelProps {
  tab: Tab;
  onTabChange: (tab: Tab) => void;
  steps: PipelineStep[];
  activeStep: number;
  current?: PipelineStep;
  playing: boolean;
  onPlay: () => void;
  onStepChange: (index: number) => void;
  finalRows: Row[];
  columns: string[];
  dbmsOutput: string[];
  onExportCSV: () => void;
  onExportReport: () => void;
  plsql: string;
  mermaidSource: string;
  schema: Table[];
  dark: boolean;
  theme?: ThemeId;
  hasExecuted?: boolean;
}

function getPlSqlStageBadgeClass(stage: string, isDark = true): string {
  if (!isDark) {
    switch (stage.toUpperCase()) {
      case "DECLARE":
      case "ASSIGN":
        return "bg-indigo-100 text-indigo-950 border border-indigo-300 font-semibold";
      case "CURSOR":
        return "bg-sky-100 text-sky-950 border border-sky-300 font-semibold";
      case "LOOP":
        return "bg-amber-100 text-amber-950 border border-amber-300 font-semibold";
      case "CONDITIONAL":
        return "bg-purple-100 text-purple-950 border border-purple-300 font-semibold";
      case "OUTPUT":
        return "bg-orange-100 text-orange-950 border border-orange-400 font-bold";
      case "MUTATION":
        return "bg-rose-100 text-rose-950 border border-rose-300 font-semibold";
      case "COMMIT":
        return "bg-emerald-100 text-emerald-950 border border-emerald-300 font-bold";
      case "EXCEPTION":
        return "bg-red-100 text-red-950 border border-red-400 font-bold";
      default:
        return "bg-slate-100 text-slate-900 border border-slate-300 font-semibold";
    }
  }
  switch (stage.toUpperCase()) {
    case "DECLARE":
    case "ASSIGN":
      return "bg-indigo-950/80 text-indigo-300 border border-indigo-700/60 font-semibold";
    case "CURSOR":
      return "bg-sky-950/80 text-sky-300 border border-sky-700/60 font-semibold";
    case "LOOP":
      return "bg-amber-950/80 text-amber-300 border border-amber-700/60 font-semibold";
    case "CONDITIONAL":
      return "bg-purple-950/80 text-purple-300 border border-purple-700/60 font-semibold";
    case "OUTPUT":
      return "bg-orange-950/90 text-orange-300 border border-orange-600/70 font-bold";
    case "MUTATION":
      return "bg-rose-950/80 text-rose-300 border border-rose-700/60 font-semibold";
    case "COMMIT":
      return "bg-emerald-950/80 text-emerald-300 border border-emerald-700/60 font-bold";
    case "EXCEPTION":
      return "bg-red-950/90 text-red-300 border border-red-600/80 font-bold";
    default:
      return "bg-zinc-800 text-zinc-100 border border-zinc-700 font-semibold";
  }
}

function getWorkflowCategoryBadgeClass(category: string, isDark = true): string {
  if (!isDark) {
    switch (category) {
      case "INITIALIZATION":
        return "bg-indigo-100 text-indigo-950 border border-indigo-300 font-semibold";
      case "CURSOR / FETCH":
        return "bg-sky-100 text-sky-950 border border-sky-300 font-semibold";
      case "ITERATION":
        return "bg-amber-100 text-amber-950 border border-amber-300 font-semibold";
      case "LOGIC / CONDITION":
        return "bg-purple-100 text-purple-950 border border-purple-300 font-semibold";
      case "MUTATION":
        return "bg-rose-100 text-rose-950 border border-rose-300 font-semibold";
      case "OUTPUT":
        return "bg-orange-100 text-orange-950 border border-orange-400 font-bold";
      case "EXCEPTION":
        return "bg-red-100 text-red-950 border border-red-400 font-bold";
      case "COMPLETION":
        return "bg-emerald-100 text-emerald-950 border border-emerald-300 font-bold";
      default:
        return "bg-slate-100 text-slate-900 border border-slate-300 font-semibold";
    }
  }
  switch (category) {
    case "INITIALIZATION":
      return "bg-indigo-950/80 text-indigo-300 border border-indigo-700/60 font-semibold";
    case "CURSOR / FETCH":
      return "bg-sky-950/80 text-sky-300 border border-sky-700/60 font-semibold";
    case "ITERATION":
      return "bg-amber-950/80 text-amber-300 border border-amber-700/60 font-semibold";
    case "LOGIC / CONDITION":
      return "bg-purple-950/80 text-purple-300 border border-purple-700/60 font-semibold";
    case "MUTATION":
      return "bg-rose-950/80 text-rose-300 border border-rose-700/60 font-semibold";
    case "OUTPUT":
      return "bg-orange-950/90 text-orange-300 border border-orange-600/70 font-bold";
    case "EXCEPTION":
      return "bg-red-950/90 text-red-300 border border-red-600/80 font-bold";
    case "COMPLETION":
      return "bg-emerald-950/80 text-emerald-300 border border-emerald-700/60 font-bold";
    default:
      return "bg-zinc-800 text-zinc-100 border border-zinc-700 font-semibold";
  }
}

export function PlSqlVisualizationPanel({
  tab,
  onTabChange,
  steps,
  activeStep,
  current,
  playing,
  onPlay,
  onStepChange,
  finalRows,
  columns,
  dbmsOutput = [],
  onExportCSV,
  onExportReport,
  plsql,
  mermaidSource,
  schema,
  dark,
  theme = "slate",
  hasExecuted = false,
}: PlSqlVisualizationPanelProps) {
  const [outputViewMode, setOutputViewMode] = useState<"both" | "terminal" | "table">("both");
  const [copiedConsole, setCopiedConsole] = useState(false);

  const analysis = useMemo(
    () => analyzePlSqlScript(plsql, schema, steps, finalRows, dbmsOutput),
    [plsql, schema, steps, finalRows, dbmsOutput]
  );

  const handleCopyConsole = () => {
    if (dbmsOutput.length === 0) return;
    navigator.clipboard.writeText(dbmsOutput.join("\n"));
    setCopiedConsole(true);
    setTimeout(() => setCopiedConsole(false), 2000);
  };

  return (
    <section className="flex flex-col gap-4 min-w-0" aria-label="PL/SQL Visualization Panel">
      {/* ── Top Tabs Navigation ── */}
      <div className="flex gap-2 flex-wrap items-center justify-between">
        <div className="flex gap-2 flex-wrap">
          {(["result", "schema", "explanation", "theory"] as const).map((item) => {
            const isActive = tab === item;
            return (
              <button
                key={item}
                type="button"
                onClick={() => onTabChange(item)}
                className="px-3.5 py-1.5 rounded-lg text-xs md:text-sm capitalize cursor-pointer transition-all border font-semibold shadow-xs"
                style={
                  isActive
                    ? {
                      background: "linear-gradient(135deg, #FF6A3D 0%, #D83B01 100%)",
                      color: "#FFFFFF",
                      borderColor: "#FF6A3D",
                      boxShadow: "0 0 15px rgba(255, 91, 57, 0.3)",
                    }
                    : {
                      background: "var(--panel)",
                      color: dark ? "var(--muted)" : "#09090b",
                      borderColor: "var(--border)",
                    }
                }
              >
                {item === "result"
                  ? "Pipeline & Output"
                  : item === "schema"
                    ? "Schema / ER"
                    : item === "explanation"
                      ? "Procedural Logic"
                      : "PL/SQL Theory"}
              </button>
            );
          })}
        </div>

        {/* Global Action Export buttons */}
        {tab === "result" && hasExecuted && (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onExportCSV}
              className={`px-2.5 py-1 text-xs rounded-md border transition-colors flex items-center gap-1 font-medium ${
                dark
                  ? "text-zinc-300 hover:bg-zinc-800 border-[var(--border)]"
                  : "text-black bg-orange-50 border-orange-300 hover:bg-orange-100"
              }`}
            >
              <span>📥</span>
              <span>CSV</span>
            </button>
            <button
              type="button"
              onClick={onExportReport}
              className={`px-2.5 py-1 text-xs rounded-md border transition-colors flex items-center gap-1 font-medium ${
                dark
                  ? "text-zinc-300 hover:bg-zinc-800 border-[var(--border)]"
                  : "text-black bg-orange-50 border-orange-300 hover:bg-orange-100"
              }`}
            >
              <span>📄</span>
              <span>Report</span>
            </button>
          </div>
        )}
      </div>

      {/* ── Tab Content: Pipeline & Result ── */}
      {tab === "result" && (
        <div className="flex flex-col gap-4">
          {/* Step Timeline Player */}
          {steps.length > 0 && (
            <div
              className="rounded-2xl border p-4 flex flex-col gap-3 transition-all"
              style={{ background: "var(--panel)", borderColor: "var(--border)" }}
            >
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={onPlay}
                    className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white transition-transform active:scale-95 shadow-md"
                    style={{ background: "#FF5B39" }}
                    title={playing ? "Pause execution" : "Play step-by-step"}
                  >
                    {playing ? "⏸" : "▶"}
                  </button>

                  <div className={`flex items-center gap-1 text-xs font-mono ${dark ? "text-zinc-400" : "text-black font-semibold"}`}>
                    <span className={`font-semibold ${dark ? "text-zinc-200" : "text-black"}`}>
                      Step {activeStep + 1}
                    </span>
                    <span>/</span>
                    <span>{steps.length}</span>
                  </div>

                  {current && (
                    <span className={`text-[10px] px-2 py-0.5 rounded-full ${getPlSqlStageBadgeClass(current.stage, dark)}`}>
                      {current.stage}
                    </span>
                  )}
                </div>

                {/* Step navigation prev / next */}
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    disabled={activeStep <= 0}
                    onClick={() => onStepChange(Math.max(0, activeStep - 1))}
                    className={`px-2.5 py-1 text-xs rounded-md border disabled:opacity-40 disabled:cursor-not-allowed transition-colors font-medium ${
                      dark
                        ? "text-zinc-300 hover:bg-zinc-800 border-[var(--border)]"
                        : "text-black bg-orange-50 border-orange-300 hover:bg-orange-100"
                    }`}
                  >
                    ◀ Prev
                  </button>
                  <button
                    type="button"
                    disabled={activeStep >= steps.length - 1}
                    onClick={() => onStepChange(Math.min(steps.length - 1, activeStep + 1))}
                    className={`px-2.5 py-1 text-xs rounded-md border disabled:opacity-40 disabled:cursor-not-allowed transition-colors font-medium ${
                      dark
                        ? "text-zinc-300 hover:bg-zinc-800 border-[var(--border)]"
                        : "text-black bg-orange-50 border-orange-300 hover:bg-orange-100"
                    }`}
                  >
                    Next ▶
                  </button>
                </div>
              </div>

              {/* Progress Slider track */}
              <div className={`w-full rounded-full h-1.5 overflow-hidden ${dark ? "bg-zinc-800/60" : "bg-orange-100 border border-orange-200"}`}>
                <div
                  className="h-full transition-all duration-300"
                  style={{
                    width: `${((activeStep + 1) / steps.length) * 100}%`,
                    background: "linear-gradient(90deg, #FF6A3D, #FF9A6C)",
                  }}
                />
              </div>

              {/* Current Step Description Card */}
              {current && (
                <div className={`p-3 rounded-xl border flex flex-col gap-2 text-xs ${
                  dark
                    ? "bg-zinc-900/60 border-zinc-800/80"
                    : "bg-orange-50/70 border-orange-200"
                }`}>
                  <div className="flex items-center justify-between">
                    <div className={`font-semibold flex items-center gap-2 ${dark ? "text-zinc-200" : "text-black font-bold"}`}>
                      <span>{current.title}</span>
                    </div>
                    {current.rows && current.rows.length > 0 && (
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono ${
                        dark
                          ? "bg-zinc-800 text-zinc-300 border border-zinc-700"
                          : "bg-orange-100 text-orange-950 border border-orange-300 font-semibold"
                      }`}>
                        {current.rows.length} tuple(s) in step
                      </span>
                    )}
                  </div>
                  <p className={`font-mono text-[11px] leading-relaxed ${dark ? "text-zinc-400" : "text-slate-800"}`}>
                    {current.detail}
                  </p>

                  {/* Step data rows preview if available and not on the last commit step (which is already shown below) */}
                  {current.stage !== "COMMIT" && current.rows && current.rows.length > 0 && current.columns && current.columns.length > 0 && (
                    <div className="mt-1 overflow-x-auto max-h-36 rounded-lg border border-[var(--border)]">
                      <table className="w-full text-left text-[11px] border-collapse">
                        <thead>
                          <tr className={dark ? "bg-zinc-800/90 text-zinc-300" : "bg-orange-100 text-black font-bold"}>
                            {current.columns.map((c) => (
                              <th key={c} className="px-2.5 py-1 font-semibold uppercase text-[10px]">
                                {c}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {current.rows.slice(0, 6).map((row, rIdx) => (
                            <tr key={rIdx} className={`border-t border-[var(--border)] ${dark ? "hover:bg-zinc-800/40" : "hover:bg-orange-50"}`}>
                              {current.columns.map((c) => (
                                <td key={c} className="px-2.5 py-1 font-mono text-[11px]">
                                  {String(row[c] ?? "")}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* View Mode Toggle Header */}
          <div className="flex items-center justify-between flex-wrap gap-2 px-1">
            <div className="flex items-center gap-2">
              <span className={`text-xs font-semibold ${dark ? "text-zinc-300" : "text-slate-800 font-bold"}`}>
                Execution Results View:
              </span>
              <span className={`text-[11px] px-2 py-0.5 rounded-full font-mono font-medium ${
                dark
                  ? "bg-zinc-800 text-orange-400 border border-zinc-700"
                  : "bg-orange-100 text-orange-900 border border-orange-300 font-bold"
              }`}>
                {dbmsOutput.length} output line(s) • {finalRows.length} table record(s)
              </span>
            </div>

            <div className={`flex items-center rounded-lg border p-0.5 text-xs ${
              dark ? "border-zinc-700/60 bg-zinc-800/40" : "border-slate-300 bg-slate-100"
            }`}>
              <button
                type="button"
                onClick={() => setOutputViewMode("both")}
                className={`px-3 py-1 rounded-md font-medium transition-colors cursor-pointer ${
                  outputViewMode === "both"
                    ? "bg-orange-600 text-white font-semibold shadow-xs"
                    : dark
                      ? "text-zinc-400 hover:text-zinc-200"
                      : "text-slate-700 hover:text-black font-semibold"
                }`}
              >
                Split (Both)
              </button>
              <button
                type="button"
                onClick={() => setOutputViewMode("terminal")}
                className={`px-3 py-1 rounded-md font-medium transition-colors cursor-pointer ${
                  outputViewMode === "terminal"
                    ? "bg-orange-600 text-white font-semibold shadow-xs"
                    : dark
                      ? "text-zinc-400 hover:text-zinc-200"
                      : "text-slate-700 hover:text-black font-semibold"
                }`}
              >
                Console
              </button>
              <button
                type="button"
                onClick={() => setOutputViewMode("table")}
                className={`px-3 py-1 rounded-md font-medium transition-colors cursor-pointer ${
                  outputViewMode === "table"
                    ? "bg-orange-600 text-white font-semibold shadow-xs"
                    : dark
                      ? "text-zinc-400 hover:text-zinc-200"
                      : "text-slate-700 hover:text-black font-semibold"
                }`}
              >
                Table
              </button>
            </div>
          </div>

          {/* 1. DBMS_OUTPUT Terminal Card */}
          {(outputViewMode === "both" || outputViewMode === "terminal") && (
            <div
              className="rounded-2xl border flex flex-col overflow-hidden transition-all shadow-sm"
              style={{ background: "var(--panel)", borderColor: "var(--border)" }}
            >
              {/* Console Sub-header */}
              <div
                className={`p-3 border-b flex items-center justify-between gap-3 ${
                  dark ? "bg-zinc-900/40" : "bg-slate-50"
                }`}
                style={{ borderColor: "var(--border)" }}
              >
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-full bg-red-500/80 inline-block" />
                    <span className="w-3 h-3 rounded-full bg-yellow-500/80 inline-block" />
                    <span className="w-3 h-3 rounded-full bg-green-500/80 inline-block" />
                  </div>
                  <span className={`text-xs font-mono font-semibold ml-1 ${dark ? "text-zinc-300" : "text-black font-bold"}`}>
                    DBMS_OUTPUT Terminal
                  </span>
                  <span className={`text-[11px] px-2 py-0.5 rounded-full font-mono ${
                    dark
                      ? "bg-orange-950/60 text-orange-400 border border-orange-800/40"
                      : "bg-orange-100 text-orange-900 border border-orange-300 font-bold"
                  }`}>
                    {dbmsOutput.length} message(s)
                  </span>
                </div>

                {dbmsOutput.length > 0 && (
                  <button
                    type="button"
                    onClick={handleCopyConsole}
                    className={`px-2.5 py-1 text-xs rounded-md border transition-colors cursor-pointer flex items-center gap-1 ${
                      dark
                        ? "text-zinc-300 hover:text-white hover:bg-zinc-800 border-zinc-700"
                        : "text-black hover:bg-slate-200 border-slate-300 font-semibold"
                    }`}
                    title="Copy console output to clipboard"
                  >
                    <span>{copiedConsole ? "✓" : "📋"}</span>
                    <span>{copiedConsole ? "Copied!" : "Copy"}</span>
                  </button>
                )}
              </div>

              {/* Output Terminal Area */}
              <div
                className="p-4 font-mono text-xs sm:text-sm overflow-x-auto max-h-[320px] scrollbar-thin flex flex-col gap-1 select-text"
                style={{
                  background: dark ? "#080B11" : "#0d1117",
                  color: "#F1F5F9",
                }}
              >
                {dbmsOutput.length === 0 ? (
                  <div className="py-8 flex flex-col items-center justify-center text-zinc-400 gap-2 font-sans">
                    <span className="text-2xl">⚡</span>
                    <p className="text-xs">No DBMS_OUTPUT messages captured yet. Click &quot;Execute PL/SQL&quot; to run.</p>
                  </div>
                ) : (
                  dbmsOutput.map((line, idx) => (
                    <div key={idx} className="flex items-start gap-3 hover:bg-zinc-800/40 px-1 py-0.5 rounded">
                      <span className="text-zinc-500 text-[11px] select-none shrink-0 w-6 text-right font-mono">
                        {idx + 1}
                      </span>
                      <span
                        className={
                          line.startsWith("[ERROR]")
                            ? "text-red-400 font-semibold"
                            : line.startsWith("===") || line.startsWith("---")
                              ? "text-orange-400 font-bold"
                              : line.includes("PRIORITY") || line.includes("ALERT")
                                ? "text-amber-300 font-semibold"
                                : line.includes("Total") || line.includes("Processed") || line.includes("Finished")
                                  ? "text-emerald-400 font-semibold"
                                  : "text-zinc-100"
                        }
                      >
                        {line}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* 2. Structured Table Records Card */}
          {(outputViewMode === "both" || outputViewMode === "table") && (
            <div
              className="rounded-2xl border flex flex-col overflow-hidden transition-all shadow-sm"
              style={{ background: "var(--panel)", borderColor: "var(--border)" }}
            >
              {/* Table Sub-header */}
              <div
                className={`p-3 border-b flex items-center justify-between gap-3 ${
                  dark ? "bg-zinc-900/40" : "bg-slate-50"
                }`}
                style={{ borderColor: "var(--border)" }}
              >
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm">📊</span>
                  <span className={`text-xs font-mono font-semibold ${dark ? "text-zinc-300" : "text-black font-bold"}`}>
                    Output / Table Records
                  </span>
                  <span className={`text-[11px] px-2 py-0.5 rounded-full font-mono ${
                    dark
                      ? "bg-zinc-800 text-zinc-300 border border-zinc-700"
                      : "bg-slate-200 text-slate-900 border border-slate-300 font-semibold"
                  }`}>
                    {finalRows.length} record(s)
                  </span>
                  {columns.length > 0 && (
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono ${
                      dark ? "bg-zinc-800/80 text-zinc-400" : "bg-slate-100 text-slate-700 font-medium"
                    }`}>
                      {columns.length} columns ({columns.join(", ")})
                    </span>
                  )}
                </div>

                {hasExecuted && finalRows.length > 0 && (
                  <button
                    type="button"
                    onClick={onExportCSV}
                    className={`px-2.5 py-1 text-xs rounded-md border transition-colors cursor-pointer flex items-center gap-1 font-medium ${
                      dark
                        ? "text-zinc-300 hover:text-white hover:bg-zinc-800 border-zinc-700"
                        : "text-black bg-orange-50 border-orange-300 hover:bg-orange-100"
                    }`}
                    title="Export table records as CSV"
                  >
                    <span>📥</span>
                    <span>Export CSV</span>
                  </button>
                )}
              </div>

              {/* Table Data Area */}
              <div className="overflow-x-auto max-h-[380px] scrollbar-thin">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className={`border-b ${dark ? "bg-zinc-900/60 text-zinc-300" : "bg-slate-100 text-black font-bold"}`} style={{ borderColor: "var(--border)" }}>
                      <th className={`p-3 w-12 font-semibold uppercase tracking-wider text-[11px] ${dark ? "text-zinc-400" : "text-black font-bold"}`}>
                        #
                      </th>
                      {columns.map((c) => (
                        <th key={c} className={`p-3 font-semibold uppercase tracking-wider text-[11px] ${dark ? "text-zinc-300" : "text-black font-bold"}`}>
                          {c}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {finalRows.length === 0 ? (
                      <tr>
                        <td colSpan={(columns.length || 1) + 1} className={`p-8 text-center ${dark ? "text-zinc-500" : "text-slate-600 font-medium"}`}>
                          No table records to display. Run a script to see rows.
                        </td>
                      </tr>
                    ) : (
                      finalRows.map((row, rIdx) => (
                        <tr
                          key={rIdx}
                          className={`border-b transition-colors ${
                            rIdx % 2 === 1
                              ? dark ? "bg-zinc-900/20" : "bg-slate-50/50"
                              : ""
                          } ${dark ? "hover:bg-zinc-800/40" : "hover:bg-orange-50/80"}`}
                          style={{ borderColor: "var(--border)" }}
                        >
                          <td className={`p-3 font-mono text-[11px] select-none ${dark ? "text-zinc-500" : "text-slate-500"}`}>
                            {rIdx + 1}
                          </td>
                          {columns.map((c) => (
                            <td key={c} className={`p-3 font-mono ${dark ? "text-zinc-200" : "text-black font-medium"}`}>
                              {String(row[c] ?? "")}
                            </td>
                          ))}
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Tab Content: Schema / ER Diagram ── */}
      {tab === "schema" && (
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {schema.map((t) => (
              <div
                key={t.name}
                className="rounded-xl border p-3.5 flex flex-col gap-2 shadow-xs"
                style={{ background: "var(--surface-subtle)", borderColor: "var(--border)" }}
              >
                <div className={`flex items-center justify-between border-b pb-2 ${dark ? "border-zinc-800" : "border-slate-300"}`}>
                  <span className={`font-bold text-sm font-mono ${dark ? "text-orange-400" : "text-black font-bold"}`}>
                    {t.name}
                  </span>
                  <span className={`text-xs ${dark ? "text-zinc-400" : "text-black font-semibold"}`}>
                    {t.rows.length} rows
                  </span>
                </div>
                <div className="flex flex-col gap-1 text-xs">
                  {t.columns.map((c) => (
                    <div key={c.name} className={`flex items-center justify-between py-0.5 font-mono ${dark ? "text-zinc-300" : "text-black font-medium"}`}>
                      <span>{c.name}</span>
                      <span className={`text-[10px] font-mono ${dark ? "text-zinc-500" : "text-black font-semibold opacity-85"}`}>
                        {c.type} {c.pk ? "[PK]" : ""} {c.fk ? `-> ${c.fk.table}` : ""}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div
            className="rounded-2xl border p-4"
            style={{ background: "var(--panel)", borderColor: "var(--border)" }}
          >
            <h3 className={`text-sm font-bold mb-3 flex items-center gap-2 ${dark ? "text-zinc-200" : "text-black font-bold"}`}>
              <span>Chen ER Diagram & Schema Inspector</span>
            </h3>
            <ChenERDiagram schema={schema} theme={theme} />
          </div>
        </div>
      )}

      {/* ── Tab Content: Procedural Logic Explanation ── */}
      {tab === "explanation" && (
        <div
          className="rounded-2xl border p-5 flex flex-col gap-6"
          style={{ background: "var(--panel)", borderColor: "var(--border)" }}
        >
          {/* Header Banner */}
          <div className={`border-b pb-4 ${dark ? "border-zinc-800" : "border-slate-200"}`}>
            <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
              <div className="flex items-center gap-2">
                <span className="text-orange-500 text-lg">✦</span>
                <h3 className={`text-base font-bold ${dark ? "text-zinc-100" : "text-slate-900"}`}>
                  Procedural Logic &amp; Operational Breakdown
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-full bg-orange-500/15 text-orange-600 dark:text-orange-400 border border-orange-500/30">
                  {analysis.procedural.blockType}
                </span>
              </div>
            </div>
            <p className={`text-xs leading-relaxed ${dark ? "text-zinc-300" : "text-slate-700 font-medium"}`}>
              {analysis.procedural.summary}
            </p>

            {/* Quick Metrics Bar */}
            <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-dashed border-zinc-700/40">
              <span className={`text-[11px] font-medium px-2 py-1 rounded-md border ${
                dark ? "bg-zinc-900/80 text-zinc-300 border-zinc-800" : "bg-slate-100 text-slate-800 border-slate-300 font-semibold"
              }`}>
                🗄️ Tables: <strong className={dark ? "text-orange-400" : "text-orange-700"}>{analysis.procedural.tablesUsed.length}</strong>
              </span>
              <span className={`text-[11px] font-medium px-2 py-1 rounded-md border ${
                dark ? "bg-zinc-900/80 text-zinc-300 border-zinc-800" : "bg-slate-100 text-slate-800 border-slate-300 font-semibold"
              }`}>
                📦 Variables: <strong className={dark ? "text-indigo-400" : "text-indigo-700"}>{analysis.procedural.variables.length}</strong>
              </span>
              <span className={`text-[11px] font-medium px-2 py-1 rounded-md border ${
                dark ? "bg-zinc-900/80 text-zinc-300 border-zinc-800" : "bg-slate-100 text-slate-800 border-slate-300 font-semibold"
              }`}>
                ⚡ Cursors: <strong className={dark ? "text-sky-400" : "text-sky-700"}>{analysis.procedural.cursors.length}</strong>
              </span>
              <span className={`text-[11px] font-medium px-2 py-1 rounded-md border ${
                dark ? "bg-zinc-900/80 text-zinc-300 border-zinc-800" : "bg-slate-100 text-slate-800 border-slate-300 font-semibold"
              }`}>
                🔄 Steps: <strong className={dark ? "text-amber-400" : "text-amber-700"}>{analysis.procedural.workflowSteps.length}</strong>
              </span>
              <span className={`text-[11px] font-medium px-2 py-1 rounded-md border ${
                dark ? "bg-zinc-900/80 text-zinc-300 border-zinc-800" : "bg-slate-100 text-slate-800 border-slate-300 font-semibold"
              }`}>
                📟 DBMS Output: <strong className={dark ? "text-emerald-400" : "text-emerald-700"}>{analysis.procedural.outputMessagesCount} lines</strong>
              </span>
            </div>
          </div>

          {/* Section 1: Targeted Schema Tables & Relational Operations */}
          <div className="flex flex-col gap-3">
            <h4 className={`text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 ${
              dark ? "text-zinc-200" : "text-slate-900"
            }`}>
              <span>1. Targeted Schema Tables &amp; Operations</span>
              <span className={`text-[10px] normal-case font-normal px-2 py-0.5 rounded-full border ${
                dark ? "bg-zinc-800 text-zinc-400 border-zinc-700" : "bg-slate-100 text-slate-600 border-slate-300"
              }`}>
                Analyzed from active script &amp; database schema
              </span>
            </h4>

            {analysis.procedural.tablesUsed.length === 0 ? (
              <div className={`p-4 rounded-xl border text-xs ${
                dark ? "border-zinc-800 bg-zinc-900/40 text-zinc-400" : "border-slate-200 bg-slate-50 text-slate-600"
              }`}>
                Pure procedural computation block; no relational database tables queried or modified.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {analysis.procedural.tablesUsed.map((tbl, i) => (
                  <div
                    key={`${tbl.tableName}-${i}`}
                    className={`p-3.5 rounded-xl border flex flex-col gap-2 transition-all ${
                      dark
                        ? "border-zinc-800/80 bg-zinc-900/40 hover:border-zinc-700"
                        : "border-slate-200 bg-white hover:border-slate-300 shadow-2xs"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="text-sm">📁</span>
                        <span className={`font-mono text-xs font-bold ${dark ? "text-zinc-100" : "text-slate-900"}`}>
                          {tbl.tableName}
                        </span>
                      </div>
                      <span className={`text-[10px] font-mono font-semibold px-2 py-0.5 rounded border ${
                        tbl.operation.includes("UPDATE") || tbl.operation.includes("INSERT") || tbl.operation.includes("DELETE")
                          ? dark ? "bg-rose-950/80 text-rose-300 border-rose-700/60" : "bg-rose-100 text-rose-950 border-rose-300 font-bold"
                          : tbl.operation.includes("CURSOR")
                            ? dark ? "bg-sky-950/80 text-sky-300 border-sky-700/60" : "bg-sky-100 text-sky-950 border-sky-300 font-bold"
                            : dark ? "bg-indigo-950/80 text-indigo-300 border-indigo-700/60" : "bg-indigo-100 text-indigo-950 border-indigo-300 font-bold"
                      }`}>
                        {tbl.operation}
                      </span>
                    </div>

                    {tbl.columns.length > 0 && (
                      <div className="flex flex-wrap items-center gap-1.5 mt-0.5">
                        <span className={`text-[10px] font-medium ${dark ? "text-zinc-400" : "text-slate-600"}`}>
                          Columns:
                        </span>
                        {tbl.columns.map((col) => (
                          <span
                            key={col}
                            className={`text-[10px] font-mono px-1.5 py-0.5 rounded border ${
                              dark ? "bg-zinc-800/80 text-zinc-300 border-zinc-700" : "bg-slate-100 text-slate-800 border-slate-200 font-medium"
                            }`}
                          >
                            {col}
                          </span>
                        ))}
                      </div>
                    )}

                    {tbl.filterCondition && (
                      <div className={`text-[11px] font-mono px-2 py-1 rounded border mt-0.5 ${
                        dark ? "bg-zinc-950/70 text-amber-300/90 border-amber-900/40" : "bg-amber-50 text-amber-950 border-amber-200 font-medium"
                      }`}>
                        WHERE: {tbl.filterCondition}
                      </div>
                    )}

                    <div className="flex items-center justify-between text-[11px] pt-1 border-t border-zinc-800/40">
                      <span className={dark ? "text-zinc-400" : "text-slate-500 font-medium"}>
                        Active Volume:
                      </span>
                      <span className={`font-semibold ${dark ? "text-zinc-300" : "text-slate-900"}`}>
                        {tbl.rowCount} records loaded
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Section 2: Memory Variables & Cursor Allocations */}
          <div className="flex flex-col gap-3">
            <h4 className={`text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 ${
              dark ? "text-zinc-200" : "text-slate-900"
            }`}>
              <span>2. Memory Declarations &amp; Work Area Setup</span>
              <span className={`text-[10px] normal-case font-normal px-2 py-0.5 rounded-full border ${
                dark ? "bg-zinc-800 text-zinc-400 border-zinc-700" : "bg-slate-100 text-slate-600 border-slate-300"
              }`}>
                PGA memory structures allocated for this execution
              </span>
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {/* Variables */}
              <div className={`p-4 rounded-xl border flex flex-col gap-2.5 ${
                dark ? "border-zinc-800/80 bg-zinc-900/40" : "border-slate-200 bg-white shadow-2xs"
              }`}>
                <div className="flex items-center justify-between">
                  <span className={`text-xs font-bold flex items-center gap-1.5 ${dark ? "text-indigo-400" : "text-indigo-900 font-bold"}`}>
                    <span>📦</span>
                    <span>Declared Variables ({analysis.procedural.variables.length})</span>
                  </span>
                  <span className={`text-[10px] font-mono px-2 py-0.5 rounded border ${
                    dark ? "bg-indigo-950/80 text-indigo-300 border-indigo-800/60" : "bg-indigo-50 text-indigo-900 border-indigo-200"
                  }`}>
                    PGA Scalar Memory
                  </span>
                </div>

                {analysis.procedural.variables.length === 0 ? (
                  <p className={`text-xs italic ${dark ? "text-zinc-500" : "text-slate-500"}`}>
                    No explicit variables declared in DECLARE block.
                  </p>
                ) : (
                  <div className="flex flex-col gap-2">
                    {analysis.procedural.variables.map((v) => (
                      <div
                        key={v.name}
                        className={`p-2.5 rounded-lg border flex flex-col gap-1 text-xs ${
                          dark ? "border-zinc-800 bg-zinc-950/60" : "border-slate-200 bg-slate-50"
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className={`font-mono font-bold ${dark ? "text-zinc-100" : "text-slate-900"}`}>
                            {v.name}
                          </span>
                          <span className={`font-mono text-[10px] px-1.5 py-0.5 rounded border ${
                            dark ? "bg-zinc-800 text-indigo-300 border-zinc-700" : "bg-white text-indigo-900 border-slate-300 font-semibold"
                          }`}>
                            {v.type}
                          </span>
                        </div>
                        <p className={`text-[11px] leading-relaxed ${dark ? "text-zinc-300" : "text-slate-700"}`}>
                          {v.purpose}
                        </p>
                        {v.defaultValue && (
                          <div className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
                            dark ? "text-zinc-400 bg-zinc-900" : "text-slate-600 bg-slate-200"
                          }`}>
                            Initial: {v.defaultValue}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Cursors */}
              <div className={`p-4 rounded-xl border flex flex-col gap-2.5 ${
                dark ? "border-zinc-800/80 bg-zinc-900/40" : "border-slate-200 bg-white shadow-2xs"
              }`}>
                <div className="flex items-center justify-between">
                  <span className={`text-xs font-bold flex items-center gap-1.5 ${dark ? "text-sky-400" : "text-sky-900 font-bold"}`}>
                    <span>⚡</span>
                    <span>Cursor Work Areas ({analysis.procedural.cursors.length})</span>
                  </span>
                  <span className={`text-[10px] font-mono px-2 py-0.5 rounded border ${
                    dark ? "bg-sky-950/80 text-sky-300 border-sky-800/60" : "bg-sky-50 text-sky-900 border-sky-200"
                  }`}>
                    Private SQL Area
                  </span>
                </div>

                {analysis.procedural.cursors.length === 0 ? (
                  <p className={`text-xs italic ${dark ? "text-zinc-500" : "text-slate-500"}`}>
                    No explicit cursor declared; procedural logic executes via direct SQL or implicit cursors.
                  </p>
                ) : (
                  <div className="flex flex-col gap-2">
                    {analysis.procedural.cursors.map((c) => (
                      <div
                        key={c.name}
                        className={`p-2.5 rounded-lg border flex flex-col gap-1.5 text-xs ${
                          dark ? "border-zinc-800 bg-zinc-950/60" : "border-slate-200 bg-slate-50"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className={`font-mono font-bold ${dark ? "text-sky-300" : "text-sky-900"}`}>
                            CURSOR {c.name}
                          </span>
                          {c.targetTable && (
                            <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded border ${
                              dark ? "bg-zinc-800 text-zinc-300 border-zinc-700" : "bg-white text-slate-800 border-slate-300"
                            }`}>
                              → {c.targetTable}
                            </span>
                          )}
                        </div>
                        <pre className={`text-[11px] font-mono p-2 rounded overflow-x-auto ${
                          dark ? "bg-black/60 text-zinc-200" : "bg-slate-900 text-slate-100"
                        }`}>
                          {c.query}
                        </pre>
                        {c.filterCondition && (
                          <div className={`text-[10px] font-mono ${dark ? "text-amber-400" : "text-amber-800 font-medium"}`}>
                            Predicate: {c.filterCondition}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Section 3: Sequential Procedural Workflow Timeline */}
          <div className="flex flex-col gap-3">
            <h4 className={`text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 ${
              dark ? "text-zinc-200" : "text-slate-900"
            }`}>
              <span>3. Sequential Procedural Workflow</span>
              <span className={`text-[10px] normal-case font-normal px-2 py-0.5 rounded-full border ${
                dark ? "bg-zinc-800 text-zinc-400 border-zinc-700" : "bg-slate-100 text-slate-600 border-slate-300"
              }`}>
                Step-by-step logic execution order
              </span>
            </h4>

            <div className="flex flex-col gap-2.5">
              {analysis.procedural.workflowSteps.map((ws) => (
                <div
                  key={ws.stepNumber}
                  className={`p-3.5 rounded-xl border flex flex-col md:flex-row md:items-center justify-between gap-3 transition-all ${
                    dark
                      ? "border-zinc-800/80 bg-zinc-900/40 hover:border-zinc-700"
                      : "border-slate-200 bg-white hover:border-slate-300 shadow-2xs"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5 ${
                      dark ? "bg-zinc-800 text-orange-400 border border-zinc-700" : "bg-orange-100 text-orange-950 border border-orange-300 font-bold"
                    }`}>
                      {ws.stepNumber}
                    </span>
                    <div className="flex flex-col gap-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className={`text-xs font-bold ${dark ? "text-zinc-100" : "text-slate-900"}`}>
                          {ws.title}
                        </span>
                        <span className={`text-[10px] font-mono px-2 py-0.5 rounded border ${getWorkflowCategoryBadgeClass(ws.category, dark)}`}>
                          {ws.category}
                        </span>
                      </div>
                      <p className={`text-xs leading-relaxed ${dark ? "text-zinc-300" : "text-slate-700 font-normal"}`}>
                        {ws.description}
                      </p>
                    </div>
                  </div>

                  {ws.targetObject && (
                    <div className={`shrink-0 text-[10px] font-mono px-2.5 py-1 rounded border self-start md:self-center ${
                      dark ? "bg-zinc-950/70 text-zinc-300 border-zinc-800" : "bg-slate-100 text-slate-800 border-slate-300 font-semibold"
                    }`}>
                      Target: {ws.targetObject}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Section 4: Operational Notes & Side Effects (if any) */}
          {(analysis.procedural.hasConditionals || analysis.procedural.hasMutations || analysis.procedural.hasExceptions) && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {analysis.procedural.hasConditionals && (
                <div className={`p-3 rounded-xl border flex flex-col gap-1.5 ${
                  dark ? "border-purple-900/50 bg-purple-950/20 text-purple-200" : "border-purple-200 bg-purple-50/80 text-purple-950 shadow-2xs"
                }`}>
                  <span className="text-xs font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400">
                    Conditional Branching
                  </span>
                  <ul className="text-xs list-disc list-inside space-y-1">
                    {analysis.procedural.conditionalNotes?.map((note, idx) => (
                      <li key={idx}>{note}</li>
                    ))}
                  </ul>
                </div>
              )}

              {analysis.procedural.hasMutations && (
                <div className={`p-3 rounded-xl border flex flex-col gap-1.5 ${
                  dark ? "border-rose-900/50 bg-rose-950/20 text-rose-200" : "border-rose-200 bg-rose-50/80 text-rose-950 shadow-2xs"
                }`}>
                  <span className="text-xs font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400">
                    DML Mutations
                  </span>
                  <ul className="text-xs list-disc list-inside space-y-1">
                    {analysis.procedural.mutationNotes?.map((note, idx) => (
                      <li key={idx}>{note}</li>
                    ))}
                  </ul>
                </div>
              )}

              {analysis.procedural.hasExceptions && (
                <div className={`p-3 rounded-xl border flex flex-col gap-1.5 ${
                  dark ? "border-red-900/50 bg-red-950/20 text-red-200" : "border-red-200 bg-red-50/80 text-red-950 shadow-2xs"
                }`}>
                  <span className="text-xs font-bold uppercase tracking-wider text-red-600 dark:text-red-400">
                    Exception Traps
                  </span>
                  <ul className="text-xs list-disc list-inside space-y-1">
                    {analysis.procedural.exceptionNotes?.map((note, idx) => (
                      <li key={idx}>{note}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* Section 5: Active Script Code Box */}
          <div
            className={`p-3.5 rounded-xl border flex flex-col gap-2.5 shadow-2xs ${
              dark
                ? "border-zinc-800/80 bg-zinc-900/50"
                : "border-slate-300 bg-slate-100"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className={`text-xs font-bold ${dark ? "text-zinc-200" : "text-slate-900"}`}>
                Source Script Analyzed:
              </span>
              <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-orange-500/15 text-orange-600 dark:text-orange-400 border border-orange-500/30">
                PL/SQL Block
              </span>
            </div>
            <pre
              className={`text-xs font-mono p-3.5 rounded-lg overflow-x-auto leading-relaxed border shadow-inner ${
                dark
                  ? "bg-black/80 text-zinc-200 border-zinc-800"
                  : "bg-slate-900 text-slate-100 border-slate-700"
              }`}
            >
              {plsql}
            </pre>
          </div>
        </div>
      )}

      {/* ── Tab Content: PL/SQL Theory ── */}
      {tab === "theory" && (
        <div
          className="rounded-2xl border p-5 flex flex-col gap-6"
          style={{ background: "var(--panel)", borderColor: "var(--border)" }}
        >
          {/* Header Banner */}
          <div className={`border-b pb-4 ${dark ? "border-zinc-800" : "border-slate-200"}`}>
            <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
              <div className="flex items-center gap-2">
                <span className="text-orange-500 text-lg">⚡</span>
                <h3 className={`text-base font-bold ${dark ? "text-zinc-100" : "text-slate-900"}`}>
                  PL/SQL Theory &amp; Command Mechanics
                </h3>
              </div>
              <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-full bg-orange-500/15 text-orange-600 dark:text-orange-400 border border-orange-500/30">
                Command-Specific Analysis
              </span>
            </div>
            <p className={`text-xs leading-relaxed ${dark ? "text-zinc-300" : "text-slate-700 font-medium"}`}>
              {analysis.theory.scriptOverview}
            </p>
          </div>

          {/* Section 1: Specific Keywords & Commands Used in This Script */}
          <div className="flex flex-col gap-3">
            <h4 className={`text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 ${
              dark ? "text-zinc-200" : "text-slate-900"
            }`}>
              <span>1. Commands &amp; Keywords Employed in This Script</span>
              <span className={`text-[10px] normal-case font-normal px-2 py-0.5 rounded-full border ${
                dark ? "bg-zinc-800 text-zinc-400 border-zinc-700" : "bg-slate-100 text-slate-600 border-slate-300"
              }`}>
                Theoretical mechanics for each active command
              </span>
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {analysis.theory.keywordsUsed.map((kw, i) => (
                <div
                  key={`${kw.keyword}-${i}`}
                  className={`p-4 rounded-xl border flex flex-col gap-2.5 transition-all ${
                    dark
                      ? "border-zinc-800 bg-zinc-900/40 hover:border-zinc-700"
                      : "border-slate-200 bg-white hover:border-slate-300 shadow-2xs"
                  }`}
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded border ${
                      dark ? "bg-orange-950/80 text-orange-300 border-orange-700/60" : "bg-orange-100 text-orange-950 border-orange-300 font-bold"
                    }`}>
                      {kw.keyword}
                    </span>
                    <span className={`text-[10px] font-mono px-2 py-0.5 rounded border truncate max-w-[200px] ${
                      dark ? "bg-zinc-800/80 text-zinc-400 border-zinc-700" : "bg-slate-100 text-slate-700 border-slate-300 font-medium"
                    }`}>
                      {kw.syntaxInScript}
                    </span>
                  </div>

                  <div className="flex flex-col gap-1">
                    <span className={`text-[11px] font-bold uppercase tracking-wider ${
                      dark ? "text-zinc-400" : "text-slate-500"
                    }`}>
                      Theoretical Concept
                    </span>
                    <p className={`text-xs leading-relaxed ${dark ? "text-zinc-300" : "text-slate-800"}`}>
                      {kw.theoreticalConcept}
                    </p>
                  </div>

                  <div className={`p-2.5 rounded-lg border flex flex-col gap-1 ${
                    dark ? "bg-zinc-950/60 border-zinc-800" : "bg-slate-50 border-slate-200"
                  }`}>
                    <span className={`text-[10px] font-bold uppercase tracking-wider ${
                      dark ? "text-sky-400" : "text-sky-800"
                    }`}>
                      Internal Engine Workflow
                    </span>
                    <p className={`text-[11px] leading-relaxed ${dark ? "text-zinc-300" : "text-slate-700"}`}>
                      {kw.engineWorkflow}
                    </p>
                  </div>

                  <div className={`text-[11px] leading-relaxed pt-1 ${
                    dark ? "text-white" : "text-slate-800"
                  }`}>
                    <strong className={dark ? "text-emerald-400" : "text-emerald-600"}>Best Practice: </strong>
                    {kw.bestPractices}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section 2: Engine Collaboration & Context Switching */}
          <div className="flex flex-col gap-3">
            <h4 className={`text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 ${
              dark ? "text-zinc-200" : "text-slate-900"
            }`}>
              <span>2. Engine Collaboration &amp; Context Switching</span>
              <span className={`text-[10px] normal-case font-normal px-2 py-0.5 rounded-full border ${
                dark ? "bg-zinc-800 text-zinc-400 border-zinc-700" : "bg-slate-100 text-slate-600 border-slate-300"
              }`}>
                PL/SQL Procedural VM vs SQL Relational Engine
              </span>
            </h4>

            <div className={`p-4 rounded-xl border flex flex-col gap-3 ${
              dark ? "border-zinc-800/80 bg-zinc-900/40" : "border-slate-200 bg-white shadow-2xs"
            }`}>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className={`p-3 rounded-lg border flex flex-col gap-1.5 ${
                  dark ? "bg-zinc-950/60 border-zinc-800" : "bg-slate-50 border-slate-200"
                }`}>
                  <span className={`text-[10px] font-bold uppercase tracking-wider ${
                    dark ? "text-indigo-400" : "text-indigo-900"
                  }`}>
                    PL/SQL Engine (Procedural VM)
                  </span>
                  <p className={`text-xs leading-relaxed ${dark ? "text-zinc-300" : "text-slate-800"}`}>
                    {analysis.theory.engineCollaboration.plsqlEngineRole}
                  </p>
                </div>

                <div className={`p-3 rounded-lg border flex flex-col gap-1.5 ${
                  dark ? "bg-zinc-950/60 border-zinc-800" : "bg-slate-50 border-slate-200"
                }`}>
                  <span className={`text-[10px] font-bold uppercase tracking-wider ${
                    dark ? "text-sky-400" : "text-sky-900"
                  }`}>
                    SQL Engine (Relational)
                  </span>
                  <p className={`text-xs leading-relaxed ${dark ? "text-zinc-300" : "text-slate-800"}`}>
                    {analysis.theory.engineCollaboration.sqlEngineRole}
                  </p>
                </div>

                <div className={`p-3 rounded-lg border flex flex-col gap-1.5 ${
                  dark ? "bg-zinc-950/60 border-zinc-800" : "bg-slate-50 border-slate-200"
                }`}>
                  <span className={`text-[10px] font-bold uppercase tracking-wider ${
                    dark ? "text-amber-400" : "text-amber-900"
                  }`}>
                    Context Switch Profile
                  </span>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs font-mono font-bold ${dark ? "text-zinc-100" : "text-slate-900"}`}>
                      {analysis.theory.engineCollaboration.contextSwitchCount}
                    </span>
                    <span className={`text-[10px] font-mono px-2 py-0.5 rounded border ${
                      analysis.theory.engineCollaboration.efficiencyRating.includes("High") || analysis.theory.engineCollaboration.efficiencyRating.includes("Bulk")
                        ? dark ? "bg-emerald-950/80 text-emerald-300 border-emerald-700/60" : "bg-emerald-100 text-emerald-950 border-emerald-300 font-bold"
                        : dark ? "bg-amber-950/80 text-amber-300 border-amber-700/60" : "bg-amber-100 text-amber-950 border-amber-300 font-bold"
                    }`}>
                      {analysis.theory.engineCollaboration.efficiencyRating}
                    </span>
                  </div>
                </div>
              </div>

              <p className={`text-xs leading-relaxed pt-2 border-t ${
                dark ? "border-zinc-800 text-zinc-300" : "border-slate-200 text-slate-700"
              }`}>
                {analysis.theory.engineCollaboration.explanation}
              </p>
            </div>
          </div>

          {/* Section 3: Oracle Memory Architecture & PGA Allocations */}
          <div className="flex flex-col gap-3">
            <h4 className={`text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 ${
              dark ? "text-zinc-200" : "text-slate-900"
            }`}>
              <span>3. Oracle Memory Architecture (PGA &amp; Work Areas)</span>
              <span className={`text-[10px] normal-case font-normal px-2 py-0.5 rounded-full border ${
                dark ? "bg-zinc-800 text-zinc-400 border-zinc-700" : "bg-slate-100 text-slate-600 border-slate-300"
              }`}>
                Memory structures leveraged during execution
              </span>
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className={`p-4 rounded-xl border flex flex-col gap-2 ${
                dark ? "border-zinc-800 bg-zinc-900/40 text-zinc-300" : "border-slate-200 bg-white text-slate-800 shadow-2xs"
              }`}>
                <h5 className={`text-xs font-bold uppercase tracking-wide flex items-center gap-1.5 ${
                  dark ? "text-indigo-400" : "text-indigo-900 font-bold"
                }`}>
                  <span>🧠</span>
                  <span>PGA Allocation</span>
                </h5>
                <p className="text-xs leading-relaxed">
                  {analysis.theory.memoryArchitecture.pgaAllocation}
                </p>
              </div>

              <div className={`p-4 rounded-xl border flex flex-col gap-2 ${
                dark ? "border-zinc-800 bg-zinc-900/40 text-zinc-300" : "border-slate-200 bg-white text-slate-800 shadow-2xs"
              }`}>
                <h5 className={`text-xs font-bold uppercase tracking-wide flex items-center gap-1.5 ${
                  dark ? "text-sky-400" : "text-sky-900 font-bold"
                }`}>
                  <span>📁</span>
                  <span>Private SQL Area</span>
                </h5>
                <p className="text-xs leading-relaxed">
                  {analysis.theory.memoryArchitecture.cursorWorkArea}
                </p>
              </div>

              <div className={`p-4 rounded-xl border flex flex-col gap-2 ${
                dark ? "border-zinc-800 bg-zinc-900/40 text-zinc-300" : "border-slate-200 bg-white text-slate-800 shadow-2xs"
              }`}>
                <h5 className={`text-xs font-bold uppercase tracking-wide flex items-center gap-1.5 ${
                  dark ? "text-orange-400" : "text-orange-900 font-bold"
                }`}>
                  <span>📟</span>
                  <span>DBMS_OUTPUT Buffer</span>
                </h5>
                <p className="text-xs leading-relaxed">
                  {analysis.theory.memoryArchitecture.bufferState}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
