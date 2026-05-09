class FirestoreMessageRepository {
  constructor(db) {
    this.db = db;
  }

  async findByChatId(chatId) {
    const snapshot = await this.db
      .collection('chats')
      .doc(chatId)
      .collection('messages')
      .orderBy('createdAt', 'asc')
      .get();

    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  }

  async findWithPagination(chatId, limitCount = 20, lastMessageId = null) {
    let query = this.db
      .collection('chats')
      .doc(chatId)
      .collection('messages')
      .orderBy('createdAt', 'desc')
      .limit(limitCount);

    if (lastMessageId) {
      const lastMessageDoc = await this.db
        .collection('chats')
        .doc(chatId)
        .collection('messages')
        .doc(lastMessageId)
        .get();

      if (lastMessageDoc.exists) {
        query = query.startAfter(lastMessageDoc);
      }
    }

    const snapshot = await query.get();
    // Volteamos el array porque los obtuvimos en orden descendente (los últimos N), 
    // pero la UI usualmente los renderiza de arriba hacia abajo cronológicamente
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })).reverse();
  }

  async getMessagesSince(chatId, timestamp) {
    const dateObj = new Date(timestamp);
    const snapshot = await this.db
      .collection('chats')
      .doc(chatId)
      .collection('messages')
      .where('createdAt', '>', dateObj)
      .orderBy('createdAt', 'asc')
      .get();

    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  }

  async create(chatId, messageData) {
    await this.db
      .collection('chats')
      .doc(chatId)
      .collection('messages')
      .add({
        ...messageData,
        createdAt: new Date()
      });
  }

  async getById(chatId, messageId) {
    const doc = await this.db
      .collection('chats')
      .doc(chatId)
      .collection('messages')
      .doc(messageId)
      .get();

    if (!doc.exists) return null;
    return { id: doc.id, ...doc.data() };
  }

  async update(chatId, messageId, data) {
    await this.db
      .collection('chats')
      .doc(chatId)
      .collection('messages')
      .doc(messageId)
      .update(data);
  }
}

module.exports = FirestoreMessageRepository;