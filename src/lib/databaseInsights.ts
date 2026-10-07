import type { Table, Column } from "./schema";

export interface ColumnInsight {
  name: string;
  type: string;
  isPk: boolean;
  fk?: { table: string; column: string };
  totalCount: number;
  distinctCount: number;
  nullCount: number;
  nullPercentage: number;
  isUnique: boolean;
  isNumeric: boolean;
  isDate: boolean;
  min?: number | string;
  max?: number | string;
  avg?: number;
  formattedMin?: string;
  formattedMax?: string;
  formattedAvg?: string;
  mostCommon?: {
    value: string;
    count: number;
    percentage: number;
  };
}

export interface TableInsight {
  name: string;
  rowCount: number;
  columnCount: number;
  primaryKeys: string[];
  foreignKeys: { column: string; targetTable: string; targetColumn: string }[];
  storageSizeFormatted: string;
  storageSizeBytes: number;
  lastUpdated: string;
  columns: ColumnInsight[];
}

export interface DataQualityCheck {
  id: string;
  title: string;
  description: string;
  status: "pass" | "warn" | "fail";
  scoreImpact: number;
  count: number;
  details: string[];
}

export interface SmartSuggestion {
  id: string;
  trigger: string;
  title: string;
  question: string;
  sql: string;
  category: "aggregation" | "filter" | "join" | "ordering";
  tableName: string;
}

export interface DatabaseInsightReport {
  healthScore: number;
  totalTables: number;
  totalRows: number;
  totalColumns: number;
  totalStorageFormatted: string;
  tables: Record<string, TableInsight>;
  qualityChecks: DataQualityCheck[];
  smartSuggestions: SmartSuggestion[];
}

/**
 * Format numeric currency/value with symbol if column suggests money/pricing
 */
function formatColumnValue(colName: string, num: number): string {
  const isCurrency = /(price|amount|cost|salary|total|revenue|balance|fee|budget)/i.test(
    colName,
  );
  const formattedNum = num.toLocaleString("en-IN", {
    maximumFractionDigits: 2,
  });
  return isCurrency ? `₹${formattedNum}` : formattedNum;
}

/**
 * Compute column-level profile statistics
 */
export function analyzeColumn(
  column: Column,
  rows: Record<string, unknown>[],
): ColumnInsight {
  const colName = column.name;
  const totalCount = rows.length;

  let nullCount = 0;
  const values: unknown[] = [];
  const freqMap = new Map<string, number>();

  for (const row of rows) {
    const rawVal = row[colName];
    if (
      rawVal === null ||
      rawVal === undefined ||
      rawVal === "" ||
      (typeof rawVal === "string" && rawVal.trim().toUpperCase() === "NULL")
    ) {
      nullCount++;
    } else {
      values.push(rawVal);
      const strVal = String(rawVal);
      freqMap.set(strVal, (freqMap.get(strVal) || 0) + 1);
    }
  }

  const distinctCount = freqMap.size;
  const nullPercentage =
    totalCount > 0 ? Math.round((nullCount / totalCount) * 1000) / 10 : 0;
  const isUnique =
    totalCount > 0 && nullCount === 0 && distinctCount === totalCount;

  // Most common value
  let mostCommon:
    | { value: string; count: number; percentage: number }
    | undefined = undefined;
  if (freqMap.size > 0) {
    let topVal = "";
    let topCount = 0;
    for (const [val, count] of freqMap.entries()) {
      if (count > topCount) {
        topCount = count;
        topVal = val;
      }
    }
    const pct =
      totalCount > 0 ? Math.round((topCount / totalCount) * 100) : 0;
    mostCommon = {
      value: topVal,
      count: topCount,
      percentage: pct,
    };
  }

  // Type inference and numeric / date analysis
  const colTypeUpper = (column.type || "").toUpperCase();
  const explicitNumeric = /(INT|NUM|DEC|FLOAT|DOUBLE|REAL|PRICE|AMOUNT)/i.test(
    colTypeUpper,
  );
  const explicitDate = /(DATE|TIME|TIMESTAMP|YEAR)/i.test(colTypeUpper);

  let isNumeric = explicitNumeric;
  let isDate = explicitDate;

  // Sample check if not explicit
  if (!isNumeric && !isDate && values.length > 0) {
    const allNumeric = values.every(
      (v) => typeof v === "number" || (!isNaN(Number(v)) && String(v).trim() !== ""),
    );
    if (allNumeric) {
      isNumeric = true;
    }
  }

  let min: number | string | undefined;
  let max: number | string | undefined;
  let avg: number | undefined;
  let formattedMin: string | undefined;
  let formattedMax: string | undefined;
  let formattedAvg: string | undefined;

  if (isNumeric && values.length > 0) {
    const numValues = values
      .map((v) => Number(v))
      .filter((n) => !isNaN(n));
    if (numValues.length > 0) {
      const minNum = Math.min(...numValues);
      const maxNum = Math.max(...numValues);
      const sum = numValues.reduce((a, b) => a + b, 0);
      const avgNum = Math.round((sum / numValues.length) * 100) / 100;

      min = minNum;
      max = maxNum;
      avg = avgNum;
      formattedMin = formatColumnValue(colName, minNum);
      formattedMax = formatColumnValue(colName, maxNum);
      formattedAvg = formatColumnValue(colName, avgNum);
    }
  } else if (isDate && values.length > 0) {
    const dateValues = values
      .map((v) => ({ raw: String(v), ts: Date.parse(String(v)) }))
      .filter((d) => !isNaN(d.ts));
    if (dateValues.length > 0) {
      dateValues.sort((a, b) => a.ts - b.ts);
      min = dateValues[0].raw;
      max = dateValues[dateValues.length - 1].raw;
      formattedMin = String(min);
      formattedMax = String(max);
    }
  }

  return {
    name: colName,
    type: column.type,
    isPk: !!column.pk,
    fk: column.fk,
    totalCount,
    distinctCount,
    nullCount,
    nullPercentage,
    isUnique,
    isNumeric,
    isDate,
    min,
    max,
    avg,
    formattedMin,
    formattedMax,
    formattedAvg,
    mostCommon,
  };
}

/**
 * Format byte size to human readable string
 */
function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

/**
 * Compute table profile
 */
export function analyzeTable(table: Table): TableInsight {
  const rows = (table.rows || []) as Record<string, unknown>[];
  const columns = (table.columns || []).map((col) => analyzeColumn(col, rows));

  const primaryKeys = table.columns
    .filter((col) => col.pk)
    .map((col) => col.name);

  const foreignKeys = table.columns
    .filter((col) => col.fk)
    .map((col) => ({
      column: col.name,
      targetTable: col.fk!.table,
      targetColumn: col.fk!.column,
    }));

  // Estimate storage size (JSON footprint + in-memory indexing factor)
  let bytes = 0;
  try {
    const jsonStr = JSON.stringify(rows);
    bytes = new TextEncoder().encode(jsonStr).length + (rows.length * 32);
  } catch {
    bytes = rows.length * 128;
  }

  return {
    name: table.name,
    rowCount: rows.length,
    columnCount: table.columns.length,
    primaryKeys,
    foreignKeys,
    storageSizeFormatted: formatBytes(bytes),
    storageSizeBytes: bytes,
    lastUpdated: "Active session (Live catalog)",
    columns,
  };
}

/**
 * Comprehensive Database Analysis, Quality Checks, Health Score & Smart Suggestions
 */
export function analyzeDatabase(schema: Table[]): DatabaseInsightReport {
  const tableInsights: Record<string, TableInsight> = {};
  let totalRows = 0;
  let totalColumns = 0;
  let totalStorageBytes = 0;

  for (const table of schema) {
    const insight = analyzeTable(table);
    tableInsights[table.name] = insight;
    totalRows += insight.rowCount;
    totalColumns += insight.columnCount;
    totalStorageBytes += insight.storageSizeBytes;
  }

  // --- Data Quality Audits ---
  const qualityChecks: DataQualityCheck[] = [];

  // 1. Duplicate Primary Key Check
  const duplicatePkDetails: string[] = [];
  let duplicatePkCount = 0;
  for (const table of schema) {
    const pkCols = table.columns.filter((c) => c.pk);
    if (pkCols.length > 0 && table.rows && table.rows.length > 0) {
      for (const pkCol of pkCols) {
        const seen = new Set<string>();
        const duplicates = new Set<string>();
        for (const row of table.rows) {
          const val = String(row[pkCol.name] ?? "");
          if (seen.has(val)) {
            duplicates.add(val);
          } else {
            seen.add(val);
          }
        }
        if (duplicates.size > 0) {
          duplicatePkCount += duplicates.size;
          duplicatePkDetails.push(
            `Table '${table.name}' PK column '${pkCol.name}' has ${duplicates.size} duplicate key value(s): ${Array.from(duplicates).slice(0, 3).join(", ")}`,
          );
        }
      }
    }
  }

  qualityChecks.push({
    id: "duplicate-pk",
    title: "Duplicate Primary Key Check",
    description: "Verifies uniqueness across all declared Primary Key identifiers.",
    status: duplicatePkCount === 0 ? "pass" : "fail",
    scoreImpact: duplicatePkCount * 15,
    count: duplicatePkCount,
    details:
      duplicatePkCount === 0
        ? ["All primary keys are strictly unique across tables."]
        : duplicatePkDetails,
  });

  // 2. Orphan Foreign Keys Check
  const orphanDetails: string[] = [];
  let orphanCount = 0;
  const tableMap = new Map<string, Table>();
  schema.forEach((t) => tableMap.set(t.name.toLowerCase(), t));

  for (const table of schema) {
    if (!table.rows || table.rows.length === 0) continue;
    for (const col of table.columns) {
      if (col.fk) {
        const targetTable = tableMap.get(col.fk.table.toLowerCase());
        if (!targetTable || !targetTable.rows) {
          orphanCount++;
          orphanDetails.push(
            `Table '${table.name}.${col.name}' points to non-existent target table '${col.fk.table}'.`,
          );
          continue;
        }

        const validPks = new Set(
          targetTable.rows.map((r) => String(r[col.fk!.column] ?? "")),
        );
        const orphans = new Set<string>();

        for (const row of table.rows) {
          const fkVal = row[col.name];
          if (
            fkVal !== null &&
            fkVal !== undefined &&
            fkVal !== "" &&
            !validPks.has(String(fkVal))
          ) {
            orphans.add(String(fkVal));
          }
        }

        if (orphans.size > 0) {
          orphanCount += orphans.size;
          orphanDetails.push(
            `Table '${table.name}.${col.name}' has ${orphans.size} orphan value(s) not in '${col.fk.table}.${col.fk.column}': ${Array.from(orphans).slice(0, 3).join(", ")}`,
          );
        }
      }
    }
  }

  qualityChecks.push({
    id: "orphan-fk",
    title: "Orphan Foreign Keys Check",
    description: "Validates referential integrity between foreign keys and parent table keys.",
    status: orphanCount === 0 ? "pass" : "fail",
    scoreImpact: orphanCount * 15,
    count: orphanCount,
    details:
      orphanCount === 0
        ? ["All foreign key references match valid primary key entries."]
        : orphanDetails,
  });

  // 3. Empty Tables Check
  const emptyTables = schema.filter(
    (t) => !t.rows || t.rows.length === 0,
  );
  qualityChecks.push({
    id: "empty-tables",
    title: "Empty Tables Check",
    description: "Detects relations that have schema defined but contain zero rows.",
    status: emptyTables.length === 0 ? "pass" : "warn",
    scoreImpact: emptyTables.length * 10,
    count: emptyTables.length,
    details:
      emptyTables.length === 0
        ? ["All tables contain active rows."]
        : emptyTables.map((t) => `Table '${t.name}' contains 0 records.`),
  });

  // 4. Columns with Many Missing Values Check (>20% NULL)
  const missingColsDetails: string[] = [];
  let missingColsCount = 0;
  for (const table of schema) {
    const tableInsight = tableInsights[table.name];
    if (!tableInsight) continue;
    for (const col of tableInsight.columns) {
      if (col.nullPercentage > 20) {
        missingColsCount++;
        missingColsDetails.push(
          `${table.name}.${col.name} has ${col.nullPercentage}% missing values (${col.nullCount}/${col.totalCount} rows)`,
        );
      }
    }
  }

  qualityChecks.push({
    id: "missing-values",
    title: "High Missing Values Check",
    description: "Identifies columns with greater than 20% null or omitted fields.",
    status: missingColsCount === 0 ? "pass" : "warn",
    scoreImpact: missingColsCount * 5,
    count: missingColsCount,
    details:
      missingColsCount === 0
        ? ["No columns exceed the 20% missing value threshold."]
        : missingColsDetails,
  });

  // 5. Invalid Date Formats Check
  const invalidDateDetails: string[] = [];
  let invalidDateCount = 0;
  for (const table of schema) {
    const dateCols = table.columns.filter(
      (c) =>
        /(DATE|TIME|TIMESTAMP)/i.test(c.type) ||
        /(date|created_at|updated_at|timestamp)/i.test(c.name),
    );
    if (!table.rows || dateCols.length === 0) continue;

    for (const dCol of dateCols) {
      for (const row of table.rows) {
        const val = row[dCol.name];
        if (val !== null && val !== undefined && val !== "") {
          const strVal = String(val).trim();
          if (isNaN(Date.parse(strVal))) {
            invalidDateCount++;
            invalidDateDetails.push(
              `Table '${table.name}.${dCol.name}' contains invalid date format: "${strVal}"`,
            );
            break;
          }
        }
      }
    }
  }

  qualityChecks.push({
    id: "invalid-dates",
    title: "Date Format Validation",
    description: "Verifies date and timestamp fields against ISO and standard formats.",
    status: invalidDateCount === 0 ? "pass" : "warn",
    scoreImpact: invalidDateCount * 5,
    count: invalidDateCount,
    details:
      invalidDateCount === 0
        ? ["All date fields conform to recognizable date/time standards."]
        : invalidDateDetails,
  });

  // Calculate Health Score (100 base minus deductions)
  const totalDeductions = qualityChecks.reduce(
    (sum, c) => sum + (c.status !== "pass" ? c.scoreImpact : 0),
    0,
  );
  const healthScore = Math.max(15, Math.min(100, 100 - totalDeductions));

  // --- Smart Suggestions Generation ---
  const suggestions: SmartSuggestion[] = [];

  // Suggestion 1: Largest table
  let largestTable: Table | null = null;
  let maxRows = -1;
  for (const t of schema) {
    const rCount = t.rows?.length || 0;
    if (rCount > maxRows) {
      maxRows = rCount;
      largestTable = t;
    }
  }

  if (largestTable && maxRows > 0) {
    const tInsight = tableInsights[largestTable.name];
    const numericCols = tInsight.columns.filter((c) => c.isNumeric && !c.isPk);

    if (numericCols.length > 0) {
      const topNumCol = numericCols[0];
      suggestions.push({
        id: `sug-largest-${largestTable.name}-top`,
        trigger: `"${largestTable.name}" has the largest table (${maxRows} rows).`,
        title: `Top records by ${topNumCol.name}`,
        question: `Find the top 5 ${largestTable.name} by ${topNumCol.name}.`,
        sql: `SELECT * FROM ${largestTable.name} ORDER BY ${topNumCol.name} DESC LIMIT 5;`,
        category: "ordering",
        tableName: largestTable.name,
      });
    }

    suggestions.push({
      id: `sug-largest-${largestTable.name}-count`,
      trigger: `"${largestTable.name}" contains the main core records.`,
      title: `Count and aggregate ${largestTable.name}`,
      question: `Show total count and distribution of ${largestTable.name}.`,
      sql: `SELECT COUNT(*) AS total_${largestTable.name} FROM ${largestTable.name};`,
      category: "aggregation",
      tableName: largestTable.name,
    });
  }

  // Suggestion 2: Low-cardinality categorical columns (e.g. status, category, city)
  for (const table of schema) {
    const tInsight = tableInsights[table.name];
    if (!tInsight) continue;

    for (const col of tInsight.columns) {
      if (
        !col.isPk &&
        col.distinctCount >= 2 &&
        col.distinctCount <= 8 &&
        tInsight.rowCount >= 3
      ) {
        suggestions.push({
          id: `sug-cat-${table.name}-${col.name}`,
          trigger: `"${table.name}.${col.name}" has only ${col.distinctCount} unique values.`,
          title: `Group by ${col.name}`,
          question: `Count ${table.name} by ${col.name}.`,
          sql: `SELECT ${col.name}, COUNT(*) AS total\nFROM ${table.name}\nGROUP BY ${col.name}\nORDER BY total DESC;`,
          category: "aggregation",
          tableName: table.name,
        });

        if (col.mostCommon) {
          suggestions.push({
            id: `sug-filter-${table.name}-${col.name}`,
            trigger: `"${col.mostCommon.value}" is the most common ${col.name} (${col.mostCommon.percentage}%).`,
            title: `Filter by ${col.mostCommon.value}`,
            question: `Find ${table.name} where ${col.name} is '${col.mostCommon.value}'.`,
            sql: `SELECT *\nFROM ${table.name}\nWHERE ${col.name} = '${col.mostCommon.value}';`,
            category: "filter",
            tableName: table.name,
          });
        }
        break; // 1 or 2 per table is great
      }
    }
  }

  // Suggestion 3: Numeric range distribution
  for (const table of schema) {
    const tInsight = tableInsights[table.name];
    if (!tInsight) continue;

    for (const col of tInsight.columns) {
      if (
        col.isNumeric &&
        !col.isPk &&
        col.min !== undefined &&
        col.max !== undefined &&
        col.avg !== undefined &&
        col.min !== col.max
      ) {
        suggestions.push({
          id: `sug-num-${table.name}-${col.name}`,
          trigger: `"${table.name}.${col.name}" ranges from ${col.formattedMin} to ${col.formattedMax}.`,
          title: `Above average ${col.name}`,
          question: `Find ${table.name} above the average ${col.name} (${col.formattedAvg}).`,
          sql: `SELECT *\nFROM ${table.name}\nWHERE ${col.name} > (SELECT AVG(${col.name}) FROM ${table.name})\nORDER BY ${col.name} DESC;`,
          category: "filter",
          tableName: table.name,
        });
        break;
      }
    }
  }

  // Suggestion 4: Foreign Keys and Joins
  for (const table of schema) {
    const tInsight = tableInsights[table.name];
    if (!tInsight || tInsight.foreignKeys.length === 0) continue;

    for (const fk of tInsight.foreignKeys) {
      suggestions.push({
        id: `sug-join-${table.name}-${fk.targetTable}`,
        trigger: `"${table.name}" is linked with "${fk.targetTable}" on ${fk.column} → ${fk.targetColumn}.`,
        title: `Join ${table.name} & ${fk.targetTable}`,
        question: `Join ${table.name} with ${fk.targetTable} to analyze combined relationships.`,
        sql: `SELECT *\nFROM ${table.name} t\nJOIN ${fk.targetTable} p ON t.${fk.column} = p.${fk.targetColumn}\nLIMIT 10;`,
        category: "join",
        tableName: table.name,
      });
      break;
    }
  }

  return {
    healthScore,
    totalTables: schema.length,
    totalRows,
    totalColumns,
    totalStorageFormatted: formatBytes(totalStorageBytes),
    tables: tableInsights,
    qualityChecks,
    smartSuggestions: suggestions.slice(0, 8),
  };
}
