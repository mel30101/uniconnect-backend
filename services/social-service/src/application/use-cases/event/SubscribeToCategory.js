class SubscribeToCategory {
  constructor(subscriptionRepo) {
    this.subscriptionRepo = subscriptionRepo;
  }

  async execute(userId, categoryId) {
    // Verificar si ya existe la suscripción antes de crear una nueva
    const current = await this.subscriptionRepo.getSubscriptionsByUser(userId);
    if (current.includes(categoryId)) {
      const err = new Error('El estudiante ya está suscrito a esta categoría');
      err.code = 'ALREADY_SUBSCRIBED';
      throw err;
    }
    await this.subscriptionRepo.subscribe(userId, categoryId);
  }
}

module.exports = SubscribeToCategory;
