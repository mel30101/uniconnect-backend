const INotificacionStrategy = require('../../domain/strategies/INotificacionStrategy');

class InAppStrategy extends INotificacionStrategy {
  constructor(notificationRepo) {
    super();
    this.notificationRepo = notificationRepo;
    this.canal = 'in_app';
  }

  async enviar(notification) {
    try {
      console.log(`[InAppStrategy] Persisting notification for user ${notification.userId}`);
      
      // La lógica actual ya formatea el DTO antes de guardar
      const result = await this.notificationRepo.save(notification);
      
      return {
        canal: 'in_app',
        enviado: true,
        id: result
      };
    } catch (error) {
      console.error('[InAppStrategy] Error:', error.message);
      return {
        canal: 'in_app',
        enviado: false,
        error: error.message
      };
    }
  }
}

module.exports = InAppStrategy;
