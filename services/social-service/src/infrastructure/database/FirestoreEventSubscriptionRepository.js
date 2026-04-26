class FirestoreEventSubscriptionRepository {
  constructor(db) {
    this.db = db;
  }

  async getSubscriptionsByUser(userId) {
    const doc = await this.db.collection('event_subscriptions').doc(userId).get();
    if (!doc.exists) return [];
    return doc.data().categoryIds || [];
  }

  async subscribe(userId, categoryId) {
    const docRef = this.db.collection('event_subscriptions').doc(userId);
    const doc = await docRef.get();
    
    if (!doc.exists) {
      await docRef.set({ categoryIds: [categoryId] });
    } else {
      const categoryIds = doc.data().categoryIds || [];
      if (!categoryIds.includes(categoryId)) {
        categoryIds.push(categoryId);
        await docRef.update({ categoryIds });
      }
    }
  }

  async unsubscribe(userId, categoryId) {
    const docRef = this.db.collection('event_subscriptions').doc(userId);
    const doc = await docRef.get();
    
    if (doc.exists) {
      let categoryIds = doc.data().categoryIds || [];
      categoryIds = categoryIds.filter(id => id !== categoryId);
      await docRef.update({ categoryIds });
    }
  }
}

module.exports = FirestoreEventSubscriptionRepository;
