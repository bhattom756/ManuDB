const express = require('express');
const router = express.Router();

// Import route modules
const authRoutes = require('./auth');
const userRoutes = require('./users');
const dashboardRoutes = require('./dashboard');
const manufacturingOrderRoutes = require('./manufacturingOrders');
const productRoutes = require('./products');
const bomRoutes = require('./boms');
const workOrderRoutes = require('./workOrders');
const workCenterRoutes = require('./workCenters');
const stockLedgerRoutes = require('./stockLedger');

// Health check endpoint
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Manufacturing Management System API is running',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// API routes
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/manufacturing-orders', manufacturingOrderRoutes);
router.use('/products', productRoutes);
router.use('/boms', bomRoutes);
router.use('/work-orders', workOrderRoutes);
router.use('/work-centers', workCenterRoutes);
router.use('/stock-ledger', stockLedgerRoutes);

module.exports = router;
