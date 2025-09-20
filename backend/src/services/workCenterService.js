const prisma = require('../config/database');

class WorkCenterService {
  async createWorkCenter(data) {
    const { name, description, capacity = 8, costPerHour = 0, status = 'ACTIVE' } = data;

    // Check if work center already exists
    const existingWorkCenter = await prisma.workCenter.findUnique({
      where: { name }
    });

    if (existingWorkCenter) {
      throw new Error('Work center with this name already exists');
    }

    const workCenter = await prisma.workCenter.create({
      data: {
        name,
        description,
        capacity,
        costPerHour,
        status
      }
    });

    return workCenter;
  }

  async getWorkCenters(filters = {}) {
    const {
      page = 1,
      limit = 10,
      search,
      status,
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

    if (status) {
      where.status = status;
    }

    const [workCenters, total] = await Promise.all([
      prisma.workCenter.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: {
          _count: {
            select: {
              workOrders: true
            }
          }
        }
      }),
      prisma.workCenter.count({ where })
    ]);

    return {
      workCenters,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    };
  }

  async getWorkCenterById(id) {
    const workCenter = await prisma.workCenter.findUnique({
      where: { id: parseInt(id) },
      include: {
        workOrders: {
          include: {
            manufacturingOrder: {
              include: {
                finishedProduct: true
              }
            },
            assignedTo: {
              select: {
                id: true,
                userId: true,
                name: true
              }
            }
          },
          orderBy: { createdAt: 'desc' }
        },
        _count: {
          select: {
            workOrders: true
          }
        }
      }
    });

    if (!workCenter) {
      throw new Error('Work center not found');
    }

    return workCenter;
  }

  async updateWorkCenter(id, data) {
    const { name, description, capacity, costPerHour, status } = data;

    // Check if work center exists
    const existingWorkCenter = await prisma.workCenter.findUnique({
      where: { id: parseInt(id) }
    });

    if (!existingWorkCenter) {
      throw new Error('Work center not found');
    }

    // Check if new name conflicts with existing work centers
    if (name && name !== existingWorkCenter.name) {
      const nameConflict = await prisma.workCenter.findFirst({
        where: {
          name,
          id: { not: parseInt(id) }
        }
      });

      if (nameConflict) {
        throw new Error('Work center with this name already exists');
      }
    }

    const workCenter = await prisma.workCenter.update({
      where: { id: parseInt(id) },
      data: {
        name,
        description,
        capacity,
        costPerHour,
        status
      }
    });

    return workCenter;
  }

  async deleteWorkCenter(id) {
    // Check if work center exists
    const workCenter = await prisma.workCenter.findUnique({
      where: { id: parseInt(id) },
      include: {
        _count: {
          select: {
            workOrders: true
          }
        }
      }
    });

    if (!workCenter) {
      throw new Error('Work center not found');
    }

    // Check if work center is being used
    if (workCenter._count.workOrders > 0) {
      throw new Error('Cannot delete work center that has work orders');
    }

    await prisma.workCenter.delete({
      where: { id: parseInt(id) }
    });

    return { message: 'Work center deleted successfully' };
  }

  async updateStatus(id, status) {
    const validStatuses = ['ACTIVE', 'UNDER_MAINTENANCE', 'INACTIVE'];
    
    if (!validStatuses.includes(status)) {
      throw new Error('Invalid status');
    }

    const workCenter = await prisma.workCenter.update({
      where: { id: parseInt(id) },
      data: { status }
    });

    return workCenter;
  }

  async getWorkCenterUtilization(id, startDate, endDate) {
    const workCenter = await prisma.workCenter.findUnique({
      where: { id: parseInt(id) }
    });

    if (!workCenter) {
      throw new Error('Work center not found');
    }

    const where = {
      workCenterId: parseInt(id)
    };

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = new Date(startDate);
      if (endDate) where.createdAt.lte = new Date(endDate);
    }

    const workOrders = await prisma.workOrder.findMany({
      where,
      include: {
        manufacturingOrder: {
          include: {
            finishedProduct: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    // Calculate utilization
    const totalExpectedDuration = workOrders.reduce((sum, wo) => sum + wo.expectedDuration, 0);
    const totalRealDuration = workOrders.reduce((sum, wo) => sum + (wo.realDuration || 0), 0);
    const totalCapacity = workCenter.capacity * 60; // Convert hours to minutes
    const utilization = totalCapacity > 0 ? (totalExpectedDuration / totalCapacity) * 100 : 0;

    return {
      workCenter,
      workOrders,
      utilization: {
        expected: Math.round(utilization * 100) / 100,
        actual: totalRealDuration > 0 ? Math.round((totalRealDuration / totalCapacity) * 100 * 100) / 100 : 0,
        totalExpectedDuration,
        totalRealDuration,
        totalCapacity
      }
    };
  }

  async getWorkCenterStatuses() {
    return ['ACTIVE', 'UNDER_MAINTENANCE', 'INACTIVE'];
  }

  async getWorkCenterStats() {
    const [
      totalWorkCenters,
      activeWorkCenters,
      underMaintenanceWorkCenters,
      inactiveWorkCenters
    ] = await Promise.all([
      prisma.workCenter.count(),
      prisma.workCenter.count({ where: { status: 'ACTIVE' } }),
      prisma.workCenter.count({ where: { status: 'UNDER_MAINTENANCE' } }),
      prisma.workCenter.count({ where: { status: 'INACTIVE' } })
    ]);

    return {
      totalWorkCenters,
      activeWorkCenters,
      underMaintenanceWorkCenters,
      inactiveWorkCenters
    };
  }
}

module.exports = new WorkCenterService();
