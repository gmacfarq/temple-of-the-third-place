const pool = require('./config/database');

async function testConnection() {
  try {
    console.log('Environment variables:');
    console.log('DB_HOST:', process.env.DB_HOST);
    console.log('DB_USER:', process.env.DB_USER);
    console.log('DB_NAME:', process.env.DB_NAME);
    console.log('DB_PORT:', process.env.DB_PORT);

    const connection = await pool.getConnection();
    console.log('Successfully connected to database');

    // Test query
    const [rows] = await connection.query('SELECT 1 as test');
    console.log('Test query result:', rows);

    connection.release();
  } catch (error) {
    console.error('Database connection error:', error);
  }
}

testConnection();