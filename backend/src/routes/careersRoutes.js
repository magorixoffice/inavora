const express = require('express');
const router = express.Router();
const careersController = require('../controllers/careersController');
const { verifySuperAdmin } = require('../middleware/superAdminAuth');

/**
 * @route   POST /api/careers/apply
 * @desc    Submit job application
 * @access  Public
 */
router.post('/apply', careersController.submitApplication);

/**
 * @route   GET /api/careers/applications
 * @desc    Get all applications (Super Admin)
 * @access  Private (Super Admin)
 */
router.get('/applications', verifySuperAdmin, careersController.getApplications);

/**
 * @route   GET /api/careers/applications/:id
 * @desc    Get single application by ID
 * @access  Private (Super Admin)
 */
router.get('/applications/:id', verifySuperAdmin, careersController.getApplication);

/**
 * @route   PATCH /api/careers/applications/:id/status
 * @desc    Update application status (Super Admin)
 * @access  Private (Super Admin)
 */
router.patch('/applications/:id/status', verifySuperAdmin, careersController.updateApplicationStatus);

module.exports = router;

