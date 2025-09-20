const prisma = require('../config/database');

class WorkOrderService {
  async createWorkOrder(workOrderData) {
    const { moId, workCenterId, operationName, expectedDuration, assignedToId } = workOrderData;

    // Verify manufacturing order exists
    const manufacturingOrder = await prisma.manufacturingOrder.findUnique({
      where: { id: moId }
    });

    if (!manufacturingOrder) {
      throw new Error('Manufacturing order not found');
    }

    // Verify work center exists
    const workCenter = await prisma.workCenter.findUnique({
      where: { id: workCenterId }
    });

    if (!workCenter) {
      throw new Error('Work center not found');
    }

    // Create work order
    const workOrder = await prisma.workOrder.create({
      data: {
        moId,
        workCenterId,
        operationName,
        expectedDuration,
        assignedToId
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
        },
        assignedTo: {
          select: {
            id: true,
            userId: true,
            name: true,
            role: true
          }
        }
      }
    });

    return workOrder;
  }

  async getWorkOrders(filters) {
    const { page, limit, search, status, workCenterId, moId, assignedToId } = filters;
    const skip = (page - 1) * limit;

    const where = {};

    if (search) {
      where.OR = [
        { operationName: { contains: search, mode: 'insensitive' } },
        { workCenter: { name: { contains: search, mode: 'insensitive' } } },
        { manufacturingOrder: { finishedProduct: { name: { contains: search, mode: 'insensitive' } } } }
      ];
    }

    if (status) {
      where.status = status;
    }

    if (workCenterId) {
      where.workCenterId = parseInt(workCenterId);
    }

    if (moId) {
      where.moId = parseInt(moId);
    }

    if (assignedToId) {
      where.assignedToId = parseInt(assignedToId);
    }

    const [workOrders, total] = await Promise.all([
      prisma.workOrder.findMany({
        where,
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
          },
          assignedTo: {
            select: {
              id: true,
              userId: true,
              name: true,
              role: true
            }
          },
          _count: {
            select: {
              comments: true,
              issues: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        },
        skip,
        take: limit
      }),
      prisma.workOrder.count({ where })
    ]);

    return {
      workOrders,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    };
  }

  async getWorkOrderById(id) {
    const workOrder = await prisma.workOrder.findUnique({
      where: { id: parseInt(id) },
      include: {
        manufacturingOrder: {
          include: {
            finishedProduct: {
              select: {
                id: true,
                name: true,
                type: true,
                unitOfMeasure: true
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
        },
        assignedTo: {
          select: {
            id: true,
            userId: true,
            name: true,
            role: true
          }
        },
        comments: {
          include: {
            user: {
              select: {
                id: true,
                userId: true,
                name: true
              }
            }
          },
          orderBy: {
            createdAt: 'desc'
          }
        },
        issues: {
          include: {
            user: {
          select: {
            id: true,
            userId: true,
                name: true
              }
            }
          },
          orderBy: {
            createdAt: 'desc'
          }
        }
      }
    });

    if (!workOrder) {
      throw new Error('Work order not found');
    }

    return workOrder;
  }

  async updateWorkOrder(id, updateData) {
    const { operationName, expectedDuration, assignedToId } = updateData;

    const workOrder = await prisma.workOrder.update({
      where: { id: parseInt(id) },
      data: {
        operationName,
        expectedDuration,
        assignedToId
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
        },
        assignedTo: {
          select: {
            id: true,
            userId: true,
            name: true,
            role: true
          }
        }
      }
    });

    return workOrder;
  }

  async deleteWorkOrder(id) {
    const workOrder = await prisma.workOrder.findUnique({
      where: { id: parseInt(id) }
    });

    if (!workOrder) {
      throw new Error('Work order not found');
    }

    if (workOrder.status !== 'PLANNED') {
      throw new Error('Only PLANNED work orders can be deleted');
    }

    await prisma.workOrder.delete({
      where: { id: parseInt(id) }
    });

    return { message: 'Work order deleted successfully' };
  }

  async updateStatus(id, status) {
    const workOrder = await prisma.workOrder.findUnique({
      where: { id: parseInt(id) }
    });

    if (!workOrder) {
      throw new Error('Work order not found');
    }

    const updatedWorkOrder = await prisma.workOrder.update({
      where: { id: parseInt(id) },
      data: { status },
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
        },
        assignedTo: {
          select: {
            id: true,
            userId: true,
            name: true,
            role: true
          }
        }
      }
    });

    return updatedWorkOrder;
  }

  // Comments functionality
  async addComment(workOrderId, userId, comment) {
    const workOrder = await prisma.workOrder.findUnique({
      where: { id: parseInt(workOrderId) }
    });

    if (!workOrder) {
      throw new Error('Work order not found');
    }

    const newComment = await prisma.workOrderComment.create({
      data: {
        workOrderId: parseInt(workOrderId),
        userId,
        comment
      },
      include: {
        user: {
          select: {
            id: true,
            userId: true,
            name: true
          }
        }
      }
    });

    return newComment;
  }

  async getComments(workOrderId) {
    const comments = await prisma.workOrderComment.findMany({
      where: { workOrderId: parseInt(workOrderId) },
      include: {
        user: {
          select: {
            id: true,
            userId: true,
            name: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return comments;
  }

  // Issues functionality
  async createIssue(workOrderId, userId, issueData) {
    const { issueType, description, severity } = issueData;

    const workOrder = await prisma.workOrder.findUnique({
      where: { id: parseInt(workOrderId) }
    });

    if (!workOrder) {
      throw new Error('Work order not found');
    }

    const issue = await prisma.workOrderIssue.create({
      data: {
        workOrderId: parseInt(workOrderId),
        userId,
        issueType,
        description,
        severity,
        status: 'OPEN'
      },
      include: {
        user: {
          select: {
            id: true,
            userId: true,
            name: true
          }
        }
      }
    });

    return issue;
  }

  async getIssues(workOrderId) {
    const issues = await prisma.workOrderIssue.findMany({
      where: { workOrderId: parseInt(workOrderId) },
          include: {
        user: {
          select: {
            id: true,
            userId: true,
            name: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return issues;
  }

  async updateIssueStatus(issueId, status) {
    const issue = await prisma.workOrderIssue.findUnique({
      where: { id: parseInt(issueId) }
    });

    if (!issue) {
      throw new Error('Issue not found');
    }

    const updatedIssue = await prisma.workOrderIssue.update({
      where: { id: parseInt(issueId) },
      data: { status },
      include: {
        user: {
          select: {
            id: true,
            userId: true,
            name: true
          }
        }
      }
    });

    return updatedIssue;
  }

  async resolveIssue(issueId) {
    const issue = await prisma.workOrderIssue.findUnique({
      where: { id: parseInt(issueId) }
    });

    if (!issue) {
      throw new Error('Issue not found');
    }

    const resolvedIssue = await prisma.workOrderIssue.update({
      where: { id: parseInt(issueId) },
      data: { 
        status: 'RESOLVED',
        resolvedAt: new Date()
      },
      include: {
        user: {
          select: {
            id: true,
            userId: true,
            name: true
          }
        }
      }
    });

    return resolvedIssue;
  }

  // Enhanced status updates
  async startWorkOrder(workOrderId, userId) {
    const workOrder = await prisma.workOrder.findUnique({
      where: { id: parseInt(workOrderId) }
    });

    if (!workOrder) {
      throw new Error('Work order not found');
    }

    if (workOrder.status !== 'PLANNED') {
      throw new Error('Only PLANNED work orders can be started');
    }

    const updatedWorkOrder = await prisma.workOrder.update({
      where: { id: parseInt(workOrderId) },
      data: { 
        status: 'STARTED',
        assignedToId: userId
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
        },
        assignedTo: {
          select: {
            id: true,
            userId: true,
            name: true,
            role: true
          }
        }
      }
    });

    return updatedWorkOrder;
  }

  async pauseWorkOrder(workOrderId, reason) {
    const workOrder = await prisma.workOrder.findUnique({
      where: { id: parseInt(workOrderId) }
    });

    if (!workOrder) {
      throw new Error('Work order not found');
    }

    if (workOrder.status !== 'STARTED') {
      throw new Error('Only STARTED work orders can be paused');
    }

    const updatedWorkOrder = await prisma.workOrder.update({
      where: { id: parseInt(workOrderId) },
      data: { status: 'PAUSED' },
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
        },
        assignedTo: {
          select: {
            id: true,
            userId: true,
            name: true,
            role: true
          }
        }
      }
    });

    return updatedWorkOrder;
  }

  async completeWorkOrder(workOrderId, completionData) {
    const { realDuration, notes } = completionData;

    const workOrder = await prisma.workOrder.findUnique({
      where: { id: parseInt(workOrderId) }
    });

    if (!workOrder) {
      throw new Error('Work order not found');
    }

    if (!['STARTED', 'PAUSED'].includes(workOrder.status)) {
      throw new Error('Only STARTED or PAUSED work orders can be completed');
    }

    const updatedWorkOrder = await prisma.workOrder.update({
      where: { id: parseInt(workOrderId) },
      data: { 
        status: 'COMPLETED',
        realDuration: realDuration || workOrder.expectedDuration
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
        },
        assignedTo: {
          select: {
            id: true,
            userId: true,
            name: true,
            role: true
          }
        }
      }
    });

    // Update stock when work order is completed
    await this.updateStockOnCompletion(workOrder);

    return updatedWorkOrder;
  }

  async getWorkOrderDetails(workOrderId) {
    return await this.getWorkOrderById(workOrderId);
  }

  // Helper method to update stock when work order is completed
  async updateStockOnCompletion(workOrder) {
    try {
      // Get manufacturing order details
      const manufacturingOrder = await prisma.manufacturingOrder.findUnique({
        where: { id: workOrder.moId },
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
          }
        }
      });

      if (!manufacturingOrder || !manufacturingOrder.billOfMaterial) {
        return;
      }

      // Consume raw materials (OUT transactions)
      for (const component of manufacturingOrder.billOfMaterial.components) {
        const quantityToConsume = component.quantity * manufacturingOrder.quantity;
        
        // Update product stock
        await prisma.product.update({
          where: { id: component.productId },
          data: {
            currentStock: {
              decrement: quantityToConsume
            }
          }
        });

        // Create stock ledger entry
        await prisma.stockLedger.create({
          data: {
            productId: component.productId,
            transactionType: 'OUT',
            quantity: quantityToConsume,
            unitCost: component.product.unitCost,
            totalValue: quantityToConsume * component.product.unitCost,
            reference: manufacturingOrder.moNumber
          }
        });
      }

      // Add finished product to stock (IN transaction)
      await prisma.product.update({
        where: { id: manufacturingOrder.finishedProductId },
        data: {
          currentStock: {
            increment: manufacturingOrder.quantity
          }
        }
      });

      // Create stock ledger entry for finished product
      await prisma.stockLedger.create({
        data: {
          productId: manufacturingOrder.finishedProductId,
          transactionType: 'IN',
          quantity: manufacturingOrder.quantity,
          unitCost: manufacturingOrder.finishedProduct.unitCost,
          totalValue: manufacturingOrder.quantity * manufacturingOrder.finishedProduct.unitCost,
          reference: manufacturingOrder.moNumber
        }
      });

    } catch (error) {
      console.error('Error updating stock on work order completion:', error);
    }
  }
}

module.exports = new WorkOrderService();
