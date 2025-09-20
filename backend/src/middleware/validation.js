const { body, param, query, validationResult } = require('express-validator');

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }
  next();
};

// User validation rules
const validateUserRegistration = [
  body('name')
    .notEmpty()
    .withMessage('Name is required')
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters'),
  body('email')
    .isEmail()
    .withMessage('Valid email is required')
    .normalizeEmail(),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
  body('mobileNo')
    .optional()
    .isMobilePhone()
    .withMessage('Valid mobile number is required'),
  body('role')
    .optional()
    .isIn(['MANUFACTURING_MANAGER', 'OPERATOR', 'INVENTORY_MANAGER', 'BUSINESS_OWNER'])
    .withMessage('Invalid role'),
  handleValidationErrors
];

const validateUserLogin = [
  body('email')
    .isEmail()
    .withMessage('Valid email is required')
    .normalizeEmail(),
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
  handleValidationErrors
];

const validateUserUpdate = [
  body('name')
    .optional()
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters'),
  body('email')
    .optional()
    .isEmail()
    .withMessage('Valid email is required')
    .normalizeEmail(),
  body('mobileNo')
    .optional()
    .isMobilePhone()
    .withMessage('Valid mobile number is required'),
  body('role')
    .optional()
    .isIn(['MANUFACTURING_MANAGER', 'OPERATOR', 'INVENTORY_MANAGER', 'BUSINESS_OWNER'])
    .withMessage('Invalid role'),
  handleValidationErrors
];

// Product validation rules
const validateProduct = [
  body('name')
    .notEmpty()
    .withMessage('Product name is required')
    .isLength({ min: 2, max: 100 })
    .withMessage('Product name must be between 2 and 100 characters'),
  body('type')
    .isIn(['FINISHED_GOOD', 'RAW_MATERIAL', 'SEMI_FINISHED'])
    .withMessage('Invalid product type'),
  body('unitOfMeasure')
    .notEmpty()
    .withMessage('Unit of measure is required'),
  body('unitCost')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Unit cost must be a positive number'),
  handleValidationErrors
];

// BOM validation rules
const validateBOM = [
  body('productId')
    .isInt({ min: 1 })
    .withMessage('Valid product ID is required'),
  body('reference')
    .optional()
    .isLength({ max: 100 })
    .withMessage('Reference must be less than 100 characters'),
  body('version')
    .optional()
    .isLength({ max: 20 })
    .withMessage('Version must be less than 20 characters'),
  handleValidationErrors
];

const validateBOMComponent = [
  body('productId')
    .isInt({ min: 1 })
    .withMessage('Valid product ID is required'),
  body('quantity')
    .isInt({ min: 1 })
    .withMessage('Quantity must be a positive integer'),
  body('unit')
    .notEmpty()
    .withMessage('Unit is required'),
  body('cost')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Cost must be a positive number'),
  handleValidationErrors
];

// Manufacturing Order validation rules
const validateManufacturingOrder = [
  body('finishedProductId')
    .isInt({ min: 1 })
    .withMessage('Valid finished product ID is required'),
  body('quantity')
    .isInt({ min: 1 })
    .withMessage('Quantity must be a positive integer'),
  body('scheduleDate')
    .isISO8601()
    .withMessage('Valid schedule date is required'),
  body('startDate')
    .optional()
    .isISO8601()
    .withMessage('Valid start date is required'),
  body('endDate')
    .optional()
    .isISO8601()
    .withMessage('Valid end date is required'),
  body('billOfMaterialId')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Valid BOM ID is required'),
  body('assigneeId')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Valid assignee ID is required'),
  handleValidationErrors
];

// Work Order validation rules
const validateWorkOrder = [
  body('moId')
    .isInt({ min: 1 })
    .withMessage('Valid manufacturing order ID is required'),
  body('workCenterId')
    .isInt({ min: 1 })
    .withMessage('Valid work center ID is required'),
  body('operationName')
    .notEmpty()
    .withMessage('Operation name is required')
    .isLength({ min: 2, max: 100 })
    .withMessage('Operation name must be between 2 and 100 characters'),
  body('expectedDuration')
    .isInt({ min: 1 })
    .withMessage('Expected duration must be a positive integer'),
  body('assignedToId')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Valid assigned user ID is required'),
  handleValidationErrors
];

// Work Center validation rules
const validateWorkCenter = [
  body('name')
    .notEmpty()
    .withMessage('Work center name is required')
    .isLength({ min: 2, max: 100 })
    .withMessage('Work center name must be between 2 and 100 characters'),
  body('capacity')
    .optional()
    .isInt({ min: 1, max: 24 })
    .withMessage('Capacity must be between 1 and 24 hours'),
  body('costPerHour')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Cost per hour must be a positive number'),
  body('status')
    .optional()
    .isIn(['ACTIVE', 'UNDER_MAINTENANCE', 'INACTIVE'])
    .withMessage('Invalid work center status'),
  handleValidationErrors
];

// Stock Ledger validation rules
const validateStockLedger = [
  body('productId')
    .isInt({ min: 1 })
    .withMessage('Valid product ID is required'),
  body('transactionType')
    .isIn(['IN', 'OUT', 'ADJUSTMENT'])
    .withMessage('Invalid transaction type'),
  body('quantity')
    .isInt()
    .withMessage('Quantity must be an integer'),
  body('unitCost')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Unit cost must be a positive number'),
  body('reference')
    .optional()
    .isLength({ max: 100 })
    .withMessage('Reference must be less than 100 characters'),
  body('referenceId')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Reference ID must be a positive integer'),
  handleValidationErrors
];

// ID parameter validation
const validateId = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('Valid ID is required'),
  handleValidationErrors
];

// Pagination validation
const validatePagination = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  query('search')
    .optional()
    .isLength({ max: 100 })
    .withMessage('Search term must be less than 100 characters'),
  handleValidationErrors
];

module.exports = {
  handleValidationErrors,
  validateUserRegistration,
  validateUserLogin,
  validateUserUpdate,
  validateProduct,
  validateBOM,
  validateBOMComponent,
  validateManufacturingOrder,
  validateWorkOrder,
  validateWorkCenter,
  validateStockLedger,
  validateId,
  validatePagination
};
