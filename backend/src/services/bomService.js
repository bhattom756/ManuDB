const db = require('../config/database');

class BOMService {
  async createBOM(data) {
    const { productId, reference, version = '1.0', components = [] } = data;

    // Check if product exists
    const product = await prisma.product.findUnique({
      where: { id: productId }
    });

    if (!product) {
      throw new Error('Product not found');
    }

    // Check if BOM already exists for this product
    const existingBOM = await prisma.bOM.findFirst({
      where: {
        productId,
        isActive: true
      }
    });

    if (existingBOM) {
      throw new Error('Active BOM already exists for this product');
    }

    // Create BOM with components in a transaction
    const result = await prisma.$transaction(async (tx) => {
      const bom = await tx.bOM.create({
        data: {
          productId,
          reference,
          version,
          isActive: true
        }
      });

      // Create BOM components
      if (components.length > 0) {
        const bomComponents = components.map(component => ({
          bomId: bom.id,
          productId: component.productId,
          quantity: component.quantity,
          unit: component.unit || 'PCS',
          cost: component.cost || 0,
          total: (component.quantity || 0) * (component.cost || 0)
        }));

        await tx.bOMComponent.createMany({
          data: bomComponents
        });
      }

      return bom;
    });

    return await this.getBOMById(result.id);
  }

  async getBOMs(filters = {}) {
    const {
      page = 1,
      limit = 10,
      search,
      productId,
      isActive
    } = filters;

    const skip = (page - 1) * limit;

    const where = {};

    if (search) {
      where.OR = [
        { reference: { contains: search, mode: 'insensitive' } },
        { product: { name: { contains: search, mode: 'insensitive' } } }
      ];
    }

    if (productId) {
      where.productId = parseInt(productId);
    }

    if (isActive !== undefined) {
      where.isActive = isActive === 'true';
    }

    const [boms, total] = await Promise.all([
      prisma.bOM.findMany({
        where,
        skip,
        take: limit,
        include: {
          product: true,
          components: {
            include: {
              product: true
            }
          },
          _count: {
            select: {
              manufacturingOrders: true
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.bOM.count({ where })
    ]);

    return {
      boms,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    };
  }

  async getBOMById(id) {
    const bom = await prisma.bOM.findUnique({
      where: { id: parseInt(id) },
      include: {
        product: true,
        components: {
          include: {
            product: true
          },
          orderBy: { id: 'asc' }
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

    if (!bom) {
      throw new Error('BOM not found');
    }

    return bom;
  }

  async updateBOM(id, data) {
    const { reference, version, isActive, components } = data;

    // Check if BOM exists
    const existingBOM = await prisma.bOM.findUnique({
      where: { id: parseInt(id) }
    });

    if (!existingBOM) {
      throw new Error('BOM not found');
    }

    const result = await prisma.$transaction(async (tx) => {
      // Update BOM
      const bom = await tx.bOM.update({
        where: { id: parseInt(id) },
        data: {
          reference,
          version,
          isActive
        }
      });

      // Update components if provided
      if (components) {
        // Delete existing components
        await tx.bOMComponent.deleteMany({
          where: { bomId: parseInt(id) }
        });

        // Create new components
        if (components.length > 0) {
          const bomComponents = components.map(component => ({
            bomId: parseInt(id),
            productId: component.productId,
            quantity: component.quantity,
            unit: component.unit || 'PCS',
            cost: component.cost || 0,
            total: (component.quantity || 0) * (component.cost || 0)
          }));

          await tx.bOMComponent.createMany({
            data: bomComponents
          });
        }
      }

      return bom;
    });

    return await this.getBOMById(result.id);
  }

  async deleteBOM(id) {
    // Check if BOM exists
    const bom = await prisma.bOM.findUnique({
      where: { id: parseInt(id) },
      include: {
        _count: {
          select: {
            manufacturingOrders: true
          }
        }
      }
    });

    if (!bom) {
      throw new Error('BOM not found');
    }

    // Check if BOM is being used
    if (bom._count.manufacturingOrders > 0) {
      throw new Error('Cannot delete BOM that is being used in manufacturing orders');
    }

    await prisma.$transaction(async (tx) => {
      // Delete components first
      await tx.bOMComponent.deleteMany({
        where: { bomId: parseInt(id) }
      });

      // Delete BOM
      await tx.bOM.delete({
        where: { id: parseInt(id) }
      });
    });

    return { message: 'BOM deleted successfully' };
  }

  async addBOMComponent(bomId, componentData) {
    const { productId, quantity, unit = 'PCS', cost = 0 } = componentData;

    // Check if BOM exists
    const bom = await prisma.bOM.findUnique({
      where: { id: parseInt(bomId) }
    });

    if (!bom) {
      throw new Error('BOM not found');
    }

    // Check if component already exists
    const existingComponent = await prisma.bOMComponent.findFirst({
      where: {
        bomId: parseInt(bomId),
        productId: parseInt(productId)
      }
    });

    if (existingComponent) {
      throw new Error('Component already exists in this BOM');
    }

    const component = await prisma.bOMComponent.create({
      data: {
        bomId: parseInt(bomId),
        productId: parseInt(productId),
        quantity,
        unit,
        cost,
        total: quantity * cost
      },
      include: {
        product: true
      }
    });

    return component;
  }

  async updateBOMComponent(componentId, data) {
    const { quantity, unit, cost } = data;

    const component = await prisma.bOMComponent.update({
      where: { id: parseInt(componentId) },
      data: {
        quantity,
        unit,
        cost,
        total: quantity * cost
      },
      include: {
        product: true,
        bom: {
          include: {
            product: true
          }
        }
      }
    });

    return component;
  }

  async deleteBOMComponent(componentId) {
    await prisma.bOMComponent.delete({
      where: { id: parseInt(componentId) }
    });

    return { message: 'BOM component deleted successfully' };
  }

  async getBOMByProductId(productId) {
    const bom = await prisma.bOM.findFirst({
      where: {
        productId: parseInt(productId),
        isActive: true
      },
      include: {
        product: true,
        components: {
          include: {
            product: true
          },
          orderBy: { id: 'asc' }
        }
      }
    });

    return bom;
  }

  async calculateBOMCost(bomId) {
    const bom = await this.getBOMById(bomId);

    let totalCost = 0;
    const componentCosts = bom.components.map(component => {
      const componentTotal = component.quantity * component.cost;
      totalCost += componentTotal;
      return {
        ...component,
        totalCost: componentTotal
      };
    });

    return {
      bom,
      componentCosts,
      totalCost
    };
  }
}

module.exports = new BOMService();
