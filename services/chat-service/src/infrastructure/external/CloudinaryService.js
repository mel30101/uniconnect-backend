const cloudinary = require('cloudinary').v2;
const streamifier = require('streamifier');

class CloudinaryService {
  constructor(config) {
    cloudinary.config({
      cloud_name: config.cloudName,
      api_key: config.apiKey,
      api_secret: config.apiSecret
    });
  }

  async uploadFile(file) {
    return new Promise((resolve, reject) => {
      const extension = file.originalname.includes('.')
        ? file.originalname.split('.').pop().toLowerCase()
        : '';
      const isRaw = ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'txt', 'csv', 'zip', 'rar'].includes(extension);
      
      const safeName = file.originalname
        .replace(/\.[^/.]+$/, "")
        .replace(/[^a-zA-Z0-9]/g, "_");
      
      const uploadOptions = {
        folder: 'uniconnect_chats',
        resource_type: isRaw ? 'raw' : 'auto',
        public_id: `archivo_${Date.now()}_${safeName}${isRaw && extension ? '.' + extension : ''}`
      };

      if (!isRaw && extension) {
        uploadOptions.format = extension;
      }

      const uploadStream = cloudinary.uploader.upload_stream(
        uploadOptions,
        (error, result) => {
          if (error) {
            console.error('Error en Cloudinary:', error);
            reject(new Error('Error al subir a Cloudinary'));
          } else {
            resolve({
              fileName: file.originalname,
              fileUrl: result.secure_url
            });
          }
        }
      );

      streamifier.createReadStream(file.buffer).pipe(uploadStream);
    });
  }
}

module.exports = CloudinaryService;
