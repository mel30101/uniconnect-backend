const admin = require('firebase-admin');
const INotificacionStrategy = require('../../domain/strategies/INotificacionStrategy');

/**
 * Concrete strategy for Mobile Push Notifications using Firebase Cloud Messaging (FCM).
 */
class PushMovilStrategy extends INotificacionStrategy {
  constructor(tokenRepo) {
    super();
    this.tokenRepo = tokenRepo;
    this.canal = 'push';
  }

  async enviar(notification) {
    try {
      console.log(`[PushMovilStrategy] Fetching tokens for user ${notification.userId}`);
      const tokens = await this.tokenRepo.getTokensByUserId(notification.userId);

      if (!tokens || tokens.length === 0) {
        console.log(`[PushMovilStrategy] No tokens found for user ${notification.userId}. Skipping.`);
        return { canal: 'push', enviado: false, error: 'NO_TOKENS' };
      }

      // 1. Construct the Multicast Message
      // FCM 'data' fields must be strings
      const stringifiedData = {};
      if (notification.metadata) {
        Object.keys(notification.metadata).forEach(key => {
          stringifiedData[key] = String(notification.metadata[key]);
        });
      }

      // Add default metadata if needed
      stringifiedData.type = String(notification.type || 'general');

      const message = {
        notification: {
          title: notification.title,
          body: notification.body,
        },
        data: stringifiedData,
        tokens: tokens,
      };

      // 2. Real Multicast Send
      console.log(`[PushMovilStrategy] Sending real FCM multicast to ${tokens.length} tokens...`);
      const response = await admin.messaging().sendEachForMulticast(message);
      
      console.log(`[PushMovilStrategy] FCM summary for ${notification.userId}: ${response.successCount} success, ${response.failureCount} failure.`);

      // 3. Detailed error handling and token cleanup reporting
      const invalidTokens = [];
      if (response.failureCount > 0) {
        response.responses.forEach((resp, idx) => {
          if (!resp.success) {
            const error = resp.error;
            const token = tokens[idx];
            
            console.error(`[PushMovilStrategy] Delivery failed for token index ${idx}: ${error.code}`);
            
            // Check for tokens that are no longer valid
            if (error.code === 'messaging/invalid-registration-token' || 
                error.code === 'messaging/registration-token-not-registered') {
              console.warn(`[PushMovilStrategy] Detected stale/invalid token for user ${notification.userId}`);
              invalidTokens.push(token);
              
              // Proactive cleanup (Optional, but recommended for maintenance)
              this.tokenRepo.removeToken(token).catch(err => 
                console.error('[PushMovilStrategy] Cleanup error:', err.message)
              );
            }
          }
        });
      }

      return {
        canal: 'push',
        enviado: response.successCount > 0,
        detalles: {
          totalTokens: tokens.length,
          successCount: response.successCount,
          failureCount: response.failureCount,
          cleanedTokens: invalidTokens.length
        }
      };

    } catch (error) {
      console.error('[PushMovilStrategy] Critical Error in FCM logic:', error.message);
      return {
        canal: 'push',
        enviado: false,
        error: error.message
      };
    }
  }
}

module.exports = PushMovilStrategy;
