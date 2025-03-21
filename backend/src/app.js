const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
require('dotenv').config();

// Import routes
const authRoutes = require('./routes/authRoutes');
const sacramentRoutes = require('./routes/sacramentRoutes');
const memberRoutes = require('./routes/memberRoutes');
const donationRoutes = require('./routes/donationRoutes');
const inventoryRoutes = require('./routes/inventoryRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

// Security and utility middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Routes
console.log('Setting up routes');
app.use('/api/auth', authRoutes);
app.use('/api/sacraments', sacramentRoutes);
app.use('/api/members', memberRoutes);
app.use('/api/donations', donationRoutes);
app.use('/api/inventory', inventoryRoutes);

// Simple health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'healthy' });
});

// Improved error handling
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
});

process.on('unhandledRejection', (error) => {
  console.error('Unhandled Rejection:', error);
});

// Global error handling middleware
app.use((err, req, res, next) => {
  console.error('Error details:', {
    message: err.message,
    stack: err.stack,
    error: err
  });

  res.status(500).json({
    status: 'error',
    message: err.message || 'Something broke!'
  });
});

const seedDatabase = require('./config/seed');

// After all middleware and routes are set up
(async () => {
  try {
    const isDev = process.env.NODE_ENV === 'development';
    await seedDatabase(isDev);
    console.log('Database initialization complete');
  } catch (error) {
    console.error('Database initialization failed:', error);
    process.exit(1);
  }
})();

// Only start the server if we're not in test mode
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

const errorHandler = require('./middleware/errorHandler');

// Error handling middleware (must be after routes)
app.use(errorHandler);

module.exports = app;