const IObserver = require('../../domain/observer/IObserver');

class WebSocketNotificationObserver extends IObserver {
  constructor(io) {
    super();
    this.io = io; // Instancia de Socket.io
  }

  update(event, data) {
    try {
      if (!this.io) {
        console.warn('[Observer WebSocket] Socket server no inicializado.');
        return;
      }

      console.log(`[Observer WebSocket] Emitiendo tiempo real: ${event} para el usuario: ${data.targetUserId}`);
      
      // Emitir al canal específico del usuario (basado en su ID)
      this.io.to(data.targetUserId).emit('notification', {
        type: event,
        groupId: data.groupId,
        groupName: data.groupName,
        message: this.generateMessage(event, data)
      });
      
    } catch (error) {
      console.error('[Observer WebSocket] Error emitiendo notificación socket:', error);
    }
  }

  generateMessage(event, data) {
    switch (event) {
      case 'SOLICITUD_INGRESO':
        return `${data.userName} quiere unirse a tu grupo ${data.groupName}.`;
      case 'MIEMBRO_ACEPTADO':
        return `Bienvenido al grupo ${data.groupName}!`;
      case 'MIEMBRO_RECHAZADO':
        return `Tu solicitud para ${data.groupName} no fue aprobada.`;
      case 'TRANSFERENCIA_ADMIN':
        return `Has sido nombrado administrador de ${data.groupName}.`;
      default:
        return 'Tienes una nueva notificación.';
    }
  }
}

module.exports = WebSocketNotificationObserver;
