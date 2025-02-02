module.exports = {
  database: {
    host: process.env.TEST_DB_HOST || 'localhost',
    user: process.env.TEST_DB_USER || 'test_user',
    password: process.env.TEST_DB_PASSWORD || 'test_password',
    database: process.env.TEST_DB_NAME || 'tottp_test_db',
    port: process.env.TEST_DB_PORT || 3306
  },
  jwt: {
    secret: 'test-secret-key',
    expiresIn: '1h'
  }
};