//cloudinary.js
import cloudinary from '../config/cloudinary.mjs';
const uploadProfilePic = async (filePath, fileName) => {
  try {
    const result = await cloudinary.uploader.upload(filePath, {
      folder: 'profile_pictures',
      public_id: fileName,
      transformation: [{ width: 500, height: 500, crop: 'limit' }],
    });
    return result;
  } catch (error) {
    throw new Error('Error uploading profile picture');
  }
};

export default { uploadProfilePic };
