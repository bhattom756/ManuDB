const db = require('../config/database');

// Helper function to get count
async function getCount(tableName) {
  try {
    const result = await db.query(`SELECT COUNT(*) as count FROM ${tableName}`);
    return parseInt(result.rows[0].count);
  } catch (error) {
    console.error(`Error getting count for ${tableName}:`, error);
    return 0;
  }
}

// Helper function to get manufacturing orders by status
async function getManufacturingOrdersByStatus() {
  try {
    const query = `
      SELECT status, COUNT(*) as count
      FROM manufacturing_orders
      GROUP BY status
    `;
    
    const result = await db.query(query);
    
    return result.rows.reduce((acc, row) => {
      acc[row.status] = parseInt(row.count);
      return acc;
    }, {});
  } catch (error) {
    console.error('Error getting manufacturing orders by status:', error);
    return {};
  }
}

// Helper function to get recent manufacturing orders
async function getRecentManufacturingOrders() {
  try {
    const query = `
      SELECT 
        mo.id,
        mo.mo_number,
        mo.quantity,
        mo.status,
        mo.schedule_date,
        p.name as product_name,
        u.name as assignee_name
      FROM manufacturing_orders mo
      LEFT JOIN products p ON mo.finished_product_id = p.id
      LEFT JOIN users u ON mo.assignee_id = u.id
      ORDER BY mo.created_at DESC
      LIMIT 5
    `;
    
    const result = await db.query(query);
    
    return result.rows.map(row => ({
      id: row.id,
      moNumber: row.mo_number,
      quantity: row.quantity,
      status: row.status,
      priority: 'MEDIUM', // Default priority
      scheduleDate: row.schedule_date,
      productName: row.product_name,
      assigneeName: row.assignee_name
    }));
  } catch (error) {
    console.error('Error getting recent manufacturing orders:', error);
    return [];
  }
}

// Helper function to get low stock products
async function getLowStockProductsData(threshold = 10) {
  try {
    const query = `
      SELECT 
        id,
        name,
        type,
        unit_of_measure,
        unit_cost,
        current_stock
      FROM products
      WHERE current_stock <= $1
      ORDER BY current_stock ASC
      LIMIT 10
    `;

    const result = await db.query(query, [threshold]);
    
    return result.rows.map(row => ({
      id: row.id,
      name: row.name,
      type: row.type,
      unitOfMeasure: row.unit_of_measure,
      unitCost: row.unit_cost,
      currentStock: row.current_stock
    }));
  } catch (error) {
    console.error('Error getting low stock products:', error);
    return [];
  }
}

// Helper function to get KPIs
async function getKPIsData() {
  try {
    // Get orders completed
    const completedResult = await db.query(`
      SELECT COUNT(*) as count
      FROM manufacturing_orders
      WHERE status = 'CLOSED'
    `);
    const ordersCompleted = parseInt(completedResult.rows[0].count);

    // Get orders in progress
    const inProgressResult = await db.query(`
      SELECT COUNT(*) as count
      FROM manufacturing_orders
      WHERE status = 'IN_PROGRESS'
    `);
    const ordersInProgress = parseInt(inProgressResult.rows[0].count);

    // Get delayed orders
    const delayedResult = await db.query(`
      SELECT COUNT(*) as count
      FROM manufacturing_orders
      WHERE status IN ('IN_PROGRESS', 'CONFIRMED') 
      AND schedule_date < NOW()
    `);
    const ordersDelayed = parseInt(delayedResult.rows[0].count);

    // Get work orders count
    const workOrdersResult = await db.query(`
      SELECT COUNT(*) as count
      FROM work_orders
    `);
    const totalWorkOrders = parseInt(workOrdersResult.rows[0].count);

    // Get completed work orders
    const completedWorkOrdersResult = await db.query(`
      SELECT COUNT(*) as count
      FROM work_orders
      WHERE status = 'COMPLETED'
    `);
    const completedWorkOrders = parseInt(completedWorkOrdersResult.rows[0].count);

    const efficiency = totalWorkOrders > 0 ? (completedWorkOrders / totalWorkOrders) * 100 : 0;

    return {
      ordersCompleted,
      ordersInProgress,
      ordersDelayed,
      totalWorkOrders,
      completedWorkOrders,
      efficiency: Math.round(efficiency * 100) / 100
    };
  } catch (error) {
    console.error('Error getting KPIs:', error);
    return {
      ordersCompleted: 0,
      ordersInProgress: 0,
      ordersDelayed: 0,
      totalWorkOrders: 0,
      completedWorkOrders: 0,
      efficiency: 0
    };
  }
}

// Dashboard controller functions
const dashboardController = {
  // Get role-specific dashboard summary
  async getDashboardSummary(req, res, next) {
    try {
      // Use default role if no user is authenticated
      const userRole = req.user?.role || 'BUSINESS_OWNER';
      const userId = req.user?.id || null;

      // Get basic counts
      const [manufacturingOrdersCount, productsCount, workOrdersCount] = await Promise.all([
        getCount('manufacturing_orders'),
        getCount('products'),
        getCount('work_orders')
      ]);

      // Get manufacturing orders by status
      const manufacturingOrdersByStatus = await getManufacturingOrdersByStatus();

      // Get recent manufacturing orders
      const recentManufacturingOrders = await getRecentManufacturingOrders();

      // Get low stock products
      const lowStockProducts = await getLowStockProductsData();

      // Get KPIs
      const kpis = await getKPIsData();

      const dashboardData = {
        title: `${userRole.replace('_', ' ')} Dashboard`,
        description: `Welcome to your ${userRole.replace('_', ' ').toLowerCase()} dashboard`,
        userRole,
        summary: {
          totalManufacturingOrders: manufacturingOrdersCount,
          totalProducts: productsCount,
          totalWorkOrders: workOrdersCount
        },
        manufacturingOrdersByStatus,
        recentManufacturingOrders,
        lowStockProducts,
        kpis
      };

      res.json({
        success: true,
        data: dashboardData
      });
    } catch (error) {
      console.error('Dashboard summary error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to load dashboard data',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  },

  // Get manufacturing orders with filtering
  async getManufacturingOrders(req, res, next) {
    try {
      const {
        page = 1,
        limit = 10,
        search,
        status,
        assigneeId,
        sortBy = 'created_at',
        sortOrder = 'desc'
      } = req.query;

      // Convert camelCase to snake_case for database columns
      const columnMapping = {
        'createdAt': 'created_at',
        'updatedAt': 'updated_at',
        'moNumber': 'mo_number',
        'scheduleDate': 'schedule_date'
      };
      
      const dbSortBy = columnMapping[sortBy] || sortBy;

      const offset = (parseInt(page) - 1) * parseInt(limit);
      const limitNum = parseInt(limit);

      // Build WHERE clause
      let whereConditions = [];
      let queryParams = [];
      let paramCount = 0;

      if (search) {
        paramCount++;
        whereConditions.push(`(mo.mo_number ILIKE $${paramCount} OR p.name ILIKE $${paramCount})`);
        queryParams.push(`%${search}%`);
      }

      if (status) {
        paramCount++;
        whereConditions.push(`mo.status = $${paramCount}`);
        queryParams.push(status);
      }

      if (assigneeId) {
        paramCount++;
        whereConditions.push(`mo.assignee_id = $${paramCount}`);
        queryParams.push(parseInt(assigneeId));
      }

      const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

      // Get total count
      const countQuery = `
        SELECT COUNT(*) as total
        FROM manufacturing_orders mo
        LEFT JOIN products p ON mo.finished_product_id = p.id
        LEFT JOIN users u ON mo.assignee_id = u.id
        ${whereClause}
      `;
      
      const countResult = await db.query(countQuery, queryParams);
      const total = parseInt(countResult.rows[0].total);

      // Get manufacturing orders
      const ordersQuery = `
        SELECT 
          mo.id,
          mo.mo_number,
          mo.quantity,
          mo.status,
          mo.schedule_date,
          mo.created_at,
          mo.updated_at,
          p.id as product_id,
          p.name as product_name,
          p.type as product_type,
          p.unit_of_measure,
          u.id as assignee_id,
          u.name as assignee_name,
          u.role as assignee_role
        FROM manufacturing_orders mo
        LEFT JOIN products p ON mo.finished_product_id = p.id
        LEFT JOIN users u ON mo.assignee_id = u.id
        ${whereClause}
        ORDER BY mo.${dbSortBy} ${sortOrder.toUpperCase()}
        LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}
      `;

      queryParams.push(limitNum, offset);
      const ordersResult = await db.query(ordersQuery, queryParams);

      // Format the results
      const manufacturingOrders = ordersResult.rows.map(row => ({
        id: row.id,
        moNumber: row.mo_number,
        quantity: row.quantity,
        status: row.status,
        priority: 'MEDIUM', // Default priority since not in schema
        scheduleDate: row.schedule_date,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
        finishedProduct: row.product_id ? {
          id: row.product_id,
          name: row.product_name,
          type: row.product_type,
          unitOfMeasure: row.unit_of_measure
        } : null,
        assignee: row.assignee_id ? {
          id: row.assignee_id,
          name: row.assignee_name,
          role: row.assignee_role
        } : null
      }));

      res.json({
        success: true,
        data: {
          manufacturingOrders,
          pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total,
            pages: Math.ceil(total / parseInt(limit))
          }
        }
      });
    } catch (error) {
      console.error('Manufacturing orders error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to load manufacturing orders',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  },

  // Get low stock products
  async getLowStockProducts(req, res, next) {
    try {
      const { threshold = 10 } = req.query;

      const lowStockProducts = await getLowStockProductsData(parseInt(threshold));

      res.json({
        success: true,
        data: lowStockProducts
      });
    } catch (error) {
      console.error('Low stock products error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to load low stock products',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  },

  // Get KPIs
  async getKPIs(req, res, next) {
    try {
      const kpis = await getKPIsData();

      res.json({
        success: true,
        data: kpis
      });
    } catch (error) {
      console.error('KPIs error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to load KPIs',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
};

module.exports = dashboardController;