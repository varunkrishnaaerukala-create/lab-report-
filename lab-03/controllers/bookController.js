/**
 * controllers/bookController.js
 * 
 * Book Controller Layer
 * ---------------------
 * Responsibility:
 * 1. Process HTTP requests and handle HTTP responses.
 * 2. Delegate data operations to the BookService.
 * 3. Format JSON responses consistently across all endpoints.
 * 4. Apply correct HTTP status codes (200, 201, 400, 404, 500).
 * 5. Forward unhandled errors to the centralized error handling middleware.
 */

const bookService = require('../services/bookService');

class BookController {
  /**
   * POST /books
   * Create a new book
   */
  async createBook(req, res, next) {
    try {
      const { title, author, price } = req.body;
      const newBook = await bookService.createBook({ title, author, price });

      return res.status(201).json({
        message: 'Book created successfully',
        data: newBook
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /books
   * Retrieve books with search, filter, sort, and pagination
   */
  async getAllBooks(req, res, next) {
    try {
      const filters = {
        search_q: req.query.search_q,
        min_price: req.query.min_price,
        max_price: req.query.max_price,
        order_by: req.query.order_by,
        order: req.query.order,
        limit: req.query.limit,
        offset: req.query.offset
      };

      const result = await bookService.getAllBooks(filters);

      const responsePayload = {
        message: 'Books retrieved successfully',
        data: result.books
      };

      // Include pagination metadata whenever pagination params were specified
      if (result.limit !== undefined || result.offset !== undefined) {
        responsePayload.pagination = {
          total: result.total,
          limit: result.limit,
          offset: result.offset,
          count: result.books.length
        };
      }

      return res.status(200).json(responsePayload);
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /books/:id
   * Retrieve a single book by ID
   */
  async getBookById(req, res, next) {
    try {
      const { id } = req.params;
      const book = await bookService.getBookById(id);

      if (!book) {
        return res.status(404).json({
          message: 'Book not found'
        });
      }

      return res.status(200).json({
        message: 'Book retrieved successfully',
        data: book
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * PUT /books/:id
   * Update an existing book by ID
   */
  async updateBook(req, res, next) {
    try {
      const { id } = req.params;
      const { title, author, price } = req.body;

      const updatedBook = await bookService.updateBook(id, { title, author, price });

      if (!updatedBook) {
        return res.status(404).json({
          message: 'Book not found'
        });
      }

      return res.status(200).json({
        message: 'Book updated successfully',
        data: updatedBook
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * DELETE /books/:id
   * Delete a book by ID
   */
  async deleteBook(req, res, next) {
    try {
      const { id } = req.params;
      const deletedBook = await bookService.deleteBook(id);

      if (!deletedBook) {
        return res.status(404).json({
          message: 'Book not found'
        });
      }

      return res.status(200).json({
        message: 'Book deleted successfully',
        data: deletedBook
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new BookController();

