const mysql = require('mysql2/promise');
const config = require('../src/config/test.config');
const jwt = require('jsonwebtoken');

const testHelper = {
  // Database connection for tests
  getTestConnection: async () => {
    return await mysql.createConnection(config.database);
  },

  // Clean up database between tests
  clearDatabase: async (connection) => {
    await connection.query('DELETE FROM inventory_audits');
    await connection.query('DELETE FROM inventory_transfers');
    await connection.query('DELETE FROM donations');
    await connection.query('DELETE FROM sacraments');
    await connection.query('DELETE FROM users');
  },

  // Generate test JWT tokens
  generateTestToken: (role = 'member') => {
    return jwt.sign(
      { userId: 1, email: 'test@example.com', role },
      config.jwt.secret,
      { expiresIn: config.jwt.expiresIn }
    );
  },

  // Create test user
  createTestUser: async (connection, role = 'member') => {
    const [result] = await connection.query(
      'INSERT INTO users (email, password_hash, first_name, last_name, role) VALUES (?, ?, ?, ?, ?)',
      ['test@example.com', 'hashedpassword', 'Test', 'User', role]
    );
    return result.insertId;
  }
};

module.exports = testHelper;