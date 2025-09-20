const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');
const {
  validateProduct,
  validateId,
  validatePagination
} = require('../middleware/validation');

// All routes require authentication
router.use(authenticateToken);

// Get all products
router.get('/', validatePagination, productController.getProducts);

// Get product by ID
router.get('/:id', validateId, productController.getProductById);

// Get product stock
router.get('/:id/stock', validateId, productController.getProductStock);

// Get product types
router.get('/meta/types', productController.getProductTypes);

// Get units of measure
router.get('/meta/units', productController.getUnitsOfMeasure);

// Create new product
router.post('/', 
  authorizeRoles('BUSINESS_OWNER', 'MANUFACTURING_MANAGER', 'INVENTORY_MANAGER'),
  validateProduct,
  productController.createProduct
);

// Update product
router.put('/:id', 
  validateId,
  validateProduct,
  productController.updateProduct
);

// Delete product
router.delete('/:id', 
  validateId,
  authorizeRoles('BUSINESS_OWNER', 'MANUFACTURING_MANAGER'),
  productController.deleteProduct
);

module.exports = router;
