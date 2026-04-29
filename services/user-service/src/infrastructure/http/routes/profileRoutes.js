const express = require('express');

function createProfileRoutes(controller) {
  const router = express.Router();

  // Es importante poner las rutas específicas antes de las paramétricas
  router.get('/estadisticas/:studentId', controller.getDecoratedProfile);
  router.get('/:studentId', controller.getProfile);
  router.post('/', controller.upsertProfile);

  return router;
}

module.exports = createProfileRoutes;
