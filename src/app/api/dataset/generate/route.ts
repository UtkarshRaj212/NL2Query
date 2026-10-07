import { NextResponse } from "next/server";
import { z } from "zod";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { generateObject } from "ai";
import env from "@/lib/env";
import { generateLocalFallbackDataset } from "@/lib/datasetPromptGenerator";

const requestSchema = z.object({
  prompt: z.string().min(1).max(2000),
});

const datasetOutputSchema = z.object({
  name: z
    .string()
    .describe("Database name in snake_case, max 30 chars, e.g. bookstore_db"),
  description: z
    .string()
    .describe("1-2 sentence description of the dataset and what it represents"),
  tables: z
    .array(
      z.object({
        name: z.string().describe("Table name in snake_case, e.g. authors, books"),
        columns: z.array(
          z.object({
            name: z.string().describe("Column name in snake_case, e.g. id, title, price"),
            type: z
              .enum(["INTEGER", "TEXT", "REAL", "BOOLEAN", "DATE", "VARCHAR"])
              .describe("SQL column data type"),
            pk: z.boolean().describe("true if primary key, false otherwise"),
            fk: z
              .object({
                table: z.string().describe("Target table name"),
                column: z.string().describe("Target column name"),
              })
              .optional(),
          })
        ),
        rows: z
          .array(
            z.record(
              z.string(),
              z.union([z.string(), z.number(), z.boolean(), z.null()])
            )
          )
          .describe("3 to 5 realistic sample rows"),
      })
    )
    .min(1)
    .max(6),
  defaultQuery: z
    .string()
    .describe("A clean SELECT query showcasing a query on this dataset"),
  examples: z
    .array(
      z.object({
        id: z.number(),
        category: z.enum(["DQL", "DML", "DDL"]).optional(),
        question: z.string(),
        sql: z.string(),
        expected: z.string(),
      })
    )
    .optional(),
});

export async function POST(request: Request) {
  let prompt = "";
  try {
    const rawBody = await request.json().catch(() => ({}));
    const parsed = requestSchema.parse(rawBody);
    prompt = parsed.prompt.trim();

    const apiKey = env.GEMINI_API_KEY;
    if (!apiKey) {
      // Return smart fallback if no API key is provided
      const fallback = generateLocalFallbackDataset(prompt);
      return NextResponse.json(fallback);
    }

    const google = createGoogleGenerativeAI({ apiKey });
    const candidateModels = [
      "gemini-3.7-flash",
      "gemini-3.5-flash-lite",
      "gemini-3.1-flash-lite",
      "gemini-flash-lite-latest",
      "gemini-3-flash-preview",
      "gemini-3.8-flash",
      "gemini-3.6-flash",
    ];

    const systemPrompt = `You are an expert relational database architect and DBMS data synthesizer.
Given the user's natural language request, design a complete relational schema with realistic data.
Rules:
1. "name": lowercase snake_case (e.g. "bookstore_db", "gym_tracker").
2. "description": clear explanation of domain.
3. "tables": 2 to 4 relational tables.
4. Each table MUST have an integer primary key column named "id" (or "table_id") with pk=true.
5. Create realistic Foreign Key relationships between tables with valid fk references (e.g. fk: { table: "authors", column: "id" }).
6. Provide 3 to 5 realistic sample rows per table. All FK column values in rows MUST match actual PK values of related tables.
7. Use appropriate data types: INTEGER, TEXT, REAL, BOOLEAN, DATE, VARCHAR.
8. Output MUST be valid JSON adhering strictly to the schema.`;

    let generatedResult = null;
    let lastError = null;

    for (const modelName of candidateModels) {
      try {
        const result = await Promise.race([
          generateObject({
            model: google(modelName),
            schema: datasetOutputSchema,
            system: systemPrompt,
            prompt: `Create a relational database dataset for the following requirement: "${prompt}"`,
            temperature: 0.2,
          }),
          new Promise<never>((_, reject) =>
            setTimeout(() => reject(new Error("AI timeout")), 45000)
          ),
        ]);

        if (result.object && result.object.tables && result.object.tables.length > 0) {
          generatedResult = result.object;
          break;
        }
      } catch (err: any) {
        lastError = err;
      }
    }

    if (generatedResult) {
      return NextResponse.json(generatedResult);
    }

    // If Gemini attempts failed, fall back to local generator
    console.warn("Gemini generation failed, falling back to local dataset generator:", lastError);
    const fallback = generateLocalFallbackDataset(prompt);
    return NextResponse.json(fallback);
  } catch (error) {
    console.warn("Dataset generation error, using fallback:", error);
    const fallback = generateLocalFallbackDataset(prompt || "sample dataset");
    return NextResponse.json(fallback);
  }
}
