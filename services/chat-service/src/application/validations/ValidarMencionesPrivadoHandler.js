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

    const mentionRegex = /@([A-ZÁÉÍÓÚÑa-záéíóúñ]+(?:\s[A-ZÁÉÍÓÚÑa-záéíóúñ]+)*)/g;
    const matches = [...text.matchAll(mentionRegex)];

    if (matches.length === 0) {
      request.mentions = [];
      return await super.manejar(request);
    }

    try {
      const chat = await this.chatRepo.findById(chatId);
      const mentionedUserIds = [];

      // En un chat privado las menciones generalmente aplican al otro participante.
      // Aquí simplificamos, si hay una mención, verificamos a los participantes.
      if (chat && chat.participants) {
        // Asumiendo que participants son los userIds.
        // Como no tenemos el username directamente aquí sin consultar 'users', 
        // simplemente marcamos las menciones para que el frontend las maneje o las ignoramos
        // ya que en chat privado de 2 personas siempre le llega al otro.
        // Pero para cumplir la US-CH01, inyectamos los IDs de los participantes como mencionados.
        
        for (const participantId of chat.participants) {
          if (participantId !== request.senderId) {
             mentionedUserIds.push(participantId);
          }
        }
      }

      request.mentions = mentionedUserIds;

    } catch (error) {
      console.error('[ValidarMencionesPrivadoHandler] Error detectando menciones:', error);
      request.mentions = [];
    }

    return await super.manejar(request);
  }
}

module.exports = ValidarMencionesPrivadoHandler;
