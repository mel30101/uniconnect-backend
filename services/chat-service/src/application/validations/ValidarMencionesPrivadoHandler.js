const BaseHandler = require('./BaseHandler');

/**
 * Detecta menciones en el texto para chats privados.
 */
class ValidarMencionesPrivadoHandler extends BaseHandler {
  constructor(chatRepo) {
    super();
    this.chatRepo = chatRepo;
  }

  async manejar(request) {
    const { text, chatId } = request;

    if (!text) {
      request.mentions = [];
      return await super.manejar(request);
    }

    const mentionRegex = /@(\w+)/g;
    const matches = [...text.matchAll(mentionRegex)];

    if (matches.length === 0) {
      request.mentions = [];
      return await super.manejar(request);
    }

    try {
      const chat = await this.chatRepo.findById(chatId);
      const mentionedUserIds = [];
      let renderedText = text;

      // Primero, envolvemos todas las menciones detectadas en el texto para consistencia visual (US-CH01)
      for (const match of matches) {
        renderedText = renderedText.replace(match[0], `<span class="mention">${match[0]}</span>`);
      }

      // Luego, intentamos identificar los IDs de los mencionados si el chat existe
      if (chat && chat.participants) {
        for (const participantId of chat.participants) {
          if (participantId !== request.senderId) {
             // En un chat 1:1, si hay una mención, asumimos que es para el otro.
             if (matches.length > 0) {
               mentionedUserIds.push(participantId);
             }
          }
        }
      }

      request.mentions = mentionedUserIds;
      request.renderedText = renderedText;

    } catch (error) {
      console.error('[ValidarMencionesPrivadoHandler] Error detectando menciones:', error);
      request.mentions = [];
      request.renderedText = text;
    }

    return await super.manejar(request);
  }
}

module.exports = ValidarMencionesPrivadoHandler;
