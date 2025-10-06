require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

// Import routes and middleware
const routes = require('./src/routes');
const { errorHandler, notFound } = require('./src/middleware/errorHandler');

const app = express();
const PORT = process.env.PORT || 5000;

// Security middleware
app.use(helmet());

// CORS configuration (supports multiple origins and Vercel previews)
const allowedOriginsEnv = process.env.CORS_ORIGIN || 'http://localhost:3000';
const allowedOrigins = allowedOriginsEnv.split(',').map(o => o.trim()).filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true); // allow server-to-server and curl
    const isAllowed =
      allowedOrigins.includes(origin) ||
      /\.vercel\.app$/.test(new URL(origin).hostname);
    return isAllowed ? callback(null, true) : callback(new Error('CORS not allowed'));
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  optionsSuccessStatus: 200
}));

// Explicitly respond to preflight


// Logging middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// API routes
app.use('/api', routes);

// Development mode - API info endpoint
if (process.env.NODE_ENV !== 'production') {
  // Development mode - API info endpoint
  app.get('/', (req, res) => {
    res.json({
      success: true,
      message: 'Manufacturing Management System API',
      version: '1.0.0',
      documentation: '/api/health',
      endpoints: {
        auth: '/api/auth',
        manufacturingOrders: '/api/manufacturing-orders',
        products: '/api/products',
        boms: '/api/boms',
        workOrders: '/api/work-orders',
        workCenters: '/api/work-centers',
        stockLedger: '/api/stock-ledger'
      }
    });
  });
}

// 404 handler
app.use(notFound);

// Error handling middleware
app.use(errorHandler);

// Global error handlers
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  // Keep the process running despite the error
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  // Keep the process running despite the rejection
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down gracefully...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT received. Shutting down gracefully...');
  process.exit(0);
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Manufacturing Management System API running on port ${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 Health check: http://localhost:${PORT}/api/health`);
});

module.exports = app;