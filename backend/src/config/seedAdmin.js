const bcrypt = require('bcryptjs');
const pool = require('./database');

const seedAdmin = async () => {
  if (!process.env.ADMIN_EMAIL || !process.env.ADMIN_PASSWORD) {
    console.error('Admin credentials not found in environment variables');
    return;
  }

  try {
    console.log('Starting admin user seed...');
    const connection = await pool.getConnection();

    // Check if admin already exists
    const [existingAdmin] = await connection.query(
      'SELECT id FROM users WHERE email = ?',
      [process.env.ADMIN_EMAIL]
    );

    if (existingAdmin.length > 0) {
      console.log('Admin user already exists');
      connection.release();
      return;
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(process.env.ADMIN_PASSWORD, 10);

    // Insert admin user
    await connection.query(
      'INSERT INTO users (email, password_hash, first_name, last_name, role) VALUES (?, ?, ?, ?, ?)',
      [process.env.ADMIN_EMAIL, hashedPassword, 'Temple', 'Admin', 'admin']
    );

    console.log('Admin user created successfully');
    connection.release();
  } catch (error) {
    console.error('Error seeding admin user:', error);
    throw error;
  }
};

module.exports = seedAdmin;