const NotificacionDecorator = require('./NotificacionDecorator');

class AccionDecorator extends NotificacionDecorator {
  constructor(notificacion, action) {
    super(notificacion);
    if (!action || typeof action.label !== 'string' || typeof action.endpoint !== 'string') {
      throw new Error("El objeto action debe tener la estructura { label: string, endpoint: string }");
    }
    this.action = action;
  }

  getDTO() {
    const dto = super.getDTO();
    return {
      ...dto,
      action: this.action
    };
  }
}

module.exports = AccionDecorator;
