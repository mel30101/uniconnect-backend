class GetOrCreateChat {
  constructor(chatRepo) {
    this.chatRepo = chatRepo;
  }

  async execute(userA, userB) {
    const chatId = [userA, userB].sort().join('_');
    const existing = await this.chatRepo.findById(chatId);

    if (!existing) {
      await this.chatRepo.create(chatId, {
        participants: [userA, userB],
        lastMessage: '',
      });
    }

    return chatId;
  }
}

module.exports = GetOrCreateChat;
