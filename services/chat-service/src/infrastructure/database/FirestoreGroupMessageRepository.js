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

  async getById(groupId, messageId) {
    const doc = await this.db
      .collection('groups')
      .doc(groupId)
      .collection('messages')
      .doc(messageId)
      .get();

    if (!doc.exists) return null;
    return { id: doc.id, ...doc.data() };
  }

  async update(groupId, messageId, data) {
    await this.db
      .collection('groups')
      .doc(groupId)
      .collection('messages')
      .doc(messageId)
      .update(data);
  }
}

module.exports = FirestoreGroupMessageRepository;