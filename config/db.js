require('dotenv').config();
const mysql = require('mysql2');

// Configure the connection pool for persistence and efficient handling
const pool = mysql.createPool({
  host: process.env.MYSQL_HOST,
  port: process.env.MYSQL_PORT,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE,
  waitForConnections: true,
  connectionLimit: 20, // Increased connection limit for handling more requests
  queueLimit: 0,       // No limit for queued connections
  connectTimeout: 10000, // Timeout if unable to connect within 10 seconds
  multipleStatements: true // Enable multiple statements in one query for efficiency
});

// Use promise-based connections for async/await support
const connection = pool.promise();

// Ping the database periodically to maintain connection
setInterval(async () => {
  try {
    const [rows] = await connection.query('SELECT 1'); // Simple query to keep the connection active
    // console.log('MySQL connection is alive');
  } catch (err) {
    // console.error('Error in MySQL connection:', err.message);
  }
}, 300000); // Ping every 5 minutes (300,000 ms)

// Test the connection initially (optional for setup verification)
connection.getConnection()
  .then(conn => {
    console.log('Connected to MySQL database');
    conn.release(); // Release the connection after testing
  })
  .catch(err => {
    console.error('Error connecting to database:', err.message);
  });

module.exports = connection;
