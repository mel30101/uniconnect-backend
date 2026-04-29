const { asyncHandler } = require('../middlewares/errorMiddleware');

class EventController {
  constructor(useCases) {
    this.getEventsUC = useCases.getEvents;
    this.getCategoriesUC = useCases.getCategories;
    this.subscribeToCategoryUC = useCases.subscribeToCategory;
    this.unsubscribeFromCategoryUC = useCases.unsubscribeFromCategory;
    this.getSubscribedCategoriesUC = useCases.getSubscribedCategories;
  }

  getEvents = asyncHandler(async (req, res) => {
    const categoryId = req.query.category || req.query.categoryId;
    const events = await this.getEventsUC.execute({ categoryId });
    res.status(200).json(events);
  });

  getCategories = asyncHandler(async (req, res) => {
    const categories = await this.getCategoriesUC.execute();
    res.status(200).json(categories);
  });

  subscribe = asyncHandler(async (req, res) => {
    const { userId, categoryId } = req.body;
    if (!userId || !categoryId) {
      return res.status(400).json({ error: 'Faltan parámetros (userId, categoryId)' });
    }
    await this.subscribeToCategoryUC.execute(userId, categoryId);
    res.status(200).json({ message: 'Suscripción exitosa' });
  });

  unsubscribe = asyncHandler(async (req, res) => {
    const { userId, categoryId } = req.body;
    if (!userId || !categoryId) {
      return res.status(400).json({ error: 'Faltan parámetros (userId, categoryId)' });
    }
    await this.unsubscribeFromCategoryUC.execute(userId, categoryId);
    res.status(200).json({ message: 'Desuscripción exitosa' });
  });

  getSubscribedCategories = asyncHandler(async (req, res) => {
    const { userId } = req.params;
    if (!userId) {
      return res.status(400).json({ error: 'Falta userId' });
    }
    const subscriptions = await this.getSubscribedCategoriesUC.execute(userId);
    res.status(200).json(subscriptions);
  });
}

module.exports = EventController;
