module.exports = {
  database: {
    host: process.env.TEST_DB_HOST || 'localhost',
    user: process.env.TEST_DB_USER || 'root',
    password: process.env.TEST_DB_PASSWORD || '5h4V0hioPC+5An+6E9Ynvw',
    database: process.env.TEST_DB_NAME || 'tottp_test_db',
    port: process.env.TEST_DB_PORT || 3306
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'test-secret-key-123',
    expiresIn: process.env.JWT_EXPIRES_IN || '1h'
  }
};