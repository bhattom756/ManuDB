const prisma = require('../config/database');

class StockLedgerService {
  async createStockTransaction(data) {
    const {
      productId,
      transactionType,
      quantity,
      unitCost = 0,
      reference,
      referenceId
    } = data;

    // Check if product exists
    const product = await prisma.product.findUnique({
      where: { id: productId }
    });

    if (!product) {
      throw new Error('Product not found');
    }

    // Calculate total value
    const totalValue = quantity * unitCost;

    const stockTransaction = await prisma.stockLedger.create({
      data: {
        productId,
        transactionType,
        quantity,
        unitCost,
        totalValue,
        reference,
        referenceId
      },
      include: {
        product: true
      }
    });

    return stockTransaction;
  }

  async getStockLedger(filters = {}) {
    const {
      page = 1,
      limit = 10,
      search,
      productId,
      transactionType,
      startDate,
      endDate,
      reference
    } = filters;

    const skip = (page - 1) * limit;

    const where = {};

    if (search) {
      where.OR = [
        { product: { name: { contains: search, mode: 'insensitive' } } },
        { reference: { contains: search, mode: 'insensitive' } }
      ];
    }

    if (productId) {
      where.productId = parseInt(productId);
    }

    if (transactionType) {
      where.transactionType = transactionType;
    }

    if (startDate || endDate) {
      where.transactionDate = {};
      if (startDate) where.transactionDate.gte = new Date(startDate);
      if (endDate) where.transactionDate.lte = new Date(endDate);
    }

    if (reference) {
      where.reference = { contains: reference, mode: 'insensitive' };
    }

    const [stockTransactions, total] = await Promise.all([
      prisma.stockLedger.findMany({
        where,
        skip,
        take: limit,
        include: {
          product: true
        },
        orderBy: { transactionDate: 'desc' }
      }),
      prisma.stockLedger.count({ where })
    ]);

    return {
      stockTransactions,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    };
  }

  async getStockLedgerById(id) {
    const stockTransaction = await prisma.stockLedger.findUnique({
      where: { id: parseInt(id) },
      include: {
        product: true
      }
    });

    if (!stockTransaction) {
      throw new Error('Stock transaction not found');
    }

    return stockTransaction;
  }

  async updateStockTransaction(id, data) {
    const { quantity, unitCost, reference, referenceId } = data;

    // Check if transaction exists
    const existingTransaction = await prisma.stockLedger.findUnique({
      where: { id: parseInt(id) }
    });

    if (!existingTransaction) {
      throw new Error('Stock transaction not found');
    }

    // Calculate new total value
    const newQuantity = quantity || existingTransaction.quantity;
    const newUnitCost = unitCost !== undefined ? unitCost : existingTransaction.unitCost;
    const totalValue = newQuantity * newUnitCost;

    const stockTransaction = await prisma.stockLedger.update({
      where: { id: parseInt(id) },
      data: {
        quantity: newQuantity,
        unitCost: newUnitCost,
        totalValue,
        reference,
        referenceId
      },
      include: {
        product: true
      }
    });

    return stockTransaction;
  }

  async deleteStockTransaction(id) {
    // Check if transaction exists
    const stockTransaction = await prisma.stockLedger.findUnique({
      where: { id: parseInt(id) }
    });

    if (!stockTransaction) {
      throw new Error('Stock transaction not found');
    }

    await prisma.stockLedger.delete({
      where: { id: parseInt(id) }
    });

    return { message: 'Stock transaction deleted successfully' };
  }

  async getProductStock(productId) {
    const product = await prisma.product.findUnique({
      where: { id: parseInt(productId) }
    });

    if (!product) {
      throw new Error('Product not found');
    }

    // Get all stock transactions for the product
    const stockTransactions = await prisma.stockLedger.findMany({
      where: { productId: parseInt(productId) },
      orderBy: { transactionDate: 'asc' }
    });

    // Calculate current stock
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

  async getAllProductStocks(filters = {}) {
    const { search, type } = filters;

    const where = {};

    if (search) {
      where.name = { contains: search, mode: 'insensitive' };
    }

    if (type) {
      where.type = type;
    }

    const products = await prisma.product.findMany({
      where,
      include: {
        stockLedger: {
          orderBy: { transactionDate: 'asc' }
        }
      },
      orderBy: { name: 'asc' }
    });

    // Calculate stock for each product
    const productStocks = products.map(product => {
      let currentStock = 0;
      let totalIn = 0;
      let totalOut = 0;
      let totalValue = 0;

      for (const transaction of product.stockLedger) {
        if (transaction.transactionType === 'IN') {
          currentStock += transaction.quantity;
          totalIn += transaction.quantity;
        } else if (transaction.transactionType === 'OUT') {
          currentStock -= transaction.quantity;
          totalOut += transaction.quantity;
        } else if (transaction.transactionType === 'ADJUSTMENT') {
          currentStock = transaction.quantity;
        }

        totalValue += transaction.totalValue;
      }

      return {
        product: {
          id: product.id,
          name: product.name,
          type: product.type,
          unitOfMeasure: product.unitOfMeasure,
          unitCost: product.unitCost
        },
        currentStock,
        totalIn,
        totalOut,
        totalValue,
        freeToUse: currentStock, // Assuming all stock is free to use
        incoming: 0, // This would need to be calculated based on pending orders
        outgoing: 0 // This would need to be calculated based on pending orders
      };
    });

    return productStocks;
  }

  async adjustStock(productId, quantity, reason = 'Manual adjustment') {
    const product = await prisma.product.findUnique({
      where: { id: parseInt(productId) }
    });

    if (!product) {
      throw new Error('Product not found');
    }

    const stockTransaction = await this.createStockTransaction({
      productId: parseInt(productId),
      transactionType: 'ADJUSTMENT',
      quantity,
      unitCost: product.unitCost,
      reference: reason
    });

    return stockTransaction;
  }

  async getStockMovements(productId, startDate, endDate) {
    const where = {
      productId: parseInt(productId)
    };

    if (startDate || endDate) {
      where.transactionDate = {};
      if (startDate) where.transactionDate.gte = new Date(startDate);
      if (endDate) where.transactionDate.lte = new Date(endDate);
    }

    const stockMovements = await prisma.stockLedger.findMany({
      where,
      include: {
        product: true
      },
      orderBy: { transactionDate: 'desc' }
    });

    return stockMovements;
  }

  async getStockSummary() {
    const [
      totalProducts,
      totalTransactions,
      totalInTransactions,
      totalOutTransactions,
      totalAdjustments
    ] = await Promise.all([
      prisma.product.count(),
      prisma.stockLedger.count(),
      prisma.stockLedger.count({ where: { transactionType: 'IN' } }),
      prisma.stockLedger.count({ where: { transactionType: 'OUT' } }),
      prisma.stockLedger.count({ where: { transactionType: 'ADJUSTMENT' } })
    ]);

    return {
      totalProducts,
      totalTransactions,
      totalInTransactions,
      totalOutTransactions,
      totalAdjustments
    };
  }

  async getTransactionTypes() {
    return ['IN', 'OUT', 'ADJUSTMENT'];
  }
}

module.exports = new StockLedgerService();
