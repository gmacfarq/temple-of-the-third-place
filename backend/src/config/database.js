const mysql = require('mysql2/promise');

const createPool = () => {
  // Use test config when in test environment
  if (process.env.NODE_ENV === 'test') {
    return mysql.createPool({
      host: process.env.TEST_DB_HOST || 'localhost',
      user: process.env.TEST_DB_USER || 'root',
      password: process.env.TEST_DB_PASSWORD || '5h4V0hioPC+5An+6E9Ynvw',
      database: process.env.TEST_DB_NAME || 'tottp_test_db',
      port: process.env.TEST_DB_PORT || 3306,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0
    });
  }

  // Default production/development pool
  return mysql.createPool({
    host: process.env.DB_HOST || 'db',
    user: process.env.DB_USER || 'tottp_user',
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME || 'tottp_db',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
  });
};

const pool = createPool();

// Add error handling
pool.on('error', (err) => {
  console.error('Unexpected error on idle connection', err);
});

module.exports = pool;