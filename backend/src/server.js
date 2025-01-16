const app = require('./app');
const pool = require('./config/database');

const PORT = process.env.PORT || 3000;

// Startup function to ensure database connection before starting server
async function startServer() {
  try {
    // Verify database connection is working
    const connection = await pool.getConnection();
    console.log('Database connection successful');
    connection.release();

    // Start the Express server
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Unable to start server:', error);
    process.exit(1);  // Exit if we can't connect to the database
  }
}

startServer();