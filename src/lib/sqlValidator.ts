import type { Table } from "./schema";
import { analyzeSQL } from "./sqlAssistant";
import { parseSQL } from "./sqlEngine";

export type ValidationStatus = "valid" | "incomplete" | "invalid" | "empty";

export interface SQLValidationResult {
  status: ValidationStatus;
  message: string;
  detail?: string;
}

/**
 * Validates a SQL query string against the active database schema and SQL Norms.
 */
export function validateSQL(rawSql: string, schema: Table[]): SQLValidationResult {
  const trimmed = rawSql.trim();
  if (!trimmed) {
    return { status: "empty", message: "" };
  }

  const isDDL = /^\s*(create|alter|drop|truncate)\b/i.test(trimmed);
  if (isDDL) {
    try {
      parseSQL(trimmed.replace(/;+$/, ""), schema);
      return { status: "valid", message: "Valid SQL statement" };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      return {
        status: "invalid",
        message: msg,
        detail: "Ensure database, table, and column names comply with standard SQL Norms (no spaces, valid characters, not reserved words).",
      };
    }
  }

  const analysis = analyzeSQL(rawSql, schema);
  let status: ValidationStatus = "valid";
  if (analysis.severity === "incomplete") {
    status = "incomplete";
  } else if (analysis.severity === "error" || analysis.severity === "warning") {
    status = "invalid";
  }

  return {
    status,
    message: analysis.what || analysis.title,
    detail: analysis.suggestionText,
  };
}

