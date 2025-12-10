const express = require('express');
const router = express.Router();
const institutionAdminController = require('../controllers/institutionAdminController');
const { verifyInstitutionAdmin } = require('../middleware/institutionAdminAuth');

/**
 * @route   POST /api/institution-admin/check
 * @desc    Check if email belongs to an institution admin
 * @access  Public
 */
router.post('/check', institutionAdminController.checkInstitutionAdmin);

/**
 * @route   POST /api/institution-admin/login
 * @desc    Login as Institution Admin
 * @access  Public
 */
router.post('/login', institutionAdminController.loginInstitutionAdmin);

/**
 * @route   GET /api/institution-admin/verify
 * @desc    Verify Institution Admin token
 * @access  Private (Institution Admin)
 */
router.get('/verify', verifyInstitutionAdmin, institutionAdminController.verifyToken);

/**
 * @route   GET /api/institution-admin/stats
 * @desc    Get dashboard statistics
 * @access  Private (Institution Admin)
 */
router.get('/stats', verifyInstitutionAdmin, institutionAdminController.getDashboardStats);

/**
 * @route   GET /api/institution-admin/users
 * @desc    Get all institution users
 * @access  Private (Institution Admin)
 */
router.get('/users', verifyInstitutionAdmin, institutionAdminController.getInstitutionUsers);

/**
 * @route   POST /api/institution-admin/users
 * @desc    Add user to institution
 * @access  Private (Institution Admin)
 */
router.post('/users', verifyInstitutionAdmin, institutionAdminController.addInstitutionUser);

/**
 * @route   DELETE /api/institution-admin/users/:userId
 * @desc    Remove user from institution
 * @access  Private (Institution Admin)
 */
router.delete('/users/:userId', verifyInstitutionAdmin, institutionAdminController.removeInstitutionUser);

/**
 * @route   GET /api/institution-admin/presentations
 * @desc    Get all presentations by institution users
 * @access  Private (Institution Admin)
 */
router.get('/presentations', verifyInstitutionAdmin, institutionAdminController.getInstitutionPresentations);

/**
 * @route   GET /api/institution-admin/analytics
 * @desc    Get analytics data
 * @access  Private (Institution Admin)
 */
router.get('/analytics', verifyInstitutionAdmin, institutionAdminController.getAnalytics);

/**
 * @route   PUT /api/institution-admin/branding
 * @desc    Update institution branding
 * @access  Private (Institution Admin)
 */
router.put('/branding', verifyInstitutionAdmin, institutionAdminController.updateBranding);

/**
 * @route   PUT /api/institution-admin/settings
 * @desc    Update institution settings
 * @access  Private (Institution Admin)
 */
router.put('/settings', verifyInstitutionAdmin, institutionAdminController.updateSettings);

/**
 * @route   GET /api/institution-admin/export
 * @desc    Export data
 * @access  Private (Institution Admin)
 */
router.get('/export', verifyInstitutionAdmin, institutionAdminController.exportData);

module.exports = router;

