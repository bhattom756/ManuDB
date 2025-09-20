const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const { authenticateToken } = require('../middleware/auth');

// All dashboard routes require authentication
router.use(authenticateToken);

// Dashboard summary (role-specific)
router.get('/summary', dashboardController.getDashboardSummary);

// Manufacturing orders with filtering
router.get('/manufacturing-orders', dashboardController.getManufacturingOrders);

// Low stock products
router.get('/low-stock-products', dashboardController.getLowStockProducts);

// KPIs
router.get('/kpis', dashboardController.getKPIs);

module.exports = router;
