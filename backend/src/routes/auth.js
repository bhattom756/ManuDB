const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticateToken } = require('../middleware/auth');
const {
  validateUserRegistration,
  validateUserLogin,
  validateUserUpdate
} = require('../middleware/validation');

// Public routes
router.post('/register', validateUserRegistration, authController.register);
router.post('/login', validateUserLogin, authController.login);
router.post('/create-default-admin', authController.createDefaultAdmin);

// Protected routes
router.get('/profile', authenticateToken, authController.getProfile);
router.put('/profile', authenticateToken, validateUserUpdate, authController.updateProfile);
router.post('/change-password', authenticateToken, authController.changePassword);
router.post('/logout', authenticateToken, authController.logout);

// Admin routes
router.get('/users', authenticateToken, authController.getAllUsers);
router.put('/users/:userId/role', authenticateToken, authController.updateUserRole);
router.put('/users/:userId/deactivate', authenticateToken, authController.deactivateUser);

module.exports = router;
