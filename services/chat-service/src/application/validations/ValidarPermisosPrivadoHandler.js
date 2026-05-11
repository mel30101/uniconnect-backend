const BaseHandler = require('./BaseHandler');

/**
 * Valida si el remitente tiene permisos para escribir en el chat privado.
 */
class ValidarPermisosPrivadoHandler extends BaseHandler {
  constructor(chatRepo) {
    super();
    this.chatRepo = chatRepo;
  }

  async manejar(request) {
    const { chatId, senderId } = request;

    if (!chatId || !senderId) {
      return this.retornarError('Faltan identificadores de chat o remitente.', 'MISSING_IDS');
    }

    try {
      const chat = await this.chatRepo.findById(chatId);
      if (!chat) {
        // Permitimos pasar si el chat no existe, ya que getOrCreateChat lo crearía, o fallar?
        // En este caso, si no existe es porque es un mensaje a un chat nuevo. Asumimos que está bien.
        return await super.manejar(request);
      }

      if (chat.participants && !chat.participants.includes(senderId)) {
        return this.retornarError(
          'No tienes permiso para enviar mensajes en este chat privado.',
          'FORBIDDEN_MEMBER'
        );
      }
    } catch (error) {
      console.error('[ValidarPermisosPrivadoHandler] Error verificando membresía:', error);
      return this.retornarError('Error al verificar permisos del usuario.', 'INTERNAL_ERROR');
    }

    return await super.manejar(request);
  }
}

module.exports = ValidarPermisosPrivadoHandler;
