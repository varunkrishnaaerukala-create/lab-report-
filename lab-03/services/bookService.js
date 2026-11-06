/**
 * services/bookService.js
 * 
 * Book Business Logic and Database Interaction Layer
 * ----------------------------------------------------
 * Responsibility:
 * 1. Interface directly with SQLite database through promisified helpers.
 * 2. Execute parameterized SQL queries for all CRUD operations.
 * 3. Dynamically build parameterized SQL queries for search, price range filtering,
 *    safe whitelisted sorting, and pagination.
 * 4. Ensure no SQL Injection vulnerabilities can be introduced.
 */

const { query, get, run } = require('../config/database');
const { ALLOWED_SORT_COLUMNS, ALLOWED_SORT_ORDERS } = require('../middleware/validateBook');

class BookService {
  /**
   * Create a new book
   * @param {Object} bookData - { title, author, price }
   * @returns {Promise<Object>} Created book record
   */
  async createBook({ title, author, price }) {
    const insertSql = `
      INSERT INTO books (title, author, price)
      VALUES (?, ?, ?)
    `;
    const result = await run(insertSql, [title, author, price]);

    // Retrieve and return the newly inserted record
    const fetchSql = `SELECT * FROM books WHERE id = ?`;
    const newBook = await get(fetchSql, [result.lastID]);
    return newBook;
  }

  /**
   * Retrieve books with optional search, price filtering, sorting, and pagination
   * @param {Object} filters - { search_q, min_price, max_price, order_by, order, limit, offset }
   * @returns {Promise<{ books: Array, total: number, limit?: number, offset?: number }>}
   */
  async getAllBooks(filters = {}) {
    const {
      search_q,
      min_price,
      max_price,
      order_by,
      order,
      limit,
      offset
    } = filters;

    let baseQuery = `SELECT * FROM books`;
    let countQuery = `SELECT COUNT(*) AS total FROM books`;
    const conditions = [];
    const params = [];

    // 1. Partial title search using SQL LIKE (case-insensitive in SQLite for ASCII)
    if (search_q && search_q.trim() !== '') {
      conditions.push(`title LIKE ?`);
      params.push(`%${search_q.trim()}%`);
    }

    // 2. Price range filtering
    const minP = min_price !== undefined ? Number(min_price) : undefined;
    const maxP = max_price !== undefined ? Number(max_price) : undefined;

    if (minP !== undefined && maxP !== undefined) {
      // Both min and max provided: use BETWEEN
      conditions.push(`price BETWEEN ? AND ?`);
      params.push(minP, maxP);
    } else if (minP !== undefined) {
      // Only minimum price provided
      conditions.push(`price >= ?`);
      params.push(minP);
    } else if (maxP !== undefined) {
      // Only maximum price provided
      conditions.push(`price <= ?`);
      params.push(maxP);
    }

    // Append WHERE conditions if any exist
    if (conditions.length > 0) {
      const whereClause = ` WHERE ` + conditions.join(' AND ');
      baseQuery += whereClause;
      countQuery += whereClause;
    }

    // Total count of matching records before pagination
    const countResult = await get(countQuery, params);
    const total = countResult ? countResult.total : 0;

    // 3. Sorting with safe whitelist
    let sortColumn = 'id';
    let sortDirection = 'ASC';

    if (order_by) {
      const col = String(order_by).toLowerCase().trim();
      if (ALLOWED_SORT_COLUMNS.includes(col)) {
        sortColumn = col;
      }
    }

    if (order) {
      const dir = String(order).toUpperCase().trim();
      if (ALLOWED_SORT_ORDERS.includes(dir)) {
        sortDirection = dir;
      }
    }

    // Safely interpolate whitelisted column and direction (no raw user string)
    baseQuery += ` ORDER BY ${sortColumn} ${sortDirection}`;

    // 4. Pagination (limit and offset)
    const queryParams = [...params];
    let appliedLimit = undefined;
    let appliedOffset = undefined;

    if (limit !== undefined || offset !== undefined) {
      appliedLimit = limit !== undefined ? Number(limit) : 10;
      appliedOffset = offset !== undefined ? Number(offset) : 0;

      baseQuery += ` LIMIT ? OFFSET ?`;
      queryParams.push(appliedLimit, appliedOffset);
    }

    // Execute query with parameters
    const books = await query(baseQuery, queryParams);

    return {
      books,
      total,
      limit: appliedLimit,
      offset: appliedOffset
    };
  }

  /**
   * Retrieve a single book by ID
   * @param {number} id - Book ID
   * @returns {Promise<Object|null>}
   */
  async getBookById(id) {
    const sql = `SELECT * FROM books WHERE id = ?`;
    const book = await get(sql, [id]);
    return book || null;
  }

  /**
   * Update an existing book by ID
   * @param {number} id - Book ID
   * @param {Object} bookData - { title, author, price }
   * @returns {Promise<Object|null>}
   */
  async updateBook(id, { title, author, price }) {
    // Check if book exists first
    const existing = await this.getBookById(id);
    if (!existing) {
      return null;
    }

    const updateSql = `
      UPDATE books
      SET title = ?, author = ?, price = ?
      WHERE id = ?
    `;
    await run(updateSql, [title, author, price, id]);

    // Fetch and return the updated book
    return await this.getBookById(id);
  }

  /**
   * Delete a book by ID
   * @param {number} id - Book ID
   * @returns {Promise<Object|null>} Deleted book record or null if not found
   */
  async deleteBook(id) {
    // Check if book exists first
    const existing = await this.getBookById(id);
    if (!existing) {
      return null;
    }

    const deleteSql = `DELETE FROM books WHERE id = ?`;
    await run(deleteSql, [id]);

    return existing;
  }
}

module.exports = new BookService();

