class SubscribeToCategory {
  constructor(subscriptionRepo) {
    this.subscriptionRepo = subscriptionRepo;
  }

  async execute(userId, categoryId) {
    await this.subscriptionRepo.subscribe(userId, categoryId);
  }
}

module.exports = SubscribeToCategory;
