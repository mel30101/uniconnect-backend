class GetMessages {
  constructor(messageRepo) {
    this.messageRepo = messageRepo;
  }

  async execute(chatId) {
    return await this.messageRepo.findByChatId(chatId);
  }
}

module.exports = GetMessages;
