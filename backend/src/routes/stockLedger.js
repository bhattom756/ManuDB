const express = require('express');
const router = express.Router();
const stockLedgerController = require('../controllers/stockLedgerController');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');
const {
  validateStockLedger,
  validateId,
  validatePagination
} = require('../middleware/validation');

// All routes require authentication
router.use(authenticateToken);

// Get all stock ledger entries
router.get('/', validatePagination, stockLedgerController.getStockLedger);

// Get all product stocks
router.get('/stocks', stockLedgerController.getAllProductStocks);

// Get stock summary
router.get('/summary', stockLedgerController.getStockSummary);

// Get transaction types
router.get('/meta/transaction-types', stockLedgerController.getTransactionTypes);

// Get stock ledger entry by ID
router.get('/:id', validateId, stockLedgerController.getStockLedgerById);

// Get product stock
router.get('/product/:id/stock', validateId, stockLedgerController.getProductStock);

// Get stock movements for a product
router.get('/product/:id/movements', validateId, stockLedgerController.getStockMovements);

// Create new stock transaction
router.post('/', 
  authorizeRoles('BUSINESS_OWNER', 'MANUFACTURING_MANAGER', 'INVENTORY_MANAGER'),
  validateStockLedger,
  stockLedgerController.createStockTransaction
);

// Adjust stock
router.post('/product/:id/adjust', 
  validateId,
  authorizeRoles('BUSINESS_OWNER', 'MANUFACTURING_MANAGER', 'INVENTORY_MANAGER'),
  stockLedgerController.adjustStock
);

// Update stock transaction
router.put('/:id', 
  validateId,
  validateStockLedger,
  stockLedgerController.updateStockTransaction
);

// Delete stock transaction
router.delete('/:id', 
  validateId,
  authorizeRoles('BUSINESS_OWNER', 'MANUFACTURING_MANAGER'),
  stockLedgerController.deleteStockTransaction
);

module.exports = router;
