const prisma = require('../config/database');

class ProductService {
  async createProduct(data) {
    const { name, description, type, unitOfMeasure, unitCost } = data;

    // Check if product already exists
    const existingProduct = await prisma.product.findUnique({
      where: { name }
    });

    if (existingProduct) {
      throw new Error('Product with this name already exists');
    }

    const product = await prisma.product.create({
      data: {
        name,
        description,
        type,
        unitOfMeasure,
        unitCost: unitCost || 0
      }
    });

    return product;
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

    const skip = (page - 1) * limit;

    const where = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ];
    }

    if (type) {
      where.type = type;
    }

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: {
          _count: {
            select: {
              bomComponents: true,
              stockLedger: true,
              manufacturingOrders: true
            }
          }
        }
      }),
      prisma.product.count({ where })
    ]);

    return {
      products,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    };
  }

  async getProductById(id) {
    const product = await prisma.product.findUnique({
      where: { id: parseInt(id) },
      include: {
        bomComponents: {
          include: {
            bom: {
              include: {
                product: true
              }
            }
          }
        },
        stockLedger: {
          orderBy: { transactionDate: 'desc' },
          take: 10
        },
        manufacturingOrders: {
          include: {
            assignee: {
              select: {
                id: true,
                userId: true,
                name: true
              }
            }
          },
          orderBy: { createdAt: 'desc' },
          take: 5
        }
      }
    });

    if (!product) {
      throw new Error('Product not found');
    }

    return product;
  }

  async updateProduct(id, data) {
    const { name, description, type, unitOfMeasure, unitCost } = data;

    // Check if product exists
    const existingProduct = await prisma.product.findUnique({
      where: { id: parseInt(id) }
    });

    if (!existingProduct) {
      throw new Error('Product not found');
    }

    // Check if new name conflicts with existing products
    if (name && name !== existingProduct.name) {
      const nameConflict = await prisma.product.findFirst({
        where: {
          name,
          id: { not: parseInt(id) }
        }
      });

      if (nameConflict) {
        throw new Error('Product with this name already exists');
      }
    }

    const product = await prisma.product.update({
      where: { id: parseInt(id) },
      data: {
        name,
        description,
        type,
        unitOfMeasure,
        unitCost
      }
    });

    return product;
  }

  async deleteProduct(id) {
    // Check if product exists
    const product = await prisma.product.findUnique({
      where: { id: parseInt(id) },
      include: {
        _count: {
          select: {
            bomComponents: true,
            stockLedger: true,
            manufacturingOrders: true
          }
        }
      }
    });

    if (!product) {
      throw new Error('Product not found');
    }

    // Check if product is being used
    const totalUsage = product._count.bomComponents + 
                      product._count.stockLedger + 
                      product._count.manufacturingOrders;

    if (totalUsage > 0) {
      throw new Error('Cannot delete product that is being used in BOMs, stock ledger, or manufacturing orders');
    }

    await prisma.product.delete({
      where: { id: parseInt(id) }
    });

    return { message: 'Product deleted successfully' };
  }

  async getProductStock(id) {
    const product = await prisma.product.findUnique({
      where: { id: parseInt(id) }
    });

    if (!product) {
      throw new Error('Product not found');
    }

    // Calculate stock from stock ledger
    const stockTransactions = await prisma.stockLedger.findMany({
      where: { productId: parseInt(id) },
      orderBy: { transactionDate: 'asc' }
    });

    let currentStock = 0;
    const stockHistory = [];

    for (const transaction of stockTransactions) {
      if (transaction.transactionType === 'IN') {
        currentStock += transaction.quantity;
      } else if (transaction.transactionType === 'OUT') {
        currentStock -= transaction.quantity;
      } else if (transaction.transactionType === 'ADJUSTMENT') {
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
        unitOfMeasure: product.unitOfMeasure,
        unitCost: product.unitCost
      },
      currentStock,
      stockHistory
    };
  }

  async getProductTypes() {
    return Object.values(prisma.ProductType);
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
