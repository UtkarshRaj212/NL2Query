import { useEffect, useRef, useState, useMemo } from "react";
import type { Table } from "@/lib/schema";
import type { PipelineStep, Row } from "@/lib/sqlEngine";
import type { Tab, ThemeId } from "./nlSqlTypes";
import type { QueryExplanation } from "@/lib/queryExplainer";
import { Theory } from "./Theory";
import { ChenERDiagram } from "./ChenERDiagram";
import { QueryExplanationView } from "./QueryExplanationView";

function getStageBadgeClass(stage: string, theme: ThemeId = "slate"): string {
  /*
  // Volt theme badges
  if ((theme as string) === "volt") {
    switch (stage) {
      case "MUTATION":
      case "DELETE":
      case "DROP":
      case "LIMIT":
        return "bg-black text-[#ff3333] border-2 border-[#ff3333] font-bold";
      case "SELECT":
      case "COMMIT":
      case "DISTINCT":
      case "AGGREGATE":
        return "bg-black text-[#00ff66] border-2 border-[#00ff66] font-bold";
      default:
        return "bg-black text-[#ffff00] border-2 border-[#ffff00] font-bold";
    }
  }
  */

  if (theme === "slate") {
    return "bg-zinc-800 text-zinc-100 border border-zinc-700 font-semibold";
  }

  /*
  // Lazuli theme badges
  if ((theme as string) === "lazuli") {
    switch (stage) {
      case "FROM":
      case "JOIN":
        return "bg-blue-600/90 text-white border border-blue-400/40";
      case "WHERE":
      case "HAVING":
        return "bg-indigo-600/90 text-white border border-indigo-400/40";
      case "SELECT":
      case "AGGREGATE":
        return "bg-sky-600/90 text-white border border-sky-400/40";
      default:
        return "bg-slate-700 text-slate-100 border border-slate-600";
    }
  }
  */

  if (theme === "pearl") {
    switch (stage) {
      case "FROM":
      case "JOIN":
        return "bg-blue-600 text-white shadow-xs font-semibold";
      case "WHERE":
      case "HAVING":
        return "bg-indigo-600 text-white shadow-xs font-semibold";
      case "SELECT":
      case "AGGREGATE":
        return "bg-sky-600 text-white shadow-xs font-semibold";
      case "GROUP BY":
        return "bg-purple-600 text-white shadow-xs font-semibold";
      default:
        return "bg-slate-700 text-white shadow-xs font-semibold";
    }
  }

  return "bg-zinc-800 text-zinc-100 border border-zinc-700 font-semibold";
}

interface VisualizationPanelProps {
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
  onExportCSV: () => void;
  onExportReport: () => void;
  sql: string;
  mermaidSource: string;
  schema: Table[];
  dark: boolean;
  theme?: ThemeId;
  explanation?: QueryExplanation | null;
  hasExecuted?: boolean;
}

export function VisualizationPanel({
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
  onExportCSV,
  onExportReport,
  sql,
  mermaidSource,
  schema,
  dark,
  theme = "slate",
  explanation,
  hasExecuted = false,
}: VisualizationPanelProps) {
  return (
    <section
      className="flex flex-col gap-4 min-w-0"
      aria-label="Visualization panel"
    >
      <div className="flex gap-2 flex-wrap">
        {(["result", "schema", "explanation", "theory"] as const).map((item) => {
          const isActive = tab === item;
          return (
            <button
              key={item}
              onClick={() => onTabChange(item)}
              className="px-3.5 py-1.5 rounded-lg text-sm capitalize cursor-pointer transition-all border font-semibold shadow-xs"
              style={
                isActive
                  ? {
                      background: "var(--accent-gradient, var(--accent))",
                      color: "var(--accent-foreground)",
                      borderColor: "var(--accent)",
                    }
                  : {
                      background: "var(--panel)",
                      color: "var(--muted)",
                      borderColor: "var(--border)",
                    }
              }
            >
              {item === "result"
                ? "Pipeline & Result"
                : item === "schema"
                  ? "Schema / ER"
                  : item === "explanation"
                    ? "Explanation"
                    : "Theory"}
            </button>
          );
        })}
      </div>

      {tab === "result" && (
        <ResultView
          steps={steps}
          activeStep={activeStep}
          current={current}
          playing={playing}
          onPlay={onPlay}
          onStepChange={onStepChange}
          finalRows={finalRows}
          columns={columns}
          onExportCSV={onExportCSV}
          onExportReport={onExportReport}
          sql={sql}
          theme={theme}
          hasExecuted={hasExecuted}
        />
      )}
      {tab === "schema" && (
        <SchemaView schema={schema} source={mermaidSource} dark={dark} theme={theme} />
      )}
      {tab === "explanation" && (
        <QueryExplanationView
          explanation={explanation ?? null}
          hasExecuted={hasExecuted}
        />
      )}
      {tab === "theory" && (
        <Theory
          current={current}
          steps={steps}
          activeStep={activeStep}
          onStepChange={onStepChange}
          sql={sql}
          schema={schema}
          explanation={explanation}
          hasExecuted={hasExecuted}
        />
      )}
    </section>
  );
}

function ResultView({
  steps,
  activeStep,
  current,
  playing,
  onPlay,
  onStepChange,
  finalRows,
  columns,
  onExportCSV,
  onExportReport,
  sql,
  theme = "slate",
  hasExecuted,
}: Omit<
  VisualizationPanelProps,
  "tab" | "onTabChange" | "mermaidSource" | "schema" | "dark"
>) {
  return (
    <>
      <div
        className="panel p-4"
        style={{
          background: "var(--panel)",
          borderColor: "var(--border)",
          color: "var(--foreground)",
        }}
      >
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-bold text-sm md:text-base tracking-tight" style={{ color: "var(--foreground)" }}>
            Execution Pipeline
          </h2>
          <button
            onClick={onPlay}
            disabled={!steps.length}
            className="px-3 py-1 rounded-lg text-xs font-semibold disabled:opacity-40 flex items-center gap-1.5 cursor-pointer shadow-xs transition-opacity hover:opacity-90 border"
            style={{
              background: "var(--accent-gradient, var(--accent))",
              color: "var(--accent-foreground)",
              borderColor: "var(--accent)",
            }}
          >
            {playing ? (
              <>
                <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
                </svg>
                <span>Pause</span>
              </>
            ) : (
              <>
                <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>
                <span>Animate</span>
              </>
            )}
          </button>
        </div>
        <pre
          className="mb-3 overflow-x-auto whitespace-pre-wrap wrap-break-word rounded-lg p-2.5 text-xs font-mono border"
          style={{
            background: "var(--surface-subtle)",
            borderColor: "var(--border)",
            color: "var(--foreground)",
          }}
        >
          {sql}
        </pre>
        {steps.length === 0 ? (
          <p className="text-sm opacity-60" style={{ color: "var(--muted)" }}>
            Run a query to see its execution plan.
          </p>
        ) : (
          <ol className="flex flex-wrap gap-2" role="list">
            {steps.map((step, index) => (
              <li key={index}>
                <button
                  onClick={() => onStepChange(index)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-transform cursor-pointer ${
                    index === activeStep
                      ? "scale-105 ring-2 ring-offset-2 ring-offset-[var(--background)] ring-[var(--accent)] font-bold shadow-md"
                      : "opacity-85 hover:opacity-100"
                  } ${getStageBadgeClass(step.stage, theme)}`}
                >
                  {step.stage}
                  <span className="ml-1 opacity-90">({step.rowCount})</span>
                </button>
              </li>
            ))}
          </ol>
        )}
      </div>

      {current && (
        <div
          className="panel p-4"
          style={{
            background: "var(--panel)",
            borderColor: "var(--border)",
            color: "var(--foreground)",
          }}
        >
          <h3 className="font-bold text-base mb-1" style={{ color: "var(--foreground)" }}>
            Step {activeStep + 1}/{steps.length}: {current.title}
          </h3>
          <p className="text-xs opacity-75 mb-3" style={{ color: "var(--foreground)" }}>
            {current.detail}
          </p>
          {current.stage === "JOIN" && current.joinDetails && current.joinDetails.matchedPairs.length > 0 ? (
            <JoinAnimationVisualizer step={current} theme={theme} />
          ) : (
            <StepTable step={current} />
          )}
        </div>
      )}

      {hasExecuted && (
        <div
          className="panel p-4"
          style={{
            background: "var(--panel)",
            borderColor: "var(--border)",
            color: "var(--foreground)",
          }}
        >
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-base" style={{ color: "var(--foreground)" }}>
              Final Result ({finalRows.length} row
              {finalRows.length !== 1 && "s"})
            </h3>
            <div className="flex gap-2">
              <button
                onClick={onExportCSV}
                className="text-xs px-2.5 py-1 rounded-lg border transition-colors flex items-center gap-1.5 cursor-pointer font-medium hover:opacity-90"
                style={{
                  background: "var(--surface-subtle)",
                  borderColor: "var(--border)",
                  color: "var(--foreground)",
                }}
              >
                <svg className="w-3.5 h-3.5 opacity-70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                <span>CSV</span>
              </button>
              <button
                onClick={onExportReport}
                className="text-xs px-2.5 py-1 rounded-lg border transition-colors flex items-center gap-1.5 cursor-pointer font-medium hover:opacity-90"
                style={{
                  background: "var(--surface-subtle)",
                  borderColor: "var(--border)",
                  color: "var(--foreground)",
                }}
              >
                <svg className="w-3.5 h-3.5 opacity-70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                <span>Report</span>
              </button>
            </div>
          </div>
          {finalRows.length > 0 ? (
            <ResultTable rows={finalRows} cols={columns} />
          ) : (
            <div
              className="p-3.5 rounded-lg border text-xs"
              style={{
                background: "var(--surface-subtle)",
                borderColor: "var(--border)",
                color: "var(--muted)",
              }}
            >
              Query executed successfully, but no rows matched the condition.
            </div>
          )}
        </div>
      )}
    </>
  );
}

function SchemaView({
  schema,
  source,
  dark,
  theme = "slate",
}: {
  schema: Table[];
  source: string;
  dark: boolean;
  theme?: ThemeId;
}) {
  return (
    <div
      className="panel p-4 overflow-auto"
      style={{
        background: "var(--panel)",
        borderColor: "var(--border)",
        color: "var(--foreground)",
      }}
    >
      <h2 className="font-bold mb-3 text-base" style={{ color: "var(--foreground)" }}>
        Database Schema
      </h2>

      {/* Grid 2-per-row layout (restored) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {schema.map((table) => (
          <div
            key={table.name}
            className="p-3.5 rounded-xl border flex flex-col justify-between overflow-hidden"
            style={{
              background: "var(--surface-subtle)",
              borderColor: "var(--border)",
            }}
          >
            <div>
              <h3
                className="font-mono font-bold text-base mb-2 border-b pb-1.5 flex items-center justify-between"
                style={{ color: "var(--foreground)", borderColor: "var(--border)" }}
              >
                <span>{table.name}</span>
                <span className="text-xs font-semibold font-sans opacity-85" style={{ color: "var(--foreground)" }}>
                  {table.columns.length} cols
                </span>
              </h3>

              {/* Slider / Scroll track inside EACH box when text overflows */}
              <div className="overflow-x-auto scrollbar-thin max-w-full pb-1">
                <table className="text-sm w-full min-w-full">
                  <tbody>
                    {table.columns.map((column) => (
                      <tr key={column.name}>
                        <td
                          className="py-1 pr-2 font-mono text-sm whitespace-nowrap font-medium"
                          style={{ color: "var(--foreground)" }}
                        >
                          {column.name}
                        </td>
                        <td
                          className="font-mono text-xs whitespace-nowrap pr-2 font-medium"
                          style={{ color: "var(--muted)" }}
                        >
                          {column.type}
                        </td>
                        <td className="text-right font-mono text-xs whitespace-nowrap">
                          {column.pk && (
                            <span className="font-bold text-amber-600 dark:text-amber-400 bg-amber-500/15 border border-amber-500/30 px-1.5 py-0.5 rounded mr-1 inline-block">
                              PK
                            </span>
                          )}
                          {column.fk && (
                            <span className="text-sky-600 dark:text-sky-400 bg-sky-500/15 border border-sky-500/30 px-1.5 py-0.5 rounded text-xs inline-block font-mono font-semibold">
                              FK→{column.fk.table}.{column.fk.column}
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            <p
              className="text-xs font-medium opacity-85 mt-3 pt-1 border-t"
              style={{ color: "var(--foreground)", borderColor: "var(--border)" }}
            >
              {table.rows.length} sample rows
            </p>
          </div>
        ))}
      </div>

      {/* Chen ER Diagram Format (Enlarged fonts & shapes) */}
      <div className="mt-5">
        <h3 className="font-bold text-base mb-2" style={{ color: "var(--foreground)" }}>
          Entity-Relationship Diagram
        </h3>
        <ChenERDiagram schema={schema} theme={theme} />
        <details className="mt-3">
          <summary className="cursor-pointer text-sm font-semibold opacity-70 hover:opacity-100" style={{ color: "var(--foreground)" }}>
            Mermaid ER source
          </summary>
          <pre
            className="text-xs mt-2 overflow-x-auto p-2.5 rounded-lg border whitespace-pre-wrap font-mono"
            style={{
              background: "var(--surface-subtle)",
              borderColor: "var(--border)",
              color: "var(--foreground)",
            }}
          >
            {source}
          </pre>
        </details>
      </div>
    </div>
  );
}

function MermaidDiagram({ source, dark }: { source: string; dark: boolean }) {
  const diagramRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;
    const renderId = "er_" + Math.random().toString(36).slice(2, 9);
    void import("mermaid")
      .then(({ default: mermaid }) => {
        if (cancelled || !diagramRef.current) return;
        mermaid.initialize({
          startOnLoad: false,
          securityLevel: "strict",
          theme: dark ? "dark" : "neutral",
          themeVariables: {
            fontSize: "16px",
            fontFamily: "var(--font-sans), system-ui, sans-serif",
          },
          er: {
            fontSize: 16,
            useMaxWidth: false,
          },
        });
        return mermaid.render(renderId, source);
      })
      .then((result) => {
        if (cancelled || !diagramRef.current || !result) return;
        diagramRef.current.innerHTML = result.svg;
      })
      .catch((err) => {
        if (cancelled || !diagramRef.current) return;
        diagramRef.current.innerHTML = `<p class="text-xs text-red-500 p-2">ER Diagram rendering error: ${err instanceof Error ? err.message : String(err)}</p>`;
      });
    return () => {
      cancelled = true;
    };
  }, [source, dark]);

  return (
    <div
      ref={diagramRef}
      className="panel min-h-64 overflow-x-auto p-4 [&_svg]:mx-auto [&_svg]:min-w-[550px] [&_svg_text]:text-sm [&_svg_text]:font-semibold"
      style={{
        background: "var(--surface-subtle)",
        borderColor: "var(--border)",
      }}
      aria-label="Entity relationship diagram"
    />
  );
}

function JoinAnimationVisualizer({
  step,
  theme = "slate",
}: {
  step: PipelineStep;
  theme?: ThemeId;
}) {
  const details = step.joinDetails;
  const pairs = details?.matchedPairs ?? [];
  const [activeIdx, setActiveIdx] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [speed, setSpeed] = useState<"normal" | "fast" | "slow">("normal");
  const [viewMode, setViewMode] = useState<"visual" | "table">("visual");

  const intervalMs = speed === "fast" ? 900 : speed === "slow" ? 2500 : 1600;

  useEffect(() => {
    if (!isPlaying || pairs.length <= 1) return;
    const timer = setInterval(() => {
      setActiveIdx((prev) => (prev + 1) % pairs.length);
    }, intervalMs);
    return () => clearInterval(timer);
  }, [isPlaying, pairs.length, intervalMs]);

  if (!details || pairs.length === 0) {
    return <StepTable step={step} />;
  }

  const currentPair = pairs[activeIdx] ?? pairs[0];
  const accumulatedRows = pairs.slice(0, activeIdx + 1).map((p) => p.mergedRow);
  const allCols = step.columns.length > 0 ? step.columns : Object.keys(pairs[0]?.mergedRow ?? {});

  return (
    <div className="space-y-4">
      {/* Top Controls Bar */}
      <div
        className="flex flex-wrap items-center justify-between gap-2 p-2.5 rounded-xl border text-xs"
        style={{
          background: "var(--surface-subtle)",
          borderColor: "var(--border)",
        }}
      >
        <div className="flex items-center gap-2">
          <span
            className="px-2 py-0.5 rounded-full font-mono text-[11px] font-bold border"
            style={{
              background: "rgba(16, 185, 129, 0.15)",
              borderColor: "rgba(16, 185, 129, 0.4)",
              color: "#10b981",
            }}
          >
            {details.joinType} JOIN
          </span>
          <span className="font-medium text-xs opacity-90" style={{ color: "var(--foreground)" }}>
            Combining Row <span className="font-mono font-bold text-sky-400">{activeIdx + 1}</span> of{" "}
            <span className="font-mono font-bold">{pairs.length}</span> matches
          </span>
        </div>

        <div className="flex items-center gap-1.5 flex-wrap">
          {/* Stepper Buttons */}
          <button
            type="button"
            onClick={() => {
              setIsPlaying(false);
              setActiveIdx((prev) => (prev - 1 + pairs.length) % pairs.length);
            }}
            className="p-1 px-2 rounded-md border text-xs font-semibold hover:opacity-80 transition-opacity cursor-pointer"
            style={{
              background: "var(--panel)",
              borderColor: "var(--border)",
              color: "var(--foreground)",
            }}
            title="Previous match"
          >
            ◀
          </button>

          <button
            type="button"
            onClick={() => setIsPlaying((p) => !p)}
            className="px-2.5 py-1 rounded-md text-xs font-semibold flex items-center gap-1 border transition-opacity hover:opacity-90 cursor-pointer"
            style={{
              background: isPlaying ? "rgba(239, 68, 68, 0.2)" : "rgba(16, 185, 129, 0.2)",
              borderColor: isPlaying ? "rgba(239, 68, 68, 0.4)" : "rgba(16, 185, 129, 0.4)",
              color: isPlaying ? "#f87171" : "#34d399",
            }}
          >
            {isPlaying ? "⏸ Pause" : "▶ Play"}
          </button>

          <button
            type="button"
            onClick={() => {
              setIsPlaying(false);
              setActiveIdx((prev) => (prev + 1) % pairs.length);
            }}
            className="p-1 px-2 rounded-md border text-xs font-semibold hover:opacity-80 transition-opacity cursor-pointer"
            style={{
              background: "var(--panel)",
              borderColor: "var(--border)",
              color: "var(--foreground)",
            }}
            title="Next match"
          >
            ▶
          </button>

          {/* Speed Toggle */}
          <button
            type="button"
            onClick={() =>
              setSpeed((s) => (s === "normal" ? "fast" : s === "fast" ? "slow" : "normal"))
            }
            className="px-2 py-1 rounded-md border text-[11px] font-mono hover:opacity-80 transition-opacity cursor-pointer ml-1"
            style={{
              background: "var(--panel)",
              borderColor: "var(--border)",
              color: "var(--muted)",
            }}
            title="Animation Speed"
          >
            {speed === "fast" ? "2x Fast" : speed === "slow" ? "0.5x Slow" : "1x Speed"}
          </button>

          {/* View Mode Toggle */}
          <div className="flex border rounded-lg p-0.5 ml-2" style={{ borderColor: "var(--border)" }}>
            <button
              type="button"
              onClick={() => setViewMode("visual")}
              className={`px-2 py-0.5 rounded text-[11px] font-medium transition-all cursor-pointer ${
                viewMode === "visual"
                  ? "bg-sky-500/20 text-sky-400 font-bold"
                  : "opacity-60 hover:opacity-100"
              }`}
            >
              🎬 Animation
            </button>
            <button
              type="button"
              onClick={() => setViewMode("table")}
              className={`px-2 py-0.5 rounded text-[11px] font-medium transition-all cursor-pointer ${
                viewMode === "table"
                  ? "bg-sky-500/20 text-sky-400 font-bold"
                  : "opacity-60 hover:opacity-100"
              }`}
            >
              📋 Table
            </button>
          </div>
        </div>
      </div>

      {viewMode === "table" ? (
        <StepTable step={step} />
      ) : (
        <div className="space-y-4">
          {/* Dual Source Table Stage with Key Comparator */}
          <div className="grid grid-cols-1 lg:grid-cols-11 gap-2.5 items-stretch">
            {/* Left Source Table Card */}
            <div
              className="lg:col-span-5 p-3 rounded-xl border flex flex-col justify-between transition-all shadow-xs"
              style={{
                background: "var(--surface-subtle)",
                borderColor: "rgba(14, 165, 233, 0.4)",
              }}
            >
              <div className="flex items-center justify-between mb-2 pb-1.5 border-b" style={{ borderColor: "var(--border)" }}>
                <span className="font-mono font-bold text-xs flex items-center gap-1.5 text-sky-400">
                  <span>🗃️</span> {details.leftTable}
                </span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-sky-500/10 border border-sky-500/30 text-sky-300 font-mono">
                  Key: {details.leftCol}
                </span>
              </div>

              {/* Active Left Tuple Card */}
              <div
                className="p-2.5 rounded-lg border transition-all duration-300 relative overflow-hidden"
                style={{
                  background: "rgba(14, 165, 233, 0.08)",
                  borderColor: "rgba(14, 165, 233, 0.6)",
                }}
              >
                <div className="absolute top-1.5 right-1.5 text-[10px] font-mono text-sky-400 font-bold px-1.5 py-0.5 rounded bg-sky-500/20">
                  KEY = {String(currentPair.leftVal)}
                </div>
                <div className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider mb-1">
                  Active Tuple (Table A)
                </div>
                <div className="grid grid-cols-2 gap-1.5 font-mono text-xs">
                  {Object.entries(currentPair.leftRow)
                    .filter(([k]) => !k.includes("."))
                    .slice(0, 4)
                    .map(([k, v]) => (
                      <div
                        key={k}
                        className={`p-1 rounded ${
                          k.toLowerCase() === details.leftCol.split(".").pop()?.toLowerCase()
                            ? "bg-sky-500/25 border border-sky-400 text-sky-200 font-bold"
                            : "bg-black/20 text-zinc-300"
                        }`}
                      >
                        <span className="opacity-60 text-[10px] block">{k}:</span>
                        <span className="truncate block">{String(v)}</span>
                      </div>
                    ))}
                </div>
              </div>
            </div>

            {/* Center Comparator & Match Badge */}
            <div className="lg:col-span-1 flex flex-col items-center justify-center p-2 rounded-xl text-center self-center gap-1">
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs border shadow-sm animate-pulse"
                style={{
                  background: "rgba(16, 185, 129, 0.2)",
                  borderColor: "rgba(16, 185, 129, 0.5)",
                  color: "#34d399",
                }}
              >
                =
              </div>
              <span className="text-[10px] font-mono text-emerald-400 font-bold whitespace-nowrap">
                MATCH!
              </span>
              <div className="text-zinc-500 text-xs">↓</div>
            </div>

            {/* Right Source Table Card */}
            <div
              className="lg:col-span-5 p-3 rounded-xl border flex flex-col justify-between transition-all shadow-xs"
              style={{
                background: "var(--surface-subtle)",
                borderColor: "rgba(16, 185, 129, 0.4)",
              }}
            >
              <div className="flex items-center justify-between mb-2 pb-1.5 border-b" style={{ borderColor: "var(--border)" }}>
                <span className="font-mono font-bold text-xs flex items-center gap-1.5 text-emerald-400">
                  <span>🗃️</span> {details.rightTable}
                </span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 font-mono">
                  Key: {details.rightCol}
                </span>
              </div>

              {/* Active Right Tuple Card */}
              <div
                className="p-2.5 rounded-lg border transition-all duration-300 relative overflow-hidden"
                style={{
                  background: "rgba(16, 185, 129, 0.08)",
                  borderColor: "rgba(16, 185, 129, 0.6)",
                }}
              >
                <div className="absolute top-1.5 right-1.5 text-[10px] font-mono text-emerald-400 font-bold px-1.5 py-0.5 rounded bg-emerald-500/20">
                  KEY = {String(currentPair.rightVal)}
                </div>
                <div className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider mb-1">
                  Active Tuple (Table B)
                </div>
                <div className="grid grid-cols-2 gap-1.5 font-mono text-xs">
                  {Object.entries(currentPair.rightRow)
                    .filter(([k]) => !k.includes("."))
                    .slice(0, 4)
                    .map(([k, v]) => (
                      <div
                        key={k}
                        className={`p-1 rounded ${
                          k.toLowerCase() === details.rightCol.split(".").pop()?.toLowerCase()
                            ? "bg-emerald-500/25 border border-emerald-400 text-emerald-200 font-bold"
                            : "bg-black/20 text-zinc-300"
                        }`}
                      >
                        <span className="opacity-60 text-[10px] block">{k}:</span>
                        <span className="truncate block">{String(v)}</span>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          </div>

          {/* Fusion Chamber: Animated Row Combination */}
          <div
            className="p-3.5 rounded-xl border relative overflow-hidden transition-all shadow-md"
            style={{
              background: "linear-gradient(135deg, rgba(14, 165, 233, 0.08) 0%, rgba(16, 185, 129, 0.08) 100%)",
              borderColor: "rgba(16, 185, 129, 0.5)",
            }}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 text-amber-300">
                <span>✨</span> Fused Tuple #{activeIdx + 1} (Combined into Working Set)
              </span>
              <span className="text-[11px] font-mono opacity-75 text-zinc-300">
                Condition: {details.leftCol} ({currentPair.leftVal}) == {details.rightCol} ({currentPair.rightVal})
              </span>
            </div>

            <div className="flex flex-wrap gap-2 pt-1">
              {Object.entries(currentPair.mergedRow).map(([col, val]) => (
                <div
                  key={col}
                  className="px-2.5 py-1 rounded-lg border font-mono text-xs flex items-center gap-1.5 transition-transform hover:scale-105"
                  style={{
                    background: "var(--panel)",
                    borderColor: "var(--border)",
                    color: "var(--foreground)",
                  }}
                >
                  <span className="text-[10px] text-zinc-400 font-semibold">{col}:</span>
                  <span className="font-bold text-emerald-400">{String(val)}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Live Accumulated Working Set Table */}
          <div
            className="p-3 rounded-xl border space-y-2"
            style={{
              background: "var(--surface-subtle)",
              borderColor: "var(--border)",
            }}
          >
            <div className="flex items-center justify-between text-xs font-semibold" style={{ color: "var(--foreground)" }}>
              <span>
                Working Set Accumulator ({accumulatedRows.length} of {pairs.length} rows combined)
              </span>
              <span className="text-[11px] font-mono text-zinc-400">
                Active row highlighted in emerald
              </span>
            </div>

            <div className="overflow-x-auto max-h-48 scrollbar-thin">
              <table className="text-xs w-full border-collapse">
                <thead>
                  <tr style={{ background: "var(--panel)" }}>
                    <th className="px-2 py-1 border-b text-left font-mono font-bold text-zinc-400">
                      #
                    </th>
                    {allCols.map((col) => (
                      <th
                        key={col}
                        className="px-2.5 py-1 border-b text-left font-mono font-bold"
                        style={{ borderColor: "var(--border)", color: "var(--foreground)" }}
                      >
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {accumulatedRows.map((row, idx) => {
                    const isLatest = idx === activeIdx;
                    return (
                      <tr
                        key={idx}
                        className={`transition-colors font-mono ${
                          isLatest
                            ? "bg-emerald-500/20 font-bold text-emerald-200"
                            : "hover:bg-zinc-800/40 opacity-90"
                        }`}
                      >
                        <td className="px-2 py-1 border-b text-zinc-500 text-[10px]">{idx + 1}</td>
                        {allCols.map((col) => (
                          <td
                            key={col}
                            className="px-2.5 py-1 border-b"
                            style={{ borderColor: "var(--border)" }}
                          >
                            {String(row[col] ?? "")}
                          </td>
                        ))}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function StepTable({ step }: { step: PipelineStep }) {
  if (!step.rows.length)
    return <p className="text-xs opacity-50 italic">No rows at this stage.</p>;
  return (
    <div className="overflow-x-auto max-h-56">
      <table className="text-sm w-full border-collapse">
        <thead>
          <tr style={{ background: "var(--surface-subtle)" }}>
            {step.columns.map((column) => (
              <th
                key={column}
                className="text-left px-2.5 py-1.5 border-b font-mono font-bold"
                style={{ borderColor: "var(--border)", color: "var(--foreground)" }}
              >
                {column}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {step.rows.slice(0, 20).map((row, index) => (
            <tr key={index} className="hover:opacity-85 transition-opacity">
              {step.columns.map((column) => (
                <td
                  key={column}
                  className="px-2.5 py-1.5 border-b"
                  style={{ borderColor: "var(--border)", color: "var(--foreground)" }}
                >
                  {String(row[column] ?? "")}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      {step.rows.length > 20 && (
        <p className="text-xs opacity-50 mt-1" style={{ color: "var(--muted)" }}>
          …showing first 20 of {step.rows.length}
        </p>
      )}
    </div>
  );
}

function ResultTable({ rows, cols }: { rows: Row[]; cols: string[] }) {
  return (
    <div className="overflow-x-auto">
      <table className="text-sm w-full border-collapse">
        <thead>
          <tr style={{ background: "var(--surface-subtle)" }}>
            {cols.map((column) => (
              <th
                key={column}
                className="text-left px-2.5 py-1.5 border-b font-mono font-bold"
                style={{ borderColor: "var(--border)", color: "var(--foreground)" }}
              >
                {column}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <tr key={index} className="hover:opacity-85 transition-opacity">
              {cols.map((column) => (
                <td
                  key={column}
                  className="px-2.5 py-1.5 border-b"
                  style={{ borderColor: "var(--border)", color: "var(--foreground)" }}
                >
                  {String(row[column] ?? "")}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
