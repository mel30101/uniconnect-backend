class FirestorePreferenceRepository {
  constructor(db) {
    this.db = db;
    this.collectionName = 'notification_preferences';
  }

  /**
   * Gets user notification preferences.
   * Returns a default object if no preferences are found.
   */
  async getPreferences(userId) {
    try {
      const doc = await this.db.collection(this.collectionName).doc(userId).get();
      
      if (!doc.exists) {
        return {
          userId,
          enabledChannels: {
            in_app: true,
            email: true,
            push: true
          }
        };
      }

      return doc.data();
    } catch (error) {
      console.error(`Error fetching preferences for user ${userId}:`, error);
      // Fallback to default
      return {
        userId,
        enabledChannels: {
          in_app: true,
          email: true,
          push: true
        }
      };
    }
  }
}

module.exports = FirestorePreferenceRepository;
