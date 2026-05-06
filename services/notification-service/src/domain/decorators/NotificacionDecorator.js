const INotificacion = require('../entities/INotificacion');

class NotificacionDecorator extends INotificacion {
  constructor(notificacion) {
    super();
    if (!(notificacion instanceof INotificacion)) {
      throw new Error("El objeto debe implementar INotificacion");
    }
    this.notificacion = notificacion;
  }

  getDTO() {
    return this.notificacion.getDTO();
  }
}

module.exports = NotificacionDecorator;
