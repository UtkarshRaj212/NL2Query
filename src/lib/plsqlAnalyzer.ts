import type { Table } from "./schema";
import type { PipelineStep, Row } from "./sqlEngine";

export interface PlSqlVariableInfo {
  name: string;
  type: string;
  isConstant: boolean;
  defaultValue?: string;
  purpose: string;
}

export interface PlSqlCursorInfo {
  name: string;
  query: string;
  targetTable?: string;
  columns: string[];
  filterCondition?: string;
}

export interface PlSqlTableUsage {
  tableName: string;
  columns: string[];
  operation: "READ / CURSOR" | "SELECT INTO" | "UPDATE" | "INSERT" | "DELETE" | "REFERENCED";
  filterCondition?: string;
  rowCount: number;
}

export interface PlSqlWorkflowStep {
  stepNumber: number;
  title: string;
  description: string;
  category: "INITIALIZATION" | "CURSOR / FETCH" | "ITERATION" | "LOGIC / CONDITION" | "MUTATION" | "OUTPUT" | "EXCEPTION" | "COMPLETION";
  targetObject?: string;
  sampleEffect?: string;
}

export interface PlSqlKeywordTheory {
  keyword: string;
  syntaxInScript: string;
  theoreticalConcept: string;
  engineWorkflow: string;
  bestPractices: string;
}

export interface PlSqlProceduralAnalysis {
  blockType: "ANONYMOUS BLOCK" | "PROCEDURE" | "FUNCTION" | "TRIGGER";
  constructName: string;
  summary: string;
  tablesUsed: PlSqlTableUsage[];
  variables: PlSqlVariableInfo[];
  cursors: PlSqlCursorInfo[];
  workflowSteps: PlSqlWorkflowStep[];
  hasConditionals: boolean;
  conditionalNotes?: string[];
  hasMutations: boolean;
  mutationNotes?: string[];
  hasExceptions: boolean;
  exceptionNotes?: string[];
  outputMessagesCount: number;
}

export interface PlSqlTheoryAnalysis {
  scriptOverview: string;
  keywordsUsed: PlSqlKeywordTheory[];
  engineCollaboration: {
    plsqlEngineRole: string;
    sqlEngineRole: string;
    contextSwitchCount: string;
    efficiencyRating: string;
    explanation: string;
  };
  memoryArchitecture: {
    pgaAllocation: string;
    cursorWorkArea: string;
    bufferState: string;
  };
}

/**
 * Analyzes the user's executed PL/SQL script against active schema tables and execution artifacts.
 * Generates tailored, non-generic procedural logic breakdowns and construct-specific theory.
 */
export function analyzePlSqlScript(
  script: string,
  schema: Table[] = [],
  steps: PipelineStep[] = [],
  finalRows: Row[] = [],
  dbmsOutput: string[] = [],
): {
  procedural: PlSqlProceduralAnalysis;
  theory: PlSqlTheoryAnalysis;
} {
  const raw = script.trim();
  const cleanScript = raw.replace(/\/\*[\s\S]*?\*\//g, "").replace(/--.*$/gm, "");

  // 1. Identify Construct Type
  let blockType: "ANONYMOUS BLOCK" | "PROCEDURE" | "FUNCTION" | "TRIGGER" = "ANONYMOUS BLOCK";
  let constructName = "Anonymous Block";
  if (/create\s+(or\s+replace\s+)?procedure\s+([a-zA-Z0-9_]+)/i.test(cleanScript)) {
    blockType = "PROCEDURE";
    constructName = cleanScript.match(/procedure\s+([a-zA-Z0-9_]+)/i)?.[1] ?? "Procedure";
  } else if (/create\s+(or\s+replace\s+)?function\s+([a-zA-Z0-9_]+)/i.test(cleanScript)) {
    blockType = "FUNCTION";
    constructName = cleanScript.match(/function\s+([a-zA-Z0-9_]+)/i)?.[1] ?? "Function";
  } else if (/create\s+(or\s+replace\s+)?trigger\s+([a-zA-Z0-9_]+)/i.test(cleanScript)) {
    blockType = "TRIGGER";
    constructName = cleanScript.match(/trigger\s+([a-zA-Z0-9_]+)/i)?.[1] ?? "Trigger";
  }

  // 2. Extract Tables referenced specifically in this script
  const tablesUsed: PlSqlTableUsage[] = [];
  for (const table of schema) {
    const tRegex = new RegExp(`\\b${table.name}\\b`, "i");
    if (tRegex.test(cleanScript)) {
      // Find columns mentioned
      const matchedCols = table.columns
        .map((c) => c.name)
        .filter((cName) => new RegExp(`\\b${cName}\\b`, "i").test(cleanScript));

      // Determine primary operation on this table
      let operation: PlSqlTableUsage["operation"] = "REFERENCED";
      if (new RegExp(`update\\s+${table.name}\\b`, "i").test(cleanScript)) {
        operation = "UPDATE";
      } else if (new RegExp(`insert\\s+into\\s+${table.name}\\b`, "i").test(cleanScript)) {
        operation = "INSERT";
      } else if (new RegExp(`delete\\s+from\\s+${table.name}\\b`, "i").test(cleanScript)) {
        operation = "DELETE";
      } else if (new RegExp(`select\\s+[\\s\\S]+?into[\\s\\S]+?from\\s+${table.name}\\b`, "i").test(cleanScript)) {
        operation = "SELECT INTO";
      } else if (new RegExp(`from\\s+${table.name}\\b`, "i").test(cleanScript)) {
        operation = "READ / CURSOR";
      }

      // Extract WHERE condition if any
      const whereMatch = cleanScript.match(new RegExp(`from\\s+${table.name}\\s+where\\s+([\\s\\S]+?)(?:order|group|loop|;|\$)`, "i"))
        || cleanScript.match(new RegExp(`update\\s+${table.name}\\s+[\\s\\S]+?where\\s+([\\s\\S]+?)(?:;|$)`, "i"));
      const filterCondition = whereMatch ? whereMatch[1].trim().replace(/;+$/, "") : undefined;

      tablesUsed.push({
        tableName: table.name,
        columns: matchedCols.length > 0 ? matchedCols : table.columns.map((c) => c.name),
        operation,
        filterCondition,
        rowCount: table.rows.length,
      });
    }
  }

  // 3. Extract Variables Declared
  const variables: PlSqlVariableInfo[] = [];
  const declareMatch = cleanScript.match(/declare\b([\s\S]*?)\bbegin\b/i);
  if (declareMatch) {
    const declText = declareMatch[1];
    const declLines = declText.split(";").map((l) => l.trim()).filter(Boolean);
    for (const line of declLines) {
      if (/^\s*cursor\b/i.test(line)) continue;
      const vMatch = line.match(/^([a-zA-Z0-9_]+)(?:\s+(constant))?\s+([a-zA-Z0-9_]+(?:\(\d+\))?)(?:\s*:=\s*([\s\S]+))?$/i);
      if (vMatch) {
        const vName = vMatch[1];
        const isConst = Boolean(vMatch[2]);
        const vType = vMatch[3].toUpperCase();
        const defVal = vMatch[4]?.trim();

        let purpose = "Local procedural workspace variable";
        const lower = vName.toLowerCase();
        if (lower.includes("count") || lower.includes("num") || lower.includes("tally") || lower.includes("honors") || lower.includes("total")) {
          purpose = "Counter accumulator tracking matching record iterations";
        } else if (lower.includes("tax") || lower.includes("price") || lower.includes("amount") || lower.includes("sum")) {
          purpose = "Numeric calculation accumulator for monetary or aggregate computations";
        } else if (lower.includes("city") || lower.includes("target") || lower.includes("status")) {
          purpose = "Filter criteria parameter bound to database query predicates";
        } else if (lower.includes("name") || lower.includes("rec") || lower.includes("id")) {
          purpose = "Buffer holding single-record attribute values during loop traversal";
        } else if (isConst) {
          purpose = "Fixed constant parameter defining invariant calculation rates";
        }

        variables.push({
          name: vName,
          type: vType,
          isConstant: isConst,
          defaultValue: defVal,
          purpose,
        });
      }
    }
  }

  // 4. Extract Cursors
  const cursors: PlSqlCursorInfo[] = [];
  const explicitCursorRegex = /cursor\s+([a-zA-Z0-9_]+)\s+is\s+([\s\S]+?)(?:;|$)/gi;
  let cMatch: RegExpExecArray | null;
  while ((cMatch = explicitCursorRegex.exec(cleanScript)) !== null) {
    const cName = cMatch[1];
    const query = cMatch[2].trim().replace(/;+$/, "");
    const fromMatch = query.match(/from\s+([a-zA-Z0-9_]+)/i);
    const targetTable = fromMatch ? fromMatch[1] : undefined;
    const whereMatch = query.match(/where\s+([\s\S]+?)(?:order|group|limit|;|$)/i);
    const filterCondition = whereMatch ? whereMatch[1].trim() : undefined;
    const selectCols = query.match(/select\s+([\s\S]+?)\s+from/i)?.[1]?.split(",").map((s) => s.trim()) ?? [];

    cursors.push({
      name: cName,
      query,
      targetTable,
      columns: selectCols,
      filterCondition,
    });
  }

  // Inline Cursors: FOR rec IN (SELECT ...) LOOP
  const inlineCursorMatch = cleanScript.match(/for\s+([a-zA-Z0-9_]+)\s+in\s+\((select[\s\S]+?)\)\s+loop/i);
  if (inlineCursorMatch) {
    const recName = inlineCursorMatch[1];
    const query = inlineCursorMatch[2].trim();
    const fromMatch = query.match(/from\s+([a-zA-Z0-9_]+)/i);
    const targetTable = fromMatch ? fromMatch[1] : undefined;
    const whereMatch = query.match(/where\s+([\s\S]+?)(?:order|group|limit|;|$)/i);
    const filterCondition = whereMatch ? whereMatch[1].trim() : undefined;
    const selectCols = query.match(/select\s+([\s\S]+?)\s+from/i)?.[1]?.split(",").map((s) => s.trim()) ?? [];

    cursors.push({
      name: `Inline (${recName})`,
      query,
      targetTable,
      columns: selectCols,
      filterCondition,
    });
  }

  // 5. Conditionals and Branching
  const hasConditionals = /\bif\b[\s\S]+?\bthen\b/i.test(cleanScript);
  const conditionalNotes: string[] = [];
  if (hasConditionals) {
    const ifConditions = Array.from(cleanScript.matchAll(/\b(?:if|elsif)\s+([\s\S]+?)\s+then\b/gi)).map((m) => m[1].trim());
    for (const cond of ifConditions) {
      conditionalNotes.push(`Branch evaluated on predicate: "${cond}"`);
    }
  }

  // 6. Mutations
  const hasMutations = /\b(update|insert\s+into|delete\s+from)\b/i.test(cleanScript);
  const mutationNotes: string[] = [];
  if (hasMutations) {
    const dmlMatches = cleanScript.match(/\b(update\s+[a-zA-Z0-9_]+|insert\s+into\s+[a-zA-Z0-9_]+|delete\s+from\s+[a-zA-Z0-9_]+)[\s\S]*?(?:;|$)/gi) || [];
    for (const m of dmlMatches) {
      mutationNotes.push(m.trim().replace(/;+$/, ""));
    }
  }

  // 7. Exceptions
  const hasExceptions = /\bexception\b/i.test(cleanScript);
  const exceptionNotes: string[] = [];
  if (hasExceptions) {
    const whenMatches = Array.from(cleanScript.matchAll(/\bwhen\s+([a-zA-Z0-9_]+)\s+then\b/gi)).map((m) => m[1].trim());
    for (const w of whenMatches) {
      exceptionNotes.push(`Exception handler: WHEN ${w} THEN`);
    }
  }

  // 8. Generate Procedural Workflow Steps specific to this script
  const workflowSteps: PlSqlWorkflowStep[] = [];
  let sNum = 1;

  // Step 1: Memory & Catalog
  workflowSteps.push({
    stepNumber: sNum,
    title: `Step ${sNum++}: Compilation & Private Memory Workspace Setup`,
    description: `Allocates PGA memory for ${variables.length} local variable(s)${variables.length > 0 ? ` (${variables.map((v) => v.name).join(", ")})` : ""} and registers catalog descriptors for ${tablesUsed.length} active database relation(s)${tablesUsed.length > 0 ? ` (${tablesUsed.map((t) => t.tableName).join(", ")})` : ""}.`,
    category: "INITIALIZATION",
    targetObject: constructName,
  });

  // Step 2: Cursors
  if (cursors.length > 0) {
    for (const c of cursors) {
      workflowSteps.push({
        stepNumber: sNum,
        title: `Step ${sNum++}: Cursor Declaration & Active Set Definition (${c.name})`,
        description: `Defines cursor pointer in private SQL area with statement: "${c.query}". Binds filter predicate "${c.filterCondition || "all tuples"}" against table "${c.targetTable || "source"}".`,
        category: "CURSOR / FETCH",
        targetObject: c.name,
      });
    }
  }

  // Step 3: Loop Traversal & Execution
  if (/\bfor\s+[a-zA-Z0-9_]+\s+in\b/i.test(cleanScript)) {
    const loopRec = cleanScript.match(/for\s+([a-zA-Z0-9_]+)\s+in/i)?.[1] ?? "record";
    workflowSteps.push({
      stepNumber: sNum,
      title: `Step ${sNum++}: Tuple Iteration Loop (FOR ${loopRec})`,
      description: `Iteratively fetches matching records from cursor into loop record variable \`${loopRec}\`. Automatically manages cursor OPEN, FETCH, and termination CLOSE.`,
      category: "ITERATION",
      targetObject: loopRec,
    });
  } else if (/\bwhile\b[\s\S]+?\bloop\b/i.test(cleanScript)) {
    workflowSteps.push({
      stepNumber: sNum,
      title: `Step ${sNum++}: Guarded WHILE Loop Execution`,
      description: "Evaluates boolean loop condition on each cycle. Executes enclosed procedural statements while condition remains TRUE.",
      category: "ITERATION",
    });
  }

  // Step 4: Logic / Conditionals
  if (hasConditionals) {
    workflowSteps.push({
      stepNumber: sNum,
      title: `Step ${sNum++}: Procedural Branching & Decision Logic (IF-THEN-ELSE)`,
      description: `Applies conditional rule branching (${conditionalNotes.join("; ")}). Routes tuple execution into specialized operational branches.`,
      category: "LOGIC / CONDITION",
    });
  }

  // Step 5: DML Mutation
  if (hasMutations) {
    workflowSteps.push({
      stepNumber: sNum,
      title: `Step ${sNum++}: Relational State Mutation (Embedded DML)`,
      description: `Executes database tuple modification (${mutationNotes.join("; ")}). Updates in-memory relation buffers with transaction rollback protection.`,
      category: "MUTATION",
    });
  }

  // Step 6: DBMS_OUTPUT
  if (/dbms_output\.put_line/i.test(cleanScript)) {
    const putCount = (cleanScript.match(/dbms_output\.put_line/gi) || []).length;
    workflowSteps.push({
      stepNumber: sNum,
      title: `Step ${sNum++}: Server Output Buffer Staging (${putCount} PUT_LINE statements)`,
      description: `Constructs formatted message strings via || concatenation and stages ${dbmsOutput.length} message(s) in the DBMS_OUTPUT FIFO buffer for client presentation.`,
      category: "OUTPUT",
    });
  }

  // Step 7: Exception Handler
  if (hasExceptions) {
    workflowSteps.push({
      stepNumber: sNum,
      title: `Step ${sNum++}: Exception Interception & Recovery`,
      description: `Active EXCEPTION block intercepts runtime exceptions (${exceptionNotes.join(", ")}), protecting database session integrity and logging diagnostics.`,
      category: "EXCEPTION",
    });
  }

  // Step 8: Commit
  workflowSteps.push({
    stepNumber: sNum,
    title: `Step ${sNum++}: Transaction Finalization & Output Delivery`,
    description: `Concludes procedural block execution, finalizes pending mutations, and transmits ${dbmsOutput.length} output line(s) and ${finalRows.length} table tuple(s) to the visualization console.`,
    category: "COMPLETION",
  });

  // 9. Keyword-Specific Theory
  const keywordsUsed: PlSqlKeywordTheory[] = [];

  // DECLARE ... BEGIN ... END
  keywordsUsed.push({
    keyword: "DECLARE ... BEGIN ... END;",
    syntaxInScript: cleanScript.match(/declare[\s\S]*?begin/i) ? "DECLARE ... BEGIN ... END;" : "BEGIN ... END;",
    theoreticalConcept: "Oracle Anonymous Block Architecture: A nameless executable program unit compiled and executed on the fly without persistence in the data dictionary. Variables reside strictly within the user's private session PGA (Program Global Area).",
    engineWorkflow: "The PL/SQL compiler parses the block structure, allocates variable offsets in stack memory, and passes embedded SQL to the database SQL parser.",
    bestPractices: "Always encapsulate variables within explicit declare sections; initialize counters to 0 to prevent NULL arithmetic propagation.",
  });

  // CURSOR
  if (cursors.length > 0) {
    keywordsUsed.push({
      keyword: "CURSOR name IS SELECT ...",
      syntaxInScript: cursors[0].query,
      theoreticalConcept: "Explicit Cursor & Private SQL Area: An explicit cursor is a named control structure and memory pointer to the work area created by the database engine when parsing an active query set.",
      engineWorkflow: "The SQL engine parses and optimizes the query, creating a query execution plan. The PL/SQL engine maintains the row pointer and manages cursor attributes (%FOUND, %NOTFOUND, %ROWCOUNT).",
      bestPractices: "Explicitly restrict fetched columns in the cursor SELECT list (avoid SELECT *) to minimize memory consumption in the PGA.",
    });

    keywordsUsed.push({
      keyword: "FOR rec IN cursor_name LOOP",
      syntaxInScript: "FOR rec IN " + (cursors[0].name || "cursor") + " LOOP ... END LOOP;",
      theoreticalConcept: "Cursor FOR Loop Optimization: A specialized procedural construct in Oracle PL/SQL that automates cursor lifecycle management, performing implicit OPEN, FETCH, and CLOSE.",
      engineWorkflow: "Under the hood, Oracle's PL/SQL runtime engine transparently uses array fetch optimization (fetching batches of tuples), eliminating manual OPEN/CLOSE boilerplates and preventing cursor leaks.",
      bestPractices: "Prefer Cursor FOR loops over manual OPEN-FETCH-CLOSE loops for cleaner syntax, automatic cleanup, and built-in bulk fetch optimizations.",
    });
  }

  // Assignment :=
  if (/:=/i.test(cleanScript)) {
    keywordsUsed.push({
      keyword: ":= (Assignment Operator)",
      syntaxInScript: cleanScript.match(/[a-zA-Z0-9_.]+\s*:=\s*[^;]+/)?.[0] ?? "v_var := expr;",
      theoreticalConcept: "Scalar Assignment & Evaluation Semantics: The PL/SQL assignment operator copies evaluated right-hand side expressions into left-hand variable memory locations within the active stack frame.",
      engineWorkflow: "Expressions are evaluated by the PL/SQL procedural runtime without triggering a context switch to the relational SQL engine.",
      bestPractices: "Keep procedural counter increments and math inside PL/SQL rather than invoking repeated SQL updates for scalar increments.",
    });
  }

  // String Concatenation ||
  if (/\|\|/i.test(cleanScript)) {
    keywordsUsed.push({
      keyword: "|| (String Concatenation)",
      syntaxInScript: cleanScript.match(/'[^']+'\s*\|\|\s*[^;\n]+/)?.[0] ?? "'prefix' || var",
      theoreticalConcept: "PL/SQL String Concatenation Operator: Combines character strings and scalar variables into a contiguous string buffer. In Oracle PL/SQL, concatenating with NULL evaluates cleanly to the other operand without yielding NULL.",
      engineWorkflow: "The PL/SQL memory allocator expands string buffers dynamically up to the VARCHAR2 limit.",
      bestPractices: "Use readable separator formatting (brackets, hyphens, colons) to make console terminal outputs structured and easily parsable.",
    });
  }

  // DBMS_OUTPUT.PUT_LINE
  if (/dbms_output\.put_line/i.test(cleanScript)) {
    keywordsUsed.push({
      keyword: "DBMS_OUTPUT.PUT_LINE(message)",
      syntaxInScript: cleanScript.match(/dbms_output\.put_line\s*\([^;]+\);/i)?.[0] ?? "DBMS_OUTPUT.PUT_LINE(...);",
      theoreticalConcept: "Server Output Package Buffer Architecture: An Oracle-supplied package that buffers formatted text lines on the database server. Output is not written directly to the screen; it is staged in a memory buffer until block completion.",
      engineWorkflow: "Each PUT_LINE call pushes characters to an internal FIFO queue in session memory. Upon transaction completion, the client application retrieves the queued text lines via DBMS_OUTPUT.GET_LINES.",
      bestPractices: "Essential for operational auditing, progress tracking in batch batch loops, and debugging procedural state before committing.",
    });
  }

  // IF-THEN-ELSE
  if (hasConditionals) {
    keywordsUsed.push({
      keyword: "IF ... THEN ... ELSE ... END IF",
      syntaxInScript: cleanScript.match(/if\s+[\s\S]+?then/i)?.[0] ?? "IF condition THEN",
      theoreticalConcept: "Three-Valued Boolean Logic & Procedural Branching: Oracle PL/SQL conditions evaluate to TRUE, FALSE, or NULL. An IF branch executes only if the condition evaluates strictly to TRUE; FALSE or NULL routes execution to ELSIF/ELSE.",
      engineWorkflow: "Short-circuit evaluation is applied: in 'A AND B', if A is FALSE, B is never evaluated. Branching jumps directly to the matching block instruction pointer.",
      bestPractices: "Explicitly handle NULL values with NVL() or IS NULL checks to prevent unexpected falls into the ELSE branch.",
    });
  }

  // SELECT ... INTO
  if (/\bselect\s+[\s\S]+?\binto\b/i.test(cleanScript)) {
    keywordsUsed.push({
      keyword: "SELECT ... INTO",
      syntaxInScript: cleanScript.match(/select\s+[\s\S]+?into[\s\S]+?from\s+[a-zA-Z0-9_]+/i)?.[0] ?? "SELECT col INTO var FROM table",
      theoreticalConcept: "Exact Single-Row Scalar Query Constraint: Retrieves exactly one row from the database into procedural variables. Enforces strict relational cardinalities.",
      engineWorkflow: "The SQL engine executes the query and asserts that exactly 1 row is returned. If 0 rows return, it raises ORA-01403 (NO_DATA_FOUND). If >1 row returns, it raises ORA-01422 (TOO_MANY_ROWS).",
      bestPractices: "Always enclose SELECT INTO statements within an EXCEPTION block to gracefully intercept NO_DATA_FOUND.",
    });
  }

  // Embedded DML
  if (hasMutations) {
    keywordsUsed.push({
      keyword: "Embedded DML (UPDATE / INSERT / DELETE)",
      syntaxInScript: mutationNotes[0] ?? "UPDATE / INSERT / DELETE",
      theoreticalConcept: "ACID Transaction & Implicit Cursor Mechanics: Embedded DML modifies database relations within the transactional scope of the PL/SQL block, automatically setting implicit cursor attributes like SQL%ROWCOUNT and SQL%FOUND.",
      engineWorkflow: "PL/SQL passes the SQL statement to the relational engine. The SQL engine executes row mutations, writes Write-Ahead Logs (WAL), and returns affected row counts back to PL/SQL memory.",
      bestPractices: "Inspect SQL%ROWCOUNT immediately after executing DML to verify the count of modified tuples before proceeding.",
    });
  }

  // EXCEPTION
  if (hasExceptions) {
    keywordsUsed.push({
      keyword: "EXCEPTION WHEN ... THEN",
      syntaxInScript: cleanScript.match(/exception[\s\S]*?when[\s\S]*?then/i)?.[0] ?? "EXCEPTION WHEN ... THEN",
      theoreticalConcept: "Run-time Exception Interception & Stack Unwinding: Error handling architecture in Oracle PL/SQL. When an exception is raised, standard execution halts and control transfers directly to the EXCEPTION section.",
      engineWorkflow: "If a matching handler exists (e.g. WHEN NO_DATA_FOUND), the exception is trapped and marked handled. If no handler matches, the transaction is rolled back and the exception propagates to the host environment.",
      bestPractices: "Handle specific named exceptions before falling back to WHEN OTHERS. In WHEN OTHERS, log error information before re-raising or committing.",
    });
  }

  // 10. Summary description
  const summary = `Procedural analysis for ${blockType === "ANONYMOUS BLOCK" ? "anonymous block" : constructName}: touches ${tablesUsed.length} database relation(s)${tablesUsed.length > 0 ? ` (${tablesUsed.map((t) => t.tableName).join(", ")})` : ""}, maintains ${variables.length} local variable(s), traverses ${cursors.length} cursor(s), and executes ${workflowSteps.length} sequential procedural stages with ${dbmsOutput.length} output message(s).`;

  return {
    procedural: {
      blockType,
      constructName,
      summary,
      tablesUsed,
      variables,
      cursors,
      workflowSteps,
      hasConditionals,
      conditionalNotes: conditionalNotes.length > 0 ? conditionalNotes : undefined,
      hasMutations,
      mutationNotes: mutationNotes.length > 0 ? mutationNotes : undefined,
      hasExceptions: hasExceptions,
      exceptionNotes: exceptionNotes.length > 0 ? exceptionNotes : undefined,
      outputMessagesCount: dbmsOutput.length,
    },
    theory: {
      scriptOverview: `The executed PL/SQL unit combines ${blockType === "ANONYMOUS BLOCK" ? "anonymous procedural block architecture" : constructName} with ${tablesUsed.length > 0 ? tablesUsed.map((t) => `\`${t.tableName}\``).join(", ") : "in-memory computations"}. Below is the targeted theoretical analysis of the exact language mechanisms, keywords, and execution workflows utilized in this script.`,
      keywordsUsed,
      engineCollaboration: {
        plsqlEngineRole: `Executes procedural control constructs (loops, assignments, conditions), binds local PGA variables (${variables.map((v) => v.name).join(", ") || "none"}), and buffers console messages in DBMS_OUTPUT.`,
        sqlEngineRole: `Parses relational queries and filters, executes index scans on target tables (${tablesUsed.map((t) => t.tableName).join(", ") || "none"}), and streams matching record tuples to the PL/SQL cursor pointer.`,
        contextSwitchCount: cursors.length > 0 ? "Optimized minimal context switching (1 SQL dispatch for cursor initialization, subsequent iterations handled in PL/SQL memory)." : "Direct procedural execution with minimal SQL context switching.",
        efficiencyRating: "Optimal (PGA in-memory traversal with bulk cursor stream)",
        explanation: `Rather than issuing separate, repeated declarative SQL statements for each record, this script uses ${cursors.length > 0 ? "cursor-driven batch stream processing" : "direct procedural execution"} which prevents excessive round-trips between the procedural and relational database engines.`,
      },
      memoryArchitecture: {
        pgaAllocation: `Allocated private stack frame in the Program Global Area (PGA) for ${variables.length} local variable(s) and loop state.`,
        cursorWorkArea: cursors.length > 0 ? `Active Private SQL Area created for cursor \`${cursors[0].name}\` pointing to active set from table \`${cursors[0].targetTable || "relational catalog"}\`.` : "No explicit cursor Private SQL Area required.",
        bufferState: `DBMS_OUTPUT internal FIFO message queue captured ${dbmsOutput.length} message(s) ready for client display.`,
      },
    },
  };
}
