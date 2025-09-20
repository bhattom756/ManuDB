const workCenterService = require('../services/workCenterService');

class WorkCenterController {
  async createWorkCenter(req, res, next) {
    try {
      const result = await workCenterService.createWorkCenter(req.body);
      
      res.status(201).json({
        success: true,
        message: 'Work center created successfully',
        data: result
      });
    } catch (error) {
      next(error);
    }
  }

  async getWorkCenters(req, res, next) {
    try {
      const filters = {
        page: parseInt(req.query.page) || 1,
        limit: parseInt(req.query.limit) || 10,
        search: req.query.search,
        status: req.query.status,
        sortBy: req.query.sortBy || 'name',
        sortOrder: req.query.sortOrder || 'asc'
      };

      const result = await workCenterService.getWorkCenters(filters);
      
      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      next(error);
    }
  }

  async getWorkCenterById(req, res, next) {
    try {
      const { id } = req.params;
      const result = await workCenterService.getWorkCenterById(id);
      
      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      next(error);
    }
  }

  async updateWorkCenter(req, res, next) {
    try {
      const { id } = req.params;
      const result = await workCenterService.updateWorkCenter(id, req.body);
      
      res.json({
        success: true,
        message: 'Work center updated successfully',
        data: result
      });
    } catch (error) {
      next(error);
    }
  }

  async deleteWorkCenter(req, res, next) {
    try {
      const { id } = req.params;
      const result = await workCenterService.deleteWorkCenter(id);
      
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
      
      const result = await workCenterService.updateStatus(id, status);
      
      res.json({
        success: true,
        message: 'Status updated successfully',
        data: result
      });
    } catch (error) {
      next(error);
    }
  }

  async getWorkCenterUtilization(req, res, next) {
    try {
      const { id } = req.params;
      const { startDate, endDate } = req.query;
      
      const result = await workCenterService.getWorkCenterUtilization(id, startDate, endDate);
      
      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      next(error);
    }
  }

  async getWorkCenterStatuses(req, res, next) {
    try {
      const result = await workCenterService.getWorkCenterStatuses();
      
      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      next(error);
    }
  }

  async getWorkCenterStats(req, res, next) {
    try {
      const result = await workCenterService.getWorkCenterStats();
      
      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new WorkCenterController();
