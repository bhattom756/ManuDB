const express = require('express');
const router = express.Router();
const bomController = require('../controllers/bomController');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');
const {
  validateBOM,
  validateBOMComponent,
  validateId,
  validatePagination
} = require('../middleware/validation');

// All routes require authentication
router.use(authenticateToken);

// Get all BOMs
router.get('/', validatePagination, bomController.getBOMs);

// Get BOM by ID
router.get('/:id', validateId, bomController.getBOMById);

// Get BOM by product ID
router.get('/product/:productId', validateId, bomController.getBOMByProductId);

// Calculate BOM cost
router.get('/:id/cost', validateId, bomController.calculateBOMCost);

// Create new BOM
router.post('/', 
  authorizeRoles('BUSINESS_OWNER', 'MANUFACTURING_MANAGER', 'INVENTORY_MANAGER'),
  validateBOM,
  bomController.createBOM
);

// Update BOM
router.put('/:id', 
  validateId,
  validateBOM,
  bomController.updateBOM
);

// Delete BOM
router.delete('/:id', 
  validateId,
  authorizeRoles('BUSINESS_OWNER', 'MANUFACTURING_MANAGER'),
  bomController.deleteBOM
);

// BOM Component routes
router.post('/:bomId/components', 
  validateId,
  validateBOMComponent,
  bomController.addBOMComponent
);

router.put('/components/:componentId', 
  validateId,
  validateBOMComponent,
  bomController.updateBOMComponent
);

router.delete('/components/:componentId', 
  validateId,
  authorizeRoles('BUSINESS_OWNER', 'MANUFACTURING_MANAGER'),
  bomController.deleteBOMComponent
);

module.exports = router;
