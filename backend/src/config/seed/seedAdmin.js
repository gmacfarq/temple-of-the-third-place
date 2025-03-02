const bcrypt = require('bcryptjs');
const pool = require('../database');

async function seedAdmin() {
  try {
    const connection = await pool.getConnection();
    const hashedPassword = await bcrypt.hash(process.env.ADMIN_PASSWORD || 'admin123', 10);

    await connection.query(`
      INSERT INTO users (email, password_hash, first_name, last_name, role)
      VALUES (?, ?, 'Admin', 'User', 'admin')
      ON DUPLICATE KEY UPDATE email = email
    `, [process.env.ADMIN_EMAIL || 'admin@example.com', hashedPassword]);

    connection.release();
    console.log('Admin user seeded successfully');
  } catch (error) {
    console.error('Error seeding admin:', error);
  }
}

module.exports = seedAdmin;