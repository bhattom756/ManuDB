const prisma = require('../config/database');

class DashboardController {
  // Get role-specific dashboard summary
  async getDashboardSummary(req, res, next) {
    try {
      const userRole = req.user.role;
      const userId = req.user.id;

      let dashboardData;

      switch (userRole) {
        case 'BUSINESS_OWNER':
          dashboardData = await this.getBusinessOwnerDashboard();
          break;
        case 'MANUFACTURING_MANAGER':
          dashboardData = await this.getManufacturingManagerDashboard();
          break;
        case 'OPERATOR':
          dashboardData = await this.getOperatorDashboard(userId);
          break;
        case 'INVENTORY_MANAGER':
          dashboardData = await this.getInventoryManagerDashboard();
          break;
        default:
          dashboardData = await this.getBasicDashboard();
      }

      res.json({
        success: true,
        data: {
          userRole,
          ...dashboardData
        }
      });
    } catch (error) {
      next(error);
    }
  }

  // Get manufacturing orders with filtering
  async getManufacturingOrders(req, res, next) {
    try {
      const {
        page = 1,
        limit = 10,
        search,
        status,
        assigneeId,
        sortBy = 'createdAt',
        sortOrder = 'desc'
      } = req.query;

      const skip = (parseInt(page) - 1) * parseInt(limit);
      const take = parseInt(limit);

      // Build where clause
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

      const [manufacturingOrders, total] = await Promise.all([
        prisma.manufacturingOrder.findMany({
          where,
          include: {
            finishedProduct: {
              select: {
                id: true,
                name: true,
                type: true,
                unitOfMeasure: true
              }
            },
            assignee: {
              select: {
                id: true,
                userId: true,
                name: true,
                role: true
              }
            },
            billOfMaterial: {
              select: {
                id: true,
                reference: true,
                version: true
              }
            },
            workOrders: {
              select: {
                id: true,
                operationName: true,
                status: true,
                expectedDuration: true,
                realDuration: true,
                workCenter: {
                  select: {
                    id: true,
                    name: true
                  }
                },
                assignedTo: {
                  select: {
                    id: true,
                    userId: true,
                    name: true
                  }
                }
              }
            }
          },
          orderBy: {
            [sortBy]: sortOrder
          },
          skip,
          take
        }),
        prisma.manufacturingOrder.count({ where })
      ]);

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
      next(error);
    }
  }

  // Get low stock products
  async getLowStockProducts(req, res, next) {
    try {
      const { threshold = 10 } = req.query;

      const lowStockProducts = await prisma.product.findMany({
        where: {
          currentStock: {
            lte: parseInt(threshold)
          }
        },
        select: {
          id: true,
          name: true,
          type: true,
          unitOfMeasure: true,
          unitCost: true,
          currentStock: true
        },
        orderBy: {
          currentStock: 'asc'
        }
      });

      res.json({
        success: true,
        data: lowStockProducts
      });
    } catch (error) {
      next(error);
    }
  }

  // Get KPIs
  async getKPIs(req, res, next) {
    try {
      const { startDate, endDate } = req.query;
      
      const dateFilter = {};
      if (startDate && endDate) {
        dateFilter.createdAt = {
          gte: new Date(startDate),
          lte: new Date(endDate)
        };
      }

      const [
        ordersCompleted,
        ordersInProgress,
        ordersDelayed,
        totalWorkOrders,
        completedWorkOrders,
        stockValue
      ] = await Promise.all([
        prisma.manufacturingOrder.count({
          where: { ...dateFilter, status: 'CLOSED' }
        }),
        prisma.manufacturingOrder.count({
          where: { ...dateFilter, status: 'IN_PROGRESS' }
        }),
        prisma.manufacturingOrder.count({
          where: {
            ...dateFilter,
            status: { in: ['IN_PROGRESS', 'CONFIRMED'] },
            scheduleDate: { lt: new Date() }
          }
        }),
        prisma.workOrder.count({ where: dateFilter }),
        prisma.workOrder.count({
          where: { ...dateFilter, status: 'COMPLETED' }
        }),
        this.calculateStockValue()
      ]);

      const efficiency = totalWorkOrders > 0 ? (completedWorkOrders / totalWorkOrders) * 100 : 0;

      res.json({
        success: true,
        data: {
          ordersCompleted,
          ordersInProgress,
          ordersDelayed,
          totalWorkOrders,
          completedWorkOrders,
          efficiency: Math.round(efficiency * 100) / 100,
          stockValue
        }
      });
    } catch (error) {
      next(error);
    }
  }

  // Helper methods
  async getManufacturingOrdersByStatus() {
    const statusCounts = await prisma.manufacturingOrder.groupBy({
      by: ['status'],
      _count: {
        status: true
      }
    });

    return statusCounts.reduce((acc, item) => {
      acc[item.status] = item._count.status;
      return acc;
    }, {});
  }

  async getWorkOrdersByStatus() {
    const statusCounts = await prisma.workOrder.groupBy({
      by: ['status'],
      _count: {
        status: true
      }
    });

    return statusCounts.reduce((acc, item) => {
      acc[item.status] = item._count.status;
      return acc;
    }, {});
  }

  async getRecentManufacturingOrders() {
    return await prisma.manufacturingOrder.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: {
        finishedProduct: {
          select: {
            id: true,
            name: true,
            type: true
          }
        },
        assignee: {
          select: {
            id: true,
            userId: true,
            name: true
          }
        }
      }
    });
  }

  async getLowStockProducts() {
    return await prisma.product.findMany({
      where: {
        currentStock: {
          lte: 10
        }
      },
      select: {
        id: true,
        name: true,
        type: true,
        unitOfMeasure: true,
        currentStock: true
      },
      orderBy: {
        currentStock: 'asc'
      },
      take: 10
    });
  }

  async calculateStockValue() {
    const products = await prisma.product.findMany({
      select: {
        id: true,
        name: true,
        currentStock: true,
        unitCost: true
      }
    });

    const totalValue = products.reduce((sum, product) => {
      return sum + (product.currentStock * product.unitCost);
    }, 0);

    return {
      totalValue,
      productCount: products.length,
      lowStockCount: products.filter(p => p.currentStock <= 10).length
    };
  }

  // Role-specific dashboard methods
  async getBusinessOwnerDashboard() {
    const [
      totalManufacturingOrders,
      totalWorkOrders,
      totalProducts,
      totalBOMs,
      totalWorkCenters,
      totalStockLedger,
      manufacturingOrdersByStatus,
      workOrdersByStatus,
      recentManufacturingOrders,
      lowStockProducts,
      kpis,
      stockValue
    ] = await Promise.all([
      prisma.manufacturingOrder.count(),
      prisma.workOrder.count(),
      prisma.product.count(),
      prisma.bOM.count(),
      prisma.workCenter.count(),
      prisma.stockLedger.count(),
      this.getManufacturingOrdersByStatus(),
      this.getWorkOrdersByStatus(),
      this.getRecentManufacturingOrders(),
      this.getLowStockProducts(),
      this.getKPIs(),
      this.calculateStockValue()
    ]);

    return {
      title: "Business Owner Dashboard",
      description: "Monitor overall production KPIs, generate reports, and ensure traceability",
      summary: {
        totalManufacturingOrders,
        totalWorkOrders,
        totalProducts,
        totalBOMs,
        totalWorkCenters,
        totalStockLedger
      },
      manufacturingOrdersByStatus,
      workOrdersByStatus,
      recentManufacturingOrders,
      lowStockProducts,
      kpis,
      stockValue,
      features: [
        "Production KPIs and Analytics",
        "Overall System Overview",
        "Financial Reports",
        "Traceability Reports",
        "User Management"
      ]
    };
  }

  async getManufacturingManagerDashboard() {
    const [
      manufacturingOrdersByStatus,
      workOrdersByStatus,
      recentManufacturingOrders,
      workCenterUtilization,
      productionEfficiency
    ] = await Promise.all([
      this.getManufacturingOrdersByStatus(),
      this.getWorkOrdersByStatus(),
      this.getRecentManufacturingOrders(),
      this.getWorkCenterUtilization(),
      this.getProductionEfficiency()
    ]);

    return {
      title: "Manufacturing Manager Dashboard",
      description: "Oversee production orders and workflows",
      manufacturingOrdersByStatus,
      workOrdersByStatus,
      recentManufacturingOrders,
      workCenterUtilization,
      productionEfficiency,
      features: [
        "Production Order Management",
        "Workflow Oversight",
        "Work Center Utilization",
        "Production Efficiency",
        "Team Performance"
      ]
    };
  }

  async getOperatorDashboard(userId) {
    const [
      assignedWorkOrders,
      workOrderStatus,
      recentComments,
      recentIssues,
      workCenterInfo
    ] = await Promise.all([
      this.getAssignedWorkOrders(userId),
      this.getWorkOrderStatusForOperator(userId),
      this.getRecentComments(userId),
      this.getRecentIssues(userId),
      this.getWorkCenterInfoForOperator(userId)
    ]);

    return {
      title: "Operator Dashboard",
      description: "Execute assigned work orders and update status",
      assignedWorkOrders,
      workOrderStatus,
      recentComments,
      recentIssues,
      workCenterInfo,
      features: [
        "My Assigned Work Orders",
        "Work Order Status Updates",
        "Comments and Issues",
        "Work Center Information",
        "Production Progress"
      ]
    };
  }

  async getInventoryManagerDashboard() {
    const [
      stockSummary,
      lowStockProducts,
      recentStockMovements,
      stockValue,
      inventoryAlerts
    ] = await Promise.all([
      this.getStockSummary(),
      this.getLowStockProducts(),
      this.getRecentStockMovements(),
      this.calculateStockValue(),
      this.getInventoryAlerts()
    ]);

    return {
      title: "Inventory Manager Dashboard",
      description: "Track stock movement, raw material usage, and ledger balance",
      stockSummary,
      lowStockProducts,
      recentStockMovements,
      stockValue,
      inventoryAlerts,
      features: [
        "Stock Movement Tracking",
        "Raw Material Usage",
        "Ledger Balance",
        "Inventory Alerts",
        "Stock Adjustments"
      ]
    };
  }

  async getBasicDashboard() {
    const [
      totalManufacturingOrders,
      totalWorkOrders,
      totalProducts,
      manufacturingOrdersByStatus,
      workOrdersByStatus
    ] = await Promise.all([
      prisma.manufacturingOrder.count(),
      prisma.workOrder.count(),
      prisma.product.count(),
      this.getManufacturingOrdersByStatus(),
      this.getWorkOrdersByStatus()
    ]);

    return {
      title: "Basic Dashboard",
      description: "General system overview",
      summary: {
        totalManufacturingOrders,
        totalWorkOrders,
        totalProducts
      },
      manufacturingOrdersByStatus,
      workOrdersByStatus
    };
  }

  // Helper methods for role-specific dashboards
  async getKPIs() {
    const today = new Date();
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    const [
      ordersCompleted,
      ordersInProgress,
      ordersDelayed,
      totalWorkOrders,
      completedWorkOrders
    ] = await Promise.all([
      prisma.manufacturingOrder.count({
        where: { status: 'CLOSED', createdAt: { gte: startOfMonth } }
      }),
      prisma.manufacturingOrder.count({
        where: { status: 'IN_PROGRESS' }
      }),
      prisma.manufacturingOrder.count({
        where: {
          status: { in: ['IN_PROGRESS', 'CONFIRMED'] },
          scheduleDate: { lt: today }
        }
      }),
      prisma.workOrder.count(),
      prisma.workOrder.count({
        where: { status: 'COMPLETED' }
      })
    ]);

    const efficiency = totalWorkOrders > 0 ? (completedWorkOrders / totalWorkOrders) * 100 : 0;

    return {
      ordersCompleted,
      ordersInProgress,
      ordersDelayed,
      totalWorkOrders,
      completedWorkOrders,
      efficiency: Math.round(efficiency * 100) / 100
    };
  }

  async getWorkCenterUtilization() {
    const workCenters = await prisma.workCenter.findMany({
      include: {
        workOrders: {
          select: {
            expectedDuration: true,
            realDuration: true,
            status: true
          }
        }
      }
    });

    return workCenters.map(center => {
      const totalExpected = center.workOrders.reduce((sum, wo) => sum + wo.expectedDuration, 0);
      const totalActual = center.workOrders.reduce((sum, wo) => sum + (wo.realDuration || 0), 0);
      
      return {
        workCenterId: center.id,
        name: center.name,
        expectedDuration: totalExpected,
        actualDuration: totalActual,
        utilization: totalExpected > 0 ? (totalActual / totalExpected) * 100 : 0
      };
    });
  }

  async getProductionEfficiency() {
    const workOrders = await prisma.workOrder.findMany({
      where: {
        status: 'COMPLETED'
      },
      select: {
        expectedDuration: true,
        realDuration: true
      }
    });

    const totalExpected = workOrders.reduce((sum, wo) => sum + wo.expectedDuration, 0);
    const totalActual = workOrders.reduce((sum, wo) => sum + (wo.realDuration || 0), 0);

    return {
      totalExpected,
      totalActual,
      efficiency: totalExpected > 0 ? (totalActual / totalExpected) * 100 : 0,
      completedOrders: workOrders.length
    };
  }

  async getAssignedWorkOrders(userId) {
    return await prisma.workOrder.findMany({
      where: {
        assignedToId: userId,
        status: { in: ['PLANNED', 'STARTED', 'PAUSED'] }
      },
      include: {
        manufacturingOrder: {
          include: {
            finishedProduct: {
              select: {
                id: true,
                name: true,
                type: true
              }
            }
          }
        },
        workCenter: {
          select: {
            id: true,
            name: true,
            capacity: true,
            costPerHour: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
  }

  async getWorkOrderStatusForOperator(userId) {
    const statusCounts = await prisma.workOrder.groupBy({
      by: ['status'],
      where: {
        assignedToId: userId
      },
      _count: {
        status: true
      }
    });

    return statusCounts.reduce((acc, item) => {
      acc[item.status] = item._count.status;
      return acc;
    }, {});
  }

  async getRecentComments(userId) {
    return await prisma.workOrderComment.findMany({
      where: {
        workOrder: {
          assignedToId: userId
        }
      },
      include: {
        user: {
          select: {
            id: true,
            userId: true,
            name: true
          }
        },
        workOrder: {
          select: {
            id: true,
            operationName: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 5
    });
  }

  async getRecentIssues(userId) {
    return await prisma.workOrderIssue.findMany({
      where: {
        workOrder: {
          assignedToId: userId
        }
      },
      include: {
        user: {
          select: {
            id: true,
            userId: true,
            name: true
          }
        },
        workOrder: {
          select: {
            id: true,
            operationName: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 5
    });
  }

  async getWorkCenterInfoForOperator(userId) {
    const workOrders = await prisma.workOrder.findMany({
      where: {
        assignedToId: userId
      },
      include: {
        workCenter: {
          select: {
            id: true,
            name: true,
            capacity: true,
            costPerHour: true
          }
        }
      }
    });

    const workCenters = workOrders.reduce((acc, wo) => {
      if (!acc[wo.workCenter.id]) {
        acc[wo.workCenter.id] = {
          ...wo.workCenter,
          workOrderCount: 0
        };
      }
      acc[wo.workCenter.id].workOrderCount++;
      return acc;
    }, {});

    return Object.values(workCenters);
  }

  async getStockSummary() {
    const products = await prisma.product.findMany({
      select: {
        id: true,
        name: true,
        type: true,
        currentStock: true,
        unitOfMeasure: true,
        unitCost: true
      }
    });

    const totalValue = products.reduce((sum, product) => {
      return sum + (product.currentStock * product.unitCost);
    }, 0);

    return {
      totalProducts: products.length,
      totalValue,
      lowStockCount: products.filter(p => p.currentStock <= 10).length,
      productsByType: products.reduce((acc, product) => {
        acc[product.type] = (acc[product.type] || 0) + 1;
        return acc;
      }, {})
    };
  }

  async getRecentStockMovements() {
    return await prisma.stockLedger.findMany({
      take: 10,
      orderBy: {
        transactionDate: 'desc'
      },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            type: true,
            unitOfMeasure: true
          }
        }
      }
    });
  }

  async getInventoryAlerts() {
    const lowStockProducts = await prisma.product.findMany({
      where: {
        currentStock: {
          lte: 10
        }
      },
      select: {
        id: true,
        name: true,
        currentStock: true,
        unitOfMeasure: true,
        unitCost: true
      },
      orderBy: {
        currentStock: 'asc'
      }
    });

    return {
      lowStockCount: lowStockProducts.length,
      criticalStock: lowStockProducts.filter(p => p.currentStock === 0).length,
      products: lowStockProducts
    };
  }
}

module.exports = new DashboardController();