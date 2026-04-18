const multer = require("multer");

const storage = multer.memoryStorage();

const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }
});

// Middleware para manejar errores de tamaño de archivo
const handleUploadError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({
        success: false,
        message: "El archivo es demasiado grande. El tamaño máximo permitido es de 10 MB."
      });
    }
  }
  next(err);
};

module.exports = { upload, handleUploadError };
