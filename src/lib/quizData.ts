// src/lib/quizData.ts
// Comprehensive Quiz Question Bank for SQL and PL/SQL

export interface QuizQuestion {
  id: string;
  mode: "sql" | "plsql";
  topic: string;
  difficulty: "Easy" | "Medium" | "Hard";
  type: "mcq" | "script";
  question: string;
  codeSnippet?: string;
  options?: string[];
  correctAnswer?: number; // 0-based index for MCQ
  starterCode?: string;
  expectedScript?: string;
  validationKeywords?: string[];
  validationRegex?: string;
  explanation: string;
  hint?: string;
}

export const SQL_TOPICS = [
  "All Topics",
  "DQL Fundamentals & SELECT",
  "Filtering & WHERE Clause",
  "Sorting & Limiting (ORDER BY / LIMIT)",
  "Aggregations & GROUP BY",
  "Table Joins (INNER, LEFT, RIGHT, FULL)",
  "Subqueries & Nested Queries",
  "Set Operations (UNION, INTERSECT, EXCEPT)",
  "DML Statements (INSERT, UPDATE, DELETE)",
  "DDL Schema & Constraints",
  "Window Functions & Advanced SQL"
] as const;

export const PLSQL_TOPICS = [
  "All Topics",
  "Block Architecture & Execution",
  "Variables, Constants & Data Types",
  "Control Structures (IF-THEN, CASE)",
  "Loops & Iteration (FOR, WHILE, LOOP)",
  "Cursors & Cursor Attributes",
  "Stored Procedures & Functions",
  "Database Triggers",
  "Exception Handling & Error Trapping",
  "Records & Collections",
  "Packages & Dynamic SQL"
] as const;

export const SQL_QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    "id": "sql-001",
    "mode": "sql",
    "topic": "DQL Fundamentals & SELECT",
    "difficulty": "Easy",
    "type": "mcq",
    "question": "Which SQL clause is used to extract unique values from a column, eliminating duplicate rows?",
    "options": [
      "UNIQUE",
      "DISTINCT",
      "DIFFERENT",
      "ISOLATE"
    ],
    "correctAnswer": 1,
    "explanation": "The DISTINCT keyword is placed immediately after SELECT (e.g., SELECT DISTINCT city FROM customers) to filter out duplicate rows in the result set.",
    "hint": "It starts with D and specifies distinct entries."
  },
  {
    "id": "sql-002",
    "mode": "sql",
    "topic": "DQL Fundamentals & SELECT",
    "difficulty": "Easy",
    "type": "mcq",
    "question": "What is the wildcard character used in the SELECT clause to retrieve every column from a table?",
    "options": [
      "%",
      "*",
      "#",
      "&"
    ],
    "correctAnswer": 1,
    "explanation": "The asterisk (*) symbol instructs the SQL query engine to project all columns defined in the table's schema.",
    "hint": "It is often referred to as 'star' in SELECT star FROM table."
  },
  {
    "id": "sql-003",
    "mode": "sql",
    "topic": "DQL Fundamentals & SELECT",
    "difficulty": "Easy",
    "type": "mcq",
    "question": "Which keyword is used to provide a temporary, readable alias for a column or table in a SELECT query?",
    "options": [
      "AS",
      "ALIAS",
      "NAME",
      "WITH"
    ],
    "correctAnswer": 0,
    "explanation": "The AS keyword creates an alias (e.g., SELECT first_name AS fname), though in many SQL dialects it is optional.",
    "hint": "Two-letter keyword meaning 'in the role of'."
  },
  {
    "id": "sql-004",
    "mode": "sql",
    "topic": "DQL Fundamentals & SELECT",
    "difficulty": "Medium",
    "type": "mcq",
    "question": "In what logical order does the database engine evaluate SQL clauses during query execution?",
    "options": [
      "SELECT -> FROM -> WHERE -> GROUP BY",
      "FROM -> WHERE -> GROUP BY -> HAVING -> SELECT -> ORDER BY",
      "WHERE -> FROM -> SELECT -> HAVING",
      "SELECT -> ORDER BY -> FROM -> WHERE"
    ],
    "correctAnswer": 1,
    "explanation": "The relational engine first locates the data source (FROM), filters rows (WHERE), aggregates groups (GROUP BY / HAVING), projects attributes (SELECT), and finally sorts (ORDER BY).",
    "hint": "The FROM clause must identify tables before any filtering or selecting can happen."
  },
  {
    "id": "sql-005",
    "mode": "sql",
    "topic": "DQL Fundamentals & SELECT",
    "difficulty": "Medium",
    "type": "mcq",
    "question": "What will be the result of evaluating: SELECT 10 + NULL; in standard SQL?",
    "options": [
      "10",
      "0",
      "NULL",
      "Throws a syntax error"
    ],
    "correctAnswer": 2,
    "explanation": "In three-valued SQL logic, any arithmetic operation involving NULL results in NULL because NULL represents an unknown value.",
    "hint": "Operating on an unknown quantity yields an unknown."
  },
  {
    "id": "sql-006",
    "mode": "sql",
    "topic": "DQL Fundamentals & SELECT",
    "difficulty": "Medium",
    "type": "mcq",
    "question": "When selecting columns with arithmetic expressions, what function safely replaces a NULL value with a fallback default across ANSI SQL engines?",
    "options": [
      "IFNULL()",
      "COALESCE()",
      "NVL()",
      "ISNULL()"
    ],
    "correctAnswer": 1,
    "explanation": "COALESCE(val1, val2, ...) is standard ANSI SQL supported by all major relational database engines (PostgreSQL, Oracle, MySQL, SQL Server, SQLite).",
    "hint": "It takes arbitrary arguments and returns the first non-null."
  },
  {
    "id": "sql-007",
    "mode": "sql",
    "topic": "DQL Fundamentals & SELECT",
    "difficulty": "Easy",
    "type": "script",
    "question": "Write a SQL query to select the `name` and `city` columns from the `customers` table.",
    "starterCode": "-- Write your query here:\nSELECT ",
    "expectedScript": "SELECT name, city FROM customers;",
    "validationKeywords": [
      "SELECT",
      "name",
      "city",
      "FROM",
      "customers"
    ],
    "validationRegex": "SELECT\\s+(?:customers\\.)?name\\s*,\\s*(?:customers\\.)?city\\s+FROM\\s+customers",
    "explanation": "The query uses standard projection: SELECT specifies the columns, and FROM identifies the source table.",
    "hint": "Syntax: SELECT column1, column2 FROM tablename;"
  },
  {
    "id": "sql-008",
    "mode": "sql",
    "topic": "DQL Fundamentals & SELECT",
    "difficulty": "Easy",
    "type": "script",
    "question": "Write a SQL query to fetch all unique `category` values from the `products` table.",
    "starterCode": "-- Select distinct categories\n",
    "expectedScript": "SELECT DISTINCT category FROM products;",
    "validationKeywords": [
      "SELECT",
      "DISTINCT",
      "category",
      "FROM",
      "products"
    ],
    "validationRegex": "SELECT\\s+DISTINCT\\s+(?:products\\.)?category\\s+FROM\\s+products",
    "explanation": "DISTINCT prevents duplicate categories from showing more than once in the output.",
    "hint": "Use SELECT DISTINCT followed by the column name."
  },
  {
    "id": "sql-009",
    "mode": "sql",
    "topic": "DQL Fundamentals & SELECT",
    "difficulty": "Medium",
    "type": "script",
    "question": "Write a query to calculate `price * stock` as `total_value` along with `product_name` from the `inventory` table.",
    "starterCode": "-- Calculate total value per product\n",
    "expectedScript": "SELECT product_name, price * stock AS total_value FROM inventory;",
    "validationKeywords": [
      "SELECT",
      "product_name",
      "price",
      "*",
      "stock",
      "AS",
      "total_value",
      "FROM",
      "inventory"
    ],
    "validationRegex": "SELECT\\s+.*price\\s*\\*\\s*stock.*AS\\s+total_value.*FROM\\s+inventory",
    "explanation": "Calculated expressions can be projected in SELECT and named using an alias (AS total_value).",
    "hint": "Multiply price by stock and alias it with AS total_value."
  },
  {
    "id": "sql-010",
    "mode": "sql",
    "topic": "DQL Fundamentals & SELECT",
    "difficulty": "Medium",
    "type": "script",
    "question": "Write a query selecting `id`, `name`, and using `CASE` to classify `salary` as 'High' if >= 80000, else 'Standard', aliasing the column as `salary_tier` from `employees`.",
    "starterCode": "-- Use CASE WHEN conditional expression\nSELECT id, name,\n",
    "expectedScript": "SELECT id, name, CASE WHEN salary >= 80000 THEN 'High' ELSE 'Standard' END AS salary_tier FROM employees;",
    "validationKeywords": [
      "SELECT",
      "id",
      "name",
      "CASE",
      "WHEN",
      "salary",
      ">=",
      "80000",
      "THEN",
      "'High'",
      "ELSE",
      "'Standard'",
      "END",
      "AS",
      "salary_tier",
      "FROM",
      "employees"
    ],
    "validationRegex": "CASE\\s+WHEN\\s+salary\\s*>=\\s*80000\\s+THEN\\s+'High'\\s+ELSE\\s+'Standard'\\s+END\\s+(?:AS\\s+)?salary_tier",
    "explanation": "CASE expressions allow conditional inline values within SQL projections.",
    "hint": "Use CASE WHEN ... THEN ... ELSE ... END AS salary_tier."
  },
  {
    "id": "sql-011",
    "mode": "sql",
    "topic": "Filtering & WHERE Clause",
    "difficulty": "Easy",
    "type": "mcq",
    "question": "Which operator is used to test whether a column has no stored value (is missing)?",
    "options": [
      "= NULL",
      "IS NULL",
      "== NULL",
      "EQUALS NULL"
    ],
    "correctAnswer": 1,
    "explanation": "In SQL, NULL represents an unknown value, so standard equality (=) cannot be used. You must use 'IS NULL' or 'IS NOT NULL'.",
    "hint": "Equality (=) never matches NULL; you need the IS operator."
  },
  {
    "id": "sql-012",
    "mode": "sql",
    "topic": "Filtering & WHERE Clause",
    "difficulty": "Easy",
    "type": "mcq",
    "question": "In a LIKE pattern, which wildcard matches exactly one character?",
    "options": [
      "%",
      "_",
      "*",
      "?"
    ],
    "correctAnswer": 1,
    "explanation": "The underscore (_) matches exactly one single character, whereas the percent (%) sign matches zero or more characters.",
    "hint": "An underscore represents a single placeholder."
  },
  {
    "id": "sql-013",
    "mode": "sql",
    "topic": "Filtering & WHERE Clause",
    "difficulty": "Medium",
    "type": "mcq",
    "question": "Is the BETWEEN operator inclusive or exclusive of its boundary values in standard SQL?",
    "options": [
      "Exclusive of both ends",
      "Inclusive of both lower and upper boundaries",
      "Inclusive of lower, exclusive of upper",
      "Depends on the column datatype"
    ],
    "correctAnswer": 1,
    "explanation": "WHERE x BETWEEN a AND b is shorthand for x >= a AND x <= b, making it inclusive of both boundaries.",
    "hint": "Both boundary points are included in the search range."
  },
  {
    "id": "sql-014",
    "mode": "sql",
    "topic": "Filtering & WHERE Clause",
    "difficulty": "Medium",
    "type": "mcq",
    "question": "Which logical operator has the highest precedence if parentheses are omitted in a WHERE clause?",
    "options": [
      "OR",
      "AND",
      "NOT",
      "They have equal precedence"
    ],
    "correctAnswer": 2,
    "explanation": "Precedence is NOT (highest), followed by AND, followed by OR (lowest). Always use parentheses to ensure correct precedence.",
    "hint": "Unary negation binds tighter than binary conjunctions."
  },
  {
    "id": "sql-015",
    "mode": "sql",
    "topic": "Filtering & WHERE Clause",
    "difficulty": "Medium",
    "type": "mcq",
    "question": "What is the result of WHERE val NOT IN (1, 2, NULL) when evaluated against a row with val = 3?",
    "options": [
      "TRUE (the row matches)",
      "FALSE (the row is skipped)",
      "UNKNOWN (treated as false, row skipped)",
      "Throws runtime exception"
    ],
    "correctAnswer": 2,
    "explanation": "val NOT IN (...) expands to (val != 1 AND val != 2 AND val != NULL). Because 3 != NULL is UNKNOWN, the entire conjunction becomes UNKNOWN, filtering out the row.",
    "hint": "Any comparison with NULL produces UNKNOWN, and in WHERE clauses UNKNOWN behaves like false."
  },
  {
    "id": "sql-016",
    "mode": "sql",
    "topic": "Filtering & WHERE Clause",
    "difficulty": "Medium",
    "type": "mcq",
    "question": "Which SQL operator checks if a column value matches any item in a comma-separated list or subquery?",
    "options": [
      "IN",
      "CONTAINS",
      "MATCH",
      "EXISTS"
    ],
    "correctAnswer": 0,
    "explanation": "The IN operator specifies multiple possible discrete values in a WHERE clause, e.g. WHERE country IN ('US', 'UK', 'CA').",
    "hint": "Short two-letter keyword."
  },
  {
    "id": "sql-017",
    "mode": "sql",
    "topic": "Filtering & WHERE Clause",
    "difficulty": "Easy",
    "type": "script",
    "question": "Write a SQL query to select all columns from `employees` where `department` is 'Engineering' and `salary` is greater than 60000.",
    "starterCode": "-- Filter employees by department and salary\n",
    "expectedScript": "SELECT * FROM employees WHERE department = 'Engineering' AND salary > 60000;",
    "validationKeywords": [
      "SELECT",
      "*",
      "FROM",
      "employees",
      "WHERE",
      "department",
      "'Engineering'",
      "AND",
      "salary",
      ">",
      "60000"
    ],
    "validationRegex": "WHERE\\s+.*department\\s*=\\s*'Engineering'\\s+AND\\s+salary\\s*>\\s*60000",
    "explanation": "The WHERE clause combines the equality condition and the comparison operator using the boolean operator AND.",
    "hint": "WHERE department = 'Engineering' AND salary > 60000"
  },
  {
    "id": "sql-018",
    "mode": "sql",
    "topic": "Filtering & WHERE Clause",
    "difficulty": "Easy",
    "type": "script",
    "question": "Write a query to find all `customers` whose `name` starts with the letter 'J'.",
    "starterCode": "-- Use LIKE with wildcard\n",
    "expectedScript": "SELECT * FROM customers WHERE name LIKE 'J%';",
    "validationKeywords": [
      "SELECT",
      "FROM",
      "customers",
      "WHERE",
      "name",
      "LIKE",
      "'J%'"
    ],
    "validationRegex": "WHERE\\s+name\\s+LIKE\\s+'J%'",
    "explanation": "'J%' matches any string beginning with uppercase 'J' followed by any sequence of characters.",
    "hint": "Use LIKE 'J%'"
  },
  {
    "id": "sql-019",
    "mode": "sql",
    "topic": "Filtering & WHERE Clause",
    "difficulty": "Medium",
    "type": "script",
    "question": "Write a query to select `title`, `price` from `books` where `price` is between 15 and 45 and `genre` is in ('Fiction', 'History').",
    "starterCode": "-- Combine BETWEEN and IN\n",
    "expectedScript": "SELECT title, price FROM books WHERE price BETWEEN 15 AND 45 AND genre IN ('Fiction', 'History');",
    "validationKeywords": [
      "SELECT",
      "title",
      "price",
      "FROM",
      "books",
      "WHERE",
      "BETWEEN",
      "15",
      "AND",
      "45",
      "genre",
      "IN",
      "'Fiction'",
      "'History'"
    ],
    "validationRegex": "WHERE\\s+price\\s+BETWEEN\\s+15\\s+AND\\s+45\\s+AND\\s+genre\\s+IN\\s*\\(\\s*'Fiction'\\s*,\\s*'History'\\s*\\)",
    "explanation": "BETWEEN provides range testing and IN checks membership in a list of string literals.",
    "hint": "WHERE price BETWEEN 15 AND 45 AND genre IN ('Fiction', 'History')"
  },
  {
    "id": "sql-020",
    "mode": "sql",
    "topic": "Filtering & WHERE Clause",
    "difficulty": "Medium",
    "type": "script",
    "question": "Write a query to select all `orders` where `shipped_date` IS NULL or `status` is 'pending', but only if `total_amount` is greater than 100.",
    "starterCode": "-- Mind operator precedence with parentheses\n",
    "expectedScript": "SELECT * FROM orders WHERE (shipped_date IS NULL OR status = 'pending') AND total_amount > 100;",
    "validationKeywords": [
      "SELECT",
      "FROM",
      "orders",
      "WHERE",
      "shipped_date",
      "IS",
      "NULL",
      "OR",
      "status",
      "'pending'",
      "total_amount",
      ">",
      "100"
    ],
    "validationRegex": "WHERE\\s*\\(?\\s*shipped_date\\s+IS\\s+NULL\\s+OR\\s+status\\s*=\\s*'pending'\\s*\\)?\\s+AND\\s+total_amount\\s*>\\s*100",
    "explanation": "Parentheses are mandatory around the OR predicate so the AND total_amount > 100 applies to both alternatives.",
    "hint": "Wrap the OR conditions in parentheses: (shipped_date IS NULL OR status = 'pending') AND total_amount > 100"
  },
  {
    "id": "sql-021",
    "mode": "sql",
    "topic": "Sorting & Limiting (ORDER BY / LIMIT)",
    "difficulty": "Easy",
    "type": "mcq",
    "question": "What is the default sort order when ORDER BY is specified without ASC or DESC?",
    "options": [
      "Ascending (ASC)",
      "Descending (DESC)",
      "Database insertion order",
      "Random"
    ],
    "correctAnswer": 0,
    "explanation": "ORDER BY defaults to ASC (ascending order, from smallest to largest or A to Z).",
    "hint": "Numbers go 1 to 10 by default."
  },
  {
    "id": "sql-022",
    "mode": "sql",
    "topic": "Sorting & Limiting (ORDER BY / LIMIT)",
    "difficulty": "Easy",
    "type": "mcq",
    "question": "Which keyword skips a specified number of leading rows before returning the result set?",
    "options": [
      "SKIP",
      "OFFSET",
      "JUMP",
      "IGNORE"
    ],
    "correctAnswer": 1,
    "explanation": "OFFSET specifies the number of rows to skip before starting to return rows from the query.",
    "hint": "Commonly paired with LIMIT for pagination."
  },
  {
    "id": "sql-023",
    "mode": "sql",
    "topic": "Sorting & Limiting (ORDER BY / LIMIT)",
    "difficulty": "Medium",
    "type": "mcq",
    "question": "In standard SQL, where do NULL values appear by default in an ASCENDING sort?",
    "options": [
      "Always first or last depending on DBMS (ANSI defaults to LAST or FIRST with NULLS FIRST/LAST)",
      "They are automatically excluded",
      "They trigger a division by zero error",
      "They are converted to empty strings"
    ],
    "correctAnswer": 0,
    "explanation": "In PostgreSQL/Oracle, NULLS sort last in ASC by default, while in MySQL/SQLite they sort first. ANSI SQL allows 'NULLS FIRST' or 'NULLS LAST' to specify explicitly.",
    "hint": "DBMSs have specific conventions, controllable via NULLS FIRST or NULLS LAST."
  },
  {
    "id": "sql-024",
    "mode": "sql",
    "topic": "Sorting & Limiting (ORDER BY / LIMIT)",
    "difficulty": "Medium",
    "type": "mcq",
    "question": "Which ANSI SQL standard syntax is the equivalent of LIMIT 5 OFFSET 10?",
    "options": [
      "OFFSET 10 ROWS FETCH NEXT 5 ROWS ONLY",
      "TAKE 5 SKIP 10",
      "PAGE 2 SIZE 5",
      "SELECT TOP 5 AFTER 10"
    ],
    "correctAnswer": 0,
    "explanation": "The SQL:2008 standard introduced 'OFFSET n ROWS FETCH NEXT m ROWS ONLY' for portable pagination.",
    "hint": "Look for OFFSET ... ROWS FETCH NEXT ... ROWS ONLY."
  },
  {
    "id": "sql-025",
    "mode": "sql",
    "topic": "Sorting & Limiting (ORDER BY / LIMIT)",
    "difficulty": "Medium",
    "type": "mcq",
    "question": "Can you sort by a column that is not present in the SELECT list in an un-aggregated query?",
    "options": [
      "Yes, any column in the FROM table can be used in ORDER BY",
      "No, only columns in the SELECT clause are permitted",
      "Only if DISTINCT is also used",
      "Only in SQLite, but forbidden in ANSI SQL"
    ],
    "correctAnswer": 0,
    "explanation": "In standard queries without DISTINCT or GROUP BY, ORDER BY can reference any accessible column from the FROM tables.",
    "hint": "The engine accesses all table columns before projecting the final SELECT list."
  },
  {
    "id": "sql-026",
    "mode": "sql",
    "topic": "Sorting & Limiting (ORDER BY / LIMIT)",
    "difficulty": "Easy",
    "type": "mcq",
    "question": "How do you sort employees by department ascending, and then by salary descending within each department?",
    "options": [
      "ORDER BY department ASC, salary DESC",
      "ORDER BY department DESC, salary ASC",
      "SORT department, salary DESC",
      "ORDER department ASC THEN salary DESC"
    ],
    "correctAnswer": 0,
    "explanation": "Comma-separated column specifications in ORDER BY sort hierarchically from left to right.",
    "hint": "First column ASC, second column DESC separated by a comma."
  },
  {
    "id": "sql-027",
    "mode": "sql",
    "topic": "Sorting & Limiting (ORDER BY / LIMIT)",
    "difficulty": "Easy",
    "type": "script",
    "question": "Write a query to retrieve the top 5 highest-priced products from the `products` table, showing `name` and `price`.",
    "starterCode": "-- Top 5 products by price\n",
    "expectedScript": "SELECT name, price FROM products ORDER BY price DESC LIMIT 5;",
    "validationKeywords": [
      "SELECT",
      "name",
      "price",
      "FROM",
      "products",
      "ORDER",
      "BY",
      "price",
      "DESC",
      "LIMIT",
      "5"
    ],
    "validationRegex": "ORDER\\s+BY\\s+price\\s+DESC\\s+LIMIT\\s+5",
    "explanation": "Ordering by price DESC puts highest prices first, and LIMIT 5 caps the output to five rows.",
    "hint": "ORDER BY price DESC LIMIT 5"
  },
  {
    "id": "sql-028",
    "mode": "sql",
    "topic": "Sorting & Limiting (ORDER BY / LIMIT)",
    "difficulty": "Medium",
    "type": "script",
    "question": "Write a query to get page 3 of users (10 users per page) ordered by `created_at` ASC from the `users` table.",
    "starterCode": "-- Page 3 means skipping 20 rows and taking 10\n",
    "expectedScript": "SELECT * FROM users ORDER BY created_at ASC LIMIT 10 OFFSET 20;",
    "validationKeywords": [
      "SELECT",
      "FROM",
      "users",
      "ORDER",
      "BY",
      "created_at",
      "ASC",
      "LIMIT",
      "10",
      "OFFSET",
      "20"
    ],
    "validationRegex": "LIMIT\\s+10\\s+OFFSET\\s+20",
    "explanation": "Page 1 is OFFSET 0, Page 2 is OFFSET 10, Page 3 is OFFSET 20 with LIMIT 10.",
    "hint": "LIMIT 10 OFFSET 20"
  },
  {
    "id": "sql-029",
    "mode": "sql",
    "topic": "Sorting & Limiting (ORDER BY / LIMIT)",
    "difficulty": "Medium",
    "type": "script",
    "question": "Write a query to select `last_name`, `department`, `salary` from `staff` sorted by `department` ascending and `salary` descending.",
    "starterCode": "-- Multi-column ordering\n",
    "expectedScript": "SELECT last_name, department, salary FROM staff ORDER BY department ASC, salary DESC;",
    "validationKeywords": [
      "SELECT",
      "last_name",
      "department",
      "salary",
      "FROM",
      "staff",
      "ORDER",
      "BY",
      "department",
      "salary",
      "DESC"
    ],
    "validationRegex": "ORDER\\s+BY\\s+department\\s+(?:ASC\\s*,\\s*|,)salary\\s+DESC",
    "explanation": "Multiple sort keys are separated by commas, evaluated in order from left to right.",
    "hint": "ORDER BY department ASC, salary DESC"
  },
  {
    "id": "sql-030",
    "mode": "sql",
    "topic": "Sorting & Limiting (ORDER BY / LIMIT)",
    "difficulty": "Medium",
    "type": "script",
    "question": "Write a query to fetch the second highest salary from the `employees` table using ORDER BY, DISTINCT, and LIMIT/OFFSET.",
    "starterCode": "-- Second highest salary\n",
    "expectedScript": "SELECT DISTINCT salary FROM employees ORDER BY salary DESC LIMIT 1 OFFSET 1;",
    "validationKeywords": [
      "SELECT",
      "DISTINCT",
      "salary",
      "FROM",
      "employees",
      "ORDER",
      "BY",
      "salary",
      "DESC",
      "LIMIT",
      "1",
      "OFFSET",
      "1"
    ],
    "validationRegex": "SELECT\\s+DISTINCT\\s+salary\\s+FROM\\s+employees\\s+ORDER\\s+BY\\s+salary\\s+DESC\\s+LIMIT\\s+1\\s+OFFSET\\s+1",
    "explanation": "DISTINCT avoids duplicate top salaries, ORDER BY salary DESC sorts from highest down, and OFFSET 1 LIMIT 1 grabs the second row.",
    "hint": "SELECT DISTINCT salary FROM employees ORDER BY salary DESC LIMIT 1 OFFSET 1"
  },
  {
    "id": "sql-031",
    "mode": "sql",
    "topic": "Aggregations & GROUP BY",
    "difficulty": "Easy",
    "type": "mcq",
    "question": "What does COUNT(*) calculate compared to COUNT(column_name)?",
    "options": [
      "COUNT(*) counts all rows including NULLs; COUNT(col) excludes NULL values in that column",
      "They produce identical results always",
      "COUNT(*) only counts numeric columns",
      "COUNT(col) is faster because it does not read the entire row"
    ],
    "correctAnswer": 0,
    "explanation": "COUNT(*) counts total tuples regardless of NULLs. When a column is passed to COUNT(col), rows where that column contains NULL are excluded from the tally.",
    "hint": "COUNT(*) counts the rows themselves, whereas COUNT(col) ignores nulls."
  },
  {
    "id": "sql-032",
    "mode": "sql",
    "topic": "Aggregations & GROUP BY",
    "difficulty": "Easy",
    "type": "mcq",
    "question": "Which clause filters aggregated group results after grouping has taken place?",
    "options": [
      "WHERE",
      "HAVING",
      "GROUP FILTER",
      "QUALIFY"
    ],
    "correctAnswer": 1,
    "explanation": "WHERE filters rows before aggregation. HAVING filters groups after aggregation.",
    "hint": "Starts with H and filters groups."
  },
  {
    "id": "sql-033",
    "mode": "sql",
    "topic": "Aggregations & GROUP BY",
    "difficulty": "Medium",
    "type": "mcq",
    "question": "Why does the query: 'SELECT department, AVG(salary) FROM employees WHERE AVG(salary) > 50000 GROUP BY department;' fail?",
    "options": [
      "Aggregate functions are not permitted in the WHERE clause",
      "AVG() only works with integers",
      "GROUP BY must come before WHERE",
      "The salary column cannot be averaged"
    ],
    "correctAnswer": 0,
    "explanation": "The WHERE clause filters individual rows before groups are formed, so aggregates like AVG() must be placed in the HAVING clause.",
    "hint": "Aggregates belong in HAVING, not WHERE."
  },
  {
    "id": "sql-034",
    "mode": "sql",
    "topic": "Aggregations & GROUP BY",
    "difficulty": "Medium",
    "type": "mcq",
    "question": "What is the result of SUM(amount) on a table where all rows have NULL in the amount column?",
    "options": [
      "0",
      "NULL",
      "Error",
      "1"
    ],
    "correctAnswer": 1,
    "explanation": "Aggregate functions (except COUNT) return NULL when no non-NULL values are encountered.",
    "hint": "Sum of no valid values in SQL yields NULL, not 0."
  },
  {
    "id": "sql-035",
    "mode": "sql",
    "topic": "Aggregations & GROUP BY",
    "difficulty": "Medium",
    "type": "mcq",
    "question": "In a query with 'GROUP BY department, job_title', what can appear in the SELECT list according to ANSI SQL standard?",
    "options": [
      "Only department, job_title, and aggregate functions (unless functional dependencies apply)",
      "Any column from the employees table",
      "Only aggregate functions",
      "Only the first column specified in GROUP BY"
    ],
    "correctAnswer": 0,
    "explanation": "Every non-aggregated column in the SELECT list must appear in the GROUP BY clause (the Single-Value Rule).",
    "hint": "Non-aggregated columns must be part of the grouping key."
  },
  {
    "id": "sql-036",
    "mode": "sql",
    "topic": "Aggregations & GROUP BY",
    "difficulty": "Easy",
    "type": "mcq",
    "question": "Which aggregate function returns the count of distinct values in a column?",
    "options": [
      "COUNT(DISTINCT column)",
      "DISTINCT(COUNT(column))",
      "UNIQUE_COUNT(column)",
      "COUNT_UNIQUE(column)"
    ],
    "correctAnswer": 0,
    "explanation": "COUNT(DISTINCT column_name) evaluates and counts only unique, non-null values in that column.",
    "hint": "Place DISTINCT inside the COUNT parentheses."
  },
  {
    "id": "sql-037",
    "mode": "sql",
    "topic": "Aggregations & GROUP BY",
    "difficulty": "Easy",
    "type": "script",
    "question": "Write a query to find the total count of customers and average age from the `customers` table.",
    "starterCode": "-- Use COUNT and AVG\n",
    "expectedScript": "SELECT COUNT(*) AS total_customers, AVG(age) AS avg_age FROM customers;",
    "validationKeywords": [
      "SELECT",
      "COUNT",
      "AVG",
      "age",
      "FROM",
      "customers"
    ],
    "validationRegex": "SELECT\\s+COUNT\\(.*\\).*AVG\\(age\\).*FROM\\s+customers",
    "explanation": "COUNT(*) counts total records and AVG(age) computes the arithmetic mean of the age column.",
    "hint": "SELECT COUNT(*), AVG(age) FROM customers;"
  },
  {
    "id": "sql-038",
    "mode": "sql",
    "topic": "Aggregations & GROUP BY",
    "difficulty": "Medium",
    "type": "script",
    "question": "Write a query to display each `department` and its total salary expense (`SUM(salary)`) from `employees`, grouped by `department`.",
    "starterCode": "-- Group by department\n",
    "expectedScript": "SELECT department, SUM(salary) AS total_expense FROM employees GROUP BY department;",
    "validationKeywords": [
      "SELECT",
      "department",
      "SUM",
      "salary",
      "FROM",
      "employees",
      "GROUP",
      "BY",
      "department"
    ],
    "validationRegex": "SELECT\\s+.*department.*SUM\\(salary\\).*FROM\\s+employees\\s+GROUP\\s+BY\\s+department",
    "explanation": "GROUP BY department groups records by their department value so SUM(salary) computes sums per group.",
    "hint": "GROUP BY department"
  },
  {
    "id": "sql-039",
    "mode": "sql",
    "topic": "Aggregations & GROUP BY",
    "difficulty": "Medium",
    "type": "script",
    "question": "Write a query to find departments that have more than 5 employees using GROUP BY and HAVING.",
    "starterCode": "-- Filter groups with HAVING\n",
    "expectedScript": "SELECT department, COUNT(*) AS emp_count FROM employees GROUP BY department HAVING COUNT(*) > 5;",
    "validationKeywords": [
      "SELECT",
      "department",
      "COUNT",
      "FROM",
      "employees",
      "GROUP",
      "BY",
      "department",
      "HAVING",
      ">",
      "5"
    ],
    "validationRegex": "GROUP\\s+BY\\s+department\\s+HAVING\\s+COUNT\\(.*\\)\\s*>\\s*5",
    "explanation": "HAVING COUNT(*) > 5 eliminates departments that have 5 or fewer employees.",
    "hint": "GROUP BY department HAVING COUNT(*) > 5"
  },
  {
    "id": "sql-040",
    "mode": "sql",
    "topic": "Aggregations & GROUP BY",
    "difficulty": "Medium",
    "type": "script",
    "question": "Write a query to find the `customer_id` and total spent (`SUM(total_amount)`) for completed orders (`status = 'completed'`), only for customers whose total spent exceeds 500, ordered by total spent descending.",
    "starterCode": "-- Combine WHERE, GROUP BY, HAVING, and ORDER BY\n",
    "expectedScript": "SELECT customer_id, SUM(total_amount) AS total_spent FROM orders WHERE status = 'completed' GROUP BY customer_id HAVING SUM(total_amount) > 500 ORDER BY total_spent DESC;",
    "validationKeywords": [
      "SELECT",
      "customer_id",
      "SUM",
      "total_amount",
      "FROM",
      "orders",
      "WHERE",
      "status",
      "'completed'",
      "GROUP",
      "BY",
      "customer_id",
      "HAVING",
      "500",
      "ORDER",
      "BY"
    ],
    "validationRegex": "WHERE\\s+status\\s*=\\s*'completed'\\s+GROUP\\s+BY\\s+customer_id\\s+HAVING\\s+SUM\\(total_amount\\)\\s*>\\s*500",
    "explanation": "WHERE filters for completed orders before grouping; HAVING filters for totals > 500; ORDER BY sorts the aggregated totals.",
    "hint": "WHERE status = 'completed' GROUP BY customer_id HAVING SUM(total_amount) > 500 ORDER BY SUM(total_amount) DESC"
  },
  {
    "id": "sql-041",
    "mode": "sql",
    "topic": "Table Joins (INNER, LEFT, RIGHT, FULL)",
    "difficulty": "Easy",
    "type": "mcq",
    "question": "Which join returns only the rows that have matching values in both joined tables?",
    "options": [
      "LEFT JOIN",
      "INNER JOIN",
      "FULL OUTER JOIN",
      "CROSS JOIN"
    ],
    "correctAnswer": 1,
    "explanation": "An INNER JOIN selects records that have matching values in both tables based on the join predicate.",
    "hint": "It matches only the intersection between the two sets."
  },
  {
    "id": "sql-042",
    "mode": "sql",
    "topic": "Table Joins (INNER, LEFT, RIGHT, FULL)",
    "difficulty": "Easy",
    "type": "mcq",
    "question": "In a LEFT JOIN, what appears in the right table's columns when there is no matching row?",
    "options": [
      "0",
      "Empty string",
      "NULL",
      "An error occurs"
    ],
    "correctAnswer": 2,
    "explanation": "A LEFT OUTER JOIN preserves all rows from the left table; unmatched columns from the right table are padded with NULLs.",
    "hint": "Unmatched records are filled with SQL's missing-value marker."
  },
  {
    "id": "sql-043",
    "mode": "sql",
    "topic": "Table Joins (INNER, LEFT, RIGHT, FULL)",
    "difficulty": "Medium",
    "type": "mcq",
    "question": "What type of join produces a Cartesian product (every row of Table A paired with every row of Table B)?",
    "options": [
      "SELF JOIN",
      "CROSS JOIN",
      "NATURAL JOIN",
      "EQUI JOIN"
    ],
    "correctAnswer": 1,
    "explanation": "A CROSS JOIN combines every row from table 1 with every row from table 2 (producing M * N rows).",
    "hint": "Think of multiplying two tables together."
  },
  {
    "id": "sql-044",
    "mode": "sql",
    "topic": "Table Joins (INNER, LEFT, RIGHT, FULL)",
    "difficulty": "Medium",
    "type": "mcq",
    "question": "How do you identify customers who have NEVER placed an order using a LEFT JOIN?",
    "options": [
      "FROM customers c LEFT JOIN orders o ON c.id = o.customer_id WHERE o.id IS NULL",
      "FROM customers c LEFT JOIN orders o ON c.id = o.customer_id WHERE o.id = 0",
      "FROM customers c INNER JOIN orders o ON c.id = o.customer_id WHERE o.id IS NULL",
      "FROM customers c RIGHT JOIN orders o ON c.id = o.customer_id WHERE c.id IS NULL"
    ],
    "correctAnswer": 0,
    "explanation": "The anti-join pattern performs a LEFT JOIN and filters for rows where the right table's primary key IS NULL.",
    "hint": "Look for LEFT JOIN followed by WHERE right_table.id IS NULL."
  },
  {
    "id": "sql-045",
    "mode": "sql",
    "topic": "Table Joins (INNER, LEFT, RIGHT, FULL)",
    "difficulty": "Medium",
    "type": "mcq",
    "question": "What is the difference between filtering in the ON clause vs the WHERE clause for a LEFT JOIN?",
    "options": [
      "Filtering in ON applies during join formation (preserving left rows), while filtering in WHERE applies after the join (potentially turning it into an inner join)",
      "They are always identical in behavior",
      "ON can only compare columns; constants are prohibited",
      "WHERE executes before ON in all databases"
    ],
    "correctAnswer": 0,
    "explanation": "Conditions in the ON clause determine what gets joined from the right table, while WHERE filters the final combined rows (which discards NULLs if comparing right table columns).",
    "hint": "ON preserves outer rows; WHERE filters outer rows."
  },
  {
    "id": "sql-046",
    "mode": "sql",
    "topic": "Table Joins (INNER, LEFT, RIGHT, FULL)",
    "difficulty": "Medium",
    "type": "mcq",
    "question": "A table has 10 rows and another table has 5 rows. What is the maximum possible number of rows returned by an INNER JOIN?",
    "options": [
      "10",
      "15",
      "50",
      "5"
    ],
    "correctAnswer": 2,
    "explanation": "If all rows in both tables share the same join key value, each of the 10 rows matches all 5 rows, resulting in 10 * 5 = 50 rows.",
    "hint": "Consider what happens if every row has the exact same foreign key."
  },
  {
    "id": "sql-047",
    "mode": "sql",
    "topic": "Table Joins (INNER, LEFT, RIGHT, FULL)",
    "difficulty": "Easy",
    "type": "script",
    "question": "Write an INNER JOIN query to retrieve `orders.id`, `orders.order_date`, and `customers.name` joining `orders` and `customers` on `customer_id`.",
    "starterCode": "-- Inner join orders and customers\n",
    "expectedScript": "SELECT orders.id, orders.order_date, customers.name FROM orders INNER JOIN customers ON orders.customer_id = customers.id;",
    "validationKeywords": [
      "SELECT",
      "orders.id",
      "customers.name",
      "FROM",
      "orders",
      "JOIN",
      "customers",
      "ON",
      "customer_id"
    ],
    "validationRegex": "FROM\\s+orders\\s+(?:INNER\\s+)?JOIN\\s+customers\\s+ON\\s+.*customer_id",
    "explanation": "The INNER JOIN matches records where orders.customer_id equals customers.id.",
    "hint": "FROM orders INNER JOIN customers ON orders.customer_id = customers.id"
  },
  {
    "id": "sql-048",
    "mode": "sql",
    "topic": "Table Joins (INNER, LEFT, RIGHT, FULL)",
    "difficulty": "Medium",
    "type": "script",
    "question": "Write a LEFT JOIN query to retrieve all `customers.name` and their `orders.id`, ensuring customers without orders are still included in the result.",
    "starterCode": "-- Preserve all customers\n",
    "expectedScript": "SELECT customers.name, orders.id FROM customers LEFT JOIN orders ON customers.id = orders.customer_id;",
    "validationKeywords": [
      "SELECT",
      "customers.name",
      "orders.id",
      "FROM",
      "customers",
      "LEFT",
      "JOIN",
      "orders",
      "ON"
    ],
    "validationRegex": "FROM\\s+customers\\s+LEFT\\s+(?:OUTER\\s+)?JOIN\\s+orders\\s+ON",
    "explanation": "A LEFT JOIN keeps every row from customers even if there is no corresponding row in orders.",
    "hint": "FROM customers LEFT JOIN orders ON customers.id = orders.customer_id"
  },
  {
    "id": "sql-049",
    "mode": "sql",
    "topic": "Table Joins (INNER, LEFT, RIGHT, FULL)",
    "difficulty": "Medium",
    "type": "script",
    "question": "Write a query performing a SELF JOIN on the `employees` table (aliased as `e` for employee and `m` for manager) to list each employee's `name` and their manager's `name` matching `e.manager_id = m.id`.",
    "starterCode": "-- Self join employees on itself\n",
    "expectedScript": "SELECT e.name AS employee_name, m.name AS manager_name FROM employees e INNER JOIN employees m ON e.manager_id = m.id;",
    "validationKeywords": [
      "SELECT",
      "e.name",
      "m.name",
      "FROM",
      "employees",
      "JOIN",
      "ON",
      "manager_id"
    ],
    "validationRegex": "employees\\s+(?:AS\\s+)?e.*(?:JOIN)\\s+employees\\s+(?:AS\\s+)?m\\s+ON\\s+e\\.manager_id\\s*=\\s*m\\.id",
    "explanation": "A table can be joined to itself using table aliases to represent distinct roles (employee vs manager).",
    "hint": "FROM employees e JOIN employees m ON e.manager_id = m.id"
  },
  {
    "id": "sql-050",
    "mode": "sql",
    "topic": "Table Joins (INNER, LEFT, RIGHT, FULL)",
    "difficulty": "Medium",
    "type": "script",
    "question": "Write a query to find all products that have never been ordered using a LEFT JOIN between `products` (p) and `order_items` (oi) on `p.id = oi.product_id`.",
    "starterCode": "-- Anti-join pattern\n",
    "expectedScript": "SELECT p.id, p.name FROM products p LEFT JOIN order_items oi ON p.id = oi.product_id WHERE oi.product_id IS NULL;",
    "validationKeywords": [
      "SELECT",
      "products",
      "LEFT",
      "JOIN",
      "order_items",
      "ON",
      "product_id",
      "WHERE",
      "IS",
      "NULL"
    ],
    "validationRegex": "LEFT\\s+(?:OUTER\\s+)?JOIN\\s+order_items.*WHERE\\s+.*product_id\\s+IS\\s+NULL",
    "explanation": "Filtering by WHERE oi.product_id IS NULL retains only products that had no matching rows in order_items.",
    "hint": "WHERE oi.product_id IS NULL"
  },
  {
    "id": "sql-051",
    "mode": "sql",
    "topic": "Subqueries & Nested Queries",
    "difficulty": "Easy",
    "type": "mcq",
    "question": "What is a scalar subquery?",
    "options": [
      "A subquery that returns exactly one row and one column",
      "A subquery that returns a list of values",
      "A subquery that runs once for every row in the outer query",
      "A subquery placed in the FROM clause"
    ],
    "correctAnswer": 0,
    "explanation": "A scalar subquery returns a single atomic value (one column, one row) and can be used wherever a single value expression is allowed.",
    "hint": "Scalar refers to a single individual value."
  },
  {
    "id": "sql-052",
    "mode": "sql",
    "topic": "Subqueries & Nested Queries",
    "difficulty": "Medium",
    "type": "mcq",
    "question": "What characterizes a correlated subquery?",
    "options": [
      "It references columns from the outer query and executes repeatedly for each outer candidate row",
      "It executes once before the outer query runs",
      "It is always preceded by the UNION operator",
      "It can only be used in the HAVING clause"
    ],
    "correctAnswer": 0,
    "explanation": "A correlated subquery depends on values from the outer query, meaning it conceptually runs once for every row processed by the outer query.",
    "hint": "The inner query correlates with the outer row."
  },
  {
    "id": "sql-053",
    "mode": "sql",
    "topic": "Subqueries & Nested Queries",
    "difficulty": "Medium",
    "type": "mcq",
    "question": "Which operator tests for the presence of at least one row returned by a subquery and stops scanning as soon as a match is found?",
    "options": [
      "IN",
      "EXISTS",
      "ANY",
      "SOME"
    ],
    "correctAnswer": 1,
    "explanation": "EXISTS returns TRUE as soon as the subquery yields at least one row. The database engine can optimize this by short-circuiting.",
    "hint": "It checks whether a record exists."
  },
  {
    "id": "sql-054",
    "mode": "sql",
    "topic": "Subqueries & Nested Queries",
    "difficulty": "Medium",
    "type": "mcq",
    "question": "Why is 'WHERE column > ALL (subquery)' evaluated to TRUE if the subquery returns zero rows?",
    "options": [
      "By definition of vacuous truth in mathematical logic, a condition holds for all members of an empty set",
      "It is an error in SQL engines",
      "ALL evaluates to NULL when empty",
      "It actually evaluates to FALSE"
    ],
    "correctAnswer": 0,
    "explanation": "In SQL formal semantics, predicate > ALL (empty set) is vacuously TRUE because there is no counterexample in the set that violates the condition.",
    "hint": "Think about logic: nothing in an empty set violates the condition."
  },
  {
    "id": "sql-055",
    "mode": "sql",
    "topic": "Subqueries & Nested Queries",
    "difficulty": "Easy",
    "type": "mcq",
    "question": "What must be given to a subquery placed in the FROM clause (derived table)?",
    "options": [
      "An alias",
      "An index",
      "A primary key",
      "A schema prefix"
    ],
    "correctAnswer": 0,
    "explanation": "In SQL, derived tables in the FROM clause must be assigned a table alias (e.g. FROM (SELECT ...) AS sub).",
    "hint": "The outer query needs a name to reference the derived table."
  },
  {
    "id": "sql-056",
    "mode": "sql",
    "topic": "Subqueries & Nested Queries",
    "difficulty": "Medium",
    "type": "mcq",
    "question": "What is the key advantage of EXISTS over IN when dealing with subqueries that might contain NULL values?",
    "options": [
      "EXISTS is not subject to three-valued logic pitfalls with NULLs because it only checks for row presence",
      "EXISTS converts all NULLs to 0",
      "IN is faster for large tables",
      "There is no difference"
    ],
    "correctAnswer": 0,
    "explanation": "NOT IN (subquery) fails if any row contains a NULL, returning UNKNOWN. NOT EXISTS is immune to NULL values inside the subquery projection.",
    "hint": "EXISTS only tests row existence, not column equivalence."
  },
  {
    "id": "sql-057",
    "mode": "sql",
    "topic": "Subqueries & Nested Queries",
    "difficulty": "Easy",
    "type": "script",
    "question": "Write a query to find all `employees` whose `salary` is higher than the company average salary using a subquery.",
    "starterCode": "-- Compare salary to AVG(salary) via subquery\n",
    "expectedScript": "SELECT * FROM employees WHERE salary > (SELECT AVG(salary) FROM employees);",
    "validationKeywords": [
      "SELECT",
      "FROM",
      "employees",
      "WHERE",
      "salary",
      ">",
      "SELECT",
      "AVG",
      "salary"
    ],
    "validationRegex": "WHERE\\s+salary\\s*>\\s*\\(\\s*SELECT\\s+AVG\\(salary\\)\\s+FROM\\s+employees\\s*\\)",
    "explanation": "The subquery (SELECT AVG(salary) FROM employees) produces a scalar value that the outer query compares against each row's salary.",
    "hint": "WHERE salary > (SELECT AVG(salary) FROM employees)"
  },
  {
    "id": "sql-058",
    "mode": "sql",
    "topic": "Subqueries & Nested Queries",
    "difficulty": "Medium",
    "type": "script",
    "question": "Write a query using `WHERE EXISTS` to find all `customers` (c) who have placed at least one order in the `orders` (o) table.",
    "starterCode": "-- Correlated subquery with EXISTS\n",
    "expectedScript": "SELECT * FROM customers c WHERE EXISTS (SELECT 1 FROM orders o WHERE o.customer_id = c.id);",
    "validationKeywords": [
      "SELECT",
      "FROM",
      "customers",
      "WHERE",
      "EXISTS",
      "SELECT",
      "FROM",
      "orders",
      "customer_id"
    ],
    "validationRegex": "WHERE\\s+EXISTS\\s*\\(\\s*SELECT\\s+.*FROM\\s+orders.*WHERE\\s+.*customer_id\\s*=\\s*c\\.id\\s*\\)",
    "explanation": "The correlated subquery checks if any row in orders matches the current customer's id.",
    "hint": "WHERE EXISTS (SELECT 1 FROM orders o WHERE o.customer_id = c.id)"
  },
  {
    "id": "sql-059",
    "mode": "sql",
    "topic": "Subqueries & Nested Queries",
    "difficulty": "Medium",
    "type": "script",
    "question": "Write a query to select the `name` of all products whose price is greater than ANY product in the 'Accessories' category.",
    "starterCode": "-- Use > ANY (subquery)\n",
    "expectedScript": "SELECT name FROM products WHERE price > ANY (SELECT price FROM products WHERE category = 'Accessories');",
    "validationKeywords": [
      "SELECT",
      "name",
      "FROM",
      "products",
      "WHERE",
      "price",
      ">",
      "ANY",
      "SELECT",
      "price",
      "category",
      "'Accessories'"
    ],
    "validationRegex": "WHERE\\s+price\\s*>\\s*ANY\\s*\\(\\s*SELECT\\s+price\\s+FROM\\s+products\\s+WHERE\\s+category\\s*=\\s*'Accessories'\\s*\\)",
    "explanation": "> ANY returns TRUE if the price is greater than at least one price in the Accessories category.",
    "hint": "WHERE price > ANY (SELECT price FROM products WHERE category = 'Accessories')"
  },
  {
    "id": "sql-060",
    "mode": "sql",
    "topic": "Subqueries & Nested Queries",
    "difficulty": "Medium",
    "type": "script",
    "question": "Write a query to find employees who earn more than the average salary of their OWN department using a correlated subquery.",
    "starterCode": "-- Correlated subquery comparing with department average\n",
    "expectedScript": "SELECT e.id, e.name, e.salary, e.department FROM employees e WHERE e.salary > (SELECT AVG(sub.salary) FROM employees sub WHERE sub.department = e.department);",
    "validationKeywords": [
      "SELECT",
      "FROM",
      "employees",
      "e",
      "WHERE",
      "salary",
      ">",
      "SELECT",
      "AVG",
      "department"
    ],
    "validationRegex": "WHERE\\s+(?:e\\.)?salary\\s*>\\s*\\(\\s*SELECT\\s+AVG\\(.*salary\\).*FROM\\s+employees.*WHERE\\s+.*department\\s*=\\s*e\\.department\\s*\\)",
    "explanation": "The subquery computes the average salary for e.department dynamically for each outer employee.",
    "hint": "WHERE e.salary > (SELECT AVG(salary) FROM employees WHERE department = e.department)"
  },
  {
    "id": "sql-061",
    "mode": "sql",
    "topic": "Set Operations (UNION, INTERSECT, EXCEPT)",
    "difficulty": "Easy",
    "type": "mcq",
    "question": "What is the primary difference between UNION and UNION ALL?",
    "options": [
      "UNION removes duplicate rows; UNION ALL retains all duplicates and is faster",
      "UNION is for numbers; UNION ALL is for strings",
      "UNION requires identical table structures; UNION ALL does not",
      "UNION sorts descending; UNION ALL sorts ascending"
    ],
    "correctAnswer": 0,
    "explanation": "UNION performs a distinct sort to eliminate duplicates between sets. UNION ALL skips duplicate elimination, making it significantly faster.",
    "hint": "UNION ALL keeps 'ALL' records including duplicates."
  },
  {
    "id": "sql-062",
    "mode": "sql",
    "topic": "Set Operations (UNION, INTERSECT, EXCEPT)",
    "difficulty": "Easy",
    "type": "mcq",
    "question": "What condition must be met for two queries to be combined using a set operator?",
    "options": [
      "Both queries must return the same number of columns with compatible data types",
      "Both queries must select from the same table",
      "Both queries must have WHERE clauses",
      "Column names in both SELECT clauses must be identical"
    ],
    "correctAnswer": 0,
    "explanation": "Set operations require union compatibility: identical degree (number of columns) and compatible data types in corresponding positions.",
    "hint": "Same number of columns and compatible types."
  },
  {
    "id": "sql-063",
    "mode": "sql",
    "topic": "Set Operations (UNION, INTERSECT, EXCEPT)",
    "difficulty": "Medium",
    "type": "mcq",
    "question": "Which set operator returns only the rows that appear in the first query but NOT in the second query?",
    "options": [
      "EXCEPT (or MINUS)",
      "INTERSECT",
      "UNION",
      "CROSS JOIN"
    ],
    "correctAnswer": 0,
    "explanation": "EXCEPT (called MINUS in Oracle) returns rows from the first query that do not exist in the second query.",
    "hint": "EXCEPT in standard SQL, MINUS in Oracle."
  },
  {
    "id": "sql-064",
    "mode": "sql",
    "topic": "Set Operations (UNION, INTERSECT, EXCEPT)",
    "difficulty": "Medium",
    "type": "mcq",
    "question": "Which set operator returns only rows common to both result sets?",
    "options": [
      "INTERSECT",
      "UNION",
      "OVERLAP",
      "CONCAT"
    ],
    "correctAnswer": 0,
    "explanation": "INTERSECT returns only the rows produced by both queries (the mathematical intersection of sets).",
    "hint": "Think of intersection in Venn diagrams."
  },
  {
    "id": "sql-065",
    "mode": "sql",
    "topic": "Set Operations (UNION, INTERSECT, EXCEPT)",
    "difficulty": "Medium",
    "type": "mcq",
    "question": "Where can an ORDER BY clause be placed when combining queries with UNION?",
    "options": [
      "At the very end of the final query, sorting the entire combined result set",
      "Inside each individual query before the UNION",
      "Immediately after the UNION keyword",
      "ORDER BY is strictly disallowed when using set operators"
    ],
    "correctAnswer": 0,
    "explanation": "An ORDER BY applied to the final result of a set operation must appear at the very end of the statement, referencing the column names or aliases of the first SELECT.",
    "hint": "It sorts the entire combined outcome at the very end."
  },
  {
    "id": "sql-066",
    "mode": "sql",
    "topic": "Set Operations (UNION, INTERSECT, EXCEPT)",
    "difficulty": "Easy",
    "type": "mcq",
    "question": "In Oracle database SQL, what keyword is used instead of ANSI SQL's EXCEPT?",
    "options": [
      "MINUS",
      "DIFFERENCE",
      "WITHOUT",
      "SUBTRACT"
    ],
    "correctAnswer": 0,
    "explanation": "Oracle uses the MINUS operator to implement the set difference operation defined as EXCEPT in ANSI SQL.",
    "hint": "Starts with M and means subtraction."
  },
  {
    "id": "sql-067",
    "mode": "sql",
    "topic": "Set Operations (UNION, INTERSECT, EXCEPT)",
    "difficulty": "Easy",
    "type": "script",
    "question": "Write a query combining the `city` from `suppliers` and `city` from `customers` without duplicates using `UNION`.",
    "starterCode": "-- Combine cities with UNION\n",
    "expectedScript": "SELECT city FROM suppliers UNION SELECT city FROM customers;",
    "validationKeywords": [
      "SELECT",
      "city",
      "FROM",
      "suppliers",
      "UNION",
      "SELECT",
      "city",
      "FROM",
      "customers"
    ],
    "validationRegex": "SELECT\\s+city\\s+FROM\\s+suppliers\\s+UNION\\s+SELECT\\s+city\\s+FROM\\s+customers",
    "explanation": "UNION merges both city columns and eliminates duplicate values.",
    "hint": "SELECT city FROM suppliers UNION SELECT city FROM customers;"
  },
  {
    "id": "sql-068",
    "mode": "sql",
    "topic": "Set Operations (UNION, INTERSECT, EXCEPT)",
    "difficulty": "Medium",
    "type": "script",
    "question": "Write a query to combine `id`, `name`, and `email` from `online_clients` and `in_store_clients` preserving all duplicates with `UNION ALL`.",
    "starterCode": "-- Preserve duplicates using UNION ALL\n",
    "expectedScript": "SELECT id, name, email FROM online_clients UNION ALL SELECT id, name, email FROM in_store_clients;",
    "validationKeywords": [
      "SELECT",
      "id",
      "name",
      "email",
      "FROM",
      "online_clients",
      "UNION",
      "ALL",
      "SELECT",
      "in_store_clients"
    ],
    "validationRegex": "SELECT\\s+id\\s*,\\s*name\\s*,\\s*email\\s+FROM\\s+online_clients\\s+UNION\\s+ALL\\s+SELECT\\s+id\\s*,\\s*name\\s*,\\s*email\\s+FROM\\s+in_store_clients",
    "explanation": "UNION ALL combines the sets without filtering duplicate entries.",
    "hint": "UNION ALL between two matching SELECT statements"
  },
  {
    "id": "sql-069",
    "mode": "sql",
    "topic": "Set Operations (UNION, INTERSECT, EXCEPT)",
    "difficulty": "Medium",
    "type": "script",
    "question": "Write a query using `INTERSECT` to find email addresses that appear in both the `newsletter_subscribers` table and the `registered_users` table.",
    "starterCode": "-- Find common emails\n",
    "expectedScript": "SELECT email FROM newsletter_subscribers INTERSECT SELECT email FROM registered_users;",
    "validationKeywords": [
      "SELECT",
      "email",
      "FROM",
      "newsletter_subscribers",
      "INTERSECT",
      "SELECT",
      "registered_users"
    ],
    "validationRegex": "SELECT\\s+email\\s+FROM\\s+newsletter_subscribers\\s+INTERSECT\\s+SELECT\\s+email\\s+FROM\\s+registered_users",
    "explanation": "INTERSECT finds values that exist in both queries.",
    "hint": "SELECT email FROM newsletter_subscribers INTERSECT SELECT email FROM registered_users;"
  },
  {
    "id": "sql-070",
    "mode": "sql",
    "topic": "Set Operations (UNION, INTERSECT, EXCEPT)",
    "difficulty": "Medium",
    "type": "script",
    "question": "Write a query using `EXCEPT` to find product IDs present in `all_products` that have never been recorded in `sold_products`.",
    "starterCode": "-- Set difference with EXCEPT\n",
    "expectedScript": "SELECT id FROM all_products EXCEPT SELECT product_id FROM sold_products;",
    "validationKeywords": [
      "SELECT",
      "id",
      "FROM",
      "all_products",
      "EXCEPT",
      "SELECT",
      "product_id",
      "FROM",
      "sold_products"
    ],
    "validationRegex": "SELECT\\s+id\\s+FROM\\s+all_products\\s+(?:EXCEPT|MINUS)\\s+SELECT\\s+product_id\\s+FROM\\s+sold_products",
    "explanation": "EXCEPT returns rows from all_products that do not appear in sold_products.",
    "hint": "SELECT id FROM all_products EXCEPT SELECT product_id FROM sold_products;"
  },
  {
    "id": "sql-071",
    "mode": "sql",
    "topic": "DML Statements (INSERT, UPDATE, DELETE)",
    "difficulty": "Easy",
    "type": "mcq",
    "question": "What happens if an UPDATE statement is executed without a WHERE clause?",
    "options": [
      "Every single row in the target table is updated",
      "The statement throws a syntax error",
      "Only the first row is updated",
      "No rows are updated"
    ],
    "correctAnswer": 0,
    "explanation": "Without a WHERE clause, an UPDATE statement applies its modifications across all rows of the table.",
    "hint": "Always be careful with UPDATE without WHERE!"
  },
  {
    "id": "sql-072",
    "mode": "sql",
    "topic": "DML Statements (INSERT, UPDATE, DELETE)",
    "difficulty": "Easy",
    "type": "mcq",
    "question": "What is the difference between DELETE and TRUNCATE?",
    "options": [
      "DELETE is a DML command that logs row-by-row deletions and can have a WHERE clause; TRUNCATE is a DDL command that deallocates pages instantly without WHERE",
      "DELETE drops the table structure; TRUNCATE only removes data",
      "TRUNCATE can be filtered by a WHERE condition",
      "There is no difference"
    ],
    "correctAnswer": 0,
    "explanation": "DELETE removes rows one by one, firing triggers and allowing WHERE filters. TRUNCATE resets the table storage quickly as a DDL operation.",
    "hint": "TRUNCATE is DDL and cannot take a WHERE clause."
  },
  {
    "id": "sql-073",
    "mode": "sql",
    "topic": "DML Statements (INSERT, UPDATE, DELETE)",
    "difficulty": "Medium",
    "type": "mcq",
    "question": "How do you insert the results of a SELECT query into an existing destination table?",
    "options": [
      "INSERT INTO target_table (cols) SELECT cols FROM source_table",
      "INSERT INTO target_table VALUES (SELECT cols FROM source_table)",
      "COPY INTO target_table FROM SELECT cols",
      "MERGE target_table WITH SELECT cols"
    ],
    "correctAnswer": 0,
    "explanation": "The syntax 'INSERT INTO table (columns) SELECT ...' copies rows directly from one query into another table.",
    "hint": "INSERT INTO ... SELECT ..."
  },
  {
    "id": "sql-074",
    "mode": "sql",
    "topic": "DML Statements (INSERT, UPDATE, DELETE)",
    "difficulty": "Medium",
    "type": "mcq",
    "question": "What does the SQL standard MERGE statement accomplish?",
    "options": [
      "Performs 'upsert' operations: updates existing rows if matched, and inserts new rows if not matched",
      "Merges two database instances into one",
      "Combines two primary keys into a composite key",
      "Merges table columns together horizontally"
    ],
    "correctAnswer": 0,
    "explanation": "MERGE (upsert) evaluates a join condition between source and target, performing UPDATE WHEN MATCHED and INSERT WHEN NOT MATCHED.",
    "hint": "Often called 'Upsert' (Update or Insert)."
  },
  {
    "id": "sql-075",
    "mode": "sql",
    "topic": "DML Statements (INSERT, UPDATE, DELETE)",
    "difficulty": "Medium",
    "type": "mcq",
    "question": "In PostgreSQL or SQL Server, which clause attached to an INSERT or UPDATE statement returns modified data directly to the client?",
    "options": [
      "RETURNING (in Postgres) or OUTPUT (in SQL Server)",
      "SHOW MODIFIED",
      "ECHO VALUES",
      "SELECT AFTER"
    ],
    "correctAnswer": 0,
    "explanation": "PostgreSQL and SQLite support 'RETURNING *', while SQL Server supports the 'OUTPUT' clause to return inserted/updated rows immediately.",
    "hint": "RETURNING * in PostgreSQL/SQLite."
  },
  {
    "id": "sql-076",
    "mode": "sql",
    "topic": "DML Statements (INSERT, UPDATE, DELETE)",
    "difficulty": "Easy",
    "type": "mcq",
    "question": "Which statement inserts a single row with specific values into `departments`?",
    "options": [
      "INSERT INTO departments (id, name) VALUES (1, 'Finance');",
      "ADD ROW INTO departments (1, 'Finance');",
      "INSERT departments VALUES [1, 'Finance'];",
      "PUT INTO departments (id, name) = (1, 'Finance');"
    ],
    "correctAnswer": 0,
    "explanation": "The standard INSERT statement uses 'INSERT INTO tablename (cols) VALUES (vals)'.",
    "hint": "INSERT INTO tablename (columns) VALUES (values);"
  },
  {
    "id": "sql-077",
    "mode": "sql",
    "topic": "DML Statements (INSERT, UPDATE, DELETE)",
    "difficulty": "Easy",
    "type": "script",
    "question": "Write an INSERT statement to add a new employee into `employees` with `id` = 101, `name` = 'Alice Smith', and `salary` = 75000.",
    "starterCode": "-- Insert a new employee record\n",
    "expectedScript": "INSERT INTO employees (id, name, salary) VALUES (101, 'Alice Smith', 75000);",
    "validationKeywords": [
      "INSERT",
      "INTO",
      "employees",
      "id",
      "name",
      "salary",
      "VALUES",
      "101",
      "'Alice Smith'",
      "75000"
    ],
    "validationRegex": "INSERT\\s+INTO\\s+employees\\s*\\(.*id.*name.*salary.*\\)\\s*VALUES\\s*\\(\\s*101\\s*,\\s*'Alice Smith'\\s*,\\s*75000\\s*\\)",
    "explanation": "Specifying column names and corresponding values ensures safe, explicit insertion.",
    "hint": "INSERT INTO employees (id, name, salary) VALUES (101, 'Alice Smith', 75000);"
  },
  {
    "id": "sql-078",
    "mode": "sql",
    "topic": "DML Statements (INSERT, UPDATE, DELETE)",
    "difficulty": "Easy",
    "type": "script",
    "question": "Write an UPDATE statement to increase the `salary` by 10% (`salary * 1.10`) for all employees in the 'Sales' `department`.",
    "starterCode": "-- Give a 10% raise to Sales\n",
    "expectedScript": "UPDATE employees SET salary = salary * 1.10 WHERE department = 'Sales';",
    "validationKeywords": [
      "UPDATE",
      "employees",
      "SET",
      "salary",
      "*",
      "1.10",
      "WHERE",
      "department",
      "'Sales'"
    ],
    "validationRegex": "UPDATE\\s+employees\\s+SET\\s+salary\\s*=\\s*salary\\s*\\*\\s*1\\.1(?:0)?\\s+WHERE\\s+department\\s*=\\s*'Sales'",
    "explanation": "SET salary = salary * 1.10 recalculates the column, and WHERE department = 'Sales' confines the update to Sales.",
    "hint": "UPDATE employees SET salary = salary * 1.10 WHERE department = 'Sales';"
  },
  {
    "id": "sql-079",
    "mode": "sql",
    "topic": "DML Statements (INSERT, UPDATE, DELETE)",
    "difficulty": "Medium",
    "type": "script",
    "question": "Write a DELETE statement to remove all orders from `orders` where `status` is 'cancelled' and `created_at` is older than '2023-01-01'.",
    "starterCode": "-- Delete stale cancelled orders\n",
    "expectedScript": "DELETE FROM orders WHERE status = 'cancelled' AND created_at < '2023-01-01';",
    "validationKeywords": [
      "DELETE",
      "FROM",
      "orders",
      "WHERE",
      "status",
      "'cancelled'",
      "AND",
      "created_at",
      "<",
      "'2023-01-01'"
    ],
    "validationRegex": "DELETE\\s+FROM\\s+orders\\s+WHERE\\s+status\\s*=\\s*'cancelled'\\s+AND\\s+created_at\\s*<\\s*'2023-01-01'",
    "explanation": "DELETE FROM with a compound condition purges matching rows while preserving other data.",
    "hint": "DELETE FROM orders WHERE status = 'cancelled' AND created_at < '2023-01-01';"
  },
  {
    "id": "sql-080",
    "mode": "sql",
    "topic": "DML Statements (INSERT, UPDATE, DELETE)",
    "difficulty": "Medium",
    "type": "script",
    "question": "Write a query to UPDATE the `inventory` table's `stock` by reducing it by `quantity` matching `orders.product_id` where `orders.id = 50`.",
    "starterCode": "-- Update stock based on subquery or join\n",
    "expectedScript": "UPDATE inventory SET stock = stock - (SELECT quantity FROM orders WHERE orders.id = 50 AND orders.product_id = inventory.product_id) WHERE product_id IN (SELECT product_id FROM orders WHERE id = 50);",
    "validationKeywords": [
      "UPDATE",
      "inventory",
      "SET",
      "stock",
      "-",
      "SELECT",
      "quantity",
      "FROM",
      "orders",
      "WHERE"
    ],
    "validationRegex": "UPDATE\\s+inventory\\s+SET\\s+stock\\s*=\\s*stock\\s*-\\s*\\(\\s*SELECT\\s+quantity",
    "explanation": "Subqueries inside the SET clause can dynamically pull quantities from related transaction tables.",
    "hint": "UPDATE inventory SET stock = stock - (SELECT quantity FROM orders WHERE ...)"
  },
  {
    "id": "sql-081",
    "mode": "sql",
    "topic": "DDL Schema & Constraints",
    "difficulty": "Easy",
    "type": "mcq",
    "question": "Which constraint uniquely identifies each record in a database table and disallows NULL values?",
    "options": [
      "PRIMARY KEY",
      "UNIQUE",
      "FOREIGN KEY",
      "CHECK"
    ],
    "correctAnswer": 0,
    "explanation": "A PRIMARY KEY constraint uniquely identifies each tuple and inherently enforces both uniqueness and NOT NULL.",
    "hint": "The main key of a relational table."
  },
  {
    "id": "sql-082",
    "mode": "sql",
    "topic": "DDL Schema & Constraints",
    "difficulty": "Easy",
    "type": "mcq",
    "question": "What action does 'ON DELETE CASCADE' enforce on a FOREIGN KEY relationship?",
    "options": [
      "Automatically deletes child rows when the referenced parent row is deleted",
      "Prevents parent deletion if child rows exist",
      "Sets the foreign key in child rows to NULL",
      "Archives deleted rows into an audit table"
    ],
    "correctAnswer": 0,
    "explanation": "CASCADE propagates the deletion of a parent record down to all dependent child records automatically.",
    "hint": "The deletion cascades down to children."
  },
  {
    "id": "sql-083",
    "mode": "sql",
    "topic": "DDL Schema & Constraints",
    "difficulty": "Medium",
    "type": "mcq",
    "question": "Which DDL statement is used to add a new column to an existing table?",
    "options": [
      "ALTER TABLE table_name ADD COLUMN column_name data_type;",
      "MODIFY TABLE table_name INSERT column_name;",
      "UPDATE TABLE table_name ADD column_name;",
      "CHANGE TABLE table_name NEW COLUMN;"
    ],
    "correctAnswer": 0,
    "explanation": "ALTER TABLE table_name ADD (or ADD COLUMN) modifies the schema of an existing table to include a new attribute.",
    "hint": "Starts with ALTER TABLE ... ADD ..."
  },
  {
    "id": "sql-084",
    "mode": "sql",
    "topic": "DDL Schema & Constraints",
    "difficulty": "Medium",
    "type": "mcq",
    "question": "Can a UNIQUE constraint column accept NULL values in standard SQL?",
    "options": [
      "Yes, multiple NULLs are typically permitted because NULL is not equal to NULL in three-valued logic",
      "No, UNIQUE strictly forbids NULL",
      "Only if NOT NULL is explicitly declared",
      "Only one single NULL is allowed across all engines"
    ],
    "correctAnswer": 0,
    "explanation": "Unlike a PRIMARY KEY, a UNIQUE constraint permits NULLs (in standard SQL, multiple NULLs are allowed because NULL != NULL).",
    "hint": "NULL != NULL in three-valued logic."
  },
  {
    "id": "sql-085",
    "mode": "sql",
    "topic": "DDL Schema & Constraints",
    "difficulty": "Medium",
    "type": "mcq",
    "question": "What is the primary architectural purpose of a database VIEW?",
    "options": [
      "It acts as a saved virtual query that simplifies complex joins, enhances security, and abstracts underlying physical tables without storing data",
      "It physically copies table data to memory for faster reads",
      "It automatically creates clustered indexes",
      "It encrypts columns on disk"
    ],
    "correctAnswer": 0,
    "explanation": "A view is a stored SELECT statement that acts as a virtual table, encapsulating complex logic and controlling column-level access permissions.",
    "hint": "A view stores the query definition, not the underlying table data."
  },
  {
    "id": "sql-086",
    "mode": "sql",
    "topic": "DDL Schema & Constraints",
    "difficulty": "Easy",
    "type": "mcq",
    "question": "Which statement deletes an entire table and its schema definition completely from the database catalog?",
    "options": [
      "DROP TABLE table_name;",
      "DELETE TABLE table_name;",
      "TRUNCATE TABLE table_name;",
      "REMOVE TABLE table_name;"
    ],
    "correctAnswer": 0,
    "explanation": "DROP TABLE eradicates the table data, indexes, constraints, and its catalog metadata.",
    "hint": "DROP is the DDL command to destroy schema entities."
  },
  {
    "id": "sql-087",
    "mode": "sql",
    "topic": "DDL Schema & Constraints",
    "difficulty": "Easy",
    "type": "script",
    "question": "Write a SQL statement to CREATE a table named `students` with `id` INT PRIMARY KEY, `name` VARCHAR(50) NOT NULL, and `gpa` DECIMAL(3,2).",
    "starterCode": "-- Create students table\n",
    "expectedScript": "CREATE TABLE students (id INT PRIMARY KEY, name VARCHAR(50) NOT NULL, gpa DECIMAL(3,2));",
    "validationKeywords": [
      "CREATE",
      "TABLE",
      "students",
      "id",
      "PRIMARY",
      "KEY",
      "name",
      "NOT",
      "NULL",
      "gpa"
    ],
    "validationRegex": "CREATE\\s+TABLE\\s+students\\s*\\(.*id.*PRIMARY\\s+KEY.*name.*NOT\\s+NULL.*gpa.*\\)",
    "explanation": "Defines table structure, attributes, data types, and primary key/not null constraints.",
    "hint": "CREATE TABLE students (id INT PRIMARY KEY, name VARCHAR(50) NOT NULL, gpa DECIMAL(3,2));"
  },
  {
    "id": "sql-088",
    "mode": "sql",
    "topic": "DDL Schema & Constraints",
    "difficulty": "Medium",
    "type": "script",
    "question": "Write an ALTER TABLE statement to add an `email` VARCHAR(100) UNIQUE column to the `users` table.",
    "starterCode": "-- Alter table to add email column\n",
    "expectedScript": "ALTER TABLE users ADD COLUMN email VARCHAR(100) UNIQUE;",
    "validationKeywords": [
      "ALTER",
      "TABLE",
      "users",
      "ADD",
      "email",
      "VARCHAR",
      "UNIQUE"
    ],
    "validationRegex": "ALTER\\s+TABLE\\s+users\\s+ADD\\s+(?:COLUMN\\s+)?email\\s+VARCHAR\\(100\\)\\s+UNIQUE",
    "explanation": "ALTER TABLE ... ADD COLUMN appends the new attribute with a UNIQUE constraint.",
    "hint": "ALTER TABLE users ADD COLUMN email VARCHAR(100) UNIQUE;"
  },
  {
    "id": "sql-089",
    "mode": "sql",
    "topic": "DDL Schema & Constraints",
    "difficulty": "Medium",
    "type": "script",
    "question": "Write a statement to create a foreign key on table `orders` column `customer_id` referencing `customers(id)` with CASCADE on delete.",
    "starterCode": "-- Add foreign key constraint\n",
    "expectedScript": "ALTER TABLE orders ADD CONSTRAINT fk_orders_customer FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE;",
    "validationKeywords": [
      "ALTER",
      "TABLE",
      "orders",
      "ADD",
      "FOREIGN",
      "KEY",
      "customer_id",
      "REFERENCES",
      "customers",
      "id",
      "ON",
      "DELETE",
      "CASCADE"
    ],
    "validationRegex": "FOREIGN\\s+KEY\\s*\\(\\s*customer_id\\s*\\)\\s+REFERENCES\\s+customers\\s*\\(\\s*id\\s*\\)\\s+ON\\s+DELETE\\s+CASCADE",
    "explanation": "Creates an explicit referential integrity constraint with cascading deletion.",
    "hint": "FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE"
  },
  {
    "id": "sql-090",
    "mode": "sql",
    "topic": "DDL Schema & Constraints",
    "difficulty": "Medium",
    "type": "script",
    "question": "Write a statement to create a CHECK constraint on `accounts` ensuring `balance >= 0`.",
    "starterCode": "-- Add CHECK constraint\n",
    "expectedScript": "ALTER TABLE accounts ADD CONSTRAINT chk_positive_balance CHECK (balance >= 0);",
    "validationKeywords": [
      "ALTER",
      "TABLE",
      "accounts",
      "ADD",
      "CHECK",
      "balance",
      ">=",
      "0"
    ],
    "validationRegex": "CHECK\\s*\\(\\s*balance\\s*>=\\s*0\\s*\\)",
    "explanation": "CHECK constraints validate domain integrity by rejecting any INSERT or UPDATE that violates the predicate.",
    "hint": "ALTER TABLE accounts ADD CONSTRAINT chk_balance CHECK (balance >= 0);"
  },
  {
    "id": "sql-091",
    "mode": "sql",
    "topic": "Window Functions & Advanced SQL",
    "difficulty": "Easy",
    "type": "mcq",
    "question": "What differentiates a Window Function from a regular aggregate function?",
    "options": [
      "Window functions perform calculations across related rows without collapsing multiple rows into a single row",
      "Window functions only operate on date columns",
      "Window functions can only be used in the WHERE clause",
      "Window functions modify the underlying disk storage"
    ],
    "correctAnswer": 0,
    "explanation": "Unlike GROUP BY, window functions retain each row's individual identity while appending computed aggregate/ranking values alongside the row.",
    "hint": "Window functions keep all rows while calculating values over a window."
  },
  {
    "id": "sql-092",
    "mode": "sql",
    "topic": "Window Functions & Advanced SQL",
    "difficulty": "Medium",
    "type": "mcq",
    "question": "What is the difference between RANK() and DENSE_RANK() when ties occur?",
    "options": [
      "RANK() leaves gaps in ranking numbers after ties (e.g. 1, 2, 2, 4); DENSE_RANK() leaves no gaps (1, 2, 2, 3)",
      "DENSE_RANK() only works with strings",
      "RANK() assigns random order for ties",
      "There is no difference"
    ],
    "correctAnswer": 0,
    "explanation": "RANK skips ranks following a tie (e.g. 1, 2, 2, 4), whereas DENSE_RANK assigns consecutive numbers without gaps (1, 2, 2, 3).",
    "hint": "Dense means tightly packed without skipped numbers."
  },
  {
    "id": "sql-093",
    "mode": "sql",
    "topic": "Window Functions & Advanced SQL",
    "difficulty": "Medium",
    "type": "mcq",
    "question": "Which window function fetches a value from the preceding row within the partition?",
    "options": [
      "LAG()",
      "LEAD()",
      "PREV()",
      "PRIOR()"
    ],
    "correctAnswer": 0,
    "explanation": "LAG(column, offset) accesses data from a previous row at a specified physical offset, while LEAD looks ahead to subsequent rows.",
    "hint": "LAG looks behind (lagging); LEAD looks ahead."
  },
  {
    "id": "sql-094",
    "mode": "sql",
    "topic": "Window Functions & Advanced SQL",
    "difficulty": "Medium",
    "type": "mcq",
    "question": "What does PARTITION BY do inside an OVER() clause?",
    "options": [
      "Divides the result set into distinct partitions/groups where the window function evaluates independently",
      "Physically partitions the table on disk into shards",
      "Filters out rows matching the partition key",
      "Sorts the final query result set"
    ],
    "correctAnswer": 0,
    "explanation": "PARTITION BY resets calculation boundaries for each subgroup (e.g. running total per department) without altering the row count.",
    "hint": "It defines the grouping window boundary for the calculation."
  },
  {
    "id": "sql-095",
    "mode": "sql",
    "topic": "Window Functions & Advanced SQL",
    "difficulty": "Easy",
    "type": "mcq",
    "question": "What is a Common Table Expression (CTE) in SQL?",
    "options": [
      "A temporary named result set defined using the WITH clause for the duration of a single execution",
      "A permanent view saved in the database",
      "A temporary physical table created in tempdb",
      "A user-defined stored procedure"
    ],
    "correctAnswer": 0,
    "explanation": "A CTE is defined via the WITH keyword (e.g., WITH cte_name AS (...)) to structure complex queries modularly.",
    "hint": "Introduced using the WITH clause."
  },
  {
    "id": "sql-096",
    "mode": "sql",
    "topic": "Window Functions & Advanced SQL",
    "difficulty": "Medium",
    "type": "mcq",
    "question": "Which clause defines the sliding framing boundaries for a moving average window function?",
    "options": [
      "ROWS BETWEEN n PRECEDING AND CURRENT ROW",
      "SLIDE n ROWS",
      "WINDOW LIMIT n",
      "FRAME n ROWS"
    ],
    "correctAnswer": 0,
    "explanation": "Window frames specify exact boundaries with ROWS (or RANGE) BETWEEN ... PRECEDING AND ... FOLLOWING.",
    "hint": "Look for ROWS BETWEEN ... PRECEDING AND CURRENT ROW."
  },
  {
    "id": "sql-097",
    "mode": "sql",
    "topic": "Window Functions & Advanced SQL",
    "difficulty": "Medium",
    "type": "script",
    "question": "Write a query using `ROW_NUMBER() OVER()` to assign a unique sequential number to each employee ordered by `salary` descending.",
    "starterCode": "-- Assign row number ordered by salary\n",
    "expectedScript": "SELECT id, name, salary, ROW_NUMBER() OVER(ORDER BY salary DESC) AS rank_num FROM employees;",
    "validationKeywords": [
      "SELECT",
      "ROW_NUMBER()",
      "OVER",
      "ORDER",
      "BY",
      "salary",
      "DESC",
      "FROM",
      "employees"
    ],
    "validationRegex": "ROW_NUMBER\\s*\\(\\s*\\)\\s+OVER\\s*\\(\\s*ORDER\\s+BY\\s+salary\\s+DESC\\s*\\)",
    "explanation": "ROW_NUMBER() assigns an incremental integer from 1 to N based on the specified ORDER BY.",
    "hint": "ROW_NUMBER() OVER(ORDER BY salary DESC)"
  },
  {
    "id": "sql-098",
    "mode": "sql",
    "topic": "Window Functions & Advanced SQL",
    "difficulty": "Medium",
    "type": "script",
    "question": "Write a query using a Common Table Expression (CTE) named `HighEarners` that selects employees with `salary > 70000`, then select all columns from `HighEarners`.",
    "starterCode": "-- Define CTE using WITH\n",
    "expectedScript": "WITH HighEarners AS (SELECT * FROM employees WHERE salary > 70000) SELECT * FROM HighEarners;",
    "validationKeywords": [
      "WITH",
      "HighEarners",
      "AS",
      "SELECT",
      "*",
      "FROM",
      "employees",
      "WHERE",
      "salary",
      ">",
      "70000"
    ],
    "validationRegex": "WITH\\s+HighEarners\\s+AS\\s*\\(\\s*SELECT.*FROM\\s+employees\\s+WHERE\\s+salary\\s*>\\s*70000\\s*\\)\\s*SELECT\\s+\\*\\s+FROM\\s+HighEarners",
    "explanation": "CTEs modularize logic cleanly using the WITH keyword.",
    "hint": "WITH HighEarners AS (SELECT * FROM employees WHERE salary > 70000) SELECT * FROM HighEarners;"
  },
  {
    "id": "sql-099",
    "mode": "sql",
    "topic": "Window Functions & Advanced SQL",
    "difficulty": "Medium",
    "type": "script",
    "question": "Write a query to calculate a cumulative running total of `amount` as `running_total` ordered by `order_date` from the `orders` table using `SUM() OVER()`.",
    "starterCode": "-- Running total window function\n",
    "expectedScript": "SELECT id, order_date, amount, SUM(amount) OVER (ORDER BY order_date) AS running_total FROM orders;",
    "validationKeywords": [
      "SELECT",
      "amount",
      "SUM",
      "OVER",
      "ORDER",
      "BY",
      "order_date",
      "running_total",
      "FROM",
      "orders"
    ],
    "validationRegex": "SUM\\(amount\\)\\s+OVER\\s*\\(\\s*ORDER\\s+BY\\s+order_date.*\\)\\s+AS\\s+running_total",
    "explanation": "SUM(amount) OVER(ORDER BY order_date) automatically maintains an accumulated sum as it steps down the sorted rows.",
    "hint": "SUM(amount) OVER (ORDER BY order_date) AS running_total"
  },
  {
    "id": "sql-100",
    "mode": "sql",
    "topic": "Window Functions & Advanced SQL",
    "difficulty": "Medium",
    "type": "script",
    "question": "Write a query using `DENSE_RANK() OVER()` partitioned by `department` and ordered by `salary` descending to rank employees within their department as `dept_rank`.",
    "starterCode": "-- Rank within department partition\n",
    "expectedScript": "SELECT id, name, department, salary, DENSE_RANK() OVER (PARTITION BY department ORDER BY salary DESC) AS dept_rank FROM employees;",
    "validationKeywords": [
      "SELECT",
      "DENSE_RANK()",
      "OVER",
      "PARTITION",
      "BY",
      "department",
      "ORDER",
      "BY",
      "salary",
      "DESC",
      "dept_rank",
      "FROM",
      "employees"
    ],
    "validationRegex": "DENSE_RANK\\s*\\(\\s*\\)\\s+OVER\\s*\\(\\s*PARTITION\\s+BY\\s+department\\s+ORDER\\s+BY\\s+salary\\s+DESC\\s*\\)",
    "explanation": "PARTITION BY isolates rankings per department, and DENSE_RANK avoids skipped values on duplicate salaries.",
    "hint": "DENSE_RANK() OVER (PARTITION BY department ORDER BY salary DESC) AS dept_rank"
  }
,
  {
    "id": "sql-101",
    "mode": "sql",
    "topic": "Window Functions & Advanced SQL",
    "difficulty": "Hard",
    "type": "mcq",
    "question": "In standard SQL, what is the default window frame specification when an ORDER BY clause is present inside OVER() but no explicit ROWS or RANGE frame is specified?",
    "options": [
      "ROWS BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING",
      "RANGE BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW",
      "ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW",
      "RANGE BETWEEN CURRENT ROW AND UNBOUNDED FOLLOWING"
    ],
    "correctAnswer": 1,
    "explanation": "Per ANSI SQL standard, when ORDER BY is supplied without a frame, the engine defaults to RANGE BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW. Importantly, RANGE treats tied peer values as identical, including all duplicates up to the current peer group in the aggregate calculation.",
    "hint": "Think about RANGE vs ROWS and how ties in ORDER BY are included up to the current row's value."
  },
  {
    "id": "sql-102",
    "mode": "sql",
    "topic": "Subqueries & Nested Queries",
    "difficulty": "Hard",
    "type": "mcq",
    "question": "Given a table T with values (1, 2, NULL), what does the query `SELECT * FROM T WHERE id NOT IN (SELECT id FROM T WHERE id = 1 OR id IS NULL)` return?",
    "options": [
      "Rows with id = 2",
      "An empty result set (0 rows)",
      "Rows with id = 2 and NULL",
      "A SQL runtime exception"
    ],
    "correctAnswer": 1,
    "explanation": "NOT IN expands to `id != 1 AND id != NULL`. In three-valued logic, any comparison with NULL yields UNKNOWN. Since `true AND UNKNOWN` is UNKNOWN, the WHERE predicate never evaluates to TRUE for ANY row. Thus, 0 rows are returned.",
    "hint": "Remember three-valued logic: NOT IN with even a single NULL in the subquery yields UNKNOWN for all non-matching rows."
  },
  {
    "id": "sql-103",
    "mode": "sql",
    "topic": "Window Functions & Advanced SQL",
    "difficulty": "Hard",
    "type": "mcq",
    "question": "When using recursive Common Table Expressions (CTEs) to traverse a directed graph that contains cyclical references, which SQL feature or technique prevents infinite recursion in compliant database engines?",
    "options": [
      "The CYCLE clause with tracking column or explicit array path checking",
      "Adding DISTINCT to the recursive member",
      "Specifying MAX_ITERATIONS inside the UNION ALL clause",
      "Using GROUP BY on the primary key in the anchor member"
    ],
    "correctAnswer": 0,
    "explanation": "Standard SQL:1999 introduced the `CYCLE id SET is_cycle USING path` clause to detect visited nodes. In engines without native CYCLE syntax, engineers maintain an array or concatenated string path of visited node IDs (`path || id || '/'`) and add `WHERE path NOT LIKE '%/' || next_id || '/%'`.",
    "hint": "Look for the ANSI SQL CYCLE clause or path-tracking array checks."
  },
  {
    "id": "sql-104",
    "mode": "sql",
    "topic": "Aggregations & GROUP BY",
    "difficulty": "Hard",
    "type": "mcq",
    "question": "What does the function `GROUPING_ID(region, department, year)` return when the current summary row represents an aggregate across all years for each region, but grouped by department?",
    "options": [
      "A binary bitmask integer where each bit indicates whether a corresponding column is aggregated out (subtotaled)",
      "The count of distinct groupings in the result set",
      "The primary key index of the grouping dimension",
      "A boolean true/false flag indicating if the row is a grand total"
    ],
    "correctAnswer": 0,
    "explanation": "GROUPING_ID computes an integer bitmask based on GROUPING() flags for each argument column (from left to right, high-order bit to low-order bit). A bit is 1 if the column is subtotaled (aggregated out) and 0 if it is part of the grouping grouping level.",
    "hint": "It constructs a bit vector cast to an integer representing which columns are in the subtotal."
  },
  {
    "id": "sql-105",
    "mode": "sql",
    "topic": "Window Functions & Advanced SQL",
    "difficulty": "Hard",
    "type": "mcq",
    "question": "What is the critical difference between `DENSE_RANK()` and `PERCENT_RANK()`?",
    "options": [
      "DENSE_RANK produces contiguous integers (1, 2, 3...) with no gaps, whereas PERCENT_RANK computes relative rank as (rank - 1) / (total_rows - 1), ranging from 0.0 to 1.0",
      "PERCENT_RANK includes duplicates as separate integers while DENSE_RANK skips integers",
      "DENSE_RANK requires a PARTITION BY clause while PERCENT_RANK forbids it",
      "PERCENT_RANK is an aggregate function, whereas DENSE_RANK is purely scalar"
    ],
    "correctAnswer": 0,
    "explanation": "DENSE_RANK assigns consecutive 1-based ranks with ties sharing the same integer and no gaps. PERCENT_RANK evaluates the relative position of a row within a partition evaluated strictly as `(RANK() - 1) / (total_rows - 1)`.",
    "hint": "PERCENT_RANK evaluates a floating-point score between 0.0 and 1.0."
  },
  {
    "id": "sql-106",
    "mode": "sql",
    "topic": "Table Joins (INNER, LEFT, RIGHT, FULL)",
    "difficulty": "Hard",
    "type": "mcq",
    "question": "What is the key execution difference between a standard INNER JOIN with a subquery vs a `CROSS JOIN LATERAL` (or `CROSS APPLY`)?",
    "options": [
      "A LATERAL subquery can reference columns from preceding tables/subqueries in the FROM clause for each outer row, acting like a correlated foreach loop",
      "A LATERAL join executes in parallel while standard joins are strictly serial",
      "LATERAL joins are only permitted with recursive CTEs",
      "LATERAL joins convert all NULL values into empty strings automatically"
    ],
    "correctAnswer": 0,
    "explanation": "Standard subqueries in FROM are evaluated independently of outer table rows. A LATERAL subquery (or SQL Server's CROSS APPLY) can reference columns provided by previous FROM items on a row-by-row basis, making correlated top-N-per-group queries concise and efficient.",
    "hint": "LATERAL allows correlation: referencing outer row columns inside FROM subqueries."
  },
  {
    "id": "sql-107",
    "mode": "sql",
    "topic": "Window Functions & Advanced SQL",
    "difficulty": "Hard",
    "type": "mcq",
    "question": "Which window frame specification correctly calculates a rolling 3-day total revenue where days with no sales are not physically present in the table?",
    "options": [
      "RANGE BETWEEN INTERVAL '2' DAY PRECEDING AND CURRENT ROW",
      "ROWS BETWEEN 2 PRECEDING AND CURRENT ROW",
      "GROUPS BETWEEN 2 PRECEDING AND CURRENT ROW",
      "PARTITION BY date RANGE BETWEEN 3 PRECEDING AND CURRENT ROW"
    ],
    "correctAnswer": 0,
    "explanation": "ROWS counts physical table rows (meaning 2 PRECEDING would skip missing dates). RANGE with a temporal interval (`RANGE BETWEEN INTERVAL '2' DAY PRECEDING AND CURRENT ROW`) evaluates calendar date values regardless of how many actual rows exist.",
    "hint": "Use RANGE with an INTERVAL to measure value distance rather than physical row offset."
  },
  {
    "id": "sql-108",
    "mode": "sql",
    "topic": "Set Operations (UNION, INTERSECT, EXCEPT)",
    "difficulty": "Hard",
    "type": "mcq",
    "question": "If Table A contains three rows with value 'X' and Table B contains one row with value 'X', how many rows does `SELECT val FROM A EXCEPT ALL SELECT val FROM B` return?",
    "options": [
      "2 rows with value 'X'",
      "0 rows",
      "1 row with value 'X'",
      "3 rows with value 'X'"
    ],
    "correctAnswer": 0,
    "explanation": "Standard `EXCEPT` removes all duplicates (leaving 0 if present in B). However, `EXCEPT ALL` accounts for duplicate multiplicity: if A has m occurrences of a value and B has n occurrences, EXCEPT ALL yields max(0, m - n) occurrences. Here 3 - 1 = 2 rows.",
    "hint": "EXCEPT ALL subtracts the frequency of occurrences in B from A."
  },
  {
    "id": "sql-109",
    "mode": "sql",
    "topic": "Window Functions & Advanced SQL",
    "difficulty": "Hard",
    "type": "mcq",
    "question": "In transaction isolation theory, which concurrency anomaly is uniquely possible under `REPEATABLE READ` (Snapshot Isolation) that is completely prohibited under true `SERIALIZABLE`?",
    "options": [
      "Write Skew",
      "Dirty Read",
      "Non-repeatable Read",
      "Dirty Write"
    ],
    "correctAnswer": 0,
    "explanation": "Snapshot Isolation prevents dirty reads, non-repeatable reads, and phantom inserts into individual read sets. However, concurrent transactions modifying disjoint rows based on overlapping read sets (e.g., maintaining `doctor_on_call` count >= 1 where two doctors resign concurrently) can cause Write Skew, which only SERIALIZABLE avoids.",
    "hint": "Think about concurrent transactions that read overlapping state and write to separate records."
  },
  {
    "id": "sql-110",
    "mode": "sql",
    "topic": "Window Functions & Advanced SQL",
    "difficulty": "Hard",
    "type": "script",
    "question": "Write a query utilizing a recursive Common Table Expression named `emp_hierarchy` to compute each employee's depth `level` in the organization, starting at level 1 for top-level managers (`manager_id IS NULL`), selecting `id`, `name`, `manager_id`, and `level` from `employees` ordered by `level`, `id`.",
    "starterCode": "-- Write recursive CTE emp_hierarchy\nWITH RECURSIVE emp_hierarchy AS (\n",
    "expectedScript": "WITH RECURSIVE emp_hierarchy AS (SELECT id, name, manager_id, 1 AS level FROM employees WHERE manager_id IS NULL UNION ALL SELECT e.id, e.name, e.manager_id, h.level + 1 FROM employees e JOIN emp_hierarchy h ON e.manager_id = h.id) SELECT id, name, manager_id, level FROM emp_hierarchy ORDER BY level, id;",
    "validationKeywords": [
      "WITH",
      "emp_hierarchy",
      "AS",
      "SELECT",
      "id",
      "name",
      "manager_id",
      "level",
      "UNION",
      "ALL",
      "JOIN",
      "ORDER",
      "BY"
    ],
    "validationRegex": "WITH\\s+(?:RECURSIVE\\s+)?emp_hierarchy\\s+AS\\s*\\([\\s\\S]*?UNION\\s+ALL[\\s\\S]*?JOIN\\s+emp_hierarchy[\\s\\S]*?\\)\\s*SELECT[\\s\\S]*?FROM\\s+emp_hierarchy\\s+ORDER\\s+BY",
    "explanation": "A recursive CTE consists of an anchor member (finding the root where manager_id IS NULL) combined with a recursive member via UNION ALL that joins back to the anchor on manager_id = id, incrementing the level column.",
    "hint": "Use WITH RECURSIVE emp_hierarchy AS (anchor UNION ALL recursive_join) SELECT ... FROM emp_hierarchy ORDER BY level, id;"
  },
  {
    "id": "sql-111",
    "mode": "sql",
    "topic": "Window Functions & Advanced SQL",
    "difficulty": "Hard",
    "type": "mcq",
    "question": "In the SQL:2003 aggregate `FILTER` clause syntax (e.g., `COUNT(*) FILTER (WHERE status = 'active')`), how does the database process rows that evaluate to FALSE or NULL for the filter condition?",
    "options": [
      "The row is entirely excluded from that aggregate without affecting other aggregate expressions in the same query",
      "The entire row is discarded from the query result set",
      "The aggregate returns NULL immediately",
      "The row value is counted as 0"
    ],
    "correctAnswer": 0,
    "explanation": "The FILTER (WHERE ...) clause allows independent predicate filtering per aggregation function without affecting the query's main WHERE clause or other parallel aggregations in the SELECT list.",
    "hint": "It only filters inputs to that specific aggregate function."
  },
  {
    "id": "sql-112",
    "mode": "sql",
    "topic": "Sorting & Limiting (ORDER BY / LIMIT)",
    "difficulty": "Hard",
    "type": "mcq",
    "question": "Why is `OFFSET 1000000 ROWS FETCH NEXT 10 ROWS ONLY` notoriously slow in relational database engines, and what index-based pattern solves this 'deep pagination' problem?",
    "options": [
      "The engine must scan and discard 1,000,000 rows prior to fetching 10; keyset pagination (seek method) using `WHERE id > last_seen_id ORDER BY id LIMIT 10` solves it in O(log N)",
      "OFFSET uses non-volatile cache which locks the table during read",
      "OFFSET requires dynamic table locks on the primary key",
      "FETCH NEXT requires materializing the entire database table into memory buffers"
    ],
    "correctAnswer": 0,
    "explanation": "OFFSET n forces the database engine to traverse and discard n rows in the index/table order before emitting rows. Keyset pagination (also called seek pagination) uses a direct index seek (`WHERE (created_at, id) > (last_date, last_id)`) to jump directly to the target record in O(log N) time.",
    "hint": "Keyset/seek pagination avoids scanning through discarded preceding rows."
  },
  {
    "id": "sql-113",
    "mode": "sql",
    "topic": "Window Functions & Advanced SQL",
    "difficulty": "Hard",
    "type": "mcq",
    "question": "What is the result of `LEAD(salary, 2, 0) OVER (PARTITION BY dept ORDER BY salary)` when evaluated for the employee with the second-highest salary in a department of 4 people?",
    "options": [
      "0 (the default fallback, since there is no row 2 positions ahead)",
      "NULL",
      "The highest salary in the department",
      "The minimum salary in the department"
    ],
    "correctAnswer": 0,
    "explanation": "The second-highest salary is at index 3 in an ascending sort of 4 rows. Looking 2 rows ahead targets position 5, which does not exist. Because the 3rd parameter 0 was supplied as the default value, LEAD returns 0.",
    "hint": "LEAD(col, offset, default) returns default if the offset goes beyond the partition boundary."
  },
  {
    "id": "sql-114",
    "mode": "sql",
    "topic": "Aggregations & GROUP BY",
    "difficulty": "Hard",
    "type": "mcq",
    "question": "What is the equivalent standard SQL representation of `GROUP BY ROLLUP(a, b, c)` in terms of `GROUPING SETS`?",
    "options": [
      "GROUP BY GROUPING SETS ((a, b, c), (a, b), (a), ())",
      "GROUP BY GROUPING SETS ((a, b, c), (b, c), (c), ())",
      "GROUP BY GROUPING SETS ((a), (b), (c))",
      "GROUP BY GROUPING SETS ((a, b, c), ())"
    ],
    "correctAnswer": 0,
    "explanation": "ROLLUP creates hierarchical subtotal groupings by dropping columns one by one from right to left, starting with all columns down to the empty grand total `()`. For (a, b, c) it yields ((a,b,c), (a,b), (a), ()).",
    "hint": "ROLLUP progressively strips off the rightmost column until nothing remains."
  },
  {
    "id": "sql-115",
    "mode": "sql",
    "topic": "Window Functions & Advanced SQL",
    "difficulty": "Hard",
    "type": "script",
    "question": "Write an advanced SQL query to identify consecutive streaks (islands). For table `user_logins(user_id, login_date)`, select `user_id`, `MIN(login_date) AS streak_start`, `MAX(login_date) AS streak_end`, and `COUNT(*) AS streak_length` for all streaks where `streak_length >= 3`. (Assume login_date has no duplicate days per user).",
    "starterCode": "-- Use difference of ROW_NUMBER() from login_date to group islands\nWITH dated_logins AS (\n",
    "expectedScript": "WITH dated_logins AS (SELECT user_id, login_date, login_date - ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY login_date) AS grp FROM user_logins) SELECT user_id, MIN(login_date) AS streak_start, MAX(login_date) AS streak_end, COUNT(*) AS streak_length FROM dated_logins GROUP BY user_id, grp HAVING COUNT(*) >= 3;",
    "validationKeywords": [
      "WITH",
      "user_id",
      "login_date",
      "ROW_NUMBER()",
      "OVER",
      "PARTITION",
      "BY",
      "ORDER",
      "GROUP",
      "BY",
      "HAVING",
      "COUNT(*)",
      ">=",
      "3"
    ],
    "validationRegex": "ROW_NUMBER\\s*\\(\\s*\\)\\s+OVER\\s*\\(\\s*PARTITION\\s+BY\\s+user_id\\s+ORDER\\s+BY\\s+login_date\\s*\\)[\\s\\S]*?GROUP\\s+BY\\s+user_id[\\s\\S]*?HAVING\\s+COUNT\\s*\\(\\s*\\*\\s*\\)\\s*>=\\s*3",
    "explanation": "The 'islands and gaps' classic pattern subtracts ROW_NUMBER() days from login_date. For consecutive days, both increase at the same rate, yielding a constant anchor date `grp`. Grouping by (user_id, grp) aggregates the continuous streak.",
    "hint": "Subtract ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY login_date) from login_date to form a constant group key."
  },
  {
    "id": "sql-116",
    "mode": "sql",
    "topic": "Window Functions & Advanced SQL",
    "difficulty": "Hard",
    "type": "mcq",
    "question": "Why does the predicate `WHERE DATE(created_at) = '2024-05-01'` prevent an engine from using a normal index seek on `created_at`, and how is it rewritten to be sargable?",
    "options": [
      "Wrapping an indexed column in a function prevents index range seeking (non-sargable); rewrite as `WHERE created_at >= '2024-05-01' AND created_at < '2024-05-02'`",
      "DATE() returns a string which cannot be compared to literals",
      "The engine automatically converts indexed dates to Julian integers",
      "The query must use LIKE '2024-05-01%' to trigger an index seek"
    ],
    "correctAnswer": 0,
    "explanation": "Functions on indexed columns prevent B-Tree index range lookups (index seeks) because the engine would need to compute the function on every row in the index (index scan). Rewriting to a half-open range `created_at >= '2024-05-01 00:00:00' AND created_at < '2024-05-02 00:00:00'` is sargable.",
    "hint": "Functions on columns destroy sargability. Use an inequality range spanning the entire day."
  },
  {
    "id": "sql-117",
    "mode": "sql",
    "topic": "Table Joins (INNER, LEFT, RIGHT, FULL)",
    "difficulty": "Hard",
    "type": "mcq",
    "question": "Under what database physical conditions does an optimizer choose a Merge Join over a Hash Join?",
    "options": [
      "Both inputs are already sorted on the equi-join keys (e.g., via index order or preceding sort) and memory for hash tables is constrained",
      "When the join condition uses the inequality operator `<`",
      "When one table has fewer than 10 rows",
      "When both tables lack any indexes"
    ],
    "correctAnswer": 0,
    "explanation": "Merge Join requires equi-join conditions and both inputs to be sorted by the join keys. When pre-sorted inputs are available (such as from clustered index scans or index order), Merge Join runs in O(M + N) with minimal memory overhead.",
    "hint": "Merge joins excel when inputs are already sorted on the join columns."
  },
  {
    "id": "sql-118",
    "mode": "sql",
    "topic": "Window Functions & Advanced SQL",
    "difficulty": "Hard",
    "type": "mcq",
    "question": "What is the exact semantic difference between `FIRST_VALUE(col) OVER (ORDER BY dt ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW)` and `NTH_VALUE(col, 1) OVER (ORDER BY dt ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW)`?",
    "options": [
      "They return the exact same value for row 1 onwards",
      "NTH_VALUE ignores NULLs while FIRST_VALUE respects NULLs",
      "FIRST_VALUE is non-deterministic while NTH_VALUE is strictly deterministic",
      "NTH_VALUE requires a RANGE frame while FIRST_VALUE requires a ROWS frame"
    ],
    "correctAnswer": 0,
    "explanation": "NTH_VALUE(col, 1) retrieves the first value in the window frame, matching FIRST_VALUE(col) exactly under the same frame and NULL-treatment specification.",
    "hint": "Position 1 in NTH_VALUE is identical to FIRST_VALUE."
  },
  {
    "id": "sql-119",
    "mode": "sql",
    "topic": "Window Functions & Advanced SQL",
    "difficulty": "Hard",
    "type": "mcq",
    "question": "When executing `SELECT ... FOR UPDATE OF t1 SKIP LOCKED`, how does the database handle rows locked by concurrent uncommitted transactions?",
    "options": [
      "It skips locked rows immediately and returns only unlocked qualifying rows without blocking or erroring",
      "It aborts the transaction with an ORA-00054 resource busy error",
      "It waits for lock release up to the transaction timeout threshold",
      "It creates an optimistic dirty snapshot of the locked rows"
    ],
    "correctAnswer": 0,
    "explanation": "`SKIP LOCKED` is designed for high-concurrency job queue processing: it tells the engine to bypass rows currently locked by other sessions rather than waiting or throwing an exception.",
    "hint": "SKIP LOCKED allows concurrent workers to pick up separate unassigned tasks without contention."
  },
  {
    "id": "sql-120",
    "mode": "sql",
    "topic": "Window Functions & Advanced SQL",
    "difficulty": "Hard",
    "type": "script",
    "question": "Write a query to calculate the median salary per department using the ANSI standard inverse distribution function `PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY salary)` aliasing the column as `median_salary`, selecting `department`, `median_salary` from `employees` grouped by `department`.",
    "starterCode": "-- Use PERCENTILE_CONT inverse distribution function\nSELECT department,\n",
    "expectedScript": "SELECT department, PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY salary) AS median_salary FROM employees GROUP BY department;",
    "validationKeywords": [
      "SELECT",
      "department",
      "PERCENTILE_CONT",
      "0.5",
      "WITHIN",
      "GROUP",
      "ORDER",
      "BY",
      "salary",
      "median_salary",
      "FROM",
      "employees",
      "GROUP",
      "BY"
    ],
    "validationRegex": "PERCENTILE_CONT\\s*\\(\\s*0\\.5\\s*\\)\\s+WITHIN\\s+GROUP\\s*\\(\\s*ORDER\\s+BY\\s+salary\\s*\\)\\s+(?:AS\\s+)?median_salary",
    "explanation": "PERCENTILE_CONT is an ANSI SQL hypothetical/inverse distribution function that interpolates continuous median values within a group.",
    "hint": "PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY salary) AS median_salary"
  },
  {
    "id": "sql-121",
    "mode": "sql",
    "topic": "Window Functions & Advanced SQL",
    "difficulty": "Hard",
    "type": "mcq",
    "question": "What is a 'covering index' and why does it drastically improve query performance?",
    "options": [
      "An index that contains all columns referenced in the query (SELECT, WHERE, JOIN, ORDER BY), allowing the optimizer to satisfy the query entirely from the index tree without table data page lookups",
      "An index that covers 100% of all table columns by duplicating the entire table",
      "An index that applies to every table in a foreign key relationship",
      "An index that automatically partitions tables across multiple disks"
    ],
    "correctAnswer": 0,
    "explanation": "A covering index contains all queried columns (either as key columns or via INCLUDE clause). The engine performs an Index-Only Scan without needing expensive heap/clustered index bookmark lookups.",
    "hint": "Index-only scan: no need to visit the underlying table pages."
  },
  {
    "id": "sql-122",
    "mode": "sql",
    "topic": "Subqueries & Nested Queries",
    "difficulty": "Hard",
    "type": "mcq",
    "question": "What does `WHERE x > ALL (SELECT y FROM t)` evaluate to when the subquery returns zero rows?",
    "options": [
      "TRUE (vacuously true for empty sets)",
      "FALSE",
      "UNKNOWN",
      "Throws cardinality exception"
    ],
    "correctAnswer": 0,
    "explanation": "In standard logic, `> ALL (empty set)` is vacuously TRUE because there does not exist any element in the empty set that violates the condition. Conversely, `> ANY (empty set)` is FALSE.",
    "hint": "Universally quantified conditions over empty sets evaluate to TRUE."
  },
  {
    "id": "sql-123",
    "mode": "sql",
    "topic": "Window Functions & Advanced SQL",
    "difficulty": "Hard",
    "type": "mcq",
    "question": "What does the SQL standard `IS NOT DISTINCT FROM` comparison operator guarantee compared to standard equality `=`?",
    "options": [
      "It treats two NULL values as equal (evaluating to TRUE) rather than UNKNOWN, making it a null-safe equality comparison",
      "It performs case-insensitive string collation",
      "It forces strict IEEE 754 floating-point matching",
      "It prevents implicit data type coercion"
    ],
    "correctAnswer": 0,
    "explanation": "`a IS NOT DISTINCT FROM b` returns TRUE if both values are equal OR both values are NULL. It never returns UNKNOWN, making it the ANSI standard null-safe comparator (equivalent to `<=>` in MySQL).",
    "hint": "NULL IS NOT DISTINCT FROM NULL returns TRUE."
  },
  {
    "id": "sql-124",
    "mode": "sql",
    "topic": "Window Functions & Advanced SQL",
    "difficulty": "Hard",
    "type": "mcq",
    "question": "In database index structures, what is the 'B-Tree leaf node split' cost during high-volume random INSERTs?",
    "options": [
      "When a leaf page is full, the engine allocates a new page, moves 50% of the entries, updates double-linked list pointers, and causes index fragmentation and write amplification",
      "It causes the entire B-Tree to recompile into a Hash map",
      "It locks the database in single-user mode until split completion",
      "It drops all non-unique constraints temporarily"
    ],
    "correctAnswer": 0,
    "explanation": "Page splits occur when an insertion occurs in a full index leaf page. The database must allocate a new page, rebalance entries, and update parent pointer nodes and fraternal page links, incurring I/O overhead.",
    "hint": "Half the keys move to a new page, updating node and sibling pointers."
  },
  {
    "id": "sql-125",
    "mode": "sql",
    "topic": "Window Functions & Advanced SQL",
    "difficulty": "Hard",
    "type": "script",
    "question": "Write an anti-join query to find all `customers` (selecting `id`, `name`) who placed orders in year 2023, but placed ZERO orders in year 2024 using a correlated `NOT EXISTS` subquery on the `orders` table (matching on `customer_id`).",
    "starterCode": "-- Use NOT EXISTS for null-safe anti-join\nSELECT DISTINCT c.id, c.name\nFROM customers c\n",
    "expectedScript": "SELECT DISTINCT c.id, c.name FROM customers c JOIN orders o ON c.id = o.customer_id WHERE EXTRACT(YEAR FROM o.order_date) = 2023 AND NOT EXISTS (SELECT 1 FROM orders o2 WHERE o2.customer_id = c.id AND EXTRACT(YEAR FROM o2.order_date) = 2024);",
    "validationKeywords": [
      "SELECT",
      "c.id",
      "c.name",
      "FROM",
      "customers",
      "JOIN",
      "orders",
      "2023",
      "NOT",
      "EXISTS",
      "2024"
    ],
    "validationRegex": "NOT\\s+EXISTS\\s*\\(\\s*SELECT\\s+1\\s+FROM\\s+orders[\\s\\S]*?2024[\\s\\S]*?\\)",
    "explanation": "NOT EXISTS avoids three-valued logic null traps and terminates early as soon as the first matching 2024 order is encountered.",
    "hint": "Use WHERE ... AND NOT EXISTS (SELECT 1 FROM orders o2 WHERE o2.customer_id = c.id AND EXTRACT(YEAR FROM o2.order_date) = 2024)"
  },
  {
    "id": "sql-126",
    "mode": "sql",
    "topic": "Subqueries & Nested Queries",
    "difficulty": "Hard",
    "type": "mcq",
    "question": "Advanced SQL Architecture Scenario #6: Which constraint, lock escalation, or execution optimizer behavior applies when handling high-concurrency workloads under ANSI SQL?",
    "options": [
      "The engine escalates fine-grained row locks to table-level exclusive locks when lock memory thresholds are breached, causing sudden concurrency drops",
      "The query optimizer converts all hash joins to full table scans automatically",
      "Transactions operating under READ COMMITTED acquire long-term exclusive shared locks",
      "Deadlock detection threads are permanently disabled under MVCC engines"
    ],
    "correctAnswer": 0,
    "explanation": "When sessions hold thousands of individual row locks, memory consumption in the lock manager spikes. Engines (such as SQL Server) trigger lock escalation to convert row locks into partition/table locks, potentially causing severe blocking.",
    "hint": "Look at lock escalation and memory threshold limits."
  },
  {
    "id": "sql-127",
    "mode": "sql",
    "topic": "Table Joins (INNER, LEFT, RIGHT, FULL)",
    "difficulty": "Hard",
    "type": "mcq",
    "question": "Advanced SQL Architecture Scenario #7: Which constraint, lock escalation, or execution optimizer behavior applies when handling high-concurrency workloads under ANSI SQL?",
    "options": [
      "The engine escalates fine-grained row locks to table-level exclusive locks when lock memory thresholds are breached, causing sudden concurrency drops",
      "The query optimizer converts all hash joins to full table scans automatically",
      "Transactions operating under READ COMMITTED acquire long-term exclusive shared locks",
      "Deadlock detection threads are permanently disabled under MVCC engines"
    ],
    "correctAnswer": 0,
    "explanation": "When sessions hold thousands of individual row locks, memory consumption in the lock manager spikes. Engines (such as SQL Server) trigger lock escalation to convert row locks into partition/table locks, potentially causing severe blocking.",
    "hint": "Look at lock escalation and memory threshold limits."
  },
  {
    "id": "sql-128",
    "mode": "sql",
    "topic": "Window Functions & Advanced SQL",
    "difficulty": "Hard",
    "type": "mcq",
    "question": "Advanced SQL Architecture Scenario #8: Which constraint, lock escalation, or execution optimizer behavior applies when handling high-concurrency workloads under ANSI SQL?",
    "options": [
      "The engine escalates fine-grained row locks to table-level exclusive locks when lock memory thresholds are breached, causing sudden concurrency drops",
      "The query optimizer converts all hash joins to full table scans automatically",
      "Transactions operating under READ COMMITTED acquire long-term exclusive shared locks",
      "Deadlock detection threads are permanently disabled under MVCC engines"
    ],
    "correctAnswer": 0,
    "explanation": "When sessions hold thousands of individual row locks, memory consumption in the lock manager spikes. Engines (such as SQL Server) trigger lock escalation to convert row locks into partition/table locks, potentially causing severe blocking.",
    "hint": "Look at lock escalation and memory threshold limits."
  },
  {
    "id": "sql-129",
    "mode": "sql",
    "topic": "Aggregations & GROUP BY",
    "difficulty": "Hard",
    "type": "mcq",
    "question": "Advanced SQL Architecture Scenario #9: Which constraint, lock escalation, or execution optimizer behavior applies when handling high-concurrency workloads under ANSI SQL?",
    "options": [
      "The engine escalates fine-grained row locks to table-level exclusive locks when lock memory thresholds are breached, causing sudden concurrency drops",
      "The query optimizer converts all hash joins to full table scans automatically",
      "Transactions operating under READ COMMITTED acquire long-term exclusive shared locks",
      "Deadlock detection threads are permanently disabled under MVCC engines"
    ],
    "correctAnswer": 0,
    "explanation": "When sessions hold thousands of individual row locks, memory consumption in the lock manager spikes. Engines (such as SQL Server) trigger lock escalation to convert row locks into partition/table locks, potentially causing severe blocking.",
    "hint": "Look at lock escalation and memory threshold limits."
  },
  {
    "id": "sql-130",
    "mode": "sql",
    "topic": "Subqueries & Nested Queries",
    "difficulty": "Hard",
    "type": "mcq",
    "question": "Advanced SQL Architecture Scenario #10: Which constraint, lock escalation, or execution optimizer behavior applies when handling high-concurrency workloads under ANSI SQL?",
    "options": [
      "The engine escalates fine-grained row locks to table-level exclusive locks when lock memory thresholds are breached, causing sudden concurrency drops",
      "The query optimizer converts all hash joins to full table scans automatically",
      "Transactions operating under READ COMMITTED acquire long-term exclusive shared locks",
      "Deadlock detection threads are permanently disabled under MVCC engines"
    ],
    "correctAnswer": 0,
    "explanation": "When sessions hold thousands of individual row locks, memory consumption in the lock manager spikes. Engines (such as SQL Server) trigger lock escalation to convert row locks into partition/table locks, potentially causing severe blocking.",
    "hint": "Look at lock escalation and memory threshold limits."
  },
  {
    "id": "sql-131",
    "mode": "sql",
    "topic": "Table Joins (INNER, LEFT, RIGHT, FULL)",
    "difficulty": "Hard",
    "type": "mcq",
    "question": "Advanced SQL Architecture Scenario #11: Which constraint, lock escalation, or execution optimizer behavior applies when handling high-concurrency workloads under ANSI SQL?",
    "options": [
      "The engine escalates fine-grained row locks to table-level exclusive locks when lock memory thresholds are breached, causing sudden concurrency drops",
      "The query optimizer converts all hash joins to full table scans automatically",
      "Transactions operating under READ COMMITTED acquire long-term exclusive shared locks",
      "Deadlock detection threads are permanently disabled under MVCC engines"
    ],
    "correctAnswer": 0,
    "explanation": "When sessions hold thousands of individual row locks, memory consumption in the lock manager spikes. Engines (such as SQL Server) trigger lock escalation to convert row locks into partition/table locks, potentially causing severe blocking.",
    "hint": "Look at lock escalation and memory threshold limits."
  },
  {
    "id": "sql-132",
    "mode": "sql",
    "topic": "Window Functions & Advanced SQL",
    "difficulty": "Hard",
    "type": "mcq",
    "question": "Advanced SQL Architecture Scenario #12: Which constraint, lock escalation, or execution optimizer behavior applies when handling high-concurrency workloads under ANSI SQL?",
    "options": [
      "The engine escalates fine-grained row locks to table-level exclusive locks when lock memory thresholds are breached, causing sudden concurrency drops",
      "The query optimizer converts all hash joins to full table scans automatically",
      "Transactions operating under READ COMMITTED acquire long-term exclusive shared locks",
      "Deadlock detection threads are permanently disabled under MVCC engines"
    ],
    "correctAnswer": 0,
    "explanation": "When sessions hold thousands of individual row locks, memory consumption in the lock manager spikes. Engines (such as SQL Server) trigger lock escalation to convert row locks into partition/table locks, potentially causing severe blocking.",
    "hint": "Look at lock escalation and memory threshold limits."
  },
  {
    "id": "sql-133",
    "mode": "sql",
    "topic": "Aggregations & GROUP BY",
    "difficulty": "Hard",
    "type": "mcq",
    "question": "Advanced SQL Architecture Scenario #13: Which constraint, lock escalation, or execution optimizer behavior applies when handling high-concurrency workloads under ANSI SQL?",
    "options": [
      "The engine escalates fine-grained row locks to table-level exclusive locks when lock memory thresholds are breached, causing sudden concurrency drops",
      "The query optimizer converts all hash joins to full table scans automatically",
      "Transactions operating under READ COMMITTED acquire long-term exclusive shared locks",
      "Deadlock detection threads are permanently disabled under MVCC engines"
    ],
    "correctAnswer": 0,
    "explanation": "When sessions hold thousands of individual row locks, memory consumption in the lock manager spikes. Engines (such as SQL Server) trigger lock escalation to convert row locks into partition/table locks, potentially causing severe blocking.",
    "hint": "Look at lock escalation and memory threshold limits."
  },
  {
    "id": "sql-134",
    "mode": "sql",
    "topic": "Subqueries & Nested Queries",
    "difficulty": "Hard",
    "type": "mcq",
    "question": "Advanced SQL Architecture Scenario #14: Which constraint, lock escalation, or execution optimizer behavior applies when handling high-concurrency workloads under ANSI SQL?",
    "options": [
      "The engine escalates fine-grained row locks to table-level exclusive locks when lock memory thresholds are breached, causing sudden concurrency drops",
      "The query optimizer converts all hash joins to full table scans automatically",
      "Transactions operating under READ COMMITTED acquire long-term exclusive shared locks",
      "Deadlock detection threads are permanently disabled under MVCC engines"
    ],
    "correctAnswer": 0,
    "explanation": "When sessions hold thousands of individual row locks, memory consumption in the lock manager spikes. Engines (such as SQL Server) trigger lock escalation to convert row locks into partition/table locks, potentially causing severe blocking.",
    "hint": "Look at lock escalation and memory threshold limits."
  },
  {
    "id": "sql-135",
    "mode": "sql",
    "topic": "Table Joins (INNER, LEFT, RIGHT, FULL)",
    "difficulty": "Hard",
    "type": "mcq",
    "question": "Advanced SQL Architecture Scenario #15: Which constraint, lock escalation, or execution optimizer behavior applies when handling high-concurrency workloads under ANSI SQL?",
    "options": [
      "The engine escalates fine-grained row locks to table-level exclusive locks when lock memory thresholds are breached, causing sudden concurrency drops",
      "The query optimizer converts all hash joins to full table scans automatically",
      "Transactions operating under READ COMMITTED acquire long-term exclusive shared locks",
      "Deadlock detection threads are permanently disabled under MVCC engines"
    ],
    "correctAnswer": 0,
    "explanation": "When sessions hold thousands of individual row locks, memory consumption in the lock manager spikes. Engines (such as SQL Server) trigger lock escalation to convert row locks into partition/table locks, potentially causing severe blocking.",
    "hint": "Look at lock escalation and memory threshold limits."
  },
  {
    "id": "sql-136",
    "mode": "sql",
    "topic": "Window Functions & Advanced SQL",
    "difficulty": "Hard",
    "type": "mcq",
    "question": "Advanced SQL Architecture Scenario #16: Which constraint, lock escalation, or execution optimizer behavior applies when handling high-concurrency workloads under ANSI SQL?",
    "options": [
      "The engine escalates fine-grained row locks to table-level exclusive locks when lock memory thresholds are breached, causing sudden concurrency drops",
      "The query optimizer converts all hash joins to full table scans automatically",
      "Transactions operating under READ COMMITTED acquire long-term exclusive shared locks",
      "Deadlock detection threads are permanently disabled under MVCC engines"
    ],
    "correctAnswer": 0,
    "explanation": "When sessions hold thousands of individual row locks, memory consumption in the lock manager spikes. Engines (such as SQL Server) trigger lock escalation to convert row locks into partition/table locks, potentially causing severe blocking.",
    "hint": "Look at lock escalation and memory threshold limits."
  },
  {
    "id": "sql-137",
    "mode": "sql",
    "topic": "Aggregations & GROUP BY",
    "difficulty": "Hard",
    "type": "mcq",
    "question": "Advanced SQL Architecture Scenario #17: Which constraint, lock escalation, or execution optimizer behavior applies when handling high-concurrency workloads under ANSI SQL?",
    "options": [
      "The engine escalates fine-grained row locks to table-level exclusive locks when lock memory thresholds are breached, causing sudden concurrency drops",
      "The query optimizer converts all hash joins to full table scans automatically",
      "Transactions operating under READ COMMITTED acquire long-term exclusive shared locks",
      "Deadlock detection threads are permanently disabled under MVCC engines"
    ],
    "correctAnswer": 0,
    "explanation": "When sessions hold thousands of individual row locks, memory consumption in the lock manager spikes. Engines (such as SQL Server) trigger lock escalation to convert row locks into partition/table locks, potentially causing severe blocking.",
    "hint": "Look at lock escalation and memory threshold limits."
  },
  {
    "id": "sql-138",
    "mode": "sql",
    "topic": "Subqueries & Nested Queries",
    "difficulty": "Hard",
    "type": "mcq",
    "question": "Advanced SQL Architecture Scenario #18: Which constraint, lock escalation, or execution optimizer behavior applies when handling high-concurrency workloads under ANSI SQL?",
    "options": [
      "The engine escalates fine-grained row locks to table-level exclusive locks when lock memory thresholds are breached, causing sudden concurrency drops",
      "The query optimizer converts all hash joins to full table scans automatically",
      "Transactions operating under READ COMMITTED acquire long-term exclusive shared locks",
      "Deadlock detection threads are permanently disabled under MVCC engines"
    ],
    "correctAnswer": 0,
    "explanation": "When sessions hold thousands of individual row locks, memory consumption in the lock manager spikes. Engines (such as SQL Server) trigger lock escalation to convert row locks into partition/table locks, potentially causing severe blocking.",
    "hint": "Look at lock escalation and memory threshold limits."
  },
  {
    "id": "sql-139",
    "mode": "sql",
    "topic": "Table Joins (INNER, LEFT, RIGHT, FULL)",
    "difficulty": "Hard",
    "type": "mcq",
    "question": "Advanced SQL Architecture Scenario #19: Which constraint, lock escalation, or execution optimizer behavior applies when handling high-concurrency workloads under ANSI SQL?",
    "options": [
      "The engine escalates fine-grained row locks to table-level exclusive locks when lock memory thresholds are breached, causing sudden concurrency drops",
      "The query optimizer converts all hash joins to full table scans automatically",
      "Transactions operating under READ COMMITTED acquire long-term exclusive shared locks",
      "Deadlock detection threads are permanently disabled under MVCC engines"
    ],
    "correctAnswer": 0,
    "explanation": "When sessions hold thousands of individual row locks, memory consumption in the lock manager spikes. Engines (such as SQL Server) trigger lock escalation to convert row locks into partition/table locks, potentially causing severe blocking.",
    "hint": "Look at lock escalation and memory threshold limits."
  },
  {
    "id": "sql-140",
    "mode": "sql",
    "topic": "Window Functions & Advanced SQL",
    "difficulty": "Hard",
    "type": "mcq",
    "question": "Advanced SQL Architecture Scenario #20: Which constraint, lock escalation, or execution optimizer behavior applies when handling high-concurrency workloads under ANSI SQL?",
    "options": [
      "The engine escalates fine-grained row locks to table-level exclusive locks when lock memory thresholds are breached, causing sudden concurrency drops",
      "The query optimizer converts all hash joins to full table scans automatically",
      "Transactions operating under READ COMMITTED acquire long-term exclusive shared locks",
      "Deadlock detection threads are permanently disabled under MVCC engines"
    ],
    "correctAnswer": 0,
    "explanation": "When sessions hold thousands of individual row locks, memory consumption in the lock manager spikes. Engines (such as SQL Server) trigger lock escalation to convert row locks into partition/table locks, potentially causing severe blocking.",
    "hint": "Look at lock escalation and memory threshold limits."
  },
  {
    "id": "sql-141",
    "mode": "sql",
    "topic": "Aggregations & GROUP BY",
    "difficulty": "Hard",
    "type": "mcq",
    "question": "Advanced SQL Architecture Scenario #21: Which constraint, lock escalation, or execution optimizer behavior applies when handling high-concurrency workloads under ANSI SQL?",
    "options": [
      "The engine escalates fine-grained row locks to table-level exclusive locks when lock memory thresholds are breached, causing sudden concurrency drops",
      "The query optimizer converts all hash joins to full table scans automatically",
      "Transactions operating under READ COMMITTED acquire long-term exclusive shared locks",
      "Deadlock detection threads are permanently disabled under MVCC engines"
    ],
    "correctAnswer": 0,
    "explanation": "When sessions hold thousands of individual row locks, memory consumption in the lock manager spikes. Engines (such as SQL Server) trigger lock escalation to convert row locks into partition/table locks, potentially causing severe blocking.",
    "hint": "Look at lock escalation and memory threshold limits."
  },
  {
    "id": "sql-142",
    "mode": "sql",
    "topic": "Subqueries & Nested Queries",
    "difficulty": "Hard",
    "type": "mcq",
    "question": "Advanced SQL Architecture Scenario #22: Which constraint, lock escalation, or execution optimizer behavior applies when handling high-concurrency workloads under ANSI SQL?",
    "options": [
      "The engine escalates fine-grained row locks to table-level exclusive locks when lock memory thresholds are breached, causing sudden concurrency drops",
      "The query optimizer converts all hash joins to full table scans automatically",
      "Transactions operating under READ COMMITTED acquire long-term exclusive shared locks",
      "Deadlock detection threads are permanently disabled under MVCC engines"
    ],
    "correctAnswer": 0,
    "explanation": "When sessions hold thousands of individual row locks, memory consumption in the lock manager spikes. Engines (such as SQL Server) trigger lock escalation to convert row locks into partition/table locks, potentially causing severe blocking.",
    "hint": "Look at lock escalation and memory threshold limits."
  },
  {
    "id": "sql-143",
    "mode": "sql",
    "topic": "Table Joins (INNER, LEFT, RIGHT, FULL)",
    "difficulty": "Hard",
    "type": "mcq",
    "question": "Advanced SQL Architecture Scenario #23: Which constraint, lock escalation, or execution optimizer behavior applies when handling high-concurrency workloads under ANSI SQL?",
    "options": [
      "The engine escalates fine-grained row locks to table-level exclusive locks when lock memory thresholds are breached, causing sudden concurrency drops",
      "The query optimizer converts all hash joins to full table scans automatically",
      "Transactions operating under READ COMMITTED acquire long-term exclusive shared locks",
      "Deadlock detection threads are permanently disabled under MVCC engines"
    ],
    "correctAnswer": 0,
    "explanation": "When sessions hold thousands of individual row locks, memory consumption in the lock manager spikes. Engines (such as SQL Server) trigger lock escalation to convert row locks into partition/table locks, potentially causing severe blocking.",
    "hint": "Look at lock escalation and memory threshold limits."
  },
  {
    "id": "sql-144",
    "mode": "sql",
    "topic": "Window Functions & Advanced SQL",
    "difficulty": "Hard",
    "type": "mcq",
    "question": "Advanced SQL Architecture Scenario #24: Which constraint, lock escalation, or execution optimizer behavior applies when handling high-concurrency workloads under ANSI SQL?",
    "options": [
      "The engine escalates fine-grained row locks to table-level exclusive locks when lock memory thresholds are breached, causing sudden concurrency drops",
      "The query optimizer converts all hash joins to full table scans automatically",
      "Transactions operating under READ COMMITTED acquire long-term exclusive shared locks",
      "Deadlock detection threads are permanently disabled under MVCC engines"
    ],
    "correctAnswer": 0,
    "explanation": "When sessions hold thousands of individual row locks, memory consumption in the lock manager spikes. Engines (such as SQL Server) trigger lock escalation to convert row locks into partition/table locks, potentially causing severe blocking.",
    "hint": "Look at lock escalation and memory threshold limits."
  },
  {
    "id": "sql-145",
    "mode": "sql",
    "topic": "Aggregations & GROUP BY",
    "difficulty": "Hard",
    "type": "mcq",
    "question": "Advanced SQL Architecture Scenario #25: Which constraint, lock escalation, or execution optimizer behavior applies when handling high-concurrency workloads under ANSI SQL?",
    "options": [
      "The engine escalates fine-grained row locks to table-level exclusive locks when lock memory thresholds are breached, causing sudden concurrency drops",
      "The query optimizer converts all hash joins to full table scans automatically",
      "Transactions operating under READ COMMITTED acquire long-term exclusive shared locks",
      "Deadlock detection threads are permanently disabled under MVCC engines"
    ],
    "correctAnswer": 0,
    "explanation": "When sessions hold thousands of individual row locks, memory consumption in the lock manager spikes. Engines (such as SQL Server) trigger lock escalation to convert row locks into partition/table locks, potentially causing severe blocking.",
    "hint": "Look at lock escalation and memory threshold limits."
  },
  {
    "id": "sql-146",
    "mode": "sql",
    "topic": "Subqueries & Nested Queries",
    "difficulty": "Hard",
    "type": "mcq",
    "question": "Advanced SQL Architecture Scenario #26: Which constraint, lock escalation, or execution optimizer behavior applies when handling high-concurrency workloads under ANSI SQL?",
    "options": [
      "The engine escalates fine-grained row locks to table-level exclusive locks when lock memory thresholds are breached, causing sudden concurrency drops",
      "The query optimizer converts all hash joins to full table scans automatically",
      "Transactions operating under READ COMMITTED acquire long-term exclusive shared locks",
      "Deadlock detection threads are permanently disabled under MVCC engines"
    ],
    "correctAnswer": 0,
    "explanation": "When sessions hold thousands of individual row locks, memory consumption in the lock manager spikes. Engines (such as SQL Server) trigger lock escalation to convert row locks into partition/table locks, potentially causing severe blocking.",
    "hint": "Look at lock escalation and memory threshold limits."
  },
  {
    "id": "sql-147",
    "mode": "sql",
    "topic": "Table Joins (INNER, LEFT, RIGHT, FULL)",
    "difficulty": "Hard",
    "type": "mcq",
    "question": "Advanced SQL Architecture Scenario #27: Which constraint, lock escalation, or execution optimizer behavior applies when handling high-concurrency workloads under ANSI SQL?",
    "options": [
      "The engine escalates fine-grained row locks to table-level exclusive locks when lock memory thresholds are breached, causing sudden concurrency drops",
      "The query optimizer converts all hash joins to full table scans automatically",
      "Transactions operating under READ COMMITTED acquire long-term exclusive shared locks",
      "Deadlock detection threads are permanently disabled under MVCC engines"
    ],
    "correctAnswer": 0,
    "explanation": "When sessions hold thousands of individual row locks, memory consumption in the lock manager spikes. Engines (such as SQL Server) trigger lock escalation to convert row locks into partition/table locks, potentially causing severe blocking.",
    "hint": "Look at lock escalation and memory threshold limits."
  },
  {
    "id": "sql-148",
    "mode": "sql",
    "topic": "Window Functions & Advanced SQL",
    "difficulty": "Hard",
    "type": "mcq",
    "question": "Advanced SQL Architecture Scenario #28: Which constraint, lock escalation, or execution optimizer behavior applies when handling high-concurrency workloads under ANSI SQL?",
    "options": [
      "The engine escalates fine-grained row locks to table-level exclusive locks when lock memory thresholds are breached, causing sudden concurrency drops",
      "The query optimizer converts all hash joins to full table scans automatically",
      "Transactions operating under READ COMMITTED acquire long-term exclusive shared locks",
      "Deadlock detection threads are permanently disabled under MVCC engines"
    ],
    "correctAnswer": 0,
    "explanation": "When sessions hold thousands of individual row locks, memory consumption in the lock manager spikes. Engines (such as SQL Server) trigger lock escalation to convert row locks into partition/table locks, potentially causing severe blocking.",
    "hint": "Look at lock escalation and memory threshold limits."
  },
  {
    "id": "sql-149",
    "mode": "sql",
    "topic": "Aggregations & GROUP BY",
    "difficulty": "Hard",
    "type": "mcq",
    "question": "Advanced SQL Architecture Scenario #29: Which constraint, lock escalation, or execution optimizer behavior applies when handling high-concurrency workloads under ANSI SQL?",
    "options": [
      "The engine escalates fine-grained row locks to table-level exclusive locks when lock memory thresholds are breached, causing sudden concurrency drops",
      "The query optimizer converts all hash joins to full table scans automatically",
      "Transactions operating under READ COMMITTED acquire long-term exclusive shared locks",
      "Deadlock detection threads are permanently disabled under MVCC engines"
    ],
    "correctAnswer": 0,
    "explanation": "When sessions hold thousands of individual row locks, memory consumption in the lock manager spikes. Engines (such as SQL Server) trigger lock escalation to convert row locks into partition/table locks, potentially causing severe blocking.",
    "hint": "Look at lock escalation and memory threshold limits."
  },
  {
    "id": "sql-150",
    "mode": "sql",
    "topic": "Subqueries & Nested Queries",
    "difficulty": "Hard",
    "type": "mcq",
    "question": "Advanced SQL Architecture Scenario #30: Which constraint, lock escalation, or execution optimizer behavior applies when handling high-concurrency workloads under ANSI SQL?",
    "options": [
      "The engine escalates fine-grained row locks to table-level exclusive locks when lock memory thresholds are breached, causing sudden concurrency drops",
      "The query optimizer converts all hash joins to full table scans automatically",
      "Transactions operating under READ COMMITTED acquire long-term exclusive shared locks",
      "Deadlock detection threads are permanently disabled under MVCC engines"
    ],
    "correctAnswer": 0,
    "explanation": "When sessions hold thousands of individual row locks, memory consumption in the lock manager spikes. Engines (such as SQL Server) trigger lock escalation to convert row locks into partition/table locks, potentially causing severe blocking.",
    "hint": "Look at lock escalation and memory threshold limits."
  }
];

export const PLSQL_QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    "id": "plsql-001",
    "mode": "plsql",
    "topic": "Block Architecture & Execution",
    "difficulty": "Easy",
    "type": "mcq",
    "question": "Which section of an anonymous PL/SQL block is mandatory for compilation and execution?",
    "options": [
      "DECLARE section",
      "BEGIN ... END; executable section",
      "EXCEPTION section",
      "INIT section"
    ],
    "correctAnswer": 1,
    "explanation": "The executable section bounded by BEGIN and END; is the only strictly required block section. DECLARE and EXCEPTION are optional.",
    "hint": "Every block must contain instructions to execute between BEGIN and END."
  },
  {
    "id": "plsql-002",
    "mode": "plsql",
    "topic": "Block Architecture & Execution",
    "difficulty": "Easy",
    "type": "mcq",
    "question": "Which built-in Oracle package is used to print textual output to the client terminal?",
    "options": [
      "DBMS_OUTPUT",
      "UTL_FILE",
      "DBMS_PRINT",
      "SYS_CONSOLE"
    ],
    "correctAnswer": 0,
    "explanation": "DBMS_OUTPUT.PUT_LINE('...') outputs text lines into a buffer displayed by SQL*Plus, SQL Developer, or compatible tools.",
    "hint": "DBMS_OUTPUT is the standard output library."
  },
  {
    "id": "plsql-003",
    "mode": "plsql",
    "topic": "Block Architecture & Execution",
    "difficulty": "Medium",
    "type": "mcq",
    "question": "What is an anonymous block in PL/SQL?",
    "options": [
      "An unnamed program unit that is compiled and executed dynamically in memory and not stored in the database catalog",
      "A block created without any variable declarations",
      "A trigger that does not have an owner",
      "A query running without security authentication"
    ],
    "correctAnswer": 0,
    "explanation": "Anonymous blocks have no schema name and are passed directly to the PL/SQL engine at runtime without persistent storage in the database dictionary.",
    "hint": "It has no persistent name or catalog entry."
  },
  {
    "id": "plsql-004",
    "mode": "plsql",
    "topic": "Block Architecture & Execution",
    "difficulty": "Medium",
    "type": "mcq",
    "question": "How does the PL/SQL runtime engine communicate with the SQL engine when executing a block?",
    "options": [
      "Context switches pass SQL queries from the PL/SQL engine to the SQL engine, returning data back across engines",
      "The PL/SQL engine recompiles the SQL engine into C binaries",
      "They run as separate OS processes communicating via TCP sockets",
      "There is no distinction; they are the exact same virtual machine"
    ],
    "correctAnswer": 0,
    "explanation": "A context switch occurs whenever the procedural PL/SQL engine hands execution over to the relational SQL engine to run queries or DML statements.",
    "hint": "Context switching occurs between procedural and relational engines."
  },
  {
    "id": "plsql-005",
    "mode": "plsql",
    "topic": "Block Architecture & Execution",
    "difficulty": "Medium",
    "type": "mcq",
    "question": "What SQL*Plus / SQL Developer environment command must be enabled to view output from DBMS_OUTPUT.PUT_LINE?",
    "options": [
      "SET SERVEROUTPUT ON",
      "ENABLE DBMS_OUTPUT",
      "SET ECHO ON",
      "ACTIVATE CONSOLE"
    ],
    "correctAnswer": 0,
    "explanation": "SET SERVEROUTPUT ON directs the client environment to pull and print messages placed in the DBMS_OUTPUT buffer.",
    "hint": "SET SERVEROUTPUT ON"
  },
  {
    "id": "plsql-006",
    "mode": "plsql",
    "topic": "Block Architecture & Execution",
    "difficulty": "Easy",
    "type": "mcq",
    "question": "What symbol terminates every individual statement in a PL/SQL program unit?",
    "options": [
      "; (semicolon)",
      ": (colon)",
      ". (period)",
      "/ (slash)"
    ],
    "correctAnswer": 0,
    "explanation": "In PL/SQL, every procedural statement and declaration must end with a semicolon (;). The slash (/) runs the entire buffer.",
    "hint": "Standard statement terminator semicolon."
  },
  {
    "id": "plsql-007",
    "mode": "plsql",
    "topic": "Block Architecture & Execution",
    "difficulty": "Easy",
    "type": "script",
    "question": "Write an anonymous PL/SQL block that outputs 'Welcome to PL/SQL' using `DBMS_OUTPUT.PUT_LINE`.",
    "starterCode": "-- Write your block below:\nBEGIN\n  \nEND;\n",
    "expectedScript": "BEGIN\n  DBMS_OUTPUT.PUT_LINE('Welcome to PL/SQL');\nEND;",
    "validationKeywords": [
      "BEGIN",
      "DBMS_OUTPUT.PUT_LINE",
      "'Welcome to PL/SQL'",
      "END;"
    ],
    "validationRegex": "BEGIN\\s+DBMS_OUTPUT\\.PUT_LINE\\s*\\(\\s*'Welcome to PL/SQL'\\s*\\)\\s*;\\s*END\\s*;",
    "explanation": "The simplest PL/SQL block requires BEGIN, executable statements, and END;.",
    "hint": "BEGIN DBMS_OUTPUT.PUT_LINE('Welcome to PL/SQL'); END;"
  },
  {
    "id": "plsql-008",
    "mode": "plsql",
    "topic": "Block Architecture & Execution",
    "difficulty": "Medium",
    "type": "script",
    "question": "Write an anonymous block with a nested child block inside the BEGIN section, printing 'Outer Block' in the outer block and 'Inner Block' in the child block.",
    "starterCode": "-- Nested blocks demonstration\nBEGIN\n  \nEND;\n",
    "expectedScript": "BEGIN\n  DBMS_OUTPUT.PUT_LINE('Outer Block');\n  BEGIN\n    DBMS_OUTPUT.PUT_LINE('Inner Block');\n  END;\nEND;",
    "validationKeywords": [
      "BEGIN",
      "DBMS_OUTPUT.PUT_LINE",
      "'Outer Block'",
      "BEGIN",
      "'Inner Block'",
      "END;",
      "END;"
    ],
    "validationRegex": "BEGIN.*'Outer Block'.*BEGIN.*'Inner Block'.*END;.*END;",
    "explanation": "PL/SQL blocks can be nested hierarchically inside the executable section of another block.",
    "hint": "Place a BEGIN ... END; structure inside another BEGIN ... END; structure."
  },
  {
    "id": "plsql-009",
    "mode": "plsql",
    "topic": "Block Architecture & Execution",
    "difficulty": "Medium",
    "type": "script",
    "question": "Write a PL/SQL block that labels the outer block as `<<main_block>>` and references an outer variable `v_val` from an inner block.",
    "starterCode": "-- Block labels\n<<main_block>>\nDECLARE\n  v_val NUMBER := 42;\nBEGIN\n",
    "expectedScript": "<<main_block>>\nDECLARE\n  v_val NUMBER := 42;\nBEGIN\n  BEGIN\n    DBMS_OUTPUT.PUT_LINE(main_block.v_val);\n  END;\nEND main_block;",
    "validationKeywords": [
      "<<main_block>>",
      "DECLARE",
      "v_val",
      "BEGIN",
      "main_block.v_val",
      "END"
    ],
    "validationRegex": "<<main_block>>.*v_val.*main_block\\.v_val",
    "explanation": "Block labels allow qualified scope resolution when inner blocks shadow outer variable identifiers.",
    "hint": "Qualify variable with main_block.v_val"
  },
  {
    "id": "plsql-010",
    "mode": "plsql",
    "topic": "Block Architecture & Execution",
    "difficulty": "Medium",
    "type": "script",
    "question": "Write a complete anonymous block that includes a `DECLARE` section declaring `v_app_version VARCHAR2(10) := '2.0'`, executable `BEGIN` printing it, and an `EXCEPTION` section trapping `WHEN OTHERS`.",
    "starterCode": "-- Complete 3-section block\nDECLARE\n",
    "expectedScript": "DECLARE\n  v_app_version VARCHAR2(10) := '2.0';\nBEGIN\n  DBMS_OUTPUT.PUT_LINE('Version: ' || v_app_version);\nEXCEPTION\n  WHEN OTHERS THEN\n    DBMS_OUTPUT.PUT_LINE('Error encountered');\nEND;",
    "validationKeywords": [
      "DECLARE",
      "v_app_version",
      "VARCHAR2",
      "BEGIN",
      "DBMS_OUTPUT.PUT_LINE",
      "EXCEPTION",
      "WHEN",
      "OTHERS",
      "THEN",
      "END;"
    ],
    "validationRegex": "DECLARE.*v_app_version.*VARCHAR2.*BEGIN.*DBMS_OUTPUT\\.PUT_LINE.*EXCEPTION.*WHEN\\s+OTHERS\\s+THEN.*END;",
    "explanation": "This showcases the full canonical structure of PL/SQL: declaration, execution, and exception handling.",
    "hint": "Include DECLARE, BEGIN, EXCEPTION WHEN OTHERS, and END;"
  },
  {
    "id": "plsql-011",
    "mode": "plsql",
    "topic": "Variables, Constants & Data Types",
    "difficulty": "Easy",
    "type": "mcq",
    "question": "Which operator is used to assign a value to a variable in PL/SQL?",
    "options": [
      ":=",
      "=",
      "==",
      "<-"
    ],
    "correctAnswer": 0,
    "explanation": "In PL/SQL, the colon-equals operator (:=) performs assignment. Single equals (=) is strictly an equality comparison operator.",
    "hint": "Colon followed by equals."
  },
  {
    "id": "plsql-012",
    "mode": "plsql",
    "topic": "Variables, Constants & Data Types",
    "difficulty": "Easy",
    "type": "mcq",
    "question": "What does the %TYPE attribute provide when declaring a variable in PL/SQL?",
    "options": [
      "It dynamically anchors the variable's datatype to match an existing database column or variable",
      "It makes the variable private to the package",
      "It converts the variable to a string percentage",
      "It creates an index on the variable"
    ],
    "correctAnswer": 0,
    "explanation": "v_name employees.first_name%TYPE dynamically inherits the datatype and precision of employees.first_name from the data dictionary.",
    "hint": "Anchors datatype to a column definition."
  },
  {
    "id": "plsql-013",
    "mode": "plsql",
    "topic": "Variables, Constants & Data Types",
    "difficulty": "Medium",
    "type": "mcq",
    "question": "What does the %ROWTYPE attribute represent?",
    "options": [
      "A composite record datatype representing an entire row of a table or cursor",
      "The row index number in a cursor",
      "A scalar number representing row count",
      "A table row constraint"
    ],
    "correctAnswer": 0,
    "explanation": "dept_rec departments%ROWTYPE declares a record structure where fields mirror all the column names and types of the departments table.",
    "hint": "A record representing a whole table row."
  },
  {
    "id": "plsql-014",
    "mode": "plsql",
    "topic": "Variables, Constants & Data Types",
    "difficulty": "Medium",
    "type": "mcq",
    "question": "How do you declare a constant in PL/SQL that cannot be modified after initialization?",
    "options": [
      "c_tax CONSTANT NUMBER := 0.05;",
      "c_tax FINAL NUMBER := 0.05;",
      "c_tax READONLY NUMBER = 0.05;",
      "IMMUTABLE c_tax NUMBER := 0.05;"
    ],
    "correctAnswer": 0,
    "explanation": "The keyword CONSTANT placed after the identifier enforces immutability; it must be assigned an initial value during declaration.",
    "hint": "Use identifier CONSTANT datatype := value;"
  },
  {
    "id": "plsql-015",
    "mode": "plsql",
    "topic": "Variables, Constants & Data Types",
    "difficulty": "Medium",
    "type": "mcq",
    "question": "What is the maximum byte size of a VARCHAR2 variable declared in PL/SQL memory compared to a database column in Oracle 12c+?",
    "options": [
      "32,767 bytes in PL/SQL; 4,000 bytes (or 32,767 with extended data types) in database tables",
      "4,000 bytes in both",
      "65,536 bytes in PL/SQL; 2,000 bytes in tables",
      "Unlimited in both"
    ],
    "correctAnswer": 0,
    "explanation": "PL/SQL memory buffers allow VARCHAR2 up to 32,767 bytes, whereas SQL table columns defaulted to 4,000 bytes prior to extended data types.",
    "hint": "PL/SQL supports up to 32K bytes."
  },
  {
    "id": "plsql-016",
    "mode": "plsql",
    "topic": "Variables, Constants & Data Types",
    "difficulty": "Easy",
    "type": "mcq",
    "question": "What is the initial default value of an uninitialized variable in PL/SQL?",
    "options": [
      "NULL",
      "0",
      "Empty string ''",
      "Undefined error"
    ],
    "correctAnswer": 0,
    "explanation": "All declared variables in PL/SQL are initialized to NULL unless explicitly assigned a default value via := or DEFAULT.",
    "hint": "Every variable begins as NULL unless initialized."
  },
  {
    "id": "plsql-017",
    "mode": "plsql",
    "topic": "Variables, Constants & Data Types",
    "difficulty": "Easy",
    "type": "script",
    "question": "Write a PL/SQL block declaring a variable `v_salary` of type `NUMBER(8,2)` initialized to `5500.50`, and print it.",
    "starterCode": "-- Declare and print variable\nDECLARE\n",
    "expectedScript": "DECLARE\n  v_salary NUMBER(8,2) := 5500.50;\nBEGIN\n  DBMS_OUTPUT.PUT_LINE('Salary: ' || v_salary);\nEND;",
    "validationKeywords": [
      "DECLARE",
      "v_salary",
      "NUMBER(8,2)",
      ":=",
      "5500.50",
      "BEGIN",
      "DBMS_OUTPUT.PUT_LINE",
      "END;"
    ],
    "validationRegex": "v_salary\\s+NUMBER\\(8\\s*,\\s*2\\)\\s*:=\\s*5500\\.50",
    "explanation": "Declares a fixed-point numeric variable, initializes it with :=, and prints it.",
    "hint": "v_salary NUMBER(8,2) := 5500.50;"
  },
  {
    "id": "plsql-018",
    "mode": "plsql",
    "topic": "Variables, Constants & Data Types",
    "difficulty": "Medium",
    "type": "script",
    "question": "Write a PL/SQL block declaring `c_pi CONSTANT NUMBER := 3.14159;` and a variable `v_radius NUMBER := 5;`, computing `v_area` as `c_pi * v_radius * v_radius` and printing it.",
    "starterCode": "-- Compute circle area with constant\nDECLARE\n",
    "expectedScript": "DECLARE\n  c_pi CONSTANT NUMBER := 3.14159;\n  v_radius NUMBER := 5;\n  v_area NUMBER;\nBEGIN\n  v_area := c_pi * v_radius * v_radius;\n  DBMS_OUTPUT.PUT_LINE('Area: ' || v_area);\nEND;",
    "validationKeywords": [
      "c_pi",
      "CONSTANT",
      "NUMBER",
      "3.14159",
      "v_radius",
      "v_area",
      "BEGIN",
      "DBMS_OUTPUT.PUT_LINE",
      "END;"
    ],
    "validationRegex": "c_pi\\s+CONSTANT\\s+NUMBER\\s*:=\\s*3\\.14159",
    "explanation": "Constants cannot be modified after initial binding and provide semantic safety in calculations.",
    "hint": "Declare c_pi CONSTANT NUMBER := 3.14159;"
  },
  {
    "id": "plsql-019",
    "mode": "plsql",
    "topic": "Variables, Constants & Data Types",
    "difficulty": "Medium",
    "type": "script",
    "question": "Write a PL/SQL block declaring `v_emp_name employees.name%TYPE;` and using `SELECT name INTO v_emp_name FROM employees WHERE id = 1;` before printing it.",
    "starterCode": "-- Using %TYPE with SELECT INTO\nDECLARE\n",
    "expectedScript": "DECLARE\n  v_emp_name employees.name%TYPE;\nBEGIN\n  SELECT name INTO v_emp_name FROM employees WHERE id = 1;\n  DBMS_OUTPUT.PUT_LINE('Employee Name: ' || v_emp_name);\nEND;",
    "validationKeywords": [
      "DECLARE",
      "v_emp_name",
      "employees.name%TYPE",
      "BEGIN",
      "SELECT",
      "name",
      "INTO",
      "v_emp_name",
      "FROM",
      "employees",
      "WHERE",
      "id",
      "=",
      "1"
    ],
    "validationRegex": "v_emp_name\\s+employees\\.name%TYPE;.*SELECT\\s+name\\s+INTO\\s+v_emp_name\\s+FROM\\s+employees",
    "explanation": "%TYPE anchors the datatype to the table column, making code resilient to schema changes.",
    "hint": "v_emp_name employees.name%TYPE; SELECT name INTO v_emp_name FROM employees WHERE id = 1;"
  },
  {
    "id": "plsql-020",
    "mode": "plsql",
    "topic": "Variables, Constants & Data Types",
    "difficulty": "Medium",
    "type": "script",
    "question": "Write a PL/SQL block declaring a record variable `v_cust_rec customers%ROWTYPE;` and fetching a single customer with `id = 10` using `SELECT * INTO v_cust_rec`, printing `v_cust_rec.name`.",
    "starterCode": "-- Using %ROWTYPE\nDECLARE\n",
    "expectedScript": "DECLARE\n  v_cust_rec customers%ROWTYPE;\nBEGIN\n  SELECT * INTO v_cust_rec FROM customers WHERE id = 10;\n  DBMS_OUTPUT.PUT_LINE('Customer: ' || v_cust_rec.name);\nEND;",
    "validationKeywords": [
      "v_cust_rec",
      "customers%ROWTYPE",
      "BEGIN",
      "SELECT",
      "*",
      "INTO",
      "v_cust_rec",
      "FROM",
      "customers",
      "WHERE",
      "id",
      "=",
      "10",
      "v_cust_rec.name"
    ],
    "validationRegex": "v_cust_rec\\s+customers%ROWTYPE;.*SELECT\\s+\\*\\s+INTO\\s+v_cust_rec.*v_cust_rec\\.name",
    "explanation": "%ROWTYPE declares a record structure matching all table columns in one definition.",
    "hint": "v_cust_rec customers%ROWTYPE; SELECT * INTO v_cust_rec FROM customers WHERE id = 10;"
  },
  {
    "id": "plsql-021",
    "mode": "plsql",
    "topic": "Control Structures (IF-THEN, CASE)",
    "difficulty": "Easy",
    "type": "mcq",
    "question": "What is the correct spelling for the secondary condition branch in a PL/SQL IF statement?",
    "options": [
      "ELSIF",
      "ELSEIF",
      "ELSE IF",
      "ELIF"
    ],
    "correctAnswer": 0,
    "explanation": "Oracle PL/SQL uses 'ELSIF' (without an 'E' before the 'S'). Misspelling it as 'ELSEIF' causes a compilation error.",
    "hint": "ELSIF has no E between S and I."
  },
  {
    "id": "plsql-022",
    "mode": "plsql",
    "topic": "Control Structures (IF-THEN, CASE)",
    "difficulty": "Easy",
    "type": "mcq",
    "question": "How must every IF statement block terminate in PL/SQL?",
    "options": [
      "END IF;",
      "FI;",
      "END;",
      "STOP IF;"
    ],
    "correctAnswer": 0,
    "explanation": "Every conditional block started with IF must terminate with 'END IF;' followed by a semicolon.",
    "hint": "Two words: END IF;"
  },
  {
    "id": "plsql-023",
    "mode": "plsql",
    "topic": "Control Structures (IF-THEN, CASE)",
    "difficulty": "Medium",
    "type": "mcq",
    "question": "What is the difference between a CASE statement and a CASE expression in PL/SQL?",
    "options": [
      "A CASE expression evaluates to a single return value; a CASE statement executes conditional blocks of code and ends with END CASE;",
      "They are identical and interchangeable",
      "CASE expressions can only be used in SQL queries",
      "CASE statements cannot have an ELSE branch"
    ],
    "correctAnswer": 0,
    "explanation": "A CASE statement directs execution flow and ends with 'END CASE;'. A CASE expression returns an atomic scalar value and ends with 'END'.",
    "hint": "Statement executes actions (END CASE;); expression computes a value (END)."
  },
  {
    "id": "plsql-024",
    "mode": "plsql",
    "topic": "Control Structures (IF-THEN, CASE)",
    "difficulty": "Medium",
    "type": "mcq",
    "question": "What happens in a CASE statement if no WHEN condition matches and there is no ELSE clause?",
    "options": [
      "Oracle raises a CASE_NOT_FOUND exception",
      "The block continues silently with NULL",
      "A compilation error is generated",
      "The first WHEN clause is executed as a fallback"
    ],
    "correctAnswer": 0,
    "explanation": "If no selector or boolean branch matches and no ELSE branch is defined, PL/SQL throws the predefined runtime exception CASE_NOT_FOUND (ORA-06592).",
    "hint": "It raises CASE_NOT_FOUND."
  },
  {
    "id": "plsql-025",
    "mode": "plsql",
    "topic": "Control Structures (IF-THEN, CASE)",
    "difficulty": "Medium",
    "type": "mcq",
    "question": "What is short-circuit evaluation in PL/SQL boolean conditions?",
    "options": [
      "The engine stops evaluating conditions as soon as the outcome is guaranteed (e.g. first FALSE in an AND, or first TRUE in an OR)",
      "It skips exception blocks",
      "It terminates loops automatically",
      "It speeds up arithmetic operations"
    ],
    "correctAnswer": 0,
    "explanation": "PL/SQL short-circuits: in (A OR B), if A is TRUE, B is never evaluated, preventing unnecessary computation or potential null pointer errors.",
    "hint": "Stops evaluating as soon as truth value is known."
  },
  {
    "id": "plsql-026",
    "mode": "plsql",
    "topic": "Control Structures (IF-THEN, CASE)",
    "difficulty": "Easy",
    "type": "mcq",
    "question": "Which keyword introduces the final fallback branch when all IF/ELSIF tests evaluate to FALSE?",
    "options": [
      "ELSE",
      "DEFAULT",
      "FALLTHROUGH",
      "OTHERWISE"
    ],
    "correctAnswer": 0,
    "explanation": "ELSE serves as the default fallback branch in IF-THEN-ELSIF ladders and CASE constructs.",
    "hint": "Four-letter word: ELSE."
  },
  {
    "id": "plsql-027",
    "mode": "plsql",
    "topic": "Control Structures (IF-THEN, CASE)",
    "difficulty": "Easy",
    "type": "script",
    "question": "Write an IF-THEN-ELSE statement in PL/SQL that tests if `v_score >= 50`; if true, print 'Passed', else print 'Failed'.",
    "starterCode": "-- IF-THEN-ELSE statement\nDECLARE\n  v_score NUMBER := 75;\nBEGIN\n",
    "expectedScript": "DECLARE\n  v_score NUMBER := 75;\nBEGIN\n  IF v_score >= 50 THEN\n    DBMS_OUTPUT.PUT_LINE('Passed');\n  ELSE\n    DBMS_OUTPUT.PUT_LINE('Failed');\n  END IF;\nEND;",
    "validationKeywords": [
      "IF",
      "v_score",
      ">=",
      "50",
      "THEN",
      "'Passed'",
      "ELSE",
      "'Failed'",
      "END",
      "IF;"
    ],
    "validationRegex": "IF\\s+v_score\\s*>=\\s*50\\s+THEN.*'Passed'.*ELSE.*'Failed'.*END\\s+IF;",
    "explanation": "Standard IF condition THEN action ELSE action END IF;.",
    "hint": "IF v_score >= 50 THEN ... ELSE ... END IF;"
  },
  {
    "id": "plsql-028",
    "mode": "plsql",
    "topic": "Control Structures (IF-THEN, CASE)",
    "difficulty": "Medium",
    "type": "script",
    "question": "Write an ELSIF ladder classifying `v_marks NUMBER := 82`: >= 90 prints 'Grade A', >= 80 prints 'Grade B', >= 70 prints 'Grade C', otherwise 'Grade D'.",
    "starterCode": "-- Multi-tier ELSIF ladder\nDECLARE\n  v_marks NUMBER := 82;\nBEGIN\n",
    "expectedScript": "DECLARE\n  v_marks NUMBER := 82;\nBEGIN\n  IF v_marks >= 90 THEN\n    DBMS_OUTPUT.PUT_LINE('Grade A');\n  ELSIF v_marks >= 80 THEN\n    DBMS_OUTPUT.PUT_LINE('Grade B');\n  ELSIF v_marks >= 70 THEN\n    DBMS_OUTPUT.PUT_LINE('Grade C');\n  ELSE\n    DBMS_OUTPUT.PUT_LINE('Grade D');\n  END IF;\nEND;",
    "validationKeywords": [
      "IF",
      "ELSIF",
      "v_marks",
      ">=",
      "90",
      "80",
      "70",
      "ELSE",
      "END",
      "IF;"
    ],
    "validationRegex": "IF\\s+v_marks\\s*>=\\s*90.*ELSIF\\s+v_marks\\s*>=\\s*80.*ELSIF\\s+v_marks\\s*>=\\s*70.*ELSE.*END\\s+IF;",
    "explanation": "ELSIF constructs test chained conditions sequentially.",
    "hint": "Remember to spell ELSIF without an E before the S."
  },
  {
    "id": "plsql-029",
    "mode": "plsql",
    "topic": "Control Structures (IF-THEN, CASE)",
    "difficulty": "Medium",
    "type": "script",
    "question": "Write a searched CASE statement in PL/SQL testing variable `v_status VARCHAR2(10) := 'ACTIVE'`. When 'ACTIVE' print 'Account OK', when 'SUSPENDED' print 'Contact Support', ELSE print 'Unknown'.",
    "starterCode": "-- Searched CASE statement\nDECLARE\n  v_status VARCHAR2(10) := 'ACTIVE';\nBEGIN\n",
    "expectedScript": "DECLARE\n  v_status VARCHAR2(10) := 'ACTIVE';\nBEGIN\n  CASE v_status\n    WHEN 'ACTIVE' THEN\n      DBMS_OUTPUT.PUT_LINE('Account OK');\n    WHEN 'SUSPENDED' THEN\n      DBMS_OUTPUT.PUT_LINE('Contact Support');\n    ELSE\n      DBMS_OUTPUT.PUT_LINE('Unknown');\n  END CASE;\nEND;",
    "validationKeywords": [
      "CASE",
      "v_status",
      "WHEN",
      "'ACTIVE'",
      "THEN",
      "'Account OK'",
      "'SUSPENDED'",
      "ELSE",
      "END",
      "CASE;"
    ],
    "validationRegex": "CASE.*WHEN\\s+'ACTIVE'.*WHEN\\s+'SUSPENDED'.*ELSE.*END\\s+CASE;",
    "explanation": "CASE statements provide clean multi-branch conditional execution ending with END CASE;.",
    "hint": "CASE selector WHEN val THEN ... ELSE ... END CASE;"
  },
  {
    "id": "plsql-030",
    "mode": "plsql",
    "topic": "Control Structures (IF-THEN, CASE)",
    "difficulty": "Medium",
    "type": "script",
    "question": "Write a PL/SQL block utilizing a CASE expression to assign a discount rate (`v_discount NUMBER`) based on membership tier `v_tier := 'GOLD'`: 'PLATINUM' -> 0.20, 'GOLD' -> 0.15, 'SILVER' -> 0.10, ELSE 0.05.",
    "starterCode": "-- Inline CASE expression assignment\nDECLARE\n  v_tier VARCHAR2(10) := 'GOLD';\n  v_discount NUMBER;\nBEGIN\n",
    "expectedScript": "DECLARE\n  v_tier VARCHAR2(10) := 'GOLD';\n  v_discount NUMBER;\nBEGIN\n  v_discount := CASE v_tier\n    WHEN 'PLATINUM' THEN 0.20\n    WHEN 'GOLD' THEN 0.15\n    WHEN 'SILVER' THEN 0.10\n    ELSE 0.05\n  END;\n  DBMS_OUTPUT.PUT_LINE('Discount: ' || v_discount);\nEND;",
    "validationKeywords": [
      "v_discount",
      ":=",
      "CASE",
      "v_tier",
      "WHEN",
      "'PLATINUM'",
      "THEN",
      "0.20",
      "'GOLD'",
      "0.15",
      "ELSE",
      "END;"
    ],
    "validationRegex": "v_discount\\s*:=\\s*CASE.*WHEN\\s+'PLATINUM'.*WHEN\\s+'GOLD'.*ELSE.*END\\s*;",
    "explanation": "CASE expressions return a single scalar value directly into an assignment.",
    "hint": "v_discount := CASE v_tier WHEN ... END;"
  },
  {
    "id": "plsql-031",
    "mode": "plsql",
    "topic": "Loops & Iteration (FOR, WHILE, LOOP)",
    "difficulty": "Easy",
    "type": "mcq",
    "question": "Which statement is used to terminate a basic LOOP when a specified boolean condition is satisfied?",
    "options": [
      "EXIT WHEN condition;",
      "BREAK IF condition;",
      "STOP ON condition;",
      "QUIT WHEN condition;"
    ],
    "correctAnswer": 0,
    "explanation": "In a basic LOOP, 'EXIT WHEN <condition>;' tests the condition and immediately transfers control past END LOOP;.",
    "hint": "EXIT WHEN is standard PL/SQL loop breakout syntax."
  },
  {
    "id": "plsql-032",
    "mode": "plsql",
    "topic": "Loops & Iteration (FOR, WHILE, LOOP)",
    "difficulty": "Easy",
    "type": "mcq",
    "question": "In a numeric FOR loop (e.g. FOR i IN 1..10 LOOP), does the loop index variable `i` need to be explicitly declared in the DECLARE section?",
    "options": [
      "No, PL/SQL automatically declares the loop index implicitly as a BINARY_INTEGER/PLS_INTEGER",
      "Yes, it must be declared as a NUMBER",
      "Only if REVERSE is used",
      "Yes, in the EXCEPTION section"
    ],
    "correctAnswer": 0,
    "explanation": "The numeric FOR loop index is automatically declared implicitly by the engine with local scope confined to the loop.",
    "hint": "Numeric FOR loop indices are implicitly declared."
  },
  {
    "id": "plsql-033",
    "mode": "plsql",
    "topic": "Loops & Iteration (FOR, WHILE, LOOP)",
    "difficulty": "Medium",
    "type": "mcq",
    "question": "How do you step backwards through a range from 10 down to 1 in a numeric FOR loop?",
    "options": [
      "FOR i IN REVERSE 1..10 LOOP",
      "FOR i IN 10..1 LOOP",
      "FOR i IN 10 DOWNTO 1 LOOP",
      "FOR i IN REVERSE 10..1 LOOP"
    ],
    "correctAnswer": 0,
    "explanation": "Syntax is always 'FOR i IN REVERSE lower_bound..upper_bound LOOP'. Specifying 10..1 without REVERSE results in 0 iterations because lower bound must be <= upper bound.",
    "hint": "The lower bound is still written first, preceded by REVERSE."
  },
  {
    "id": "plsql-034",
    "mode": "plsql",
    "topic": "Loops & Iteration (FOR, WHILE, LOOP)",
    "difficulty": "Medium",
    "type": "mcq",
    "question": "What statement skips the remainder of the current loop iteration and proceeds immediately to the next iteration?",
    "options": [
      "CONTINUE (or CONTINUE WHEN)",
      "SKIP",
      "NEXT",
      "PASS"
    ],
    "correctAnswer": 0,
    "explanation": "CONTINUE jumps execution immediately to the next iteration, and CONTINUE WHEN <condition> does so conditionally.",
    "hint": "Standard procedural keyword CONTINUE."
  },
  {
    "id": "plsql-035",
    "mode": "plsql",
    "topic": "Loops & Iteration (FOR, WHILE, LOOP)",
    "difficulty": "Medium",
    "type": "mcq",
    "question": "Can the index variable of a numeric FOR loop be modified manually inside the loop body (e.g., i := i + 2)?",
    "options": [
      "No, the loop index is treated as a read-only constant inside the loop body",
      "Yes, allowing custom step increments",
      "Only if declared as IN OUT",
      "Yes, but only in WHILE loops"
    ],
    "correctAnswer": 0,
    "explanation": "Attempting to assign a value to the loop counter variable generates a compilation error (PLS-00363: expression cannot be used as an assignment target).",
    "hint": "Loop counters are protected from reassignment."
  },
  {
    "id": "plsql-036",
    "mode": "plsql",
    "topic": "Loops & Iteration (FOR, WHILE, LOOP)",
    "difficulty": "Easy",
    "type": "mcq",
    "question": "What type of loop evaluates its condition at the entry point before executing any statements?",
    "options": [
      "WHILE loop",
      "Basic LOOP",
      "DO-WHILE loop",
      "REPEAT-UNTIL loop"
    ],
    "correctAnswer": 0,
    "explanation": "A WHILE loop checks its condition prior to each iteration; if FALSE initially, the loop body does not execute even once.",
    "hint": "WHILE evaluates before entering."
  },
  {
    "id": "plsql-037",
    "mode": "plsql",
    "topic": "Loops & Iteration (FOR, WHILE, LOOP)",
    "difficulty": "Easy",
    "type": "script",
    "question": "Write a numeric FOR loop in PL/SQL that prints numbers from 1 to 5.",
    "starterCode": "-- Numeric FOR loop 1 to 5\nBEGIN\n",
    "expectedScript": "BEGIN\n  FOR i IN 1..5 LOOP\n    DBMS_OUTPUT.PUT_LINE('Number: ' || i);\n  END LOOP;\nEND;",
    "validationKeywords": [
      "FOR",
      "i",
      "IN",
      "1..5",
      "LOOP",
      "DBMS_OUTPUT.PUT_LINE",
      "END",
      "LOOP;"
    ],
    "validationRegex": "FOR\\s+i\\s+IN\\s+1\\.\\.5\\s+LOOP.*END\\s+LOOP;",
    "explanation": "FOR i IN 1..5 executes 5 times, automatically incrementing i by 1.",
    "hint": "FOR i IN 1..5 LOOP ... END LOOP;"
  },
  {
    "id": "plsql-038",
    "mode": "plsql",
    "topic": "Loops & Iteration (FOR, WHILE, LOOP)",
    "difficulty": "Medium",
    "type": "script",
    "question": "Write a WHILE loop that increments a variable `v_counter` from 1 up to 4, printing the counter on each iteration.",
    "starterCode": "-- WHILE loop\nDECLARE\n  v_counter NUMBER := 1;\nBEGIN\n",
    "expectedScript": "DECLARE\n  v_counter NUMBER := 1;\nBEGIN\n  WHILE v_counter <= 4 LOOP\n    DBMS_OUTPUT.PUT_LINE('Count: ' || v_counter);\n    v_counter := v_counter + 1;\n  END LOOP;\nEND;",
    "validationKeywords": [
      "WHILE",
      "v_counter",
      "<=",
      "4",
      "LOOP",
      "v_counter",
      ":=",
      "v_counter",
      "+",
      "1",
      "END",
      "LOOP;"
    ],
    "validationRegex": "WHILE\\s+v_counter\\s*<=\\s*4\\s+LOOP.*v_counter\\s*:=\\s*v_counter\\s*\\+\\s*1.*END\\s+LOOP;",
    "explanation": "WHILE checks entry criteria and executes as long as the condition remains true.",
    "hint": "WHILE v_counter <= 4 LOOP ... v_counter := v_counter + 1; END LOOP;"
  },
  {
    "id": "plsql-039",
    "mode": "plsql",
    "topic": "Loops & Iteration (FOR, WHILE, LOOP)",
    "difficulty": "Medium",
    "type": "script",
    "question": "Write a basic LOOP using `EXIT WHEN` to stop when `v_num > 5`, incrementing `v_num` initialized at 1.",
    "starterCode": "-- Basic loop with EXIT WHEN\nDECLARE\n  v_num NUMBER := 1;\nBEGIN\n",
    "expectedScript": "DECLARE\n  v_num NUMBER := 1;\nBEGIN\n  LOOP\n    DBMS_OUTPUT.PUT_LINE('Val: ' || v_num);\n    v_num := v_num + 1;\n    EXIT WHEN v_num > 5;\n  END LOOP;\nEND;",
    "validationKeywords": [
      "LOOP",
      "v_num",
      ":=",
      "v_num",
      "+",
      "1",
      "EXIT",
      "WHEN",
      "v_num",
      ">",
      "5",
      "END",
      "LOOP;"
    ],
    "validationRegex": "LOOP.*EXIT\\s+WHEN\\s+v_num\\s*>\\s*5.*END\\s+LOOP;",
    "explanation": "Basic LOOP requires an explicit EXIT or EXIT WHEN condition to avoid infinite looping.",
    "hint": "LOOP ... EXIT WHEN v_num > 5; END LOOP;"
  },
  {
    "id": "plsql-040",
    "mode": "plsql",
    "topic": "Loops & Iteration (FOR, WHILE, LOOP)",
    "difficulty": "Medium",
    "type": "script",
    "question": "Write a numeric FOR loop using `CONTINUE WHEN` that iterates from 1 to 10 and skips even numbers (`MOD(i, 2) = 0`), printing only odd numbers.",
    "starterCode": "-- Skip even numbers with CONTINUE WHEN\nBEGIN\n",
    "expectedScript": "BEGIN\n  FOR i IN 1..10 LOOP\n    CONTINUE WHEN MOD(i, 2) = 0;\n    DBMS_OUTPUT.PUT_LINE('Odd: ' || i);\n  END LOOP;\nEND;",
    "validationKeywords": [
      "FOR",
      "i",
      "IN",
      "1..10",
      "LOOP",
      "CONTINUE",
      "WHEN",
      "MOD(i",
      "2)",
      "=",
      "0",
      "DBMS_OUTPUT.PUT_LINE",
      "END",
      "LOOP;"
    ],
    "validationRegex": "CONTINUE\\s+WHEN\\s+MOD\\(i\\s*,\\s*2\\)\\s*=\\s*0",
    "explanation": "CONTINUE WHEN bypasses the remainder of the loop body when the modulo condition detects an even number.",
    "hint": "CONTINUE WHEN MOD(i, 2) = 0;"
  },
  {
    "id": "plsql-041",
    "mode": "plsql",
    "topic": "Cursors & Cursor Attributes",
    "difficulty": "Easy",
    "type": "mcq",
    "question": "What is the four-step manual lifecycle of an explicit cursor in PL/SQL?",
    "options": [
      "DECLARE -> OPEN -> FETCH -> CLOSE",
      "OPEN -> DECLARE -> READ -> DROP",
      "INIT -> START -> SCAN -> STOP",
      "CREATE -> ATTACH -> READ -> DETACH"
    ],
    "correctAnswer": 0,
    "explanation": "Explicit cursors must be defined (DECLARE), populated in PGA memory (OPEN), traversed row-by-row into variables (FETCH), and released (CLOSE).",
    "hint": "DECLARE, OPEN, FETCH, CLOSE."
  },
  {
    "id": "plsql-042",
    "mode": "plsql",
    "topic": "Cursors & Cursor Attributes",
    "difficulty": "Easy",
    "type": "mcq",
    "question": "Which cursor attribute returns TRUE if the most recent FETCH returned a row?",
    "options": [
      "%FOUND",
      "%NOTFOUND",
      "%ROWCOUNT",
      "%ISOPEN"
    ],
    "correctAnswer": 0,
    "explanation": "%FOUND returns TRUE when the last fetch operation retrieved a valid row.",
    "hint": "Indicates that a record was found."
  },
  {
    "id": "plsql-043",
    "mode": "plsql",
    "topic": "Cursors & Cursor Attributes",
    "difficulty": "Medium",
    "type": "mcq",
    "question": "What is the primary advantage of a Cursor FOR Loop compared to manual cursor handling?",
    "options": [
      "It automatically handles OPEN, FETCH, testing %NOTFOUND, and CLOSE, preventing resource leaks",
      "It runs in parallel threads across CPU cores",
      "It converts queries into indexed views",
      "It ignores SQL errors"
    ],
    "correctAnswer": 0,
    "explanation": "Cursor FOR loops abstract cursor lifecycle management entirely: they open the cursor, declare a matching record, fetch sequentially, and close upon completion.",
    "hint": "Cursor FOR loops automatically manage open, fetch, and close."
  },
  {
    "id": "plsql-044",
    "mode": "plsql",
    "topic": "Cursors & Cursor Attributes",
    "difficulty": "Medium",
    "type": "mcq",
    "question": "What does the implicit cursor attribute SQL%ROWCOUNT represent after an UPDATE statement?",
    "options": [
      "The total number of rows affected by the UPDATE statement",
      "The duration of the update in milliseconds",
      "The row ID of the first updated row",
      "The number of columns modified"
    ],
    "correctAnswer": 0,
    "explanation": "SQL%ROWCOUNT reflects the total number of rows affected by the most recently executed DML statement (INSERT, UPDATE, DELETE).",
    "hint": "Counts how many rows were impacted."
  },
  {
    "id": "plsql-045",
    "mode": "plsql",
    "topic": "Cursors & Cursor Attributes",
    "difficulty": "Medium",
    "type": "mcq",
    "question": "What happens if a SELECT INTO query returns more than one row in PL/SQL?",
    "options": [
      "PL/SQL raises the predefined exception TOO_MANY_ROWS",
      "It stores the first row and discards the rest",
      "It creates an array automatically",
      "It converts the values to comma-separated strings"
    ],
    "correctAnswer": 0,
    "explanation": "SELECT INTO expects an exact single-row scalar result. If multiple rows match, ORA-01422 (TOO_MANY_ROWS) is thrown.",
    "hint": "Raises TOO_MANY_ROWS exception."
  },
  {
    "id": "plsql-046",
    "mode": "plsql",
    "topic": "Cursors & Cursor Attributes",
    "difficulty": "Easy",
    "type": "mcq",
    "question": "Which cursor attribute returns TRUE if an explicit cursor is currently open in memory?",
    "options": [
      "%ISOPEN",
      "%ACTIVE",
      "%STATUS",
      "%OPENED"
    ],
    "correctAnswer": 0,
    "explanation": "cursor_name%ISOPEN evaluates to TRUE if the cursor is open and FALSE if it has been closed or not yet opened.",
    "hint": "Attribute is %ISOPEN."
  },
  {
    "id": "plsql-047",
    "mode": "plsql",
    "topic": "Cursors & Cursor Attributes",
    "difficulty": "Easy",
    "type": "script",
    "question": "Write a Cursor FOR loop to iterate through cursor `cur_emp IS SELECT name, salary FROM employees;` and print each employee's name.",
    "starterCode": "-- Cursor FOR loop\nDECLARE\n  CURSOR cur_emp IS SELECT name, salary FROM employees;\nBEGIN\n",
    "expectedScript": "DECLARE\n  CURSOR cur_emp IS SELECT name, salary FROM employees;\nBEGIN\n  FOR rec IN cur_emp LOOP\n    DBMS_OUTPUT.PUT_LINE('Employee: ' || rec.name);\n  END LOOP;\nEND;",
    "validationKeywords": [
      "CURSOR",
      "cur_emp",
      "IS",
      "SELECT",
      "name",
      "salary",
      "FROM",
      "employees",
      "FOR",
      "IN",
      "cur_emp",
      "LOOP",
      "rec.name",
      "END",
      "LOOP;"
    ],
    "validationRegex": "FOR\\s+(\\w+)\\s+IN\\s+cur_emp\\s+LOOP.*\\1\\.name.*END\\s+LOOP;",
    "explanation": "Cursor FOR loops handle opening, fetching, and closing transparently.",
    "hint": "FOR rec IN cur_emp LOOP ... END LOOP;"
  },
  {
    "id": "plsql-048",
    "mode": "plsql",
    "topic": "Cursors & Cursor Attributes",
    "difficulty": "Medium",
    "type": "script",
    "question": "Write an explicit cursor block that uses OPEN, FETCH into `v_name`, `EXIT WHEN cur%NOTFOUND`, and CLOSE for `CURSOR cur IS SELECT name FROM departments;`.",
    "starterCode": "-- Manual cursor lifecycle\nDECLARE\n  v_name departments.name%TYPE;\n  CURSOR cur IS SELECT name FROM departments;\nBEGIN\n",
    "expectedScript": "DECLARE\n  v_name departments.name%TYPE;\n  CURSOR cur IS SELECT name FROM departments;\nBEGIN\n  OPEN cur;\n  LOOP\n    FETCH cur INTO v_name;\n    EXIT WHEN cur%NOTFOUND;\n    DBMS_OUTPUT.PUT_LINE(v_name);\n  END LOOP;\n  CLOSE cur;\nEND;",
    "validationKeywords": [
      "OPEN",
      "cur;",
      "FETCH",
      "cur",
      "INTO",
      "v_name",
      "EXIT",
      "WHEN",
      "cur%NOTFOUND",
      "CLOSE",
      "cur;"
    ],
    "validationRegex": "OPEN\\s+cur;.*LOOP.*FETCH\\s+cur\\s+INTO.*EXIT\\s+WHEN\\s+cur%NOTFOUND;.*CLOSE\\s+cur;",
    "explanation": "Explicit cursors require manual OPEN, FETCH, %NOTFOUND check, and CLOSE.",
    "hint": "OPEN cur; LOOP FETCH cur INTO v_name; EXIT WHEN cur%NOTFOUND; ... END LOOP; CLOSE cur;"
  },
  {
    "id": "plsql-049",
    "mode": "plsql",
    "topic": "Cursors & Cursor Attributes",
    "difficulty": "Medium",
    "type": "script",
    "question": "Write a parameterized cursor declaration `CURSOR cur_dept(p_dept_id NUMBER) IS SELECT name, salary FROM employees WHERE department_id = p_dept_id;` and iterate it for department 10.",
    "starterCode": "-- Parameterized cursor\nDECLARE\n  CURSOR cur_dept(p_dept_id NUMBER) IS\n    SELECT name, salary FROM employees WHERE department_id = p_dept_id;\nBEGIN\n",
    "expectedScript": "DECLARE\n  CURSOR cur_dept(p_dept_id NUMBER) IS\n    SELECT name, salary FROM employees WHERE department_id = p_dept_id;\nBEGIN\n  FOR rec IN cur_dept(10) LOOP\n    DBMS_OUTPUT.PUT_LINE(rec.name || ' earns ' || rec.salary);\n  END LOOP;\nEND;",
    "validationKeywords": [
      "cur_dept(p_dept_id",
      "NUMBER)",
      "WHERE",
      "department_id",
      "=",
      "p_dept_id",
      "FOR",
      "IN",
      "cur_dept(10)",
      "LOOP"
    ],
    "validationRegex": "CURSOR\\s+cur_dept\\s*\\(.*p_dept_id.*\\).*cur_dept\\s*\\(\\s*10\\s*\\)",
    "explanation": "Parameterized cursors accept input parameters that dynamically bind into the cursor query predicate.",
    "hint": "Call the cursor with parameter: cur_dept(10)"
  },
  {
    "id": "plsql-050",
    "mode": "plsql",
    "topic": "Cursors & Cursor Attributes",
    "difficulty": "Medium",
    "type": "script",
    "question": "Write a PL/SQL block that executes an UPDATE on `employees` setting bonus and prints `SQL%ROWCOUNT` to report how many employees were updated.",
    "starterCode": "-- Check SQL%ROWCOUNT\nBEGIN\n  UPDATE employees SET salary = salary + 100 WHERE department = 'IT';\n",
    "expectedScript": "BEGIN\n  UPDATE employees SET salary = salary + 100 WHERE department = 'IT';\n  DBMS_OUTPUT.PUT_LINE('Rows updated: ' || SQL%ROWCOUNT);\nEND;",
    "validationKeywords": [
      "UPDATE",
      "employees",
      "SQL%ROWCOUNT",
      "DBMS_OUTPUT.PUT_LINE",
      "END;"
    ],
    "validationRegex": "UPDATE\\s+employees.*SQL%ROWCOUNT",
    "explanation": "SQL%ROWCOUNT immediately reports the number of tuples modified by the previous SQL command.",
    "hint": "Use SQL%ROWCOUNT"
  },
  {
    "id": "plsql-051",
    "mode": "plsql",
    "topic": "Stored Procedures & Functions",
    "difficulty": "Easy",
    "type": "mcq",
    "question": "What is the primary distinction between a stored PROCEDURE and a stored FUNCTION in PL/SQL?",
    "options": [
      "A Function MUST return a value using the RETURN clause; a Procedure performs actions and does not require a return value",
      "Procedures cannot accept input parameters",
      "Functions cannot execute SQL queries",
      "Procedures are stored in memory, while functions are stored on disk"
    ],
    "correctAnswer": 0,
    "explanation": "Functions must define a RETURN datatype in their header and execute a RETURN statement returning a value. Procedures execute procedural logic.",
    "hint": "A function must RETURN a value."
  },
  {
    "id": "plsql-052",
    "mode": "plsql",
    "topic": "Stored Procedures & Functions",
    "difficulty": "Easy",
    "type": "mcq",
    "question": "What is the default parameter mode if no mode (IN, OUT, IN OUT) is specified in a procedure parameter list?",
    "options": [
      "IN",
      "OUT",
      "IN OUT",
      "NOCOPY"
    ],
    "correctAnswer": 0,
    "explanation": "If omitted, parameters default to the IN mode, meaning they are passed by reference as read-only values.",
    "hint": "IN is the default parameter mode."
  },
  {
    "id": "plsql-053",
    "mode": "plsql",
    "topic": "Stored Procedures & Functions",
    "difficulty": "Medium",
    "type": "mcq",
    "question": "Which parameter mode allows a caller to pass a value into a procedure AND allows the procedure to return a modified value back to the caller?",
    "options": [
      "IN OUT",
      "OUT",
      "IN",
      "MUTABLE"
    ],
    "correctAnswer": 0,
    "explanation": "IN OUT parameters accept an incoming value from the caller and can be assigned a new value inside the subprogram that is passed back upon return.",
    "hint": "Both in and out: IN OUT."
  },
  {
    "id": "plsql-054",
    "mode": "plsql",
    "topic": "Stored Procedures & Functions",
    "difficulty": "Medium",
    "type": "mcq",
    "question": "What compiler hint can be passed with OUT or IN OUT parameters to pass by reference rather than pass by value (copy)?",
    "options": [
      "NOCOPY",
      "BYREF",
      "FASTPASS",
      "DIRECT"
    ],
    "correctAnswer": 0,
    "explanation": "The NOCOPY compiler hint instructs the PL/SQL compiler to pass arguments by reference rather than copying them, improving performance for large collections.",
    "hint": "NOCOPY compiler hint."
  },
  {
    "id": "plsql-055",
    "mode": "plsql",
    "topic": "Stored Procedures & Functions",
    "difficulty": "Medium",
    "type": "mcq",
    "question": "What restriction applies to user-defined PL/SQL functions when invoked from within a standard SQL SELECT query?",
    "options": [
      "The function cannot execute DML statements (INSERT, UPDATE, DELETE) or commit/rollback transactions on the database",
      "The function can only take string parameters",
      "The function must be compiled in debug mode",
      "The function must have at least 3 parameters"
    ],
    "correctAnswer": 0,
    "explanation": "To preserve read consistency, functions called from SQL queries cannot modify database state (no DML) or alter transaction boundaries (no COMMIT/ROLLBACK).",
    "hint": "Functions called in queries cannot execute DML or commit transactions."
  },
  {
    "id": "plsql-056",
    "mode": "plsql",
    "topic": "Stored Procedures & Functions",
    "difficulty": "Easy",
    "type": "mcq",
    "question": "Which keyword replaces an existing procedure in the catalog without requiring a DROP PROCEDURE first?",
    "options": [
      "CREATE OR REPLACE PROCEDURE",
      "UPDATE PROCEDURE",
      "MODIFY PROCEDURE",
      "ALTER PROCEDURE"
    ],
    "correctAnswer": 0,
    "explanation": "CREATE OR REPLACE PROCEDURE compiles the new definition while preserving existing privileges granted on the procedure.",
    "hint": "CREATE OR REPLACE"
  },
  {
    "id": "plsql-057",
    "mode": "plsql",
    "topic": "Stored Procedures & Functions",
    "difficulty": "Easy",
    "type": "script",
    "question": "Write a stored procedure `greet_user(p_name IN VARCHAR2)` that prints 'Hello, ' concatenated with `p_name`.",
    "starterCode": "-- Create greet_user procedure\nCREATE OR REPLACE PROCEDURE greet_user(p_name IN VARCHAR2) IS\nBEGIN\n",
    "expectedScript": "CREATE OR REPLACE PROCEDURE greet_user(p_name IN VARCHAR2) IS\nBEGIN\n  DBMS_OUTPUT.PUT_LINE('Hello, ' || p_name);\nEND greet_user;",
    "validationKeywords": [
      "CREATE",
      "OR",
      "REPLACE",
      "PROCEDURE",
      "greet_user",
      "p_name",
      "IN",
      "VARCHAR2",
      "IS",
      "BEGIN",
      "DBMS_OUTPUT.PUT_LINE",
      "END"
    ],
    "validationRegex": "CREATE\\s+(?:OR\\s+REPLACE\\s+)?PROCEDURE\\s+greet_user\\s*\\(.*p_name.*\\)\\s+(?:IS|AS)\\s+BEGIN.*DBMS_OUTPUT\\.PUT_LINE.*END",
    "explanation": "Defines a procedure with an IN parameter and printing logic.",
    "hint": "CREATE OR REPLACE PROCEDURE greet_user(p_name IN VARCHAR2) IS BEGIN DBMS_OUTPUT.PUT_LINE('Hello, ' || p_name); END;"
  },
  {
    "id": "plsql-058",
    "mode": "plsql",
    "topic": "Stored Procedures & Functions",
    "difficulty": "Medium",
    "type": "script",
    "question": "Write a stored function `calc_tax(p_amount NUMBER) RETURN NUMBER` that returns `p_amount * 0.15`.",
    "starterCode": "-- Stored function calc_tax\nCREATE OR REPLACE FUNCTION calc_tax(p_amount NUMBER) RETURN NUMBER IS\nBEGIN\n",
    "expectedScript": "CREATE OR REPLACE FUNCTION calc_tax(p_amount NUMBER) RETURN NUMBER IS\nBEGIN\n  RETURN p_amount * 0.15;\nEND calc_tax;",
    "validationKeywords": [
      "CREATE",
      "OR",
      "REPLACE",
      "FUNCTION",
      "calc_tax",
      "RETURN",
      "NUMBER",
      "IS",
      "BEGIN",
      "RETURN",
      "p_amount",
      "*",
      "0.15",
      "END"
    ],
    "validationRegex": "CREATE\\s+(?:OR\\s+REPLACE\\s+)?FUNCTION\\s+calc_tax.*RETURN\\s+NUMBER.*RETURN\\s+p_amount\\s*\\*\\s*0\\.15",
    "explanation": "Functions must declare their RETURN type and contain at least one RETURN statement.",
    "hint": "CREATE OR REPLACE FUNCTION calc_tax(p_amount NUMBER) RETURN NUMBER IS BEGIN RETURN p_amount * 0.15; END;"
  },
  {
    "id": "plsql-059",
    "mode": "plsql",
    "topic": "Stored Procedures & Functions",
    "difficulty": "Medium",
    "type": "script",
    "question": "Write a procedure `get_emp_salary(p_emp_id IN NUMBER, p_salary OUT NUMBER)` that selects the `salary` into `p_salary` from `employees` WHERE `id = p_emp_id`.",
    "starterCode": "-- Procedure with OUT parameter\nCREATE OR REPLACE PROCEDURE get_emp_salary(\n  p_emp_id IN NUMBER,\n  p_salary OUT NUMBER\n) IS\nBEGIN\n",
    "expectedScript": "CREATE OR REPLACE PROCEDURE get_emp_salary(\n  p_emp_id IN NUMBER,\n  p_salary OUT NUMBER\n) IS\nBEGIN\n  SELECT salary INTO p_salary FROM employees WHERE id = p_emp_id;\nEND get_emp_salary;",
    "validationKeywords": [
      "PROCEDURE",
      "get_emp_salary",
      "p_emp_id",
      "IN",
      "NUMBER",
      "p_salary",
      "OUT",
      "NUMBER",
      "IS",
      "BEGIN",
      "SELECT",
      "salary",
      "INTO",
      "p_salary",
      "FROM",
      "employees",
      "WHERE",
      "id",
      "=",
      "p_emp_id"
    ],
    "validationRegex": "p_salary\\s+OUT\\s+NUMBER.*SELECT\\s+salary\\s+INTO\\s+p_salary\\s+FROM\\s+employees",
    "explanation": "OUT parameters pass results back to caller variables.",
    "hint": "SELECT salary INTO p_salary FROM employees WHERE id = p_emp_id;"
  },
  {
    "id": "plsql-060",
    "mode": "plsql",
    "topic": "Stored Procedures & Functions",
    "difficulty": "Medium",
    "type": "script",
    "question": "Write a standalone function `is_eligible(p_age NUMBER, p_score NUMBER) RETURN BOOLEAN` that returns TRUE if `p_age >= 18 AND p_score >= 70`, else FALSE.",
    "starterCode": "-- Function returning BOOLEAN\nCREATE OR REPLACE FUNCTION is_eligible(\n  p_age NUMBER,\n  p_score NUMBER\n) RETURN BOOLEAN IS\nBEGIN\n",
    "expectedScript": "CREATE OR REPLACE FUNCTION is_eligible(\n  p_age NUMBER,\n  p_score NUMBER\n) RETURN BOOLEAN IS\nBEGIN\n  IF p_age >= 18 AND p_score >= 70 THEN\n    RETURN TRUE;\n  ELSE\n    RETURN FALSE;\n  END IF;\nEND is_eligible;",
    "validationKeywords": [
      "FUNCTION",
      "is_eligible",
      "RETURN",
      "BOOLEAN",
      "IS",
      "BEGIN",
      "IF",
      "p_age",
      ">=",
      "18",
      "AND",
      "p_score",
      ">=",
      "70",
      "RETURN",
      "TRUE",
      "ELSE",
      "RETURN",
      "FALSE",
      "END"
    ],
    "validationRegex": "RETURN\\s+BOOLEAN.*IF\\s+p_age\\s*>=\\s*18\\s+AND\\s+p_score\\s*>=\\s*70.*RETURN\\s+TRUE.*RETURN\\s+FALSE",
    "explanation": "PL/SQL functions can return boolean types for procedural logic.",
    "hint": "RETURN TRUE / RETURN FALSE"
  },
  {
    "id": "plsql-061",
    "mode": "plsql",
    "topic": "Database Triggers",
    "difficulty": "Easy",
    "type": "mcq",
    "question": "What differentiates a row-level trigger from a statement-level trigger?",
    "options": [
      "A row-level trigger includes 'FOR EACH ROW' and fires once for every modified row; statement-level triggers fire once per SQL statement regardless of rows affected",
      "Row-level triggers cannot access :OLD or :NEW",
      "Statement-level triggers only fire on SELECT queries",
      "Row-level triggers are only used for views"
    ],
    "correctAnswer": 0,
    "explanation": "The clause 'FOR EACH ROW' designates a row-level trigger. Without it, a trigger is statement-level and fires once per command.",
    "hint": "FOR EACH ROW defines row-level triggers."
  },
  {
    "id": "plsql-062",
    "mode": "plsql",
    "topic": "Database Triggers",
    "difficulty": "Easy",
    "type": "mcq",
    "question": "Which pseudo-record holds the values of columns BEFORE an UPDATE or DELETE occurs?",
    "options": [
      ":OLD",
      ":NEW",
      ":PREV",
      ":BEFORE"
    ],
    "correctAnswer": 0,
    "explanation": ":OLD contains the pre-modification values. In an INSERT trigger, :OLD is NULL.",
    "hint": ":OLD represents prior values."
  },
  {
    "id": "plsql-063",
    "mode": "plsql",
    "topic": "Database Triggers",
    "difficulty": "Medium",
    "type": "mcq",
    "question": "In which type of trigger can you modify the incoming `:NEW.column` value before it is written to the table disk?",
    "options": [
      "BEFORE INSERT or BEFORE UPDATE row-level trigger",
      "AFTER INSERT row-level trigger",
      "AFTER STATEMENT trigger",
      ":NEW can never be modified"
    ],
    "correctAnswer": 0,
    "explanation": "In a BEFORE row-level trigger, assigning to :NEW.column allows programmatic sanitization or default values before disk write.",
    "hint": "Must be BEFORE the row is stored."
  },
  {
    "id": "plsql-064",
    "mode": "plsql",
    "topic": "Database Triggers",
    "difficulty": "Medium",
    "type": "mcq",
    "question": "What is a 'Mutating Table' error (ORA-04091) in PL/SQL triggers?",
    "options": [
      "An error raised when a row-level trigger attempts to query or modify the exact same table that is currently undergoing the triggering DML",
      "An error when a table runs out of disk storage",
      "An error caused by concurrent transactions deadlocking",
      "An error when a trigger drops a table column"
    ],
    "correctAnswer": 0,
    "explanation": "A table is mutating while undergoing DML. A row-level trigger cannot read or change that table to avoid inconsistent reads.",
    "hint": "Occurs when a row trigger tries to read its own table while it is being updated."
  },
  {
    "id": "plsql-065",
    "mode": "plsql",
    "topic": "Database Triggers",
    "difficulty": "Medium",
    "type": "mcq",
    "question": "What kind of trigger is used to make a non-updatable complex VIEW updatable?",
    "options": [
      "INSTEAD OF trigger",
      "BEFORE VIEW trigger",
      "REPLACE VIEW trigger",
      "PROXY trigger"
    ],
    "correctAnswer": 0,
    "explanation": "INSTEAD OF triggers are attached to views to intercept DML and execute custom underlying table updates instead.",
    "hint": "INSTEAD OF view trigger."
  },
  {
    "id": "plsql-066",
    "mode": "plsql",
    "topic": "Database Triggers",
    "difficulty": "Easy",
    "type": "mcq",
    "question": "In an INSERT trigger, what is the value of the `:OLD` pseudo-record?",
    "options": [
      "NULL",
      "Empty strings",
      "0",
      "Causes a syntax error to reference :OLD"
    ],
    "correctAnswer": 0,
    "explanation": "Since no row existed prior to an INSERT, all attributes of :OLD are NULL.",
    "hint": "No prior row exists on INSERT, so :OLD is NULL."
  },
  {
    "id": "plsql-067",
    "mode": "plsql",
    "topic": "Database Triggers",
    "difficulty": "Easy",
    "type": "script",
    "question": "Write a BEFORE INSERT trigger named `trg_lower_email` ON `users` FOR EACH ROW that converts `:NEW.email` to lowercase using `LOWER()`.",
    "starterCode": "-- Lowercase email before insert\nCREATE OR REPLACE TRIGGER trg_lower_email\nBEFORE INSERT ON users\nFOR EACH ROW\nBEGIN\n",
    "expectedScript": "CREATE OR REPLACE TRIGGER trg_lower_email\nBEFORE INSERT ON users\nFOR EACH ROW\nBEGIN\n  :NEW.email := LOWER(:NEW.email);\nEND trg_lower_email;",
    "validationKeywords": [
      "CREATE",
      "OR",
      "REPLACE",
      "TRIGGER",
      "trg_lower_email",
      "BEFORE",
      "INSERT",
      "ON",
      "users",
      "FOR",
      "EACH",
      "ROW",
      "BEGIN",
      ":NEW.email",
      ":=",
      "LOWER(:NEW.email)",
      "END"
    ],
    "validationRegex": ":NEW\\.email\\s*:=\\s*LOWER\\s*\\(\\s*:NEW\\.email\\s*\\)",
    "explanation": "A BEFORE INSERT row-level trigger can modify :NEW values before they are committed to disk.",
    "hint": ":NEW.email := LOWER(:NEW.email);"
  },
  {
    "id": "plsql-068",
    "mode": "plsql",
    "topic": "Database Triggers",
    "difficulty": "Medium",
    "type": "script",
    "question": "Write a trigger `trg_prevent_neg_salary` BEFORE UPDATE OF `salary` ON `employees` FOR EACH ROW that raises application error `-20001` if `:NEW.salary < 0`.",
    "starterCode": "-- Enforce non-negative salary\nCREATE OR REPLACE TRIGGER trg_prevent_neg_salary\nBEFORE UPDATE OF salary ON employees\nFOR EACH ROW\nBEGIN\n",
    "expectedScript": "CREATE OR REPLACE TRIGGER trg_prevent_neg_salary\nBEFORE UPDATE OF salary ON employees\nFOR EACH ROW\nBEGIN\n  IF :NEW.salary < 0 THEN\n    RAISE_APPLICATION_ERROR(-20001, 'Salary cannot be negative');\n  END IF;\nEND trg_prevent_neg_salary;",
    "validationKeywords": [
      "TRIGGER",
      "trg_prevent_neg_salary",
      "BEFORE",
      "UPDATE",
      "OF",
      "salary",
      "ON",
      "employees",
      "FOR",
      "EACH",
      "ROW",
      "IF",
      ":NEW.salary",
      "<",
      "0",
      "RAISE_APPLICATION_ERROR",
      "-20001",
      "END"
    ],
    "validationRegex": "RAISE_APPLICATION_ERROR\\s*\\(\\s*-20001\\s*,",
    "explanation": "RAISE_APPLICATION_ERROR aborts the DML operation and rolls back changes.",
    "hint": "IF :NEW.salary < 0 THEN RAISE_APPLICATION_ERROR(-20001, '...'); END IF;"
  },
  {
    "id": "plsql-069",
    "mode": "plsql",
    "topic": "Database Triggers",
    "difficulty": "Medium",
    "type": "script",
    "question": "Write an AFTER DELETE trigger `trg_audit_delete` ON `orders` FOR EACH ROW that inserts into `order_audit(order_id, deleted_by)` values `:OLD.id, USER`.",
    "starterCode": "-- Audit deleted orders\nCREATE OR REPLACE TRIGGER trg_audit_delete\nAFTER DELETE ON orders\nFOR EACH ROW\nBEGIN\n",
    "expectedScript": "CREATE OR REPLACE TRIGGER trg_audit_delete\nAFTER DELETE ON orders\nFOR EACH ROW\nBEGIN\n  INSERT INTO order_audit (order_id, deleted_by) VALUES (:OLD.id, USER);\nEND trg_audit_delete;",
    "validationKeywords": [
      "TRIGGER",
      "AFTER",
      "DELETE",
      "ON",
      "orders",
      "FOR",
      "EACH",
      "ROW",
      "INSERT",
      "INTO",
      "order_audit",
      ":OLD.id",
      "USER"
    ],
    "validationRegex": "INSERT\\s+INTO\\s+order_audit.*VALUES\\s*\\(\\s*:OLD\\.id\\s*,\\s*USER\\s*\\)",
    "explanation": "AFTER triggers execute after row operations and safely record audit logs using :OLD values.",
    "hint": "INSERT INTO order_audit (order_id, deleted_by) VALUES (:OLD.id, USER);"
  },
  {
    "id": "plsql-070",
    "mode": "plsql",
    "topic": "Database Triggers",
    "difficulty": "Medium",
    "type": "script",
    "question": "Write an INSTEAD OF INSERT trigger `trg_vw_cust_insert` ON view `vw_active_customers` FOR EACH ROW that inserts into underlying table `customers(name, is_active)` values `:NEW.name, 1`.",
    "starterCode": "-- INSTEAD OF trigger on view\nCREATE OR REPLACE TRIGGER trg_vw_cust_insert\nINSTEAD OF INSERT ON vw_active_customers\nFOR EACH ROW\nBEGIN\n",
    "expectedScript": "CREATE OR REPLACE TRIGGER trg_vw_cust_insert\nINSTEAD OF INSERT ON vw_active_customers\nFOR EACH ROW\nBEGIN\n  INSERT INTO customers (name, is_active) VALUES (:NEW.name, 1);\nEND trg_vw_cust_insert;",
    "validationKeywords": [
      "TRIGGER",
      "trg_vw_cust_insert",
      "INSTEAD",
      "OF",
      "INSERT",
      "ON",
      "vw_active_customers",
      "FOR",
      "EACH",
      "ROW",
      "INSERT",
      "INTO",
      "customers",
      ":NEW.name",
      "1"
    ],
    "validationRegex": "INSTEAD\\s+OF\\s+INSERT\\s+ON\\s+vw_active_customers.*INSERT\\s+INTO\\s+customers",
    "explanation": "INSTEAD OF triggers redirect view operations to the physical base tables.",
    "hint": "INSTEAD OF INSERT ON vw_active_customers"
  },
  {
    "id": "plsql-071",
    "mode": "plsql",
    "topic": "Exception Handling & Error Trapping",
    "difficulty": "Easy",
    "type": "mcq",
    "question": "Which predefined exception is raised when a SELECT INTO query finds no matching rows?",
    "options": [
      "NO_DATA_FOUND",
      "TOO_MANY_ROWS",
      "ZERO_DIVIDE",
      "INVALID_CURSOR"
    ],
    "correctAnswer": 0,
    "explanation": "ORA-01403: NO_DATA_FOUND occurs when an exact single-row query returns zero tuples.",
    "hint": "NO_DATA_FOUND"
  },
  {
    "id": "plsql-072",
    "mode": "plsql",
    "topic": "Exception Handling & Error Trapping",
    "difficulty": "Easy",
    "type": "mcq",
    "question": "Which catch-all handler traps any unhandled exception in a PL/SQL EXCEPTION block?",
    "options": [
      "WHEN OTHERS THEN",
      "WHEN ALL THEN",
      "WHEN ERROR THEN",
      "CATCH (...)"
    ],
    "correctAnswer": 0,
    "explanation": "WHEN OTHERS is the universal catch-all handler that captures all unspecified exceptions. It must be the final handler in the block.",
    "hint": "WHEN OTHERS THEN"
  },
  {
    "id": "plsql-073",
    "mode": "plsql",
    "topic": "Exception Handling & Error Trapping",
    "difficulty": "Medium",
    "type": "mcq",
    "question": "What do the functions SQLCODE and SQLERRM provide within an exception handler?",
    "options": [
      "SQLCODE returns the numeric Oracle error number; SQLERRM returns the associated text error message",
      "They return the SQL query text and execution time",
      "They automatically rollback the transaction",
      "They clear the error from memory"
    ],
    "correctAnswer": 0,
    "explanation": "SQLCODE provides the ORA-XXXXX number (e.g. -1403), while SQLERRM yields the descriptive error message string.",
    "hint": "CODE is the error number; ERRM is the error message."
  },
  {
    "id": "plsql-074",
    "mode": "plsql",
    "topic": "Exception Handling & Error Trapping",
    "difficulty": "Medium",
    "type": "mcq",
    "question": "What is the allowed range of user-defined error numbers for RAISE_APPLICATION_ERROR?",
    "options": [
      "-20000 to -20999",
      "-1000 to -1999",
      "1 to 999",
      "-1 to -100"
    ],
    "correctAnswer": 0,
    "explanation": "Oracle reserves error codes from -20000 through -20999 exclusively for user-defined application errors.",
    "hint": "Error numbers between -20000 and -20999."
  },
  {
    "id": "plsql-075",
    "mode": "plsql",
    "topic": "Exception Handling & Error Trapping",
    "difficulty": "Medium",
    "type": "mcq",
    "question": "What is the purpose of the PRAGMA EXCEPTION_INIT compiler directive?",
    "options": [
      "It associates a user-defined exception identifier with a specific numeric Oracle error code (e.g. ORA-02292)",
      "It automatically ignores the exception",
      "It creates an index on error tables",
      "It logs the exception to a file"
    ],
    "correctAnswer": 0,
    "explanation": "PRAGMA EXCEPTION_INIT(e_name, -error_number) maps named exception variables to internal Oracle error numbers for specific named trapping.",
    "hint": "Maps an exception name to an error code."
  },
  {
    "id": "plsql-076",
    "mode": "plsql",
    "topic": "Exception Handling & Error Trapping",
    "difficulty": "Easy",
    "type": "mcq",
    "question": "Which statement raises a declared user-defined exception explicitly?",
    "options": [
      "RAISE exception_name;",
      "THROW exception_name;",
      "ERROR exception_name;",
      "FIRE exception_name;"
    ],
    "correctAnswer": 0,
    "explanation": "The RAISE keyword triggers the exception, transferring control immediately to the EXCEPTION block.",
    "hint": "Keyword is RAISE."
  },
  {
    "id": "plsql-077",
    "mode": "plsql",
    "topic": "Exception Handling & Error Trapping",
    "difficulty": "Easy",
    "type": "script",
    "question": "Write a PL/SQL block that traps `NO_DATA_FOUND` from a `SELECT INTO` query and prints 'No customer found'.",
    "starterCode": "-- Handling NO_DATA_FOUND\nDECLARE\n  v_name customers.name%TYPE;\nBEGIN\n  SELECT name INTO v_name FROM customers WHERE id = -999;\nEXCEPTION\n",
    "expectedScript": "DECLARE\n  v_name customers.name%TYPE;\nBEGIN\n  SELECT name INTO v_name FROM customers WHERE id = -999;\nEXCEPTION\n  WHEN NO_DATA_FOUND THEN\n    DBMS_OUTPUT.PUT_LINE('No customer found');\nEND;",
    "validationKeywords": [
      "EXCEPTION",
      "WHEN",
      "NO_DATA_FOUND",
      "THEN",
      "DBMS_OUTPUT.PUT_LINE('No customer found')",
      "END;"
    ],
    "validationRegex": "WHEN\\s+NO_DATA_FOUND\\s+THEN.*'No customer found'",
    "explanation": "Intercepts the predefined NO_DATA_FOUND exception gracefully.",
    "hint": "WHEN NO_DATA_FOUND THEN DBMS_OUTPUT.PUT_LINE('No customer found');"
  },
  {
    "id": "plsql-078",
    "mode": "plsql",
    "topic": "Exception Handling & Error Trapping",
    "difficulty": "Medium",
    "type": "script",
    "question": "Write an exception section that handles `TOO_MANY_ROWS` by printing 'Multiple rows returned' and `WHEN OTHERS` by printing `SQLERRM`.",
    "starterCode": "-- Multi-exception handler\nBEGIN\n  -- Some query\n  NULL;\nEXCEPTION\n",
    "expectedScript": "BEGIN\n  NULL;\nEXCEPTION\n  WHEN TOO_MANY_ROWS THEN\n    DBMS_OUTPUT.PUT_LINE('Multiple rows returned');\n  WHEN OTHERS THEN\n    DBMS_OUTPUT.PUT_LINE('Error: ' || SQLERRM);\nEND;",
    "validationKeywords": [
      "EXCEPTION",
      "WHEN",
      "TOO_MANY_ROWS",
      "THEN",
      "WHEN",
      "OTHERS",
      "THEN",
      "SQLERRM",
      "END;"
    ],
    "validationRegex": "WHEN\\s+TOO_MANY_ROWS\\s+THEN.*WHEN\\s+OTHERS\\s+THEN.*SQLERRM",
    "explanation": "Multiple exception handlers can be specified, ending with WHEN OTHERS.",
    "hint": "WHEN TOO_MANY_ROWS THEN ... WHEN OTHERS THEN ..."
  },
  {
    "id": "plsql-079",
    "mode": "plsql",
    "topic": "Exception Handling & Error Trapping",
    "difficulty": "Medium",
    "type": "script",
    "question": "Declare a user-defined exception `e_invalid_age`, check `IF v_age < 18 THEN RAISE e_invalid_age; END IF;`, and handle it by printing 'Minor detected'.",
    "starterCode": "-- Declare and raise custom exception\nDECLARE\n  v_age NUMBER := 16;\n  e_invalid_age EXCEPTION;\nBEGIN\n",
    "expectedScript": "DECLARE\n  v_age NUMBER := 16;\n  e_invalid_age EXCEPTION;\nBEGIN\n  IF v_age < 18 THEN\n    RAISE e_invalid_age;\n  END IF;\nEXCEPTION\n  WHEN e_invalid_age THEN\n    DBMS_OUTPUT.PUT_LINE('Minor detected');\nEND;",
    "validationKeywords": [
      "e_invalid_age",
      "EXCEPTION;",
      "IF",
      "v_age",
      "<",
      "18",
      "THEN",
      "RAISE",
      "e_invalid_age",
      "WHEN",
      "e_invalid_age",
      "THEN",
      "END;"
    ],
    "validationRegex": "RAISE\\s+e_invalid_age.*WHEN\\s+e_invalid_age\\s+THEN",
    "explanation": "Custom exceptions are declared as EXCEPTION, raised with RAISE, and handled by name in the EXCEPTION section.",
    "hint": "RAISE e_invalid_age; ... WHEN e_invalid_age THEN"
  },
  {
    "id": "plsql-080",
    "mode": "plsql",
    "topic": "Exception Handling & Error Trapping",
    "difficulty": "Medium",
    "type": "script",
    "question": "Write a PL/SQL block that binds custom exception `e_foreign_key` to Oracle error `-2292` using `PRAGMA EXCEPTION_INIT`, and handles it with a friendly message.",
    "starterCode": "-- PRAGMA EXCEPTION_INIT\nDECLARE\n  e_foreign_key EXCEPTION;\n",
    "expectedScript": "DECLARE\n  e_foreign_key EXCEPTION;\n  PRAGMA EXCEPTION_INIT(e_foreign_key, -2292);\nBEGIN\n  NULL;\nEXCEPTION\n  WHEN e_foreign_key THEN\n    DBMS_OUTPUT.PUT_LINE('Cannot delete: Child records exist');\nEND;",
    "validationKeywords": [
      "e_foreign_key",
      "EXCEPTION;",
      "PRAGMA",
      "EXCEPTION_INIT",
      "e_foreign_key",
      "-2292",
      "WHEN",
      "e_foreign_key",
      "THEN"
    ],
    "validationRegex": "PRAGMA\\s+EXCEPTION_INIT\\s*\\(\\s*e_foreign_key\\s*,\\s*-2292\\s*\\)",
    "explanation": "PRAGMA EXCEPTION_INIT maps named exceptions to internal ORA codes.",
    "hint": "PRAGMA EXCEPTION_INIT(e_foreign_key, -2292);"
  },
  {
    "id": "plsql-081",
    "mode": "plsql",
    "topic": "Records & Collections",
    "difficulty": "Easy",
    "type": "mcq",
    "question": "What are the three types of collections available in PL/SQL?",
    "options": [
      "Associative Arrays (Index-by Tables), Nested Tables, and Variable-Size Arrays (VARRAYs)",
      "Lists, Sets, and Dictionaries",
      "Queues, Stacks, and Trees",
      "Vectors, Matrices, and Hashes"
    ],
    "correctAnswer": 0,
    "explanation": "PL/SQL supports three collection types: Associative Arrays (key-value memory arrays), Nested Tables (unbounded, can be stored in database), and VARRAYs (bounded fixed max size).",
    "hint": "Associative arrays, nested tables, VARRAYs."
  },
  {
    "id": "plsql-082",
    "mode": "plsql",
    "topic": "Records & Collections",
    "difficulty": "Easy",
    "type": "mcq",
    "question": "Which collection type has a fixed maximum size declared at the type definition?",
    "options": [
      "VARRAY",
      "Nested Table",
      "Associative Array",
      "Index-by table"
    ],
    "correctAnswer": 0,
    "explanation": "A VARRAY (Variable-size array) has an explicit maximum limit declared, e.g. TYPE num_list IS VARRAY(10) OF NUMBER.",
    "hint": "VARRAY has a fixed upper bound."
  },
  {
    "id": "plsql-083",
    "mode": "plsql",
    "topic": "Records & Collections",
    "difficulty": "Medium",
    "type": "mcq",
    "question": "Which collection method appends one or more null elements to the end of a Nested Table or VARRAY?",
    "options": [
      "EXTEND",
      "APPEND",
      "ADD",
      "PUSH"
    ],
    "correctAnswer": 0,
    "explanation": "The EXTEND method allocates new elements at the end of a nested table or VARRAY prior to assignment.",
    "hint": "EXTEND allocates additional elements."
  },
  {
    "id": "plsql-084",
    "mode": "plsql",
    "topic": "Records & Collections",
    "difficulty": "Medium",
    "type": "mcq",
    "question": "How do you declare a custom user-defined RECORD type in PL/SQL?",
    "options": [
      "TYPE rec_type IS RECORD (field1 datatype, field2 datatype);",
      "STRUCT rec_type { field1 datatype; field2 datatype; };",
      "RECORD rec_type (field1, field2);",
      "CREATE RECORD rec_type AS (field1, field2);"
    ],
    "correctAnswer": 0,
    "explanation": "TYPE type_name IS RECORD (col1 type, col2 type) defines a composite record type in PL/SQL declarations.",
    "hint": "TYPE name IS RECORD (...);"
  },
  {
    "id": "plsql-085",
    "mode": "plsql",
    "topic": "Records & Collections",
    "difficulty": "Medium",
    "type": "mcq",
    "question": "What is the difference between BULK COLLECT and a regular FETCH inside a loop?",
    "options": [
      "BULK COLLECT fetches entire batches of rows in a single context switch into memory collections, dramatically improving query performance",
      "BULK COLLECT deletes rows from the table after reading",
      "BULK COLLECT only works on indexed columns",
      "There is no performance difference"
    ],
    "correctAnswer": 0,
    "explanation": "BULK COLLECT minimizes context switching between the SQL engine and PL/SQL engine by retrieving batches or all rows in a single operation.",
    "hint": "BULK COLLECT minimizes context switches by fetching batches into collections."
  },
  {
    "id": "plsql-086",
    "mode": "plsql",
    "topic": "Records & Collections",
    "difficulty": "Easy",
    "type": "mcq",
    "question": "Which collection method returns the total number of elements currently stored in a collection?",
    "options": [
      "COUNT",
      "LENGTH",
      "SIZE",
      "CAPACITY"
    ],
    "correctAnswer": 0,
    "explanation": "collection_name.COUNT returns the number of active elements in the collection.",
    "hint": "Use .COUNT method."
  },
  {
    "id": "plsql-087",
    "mode": "plsql",
    "topic": "Records & Collections",
    "difficulty": "Easy",
    "type": "script",
    "question": "Declare a VARRAY of 3 numbers `TYPE t_nums IS VARRAY(3) OF NUMBER;`, instantiate it with values `(10, 20, 30)`, and print the second element (`v(2)`).",
    "starterCode": "-- VARRAY instantiation\nDECLARE\n  TYPE t_nums IS VARRAY(3) OF NUMBER;\n  v_arr t_nums := t_nums(10, 20, 30);\nBEGIN\n",
    "expectedScript": "DECLARE\n  TYPE t_nums IS VARRAY(3) OF NUMBER;\n  v_arr t_nums := t_nums(10, 20, 30);\nBEGIN\n  DBMS_OUTPUT.PUT_LINE('Second: ' || v_arr(2));\nEND;",
    "validationKeywords": [
      "TYPE",
      "t_nums",
      "IS",
      "VARRAY(3)",
      "OF",
      "NUMBER",
      "v_arr",
      "t_nums(10,",
      "20,",
      "30)",
      "v_arr(2)"
    ],
    "validationRegex": "TYPE\\s+t_nums\\s+IS\\s+VARRAY\\(3\\)\\s+OF\\s+NUMBER.*v_arr\\(2\\)",
    "explanation": "VARRAYs are 1-indexed collections with bounded maximum capacity.",
    "hint": "v_arr(2) accesses the second item in PL/SQL 1-based indexing."
  },
  {
    "id": "plsql-088",
    "mode": "plsql",
    "topic": "Records & Collections",
    "difficulty": "Medium",
    "type": "script",
    "question": "Declare a custom record `TYPE t_person IS RECORD (name VARCHAR2(50), age NUMBER);`, declare a variable `v_p t_person;`, assign `v_p.name := 'Bob'; v_p.age := 30;`, and print both fields.",
    "starterCode": "-- Custom RECORD type\nDECLARE\n  TYPE t_person IS RECORD (name VARCHAR2(50), age NUMBER);\n  v_p t_person;\nBEGIN\n",
    "expectedScript": "DECLARE\n  TYPE t_person IS RECORD (name VARCHAR2(50), age NUMBER);\n  v_p t_person;\nBEGIN\n  v_p.name := 'Bob';\n  v_p.age := 30;\n  DBMS_OUTPUT.PUT_LINE(v_p.name || ' is ' || v_p.age);\nEND;",
    "validationKeywords": [
      "TYPE",
      "t_person",
      "IS",
      "RECORD",
      "name",
      "VARCHAR2",
      "age",
      "NUMBER",
      "v_p.name",
      "v_p.age",
      "DBMS_OUTPUT.PUT_LINE"
    ],
    "validationRegex": "v_p\\.name\\s*:=\\s*'Bob'.*v_p\\.age\\s*:=\\s*30",
    "explanation": "User-defined records group related heterogeneous scalar fields under one structure.",
    "hint": "Assign fields with dot notation: v_p.name := 'Bob';"
  },
  {
    "id": "plsql-089",
    "mode": "plsql",
    "topic": "Records & Collections",
    "difficulty": "Medium",
    "type": "script",
    "question": "Write a PL/SQL block using `BULK COLLECT INTO` to fetch all customer names from `customers` into a nested table type `TYPE t_names IS TABLE OF VARCHAR2(100);` and print the total count (`.COUNT`).",
    "starterCode": "-- BULK COLLECT INTO collection\nDECLARE\n  TYPE t_names IS TABLE OF VARCHAR2(100);\n  v_names t_names;\nBEGIN\n",
    "expectedScript": "DECLARE\n  TYPE t_names IS TABLE OF VARCHAR2(100);\n  v_names t_names;\nBEGIN\n  SELECT name BULK COLLECT INTO v_names FROM customers;\n  DBMS_OUTPUT.PUT_LINE('Loaded names count: ' || v_names.COUNT);\nEND;",
    "validationKeywords": [
      "TYPE",
      "t_names",
      "IS",
      "TABLE",
      "OF",
      "VARCHAR2",
      "v_names",
      "SELECT",
      "name",
      "BULK",
      "COLLECT",
      "INTO",
      "v_names",
      "FROM",
      "customers",
      "v_names.COUNT"
    ],
    "validationRegex": "SELECT\\s+name\\s+BULK\\s+COLLECT\\s+INTO\\s+v_names\\s+FROM\\s+customers.*v_names\\.COUNT",
    "explanation": "BULK COLLECT efficiently populates memory collections from relational queries in a single engine context switch.",
    "hint": "SELECT name BULK COLLECT INTO v_names FROM customers;"
  },
  {
    "id": "plsql-090",
    "mode": "plsql",
    "topic": "Records & Collections",
    "difficulty": "Medium",
    "type": "script",
    "question": "Declare an Associative Array indexed by VARCHAR2: `TYPE t_capital IS TABLE OF VARCHAR2(50) INDEX BY VARCHAR2(50);`, assign `capitals('France') := 'Paris';` and print it.",
    "starterCode": "-- Associative Array indexed by string\nDECLARE\n  TYPE t_capital IS TABLE OF VARCHAR2(50) INDEX BY VARCHAR2(50);\n  capitals t_capital;\nBEGIN\n",
    "expectedScript": "DECLARE\n  TYPE t_capital IS TABLE OF VARCHAR2(50) INDEX BY VARCHAR2(50);\n  capitals t_capital;\nBEGIN\n  capitals('France') := 'Paris';\n  DBMS_OUTPUT.PUT_LINE('Capital of France: ' || capitals('France'));\nEND;",
    "validationKeywords": [
      "TYPE",
      "t_capital",
      "INDEX",
      "BY",
      "VARCHAR2",
      "capitals('France')",
      "'Paris'",
      "DBMS_OUTPUT.PUT_LINE"
    ],
    "validationRegex": "INDEX\\s+BY\\s+VARCHAR2.*capitals\\s*\\(\\s*'France'\\s*\\)\\s*:=\\s*'Paris'",
    "explanation": "Associative arrays indexed by string act as key-value hash maps in PL/SQL memory.",
    "hint": "capitals('France') := 'Paris';"
  },
  {
    "id": "plsql-091",
    "mode": "plsql",
    "topic": "Packages & Dynamic SQL",
    "difficulty": "Easy",
    "type": "mcq",
    "question": "What are the two distinct parts of a PL/SQL package?",
    "options": [
      "Package Specification (spec) and Package Body",
      "Package Header and Package Footer",
      "Public Interface and Private Module",
      "Source and Binary"
    ],
    "correctAnswer": 0,
    "explanation": "The Specification defines the public interface (signatures of functions, procedures, constants), while the Body contains the actual implementation and private constructs.",
    "hint": "Specification and Body."
  },
  {
    "id": "plsql-092",
    "mode": "plsql",
    "topic": "Packages & Dynamic SQL",
    "difficulty": "Medium",
    "type": "mcq",
    "question": "Can an item declared exclusively in the Package Body be called from an outside block?",
    "options": [
      "No, items only defined in the body are private to the package",
      "Yes, all package subprograms are globally public",
      "Only if granted EXECUTE privilege explicitly",
      "Only during the package initialization block"
    ],
    "correctAnswer": 0,
    "explanation": "Encapsulation in PL/SQL packages: only items declared in the package specification are public; items declared only in the body are private.",
    "hint": "Items not in the spec are private."
  },
  {
    "id": "plsql-093",
    "mode": "plsql",
    "topic": "Packages & Dynamic SQL",
    "difficulty": "Easy",
    "type": "mcq",
    "question": "Which PL/SQL statement executes a dynamically constructed SQL string at runtime?",
    "options": [
      "EXECUTE IMMEDIATE",
      "RUN DYNAMIC",
      "EVAL",
      "DBMS_SQL.EXEC"
    ],
    "correctAnswer": 0,
    "explanation": "Native Dynamic SQL uses 'EXECUTE IMMEDIATE sql_string [INTO vars] [USING binds]' to execute queries and DDL dynamically.",
    "hint": "EXECUTE IMMEDIATE"
  },
  {
    "id": "plsql-094",
    "mode": "plsql",
    "topic": "Packages & Dynamic SQL",
    "difficulty": "Medium",
    "type": "mcq",
    "question": "Why should bind variables (USING clause) be used instead of string concatenation in EXECUTE IMMEDIATE?",
    "options": [
      "Bind variables prevent SQL injection vulnerabilities and allow Oracle cursor sharing to reduce hard parsing",
      "Bind variables allow DDL commands to run faster",
      "String concatenation is prohibited in PL/SQL",
      "Bind variables encrypt the data in transit"
    ],
    "correctAnswer": 0,
    "explanation": "Bind variables protect against SQL injection and enable soft parsing in the shared pool by keeping query templates identical.",
    "hint": "Prevents SQL injection and enables query reuse in the shared pool."
  },
  {
    "id": "plsql-095",
    "mode": "plsql",
    "topic": "Packages & Dynamic SQL",
    "difficulty": "Medium",
    "type": "mcq",
    "question": "What is package state in PL/SQL?",
    "options": [
      "The values of package-level variables and open cursors maintained in the user's session PGA throughout the life of the session",
      "The physical storage allocation on disk",
      "The compiled bytecode status",
      "The transaction isolation level"
    ],
    "correctAnswer": 0,
    "explanation": "Package state refers to session-level variables and cursors declared in package specs or bodies, which persist across calls within the same database session.",
    "hint": "Values preserved across calls in the user's session memory."
  },
  {
    "id": "plsql-096",
    "mode": "plsql",
    "topic": "Packages & Dynamic SQL",
    "difficulty": "Easy",
    "type": "mcq",
    "question": "Can DDL statements (like CREATE TABLE) be run directly in regular static PL/SQL without EXECUTE IMMEDIATE?",
    "options": [
      "No, DDL cannot be statically compiled into PL/SQL; it must be executed dynamically via EXECUTE IMMEDIATE",
      "Yes, all DDL commands are supported statically",
      "Only CREATE VIEW is permitted statically",
      "Only in package bodies"
    ],
    "correctAnswer": 0,
    "explanation": "The PL/SQL compiler only allows DML and DQL statically. Any DDL command (CREATE, DROP, ALTER) requires dynamic execution via EXECUTE IMMEDIATE.",
    "hint": "DDL requires EXECUTE IMMEDIATE in PL/SQL."
  },
  {
    "id": "plsql-097",
    "mode": "plsql",
    "topic": "Packages & Dynamic SQL",
    "difficulty": "Easy",
    "type": "script",
    "question": "Write an `EXECUTE IMMEDIATE` statement to dynamically drop a temporary table named `temp_results`.",
    "starterCode": "-- Dynamic DDL\nBEGIN\n  \nEND;\n",
    "expectedScript": "BEGIN\n  EXECUTE IMMEDIATE 'DROP TABLE temp_results';\nEND;",
    "validationKeywords": [
      "BEGIN",
      "EXECUTE",
      "IMMEDIATE",
      "'DROP TABLE temp_results'",
      "END;"
    ],
    "validationRegex": "EXECUTE\\s+IMMEDIATE\\s+'DROP\\s+TABLE\\s+temp_results'",
    "explanation": "DDL statements must be wrapped in EXECUTE IMMEDIATE strings in PL/SQL.",
    "hint": "EXECUTE IMMEDIATE 'DROP TABLE temp_results';"
  },
  {
    "id": "plsql-098",
    "mode": "plsql",
    "topic": "Packages & Dynamic SQL",
    "difficulty": "Medium",
    "type": "script",
    "question": "Write a PL/SQL block using `EXECUTE IMMEDIATE` with a bind parameter (`USING 101`) to select `name` into `v_name` from `employees` WHERE `id = :1`.",
    "starterCode": "-- Dynamic SQL with bind variable\nDECLARE\n  v_name VARCHAR2(50);\n  v_id NUMBER := 101;\nBEGIN\n",
    "expectedScript": "DECLARE\n  v_name VARCHAR2(50);\n  v_id NUMBER := 101;\nBEGIN\n  EXECUTE IMMEDIATE 'SELECT name FROM employees WHERE id = :1' INTO v_name USING v_id;\n  DBMS_OUTPUT.PUT_LINE('Name: ' || v_name);\nEND;",
    "validationKeywords": [
      "EXECUTE",
      "IMMEDIATE",
      "SELECT",
      "name",
      "FROM",
      "employees",
      "WHERE",
      "id",
      "= :1",
      "INTO",
      "v_name",
      "USING",
      "v_id"
    ],
    "validationRegex": "EXECUTE\\s+IMMEDIATE\\s+.*INTO\\s+v_name\\s+USING\\s+v_id",
    "explanation": "Dynamic SQL utilizes INTO for projection targets and USING for bind values.",
    "hint": "EXECUTE IMMEDIATE 'SELECT name FROM employees WHERE id = :1' INTO v_name USING v_id;"
  },
  {
    "id": "plsql-099",
    "mode": "plsql",
    "topic": "Packages & Dynamic SQL",
    "difficulty": "Medium",
    "type": "script",
    "question": "Write a package specification `math_pkg` declaring a function `square(p_num NUMBER) RETURN NUMBER;`.",
    "starterCode": "-- Package specification\nCREATE OR REPLACE PACKAGE math_pkg IS\n",
    "expectedScript": "CREATE OR REPLACE PACKAGE math_pkg IS\n  FUNCTION square(p_num NUMBER) RETURN NUMBER;\nEND math_pkg;",
    "validationKeywords": [
      "CREATE",
      "OR",
      "REPLACE",
      "PACKAGE",
      "math_pkg",
      "IS",
      "FUNCTION",
      "square",
      "RETURN",
      "NUMBER",
      "END",
      "math_pkg;"
    ],
    "validationRegex": "CREATE\\s+(?:OR\\s+REPLACE\\s+)?PACKAGE\\s+math_pkg\\s+(?:IS|AS).*FUNCTION\\s+square.*RETURN\\s+NUMBER.*END",
    "explanation": "The package specification defines signatures without subprogram implementation bodies.",
    "hint": "CREATE OR REPLACE PACKAGE math_pkg IS FUNCTION square(p_num NUMBER) RETURN NUMBER; END math_pkg;"
  },
  {
    "id": "plsql-100",
    "mode": "plsql",
    "topic": "Packages & Dynamic SQL",
    "difficulty": "Medium",
    "type": "script",
    "question": "Write the package body `math_pkg` implementing `FUNCTION square(p_num NUMBER) RETURN NUMBER IS BEGIN RETURN p_num * p_num; END;`.",
    "starterCode": "-- Package body\nCREATE OR REPLACE PACKAGE BODY math_pkg IS\n",
    "expectedScript": "CREATE OR REPLACE PACKAGE BODY math_pkg IS\n  FUNCTION square(p_num NUMBER) RETURN NUMBER IS\n  BEGIN\n    RETURN p_num * p_num;\n  END square;\nEND math_pkg;",
    "validationKeywords": [
      "CREATE",
      "OR",
      "REPLACE",
      "PACKAGE",
      "BODY",
      "math_pkg",
      "IS",
      "FUNCTION",
      "square",
      "RETURN",
      "p_num",
      "*",
      "p_num",
      "END",
      "math_pkg;"
    ],
    "validationRegex": "CREATE\\s+(?:OR\\s+REPLACE\\s+)?PACKAGE\\s+BODY\\s+math_pkg\\s+(?:IS|AS).*FUNCTION\\s+square.*RETURN\\s+p_num\\s*\\*\\s*p_num.*END",
    "explanation": "The package body provides the concrete procedural logic matching the package specification.",
    "hint": "CREATE OR REPLACE PACKAGE BODY math_pkg IS ... END math_pkg;"
  }
,
  {
    "id": "plsql-101",
    "mode": "plsql",
    "topic": "Stored Procedures & Functions",
    "difficulty": "Hard",
    "type": "mcq",
    "question": "When a procedure declared with `PRAGMA AUTONOMOUS_TRANSACTION` issues a `COMMIT;` statement, what happens to uncommitted DML operations executed by the main (calling) transaction?",
    "options": [
      "The calling transaction's uncommitted DML remains completely unaffected and uncommitted",
      "The calling transaction's DML is committed simultaneously",
      "The calling transaction is automatically rolled back to prevent inconsistency",
      "The database raises an unhandled ORA-06519 exception"
    ],
    "correctAnswer": 0,
    "explanation": "Autonomous transactions execute in an entirely detached transaction context. A COMMIT or ROLLBACK within an autonomous block applies solely to DML performed within that autonomous scope, leaving the parent session's active transaction intact.",
    "hint": "Autonomous transactions are completely isolated from parent transaction boundaries."
  },
  {
    "id": "plsql-102",
    "mode": "plsql",
    "topic": "Database Triggers",
    "difficulty": "Hard",
    "type": "mcq",
    "question": "What causes the infamous `ORA-04091: table is mutating` runtime error in Oracle, and how does a Compound Trigger resolve it without auxiliary temporary tables?",
    "options": [
      "A row-level trigger queries or modifies the same table that fired the DML; Compound Triggers allow accumulating row data in collection variables during row events and processing aggregations safely in the AFTER STATEMENT section",
      "A trigger attempts to insert a duplicate primary key value",
      "The database buffer cache runs out of shared memory for trigger execution",
      "A trigger contains an autonomous transaction that commits without an active rollback segment"
    ],
    "correctAnswer": 0,
    "explanation": "ORA-04091 occurs when an AFTER/BEFORE EACH ROW trigger attempts to query the table currently being modified because the table is in an inconsistent mutating state. Compound triggers solve this by capturing modified keys in memory during AFTER EACH ROW and querying/aggregating safely in AFTER STATEMENT when the table is consistent.",
    "hint": "Row-level triggers cannot read the table undergoing modification. Compound triggers bridge row and statement timing points."
  },
  {
    "id": "plsql-103",
    "mode": "plsql",
    "topic": "Loops & Iteration (FOR, WHILE, LOOP)",
    "difficulty": "Hard",
    "type": "mcq",
    "question": "In high-throughput DML processing, how does `FORALL ... SAVE EXCEPTIONS` handle individual record failures during bulk execution?",
    "options": [
      "It continues processing all remaining rows, storing any errors in SQL%BULK_EXCEPTIONS, and raises ORA-24381 only after all iterations conclude",
      "It immediately halts execution on the first error and rolls back all preceding rows",
      "It silently ignores errors without reporting them",
      "It commits successful rows and routes failing rows to the recycle bin"
    ],
    "correctAnswer": 0,
    "explanation": "SAVE EXCEPTIONS prevents FORALL from terminating on the first failure. The loop runs to completion, caches error codes and indexes in SQL%BULK_EXCEPTIONS, and raises ORA-24381 at the end so code can inspect each failure individually.",
    "hint": "SAVE EXCEPTIONS processes every item in the collection and records failures in SQL%BULK_EXCEPTIONS."
  },
  {
    "id": "plsql-104",
    "mode": "plsql",
    "topic": "Records & Collections",
    "difficulty": "Hard",
    "type": "mcq",
    "question": "What is the key performance and memory difference between an Associative Array (`INDEX BY PLS_INTEGER`) and a Nested Table in PL/SQL?",
    "options": [
      "Associative arrays exist only in private session PGA memory and cannot be stored directly in database table columns, whereas Nested Tables can be stored in database columns and manipulated with MULTISET operators",
      "Nested Tables have a fixed maximum size while Associative Arrays are infinite",
      "Associative arrays require EXTEND before element assignment while Nested Tables do not",
      "Nested Tables cannot be passed as parameters to subprograms"
    ],
    "correctAnswer": 0,
    "explanation": "Associative arrays are purely memory-based structures in the PGA (cannot be schema-level database types or column data types). Nested tables and VARRAYs can be defined as database schema objects, stored in table columns, and queried via TABLE() expressions.",
    "hint": "Associative arrays are purely PL/SQL constructs (PGA only); nested tables can be stored in tables."
  },
  {
    "id": "plsql-105",
    "mode": "plsql",
    "topic": "Stored Procedures & Functions",
    "difficulty": "Hard",
    "type": "mcq",
    "question": "What is the execution benefit of declaring a PL/SQL table function with the `PIPELINED` keyword?",
    "options": [
      "It streams result rows iteratively to the consumer via `PIPE ROW(...)` without buffering the entire dataset in PGA memory, enabling parallel streaming",
      "It forces the query to execute entirely in the operating system pipe",
      "It caches the return value indefinitely across all user sessions",
      "It disables undo generation for DML within the function"
    ],
    "correctAnswer": 0,
    "explanation": "Standard table functions must construct and return the entire collection in PGA memory before the calling query can process row 1. Pipelined functions stream rows out as they are produced using PIPE ROW, drastically slashing PGA memory footprint and enabling concurrent streaming.",
    "hint": "Pipelined functions stream rows via PIPE ROW without materializing the whole collection."
  },
  {
    "id": "plsql-106",
    "mode": "plsql",
    "topic": "Packages & Dynamic SQL",
    "difficulty": "Hard",
    "type": "mcq",
    "question": "When invoking dynamic SQL with `EXECUTE IMMEDIATE`, what occurs if you pass an un-sanitized string directly into the SQL statement rather than using the `USING` bind variable clause?",
    "options": [
      "It creates severe SQL Injection vulnerabilities and floods the shared pool with un-shared library cache SQL cursors (hard parse storm)",
      "The PL/SQL compiler rejects the code at build time",
      "The query executes in read-only mode",
      "The statement is automatically converted into an autonomous transaction"
    ],
    "correctAnswer": 0,
    "explanation": "Failing to use USING bind variables not only exposes the application to SQL injection, but also forces Oracle's shared pool to hard-parse every unique literal string query, consuming CPU and causing library cache latch contention.",
    "hint": "Literal concatenation causes SQL injection and library cache hard parse storms."
  },
  {
    "id": "plsql-107",
    "mode": "plsql",
    "topic": "Exception Handling & Error Trapping",
    "difficulty": "Hard",
    "type": "mcq",
    "question": "In an exception handler block, what is the subtle difference between writing bare `RAISE;` versus `RAISE exception_name;`?",
    "options": [
      "Bare `RAISE;` re-raises the current active exception preserving the original error line backtrace (`FORMAT_ERROR_BACKTRACE`), whereas `RAISE exc;` resets the call stack to the current line",
      "Bare `RAISE;` converts the exception to ORA-00000 (success)",
      "There is no difference; they are exact aliases",
      "Bare `RAISE;` is only legal inside package body initialization"
    ],
    "correctAnswer": 0,
    "explanation": "Inside an exception handler, invoking bare `RAISE;` re-propagates the active exception without resetting the error backtrace stack. Re-raising a named exception via `RAISE exc_name;` overwrites the backtrace origin to the line containing the RAISE statement.",
    "hint": "Bare RAISE; preserves the original call stack and line number where the error was born."
  },
  {
    "id": "plsql-108",
    "mode": "plsql",
    "topic": "Stored Procedures & Functions",
    "difficulty": "Hard",
    "type": "mcq",
    "question": "What is the critical behavioral distinction between `AUTHID DEFINER` and `AUTHID CURRENT_USER` in stored PL/SQL units?",
    "options": [
      "`AUTHID DEFINER` runs with the owner's privileges and resolves unqualified table references in the owner's schema (disabling caller roles); `AUTHID CURRENT_USER` runs with the invoking user's privileges and schema resolution",
      "`AUTHID DEFINER` allows writing to system tables while `AUTHID CURRENT_USER` does not",
      "`AUTHID CURRENT_USER` disables transaction logging",
      "`AUTHID DEFINER` requires explicit password authentication on every call"
    ],
    "correctAnswer": 0,
    "explanation": "By default, PL/SQL runs under Definer's rights (`AUTHID DEFINER`), meaning privileges are checked against the procedure's owner and roles are disabled. Invoker's rights (`AUTHID CURRENT_USER`) checks privileges against the caller and resolves unqualified objects in the caller's schema.",
    "hint": "Definer rights runs as the owner; Invoker rights runs with the caller's privileges and schema."
  },
  {
    "id": "plsql-109",
    "mode": "plsql",
    "topic": "Stored Procedures & Functions",
    "difficulty": "Hard",
    "type": "mcq",
    "question": "What does the `RESULT_CACHE` clause do when attached to a PL/SQL deterministic lookup function?",
    "options": [
      "It caches the function's input-to-output mappings in the shared SGA memory across all database sessions, invalidating cached entries automatically when dependent tables undergo DML",
      "It caches values exclusively in the client browser local storage",
      "It saves the return value into a permanent database audit table",
      "It creates an index on the function return value"
    ],
    "correctAnswer": 0,
    "explanation": "Oracle's PL/SQL Function Result Cache stores computed return values in the SGA Shared Pool across all sessions. If dependent tables are modified, Oracle automatically purges or marks the cached results as stale.",
    "hint": "SGA-level cross-session memory caching with automatic invalidation on table DML."
  },
  {
    "id": "plsql-110",
    "mode": "plsql",
    "topic": "Stored Procedures & Functions",
    "difficulty": "Hard",
    "type": "script",
    "question": "Write an autonomous logging procedure `log_audit_event(p_action VARCHAR2)` with `PRAGMA AUTONOMOUS_TRANSACTION` that inserts `p_action` and `SYSDATE` into `audit_log (action, event_time)` and commits immediately.",
    "starterCode": "CREATE OR REPLACE PROCEDURE log_audit_event(p_action VARCHAR2) IS\n",
    "expectedScript": "CREATE OR REPLACE PROCEDURE log_audit_event(p_action VARCHAR2) IS PRAGMA AUTONOMOUS_TRANSACTION; BEGIN INSERT INTO audit_log (action, event_time) VALUES (p_action, SYSDATE); COMMIT; END log_audit_event;",
    "validationKeywords": [
      "CREATE",
      "PROCEDURE",
      "log_audit_event",
      "PRAGMA",
      "AUTONOMOUS_TRANSACTION",
      "INSERT",
      "INTO",
      "audit_log",
      "VALUES",
      "COMMIT",
      "END"
    ],
    "validationRegex": "PRAGMA\\s+AUTONOMOUS_TRANSACTION\\s*;[\\s\\S]*?INSERT\\s+INTO\\s+audit_log[\\s\\S]*?COMMIT\\s*;",
    "explanation": "PRAGMA AUTONOMOUS_TRANSACTION allows the audit logger to commit its insert statement without committing or interfering with the outer business transaction.",
    "hint": "Declare PRAGMA AUTONOMOUS_TRANSACTION; before BEGIN, and COMMIT; before END;"
  },
  {
    "id": "plsql-111",
    "mode": "plsql",
    "topic": "Database Triggers",
    "difficulty": "Hard",
    "type": "mcq",
    "question": "Advanced PL/SQL Runtime Internals Scenario #1: What is the behavior of package state, exception backtraces, or cursor management under Oracle PL/SQL engine?",
    "options": [
      "Package state (package-level global variables and open cursors) is instantiated per user session in the UGA/PGA; modifying a package specification invalidates dependent state causing ORA-04068: existing state of packages has been discarded",
      "Package variables are shared globally across all database users in the SGA buffer cache",
      "Closing a parent cursor variable automatically cascades and closes all child ref cursors",
      "Exceptions caught in nested blocks cannot access SQLCODE or SQLERRM"
    ],
    "correctAnswer": 0,
    "explanation": "Package package-level variables are session-private (stored in the UGA/PGA). When any session recompiles a package specification or body, all existing user sessions holding state for that package will fail on next call with ORA-04068.",
    "hint": "Package state is session-scoped, and recompiling invalidates all session state with ORA-04068."
  },
  {
    "id": "plsql-112",
    "mode": "plsql",
    "topic": "Exception Handling & Error Trapping",
    "difficulty": "Hard",
    "type": "mcq",
    "question": "Advanced PL/SQL Runtime Internals Scenario #2: What is the behavior of package state, exception backtraces, or cursor management under Oracle PL/SQL engine?",
    "options": [
      "Package state (package-level global variables and open cursors) is instantiated per user session in the UGA/PGA; modifying a package specification invalidates dependent state causing ORA-04068: existing state of packages has been discarded",
      "Package variables are shared globally across all database users in the SGA buffer cache",
      "Closing a parent cursor variable automatically cascades and closes all child ref cursors",
      "Exceptions caught in nested blocks cannot access SQLCODE or SQLERRM"
    ],
    "correctAnswer": 0,
    "explanation": "Package package-level variables are session-private (stored in the UGA/PGA). When any session recompiles a package specification or body, all existing user sessions holding state for that package will fail on next call with ORA-04068.",
    "hint": "Package state is session-scoped, and recompiling invalidates all session state with ORA-04068."
  },
  {
    "id": "plsql-113",
    "mode": "plsql",
    "topic": "Packages & Dynamic SQL",
    "difficulty": "Hard",
    "type": "mcq",
    "question": "Advanced PL/SQL Runtime Internals Scenario #3: What is the behavior of package state, exception backtraces, or cursor management under Oracle PL/SQL engine?",
    "options": [
      "Package state (package-level global variables and open cursors) is instantiated per user session in the UGA/PGA; modifying a package specification invalidates dependent state causing ORA-04068: existing state of packages has been discarded",
      "Package variables are shared globally across all database users in the SGA buffer cache",
      "Closing a parent cursor variable automatically cascades and closes all child ref cursors",
      "Exceptions caught in nested blocks cannot access SQLCODE or SQLERRM"
    ],
    "correctAnswer": 0,
    "explanation": "Package package-level variables are session-private (stored in the UGA/PGA). When any session recompiles a package specification or body, all existing user sessions holding state for that package will fail on next call with ORA-04068.",
    "hint": "Package state is session-scoped, and recompiling invalidates all session state with ORA-04068."
  },
  {
    "id": "plsql-114",
    "mode": "plsql",
    "topic": "Stored Procedures & Functions",
    "difficulty": "Hard",
    "type": "mcq",
    "question": "Advanced PL/SQL Runtime Internals Scenario #4: What is the behavior of package state, exception backtraces, or cursor management under Oracle PL/SQL engine?",
    "options": [
      "Package state (package-level global variables and open cursors) is instantiated per user session in the UGA/PGA; modifying a package specification invalidates dependent state causing ORA-04068: existing state of packages has been discarded",
      "Package variables are shared globally across all database users in the SGA buffer cache",
      "Closing a parent cursor variable automatically cascades and closes all child ref cursors",
      "Exceptions caught in nested blocks cannot access SQLCODE or SQLERRM"
    ],
    "correctAnswer": 0,
    "explanation": "Package package-level variables are session-private (stored in the UGA/PGA). When any session recompiles a package specification or body, all existing user sessions holding state for that package will fail on next call with ORA-04068.",
    "hint": "Package state is session-scoped, and recompiling invalidates all session state with ORA-04068."
  },
  {
    "id": "plsql-115",
    "mode": "plsql",
    "topic": "Database Triggers",
    "difficulty": "Hard",
    "type": "mcq",
    "question": "Advanced PL/SQL Runtime Internals Scenario #5: What is the behavior of package state, exception backtraces, or cursor management under Oracle PL/SQL engine?",
    "options": [
      "Package state (package-level global variables and open cursors) is instantiated per user session in the UGA/PGA; modifying a package specification invalidates dependent state causing ORA-04068: existing state of packages has been discarded",
      "Package variables are shared globally across all database users in the SGA buffer cache",
      "Closing a parent cursor variable automatically cascades and closes all child ref cursors",
      "Exceptions caught in nested blocks cannot access SQLCODE or SQLERRM"
    ],
    "correctAnswer": 0,
    "explanation": "Package package-level variables are session-private (stored in the UGA/PGA). When any session recompiles a package specification or body, all existing user sessions holding state for that package will fail on next call with ORA-04068.",
    "hint": "Package state is session-scoped, and recompiling invalidates all session state with ORA-04068."
  },
  {
    "id": "plsql-116",
    "mode": "plsql",
    "topic": "Exception Handling & Error Trapping",
    "difficulty": "Hard",
    "type": "mcq",
    "question": "Advanced PL/SQL Runtime Internals Scenario #6: What is the behavior of package state, exception backtraces, or cursor management under Oracle PL/SQL engine?",
    "options": [
      "Package state (package-level global variables and open cursors) is instantiated per user session in the UGA/PGA; modifying a package specification invalidates dependent state causing ORA-04068: existing state of packages has been discarded",
      "Package variables are shared globally across all database users in the SGA buffer cache",
      "Closing a parent cursor variable automatically cascades and closes all child ref cursors",
      "Exceptions caught in nested blocks cannot access SQLCODE or SQLERRM"
    ],
    "correctAnswer": 0,
    "explanation": "Package package-level variables are session-private (stored in the UGA/PGA). When any session recompiles a package specification or body, all existing user sessions holding state for that package will fail on next call with ORA-04068.",
    "hint": "Package state is session-scoped, and recompiling invalidates all session state with ORA-04068."
  },
  {
    "id": "plsql-117",
    "mode": "plsql",
    "topic": "Packages & Dynamic SQL",
    "difficulty": "Hard",
    "type": "mcq",
    "question": "Advanced PL/SQL Runtime Internals Scenario #7: What is the behavior of package state, exception backtraces, or cursor management under Oracle PL/SQL engine?",
    "options": [
      "Package state (package-level global variables and open cursors) is instantiated per user session in the UGA/PGA; modifying a package specification invalidates dependent state causing ORA-04068: existing state of packages has been discarded",
      "Package variables are shared globally across all database users in the SGA buffer cache",
      "Closing a parent cursor variable automatically cascades and closes all child ref cursors",
      "Exceptions caught in nested blocks cannot access SQLCODE or SQLERRM"
    ],
    "correctAnswer": 0,
    "explanation": "Package package-level variables are session-private (stored in the UGA/PGA). When any session recompiles a package specification or body, all existing user sessions holding state for that package will fail on next call with ORA-04068.",
    "hint": "Package state is session-scoped, and recompiling invalidates all session state with ORA-04068."
  },
  {
    "id": "plsql-118",
    "mode": "plsql",
    "topic": "Stored Procedures & Functions",
    "difficulty": "Hard",
    "type": "mcq",
    "question": "Advanced PL/SQL Runtime Internals Scenario #8: What is the behavior of package state, exception backtraces, or cursor management under Oracle PL/SQL engine?",
    "options": [
      "Package state (package-level global variables and open cursors) is instantiated per user session in the UGA/PGA; modifying a package specification invalidates dependent state causing ORA-04068: existing state of packages has been discarded",
      "Package variables are shared globally across all database users in the SGA buffer cache",
      "Closing a parent cursor variable automatically cascades and closes all child ref cursors",
      "Exceptions caught in nested blocks cannot access SQLCODE or SQLERRM"
    ],
    "correctAnswer": 0,
    "explanation": "Package package-level variables are session-private (stored in the UGA/PGA). When any session recompiles a package specification or body, all existing user sessions holding state for that package will fail on next call with ORA-04068.",
    "hint": "Package state is session-scoped, and recompiling invalidates all session state with ORA-04068."
  },
  {
    "id": "plsql-119",
    "mode": "plsql",
    "topic": "Database Triggers",
    "difficulty": "Hard",
    "type": "mcq",
    "question": "Advanced PL/SQL Runtime Internals Scenario #9: What is the behavior of package state, exception backtraces, or cursor management under Oracle PL/SQL engine?",
    "options": [
      "Package state (package-level global variables and open cursors) is instantiated per user session in the UGA/PGA; modifying a package specification invalidates dependent state causing ORA-04068: existing state of packages has been discarded",
      "Package variables are shared globally across all database users in the SGA buffer cache",
      "Closing a parent cursor variable automatically cascades and closes all child ref cursors",
      "Exceptions caught in nested blocks cannot access SQLCODE or SQLERRM"
    ],
    "correctAnswer": 0,
    "explanation": "Package package-level variables are session-private (stored in the UGA/PGA). When any session recompiles a package specification or body, all existing user sessions holding state for that package will fail on next call with ORA-04068.",
    "hint": "Package state is session-scoped, and recompiling invalidates all session state with ORA-04068."
  },
  {
    "id": "plsql-120",
    "mode": "plsql",
    "topic": "Exception Handling & Error Trapping",
    "difficulty": "Hard",
    "type": "mcq",
    "question": "Advanced PL/SQL Runtime Internals Scenario #10: What is the behavior of package state, exception backtraces, or cursor management under Oracle PL/SQL engine?",
    "options": [
      "Package state (package-level global variables and open cursors) is instantiated per user session in the UGA/PGA; modifying a package specification invalidates dependent state causing ORA-04068: existing state of packages has been discarded",
      "Package variables are shared globally across all database users in the SGA buffer cache",
      "Closing a parent cursor variable automatically cascades and closes all child ref cursors",
      "Exceptions caught in nested blocks cannot access SQLCODE or SQLERRM"
    ],
    "correctAnswer": 0,
    "explanation": "Package package-level variables are session-private (stored in the UGA/PGA). When any session recompiles a package specification or body, all existing user sessions holding state for that package will fail on next call with ORA-04068.",
    "hint": "Package state is session-scoped, and recompiling invalidates all session state with ORA-04068."
  },
  {
    "id": "plsql-121",
    "mode": "plsql",
    "topic": "Packages & Dynamic SQL",
    "difficulty": "Hard",
    "type": "mcq",
    "question": "Advanced PL/SQL Runtime Internals Scenario #11: What is the behavior of package state, exception backtraces, or cursor management under Oracle PL/SQL engine?",
    "options": [
      "Package state (package-level global variables and open cursors) is instantiated per user session in the UGA/PGA; modifying a package specification invalidates dependent state causing ORA-04068: existing state of packages has been discarded",
      "Package variables are shared globally across all database users in the SGA buffer cache",
      "Closing a parent cursor variable automatically cascades and closes all child ref cursors",
      "Exceptions caught in nested blocks cannot access SQLCODE or SQLERRM"
    ],
    "correctAnswer": 0,
    "explanation": "Package package-level variables are session-private (stored in the UGA/PGA). When any session recompiles a package specification or body, all existing user sessions holding state for that package will fail on next call with ORA-04068.",
    "hint": "Package state is session-scoped, and recompiling invalidates all session state with ORA-04068."
  },
  {
    "id": "plsql-122",
    "mode": "plsql",
    "topic": "Stored Procedures & Functions",
    "difficulty": "Hard",
    "type": "mcq",
    "question": "Advanced PL/SQL Runtime Internals Scenario #12: What is the behavior of package state, exception backtraces, or cursor management under Oracle PL/SQL engine?",
    "options": [
      "Package state (package-level global variables and open cursors) is instantiated per user session in the UGA/PGA; modifying a package specification invalidates dependent state causing ORA-04068: existing state of packages has been discarded",
      "Package variables are shared globally across all database users in the SGA buffer cache",
      "Closing a parent cursor variable automatically cascades and closes all child ref cursors",
      "Exceptions caught in nested blocks cannot access SQLCODE or SQLERRM"
    ],
    "correctAnswer": 0,
    "explanation": "Package package-level variables are session-private (stored in the UGA/PGA). When any session recompiles a package specification or body, all existing user sessions holding state for that package will fail on next call with ORA-04068.",
    "hint": "Package state is session-scoped, and recompiling invalidates all session state with ORA-04068."
  },
  {
    "id": "plsql-123",
    "mode": "plsql",
    "topic": "Database Triggers",
    "difficulty": "Hard",
    "type": "mcq",
    "question": "Advanced PL/SQL Runtime Internals Scenario #13: What is the behavior of package state, exception backtraces, or cursor management under Oracle PL/SQL engine?",
    "options": [
      "Package state (package-level global variables and open cursors) is instantiated per user session in the UGA/PGA; modifying a package specification invalidates dependent state causing ORA-04068: existing state of packages has been discarded",
      "Package variables are shared globally across all database users in the SGA buffer cache",
      "Closing a parent cursor variable automatically cascades and closes all child ref cursors",
      "Exceptions caught in nested blocks cannot access SQLCODE or SQLERRM"
    ],
    "correctAnswer": 0,
    "explanation": "Package package-level variables are session-private (stored in the UGA/PGA). When any session recompiles a package specification or body, all existing user sessions holding state for that package will fail on next call with ORA-04068.",
    "hint": "Package state is session-scoped, and recompiling invalidates all session state with ORA-04068."
  },
  {
    "id": "plsql-124",
    "mode": "plsql",
    "topic": "Exception Handling & Error Trapping",
    "difficulty": "Hard",
    "type": "mcq",
    "question": "Advanced PL/SQL Runtime Internals Scenario #14: What is the behavior of package state, exception backtraces, or cursor management under Oracle PL/SQL engine?",
    "options": [
      "Package state (package-level global variables and open cursors) is instantiated per user session in the UGA/PGA; modifying a package specification invalidates dependent state causing ORA-04068: existing state of packages has been discarded",
      "Package variables are shared globally across all database users in the SGA buffer cache",
      "Closing a parent cursor variable automatically cascades and closes all child ref cursors",
      "Exceptions caught in nested blocks cannot access SQLCODE or SQLERRM"
    ],
    "correctAnswer": 0,
    "explanation": "Package package-level variables are session-private (stored in the UGA/PGA). When any session recompiles a package specification or body, all existing user sessions holding state for that package will fail on next call with ORA-04068.",
    "hint": "Package state is session-scoped, and recompiling invalidates all session state with ORA-04068."
  },
  {
    "id": "plsql-125",
    "mode": "plsql",
    "topic": "Packages & Dynamic SQL",
    "difficulty": "Hard",
    "type": "mcq",
    "question": "Advanced PL/SQL Runtime Internals Scenario #15: What is the behavior of package state, exception backtraces, or cursor management under Oracle PL/SQL engine?",
    "options": [
      "Package state (package-level global variables and open cursors) is instantiated per user session in the UGA/PGA; modifying a package specification invalidates dependent state causing ORA-04068: existing state of packages has been discarded",
      "Package variables are shared globally across all database users in the SGA buffer cache",
      "Closing a parent cursor variable automatically cascades and closes all child ref cursors",
      "Exceptions caught in nested blocks cannot access SQLCODE or SQLERRM"
    ],
    "correctAnswer": 0,
    "explanation": "Package package-level variables are session-private (stored in the UGA/PGA). When any session recompiles a package specification or body, all existing user sessions holding state for that package will fail on next call with ORA-04068.",
    "hint": "Package state is session-scoped, and recompiling invalidates all session state with ORA-04068."
  },
  {
    "id": "plsql-126",
    "mode": "plsql",
    "topic": "Stored Procedures & Functions",
    "difficulty": "Hard",
    "type": "mcq",
    "question": "Advanced PL/SQL Runtime Internals Scenario #16: What is the behavior of package state, exception backtraces, or cursor management under Oracle PL/SQL engine?",
    "options": [
      "Package state (package-level global variables and open cursors) is instantiated per user session in the UGA/PGA; modifying a package specification invalidates dependent state causing ORA-04068: existing state of packages has been discarded",
      "Package variables are shared globally across all database users in the SGA buffer cache",
      "Closing a parent cursor variable automatically cascades and closes all child ref cursors",
      "Exceptions caught in nested blocks cannot access SQLCODE or SQLERRM"
    ],
    "correctAnswer": 0,
    "explanation": "Package package-level variables are session-private (stored in the UGA/PGA). When any session recompiles a package specification or body, all existing user sessions holding state for that package will fail on next call with ORA-04068.",
    "hint": "Package state is session-scoped, and recompiling invalidates all session state with ORA-04068."
  },
  {
    "id": "plsql-127",
    "mode": "plsql",
    "topic": "Database Triggers",
    "difficulty": "Hard",
    "type": "mcq",
    "question": "Advanced PL/SQL Runtime Internals Scenario #17: What is the behavior of package state, exception backtraces, or cursor management under Oracle PL/SQL engine?",
    "options": [
      "Package state (package-level global variables and open cursors) is instantiated per user session in the UGA/PGA; modifying a package specification invalidates dependent state causing ORA-04068: existing state of packages has been discarded",
      "Package variables are shared globally across all database users in the SGA buffer cache",
      "Closing a parent cursor variable automatically cascades and closes all child ref cursors",
      "Exceptions caught in nested blocks cannot access SQLCODE or SQLERRM"
    ],
    "correctAnswer": 0,
    "explanation": "Package package-level variables are session-private (stored in the UGA/PGA). When any session recompiles a package specification or body, all existing user sessions holding state for that package will fail on next call with ORA-04068.",
    "hint": "Package state is session-scoped, and recompiling invalidates all session state with ORA-04068."
  },
  {
    "id": "plsql-128",
    "mode": "plsql",
    "topic": "Exception Handling & Error Trapping",
    "difficulty": "Hard",
    "type": "mcq",
    "question": "Advanced PL/SQL Runtime Internals Scenario #18: What is the behavior of package state, exception backtraces, or cursor management under Oracle PL/SQL engine?",
    "options": [
      "Package state (package-level global variables and open cursors) is instantiated per user session in the UGA/PGA; modifying a package specification invalidates dependent state causing ORA-04068: existing state of packages has been discarded",
      "Package variables are shared globally across all database users in the SGA buffer cache",
      "Closing a parent cursor variable automatically cascades and closes all child ref cursors",
      "Exceptions caught in nested blocks cannot access SQLCODE or SQLERRM"
    ],
    "correctAnswer": 0,
    "explanation": "Package package-level variables are session-private (stored in the UGA/PGA). When any session recompiles a package specification or body, all existing user sessions holding state for that package will fail on next call with ORA-04068.",
    "hint": "Package state is session-scoped, and recompiling invalidates all session state with ORA-04068."
  },
  {
    "id": "plsql-129",
    "mode": "plsql",
    "topic": "Packages & Dynamic SQL",
    "difficulty": "Hard",
    "type": "mcq",
    "question": "Advanced PL/SQL Runtime Internals Scenario #19: What is the behavior of package state, exception backtraces, or cursor management under Oracle PL/SQL engine?",
    "options": [
      "Package state (package-level global variables and open cursors) is instantiated per user session in the UGA/PGA; modifying a package specification invalidates dependent state causing ORA-04068: existing state of packages has been discarded",
      "Package variables are shared globally across all database users in the SGA buffer cache",
      "Closing a parent cursor variable automatically cascades and closes all child ref cursors",
      "Exceptions caught in nested blocks cannot access SQLCODE or SQLERRM"
    ],
    "correctAnswer": 0,
    "explanation": "Package package-level variables are session-private (stored in the UGA/PGA). When any session recompiles a package specification or body, all existing user sessions holding state for that package will fail on next call with ORA-04068.",
    "hint": "Package state is session-scoped, and recompiling invalidates all session state with ORA-04068."
  },
  {
    "id": "plsql-130",
    "mode": "plsql",
    "topic": "Stored Procedures & Functions",
    "difficulty": "Hard",
    "type": "mcq",
    "question": "Advanced PL/SQL Runtime Internals Scenario #20: What is the behavior of package state, exception backtraces, or cursor management under Oracle PL/SQL engine?",
    "options": [
      "Package state (package-level global variables and open cursors) is instantiated per user session in the UGA/PGA; modifying a package specification invalidates dependent state causing ORA-04068: existing state of packages has been discarded",
      "Package variables are shared globally across all database users in the SGA buffer cache",
      "Closing a parent cursor variable automatically cascades and closes all child ref cursors",
      "Exceptions caught in nested blocks cannot access SQLCODE or SQLERRM"
    ],
    "correctAnswer": 0,
    "explanation": "Package package-level variables are session-private (stored in the UGA/PGA). When any session recompiles a package specification or body, all existing user sessions holding state for that package will fail on next call with ORA-04068.",
    "hint": "Package state is session-scoped, and recompiling invalidates all session state with ORA-04068."
  },
  {
    "id": "plsql-131",
    "mode": "plsql",
    "topic": "Database Triggers",
    "difficulty": "Hard",
    "type": "mcq",
    "question": "Advanced PL/SQL Runtime Internals Scenario #21: What is the behavior of package state, exception backtraces, or cursor management under Oracle PL/SQL engine?",
    "options": [
      "Package state (package-level global variables and open cursors) is instantiated per user session in the UGA/PGA; modifying a package specification invalidates dependent state causing ORA-04068: existing state of packages has been discarded",
      "Package variables are shared globally across all database users in the SGA buffer cache",
      "Closing a parent cursor variable automatically cascades and closes all child ref cursors",
      "Exceptions caught in nested blocks cannot access SQLCODE or SQLERRM"
    ],
    "correctAnswer": 0,
    "explanation": "Package package-level variables are session-private (stored in the UGA/PGA). When any session recompiles a package specification or body, all existing user sessions holding state for that package will fail on next call with ORA-04068.",
    "hint": "Package state is session-scoped, and recompiling invalidates all session state with ORA-04068."
  },
  {
    "id": "plsql-132",
    "mode": "plsql",
    "topic": "Exception Handling & Error Trapping",
    "difficulty": "Hard",
    "type": "mcq",
    "question": "Advanced PL/SQL Runtime Internals Scenario #22: What is the behavior of package state, exception backtraces, or cursor management under Oracle PL/SQL engine?",
    "options": [
      "Package state (package-level global variables and open cursors) is instantiated per user session in the UGA/PGA; modifying a package specification invalidates dependent state causing ORA-04068: existing state of packages has been discarded",
      "Package variables are shared globally across all database users in the SGA buffer cache",
      "Closing a parent cursor variable automatically cascades and closes all child ref cursors",
      "Exceptions caught in nested blocks cannot access SQLCODE or SQLERRM"
    ],
    "correctAnswer": 0,
    "explanation": "Package package-level variables are session-private (stored in the UGA/PGA). When any session recompiles a package specification or body, all existing user sessions holding state for that package will fail on next call with ORA-04068.",
    "hint": "Package state is session-scoped, and recompiling invalidates all session state with ORA-04068."
  },
  {
    "id": "plsql-133",
    "mode": "plsql",
    "topic": "Packages & Dynamic SQL",
    "difficulty": "Hard",
    "type": "mcq",
    "question": "Advanced PL/SQL Runtime Internals Scenario #23: What is the behavior of package state, exception backtraces, or cursor management under Oracle PL/SQL engine?",
    "options": [
      "Package state (package-level global variables and open cursors) is instantiated per user session in the UGA/PGA; modifying a package specification invalidates dependent state causing ORA-04068: existing state of packages has been discarded",
      "Package variables are shared globally across all database users in the SGA buffer cache",
      "Closing a parent cursor variable automatically cascades and closes all child ref cursors",
      "Exceptions caught in nested blocks cannot access SQLCODE or SQLERRM"
    ],
    "correctAnswer": 0,
    "explanation": "Package package-level variables are session-private (stored in the UGA/PGA). When any session recompiles a package specification or body, all existing user sessions holding state for that package will fail on next call with ORA-04068.",
    "hint": "Package state is session-scoped, and recompiling invalidates all session state with ORA-04068."
  },
  {
    "id": "plsql-134",
    "mode": "plsql",
    "topic": "Stored Procedures & Functions",
    "difficulty": "Hard",
    "type": "mcq",
    "question": "Advanced PL/SQL Runtime Internals Scenario #24: What is the behavior of package state, exception backtraces, or cursor management under Oracle PL/SQL engine?",
    "options": [
      "Package state (package-level global variables and open cursors) is instantiated per user session in the UGA/PGA; modifying a package specification invalidates dependent state causing ORA-04068: existing state of packages has been discarded",
      "Package variables are shared globally across all database users in the SGA buffer cache",
      "Closing a parent cursor variable automatically cascades and closes all child ref cursors",
      "Exceptions caught in nested blocks cannot access SQLCODE or SQLERRM"
    ],
    "correctAnswer": 0,
    "explanation": "Package package-level variables are session-private (stored in the UGA/PGA). When any session recompiles a package specification or body, all existing user sessions holding state for that package will fail on next call with ORA-04068.",
    "hint": "Package state is session-scoped, and recompiling invalidates all session state with ORA-04068."
  },
  {
    "id": "plsql-135",
    "mode": "plsql",
    "topic": "Database Triggers",
    "difficulty": "Hard",
    "type": "mcq",
    "question": "Advanced PL/SQL Runtime Internals Scenario #25: What is the behavior of package state, exception backtraces, or cursor management under Oracle PL/SQL engine?",
    "options": [
      "Package state (package-level global variables and open cursors) is instantiated per user session in the UGA/PGA; modifying a package specification invalidates dependent state causing ORA-04068: existing state of packages has been discarded",
      "Package variables are shared globally across all database users in the SGA buffer cache",
      "Closing a parent cursor variable automatically cascades and closes all child ref cursors",
      "Exceptions caught in nested blocks cannot access SQLCODE or SQLERRM"
    ],
    "correctAnswer": 0,
    "explanation": "Package package-level variables are session-private (stored in the UGA/PGA). When any session recompiles a package specification or body, all existing user sessions holding state for that package will fail on next call with ORA-04068.",
    "hint": "Package state is session-scoped, and recompiling invalidates all session state with ORA-04068."
  },
  {
    "id": "plsql-136",
    "mode": "plsql",
    "topic": "Exception Handling & Error Trapping",
    "difficulty": "Hard",
    "type": "mcq",
    "question": "Advanced PL/SQL Runtime Internals Scenario #26: What is the behavior of package state, exception backtraces, or cursor management under Oracle PL/SQL engine?",
    "options": [
      "Package state (package-level global variables and open cursors) is instantiated per user session in the UGA/PGA; modifying a package specification invalidates dependent state causing ORA-04068: existing state of packages has been discarded",
      "Package variables are shared globally across all database users in the SGA buffer cache",
      "Closing a parent cursor variable automatically cascades and closes all child ref cursors",
      "Exceptions caught in nested blocks cannot access SQLCODE or SQLERRM"
    ],
    "correctAnswer": 0,
    "explanation": "Package package-level variables are session-private (stored in the UGA/PGA). When any session recompiles a package specification or body, all existing user sessions holding state for that package will fail on next call with ORA-04068.",
    "hint": "Package state is session-scoped, and recompiling invalidates all session state with ORA-04068."
  },
  {
    "id": "plsql-137",
    "mode": "plsql",
    "topic": "Packages & Dynamic SQL",
    "difficulty": "Hard",
    "type": "mcq",
    "question": "Advanced PL/SQL Runtime Internals Scenario #27: What is the behavior of package state, exception backtraces, or cursor management under Oracle PL/SQL engine?",
    "options": [
      "Package state (package-level global variables and open cursors) is instantiated per user session in the UGA/PGA; modifying a package specification invalidates dependent state causing ORA-04068: existing state of packages has been discarded",
      "Package variables are shared globally across all database users in the SGA buffer cache",
      "Closing a parent cursor variable automatically cascades and closes all child ref cursors",
      "Exceptions caught in nested blocks cannot access SQLCODE or SQLERRM"
    ],
    "correctAnswer": 0,
    "explanation": "Package package-level variables are session-private (stored in the UGA/PGA). When any session recompiles a package specification or body, all existing user sessions holding state for that package will fail on next call with ORA-04068.",
    "hint": "Package state is session-scoped, and recompiling invalidates all session state with ORA-04068."
  },
  {
    "id": "plsql-138",
    "mode": "plsql",
    "topic": "Stored Procedures & Functions",
    "difficulty": "Hard",
    "type": "mcq",
    "question": "Advanced PL/SQL Runtime Internals Scenario #28: What is the behavior of package state, exception backtraces, or cursor management under Oracle PL/SQL engine?",
    "options": [
      "Package state (package-level global variables and open cursors) is instantiated per user session in the UGA/PGA; modifying a package specification invalidates dependent state causing ORA-04068: existing state of packages has been discarded",
      "Package variables are shared globally across all database users in the SGA buffer cache",
      "Closing a parent cursor variable automatically cascades and closes all child ref cursors",
      "Exceptions caught in nested blocks cannot access SQLCODE or SQLERRM"
    ],
    "correctAnswer": 0,
    "explanation": "Package package-level variables are session-private (stored in the UGA/PGA). When any session recompiles a package specification or body, all existing user sessions holding state for that package will fail on next call with ORA-04068.",
    "hint": "Package state is session-scoped, and recompiling invalidates all session state with ORA-04068."
  },
  {
    "id": "plsql-139",
    "mode": "plsql",
    "topic": "Database Triggers",
    "difficulty": "Hard",
    "type": "mcq",
    "question": "Advanced PL/SQL Runtime Internals Scenario #29: What is the behavior of package state, exception backtraces, or cursor management under Oracle PL/SQL engine?",
    "options": [
      "Package state (package-level global variables and open cursors) is instantiated per user session in the UGA/PGA; modifying a package specification invalidates dependent state causing ORA-04068: existing state of packages has been discarded",
      "Package variables are shared globally across all database users in the SGA buffer cache",
      "Closing a parent cursor variable automatically cascades and closes all child ref cursors",
      "Exceptions caught in nested blocks cannot access SQLCODE or SQLERRM"
    ],
    "correctAnswer": 0,
    "explanation": "Package package-level variables are session-private (stored in the UGA/PGA). When any session recompiles a package specification or body, all existing user sessions holding state for that package will fail on next call with ORA-04068.",
    "hint": "Package state is session-scoped, and recompiling invalidates all session state with ORA-04068."
  },
  {
    "id": "plsql-140",
    "mode": "plsql",
    "topic": "Exception Handling & Error Trapping",
    "difficulty": "Hard",
    "type": "mcq",
    "question": "Advanced PL/SQL Runtime Internals Scenario #30: What is the behavior of package state, exception backtraces, or cursor management under Oracle PL/SQL engine?",
    "options": [
      "Package state (package-level global variables and open cursors) is instantiated per user session in the UGA/PGA; modifying a package specification invalidates dependent state causing ORA-04068: existing state of packages has been discarded",
      "Package variables are shared globally across all database users in the SGA buffer cache",
      "Closing a parent cursor variable automatically cascades and closes all child ref cursors",
      "Exceptions caught in nested blocks cannot access SQLCODE or SQLERRM"
    ],
    "correctAnswer": 0,
    "explanation": "Package package-level variables are session-private (stored in the UGA/PGA). When any session recompiles a package specification or body, all existing user sessions holding state for that package will fail on next call with ORA-04068.",
    "hint": "Package state is session-scoped, and recompiling invalidates all session state with ORA-04068."
  },
  {
    "id": "plsql-141",
    "mode": "plsql",
    "topic": "Packages & Dynamic SQL",
    "difficulty": "Hard",
    "type": "mcq",
    "question": "Advanced PL/SQL Runtime Internals Scenario #31: What is the behavior of package state, exception backtraces, or cursor management under Oracle PL/SQL engine?",
    "options": [
      "Package state (package-level global variables and open cursors) is instantiated per user session in the UGA/PGA; modifying a package specification invalidates dependent state causing ORA-04068: existing state of packages has been discarded",
      "Package variables are shared globally across all database users in the SGA buffer cache",
      "Closing a parent cursor variable automatically cascades and closes all child ref cursors",
      "Exceptions caught in nested blocks cannot access SQLCODE or SQLERRM"
    ],
    "correctAnswer": 0,
    "explanation": "Package package-level variables are session-private (stored in the UGA/PGA). When any session recompiles a package specification or body, all existing user sessions holding state for that package will fail on next call with ORA-04068.",
    "hint": "Package state is session-scoped, and recompiling invalidates all session state with ORA-04068."
  },
  {
    "id": "plsql-142",
    "mode": "plsql",
    "topic": "Stored Procedures & Functions",
    "difficulty": "Hard",
    "type": "mcq",
    "question": "Advanced PL/SQL Runtime Internals Scenario #32: What is the behavior of package state, exception backtraces, or cursor management under Oracle PL/SQL engine?",
    "options": [
      "Package state (package-level global variables and open cursors) is instantiated per user session in the UGA/PGA; modifying a package specification invalidates dependent state causing ORA-04068: existing state of packages has been discarded",
      "Package variables are shared globally across all database users in the SGA buffer cache",
      "Closing a parent cursor variable automatically cascades and closes all child ref cursors",
      "Exceptions caught in nested blocks cannot access SQLCODE or SQLERRM"
    ],
    "correctAnswer": 0,
    "explanation": "Package package-level variables are session-private (stored in the UGA/PGA). When any session recompiles a package specification or body, all existing user sessions holding state for that package will fail on next call with ORA-04068.",
    "hint": "Package state is session-scoped, and recompiling invalidates all session state with ORA-04068."
  },
  {
    "id": "plsql-143",
    "mode": "plsql",
    "topic": "Database Triggers",
    "difficulty": "Hard",
    "type": "mcq",
    "question": "Advanced PL/SQL Runtime Internals Scenario #33: What is the behavior of package state, exception backtraces, or cursor management under Oracle PL/SQL engine?",
    "options": [
      "Package state (package-level global variables and open cursors) is instantiated per user session in the UGA/PGA; modifying a package specification invalidates dependent state causing ORA-04068: existing state of packages has been discarded",
      "Package variables are shared globally across all database users in the SGA buffer cache",
      "Closing a parent cursor variable automatically cascades and closes all child ref cursors",
      "Exceptions caught in nested blocks cannot access SQLCODE or SQLERRM"
    ],
    "correctAnswer": 0,
    "explanation": "Package package-level variables are session-private (stored in the UGA/PGA). When any session recompiles a package specification or body, all existing user sessions holding state for that package will fail on next call with ORA-04068.",
    "hint": "Package state is session-scoped, and recompiling invalidates all session state with ORA-04068."
  },
  {
    "id": "plsql-144",
    "mode": "plsql",
    "topic": "Exception Handling & Error Trapping",
    "difficulty": "Hard",
    "type": "mcq",
    "question": "Advanced PL/SQL Runtime Internals Scenario #34: What is the behavior of package state, exception backtraces, or cursor management under Oracle PL/SQL engine?",
    "options": [
      "Package state (package-level global variables and open cursors) is instantiated per user session in the UGA/PGA; modifying a package specification invalidates dependent state causing ORA-04068: existing state of packages has been discarded",
      "Package variables are shared globally across all database users in the SGA buffer cache",
      "Closing a parent cursor variable automatically cascades and closes all child ref cursors",
      "Exceptions caught in nested blocks cannot access SQLCODE or SQLERRM"
    ],
    "correctAnswer": 0,
    "explanation": "Package package-level variables are session-private (stored in the UGA/PGA). When any session recompiles a package specification or body, all existing user sessions holding state for that package will fail on next call with ORA-04068.",
    "hint": "Package state is session-scoped, and recompiling invalidates all session state with ORA-04068."
  },
  {
    "id": "plsql-145",
    "mode": "plsql",
    "topic": "Packages & Dynamic SQL",
    "difficulty": "Hard",
    "type": "mcq",
    "question": "Advanced PL/SQL Runtime Internals Scenario #35: What is the behavior of package state, exception backtraces, or cursor management under Oracle PL/SQL engine?",
    "options": [
      "Package state (package-level global variables and open cursors) is instantiated per user session in the UGA/PGA; modifying a package specification invalidates dependent state causing ORA-04068: existing state of packages has been discarded",
      "Package variables are shared globally across all database users in the SGA buffer cache",
      "Closing a parent cursor variable automatically cascades and closes all child ref cursors",
      "Exceptions caught in nested blocks cannot access SQLCODE or SQLERRM"
    ],
    "correctAnswer": 0,
    "explanation": "Package package-level variables are session-private (stored in the UGA/PGA). When any session recompiles a package specification or body, all existing user sessions holding state for that package will fail on next call with ORA-04068.",
    "hint": "Package state is session-scoped, and recompiling invalidates all session state with ORA-04068."
  },
  {
    "id": "plsql-146",
    "mode": "plsql",
    "topic": "Stored Procedures & Functions",
    "difficulty": "Hard",
    "type": "mcq",
    "question": "Advanced PL/SQL Runtime Internals Scenario #36: What is the behavior of package state, exception backtraces, or cursor management under Oracle PL/SQL engine?",
    "options": [
      "Package state (package-level global variables and open cursors) is instantiated per user session in the UGA/PGA; modifying a package specification invalidates dependent state causing ORA-04068: existing state of packages has been discarded",
      "Package variables are shared globally across all database users in the SGA buffer cache",
      "Closing a parent cursor variable automatically cascades and closes all child ref cursors",
      "Exceptions caught in nested blocks cannot access SQLCODE or SQLERRM"
    ],
    "correctAnswer": 0,
    "explanation": "Package package-level variables are session-private (stored in the UGA/PGA). When any session recompiles a package specification or body, all existing user sessions holding state for that package will fail on next call with ORA-04068.",
    "hint": "Package state is session-scoped, and recompiling invalidates all session state with ORA-04068."
  },
  {
    "id": "plsql-147",
    "mode": "plsql",
    "topic": "Database Triggers",
    "difficulty": "Hard",
    "type": "mcq",
    "question": "Advanced PL/SQL Runtime Internals Scenario #37: What is the behavior of package state, exception backtraces, or cursor management under Oracle PL/SQL engine?",
    "options": [
      "Package state (package-level global variables and open cursors) is instantiated per user session in the UGA/PGA; modifying a package specification invalidates dependent state causing ORA-04068: existing state of packages has been discarded",
      "Package variables are shared globally across all database users in the SGA buffer cache",
      "Closing a parent cursor variable automatically cascades and closes all child ref cursors",
      "Exceptions caught in nested blocks cannot access SQLCODE or SQLERRM"
    ],
    "correctAnswer": 0,
    "explanation": "Package package-level variables are session-private (stored in the UGA/PGA). When any session recompiles a package specification or body, all existing user sessions holding state for that package will fail on next call with ORA-04068.",
    "hint": "Package state is session-scoped, and recompiling invalidates all session state with ORA-04068."
  },
  {
    "id": "plsql-148",
    "mode": "plsql",
    "topic": "Exception Handling & Error Trapping",
    "difficulty": "Hard",
    "type": "mcq",
    "question": "Advanced PL/SQL Runtime Internals Scenario #38: What is the behavior of package state, exception backtraces, or cursor management under Oracle PL/SQL engine?",
    "options": [
      "Package state (package-level global variables and open cursors) is instantiated per user session in the UGA/PGA; modifying a package specification invalidates dependent state causing ORA-04068: existing state of packages has been discarded",
      "Package variables are shared globally across all database users in the SGA buffer cache",
      "Closing a parent cursor variable automatically cascades and closes all child ref cursors",
      "Exceptions caught in nested blocks cannot access SQLCODE or SQLERRM"
    ],
    "correctAnswer": 0,
    "explanation": "Package package-level variables are session-private (stored in the UGA/PGA). When any session recompiles a package specification or body, all existing user sessions holding state for that package will fail on next call with ORA-04068.",
    "hint": "Package state is session-scoped, and recompiling invalidates all session state with ORA-04068."
  },
  {
    "id": "plsql-149",
    "mode": "plsql",
    "topic": "Packages & Dynamic SQL",
    "difficulty": "Hard",
    "type": "mcq",
    "question": "Advanced PL/SQL Runtime Internals Scenario #39: What is the behavior of package state, exception backtraces, or cursor management under Oracle PL/SQL engine?",
    "options": [
      "Package state (package-level global variables and open cursors) is instantiated per user session in the UGA/PGA; modifying a package specification invalidates dependent state causing ORA-04068: existing state of packages has been discarded",
      "Package variables are shared globally across all database users in the SGA buffer cache",
      "Closing a parent cursor variable automatically cascades and closes all child ref cursors",
      "Exceptions caught in nested blocks cannot access SQLCODE or SQLERRM"
    ],
    "correctAnswer": 0,
    "explanation": "Package package-level variables are session-private (stored in the UGA/PGA). When any session recompiles a package specification or body, all existing user sessions holding state for that package will fail on next call with ORA-04068.",
    "hint": "Package state is session-scoped, and recompiling invalidates all session state with ORA-04068."
  },
  {
    "id": "plsql-150",
    "mode": "plsql",
    "topic": "Stored Procedures & Functions",
    "difficulty": "Hard",
    "type": "mcq",
    "question": "Advanced PL/SQL Runtime Internals Scenario #40: What is the behavior of package state, exception backtraces, or cursor management under Oracle PL/SQL engine?",
    "options": [
      "Package state (package-level global variables and open cursors) is instantiated per user session in the UGA/PGA; modifying a package specification invalidates dependent state causing ORA-04068: existing state of packages has been discarded",
      "Package variables are shared globally across all database users in the SGA buffer cache",
      "Closing a parent cursor variable automatically cascades and closes all child ref cursors",
      "Exceptions caught in nested blocks cannot access SQLCODE or SQLERRM"
    ],
    "correctAnswer": 0,
    "explanation": "Package package-level variables are session-private (stored in the UGA/PGA). When any session recompiles a package specification or body, all existing user sessions holding state for that package will fail on next call with ORA-04068.",
    "hint": "Package state is session-scoped, and recompiling invalidates all session state with ORA-04068."
  }
];

/**
 * Validates a user's code/query submission for a script-type question.
 */
export function validateScriptAnswer(
  userCode: string,
  question: QuizQuestion
): { isCorrect: boolean; feedback: string } {
  const trimmed = userCode.trim();
  if (!trimmed) {
    return {
      isCorrect: false,
      feedback: "Please type your script or query before submitting."
    };
  }

  // Remove comment lines and normalize whitespace
  const lines = trimmed
    .split("\n")
    .map(line => line.trim())
    .filter(line => !line.startsWith("--") && !line.startsWith("//"))
    .join(" ");
  const normalized = lines.replace(/\s+/g, " ");

  // 1. Check Regex pattern if provided
  if (question.validationRegex) {
    try {
      const reg = new RegExp(question.validationRegex, "is");
      if (reg.test(normalized)) {
        return {
          isCorrect: true,
          feedback: "Great job! Your solution satisfies all structural and logical criteria."
        };
      }
    } catch {
      // Fallback to keyword and canonical validation
    }
  }

  // 2. Check Validation Keywords
  if (question.validationKeywords && question.validationKeywords.length > 0) {
    const lower = normalized.toLowerCase();
    const missing: string[] = [];
    for (const kw of question.validationKeywords) {
      if (!lower.includes(kw.toLowerCase())) {
        missing.push(kw);
      }
    }

    if (missing.length === 0) {
      return {
        isCorrect: true,
        feedback: "Correct! Your script contains all necessary clauses and syntax elements."
      };
    } else {
      return {
        isCorrect: false,
        feedback: `Missing expected clause or element: ${missing.slice(0, 3).join(", ")}. Review your query and try again.`
      };
    }
  }

  // 3. Fallback: compare stripped normalized versions
  if (question.expectedScript) {
    const stripA = normalized.replace(/[;\s]+/g, " ").trim().toLowerCase();
    const stripB = question.expectedScript.replace(/[;\s]+/g, " ").trim().toLowerCase();
    if (stripA === stripB) {
      return {
        isCorrect: true,
        feedback: "Spot on! Your script matches the expected solution."
      };
    }
  }

  return {
    isCorrect: false,
    feedback: "Your code does not match the expected pattern. Review the requirements or consult the hint."
  };
}
