const authService = require('../services/authService');

class AuthController {
  async register(req, res, next) {
    try {
      const result = await authService.register(req.body);
      
      res.status(201).json({
        success: true,
        message: 'User registered successfully',
        data: result
      });
    } catch (error) {
      next(error);
    }
  }

  async login(req, res, next) {
    try {
      const result = await authService.login(req.body);
      
      res.json({
        success: true,
        message: 'Login successful',
        data: result
      });
    } catch (error) {
      next(error);
    }
  }

  async changePassword(req, res, next) {
    try {
      const { currentPassword, newPassword } = req.body;
      const userId = req.user.id;

      const result = await authService.changePassword(userId, currentPassword, newPassword);
      
      res.json({
        success: true,
        message: 'Password changed successfully',
        data: result
      });
    } catch (error) {
      next(error);
    }
  }

  async getProfile(req, res, next) {
    try {
      const user = req.user;
      
      res.json({
        success: true,
        data: user
      });
    } catch (error) {
      next(error);
    }
  }

  async updateProfile(req, res, next) {
    try {
      const userId = req.user.id;
      const result = await authService.updateProfile(userId, req.body);
      
      res.json({
        success: true,
        message: 'Profile updated successfully',
        data: result
      });
    } catch (error) {
      next(error);
    }
  }

  async logout(req, res, next) {
    try {
      // In a stateless JWT system, logout is handled client-side
      // by removing the token from storage
      res.json({
        success: true,
        message: 'Logout successful'
      });
    } catch (error) {
      next(error);
    }
  }

  async createDefaultAdmin(req, res, next) {
    try {
      const result = await authService.createDefaultAdmin();
      
      res.status(201).json({
        success: true,
        message: 'Default admin user created successfully',
        data: result
      });
    } catch (error) {
      next(error);
    }
  }

  async forgotPassword(req, res, next) {
    try {
      const { email } = req.body;
      
      await authService.forgotPassword(email);
      
      res.json({
        success: true,
        message: 'Password reset email sent successfully'
      });
    } catch (error) {
      next(error);
    }
  }

  async resetPassword(req, res, next) {
    try {
      const { token, password } = req.body;
      
      await authService.resetPassword(token, password);
      
      res.json({
        success: true,
        message: 'Password reset successfully'
      });
    } catch (error) {
      next(error);
    }
  }

  async getAllUsers(req, res, next) {
    try {
      const users = await authService.getAllUsers();
      
      res.json({
        success: true,
        data: users
      });
    } catch (error) {
      next(error);
    }
  }

  async updateUserRole(req, res, next) {
    try {
      const { userId } = req.params;
      const { role } = req.body;
      
      const user = await authService.updateUserRole(parseInt(userId), role);
      
      res.json({
        success: true,
        message: 'User role updated successfully',
        data: user
      });
    } catch (error) {
      next(error);
    }
  }

  async deactivateUser(req, res, next) {
    try {
      const { userId } = req.params;
      
      const user = await authService.deactivateUser(parseInt(userId));
      
      res.json({
        success: true,
        message: 'User deactivated successfully',
        data: user
      });
    } catch (error) {
      next(error);
    }
  }

  async activateUser(req, res, next) {
    try {
      const { userId } = req.params;
      
      const user = await authService.activateUser(parseInt(userId));
      
      res.json({
        success: true,
        message: 'User activated successfully',
        data: user
      });
    } catch (error) {
      next(error);
    }
  }

  async getUserById(req, res, next) {
    try {
      const { userId } = req.params;
      
      const user = await authService.getUserById(parseInt(userId));
      
      res.json({
        success: true,
        data: user
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new AuthController();
