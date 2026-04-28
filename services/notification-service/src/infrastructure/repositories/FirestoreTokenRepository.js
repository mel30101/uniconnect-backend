const ITokenRepository = require('../../domain/repositories/ITokenRepository');

class FirestoreTokenRepository extends ITokenRepository {
  constructor(db) {
    super();
    this.db = db;
  }

  /**
   * Retrieves all registered FCM tokens for a specific user
   */
  async getTokensByUserId(userId) {
    try {
      const snapshot = await this.db.collection('users').doc(userId).collection('fcm_tokens').get();
      if (snapshot.empty) {
        // Fallback: check if the user has a single token in the main document (older implementation)
        const userDoc = await this.db.collection('users').doc(userId).get();
        if (userDoc.exists && userDoc.data().fcm_token) {
          return [userDoc.data().fcm_token];
        }
        return [];
      }
      return snapshot.docs.map(doc => doc.data().token);
    } catch (error) {
      console.error(`Error getting tokens for user ${userId}:`, error);
      return [];
    }
  }

  async saveToken(userId, token) {
    try {
      // Use a subcollection to allow multiple devices per user
      const tokenId = Buffer.from(token).toString('base64').substring(0, 32); // Simple unique ID
      await this.db.collection('users').doc(userId).collection('fcm_tokens').doc(tokenId).set({
        token,
        updatedAt: new Date()
      });
    } catch (error) {
      console.error(`Error saving token for user ${userId}:`, error);
    }
  }

  async removeToken(token) {
    try {
      // This would require a search by field or knowing the userId
      const snapshot = await this.db.collectionGroup('fcm_tokens').where('token', '==', token).get();
      const batch = this.db.batch();
      snapshot.docs.forEach(doc => {
        batch.delete(doc.ref);
      });
      await batch.commit();
    } catch (error) {
      console.error(`Error removing token:`, error);
    }
  }
}

module.exports = FirestoreTokenRepository;
