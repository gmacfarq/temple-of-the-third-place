const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
require('dotenv').config();

const app = express();

// Security and utility middleware
app.use(helmet());           // Adds various HTTP headers for security
app.use(cors());            // Handles Cross-Origin Resource Sharing
app.use(express.json());    // Parses incoming JSON payloads
app.use(morgan('dev'));     // HTTP request logger

// Simple health check endpoint for monitoring
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'healthy' });
});

// Global error handling middleware
// Catches any errors that weren't handled in the routes
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    status: 'error',
    message: 'Something broke!'
  });
});

module.exports = app;