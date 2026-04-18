const express = require('express');

function createSearchRoutes(controller) {
  const router = express.Router();

  router.get('/', controller.searchStudents);

  return router;
}

module.exports = createSearchRoutes;
