const cloudinary = require('cloudinary').v2;

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

/**
 * Upload image to Cloudinary
 * @param {string} base64Image - Base64 encoded image string
 * @param {string} folder - Cloudinary folder name (default: 'inavora/pin-images')
 * @returns {Promise<{url: string, publicId: string}>}
 */
async function uploadImage(base64Image, folder = 'inavora/pin-images') {
  try {
    const result = await cloudinary.uploader.upload(base64Image, {
      folder: folder,
      resource_type: 'image',
      transformation: [
        { width: 1200, height: 1200, crop: 'limit' }, // Limit max dimensions
        { quality: 'auto:good' }, // Auto optimize quality
        { fetch_format: 'auto' } // Auto format (WebP when supported)
      ]
    });

    return {
      url: result.secure_url,
      publicId: result.public_id
    };
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    throw new Error('Failed to upload image to Cloudinary');
  }
}

/**
 * Delete image from Cloudinary
 * @param {string} publicId - Cloudinary public ID
 * @returns {Promise<void>}
 */
async function deleteImage(publicId) {
  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    console.error('Cloudinary delete error:', error);
    throw new Error('Failed to delete image from Cloudinary');
  }
}

/**
 * Upload document (PDF, DOC, etc.) to Cloudinary
 * @param {string} base64Document - Base64 encoded document string
 * @param {string} folder - Cloudinary folder name (default: 'inavora/documents')
 * @returns {Promise<{url: string, publicId: string}>}
 */
async function uploadDocument(base64Document, folder = 'inavora/documents') {
  try {
    const result = await cloudinary.uploader.upload(base64Document, {
      folder: folder,
      resource_type: 'raw', // For PDFs and other documents
      allowed_formats: ['pdf', 'doc', 'docx']
    });

    return {
      url: result.secure_url,
      publicId: result.public_id
    };
  } catch (error) {
    console.error('Cloudinary document upload error:', error);
    throw new Error('Failed to upload document to Cloudinary');
  }
}

module.exports = {
  uploadImage,
  deleteImage,
  uploadDocument
};
