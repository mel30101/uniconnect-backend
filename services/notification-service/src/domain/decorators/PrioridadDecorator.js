const NotificacionDecorator = require('./NotificacionDecorator');

class PrioridadDecorator extends NotificacionDecorator {
  constructor(notificacion, priority) {
    super(notificacion);
    const allowedPriorities = ['normal', 'urgente', 'critica'];
    if (!allowedPriorities.includes(priority)) {
      throw new Error(`Prioridad no válida. Valores permitidos: ${allowedPriorities.join(', ')}`);
    }
    this.priority = priority;
  }

  getDTO() {
    const dto = super.getDTO();
    return {
      ...dto,
      priority: this.priority
    };
  }
}

module.exports = PrioridadDecorator;
