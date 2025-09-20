const stockLedgerService = require('../services/stockLedgerService');

class StockLedgerController {
  async createStockTransaction(req, res, next) {
    try {
      const result = await stockLedgerService.createStockTransaction(req.body);
      
      res.status(201).json({
        success: true,
        message: 'Stock transaction created successfully',
        data: result
      });
    } catch (error) {
      next(error);
    }
  }

  async getStockLedger(req, res, next) {
    try {
      const filters = {
        page: parseInt(req.query.page) || 1,
        limit: parseInt(req.query.limit) || 10,
        search: req.query.search,
        productId: req.query.productId,
        transactionType: req.query.transactionType,
        startDate: req.query.startDate,
        endDate: req.query.endDate,
        reference: req.query.reference
      };

      const result = await stockLedgerService.getStockLedger(filters);
      
      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      next(error);
    }
  }

  async getStockLedgerById(req, res, next) {
    try {
      const { id } = req.params;
      const result = await stockLedgerService.getStockLedgerById(id);
      
      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      next(error);
    }
  }

  async updateStockTransaction(req, res, next) {
    try {
      const { id } = req.params;
      const result = await stockLedgerService.updateStockTransaction(id, req.body);
      
      res.json({
        success: true,
        message: 'Stock transaction updated successfully',
        data: result
      });
    } catch (error) {
      next(error);
    }
  }

  async deleteStockTransaction(req, res, next) {
    try {
      const { id } = req.params;
      const result = await stockLedgerService.deleteStockTransaction(id);
      
      res.json({
        success: true,
        message: result.message,
        data: result
      });
    } catch (error) {
      next(error);
    }
  }

  async getProductStock(req, res, next) {
    try {
      const { id } = req.params;
      const result = await stockLedgerService.getProductStock(id);
      
      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      next(error);
    }
  }

  async getAllProductStocks(req, res, next) {
    try {
      const filters = {
        search: req.query.search,
        type: req.query.type
      };

      const result = await stockLedgerService.getAllProductStocks(filters);
      
      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      next(error);
    }
  }

  async adjustStock(req, res, next) {
    try {
      const { id } = req.params;
      const { quantity, reason } = req.body;
      
      const result = await stockLedgerService.adjustStock(id, quantity, reason);
      
      res.json({
        success: true,
        message: 'Stock adjusted successfully',
        data: result
      });
    } catch (error) {
      next(error);
    }
  }

  async getStockMovements(req, res, next) {
    try {
      const { id } = req.params;
      const { startDate, endDate } = req.query;
      
      const result = await stockLedgerService.getStockMovements(id, startDate, endDate);
      
      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      next(error);
    }
  }

  async getStockSummary(req, res, next) {
    try {
      const result = await stockLedgerService.getStockSummary();
      
      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      next(error);
    }
  }

  async getTransactionTypes(req, res, next) {
    try {
      const result = await stockLedgerService.getTransactionTypes();
      
      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new StockLedgerController();
