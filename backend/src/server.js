const { app, server } = require('./app');
const pool = require('./config/database');

async function startServer() {
  try {
    // Test database connection
    console.log('Attempting to connect to database');
    const connection = await pool.getConnection();
    console.log('Database connection successful');
    connection.release();

  } catch (error) {
    console.error('Database connection failed:', error);
    process.exit(1);
  }
}

// Start the server and database connection
startServer();

// Export for testing
module.exports = { app };