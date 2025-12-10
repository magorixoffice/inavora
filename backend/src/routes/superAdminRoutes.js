const express = require('express');
const router = express.Router();
const superAdminController = require('../controllers/superAdminController');
const { verifySuperAdmin } = require('../middleware/superAdminAuth');

/**
 * @route   POST /api/super-admin/login
 * @desc    Login as Super Admin
 * @access  Public
 */
router.post('/login', superAdminController.loginSuperAdmin);

/**
 * @route   GET /api/super-admin/verify
 * @desc    Verify Super Admin token
 * @access  Private (Super Admin)
 */
router.get('/verify', verifySuperAdmin, superAdminController.verifyToken);

module.exports = router;

