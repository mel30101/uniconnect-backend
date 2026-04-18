class FirestoreChatRepository{
  constructor(db) {
    this.db = db;
  }

  async findById(chatId) {
    const doc = await this.db.collection('chats').doc(chatId).get();
    if (!doc.exists) return null;
    return { id: doc.id, ...doc.data() };
  }

  async create(chatId, chatData) {
    await this.db.collection('chats').doc(chatId).set({
      participants: chatData.participants,
      lastMessage: chatData.lastMessage || '',
      updatedAt: new Date()
    });
  }

  async updateLastMessage(chatId, text) {
    await this.db.collection('chats').doc(chatId).update({
      lastMessage: text,
      updatedAt: new Date()
    });
  }
}

module.exports = FirestoreChatRepository;
