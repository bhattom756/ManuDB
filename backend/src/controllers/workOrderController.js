const workOrderService = require('../services/workOrderService');

class WorkOrderController {
  async createWorkOrder(req, res, next) {
    try {
      const result = await workOrderService.createWorkOrder(req.body);
      
      res.status(201).json({
        success: true,
        message: 'Work order created successfully',
        data: result
      });
    } catch (error) {
      next(error);
    }
  }

  async getWorkOrders(req, res, next) {
    try {
      const filters = {
        page: parseInt(req.query.page) || 1,
        limit: parseInt(req.query.limit) || 10,
        search: req.query.search,
        status: req.query.status,
        workCenterId: req.query.workCenterId,
        moId: req.query.moId,
        assignedToId: req.query.assignedToId
      };

      const result = await workOrderService.getWorkOrders(filters);
      
      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      next(error);
    }
  }

  async getWorkOrderById(req, res, next) {
    try {
      const { id } = req.params;
      const result = await workOrderService.getWorkOrderById(id);
      
      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      next(error);
    }
  }

  async updateWorkOrder(req, res, next) {
    try {
      const { id } = req.params;
      const result = await workOrderService.updateWorkOrder(id, req.body);
      
      res.json({
        success: true,
        message: 'Work order updated successfully',
        data: result
      });
    } catch (error) {
      next(error);
    }
  }

  async deleteWorkOrder(req, res, next) {
    try {
      const { id } = req.params;
      const result = await workOrderService.deleteWorkOrder(id);
      
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
      
      const result = await workOrderService.updateStatus(id, status);
      
      res.json({
        success: true,
        message: 'Status updated successfully',
        data: result
      });
    } catch (error) {
      next(error);
    }
  }

  // Comments functionality
  async addComment(req, res, next) {
    try {
      const { id } = req.params;
      const { comment } = req.body;
      const userId = req.user.id;
      
      const result = await workOrderService.addComment(id, userId, comment);
      
      res.status(201).json({
        success: true,
        message: 'Comment added successfully',
        data: result
      });
    } catch (error) {
      next(error);
    }
  }

  async getComments(req, res, next) {
    try {
      const { id } = req.params;
      const result = await workOrderService.getComments(id);
      
      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      next(error);
    }
  }

  // Issues functionality
  async createIssue(req, res, next) {
    try {
      const { id } = req.params;
      const { issueType, description, severity } = req.body;
      const userId = req.user.id;
      
      const result = await workOrderService.createIssue(id, userId, {
        issueType,
        description,
        severity
      });
      
      res.status(201).json({
        success: true,
        message: 'Issue created successfully',
        data: result
      });
    } catch (error) {
      next(error);
    }
  }

  async getIssues(req, res, next) {
    try {
      const { id } = req.params;
      const result = await workOrderService.getIssues(id);
      
      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      next(error);
    }
  }

  async updateIssueStatus(req, res, next) {
    try {
      const { id, issueId } = req.params;
      const { status } = req.body;
      
      const result = await workOrderService.updateIssueStatus(issueId, status);
      
      res.json({
        success: true,
        message: 'Issue status updated successfully',
        data: result
      });
    } catch (error) {
      next(error);
    }
  }

  async resolveIssue(req, res, next) {
    try {
      const { id, issueId } = req.params;
      
      const result = await workOrderService.resolveIssue(issueId);
      
      res.json({
        success: true,
        message: 'Issue resolved successfully',
        data: result
      });
    } catch (error) {
      next(error);
    }
  }

  // Enhanced status update with automatic stock movements
  async startWorkOrder(req, res, next) {
    try {
      const { id } = req.params;
      const result = await workOrderService.startWorkOrder(id, req.user.id);
      
      res.json({
        success: true,
        message: 'Work order started successfully',
        data: result
      });
    } catch (error) {
      next(error);
    }
  }

  async pauseWorkOrder(req, res, next) {
    try {
      const { id } = req.params;
      const { reason } = req.body;
      const result = await workOrderService.pauseWorkOrder(id, reason);
      
      res.json({
        success: true,
        message: 'Work order paused successfully',
        data: result
      });
    } catch (error) {
      next(error);
    }
  }

  async completeWorkOrder(req, res, next) {
    try {
      const { id } = req.params;
      const { realDuration, notes } = req.body;
      const result = await workOrderService.completeWorkOrder(id, {
        realDuration,
        notes
      });
      
      res.json({
        success: true,
        message: 'Work order completed successfully',
        data: result
      });
    } catch (error) {
      next(error);
    }
  }

  // Get work order with full details including comments and issues
  async getWorkOrderDetails(req, res, next) {
    try {
      const { id } = req.params;
      const result = await workOrderService.getWorkOrderDetails(id);
      
      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new WorkOrderController();