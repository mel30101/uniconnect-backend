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

  async findWithPagination(groupId, limitCount = 20, lastMessageId = null) {
    let query = this.db
      .collection('groups')
      .doc(groupId)
      .collection('messages')
      .orderBy('createdAt', 'desc')
      .limit(limitCount);

    if (lastMessageId) {
      const lastMessageDoc = await this.db
        .collection('groups')
        .doc(groupId)
        .collection('messages')
        .doc(lastMessageId)
        .get();

      if (lastMessageDoc.exists) {
        query = query.startAfter(lastMessageDoc);
      }
    }

    const snapshot = await query.get();
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })).reverse();
  }

  async getMessagesSince(groupId, timestamp) {
    const dateObj = new Date(timestamp);
    const snapshot = await this.db
      .collection('groups')
      .doc(groupId)
      .collection('messages')
      .where('createdAt', '>', dateObj)
      .orderBy('createdAt', 'asc')
      .get();

    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
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