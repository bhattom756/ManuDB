const prisma = require('../config/database');

class ComponentAvailabilityService {
  // Update component availability based on stock movements
  async updateAvailability(productId, transactionType, quantity) {
    try {
      const existing = await prisma.componentAvailability.findUnique({
        where: { productId }
      });

      if (!existing) {
        // Create new availability record
        return await prisma.componentAvailability.create({
          data: {
            productId,
            available: transactionType === 'IN' ? quantity : 0,
            reserved: 0,
            incoming: transactionType === 'IN' ? quantity : 0,
            outgoing: transactionType === 'OUT' ? quantity : 0
          }
        });
      }

      // Update existing record
      const updates = {};
      
      if (transactionType === 'IN') {
        updates.available = existing.available + quantity;
        updates.incoming = existing.incoming + quantity;
      } else if (transactionType === 'OUT') {
        updates.available = Math.max(0, existing.available - quantity);
        updates.outgoing = existing.outgoing + quantity;
      }

      return await prisma.componentAvailability.update({
        where: { productId },
        data: {
          ...updates,
          lastUpdated: new Date()
        }
      });
    } catch (error) {
      throw new Error(`Failed to update component availability: ${error.message}`);
    }
  }

  // Reserve components for manufacturing order
  async reserveComponents(manufacturingOrderId, bomId) {
    try {
      const bom = await prisma.bOM.findUnique({
        where: { id: bomId },
        include: {
          components: {
            include: {
              product: true
            }
          }
        }
      });

      if (!bom) {
        throw new Error('BOM not found');
      }

      const reservations = [];
      
      for (const component of bom.components) {
        const availability = await prisma.componentAvailability.findUnique({
          where: { productId: component.productId }
        });

        if (!availability || availability.available < component.quantity) {
          throw new Error(`Insufficient stock for component: ${component.product.name}`);
        }

        // Update availability
        const updated = await prisma.componentAvailability.update({
          where: { productId: component.productId },
          data: {
            available: availability.available - component.quantity,
            reserved: availability.reserved + component.quantity,
            lastUpdated: new Date()
          }
        });

        reservations.push({
          productId: component.productId,
          productName: component.product.name,
          required: component.quantity,
          available: updated.available,
          reserved: updated.reserved
        });
      }

      return reservations;
    } catch (error) {
      throw new Error(`Failed to reserve components: ${error.message}`);
    }
  }

  // Release reserved components
  async releaseComponents(manufacturingOrderId) {
    try {
      // This would be called when a manufacturing order is cancelled
      // Implementation depends on how you want to track reservations
      return { message: 'Components released successfully' };
    } catch (error) {
      throw new Error(`Failed to release components: ${error.message}`);
    }
  }

  // Get component availability for all products
  async getAllAvailability(filters = {}) {
    try {
      const { search, type, lowStock } = filters;
      
      const where = {};
      
      if (search) {
        where.product = {
          name: { contains: search, mode: 'insensitive' }
        };
      }
      
      if (type) {
        where.product = {
          ...where.product,
          type: type
        };
      }

      const availability = await prisma.componentAvailability.findMany({
        where,
        include: {
          product: {
            select: {
              id: true,
              name: true,
              type: true,
              unitOfMeasure: true,
              unitCost: true
            }
          }
        },
        orderBy: {
          lastUpdated: 'desc'
        }
      });

      // Filter low stock if requested
      if (lowStock) {
        return availability.filter(item => item.available <= 10); // Threshold for low stock
      }

      return availability;
    } catch (error) {
      throw new Error(`Failed to get component availability: ${error.message}`);
    }
  }

  // Get availability for specific product
  async getProductAvailability(productId) {
    try {
      const availability = await prisma.componentAvailability.findUnique({
        where: { productId },
        include: {
          product: {
            select: {
              id: true,
              name: true,
              type: true,
              unitOfMeasure: true,
              unitCost: true
            }
          }
        }
      });

      if (!availability) {
        return {
          productId,
          available: 0,
          reserved: 0,
          incoming: 0,
          outgoing: 0,
          lastUpdated: null
        };
      }

      return availability;
    } catch (error) {
      throw new Error(`Failed to get product availability: ${error.message}`);
    }
  }

  // Check if components are available for manufacturing order
  async checkAvailability(bomId, quantity = 1) {
    try {
      const bom = await prisma.bOM.findUnique({
        where: { id: bomId },
        include: {
          components: {
            include: {
              product: true
            }
          }
        }
      });

      if (!bom) {
        throw new Error('BOM not found');
      }

      const availability = [];
      let allAvailable = true;

      for (const component of bom.components) {
        const productAvailability = await this.getProductAvailability(component.productId);
        const required = component.quantity * quantity;
        const available = productAvailability.available || 0;

        availability.push({
          productId: component.productId,
          productName: component.product.name,
          required,
          available,
          sufficient: available >= required,
          shortfall: Math.max(0, required - available)
        });

        if (available < required) {
          allAvailable = false;
        }
      }

      return {
        allAvailable,
        availability,
        canProduce: allAvailable
      };
    } catch (error) {
      throw new Error(`Failed to check availability: ${error.message}`);
    }
  }

  // Get low stock alerts
  async getLowStockAlerts(threshold = 10) {
    try {
      const lowStock = await prisma.componentAvailability.findMany({
        where: {
          available: {
            lte: threshold
          }
        },
        include: {
          product: {
            select: {
              id: true,
              name: true,
              type: true,
              unitOfMeasure: true,
              unitCost: true
            }
          }
        },
        orderBy: {
          available: 'asc'
        }
      });

      return lowStock.map(item => ({
        productId: item.productId,
        productName: item.product.name,
        currentStock: item.available,
        threshold,
        urgency: item.available === 0 ? 'CRITICAL' : 
                item.available <= threshold / 2 ? 'HIGH' : 'MEDIUM'
      }));
    } catch (error) {
      throw new Error(`Failed to get low stock alerts: ${error.message}`);
    }
  }

  // Update availability when work order is completed
  async handleWorkOrderCompletion(workOrderId) {
    try {
      const workOrder = await prisma.workOrder.findUnique({
        where: { id: workOrderId },
        include: {
          manufacturingOrder: {
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
          }
        }
      });

      if (!workOrder || workOrder.status !== 'COMPLETED') {
        return { message: 'Work order not completed' };
      }

      const mo = workOrder.manufacturingOrder;
      const bom = mo.billOfMaterial;

      if (!bom) {
        return { message: 'No BOM associated with manufacturing order' };
      }

      // Consume raw materials (OUT transactions)
      for (const component of bom.components) {
        await this.updateAvailability(
          component.productId,
          'OUT',
          component.quantity * mo.quantity
        );
      }

      // Add finished product to stock (IN transaction)
      await this.updateAvailability(
        mo.finishedProductId,
        'IN',
        mo.quantity
      );

      return { message: 'Stock movements processed successfully' };
    } catch (error) {
      throw new Error(`Failed to handle work order completion: ${error.message}`);
    }
  }

  // Get stock movement history for a product
  async getStockMovementHistory(productId, startDate, endDate) {
    try {
      const where = {
        productId
      };

      if (startDate && endDate) {
        where.transactionDate = {
          gte: new Date(startDate),
          lte: new Date(endDate)
        };
      }

      const movements = await prisma.stockLedger.findMany({
        where,
        orderBy: {
          transactionDate: 'desc'
        },
        include: {
          product: {
            select: {
              name: true,
              unitOfMeasure: true
            }
          }
        }
      });

      return movements;
    } catch (error) {
      throw new Error(`Failed to get stock movement history: ${error.message}`);
    }
  }
}

module.exports = new ComponentAvailabilityService();
