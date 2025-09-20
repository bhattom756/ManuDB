const prisma = require('../config/database');

class ManufacturingOrderService {
  async generateMONumber() {
    const count = await prisma.manufacturingOrder.count();
    const year = new Date().getFullYear();
    const month = String(new Date().getMonth() + 1).padStart(2, '0');
    const sequence = String(count + 1).padStart(4, '0');
    return `MO${year}${month}${sequence}`;
  }

  async createManufacturingOrder(data) {
    const {
      finishedProductId,
      quantity,
      scheduleDate,
      startDate,
      endDate,
      billOfMaterialId,
      assigneeId
    } = data;

    // Generate MO number
    const moNumber = await this.generateMONumber();

    // Create manufacturing order
    const manufacturingOrder = await prisma.manufacturingOrder.create({
      data: {
        moNumber,
        finishedProductId,
        quantity,
        scheduleDate: new Date(scheduleDate),
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
        billOfMaterialId,
        assigneeId,
        status: 'DRAFT'
      },
      include: {
        finishedProduct: true,
        billOfMaterial: {
          include: {
            components: {
              include: {
                product: true
              }
            }
          }
        },
        assignee: {
          select: {
            id: true,
            userId: true,
            name: true,
            email: true
          }
        },
        workOrders: {
          include: {
            workCenter: true,
            assignedTo: {
              select: {
                id: true,
                userId: true,
                name: true
              }
            }
          }
        }
      }
    });

    return manufacturingOrder;
  }

  async getManufacturingOrders(filters = {}) {
    const {
      page = 1,
      limit = 10,
      search,
      status,
      assigneeId,
      startDate,
      endDate
    } = filters;

    const skip = (page - 1) * limit;

    const where = {};

    if (search) {
      where.OR = [
        { moNumber: { contains: search, mode: 'insensitive' } },
        { finishedProduct: { name: { contains: search, mode: 'insensitive' } } }
      ];
    }

    if (status) {
      where.status = status;
    }

    if (assigneeId) {
      where.assigneeId = parseInt(assigneeId);
    }

    if (startDate || endDate) {
      where.scheduleDate = {};
      if (startDate) where.scheduleDate.gte = new Date(startDate);
      if (endDate) where.scheduleDate.lte = new Date(endDate);
    }

    const [manufacturingOrders, total] = await Promise.all([
      prisma.manufacturingOrder.findMany({
        where,
        skip,
        take: limit,
        include: {
          finishedProduct: true,
          assignee: {
            select: {
              id: true,
              userId: true,
              name: true,
              email: true
            }
          },
          workOrders: {
            include: {
              workCenter: true
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.manufacturingOrder.count({ where })
    ]);

    return {
      manufacturingOrders,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    };
  }

  async getManufacturingOrderById(id) {
    const manufacturingOrder = await prisma.manufacturingOrder.findUnique({
      where: { id: parseInt(id) },
      include: {
        finishedProduct: true,
        billOfMaterial: {
          include: {
            components: {
              include: {
                product: true
              }
            }
          }
        },
        assignee: {
          select: {
            id: true,
            userId: true,
            name: true,
            email: true
          }
        },
        workOrders: {
          include: {
            workCenter: true,
            assignedTo: {
              select: {
                id: true,
                userId: true,
                name: true
              }
            }
          }
        }
      }
    });

    if (!manufacturingOrder) {
      throw new Error('Manufacturing order not found');
    }

    return manufacturingOrder;
  }

  async updateManufacturingOrder(id, data) {
    const {
      finishedProductId,
      quantity,
      scheduleDate,
      startDate,
      endDate,
      billOfMaterialId,
      assigneeId,
      status
    } = data;

    const updateData = {};

    if (finishedProductId) updateData.finishedProductId = finishedProductId;
    if (quantity) updateData.quantity = quantity;
    if (scheduleDate) updateData.scheduleDate = new Date(scheduleDate);
    if (startDate) updateData.startDate = new Date(startDate);
    if (endDate) updateData.endDate = new Date(endDate);
    if (billOfMaterialId) updateData.billOfMaterialId = billOfMaterialId;
    if (assigneeId) updateData.assigneeId = assigneeId;
    if (status) updateData.status = status;

    const manufacturingOrder = await prisma.manufacturingOrder.update({
      where: { id: parseInt(id) },
      data: updateData,
      include: {
        finishedProduct: true,
        billOfMaterial: {
          include: {
            components: {
              include: {
                product: true
              }
            }
          }
        },
        assignee: {
          select: {
            id: true,
            userId: true,
            name: true,
            email: true
          }
        },
        workOrders: {
          include: {
            workCenter: true,
            assignedTo: {
              select: {
                id: true,
                userId: true,
                name: true
              }
            }
          }
        }
      }
    });

    return manufacturingOrder;
  }

  async deleteManufacturingOrder(id) {
    // Check if manufacturing order exists
    const manufacturingOrder = await prisma.manufacturingOrder.findUnique({
      where: { id: parseInt(id) }
    });

    if (!manufacturingOrder) {
      throw new Error('Manufacturing order not found');
    }

    // Check if it can be deleted (only DRAFT status)
    if (manufacturingOrder.status !== 'DRAFT') {
      throw new Error('Only DRAFT manufacturing orders can be deleted');
    }

    await prisma.manufacturingOrder.delete({
      where: { id: parseInt(id) }
    });

    return { message: 'Manufacturing order deleted successfully' };
  }

  async updateStatus(id, status) {
    const validStatuses = ['DRAFT', 'CONFIRMED', 'IN_PROGRESS', 'TO_CLOSE', 'CLOSED', 'CANCELLED', 'DELETED'];
    
    if (!validStatuses.includes(status)) {
      throw new Error('Invalid status');
    }

    const manufacturingOrder = await prisma.manufacturingOrder.update({
      where: { id: parseInt(id) },
      data: { status },
      include: {
        finishedProduct: true,
        assignee: {
          select: {
            id: true,
            userId: true,
            name: true,
            email: true
          }
        }
      }
    });

    return manufacturingOrder;
  }

  async getDashboardSummary() {
    const [
      totalManufacturingOrders,
      totalWorkOrders,
      totalProducts,
      totalBOMs,
      totalWorkCenters,
      totalStockLedger
    ] = await Promise.all([
      prisma.manufacturingOrder.count(),
      prisma.workOrder.count(),
      prisma.product.count(),
      prisma.bOM.count(),
      prisma.workCenter.count(),
      prisma.stockLedger.count()
    ]);

    return {
      totalManufacturingOrders,
      totalWorkOrders,
      totalProducts,
      totalBOMs,
      totalWorkCenters,
      totalStockLedger
    };
  }
}

module.exports = new ManufacturingOrderService();
