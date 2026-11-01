// app.js
// Express Server Implementation for Lab 1
// Course: Backend Development Fundamentals
// Student: A.VARUN KRISHNA | Reg No: 252U1R9004 | Section: GENAI-1A
// Faculty: Joel Prashanth D | Aurora

const express = require('express');
const app = express();

// Middleware to parse incoming JSON request bodies
app.use(express.json());

// Port configuration: use process.env.PORT for deployment platforms or default to 3000 locally
const PORT = process.env.PORT || 3000;

/**
 * ----------------------------------------------------
 * Route 1: GET /
 * Description: Welcome page endpoint
 * HTTP Status: 200 OK
 * ----------------------------------------------------
 */
app.get('/', (req, res) => {
  res.status(200).send('Welcome to the Node.js and Express Server - Lab 1!');
});

/**
 * ----------------------------------------------------
 * Route 2: GET /about
 * Description: Returns student details in JSON format
 * HTTP Status: 200 OK
 * ----------------------------------------------------
 */
app.get('/about', (req, res) => {
  res.status(200).json({
    name: 'A.VARUN KRISHNA',
    registrationNumber: '252U1R9004',
    section: 'GENAI-1A',
    branch: 'CSE – Gen AI',
    course: 'Backend Development Fundamentals',
    institution: 'Aurora',
    faculty: 'Joel Prashanth D'
  });
});

/**
 * ----------------------------------------------------
 * Route 3: GET /time
 * Description: Returns current server date and time using new Date()
 * HTTP Status: 200 OK
 * ----------------------------------------------------
 */
app.get('/time', (req, res) => {
  const serverTime = new Date();
  res.status(200).json({
    currentTime: serverTime.toISOString(),
    formattedTime: serverTime.toString(),
    timestamp: serverTime.getTime()
  });
});

/**
 * ----------------------------------------------------
 * Route 4: Unknown Routes (404 Fallback Handler)
 * Description: Catches any undefined endpoint and returns a 404 JSON response
 * HTTP Status: 404 Not Found
 * ----------------------------------------------------
 */
app.use((req, res) => {
  res.status(404).json({
    status: 404,
    error: 'Not Found',
    message: `Cannot ${req.method} ${req.originalUrl}. The requested route does not exist.`
  });
});

// Start listening for incoming connections
app.listen(PORT, () => {
  console.log(`====================================================`);
  console.log(`Express Server is running successfully on port ${PORT}`);
  console.log(`Local URL: http://localhost:${PORT}`);
  console.log(`Endpoints available:`);
  console.log(`  - GET http://localhost:${PORT}/`);
  console.log(`  - GET http://localhost:${PORT}/about`);
  console.log(`  - GET http://localhost:${PORT}/time`);
  console.log(`  - Unknown routes -> 404 JSON response`);
  console.log(`Press Ctrl+C to stop the server.`);
  console.log(`====================================================`);
});

module.exports = app;