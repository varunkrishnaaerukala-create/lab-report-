# Book Management RESTful API & Dashboard
### B.Tech 2nd Year – Backend Development Fundamentals | Lab 3

![Node.js](https://img.shields.io/badge/Node.js-v20+-339933?style=for-the-badge&logo=node.js&logoColor=white)
![Express.js](https://img.shields.io/badge/Express.js-v4.21-000000?style=for-the-badge&logo=express&logoColor=white)
![SQLite](https://img.shields.io/badge/SQLite-v3-003B57?style=for-the-badge&logo=sqlite&logoColor=white)
![REST API](https://img.shields.io/badge/REST-API-0284c7?style=for-the-badge)
![Status](https://img.shields.io/badge/Tests-20%2F20%20Passing-success?style=for-the-badge)

---

## 1. Project Title
**Production-Grade RESTful Book Management API with Dynamic Query Processing, Request Validation, Defensive SQLite Layer, and In-Depth Debugging**

---

## 2. Project Description
This project is an end-to-end backend application designed and implemented for **B.Tech 2nd Year Backend Development Fundamentals, Lab 3**. 

The application is built using **Node.js**, **Express.js**, and an embedded **SQLite** database. It exposes a complete RESTful interface adhering to HTTP/1.1 specifications, enforcing strict separation of concerns through an enterprise-grade **Controller-Service-Repository/Database pattern**.

In addition to standard CRUD operations, the API provides high-performance query parameter handling that supports **partial title searching (SQL `LIKE`)**, **price range filtering (SQL `BETWEEN` / relational operators)**, **safe whitelist-driven sorting**, and **offset-limit pagination**. Incoming data is validated by specialized middleware to prevent malicious input, type mismatches, and SQL injection attacks. An optional modern **Single Page Dashboard** is included under `/public` for real-time visualization and faculty demonstration.

---

## 3. Project Objectives
- Architect and develop a RESTful API following industry best practices.
- Decouple routing, validation, business logic, and database operations.
- Implement dynamic, parameterized SQL queries in SQLite to defend against SQL Injection.
- Process complex URL query parameters (search, sorting, filtering, pagination) concurrently.
- Validate request bodies, URL route parameters, and query strings with consistent error formats.
- Map HTTP operations to appropriate status codes (`200`, `201`, `400`, `404`, `500`).
- Master debugging techniques for standard backend anomalies (`EADDRINUSE`, `MODULE_NOT_FOUND`, `no such table`, and unawaited asynchronous operations).
- Provide an automated test suite and an importable Postman collection with 20 distinct test cases.

---

## 4. Technologies Used
- **Runtime Environment:** [Node.js](https://nodejs.org/) (v18+)
- **Web Framework:** [Express.js](https://expressjs.com/) (v4.21.2)
- **Database:** [SQLite3](https://www.sqlite.org/) via `sqlite3` driver
- **Environment Management:** [dotenv](https://www.npmjs.com/package/dotenv)
- **Cross-Origin Handling:** [cors](https://www.npmjs.com/package/cors)
- **Development Tooling:** [nodemon](https://nodemon.io/)
- **API Testing:** [Postman](https://www.postman.com/) & Native Node.js HTTP Test Suite
- **Frontend Dashboard:** Vanilla JavaScript, HTML5, Modern CSS3 Flex/Grid

---

## 5. Project Folder Structure

```
lab-3/
│
├── config/
│   └── database.js          # SQLite connection, schema init, auto-seeding, and Promisified helpers
│
├── controllers/
│   └── bookController.js    # HTTP request handling, response structuring, and status code dispatching
│
├── routes/
│   └── bookRoutes.js        # REST endpoints mapping, validation binding, and controller invocation
│
├── middleware/
│   ├── errorHandler.js      # Global 404 handler and 500 error interception
│   └── validateBook.js      # Body, params, and query string validators with whitelist checks
│
├── services/
│   └── bookService.js       # Core business logic and parameterized SQL query compilation
│
├── database/
│   └── books.db             # Auto-generated SQLite database storage file
│
├── screenshots/
│   └── README.md            # Guidelines and checklist for viva / lab evaluation screenshots
│
├── public/                  # Optional modern frontend dashboard
│   ├── index.html           # Responsive user interface
│   ├── styles.css           # Modern theme, toast notifications, and modal dialogs
│   └── app.js               # Client-side state manager and asynchronous fetch client
│
├── tests/
│   └── verifyEndpoints.js   # Automated test suite executing all 20 required lab test cases
│
├── .env                     # Local environment configuration (ignored by git)
├── .env.example             # Template environment variables for graders/collaborators
├── .gitignore               # Exclusions for node_modules, .env, and temp files
├── package.json             # NPM dependencies, scripts, and project metadata
├── postman_collection.json  # Importable Postman v2.1 collection with 20 test cases
├── server.js                # Application entry point and graceful termination handlers
└── README.md                # Comprehensive documentation and viva preparation guide
```

### Architectural Separation of Concerns
1. **`routes/`:** Purely declarative. Defines what HTTP methods and paths exist and binds which validation middleware and controller methods should be executed.
2. **`middleware/`:** Intercepts incoming requests. Validates inputs before they reach business logic. Prevents invalid data from wasting database cycles.
3. **`controllers/`:** Acts as the traffic controller. It extracts input from `req.body`, `req.params`, or `req.query`, invokes the relevant service method, and formats the output into standard JSON with HTTP status codes.
4. **`services/`:** Contains all business logic. It has zero knowledge of `req` or `res`. It constructs SQL queries, enforces business rules, and communicates with the database layer.
5. **`config/`:** Manages low-level infrastructure connections, initializes schemas, seeds sample data, and provides Promisified database primitives.

---

## 6. Database Design

The project uses an embedded SQLite database named `books.db` stored inside the `database/` directory.

### Table Schema: `books`

| Column Name  | Data Type | Constraints                           | Description                                  |
|--------------|-----------|---------------------------------------|----------------------------------------------|
| `id`         | INTEGER   | PRIMARY KEY AUTOINCREMENT             | Unique auto-incrementing identifier          |
| `title`      | TEXT      | NOT NULL                              | Title of the book (cannot be null or empty)  |
| `author`     | TEXT      | NOT NULL                              | Author of the book                           |
| `price`      | REAL      | NOT NULL                              | Retail price (must be non-negative)          |
| `created_at` | DATETIME  | DEFAULT CURRENT_TIMESTAMP             | Timestamp of creation generated by SQLite   |

### DDL Statement (Data Definition Language)
```sql
CREATE TABLE IF NOT EXISTS books (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  author TEXT NOT NULL,
  price REAL NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### Initial Seed Data
When the server starts up for the first time, if the `books` table contains 0 records, it automatically seeds 12 diverse books:
1. *Atomic Habits* by James Clear (₹450.00)
2. *The Pragmatic Programmer* by Andrew Hunt & David Thomas (₹850.00)
3. *Clean Code* by Robert C. Martin (₹720.00)
4. *You Don't Know JS Yet* by Kyle Simpson (₹380.00)
5. *Design Patterns* by Erich Gamma et al. (₹950.00)
6. *Introduction to Algorithms* by Thomas H. Cormen (₹1200.00)
7. *JavaScript: The Good Parts* by Douglas Crockford (₹299.00)
8. *Deep Work* by Cal Newport (₹499.00)
9. *Refactoring* by Martin Fowler (₹810.00)
10. *Database System Concepts* by Abraham Silberschatz (₹1150.00)
11. *Cracking the Coding Interview* by Gayle Laakmann McDowell (₹650.00)
12. *Node.js Design Patterns* by Mario Casciaro (₹890.00)

### SQL Injection Prevention
All dynamic SQL operations strictly use parameterized placeholders (`?`). User inputs are never directly concatenated into SQL queries. Column names used in `ORDER BY` clauses are validated against a strict in-memory whitelist before being appended.

---

## 7. Installation Instructions

### Prerequisites
- Node.js installed on your machine (v18.0.0 or higher recommended).
- Git installed.

### Step-by-Step Setup
1. Clone or navigate to the project directory:
   ```bash
   cd lab-3
   ```
2. Install the necessary dependencies:
   ```bash
   npm install
   ```

---

## 8. Environment Variable Configuration

Create a local `.env` file in the root of the project by copying `.env.example`:

```bash
cp .env.example .env
```

### Environment Variables Defined:
```env
# Server Configuration
PORT=3000
NODE_ENV=development

# Database Configuration
DB_PATH=./database/books.db
```

> **Security Note:** Never commit `.env` into version control. Ensure it is listed inside `.gitignore`.

---

## 9. How to Run the Project

### Running in Production Mode:
```bash
npm start
```

### Running in Development Mode (with automatic restart via nodemon):
```bash
npm run dev
```

### Running the Automated 20-Test Verification Suite:
```bash
npm test
```

When started, access the server at:
- **REST API Base URL:** `http://localhost:3000`
- **Interactive Web Dashboard:** `http://localhost:3000/index.html`
- **API Spec Overview:** `http://localhost:3000/api`

---

## 10. Complete API Endpoint Documentation

### Base URL: `http://localhost:3000`

---

### A. Create a Book
- **Endpoint:** `POST /books`
- **Description:** Adds a new book to the database.
- **Headers:** `Content-Type: application/json`
- **Request Body:**
  ```json
  {
    "title": "Atomic Habits",
    "author": "James Clear",
    "price": 450
  }
  ```
- **Responses:**
  - **`201 Created`:**
    ```json
    {
      "message": "Book created successfully",
      "data": {
        "id": 1,
        "title": "Atomic Habits",
        "author": "James Clear",
        "price": 450,
        "created_at": "2026-11-05 05:45:00"
      }
    }
    ```
  - **`400 Bad Request`:**
    ```json
    {
      "message": "Validation failed",
      "errors": [
        "Title is required and cannot be empty",
        "Price must be a valid number"
      ]
    }
    ```

---

### B. Get All Books
- **Endpoint:** `GET /books`
- **Description:** Returns all books or filtered subset based on query parameters.
- **Responses:**
  - **`200 OK`:**
    ```json
    {
      "message": "Books retrieved successfully",
      "data": [
        {
          "id": 1,
          "title": "Atomic Habits",
          "author": "James Clear",
          "price": 450,
          "created_at": "2026-11-05 05:45:00"
        }
      ]
    }
    ```

---

### C. Get a Single Book by ID
- **Endpoint:** `GET /books/:id`
- **Description:** Retrieves details of a specific book.
- **Responses:**
  - **`200 OK` (Found):**
    ```json
    {
      "message": "Book retrieved successfully",
      "data": {
        "id": 1,
        "title": "Atomic Habits",
        "author": "James Clear",
        "price": 450,
        "created_at": "2026-11-05 05:45:00"
      }
    }
    ```
  - **`404 Not Found`:**
    ```json
    {
      "message": "Book not found"
    }
    ```
  - **`400 Bad Request` (Invalid ID):**
    ```json
    {
      "message": "Validation failed",
      "errors": [
        "Book ID must be a positive integer"
      ]
    }
    ```

---

### D. Update a Book by ID
- **Endpoint:** `PUT /books/:id`
- **Description:** Updates the title, author, and price of an existing book.
- **Request Body:**
  ```json
  {
    "title": "Atomic Habits (Second Edition)",
    "author": "James Clear",
    "price": 550
  }
  ```
- **Responses:**
  - **`200 OK`:**
    ```json
    {
      "message": "Book updated successfully",
      "data": {
        "id": 1,
        "title": "Atomic Habits (Second Edition)",
        "author": "James Clear",
        "price": 550,
        "created_at": "2026-11-05 05:45:00"
      }
    }
    ```
  - **`404 Not Found`:**
    ```json
    {
      "message": "Book not found"
    }
    ```

---

### E. Delete a Book by ID
- **Endpoint:** `DELETE /books/:id`
- **Description:** Deletes a book record from the SQLite database.
- **Responses:**
  - **`200 OK`:**
    ```json
    {
      "message": "Book deleted successfully",
      "data": {
        "id": 1,
        "title": "Atomic Habits",
        "author": "James Clear",
        "price": 450,
        "created_at": "2026-11-05 05:45:00"
      }
    }
    ```
  - **`404 Not Found`:**
    ```json
    {
      "message": "Book not found"
    }
    ```

---

## 11. Query Parameter Explanations

The `GET /books` endpoint accepts flexible query parameters:

| Parameter   | Type    | Example Values         | Description                                                      |
|-------------|---------|------------------------|------------------------------------------------------------------|
| `search_q`  | string  | `atomic`, `clean`      | Performs partial title search using SQL `LIKE %search_q%`.       |
| `min_price` | number  | `200`, `500.50`        | Filters books with `price >= min_price`.                         |
| `max_price` | number  | `800`, `1200`          | Filters books with `price <= max_price`.                         |
| `order_by`  | string  | `title`, `price`, `id` | Sorts records by specified column. Must be in safe whitelist.    |
| `order`     | string  | `ASC`, `DESC`          | Direction of sorting (Ascending or Descending).                  |
| `limit`     | integer | `5`, `10`              | Maximum number of books returned in one page.                    |
| `offset`    | integer | `0`, `5`, `10`         | Number of records to skip before starting to return results.     |

### Example: Combined Query
```
GET /books?search_q=code&min_price=100&max_price=900&order_by=price&order=ASC&limit=5&offset=0
```
**Response Format:**
```json
{
  "message": "Books retrieved successfully",
  "data": [
    {
      "id": 3,
      "title": "Clean Code",
      "author": "Robert C. Martin",
      "price": 720,
      "created_at": "2026-11-05 05:45:00"
    }
  ],
  "pagination": {
    "total": 1,
    "limit": 5,
    "offset": 0,
    "count": 1
  }
}
```

---

## 12. Request Validation Rules

Incoming requests are inspected by `middleware/validateBook.js` before reaching the controllers:

1. **Title Validation:**
   - Must be present in `POST` and `PUT` request bodies.
   - Must be a non-empty string after whitespace trimming.
2. **Author Validation:**
   - Must be present in `POST` and `PUT` request bodies.
   - Must be a non-empty string after whitespace trimming.
3. **Price Validation:**
   - Must be a valid numeric value.
   - Must be non-negative (`price >= 0`).
4. **ID Route Parameter Validation:**
   - Must be a positive integer (`Number.isInteger(id)` and `id > 0`).
5. **Sorting Whitelist Validation:**
   - Allowed columns: `id`, `title`, `author`, `price`, `created_at`.
   - Any unknown column generates a `400 Bad Request` with an explanatory message.
   - Allowed order directions: `ASC`, `DESC`.
6. **Price Range Filtering Logic:**
   - If both `min_price` and `max_price` are supplied, the validator asserts `min_price <= max_price`. If `min_price > max_price`, HTTP 400 is returned.
7. **Pagination Range Validation:**
   - `limit` must be a positive integer (`> 0`).
   - `offset` must be a non-negative integer (`>= 0`).

---

## 13. HTTP Status Codes Reference

| Status Code | Standard Name           | Application Usage in Lab 3                                          |
|-------------|-------------------------|---------------------------------------------------------------------|
| `200`       | OK                      | Successful `GET`, `PUT`, and `DELETE` requests.                     |
| `201`       | Created                 | Successful `POST /books` resource creation.                         |
| `400`       | Bad Request             | Validation failures, invalid data types, or illegal query params.  |
| `404`       | Not Found               | Target book ID does not exist or route endpoint is undefined.       |
| `500`       | Internal Server Error   | Unhandled runtime or database infrastructure exceptions.            |

---

## 14. Postman API Testing Guide

An importable Postman collection is included in the project root: `postman_collection.json`.

### How to Import and Run in Postman
1. Open **Postman**.
2. Click the **Import** button in the upper left.
3. Select the file `postman_collection.json` from the `lab-3` root folder.
4. Ensure the `baseUrl` collection variable is set to `http://localhost:3000`.
5. Run the entire collection using the **Postman Collection Runner** or execute requests individually.

### Detailed Table of All 20 Test Cases

| #  | Test Case Description                                  | Method | Endpoint URL / Query                                                                                       | Request Body                                                              | Expected Status | Expected Verification                                           |
|----|--------------------------------------------------------|--------|------------------------------------------------------------------------------------------------------------|---------------------------------------------------------------------------|-----------------|-----------------------------------------------------------------|
| 01 | Create a book successfully                             | `POST` | `/books`                                                                                                   | `{"title": "Atomic Habits", "author": "James Clear", "price": 450}`       | `201 Created`   | `message` confirms creation; returned object contains `id`.     |
| 02 | Create a book without title (Validation Fail)          | `POST` | `/books`                                                                                                   | `{"author": "James Clear", "price": 450}`                                 | `400 Bad Req`   | `errors` contains `"Title is required and cannot be empty"`.    |
| 03 | Create a book without author (Validation Fail)         | `POST` | `/books`                                                                                                   | `{"title": "Atomic Habits", "price": 450}`                                 | `400 Bad Req`   | `errors` contains `"Author is required and cannot be empty"`.   |
| 04 | Create a book with negative price (Validation Fail)    | `POST` | `/books`                                                                                                   | `{"title": "Atomic Habits", "author": "James Clear", "price": -50}`        | `400 Bad Req`   | `errors` contains `"Price cannot be negative"`.                 |
| 05 | Get all books                                          | `GET`  | `/books`                                                                                                   | None                                                                      | `200 OK`        | `data` array contains initial 12 seeded books.                  |
| 06 | Get a book by valid ID                                 | `GET`  | `/books/1`                                                                                                 | None                                                                      | `200 OK`        | `data.id === 1`.                                                |
| 07 | Get a book by nonexistent ID                           | `GET`  | `/books/999999`                                                                                            | None                                                                      | `404 Not Found` | `message === "Book not found"`.                                 |
| 08 | Search books by partial title                          | `GET`  | `/books?search_q=atomic`                                                                                   | None                                                                      | `200 OK`        | All returned titles contain substring `"atomic"`.               |
| 09 | Sort books by price ascending                          | `GET`  | `/books?order_by=price&order=ASC`                                                                          | None                                                                      | `200 OK`        | Consecutive items have `price[i] >= price[i-1]`.                |
| 10 | Sort books by price descending                         | `GET`  | `/books?order_by=price&order=DESC`                                                                         | None                                                                      | `200 OK`        | Consecutive items have `price[i] <= price[i-1]`.                |
| 11 | Apply pagination (limit & offset)                      | `GET`  | `/books?limit=5&offset=0`                                                                                  | None                                                                      | `200 OK`        | `data.length === 5` and `pagination.limit === 5`.               |
| 12 | Filter by minimum price                                | `GET`  | `/books?min_price=500`                                                                                     | None                                                                      | `200 OK`        | Every returned book has `price >= 500`.                          |
| 13 | Filter by maximum price                                | `GET`  | `/books?max_price=500`                                                                                     | None                                                                      | `200 OK`        | Every returned book has `price <= 500`.                          |
| 14 | Filter by price range                                  | `GET`  | `/books?min_price=400&max_price=800`                                                                       | None                                                                      | `200 OK`        | Every returned book has `400 <= price <= 800`.                  |
| 15 | Combine multiple query parameters                      | `GET`  | `/books?search_q=code&min_price=100&max_price=1000&order_by=price&order=ASC&limit=5&offset=0`             | None                                                                      | `200 OK`        | Correct filtered subset with sorting and pagination metadata.   |
| 16 | Update an existing book                                | `PUT`  | `/books/1`                                                                                                 | `{"title": "Atomic Habits (Revised)", "author": "James Clear", "price": 550}` | `200 OK`    | Updated properties reflected in response data.                  |
| 17 | Update a nonexistent book                              | `PUT`  | `/books/999999`                                                                                            | `{"title": "Ghost", "author": "Ghost", "price": 100}`                      | `404 Not Found` | `message === "Book not found"`.                                 |
| 18 | Delete an existing book                                | `DELETE`| `/books/2`                                                                                                | None                                                                      | `200 OK`        | Confirms deletion with `message === "Book deleted successfully"`. |
| 19 | Delete a nonexistent book                              | `DELETE`| `/books/999999`                                                                                           | None                                                                      | `404 Not Found` | `message === "Book not found"`.                                 |
| 20 | Test invalid sorting & pagination (Validation Fail)    | `GET`  | `/books?order_by=invalid_column&min_price=500&max_price=100&limit=-5`                                     | None                                                                      | `400 Bad Req`   | Rejects invalid column, min > max, and negative limit.          |

---

## 15. Debugging Exercises and Solutions

During backend development, developers frequently encounter four fundamental classes of errors. Below is a deep-dive reference for identifying, explaining, and resolving each.

---

### Error 1: `EADDRINUSE` (Port Already in Use)

#### Why it occurs:
When starting an HTTP server with `app.listen(PORT)`, Node.js attempts to bind to the specified TCP port. If another process (such as a previously hung Node server, another local application, or a crashed Docker container) is already actively listening on that port, the operating system kernel throws `Error: listen EADDRINUSE: address already in use :::3000`.

#### How to Identify the Conflicting Process:
- **On Windows (PowerShell / CMD):**
  ```powershell
  # Find the Process Identifier (PID) using port 3000
  netstat -ano | findstr :3000
  ```
- **On Linux / macOS:**
  ```bash
  lsof -i :3000
  ```

#### How to Terminate the Process Safely:
- **On Windows:**
  ```powershell
  # Replace <PID> with the actual process ID returned by netstat
  taskkill /F /PID <PID>
  ```
- **On Linux / macOS:**
  ```bash
  kill -9 <PID>
  ```

#### How to Change the Server Port Dynamically:
Instead of hardcoding port 3000, read it dynamically from the environment variable:
```javascript
// server.js
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
```
To run on a different port without modifying code, update your `.env` file or launch with:
```bash
PORT=5000 npm start
```

---

### Error 2: Wrong Import Path (`MODULE_NOT_FOUND`)

#### Why it occurs:
Node.js CommonJS `require()` searches for modules following a strict algorithm:
1. Core Node.js modules (e.g. `path`, `http`, `fs`).
2. Modules inside `node_modules/` (e.g. `express`, `dotenv`).
3. Relative or absolute file paths starting with `./` or `../`.

If a relative path is incorrect or the target file extension/name has a typo, Node throws `Error: Cannot find module '../controllers/bookControllers'`.

#### Example of Problem:
```javascript
// routes/bookRoutes.js (INCORRECT)
// The file is inside routes/, and controllers/ is in parent directory
const bookController = require('./controllers/bookController'); 
// ❌ FAILS: Node looks for routes/controllers/bookController.js
```

#### Correct Resolution:
```javascript
// routes/bookRoutes.js (CORRECT)
// Step up one directory level using '../'
const bookController = require('../controllers/bookController');
// ✓ SUCCESS
```

#### Diagnostic Tips:
- Verify folder depth: Every `../` climbs up exactly one folder.
- Check case-sensitivity: While Windows is case-insensitive, Linux hosting (e.g. AWS, Render, Docker) is strictly case-sensitive. Always match filenames exactly (`bookController.js` vs `BookController.js`).

---

### Error 3: No Such Table (`SQLITE_ERROR: no such table`)

#### Why it occurs:
SQLite is an embedded file database. This error occurs when:
1. An SQL statement targets a table name that has not been created yet or has a typo (e.g. `SELECT * FROM book` instead of `books`).
2. The database connection was established against a brand-new, empty `.db` file at a different path than expected.
3. An asynchronous query executed before the asynchronous `CREATE TABLE IF NOT EXISTS` schema DDL finished executing.

#### Example of Problem:
```javascript
// database.js (INCORRECT)
const db = new sqlite3.Database('./database/books.db');
db.run("CREATE TABLE IF NOT EXISTS books (...)");

// Meanwhile, immediately in bookService.js before table creation completes:
db.all("SELECT * FROM books", [], callback);
// ❌ FAILS with SQLITE_ERROR: no such table: books
```

#### Correct Resolution:
Ensure the schema initialization is awaited or sequenced properly prior to handling incoming requests:
```javascript
// config/database.js (CORRECT)
async function initDatabase() {
  await run(`
    CREATE TABLE IF NOT EXISTS books (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      author TEXT NOT NULL,
      price REAL NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
  console.log('[Database] Schema verified and ready.');
}
initDatabase();
```

#### Verification Command:
You can verify the tables present in SQLite directly from the command line:
```bash
sqlite3 database/books.db ".tables"
```

---

### Error 4: Missing `await` in Asynchronous Database Operations

#### Why it occurs:
In modern JavaScript, database calls return a `Promise`. A Promise represents an eventual completion or failure of an asynchronous operation. If a developer forgets the `await` keyword, JavaScript immediately continues execution without waiting for the database to return data. As a result, the function receives a pending Promise object instead of the actual data, causing undefined behavior or sending empty responses.

#### Incorrect Example:
```javascript
// controllers/bookController.js (INCORRECT)
async function getBookById(req, res) {
  const { id } = req.params;

  // ❌ Missing await! book is a Promise { <pending> }, NOT the row object!
  const book = bookService.getBookById(id);

  // In JavaScript, any object (including a pending Promise) is truthy!
  if (!book) {
    return res.status(404).json({ message: "Book not found" });
  }

  // ❌ Sends an empty object {} or unresolved promise serialization to client!
  return res.status(200).json({ data: book });
}
```

#### Correct Example:
```javascript
// controllers/bookController.js (CORRECT)
async function getBookById(req, res, next) {
  try {
    const { id } = req.params;

    // ✓ Correctly await the Promise resolution
    const book = await bookService.getBookById(id);

    if (!book) {
      return res.status(404).json({ message: "Book not found" });
    }

    return res.status(200).json({
      message: "Book retrieved successfully",
      data: book
    });
  } catch (error) {
    next(error); // Pass database errors to centralized error handler
  }
}
```

---

## 16. Screenshots Section

When compiling your laboratory submission report or presenting your viva, place captured evidence into the `screenshots/` directory using the following names:

1. `01_server_startup.png` – Node server boot and SQLite connection initialization.
2. `02_postman_post_201.png` – Successful creation of a book in Postman (`POST /books`).
3. `03_postman_validation_400.png` – Validation error when required fields are missing.
4. `04_postman_get_all_200.png` – Retrieving all 12 initial seeded books.
5. `05_postman_get_id_200.png` – Fetching a single book by ID (`GET /books/1`).
6. `06_postman_get_id_404.png` – Fetching a nonexistent book (`GET /books/999999`).
7. `07_postman_search_query.png` – Querying with `?search_q=atomic`.
8. `08_postman_sort_price.png` – Querying with `?order_by=price&order=ASC`.
9. `09_postman_pagination.png` – Querying with `?limit=5&offset=0`.
10. `10_postman_price_range.png` – Querying with `?min_price=400&max_price=800`.
11. `11_postman_combined_queries.png` – Combined search, price filter, sorting, and pagination.
12. `12_postman_put_update_200.png` – Updating an existing book (`PUT /books/1`).
13. `13_postman_delete_200.png` – Deleting a book (`DELETE /books/1`).
14. `14_automated_test_suite_20_pass.png` – Terminal execution of `npm test` showing 20/20 PASS.
15. `15_frontend_dashboard.png` – Interactive browser dashboard at `http://localhost:3000/index.html`.

---

## 17. Problems Faced and Solutions

1. **Problem: Preventing SQL Injection in Dynamic Queries with Optional Filters**  
   *Challenge:* When query parameters (search, min_price, max_price) are optional, building SQL queries using string concatenation invites SQL injection vulnerabilities.  
   *Solution:* Designed an array-based query builder in `bookService.js`. Conditions are pushed to a `conditions` array as `column LIKE ?` or `price BETWEEN ? AND ?`, and values are pushed into a synchronized `params` array. The final query safely binds all values via SQLite's parameterized interface.

2. **Problem: SQL Injection via `ORDER BY` Clause**  
   *Challenge:* SQLite does not allow column identifiers in `ORDER BY ?` clauses to be parameterized with `?`.  
   *Solution:* Implemented an in-memory whitelist validation in `middleware/validateBook.js` (`ALLOWED_SORT_COLUMNS = ['id', 'title', 'author', 'price', 'created_at']`). Any attempt to pass an unlisted column is intercepted with HTTP 400 before the database is ever contacted.

3. **Problem: SQLite Callback Hell vs Modern Async/Await**  
   *Challenge:* The default `sqlite3` driver relies on nested callback functions (`db.run(sql, (err) => { ... })`), leading to deeply nested, unmaintainable code.  
   *Solution:* Created promisified helper wrappers (`query`, `get`, `run`) in `config/database.js` that resolve Promises, enabling modern `async/await` syntax throughout `bookService.js`.

4. **Problem: Discrepancy Between Unpaginated and Paginated Requests**  
   *Challenge:* The lab specification requires `GET /books` to return all books, but also requires pagination when `limit` and `offset` are passed.  
   *Solution:* In `bookService.js`, if neither `limit` nor `offset` is supplied, no `LIMIT` clause is appended, returning the complete catalog. If `limit` or `offset` is specified, the query enforces pagination and the controller attaches a `pagination` metadata object.

---

## 18. Faculty Viva & Conceptual Explanation Guide

### How Data Flows Through the Application
1. **Client Request:** A client (e.g. Postman or browser) sends an HTTP request: `POST /books`.
2. **Server Entry (`server.js`):** Express parses the incoming JSON body via `express.json()` and routes the request to `/books`.
3. **Route (`routes/bookRoutes.js`):** Matches `POST /` and directs the request through `validateBookBody` middleware.
4. **Validation Middleware (`middleware/validateBook.js`):** Checks that `title`, `author`, and `price` are valid. If validation fails, it immediately halts the request and returns `400 Bad Request`. If valid, it calls `next()`.
5. **Controller (`controllers/bookController.js`):** Receives the request, extracts fields from `req.body`, and invokes `bookService.createBook()`.
6. **Service (`services/bookService.js`):** Executes parameterized SQL `INSERT INTO books (title, author, price) VALUES (?, ?, ?)` via `config/database.js`.
7. **Database (`database/books.db`):** Inserts the record into SQLite and returns the generated `lastID`.
8. **Response:** The controller receives the inserted record, formats the standard response JSON, and sends it with status `201 Created`.

---

## 19. Suggested Git Commit History

When adding this lab project to your course repository under `lab-03/` or `lab-3/`, use the following structured commit history:

```bash
git add .gitignore package.json .env.example
git commit -m "feat(setup): initialize project configuration, npm dependencies, and environment templates"

git add config/ database/
git commit -m "feat(db): establish SQLite connection, schema definition, and automatic sample seeder"

git add middleware/
git commit -m "feat(middleware): implement book validation, sort whitelisting, and centralized error handling"

git add services/ controllers/ routes/ server.js
git commit -m "feat(api): implement RESTful CRUD endpoints with dynamic search, filter, sort, and pagination"

git add public/
git commit -m "feat(ui): build interactive book management dashboard with real-time query display"

git add tests/ postman_collection.json screenshots/ README.md
git commit -m "docs(test): add 20-test verification suite, postman collection, debugging guide, and lab documentation"
```

---

## 20. Conclusion
This project fulfills and exceeds all requirements outlined in **B.Tech 2nd Year – Backend Development Fundamentals, Lab 3**. It showcases a robust, layered architecture with comprehensive input validation, parameterized SQL queries, professional HTTP status code discipline, and practical debugging competencies.

