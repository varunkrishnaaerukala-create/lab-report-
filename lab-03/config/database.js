/**
 * config/database.js
 * 
 * Database Configuration and Initialization Module
 * -------------------------------------------------
 * Responsibility:
 * 1. Establish SQLite database connection using 'sql.js' (pure JS/WASM, no native compilation).
 * 2. Initialize the 'books' table schema if it does not exist.
 * 3. Seed initial 12 sample books if the table is empty.
 * 4. Export promisified query helpers (query, get, run) to enable clean
 *    async/await operations used by services and controllers.
 * 5. Enforce parameterized queries to prevent SQL Injection vulnerabilities.
 * 6. Auto-persist database changes to disk after every write operation.
 */

const initSqlJs = require('sql.js');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

// Determine database path from environment or default to database/books.db
const dbRelativePath = process.env.DB_PATH || './database/books.db';
const dbFilePath = path.resolve(__dirname, '..', dbRelativePath);

// Ensure the directory for the database file exists
const dbDir = path.dirname(dbFilePath);
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

// Database instance holder (initialized asynchronously)
let db = null;

/**
 * Save the in-memory database to disk
 */
function saveToDisk() {
  if (db) {
    const data = db.export();
    const buffer = Buffer.from(data);
    fs.writeFileSync(dbFilePath, buffer);
  }
}

/**
 * Initialize sql.js and load or create the database
 * @returns {Promise<void>}
 */
async function initSqlJsDatabase() {
  const SQL = await initSqlJs();

  // Load existing database file or create a new one
  if (fs.existsSync(dbFilePath)) {
    const fileBuffer = fs.readFileSync(dbFilePath);
    db = new SQL.Database(fileBuffer);
    console.log(`[Database] Connected successfully to SQLite database: ${dbFilePath}`);
  } else {
    db = new SQL.Database();
    console.log(`[Database] Created new SQLite database: ${dbFilePath}`);
    saveToDisk();
  }
}

/**
 * Promisified helper for SELECT queries that return multiple rows
 * @param {string} sql - Parameterized SQL query
 * @param {Array} params - Array of parameter values
 * @returns {Promise<Array>}
 */
function query(sql, params = []) {
  return new Promise((resolve, reject) => {
    try {
      if (!db) {
        return reject(new Error('Database not initialized'));
      }
      const stmt = db.prepare(sql);
      stmt.bind(params);

      const rows = [];
      while (stmt.step()) {
        rows.push(stmt.getAsObject());
      }
      stmt.free();
      resolve(rows);
    } catch (err) {
      reject(err);
    }
  });
}

/**
 * Promisified helper for SELECT queries that return a single row
 * @param {string} sql - Parameterized SQL query
 * @param {Array} params - Array of parameter values
 * @returns {Promise<Object|undefined>}
 */
function get(sql, params = []) {
  return new Promise((resolve, reject) => {
    try {
      if (!db) {
        return reject(new Error('Database not initialized'));
      }
      const stmt = db.prepare(sql);
      stmt.bind(params);

      if (stmt.step()) {
        const row = stmt.getAsObject();
        stmt.free();
        resolve(row);
      } else {
        stmt.free();
        resolve(undefined);
      }
    } catch (err) {
      reject(err);
    }
  });
}

/**
 * Promisified helper for INSERT, UPDATE, DELETE statements
 * @param {string} sql - Parameterized SQL query
 * @param {Array} params - Array of parameter values
 * @returns {Promise<{ lastID: number, changes: number }>}
 */
function run(sql, params = []) {
  return new Promise((resolve, reject) => {
    try {
      if (!db) {
        return reject(new Error('Database not initialized'));
      }
      db.run(sql, params);

      // Retrieve last inserted row ID and number of changed rows
      const lastIDResult = db.exec('SELECT last_insert_rowid() AS lastID');
      const changesResult = db.exec('SELECT changes() AS changes');

      const lastID = lastIDResult.length > 0 ? lastIDResult[0].values[0][0] : 0;
      const changes = changesResult.length > 0 ? changesResult[0].values[0][0] : 0;

      // Persist changes to disk after every write operation
      saveToDisk();

      resolve({ lastID, changes });
    } catch (err) {
      reject(err);
    }
  });
}

/**
 * Initialize Schema and Seed Initial Data
 */
async function initDatabase() {
  try {
    // Wait for sql.js to be ready and database loaded
    await initSqlJsDatabase();

    // 1. Create books table if not exists
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS books (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        author TEXT NOT NULL,
        price REAL NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `;
    await run(createTableQuery);

    // 2. Check if table is empty
    const countResult = await get('SELECT COUNT(*) AS count FROM books');
    if (countResult && countResult.count === 0) {
      console.log('[Database] books table is empty. Seeding initial sample books...');

      const sampleBooks = [
        { title: 'Atomic Habits', author: 'James Clear', price: 450.0 },
        { title: 'The Pragmatic Programmer', author: 'Andrew Hunt & David Thomas', price: 850.0 },
        { title: 'Clean Code', author: 'Robert C. Martin', price: 720.0 },
        { title: "You Don't Know JS Yet", author: 'Kyle Simpson', price: 380.0 },
        { title: 'Design Patterns', author: 'Erich Gamma et al.', price: 950.0 },
        { title: 'Introduction to Algorithms', author: 'Thomas H. Cormen', price: 1200.0 },
        { title: 'JavaScript: The Good Parts', author: 'Douglas Crockford', price: 299.0 },
        { title: 'Deep Work', author: 'Cal Newport', price: 499.0 },
        { title: 'Refactoring', author: 'Martin Fowler', price: 810.0 },
        { title: 'Database System Concepts', author: 'Abraham Silberschatz', price: 1150.0 },
        { title: 'Cracking the Coding Interview', author: 'Gayle Laakmann McDowell', price: 650.0 },
        { title: 'Node.js Design Patterns', author: 'Mario Casciaro', price: 890.0 }
      ];

      const insertQuery = `INSERT INTO books (title, author, price) VALUES (?, ?, ?)`;
      for (const book of sampleBooks) {
        await run(insertQuery, [book.title, book.author, book.price]);
      }

      console.log(`[Database] Successfully seeded ${sampleBooks.length} sample books.`);
    }
  } catch (error) {
    console.error('[Database Init Error]:', error.message);
  }
}

module.exports = {
  get db() { return db; },
  query,
  get,
  run,
  initDatabase,
  saveToDisk
};
