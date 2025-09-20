const express = require('express');
const router = express.Router();
const manufacturingOrderController = require('../controllers/manufacturingOrderController');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');
const {
  validateManufacturingOrder,
  validateId,
  validatePagination
} = require('../middleware/validation');

// All routes require authentication
router.use(authenticateToken);

// Get dashboard summary
router.get('/dashboard/summary', manufacturingOrderController.getDashboardSummary);

// Get all manufacturing orders
router.get('/', validatePagination, manufacturingOrderController.getManufacturingOrders);

// Get manufacturing order by ID
router.get('/:id', validateId, manufacturingOrderController.getManufacturingOrderById);

// Create new manufacturing order
router.post('/', 
  authorizeRoles('BUSINESS_OWNER', 'MANUFACTURING_MANAGER', 'OPERATOR'),
  validateManufacturingOrder,
  manufacturingOrderController.createManufacturingOrder
);

// Update manufacturing order
router.put('/:id', 
  validateId,
  validateManufacturingOrder,
  manufacturingOrderController.updateManufacturingOrder
);

// Update manufacturing order status
router.patch('/:id/status', 
  validateId,
  manufacturingOrderController.updateStatus
);

// Delete manufacturing order (only DRAFT status)
router.delete('/:id', 
  validateId,
  authorizeRoles('BUSINESS_OWNER', 'MANUFACTURING_MANAGER'),
  manufacturingOrderController.deleteManufacturingOrder
);

module.exports = router;
