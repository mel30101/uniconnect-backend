const express = require('express');

function createEventRoutes(controller) {
  const router = express.Router();

  router.get('/', controller.getEvents);

  return router;
}

module.exports = createEventRoutes;
