const IObserver = require('../../domain/observer/IObserver');
const { GroupEvents } = require('../../domain/observer/ISubject');
const axios = require('axios');

class PushNotificationObserver extends IObserver {
  constructor(notificationServiceUrl) {
    super();
    this.notificationServiceUrl = notificationServiceUrl;
  }

  async update(event, data) {
    console.log(`[PushNotificationObserver] Recibido evento ${event}`);

    try {
      // Mapear eventos de Social Service a eventos de Notification Service
      if (event === GroupEvents.SOLICITUD_INGRESO) {
        await this._sendToNotificationService('SOLICITUD_INGRESO', data);
      } else if (event === GroupEvents.MENCION) {
        await this._sendToNotificationService('MENCION', data);
      } else if (event === GroupEvents.TRANSFERENCIA_ADMIN_SOLICITADA) {
        await this._sendToNotificationService('TRANSFER_ADMIN_SOLICITADA', data);
      } else if (event === GroupEvents.TRANSFERENCIA_ADMIN_ACEPTADA) {
        await this._sendToNotificationService('TRANSFER_ADMIN_ACEPTADA', data);
      } else if (event === GroupEvents.TRANSFERENCIA_ADMIN_RECHAZADA) {
        await this._sendToNotificationService('TRANSFER_ADMIN_RECHAZADA', data);
      }
    } catch (error) {
      console.error('[PushNotificationObserver] Error al enviar notificación push:', error.message);
    }
  }

  async _sendToNotificationService(event, payload) {
    const url = `${this.notificationServiceUrl}/notify`;
    await axios.post(url, { event, payload });
    console.log(`[PushNotificationObserver] Notificación enviada exitosamente para evento ${event}`);
  }
}

module.exports = PushNotificationObserver;
