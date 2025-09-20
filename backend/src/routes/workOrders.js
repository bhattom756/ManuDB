const express = require('express');
const router = express.Router();
const workOrderController = require('../controllers/workOrderController');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');
const {
  validateWorkOrder,
  validateId,
  validatePagination
} = require('../middleware/validation');

// All routes require authentication
router.use(authenticateToken);

// Get all work orders
router.get('/', validatePagination, workOrderController.getWorkOrders);

// Get work order by ID
router.get('/:id', validateId, workOrderController.getWorkOrderById);

// Get work order details with comments and issues
router.get('/:id/details', validateId, workOrderController.getWorkOrderDetails);

// Create new work order
router.post('/', 
  authorizeRoles('BUSINESS_OWNER', 'MANUFACTURING_MANAGER'),
  validateWorkOrder,
  workOrderController.createWorkOrder
);

// Update work order
router.put('/:id', 
  validateId,
  validateWorkOrder,
  workOrderController.updateWorkOrder
);

// Update work order status
router.patch('/:id/status', 
  validateId,
  workOrderController.updateStatus
);

// Enhanced status updates
router.patch('/:id/start', validateId, workOrderController.startWorkOrder);
router.patch('/:id/pause', validateId, workOrderController.pauseWorkOrder);
router.patch('/:id/complete', validateId, workOrderController.completeWorkOrder);

// Comments
router.post('/:id/comments', validateId, workOrderController.addComment);
router.get('/:id/comments', validateId, workOrderController.getComments);

// Issues
router.post('/:id/issues', validateId, workOrderController.createIssue);
router.get('/:id/issues', validateId, workOrderController.getIssues);
router.patch('/:id/issues/:issueId/status', validateId, workOrderController.updateIssueStatus);
router.patch('/:id/issues/:issueId/resolve', validateId, workOrderController.resolveIssue);

// Delete work order (only PLANNED status)
router.delete('/:id', 
  validateId,
  authorizeRoles('BUSINESS_OWNER', 'MANUFACTURING_MANAGER'),
  workOrderController.deleteWorkOrder
);

module.exports = router;
