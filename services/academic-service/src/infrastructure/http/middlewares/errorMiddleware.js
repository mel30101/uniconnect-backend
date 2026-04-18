const logger = require('../../../config/logger');

// Captura errores de funciones async automáticamente
exports.asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// Manejador central de errores
exports.globalErrorHandler = (err, req, res, next) => {
  const errorMap = {
    // 400 Bad Request
    'GROUP_NAME_ALREADY_EXISTS': 400,
    'MISSING_FIELDS': 400,
    'NAME_TOO_SHORT': 400,
    'ALREADY_MEMBER': 400,
    'REQUEST_ALREADY_EXISTS': 400,
    'CANNOT_REMOVE_SELF': 400,
    'NEW_ADMIN_NOT_FOUND': 400,
    
    // 403 Forbidden
    'NOT_AUTHORIZED': 403,

    // 404 Not Found
    'PROFILE_NOT_FOUND': 404,
    'GROUP_NOT_FOUND': 404,
    'MEMBER_NOT_FOUND': 404,
    'NOT_A_MEMBER': 404,
    'STRUCTURE_NOT_FOUND': 404,
  };

  // Asignar el código de estado correspondiente o 500 por defecto
  const status = errorMap[err.message] || 500;
  
  // Utilizar el LoggerSingleton para reportar sin tomar decisiones de flujo
  if (status === 500) {
    logger.critical(err.message || 'Error Interno del Servidor', err);
  } else {
    logger.warning(`Error esperado manejado: ${err.message}`);
  }

  // Responder al cliente adecuadamente
  res.status(status).json({
    error: true,
    message: err.message || "Internal Server Error"
  });
};
