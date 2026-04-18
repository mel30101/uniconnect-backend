const express = require('express');

function createProfileRoutes(controller) {
  const router = express.Router();

  router.get('/:studentId', controller.getProfile);
  router.post('/', controller.upsertProfile);

  return router;
}

module.exports = createProfileRoutes;
