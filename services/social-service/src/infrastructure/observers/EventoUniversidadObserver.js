const IObserver = require('../../domain/observer/IObserver');

class EventoUniversidadObserver extends IObserver {
  constructor(io, db, subscriptionRepo) {
    super();
    this.io = io;
    this.db = db;
    this.subscriptionRepo = subscriptionRepo;
  }

  async update(event, data) {
    if (event !== 'NUEVO_EVENTO') return;

    try {
      console.log(`[Observer Evento] Procesando evento: ${event} para categoría: ${data.type}`);
      
      // El observer filtra por categoria antes de emitir
      const usersSubscribed = await this.subscriptionRepo.getUsersSubscribedToCategory(data.type);
      
      if (!usersSubscribed || usersSubscribed.length === 0) {
        console.log(`[Observer Evento] No hay usuarios suscritos a la categoría ${data.type}`);
        return;
      }

      for (const userId of usersSubscribed) {
        // 1. Guardar en base de datos (Persistencia)
        const notification = {
          type: event,
          targetUserId: userId,
          eventId: data.id,
          eventName: data.title,
          category: data.type,
          message: `Nuevo evento de la categoría ${data.type}: ${data.title}`,
          read: false,
          createdAt: new Date()
        };

        await this.db.collection('notifications').add(notification);
        
        // 2. Emitir mensaje WebSocket
        if (this.io) {
          this.io.to(userId).emit('notification', {
            type: event,
            eventId: data.id,
            eventName: data.title,
            message: notification.message
          });
        }
      }

      console.log(`[Observer Evento] Notificaciones enviadas a ${usersSubscribed.length} usuarios.`);
      
    } catch (error) {
      console.error('[Observer Evento] Error procesando notificación de evento:', error);
    }
  }
}

module.exports = EventoUniversidadObserver;
