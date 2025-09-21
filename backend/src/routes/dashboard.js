const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const { optionalAuth } = require('../middleware/auth');

// Dashboard routes with optional authentication (for role-specific data)

// Dashboard summary (role-specific)
router.get('/summary', optionalAuth, dashboardController.getDashboardSummary);

// Manufacturing orders with filtering
router.get('/manufacturing-orders', optionalAuth, dashboardController.getManufacturingOrders);

// Low stock products
router.get('/low-stock-products', optionalAuth, dashboardController.getLowStockProducts);

// KPIs
router.get('/kpis', optionalAuth, dashboardController.getKPIs);

module.exports = router;
