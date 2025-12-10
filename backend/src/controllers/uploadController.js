const cloudinaryService = require('../services/cloudinaryService');
const Image = require('../models/Image');

/**
 * Upload image to Cloudinary
 */
const uploadImage = async (req, res) => {
  try {
    const { image } = req.body;
    const userId = req.userId;

    if (!image) {
      return res.status(400).json({ 
        success: false,
        error: 'Image data is required' 
      });
    }

    // Validate base64 format
    if (!image.startsWith('data:image/')) {
      return res.status(400).json({ 
        success: false,
        error: 'Invalid image format. Must be base64 encoded image.' 
      });
    }

    // Check approximate size (base64 is ~33% larger than original)
    const sizeInBytes = (image.length * 3) / 4;
    const sizeInMB = sizeInBytes / (1024 * 1024);
    
    if (sizeInMB > 10) {
      return res.status(400).json({ 
        success: false,
        error: `Image too large (${sizeInMB.toFixed(1)}MB). Maximum size is 10MB.` 
      });
    }

    // Upload to Cloudinary
    const result = await cloudinaryService.uploadImage(image);

    // Save image record with user ownership
    const imageRecord = new Image({
      userId,
      imageUrl: result.url,
      publicId: result.publicId
    });
    await imageRecord.save();

    res.status(200).json({
      success: true,
      message: 'Image uploaded successfully',
      data: {
        imageUrl: result.url,
        publicId: result.publicId
      }
    });
  } catch (error) {
    console.error('Upload image error:', error);
    
    // Provide specific error messages
    let errorMessage = 'Failed to upload image';
    
    if (error.message.includes('File size too large')) {
      errorMessage = 'Image file is too large. Please use an image under 5MB.';
    } else if (error.message.includes('Invalid image')) {
      errorMessage = 'Invalid image file. Please use PNG, JPG, or GIF format.';
    } else if (error.message.includes('Cloudinary')) {
      errorMessage = 'Image upload service error. Please try again.';
    } else if (error.message) {
      errorMessage = error.message;
    }
    
    res.status(500).json({ 
      success: false,
      error: errorMessage
    });
  }
};

/**
 * Delete image from Cloudinary
 */
const deleteImage = async (req, res) => {
  try {
    const { publicId } = req.body;
    const userId = req.userId;

    if (!publicId) {
      return res.status(400).json({ 
        success: false,
        error: 'Public ID is required' 
      });
    }

    // Check if image exists and belongs to user
    const imageRecord = await Image.findOne({ publicId });

    if (!imageRecord) {
      return res.status(404).json({ 
        success: false,
        error: 'Image not found' 
      });
    }

    // Verify ownership
    if (imageRecord.userId !== userId.toString()) {
      return res.status(403).json({ 
        success: false,
        error: 'You do not have permission to delete this image' 
      });
    }

    // Delete from Cloudinary
    await cloudinaryService.deleteImage(publicId);

    // Delete from database
    await Image.deleteOne({ publicId });

    res.status(200).json({
      success: true,
      message: 'Image deleted successfully'
    });
  } catch (error) {
    console.error('Delete image error:', error);
    res.status(500).json({ 
      success: false,
      error: error.message || 'Failed to delete image' 
    });
  }
};

/**
 * Get user's uploaded images
 */
const getUserImages = async (req, res) => {
  try {
    const userId = req.userId;

    // Get images uploaded by this user
    const images = await Image.find({ userId })
      .sort({ uploadedAt: -1 })
      .select('imageUrl publicId uploadedAt');

    res.status(200).json({
      success: true,
      data: images
    });
  } catch (error) {
    console.error('Get user images error:', error);
    res.status(500).json({ 
      success: false,
      error: error.message || 'Failed to fetch images' 
    });
  }
};

module.exports = {
  uploadImage,
  deleteImage,
  getUserImages
};
