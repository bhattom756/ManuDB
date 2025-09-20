// Role-based permissions middleware
const checkPermission = (requiredRoles) => {
  return (req, res, next) => {
    try {
      const userRole = req.user.role;
      
      if (!requiredRoles.includes(userRole)) {
        return res.status(403).json({
          success: false,
          message: 'Insufficient permissions. Required roles: ' + requiredRoles.join(', '),
          userRole: userRole
        });
      }
      
      next();
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Permission check failed',
        error: error.message
      });
    }
  };
};

// Permission definitions based on target user roles
const PERMISSIONS = {
  // User Management
  USER_READ: ['BUSINESS_OWNER', 'MANUFACTURING_MANAGER'],
  USER_WRITE: ['BUSINESS_OWNER', 'MANUFACTURING_MANAGER'],
  USER_DELETE: ['BUSINESS_OWNER'],
  
  // Manufacturing Orders - Manufacturing Managers oversee production orders
  MO_READ: ['BUSINESS_OWNER', 'MANUFACTURING_MANAGER', 'OPERATOR'],
  MO_WRITE: ['BUSINESS_OWNER', 'MANUFACTURING_MANAGER'],
  MO_DELETE: ['BUSINESS_OWNER', 'MANUFACTURING_MANAGER'],
  
  // Work Orders - Operators execute work orders
  WO_READ: ['BUSINESS_OWNER', 'MANUFACTURING_MANAGER', 'OPERATOR'],
  WO_WRITE: ['BUSINESS_OWNER', 'MANUFACTURING_MANAGER', 'OPERATOR'],
  WO_DELETE: ['BUSINESS_OWNER', 'MANUFACTURING_MANAGER'],
  
  // Work Centers
  WC_READ: ['BUSINESS_OWNER', 'MANUFACTURING_MANAGER', 'OPERATOR'],
  WC_WRITE: ['BUSINESS_OWNER', 'MANUFACTURING_MANAGER'],
  WC_DELETE: ['BUSINESS_OWNER'],
  
  // Products - Inventory Managers track stock
  PRODUCT_READ: ['BUSINESS_OWNER', 'MANUFACTURING_MANAGER', 'OPERATOR', 'INVENTORY_MANAGER'],
  PRODUCT_WRITE: ['BUSINESS_OWNER', 'MANUFACTURING_MANAGER', 'INVENTORY_MANAGER'],
  PRODUCT_DELETE: ['BUSINESS_OWNER', 'MANUFACTURING_MANAGER'],
  
  // BOMs
  BOM_READ: ['BUSINESS_OWNER', 'MANUFACTURING_MANAGER', 'OPERATOR', 'INVENTORY_MANAGER'],
  BOM_WRITE: ['BUSINESS_OWNER', 'MANUFACTURING_MANAGER', 'INVENTORY_MANAGER'],
  BOM_DELETE: ['BUSINESS_OWNER', 'MANUFACTURING_MANAGER'],
  
  // Stock Ledger - Inventory Managers track stock movement
  STOCK_READ: ['BUSINESS_OWNER', 'MANUFACTURING_MANAGER', 'OPERATOR', 'INVENTORY_MANAGER'],
  STOCK_WRITE: ['BUSINESS_OWNER', 'MANUFACTURING_MANAGER', 'INVENTORY_MANAGER'],
  STOCK_DELETE: ['BUSINESS_OWNER', 'MANUFACTURING_MANAGER'],
  
  // Dashboard - All roles can access dashboard
  DASHBOARD_READ: ['BUSINESS_OWNER', 'MANUFACTURING_MANAGER', 'OPERATOR', 'INVENTORY_MANAGER'],
  
  // Reports - Business Owners and Manufacturing Managers
  REPORTS_READ: ['BUSINESS_OWNER', 'MANUFACTURING_MANAGER']
};

// Middleware functions for each permission
const requireUserRead = checkPermission(PERMISSIONS.USER_READ);
const requireUserWrite = checkPermission(PERMISSIONS.USER_WRITE);
const requireUserDelete = checkPermission(PERMISSIONS.USER_DELETE);

const requireMORead = checkPermission(PERMISSIONS.MO_READ);
const requireMOWrite = checkPermission(PERMISSIONS.MO_WRITE);
const requireMODelete = checkPermission(PERMISSIONS.MO_DELETE);

const requireWORead = checkPermission(PERMISSIONS.WO_READ);
const requireWOWrite = checkPermission(PERMISSIONS.WO_WRITE);
const requireWODelete = checkPermission(PERMISSIONS.WO_DELETE);

const requireWCRead = checkPermission(PERMISSIONS.WC_READ);
const requireWCWrite = checkPermission(PERMISSIONS.WC_WRITE);
const requireWCDelete = checkPermission(PERMISSIONS.WC_DELETE);

const requireProductRead = checkPermission(PERMISSIONS.PRODUCT_READ);
const requireProductWrite = checkPermission(PERMISSIONS.PRODUCT_WRITE);
const requireProductDelete = checkPermission(PERMISSIONS.PRODUCT_DELETE);

const requireBOMRead = checkPermission(PERMISSIONS.BOM_READ);
const requireBOMWrite = checkPermission(PERMISSIONS.BOM_WRITE);
const requireBOMDelete = checkPermission(PERMISSIONS.BOM_DELETE);

const requireStockRead = checkPermission(PERMISSIONS.STOCK_READ);
const requireStockWrite = checkPermission(PERMISSIONS.STOCK_WRITE);
const requireStockDelete = checkPermission(PERMISSIONS.STOCK_DELETE);

const requireDashboardRead = checkPermission(PERMISSIONS.DASHBOARD_READ);
const requireReportsRead = checkPermission(PERMISSIONS.REPORTS_READ);

module.exports = {
  PERMISSIONS,
  checkPermission,
  
  // User permissions
  requireUserRead,
  requireUserWrite,
  requireUserDelete,
  
  // Manufacturing Order permissions
  requireMORead,
  requireMOWrite,
  requireMODelete,
  
  // Work Order permissions
  requireWORead,
  requireWOWrite,
  requireWODelete,
  
  // Work Center permissions
  requireWCRead,
  requireWCWrite,
  requireWCDelete,
  
  // Product permissions
  requireProductRead,
  requireProductWrite,
  requireProductDelete,
  
  // BOM permissions
  requireBOMRead,
  requireBOMWrite,
  requireBOMDelete,
  
  // Stock permissions
  requireStockRead,
  requireStockWrite,
  requireStockDelete,
  
  // Dashboard permissions
  requireDashboardRead,
  
  // Reports permissions
  requireReportsRead
};
