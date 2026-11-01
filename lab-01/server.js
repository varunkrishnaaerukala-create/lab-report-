// server.js
// Plain Node.js HTTP Server Demonstration
// Course: Backend Development Fundamentals
// Student: A.VARUN KRISHNA | Reg No: 252U1R9004 | Section: GENAI-1A
// Faculty: Joel Prashanth D | Aurora

// Import the built-in HTTP module provided by Node.js
const http = require('http');

// Define port number: 3000 as required by the lab instructions
const PORT = 3000;

// Create the HTTP server using http.createServer()
// The callback function is invoked every time an incoming HTTP request is received
const server = http.createServer((req, res) => {
  // Set the response HTTP status code to 200 (OK)
  // Set Content-Type header to text/plain
  res.writeHead(200, { 'Content-Type': 'text/plain' });

  // Send the plain text response "Hello"
  res.end('Hello');
});

// Start the server and listen for incoming connections on port 3000
server.listen(PORT, () => {
  console.log(`====================================================`);
  console.log(`Plain Node.js HTTP Server is running!`);
  console.log(`URL: http://localhost:${PORT}`);
  console.log(`Response: "Hello"`);
  console.log(`Press Ctrl+C to stop the server.`);
  console.log(`====================================================`);
});