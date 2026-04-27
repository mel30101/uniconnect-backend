class GetSubscribedCategories {
  constructor(subscriptionRepo) {
    this.subscriptionRepo = subscriptionRepo;
  }

  async execute(userId) {
    return await this.subscriptionRepo.getSubscriptionsByUser(userId);
  }
}

module.exports = GetSubscribedCategories;
