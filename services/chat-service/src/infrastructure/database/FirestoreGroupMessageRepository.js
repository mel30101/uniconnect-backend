const admin = require('firebase-admin');

class FirestoreGroupMessageRepository {
  constructor(db) {
    this.db = db;
  }

  async create(groupId, messageData) {
    console.log(`[DB Debug] Intentando crear mensaje para grupo: ${groupId}`);
    try {
      const docRef = await this.db
        .collection('groups')
        .doc(groupId)
        .collection('messages')
        .add({
          ...messageData,
          createdAt: admin.firestore.FieldValue.serverTimestamp()
        });
      
      console.log(`[DB Debug] Mensaje creado con ID: ${docRef.id}`);
      return docRef.id;
    } catch (error) {
      console.error(`[DB Debug] ERROR al crear mensaje en Firestore:`, error);
      throw error;
    }
  }
}

module.exports = FirestoreGroupMessageRepository;
