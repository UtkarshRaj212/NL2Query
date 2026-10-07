import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { generateObject } from "ai";
import { NextResponse } from "next/server";
import { z } from "zod";
import { DATASETS, type Table } from "@/lib/schema";
import { parseSQL, validateSQLAgainstSchema } from "@/lib/sqlEngine";
import { findClosestMatch } from "@/lib/sqlAssistant";
import env from "@/lib/env";

const requestSchema = z
  .object({
    question: z.string().trim().max(1000).optional(),
    audioBase64: z.string().min(1).optional(),
    mimeType: z.string().optional(),
    datasetId: z.string().min(1),
    schema: z.array(z.any()).optional(),
    mode: z.enum(["sql", "plsql"]).optional(),
  })
  .refine((data) => Boolean(data.question || data.audioBase64), {
    message: "Either question or audioBase64 must be provided.",
  });

const textResponseSchema = z.object({
  isValid: z
    .boolean()
    .describe(
      "true if query can execute on active schema, false if referencing missing tables or columns.",
    ),
  sql: z.string().describe("Clean SQL query on active schema"),
  interpretation: z.string().describe("1-sentence explanation"),
  reason: z
    .string()
    .optional()
    .describe("Short 1-sentence reason if invalid (max 120 chars)"),
  suggestedTables: z
    .array(z.string())
    .optional()
    .describe("1-3 valid table names from active schema"),
  suggestedColumns: z
    .array(z.string())
    .optional()
    .describe("Valid column names from active schema"),
  suggestedSql: z
    .string()
    .optional()
    .describe("Working SQL query on active schema"),
});

const audioResponseSchema = z.object({
  question: z
    .string()
    .describe("Transcribed natural language question spoken in the audio"),
  isValid: z
    .boolean()
    .describe(
      "true if query can execute on active schema, false if referencing missing tables or columns.",
    ),
  sql: z.string().describe("Clean SQL query on active schema"),
  interpretation: z.string().describe("1-sentence explanation"),
  reason: z
    .string()
    .optional()
    .describe("Short 1-sentence reason if invalid (max 120 chars)"),
  suggestedTables: z
    .array(z.string())
    .optional()
    .describe("1-3 valid table names from active schema"),
  suggestedColumns: z
    .array(z.string())
    .optional()
    .describe("Valid column names from active schema"),
  suggestedSql: z
    .string()
    .optional()
    .describe("Working SQL query on active schema"),
});

function sanitizeDiagnostic(
  currentSchema: Table[],
  reason?: string,
  suggestedTables?: string[],
  suggestedColumns?: string[],
  suggestedSql?: string,
) {
  const schemaTableNames = currentSchema.map((t) => t.name);
  const schemaTableLowerMap = new Map(
    currentSchema.map((t) => [t.name.toLowerCase(), t.name]),
  );
  const schemaColLowerMap = new Map(
    currentSchema.flatMap((t) =>
      t.columns.map((c) => [c.name.toLowerCase(), c.name]),
    ),
  );

  // STRICTLY filter suggested tables against real schema tables only
  let validTables = (suggestedTables || [])
    .filter((t): t is string => typeof t === "string")
    .map((t) => schemaTableLowerMap.get(t.trim().toLowerCase()))
    .filter((t): t is string => Boolean(t));

  validTables = Array.from(new Set(validTables));
  if (validTables.length <= 1) {
    validTables = schemaTableNames;
  }

  // STRICTLY filter suggested columns against real schema columns only
  let validColumns = (suggestedColumns || [])
    .filter((c): c is string => typeof c === "string")
    .map((c) => schemaColLowerMap.get(c.trim().toLowerCase()))
    .filter((c): c is string => Boolean(c));
  validColumns = Array.from(new Set(validColumns)).slice(0, 4);

  // Clean reason: strip any HTML/markup or hallucinations, cap to 140 chars
  let cleanReason = (reason || "")
    .replace(/<[^>]*>?/gm, "")
    .replace(/\s+/g, " ")
    .trim();
  if (!cleanReason || cleanReason.length < 5) {
    cleanReason = `Requested entity does not exist. Available tables: ${schemaTableNames.join(", ")}.`;
  } else if (cleanReason.length > 140) {
    cleanReason = cleanReason.slice(0, 140).trim() + "...";
  }

  let cleanSql = (suggestedSql || "")
    .replace(/^```(?:sql|plsql)?\s*/i, "")
    .replace(/\s*```$/, "")
    .trim();
  if (!cleanSql && validTables[0]) {
    cleanSql = `SELECT * FROM ${validTables[0]};`;
  }

  return {
    isValid: false,
    reason: cleanReason,
    suggestedTables: validTables,
    suggestedColumns: validColumns,
    suggestedSql: cleanSql,
    availableTables: schemaTableNames,
  };
}

export async function POST(request: Request) {
  try {
    const apiKey = env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        {
          error:
            "GEMINI_API_KEY is not configured in .env. Please add your GEMINI_API_KEY to enable AI query translation.",
        },
        { status: 503 },
      );
    }

    const rawBody = await request.json();
    const body = requestSchema.parse(rawBody);
    const mode = body.mode || "sql";
    const isPlSql = mode === "plsql";
    const dataset = DATASETS.find((item) => item.id === body.datasetId);
    const currentSchema: Table[] =
      body.schema && body.schema.length > 0
        ? (body.schema as Table[])
        : (dataset?.schema ?? []);

    if (!currentSchema.length && !dataset) {
      return NextResponse.json(
        { error: "Unknown dataset or empty schema." },
        { status: 400 },
      );
    }

    // Fast-path: if question is already direct SQL or direct PL/SQL and syntax passes
    if (body.question) {
      const q = body.question.trim().replace(/;+$/, "");
      if (isPlSql) {
        if (/^(declare|begin|create\s+(or\s+replace\s+)?(procedure|function|trigger))\b/i.test(q)) {
          return NextResponse.json({
            question: body.question,
            sql: body.question.trim(),
            confidence: 1.0,
            interpretation: `Direct PL/SQL execution: ${q.slice(0, 50)}...`,
            isValid: true,
          });
        }
      } else {
        if (
          /^(select|insert\s+into|insert|update|delete\s+from|delete|create\s+table|drop\s+table|alter\s+table|truncate)\b/i.test(
            q,
          )
        ) {
          try {
            validateSQLAgainstSchema(q, currentSchema);
            return NextResponse.json({
              question: body.question,
              sql: q + ";",
              confidence: 1.0,
              interpretation: `Direct SQL execution: ${q.slice(0, 50)}...`,
              isValid: true,
            });
          } catch {
            // Direct validation failed, let Gemini diagnose why it's invalid
          }
        }
      }
    }

    const google = createGoogleGenerativeAI({ apiKey });

    const schemaSummary = currentSchema.map((t) => ({
      table: t.name,
      columns: t.columns.map((c) => ({
        name: c.name,
        type: c.type,
        ...(c.pk ? { primaryKey: true } : {}),
        ...(c.fk ? { foreignKey: `${c.fk.table}.${c.fk.column}` } : {}),
      })),
      sampleRowSnippet: (t.rows || []).slice(0, 2),
    }));

    const availableTableNames = currentSchema.map((t) => t.name);

    const sqlSystemPrompt = `You are an expert, highly accurate SQL assistant.

DATABASE SCHEMA:
${JSON.stringify(schemaSummary, null, 2)}
AVAILABLE TABLES: ${availableTableNames.join(", ")}

CRITICAL INSTRUCTIONS:
1. FULL CONTEXT COMPREHENSION:
   - Carefully read and analyze the ENTIRE user prompt from start to finish before generating SQL.
   - NEVER generate queries based on only the first few words or a single matched table keyword.
   - Comprehend all requested tables, entity relationships, joins, filter conditions, aggregations, and projections.

2. JOINS & RELATIONSHIPS:
   - When the user mentions multiple tables, related records (e.g. "members and their books", "orders with products"), or explicitly asks for "join" / "joins":
     a) Identify all tables involved.
     b) Identify primary key (pk) and foreign key (fk) relationships between those tables from the schema.
     c) Construct proper JOIN clauses (e.g. FROM table1 JOIN table2 ON table1.fk = table2.pk).
     d) Disambiguate column names by prefixing them with table names (e.g. members.name, books.title).

3. RULES:
   - If the request matches the schema:
     * Set isValid: true
     * Set sql: Valid, standard SQL query using ONLY tables and columns from the schema.
     * Set interpretation: 1 clear, complete sentence explaining what the SQL accomplishes.
   - If the user requests a table or column that does NOT exist (e.g. "shops"):
     * Set isValid: false
     * Set reason: Short note (e.g. 'Table "shops" does not exist in this database. Available tables: ${availableTableNames.join(", ")}.')
     * Set suggestedTables: The valid tables from active schema.
     * Set suggestedSql: Working query on the active schema.
     * Keep answers strictly concise. Do NOT hallucinate long text or repeat words.`;

    const plsqlSystemPrompt = `You are an expert Oracle PL/SQL assistant.

DATABASE SCHEMA:
${JSON.stringify(schemaSummary, null, 2)}
AVAILABLE TABLES: ${availableTableNames.join(", ")}

CRITICAL INSTRUCTIONS:
1. FULL CONTEXT COMPREHENSION:
   - Carefully read and analyze the ENTIRE user prompt from start to finish before generating PL/SQL.
   - Never generate scripts based on only the first few words or a single matched table keyword.
   - If multiple tables or joins are requested, write appropriate cursor queries with JOIN clauses and valid ON conditions.

2. RULES:
   - If valid: isValid: true, sql: clean PL/SQL block (DECLARE...BEGIN...END;), interpretation: short complete sentence summary.
   - If referencing missing table/column: isValid: false, reason: short note, suggestedTables: [1-2 real schema tables], suggestedSql: working PL/SQL script. Keep it concise.`;

    const systemPrompt = isPlSql ? plsqlSystemPrompt : sqlSystemPrompt;

    let generatedSql = "";
    let interpretation = "";
    let transcribedQuestion = body.question || "";
    let isValidResponse = true;
    let errorReason: string | undefined;
    let suggestedTables: string[] | undefined;
    let suggestedColumns: string[] | undefined;
    let suggestedSql: string | undefined;

    const candidateModels = [
      "gemini-3.7-flash",
      "gemini-3.5-flash-lite",
      "gemini-3.1-flash-lite",
      "gemini-flash-lite-latest",
      "gemini-3-flash-preview",
      "gemini-3.8-flash",
      "gemini-3.6-flash",
    ];
    let lastError: any = null;

    if (body.audioBase64) {
      for (const mName of candidateModels) {
        try {
          const result = await Promise.race([
            generateObject({
              model: google(mName),
              schema: audioResponseSchema,
              temperature: 0,
              system: systemPrompt,
              messages: [
                {
                  role: "user",
                  content: [
                    {
                      type: "text",
                      text: isPlSql
                        ? "Listen to the spoken audio and translate it into a valid Oracle PL/SQL block matching the database schema. If entities do not exist, diagnose the issue."
                        : "Listen to the spoken audio and translate it into a valid SQL query matching the schema. If entities do not exist, diagnose the issue.",
                    },
                    {
                      type: "file",
                      data: body.audioBase64,
                      mediaType: body.mimeType || "audio/webm",
                    },
                  ],
                },
              ],
            }),
            new Promise<never>((_, reject) =>
              setTimeout(() => reject(new Error("AI voice timeout")), 60000),
            ),
          ]);

          generatedSql = result.object.sql.trim();
          interpretation = result.object.interpretation;
          transcribedQuestion = result.object.question;
          isValidResponse = result.object.isValid;
          errorReason = result.object.reason;
          suggestedTables = result.object.suggestedTables;
          suggestedColumns = result.object.suggestedColumns;
          suggestedSql = result.object.suggestedSql;
          break;
        } catch (e: any) {
          lastError = e;
        }
      }
      if (!generatedSql) {
        throw lastError || new Error("Failed to process audio translation.");
      }
    } else {
      for (const mName of candidateModels) {
        try {
          const result = await Promise.race([
            generateObject({
              model: google(mName),
              schema: textResponseSchema,
              system: systemPrompt,
              prompt: body.question!,
              temperature: 0,
            }),
            new Promise<never>((_, reject) =>
              setTimeout(() => reject(new Error("AI timeout")), 60000),
            ),
          ]);

          generatedSql = (result.object.sql || result.object.suggestedSql || "").trim();
          interpretation = result.object.interpretation || "";
          isValidResponse = result.object.isValid;
          errorReason = result.object.reason;
          suggestedTables = result.object.suggestedTables;
          suggestedColumns = result.object.suggestedColumns;
          suggestedSql = result.object.suggestedSql;
          break;
        } catch (e: any) {
          console.error(`[AI Translate] Model ${mName} failed:`, e?.message || e);
          lastError = e;
        }
      }
      if (!generatedSql && isValidResponse) {
        const qLower = (body.question || "").toLowerCase();
        const knownTables = currentSchema.map((t) => t.name.toLowerCase());
        const fromMatch = qLower.match(/(?:from|table|into|update)\s+([a-zA-Z0-9_]+)/i);
        const mentionedEntity = fromMatch ? fromMatch[1].toLowerCase() : undefined;

        if (mentionedEntity && !knownTables.includes(mentionedEntity)) {
          const closest = findClosestMatch(
            mentionedEntity,
            currentSchema.map((t) => t.name),
          );
          const fallbackTable = closest || currentSchema[0]?.name || "table";
          const diag = sanitizeDiagnostic(
            currentSchema,
            `Table "${mentionedEntity}" does not exist in this database. Available tables: ${currentSchema.map((t) => t.name).join(", ")}.`,
            currentSchema.map((t) => t.name),
            [],
            `SELECT * FROM ${fallbackTable};`,
          );
          return NextResponse.json({
            question: transcribedQuestion,
            sql: diag.suggestedSql,
            confidence: 0,
            interpretation: diag.reason,
            isValid: false,
            diagnostic: diag,
          });
        }

        // Find all schema tables explicitly referenced in the user's question
        const matchedTables = currentSchema.filter((t) => {
          const baseName = t.name.toLowerCase();
          const singular = baseName.endsWith("s") ? baseName.slice(0, -1) : baseName;
          const regex = new RegExp(`\\b(${baseName}|${singular})\\b`, "i");
          return regex.test(qLower);
        });

        const isJoinRequested = qLower.includes("join") || matchedTables.length >= 2;

        if (isJoinRequested && matchedTables.length >= 2) {
          // Identify base table and join related tables using foreign keys
          const primaryTable = matchedTables[0];
          const joins: string[] = [];

          for (let i = 1; i < matchedTables.length; i++) {
            const otherTable = matchedTables[i];
            const fkToOther = primaryTable.columns.find((c) => c.fk?.table.toLowerCase() === otherTable.name.toLowerCase());
            const fkFromOther = otherTable.columns.find((c) => c.fk?.table.toLowerCase() === primaryTable.name.toLowerCase());

            if (fkFromOther) {
              joins.push(`JOIN ${otherTable.name} ON ${otherTable.name}.${fkFromOther.name} = ${primaryTable.name}.${fkFromOther.fk!.column}`);
            } else if (fkToOther) {
              joins.push(`JOIN ${otherTable.name} ON ${primaryTable.name}.${fkToOther.name} = ${otherTable.name}.${fkToOther.fk!.column}`);
            } else {
              // Try finding a linking junction table in currentSchema
              const junction = currentSchema.find((j) => {
                const hasPrimary = j.columns.some((c) => c.fk?.table.toLowerCase() === primaryTable.name.toLowerCase());
                const hasOther = j.columns.some((c) => c.fk?.table.toLowerCase() === otherTable.name.toLowerCase());
                return hasPrimary && hasOther;
              });

              if (junction) {
                const fkP = junction.columns.find((c) => c.fk?.table.toLowerCase() === primaryTable.name.toLowerCase())!;
                const fkO = junction.columns.find((c) => c.fk?.table.toLowerCase() === otherTable.name.toLowerCase())!;
                joins.push(`JOIN ${junction.name} ON ${junction.name}.${fkP.name} = ${primaryTable.name}.${fkP.fk!.column}`);
                joins.push(`JOIN ${otherTable.name} ON ${junction.name}.${fkO.name} = ${otherTable.name}.${fkO.fk!.column}`);
              } else {
                joins.push(`JOIN ${otherTable.name}`);
              }
            }
          }

          const joinedSql = `SELECT * FROM ${primaryTable.name} ${joins.join(" ")};`;
          return NextResponse.json({
            question: transcribedQuestion,
            sql: joinedSql,
            confidence: 0.85,
            interpretation: `Retrieve joined records from ${matchedTables.map((t) => t.name).join(", ")}.`,
            isValid: true,
          });
        }

        if (matchedTables.length === 1 && !isJoinRequested) {
          return NextResponse.json({
            question: transcribedQuestion,
            sql: `SELECT * FROM ${matchedTables[0].name};`,
            confidence: 0.9,
            interpretation: `Retrieve rows from ${matchedTables[0].name}.`,
            isValid: true,
          });
        }

        const errMsg = lastError instanceof Error ? lastError.message : String(lastError);
        throw new Error(
          errMsg.includes("Quota exceeded")
            ? "Gemini API free quota exceeded. Please check your API key."
            : errMsg,
        );
      }
    }

    // Clean up any stray markdown fences
    generatedSql = generatedSql.replace(/^```(?:sql|plsql)?\s*/i, "").replace(/\s*```$/, "").trim();

    // ── Diagnostic Branch 1: Gemini identified an invalid request ────
    if (!isValidResponse) {
      const diagnostic = sanitizeDiagnostic(
        currentSchema,
        errorReason,
        suggestedTables,
        suggestedColumns,
        suggestedSql || generatedSql,
      );
      return NextResponse.json({
        question: transcribedQuestion,
        sql: diagnostic.suggestedSql,
        confidence: 0,
        interpretation: diagnostic.reason,
        isValid: false,
        diagnostic,
      });
    }

    // ── Diagnostic Branch 2: Gemini marked valid, but schema validation caught an error ──
    if (!isPlSql) {
      try {
        validateSQLAgainstSchema(generatedSql, dataset?.schema ?? currentSchema);
      } catch (validationErr: any) {
        const validationMsg =
          validationErr instanceof Error ? validationErr.message : String(validationErr);
        const tableMatch = validationMsg.match(/Unknown table ["']?(\w+)["']?/i);
        const colMatch = validationMsg.match(/Unknown column ["']?(\w+)["']?/i);

        let fallbackTable = currentSchema[0]?.name || "table";
        let note = validationMsg;

        if (tableMatch) {
          const badTbl = tableMatch[1];
          const closest = findClosestMatch(
            badTbl,
            currentSchema.map((t) => t.name),
          );
          if (closest) {
            fallbackTable = closest;
            note = `Table "${badTbl}" does not exist. Did you mean "${closest}"?`;
          } else {
            note = `Table "${badTbl}" does not exist. Available tables: ${currentSchema.map((t) => t.name).join(", ")}.`;
          }
        } else if (colMatch) {
          note = `Column "${colMatch[1]}" does not exist on that table.`;
        }

        const diagnostic = sanitizeDiagnostic(
          currentSchema,
          note,
          currentSchema.map((t) => t.name),
          [],
          `SELECT * FROM ${fallbackTable};`,
        );

        return NextResponse.json({
          question: transcribedQuestion,
          sql: diagnostic.suggestedSql,
          confidence: 0,
          interpretation: diagnostic.reason,
          isValid: false,
          diagnostic,
        });
      }
    } else {
      if (
        !/begin\b/i.test(generatedSql) &&
        !/create\s+(or\s+replace\s+)?(procedure|function|trigger)\b/i.test(generatedSql)
      ) {
        const fallbackTable = currentSchema[0]?.name || "table";
        const diagnostic = sanitizeDiagnostic(
          currentSchema,
          "The generated PL/SQL block is missing an executable BEGIN...END block.",
          [fallbackTable],
          [],
          `BEGIN\n  DBMS_OUTPUT.PUT_LINE('Hello from ${fallbackTable}');\nEND;`,
        );
        return NextResponse.json({
          question: transcribedQuestion,
          sql: diagnostic.suggestedSql,
          confidence: 0,
          interpretation: diagnostic.reason,
          isValid: false,
          diagnostic,
        });
      }
    }

    return NextResponse.json({
      question: transcribedQuestion,
      sql: generatedSql,
      confidence: 1,
      interpretation,
      isValid: true,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Translation failed.";
    const status = message.startsWith("Missing required environment variable") ? 503 : 502;
    return NextResponse.json({ error: message }, { status });
  }
}
