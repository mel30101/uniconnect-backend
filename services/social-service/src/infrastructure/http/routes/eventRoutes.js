const express = require('express');

function createEventRoutes(controller) {
  const router = express.Router();

  router.get('/', controller.getEvents);
  router.get('/categories', controller.getCategories);
  router.post('/categories/subscribe', controller.subscribe);
  router.post('/categories/unsubscribe', controller.unsubscribe);
  router.get('/subscriptions/:userId', controller.getSubscribedCategories);

  return router;
}

module.exports = createEventRoutes;
