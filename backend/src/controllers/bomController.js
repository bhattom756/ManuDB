const bomService = require('../services/bomService');

class BOMController {
  async createBOM(req, res, next) {
    try {
      const result = await bomService.createBOM(req.body);
      
      res.status(201).json({
        success: true,
        message: 'BOM created successfully',
        data: result
      });
    } catch (error) {
      next(error);
    }
  }

  async getBOMs(req, res, next) {
    try {
      const filters = {
        page: parseInt(req.query.page) || 1,
        limit: parseInt(req.query.limit) || 10,
        search: req.query.search,
        productId: req.query.productId,
        isActive: req.query.isActive
      };

      const result = await bomService.getBOMs(filters);
      
      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      next(error);
    }
  }

  async getBOMById(req, res, next) {
    try {
      const { id } = req.params;
      const result = await bomService.getBOMById(id);
      
      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      next(error);
    }
  }

  async updateBOM(req, res, next) {
    try {
      const { id } = req.params;
      const result = await bomService.updateBOM(id, req.body);
      
      res.json({
        success: true,
        message: 'BOM updated successfully',
        data: result
      });
    } catch (error) {
      next(error);
    }
  }

  async deleteBOM(req, res, next) {
    try {
      const { id } = req.params;
      const result = await bomService.deleteBOM(id);
      
      res.json({
        success: true,
        message: result.message,
        data: result
      });
    } catch (error) {
      next(error);
    }
  }

  async addBOMComponent(req, res, next) {
    try {
      const { bomId } = req.params;
      const result = await bomService.addBOMComponent(bomId, req.body);
      
      res.status(201).json({
        success: true,
        message: 'BOM component added successfully',
        data: result
      });
    } catch (error) {
      next(error);
    }
  }

  async updateBOMComponent(req, res, next) {
    try {
      const { componentId } = req.params;
      const result = await bomService.updateBOMComponent(componentId, req.body);
      
      res.json({
        success: true,
        message: 'BOM component updated successfully',
        data: result
      });
    } catch (error) {
      next(error);
    }
  }

  async deleteBOMComponent(req, res, next) {
    try {
      const { componentId } = req.params;
      const result = await bomService.deleteBOMComponent(componentId);
      
      res.json({
        success: true,
        message: result.message,
        data: result
      });
    } catch (error) {
      next(error);
    }
  }

  async getBOMByProductId(req, res, next) {
    try {
      const { productId } = req.params;
      const result = await bomService.getBOMByProductId(productId);
      
      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      next(error);
    }
  }

  async calculateBOMCost(req, res, next) {
    try {
      const { id } = req.params;
      const result = await bomService.calculateBOMCost(id);
      
      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new BOMController();
