const INotificacionStrategy = require('../../domain/strategies/INotificacionStrategy');

class PushMovilStrategy extends INotificacionStrategy {
  constructor(tokenRepo) {
    super();
    this.tokenRepo = tokenRepo;
  }

  async enviar(notification) {
    try {
      console.log(`[PushMovilStrategy] Fetching tokens for user ${notification.userId}`);
      const tokens = await this.tokenRepo.getTokensByUserId(notification.userId);

      if (tokens.length === 0) {
        console.log(`[PushMovilStrategy] No tokens found for user ${notification.userId}. Skipping.`);
        return { canal: 'push', enviado: false, error: 'No active tokens' };
      }

      console.log(`[PushMovilStrategy] SIMULATING FCM SEND to ${tokens.length} devices...`);
      console.log(`[PushMovilStrategy] Payload: { title: "${notification.title}", body: "${notification.body}", data: ${JSON.stringify(notification.metadata)} }`);

      return {
        canal: 'push',
        enviado: true
      };
    } catch (error) {
      console.error('[PushMovilStrategy] Error:', error.message);
      return {
        canal: 'push',
        enviado: false,
        error: error.message
      };
    }
  }
}

module.exports = PushMovilStrategy;
