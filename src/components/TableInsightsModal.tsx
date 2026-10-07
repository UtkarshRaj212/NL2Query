"use client";

import React, { useState, useEffect, useMemo } from "react";
import type { Table } from "@/lib/schema";
import {
  analyzeDatabase,
  type DatabaseInsightReport,
  type TableInsight,
  type ColumnInsight,
} from "@/lib/databaseInsights";

interface TableInsightsModalProps {
  isOpen: boolean;
  onClose: () => void;
  schema: Table[];
  initialTableName?: string;
  onApplyQuery?: (query: string) => void;
}

export function TableInsightsModal({
  isOpen,
  onClose,
  schema,
  initialTableName,
  onApplyQuery,
}: TableInsightsModalProps) {
  const [activeTab, setActiveTab] = useState<"table" | "quality" | "suggestions">("table");
  const [selectedTableName, setSelectedTableName] = useState<string>(
    initialTableName || (schema[0]?.name ?? ""),
  );
  const [copiedQueryId, setCopiedQueryId] = useState<string | null>(null);

  // Synchronize ONLY when modal opens or initialTableName prop changes
  useEffect(() => {
    if (isOpen) {
      if (initialTableName && schema.some((t) => t.name === initialTableName)) {
        setSelectedTableName(initialTableName);
      } else if (schema.length > 0 && !schema.some((t) => t.name === selectedTableName)) {
        setSelectedTableName(schema[0].name);
      }
    }
  }, [isOpen, initialTableName, schema]);

  // Handle ESC key to dismiss modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // Compute profile report
  const report: DatabaseInsightReport = useMemo(() => {
    return analyzeDatabase(schema);
  }, [schema]);

  const currentTable: TableInsight | undefined =
    report.tables[selectedTableName] || report.tables[schema[0]?.name ?? ""];

  const handleCopySql = (id: string, sql: string) => {
    navigator.clipboard.writeText(sql);
    setCopiedQueryId(id);
    setTimeout(() => {
      setCopiedQueryId(null);
    }, 2000);
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 md:p-8 bg-black/75 backdrop-blur-xs transition-opacity animate-in fade-in duration-150"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="insights-dialog-title"
    >
      {/* 
        IMPORTANT CONSTRAINT: THIS CARD SHOULD NOT COVER THE ENTIRE SCREEN 
        Capped at max-w-4xl, max-h-[85vh], centered overlay with margins
      */}
      <div
        className="w-full max-w-4xl max-h-[85vh] rounded-2xl border border-zinc-700 shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-150 bg-[#12141a] text-white"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header - White Text, No Data Health, No Emojis */}
        <div className="px-5 py-4 border-b border-zinc-800 flex items-center justify-between gap-4 shrink-0 bg-[#151821]">
          <div className="flex items-center gap-3 flex-wrap">
            <div className="p-2 rounded-xl bg-white/10 border border-white/20 text-white">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                />
              </svg>
            </div>
            <div>
              <h2 id="insights-dialog-title" className="text-base sm:text-lg font-bold text-white">
                Database & Table Insights
              </h2>
              <p className="text-xs text-white/80 mt-0.5">
                Automated statistical profiling, schema hygiene checks, and query recommendations
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-white hover:text-white/80 transition-colors border border-zinc-700 cursor-pointer hover:bg-white/10"
            aria-label="Close insights modal"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Global Summary Bar - All White Text, Data Health Removed */}
        <div className="px-5 py-2.5 border-b border-zinc-800 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs shrink-0 bg-[#181b24]">
          <div className="flex flex-col">
            <span className="text-white/70 text-[11px] font-medium">Total Tables</span>
            <span className="font-bold text-sm text-white">{report.totalTables}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-white/70 text-[11px] font-medium">Total Columns</span>
            <span className="font-bold text-sm text-white">{report.totalColumns}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-white/70 text-[11px] font-medium">Total Rows</span>
            <span className="font-bold text-sm text-white">{report.totalRows.toLocaleString()}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-white/70 text-[11px] font-medium">Estimated Storage Size</span>
            <span className="font-bold text-sm font-mono text-white">
              {report.totalStorageFormatted}
            </span>
          </div>
        </div>

        {/* Navigation Tabs - No Emojis, All White Text */}
        <div className="px-5 pt-3 pb-2 border-b border-zinc-800 flex items-center justify-between gap-3 shrink-0 flex-wrap bg-[#151821]">
          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-white/5 border border-zinc-700 text-xs">
            <button
              type="button"
              onClick={() => setActiveTab("table")}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === "table"
                  ? "bg-white text-black font-bold shadow-sm"
                  : "text-white hover:text-white/80 hover:bg-white/10"
              }`}
            >
              <span>Table Profile</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("quality")}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === "quality"
                  ? "bg-white text-black font-bold shadow-sm"
                  : "text-white hover:text-white/80 hover:bg-white/10"
              }`}
            >
              <span>Data Quality</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-full font-bold bg-white/20 text-white">
                {report.qualityChecks.length}
              </span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("suggestions")}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === "suggestions"
                  ? "bg-white text-black font-bold shadow-sm"
                  : "text-white hover:text-white/80 hover:bg-white/10"
              }`}
            >
              <span>Smart Suggestions</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-white/20 text-white font-bold">
                {report.smartSuggestions.length}
              </span>
            </button>
          </div>

          {/* Quick Table Switcher in Tab bar */}
          {activeTab === "table" && (
            <div className="flex items-center gap-1.5 overflow-x-auto max-w-full pb-1 scrollbar-thin">
              <span className="text-xs font-semibold mr-1 text-white/80 whitespace-nowrap">
                Select Table:
              </span>
              {schema.map((t) => (
                <button
                  key={t.name}
                  type="button"
                  onClick={() => setSelectedTableName(t.name)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-mono transition-all cursor-pointer border whitespace-nowrap ${
                    selectedTableName === t.name
                      ? "bg-white text-black font-bold border-white shadow-sm"
                      : "bg-white/10 text-white hover:bg-white/20 border-white/20"
                  }`}
                >
                  {t.name}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Scrollable Body Content - All White Text */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5 scrollbar-thin bg-[#12141a]">
          {/* TAB 1: TABLE PROFILE */}
          {activeTab === "table" && currentTable && (
            <div className="space-y-4">
              {/* Direct Table Switching Buttons inside the Card */}
              <div className="p-3 rounded-xl border border-zinc-800 bg-[#181b24] flex items-center gap-2 overflow-x-auto scrollbar-thin">
                <span className="text-xs font-bold text-white shrink-0 uppercase tracking-wider mr-1">
                  Active Table:
                </span>
                <div className="flex items-center gap-1.5 flex-wrap">
                  {schema.map((t) => (
                    <button
                      key={t.name}
                      type="button"
                      onClick={() => setSelectedTableName(t.name)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all cursor-pointer border whitespace-nowrap ${
                        selectedTableName === t.name
                          ? "bg-white text-black font-bold border-white shadow-md scale-102"
                          : "bg-white/10 text-white hover:bg-white/20 border-white/20 font-medium"
                      }`}
                    >
                      {t.name} ({t.columns?.length || 0} cols, {t.rows?.length || 0} rows)
                    </button>
                  ))}
                </div>
              </div>

              {/* Table Metadata Header Card */}
              <div className="p-4 rounded-xl border border-zinc-800 bg-[#181b24] flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-mono text-lg font-bold text-white">
                      {currentTable.name}
                    </h3>
                    <span className="text-xs px-2 py-0.5 rounded-md border border-white/20 font-mono bg-white/10 text-white">
                      {currentTable.columnCount} columns
                    </span>
                  </div>
                  <div className="flex items-center gap-3 mt-2 text-xs text-white/90 flex-wrap">
                    <span>
                      Primary Key:{" "}
                      {currentTable.primaryKeys.length > 0 ? (
                        <span className="font-bold text-white font-mono bg-white/10 px-1.5 py-0.5 rounded border border-white/20">
                          {currentTable.primaryKeys.join(", ")}
                        </span>
                      ) : (
                        <span className="text-white/60 italic">None</span>
                      )}
                    </span>
                    <span>•</span>
                    <span>
                      Foreign Keys:{" "}
                      {currentTable.foreignKeys.length > 0 ? (
                        <span className="font-mono text-white font-medium">
                          {currentTable.foreignKeys
                            .map((fk) => `${fk.column} → ${fk.targetTable}.${fk.targetColumn}`)
                            .join(", ")}
                        </span>
                      ) : (
                        <span className="text-white/60 italic">None</span>
                      )}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-xs border-t md:border-t-0 md:border-l border-zinc-700 pt-3 md:pt-0 md:pl-4">
                  <div>
                    <div className="text-white/70 text-[10px]">Rows</div>
                    <div className="font-bold text-base font-mono text-white">
                      {currentTable.rowCount.toLocaleString()}
                    </div>
                  </div>
                  <div className="w-px h-6 bg-white/20"></div>
                  <div>
                    <div className="text-white/70 text-[10px]">Storage Size</div>
                    <div className="font-bold text-base font-mono text-white">
                      {currentTable.storageSizeFormatted}
                    </div>
                  </div>
                  <div className="w-px h-6 bg-white/20"></div>
                  <div>
                    <div className="text-white/70 text-[10px]">Catalog Status</div>
                    <div className="font-medium text-xs text-white">Live (In-memory)</div>
                  </div>
                </div>
              </div>

              {/* Column Statistics Cards */}
              <div>
                <h4 className="text-xs font-semibold uppercase tracking-wider mb-2.5 text-white">
                  Column Profiles & Distributions ({currentTable.columns.length})
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {currentTable.columns.map((col) => (
                    <ColumnCard key={col.name} column={col} />
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: DATA QUALITY AUDIT - Health Score Removed, All White Text */}
          {activeTab === "quality" && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl border border-zinc-800 bg-[#181b24] flex items-center justify-between gap-4">
                <div>
                  <h3 className="font-bold text-sm sm:text-base text-white">
                    Database Schema & Referential Integrity Audits
                  </h3>
                  <p className="text-xs text-white/80 mt-0.5">
                    Automated validation of primary keys, foreign key references, missing values, empty relations, and formats.
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                {report.qualityChecks.map((check) => (
                  <div
                    key={check.id}
                    className="p-4 rounded-xl border border-zinc-800 bg-[#181b24] transition-all"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h4 className="text-sm font-semibold text-white">
                          {check.title}
                        </h4>
                        <p className="text-xs text-white/80 mt-0.5">
                          {check.description}
                        </p>
                      </div>

                      <span className="text-xs px-2.5 py-0.5 rounded-md font-semibold border border-white/20 bg-white/10 text-white">
                        {check.status === "pass" ? "Passed" : `${check.count} flagged`}
                      </span>
                    </div>

                    {/* Details list - All White Text */}
                    <div className="mt-3 text-xs font-mono space-y-1">
                      {check.details.map((detail, idx) => (
                        <div
                          key={idx}
                          className="p-2 rounded-lg border border-white/10 bg-white/5 text-white"
                        >
                          {detail}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: SMART SUGGESTIONS - No Emojis, All White Text */}
          {activeTab === "suggestions" && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl border border-zinc-800 bg-[#181b24]">
                <h3 className="font-bold text-sm sm:text-base text-white">
                  Smart Suggestions
                </h3>
                <p className="text-xs text-white/80 mt-0.5">
                  Tailored analytical questions & ready-to-run queries synthesized from current table sizes, distinct values, and distributions.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {report.smartSuggestions.map((sug) => (
                  <div
                    key={sug.id}
                    className="p-4 rounded-xl border border-zinc-800 bg-[#181b24] flex flex-col justify-between gap-3 transition-all hover:border-white/40"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 text-xs">
                        <span className="font-mono text-white bg-white/10 border border-white/20 px-2 py-0.5 rounded-md font-semibold">
                          {sug.category.toUpperCase()}
                        </span>
                        <span className="font-mono text-white/70 text-[11px]">
                          table: {sug.tableName}
                        </span>
                      </div>

                      <div className="mt-2.5">
                        <span className="text-[11px] font-medium text-white/90 block">
                          {sug.trigger}
                        </span>
                        <h4 className="text-sm font-semibold mt-0.5 text-white">
                          {sug.question}
                        </h4>
                      </div>

                      <pre className="mt-2.5 p-2.5 rounded-lg border border-zinc-700 bg-[#12141a] text-white text-xs font-mono overflow-x-auto whitespace-pre-wrap select-all">
                        {sug.sql}
                      </pre>
                    </div>

                    <div className="flex items-center justify-end gap-2 pt-2 border-t border-zinc-800">
                      <button
                        type="button"
                        onClick={() => handleCopySql(sug.id, sug.sql)}
                        className="px-2.5 py-1 rounded-lg text-xs font-medium border border-zinc-700 text-white transition-colors cursor-pointer hover:bg-white/10 flex items-center gap-1.5"
                      >
                        {copiedQueryId === sug.id ? (
                          <span className="text-white font-bold">Copied!</span>
                        ) : (
                          <>
                            <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                            </svg>
                            <span>Copy SQL</span>
                          </>
                        )}
                      </button>

                      {onApplyQuery && (
                        <button
                          type="button"
                          onClick={() => {
                            onApplyQuery(sug.sql);
                            onClose();
                          }}
                          className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-white text-black hover:bg-white/90 transition-colors cursor-pointer flex items-center gap-1 shadow-sm"
                        >
                          <span>Use Query →</span>
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-zinc-800 flex items-center justify-between text-xs text-white/80 shrink-0 bg-[#151821]">
          <span>
            Press <kbd className="px-1.5 py-0.5 rounded bg-white/10 font-mono text-[11px] border border-white/20 text-white">Esc</kbd> to close
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1 rounded-lg border border-zinc-700 text-white font-medium hover:bg-white/10 transition-colors cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}

/**
 * Individual Column Stat Card - All White Text, No Emojis
 */
function ColumnCard({ column }: { column: ColumnInsight }) {
  return (
    <div className="p-3.5 rounded-xl border border-zinc-800 bg-[#181b24] flex flex-col justify-between gap-2.5 text-white">
      <div>
        {/* Header: Column Name, Type, PK/FK */}
        <div className="flex items-center justify-between gap-2 border-b border-zinc-800 pb-2">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="font-mono font-bold text-sm text-white">
              {column.name}
            </span>
            <span className="font-mono text-[11px] px-1.5 py-0.2 rounded bg-white/10 border border-white/20 text-white font-medium">
              {column.type}
            </span>
          </div>

          <div className="flex items-center gap-1">
            {column.isPk && (
              <span className="font-bold text-[10px] text-white bg-white/15 border border-white/30 px-1.5 py-0.5 rounded">
                PK
              </span>
            )}
            {column.fk && (
              <span className="text-[10px] text-white bg-white/15 border border-white/30 px-1.5 py-0.5 rounded font-mono font-semibold">
                FK → {column.fk.table}
              </span>
            )}
            {column.isUnique && (
              <span className="text-[10px] font-semibold text-white bg-white/15 border border-white/30 px-1.5 py-0.5 rounded">
                Unique
              </span>
            )}
          </div>
        </div>

        {/* Column Metrics Grid - All White Text */}
        <div className="mt-2.5 space-y-1.5 text-xs text-white">
          {/* NULL values */}
          <div className="flex items-center justify-between">
            <span className="text-white/80">NULL values:</span>
            <span className="font-mono font-semibold text-white">
              {column.nullPercentage}% ({column.nullCount}/{column.totalCount})
            </span>
          </div>

          {/* Distinct / Unique values */}
          <div className="flex items-center justify-between">
            <span className="text-white/80">Unique values:</span>
            <span className="font-mono font-semibold text-white">
              {column.distinctCount}
            </span>
          </div>

          {/* Most frequent values */}
          {column.mostCommon && (
            <div className="flex items-center justify-between gap-2">
              <span className="text-white/80 truncate">Most common:</span>
              <span className="font-mono font-medium text-right truncate max-w-[170px] text-white">
                {column.mostCommon.value}{" "}
                <span className="text-white/70 text-[11px]">({column.mostCommon.percentage}%)</span>
              </span>
            </div>
          )}

          {/* Numeric stats: Min, Max, Average */}
          {column.isNumeric && column.min !== undefined && column.max !== undefined && (
            <div className="pt-2 mt-2 border-t border-zinc-800 grid grid-cols-3 gap-1 text-[11px] font-mono text-center">
              <div className="p-1 rounded bg-white/5 border border-white/10">
                <div className="text-white/70 text-[9px]">Min</div>
                <div className="font-semibold truncate text-white">{column.formattedMin}</div>
              </div>
              <div className="p-1 rounded bg-white/5 border border-white/10">
                <div className="text-white/70 text-[9px]">Max</div>
                <div className="font-semibold truncate text-white">{column.formattedMax}</div>
              </div>
              <div className="p-1 rounded bg-white/5 border border-white/10">
                <div className="text-white/70 text-[9px]">Average</div>
                <div className="font-semibold truncate text-white">{column.formattedAvg}</div>
              </div>
            </div>
          )}

          {/* Date stats: Range */}
          {column.isDate && column.min && column.max && (
            <div className="pt-2 mt-2 border-t border-zinc-800 text-[11px] font-mono flex items-center justify-between">
              <span className="text-white/70">Span:</span>
              <span className="text-white truncate">
                {String(column.formattedMin)} → {String(column.formattedMax)}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
