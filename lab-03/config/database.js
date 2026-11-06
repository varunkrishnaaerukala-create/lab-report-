/**
 * config/database.js
 * 
 * Database Configuration and Initialization Module
 * -------------------------------------------------
 * Responsibility:
 * 1. Establish SQLite database connection using 'sqlite3'.
 * 2. Initialize the 'books' table schema if it does not exist.
 * 3. Seed initial 12 sample books if the table is empty.
 * 4. Export promisified query helpers (query, get, run) to enable clean
 *    async/await operations and avoid callback hell.
 * 5. Enforce parameterized queries to prevent SQL Injection vulnerabilities.
 */

const sqlite3 = require('sqlite3').verbose();
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

// Create connection to SQLite database
const db = new sqlite3.Database(dbFilePath, (err) => {
  if (err) {
    console.error(`[Database Error] Failed to connect to SQLite at ${dbFilePath}:`, err.message);
  } else {
    console.log(`[Database] Connected successfully to SQLite database: ${dbFilePath}`);
  }
});

/**
 * Promisified helper for db.all (retrieves multiple rows)
 * @param {string} sql - Parameterized SQL query
 * @param {Array} params - Array of parameter values
 * @returns {Promise<Array>}
 */
function query(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) {
        reject(err);
      } else {
        resolve(rows);
      }
    });
  });
}

/**
 * Promisified helper for db.get (retrieves a single row)
 * @param {string} sql - Parameterized SQL query
 * @param {Array} params - Array of parameter values
 * @returns {Promise<Object|undefined>}
 */
function get(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) {
        reject(err);
      } else {
        resolve(row);
      }
    });
  });
}

/**
 * Promisified helper for db.run (INSERT, UPDATE, DELETE)
 * @param {string} sql - Parameterized SQL query
 * @param {Array} params - Array of parameter values
 * @returns {Promise<{ lastID: number, changes: number }>}
 */
function run(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) {
        reject(err);
      } else {
        resolve({ lastID: this.lastID, changes: this.changes });
      }
    });
  });
}

/**
 * Initialize Schema and Seed Initial Data
 */
async function initDatabase() {
  try {
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

// Auto-run schema initialization
initDatabase();

module.exports = {
  db,
  query,
  get,
  run,
  initDatabase
};

