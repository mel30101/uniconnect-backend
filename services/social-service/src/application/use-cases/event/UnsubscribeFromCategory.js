class UnsubscribeFromCategory {
  constructor(subscriptionRepo) {
    this.subscriptionRepo = subscriptionRepo;
  }

  async execute(userId, categoryId) {
    await this.subscriptionRepo.unsubscribe(userId, categoryId);
  }
}

module.exports = UnsubscribeFromCategory;
