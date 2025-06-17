require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const { initializeDatabase, getHealthStatus } = require('./database/contactsDB');

// Import routes
const contactsRouter = require('./routes/contacts');
const relationshipsRouter = require('./routes/relationships');

const app = express();
const port = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: [
    process.env.FRONTEND_URL || 'http://localhost:3000',
    'http://localhost:3002', // Allow port 3002 as well
    'http://localhost:3000'  // Fallback
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type']
}));
app.use(express.json());
app.use(morgan('dev')); // Request logging

// Routes
app.use('/api/contacts', contactsRouter);
app.use('/api/relationships', relationshipsRouter);

// Health check endpoint
app.get('/api/health', async (req, res) => {
  try {
    const dbStatus = await getHealthStatus();
    res.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      database: dbStatus
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Health check failed',
      error: error.message
    });
  }
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'Relationships Manager API',
    version: '1.0.0',
    endpoints: {
      health: '/api/health',
      contacts: '/api/contacts',
      relationships: '/api/relationships'
    }
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Endpoint not found',
    message: `The endpoint ${req.originalUrl} does not exist`
  });
});

// Error handler
app.use((error, req, res, next) => {
  console.error('Unhandled error:', error);
  res.status(500).json({
    error: 'Internal server error',
    message: error.message
  });
});

// Initialize database and start server
async function startServer() {
  try {
    await initializeDatabase();
    
    app.listen(port, () => {
      console.log(`Server running on port ${port}`);
      console.log(`Frontend URLs: ${process.env.FRONTEND_URL || 'http://localhost:3000'}, http://localhost:3002`);
      console.log('Available endpoints:');
      console.log('  GET  /api/health');
      console.log('  GET  /api/contacts');
      console.log('  POST /api/contacts');
      console.log('  GET  /api/relationships');
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (error) => {
  console.error('Unhandled Rejection:', error);
  process.exit(1);
});

startServer(); 