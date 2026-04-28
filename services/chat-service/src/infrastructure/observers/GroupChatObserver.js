const IObserver = require('../../domain/observer/IObserver');
const { ChatEvents } = require('../../domain/observer/ISubject');

/**
 * Observer para el chat grupal utilizando Rooms de Socket.io.
 */
class GroupChatObserver extends IObserver {
  constructor(io) {
    super();
    this.io = io;
  }

  update(event, data) {
    console.log(`[Observer Debug] Evento recibido: ${event}`);
    if (event === ChatEvents.NUEVO_MENSAJE) {
      const { groupId, message } = data;
      
      console.log(`[Observer Debug] Difundiendo mensaje ${message.message_id} en sala ${groupId}`);
      
      // DIFUSIÓN SELECTIVA: Únicamente a los clientes en la sala del grupo
      this.io.to(groupId).emit('new_message', message);
      console.log(`[Observer Debug] Emitido con éxito a la sala ${groupId}`);
    }
  }
}

module.exports = GroupChatObserver;
