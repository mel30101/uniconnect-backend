class SendMessage {
  constructor(messageRepo, chatRepo) {
    this.messageRepo = messageRepo;
    this.chatRepo = chatRepo;
  }

  async execute(chatId, senderId, messageData) {
    const isObject = typeof messageData === 'object' && messageData !== null;
    const data = isObject ? messageData : { text: messageData, type: 'text' };

    // Crear el mensaje
    await this.messageRepo.create(chatId, {
      senderId,
      type: data.type || 'text',
      text: data.text || '',
      fileUrl: data.fileUrl,
      fileName: data.fileName
    });

    // Actualizar el último mensaje del chat
    const summaryText = data.type === 'file'
      ? `📎 Archivo: ${data.fileName}`
      : data.text;

    await this.chatRepo.updateLastMessage(chatId, summaryText);
  }
}

module.exports = SendMessage;
