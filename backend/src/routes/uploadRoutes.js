const express = require('express');
const router = express.Router();
const uploadController = require('../controllers/uploadController');
const { verifyToken } = require('../middleware/auth');

// All routes require authentication
router.use(verifyToken);

/**
 * @route   POST /api/upload/image
 * @desc    Upload image to Cloudinary
 * @access  Private
 */
router.post('/image', uploadController.uploadImage);

/**
 * @route   DELETE /api/upload/image
 * @desc    Delete image from Cloudinary
 * @access  Private
 */
router.delete('/image', uploadController.deleteImage);

/**
 * @route   GET /api/upload/images
 * @desc    Get user's uploaded images
 * @access  Private
 */
router.get('/images', uploadController.getUserImages);

module.exports = router;
