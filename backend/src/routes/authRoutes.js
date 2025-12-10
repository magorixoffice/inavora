const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { verifyToken } = require('../middleware/auth');

/**
 * @route   POST /api/auth/firebase
 * @desc    Authenticate with Firebase token and get JWT
 * @access  Public
 */
router.post('/firebase', authController.authenticateWithFirebase);

/**
 * @route   GET /api/auth/me
 * @desc    Get current user info
 * @access  Private (requires JWT)
 */
router.get('/me', verifyToken, authController.getCurrentUser);

/**
 * @route   POST /api/auth/refresh
 * @desc    Refresh JWT token
 * @access  Private (requires JWT)
 */
router.post('/refresh', verifyToken, authController.refreshToken);

module.exports = router;
