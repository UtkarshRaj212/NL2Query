import type { DatasetExample, Table } from "./schema";
import { generateDatasetSQL } from "./exportUtils";
import { validateSqlIdentifier } from "./sqlNamingRules";

export interface GeneratedDatasetResult {
  name: string;
  description: string;
  tables: Table[];
  sqlScript: string;
  defaultQuery: string;
  examples: DatasetExample[];
  prompt: string;
}

// Preset intelligent templates for domain matches
const DOMAIN_TEMPLATES: Array<{
  keywords: string[];
  generate: () => Omit<GeneratedDatasetResult, "prompt">;
}> = [
  {
    keywords: ["book", "library", "author", "publisher", "novel", "reading"],
    generate: () => {
      const tables: Table[] = [
        {
          name: "authors",
          columns: [
            { name: "id", type: "INTEGER", pk: true },
            { name: "name", type: "TEXT" },
            { name: "country", type: "TEXT" },
            { name: "birth_year", type: "INTEGER" },
          ],
          rows: [
            { id: 1, name: "Jane Austen", country: "United Kingdom", birth_year: 1775 },
            { id: 2, name: "George Orwell", country: "United Kingdom", birth_year: 1903 },
            { id: 3, name: "Haruki Murakami", country: "Japan", birth_year: 1949 },
            { id: 4, name: "Gabriel Garcia Marquez", country: "Colombia", birth_year: 1927 },
          ],
        },
        {
          name: "books",
          columns: [
            { name: "id", type: "INTEGER", pk: true },
            { name: "title", type: "TEXT" },
            { name: "genre", type: "TEXT" },
            { name: "price", type: "REAL" },
            { name: "author_id", type: "INTEGER", fk: { table: "authors", column: "id" } },
          ],
          rows: [
            { id: 101, title: "Pride and Prejudice", genre: "Romance", price: 499, author_id: 1 },
            { id: 102, title: "1984", genre: "Dystopian", price: 399, author_id: 2 },
            { id: 103, title: "Animal Farm", genre: "Political Satire", price: 299, author_id: 2 },
            { id: 104, title: "Norwegian Wood", genre: "Fiction", price: 599, author_id: 3 },
            { id: 105, title: "One Hundred Years of Solitude", genre: "Magic Realism", price: 650, author_id: 4 },
          ],
        },
        {
          name: "reviews",
          columns: [
            { name: "id", type: "INTEGER", pk: true },
            { name: "book_id", type: "INTEGER", fk: { table: "books", column: "id" } },
            { name: "rating", type: "INTEGER" },
            { name: "reviewer", type: "TEXT" },
            { name: "comment", type: "TEXT" },
          ],
          rows: [
            { id: 1, book_id: 101, rating: 5, reviewer: "Alice", comment: "A timeless masterpiece!" },
            { id: 2, book_id: 102, rating: 5, reviewer: "Bob", comment: "Chilling and prophetic." },
            { id: 3, book_id: 104, rating: 4, reviewer: "Charlie", comment: "Melancholic and beautiful." },
          ],
        },
      ];
      return {
        name: "bookstore_db",
        description: "Online bookstore and library catalog with authors, books, and reader reviews.",
        tables,
        sqlScript: generateDatasetSQL("bookstore_db", tables),
        defaultQuery: "SELECT b.title, a.name, b.genre, b.price FROM books b JOIN authors a ON b.author_id = a.id;",
        examples: [
          {
            id: 1,
            category: "DQL",
            question: "List all books with their author names and prices",
            sql: "SELECT b.title, a.name AS author, b.price FROM books b JOIN authors a ON b.author_id = a.id;",
            expected: "Books with author details",
          },
          {
            id: 2,
            category: "DQL",
            question: "Find books with average rating greater than 4",
            sql: "SELECT b.title, AVG(r.rating) AS avg_rating FROM books b JOIN reviews r ON b.id = r.book_id GROUP BY b.id HAVING avg_rating >= 4;",
            expected: "Top rated books",
          },
        ],
      };
    },
  },
  {
    keywords: ["ecommerce", "e-commerce", "shop", "store", "product", "cart", "order", "retail"],
    generate: () => {
      const tables: Table[] = [
        {
          name: "customers",
          columns: [
            { name: "id", type: "INTEGER", pk: true },
            { name: "name", type: "TEXT" },
            { name: "email", type: "TEXT" },
            { name: "city", type: "TEXT" },
          ],
          rows: [
            { id: 1, name: "Aria Stark", email: "aria@winterfell.com", city: "Winterfell" },
            { id: 2, name: "Jon Snow", email: "jon@thewall.org", city: "Castle Black" },
            { id: 3, name: "Daenerys Targaryen", email: "dany@dragonstone.io", city: "Dragonstone" },
            { id: 4, name: "Tyrion Lannister", email: "tyrion@casterly.com", city: "Casterly Rock" },
          ],
        },
        {
          name: "products",
          columns: [
            { name: "id", type: "INTEGER", pk: true },
            { name: "name", type: "TEXT" },
            { name: "category", type: "TEXT" },
            { name: "price", type: "REAL" },
            { name: "stock", type: "INTEGER" },
          ],
          rows: [
            { id: 101, name: "Wireless Headphones", category: "Electronics", price: 129.99, stock: 45 },
            { id: 102, name: "Mechanical Keyboard", category: "Electronics", price: 89.5, stock: 30 },
            { id: 103, name: "Ergonomic Office Chair", category: "Furniture", price: 249.0, stock: 15 },
            { id: 104, name: "Hydro Water Bottle", category: "Accessories", price: 24.99, stock: 100 },
          ],
        },
        {
          name: "orders",
          columns: [
            { name: "id", type: "INTEGER", pk: true },
            { name: "customer_id", type: "INTEGER", fk: { table: "customers", column: "id" } },
            { name: "order_date", type: "TEXT" },
            { name: "total_amount", type: "REAL" },
            { name: "status", type: "TEXT" },
          ],
          rows: [
            { id: 1001, customer_id: 1, order_date: "2024-03-01", total_amount: 154.98, status: "Delivered" },
            { id: 1002, customer_id: 2, order_date: "2024-03-05", total_amount: 249.0, status: "Shipped" },
            { id: 1003, customer_id: 3, order_date: "2024-03-10", total_amount: 219.49, status: "Processing" },
            { id: 1004, customer_id: 1, order_date: "2024-03-15", total_amount: 89.5, status: "Delivered" },
          ],
        },
      ];
      return {
        name: "ecommerce_db",
        description: "E-Commerce retail platform tracking customers, products catalog, and orders.",
        tables,
        sqlScript: generateDatasetSQL("ecommerce_db", tables),
        defaultQuery: "SELECT o.id, c.name, o.order_date, o.total_amount, o.status FROM orders o JOIN customers c ON o.customer_id = c.id;",
        examples: [
          {
            id: 1,
            category: "DQL",
            question: "Show all orders placed by customers from Winterfell",
            sql: "SELECT o.id, c.name, o.total_amount FROM orders o JOIN customers c ON o.customer_id = c.id WHERE c.city = 'Winterfell';",
            expected: "Orders for Winterfell customers",
          },
        ],
      };
    },
  },
  {
    keywords: ["hospital", "patient", "doctor", "health", "clinic", "medical", "medicine", "prescription"],
    generate: () => {
      const tables: Table[] = [
        {
          name: "doctors",
          columns: [
            { name: "id", type: "INTEGER", pk: true },
            { name: "name", type: "TEXT" },
            { name: "specialty", type: "TEXT" },
            { name: "room_no", type: "TEXT" },
          ],
          rows: [
            { id: 1, name: "Dr. Gregory House", specialty: "Diagnostics", room_no: "402-A" },
            { id: 2, name: "Dr. Lisa Cuddy", specialty: "Endocrinology", room_no: "201-B" },
            { id: 3, name: "Dr. James Wilson", specialty: "Oncology", room_no: "305-C" },
          ],
        },
        {
          name: "patients",
          columns: [
            { name: "id", type: "INTEGER", pk: true },
            { name: "name", type: "TEXT" },
            { name: "age", type: "INTEGER" },
            { name: "blood_type", type: "TEXT" },
            { name: "city", type: "TEXT" },
          ],
          rows: [
            { id: 101, name: "Sarah Connor", age: 34, blood_type: "O+", city: "Los Angeles" },
            { id: 102, name: "Bruce Wayne", age: 41, blood_type: "A+", city: "Gotham" },
            { id: 103, name: "Peter Parker", age: 22, blood_type: "B-", city: "New York" },
            { id: 104, name: "Diana Prince", age: 29, blood_type: "AB+", city: "Washington" },
          ],
        },
        {
          name: "appointments",
          columns: [
            { name: "id", type: "INTEGER", pk: true },
            { name: "patient_id", type: "INTEGER", fk: { table: "patients", column: "id" } },
            { name: "doctor_id", type: "INTEGER", fk: { table: "doctors", column: "id" } },
            { name: "appt_date", type: "TEXT" },
            { name: "diagnosis", type: "TEXT" },
          ],
          rows: [
            { id: 501, patient_id: 101, doctor_id: 1, appt_date: "2024-04-01", diagnosis: "Routine Checkup" },
            { id: 502, patient_id: 102, doctor_id: 3, appt_date: "2024-04-03", diagnosis: "Sprained Ankle" },
            { id: 503, patient_id: 103, doctor_id: 2, appt_date: "2024-04-05", diagnosis: "Spider Bite Reaction" },
          ],
        },
      ];
      return {
        name: "hospital_db",
        description: "Healthcare clinic management system linking doctors, patients, and clinical appointments.",
        tables,
        sqlScript: generateDatasetSQL("hospital_db", tables),
        defaultQuery: "SELECT a.id, p.name AS patient, d.name AS doctor, a.appt_date, a.diagnosis FROM appointments a JOIN patients p ON a.patient_id = p.id JOIN doctors d ON a.doctor_id = d.id;",
        examples: [
          {
            id: 1,
            category: "DQL",
            question: "Find all appointments handled by Dr. Gregory House",
            sql: "SELECT a.appt_date, p.name AS patient, a.diagnosis FROM appointments a JOIN doctors d ON a.doctor_id = d.id JOIN patients p ON a.patient_id = p.id WHERE d.name LIKE '%House%';",
            expected: "House's patient appointments",
          },
        ],
      };
    },
  },
  {
    keywords: ["university", "college", "student", "course", "professor", "instructor", "enrollment", "grade", "education"],
    generate: () => {
      const tables: Table[] = [
        {
          name: "students",
          columns: [
            { name: "id", type: "INTEGER", pk: true },
            { name: "name", type: "TEXT" },
            { name: "major", type: "TEXT" },
            { name: "gpa", type: "REAL" },
            { name: "enroll_year", type: "INTEGER" },
          ],
          rows: [
            { id: 1, name: "Maya Lin", major: "Computer Science", gpa: 3.85, enroll_year: 2022 },
            { id: 2, name: "Dev Patel", major: "Data Science", gpa: 3.92, enroll_year: 2021 },
            { id: 3, name: "Chloe Kim", major: "Mathematics", gpa: 3.65, enroll_year: 2023 },
            { id: 4, name: "Liam Chen", major: "Computer Science", gpa: 3.4, enroll_year: 2022 },
          ],
        },
        {
          name: "courses",
          columns: [
            { name: "id", type: "INTEGER", pk: true },
            { name: "course_code", type: "TEXT" },
            { name: "title", type: "TEXT" },
            { name: "credits", type: "INTEGER" },
            { name: "department", type: "TEXT" },
          ],
          rows: [
            { id: 101, course_code: "CS101", title: "Intro to Databases", credits: 4, department: "Computer Science" },
            { id: 102, course_code: "DS201", title: "Machine Learning", credits: 4, department: "Data Science" },
            { id: 103, course_code: "MATH301", title: "Linear Algebra", credits: 3, department: "Mathematics" },
            { id: 104, course_code: "CS305", title: "Distributed Systems", credits: 4, department: "Computer Science" },
          ],
        },
        {
          name: "enrollments",
          columns: [
            { name: "id", type: "INTEGER", pk: true },
            { name: "student_id", type: "INTEGER", fk: { table: "students", column: "id" } },
            { name: "course_id", type: "INTEGER", fk: { table: "courses", column: "id" } },
            { name: "semester", type: "TEXT" },
            { name: "grade", type: "TEXT" },
          ],
          rows: [
            { id: 1, student_id: 1, course_id: 101, semester: "Fall 2023", grade: "A" },
            { id: 2, student_id: 1, course_id: 103, semester: "Spring 2024", grade: "A-" },
            { id: 3, student_id: 2, course_id: 102, semester: "Fall 2023", grade: "A+" },
            { id: 4, student_id: 3, course_id: 103, semester: "Fall 2023", grade: "B+" },
            { id: 5, student_id: 4, course_id: 101, semester: "Spring 2024", grade: "B" },
          ],
        },
      ];
      return {
        name: "university_db",
        description: "Academic enrollment and grading records for university students and course offerings.",
        tables,
        sqlScript: generateDatasetSQL("university_db", tables),
        defaultQuery: "SELECT s.name, c.title, e.semester, e.grade FROM enrollments e JOIN students s ON e.student_id = s.id JOIN courses c ON e.course_id = c.id;",
        examples: [
          {
            id: 1,
            category: "DQL",
            question: "Find students enrolled in Intro to Databases who received an 'A'",
            sql: "SELECT s.name, e.grade FROM enrollments e JOIN students s ON e.student_id = s.id JOIN courses c ON e.course_id = c.id WHERE c.course_code = 'CS101' AND e.grade = 'A';",
            expected: "Students with grade A in CS101",
          },
        ],
      };
    },
  },
  {
    keywords: ["flight", "airline", "airport", "plane", "travel", "passenger", "ticket"],
    generate: () => {
      const tables: Table[] = [
        {
          name: "airports",
          columns: [
            { name: "code", type: "TEXT", pk: true },
            { name: "name", type: "TEXT" },
            { name: "city", type: "TEXT" },
            { name: "country", type: "TEXT" },
          ],
          rows: [
            { code: "JFK", name: "John F. Kennedy Intl", city: "New York", country: "USA" },
            { code: "LHR", name: "Heathrow Airport", city: "London", country: "UK" },
            { code: "HND", name: "Tokyo Haneda", city: "Tokyo", country: "Japan" },
            { code: "DXB", name: "Dubai International", city: "Dubai", country: "UAE" },
          ],
        },
        {
          name: "flights",
          columns: [
            { name: "id", type: "INTEGER", pk: true },
            { name: "flight_no", type: "TEXT" },
            { name: "origin_code", type: "TEXT", fk: { table: "airports", column: "code" } },
            { name: "dest_code", type: "TEXT", fk: { table: "airports", column: "code" } },
            { name: "departure_time", type: "TEXT" },
            { name: "ticket_price", type: "REAL" },
          ],
          rows: [
            { id: 1, flight_no: "BA178", origin_code: "JFK", dest_code: "LHR", departure_time: "08:30", ticket_price: 650.0 },
            { id: 2, flight_no: "JL005", origin_code: "JFK", dest_code: "HND", departure_time: "11:45", ticket_price: 1120.0 },
            { id: 3, flight_no: "EK202", origin_code: "JFK", dest_code: "DXB", departure_time: "22:15", ticket_price: 890.0 },
          ],
        },
        {
          name: "passengers",
          columns: [
            { name: "id", type: "INTEGER", pk: true },
            { name: "flight_id", type: "INTEGER", fk: { table: "flights", column: "id" } },
            { name: "name", type: "TEXT" },
            { name: "seat", type: "TEXT" },
          ],
          rows: [
            { id: 101, flight_id: 1, name: "Robert Langdon", seat: "12A" },
            { id: 102, flight_id: 1, name: "Sophie Neveu", seat: "12B" },
            { id: 103, flight_id: 2, name: "Haruki Sato", seat: "04F" },
          ],
        },
      ];
      return {
        name: "airline_db",
        description: "Aviation flight reservation catalog tracking airports, scheduled routes, and passengers.",
        tables,
        sqlScript: generateDatasetSQL("airline_db", tables),
        defaultQuery: "SELECT f.flight_no, f.origin_code, f.dest_code, f.ticket_price FROM flights f;",
        examples: [
          {
            id: 1,
            category: "DQL",
            question: "Find all flights departing to Tokyo Haneda (HND)",
            sql: "SELECT f.flight_no, a.name AS origin, f.ticket_price FROM flights f JOIN airports a ON f.origin_code = a.code WHERE f.dest_code = 'HND';",
            expected: "Tokyo flights",
          },
        ],
      };
    },
  },
  {
    keywords: ["bank", "finance", "account", "transaction", "balance", "credit", "card", "loan"],
    generate: () => {
      const tables: Table[] = [
        {
          name: "accounts",
          columns: [
            { name: "id", type: "INTEGER", pk: true },
            { name: "holder_name", type: "TEXT" },
            { name: "account_type", type: "TEXT" },
            { name: "balance", type: "REAL" },
            { name: "status", type: "TEXT" },
          ],
          rows: [
            { id: 1001, holder_name: "Alice Cooper", account_type: "Checking", balance: 5420.5, status: "Active" },
            { id: 1002, holder_name: "Bob Marley", account_type: "Savings", balance: 18250.0, status: "Active" },
            { id: 1003, holder_name: "Charlie Puth", account_type: "Checking", balance: 950.2, status: "Active" },
            { id: 1004, holder_name: "Diana Ross", account_type: "Business", balance: 45000.75, status: "Active" },
          ],
        },
        {
          name: "transactions",
          columns: [
            { name: "id", type: "INTEGER", pk: true },
            { name: "account_id", type: "INTEGER", fk: { table: "accounts", column: "id" } },
            { name: "txn_date", type: "TEXT" },
            { name: "amount", type: "REAL" },
            { name: "txn_type", type: "TEXT" },
            { name: "description", type: "TEXT" },
          ],
          rows: [
            { id: 1, account_id: 1001, txn_date: "2024-03-01", amount: 150.0, txn_type: "Debit", description: "Grocery Store" },
            { id: 2, account_id: 1001, txn_date: "2024-03-03", amount: 2500.0, txn_type: "Credit", description: "Monthly Salary" },
            { id: 3, account_id: 1002, txn_date: "2024-03-04", amount: 500.0, txn_type: "Credit", description: "Interest Deposit" },
            { id: 4, account_id: 1003, txn_date: "2024-03-05", amount: 45.99, txn_type: "Debit", description: "Coffee Shop" },
          ],
        },
      ];
      return {
        name: "banking_db",
        description: "Banking ledger tracking accounts, cash balances, and financial transaction histories.",
        tables,
        sqlScript: generateDatasetSQL("banking_db", tables),
        defaultQuery: "SELECT a.holder_name, t.txn_date, t.amount, t.txn_type, t.description FROM transactions t JOIN accounts a ON t.account_id = a.id;",
        examples: [
          {
            id: 1,
            category: "DQL",
            question: "List total debit spending per account holder",
            sql: "SELECT a.holder_name, SUM(t.amount) AS total_spent FROM transactions t JOIN accounts a ON t.account_id = a.id WHERE t.txn_type = 'Debit' GROUP BY a.holder_name;",
            expected: "Total spending by account",
          },
        ],
      };
    },
  },
  {
    keywords: ["restaurant", "food", "cafe", "menu", "dish", "chef", "dining", "meal"],
    generate: () => {
      const tables: Table[] = [
        {
          name: "menu_items",
          columns: [
            { name: "id", type: "INTEGER", pk: true },
            { name: "name", type: "TEXT" },
            { name: "category", type: "TEXT" },
            { name: "price", type: "REAL" },
            { name: "is_vegetarian", type: "INTEGER" },
          ],
          rows: [
            { id: 1, name: "Margherita Pizza", category: "Mains", price: 14.5, is_vegetarian: 1 },
            { id: 2, name: "Truffle Pasta", category: "Mains", price: 22.0, is_vegetarian: 1 },
            { id: 3, name: "Grilled Salmon", category: "Mains", price: 26.5, is_vegetarian: 0 },
            { id: 4, name: "Tiramisu", category: "Dessert", price: 8.5, is_vegetarian: 1 },
          ],
        },
        {
          name: "dining_orders",
          columns: [
            { name: "id", type: "INTEGER", pk: true },
            { name: "table_number", type: "INTEGER" },
            { name: "server_name", type: "TEXT" },
            { name: "total_price", type: "REAL" },
            { name: "order_time", type: "TEXT" },
          ],
          rows: [
            { id: 101, table_number: 4, server_name: "Marco", total_price: 45.0, order_time: "19:15" },
            { id: 102, table_number: 7, server_name: "Giulia", total_price: 78.5, order_time: "20:00" },
            { id: 103, table_number: 2, server_name: "Marco", total_price: 36.5, order_time: "20:30" },
          ],
        },
      ];
      return {
        name: "restaurant_db",
        description: "Bistro restaurant dining management covering menu items, tables, and server orders.",
        tables,
        sqlScript: generateDatasetSQL("restaurant_db", tables),
        defaultQuery: "SELECT * FROM menu_items WHERE is_vegetarian = 1;",
        examples: [
          {
            id: 1,
            category: "DQL",
            question: "Find all vegetarian menu items under $20",
            sql: "SELECT name, price FROM menu_items WHERE is_vegetarian = 1 AND price < 20;",
            expected: "Affordable vegetarian items",
          },
        ],
      };
    },
  },
];

/**
 * Fallback generator that heuristically creates a clean relational schema
 * from any arbitrary prompt when offline or API call is unavailable.
 */
export function generateLocalFallbackDataset(prompt: string): GeneratedDatasetResult {
  const lower = prompt.toLowerCase();

  // 1. Try matching curated templates
  for (const template of DOMAIN_TEMPLATES) {
    if (template.keywords.some((kw) => lower.includes(kw))) {
      const res = template.generate();
      return {
        ...res,
        prompt,
      };
    }
  }

  // 2. Generic generator for arbitrary custom prompts
  const words = prompt
    .replace(/[^\w\s]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 2 && !["create", "make", "with", "have", "that", "this", "some", "table", "dataset", "database"].includes(w.toLowerCase()));

  const primaryEntity = (words[0] || "items").toLowerCase().replace(/s$/, "") + "s";
  const secondaryEntity = (words[1] || "categories").toLowerCase().replace(/s$/, "") + "s";

  const dbName = `${(words[0] || "custom").toLowerCase()}_db`.slice(0, 24);

  const tables: Table[] = [
    {
      name: secondaryEntity,
      columns: [
        { name: "id", type: "INTEGER", pk: true },
        { name: "name", type: "TEXT" },
        { name: "status", type: "TEXT" },
      ],
      rows: [
        { id: 1, name: "Tier Alpha", status: "Active" },
        { id: 2, name: "Tier Beta", status: "Active" },
        { id: 3, name: "Tier Gamma", status: "Pending" },
      ],
    },
    {
      name: primaryEntity,
      columns: [
        { name: "id", type: "INTEGER", pk: true },
        { name: "title", type: "TEXT" },
        { name: "category_id", type: "INTEGER", fk: { table: secondaryEntity, column: "id" } },
        { name: "score", type: "REAL" },
        { name: "created_at", type: "TEXT" },
      ],
      rows: [
        { id: 101, title: "Alpha Record 1", category_id: 1, score: 92.5, created_at: "2024-01-10" },
        { id: 102, title: "Beta Record 2", category_id: 2, score: 84.0, created_at: "2024-01-15" },
        { id: 103, title: "Gamma Record 3", category_id: 3, score: 76.5, created_at: "2024-02-01" },
      ],
    },
  ];

  return {
    name: dbName,
    description: `Custom dataset generated from prompt: "${prompt.slice(0, 100)}"`,
    tables,
    sqlScript: generateDatasetSQL(dbName, tables),
    defaultQuery: `SELECT p.id, p.title, c.name, p.score FROM ${primaryEntity} p JOIN ${secondaryEntity} c ON p.category_id = c.id;`,
    examples: [
      {
        id: 1,
        category: "DQL",
        question: `Select all records from ${primaryEntity}`,
        sql: `SELECT * FROM ${primaryEntity} LIMIT 10;`,
        expected: `Preview rows from ${primaryEntity}`,
      },
    ],
    prompt,
  };
}

/**
 * Sends prompt to the AI backend endpoint (/api/dataset/generate).
 * Seamlessly falls back to local smart generation on any error.
 */
export async function generateDatasetFromPrompt(prompt: string): Promise<GeneratedDatasetResult> {
  const cleanPrompt = prompt.trim();
  if (!cleanPrompt) {
    throw new Error("Please enter a prompt describing the dataset you wish to create.");
  }

  try {
    const res = await fetch("/api/dataset/generate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ prompt: cleanPrompt }),
    });

    if (res.ok) {
      const data = await res.json();
      if (data && data.tables && Array.isArray(data.tables) && data.tables.length > 0) {
        // Validate and sanitize table structures
        const sanitizedTables: Table[] = data.tables.map((t: any) => {
          const tName = (t.name || "table").toLowerCase().replace(/[^\w]/g, "_");
          const cols = (t.columns || []).map((c: any) => ({
            name: (c.name || "col").toLowerCase().replace(/[^\w]/g, "_"),
            type: ["INTEGER", "TEXT", "REAL", "BOOLEAN", "DATE", "VARCHAR"].includes(c.type?.toUpperCase())
              ? c.type.toUpperCase()
              : "TEXT",
            pk: Boolean(c.pk),
            fk: c.fk && c.fk.table ? { table: c.fk.table.toLowerCase(), column: c.fk.column || "id" } : undefined,
          }));

          // Ensure at least one PK
          if (!cols.some((c: any) => c.pk)) {
            if (cols.length > 0) cols[0].pk = true;
          }

          // Sanitize rows
          const rows = (t.rows || []).map((r: any) => {
            const cleanRow: Record<string, string | number> = {};
            for (const col of cols) {
              const val = r[col.name];
              if (val === undefined || val === null) {
                cleanRow[col.name] = col.type === "INTEGER" || col.type === "REAL" ? 0 : "";
              } else if (typeof val === "boolean") {
                cleanRow[col.name] = val ? 1 : 0;
              } else if (typeof val === "number") {
                cleanRow[col.name] = val;
              } else {
                cleanRow[col.name] = String(val);
              }
            }
            return cleanRow;
          });

          return {
            name: tName,
            columns: cols,
            rows,
          };
        });

        const rawName = (data.name || "custom_db").toLowerCase().replace(/[^\w]/g, "_");
        const dbNameVal = validateSqlIdentifier(rawName, "database");
        const safeName = dbNameVal.isValid ? rawName : "generated_db";

        const sqlScript = generateDatasetSQL(safeName, sanitizedTables);
        const defaultQuery = data.defaultQuery || `SELECT * FROM ${sanitizedTables[0]?.name || "table"} LIMIT 10;`;

        return {
          name: safeName,
          description: data.description || `Generated relational database with ${sanitizedTables.length} tables`,
          tables: sanitizedTables,
          sqlScript,
          defaultQuery,
          examples: data.examples || [
            {
              id: 1,
              category: "DQL",
              question: `Explore all records from ${sanitizedTables[0]?.name}`,
              sql: defaultQuery,
              expected: `Sample query on ${sanitizedTables[0]?.name}`,
            },
          ],
          prompt: cleanPrompt,
        };
      }
    }
  } catch (err) {
    console.warn("AI generation endpoint unavailable, using smart local fallback:", err);
  }

  // Graceful smart local fallback
  return generateLocalFallbackDataset(cleanPrompt);
}
