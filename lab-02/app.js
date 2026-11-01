// app.js
// Lab 2: SQLite Database and CRUD Routes using Node.js and Express
// Student Name: Varun Krishna
// Registration Number: N25H03A1445
// Course: CSE – Gen AI
// Institution: Aurora

const express = require("express");
const path = require("path");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");

// Initialize Express application
const app = express();

// Middleware to parse incoming JSON request bodies
app.use(express.json());

// Path to SQLite database file
const dbPath = path.join(__dirname, "database.db");

// Global database reference
let db = null;

// Initial 9 sample books data
const sampleBooks = [
  { id: 1, title: "To Kill a Mockingbird", author: "Harper Lee", price: 350, pages: 281 },
  { id: 2, title: "1984", author: "George Orwell", price: 299, pages: 328 },
  { id: 3, title: "The Great Gatsby", author: "F. Scott Fitzgerald", price: 250, pages: 180 },
  { id: 4, title: "Pride and Prejudice", author: "Jane Austen", price: 199, pages: 279 },
  { id: 5, title: "The Catcher in the Rye", author: "J.D. Salinger", price: 320, pages: 234 },
  { id: 6, title: "The Hobbit", author: "J.R.R. Tolkien", price: 450, pages: 310 },
  { id: 7, title: "Fahrenheit 451", author: "Ray Bradbury", price: 280, pages: 249 },
  { id: 8, title: "The Alchemist", author: "Paulo Coelho", price: 220, pages: 208 },
  { id: 9, title: "Brave New World", author: "Aldous Huxley", price: 310, pages: 268 }
];

/**
 * Initializes the SQLite Database connection, creates the schema,
 * seeds initial sample data if table is empty, and starts the server.
 */
const initializeDBAndServer = async () => {
  try {
    // 1. Open the SQLite database connection using sqlite & sqlite3 driver
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    console.log("Connected to the SQLite database successfully.");

    // 2. Ensure table 'book' exists
    await db.exec(`
      CREATE TABLE IF NOT EXISTS book (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        author TEXT NOT NULL,
        price INTEGER NOT NULL,
        pages INTEGER NOT NULL
      );
    `);

    // 3. Seed initial 9 sample books ONLY if the table is currently empty
    const countResult = await db.get(`SELECT COUNT(*) AS count FROM book;`);
    if (countResult.count === 0) {
      console.log("Seeding 9 initial sample books into empty database...");
      for (const book of sampleBooks) {
        await db.run(
          `INSERT INTO book (id, title, author, price, pages) VALUES (?, ?, ?, ?, ?);`,
          [book.id, book.title, book.author, book.price, book.pages]
        );
      }
      console.log("Sample books seeded successfully.");
    }

    // 4. Start the Express server on port 3000 (or environment-specified port)
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
      console.log(`====================================================`);
      console.log(`Lab 2 Express Server is running!`);
      console.log(`Local URL: http://localhost:${PORT}/`);
      console.log(`Endpoints available:`);
      console.log(`  - GET    /                 (Root Welcome Route)`);
      console.log(`  - GET    /books/           (Fetch all books)`);
      console.log(`  - GET    /books/:bookId/   (Fetch single book by ID)`);
      console.log(`  - POST   /books/           (Add new book)`);
      console.log(`  - PUT    /books/:bookId/   (Update book by ID)`);
      console.log(`  - DELETE /books/:bookId/   (Delete book by ID)`);
      console.log(`====================================================`);
    });
  } catch (error) {
    console.error(`Database Initialization Error: ${error.message}`);
    process.exit(1);
  }
};

// Start the database and server initialization
initializeDBAndServer();

// ============================================================================
// ROUTES & ENDPOINTS
// ============================================================================

/**
 * Root Route: GET /
 * Description: Welcome information & student metadata
 */
app.get("/", (request, response) => {
  response.status(200).json({
    message: "Welcome to Lab 2 - SQLite Database and CRUD Routes API",
    student: {
      name: "Varun Krishna",
      registrationNumber: "N25H03A1445",
      course: "CSE – Gen AI",
      institution: "Aurora"
    },
    documentation: {
      getAllBooks: "GET /books/",
      getBookById: "GET /books/:bookId/",
      addBook: "POST /books/",
      updateBook: "PUT /books/:bookId/",
      deleteBook: "DELETE /books/:bookId/"
    }
  });
});

/**
 * 1. GET ALL BOOKS: GET /books/
 * Description: Retrieves all book records from the database ordered by ID
 */
app.get("/books/", async (request, response) => {
  try {
    const getBooksQuery = `
      SELECT
        *
      FROM
        book
      ORDER BY
        id ASC;
    `;
    const booksArray = await db.all(getBooksQuery);
    response.status(200).json(booksArray);
  } catch (error) {
    console.error("Error fetching books:", error.message);
    response.status(500).json({ error: "Internal Server Error" });
  }
});

/**
 * 2. GET SINGLE BOOK BY ID: GET /books/:bookId/
 * Description: Retrieves a specific book by its ID using parameterized query
 */
app.get("/books/:bookId/", async (request, response) => {
  try {
    const { bookId } = request.params;

    // Parameterized query using '?' placeholder to prevent SQL Injection
    const getBookQuery = `
      SELECT
        *
      FROM
        book
      WHERE
        id = ?;
    `;

    const book = await db.get(getBookQuery, [bookId]);

    if (book === undefined) {
      response.status(404).json({ error: "Book not found" });
    } else {
      response.status(200).json(book);
    }
  } catch (error) {
    console.error("Error fetching book:", error.message);
    response.status(500).json({ error: "Internal Server Error" });
  }
});

/**
 * 3. POST (CREATE) A NEW BOOK: POST /books/
 * Description: Inserts a new book into the database with input validation
 */
app.post("/books/", async (request, response) => {
  try {
    const { title, author, price, pages } = request.body;

    // Input validation: ensure all required attributes are supplied
    if (!title || !author || price === undefined || pages === undefined) {
      return response.status(400).json({
        error: "All fields (title, author, price, pages) are required",
      });
    }

    // Parameterized query using '?' placeholders to prevent SQL Injection
    const addBookQuery = `
      INSERT INTO
        book (title, author, price, pages)
      VALUES
        (?, ?, ?, ?);
    `;

    const dbResponse = await db.run(addBookQuery, [title, author, price, pages]);

    response.status(201).json({
      message: "Book Added Successfully",
      bookId: dbResponse.lastID,
    });
  } catch (error) {
    console.error("Error creating book:", error.message);
    response.status(500).json({ error: "Internal Server Error" });
  }
});

/**
 * 4. PUT (UPDATE) AN EXISTING BOOK: PUT /books/:bookId/
 * Description: Updates all details of an existing book record
 */
app.put("/books/:bookId/", async (request, response) => {
  try {
    const { bookId } = request.params;
    const { title, author, price, pages } = request.body;

    // Input validation
    if (!title || !author || price === undefined || pages === undefined) {
      return response.status(400).json({
        error: "All fields (title, author, price, pages) are required",
      });
    }

    // Parameterized query using '?' placeholders to prevent SQL Injection
    const updateBookQuery = `
      UPDATE
        book
      SET
        title = ?,
        author = ?,
        price = ?,
        pages = ?
      WHERE
        id = ?;
    `;

    const dbResponse = await db.run(updateBookQuery, [
      title,
      author,
      price,
      pages,
      bookId,
    ]);

    if (dbResponse.changes === 0) {
      response.status(404).json({ error: "Book not found" });
    } else {
      response.status(200).json({ message: "Book Updated Successfully" });
    }
  } catch (error) {
    console.error("Error updating book:", error.message);
    response.status(500).json({ error: "Internal Server Error" });
  }
});

/**
 * 5. DELETE A BOOK: DELETE /books/:bookId/
 * Description: Removes a book record by its ID
 */
app.delete("/books/:bookId/", async (request, response) => {
  try {
    const { bookId } = request.params;

    // Parameterized query using '?' placeholder to prevent SQL Injection
    const deleteBookQuery = `
      DELETE FROM
        book
      WHERE
        id = ?;
    `;

    const dbResponse = await db.run(deleteBookQuery, [bookId]);

    if (dbResponse.changes === 0) {
      response.status(404).json({ error: "Book not found" });
    } else {
      response.status(200).json({ message: "Book Deleted Successfully" });
    }
  } catch (error) {
    console.error("Error deleting book:", error.message);
    response.status(500).json({ error: "Internal Server Error" });
  }
});

/**
 * 6. UNKNOWN ROUTE FALLBACK (404 Not Found)
 */
app.use((request, response) => {
  response.status(404).json({
    status: 404,
    error: "Not Found",
    message: `Cannot ${request.method} ${request.originalUrl}. Route does not exist.`
  });
});

module.exports = app;

