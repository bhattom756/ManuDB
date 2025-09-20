const db = require('../config/database');

class ProductService {
  async createProduct(data) {
    const { name, type, unitOfMeasure, unitCost } = data;

    // Check if product already exists
    const existingProductResult = await db.query(
      'SELECT id FROM products WHERE name = $1',
      [name]
    );

    if (existingProductResult.rows.length > 0) {
      throw new Error('Product with this name already exists');
    }

    const productResult = await db.query(
      `INSERT INTO products (name, type, unit_of_measure, unit_cost)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [name, type, unitOfMeasure, unitCost || 0]
    );

    return productResult.rows[0];
  }

  async getProducts(filters = {}) {
    const {
      page = 1,
      limit = 10,
      search,
      type,
      sortBy = 'name',
      sortOrder = 'asc'
    } = filters;

    const offset = (page - 1) * limit;

    let whereClause = 'WHERE 1=1';
    const params = [];
    let paramCount = 0;

    if (search) {
      paramCount++;
      whereClause += ` AND (name ILIKE $${paramCount} OR name ILIKE $${paramCount})`;
      params.push(`%${search}%`);
    }

    if (type) {
      paramCount++;
      whereClause += ` AND type = $${paramCount}`;
      params.push(type);
    }

    // Get products with counts
    const productsQuery = `
      SELECT p.*, 
             (SELECT COUNT(*) FROM bom_components bc WHERE bc.product_id = p.id) as bom_components_count,
             (SELECT COUNT(*) FROM stock_ledger sl WHERE sl.product_id = p.id) as stock_ledger_count,
             (SELECT COUNT(*) FROM manufacturing_orders mo WHERE mo.finished_product_id = p.id) as manufacturing_orders_count
      FROM products p
      ${whereClause}
      ORDER BY ${sortBy} ${sortOrder.toUpperCase()}
      LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}
    `;

    // Get total count
    const countQuery = `
      SELECT COUNT(*) as total
      FROM products p
      ${whereClause}
    `;

    params.push(limit, offset);

    const [productsResult, countResult] = await Promise.all([
      db.query(productsQuery, params),
      db.query(countQuery, params.slice(0, -2)) // Remove limit and offset for count
    ]);

    const total = parseInt(countResult.rows[0].total);

    return {
      products: productsResult.rows,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    };
  }

  async getProductById(id) {
    const productResult = await db.query(
      'SELECT * FROM products WHERE id = $1',
      [parseInt(id)]
    );

    if (productResult.rows.length === 0) {
      throw new Error('Product not found');
    }

    const product = productResult.rows[0];

    // Get BOM components
    const bomComponentsResult = await db.query(
      `SELECT bc.*, b.reference, b.version, p.name as product_name
       FROM bom_components bc
       JOIN boms b ON bc.bom_id = b.id
       JOIN products p ON bc.product_id = p.id
       WHERE b.product_id = $1`,
      [parseInt(id)]
    );

    // Get recent stock ledger entries
    const stockLedgerResult = await db.query(
      `SELECT * FROM stock_ledger 
       WHERE product_id = $1 
       ORDER BY transaction_date DESC 
       LIMIT 10`,
      [parseInt(id)]
    );

    // Get recent manufacturing orders
    const manufacturingOrdersResult = await db.query(
      `SELECT mo.*, u.name as assignee_name
       FROM manufacturing_orders mo
       LEFT JOIN users u ON mo.assignee_id = u.id
       WHERE mo.finished_product_id = $1
       ORDER BY mo.created_at DESC
       LIMIT 5`,
      [parseInt(id)]
    );

    return {
      ...product,
      bomComponents: bomComponentsResult.rows,
      stockLedger: stockLedgerResult.rows,
      manufacturingOrders: manufacturingOrdersResult.rows
    };
  }

  async updateProduct(id, data) {
    const { name, type, unitOfMeasure, unitCost } = data;

    // Check if product exists
    const existingProductResult = await db.query(
      'SELECT name FROM products WHERE id = $1',
      [parseInt(id)]
    );

    if (existingProductResult.rows.length === 0) {
      throw new Error('Product not found');
    }

    const existingProduct = existingProductResult.rows[0];

    // Check if new name conflicts with existing products
    if (name && name !== existingProduct.name) {
      const nameConflictResult = await db.query(
        'SELECT id FROM products WHERE name = $1 AND id != $2',
        [name, parseInt(id)]
      );

      if (nameConflictResult.rows.length > 0) {
        throw new Error('Product with this name already exists');
      }
    }

    const productResult = await db.query(
      `UPDATE products 
       SET name = $1, type = $2, unit_of_measure = $3, unit_cost = $4, updated_at = CURRENT_TIMESTAMP
       WHERE id = $5
       RETURNING *`,
      [name, type, unitOfMeasure, unitCost, parseInt(id)]
    );

    return productResult.rows[0];
  }

  async deleteProduct(id) {
    // Check if product exists and get usage counts
    const productResult = await db.query(
      `SELECT p.*,
              (SELECT COUNT(*) FROM bom_components bc WHERE bc.product_id = p.id) as bom_components_count,
              (SELECT COUNT(*) FROM stock_ledger sl WHERE sl.product_id = p.id) as stock_ledger_count,
              (SELECT COUNT(*) FROM manufacturing_orders mo WHERE mo.finished_product_id = p.id) as manufacturing_orders_count
       FROM products p
       WHERE p.id = $1`,
      [parseInt(id)]
    );

    if (productResult.rows.length === 0) {
      throw new Error('Product not found');
    }

    const product = productResult.rows[0];

    // Check if product is being used
    const totalUsage = parseInt(product.bom_components_count) + 
                      parseInt(product.stock_ledger_count) + 
                      parseInt(product.manufacturing_orders_count);

    if (totalUsage > 0) {
      throw new Error('Cannot delete product that is being used in BOMs, stock ledger, or manufacturing orders');
    }

    await db.query(
      'DELETE FROM products WHERE id = $1',
      [parseInt(id)]
    );

    return { message: 'Product deleted successfully' };
  }

  async getProductStock(id) {
    const productResult = await db.query(
      'SELECT * FROM products WHERE id = $1',
      [parseInt(id)]
    );

    if (productResult.rows.length === 0) {
      throw new Error('Product not found');
    }

    const product = productResult.rows[0];

    // Calculate stock from stock ledger
    const stockTransactionsResult = await db.query(
      'SELECT * FROM stock_ledger WHERE product_id = $1 ORDER BY transaction_date ASC',
      [parseInt(id)]
    );

    let currentStock = 0;
    const stockHistory = [];

    for (const transaction of stockTransactionsResult.rows) {
      if (transaction.transaction_type === 'IN') {
        currentStock += transaction.quantity;
      } else if (transaction.transaction_type === 'OUT') {
        currentStock -= transaction.quantity;
      } else if (transaction.transaction_type === 'ADJUSTMENT') {
        currentStock = transaction.quantity; // Direct adjustment
      }

      stockHistory.push({
        ...transaction,
        runningStock: currentStock
      });
    }

    return {
      product: {
        id: product.id,
        name: product.name,
        unitOfMeasure: product.unit_of_measure,
        unitCost: product.unit_cost
      },
      currentStock,
      stockHistory
    };
  }

  async getProductTypes() {
    return ['FINISHED_GOOD', 'RAW_MATERIAL', 'SEMI_FINISHED'];
  }

  async getUnitsOfMeasure() {
    // Common units of measure
    return [
      'PCS', 'KG', 'G', 'L', 'ML', 'M', 'CM', 'MM', 'M2', 'M3',
      'BOX', 'CARTON', 'PALLET', 'ROLL', 'SET', 'PAIR', 'DOZEN'
    ];
  }
}

module.exports = new ProductService();
