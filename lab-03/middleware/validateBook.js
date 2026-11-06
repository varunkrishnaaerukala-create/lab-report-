/**
 * middleware/validateBook.js
 * 
 * Request Validation Middleware Module
 * -------------------------------------
 * Responsibility:
 * 1. Validate request body for creating (POST) and updating (PUT) books.
 * 2. Validate URL route parameter :id.
 * 3. Validate query parameters for search, filtering, sorting, and pagination.
 * 4. Return standard HTTP 400 with descriptive error array when validation fails.
 */

// Safe whitelist for column names in ORDER BY clause
const ALLOWED_SORT_COLUMNS = ['id', 'title', 'author', 'price', 'created_at'];
const ALLOWED_SORT_ORDERS = ['ASC', 'DESC'];

/**
 * Validate request body for POST /books and PUT /books/:id
 */
function validateBookBody(req, res, next) {
  const { title, author, price } = req.body;
  const errors = [];

  // 1. Validate Title
  if (title === undefined || title === null || String(title).trim() === '') {
    errors.push('Title is required and cannot be empty');
  } else if (typeof title !== 'string') {
    errors.push('Title must be a string');
  }

  // 2. Validate Author
  if (author === undefined || author === null || String(author).trim() === '') {
    errors.push('Author is required and cannot be empty');
  } else if (typeof author !== 'string') {
    errors.push('Author must be a string');
  }

  // 3. Validate Price
  if (price === undefined || price === null || String(price).trim() === '') {
    errors.push('Price is required');
  } else {
    const numericPrice = Number(price);
    if (isNaN(numericPrice)) {
      errors.push('Price must be a valid number');
    } else if (numericPrice < 0) {
      errors.push('Price cannot be negative');
    }
  }

  // If validation errors exist, halt and respond with 400
  if (errors.length > 0) {
    return res.status(400).json({
      message: 'Validation failed',
      errors: errors
    });
  }

  // Normalize parsed price to number
  req.body.price = Number(price);
  if (typeof req.body.title === 'string') req.body.title = req.body.title.trim();
  if (typeof req.body.author === 'string') req.body.author = req.body.author.trim();

  next();
}

/**
 * Validate route parameter :id (must be a positive integer)
 */
function validateBookId(req, res, next) {
  const { id } = req.params;
  const parsedId = Number(id);

  if (!id || isNaN(parsedId) || !Number.isInteger(parsedId) || parsedId <= 0) {
    return res.status(400).json({
      message: 'Validation failed',
      errors: ['Book ID must be a positive integer']
    });
  }

  req.params.id = parsedId;
  next();
}

/**
 * Validate query parameters for GET /books
 * (search_q, min_price, max_price, order_by, order, limit, offset)
 */
function validateBookQueryParams(req, res, next) {
  const { search_q, min_price, max_price, order_by, order, limit, offset } = req.query;
  const errors = [];

  let minP = undefined;
  let maxP = undefined;

  // 1. Validate min_price
  if (min_price !== undefined) {
    minP = Number(min_price);
    if (isNaN(minP)) {
      errors.push('min_price must be a valid number');
    } else if (minP < 0) {
      errors.push('min_price cannot be negative');
    }
  }

  // 2. Validate max_price
  if (max_price !== undefined) {
    maxP = Number(max_price);
    if (isNaN(maxP)) {
      errors.push('max_price must be a valid number');
    } else if (maxP < 0) {
      errors.push('max_price cannot be negative');
    }
  }

  // 3. Validate price range logic (min <= max)
  if (minP !== undefined && maxP !== undefined && !isNaN(minP) && !isNaN(maxP)) {
    if (minP > maxP) {
      errors.push('min_price cannot be greater than max_price');
    }
  }

  // 4. Validate order_by (Whitelist check)
  if (order_by !== undefined) {
    const normalizedOrderBy = String(order_by).toLowerCase().trim();
    if (!ALLOWED_SORT_COLUMNS.includes(normalizedOrderBy)) {
      errors.push(`Invalid order_by column '${order_by}'. Allowed columns are: ${ALLOWED_SORT_COLUMNS.join(', ')}`);
    }
  }

  // 5. Validate order direction (ASC or DESC)
  if (order !== undefined) {
    const normalizedOrder = String(order).toUpperCase().trim();
    if (!ALLOWED_SORT_ORDERS.includes(normalizedOrder)) {
      errors.push(`Invalid order direction '${order}'. Allowed values are: ASC, DESC`);
    }
  }

  // 6. Validate limit
  if (limit !== undefined) {
    const parsedLimit = Number(limit);
    if (isNaN(parsedLimit) || !Number.isInteger(parsedLimit) || parsedLimit <= 0) {
      errors.push('limit must be a positive integer greater than 0');
    }
  }

  // 7. Validate offset
  if (offset !== undefined) {
    const parsedOffset = Number(offset);
    if (isNaN(parsedOffset) || !Number.isInteger(parsedOffset) || parsedOffset < 0) {
      errors.push('offset must be a non-negative integer (0 or greater)');
    }
  }

  if (errors.length > 0) {
    return res.status(400).json({
      message: 'Validation failed',
      errors: errors
    });
  }

  next();
}

module.exports = {
  validateBookBody,
  validateBookId,
  validateBookQueryParams,
  ALLOWED_SORT_COLUMNS,
  ALLOWED_SORT_ORDERS
};

