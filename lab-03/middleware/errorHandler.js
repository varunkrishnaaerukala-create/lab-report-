/**
 * middleware/errorHandler.js
 * 
 * Centralized Error Handling Middleware
 * --------------------------------------
 * Responsibility:
 * 1. Catch 404 Not Found for nonexistent API endpoints.
 * 2. Catch synchronous and asynchronous unhandled server exceptions (HTTP 500).
 * 3. Ensure consistent JSON response structure across the entire application.
 */

/**
 * 404 Not Found Handler for undefined routes
 */
function notFoundHandler(req, res, next) {
  res.status(404).json({
    message: `Route not found: ${req.method} ${req.originalUrl}`
  });
}

/**
 * Global Error Handler (4 arguments required for Express to recognize as error middleware)
 */
function errorHandler(err, req, res, next) {
  console.error(`[Server Error] [${req.method} ${req.originalUrl}]:`, err.stack || err.message);

  // Status code: use existing error status or default to 500 Internal Server Error
  const statusCode = err.statusCode || err.status || 500;
  
  const response = {
    message: err.message || 'Internal server error'
  };

  // Include stack trace only in development environment
  if (process.env.NODE_ENV === 'development') {
    response.stack = err.stack;
  }

  res.status(statusCode).json(response);
}

module.exports = {
  notFoundHandler,
  errorHandler
};

