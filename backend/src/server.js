const app = require('./app');
const pool = require('./config/database');

const PORT = process.env.PORT || 3000;
const MAX_RETRIES = 20;
const RETRY_INTERVAL = 5000;

async function startServer() {
  console.log('Server startup environment:');
  console.log('DB_HOST:', process.env.DB_HOST);
  console.log('DB_USER:', process.env.DB_USER);
  console.log('DB_NAME:', process.env.DB_NAME);

  for (let i = 0; i < MAX_RETRIES; i++) {
    try {
      console.log(`Attempting to connect to database (${i + 1}/${MAX_RETRIES})`);

      const connection = await pool.getConnection();
      console.log('Database connection successful');
      connection.release();

      app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
      });
      return;
    } catch (error) {
      console.error(`Database connection attempt failed:`, error);

      if (i === MAX_RETRIES - 1) {
        console.error('Unable to connect to database after multiple attempts');
        process.exit(1);
      }

      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, RETRY_INTERVAL));
    }
  }
}

startServer();