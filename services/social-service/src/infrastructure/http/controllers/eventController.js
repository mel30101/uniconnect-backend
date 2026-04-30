const { asyncHandler } = require('../middlewares/errorMiddleware');

class EventController {
  constructor(useCases) {
    this.getEventsUC = useCases.getEvents;
    this.getCategoriesUC = useCases.getCategories;
    this.subscribeToCategoryUC = useCases.subscribeToCategory;
    this.unsubscribeFromCategoryUC = useCases.unsubscribeFromCategory;
    this.getSubscribedCategoriesUC = useCases.getSubscribedCategories;
    this.createEventUC = useCases.createEvent;
  }

  createEvent = asyncHandler(async (req, res) => {
    const eventData = req.body;
    if (!eventData.title || !eventData.type) {
      return res.status(400).json({ error: 'Faltan parámetros obligatorios (title, type)' });
    }
    const event = await this.createEventUC.execute(eventData);
    res.status(201).json(event);
  });

  getEvents = asyncHandler(async (req, res) => {
    const categoryId = req.query.category || req.query.categoryId;
    const events = await this.getEventsUC.execute({ categoryId });
    res.status(200).json(events);
  });

  getCategories = asyncHandler(async (req, res) => {
    const categories = await this.getCategoriesUC.execute();
    res.status(200).json(categories);
  });

  /**
   * POST /eventos/suscribir
   * Body: { userId, categoryId }
   * 201 → suscripción creada
   * 409 → ya estaba suscrito
   */
  subscribe = asyncHandler(async (req, res) => {
    const { userId, categoryId } = req.body;
    if (!userId || !categoryId) {
      return res.status(400).json({ error: 'Faltan parámetros (userId, categoryId)' });
    }

    try {
      await this.subscribeToCategoryUC.execute(userId, categoryId);
      return res.status(201).json({ message: 'Suscripción creada exitosamente' });
    } catch (err) {
      if (err.code === 'ALREADY_SUBSCRIBED') {
        return res.status(409).json({ error: 'El estudiante ya está suscrito a esta categoría' });
      }
      throw err; // propaga al error middleware
    }
  });

  /**
   * DELETE /eventos/suscribir
   * Body: { userId, categoryId }
   * 204 → eliminado (sin cuerpo)
   */
  unsubscribe = asyncHandler(async (req, res) => {
    const { userId, categoryId } = req.query;
    if (!userId || !categoryId) {
      return res.status(400).json({ error: 'Faltan parámetros (userId, categoryId)' });
    }
    await this.unsubscribeFromCategoryUC.execute(userId, categoryId);
    return res.status(204).send();
  });

  /**
   * GET /eventos/suscripciones/:userId
   * 200 → lista de categoryIds suscritas
   */
  getSubscribedCategories = asyncHandler(async (req, res) => {
    const { userId } = req.params;
    if (!userId) {
      return res.status(400).json({ error: 'Falta userId' });
    }
    const subscriptions = await this.getSubscribedCategoriesUC.execute(userId);
    return res.status(200).json(subscriptions);
  });
}

module.exports = EventController;
