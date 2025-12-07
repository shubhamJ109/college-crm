const cloudinary = require('cloudinary').v2;

// CLOUDINARY_URL is supported: cloudinary://API_KEY:API_SECRET@CLOUD_NAME
// Or use separate vars: CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET
if (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true
  });
} else {
  // Fall back to CLOUDINARY_URL (cloudinary://KEY:SECRET@CLOUD_NAME)
  cloudinary.config({ secure: true });
}

module.exports = cloudinary;
