"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import type { Table, Column, Dataset } from "@/lib/schema";
import { executeSQL, type QueryResult, type Row } from "@/lib/sqlEngine";
import { executePLSQL, type PLSQLResult } from "@/lib/plsqlEngine";

interface TerminalViewProps {
  activeSchema: Table[];
  onUpdateSchema: (newSchema: Table[]) => void;
  datasetName: string;
  datasets?: Dataset[];
  selectedDatasetId?: string;
  onSelectDataset?: (id: string) => void;
  mode: "sql" | "plsql";
  onExit: () => void;
  onReset?: () => void;
  isDark?: boolean;
}

interface OutputEntry {
  id: string;
  type: "command" | "ascii-table" | "stdout" | "info" | "success" | "error";
  commandText?: string;
  lines: string[];
  durationMs?: number;
}

/**
 * Formats tabular data into classic SQL*Plus / MySQL CLI ASCII tables:
 * +----+---------+
 * | ID | NAME    |
 * +----+---------+
 * | 1  | Product |
 * +----+---------+
 */
function formatAsciiTable(columns: string[], rows: Row[]): string[] {
  if (columns.length === 0) return ["(Empty result set: 0 columns)"];

  // Calculate maximum column widths
  const colWidths: Record<string, number> = {};
  for (const col of columns) {
    let max = col.length;
    for (const row of rows) {
      const val = row[col] !== undefined && row[col] !== null ? String(row[col]) : "NULL";
      if (val.length > max) max = val.length;
    }
    // Cap column width to 50 for readability
    colWidths[col] = Math.min(Math.max(max, 3), 50);
  }

  // Divider line: +-------+---------+
  const separator = "+" + columns.map((col) => "-".repeat(colWidths[col] + 2)).join("+") + "+";

  // Header line: | COL1  | COL2    |
  const header =
    "|" +
    columns
      .map((col) => {
        const padded = col.toUpperCase().padEnd(colWidths[col]);
        return ` ${padded} `;
      })
      .join("|") +
    "|";

  const result: string[] = [separator, header, separator];

  if (rows.length === 0) {
    const emptyMsg = "No rows returned";
    const totalWidth = separator.length - 2;
    const padded = emptyMsg.padEnd(Math.max(totalWidth, 0));
    result.push(`| ${padded.slice(0, totalWidth - 2)} |`);
  } else {
    for (const row of rows) {
      const rowLine =
        "|" +
        columns
          .map((col) => {
            let val = row[col] !== undefined && row[col] !== null ? String(row[col]) : "NULL";
            if (val.length > colWidths[col]) {
              val = val.slice(0, colWidths[col] - 3) + "...";
            }
            const padded = val.padEnd(colWidths[col]);
            return ` ${padded} `;
          })
          .join("|") +
        "|";
      result.push(rowLine);
    }
  }

  result.push(separator);
  return result;
}

export function TerminalView({
  activeSchema,
  onUpdateSchema,
  datasetName,
  datasets = [],
  selectedDatasetId,
  onSelectDataset,
  mode,
  onExit,
  onReset,
  isDark = true,
}: TerminalViewProps) {
  const [history, setHistory] = useState<OutputEntry[]>([]);
  const [currentInput, setCurrentInput] = useState("");
  const [bufferLines, setBufferLines] = useState<string[]>([]);
  const [cmdHistory, setCmdHistory] = useState<string[]>([]);
  const [historyIdx, setHistoryIdx] = useState<number>(-1);
  const [isFullScreen, setIsFullScreen] = useState(false);

  const terminalEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-focus terminal input on click anywhere inside the console
  const handleConsoleClick = () => {
    inputRef.current?.focus();
  };

  // Scroll to bottom whenever history or buffer changes
  useEffect(() => {
    terminalEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [history, bufferLines, currentInput]);

  // Initial Welcome Banner
  useEffect(() => {
    const welcomeLines = [
      "=========================================================================================",
      "  NL2Query Embedded Terminal [Version 2.4.0-CLI]",
      "  (c) Database Engine. Pure client-side execution. Zero cloud/AI overhead.",
      "=========================================================================================",
      `  Connected Session : ${mode.toUpperCase()} Console`,
      `  Active Dataset    : ${datasetName.toUpperCase()} (${activeSchema.length} tables loaded: ${activeSchema.map((t) => t.name).join(", ") || "None"})`,
      "  Multi-line Buffer : Supported (type ';' or '/' on a new line to execute).",
      "  Quick Commands    : HELP, SHOW DATABASES, SHOW TABLES, USE <db>, DESC <table>, CLEAR, EXIT",
      "=========================================================================================",
    ];

    setHistory([
      {
        id: "welcome",
        type: "info",
        lines: welcomeLines,
      },
    ]);
  }, [datasetName, mode]); // Only on mount / mode switch

  // Keyboard listener for ESC to exit
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onExit();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onExit]);

  // Execute meta command or SQL/PLSQL query
  const executeCommand = useCallback(
    (rawScript: string) => {
      const trimmed = rawScript.trim();
      if (!trimmed) return;

      const startTime = performance.now();
      const upper = trimmed.toUpperCase().replace(/;+$/, "").trim();

      // Save to bash-like command history
      setCmdHistory((prev) => [...prev, rawScript]);
      setHistoryIdx(-1);

      // 1. Check Meta-Commands
      if (upper === "EXIT" || upper === "QUIT" || upper === "Q") {
        onExit();
        return;
      }

      if (upper === "CLEAR" || upper === "CLS") {
        setHistory([]);
        return;
      }

      if (upper === "RESET") {
        if (onReset) {
          onReset();
          setHistory((prev) => [
            ...prev,
            {
              id: String(Date.now()),
              type: "command",
              commandText: rawScript,
              lines: [],
            },
            {
              id: String(Date.now() + 1),
              type: "success",
              lines: ["Database reset: active schema restored to original dataset defaults."],
            },
          ]);
        } else {
          setHistory((prev) => [
            ...prev,
            {
              id: String(Date.now()),
              type: "command",
              commandText: rawScript,
              lines: [],
            },
            {
              id: String(Date.now() + 1),
              type: "error",
              lines: ["Reset operation is not available for this session."],
            },
          ]);
        }
        return;
      }

      if (upper === "HELP" || upper === "?") {
        const helpLines = [
          "-----------------------------------------------------------------------------------------",
          "NL2QUERY TERMINAL REFERENCE GUIDE",
          "-----------------------------------------------------------------------------------------",
          "SQL STATEMENTS:",
          "  SELECT ... FROM ... [WHERE] [ORDER BY] [LIMIT] ;    Execute queries and view ASCII tables",
          "  INSERT INTO <table> VALUES (...) ;                 Insert rows into workspace tables",
          "  UPDATE <table> SET col = val [WHERE ...] ;         Modify existing rows in tables",
          "  DELETE FROM <table> [WHERE ...] ;                  Delete rows from tables",
          "  CREATE TABLE <name> (col type, ...) ;              Create new table in active workspace",
          "  DROP TABLE <name> ;                                Remove table from active workspace",
          "  ALTER TABLE <name> ADD <col> <type> ;              Alter table schema",
          "",
          "PL/SQL PROCEDURAL BLOCKS:",
          "  DECLARE                                            Anonymous procedural block",
          "    v_counter NUMBER := 10;",
          "  BEGIN",
          "    DBMS_OUTPUT.PUT_LINE('Value: ' || v_counter);",
          "  END;",
          "  /                                                  Slash or semicolon executes block",
          "",
          "META UTILITIES:",
          "  SHOW DATABASES | SHOW DATASETS                     List all available workspace datasets",
          "  USE <database_id | name>                           Switch active database/dataset",
          "  SHOW TABLES | \\dt                                  List all workspace tables & row counts",
          "  DESC <table> | DESCRIBE <table>                    Describe columns, types, and constraints",
          "  SCHEMA                                             List full catalog schema overview",
          "  HISTORY                                            View session command history",
          "  EXPORT                                             Download database as .sql file",
          "  CLEAR | CLS                                        Clear the screen",
          "  EXIT | QUIT                                        Return to graphical workspace (or press ESC)",
          "-----------------------------------------------------------------------------------------",
        ];
        setHistory((prev) => [
          ...prev,
          { id: String(Date.now()), type: "command", commandText: rawScript, lines: [] },
          { id: String(Date.now() + 1), type: "info", lines: helpLines },
        ]);
        return;
      }

      // SHOW DATABASES / SHOW DATASETS
      if (
        upper === "SHOW DATABASES" ||
        upper === "SHOW DATASETS" ||
        upper === "SHOW SCHEMAS" ||
        upper === "DATABASES" ||
        upper === "DATASETS"
      ) {
        const availableDatasets =
          datasets.length > 0
            ? datasets
            : [
              {
                id: datasetName.toLowerCase(),
                name: datasetName,
                description: "Current active workspace dataset",
                schema: activeSchema,
                defaultQuery: "",
                examples: [],
              },
            ];

        const dbRows: Row[] = availableDatasets.map((d, idx) => {
          const isActive =
            d.id === selectedDatasetId ||
            d.name.toLowerCase() === datasetName.toLowerCase() ||
            d.id.toLowerCase() === datasetName.toLowerCase();
          return {
            "#": idx + 1,
            DATABASE_NAME: d.name,
            ID: d.id,
            TABLES: d.schema.length,
            STATUS: isActive ? "* ACTIVE" : "AVAILABLE",
            TYPE: d.isCustom ? "CUSTOM" : "BUILT-IN",
          };
        });

        const ascii = formatAsciiTable(
          ["#", "DATABASE_NAME", "ID", "TABLES", "STATUS", "TYPE"],
          dbRows
        );
        setHistory((prev) => [
          ...prev,
          { id: String(Date.now()), type: "command", commandText: rawScript, lines: [] },
          {
            id: String(Date.now() + 1),
            type: "ascii-table",
            lines: [
              ...ascii,
              `${availableDatasets.length} database(s) in workspace. Type 'USE <database_id | name>;' to switch database.`,
            ],
          },
        ]);
        return;
      }

      // USE <database>
      if (upper.startsWith("USE ")) {
        const target = trimmed.substring(4).replace(/;+$/, "").trim();
        if (!target) {
          setHistory((prev) => [
            ...prev,
            { id: String(Date.now()), type: "command", commandText: rawScript, lines: [] },
            {
              id: String(Date.now() + 1),
              type: "error",
              lines: ["Syntax error: USE requires database identifier. Example: USE ecommerce;"],
            },
          ]);
          return;
        }

        const match = datasets.find(
          (d) =>
            d.id.toLowerCase() === target.toLowerCase() ||
            d.name.toLowerCase() === target.toLowerCase()
        );

        if (match) {
          if (onSelectDataset) {
            onSelectDataset(match.id);
            setHistory((prev) => [
              ...prev,
              { id: String(Date.now()), type: "command", commandText: rawScript, lines: [] },
              {
                id: String(Date.now() + 1),
                type: "success",
                lines: [
                  `Database changed to '${match.name}' [ID: ${match.id}].`,
                  `${match.schema.length} table(s) loaded. Type 'SHOW TABLES;' to inspect tables.`,
                ],
              },
            ]);
          } else {
            setHistory((prev) => [
              ...prev,
              { id: String(Date.now()), type: "command", commandText: rawScript, lines: [] },
              {
                id: String(Date.now() + 1),
                type: "error",
                lines: ["Database switching is unavailable in this session."],
              },
            ]);
          }
        } else {
          setHistory((prev) => [
            ...prev,
            { id: String(Date.now()), type: "command", commandText: rawScript, lines: [] },
            {
              id: String(Date.now() + 1),
              type: "error",
              lines: [
                `ERROR 1049 (42000): Unknown database '${target}'. Type 'SHOW DATABASES;' to view available workspace databases.`,
              ],
            },
          ]);
        }
        return;
      }

      if (upper === "SHOW TABLES" || upper === "\\DT" || upper === "SHOW ALL") {
        const tableSummaryRows: Row[] = activeSchema.map((t, idx) => ({
          "#": idx + 1,
          TABLE_NAME: t.name,
          COLUMNS: t.columns.length,
          ROWS: t.rows.length,
        }));
        const ascii = formatAsciiTable(["#", "TABLE_NAME", "COLUMNS", "ROWS"], tableSummaryRows);
        setHistory((prev) => [
          ...prev,
          { id: String(Date.now()), type: "command", commandText: rawScript, lines: [] },
          {
            id: String(Date.now() + 1),
            type: "ascii-table",
            lines: [...ascii, `${activeSchema.length} tables in active workspace database.`],
          },
        ]);
        return;
      }

      if (upper.startsWith("DESC ") || upper.startsWith("DESCRIBE ")) {
        const parts = upper.split(/\s+/);
        const targetTableName = parts[1]?.toLowerCase();
        const found = activeSchema.find((t) => t.name.toLowerCase() === targetTableName);
        if (!found) {
          setHistory((prev) => [
            ...prev,
            { id: String(Date.now()), type: "command", commandText: rawScript, lines: [] },
            { id: String(Date.now() + 1), type: "error", lines: [`ORA-00942: table or view '${parts[1]}' does not exist.`] },
          ]);
          return;
        }

        const descRows: Row[] = found.columns.map((c: Column) => ({
          COLUMN_NAME: c.name,
          DATA_TYPE: c.type.toUpperCase(),
          PRIMARY_KEY: c.pk ? "YES" : "NO",
          NULLABLE: c.pk ? "NO" : "YES",
          REFERENCES: c.fk ? `${c.fk.table}.${c.fk.column}` : "-",
        }));
        const ascii = formatAsciiTable(["COLUMN_NAME", "DATA_TYPE", "PRIMARY_KEY", "NULLABLE", "REFERENCES"], descRows);
        setHistory((prev) => [
          ...prev,
          { id: String(Date.now()), type: "command", commandText: rawScript, lines: [] },
          {
            id: String(Date.now() + 1),
            type: "ascii-table",
            lines: [
              `Table: ${found.name.toUpperCase()} (${found.rows.length} rows stored)`,
              ...ascii,
            ],
          },
        ]);
        return;
      }

      if (upper === "SCHEMA") {
        const lines: string[] = ["=== ACTIVE WORKSPACE CATALOG ==="];
        for (const t of activeSchema) {
          lines.push(`• ${t.name} (${t.rows.length} rows)`);
          lines.push(`  Columns: ${t.columns.map((c) => `${c.name} (${c.type})`).join(", ")}`);
        }
        lines.push(`Total tables: ${activeSchema.length}`);
        setHistory((prev) => [
          ...prev,
          { id: String(Date.now()), type: "command", commandText: rawScript, lines: [] },
          { id: String(Date.now() + 1), type: "info", lines },
        ]);
        return;
      }

      if (upper === "HISTORY") {
        const lines = cmdHistory.map((cmd, i) => `  ${String(i + 1).padStart(3, " ")}  ${cmd}`);
        setHistory((prev) => [
          ...prev,
          { id: String(Date.now()), type: "command", commandText: rawScript, lines: [] },
          { id: String(Date.now() + 1), type: "info", lines: lines.length > 0 ? lines : ["(History is empty)"] },
        ]);
        return;
      }

      if (upper === "EXPORT") {
        let sqlDump = `-- NL2Query Export: ${datasetName.toUpperCase()}\n-- Generated: ${new Date().toISOString()}\n\n`;
        for (const t of activeSchema) {
          sqlDump += `-- Table: ${t.name}\n`;
          sqlDump += `CREATE TABLE ${t.name} (\n  ` +
            t.columns.map((c) => `${c.name} ${c.type.toUpperCase()}${c.pk ? " PRIMARY KEY" : ""}`).join(",\n  ") +
            `\n);\n\n`;

          for (const row of t.rows) {
            const cols = Object.keys(row);
            const vals = cols.map((k) => (typeof row[k] === "number" ? row[k] : `'${String(row[k]).replace(/'/g, "''")}'`));
            sqlDump += `INSERT INTO ${t.name} (${cols.join(", ")}) VALUES (${vals.join(", ")});\n`;
          }
          sqlDump += "\n";
        }

        const blob = new Blob([sqlDump], { type: "text/plain;charset=utf-8" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${datasetName}-dump.sql`;
        a.click();
        URL.revokeObjectURL(url);

        setHistory((prev) => [
          ...prev,
          { id: String(Date.now()), type: "command", commandText: rawScript, lines: [] },
          { id: String(Date.now() + 1), type: "success", lines: [`Database exported successfully: '${datasetName}-dump.sql' downloaded.`] },
        ]);
        return;
      }

      // 2. Execution Routing: Is it a PL/SQL block or standard SQL?
      const isPlSql =
        /\b(DECLARE|BEGIN|EXCEPTION|DBMS_OUTPUT|CURSOR)\b/i.test(trimmed) ||
        trimmed.startsWith("/") ||
        mode === "plsql";

      // Execute PL/SQL
      if (isPlSql && /\b(DECLARE|BEGIN)\b/i.test(trimmed)) {
        try {
          const res: PLSQLResult = executePLSQL(trimmed, activeSchema);
          const duration = Math.round(performance.now() - startTime);

          if (res.error) {
            setHistory((prev) => [
              ...prev,
              { id: String(Date.now()), type: "command", commandText: rawScript, lines: [] },
              { id: String(Date.now() + 1), type: "error", lines: [`PL/SQL Error: ${res.error}`] },
            ]);
            return;
          }

          // If schema was updated (e.g. DML inside PL/SQL)
          if (res.updatedSchema) {
            onUpdateSchema(res.updatedSchema);
          }

          const outLines: string[] = [];
          if (res.dbmsOutput && res.dbmsOutput.length > 0) {
            outLines.push(...res.dbmsOutput);
          } else {
            outLines.push("PL/SQL procedure successfully completed.");
          }

          if (res.affectedRows !== undefined && res.affectedRows > 0) {
            outLines.push(`${res.affectedRows} row(s) updated/inserted.`);
          }

          setHistory((prev) => [
            ...prev,
            { id: String(Date.now()), type: "command", commandText: rawScript, lines: [] },
            {
              id: String(Date.now() + 1),
              type: "stdout",
              lines: outLines,
              durationMs: duration,
            },
          ]);
        } catch (err: unknown) {
          const msg = err instanceof Error ? err.message : String(err);
          setHistory((prev) => [
            ...prev,
            { id: String(Date.now()), type: "command", commandText: rawScript, lines: [] },
            { id: String(Date.now() + 1), type: "error", lines: [`Execution Error: ${msg}`] },
          ]);
        }
        return;
      }

      // Execute Standard SQL
      try {
        const cleanSql = trimmed.replace(/;+$/, "").trim();
        const res: QueryResult = executeSQL(cleanSql, activeSchema);
        const duration = Math.round(performance.now() - startTime);

        if (res.error) {
          setHistory((prev) => [
            ...prev,
            { id: String(Date.now()), type: "command", commandText: rawScript, lines: [] },
            { id: String(Date.now() + 1), type: "error", lines: [`SQL Error: ${res.error}`] },
          ]);
          return;
        }

        // Mutation update
        if (res.updatedSchema) {
          onUpdateSchema(res.updatedSchema);
        }

        // Result presentation
        if (res.command === "SELECT") {
          const ascii = formatAsciiTable(res.columns, res.finalRows);
          const footer = `${res.finalRows.length} row${res.finalRows.length === 1 ? "" : "s"} in set (${(duration / 1000).toFixed(3)} sec)`;
          setHistory((prev) => [
            ...prev,
            { id: String(Date.now()), type: "command", commandText: rawScript, lines: [] },
            {
              id: String(Date.now() + 1),
              type: "ascii-table",
              lines: [...ascii, footer],
              durationMs: duration,
            },
          ]);
        } else {
          // DML / DDL statement
          const message =
            res.message ||
            (res.affectedRows !== undefined
              ? `Query OK, ${res.affectedRows} row${res.affectedRows === 1 ? "" : "s"} affected (${(duration / 1000).toFixed(3)} sec)`
              : `Statement executed successfully (${(duration / 1000).toFixed(3)} sec)`);

          setHistory((prev) => [
            ...prev,
            { id: String(Date.now()), type: "command", commandText: rawScript, lines: [] },
            {
              id: String(Date.now() + 1),
              type: "success",
              lines: [message],
              durationMs: duration,
            },
          ]);
        }
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        setHistory((prev) => [
          ...prev,
          { id: String(Date.now()), type: "command", commandText: rawScript, lines: [] },
          { id: String(Date.now() + 1), type: "error", lines: [`Runtime Error: ${msg}`] },
        ]);
      }
    },
    [activeSchema, cmdHistory, datasetName, mode, onExit, onReset, onUpdateSchema]
  );

  // Handle Input submission & Multi-line buffer logic
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Arrow Up: Command History Previous
    if (e.key === "ArrowUp") {
      e.preventDefault();
      if (cmdHistory.length === 0) return;
      const nextIdx = historyIdx === -1 ? cmdHistory.length - 1 : Math.max(0, historyIdx - 1);
      setHistoryIdx(nextIdx);
      setCurrentInput(cmdHistory[nextIdx]);
      return;
    }

    // Arrow Down: Command History Next
    if (e.key === "ArrowDown") {
      e.preventDefault();
      if (cmdHistory.length === 0 || historyIdx === -1) return;
      const nextIdx = historyIdx + 1;
      if (nextIdx >= cmdHistory.length) {
        setHistoryIdx(-1);
        setCurrentInput("");
      } else {
        setHistoryIdx(nextIdx);
        setCurrentInput(cmdHistory[nextIdx]);
      }
      return;
    }

    // Ctrl + C: Cancel buffer
    if (e.ctrlKey && e.key === "c") {
      e.preventDefault();
      if (bufferLines.length > 0 || currentInput) {
        setHistory((prev) => [
          ...prev,
          {
            id: String(Date.now()),
            type: "command",
            commandText: [...bufferLines, currentInput].join("\n") + " ^C",
            lines: [],
          },
        ]);
        setBufferLines([]);
        setCurrentInput("");
      }
      return;
    }

    // Ctrl + L: Clear screen
    if (e.ctrlKey && e.key === "l") {
      e.preventDefault();
      setHistory([]);
      return;
    }

    // Enter Key
    if (e.key === "Enter") {
      e.preventDefault();
      const line = currentInput;
      const trimmedLine = line.trim();

      const cleanLine = trimmedLine.toUpperCase().replace(/;+$/, "").trim();
      const isMeta =
        bufferLines.length === 0 &&
        (
          [
            "EXIT", "QUIT", "Q", "CLEAR", "CLS", "HELP", "?",
            "SHOW TABLES", "\\DT", "SHOW ALL",
            "SHOW DATABASES", "SHOW DATASETS", "SHOW SCHEMAS", "DATABASES", "DATASETS",
            "SCHEMA", "HISTORY", "RESET", "EXPORT",
          ].includes(cleanLine) ||
          cleanLine.startsWith("USE ") ||
          cleanLine.startsWith("DESC ") ||
          cleanLine.startsWith("DESCRIBE ")
        );

      if (isMeta) {
        executeCommand(trimmedLine);
        setCurrentInput("");
        return;
      }

      // Check termination conditions:
      // 1) Semicolon at end of line (e.g. SELECT * FROM emp;)
      // 2) Single slash "/" (Oracle execution terminator for PL/SQL blocks)
      const isTerminated = trimmedLine.endsWith(";") || trimmedLine === "/";

      if (isTerminated) {
        const fullScript = [...bufferLines, line].join("\n");
        setBufferLines([]);
        setCurrentInput("");
        executeCommand(fullScript);
      } else {
        // Multi-line continuation: buffer line and advance prompt to 2>, 3>
        setBufferLines((prev) => [...prev, line]);
        setCurrentInput("");
      }
    }
  };

  const promptPrefix = bufferLines.length === 0 ? `${mode.toUpperCase()}> ` : `  ${bufferLines.length + 1}> `;

  return (
    <div
      onClick={handleConsoleClick}
      className={`fixed inset-0 z-50 flex flex-col font-mono text-sm select-text transition-all ${
        isDark ? "bg-[#0c0c0c] text-[#d4d4d4]" : "bg-white text-black"
      } ${isFullScreen ? "p-0" : "p-0"}`}
      style={{
        fontFamily: 'Consolas, "Cascadia Code", "Fira Code", Monaco, Menlo, "Courier New", monospace',
        backgroundColor: isDark ? "#0c0c0c" : "#ffffff",
        color: isDark ? "#d4d4d4" : "#000000",
      }}
    >
      {/* ─── Top Window Title Bar (Authentic CMD / Terminal Chrome) ─── */}
      <header
        className={`flex items-center justify-between px-3.5 py-2 border-b select-none text-xs shrink-0 ${
          isDark
            ? "bg-[#181818] border-[#2a2a2a] text-zinc-400"
            : "bg-[#f1f5f9] border-[#cbd5e1] text-zinc-700"
        }`}
        style={{
          backgroundColor: isDark ? "#181818" : "#f1f5f9",
          borderColor: isDark ? "#2a2a2a" : "#cbd5e1",
        }}
      >
        <div className="flex items-center gap-3">
          {/* Windows / Mac OS style dots */}
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={onExit}
              title="Close Terminal / Back to Workspace (ESC)"
              className="w-3 h-3 rounded-full bg-[#ff5f56] hover:opacity-80 transition-opacity cursor-pointer border border-[#e0443e]"
            />
            <button
              type="button"
              onClick={() => setHistory([])}
              title="Clear Terminal Buffer"
              className="w-3 h-3 rounded-full bg-[#ffbd2e] hover:opacity-80 transition-opacity cursor-pointer border border-[#dea123]"
            />
            <button
              type="button"
              onClick={() => setIsFullScreen((prev) => !prev)}
              title="Toggle Maximize"
              className="w-3 h-3 rounded-full bg-[#27c93f] hover:opacity-80 transition-opacity cursor-pointer border border-[#1aab29]"
            />
          </div>

          {/* Terminal Window Title */}
          <div className="flex items-center gap-2">
            <span className={isDark ? "text-zinc-500 font-bold" : "text-zinc-600 font-bold"}>C:\&gt;</span>
            <span className={isDark ? "font-semibold text-zinc-200" : "font-bold text-black"}>
              NL2Query {mode.toUpperCase()} Terminal &mdash; [{datasetName.toUpperCase()}]
            </span>
          </div>
        </div>

        {/* Right Action Tools */}
        <div className="flex items-center gap-2">
          {/* Quick Help Button */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              executeCommand("HELP");
            }}
            className={`px-2 py-0.5 rounded border transition-colors cursor-pointer text-xs font-semibold ${
              isDark
                ? "bg-[#262626] hover:bg-[#333333] text-zinc-300 hover:text-white border-[#383838]"
                : "bg-white hover:bg-zinc-100 text-black border-zinc-300 shadow-2xs"
            }`}
            title="Show Terminal Commands"
          >
            HELP
          </button>

          {/* Show Databases Button */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              executeCommand("SHOW DATABASES");
            }}
            className={`px-2 py-0.5 rounded border transition-colors cursor-pointer text-xs font-semibold ${
              isDark
                ? "bg-[#262626] hover:bg-[#333333] text-zinc-300 hover:text-white border-[#383838]"
                : "bg-white hover:bg-zinc-100 text-black border-zinc-300 shadow-2xs"
            }`}
            title="List Databases (SHOW DATABASES)"
          >
            DATABASES
          </button>

          {/* Show Tables Button */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              executeCommand("SHOW TABLES");
            }}
            className={`px-2 py-0.5 rounded border transition-colors cursor-pointer text-xs font-semibold ${
              isDark
                ? "bg-[#262626] hover:bg-[#333333] text-zinc-300 hover:text-white border-[#383838]"
                : "bg-white hover:bg-zinc-100 text-black border-zinc-300 shadow-2xs"
            }`}
            title="List Tables (SHOW TABLES)"
          >
            TABLES
          </button>

          {/* Clear Button */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setHistory([]);
            }}
            className={`px-2 py-0.5 rounded border transition-colors cursor-pointer text-xs font-semibold ${
              isDark
                ? "bg-[#262626] hover:bg-[#333333] text-zinc-300 hover:text-white border-[#383838]"
                : "bg-white hover:bg-zinc-100 text-black border-zinc-300 shadow-2xs"
            }`}
            title="Clear Screen (Ctrl+L)"
          >
            CLEAR
          </button>

          {/* Exit to GUI Button */}
          <button
            type="button"
            onClick={onExit}
            className={`flex items-center gap-1.5 px-2.5 py-0.5 rounded border transition-colors cursor-pointer font-bold text-xs ${
              isDark
                ? "bg-sky-950/80 hover:bg-sky-900 text-sky-300 border-sky-800/80"
                : "bg-sky-100 hover:bg-sky-200 text-sky-950 border-sky-300 shadow-2xs"
            }`}
            title="Return to Graphical GUI Workspace (ESC)"
          >
            <span>Exit to GUI</span>
            <span className="text-[10px] opacity-75 font-normal">(ESC)</span>
          </button>
        </div>
      </header>

      {/* ─── Main Terminal Scroll Canvas ─── */}
      <div
        className="flex-1 overflow-y-auto px-4 py-3 space-y-2 scrollbar-thin scrollbar-thumb-zinc-500 scrollbar-track-transparent"
        style={{
          backgroundColor: isDark ? "#0c0c0c" : "#ffffff",
          color: isDark ? "#d4d4d4" : "#000000",
        }}
      >
        {/* Render History Entries */}
        {history.map((entry) => (
          <div key={entry.id} className="space-y-1">
            {/* If there was a command executed */}
            {entry.commandText && (
              <div
                className={`flex items-start gap-1 font-semibold ${
                  isDark ? "text-zinc-100" : "text-black"
                }`}
              >
                <span
                  className={`shrink-0 font-bold ${
                    isDark ? "text-emerald-400" : "text-emerald-700"
                  }`}
                >
                  {mode.toUpperCase()}&gt;
                </span>
                <span className="whitespace-pre-wrap break-all">{entry.commandText}</span>
              </div>
            )}

            {/* Output lines based on type */}
            {entry.lines.length > 0 && (
              <div
                className={`pl-0 sm:pl-2 whitespace-pre font-mono text-xs sm:text-sm leading-relaxed overflow-x-auto ${
                  entry.type === "error"
                    ? isDark
                      ? "text-[#ff6b6b]"
                      : "text-[#dc2626] font-semibold"
                    : entry.type === "success"
                      ? isDark
                        ? "text-[#51cf66]"
                        : "text-[#16a34a] font-semibold"
                      : entry.type === "stdout"
                        ? isDark
                          ? "text-[#fcc419]"
                          : "text-[#d97706] font-semibold"
                        : entry.type === "ascii-table"
                          ? isDark
                            ? "text-[#e9ecef]"
                            : "text-black font-semibold"
                          : isDark
                            ? "text-[#ced4da]"
                            : "text-black font-semibold"
                }`}
                style={{
                  color:
                    !isDark &&
                    (entry.type === "ascii-table" ||
                      entry.type === "info" ||
                      !entry.type)
                      ? "#000000"
                      : undefined,
                }}
              >
                {entry.lines.map((l, lIdx) => (
                  <div key={lIdx} className="whitespace-pre">
                    {l}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}

        {/* Render currently buffered multi-line input lines */}
        {bufferLines.map((bLine, bIdx) => (
          <div
            key={bIdx}
            className={`flex items-start gap-1 ${
              isDark ? "text-zinc-400" : "text-black font-semibold"
            }`}
          >
            <span
              className={`shrink-0 select-none font-bold ${
                isDark ? "text-zinc-600" : "text-zinc-600"
              }`}
            >
              {String(bIdx + 1).padStart(3, " ")}*
            </span>
            <span className="whitespace-pre-wrap">{bLine}</span>
          </div>
        ))}

        {/* Active Command Input Line */}
        <div className="flex items-center gap-1.5 pt-1">
          <span
            className={`font-bold shrink-0 select-none ${
              isDark ? "text-emerald-400" : "text-emerald-700"
            }`}
          >
            {promptPrefix}
          </span>
          <input
            ref={inputRef}
            type="text"
            value={currentInput}
            onChange={(e) => setCurrentInput(e.target.value)}
            onKeyDown={handleKeyDown}
            autoFocus
            spellCheck={false}
            autoComplete="off"
            className={`flex-1 bg-transparent outline-none border-none p-0 focus:ring-0 text-sm font-mono ${
              isDark
                ? "text-zinc-100 placeholder:text-zinc-500"
                : "text-black font-bold placeholder:text-zinc-500"
            }`}
            style={{
              color: isDark ? "#f4f4f5" : "#000000",
            }}
            placeholder={
              bufferLines.length === 0
                ? mode === "plsql"
                  ? "Type SQL/PLSQL block (e.g. DECLARE... or SELECT * FROM emp;)"
                  : "Type SQL query (e.g. SELECT * FROM customers;)"
                : "continue typing block... end with ';' or '/'"
            }
          />
        </div>

        {/* Scroll Anchor */}
        <div ref={terminalEndRef} />
      </div>

      {/* ─── Bottom Status Bar ─── */}
      <footer
        className={`flex items-center justify-between px-3 py-1 border-t text-[11px] select-none shrink-0 ${
          isDark
            ? "bg-[#141414] border-[#222222] text-zinc-500"
            : "bg-[#f1f5f9] border-[#cbd5e1] text-zinc-700 font-medium"
        }`}
        style={{
          backgroundColor: isDark ? "#141414" : "#f1f5f9",
          borderColor: isDark ? "#222222" : "#cbd5e1",
        }}
      >
        <div className="flex items-center gap-4">
          <span>
            Dataset: <strong className={isDark ? "text-zinc-300" : "text-black"}>{datasetName}</strong>
          </span>
          <span>
            Tables: <strong className={isDark ? "text-zinc-300" : "text-black"}>{activeSchema.length}</strong>
          </span>
          <span className="hidden sm:inline">
            Status: <strong className={isDark ? "text-emerald-400" : "text-emerald-700 font-bold"}>READY</strong>
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className="hidden md:inline">Type &apos;;&apos; to execute &bull; Ctrl+C to cancel &bull; Up/Down for history</span>
          <span className={isDark ? "text-zinc-400 font-semibold" : "text-black font-bold"}>[ESC] to Exit</span>
        </div>
      </footer>
    </div>
  );
}
