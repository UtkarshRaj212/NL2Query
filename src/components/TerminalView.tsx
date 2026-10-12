"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { cloneSchema, type Table, type Column, type Dataset } from "@/lib/schema";
import { executeSQL, levenshteinDist, type QueryResult, type Row } from "@/lib/sqlEngine";
import { executePLSQL, type PLSQLResult } from "@/lib/plsqlEngine";
import { validateSqlIdentifier } from "@/lib/sqlNamingRules";

interface UndoItem {
  schema: Table[];
  command: string;
  timestamp: number;
}

interface TerminalViewProps {
  activeSchema: Table[];
  onUpdateSchema: (newSchema: Table[]) => void;
  datasetName: string;
  datasets?: Dataset[];
  selectedDatasetId?: string;
  onSelectDataset?: (id: string) => void;
  onCreateDataset?: (dataset: Dataset) => void;
  onDeleteDataset?: (id: string) => void;
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

/**
 * Resolves a table name to the closest valid table in the active schema,
 * checking exact, prefix, reverse-prefix, substring, and Levenshtein matches.
 */
export function findBestTableMatch(target: string, schema: Table[]): string | null {
  if (!target || !schema || schema.length === 0) return null;
  const tClean = target.toLowerCase().replace(/[^a-zA-Z0-9_]/g, "");
  if (!tClean) return schema[0]?.name || null;

  // 1. Exact match
  const exact = schema.find((s) => s.name.toLowerCase() === tClean);
  if (exact) return exact.name;

  // 2. Schema table starts with target (e.g. "customers".startsWith("cust") or "orders".startsWith("ord"))
  const prefixMatch = schema.find((s) => s.name.toLowerCase().startsWith(tClean));
  if (prefixMatch) return prefixMatch.name;

  // 3. Target starts with schema table (e.g. "customers_data".startsWith("customers"))
  const revPrefixMatch = schema.find((s) => tClean.startsWith(s.name.toLowerCase()));
  if (revPrefixMatch) return revPrefixMatch.name;

  // 4. Substring contains (e.g. "customers".includes("tom"))
  const subMatch = schema.find((s) => s.name.toLowerCase().includes(tClean));
  if (subMatch) return subMatch.name;

  // 5. Levenshtein edit distance
  let best: string | null = null;
  let minD = 5;
  for (const s of schema) {
    const d = levenshteinDist(tClean, s.name.toLowerCase());
    if (d < minD) {
      minD = d;
      best = s.name;
    }
  }
  if (best) return best;

  // 6. Default to first table if schema is single
  if (schema.length === 1) return schema[0].name;

  return null;
}

/**
 * Intelligent syntax & command suggestion helper.
 * When a user enters an incorrect or misspelled command in the terminal,
 * provides the closest expected syntax (if applicable).
 */
export function getCommandSuggestion(
  rawInput: string,
  activeSchema: Table[],
  datasets: Dataset[] = [],
  errorMessage?: string,
  mode: "sql" | "plsql" = "sql"
): string | null {
  const trimmed = rawInput.trim();
  if (!trimmed) return null;

  const firstTable = activeSchema[0]?.name || "table_name";
  const firstDb = datasets[0]?.id || datasets[0]?.name || "ecommerce";

  let query = trimmed;

  // 0. FIRST: Check for illegal symbols and missing SELECT expressions
  if (/^\s*SELECT\b/i.test(query)) {
    // 0A. Missing SELECT expression: "SELECT FROM <table>" (nothing between SELECT and FROM)
    if (/\bSELECT\s+FROM\b/i.test(query)) {
      query = query.replace(/\b(SELECT)(\s+)(FROM)\b/i, "$1 *$2$3");
    }

    // 0B. Illegal symbols/operators in SELECT projection list: e.g. "SELECT + FROM <table>"
    query = query.replace(
      /\b(SELECT\s+)([^a-zA-Z0-9_\s*,()]+|\+{1,2}|-{1,2})(\s+FROM\b)/i,
      "$1*$3"
    );

    // Also check if errorMessage explicitly names an unsupported expression (e.g. Unsupported SELECT expression: "+")
    if (errorMessage) {
      const unsuppMatch = errorMessage.match(/Unsupported SELECT expression:\s*["']([^"']+)["']/i);
      if (unsuppMatch && unsuppMatch[1]) {
        const badExpr = unsuppMatch[1].trim();
        if (/^[^a-zA-Z0-9_*]+$/.test(badExpr) || badExpr === "+") {
          const escaped = badExpr.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
          query = query.replace(new RegExp(`(\\bSELECT\\s+)${escaped}(\\s+FROM\\b)`, "i"), "$1*$2");
        }
      }
    }

    // 0C. Illegal symbols after FROM instead of table: e.g. "SELECT * FROM +"
    query = query.replace(
      /\b(FROM\s+)([^a-zA-Z0-9_\s;]+|\+{1,2}|-{1,2})(\s*;?)$/i,
      `$1${firstTable}$3`
    );

    // 0D. Solitary SELECT or SELECT with only symbols (no FROM): e.g. "SELECT", "SELECT;", "SELECT +"
    const cleanNoSemi = query.replace(/;+$/, "").trim();
    if (
      cleanNoSemi.toUpperCase() === "SELECT" ||
      /^SELECT\s+[^a-zA-Z0-9_*]+$/i.test(cleanNoSemi)
    ) {
      const isLower = cleanNoSemi.startsWith("select");
      return isLower ? `select * from ${firstTable};` : `SELECT * FROM ${firstTable};`;
    }
  }

  // 1. Table name typo extraction from error message or query
  if (errorMessage) {
    const tblMatch =
      errorMessage.match(/(?:table|view)\s+['"`]?([a-zA-Z0-9_]+)['"`]?\s+(?:does not exist|not found)/i) ||
      errorMessage.match(/Unknown table\s+['"`]?([a-zA-Z0-9_]+)['"`]?/i) ||
      errorMessage.match(/does not contain table\s+['"`]?([a-zA-Z0-9_]+)['"`]?/i);

    if (tblMatch && tblMatch[1]) {
      const wrongTable = tblMatch[1];
      const bestTable = findBestTableMatch(wrongTable, activeSchema);
      if (bestTable) {
        const regex = new RegExp(`\\b${wrongTable}\\b`, "i");
        if (regex.test(query)) {
          query = query.replace(regex, bestTable);
        } else {
          query = `SELECT * FROM ${bestTable};`;
        }
      }
    }

    // Column typo in error: "Column '...' does not exist"
    const colMatch = errorMessage.match(/Column\s+['"`]?([a-zA-Z0-9_]+)['"`]?\s+does not exist/i);
    if (colMatch && colMatch[1]) {
      const wrongCol = colMatch[1];
      let bestCol: string | null = null;
      let minColDist = 4;

      for (const t of activeSchema) {
        for (const c of t.columns) {
          const d = levenshteinDist(wrongCol.toLowerCase(), c.name.toLowerCase());
          if (d < minColDist) {
            minColDist = d;
            bestCol = c.name;
          }
        }
      }

      if (bestCol && minColDist <= 3) {
        const regex = new RegExp(`\\b${wrongCol}\\b`, "i");
        if (regex.test(query)) {
          let fixed = query.replace(regex, bestCol);
          if (!fixed.endsWith(";") && !fixed.endsWith("/")) fixed += ";";
          return fixed;
        }
      }
    }

    // Database typo in error: "Unknown database '...'" or "Can't drop database '...'"
    const dbMatch =
      errorMessage.match(/Unknown database\s+['"`]?([a-zA-Z0-9_]+)['"`]?/i) ||
      errorMessage.match(/Can't drop database\s+['"`]?([a-zA-Z0-9_]+)['"`]?/i);
    if (dbMatch && dbMatch[1]) {
      const wrongDb = dbMatch[1];
      let bestDb: string | null = null;
      let minDbDist = 4;

      for (const d of datasets) {
        const distName = levenshteinDist(wrongDb.toLowerCase(), d.name.toLowerCase());
        const distId = levenshteinDist(wrongDb.toLowerCase(), d.id.toLowerCase());
        const dMin = Math.min(distName, distId);
        if (dMin < minDbDist) {
          minDbDist = dMin;
          bestDb = d.id;
        }
      }

      if (bestDb && minDbDist <= 3) {
        return `USE ${bestDb};`;
      }
    }
  }

  // 1B. Inspect query for any table mentioned after FROM, JOIN, INTO, UPDATE, TABLE
  const tableRefMatch = query.match(/\b(?:FROM|JOIN|INTO|UPDATE|TABLE)\s+([a-zA-Z0-9_]+)/i);
  if (tableRefMatch && tableRefMatch[1]) {
    const rawTbl = tableRefMatch[1];
    const exists = activeSchema.some((s) => s.name.toLowerCase() === rawTbl.toLowerCase());
    if (!exists) {
      const bestTable = findBestTableMatch(rawTbl, activeSchema);
      if (bestTable) {
        query = query.replace(new RegExp(`\\b${rawTbl}\\b`, "i"), bestTable);
      }
    }
  }

  // If query was modified in Step 0 or Step 1
  if (query !== trimmed) {
    // Re-check table references in query to ensure table is 100% valid
    const reRefMatch = query.match(/\b(?:FROM|JOIN|INTO|UPDATE|TABLE)\s+([a-zA-Z0-9_]+)/i);
    if (reRefMatch && reRefMatch[1]) {
      const rawTbl = reRefMatch[1];
      const exists = activeSchema.some((s) => s.name.toLowerCase() === rawTbl.toLowerCase());
      if (!exists) {
        const bestTable = findBestTableMatch(rawTbl, activeSchema);
        if (bestTable) {
          query = query.replace(new RegExp(`\\b${rawTbl}\\b`, "i"), bestTable);
        }
      }
    }
    if (!query.endsWith(";") && !query.endsWith("/")) query += ";";
    return query;
  }

  // 2. Meta command matching
  const cleanUpper = trimmed.toUpperCase().replace(/;+$/, "").trim();

  const metaCommands: { target: string; syntax: string; aliases: string[] }[] = [
    {
      target: "SHOW TABLES",
      syntax: "SHOW TABLES;",
      aliases: [
        "SHOW TABLE", "SHOW TBL", "SHOW TABS", "SHOW TABEL", "SHOW TABELS",
        "TABLES", "TABLE", "\\DT", "\\D", "LIST TABLES", "SHOW ALL TABLES",
      ],
    },
    {
      target: "SHOW DATABASES",
      syntax: "SHOW DATABASES;",
      aliases: [
        "SHOW DATABASE", "SHOW DATASET", "SHOW DATASETS", "SHOW DB", "SHOW DBS",
        "DATABASES", "DATASETS", "DATABASE", "DATASET", "LIST DATABASES",
        "SHOW SCHEMAS", "SCHEMAS", "SHOW SCHEME",
      ],
    },
    {
      target: "HELP",
      syntax: "HELP;",
      aliases: ["HLP", "HELPP", "HELPME", "MAN", "COMMANDS", "USAGE", "?", "INFO", "MANUAL"],
    },
    {
      target: "CLEAR",
      syntax: "CLEAR;",
      aliases: ["CLS", "CLEAN", "CLR", "CLERA", "CLEER", "CLEARSCREEN", "CLEARSCR"],
    },
    {
      target: "RESET",
      syntax: "RESET;",
      aliases: ["REEST", "RESTE", "RESTART", "RESTORE", "RESET DB"],
    },
    {
      target: "UNDO",
      syntax: "UNDO;",
      aliases: [
        "UNDOO", "UND", "UNOD", "ROLLBACK", "ROLBACK", "REVERT", "ROLL BACK", "UNDO ACTION", "UNDO LAST",
      ],
    },
    {
      target: "EXIT",
      syntax: "EXIT;",
      aliases: ["EXT", "EXITT", "QUITT", "QT", "BYE", "CLOSE", "QUIT"],
    },
    {
      target: "SCHEMA",
      syntax: "SCHEMA;",
      aliases: ["SCHMA", "CATALOG", "SHOW SCHEMA", "VIEW SCHEMA"],
    },
    {
      target: "HISTORY",
      syntax: "HISTORY;",
      aliases: ["HIST", "HISTROY", "HISTRY", "HISTORIC", "SHOW HISTORY"],
    },
    {
      target: "EXPORT",
      syntax: "EXPORT;",
      aliases: ["EXPRT", "EXPROT", "DUMP", "BACKUP", "EXPORT SQL", "DUMP SQL"],
    },
  ];

  for (const meta of metaCommands) {
    if (meta.aliases.includes(cleanUpper)) {
      return meta.syntax;
    }
    const dist = levenshteinDist(cleanUpper, meta.target);
    if (dist <= (meta.target.length > 6 ? 3 : 2)) {
      return meta.syntax;
    }
  }

  // DESC / DESCRIBE typos
  if (/^(?:DESC|DESCRIBE|DESCR|DESCP|DSC)\b/i.test(query)) {
    const parts = query.split(/\s+/);
    if (parts.length >= 2) {
      const targetTable = parts[1].replace(/;+$/, "").trim();
      const bestTable = findBestTableMatch(targetTable, activeSchema) || firstTable;
      return `DESC ${bestTable};`;
    }
    return `DESC ${firstTable};`;
  }

  // USE <database> typos
  if (/^USE\b/i.test(trimmed)) {
    const parts = trimmed.split(/\s+/);
    if (parts.length >= 2) {
      const targetDb = parts[1].replace(/;+$/, "").trim().toLowerCase();
      let bestDb: string | null = null;
      let minDbDist = 4;
      for (const d of datasets) {
        const d1 = levenshteinDist(targetDb, d.id.toLowerCase());
        const d2 = levenshteinDist(targetDb, d.name.toLowerCase());
        const minD = Math.min(d1, d2);
        if (minD < minDbDist) {
          minDbDist = minD;
          bestDb = d.id;
        }
      }
      if (bestDb && minDbDist <= 3) {
        return `USE ${bestDb};`;
      }
    }
    return `USE ${firstDb};`;
  }

  // 3. SQL Keywords typo matching
  const tokens = trimmed.split(/\s+/);
  const firstTokenUpper = tokens[0]?.toUpperCase().replace(/[^A-Z_]/g, "") || "";

  const sqlKeywords: { kw: string; template: string; typos: string[] }[] = [
    {
      kw: "SELECT",
      template: `SELECT * FROM ${firstTable};`,
      typos: [
        "SELETC", "SELET", "SLCT", "SELCT", "SLECT", "SELECTT",
        "SLEECT", "SEELECT", "SELEC", "SELE", "SOLECT", "SELEKT",
      ],
    },
    {
      kw: "INSERT",
      template: `INSERT INTO ${firstTable} VALUES (...);`,
      typos: ["INSRT", "INSTERT", "ISNERT", "INSER", "INSERRT", "INSRTT"],
    },
    {
      kw: "UPDATE",
      template: `UPDATE ${firstTable} SET col = val WHERE condition;`,
      typos: ["UPDAT", "UPDT", "UPDTE", "UUPDATE", "UPDAET", "UPDAE"],
    },
    {
      kw: "DELETE",
      template: `DELETE FROM ${firstTable} WHERE condition;`,
      typos: ["DELET", "DELTE", "DLT", "DLETE", "DELEET", "DEL"],
    },
    {
      kw: "CREATE",
      template: `CREATE TABLE <table_name> (id INT PRIMARY KEY, name VARCHAR(100));`,
      typos: ["CRET", "CRATE", "CRTE", "CREAT", "CRAETE"],
    },
    {
      kw: "DROP",
      template: `DROP TABLE ${firstTable};`,
      typos: ["DRP", "DORP", "DROPP"],
    },
    {
      kw: "ALTER",
      template: `ALTER TABLE ${firstTable} ADD column_name datatype;`,
      typos: ["ALTR", "ATLTER", "ALTERR"],
    },
    {
      kw: "TRUNCATE",
      template: `TRUNCATE TABLE ${firstTable};`,
      typos: ["TRUNCT", "TRUNCTE", "TRUNC", "TRUNCAT"],
    },
  ];

  for (const item of sqlKeywords) {
    const isTypo = item.typos.includes(firstTokenUpper);
    const dist = levenshteinDist(firstTokenUpper, item.kw);
    if (isTypo || (dist <= 2 && firstTokenUpper.length >= 3 && firstTokenUpper !== item.kw)) {
      if (tokens.length > 1) {
        let fixed = query.replace(new RegExp(`^\\s*${tokens[0]}\\b`, "i"), item.kw);
        fixed = fixed.replace(/\bTABEL\b/gi, "TABLE");
        fixed = fixed.replace(/\bFORM\b/gi, "FROM");
        fixed = fixed.replace(/\bWHER\b/gi, "WHERE");
        if (!fixed.endsWith(";") && !fixed.endsWith("/")) {
          fixed += ";";
        }
        return fixed;
      }
      return item.template;
    }
  }

  // Check if first token IS SELECT but has syntax flaws
  if (firstTokenUpper === "SELECT") {
    // Typo in FORM instead of FROM: `SELECT * FORM ...`
    if (/\bFORM\b/i.test(query)) {
      let fixed = query.replace(/\bFORM\b/gi, "FROM");
      if (!fixed.endsWith(";")) fixed += ";";
      return fixed;
    }
    // Missing FROM: `SELECT * customers`
    if (/^SELECT\s+\*\s+([a-zA-Z0-9_]+)/i.test(query) && !/\bFROM\b/i.test(query)) {
      const match = query.match(/^SELECT\s+\*\s+([a-zA-Z0-9_]+)/i);
      if (match) {
        const tbl = findBestTableMatch(match[1], activeSchema) || match[1];
        let fixed = `SELECT * FROM ${tbl}`;
        if (!fixed.endsWith(";")) fixed += ";";
        return fixed;
      }
    }
    // Just SELECT or SELECT *
    if (cleanUpper === "SELECT" || cleanUpper === "SELECT *") {
      return `SELECT * FROM ${firstTable};`;
    }
  }

  // Check `CREATE TABEL ...`
  if (/^CREATE\s+TABEL\b/i.test(query)) {
    let fixed = query.replace(/^CREATE\s+TABEL\b/i, "CREATE TABLE");
    if (!fixed.endsWith(";")) fixed += ";";
    return fixed;
  }

  // Check `DROP TABEL ...`
  if (/^DROP\s+TABEL\b/i.test(query)) {
    let fixed = query.replace(/^DROP\s+TABEL\b/i, "DROP TABLE");
    if (!fixed.endsWith(";")) fixed += ";";
    return fixed;
  }

  // Check `ALTER TABEL ...`
  if (/^ALTER\s+TABEL\b/i.test(query)) {
    let fixed = query.replace(/^ALTER\s+TABEL\b/i, "ALTER TABLE");
    if (!fixed.endsWith(";")) fixed += ";";
    return fixed;
  }

  // 4. PL/SQL Typos
  const plsqlKeywords = [
    {
      kw: "DECLARE",
      typos: ["DELCARE", "DECLEAR", "DECLRE", "DECLAR", "DECALRE"],
      template: `DECLARE\n  v_counter NUMBER := 1;\nBEGIN\n  DBMS_OUTPUT.PUT_LINE(v_counter);\nEND;\n/`,
    },
    {
      kw: "BEGIN",
      typos: ["BGIN", "BEIGN", "BEG", "BEGGIN"],
      template: `BEGIN\n  DBMS_OUTPUT.PUT_LINE('Hello World');\nEND;\n/`,
    },
  ];

  for (const pl of plsqlKeywords) {
    const isTypo = pl.typos.includes(firstTokenUpper);
    const dist = levenshteinDist(firstTokenUpper, pl.kw);
    if (isTypo || (dist <= 2 && firstTokenUpper.length >= 3 && firstTokenUpper !== pl.kw)) {
      if (tokens.length > 1) {
        let fixed = trimmed.replace(new RegExp(`^\\s*${tokens[0]}\\b`, "i"), pl.kw);
        if (!fixed.endsWith(";") && !fixed.endsWith("/")) {
          fixed += ";";
        }
        return fixed;
      }
      return pl.template;
    }
  }

  // DBMS_OUTPUT typos
  if (/DBMS[_\s]?OUTPUT[.\s]?(?:PUTLINE|PRINT|WRITE)/i.test(trimmed)) {
    let fixed = trimmed.replace(/DBMS[_\s]?OUTPUT[.\s]?(?:PUTLINE|PRINT|WRITE)/gi, "DBMS_OUTPUT.PUT_LINE");
    if (!fixed.endsWith(";") && !fixed.endsWith("/")) fixed += ";";
    return fixed;
  }
  if (/^PUT_LINE\b/i.test(trimmed)) {
    let fixed = trimmed.replace(/^PUT_LINE/i, "DBMS_OUTPUT.PUT_LINE");
    if (!fixed.endsWith(";") && !fixed.endsWith("/")) fixed += ";";
    return fixed;
  }

  // 5. Short natural language questions or commands
  if (/^SHOW\b/i.test(trimmed) && tokens.length === 1) {
    return "SHOW TABLES;";
  }
  if (/^TABLES?\b/i.test(trimmed) && tokens.length <= 2) {
    return "SHOW TABLES;";
  }
  if (/^DATABASES?\b/i.test(trimmed) && tokens.length <= 2) {
    return "SHOW DATABASES;";
  }

  // 6. If PL/SQL mode and user typed incomplete block
  if (mode === "plsql") {
    if (cleanUpper === "DECLARE") {
      return `DECLARE\n  v_num NUMBER := 10;\nBEGIN\n  DBMS_OUTPUT.PUT_LINE(v_num);\nEND;\n/`;
    }
    if (cleanUpper === "BEGIN") {
      return `BEGIN\n  DBMS_OUTPUT.PUT_LINE('NL2Query PL/SQL');\nEND;\n/`;
    }
  }

  return null;
}

export function TerminalView({
  activeSchema,
  onUpdateSchema,
  datasetName,
  datasets = [],
  selectedDatasetId,
  onSelectDataset,
  onCreateDataset,
  onDeleteDataset,
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
  const isInitializedRef = useRef(false);

  const terminalEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const prevDatasetRef = useRef(datasetName);

  const [undoStack, setUndoStack] = useState<UndoItem[]>([]);
  const undoStackRef = useRef<UndoItem[]>([]);

  // Push previous schema snapshot to undo stack before a DDL/DML mutation
  const pushUndo = useCallback((prevSchema: Table[], commandSummary: string) => {
    const newEntry: UndoItem = {
      schema: cloneSchema(prevSchema),
      command: commandSummary,
      timestamp: Date.now(),
    };
    const next = [...undoStackRef.current, newEntry].slice(-50);
    undoStackRef.current = next;
    setUndoStack(next);
  }, []);

  // Pop and retrieve the most recent schema snapshot
  const popUndo = useCallback((): UndoItem | null => {
    if (undoStackRef.current.length === 0) return null;
    const last = undoStackRef.current[undoStackRef.current.length - 1];
    const next = undoStackRef.current.slice(0, -1);
    undoStackRef.current = next;
    setUndoStack(next);
    return last;
  }, []);

  // Initialize history from sessionStorage or welcome banner on client mount
  useEffect(() => {
    if (isInitializedRef.current) return;
    isInitializedRef.current = true;

    let loadedHistory: OutputEntry[] | null = null;
    try {
      const savedHist = sessionStorage.getItem(`nl2query_term_hist_${mode}`);
      if (savedHist) {
        const parsed = JSON.parse(savedHist);
        if (Array.isArray(parsed) && parsed.length > 0) {
          loadedHistory = parsed;
        }
      }
    } catch {}

    if (loadedHistory) {
      setHistory(loadedHistory);
    } else {
      const welcomeLines = [
        "=========================================================================================",
        "  NL2Query Embedded Terminal [Version 2.4.0-CLI]",
        "  (c) Database Engine. Pure client-side execution. Zero cloud/AI overhead.",
        "=========================================================================================",
        `  Connected Session : ${mode.toUpperCase()} Console`,
        `  Active Dataset    : ${datasetName.toUpperCase()} (${activeSchema.length} tables loaded: ${activeSchema.map((t) => t.name).join(", ") || "None"})`,
        "  Multi-line Buffer : Supported (type ';' or '/' on a new line to execute).",
        "  Quick Commands    : HELP, UNDO, SHOW DATABASES, SHOW TABLES, USE <db>, DESC <table>, CLEAR, EXIT",
        "=========================================================================================",
      ];

      setHistory([
        {
          id: "welcome",
          type: "info",
          lines: welcomeLines,
        },
      ]);
    }

    try {
      const savedCmds = sessionStorage.getItem(`nl2query_term_cmds_${mode}`);
      if (savedCmds) {
        const parsed = JSON.parse(savedCmds);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setCmdHistory(parsed);
        }
      }
    } catch {}
  }, [mode, datasetName, activeSchema]);

  // Sync output history to sessionStorage (persists for the browser session until tab/site is closed)
  useEffect(() => {
    if (!isInitializedRef.current) return;
    if (typeof window !== "undefined") {
      try {
        if (history.length > 0) {
          sessionStorage.setItem(`nl2query_term_hist_${mode}`, JSON.stringify(history.slice(-300)));
        }
      } catch {}
    }
  }, [history, mode]);

  // Sync command history to sessionStorage
  useEffect(() => {
    if (!isInitializedRef.current) return;
    if (typeof window !== "undefined") {
      try {
        if (cmdHistory.length > 0) {
          sessionStorage.setItem(`nl2query_term_cmds_${mode}`, JSON.stringify(cmdHistory.slice(-300)));
        }
      } catch {}
    }
  }, [cmdHistory, mode]);

  const clearTerminal = useCallback(() => {
    setHistory([]);
    if (typeof window !== "undefined") {
      try {
        sessionStorage.removeItem(`nl2query_term_hist_${mode}`);
      } catch {}
    }
  }, [mode]);

  // Auto-focus terminal input on click anywhere inside the console
  const handleConsoleClick = () => {
    inputRef.current?.focus();
  };

  // Scroll to bottom whenever history or buffer changes
  useEffect(() => {
    terminalEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [history, bufferLines, currentInput]);

  // Dataset Switch Notification
  useEffect(() => {
    if (!isInitializedRef.current) return;
    if (prevDatasetRef.current !== datasetName) {
      undoStackRef.current = [];
      setUndoStack([]);
      setHistory((prev) => [
        ...prev,
        {
          id: String(Date.now()),
          type: "info",
          lines: [
            `[Session] Active dataset changed to: ${datasetName.toUpperCase()} (${activeSchema.length} tables loaded: ${activeSchema.map((t) => t.name).join(", ") || "None"})`,
          ],
        },
      ]);
      prevDatasetRef.current = datasetName;
    }
  }, [datasetName, activeSchema]);

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

      // Helper to record an error with intelligent syntax suggestions
      const pushError = (errorMsg: string, rawCmd: string = rawScript) => {
        const suggestion = getCommandSuggestion(rawCmd, activeSchema, datasets, errorMsg, mode);
        const lines = [errorMsg];
        if (suggestion) {
          lines.push("", "Did you mean?", ...suggestion.split("\n").map((s) => `  ${s}`));
        }
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
            lines,
          },
        ]);
      };

      // 1. Check Meta-Commands
      if (upper === "EXIT" || upper === "QUIT" || upper === "Q") {
        onExit();
        return;
      }

      if (upper === "CLEAR" || upper === "CLS") {
        clearTerminal();
        return;
      }

      if (
        upper === "UNDO" ||
        upper === "ROLLBACK" ||
        upper.startsWith("UNDO ") ||
        upper.startsWith("ROLLBACK ")
      ) {
        const lastAction = popUndo();
        if (!lastAction) {
          setHistory((prev) => [
            ...prev,
            { id: String(Date.now()), type: "command", commandText: rawScript, lines: [] },
            {
              id: String(Date.now() + 1),
              type: "info",
              lines: [
                "Nothing to undo: No previous DDL/DML actions recorded in this session.",
                "Tip: DDL statements (CREATE, DROP, ALTER, TRUNCATE) and DML statements (INSERT, UPDATE, DELETE) can be undone.",
              ],
            },
          ]);
          return;
        }

        onUpdateSchema(lastAction.schema);

        const remaining = undoStackRef.current.length;
        setHistory((prev) => [
          ...prev,
          { id: String(Date.now()), type: "command", commandText: rawScript, lines: [] },
          {
            id: String(Date.now() + 1),
            type: "success",
            lines: [
              `Undo successful: Reverted last action [${lastAction.command}].`,
              `Schema and table data restored to previous state. (${remaining} undo step${remaining === 1 ? "" : "s"} remaining)`,
            ],
          },
        ]);
        return;
      }

      if (upper === "RESET") {
        if (onReset) {
          pushUndo(activeSchema, "RESET DATABASE");
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
              lines: [
                "Database reset: active schema restored to original dataset defaults.",
                "Tip: You can type 'UNDO' if you wish to revert this reset.",
              ],
            },
          ]);
        } else {
          pushError("Reset operation is not available for this session.");
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
          "  UNDO | ROLLBACK                                    Undo last DDL or DML statement and restore previous state",
          "  SHOW DATABASES | SHOW DATASETS                     List all available workspace datasets",
          "  USE <database_id | name>                           Switch active database/dataset",
          "  SHOW TABLES | \\dt                                  List all workspace tables & row counts",
          "  DESC <table> | DESCRIBE <table>                    Describe columns, types, and constraints",
          "  SCHEMA                                             List full catalog schema overview",
          "  HISTORY                                            View session command history",
          "  EXPORT                                             Download database as .sql file",
          "  CLEAR | CLS                                        Clear the screen",
          "  RESET                                              Reset active database to original defaults",
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

      // CREATE DATABASE / SCHEMA
      if (upper.startsWith("CREATE DATABASE ") || upper.startsWith("CREATE SCHEMA ")) {
        const rawTarget = trimmed
          .replace(/^CREATE\s+(?:DATABASE|SCHEMA)\s+(?:IF\s+NOT\s+EXISTS\s+)?/i, "")
          .replace(/;+$/, "")
          .trim()
          .replace(/^["`']|["`']$/g, "");

        const ifNotExists = /IF\s+NOT\s+EXISTS/i.test(trimmed);
        const val = validateSqlIdentifier(rawTarget, "database");

        if (!val.isValid) {
          pushError(`ERROR 1064 (42000): ${val.error}`);
          return;
        }

        const targetDbName = rawTarget.toLowerCase();
        const existing = datasets.find(
          (d) => d.id.toLowerCase() === targetDbName || d.name.toLowerCase() === targetDbName
        );

        if (existing) {
          if (ifNotExists) {
            setHistory((prev) => [
              ...prev,
              { id: String(Date.now()), type: "command", commandText: rawScript, lines: [] },
              {
                id: String(Date.now() + 1),
                type: "info",
                lines: [
                  `Query OK, 0 rows affected, 1 warning (0.00 sec)`,
                  `Note 1007: Can't create database '${targetDbName}'; database exists (IF NOT EXISTS skipped)`,
                ],
              },
            ]);
            return;
          }
          pushError(`ERROR 1007 (HY000): Can't create database '${targetDbName}'; database exists.`);
          return;
        }

        const newDb: Dataset = {
          id: targetDbName,
          name: targetDbName,
          description: `Database ${targetDbName} created via CLI terminal session`,
          schema: [],
          defaultQuery: `SELECT 1;`,
          examples: [],
          isCustom: true,
          createdAt: Date.now(),
        };

        if (onCreateDataset) {
          onCreateDataset(newDb);
        }
        if (onSelectDataset) {
          onSelectDataset(newDb.id);
        }

        setHistory((prev) => [
          ...prev,
          { id: String(Date.now()), type: "command", commandText: rawScript, lines: [] },
          {
            id: String(Date.now() + 1),
            type: "success",
            lines: [
              `Query OK, 1 row affected (0.01 sec)`,
              `Database '${targetDbName}' created and activated as active workspace catalog per SQL Norms.`,
            ],
          },
        ]);
        return;
      }

      // DROP DATABASE / SCHEMA
      if (upper.startsWith("DROP DATABASE ") || upper.startsWith("DROP SCHEMA ")) {
        const rawTarget = trimmed
          .replace(/^DROP\s+(?:DATABASE|SCHEMA)\s+(?:IF\s+EXISTS\s+)?/i, "")
          .replace(/;+$/, "")
          .trim()
          .replace(/^["`']|["`']$/g, "");

        const ifExists = /IF\s+EXISTS/i.test(trimmed);
        const val = validateSqlIdentifier(rawTarget, "database");
        if (!val.isValid) {
          pushError(`ERROR 1064 (42000): ${val.error}`);
          return;
        }

        const targetDbName = rawTarget.toLowerCase();
        const existing = datasets.find(
          (d) => d.id.toLowerCase() === targetDbName || d.name.toLowerCase() === targetDbName
        );

        if (!existing) {
          if (ifExists) {
            setHistory((prev) => [
              ...prev,
              { id: String(Date.now()), type: "command", commandText: rawScript, lines: [] },
              {
                id: String(Date.now() + 1),
                type: "info",
                lines: [
                  `Query OK, 0 rows affected, 1 warning (0.00 sec)`,
                  `Note 1008: Can't drop database '${targetDbName}'; database doesn't exist`,
                ],
              },
            ]);
            return;
          }
          pushError(`ERROR 1008 (HY000): Can't drop database '${targetDbName}'; database doesn't exist.`);
          return;
        }

        if (onDeleteDataset) {
          onDeleteDataset(existing.id);
        }

        setHistory((prev) => [
          ...prev,
          { id: String(Date.now()), type: "command", commandText: rawScript, lines: [] },
          {
            id: String(Date.now() + 1),
            type: "success",
            lines: [`Query OK, 0 rows affected (0.01 sec)`, `Database '${targetDbName}' dropped successfully.`],
          },
        ]);
        return;
      }

      // USE <database>
      if (upper.startsWith("USE ")) {
        const target = trimmed.substring(4).replace(/;+$/, "").trim();
        if (!target) {
          pushError("Syntax error: USE requires database identifier. Example: USE ecommerce;");
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
            pushError("Database switching is unavailable in this session.");
          }
        } else {
          pushError(
            `ERROR 1049 (42000): Unknown database '${target}'. Type 'SHOW DATABASES;' to view available workspace databases.`
          );
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
          pushError(`ORA-00942: table or view '${parts[1]}' does not exist.`);
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
            pushError(`PL/SQL Error: ${res.error}`);
            return;
          }

          // If schema was updated (e.g. DML inside PL/SQL)
          if (res.updatedSchema) {
            const isChanged = JSON.stringify(activeSchema) !== JSON.stringify(res.updatedSchema);
            if (isChanged) {
              pushUndo(activeSchema, "PL/SQL procedural block");
            }
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
          pushError(`Execution Error: ${msg}`);
        }
        return;
      }

      // Execute Standard SQL
      try {
        const cleanSql = trimmed.replace(/;+$/, "").trim();
        const res: QueryResult = executeSQL(cleanSql, activeSchema);
        const duration = Math.round(performance.now() - startTime);

        if (res.error) {
          pushError(`SQL Error: ${res.error}`);
          return;
        }

        // Mutation update
        const isMutation =
          res.statementType === "DML" ||
          res.statementType === "DDL" ||
          res.command !== "SELECT";
        const isChanged =
          Boolean(res.updatedSchema) &&
          JSON.stringify(activeSchema) !== JSON.stringify(res.updatedSchema);

        if (res.updatedSchema && (isMutation || isChanged)) {
          if (isChanged) {
            const summary = trimmed.replace(/\s+/g, " ").slice(0, 60);
            pushUndo(activeSchema, summary);
          }
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
        pushError(`Runtime Error: ${msg}`);
      }
    },
    [activeSchema, cmdHistory, datasetName, datasets, mode, onExit, onReset, onUpdateSchema, pushUndo, popUndo]
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
      clearTerminal();
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
            "UNDO", "ROLLBACK",
          ].includes(cleanLine) ||
          cleanLine.startsWith("USE ") ||
          cleanLine.startsWith("DESC ") ||
          cleanLine.startsWith("DESCRIBE ") ||
          cleanLine.startsWith("UNDO ") ||
          cleanLine.startsWith("ROLLBACK ")
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
        className={`flex flex-col md:flex-row md:items-center md:justify-between gap-2 px-3.5 py-2 border-b select-none text-xs shrink-0 ${
          isDark
            ? "bg-[#181818] border-[#2a2a2a] text-zinc-400"
            : "bg-[#f1f5f9] border-[#cbd5e1] text-zinc-700"
        }`}
        style={{
          backgroundColor: isDark ? "#181818" : "#f1f5f9",
          borderColor: isDark ? "#2a2a2a" : "#cbd5e1",
        }}
      >
        {/* Top row on mobile, left on desktop: Window Controls + Title (Full width on mobile, no horizontal compression) */}
        <div className="flex items-center gap-2.5 w-full md:w-auto min-w-0">
          {/* Windows / Mac OS style dots */}
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={onExit}
              title="Close Terminal / Back to Workspace (ESC)"
              className="w-3 h-3 rounded-full bg-[#ff5f56] hover:opacity-80 transition-opacity cursor-pointer border border-[#e0443e]"
            />
            <button
              type="button"
              onClick={clearTerminal}
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
          <div className="flex items-center gap-2 flex-wrap min-w-0">
            <span className={`shrink-0 ${isDark ? "text-zinc-500 font-bold" : "text-zinc-600 font-bold"}`}>
              C:\&gt;
            </span>
            <span className={`font-semibold leading-snug break-words ${isDark ? "text-zinc-200" : "font-bold text-black"}`}>
              NL2Query {mode.toUpperCase()} Terminal &mdash; [{datasetName.toUpperCase()}]
            </span>
          </div>
        </div>

        {/* Next Line on mobile, right tools on desktop: Action Buttons */}
        <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap overflow-x-auto max-w-full pb-0.5 md:pb-0 scrollbar-thin">
          {/* Quick Help Button */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              executeCommand("HELP");
            }}
            className={`px-2 py-0.5 rounded border transition-colors cursor-pointer text-xs font-semibold whitespace-nowrap ${
              isDark
                ? "bg-[#262626] hover:bg-[#333333] text-zinc-300 hover:text-white border-[#383838]"
                : "bg-white hover:bg-zinc-100 text-black border-zinc-300 shadow-2xs"
            }`}
            title="Show Terminal Commands"
          >
            HELP
          </button>

          {/* Undo Action Button */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              executeCommand("UNDO");
            }}
            disabled={undoStack.length === 0}
            className={`flex items-center gap-1 px-2 py-0.5 rounded border transition-colors text-xs font-semibold whitespace-nowrap ${
              undoStack.length === 0
                ? isDark
                  ? "bg-[#1c1c1c] text-zinc-600 border-[#2b2b2b] cursor-not-allowed opacity-60"
                  : "bg-zinc-100 text-zinc-400 border-zinc-200 cursor-not-allowed opacity-60"
                : isDark
                  ? "bg-[#2b2416] hover:bg-[#382f1b] text-amber-400 hover:text-amber-300 border-amber-600/50 cursor-pointer shadow-2xs"
                  : "bg-amber-50 hover:bg-amber-100 text-amber-800 border-amber-300 cursor-pointer shadow-2xs"
            }`}
            title={
              undoStack.length > 0
                ? `Undo last action (${undoStack.length} step${undoStack.length > 1 ? "s" : ""} available)`
                : "No DDL/DML actions to undo (type UNDO)"
            }
          >
            <span>UNDO</span>
            {undoStack.length > 0 && (
              <span className="text-[10px] px-1 py-0.2 rounded-full bg-amber-500/20 text-amber-500 font-bold">
                {undoStack.length}
              </span>
            )}
          </button>

          {/* Show Databases Button */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              executeCommand("SHOW DATABASES");
            }}
            className={`px-2 py-0.5 rounded border transition-colors cursor-pointer text-xs font-semibold whitespace-nowrap ${
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
            className={`px-2 py-0.5 rounded border transition-colors cursor-pointer text-xs font-semibold whitespace-nowrap ${
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
              clearTerminal();
            }}
            className={`px-2 py-0.5 rounded border transition-colors cursor-pointer text-xs font-semibold whitespace-nowrap ${
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
            className={`flex items-center gap-1.5 px-2.5 py-0.5 rounded border transition-colors cursor-pointer font-bold text-xs whitespace-nowrap ${
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
                {entry.lines.map((l, lIdx) => {
                  const isDidYouMeanHeader = l.trim().toLowerCase() === "did you mean?";
                  const isSuggestionLine =
                    !isDidYouMeanHeader &&
                    entry.lines.slice(0, lIdx).some((prev) => prev.trim().toLowerCase() === "did you mean?");

                  if (entry.type === "error" && isDidYouMeanHeader) {
                    return (
                      <div
                        key={lIdx}
                        className={`whitespace-pre font-bold mt-1.5 ${
                          isDark ? "text-amber-400" : "text-amber-600 font-extrabold"
                        }`}
                      >
                        {l}
                      </div>
                    );
                  }

                  if (entry.type === "error" && isSuggestionLine) {
                    return (
                      <div
                        key={lIdx}
                        onClick={() => {
                          const cleanCmd = l.trim().replace(/^\/\s*$/, "").trim();
                          if (cleanCmd) {
                            setCurrentInput(cleanCmd);
                            inputRef.current?.focus();
                          }
                        }}
                        title="Click to insert into terminal input"
                        className={`whitespace-pre font-semibold transition-colors cursor-pointer hover:underline ${
                          isDark ? "text-sky-300 hover:text-sky-200" : "text-sky-600 hover:text-sky-800"
                        }`}
                      >
                        {l}
                      </div>
                    );
                  }

                  return (
                    <div key={lIdx} className="whitespace-pre">
                      {l}
                    </div>
                  );
                })}
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
