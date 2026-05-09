const Notification = require('../../domain/entities/Notification');
const PrioridadDecorator = require('../../domain/decorators/PrioridadDecorator');
const AccionDecorator = require('../../domain/decorators/AccionDecorator');

/**
 * Context class that coordinates multiple notification strategies.
 * Implements Strategy pattern to decouple what is sent from how it is sent.
 */
class SendNotification {
  constructor(strategies, preferenceRepo) {
    this.strategies = strategies; // Array of INotificacionStrategy
    this.preferenceRepo = preferenceRepo;
  }

  async execute(notificationData) {
    console.log(`[Notification] Processing event for user ${notificationData.userId}: ${notificationData.title}`);

    try {
      // 1. Get user preferences (Criterio 4 preparation)
      const preferences = await this.preferenceRepo.getPreferences(notificationData.userId);
      
      // 2. Prepare the processed DTO using current Decorator logic
      let notificacion = new Notification({
        ...notificationData,
        status: 'unread',
        createdAt: new Date()
      });

      if (notificationData.priority) {
        notificacion = new PrioridadDecorator(notificacion, notificationData.priority);
      }

      if (notificationData.action) {
        notificacion = new AccionDecorator(notificacion, notificationData.action);
      }

      const finalDTO = notificacion.getDTO();

      // 3. Execute all injected strategies (Criterio 1, 2 & 3)
      // Note: Filtering logic based on preferences will be polished in Task 2
      const executionResults = [];
      
      for (const strategy of this.strategies) {
        const result = await strategy.enviar(finalDTO);
        executionResults.push(result);
      }

      console.log(`[Notification] All strategies executed for ${notificationData.userId}`);
      
      return { 
        success: true, 
        results: executionResults, 
        notification: finalDTO 
      };

    } catch (error) {
      console.error('[Notification] Error in strategy execution flow:', error.message);
      throw new Error(`Notification sending failed: ${error.message}`);
    }
  }
}

module.exports = SendNotification;
