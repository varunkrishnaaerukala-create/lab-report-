/**
 * server.js
 * 
 * Main Server Entry Point
 * ------------------------
 * Responsibility:
 * 1. Load configuration and environment variables via dotenv.
 * 2. Instantiate and configure Express application.
 * 3. Initialize the SQLite database schema and seed data.
 * 4. Register global middleware (CORS, JSON parser, static assets).
 * 5. Mount API resource routes under /books.
 * 6. Register 404 not found and centralized error handling middleware.
 * 7. Start HTTP listener on configured PORT.
 * 8. Handle graceful shutdown on process termination.
 */

const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const { initDatabase, saveToDisk, db } = require('./config/database');
const bookRoutes = require('./routes/bookRoutes');
const { notFoundHandler, errorHandler } = require('./middleware/errorHandler');

const app = express();
const PORT = process.env.PORT || 3000;

// Global Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static frontend files from 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// Root Route - API information
app.get('/api', (req, res) => {
  res.status(200).json({
    message: 'Welcome to the RESTful Book Management API (Lab 3)',
    endpoints: {
      create_book: 'POST /books',
      get_all_books: 'GET /books',
      get_single_book: 'GET /books/:id',
      search_books: 'GET /books?search_q=atomic',
      filter_books: 'GET /books?min_price=100&max_price=500',
      sort_books: 'GET /books?order_by=price&order=ASC',
      paginate_books: 'GET /books?limit=5&offset=0',
      combined_query: 'GET /books?search_q=code&min_price=100&max_price=800&order_by=price&order=ASC&limit=5&offset=0',
      update_book: 'PUT /books/:id',
      delete_book: 'DELETE /books/:id'
    }
  });
});

// Mount Book Management REST routes
app.use('/books', bookRoutes);

// Catch 404 routes
app.use(notFoundHandler);

// Global Error Handler
app.use(errorHandler);

// Initialize database schema and seeds
initDatabase().catch(err => {
  console.error('[Database Error] Failed to initialize database:', err.message);
});

// Start HTTP server listener
const server = app.listen(PORT, () => {
  console.log(`====================================================`);
  console.log(` Book Management API is running!`);
  console.log(` Server URL : http://localhost:${PORT}`);
  console.log(` Dashboard  : http://localhost:${PORT}/index.html`);
  console.log(` API Docs   : http://localhost:${PORT}/api`);
  console.log(` Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`====================================================`);
});

// Graceful shutdown
function gracefulShutdown(signal) {
  console.log(`\n[Server] Received ${signal}. Closing HTTP server and database...`);
  server.close(() => {
    console.log('[Server] HTTP server closed.');
    try {
      saveToDisk();
      if (db) db.close();
      console.log('[Database] SQLite database connection closed cleanly.');
    } catch (err) {
      console.error('[Database Error] Error closing SQLite database:', err.message);
    }
    process.exit(0);
  });
}

process.on('SIGINT', () => gracefulShutdown('SIGINT'));
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));

module.exports = { app, server };
