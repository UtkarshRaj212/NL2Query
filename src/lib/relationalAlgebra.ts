/**
 * Relational Algebra Generator & Component Explainer
 *
 * Implements Codd's Relational Algebra (ANSI/ISO SQL mathematical foundation)
 * and extended relational algebra (Klug 1982) for grouping, aggregates, and sorting.
 *
 * Provides complete expressions and detailed dissections of each part of the algebra:
 * - Operator Symbol & Formal Name (σ, π, ⋈, γ, τ, δ, λ, ρ, ∪, ∖)
 * - Subscript / Argument (Predicates, Attribute lists, Join conditions)
 * - Input Relation Operand (Source tables & intermediate relations)
 * - Output Relation Transformation (Schema & Cardinality shifts)
 * - Formal First-Order Set-Theoretic Definition
 * - Relational Algebraic Laws & Optimization Equivalences (Pushdown, Commutativity)
 */

import type { Table } from "./schema";
import type { PipelineStep, Row, SQLCommand, StatementType } from "./sqlEngine";

export interface RelationalAlgebraPart {
  /** Single-character or canonical Greek symbol: σ, π, ⋈, γ, τ, δ, λ, ρ, ∪, ∖ */
  symbol: string;
  /** Formal academic name of operator */
  name: string;
  /** High-level classification */
  category:
    | "Unary Filter (Horizontal Selection)"
    | "Unary Transformation (Vertical Projection)"
    | "Binary Relation Operator (Join / Product)"
    | "Aggregation & Group Partitioning"
    | "Ordering & Cardinality Restriction"
    | "Set-Theoretic Mutation"
    | "Data Dictionary Catalog Operation";
  /** Subscript parameter string, e.g. "signup_year > 2021" or "name, city" */
  subscript: string;
  /** Deep explanation of what this subscript/parameter does in the query */
  subscriptExplanation: string;
  /** Input operand notation, e.g. "customers (Relation R₁)" */
  inputOperand: string;
  /** Explanation of the input relation state before this operator */
  inputExplanation: string;
  /** Output relation notation, e.g. "R₂" or "Result Matrix" */
  outputResult: string;
  /** Explanation of what the output relation contains after transformation */
  outputExplanation: string;
  /** Mathematical definition in first-order relational calculus / set theory */
  formalDefinition: string;
  /** Core conceptual explanation of what this operator means */
  mathematicalRole: string;
  /** Relational optimization law or algebraic equivalence rule */
  optimizationRule?: string;
}

export interface RelationalAlgebraTreeStep {
  step: number;
  stage: string;
  operator: string;
  expression: string;
  description: string;
}

export interface FullRelationalAlgebra {
  /** Complete nested mathematical formula using Unicode symbols (π, σ, ⋈, etc.) */
  formula: string;
  /** ASCII-friendly alternative formula for text terminals or clean code blocks */
  asciiFormula: string;
  /** LaTeX formatted mathematical equation string */
  latexFormula: string;
  /** Complete list of all component parts explained in detail */
  components: RelationalAlgebraPart[];
  /** Execution order tree from base relation to final projected output */
  evaluationPipeline: RelationalAlgebraTreeStep[];
  /** High-level pedagogical summary */
  summary: string;
}

/**
 * Generates the full composed Relational Algebra expression and dissects each part.
 */
export function generateRelationalAlgebra(
  sql: string,
  schema: Table[] = [],
  pipelineSteps: PipelineStep[] = [],
  finalRows: Row[] = [],
  columns: string[] = [],
  statementType: StatementType = "DQL",
  command: SQLCommand = "SELECT",
): FullRelationalAlgebra {
  if (statementType !== "DQL" || command !== "SELECT") {
    return generateDdlDmlRelationalAlgebra(
      sql,
      statementType,
      command,
      pipelineSteps,
      finalRows,
      columns,
    );
  }

  return generateSelectRelationalAlgebra(
    sql,
    schema,
    pipelineSteps,
    finalRows,
    columns,
  );
}

/**
 * Builds Relational Algebra for SELECT queries.
 */
function generateSelectRelationalAlgebra(
  sql: string,
  schema: Table[],
  pipelineSteps: PipelineStep[],
  finalRows: Row[],
  columns: string[],
): FullRelationalAlgebra {
  const fromStep = pipelineSteps.find((s) => s.stage === "FROM");
  const joinSteps = pipelineSteps.filter((s) => s.stage === "JOIN");
  const whereStep = pipelineSteps.find((s) => s.stage === "WHERE");
  const groupStep = pipelineSteps.find((s) => s.stage === "GROUP BY");
  const havingStep = pipelineSteps.find((s) => s.stage === "HAVING");
  const distinctStep = pipelineSteps.find((s) => s.stage === "DISTINCT");
  const orderStep = pipelineSteps.find((s) => s.stage === "ORDER BY");
  const limitStep = pipelineSteps.find((s) => s.stage === "LIMIT");
  const selectStep = pipelineSteps.find((s) => s.stage === "SELECT");

  const components: RelationalAlgebraPart[] = [];
  const evalPipeline: RelationalAlgebraTreeStep[] = [];
  let stepCounter = 1;

  // 1. Base Table (FROM)
  const baseTable =
    fromStep?.title.replace(/^(?:FROM|Scan)\s+/i, "").trim() ||
    extractTableNameFromSql(sql) ||
    "R";
  const baseRowCount = fromStep?.rowCount ?? 0;

  let currentRelation = baseTable;
  let currentAscii = baseTable;
  let currentLatex = `\\text{${baseTable}}`;

  evalPipeline.push({
    step: stepCounter++,
    stage: "FROM",
    operator: `Relation(${baseTable})`,
    expression: baseTable,
    description: `Read all ${baseRowCount} initial tuples from base relation "${baseTable}".`,
  });

  // 2. JOINs
  if (joinSteps.length > 0) {
    for (const jStep of joinSteps) {
      const joinTitle = jStep.title;
      // Extract join target and condition
      const tableMatch = joinTitle.match(/(?:INNER|LEFT|RIGHT|FULL)?\s*JOIN\s+([^\s(]+)/i);
      const joinedTable = tableMatch ? tableMatch[1].replace(/[`"']/g, "") : "S";
      const joinCondition =
        extractJoinConditionFromSql(sql) ||
        extractJoinConditionFromDetail(jStep.detail) ||
        "θ";

      const prevRel = currentRelation;
      currentRelation = `(${currentRelation} ⋈_{${joinCondition}} ${joinedTable})`;
      currentAscii = `(${currentAscii} JOIN[${joinCondition}] ${joinedTable})`;
      currentLatex = `(${currentLatex} \\bowtie_{${joinCondition}} \\text{${joinedTable}})`;

      components.push({
        symbol: "⋈",
        name: "Theta Join (Equi-Join)",
        category: "Binary Relation Operator (Join / Product)",
        subscript: joinCondition,
        subscriptExplanation: `Equality predicate "${joinCondition}" matches primary keys and foreign keys across tuples.`,
        inputOperand: `${prevRel} and ${joinedTable}`,
        inputExplanation: `Combines rows from left relation with rows from right relation "${joinedTable}".`,
        outputResult: currentRelation,
        outputExplanation: `Joined relation containing composite tuples from both relations (${jStep.rowCount} rows).`,
        formalDefinition: "R ⋈_θ S = σ_θ(R × S) = { (t_r, t_s) | t_r ∈ R ∧ t_s ∈ S ∧ θ(t_r, t_s) = true }",
        mathematicalRole:
          "Computes the Cartesian Product of relations R and S, then applies horizontal selection based on the join predicate θ. Combines attributes from both relations into a wider tuple.",
        optimizationRule:
          "Associative and Commutative: (R ⋈ S) ⋈ T ≡ R ⋈ (S ⋈ T) and R ⋈ S ≡ S ⋈ R. Enables query optimizers to build optimal join trees.",
      });

      evalPipeline.push({
        step: stepCounter++,
        stage: "JOIN",
        operator: `⋈_{${joinCondition}}`,
        expression: currentRelation,
        description: `Perform relational join with "${joinedTable}" on ${joinCondition} yielding ${jStep.rowCount} tuples.`,
      });
    }
  }

  // 3. WHERE (Selection σ)
  if (whereStep) {
    const rawCond =
      extractWhereConditionFromSql(sql) ||
      whereStep.title.replace(/^Filter\s*\(?/i, "").replace(/\)$/, "").replace(/^WHERE\s+/i, "").trim() ||
      "P";

    const prevRel = currentRelation;
    currentRelation = `σ_{${rawCond}}(${currentRelation})`;
    currentAscii = `sigma[${rawCond}](${currentAscii})`;
    currentLatex = `\\sigma_{${escapeLatex(rawCond)}}(${currentLatex})`;

    components.push({
      symbol: "σ",
      name: "Selection (Horizontal Filter)",
      category: "Unary Filter (Horizontal Selection)",
      subscript: rawCond,
      subscriptExplanation: `Boolean proposition "${rawCond}" evaluated for truth on every candidate tuple.`,
      inputOperand: prevRel,
      inputExplanation: `Candidate relation before filter (${whereStep.rowCount} matching rows out of previous step).`,
      outputResult: currentRelation,
      outputExplanation: `Sub-relation containing only tuples where predicate "${rawCond}" evaluates to true.`,
      formalDefinition: "σ_P(R) = { t ∈ R | P(t) = true }",
      mathematicalRole:
        "Filters rows horizontally. Preserves all attributes (degree of relation is unchanged) while reducing cardinality (number of tuples).",
      optimizationRule:
        "Predicate Pushdown: σ_P(R ⋈ S) ≡ (σ_P(R)) ⋈ S when P references only attributes in R. Filters rows before expensive joins.",
    });

    evalPipeline.push({
      step: stepCounter++,
      stage: "WHERE",
      operator: `σ_{${rawCond}}`,
      expression: currentRelation,
      description: `Evaluate selection predicate "${rawCond}", filtering relation down to ${whereStep.rowCount} tuples.`,
    });
  }

  // 4. GROUP BY & AGGREGATE (γ - Gamma)
  if (groupStep) {
    const groupCols =
      extractGroupByFromSql(sql) ||
      groupStep.title.replace(/^Group(?:\s+by)?\s*\(?/i, "").replace(/\)$/, "").replace(/^GROUP BY\s+/i, "").trim() ||
      "group_attrs";
    const aggFuncs = extractAggregatesFromSql(sql) || "aggregates";
    const gammaArg = `${groupCols}; ${aggFuncs}`;

    const prevRel = currentRelation;
    currentRelation = `γ_{${gammaArg}}(${currentRelation})`;
    currentAscii = `gamma[${gammaArg}](${currentAscii})`;
    currentLatex = `\\gamma_{${escapeLatex(gammaArg)}}(${currentLatex})`;

    components.push({
      symbol: "γ",
      name: "Aggregate & Group Partitioning",
      category: "Aggregation & Group Partitioning",
      subscript: gammaArg,
      subscriptExplanation: `Grouping attributes: [${groupCols}]; Aggregate reduction: [${aggFuncs}].`,
      inputOperand: prevRel,
      inputExplanation: `Filtered tuples partitioned into distinct equivalence classes matching grouping keys.`,
      outputResult: currentRelation,
      outputExplanation: `Summary relation with one tuple per group (${groupStep.rowCount} group tuples formed).`,
      formalDefinition:
        "γ_{G; F}(R) = { (g, f_1, …, f_k) | g ∈ π_G(R) ∧ f_i = F_i({ t ∈ R | t[G] = g }) }",
      mathematicalRole:
        "Partitions the relation into equivalence classes based on grouping attributes G, then computes summary aggregate functions F over each partition bucket.",
      optimizationRule:
        "Aggregation Pushdown: If grouping keys include the primary key of R, aggregation can be computed prior to joins.",
    });

    evalPipeline.push({
      step: stepCounter++,
      stage: "GROUP BY",
      operator: `γ_{${gammaArg}}`,
      expression: currentRelation,
      description: `Partition relation by [${groupCols}] and calculate aggregates, producing ${groupStep.rowCount} groups.`,
    });
  }

  // 5. HAVING (σ over aggregated groups)
  if (havingStep) {
    const havingCond =
      havingStep.title.replace(/^HAVING\s+/i, "").trim() ||
      extractHavingFromSql(sql) ||
      "having_cond";

    const prevRel = currentRelation;
    currentRelation = `σ_{${havingCond}}(${currentRelation})`;
    currentAscii = `sigma[${havingCond}](${currentAscii})`;
    currentLatex = `\\sigma_{${escapeLatex(havingCond)}}(${currentLatex})`;

    components.push({
      symbol: "σ",
      name: "Group Selection (HAVING Filter)",
      category: "Unary Filter (Horizontal Selection)",
      subscript: havingCond,
      subscriptExplanation: `Group-level predicate "${havingCond}" evaluated after aggregate reduction.`,
      inputOperand: prevRel,
      inputExplanation: `Aggregated group relation produced by γ operator.`,
      outputResult: currentRelation,
      outputExplanation: `Remaining group tuples satisfying aggregate filter (${havingStep.rowCount} surviving groups).`,
      formalDefinition: "σ_{P_group}(γ(R)) = { g ∈ γ(R) | P_group(g) = true }",
      mathematicalRole:
        "Applies selection filtering on aggregated partition rows. Unlike WHERE (which filters base tuples before aggregation), HAVING operates on computed group values.",
    });

    evalPipeline.push({
      step: stepCounter++,
      stage: "HAVING",
      operator: `σ_{${havingCond}}`,
      expression: currentRelation,
      description: `Filter aggregated groups with condition "${havingCond}", keeping ${havingStep.rowCount} groups.`,
    });
  }

  // 6. DISTINCT (δ - Delta)
  if (distinctStep || /\bSELECT\s+DISTINCT\b/i.test(sql)) {
    const prevRel = currentRelation;
    currentRelation = `δ(${currentRelation})`;
    currentAscii = `delta(${currentAscii})`;
    currentLatex = `\\delta(${currentLatex})`;

    components.push({
      symbol: "δ",
      name: "Duplicate Elimination",
      category: "Unary Transformation (Vertical Projection)",
      subscript: "Unique(R)",
      subscriptExplanation: "Removes duplicate multiset tuples, converting bag semantics into strict set semantics.",
      inputOperand: prevRel,
      inputExplanation: "Working relation with potential duplicate tuple values.",
      outputResult: currentRelation,
      outputExplanation: `Unique relation containing exactly one occurrence of each distinct tuple (${distinctStep?.rowCount ?? finalRows.length} rows).`,
      formalDefinition: "δ(R) = { t | t ∈ R }",
      mathematicalRole:
        "Converts a bag (multiset) of tuples into a formal mathematical set by discarding duplicate records.",
      optimizationRule:
        "Redundant if the projected attributes form a candidate key or primary key of the underlying relation.",
    });

    evalPipeline.push({
      step: stepCounter++,
      stage: "DISTINCT",
      operator: "δ",
      expression: currentRelation,
      description: `Eliminate duplicate rows to guarantee set uniqueness (${distinctStep?.rowCount ?? finalRows.length} unique rows).`,
    });
  }

  // 7. SELECT / PROJECTION (π - Pi)
  const projCols =
    columns.length > 0
      ? columns
      : selectStep?.columns && selectStep.columns.length > 0
      ? selectStep.columns
      : extractSelectColumnsFromSql(sql);
  const projStr = projCols.length > 0 ? projCols.join(", ") : "*";

  if (projStr !== "*") {
    const prevRel = currentRelation;
    currentRelation = `π_{${projStr}}(${currentRelation})`;
    currentAscii = `pi[${projStr}](${currentAscii})`;
    currentLatex = `\\pi_{${escapeLatex(projStr)}}(${currentLatex})`;

    components.push({
      symbol: "π",
      name: "Projection (Vertical Subspace)",
      category: "Unary Transformation (Vertical Projection)",
      subscript: projStr,
      subscriptExplanation: `Attribute list [${projStr}] specifying the exact columns to keep. Non-projected attributes are discarded.`,
      inputOperand: prevRel,
      inputExplanation: `Full tuple relation prior to attribute filtering.`,
      outputResult: currentRelation,
      outputExplanation: `Projected relation restricted strictly to the ${projCols.length} requested attributes (${finalRows.length} rows × ${projCols.length} columns).`,
      formalDefinition: "π_{A_1, …, A_k}(R) = { (t.A_1, …, t.A_k) | t ∈ R }",
      mathematicalRole:
        "Projects tuples into a vertical subspace. Reduces relation degree (column count) while maintaining cardinality (row count).",
      optimizationRule:
        "Projection Pushdown: Eliminating unneeded attributes early reduces memory bandwidth, cache line pollution, and network transfer volume.",
    });

    evalPipeline.push({
      step: stepCounter++,
      stage: "SELECT",
      operator: `π_{${projStr}}`,
      expression: currentRelation,
      description: `Project attributes [${projStr}], discarding all internal working columns (${finalRows.length} rows × ${projCols.length} cols).`,
    });
  }

  // 8. ORDER BY (τ - Tau)
  if (orderStep || /\bORDER\s+BY\b/i.test(sql)) {
    const orderExpr =
      extractOrderByFromSql(sql) ||
      orderStep?.title.replace(/^Sort\s*\(?/i, "").replace(/\)$/, "").replace(/^ORDER BY\s+/i, "").trim() ||
      "sort_key";

    const prevRel = currentRelation;
    currentRelation = `τ_{${orderExpr}}(${currentRelation})`;
    currentAscii = `tau[${orderExpr}](${currentAscii})`;
    currentLatex = `\\tau_{${escapeLatex(orderExpr)}}(${currentLatex})`;

    components.push({
      symbol: "τ",
      name: "Sorting Operator",
      category: "Ordering & Cardinality Restriction",
      subscript: orderExpr,
      subscriptExplanation: `Ordering criteria "${orderExpr}" establishing a total order over all result tuples.`,
      inputOperand: prevRel,
      inputExplanation: `Unordered projected relation.`,
      outputResult: currentRelation,
      outputExplanation: `Total-ordered list of tuples sorted by ${orderExpr}.`,
      formalDefinition: "τ_{K}(R) = [ t_1, t_2, …, t_n ] such that K(t_i) ≤ K(t_{i+1})",
      mathematicalRole:
        "Orders tuples according to specified attribute keys. Since pure relational models treat relations as unordered sets, τ operates within extended relational algebra (list semantics).",
      optimizationRule:
        "Can be served at O(1) extra runtime if an index exists on the ordering attributes (B+ tree index ordered scan).",
    });

    evalPipeline.push({
      step: stepCounter++,
      stage: "ORDER BY",
      operator: `τ_{${orderExpr}}`,
      expression: currentRelation,
      description: `Sort output tuples according to [${orderExpr}].`,
    });
  }

  // 9. LIMIT (λ - Lambda)
  if (limitStep || /\bLIMIT\s+\d+/i.test(sql)) {
    const limitNum =
      limitStep?.title.replace(/^LIMIT\s+/i, "").trim() ||
      extractLimitFromSql(sql) ||
      "N";

    const prevRel = currentRelation;
    currentRelation = `λ_{${limitNum}}(${currentRelation})`;
    currentAscii = `lambda[${limitNum}](${currentAscii})`;
    currentLatex = `\\lambda_{${limitNum}}(${currentLatex})`;

    components.push({
      symbol: "λ",
      name: "Limit / Top-N Restriction",
      category: "Ordering & Cardinality Restriction",
      subscript: `n = ${limitNum}`,
      subscriptExplanation: `Truncation boundary: stops after retrieving at most ${limitNum} tuples.`,
      inputOperand: prevRel,
      inputExplanation: `Candidate tuples entering limit stage.`,
      outputResult: currentRelation,
      outputExplanation: `Truncated relation containing at most ${limitNum} rows (delivers ${finalRows.length} rows).`,
      formalDefinition: "λ_k(R) = [ t_1, …, t_m ] where m = min(k, |R|)",
      mathematicalRole:
        "Restricts output relation cardinality to a maximum number of tuples. When combined with τ (ORDER BY), forms Top-K evaluation.",
      optimizationRule:
        "Short-circuit execution: Pipeline halts scanning as soon as k matching tuples are accumulated in the buffer.",
    });

    evalPipeline.push({
      step: stepCounter++,
      stage: "LIMIT",
      operator: `λ_{${limitNum}}`,
      expression: currentRelation,
      description: `Truncate result set to maximum of ${limitNum} rows (returns ${finalRows.length} rows).`,
    });
  }

  const summary = `Composed relational algebra expression: ${currentRelation}. It represents a composition of ${components.length} formal relational operator${components.length !== 1 ? "s" : ""} translating declarative SQL into procedural first-order logic.`;

  return {
    formula: currentRelation,
    asciiFormula: currentAscii,
    latexFormula: currentLatex,
    components,
    evaluationPipeline: evalPipeline,
    summary,
  };
}

/**
 * Builds Relational Algebra for DML and DDL commands.
 */
function generateDdlDmlRelationalAlgebra(
  sql: string,
  statementType: StatementType,
  command: SQLCommand,
  pipelineSteps: PipelineStep[],
  finalRows: Row[],
  columns: string[],
): FullRelationalAlgebra {
  const components: RelationalAlgebraPart[] = [];
  const evalPipeline: RelationalAlgebraTreeStep[] = [];
  const targetTbl = extractTableNameFromSql(sql) || "R";

  let formula = "";
  let asciiFormula = "";
  let latexFormula = "";

  if (command === "INSERT") {
    formula = `${targetTbl} ← ${targetTbl} ∪ { new_tuples }`;
    asciiFormula = `${targetTbl} <- ${targetTbl} UNION { new_tuples }`;
    latexFormula = `\\text{${targetTbl}} \\leftarrow \\text{${targetTbl}} \\cup \\{ t_1, t_2, \\dots \\}`;

    components.push({
      symbol: "∪",
      name: "Relational Set Union (Insertion)",
      category: "Set-Theoretic Mutation",
      subscript: "new_tuples",
      subscriptExplanation: "The set of validated, typed tuple vectors to append to the target relation.",
      inputOperand: `Relation ${targetTbl}`,
      inputExplanation: `Existing database table prior to transaction commit.`,
      outputResult: `Relation ${targetTbl}'`,
      outputExplanation: `Updated relation containing original tuples plus inserted records.`,
      formalDefinition: "R ← R ∪ { t | t satisfies Schema(R) ∧ Unique(PK) ∧ FK_Ref }",
      mathematicalRole:
        "Performs a set union between the existing relation R and the set of new tuple vectors, subject to domain and integrity constraints.",
      optimizationRule: "Appended to slotted page heap or clustered B+ Tree index in O(log N) time.",
    });
  } else if (command === "UPDATE") {
    const whereCond = extractWhereConditionFromSql(sql) || "P";
    formula = `${targetTbl} ← (${targetTbl} ∖ σ_{${whereCond}}(${targetTbl})) ∪ { update(t) | t ∈ σ_{${whereCond}}(${targetTbl}) }`;
    asciiFormula = `${targetTbl} <- (${targetTbl} - sigma[${whereCond}](${targetTbl})) UNION { update(t) }`;
    latexFormula = `\\text{${targetTbl}} \\leftarrow (\\text{${targetTbl}} \\setminus \\sigma_{${whereCond}}(\\text{${targetTbl}})) \\cup \\{ \\text{update}(t) \\mid t \\in \\sigma_{${whereCond}}(\\text{${targetTbl}}) \\}`;

    components.push({
      symbol: "σ",
      name: "Update Selection Predicate",
      category: "Unary Filter (Horizontal Selection)",
      subscript: whereCond,
      subscriptExplanation: `Predicate "${whereCond}" identifies which tuples in "${targetTbl}" must be updated.`,
      inputOperand: `Relation ${targetTbl}`,
      inputExplanation: `Existing relation containing candidate tuples.`,
      outputResult: `σ_{${whereCond}}(${targetTbl})`,
      outputExplanation: `Subset of tuples undergoing attribute modification.`,
      formalDefinition: "TargetTuples = σ_P(R)",
      mathematicalRole: "Isolates the target tuples that satisfy the WHERE condition for modification.",
    });

    components.push({
      symbol: "∖",
      name: "Set Difference (Tuple Invalidation)",
      category: "Set-Theoretic Mutation",
      subscript: "σ_P(R)",
      subscriptExplanation: "Removes original stale tuples from the relation before replacing with updated tuples.",
      inputOperand: `Relation ${targetTbl}`,
      inputExplanation: `Original relation state.`,
      outputResult: `R ∖ σ_P(R)`,
      outputExplanation: `Unmodified tuples that remain untouched.`,
      formalDefinition: "R_unmodified = R ∖ σ_P(R) = { t ∈ R | t ∉ σ_P(R) }",
      mathematicalRole: "Removes old versions of updated tuples from the active relational store.",
    });

    components.push({
      symbol: "∪",
      name: "Set Union (Updated Tuple Re-insertion)",
      category: "Set-Theoretic Mutation",
      subscript: "update(t)",
      subscriptExplanation: "Unites untouched tuples with mutated tuples containing new values.",
      inputOperand: `R_unmodified and mutated tuples`,
      inputExplanation: `Combines untouched records with updated records.`,
      outputResult: `Relation ${targetTbl}'`,
      outputExplanation: `Final relation state after ACID commit.`,
      formalDefinition: "R' = R_unmodified ∪ { t_updated }",
      mathematicalRole: "Re-integrates the modified tuples into relation R.",
    });
  } else if (command === "DELETE") {
    const whereCond = extractWhereConditionFromSql(sql) || "P";
    formula = `${targetTbl} ← ${targetTbl} ∖ σ_{${whereCond}}(${targetTbl})`;
    asciiFormula = `${targetTbl} <- ${targetTbl} - sigma[${whereCond}](${targetTbl})`;
    latexFormula = `\\text{${targetTbl}} \\leftarrow \\text{${targetTbl}} \\setminus \\sigma_{${whereCond}}(\\text{${targetTbl}})`;

    components.push({
      symbol: "σ",
      name: "Deletion Filter",
      category: "Unary Filter (Horizontal Selection)",
      subscript: whereCond,
      subscriptExplanation: `Predicate "${whereCond}" identifies tuples to be deleted.`,
      inputOperand: `Relation ${targetTbl}`,
      inputExplanation: `Active relation before deletion.`,
      outputResult: `σ_{${whereCond}}(${targetTbl})`,
      outputExplanation: `Candidate tuples flagged for removal.`,
      formalDefinition: "TuplesToDelete = σ_P(R)",
      mathematicalRole: "Identifies tuples targeted for deletion.",
    });

    components.push({
      symbol: "∖",
      name: "Set Difference (Tuple Deletion)",
      category: "Set-Theoretic Mutation",
      subscript: "σ_P(R)",
      subscriptExplanation: "Subtracts the matching tuples from relation R.",
      inputOperand: `Relation ${targetTbl}`,
      inputExplanation: `Table with all pre-deletion tuples.`,
      outputResult: `Relation ${targetTbl}'`,
      outputExplanation: `Relation with deleted tuples permanently purged.`,
      formalDefinition: "R' = R ∖ σ_P(R) = { t ∈ R | P(t) = false }",
      mathematicalRole:
        "Mathematically removes all tuples satisfying predicate P from relation R via set difference.",
    });
  } else if (command === "CREATE TABLE") {
    formula = `Catalog ← Catalog ∪ { RelationDescriptor(${targetTbl}) }`;
    asciiFormula = `Catalog <- Catalog UNION { RelationDescriptor(${targetTbl}) }`;
    latexFormula = `\\text{Catalog} \\leftarrow \\text{Catalog} \\cup \\{ \\text{RelationDescriptor}(${targetTbl}) \\}`;

    components.push({
      symbol: "∪",
      name: "Data Dictionary Catalog Registration",
      category: "Data Dictionary Catalog Operation",
      subscript: `RelationDescriptor(${targetTbl})`,
      subscriptExplanation: `Metadata definition specifying column names, data domains, and integrity constraints.`,
      inputOperand: "System Catalog (Data Dictionary)",
      inputExplanation: "Existing database schemas and relation catalog.",
      outputResult: "Catalog'",
      outputExplanation: `Updated catalog containing new relation descriptor for "${targetTbl}".`,
      formalDefinition: "Catalog ← Catalog ∪ { (T, { (c_i, type_i, pk_i, fk_i) }) }",
      mathematicalRole: "Allocates metadata schema entries for a new relation.",
    });
  } else if (command === "DROP TABLE") {
    formula = `Catalog ← Catalog ∖ { RelationDescriptor(${targetTbl}) }`;
    asciiFormula = `Catalog <- Catalog - { RelationDescriptor(${targetTbl}) }`;
    latexFormula = `\\text{Catalog} \\leftarrow \\text{Catalog} \\setminus \\{ \\text{RelationDescriptor}(${targetTbl}) \\}`;

    components.push({
      symbol: "∖",
      name: "Catalog Deallocation",
      category: "Data Dictionary Catalog Operation",
      subscript: `RelationDescriptor(${targetTbl})`,
      subscriptExplanation: `Removes relation metadata and deallocates storage extents.`,
      inputOperand: "System Catalog",
      inputExplanation: "Catalog containing active relation descriptor.",
      outputResult: "Catalog'",
      outputExplanation: `Catalog without relation "${targetTbl}".`,
      formalDefinition: "Catalog ← Catalog ∖ { RelationDescriptor(T) }",
      mathematicalRole: "Purges schema metadata and invalidates foreign key references.",
    });
  } else if (command === "TRUNCATE") {
    formula = `${targetTbl} ← ∅`;
    asciiFormula = `${targetTbl} <- EMPTY_SET`;
    latexFormula = `\\text{${targetTbl}} \\leftarrow \\emptyset`;

    components.push({
      symbol: "∅",
      name: "Empty Set Assignment (Fast Deallocation)",
      category: "Set-Theoretic Mutation",
      subscript: "Reset High-Water Mark",
      subscriptExplanation: "Deallocates all row pages in relation R, preserving schema definition.",
      inputOperand: `Relation ${targetTbl}`,
      inputExplanation: "Relation containing existing tuples.",
      outputResult: `Relation ${targetTbl}' (0 rows)`,
      outputExplanation: "Empty relation with 0 tuples.",
      formalDefinition: "R ← ∅",
      mathematicalRole: "Fast truncation of relation R back to the empty set ∅.",
    });
  } else if (command === "CREATE DATABASE") {
    const dbName = extractDatabaseNameFromSql(sql) || "database";
    formula = `Catalog ← Catalog ∪ { DatabaseDescriptor(${dbName}) }`;
    asciiFormula = `Catalog <- Catalog UNION { DatabaseDescriptor(${dbName}) }`;
    latexFormula = `\\text{Catalog} \\leftarrow \\text{Catalog} \\cup \\{ \\text{DatabaseDescriptor}(${dbName}) \\}`;

    components.push({
      symbol: "∪",
      name: "Database Catalog Allocation",
      category: "Data Dictionary Catalog Operation",
      subscript: `DatabaseDescriptor(${dbName})`,
      subscriptExplanation: `Creates an isolated relational namespace "${dbName}".`,
      inputOperand: "System Catalog",
      inputExplanation: "Current collection of database relation namespaces.",
      outputResult: "Catalog'",
      outputExplanation: `Catalog with new database namespace "${dbName}".`,
      formalDefinition: "Catalog ← Catalog ∪ { Namespace(D) }",
      mathematicalRole: "Allocates a new relational database space.",
    });
  } else {
    formula = `Op ← eval(${command})`;
    asciiFormula = `Op <- eval(${command})`;
    latexFormula = `\\text{Op} \\leftarrow \\text{eval}(${command})`;

    components.push({
      symbol: "Op",
      name: `${command} Operation`,
      category: "Data Dictionary Catalog Operation",
      subscript: command,
      subscriptExplanation: `Executes ${command} on database catalog.`,
      inputOperand: "Database Storage Engine",
      inputExplanation: "Active schema buffer.",
      outputResult: "Updated Schema",
      outputExplanation: "Modified database relation.",
      formalDefinition: "State' ← Transition(State, Op)",
      mathematicalRole: "Executes state transition on relation.",
    });
  }

  evalPipeline.push({
    step: 1,
    stage: command,
    operator: command,
    expression: formula,
    description: `Execute ${command} statement per relational algebra semantics.`,
  });

  return {
    formula,
    asciiFormula,
    latexFormula,
    components,
    evaluationPipeline: evalPipeline,
    summary: `Relational algebra mutation formula: ${formula}. Modifies database relation state as per first-order relational theory.`,
  };
}

/**
 * Helper to get a specific step's Relational Algebra details.
 */
export function getAlgebraPartForStage(
  stage: string,
  stepTitle: string,
  stepDetail: string,
  rowCount: number,
  columns: string[] = [],
  command?: string,
): RelationalAlgebraPart {
  switch (stage) {
    case "FROM": {
      const tbl = stepTitle.replace(/^(?:FROM|Scan)\s+/i, "").trim() || "Relation";
      return {
        symbol: "Scan",
        name: "Relation Table Scan",
        category: "Unary Filter (Horizontal Selection)",
        subscript: tbl,
        subscriptExplanation: `Locates relation "${tbl}" in the buffer pool and reads candidate tuples.`,
        inputOperand: `Table on Storage Pages: ${tbl}`,
        inputExplanation: `Stored heap pages containing relational records.`,
        outputResult: `R₁ (${tbl})`,
        outputExplanation: `Working memory buffer containing ${rowCount} initial tuples.`,
        formalDefinition: "R = { t | t is a stored tuple in relation T }",
        mathematicalRole: "Provides base working relation R for subsequent relational algebra operators.",
      };
    }
    case "JOIN": {
      const match = stepTitle.match(/JOIN\s+([^\s(]+)(?:\s+ON\s+(.+))?/i) ||
        stepDetail.match(/join(?:ed)?\s+([^\s(]+)(?:\s+on\s+(.+))?/i);
      const joinedTable = match ? match[1] : "S";
      const condition = (match && match[2] ? match[2].trim() : "") || "θ";
      return {
        symbol: "⋈",
        name: "Theta Join",
        category: "Binary Relation Operator (Join / Product)",
        subscript: condition,
        subscriptExplanation: `Join condition "${condition}" connects foreign key attributes to primary key attributes.`,
        inputOperand: `R_left and ${joinedTable}`,
        inputExplanation: `Two relations evaluated for attribute matching.`,
        outputResult: `R ⋈_{${condition}} ${joinedTable}`,
        outputExplanation: `Composite relation containing ${rowCount} joined tuples.`,
        formalDefinition: "R ⋈_θ S = σ_θ(R × S)",
        mathematicalRole: "Horizontal selection over Cartesian Product of two relations.",
        optimizationRule: "Commutative: R ⋈ S ≡ S ⋈ R. Associative: (R ⋈ S) ⋈ T ≡ R ⋈ (S ⋈ T).",
      };
    }
    case "WHERE": {
      const cond = stepTitle.replace(/^WHERE\s+/i, "").trim() || "Predicate";
      return {
        symbol: "σ",
        name: "Selection Operator",
        category: "Unary Filter (Horizontal Selection)",
        subscript: cond,
        subscriptExplanation: `Propositional predicate condition "${cond}" tested per tuple.`,
        inputOperand: "Working Relation R",
        inputExplanation: "Candidate tuples before applying filter.",
        outputResult: `σ_{${cond}}(R)`,
        outputExplanation: `Filtered subset of tuples evaluating to TRUE (${rowCount} rows survive).`,
        formalDefinition: "σ_P(R) = { t ∈ R | P(t) = true }",
        mathematicalRole: "Horizontal filter: reduces cardinality without altering schema degree.",
        optimizationRule: "Predicate Pushdown: σ_P(R ⋈ S) ≡ (σ_P R) ⋈ S when P references only R.",
      };
    }
    case "GROUP BY": {
      const grp = stepTitle.replace(/^GROUP BY\s+/i, "").trim() || "keys";
      return {
        symbol: "γ",
        name: "Grouping & Aggregation",
        category: "Aggregation & Group Partitioning",
        subscript: grp,
        subscriptExplanation: `Partition keys [${grp}] group identical values into summary buckets.`,
        inputOperand: "Candidate Tuples",
        inputExplanation: "Filtered relation partitioned into equivalence classes.",
        outputResult: `γ_{${grp}}(R)`,
        outputExplanation: `Summary relation with ${rowCount} distinct group rows.`,
        formalDefinition: "γ_{G; F}(R) = { (g, F(t)) | g ∈ π_G(R) }",
        mathematicalRole: "Partitions relation into groups and calculates aggregate metrics.",
      };
    }
    case "HAVING": {
      const cond = stepTitle.replace(/^HAVING\s+/i, "").trim() || "aggregate_cond";
      return {
        symbol: "σ",
        name: "Group Filter (HAVING)",
        category: "Unary Filter (Horizontal Selection)",
        subscript: cond,
        subscriptExplanation: `Group filter "${cond}" evaluated on computed aggregates.`,
        inputOperand: "Aggregated Groups γ(R)",
        inputExplanation: "Group rows produced by γ operator.",
        outputResult: `σ_{${cond}}(γ(R))`,
        outputExplanation: `Remaining group rows satisfying aggregate condition (${rowCount} groups).`,
        formalDefinition: "σ_{P_group}(γ(R)) = { g ∈ γ(R) | P_group(g) = true }",
        mathematicalRole: "Selection operator applied after aggregate reduction.",
      };
    }
    case "DISTINCT": {
      return {
        symbol: "δ",
        name: "Duplicate Elimination",
        category: "Unary Transformation (Vertical Projection)",
        subscript: "Unique(R)",
        subscriptExplanation: "Removes duplicate tuples so each row is represented exactly once.",
        inputOperand: "Multiset Bag R",
        inputExplanation: "Relation with potential duplicate rows.",
        outputResult: `δ(R)`,
        outputExplanation: `Strict mathematical set of ${rowCount} unique tuples.`,
        formalDefinition: "δ(R) = { t | t ∈ R }",
        mathematicalRole: "Enforces relational set semantics by discarding duplicate records.",
      };
    }
    case "ORDER BY": {
      const sortKey = stepTitle.replace(/^ORDER BY\s+/i, "").trim() || "sort_keys";
      return {
        symbol: "τ",
        name: "Sorting Operator",
        category: "Ordering & Cardinality Restriction",
        subscript: sortKey,
        subscriptExplanation: `Sorting criteria "${sortKey}" defines total ordering order.`,
        inputOperand: "Unordered Relation R",
        inputExplanation: "Result tuples before sorting.",
        outputResult: `τ_{${sortKey}}(R)`,
        outputExplanation: `Sorted tuple sequence of ${rowCount} rows.`,
        formalDefinition: "τ_K(R) = [ t_1, …, t_n | K(t_i) ≤ K(t_{i+1}) ]",
        mathematicalRole: "Applies ordering to relation (extended relational algebra).",
      };
    }
    case "LIMIT": {
      const num = stepTitle.replace(/^LIMIT\s+/i, "").trim() || "N";
      return {
        symbol: "λ",
        name: "Limit / Restriction",
        category: "Ordering & Cardinality Restriction",
        subscript: `n = ${num}`,
        subscriptExplanation: `Truncation limit of ${num} rows.`,
        inputOperand: "Candidate Tuples",
        inputExplanation: "Tuples prior to truncation.",
        outputResult: `λ_{${num}}(R)`,
        outputExplanation: `Top-${num} tuples (${rowCount} rows returned).`,
        formalDefinition: "λ_k(R) = [ t_1, …, t_m | m = min(k, |R|) ]",
        mathematicalRole: "Truncates relation cardinality to specified limit.",
      };
    }
    case "SELECT": {
      const cols = columns.length > 0 ? columns.join(", ") : "*";
      return {
        symbol: "π",
        name: "Projection Operator",
        category: "Unary Transformation (Vertical Projection)",
        subscript: cols,
        subscriptExplanation: `Keeps target columns [${cols}] and discards all other internal working columns.`,
        inputOperand: "Working Relation R",
        inputExplanation: "Intermediate relation with all evaluated attributes.",
        outputResult: `π_{${cols}}(R)`,
        outputExplanation: `Final projected matrix (${rowCount} rows × ${columns.length} columns).`,
        formalDefinition: "π_{A_1, …, A_k}(R) = { (t.A_1, …, t.A_k) | t ∈ R }",
        mathematicalRole: "Vertical subspace extraction: reduces relation degree without altering cardinality.",
        optimizationRule: "Projection Pushdown: Eliminates unnecessary columns early to reduce memory consumption.",
      };
    }
    case "MUTATION":
    case "SCHEMA": {
      return {
        symbol: "∪",
        name: "Mutation Operator",
        category: "Set-Theoretic Mutation",
        subscript: command || "DML/DDL",
        subscriptExplanation: `Applies state change to relation storage buffer.`,
        inputOperand: "Active Relation Storage",
        inputExplanation: "Database relation before execution.",
        outputResult: "Updated Relation R'",
        outputExplanation: `Relation with changes applied (${rowCount} rows affected).`,
        formalDefinition: "R' = Mutate(R, Op)",
        mathematicalRole: "State-transition operator updating catalog or tuple sets.",
      };
    }
    default: {
      return {
        symbol: "eval",
        name: `${stage} Stage`,
        category: "Data Dictionary Catalog Operation",
        subscript: stepTitle,
        subscriptExplanation: stepDetail,
        inputOperand: "Database Pipeline",
        inputExplanation: "Execution state.",
        outputResult: `Stage Result (${rowCount} rows)`,
        outputExplanation: stepDetail,
        formalDefinition: "Pipeline(State) → State'",
        mathematicalRole: "Evaluates physical pipeline operator.",
      };
    }
  }
}

// ── Extraction Helper Utilities ─────────────────────────────────────────────

function extractTableNameFromSql(sql: string): string | null {
  const match = sql.match(/\bFROM\s+([a-zA-Z0-9_]+)/i) ||
    sql.match(/\bINTO\s+([a-zA-Z0-9_]+)/i) ||
    sql.match(/\bUPDATE\s+([a-zA-Z0-9_]+)/i) ||
    sql.match(/\bTABLE\s+([a-zA-Z0-9_]+)/i) ||
    sql.match(/\bDATABASE\s+([a-zA-Z0-9_]+)/i);
  return match ? match[1].toLowerCase() : null;
}

function extractDatabaseNameFromSql(sql: string): string | null {
  const match = sql.match(/\b(?:DATABASE|SCHEMA)\s+(?:IF\s+NOT\s+EXISTS\s+)?([a-zA-Z0-9_]+)/i);
  return match ? match[1].toLowerCase() : null;
}

function extractWhereConditionFromSql(sql: string): string | null {
  const match = sql.match(/\bWHERE\s+(.+?)(?:\s+GROUP\s+BY\b|\s+ORDER\s+BY\b|\s+LIMIT\b|;|$)/i);
  return match ? match[1].trim() : null;
}

function extractGroupByFromSql(sql: string): string | null {
  const match = sql.match(/\bGROUP\s+BY\s+(.+?)(?:\s+HAVING\b|\s+ORDER\s+BY\b|\s+LIMIT\b|;|$)/i);
  return match ? match[1].trim() : null;
}

function extractHavingFromSql(sql: string): string | null {
  const match = sql.match(/\bHAVING\s+(.+?)(?:\s+ORDER\s+BY\b|\s+LIMIT\b|;|$)/i);
  return match ? match[1].trim() : null;
}

function extractOrderByFromSql(sql: string): string | null {
  const match = sql.match(/\bORDER\s+BY\s+(.+?)(?:\s+LIMIT\b|;|$)/i);
  return match ? match[1].trim() : null;
}

function extractLimitFromSql(sql: string): string | null {
  const match = sql.match(/\bLIMIT\s+(\d+)/i);
  return match ? match[1] : null;
}

function extractSelectColumnsFromSql(sql: string): string[] {
  const match = sql.match(/\bSELECT\s+(?:DISTINCT\s+)?(.+?)\s+FROM\b/i);
  if (!match) return [];
  return match[1].split(",").map((s) => s.trim());
}

function extractAggregatesFromSql(sql: string): string | null {
  const matches = sql.match(/\b(COUNT|SUM|AVG|MIN|MAX)\s*\([^)]*\)/gi);
  return matches ? matches.join(", ") : null;
}

function extractJoinConditionFromSql(sql: string): string | null {
  const match = sql.match(/\bON\s+(.+?)(?:\s+WHERE\b|\s+GROUP\s+BY\b|\s+ORDER\s+BY\b|\s+LIMIT\b|;|$)/i);
  return match ? match[1].trim() : null;
}

function extractJoinConditionFromDetail(detail: string): string | null {
  const match = detail.match(/on\s+[`"']?([a-zA-Z0-9_.]+\s*=\s*[a-zA-Z0-9_.]+)[`"']?/i);
  return match ? match[1] : null;
}

function escapeLatex(s: string): string {
  return s
    .replace(/_/g, "\\_")
    .replace(/%/g, "\\%")
    .replace(/&/g, "\\&");
}
