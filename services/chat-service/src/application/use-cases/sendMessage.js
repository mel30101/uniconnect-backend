const MensajeBase = require('../../domain/MensajeBase');
const MensajeConArchivo = require('../../domain/decorators/MensajeConArchivo');

class SendMessage {
  constructor(messageRepo, chatRepo) {
    this.messageRepo = messageRepo;
    this.chatRepo = chatRepo;
  }

  async execute(chatId, senderId, messageData) {
    const isObject = typeof messageData === 'object' && messageData !== null;
    const data = isObject ? messageData : { text: messageData, type: 'text' };

    // 1. Crear instancia base
    let message = new MensajeBase(data.text || '', { 
      senderId, 
      type: data.type || 'text' 
    });

    // 2. Decorar si es archivo
    if (data.type === 'file' && data.fileUrl) {
      message = new MensajeConArchivo(message, {
        url: data.fileUrl,
        fileName: data.fileName,
        mimeType: data.mimeType || 'application/octet-stream',
        tamano: data.tamano || 0
      });
    }

    // 3. Guardar en Base de Datos
    const payload = {
      senderId,
      type: data.type || 'text',
      text: message.getContenido(),
      renderedContent: message.render(),
      metadata: message.getMetadata()
    };

    await this.messageRepo.create(chatId, payload);

    // Actualizar el último mensaje del chat
    const summaryText = data.type === 'file'
      ? `📎 Archivo: ${data.fileName}`
      : data.text;

    await this.chatRepo.updateLastMessage(chatId, summaryText);

    return payload;
  }
}

module.exports = SendMessage;
