/**
 * tests/verifyEndpoints.js
 * 
 * Comprehensive Automated Verification Suite for Lab 3
 * -----------------------------------------------------
 * Runs all 20 required test cases directly against the Express app and SQLite database.
 */

const http = require('http');
const { app, server } = require('../server');

let baseUrl = '';

function makeRequest(method, path, body = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, baseUrl);
    const options = {
      method: method,
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        let parsed = null;
        try {
          parsed = JSON.parse(data);
        } catch (e) {
          parsed = data;
        }
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          body: parsed
        });
      });
    });

    req.on('error', reject);

    if (body) {
      req.write(JSON.stringify(body));
    }
    req.end();
  });
}

function assert(condition, testNumber, testTitle, details) {
  if (condition) {
    console.log(`  ✓ [Test ${testNumber.toString().padStart(2, '0')}] PASS: ${testTitle}`);
    return true;
  } else {
    console.error(`  ✗ [Test ${testNumber.toString().padStart(2, '0')}] FAIL: ${testTitle}`);
    if (details) console.error(`     Details:`, details);
    return false;
  }
}

async function runAllTests() {
  console.log('\n======================================================');
  console.log(' Starting Lab 3 Backend Verification Suite (20 Tests)');
  console.log('======================================================\n');

  let passedCount = 0;
  let createdBookId = null;
  let tempBookForDeleteId = null;

  try {
    const address = server.address();
    const port = address.port;
    baseUrl = `http://localhost:${port}`;

    // Test 1: Create a book successfully
    {
      const res = await makeRequest('POST', '/books', {
        title: 'Designing Data-Intensive Applications',
        author: 'Martin Kleppmann',
        price: 999.00
      });
      const passed = assert(
        res.statusCode === 201 && res.body.data && res.body.data.id,
        1,
        'Create a book successfully (POST /books)',
        res.body
      );
      if (passed) {
        passedCount++;
        createdBookId = res.body.data.id;
      }
    }

    // Helper: create another temporary book to be used for delete tests
    {
      const res = await makeRequest('POST', '/books', {
        title: 'Temporary Delete Candidate',
        author: 'Temp Author',
        price: 199.00
      });
      if (res.statusCode === 201) {
        tempBookForDeleteId = res.body.data.id;
      }
    }

    // Test 2: Create a book without a title
    {
      const res = await makeRequest('POST', '/books', {
        author: 'Author Without Title',
        price: 250.00
      });
      const passed = assert(
        res.statusCode === 400 && Array.isArray(res.body.errors),
        2,
        'Create a book without a title (400 validation error)',
        res.body
      );
      if (passed) passedCount++;
    }

    // Test 3: Create a book without an author
    {
      const res = await makeRequest('POST', '/books', {
        title: 'Title Without Author',
        price: 250.00
      });
      const passed = assert(
        res.statusCode === 400 && Array.isArray(res.body.errors),
        3,
        'Create a book without an author (400 validation error)',
        res.body
      );
      if (passed) passedCount++;
    }

    // Test 4: Create a book with an invalid price
    {
      const res = await makeRequest('POST', '/books', {
        title: 'Invalid Price Book',
        author: 'Some Author',
        price: -50.00
      });
      const passed = assert(
        res.statusCode === 400 && Array.isArray(res.body.errors),
        4,
        'Create a book with a negative price (400 validation error)',
        res.body
      );
      if (passed) passedCount++;
    }

    // Test 5: Get all books
    {
      const res = await makeRequest('GET', '/books');
      const passed = assert(
        res.statusCode === 200 && Array.isArray(res.body.data) && res.body.data.length >= 10,
        5,
        'Get all books (GET /books)',
        `Total retrieved: ${res.body.data?.length}`
      );
      if (passed) passedCount++;
    }

    // Test 6: Get a book by valid ID
    {
      const res = await makeRequest('GET', `/books/${createdBookId}`);
      const passed = assert(
        res.statusCode === 200 && res.body.data && res.body.data.id === createdBookId,
        6,
        `Get a book by valid ID (GET /books/${createdBookId})`,
        res.body
      );
      if (passed) passedCount++;
    }

    // Test 7: Get a book by invalid/nonexistent ID
    {
      const res = await makeRequest('GET', '/books/999999');
      const passed = assert(
        res.statusCode === 404 && res.body.message === 'Book not found',
        7,
        'Get a book by nonexistent ID (404 Not Found)',
        res.body
      );
      if (passed) passedCount++;
    }

    // Test 8: Search books by title
    {
      const res = await makeRequest('GET', '/books?search_q=atomic');
      const allMatch = res.body.data && res.body.data.every(b => b.title.toLowerCase().includes('atomic'));
      const passed = assert(
        res.statusCode === 200 && res.body.data.length > 0 && allMatch,
        8,
        'Search books by partial title (GET /books?search_q=atomic)',
        res.body.data
      );
      if (passed) passedCount++;
    }

    // Test 9: Sort books in ascending order
    {
      const res = await makeRequest('GET', '/books?order_by=price&order=ASC');
      const prices = res.body.data?.map(b => b.price) || [];
      const isSortedAsc = prices.every((p, i) => i === 0 || prices[i - 1] <= p);
      const passed = assert(
        res.statusCode === 200 && isSortedAsc,
        9,
        'Sort books by price ASC (GET /books?order_by=price&order=ASC)',
        `Prices: ${prices.slice(0, 5).join(', ')}...`
      );
      if (passed) passedCount++;
    }

    // Test 10: Sort books in descending order
    {
      const res = await makeRequest('GET', '/books?order_by=price&order=DESC');
      const prices = res.body.data?.map(b => b.price) || [];
      const isSortedDesc = prices.every((p, i) => i === 0 || prices[i - 1] >= p);
      const passed = assert(
        res.statusCode === 200 && isSortedDesc,
        10,
        'Sort books by price DESC (GET /books?order_by=price&order=DESC)',
        `Prices: ${prices.slice(0, 5).join(', ')}...`
      );
      if (passed) passedCount++;
    }

    // Test 11: Apply pagination
    {
      const res = await makeRequest('GET', '/books?limit=5&offset=0');
      const passed = assert(
        res.statusCode === 200 &&
        res.body.data.length === 5 &&
        res.body.pagination &&
        res.body.pagination.limit === 5 &&
        res.body.pagination.offset === 0,
        11,
        'Apply pagination (GET /books?limit=5&offset=0)',
        res.body.pagination
      );
      if (passed) passedCount++;
    }

    // Test 12: Filter by minimum price
    {
      const res = await makeRequest('GET', '/books?min_price=700');
      const allAbove = res.body.data && res.body.data.every(b => b.price >= 700);
      const passed = assert(
        res.statusCode === 200 && res.body.data.length > 0 && allAbove,
        12,
        'Filter by minimum price (GET /books?min_price=700)',
        `Matches: ${res.body.data?.length}`
      );
      if (passed) passedCount++;
    }

    // Test 13: Filter by maximum price
    {
      const res = await makeRequest('GET', '/books?max_price=500');
      const allBelow = res.body.data && res.body.data.every(b => b.price <= 500);
      const passed = assert(
        res.statusCode === 200 && res.body.data.length > 0 && allBelow,
        13,
        'Filter by maximum price (GET /books?max_price=500)',
        `Matches: ${res.body.data?.length}`
      );
      if (passed) passedCount++;
    }

    // Test 14: Filter by price range
    {
      const res = await makeRequest('GET', '/books?min_price=400&max_price=800');
      const allInRange = res.body.data && res.body.data.every(b => b.price >= 400 && b.price <= 800);
      const passed = assert(
        res.statusCode === 200 && res.body.data.length > 0 && allInRange,
        14,
        'Filter by price range (GET /books?min_price=400&max_price=800)',
        `Matches: ${res.body.data?.length}`
      );
      if (passed) passedCount++;
    }

    // Test 15: Combine all query parameters
    {
      const res = await makeRequest(
        'GET',
        '/books?search_q=code&min_price=100&max_price=1000&order_by=price&order=ASC&limit=5&offset=0'
      );
      const passed = assert(
        res.statusCode === 200 &&
        Array.isArray(res.body.data) &&
        res.body.pagination !== undefined,
        15,
        'Combine search + min_price + max_price + sorting + pagination',
        res.body
      );
      if (passed) passedCount++;
    }

    // Test 16: Update an existing book
    {
      const res = await makeRequest('PUT', `/books/${createdBookId}`, {
        title: 'Designing Data-Intensive Applications (Updated Edition)',
        author: 'Martin Kleppmann',
        price: 1050.00
      });
      const passed = assert(
        res.statusCode === 200 &&
        res.body.data &&
        res.body.data.title === 'Designing Data-Intensive Applications (Updated Edition)' &&
        res.body.data.price === 1050.00,
        16,
        `Update an existing book (PUT /books/${createdBookId})`,
        res.body
      );
      if (passed) passedCount++;
    }

    // Test 17: Update a nonexistent book
    {
      const res = await makeRequest('PUT', '/books/999999', {
        title: 'Ghost Book',
        author: 'Ghost Author',
        price: 100.00
      });
      const passed = assert(
        res.statusCode === 404 && res.body.message === 'Book not found',
        17,
        'Update a nonexistent book (PUT /books/999999 -> 404)',
        res.body
      );
      if (passed) passedCount++;
    }

    // Test 18: Delete an existing book
    {
      const res = await makeRequest('DELETE', `/books/${tempBookForDeleteId}`);
      const passed = assert(
        res.statusCode === 200 && res.body.data && res.body.data.id === tempBookForDeleteId,
        18,
        `Delete an existing book (DELETE /books/${tempBookForDeleteId})`,
        res.body
      );
      if (passed) passedCount++;
    }

    // Test 19: Delete a nonexistent book
    {
      const res = await makeRequest('DELETE', '/books/999999');
      const passed = assert(
        res.statusCode === 404 && res.body.message === 'Book not found',
        19,
        'Delete a nonexistent book (DELETE /books/999999 -> 404)',
        res.body
      );
      if (passed) passedCount++;
    }

    // Test 20: Test invalid sorting and pagination parameters
    {
      // 20a: Invalid column injection attempt
      const res1 = await makeRequest('GET', '/books?order_by=malicious_col');
      // 20b: min_price > max_price
      const res2 = await makeRequest('GET', '/books?min_price=600&max_price=200');
      // 20c: invalid limit
      const res3 = await makeRequest('GET', '/books?limit=-5');

      const passed = assert(
        res1.statusCode === 400 && res2.statusCode === 400 && res3.statusCode === 400,
        20,
        'Validate invalid sorting, invalid price range (min > max), and invalid limit (HTTP 400)',
        {
          res1: res1.body.errors,
          res2: res2.body.errors,
          res3: res3.body.errors
        }
      );
      if (passed) passedCount++;
    }

    console.log('\n======================================================');
    console.log(` Verification Summary: ${passedCount} / 20 Tests Passed`);
    console.log('======================================================\n');

    server.close(() => {
      process.exit(passedCount === 20 ? 0 : 1);
    });
  } catch (error) {
    console.error('Fatal test error:', error);
    server.close(() => {
      process.exit(1);
    });
  }
}

// Give server 1 second to finish schema init and sample seeding before executing tests
setTimeout(runAllTests, 1000);

