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
        senderId: messageData.senderId,
        createdAt: new Date(),
        type: messageData.type || 'text',
        text: messageData.text || '',
        ...(messageData.fileUrl && { fileUrl: messageData.fileUrl }),
        ...(messageData.fileName && { fileName: messageData.fileName })
      });
  }
}

module.exports = FirestoreMessageRepository;
