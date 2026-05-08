const Notification = require('../../domain/entities/Notification');
const PrioridadDecorator = require('../../domain/decorators/PrioridadDecorator');
const AccionDecorator = require('../../domain/decorators/AccionDecorator');

/**
 * Persists a notification in Firestore for the user's dashboard/history.
 * No push (FCM) logic - only persistence.
 */
class SendNotification {
  constructor(notificationRepo) {
    this.notificationRepo = notificationRepo;
  }

  async execute(notificationData) {
    console.log(`[Notification] Saving for user ${notificationData.userId}: ${notificationData.title}`);

    try {
      // 1. Instanciar la notificación base
      let notificacion = new Notification({
        ...notificationData,
        status: 'unread',
        createdAt: new Date()
      });

      // 2. Envolver con Prioridad si existe
      if (notificationData.priority) {
        notificacion = new PrioridadDecorator(notificacion, notificationData.priority);
      }

      // 3. Envolver con Acción si existe
      if (notificationData.action) {
        notificacion = new AccionDecorator(notificacion, notificationData.action);
      }

      // 4. Obtener el DTO inmutable final procesado
      const finalDTO = notificacion.getDTO();

      // 5. Persistir el DTO directamente y devolverlo
      const notificationId = await this.notificationRepo.save(finalDTO);
      console.log(`[Notification] Saved with id ${notificationId}`);
      
      return { notificationId, notification: finalDTO };
    } catch (error) {
      console.error('[Notification] Error construyendo notificación:', error.message);
      throw new Error(`Error en la creación de notificación: ${error.message}`);
    }
  }
}

module.exports = SendNotification;
