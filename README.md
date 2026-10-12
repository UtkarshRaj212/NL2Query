# NL2Query

An interactive web application that transforms natural-language questions and voice commands into SQL queries while providing a hands-on environment for database execution, visualization, and learning.

NL2Query combines **AI-powered query generation, an interactive relational database engine, SQL/PLSQL execution, dynamic schema visualization, and educational tools** in a unified interface.

---

## Table of Contents

1. [Installation Guide](#1-installation-guide)
2. [Project Overview](#2-project-overview)
3. [AI-Powered Natural Language to SQL](#3-ai-powered-natural-language-to-sql)
4. [Voice-Based Query Generation](#4-voice-based-query-generation)
5. [Interactive SQL Workspace](#5-interactive-sql-workspace)
6. [SQL Command Support](#6-sql-command-support)
7. [PL/SQL Execution Environment](#7-plsql-execution-environment)
8. [Interactive Database Management](#8-interactive-database-management)
9. [Dataset Selection and Management](#9-dataset-selection-and-management)
10. [Query Execution Pipeline Visualization](#10-query-execution-pipeline-visualization)
11. [Database Schema and ER Diagrams](#11-database-schema-and-er-diagrams)
12. [Query Results and Data Export](#12-query-results-and-data-export)
13. [Query History and Persistence](#13-query-history-and-persistence)
14. [SQL Explanations and Database Theory](#14-sql-explanations-and-database-theory)
15. [Learning and Assessment Tools](#15-learning-and-assessment-tools)
16. [Interactive Canvas and SQL CLI](#16-interactive-canvas-and-sql-cli)
17. [User Interface and Customization](#17-user-interface-and-customization)
18. [Technology Stack](#18-technology-stack)
19. [Example Queries](#19-example-queries)
20. [References](#20-references)

---

## 1. Installation Guide

### Prerequisites

Ensure that the following tools are installed on your system:

- **Node.js** — a compatible version for the project's Next.js dependencies.
- **pnpm** — the package manager used by this repository.
- **Git** — for cloning the repository.
- **Google Gemini API key** — required for AI-powered query generation.

### Step 1: Clone the Repository

Open a terminal and execute:

```bash
git clone https://github.com/Ompatel2007/NL2Query.git
cd NL2Query
```

### Step 2: Install Dependencies

Install the project's dependencies using pnpm:

```bash
pnpm install
```

### Step 3: Configure Environment Variables

Create a `.env` file in the project root, alongside `package.json`, and add your Google Gemini API key:

```env
GEMINI_API_KEY=your_google_gemini_api_key_here
```

Obtain an API key through [Google AI Studio](https://aistudio.google.com/apikey).

Replace the placeholder with your actual key. Keep the key private, and never commit environment files containing secrets to GitHub.

> **Note:** The API key is required for AI-powered features. The interactive database engine is implemented in the browser and does not require a separately installed database server for its sample datasets.

### Step 4: Start the Development Server

Run the following command:

```bash
pnpm dev
```

### Step 5: Open the Application

Visit the following URL in your browser:

```text
http://localhost:3000
```

The application should now be available locally.

---

## 2. Project Overview

NL2Query is designed to make relational database interaction more accessible and understandable.

Traditional database workflows require users to know SQL syntax, understand table relationships, and interpret query results. This platform combines natural-language interaction with an executable database environment and visual explanations.

### Core Capabilities

- Convert natural-language questions into SQL using Google Gemini.
- Generate queries through voice input.
- Work with SQL and PL/SQL in dedicated modes.
- Execute supported database commands in an interactive relational engine.
- Inspect query execution stages and intermediate results.
- Explore database schemas and dynamically updated ER diagrams.
- Review query history, explanations, and downloadable results.
- Learn database concepts and practice through quizzes and assessments.

The application is intended for students, developers, and database learners who want to experiment with queries while understanding how relational operations work.

---

## 3. AI-Powered Natural Language to SQL

The natural-language-to-SQL feature allows users to describe a database operation in ordinary language instead of manually writing the entire SQL statement.

### How It Works

1. The user enters a question or database instruction.
2. The application uses the AI integration to interpret the request.
3. The current database schema provides context for generating an appropriate query.
4. The generated SQL can be inspected in the editor.
5. The user can execute the query and examine the resulting data.

### Example

**Input:**

```text
Show all products whose price is greater than 5000.
```

**Generated SQL:**

```sql
SELECT name, category, price
FROM products
WHERE price > 5000;
```

### Key Capabilities

- Natural-language interpretation of database questions.
- Schema-aware query generation.
- Support for common retrieval, manipulation, and schema-definition operations.
- A workflow for reviewing and executing generated queries.
- Integration with the interactive database environment.

Users can also work directly in the SQL editor when they want complete control over the query.

**Important:** AI-generated SQL should be reviewed before execution. The quality of a generated query depends on the wording of the request, the available schema context, and the AI model's interpretation.

---

## 4. Voice-Based Query Generation

The voice interface enables users to interact with the database using spoken instructions.

### Features

- Capture spoken input through the browser's audio capabilities.
- Convert spoken database questions into an AI-interpreted request.
- Generate SQL from the interpreted request.
- Use the inline microphone control for dictation.
- Optionally hear spoken readback through text-to-speech functionality.
- View audio-reactive interface animations during voice interaction.

### Example

A user can say:

```text
Find the total number of customers in the database.
```

The system can generate:

```sql
SELECT COUNT(*) FROM customers;
```

Voice interaction is useful for hands-free experimentation and demonstrates how conversational interfaces can simplify database access.

Microphone permissions and browser support may affect the availability of audio features.

---

## 5. Interactive SQL Workspace

The SQL workspace provides an environment for writing, editing, executing, and reviewing database queries.

### Features

- Dedicated SQL editing area.
- AI-generated SQL that can be reviewed and modified.
- Direct execution of manually written queries.
- Sample queries for experimentation.
- Execution results displayed within the application.
- Access to query history and database information.
- SQL and PL/SQL operating modes.

Users can experiment with queries without needing to switch between a separate SQL editor, database client, and visualization tool.

### Typical Workflow

1. Select a dataset.
2. Enter a natural-language question or write SQL manually.
3. Inspect the generated or edited query.
4. Execute the statement.
5. Examine the result and execution details.
6. Modify the query and repeat.

This workflow supports both AI-assisted database interaction and conventional SQL practice.

---

## 6. SQL Command Support

The application implements a custom in-browser relational execution engine supporting a range of SQL operations.

### 6.1 Data Query Language (DQL)

The query engine supports common data-retrieval operations, including:

- **SELECT** - retrieve columns and expressions.
- **WHERE** - filter rows using comparison operators.
- **INNER JOIN** and **LEFT JOIN** - combine related tables.
- **GROUP BY** - group rows for aggregate calculations.
- **HAVING** - filter groups.
- **DISTINCT** - remove duplicate results.
- **ORDER BY** - sort results in ascending or descending order.
- **LIMIT** - restrict the number of returned rows.
- Aggregate operations, including **COUNT(*)**.

Supported filtering operators include `=`, `>`, `<`, `>=`, `<=`, `!=`, `<>`, and `LIKE`.

### 6.2 Data Manipulation Language (DML)

DML commands modify the data stored in the active in-browser database.

| Command | Purpose |
|---|---|
| INSERT | Add new rows |
| UPDATE | Modify existing rows |
| DELETE | Remove selected rows |

The engine includes type coercion and primary-key/foreign-key constraint validation for relevant insertion operations.

### 6.3 Data Definition Language (DDL)

DDL commands modify the database structure.

| Command | Purpose |
|---|---|
| CREATE TABLE | Create a new table |
| ALTER TABLE ADD COLUMN | Add a column |
| ALTER TABLE DROP COLUMN | Remove a column |
| ALTER TABLE RENAME TO | Rename a table |
| ALTER TABLE RENAME COLUMN | Rename a column |
| DROP TABLE | Remove a table |
| TRUNCATE TABLE | Empty a table |

The application updates the active schema as supported structural changes are performed.

### 6.4 Constraint Handling

The engine supports primary-key and foreign-key relationships and performs relevant constraint checks during supported data modifications.

These capabilities allow users to experiment with database integrity rules alongside ordinary query execution.

---

## 7. PL/SQL Execution Environment

The PL/SQL mode provides a dedicated environment for experimenting with procedural database programming.

### Features

- Separate SQL and PL/SQL operating modes.
- A PL/SQL code editor for writing procedural blocks.
- Execution of supported procedural logic.
- Console and output inspection.
- Table and split-view layouts for examining execution results.
- DBMS_OUTPUT-style output interaction through the relevant interface.
- AI-assisted query-generation workflow integrated into the broader application.

### SQL vs. PL/SQL

| SQL | PL/SQL |
|---|---|
| Primarily declarative | Procedural extension of SQL |
| Describes the data operation | Can combine operations with procedural logic |
| Used for retrieval and data modification | Supports variables, control flow, and procedural blocks in supported implementations |

The PL/SQL workspace is intended to help users explore procedural database programming alongside regular SQL.

The availability of particular Oracle PL/SQL constructs depends on the application's implemented execution capabilities. The environment should not be assumed to provide a complete Oracle Database runtime.

---

## 8. Interactive Database Management

The application includes an interactive relational database environment that allows users to experiment with data and schema changes.

### Features

- Create and modify tables through supported SQL commands.
- Insert, update, and delete records.
- Execute queries against the active dataset.
- Inspect changes in query results.
- Observe schema changes through the database visualization interface.
- Reset the database to restore its default sample data.

### Reset Database

The database reset functionality provides a convenient way to return to the default sample tables and records after experimentation.

This is especially useful when practicing DML and DDL commands that change the active database state.

### In-Browser Execution

The custom SQL engine executes supported relational operations inside the application without requiring an external database server for its sample environment.

This makes the project suitable for demonstrations, interactive learning, and local experimentation.

---

## 9. Dataset Selection and Management

The application includes three preloaded sample datasets.

### Available Datasets

| Dataset | Example domain |
|---|---|
| E-commerce | Customers, products, orders, and related records |
| Library | Books and library-related records |
| Healthcare | Healthcare-related records and relationships |

### Features

- Switch between sample database environments.
- Explore different relational schemas.
- Run queries against the selected dataset.
- Inspect relationships between tables.
- Experiment with SQL commands using representative data.
- Reset the database when needed.

Different datasets allow users to practice queries across multiple domains rather than relying on a single database schema.

The examples in this README are illustrative of the documented sample environment; exact table names and records may vary with the active dataset.

---

## 10. Query Execution Pipeline Visualization

One of the platform's central educational features is its visualization of query execution.

Instead of displaying only the final result, the application exposes stages of query processing and allows users to inspect intermediate results.

### 10.1 Query Processing Stages

The educational query pipeline includes:

1. FROM
2. JOIN
3. WHERE
4. GROUP BY
5. DISTINCT
6. HAVING
7. AGGREGATE
8. SELECT
9. ORDER BY
10. LIMIT

These stages illustrate how relational operations transform the input relations into the final query result.

### 10.2 DML and DDL Transactional Stages

For data-modification and schema-definition operations, the application presents a transactional-style pipeline:

1. Parser
2. Catalog scan
3. Constraint check
4. Mutation
5. Commit

### 10.3 Interactive Inspection

The pipeline visualization includes:

- Animated stage playback.
- Step-by-step inspection.
- Intermediate tables and row counts.
- Visibility into the sequence of supported execution operations.
- A way to connect SQL syntax with the transformations performed by the engine.

### Why It Matters

Consider a query containing a join, filter, grouping operation, and aggregate function.

Inspecting intermediate stages helps explain:

- How tables are combined.
- Which rows survive filtering.
- How records are grouped.
- How aggregate values are calculated.
- How the final output is sorted and limited.

This makes the application useful as a database learning tool, rather than only as a query-generation interface.

---

## 11. Database Schema and ER Diagrams

The schema visualization interface helps users understand the structure of the active relational database.

### Features

- View tables and their columns.
- Identify primary-key and foreign-key relationships.
- Explore relationships between database entities.
- Generate dynamic ER diagrams based on the database schema.
- Reflect supported schema modifications in the diagram.

### Dynamic Schema Updates

When users perform supported structural operations, such as creating a table or adding a column, the schema visualization can update to reflect the active database structure.

This creates a direct connection between SQL DDL commands and their effect on the database schema.

### Example

A table definition such as:

```sql
CREATE TABLE suppliers (
    id INTEGER PRIMARY KEY,
    name TEXT,
    city TEXT
);
```

introduces a new relation into the database.

The schema interface provides a visual way to inspect the resulting structure alongside the SQL command.

ER diagrams are particularly useful for understanding relational modelling, key constraints, and the relationships required to construct joins.

---

## 12. Data Import and Export

NL2SQL Generator provides flexible data import and export functionality, allowing users to load datasets from different file formats and download query results in multiple formats.

### 12.1 Data Import

The **Import Dataset** interface allows users to import external database files and structured datasets directly into the application.

**Supported import formats:**

| Format | Extension | Description |
|---|---|---|
| SQLite Database | `.db`, `.sqlite` | Import an existing SQLite database. |
| Excel | `.xlsx`, `.xls` | Import spreadsheet-based datasets. |
| CSV | `.csv` | Import comma-separated tabular data. |
| JSON | `.json` | Import structured data in JSON format. |
| TSV | `.tsv` | Import tab-separated tabular data. |
| SQL | `.sql` | Import SQL scripts containing database statements. |

**Import interface features:**
- File selection through the system file browser.
- Drag-and-drop file uploading.
- Support for multiple common database and data-exchange formats.
- A dedicated import dialog displaying supported file extensions.
- The ability to load external datasets instead of relying exclusively on the preloaded sample databases.

### 12.2 Data Export

The **Last Execution Result** interface allows users to download the results of their most recent query in **seven different file formats**.

The export panel displays the output cardinality (number of records) and the attributes (column names) of the query result before the user selects a format.

**Supported export formats:**

| Format | Extension | Description |
|---|---|---|
| CSV | `.csv` | Export tabular results for spreadsheets and data analysis. |
| Excel | `.xlsx` | Export results in an Excel-compatible workbook format. |
| Markdown | `.md` | Export results as Markdown tables for documentation and GitHub. |
| JSON | `.json` | Export structured records for programmatic use and data exchange. |
| TSV | `.tsv` | Export tabular data using tab-separated values. |
| SQL | `.sql` | Export query results in SQL-oriented form for database-related workflows. |
| SQLite Database | `.db` | Export results as a binary SQLite database file. |

**Export interface features:**
- Seven selectable output formats.
- A summary of the query result's record count and column names.
- Dedicated format-selection cards with corresponding file extensions.
- Spreadsheet-friendly exports for external analysis.
- Structured-data exports for integration with other applications.
- Documentation-friendly output through Markdown.
- Database-oriented output through SQL and SQLite formats.

### 12.3 Why Data Import and Export Matter

These capabilities make NL2SQL Generator useful for more than executing queries against sample databases.

- **Data portability:** Work with datasets from external sources.
- **Format flexibility:** Choose a suitable format for spreadsheets, applications, documentation, or database workflows.
- **Interoperability:** Transfer query results into other tools for additional processing.
- **Learning and experimentation:** Import datasets to practise SQL operations on different data.
- **Result preservation:** Download query results for future reference, reporting, or analysis.

By supporting six import-format categories and seven export formats, the platform provides a flexible workflow for moving data into the application and extracting query results for use elsewhere.

---

## 13. Query History and Persistence

The application provides query-history functionality to make repeated experimentation easier.

### Features

- Maintain a history of executed queries.
- Associate statement-type tags with history entries.
- Store query history in browser `localStorage`.
- Preserve the dark/light theme preference across page reloads.

History allows users to revisit previous SQL statements instead of recreating them from scratch.

Because browser-local storage is used, this persistence should not be interpreted as cross-device synchronization or server-side account storage.

The database state itself should not be assumed to persist across reloads unless that behavior is explicitly implemented for the relevant environment.

---

## 14. SQL Explanations and Database Theory

The application connects practical query execution with the underlying concepts of relational database systems.

### Query Explanations

The broader learning interface provides explanations intended to help users understand generated SQL and database operations.

These explanations complement the SQL editor and execution results by helping users connect a natural-language request to the corresponding database statement.

### Relational Algebra

The theory and pipeline interface includes relational algebra notation associated with execution stages.

Users can connect common SQL operations with their relational counterparts, such as:

- Selection for filtering rows.
- Projection for selecting attributes.
- Joins for combining relations.
- Grouping and aggregation for summarizing data.

### Query Processing Theory

The pipeline provides a practical way to study the order and effects of query-processing operations.

### Transaction Theory

The theory panels also cover ACID transaction concepts:

- **Atomicity:** A transaction is treated as an indivisible unit.
- **Consistency:** A transaction should preserve defined integrity constraints.
- **Isolation:** Concurrent transactions should not interfere improperly.
- **Durability:** Committed changes should persist according to the database's guarantees.

These panels are educational explanations; the presence of transaction theory does not imply that the custom in-browser engine implements every ACID guarantee of a production database.

---

## 15. Learning and Assessment Tools

In addition to query execution, the website includes learning and assessment features.

### Learn

The learning interface supports exploration of SQL and database concepts through educational material.

### Quiz

The quiz functionality provides a way to practise database-related concepts and test understanding.

### Exam PYQs

The previous-year-question section supports exam-oriented practice using database questions.

### Samples

Sample queries and examples provide starting points for exploring SQL syntax and database operations.

### Help

The help interface provides guidance for navigating and using the application's features.

Together, these tools make the project useful for learning, experimentation, and exam preparation in addition to AI-assisted SQL generation.

---

## 16. Interactive Canvas and SQL CLI

The website also includes additional interfaces for experimenting with database operations.

### Interactive Canvas

The canvas provides a dedicated interactive area within the broader workspace. It complements the query editor and visualization-oriented tools.

### SQL CLI

The SQL command-line-style interface provides an alternative way to interact with the database environment.

### DBMS_OUTPUT-Style Output

The relevant output interface provides a console-style view for examining supported procedural or textual output.

These interfaces offer alternative ways to work with SQL and PL/SQL without restricting the application to a single editor-and-results layout.

---

## 17. User Interface and Customization

The application uses an interactive interface designed to keep query editing, database inspection, and learning tools accessible in one place.

### Features

- SQL and PL/SQL mode selection.
- Dedicated query editors and execution views.
- Pipeline, schema, and result interfaces.
- Console, table, and split-view layouts where supported.
- Dark and light appearance modes.
- Persistent theme preference.
- Voice interaction controls.
- Download and export actions.
- Navigation to learning and assessment tools.

The interface combines functional database tooling with visual feedback to make the underlying operations easier to explore.

---

## 18. Technology Stack

The project uses the following technologies -

| Technology | Purpose |
|---|---|
| Next.js | Web application framework and application routing |
| React 19 | Component-based user interface |
| TypeScript | Typed application logic |
| Tailwind CSS v4 | Styling and layout |
| Vercel AI SDK | AI integration workflow |
| Google Gemini API | Natural-language interpretation and query generation |
| Mermaid.js | Dynamic ER diagram rendering |
| Web MediaRecorder API | Browser audio capture |
| Web Audio API | Audio analysis and visual feedback |
| Web Speech Synthesis API | Text-to-speech output |
| Custom TypeScript SQL engine | In-browser relational query execution |
| Browser localStorage | Query history and theme persistence |

The custom SQL engine is a central component of the architecture. It allows the sample database environment to execute supported operations without requiring a separate database server.

---

## 19. Example Queries

The following examples illustrate common operations supported by the documented SQL engine. Execute them against a compatible active dataset.

### Example 1: Count Customers

**Natural-language request:**

```text
How many customers are there?
```

**SQL:**

```sql
SELECT COUNT(*) FROM customers;
```

**Purpose:** Count the number of rows in the customers table.

### Example 2: Filter Products

**Natural-language request:**

```text
Show products with a price above 5000.
```

**SQL:**

```sql
SELECT name, category, price
FROM products
WHERE price > 5000;
```

**Purpose:** Retrieve products whose price exceeds the specified threshold.

### Example 3: Insert a Customer

**Natural Language:**

```text
Add a new customer with ID 7, name Sunil Sharma, city Bengaluru, and signup year 2024.
```

**SQL:**

```sql
INSERT INTO customers (id, name, city, signup_year)
VALUES (7, 'Sunil Sharma', 'Bengaluru', 2024);
```

**Purpose:** Add a new customer record to the `customers` table, subject to the active schema and constraints.

### Example 4: Update a Product

**Natural Language:**

```text
Update the price of the product with ID 101 to 94999.
```

**SQL:**

```sql
UPDATE products
SET price = 94999
WHERE id = 101;
```

**Purpose:** Update the price of the product identified by ID 101.

---

## 20. References

1. Silberschatz, Abraham, Henry F. Korth, and S. Sudarshan. *Database System Concepts*, 7th edition.
2. Ramakrishnan, Raghu, and Johannes Gehrke. *Database Management Systems*, 3rd edition.
3. ISO/IEC 9075. *Information Technology, Database Languages, SQL*.
4. [Next.js Documentation](https://nextjs.org/docs)
5. [React Documentation](https://react.dev/)
6. [Google AI Studio](https://aistudio.google.com/)
7. [Mermaid Documentation](https://mermaid.js.org/)