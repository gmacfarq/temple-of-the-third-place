const app = require('./app');
const seedDatabase = require('./config/seed');
const addAgreementColumns = require('./config/migrations/addAgreementColumns');

const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    // Run migrations
    await addAgreementColumns();

    // Seed database if needed
    const isDev = process.env.NODE_ENV !== 'production';
    await seedDatabase(isDev);

    // Start server with error handling
    const server = app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });

    server.on('error', (error) => {
      if (error.code === 'EADDRINUSE') {
        console.error(`Port ${PORT} is already in use. Trying port ${PORT + 1}`);
        server.close();
        app.listen(PORT + 1, () => {
          console.log(`Server running on port ${PORT + 1}`);
        });
      } else {
        console.error('Server error:', error);
        process.exit(1);
      }
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();

// Export for testing
module.exports = { app };