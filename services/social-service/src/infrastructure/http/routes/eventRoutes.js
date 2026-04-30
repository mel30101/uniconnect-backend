const express = require('express');

function createEventRoutes(controller) {
  const router = express.Router();

  // Consulta y creación de eventos
  router.get('/', controller.getEvents);
  router.post('/', controller.createEvent);
  router.get('/categories', controller.getCategories);

  // Gestión de suscripciones a categorías
  // POST   /eventos/suscribir        → suscribirse a una categoría
  // DELETE /eventos/suscribir        → desuscribirse de una categoría
  // GET    /eventos/suscripciones/:userId → obtener las categorías suscritas
  router.post('/suscribir', controller.subscribe);
  router.delete('/suscribir', controller.unsubscribe);
  router.get('/suscripciones/:userId', controller.getSubscribedCategories);

  return router;
}

module.exports = createEventRoutes;
