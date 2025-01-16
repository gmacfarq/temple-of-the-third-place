const mysql = require('mysql2/promise');
require('dotenv').config();

// Create a connection pool instead of single connections
// This helps manage database connections efficiently
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,  // Queue queries when no connection is available
  connectionLimit: 10,       // Maximum number of connections to create at once
  queueLimit: 0             // Unlimited queueing
});

module.exports = pool;