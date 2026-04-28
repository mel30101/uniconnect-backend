const IObserver = require('../../domain/observer/IObserver');

class PersistenciaNotificacionObserver extends IObserver {
  constructor(db) {
    super();
    this.db = db;
  }

  async update(event, data) {
    try {
      console.log(`[Observer Persistencia] Procesando evento: ${event}`);
      
      const notification = {
        type: event,
        targetUserId: data.targetUserId,
        groupId: data.groupId,
        groupName: data.groupName,
        message: this.generateMessage(event, data),
        read: false,
        createdAt: new Date()
      };

      await this.db.collection('notifications').add(notification);
      console.log(`[Observer Persistencia] Notificación guardada en Firestore para el usuario: ${data.targetUserId}`);
    } catch (error) {
      console.error('[Observer Persistencia] Error persistiendo notificación:', error);
    }
  }

  generateMessage(event, data) {
    switch (event) {
      case 'SOLICITUD_INGRESO':
        return `${data.userName} ha solicitado unirse a tu grupo ${data.groupName}.`;
      case 'MIEMBRO_ACEPTADO':
        return `Has sido aceptado en el grupo ${data.groupName}.`;
      case 'MIEMBRO_RECHAZADO':
        return `Tu solicitud para el grupo ${data.groupName} ha sido rechazada.`;
      case 'TRANSFERENCIA_ADMIN':
        return `Ahora eres el administrador del grupo ${data.groupName}.`;
      case 'TRANSFERENCIA_ADMIN_SOLICITADA':
        return `${data.userName} te ha solicitado ser el administrador del grupo ${data.groupName}.`;
      case 'TRANSFERENCIA_ADMIN_ACEPTADA':
        return `${data.userName} ha aceptado ser el administrador del grupo ${data.groupName}.`;
      default:
        return `Nueva notificación en el grupo ${data.groupName}.`;
    }
  }
}

module.exports = PersistenciaNotificacionObserver;
