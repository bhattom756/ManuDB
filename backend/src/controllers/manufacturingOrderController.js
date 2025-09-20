const manufacturingOrderService = require('../services/manufacturingOrderService');

class ManufacturingOrderController {
  async createManufacturingOrder(req, res, next) {
    try {
      const result = await manufacturingOrderService.createManufacturingOrder(req.body);
      
      res.status(201).json({
        success: true,
        message: 'Manufacturing order created successfully',
        data: result
      });
    } catch (error) {
      next(error);
    }
  }

  async getManufacturingOrders(req, res, next) {
    try {
      const filters = {
        page: parseInt(req.query.page) || 1,
        limit: parseInt(req.query.limit) || 10,
        search: req.query.search,
        status: req.query.status,
        assigneeId: req.query.assigneeId,
        startDate: req.query.startDate,
        endDate: req.query.endDate
      };

      const result = await manufacturingOrderService.getManufacturingOrders(filters);
      
      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      next(error);
    }
  }

  async getManufacturingOrderById(req, res, next) {
    try {
      const { id } = req.params;
      const result = await manufacturingOrderService.getManufacturingOrderById(id);
      
      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      next(error);
    }
  }

  async updateManufacturingOrder(req, res, next) {
    try {
      const { id } = req.params;
      const result = await manufacturingOrderService.updateManufacturingOrder(id, req.body);
      
      res.json({
        success: true,
        message: 'Manufacturing order updated successfully',
        data: result
      });
    } catch (error) {
      next(error);
    }
  }

  async deleteManufacturingOrder(req, res, next) {
    try {
      const { id } = req.params;
      const result = await manufacturingOrderService.deleteManufacturingOrder(id);
      
      res.json({
        success: true,
        message: result.message,
        data: result
      });
    } catch (error) {
      next(error);
    }
  }

  async updateStatus(req, res, next) {
    try {
      const { id } = req.params;
      const { status } = req.body;
      
      const result = await manufacturingOrderService.updateStatus(id, status);
      
      res.json({
        success: true,
        message: 'Status updated successfully',
        data: result
      });
    } catch (error) {
      next(error);
    }
  }

  async getDashboardSummary(req, res, next) {
    try {
      const result = await manufacturingOrderService.getDashboardSummary();
      
      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new ManufacturingOrderController();
