/**
 * SQL Naming Rules & Standards (ANSI SQL / ISO 9075 & RDBMS standards)
 *
 * Enforces database, table, and column naming norms:
 * 1. No spaces permitted (use snake_case / underscores).
 * 2. Only letters (a-z, A-Z), numbers (0-9), and underscores (_) allowed.
 * 3. Must begin with a letter or underscore (cannot start with a digit).
 * 4. Identifier length between 1 and 64 characters.
 * 5. Cannot be a reserved SQL keyword.
 * 6. Scope uniqueness (case-insensitive duplicate detection).
 */

export const SQL_RESERVED_KEYWORDS = new Set([
  // Core Query Clauses & Modifiers
  "SELECT", "FROM", "WHERE", "GROUP", "HAVING", "ORDER", "BY", "LIMIT", "OFFSET",
  "FETCH", "FIRST", "NEXT", "ROWS", "ONLY", "TOP",

  // Set Operations & Joins
  "JOIN", "INNER", "LEFT", "RIGHT", "FULL", "OUTER", "CROSS", "NATURAL", "ON", "USING",
  "UNION", "INTERSECT", "EXCEPT", "MINUS",

  // DML Statements
  "INSERT", "INTO", "VALUES", "UPDATE", "SET", "DELETE", "MERGE", "UPSERT",

  // DDL Statements & Objects
  "CREATE", "ALTER", "DROP", "TRUNCATE", "TABLE", "DATABASE", "SCHEMA", "VIEW",
  "INDEX", "TRIGGER", "PROCEDURE", "FUNCTION", "SEQUENCE", "COLUMN", "ADD", "RENAME",

  // Constraints & Declarations
  "PRIMARY", "KEY", "FOREIGN", "REFERENCES", "CONSTRAINT", "CHECK", "UNIQUE",
  "DEFAULT", "NOT", "NULL", "AUTO_INCREMENT", "AUTOINCREMENT", "CASCADE", "RESTRICT",

  // Logical & Predicate Keywords
  "AND", "OR", "XOR", "IN", "IS", "LIKE", "ILIKE", "BETWEEN", "EXISTS", "ANY", "ALL",
  "SOME", "DISTINCT", "AS", "CASE", "WHEN", "THEN", "ELSE", "END",

  // Procedural & Transactions
  "BEGIN", "COMMIT", "ROLLBACK", "SAVEPOINT", "TRANSACTION", "DECLARE", "EXECUTE",
  "CALL", "RETURN", "RETURNS", "WHILE", "LOOP", "IF", "ELSIF",

  // Common Data Types
  "INTEGER", "INT", "SMALLINT", "BIGINT", "TINYINT", "TEXT", "VARCHAR", "CHAR",
  "BOOLEAN", "BOOL", "REAL", "FLOAT", "DOUBLE", "DECIMAL", "NUMERIC", "DATE",
  "TIME", "TIMESTAMP", "BLOB", "CLOB", "JSON",

  // System & Reserved Identifiers
  "TRUE", "FALSE", "USER", "CURRENT_DATE", "CURRENT_TIME", "CURRENT_TIMESTAMP",
  "ROW", "ROWNUM", "SYSDATE", "DUAL"
]);

export type SqlIdentifierType = "database" | "table" | "column";

export interface SqlIdentifierValidationOptions {
  existingNames?: string[];
  currentName?: string; // If updating, ignore comparison against the name itself
  allowEmpty?: boolean;
}

export interface SqlIdentifierValidationResult {
  isValid: boolean;
  error?: string;
  suggestion?: string;
}

/**
 * Transforms an arbitrary string into a standard, compliant SQL identifier.
 */
export function suggestValidSqlIdentifier(
  raw: string,
  type: SqlIdentifierType = "table"
): string {
  let cleaned = raw
    .trim()
    .toLowerCase()
    .replace(/[\s\-]+/g, "_")
    .replace(/[^a-z0-9_]/g, "_")
    .replace(/_+/g, "_")
    .replace(/^_+|_+$/g, "");

  if (!cleaned) {
    cleaned = type === "database" ? "db_custom" : type === "table" ? "tbl_custom" : "col_data";
  }

  // SQL identifiers cannot start with a digit
  if (/^[0-9]/.test(cleaned)) {
    const prefix = type === "database" ? "db_" : type === "table" ? "tbl_" : "col_";
    cleaned = `${prefix}${cleaned}`;
  }

  // Max 64 characters
  if (cleaned.length > 64) {
    cleaned = cleaned.slice(0, 64).replace(/_+$/, "");
  }

  // Reserved keyword conflict resolution
  if (SQL_RESERVED_KEYWORDS.has(cleaned.toUpperCase())) {
    cleaned = `${cleaned}_data`;
  }

  return cleaned;
}

/**
 * Validates a database, table, or column name against ANSI SQL & RDBMS norms.
 */
export function validateSqlIdentifier(
  name: string,
  type: SqlIdentifierType,
  options?: SqlIdentifierValidationOptions
): SqlIdentifierValidationResult {
  const typeLabel =
    type === "database" ? "Database" : type === "table" ? "Table" : "Column";

  // Check 1: Empty or whitespace only
  if (!name || name.trim().length === 0) {
    if (options?.allowEmpty) {
      return { isValid: true };
    }
    return {
      isValid: false,
      error: `${typeLabel} name cannot be empty.`,
      suggestion: suggestValidSqlIdentifier("custom", type),
    };
  }

  const trimmed = name.trim();
  const suggestion = suggestValidSqlIdentifier(name, type);

  // Check 2: Contains space (leading, trailing, or inside)
  if (/\s/.test(name)) {
    return {
      isValid: false,
      error: `Spaces are not allowed in SQL ${type} names. SQL norms require unbroken identifiers. Use underscores (_) instead (e.g. "${suggestion}").`,
      suggestion,
    };
  }

  // Check 3: Maximum length limit (Standard SQL / MySQL 64, Postgres 63)
  if (trimmed.length > 64) {
    return {
      isValid: false,
      error: `${typeLabel} name cannot exceed 64 characters as per SQL norms (currently ${trimmed.length} characters).`,
      suggestion,
    };
  }

  // Check 4: Leading character must be letter or underscore (cannot be a digit)
  if (/^[0-9]/.test(trimmed)) {
    return {
      isValid: false,
      error: `${typeLabel} name cannot start with a number as per SQL norms. Identifiers must begin with a letter (a-z) or underscore (_) (e.g. "${suggestion}").`,
      suggestion,
    };
  }

  // Check 5: Disallowed characters (hyphens, dots, punctuation, symbols)
  if (/[^a-zA-Z0-9_]/.test(trimmed)) {
    const invalidChars = Array.from(new Set(trimmed.match(/[^a-zA-Z0-9_]/g) || [])).join(" ");
    return {
      isValid: false,
      error: `${typeLabel} name contains invalid characters (${invalidChars}). Per SQL norms, only letters, numbers, and underscores are allowed (e.g. "${suggestion}").`,
      suggestion,
    };
  }

  // Check 6: Reserved SQL keyword collision
  const upper = trimmed.toUpperCase();
  if (SQL_RESERVED_KEYWORDS.has(upper)) {
    return {
      isValid: false,
      error: `"${upper}" is a reserved SQL keyword and cannot be used as a ${type} name. Consider "${suggestion}".`,
      suggestion,
    };
  }

  // Check 7: Duplicate identifier in the same scope
  if (options?.existingNames && options.existingNames.length > 0) {
    const currentNormalized = options.currentName?.toLowerCase();
    const isDuplicate = options.existingNames.some((existing) => {
      const existingNormalized = existing.toLowerCase();
      if (currentNormalized && existingNormalized === currentNormalized) {
        return false; // Ignored if it's the current name being modified
      }
      return existingNormalized === trimmed.toLowerCase();
    });

    if (isDuplicate) {
      return {
        isValid: false,
        error: `A ${type} named "${trimmed}" already exists. SQL identifiers must be unique within their scope.`,
        suggestion: `${trimmed}_2`,
      };
    }
  }

  return { isValid: true };
}

/**
 * Quick boolean check if a string is a valid SQL identifier.
 */
export function isValidSqlIdentifier(
  name: string,
  type: SqlIdentifierType = "table"
): boolean {
  return validateSqlIdentifier(name, type).isValid;
}
