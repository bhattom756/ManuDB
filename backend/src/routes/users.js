const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticateToken } = require('../middleware/auth');
const {
  validateUserUpdate
} = require('../middleware/validation');

// Protected routes
router.get('/me', authenticateToken, authController.getProfile);
router.put('/me', authenticateToken, validateUserUpdate, authController.updateProfile);
router.post('/me/change-password', authenticateToken, authController.changePassword);

// Admin routes
router.get('/', authenticateToken, authController.getAllUsers);
router.get('/:userId', authenticateToken, authController.getUserById);
router.put('/:userId/role', authenticateToken, authController.updateUserRole);
router.put('/:userId/deactivate', authenticateToken, authController.deactivateUser);
router.put('/:userId/activate', authenticateToken, authController.activateUser);

module.exports = router;
