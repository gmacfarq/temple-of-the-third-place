const { app, server } = require('./app');
const pool = require('./config/database');
const bcrypt = require('bcryptjs');

async function startServer() {
  try {
    // Test database connection
    console.log('Attempting to connect to database');
    const connection = await pool.getConnection();
    console.log('Database connection successful');
    connection.release();

    // Seed admin user
    console.log('Starting admin user seed...');
    const [existingAdmin] = await pool.query(
      'SELECT * FROM users WHERE email = ? AND role = ?',
      [process.env.ADMIN_EMAIL || 'admin@thirdplace.temple', 'admin']
    );

    if (existingAdmin.length === 0) {
      // Hash the password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(process.env.ADMIN_PASSWORD || 'adminpassword', salt);

      // Create admin user if doesn't exist
      await pool.query(
        'INSERT INTO users (email, password_hash, first_name, last_name, role) VALUES (?, ?, ?, ?, ?)',
        [
          process.env.ADMIN_EMAIL || 'admin@thirdplace.temple',
          hashedPassword,
          'Admin',
          'User',
          'admin'
        ]
      );
      console.log('Admin user created');
    } else {
      console.log('Admin user already exists');
    }

  } catch (error) {
    console.error('Database connection attempt failed:', error);
    process.exit(1);
  }
}

// Start the server and database connection
startServer();

// Export for testing
module.exports = { app };