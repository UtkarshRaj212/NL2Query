"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  type Column,
  type ColumnType,
  type Dataset,
  type Table,
  cloneSchema,
  erDiagramChenDot,
} from "@/lib/schema";
import { executeSQL } from "@/lib/sqlEngine";
import { generateDatasetSQL } from "@/lib/exportUtils";
import {
  validateSqlIdentifier,
  suggestValidSqlIdentifier,
  isValidSqlIdentifier,
} from "@/lib/sqlNamingRules";
import { generateDatasetFromPrompt } from "@/lib/datasetPromptGenerator";

interface DatasetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateDataset: (dataset: Dataset) => void;
  onDeleteDataset?: (id: string) => void;
  datasetToEdit?: Dataset | null;
  dark?: boolean;
}

const PROMPT_SUGGESTIONS = [
  {
    label: "E-Commerce Store",
    prompt:
      "Create an e-commerce platform with customers, products, categories, orders, and order items with realistic sample prices, stock levels, and order dates.",
  },
  {
    label: "Bookstore & Reviews",
    prompt:
      "Create an online bookstore database with authors, books, genres, and reader reviews with ratings from 1 to 5.",
  },
  {
    label: "Hospital Clinic",
    prompt:
      "Create a healthcare clinic database with doctors, patients, medical departments, and patient appointment records.",
  },
  {
    label: "University Portal",
    prompt:
      "Create a university database with students, courses, instructors, and semester enrollments with letter grades and credit hours.",
  },
  {
    label: "Airline Flights",
    prompt:
      "Create a flight reservation database with airports, scheduled flights, passengers, and flight ticket bookings.",
  },
  {
    label: "Banking Ledger",
    prompt:
      "Create a personal banking ledger with bank accounts, customers, transactions, and cash balances.",
  },
];

const COLUMN_TYPES: ColumnType[] = [
  "INTEGER",
  "TEXT",
  "REAL",
  "BOOLEAN",
  "DATE",
  "VARCHAR",
];

const DEFAULT_SQL_TEMPLATE = `-- Define your custom dataset tables and sample data:
CREATE TABLE authors (
  id INTEGER PRIMARY KEY,
  name TEXT,
  country TEXT
);

CREATE TABLE books (
  id INTEGER PRIMARY KEY,
  title TEXT,
  genre TEXT,
  price REAL,
  author_id INTEGER REFERENCES authors(id)
);

INSERT INTO authors (id, name, country) VALUES
  (1, 'Jane Austen', 'United Kingdom'),
  (2, 'George Orwell', 'United Kingdom'),
  (3, 'Haruki Murakami', 'Japan');

INSERT INTO books (id, title, genre, price, author_id) VALUES
  (101, 'Pride and Prejudice', 'Romance', 499, 1),
  (102, '1984', 'Dystopian', 399, 2),
  (103, 'Norwegian Wood', 'Fiction', 599, 3);
`;

export function DatasetModal({
  isOpen,
  onClose,
  onCreateDataset,
  onDeleteDataset,
  datasetToEdit,
  dark = false,
}: DatasetModalProps) {
  // Creation method: "manual" or "prompt"
  const [creationMethod, setCreationMethod] = useState<"manual" | "prompt">("manual");
  const [promptText, setPromptText] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [hasGenerated, setHasGenerated] = useState(false);
  const [promptPreviewTab, setPromptPreviewTab] = useState<"tables" | "diagram" | "data">("tables");

  const [mode, setMode] = useState<"visual" | "sql">("visual");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState<string | null>(null);

  // Visual builder state
  const [tables, setTables] = useState<Table[]>([
    {
      name: "items",
      columns: [
        { name: "id", type: "INTEGER", pk: true },
        { name: "name", type: "TEXT" },
        { name: "price", type: "REAL" },
      ],
      rows: [
        { id: 1, name: "Item A", price: 100 },
        { id: 2, name: "Item B", price: 250 },
      ],
    },
  ]);
  const [newTableName, setNewTableName] = useState("");
  const [editingTableIdx, setEditingTableIdx] = useState<number | null>(null);
  const [editingTableName, setEditingTableName] = useState("");

  // SQL Script state
  const [sqlScript, setSqlScript] = useState(DEFAULT_SQL_TEMPLATE);

  // Live validation for Database Name
  const dbNameValidation = useMemo(() => {
    if (!name.trim()) return null;
    return validateSqlIdentifier(name, "database");
  }, [name]);

  // Live validation for New Table Name
  const newTableValidation = useMemo(() => {
    if (!newTableName.trim()) return null;
    return validateSqlIdentifier(newTableName, "table", {
      existingNames: tables.map((t) => t.name),
    });
  }, [newTableName, tables]);

  // Live validation for Table being renamed
  const renameTableValidation = useMemo(() => {
    if (editingTableIdx === null || !editingTableName.trim()) return null;
    return validateSqlIdentifier(editingTableName, "table", {
      existingNames: tables.map((t) => t.name),
      currentName: tables[editingTableIdx]?.name,
    });
  }, [editingTableIdx, editingTableName, tables]);

  // Reset or pre-fill form when modal opens
  useEffect(() => {
    if (isOpen) {
      if (datasetToEdit) {
        setName(datasetToEdit.name);
        setDescription(datasetToEdit.description || "");
        setError(null);
        setMode("visual");
        setCreationMethod("manual");
        setPromptText(datasetToEdit.prompt || "");
        setHasGenerated(Boolean(datasetToEdit.prompt));
        setTables(cloneSchema(datasetToEdit.schema));
        setSqlScript(generateDatasetSQL(datasetToEdit.name, datasetToEdit.schema));
      } else {
        setName("");
        setDescription("");
        setError(null);
        setMode("visual");
        setCreationMethod("manual");
        setPromptText("");
        setHasGenerated(false);
        setTables([
          {
            name: "items",
            columns: [
              { name: "id", type: "INTEGER", pk: true },
              { name: "name", type: "TEXT" },
              { name: "price", type: "REAL" },
            ],
            rows: [
              { id: 1, name: "Item A", price: 100 },
              { id: 2, name: "Item B", price: 250 },
            ],
          },
        ]);
        setSqlScript(DEFAULT_SQL_TEMPLATE);
      }
    }
  }, [isOpen, datasetToEdit]);

  // Handle generating dataset from prompt
  const handleGenerateFromPrompt = async () => {
    if (!promptText.trim()) {
      setError("Please enter a prompt describing the dataset and tables you want to create.");
      return;
    }
    setError(null);
    setIsGenerating(true);
    try {
      const result = await generateDatasetFromPrompt(promptText.trim());
      setName(result.name);
      setDescription(result.description);
      setTables(result.tables);
      setSqlScript(result.sqlScript);
      setHasGenerated(true);
    } catch (err: any) {
      setError(err instanceof Error ? err.message : "Failed to generate dataset from prompt.");
    } finally {
      setIsGenerating(false);
    }
  };

  // Handle Table Add in Visual Mode
  const handleAddTable = () => {
    const raw = newTableName.trim();
    if (!raw) {
      setError("Table name cannot be empty.");
      return;
    }
    const val = validateSqlIdentifier(raw, "table", {
      existingNames: tables.map((t) => t.name),
    });
    if (!val.isValid) {
      setError(val.error || "Invalid table name.");
      return;
    }
    const clean = raw.toLowerCase();
    setTables((prev) => [
      ...prev,
      {
        name: clean,
        columns: [{ name: "id", type: "INTEGER", pk: true }],
        rows: [],
      },
    ]);
    setNewTableName("");
    setError(null);
  };

  const handleStartRenameTable = (idx: number) => {
    setEditingTableIdx(idx);
    setEditingTableName(tables[idx].name);
    setError(null);
  };

  const handleConfirmRenameTable = (idx: number) => {
    const oldName = tables[idx].name;
    const raw = editingTableName.trim();
    const val = validateSqlIdentifier(raw, "table", {
      existingNames: tables.map((t) => t.name),
      currentName: oldName,
    });
    if (!val.isValid) {
      setError(val.error || "Invalid table name.");
      return;
    }
    const newName = raw.toLowerCase();
    setTables((prev) => {
      const next = [...prev];
      next[idx] = { ...next[idx], name: newName };
      for (const t of next) {
        for (const c of t.columns) {
          if (c.fk && c.fk.table.toLowerCase() === oldName.toLowerCase()) {
            c.fk.table = newName;
          }
        }
      }
      return next;
    });
    setEditingTableIdx(null);
    setEditingTableName("");
    setError(null);
  };

  const handleCancelRenameTable = () => {
    setEditingTableIdx(null);
    setEditingTableName("");
  };

  const handleRemoveTable = (tableIndex: number) => {
    setTables((prev) => prev.filter((_, idx) => idx !== tableIndex));
  };

  const handleAddColumn = (tableIndex: number) => {
    setTables((prev) => {
      const updated = [...prev];
      const table = { ...updated[tableIndex] };
      const colNum = table.columns.length + 1;
      table.columns = [
        ...table.columns,
        { name: `col_${colNum}`, type: "TEXT" },
      ];
      updated[tableIndex] = table;
      return updated;
    });
  };

  const handleUpdateColumn = (
    tableIndex: number,
    columnIndex: number,
    updates: Partial<Column>,
  ) => {
    setTables((prev) => {
      const updated = [...prev];
      const table = { ...updated[tableIndex] };
      const columns = [...table.columns];
      if (updates.name !== undefined) {
        // Enforce SQL Norms: automatically eliminate whitespace
        updates.name = updates.name.replace(/\s+/g, "_");
      }
      columns[columnIndex] = { ...columns[columnIndex], ...updates };
      table.columns = columns;
      updated[tableIndex] = table;
      return updated;
    });
  };

  const handleRemoveColumn = (tableIndex: number, columnIndex: number) => {
    setTables((prev) => {
      const updated = [...prev];
      const table = { ...updated[tableIndex] };
      table.columns = table.columns.filter((_, idx) => idx !== columnIndex);
      updated[tableIndex] = table;
      return updated;
    });
  };

  // Live ER diagram calculation for preview
  const liveChenDot = useMemo(() => {
    return erDiagramChenDot(tables, dark);
  }, [tables, dark]);

  // Handle submission
  const handleSave = () => {
    setError(null);
    const rawDbName = name.trim() || (datasetToEdit ? datasetToEdit.name : "custom_db");
    const dbVal = validateSqlIdentifier(rawDbName, "database");
    if (!dbVal.isValid) {
      setError(`Database Name Error: ${dbVal.error}`);
      return;
    }
    const datasetName = rawDbName;
    const datasetId = datasetToEdit?.id || `custom_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;

    if (creationMethod === "prompt" || mode === "visual") {
      if (tables.length === 0) {
        setError("Please add at least one table to your dataset.");
        return;
      }
      for (let i = 0; i < tables.length; i++) {
        const t = tables[i];
        const otherTableNames = tables.filter((_, idx) => idx !== i).map((x) => x.name);
        const tVal = validateSqlIdentifier(t.name, "table", { existingNames: otherTableNames });
        if (!tVal.isValid) {
          setError(`Table "${t.name}" error: ${tVal.error}`);
          return;
        }
        if (!t.columns || t.columns.length === 0) {
          setError(`Table "${t.name}" must have at least one column.`);
          return;
        }
        for (let j = 0; j < t.columns.length; j++) {
          const c = t.columns[j];
          const otherColNames = t.columns.filter((_, idx) => idx !== j).map((x) => x.name);
          const cVal = validateSqlIdentifier(c.name, "column", { existingNames: otherColNames });
          if (!cVal.isValid) {
            setError(`Table "${t.name}", column "${c.name}" error: ${cVal.error}`);
            return;
          }
        }
      }

      const defaultQuery = tables[0]?.name
        ? `SELECT * FROM ${tables[0].name} LIMIT 10;`
        : "SELECT 1;";

      const savedDataset: Dataset = {
        id: datasetId,
        name: datasetName,
        description:
          description.trim() || `Dataset with ${tables.length} tables`,
        schema: tables,
        defaultQuery: datasetToEdit?.defaultQuery || defaultQuery,
        examples: datasetToEdit?.examples && datasetToEdit.examples.length > 0
          ? datasetToEdit.examples
          : [
            {
              id: 1,
              category: "DQL",
              question: `Show all records from ${tables[0].name}`,
              sql: defaultQuery,
              expected: `Query all rows from ${tables[0].name}`,
            },
          ],
        isCustom: true,
        createdAt: datasetToEdit?.createdAt || Date.now(),
        prompt: promptText.trim() ? promptText.trim() : (datasetToEdit?.prompt || undefined),
      };

      onCreateDataset(savedDataset);
      onClose();
    } else {
      // SQL mode
      try {
        const result = executeSQL(sqlScript, []);
        if (result.error) {
          setError(`SQL Execution Error: ${result.error}`);
          return;
        }
        if (!result.updatedSchema || result.updatedSchema.length === 0) {
          setError("No tables were created. Make sure your SQL contains CREATE TABLE statements.");
          return;
        }

        const schema = result.updatedSchema;
        const defaultQuery = schema[0]?.name
          ? `SELECT * FROM ${schema[0].name} LIMIT 10;`
          : "SELECT 1;";

        const savedDataset: Dataset = {
          id: datasetId,
          name: datasetName,
          description:
            description.trim() || `Configured via SQL (${schema.length} tables)`,
          schema,
          defaultQuery: datasetToEdit?.defaultQuery || defaultQuery,
          examples: datasetToEdit?.examples && datasetToEdit.examples.length > 0
            ? datasetToEdit.examples
            : [
              {
                id: 1,
                category: "DQL",
                question: `Query ${schema[0].name}`,
                sql: defaultQuery,
                expected: `Sample query on ${schema[0].name}`,
              },
            ],
          isCustom: true,
          createdAt: datasetToEdit?.createdAt || Date.now(),
          prompt: promptText.trim() ? promptText.trim() : (datasetToEdit?.prompt || undefined),
        };

        onCreateDataset(savedDataset);
        onClose();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to execute SQL script.");
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs"
      onClick={(e) => e.target === e.currentTarget && onClose()}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="max-w-3xl w-full max-h-[90vh] flex flex-col rounded-xl shadow-2xl overflow-hidden border"
        style={{
          background: "var(--panel)",
          borderColor: "var(--border)",
          color: "var(--foreground)",
        }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-5 py-4 border-b"
          style={{ borderColor: "var(--border)" }}
        >
          <div>
            <h2 className="text-lg font-bold" style={{ color: "var(--foreground)" }}>
              {datasetToEdit ? `Edit Dataset: ${datasetToEdit.name}` : "Create New Dataset"}
            </h2>
            <p className="text-xs opacity-75" style={{ color: "var(--muted)" }}>
              {datasetToEdit
                ? "Modify your database tables, columns, data rows, and SQL script."
                : "Build your custom database tables with schema definitions, primary keys, and relationships."}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-sm transition-opacity hover:opacity-75"
            style={{ color: "var(--muted)" }}
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {error && (
            <div className="p-3 text-xs bg-rose-500/10 border border-rose-500/30 text-rose-500 rounded-lg">
              {error}
            </div>
          )}

          {/* Top Mode Toggle: Manual vs Prompt */}
          <div
            className="flex border rounded-xl p-1 gap-1"
            style={{
              borderColor: "var(--border)",
              background: "var(--surface-subtle)",
            }}
          >
            <button
              type="button"
              onClick={() => {
                setCreationMethod("manual");
                setError(null);
              }}
              className="flex-1 py-2 px-3 text-center rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2 border"
              style={{
                background:
                  creationMethod === "manual" ? "var(--panel)" : "transparent",
                color:
                  creationMethod === "manual"
                    ? "var(--foreground)"
                    : "var(--muted)",
                borderColor:
                  creationMethod === "manual"
                    ? "var(--border)"
                    : "transparent",
                boxShadow:
                  creationMethod === "manual"
                    ? "0 1px 3px rgba(0,0,0,0.1)"
                    : "none",
              }}
            >
              <svg
                className="w-3.5 h-3.5 shrink-0 opacity-80"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                />
              </svg>
              <span>Manual</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setCreationMethod("prompt");
                setError(null);
              }}
              className="flex-1 py-2 px-3 text-center rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2 border"
              style={{
                background:
                  creationMethod === "prompt" ? "var(--panel)" : "transparent",
                color:
                  creationMethod === "prompt"
                    ? "var(--accent, #06b6d4)"
                    : "var(--muted)",
                borderColor:
                  creationMethod === "prompt"
                    ? "var(--border)"
                    : "transparent",
                boxShadow:
                  creationMethod === "prompt"
                    ? "0 1px 3px rgba(0,0,0,0.1)"
                    : "none",
              }}
            >
              <span>Prompt</span>
            </button>
          </div>

          {creationMethod === "manual" ? (
            <div className="space-y-4">
              {/* Dataset Name and Description */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label
                    className="block text-xs font-semibold uppercase tracking-wider mb-1"
                    style={{ color: "var(--muted)" }}
                  >
                    Database / Dataset Name *
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value.replace(/\s+/g, "_"))}
                    placeholder="e.g. bookstore_db, healthcare_catalog"
                    className="w-full p-2 text-sm rounded-lg border focus:outline-none font-mono"
                    style={{
                      background: "var(--surface-subtle)",
                      borderColor: dbNameValidation && !dbNameValidation.isValid ? "#f43f5e" : "var(--border)",
                      color: "var(--foreground)",
                    }}
                  />
                  {dbNameValidation && !dbNameValidation.isValid && (
                    <div className="mt-1 flex items-center justify-between text-[11px] text-amber-500 bg-amber-500/10 px-2 py-1 rounded border border-amber-500/20">
                      <span>{dbNameValidation.error}</span>
                      {dbNameValidation.suggestion && (
                        <button
                          type="button"
                          onClick={() => setName(dbNameValidation.suggestion!)}
                          className="ml-2 font-mono underline hover:text-amber-400 cursor-pointer"
                        >
                          Fix: {dbNameValidation.suggestion}
                        </button>
                      )}
                    </div>
                  )}
                </div>
                <div>
                  <label
                    className="block text-xs font-semibold uppercase tracking-wider mb-1"
                    style={{ color: "var(--muted)" }}
                  >
                    Description
                  </label>
                  <input
                    type="text"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Short description of your dataset"
                    className="w-full p-2 text-sm rounded-lg border focus:outline-none"
                    style={{
                      background: "var(--surface-subtle)",
                      borderColor: "var(--border)",
                      color: "var(--foreground)",
                    }}
                  />
                </div>
              </div>

              {/* Mode Switcher */}
              <div
                className="flex border rounded-lg overflow-hidden text-xs font-semibold"
                style={{ borderColor: "var(--border)" }}
              >
                <button
                  type="button"
                  onClick={() => setMode("visual")}
                  className="flex-1 py-2 text-center transition-colors cursor-pointer"
                  style={{
                    background: mode === "visual" ? "var(--accent)" : "var(--surface-subtle)",
                    color: mode === "visual" ? "var(--accent-foreground)" : "var(--muted)",
                  }}
                >
                  Visual Table Builder
                </button>
                <button
                  type="button"
                  onClick={() => setMode("sql")}
                  className="flex-1 py-2 text-center transition-colors cursor-pointer"
                  style={{
                    background: mode === "sql" ? "var(--accent)" : "var(--surface-subtle)",
                    color: mode === "sql" ? "var(--accent-foreground)" : "var(--muted)",
                  }}
                >
                  SQL DDL Script
                </button>
              </div>

              {/* Mode 1: Visual Table Builder */}
              {mode === "visual" && (
                <div className="space-y-4">
                  {/* Add Table input */}
                  <div>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={newTableName}
                        onChange={(e) => setNewTableName(e.target.value.replace(/\s+/g, "_"))}
                        onKeyDown={(e) => e.key === "Enter" && handleAddTable()}
                        placeholder="New table name (e.g. orders, patients)"
                        className="flex-1 p-2 text-sm rounded-lg border focus:outline-none font-mono"
                        style={{
                          background: "var(--surface-subtle)",
                          borderColor: newTableValidation && !newTableValidation.isValid ? "#f43f5e" : "var(--border)",
                          color: "var(--foreground)",
                        }}
                      />
                      <button
                        type="button"
                        onClick={handleAddTable}
                        className="px-4 py-2 rounded-lg text-xs font-semibold transition-colors cursor-pointer shadow-xs border"
                        style={{
                          background: "var(--accent-gradient, var(--accent))",
                          color: "var(--accent-foreground)",
                          borderColor: "var(--accent)",
                        }}
                      >
                        + Add Table
                      </button>
                    </div>
                    {newTableValidation && !newTableValidation.isValid && (
                      <div className="mt-1 flex items-center justify-between text-[11px] text-amber-500 bg-amber-500/10 px-2 py-1 rounded border border-amber-500/20">
                        <span>{newTableValidation.error}</span>
                        {newTableValidation.suggestion && (
                          <button
                            type="button"
                            onClick={() => setNewTableName(newTableValidation.suggestion!)}
                            className="ml-2 font-mono underline hover:text-amber-400 cursor-pointer"
                          >
                            Fix: {newTableValidation.suggestion}
                          </button>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Tables List */}
                  <div className="space-y-3">
                    {tables.map((table, tIdx) => (
                      <div
                        key={tIdx}
                        className="p-3 rounded-lg border space-y-2.5"
                        style={{
                          background: "var(--surface-subtle)",
                          borderColor: "var(--border)",
                        }}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            {editingTableIdx === tIdx ? (
                              <div className="flex items-center gap-1.5">
                                <input
                                  type="text"
                                  value={editingTableName}
                                  onChange={(e) => setEditingTableName(e.target.value.replace(/\s+/g, "_"))}
                                  onKeyDown={(e) => {
                                    if (e.key === "Enter") handleConfirmRenameTable(tIdx);
                                    if (e.key === "Escape") handleCancelRenameTable();
                                  }}
                                  className="px-2 py-0.5 text-xs font-mono font-bold rounded border focus:outline-none"
                                  style={{
                                    background: "var(--panel)",
                                    borderColor: renameTableValidation && !renameTableValidation.isValid ? "#f43f5e" : "var(--border)",
                                    color: "var(--foreground)",
                                  }}
                                  autoFocus
                                />
                                <button
                                  type="button"
                                  onClick={() => handleConfirmRenameTable(tIdx)}
                                  className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/30 cursor-pointer"
                                >
                                  Save
                                </button>
                                <button
                                  type="button"
                                  onClick={handleCancelRenameTable}
                                  className="text-[10px] px-1.5 py-0.5 rounded border hover:opacity-80 cursor-pointer"
                                  style={{ borderColor: "var(--border)", color: "var(--muted)" }}
                                >
                                  Cancel
                                </button>
                              </div>
                            ) : (
                              <>
                                <span
                                  className="font-mono font-bold text-sm"
                                  style={{ color: "var(--foreground)" }}
                                >
                                  {table.name}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => handleStartRenameTable(tIdx)}
                                  className="text-[10px] px-1.5 py-0.5 rounded border hover:opacity-90 opacity-70 cursor-pointer"
                                  style={{
                                    borderColor: "var(--border)",
                                    color: "var(--muted)",
                                    background: "var(--panel)",
                                  }}
                                  title="Rename table"
                                >
                                  Rename
                                </button>
                              </>
                            )}
                            <span className="text-[11px] opacity-60" style={{ color: "var(--muted)" }}>
                              ({table.columns.length} columns)
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => handleAddColumn(tIdx)}
                              className="text-[11px] px-2 py-1 rounded border font-medium cursor-pointer hover:opacity-90"
                              style={{
                                background: "var(--panel)",
                                borderColor: "var(--border)",
                                color: "var(--foreground)",
                              }}
                            >
                              + Column
                            </button>
                            <button
                              type="button"
                              onClick={() => handleRemoveTable(tIdx)}
                              className="text-[11px] px-2 py-1 rounded border border-red-500/40 text-red-500 hover:bg-red-500/10 font-medium cursor-pointer"
                            >
                              Delete
                            </button>
                          </div>
                        </div>

                        {editingTableIdx === tIdx && renameTableValidation && !renameTableValidation.isValid && (
                          <div className="text-[11px] text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                            {renameTableValidation.error}
                          </div>
                        )}

                        {/* Columns */}
                        <div className="space-y-1.5 pl-1">
                          {table.columns.map((col, cIdx) => {
                            const colVal = validateSqlIdentifier(col.name, "column", {
                              existingNames: table.columns.filter((_, i) => i !== cIdx).map((c) => c.name),
                            });
                            return (
                              <div key={cIdx} className="space-y-1">
                                <div
                                  className="flex flex-wrap items-center gap-2 text-xs p-2 rounded border"
                                  style={{
                                    background: "var(--panel)",
                                    borderColor: !colVal.isValid ? "#f43f5e" : "var(--border)",
                                  }}
                                >
                                  <input
                                    type="text"
                                    value={col.name}
                                    onChange={(e) =>
                                      handleUpdateColumn(tIdx, cIdx, {
                                        name: e.target.value.toLowerCase().replace(/\s+/g, "_"),
                                      })
                                    }
                                    placeholder="column_name"
                                    className="px-2 py-1 rounded border font-mono text-xs w-28 focus:outline-none"
                                    style={{
                                      background: "var(--surface-subtle)",
                                      borderColor: !colVal.isValid ? "#f43f5e" : "var(--border)",
                                      color: "var(--foreground)",
                                    }}
                                    title={!colVal.isValid ? colVal.error : undefined}
                                  />
                                  <select
                                    value={col.type}
                                    onChange={(e) =>
                                      handleUpdateColumn(tIdx, cIdx, {
                                        type: e.target.value as ColumnType,
                                      })
                                    }
                                    className="px-2 py-1 rounded border text-xs focus:outline-none"
                                    style={{
                                      background: "var(--surface-subtle)",
                                      borderColor: "var(--border)",
                                      color: "var(--foreground)",
                                    }}
                                  >
                                    {COLUMN_TYPES.map((type) => (
                                      <option key={type} value={type}>
                                        {type}
                                      </option>
                                    ))}
                                  </select>

                                  {/* Primary Key Checkbox */}
                                  <label
                                    className="flex items-center gap-1 cursor-pointer select-none text-[11px] font-semibold"
                                    style={{ color: "var(--foreground)" }}
                                  >
                                    <input
                                      type="checkbox"
                                      checked={Boolean(col.pk)}
                                      onChange={(e) =>
                                        handleUpdateColumn(tIdx, cIdx, {
                                          pk: e.target.checked,
                                        })
                                      }
                                      className="rounded"
                                      style={{ accentColor: "var(--accent)" }}
                                    />
                                    PK
                                  </label>

                                  {/* Foreign Key Selector */}
                                  <div className="flex items-center gap-1">
                                    <span className="opacity-60 text-[10px]" style={{ color: "var(--muted)" }}>
                                      FK →
                                    </span>
                                    <select
                                      value={
                                        col.fk
                                          ? `${col.fk.table}.${col.fk.column}`
                                          : ""
                                      }
                                      onChange={(e) => {
                                        const val = e.target.value;
                                        if (!val) {
                                          handleUpdateColumn(tIdx, cIdx, {
                                            fk: undefined,
                                          });
                                        } else {
                                          const [fTable, fCol] = val.split(".");
                                          handleUpdateColumn(tIdx, cIdx, {
                                            fk: { table: fTable, column: fCol },
                                          });
                                        }
                                      }}
                                      className="px-1.5 py-1 rounded border text-[11px] focus:outline-none max-w-32"
                                      style={{
                                        background: "var(--surface-subtle)",
                                        borderColor: "var(--border)",
                                        color: "var(--foreground)",
                                      }}
                                    >
                                      <option value="">None</option>
                                      {tables
                                        .filter((_, idx) => idx !== tIdx)
                                        .map((targetT) =>
                                          targetT.columns.map((targetC) => (
                                            <option
                                              key={`${targetT.name}.${targetC.name}`}
                                              value={`${targetT.name}.${targetC.name}`}
                                            >
                                              {targetT.name}.{targetC.name}
                                            </option>
                                          )),
                                        )}
                                    </select>
                                  </div>

                                  {table.columns.length > 1 && (
                                    <button
                                      type="button"
                                      onClick={() => handleRemoveColumn(tIdx, cIdx)}
                                      className="text-red-500 opacity-70 hover:opacity-100 ml-auto cursor-pointer"
                                      title="Remove column"
                                    >
                                      ✕
                                    </button>
                                  )}
                                </div>
                                {!colVal.isValid && (
                                  <div className="text-[10px] text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                                    {colVal.error}
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Real-time ER Diagram preview */}
                  <div
                    className="p-3 rounded-lg border"
                    style={{
                      background: "var(--surface-subtle)",
                      borderColor: "var(--border)",
                    }}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span
                        className="text-xs font-semibold uppercase tracking-wider"
                        style={{ color: "var(--muted)" }}
                      >
                        Live ER Diagram Preview
                      </span>
                      <span className="text-[11px] opacity-70" style={{ color: "var(--muted)" }}>
                        Auto-generated from tables &amp; relationships
                      </span>
                    </div>
                    <ChenDiagramPreview dot={liveChenDot} />
                  </div>
                </div>
              )}

              {/* Mode 2: SQL Script Mode */}
              {mode === "sql" && (
                <div className="space-y-2">
                  <label
                    className="block text-xs font-semibold uppercase tracking-wider"
                    style={{ color: "var(--muted)" }}
                  >
                    SQL Schema Script (CREATE TABLE &amp; INSERT)
                  </label>
                  <textarea
                    value={sqlScript}
                    onChange={(e) => setSqlScript(e.target.value)}
                    rows={12}
                    spellCheck={false}
                    className="w-full p-3 text-xs font-mono rounded-lg border resize-y focus:outline-none"
                    style={{
                      background: "var(--surface-subtle)",
                      borderColor: "var(--border)",
                      color: "var(--foreground)",
                    }}
                  />
                  <p className="text-[11px] opacity-70" style={{ color: "var(--muted)" }}>
                    Tip: Multiple statements separated by semicolons are fully supported.
                  </p>
                </div>
              )}
            </div>
          ) : (
            /* Prompt Creation Section */
            <div className="space-y-4">
              <div
                className="p-4 rounded-xl border space-y-3"
                style={{
                  background: "var(--surface-subtle)",
                  borderColor: "var(--border)",
                }}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3
                      className="text-xs font-bold uppercase tracking-wider flex items-center gap-1.5"
                      style={{ color: "var(--foreground)" }}
                    >
                      <span>Generate Dataset &amp; Tables with AI Prompt</span>
                    </h3>
                    <p className="text-xs opacity-75 mt-0.5" style={{ color: "var(--muted)" }}>
                      Describe the domain, tables, columns, and relationships. The generator will create the schema definitions and realistic sample data.
                    </p>
                  </div>
                  {hasGenerated && (
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase bg-emerald-500/10 text-emerald-500 border border-emerald-500/30 shrink-0">
                      Generated
                    </span>
                  )}
                </div>

                {/* Prompt Box */}
                <div>
                  <label
                    className="block text-xs font-semibold uppercase tracking-wider mb-1"
                    style={{ color: "var(--muted)" }}
                  >
                    Enter Prompt *
                  </label>
                  <textarea
                    value={promptText}
                    onChange={(e) => setPromptText(e.target.value)}
                    placeholder="e.g. Create an online bookstore database with customers, books, authors, and orders with realistic sample prices, publication years, and customer cities."
                    rows={4}
                    className="w-full p-3 text-xs rounded-lg border focus:outline-none resize-y leading-relaxed font-sans"
                    style={{
                      background: "var(--panel)",
                      borderColor: "var(--border)",
                      color: "var(--foreground)",
                    }}
                  />
                </div>

                {/* Quick suggestions */}
                <div className="space-y-1.5">
                  <div
                    className="text-[11px] font-semibold uppercase tracking-wider opacity-75"
                    style={{ color: "var(--muted)" }}
                  >
                    Quick Ideas:
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {PROMPT_SUGGESTIONS.map((s, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setPromptText(s.prompt)}
                        className="px-2.5 py-1 rounded-md text-[11px] font-medium border hover:opacity-100 opacity-80 transition-all cursor-pointer text-left"
                        style={{
                          background: "var(--panel)",
                          borderColor: "var(--border)",
                          color: "var(--foreground)",
                        }}
                      >
                        {s.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Generate Button Action Row */}
                <div className="flex items-center justify-between pt-1">
                  <span className="text-[11px] opacity-70" style={{ color: "var(--muted)" }}>
                    {isGenerating
                      ? "Synthesizing relational schema and tables..."
                      : hasGenerated
                        ? "Edit prompt above and click Regenerate to update tables."
                        : "Click generate to create the database schema & sample rows."}
                  </span>
                  <button
                    type="button"
                    onClick={handleGenerateFromPrompt}
                    disabled={isGenerating || !promptText.trim()}
                    className="px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer shadow-xs border flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{
                      background: "var(--accent-gradient, var(--accent))",
                      color: "var(--accent-foreground)",
                      borderColor: "var(--accent)",
                    }}
                  >
                    {isGenerating ? (
                      <>
                        <svg className="animate-spin h-3.5 w-3.5" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        <span>Generating Tables...</span>
                      </>
                    ) : hasGenerated ? (
                      <span>Regenerate Dataset</span>
                    ) : (
                      <span>Generate Dataset &amp; Tables</span>
                    )}
                  </button>
                </div>
              </div>

              {/* Generated Dataset Preview & Edit Section */}
              {hasGenerated && (
                <div
                  className="p-4 rounded-xl border space-y-4 animate-in fade-in duration-200"
                  style={{
                    background: "var(--surface-subtle)",
                    borderColor: "var(--border)",
                  }}
                >
                  <div
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b"
                    style={{ borderColor: "var(--border)" }}
                  >
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono font-bold text-sm" style={{ color: "var(--foreground)" }}>
                          {name}
                        </span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-cyan-500/10 text-cyan-500 border border-cyan-500/30">
                          {tables.length} {tables.length === 1 ? "Table" : "Tables"}
                        </span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-purple-500/10 text-purple-400 border border-purple-500/30">
                          {tables.reduce((acc, t) => acc + (t.rows?.length || 0), 0)} Rows
                        </span>
                      </div>
                      <p className="text-xs opacity-80 mt-1" style={{ color: "var(--muted)" }}>
                        {description}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setCreationMethod("manual");
                        setError(null);
                      }}
                      className="px-3.5 py-1.5 rounded-lg text-xs font-bold border transition-colors cursor-pointer flex items-center gap-1.5 shrink-0 hover:opacity-90"
                      style={{
                        background: "var(--panel)",
                        borderColor: "var(--border)",
                        color: "var(--foreground)",
                      }}
                      title="Switch to manual editor to customize tables, columns, and rows"
                    >
                      <span>Edit Manually</span>
                    </button>
                  </div>

                  {/* Tabs: Tables & Schema | Live ER Diagram | Sample Data */}
                  <div
                    className="flex border rounded-lg overflow-hidden text-xs font-semibold"
                    style={{ borderColor: "var(--border)" }}
                  >
                    <button
                      type="button"
                      onClick={() => setPromptPreviewTab("tables")}
                      className="flex-1 py-1.5 text-center transition-colors cursor-pointer"
                      style={{
                        background: promptPreviewTab === "tables" ? "var(--accent)" : "var(--panel)",
                        color: promptPreviewTab === "tables" ? "var(--accent-foreground)" : "var(--muted)",
                      }}
                    >
                      Tables &amp; Schema ({tables.length})
                    </button>
                    <button
                      type="button"
                      onClick={() => setPromptPreviewTab("diagram")}
                      className="flex-1 py-1.5 text-center transition-colors cursor-pointer"
                      style={{
                        background: promptPreviewTab === "diagram" ? "var(--accent)" : "var(--panel)",
                        color: promptPreviewTab === "diagram" ? "var(--accent-foreground)" : "var(--muted)",
                      }}
                    >
                      Live ER Diagram
                    </button>
                    <button
                      type="button"
                      onClick={() => setPromptPreviewTab("data")}
                      className="flex-1 py-1.5 text-center transition-colors cursor-pointer"
                      style={{
                        background: promptPreviewTab === "data" ? "var(--accent)" : "var(--panel)",
                        color: promptPreviewTab === "data" ? "var(--accent-foreground)" : "var(--muted)",
                      }}
                    >
                      Sample Data
                    </button>
                  </div>

                  {/* Tab 1: Tables & Columns */}
                  {promptPreviewTab === "tables" && (
                    <div className="space-y-2.5 max-h-64 overflow-y-auto pr-1">
                      {tables.map((t, idx) => (
                        <div
                          key={idx}
                          className="p-3 rounded-lg border text-xs"
                          style={{
                            background: "var(--panel)",
                            borderColor: "var(--border)",
                          }}
                        >
                          <div className="flex items-center justify-between font-mono font-bold text-xs mb-2">
                            <span className="flex items-center gap-1.5">
                              <span style={{ color: "var(--foreground)" }}>{t.name}</span>
                            </span>
                            <span className="text-[10px] font-normal opacity-70" style={{ color: "var(--muted)" }}>
                              {t.columns.length} columns • {t.rows?.length || 0} rows
                            </span>
                          </div>
                          <div className="flex flex-wrap gap-1.5">
                            {t.columns.map((c, cIdx) => (
                              <span
                                key={cIdx}
                                className="px-2 py-0.5 rounded text-[11px] font-mono border flex items-center gap-1"
                                style={{
                                  background: c.pk
                                    ? "rgba(16, 185, 129, 0.1)"
                                    : c.fk
                                      ? "rgba(139, 92, 246, 0.1)"
                                      : "var(--surface-subtle)",
                                  borderColor: c.pk
                                    ? "rgba(16, 185, 129, 0.3)"
                                    : c.fk
                                      ? "rgba(139, 92, 246, 0.3)"
                                      : "var(--border)",
                                  color: c.pk ? "#10b981" : c.fk ? "#a78bfa" : "var(--foreground)",
                                }}
                              >
                                <span>{c.name}</span>
                                <span className="opacity-60 text-[10px]">({c.type})</span>
                                {c.pk && (
                                  <span className="text-[9px] font-bold uppercase bg-emerald-500/20 px-1 rounded">
                                    PK
                                  </span>
                                )}
                                {c.fk && (
                                  <span className="text-[9px] font-bold uppercase bg-purple-500/20 px-1 rounded">
                                    FK→{c.fk.table}
                                  </span>
                                )}
                              </span>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Tab 2: Live ER Diagram */}
                  {promptPreviewTab === "diagram" && (
                    <div>
                      <ChenDiagramPreview dot={liveChenDot} />
                    </div>
                  )}

                  {/* Tab 3: Sample Data */}
                  {promptPreviewTab === "data" && (
                    <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
                      {tables.map((t, idx) => (
                        <div
                          key={idx}
                          className="p-3 rounded-lg border text-xs"
                          style={{
                            background: "var(--panel)",
                            borderColor: "var(--border)",
                          }}
                        >
                          <div className="font-mono font-bold text-xs mb-2" style={{ color: "var(--foreground)" }}>
                            {t.name} (sample rows)
                          </div>
                          {t.rows && t.rows.length > 0 ? (
                            <div className="overflow-x-auto">
                              <table className="w-full text-[11px] font-mono border-collapse">
                                <thead>
                                  <tr className="border-b" style={{ borderColor: "var(--border)" }}>
                                    {t.columns.map((c, cIdx) => (
                                      <th
                                        key={cIdx}
                                        className="text-left p-1 opacity-75 font-semibold"
                                        style={{ color: "var(--muted)" }}
                                      >
                                        {c.name}
                                      </th>
                                    ))}
                                  </tr>
                                </thead>
                                <tbody>
                                  {t.rows.slice(0, 4).map((r, rIdx) => (
                                    <tr key={rIdx} className="border-b border-white/5">
                                      {t.columns.map((c, cIdx) => (
                                        <td
                                          key={cIdx}
                                          className="p-1 truncate max-w-[120px]"
                                          style={{ color: "var(--foreground)" }}
                                        >
                                          {String(r[c.name] ?? "")}
                                        </td>
                                      ))}
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          ) : (
                            <div className="text-[11px] opacity-70" style={{ color: "var(--muted)" }}>
                              No sample rows.
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div
          className="flex items-center justify-end gap-2 px-5 py-3 border-t"
          style={{
            background: "var(--surface-subtle)",
            borderColor: "var(--border)",
          }}
        >
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-xs font-semibold border transition-colors cursor-pointer hover:opacity-90"
            style={{
              background: "var(--panel)",
              borderColor: "var(--border)",
              color: "var(--foreground)",
            }}
          >
            Cancel
          </button>
          {datasetToEdit?.isCustom && onDeleteDataset && (
            <button
              type="button"
              onClick={() => {
                if (datasetToEdit) {
                  onDeleteDataset(datasetToEdit.id);
                  onClose();
                }
              }}
              className="px-4 py-2 rounded-lg text-xs font-semibold border border-red-500/40 text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              <span>Delete Dataset</span>
            </button>
          )}

          {creationMethod === "prompt" && !hasGenerated ? (
            <button
              type="button"
              onClick={handleGenerateFromPrompt}
              disabled={isGenerating || !promptText.trim()}
              className="px-4 py-2 rounded-lg text-xs font-semibold transition-opacity shadow-xs cursor-pointer hover:opacity-90 border disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5"
              style={{
                background: "var(--accent-gradient, var(--accent))",
                color: "var(--accent-foreground)",
                borderColor: "var(--accent)",
              }}
            >
              <span>Generate Dataset</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSave}
              className="px-4 py-2 rounded-lg text-xs font-semibold transition-opacity shadow-xs cursor-pointer hover:opacity-90 border"
              style={{
                background: "var(--accent-gradient, var(--accent))",
                color: "var(--accent-foreground)",
                borderColor: "var(--accent)",
              }}
            >
              {datasetToEdit ? "Save Changes" : "Create Dataset"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

let modalVizPromise: Promise<{ renderString: (src: string, opts?: { format: string }) => string }> | null = null;
function getModalVizInstance() {
  if (!modalVizPromise) {
    modalVizPromise = import("@viz-js/viz").then(({ instance }) => instance());
  }
  return modalVizPromise;
}

function ChenDiagramPreview({ dot }: { dot: string }) {
  const diagramRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;
    getModalVizInstance()
      .then((viz) => {
        if (cancelled || !diagramRef.current) return;
        const svg = viz.renderString(dot, { format: "svg" });
        if (cancelled || !diagramRef.current) return;
        diagramRef.current.innerHTML = svg;
      })
      .catch((err) => {
        if (cancelled || !diagramRef.current) return;
        diagramRef.current.innerHTML = `<p class="text-[11px] text-red-500 p-1">Diagram preview: ${err instanceof Error ? err.message : String(err)}</p>`;
      });
    return () => {
      cancelled = true;
    };
  }, [dot]);

  return (
    <div
      ref={diagramRef}
      className="panel min-h-24 max-h-56 overflow-auto p-2 [&_svg]:mx-auto [&_svg]:max-w-full"
      style={{
        background: "var(--panel)",
        borderColor: "var(--border)",
      }}
      aria-label="Chen ER diagram preview"
    />
  );
}

