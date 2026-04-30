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