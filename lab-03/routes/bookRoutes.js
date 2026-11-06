/**
 * routes/bookRoutes.js
 * 
 * Book Routes Module
 * -------------------
 * Responsibility:
 * 1. Define RESTful routes for the /books resource.
 * 2. Attach validation middleware to routes before controller invocation.
 * 3. Connect endpoints directly to bookController methods.
 */

const express = require('express');
const router = express.Router();
const bookController = require('../controllers/bookController');
const {
  validateBookBody,
  validateBookId,
  validateBookQueryParams
} = require('../middleware/validateBook');

// 1. POST /books - Create a book
router.post(
  '/',
  validateBookBody,
  bookController.createBook.bind(bookController)
);

// 2. GET /books - Retrieve all books (with search, filter, sort, pagination)
router.get(
  '/',
  validateBookQueryParams,
  bookController.getAllBooks.bind(bookController)
);

// 3. GET /books/:id - Retrieve a single book by ID
router.get(
  '/:id',
  validateBookId,
  bookController.getBookById.bind(bookController)
);

// 4. PUT /books/:id - Update a book by ID
router.put(
  '/:id',
  validateBookId,
  validateBookBody,
  bookController.updateBook.bind(bookController)
);

// 5. DELETE /books/:id - Delete a book by ID
router.delete(
  '/:id',
  validateBookId,
  bookController.deleteBook.bind(bookController)
);

module.exports = router;

