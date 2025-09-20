const express = require('express');
const router = express.Router();
const workCenterController = require('../controllers/workCenterController');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');
const {
  validateWorkCenter,
  validateId,
  validatePagination
} = require('../middleware/validation');

// All routes require authentication
router.use(authenticateToken);

// Get all work centers
router.get('/', validatePagination, workCenterController.getWorkCenters);

// Get work center by ID
router.get('/:id', validateId, workCenterController.getWorkCenterById);

// Get work center utilization
router.get('/:id/utilization', validateId, workCenterController.getWorkCenterUtilization);

// Get work center statuses
router.get('/meta/statuses', workCenterController.getWorkCenterStatuses);

// Get work center statistics
router.get('/meta/stats', workCenterController.getWorkCenterStats);

// Create new work center
router.post('/', 
  authorizeRoles('BUSINESS_OWNER', 'MANUFACTURING_MANAGER'),
  validateWorkCenter,
  workCenterController.createWorkCenter
);

// Update work center
router.put('/:id', 
  validateId,
  validateWorkCenter,
  workCenterController.updateWorkCenter
);

// Update work center status
router.patch('/:id/status', 
  validateId,
  workCenterController.updateStatus
);

// Delete work center
router.delete('/:id', 
  validateId,
  authorizeRoles('BUSINESS_OWNER', 'MANUFACTURING_MANAGER'),
  workCenterController.deleteWorkCenter
);

module.exports = router;
